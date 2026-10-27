# DEPLOYMENT.md

> 线上部署事实来源（runbook）。改动部署相关配置前必须读本文件，并同步 `deploy/nginx/` 下的仓库副本。
> 最后更新：2026-10-27（部署迁至阿里云后的收尾：Vercel 退役，`/admin` 安全头改由 nginx 提供）

---

## 1. 拓扑

```
本地 / Admin 后台
   │  commit / GitHub API
   ▼
Fintinger/hugo-auto-deploy  main
   │  push 触发
   ▼
GitHub Actions（.github/workflows/deploy.yml）
   │  Hugo v0.83.0 extended 构建 → public/
   │  rsync -rlptzv --delete（SSH key）
   ▼
阿里云 ECS（北京，39.96.78.231）
   ├── /var/www/blog/          ← 站点根目录
   └── nginx 1.24（Ubuntu）
        ├── /etc/nginx/sites-available/blog
        └── /etc/nginx/snippets/blog-admin-headers.conf
   │
   ▼
https://blog.archai.space（Let's Encrypt 证书）
```

- 解析：`archai.space` / `www.archai.space` / `blog.archai.space` → A `39.96.78.231`（阿里云 AS37963）。
- 同机还有 `music.archai.space`、guacamole 两个站点，**只改 blog vhost，不要动其它站点**。
- 证书：`/etc/letsencrypt/live/archai.space/`；80 端口的 `/.well-known/acme-challenge/` 必须保留给 certbot 续期。

---

## 2. CI 自动部署

| 项 | 值 |
|---|---|
| 工作流 | `.github/workflows/deploy.yml`（`Deploy to Aliyun`） |
| 触发 | push 到 `main`，或手动 `workflow_dispatch` |
| 并发 | `deploy-aliyun` 组，新推送取消进行中的旧部署 |
| Hugo | **v0.83.0 extended**（与本地 `hugo.exe` 一致，勿升级） |
| 产物检查 | 构建后强制 `test -f public/index.html`，避免空目录被 `rsync --delete` 清空线上 |
| Secrets | `DEPLOY_HOST` / `DEPLOY_USER` / `DEPLOY_SSH_KEY` |

查看结果：GitHub → Actions → `Deploy to Aliyun`。常见失败原因：SSH key 失效、目标目录权限、Hugo 版本偏差。

**手动发布**：Actions 页面 → `Deploy to Aliyun` → Run workflow（不需要本地 scp）。

---

## 3. 服务器侧文件

| 路径 | 说明 | 仓库副本 |
|---|---|---|
| `/etc/nginx/sites-available/blog` | blog 站点 vhost（软链到 `sites-enabled/blog`） | `deploy/nginx/blog.conf` |
| `/etc/nginx/snippets/blog-admin-headers.conf` | `/admin` 的 HTTP 安全头 | `deploy/nginx/blog-admin-headers.conf` |
| `/var/www/blog/` | 静态站点根目录（由 Actions rsync 写入） | —（构建产物，gitignored） |
| `/root/nginx-backups/` | vhost 改动前的备份 | — |

---

## 4. `/admin` 安全头（nginx）

`vercel.json` 已退役（2026-10-27）。`/admin` 的 HTTP 级安全头现在由 nginx 提供：

- `Content-Security-Policy`（含 `frame-ancestors 'none'`）
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy`（禁用 camera/microphone/geolocation 等）
- `X-Robots-Tag: noindex, nofollow`
- `Strict-Transport-Security`

实现方式：vhost 中的 `location ^~ /admin/` 通过 `include` 引入 snippet。**关键点**：nginx 的 `add_header` 一旦出现在 location 内，就会覆盖从 server 继承的全部 `add_header`，所以 snippet 里必须完整重声明 HSTS / nosniff / Referrer-Policy，不能只写 /admin 专属的那几个。

`static/admin/index.html` 中的 `<meta http-equiv="Content-Security-Policy">` 只是兜底，两处需保持一致；`node tools/admin-static-check.js` 会检查：

- snippet 是否存在、7 个头是否齐全；
- header CSP 与 meta CSP 是否漂移（忽略 `frame-ancestors`，meta 无法表达）。

副作用：`^~` 前缀优先于静态文件正则，`/admin/*.css|js` 不再命中 `expires 30d` 缓存规则 —— 这是有意为之，后台改动能立即生效。

### 改动的正确姿势

```bash
# 1. 本地改仓库 deploy/nginx/blog-admin-headers.conf，并跑静态检查
node tools/admin-static-check.js

# 2. 上传 + 备份
scp deploy/nginx/blog-admin-headers.conf root@39.96.78.231:/tmp/
ssh root@39.96.78.231 'cp /etc/nginx/sites-available/blog /root/nginx-backups/blog.$(date +%F-%H%M%S).conf'

# 3. 安装 + 校验 + 重载（校验不过就别 reload）
ssh root@39.96.78.231 'install -m 644 /tmp/blog-admin-headers.conf /etc/nginx/snippets/ && nginx -t && systemctl reload nginx'

# 4. 线上核对
curl -sI https://blog.archai.space/admin/ | grep -Ei 'content-security|x-frame|x-robots|permissions-policy|referrer-policy|strict-transport'
```

vhost 本身（`blog.conf`）改动：替换文件后同样先 `nginx -t`，再 `systemctl reload nginx`；失败就用 `/root/nginx-backups/` 的备份回滚。
修改后记得把服务器上的实际配置复制回仓库 `deploy/nginx/`，保持两边一致。

---

## 5. 回滚

1. **内容/代码回滚**：`git revert` 或重置到上一个 commit 后 push `main`，Actions 会重新发布。
2. **服务器配置回滚**：从 `/root/nginx-backups/blog.<时间戳>.conf` 恢复 vhost → `nginx -t` → `systemctl reload nginx`。
3. **部署中断**：`concurrency` 会取消旧任务，重新 push 或手动 Run workflow 即可。

---

## 6. 排障

| 现象 | 排查顺序 |
|---|---|
| Actions 失败 | 看日志：SSH key / `DEPLOY_HOST` / rsync 权限 / Hugo 构建；产物检查失败说明构建没产出 `public/index.html` |
| 站点 404/旧内容 | `curl -I` 看 `Last-Modified`；比对服务器 `/var/www/blog/` 时间戳；确认 Actions 最后一次成功时间 |
| 500/502 | `tail -f /var/log/nginx/blog.error.log`，`systemctl status nginx` |
| HTTPS 证书到期 | `certbot renew --dry-run`；检查 80 端口 ACME 路径是否被其他规则抢占 |
| `/admin` 打不开或脚本被拦截 | 浏览器 Console 看 CSP 报错；核对 snippet 与页面 meta CSP 是否一致；`X-Robots-Tag`/`X-Frame-Options` 不应影响本站访问 |
| 国内访问仍慢/不通 | 检查 DNS 是否解析到 39.96.78.231、备案状态、安全组 80/443 放行 |

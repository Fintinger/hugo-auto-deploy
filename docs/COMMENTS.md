# 评论区部署与迁移

## 现状

- 前端：Waline 客户端，自托管在 `static/libs/waline/`（`waline.js` / `waline.css`）。
- 后端：`https://waline-comments-liart.vercel.app/`。
- 问题：`*.vercel.app` 在国内经常无法直连，评论区因此空白/加载失败；前端本身没问题。

## 结论

不需要换评论系统，先换后端。前端已经是自托管的，只有 API 请求打到 Vercel 才会被墙。

## 方案一：Waline 后端搬到国内 VPS（推荐，改动最小）

现有 VPS 上跑一个 Waline Docker 容器，前端只改 `serverURL`。

```bash
docker run -d \
  --name waline \
  --restart unless-stopped \
  -p 127.0.0.1:8360:8360 \
  -v /srv/waline:/app/data \
  -e SQLITE_PATH=/app/data/waline.sqlite \
  -e SITE_NAME=Archai \
  -e SITE_URL=https://archai.space \
  lizheming/waline:latest
```

nginx（`waline.archai.space`）：

```nginx
server {
    listen 443 ssl http2;
    server_name waline.archai.space;

    ssl_certificate     /etc/letsencrypt/live/waline.archai.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/waline.archai.space/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8360;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

然后：

1. DNS 把 `waline.archai.space` 指到 VPS。
2. 在 `layouts/partials/comments.html` 把 `serverURL` 改成 `https://waline.archai.space/`。
3. 访问 `https://waline.archai.space/ui` 注册管理员。
4. 旧评论数据从 Vercel 后端的数据库导出，再导入 SQLite（Waline 管理后台有导入/导出；Vercel 模板通常用 Vercel Postgres/Neon）。

## 方案二：Twikoo + 腾讯云开发 CloudBase（不想维护服务器）

- 在腾讯云开发 CloudBase 创建环境，部署 Twikoo 云函数。
- 前端换 `twikoo` 客户端（自托管或从 npm 取固定版本），配置 `envId`。
- 优点：国内直连、免服务器；缺点：要换前端、旧 Waline 数据需要迁移。

## 方案三：Artalk（Go + SQLite，轻量自托管）

- 国内 VPS 上跑 Artalk Docker，SQLite 存储；前端换 `artalk` 客户端。
- 优点：单二进制、资源占用低、自托管彻底；缺点：要换前端和迁移数据。

## 不推荐

- Giscus / Utterances / Disqus：依赖 GitHub 或国外服务，国内不挂代理基本不可用。
- Valine：LeanCloud 国内可用，但项目较老，反垃圾和可维护性弱于 Waline/Twikoo/Artalk。
- 国内第三方畅言/来必力：广告、数据不在自己手里，长期风险高。

## 当前前端

- `layouts/partials/comments.html` 已加 8 秒超时兜底；加载失败会显示提示，而不是一直空白。
- 样式已按暗色玻璃 + 紫色强调覆盖 `#waline` 变量。
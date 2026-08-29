---
title: 使用 FRP + Guacamole 搭建个人远程桌面访问方案全过程记录
date: 2026-08-26
categories:
- 远程控制
- 网络配置
tags:
- FRP
- Guacamole
- 内网穿透
- 远程桌面
- Windows
- Docker
---

# 使用 FRP + Guacamole 搭建个人远程桌面访问方案全过程记录

## 项目背景

由于家庭网络通常没有固定公网 IP，且部分办公环境无法安装传统远程控制软件，需要搭建一套：

> 不依赖家庭公网 IP、不需要路由器端口转发、支持纯浏览器访问、可远程控制 Windows 桌面的方案。

最终方案：用 FRP 打通「公网 VPS → 家庭 Windows」的隧道，再用部署在 VPS 上的 Apache Guacamole 提供浏览器端远程桌面（RDP）访问。

## 整体架构

```
外部客户端（任意浏览器）
    ↓
公网
    ↓
阿里云 VPS
    ├── frps（FRP 服务端，Docker）
    └── Guacamole + guacd + postgres（Docker）
            ↓ FRP 隧道
家庭 Windows 主机
    └── frpc（FRP 客户端，开机自启）
            ↓
       目标服务 RDP（127.0.0.1:3389）
```

数据流：`浏览器 → Guacamole(8080) → guacd → VPS:13389 → frps → frpc → 127.0.0.1:3389`

## 环境信息

| 项目 | 说明 |
|------|------|
| VPS | 阿里云，Ubuntu 24.04，有公网 IPv4 |
| FRP 版本 | VPS 端 frps 用 Docker 镜像 `snowdreamtech/frps:0.70.1-debian`；家庭端 frpc 用 `frp_0.71.0` |
| Guacamole | `guacamole/guacamole:latest`（8080）+ `guacamole/guacd:latest`（4822）+ `postgres:16` |
| 家庭 Windows | Windows 11 企业版 LTSC 24H2，显卡 NVIDIA RTX 4060 Ti |
| 端口规划 | frps 控制端口 7000；RDP 映射端口 13389；Guacamole 8080 |

---

## 一、VPS 端部署 frps

### 1.1 确认 frps 以 Docker 方式运行

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"
```

应看到 `frps` 容器，端口映射包含 `7000->7000` 和 `13389->13389`。

### 1.2 frps 配置

frps 跑在 Docker 里，宿主机配置文件一般在 `/opt/frp/frps.toml`（挂载进容器 `/etc/frp/frps.toml`）：

```toml
bindPort = 7000

auth.method = "token"
auth.token = "你的token"

# 允许 frpc 注册的远程端口范围（RDP 映射到 13389）
allowPorts = [
  { start = 13389, end = 13389 }
]
```

> 注意点：`auth.token` 必须与 frpc 端**完全一致**，否则 frpc 登录会报 `token in login doesn't match`。

### 1.3 查看运行中的真实配置

若不确定 frps 配置文件在哪，用：

```bash
ps aux | grep frp | grep -v grep          # 找进程和配置路径
find / -name "frps.toml" 2>/dev/null      # 找配置文件
ss -tunlp | grep -E "7000|13389"          # 看监听端口
```

### 1.4 阿里云安全组

需要在阿里云控制台安全组放行：**7000**（frpc 连接用）、**8080**（Guacamole 网页用）。

> 注意点：**13389 不需要在安全组放行**。Guacamole 在 VPS 内部通过 `172.18.0.1:13389` 访问 frps，全程不经过公网，所以外部访问 13389 不通是正常现象，不影响使用。

---

## 二、Windows 端部署 frpc

### 2.1 准备文件

目录 `D:\frp`，放 `frpc.exe` 和 `frpc.toml`。

### 2.2 frpc 配置（`D:\frp\frpc.toml`）

```toml
serverAddr = "VPS公网IP"
serverPort = 7000

auth.method = "token"
auth.token = "你的token"        # 与 frps 一致

# 关键：连不上时不要直接退出，而是持续重试
loginFailExit = false

log.to = "D:/frp/frpc.log"
log.level = "info"

[[proxies]]
name = "home-rdp"
type = "tcp"

localIP = "127.0.0.1"
localPort = 3389

remotePort = 13389
```

> 注意点：
> - `loginFailExit = false` 非常重要。frp 0.71 默认 `loginFailExit = true`，一旦网络短暂不可达（如开机时网卡还没就绪），frpc 会**直接退出且不重试**，导致隧道永久断开。设为 `false` 后会自动重连。
> - 日志用 `log.to = "D:/frp/frpc.log"`（把路径直接写进 `log.to`）。**不要**写 `log.path`，frp 没有这个字段，会报 `unknown field "path"`。

### 2.3 验证 frpc 连接

```powershell
Get-Content D:\frp\frpc.log -Tail 20
```

看到以下日志即成功：

```
login to server success
proxy added: [home-rdp]
start proxy success
```

---

## 三、frpc 开机自启（Windows 计划任务）

frpc 需要在系统启动时（无需用户登录）自动运行，用计划任务以 SYSTEM 身份运行。

> 注意点：创建「系统启动时」+「SYSTEM 身份」的计划任务**需要管理员权限**。在非管理员 PowerShell 里直接 `schtasks /create` 会报「拒绝访问」。

### 3.1 用提权方式创建计划任务

```powershell
schtasks /create /tn "frpc-autostart" /tr "D:\frp\frpc.exe -c D:\frp\frpc.toml" /sc onstart /ru SYSTEM /f
```

若当前 shell 非管理员，用以下方式提权（会弹 UAC，点「是」）：

```powershell
Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-Command','schtasks /create /tn "frpc-autostart" /tr "D:\frp\frpc.exe -c D:\frp\frpc.toml" /sc onstart /ru SYSTEM /f'
```

### 3.2 验证计划任务

```powershell
schtasks /query /tn "frpc-autostart" /fo list /v
```

确认：任务要运行 `D:\frp\frpc.exe -c D:\frp\frpc.toml`、触发器为「系统启动时」、运行身份为 SYSTEM。

> 注意点：非管理员查询 SYSTEM 任务时 `schtasks /query` 可能报「拒绝访问」，需用提权方式查看。

---

## 四、Guacamole 部署（VPS，Docker）

### 4.1 容器组成

| 容器 | 镜像 | 端口 |
|------|------|------|
| guacamole | guacamole/guacamole:latest | 8080 |
| guacd | guacamole/guacd:latest | 4822（内部）|
| guacamole-postgres | postgres:16 | 5432（内部）|

### 4.2 网络结构（关键）

需要搞清楚各容器所在的 Docker 网络，因为 Guacamole 连接里要填的目标地址由它决定：

```bash
docker inspect guacd -f '{{range $k,$v := .NetworkSettings.Networks}}net={{$k}} ip={{$v.IPAddress}} gw={{$v.Gateway}}{{"\n"}}{{end}}'
docker inspect frps  -f '{{range $k,$v := .NetworkSettings.Networks}}net={{$k}} ip={{$v.IPAddress}} gw={{$v.Gateway}}{{"\n"}}{{end}}'
```

本案例结果：
- `guacd`：网络 `guacamole_guacnet`，网关 `172.18.0.1`
- `frps`：网络 `bridge`，IP `172.17.0.2`

> 注意点：guacd 和 frps **不在同一个 Docker 网络**。guacd 无法用 `frps` 容器名或 `172.17.0.2` 直连 frps。正确做法是让 guacd 访问**宿主机网关 `172.18.0.1`**（frps 的 13389 已通过 docker-proxy 发布到宿主机 `0.0.0.0:13389`）。

### 4.3 Guacamole 管理员登录

后台地址：`http://VPS公网IP:8080/guacamole/#/`

---

## 五、Guacamole 连接配置（核心）

在「连接 → HOME-PC」里，最终可用参数如下：

| 字段 | 值 |
|------|-----|
| 协议 | RDP |
| 主机名 (hostname) | `172.18.0.1` |
| 端口 (port) | `13389` |
| 用户名 (username) | `DESKTOP-T8BSD18\archai`（或 `archai` + 域 `DESKTOP-T8BSD18`）|
| 密码 (password) | 你的 Windows 登录密码 |
| 安全模式 (security) | `rdp` |
| 忽略服务器证书 (ignore-cert) | 勾选（true）|
| 色彩深度 (color-depth) | `32` |
| 分辨率调整 (resize-method) | `reconnect` |
| DPI | `96` |
| 启用字体平滑 (enable-font-smoothing) | 勾选（true）|

> 注意点：
> - **「主机名」不要填 `guacd`**。`guacd` 是 guacd 服务的容器名（它在 guacamole 容器环境变量 `GUACD_HOSTNAME` 里配置，与连接目标无关）。连接里的主机名必须填 RDP 目标地址 `172.18.0.1`。
> - **剪贴板**默认就是双向开启的，无需额外参数（`disable-copy` / `disable-paste` 不填即为开启）。
> - 若填 `security = nla`，需把用户名/域分开填（`username = archai` + `domain = DESKTOP-T8BSD18`），`DESKTOP-T8BSD18\archai` 这种合并格式在 NLA 下可能认证失败。

---

## 六、排障全过程记录（重要）

按实际遇到问题的顺序整理。

### 6.1 frpc 登录失败：token 不匹配

- 现象：frpc 日志 `login to the server failed: token in login doesn't match`。
- 原因：frpc 与 frps 的 `auth.token` 不一致。
- 处理：在 VPS 上 `cat /opt/frp/frps.toml` 找到真实 token，把 frpc.toml 改成一致。

### 6.2 frpc 突然退出不再重连

- 现象：frpc 日志出现 `connect to server error: ... unreachable network` 后直接 `stopped`。
- 原因：frp 0.71 默认 `loginFailExit = true`，网络抖动即退出不重试。
- 处理：frpc.toml 加 `loginFailExit = false`。

### 6.3 frpc 日志字段报错 `unknown field "path"`

- 原因：frp 的日志字段是 `log.to`，没有 `log.path`。
- 处理：写 `log.to = "D:/frp/frpc.log"`。

### 6.4 Guacamole 连不上：主机名填错

- 现象：连接目标填成 `guacd`。
- 原因：把 guacd 服务名当成了 RDP 目标。
- 处理：改成 `172.18.0.1`（guacd 所在网络的宿主机网关）。

### 6.5 网页手动保存连接导致参数丢失

- 现象：手动在网页勾选「Trust host certificate on first use」（cert-tofu），并取消了「忽略服务器证书」，导致连接反复断开。
- 原因：网页保存会**重写整套参数**，关键项（ignore-cert 等）容易弄丢或改错。
- 处理：
  - 用「忽略服务器证书」（`ignore-cert = true`），不要用 cert-tofu。
  - **建议以后通过 REST API 改连接参数，别在网页里手动保存**（见 7.1）。

### 6.6 图形崩溃：`远程桌面服务器因为发生错误而关闭了本连接`

- 现象：连接建立后黑屏，随即断开；Windows 事件日志会话断开原因码 `2147500036`（0x800703E4，图形 I/O 中断）。
- 原因：**NVIDIA RTX 4060 Ti 驱动 + Windows 11 24H2 的 RDP 兼容性 bug**，显卡驱动处理 RDP 图形 I/O 时崩溃。此问题会**反复发作**，重启只能临时缓解。
- 尝试过但未根治的办法：`disable-gfx`（禁用 RDP 图形管线）、`bEnumerateHWBeforeSW=0`（强制软件渲染）。
- **根治办法：更新 NVIDIA 驱动**。本案例从 `591.86`（32.0.15.9186）升级到 `610.88` 后解决。
  - 更新路径：NVIDIA App / 官网下载，安装时选「自定义 → 执行清洁安装」。
  - 设备管理器「更新驱动 → 自动搜索」往往提示已是最新（Windows Update 驱动库滞后），需去 NVIDIA 官网下。

### 6.7 安全模式不匹配：`Server refused connection (wrong security type?)`

- 现象：guacd 日志报 `wrong security type`。
- 原因：Windows 端 `UserAuthentication = 1`（强制 NLA），而 Guacamole 用了 `security = rdp`（不走 NLA）。
- 处理（二选一）：
  - 方案 A：Guacamole 改 `security = nla`，并把用户名/域拆开填（`archai` + `DESKTOP-T8BSD18`）。
  - 方案 B（本案例最终采用）：把 Windows 端 NLA 关掉，Guacamole 用 `security = rdp`。
    ```powershell
    # 需管理员权限，改完重启 TermService
    Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" -Name "UserAuthentication" -Value 0
    Restart-Service TermService -Force
    ```

### 6.8 前端崩溃：`RawAudioRecorder ... reading 'bind'`

- 现象：控制台报 `TypeError: Cannot read properties of undefined (reading 'bind') at new Guacamole.RawAudioRecorder`，连接被拖垮。
- 原因：Guacamole 走 `http://`（明文，非安全上下文），浏览器禁用了 `getUserMedia`（麦克风 API）。Guacamole 前端在连接建立后会**无条件初始化音频录制器**，在受限环境崩溃。
- 处理（临时）：Chrome 开启 flag `chrome://flags/#unsafely-treat-insecure-origin-as-secure`，把 `http://VPS:8080` 加入安全来源，重启浏览器。
- 彻底方案：给 Guacamole 加 HTTPS（自签名证书 + nginx 反向代理）。

### 6.9 剪贴板失效

- 现象：双向复制粘贴不可用。
- 原因：同样因为 `http://` 非安全上下文，浏览器禁用了 `navigator.clipboard`（剪贴板 API）。
- 处理：与 6.8 相同，开启 Chrome flag，或改用 HTTPS。临时替代：连接后按 `Ctrl+Alt+Shift` 呼出菜单，在「剪贴板」栏手动粘贴/复制。

### 6.10 NLA 认证失败：`Authentication failure (invalid credentials?)`

- 现象：改成 `security = nla` 后，guacd 报认证失败。
- 原因：用户名用 `DESKTOP-T8BSD18\archai` 合并格式，NLA(CredSSP) 没正确拆分。
- 处理：拆开填 `username = archai` + `domain = DESKTOP-T8BSD18`；或改回 `security = rdp`（本案例最终方案）。

---

## 七、最终可用配置与维护

### 7.1 用 REST API 修改连接参数（推荐，避免网页保存重写参数）

```powershell
$base = "http://VPS公网IP:8080/guacamole/api"
$tok = (Invoke-RestMethod -Uri "$base/tokens" -Method Post -Body @{username="guacadmin";password="管理员密码"} -ContentType "application/x-www-form-urlencoded").authToken
$h = @{ "Guacamole-Token" = $tok }

# 更新连接参数（PUT 会整体替换参数集合）
$conn = @{
  name = "HOME-PC"; identifier = "1"; parentIdentifier = "ROOT"; protocol = "rdp"
  attributes = @{ "guacd-hostname" = "guacd"; "guacd-port" = "4822" }
  parameters = @{
    hostname = "172.18.0.1"; port = "13389"
    username = "DESKTOP-T8BSD18\archai"; password = "你的Windows密码"
    security = "rdp"; "ignore-cert" = "true"
    "color-depth" = "32"; "resize-method" = "reconnect"; dpi = "96"
    "enable-font-smoothing" = "true"
  }
}
Invoke-RestMethod -Uri "$base/session/data/postgresql/connections/1" -Method Put -Headers $h -Body ($conn | ConvertTo-Json -Depth 6) -ContentType "application/json"
```

> 注意点：Guacamole 的 `/connections/{id}/parameters` 子资源**只支持 GET**（`Allow: GET,OPTIONS`），改参数要用 `PUT /connections/{id}`，把 `parameters` 放进连接对象一起提交。

### 7.2 常用排查命令

**家庭 Windows 端：**
```powershell
Get-Process frpc                       # frpc 是否运行
Get-Content D:\frp\frpc.log -Tail 20   # frpc 日志
Get-Service TermService                # RDP 服务状态
netstat -ano | findstr 3389            # 3389 监听
Test-NetConnection localhost -Port 3389  # 本机 RDP 连通性
qwinsta                                # 会话状态
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-TerminalServices-LocalSessionManager/Operational'; Id=40; StartTime=(Get-Date).AddMinutes(-30)}  # 会话断开原因
```

**VPS 端：**
```bash
docker logs guacd --tail 50            # guacd 日志（看 RDP 断开原因）
docker logs guacamole --tail 100       # guacamole 日志
nc -vz 127.0.0.1 13389                 # 测隧道是否通（VPS 本机）
```

---

## 八、踩坑总结（速查）

1. **frpc 必加 `loginFailExit = false`**，否则网络抖动即永久断开。
2. **frpc/frps token 必须一致**。
3. **frp 日志字段是 `log.to`，没有 `log.path`**。
4. **Guacamole 连接的主机名填 `172.18.0.1`，不是 `guacd`**。
5. **不要用网页手动保存连接**，会重写整套参数；用 REST API 或至少核对清楚每个勾选项。
6. **证书用 `ignore-cert`，别用 cert-tofu（trust on first use）**。
7. **NVIDIA + Win11 24H2 的 RDP 崩溃，靠更新显卡驱动根治，重启只是临时**。
8. **`security=rdp` 要求 Windows 关闭 NLA；`security=nla` 要求用户名/域分开填**。
9. **Guacamole 用 HTTP 访问会导致音频崩溃、剪贴板失效**（安全上下文限制），临时用 Chrome flag 解决，彻底用 HTTPS。
10. **外部访问 13389 不通是正常的**，Guacamole 在 VPS 内部走 `172.18.0.1`，安全组只需放行 7000 和 8080。

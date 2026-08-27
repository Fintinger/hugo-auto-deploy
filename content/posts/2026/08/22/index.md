---
title: 使用 Cloudflare Tunnel + MeshCentral 搭建个人远程控制环境全过程记录
date: 2026-08-22
categories:
- 远程控制
- 网络配置
tags:
- Cloudflare Tunnel
- MeshCentral
- Windows
- 内网穿透
- 远程桌面
---

# 使用 Cloudflare Tunnel + MeshCentral 搭建个人远程控制环境全过程记录

## 项目背景

由于部分办公环境存在限制，例如：

- 公司电脑无法获取管理员权限；
- 无法安装传统远程控制软件；
- 无法直接通过公网访问家里的电脑；
- 家庭网络通常没有固定公网 IP；

因此需要搭建一套：

> 不依赖公网 IP、不需要路由器端口转发、支持浏览器访问、支持远程桌面控制的个人远程访问方案。

最终方案：

```
公司电脑
    ↓
浏览器访问
    ↓
Cloudflare Tunnel
    ↓
家庭电脑
    ↓
MeshCentral
    ↓
控制家庭设备
```

整体采用：

- Cloudflare Tunnel：负责安全内网穿透；
- MeshCentral：负责远程设备管理和桌面控制；
- 自定义域名：提供稳定访问入口。

最终访问地址：

```
https://remote.******.com
```

---

# 一、三台电脑工作模式说明

整个系统涉及三台设备：

## 1. 家庭主机（服务器端）

作用：

> 作为远程控制目标，同时运行 MeshCentral 和 Cloudflare Tunnel。

运行环境：

```
Windows 系统
```

主要功能：

| 软件          | 功能             |
| ----------- | -------------- |
| MeshCentral | 提供远程控制服务       |
| cloudflared | 将本地服务安全暴露到公网   |
| Node.js     | 运行 MeshCentral |

工作流程：

```
家庭电脑
    |
    | localhost
    |
MeshCentral
    |
    | HTTPS
    |
cloudflared tunnel
    |
    |
Cloudflare 网络
```

家庭电脑不需要：

- 公网 IP；
- 路由器端口映射；
- 开放 80/443 端口。

---

## 2. 公司电脑（访问端）

作用：

> 作为控制端，通过浏览器访问家庭电脑。

要求：

- Windows 系统即可；
- 不需要安装软件；
- 不需要管理员权限。

使用方式：

打开：

```
https://remote.******.space
```

登录 MeshCentral 后：

```
选择设备
    ↓
点击桌面控制
    ↓
远程操作家庭电脑
```

---

## 3. 手机（移动访问端）

作用：

> 用于验证公网访问和备用远程入口。

测试方式：

关闭 WiFi：

```
使用移动数据网络
```

访问：

```
https://remote.******.space
```

验证：

- 是否能打开登录页面；
- 是否能正常登录；
- 是否能显示设备；
- 是否能进入远程桌面。

---

# 二、整体架构图

```
                 Internet

                    |
                    |

          Cloudflare 网络

                    |
                    |
          remote.******.space

                    |
                    |
          Cloudflare Tunnel

                    |
                    |

          家庭电脑 Windows

          ┌────────────────┐
          │ cloudflared    │
          │                │
          │ MeshCentral    │
          └────────────────┘

                    |
                    |

              本地设备


访问端：

公司电脑 / 手机

        ↓

浏览器访问域名

        ↓

Cloudflare

        ↓

家庭电脑
```

---

# 三、配置过程记录

# 1. Cloudflare DNS 配置

## 添加域名

将域名接入 Cloudflare。

修改 DNS Nameserver：

原：

```
radian.dnspod.net
steak.dnspod.net
```

修改为：

```
amy.ns.cloudflare.com

jaxson.ns.cloudflare.com
```

检查：

```bash
nslookup -type=ns ******.space
```

结果：

```
nameserver = jaxson.ns.cloudflare.com
nameserver = amy.ns.cloudflare.com
```

说明：

DNS 已切换到 Cloudflare。

---

# 2. 配置 Cloudflare DNS 记录

添加：

```
blog.******.space
```

CNAME：

```
cname.vercel-dns.com
```

用于：

- 网站访问；
- 后续远程服务域名管理。

---

# 3. 创建 Cloudflare Tunnel

登录：

```bash
cloudflared tunnel login
```

授权成功：

```
INF Login successful
```

创建 Tunnel：

```bash
cloudflared tunnel create meshcentral
```

生成：

```
Tunnel ID:

***********************
```

同时生成：

```
credentials json
```

位置：

```
C:\Users\******\.cloudflared\
```

---

# 4. 配置 Tunnel

创建：

```
config.yml
```

内容：

```yaml
tunnel: ***********************

credentials-file: C:\Users\******\.cloudflared\***********************.json

ingress:
  - hostname: remote.******.space
    service: https://localhost:443
    originRequest:
      noTLSVerify: true

  - service: http_status:404
```

说明：

访问：

```
remote.******.space
```

会转发到：

```
本机 https://localhost:443
```

---

# 5. 添加 Tunnel DNS 路由

执行：

```bash
cloudflared tunnel route dns meshcentral remote.******.space
```

结果：

```
Added CNAME remote.******.space
```

说明：

Cloudflare 已建立：

```
域名
 ↓
Tunnel
```

---

# 6. 测试手动启动 Tunnel

执行：

```bash
cloudflared.exe tunnel run meshcentral
```

正常日志：

```
Registered tunnel connection
protocol=quic
```

查看状态：

```bash
cloudflared.exe tunnel info meshcentral
```

成功：

```
CONNECTOR ID
CREATED
ARCHITECTURE
EDGE
```

---

# 7. 安装 MeshCentral

进入目录：

```bash
D:\MeshCentral
```

安装 Windows 服务：

```bash
node node_modules\meshcentral --install
```

结果：

```
Installing MeshCentral as Windows Service...

MeshCentral service already installed.
```

检查：

```bash
sc query type= service | findstr /i mesh
```

结果：

```
SERVICE_NAME: meshcentral.exe
DISPLAY_NAME: MeshCentral
```

说明：

MeshCentral 已作为 Windows 服务运行。

---

# 8. 解决 cloudflared Windows 服务问题

最初：

直接：

```bash
cloudflared service install
```

安装后：

```
服务运行
```

但是重启后：

```
WIN32_EXIT_CODE 1067
```

原因：

Windows 服务默认运行账户：

```
LocalSystem
```

无法读取：

```
C:\Users\******\.cloudflared\
```

解决：

复制配置文件到：

```
C:\Windows\System32\config\systemprofile\.cloudflared
```

复制：

```
config.yml

credentials.json
```

---

# 9. 创建稳定 Windows 服务

删除旧服务：

```bash
cloudflared.exe service uninstall
```

重新创建：

```bash
sc create Cloudflared binPath= "D:\cloudflared\cloudflared.exe --config C:\Windows\System32\config\systemprofile\.cloudflared\config.yml tunnel run meshcentral" start= auto
```

启动：

```bash
sc start Cloudflared
```

检查：

```bash
sc query Cloudflared
```

成功：

```
STATE : 4 RUNNING
```

---

# 四、最终验证结果

## 1. Tunnel 状态

执行：

```bash
cloudflared.exe tunnel info meshcentral
```

结果：

```
CONNECTOR ID

windows_amd64

EDGE:
2xlax01
1xlax05
1xlax07
```

说明：

Tunnel 已连接 Cloudflare。

---

## 2. 外网访问测试

使用手机移动数据：

访问：

```
https://remote.******.space
```

结果：

```
正常打开 MeshCentral 登录页面
```

---

## 3. 登录测试

输入账号密码：

结果：

```
登录成功
```

设备列表：

```
正常显示
```

---

## 4. 远程桌面测试

点击设备：

```
Desktop
```

结果：

```
正常显示远程桌面
```

---

# 五、最终运行状态

当前架构：

```
Windows家庭电脑

 ├── MeshCentral Service
 |
 └── Cloudflared Service


Cloudflare Tunnel

        |

remote.******.space


访问端：

 ├── 公司电脑浏览器
 |
 └── 手机浏览器
```

状态：

| 项目             | 状态   |
| -------------- | ---- |
| Cloudflare DNS | ✅ 正常 |
| Tunnel 创建      | ✅ 完成 |
| Tunnel 自动启动    | ✅ 完成 |
| MeshCentral 服务 | ✅ 完成 |
| HTTPS访问        | ✅ 正常 |
| 手机外网访问         | ✅ 正常 |
| 远程桌面控制         | ✅ 正常 |
| 重启自动恢复         | ✅ 正常 |

---

# 六、经验总结

## 1. Cloudflare Tunnel 比传统端口映射更适合家庭远程访问

优点：

- 不需要公网 IP；
- 不需要开放端口；
- 自动 HTTPS；
- 安全性更高。

---

## 2. Windows 服务运行时需要注意权限

手动运行：

```
当前用户
```

可以读取：

```
C:\Users\用户\.cloudflared
```

Windows 服务：

```
LocalSystem
```

读取：

```
C:\Windows\System32\config\systemprofile
```

因此配置文件必须放到系统账户目录。

---

## 3. 排查顺序

遇到：

```
Cloudflare Error 1033
```

优先检查：

1. Tunnel 是否运行：

```bash
cloudflared tunnel info meshcentral
```

2. 服务状态：

```bash
sc query Cloudflared
```

3. 配置文件路径：

```bash
type config.yml
```

4. MeshCentral 是否运行。

---

# 七、最终效果

实现：

> 在没有公网 IP、无法进行端口转发的家庭网络环境下，通过 Cloudflare Tunnel + MeshCentral 搭建了一套安全、稳定、支持浏览器访问的个人远程控制系统。

可用于：

- 远程访问家庭电脑；
- 文件管理；
- 软件维护；
- 设备管理；
- 出门临时控制家中设备。
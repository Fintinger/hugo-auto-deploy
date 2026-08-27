# PROJECT_CONTEXT.md

> 本项目长期知识库。任何 AI 模型首次接手本仓库时，请先完整阅读本文件。
> 最后更新：2026-08-27（首次接管时建立）

---

## 项目概述

**Archai 的个人技术博客**（`archai.space`），基于 **Hugo 静态站点生成器** 构建，主题为 **PaperMod**（已 vendored 并大量二次开发）。

- 站点地址：`https://blog.archai.space`
- 源码仓库：`git@github.com:Fintinger/hugo-auto-deploy.git`
- 内容语言：中文（`zh-cn`，`DefaultContentLanguage: zh-cn`）
- 作者：Archai（GitHub 账号 `Fintinger`）

**重要**：本项目是「静态博客」，**不是** Vue/React SPA。没有 `package.json`、`src/`、`components/`、`router/`、`store/`、`api/`、后端服务或数据库。前端交互全部通过 Hugo 模板 + 原生 JS + 少量 CDN 引入的第三方库实现。

---

## 项目目标用户

1. 博客作者本人（Archai）——记录技术笔记（前端、算法数据结构、网络/远程控制等）。
2. 技术读者——通过搜索、归档、分类浏览技术文章。
3. 博客访客——查看作者的 side project 展示页（Extra 页）。

---

## 当前实现的功能

- **博客文章**：Markdown 写作，front matter 支持 `title/date/categories/tags`。
- **profileMode 首页**：头像 + 社交图标 + 按钮，配 Blob 加密加载的背景视频。
- **深色模式**：`localStorage` 持久化（`pref-theme`），`header.html` 初始判断 + `footer.html` 切换。
- **全文搜索**：客户端 Fuse.js，搜索索引由 Hugo 输出 `index.json`。
- **归档（Timeline）页**：按年份/月份分组。
- **分类/标签页**：PaperMod 自带 terms 页面。
- **评论系统**：Valine（LeanCloud），密钥硬编码在 `comments.html`。
- **数学公式**：KaTeX（CDN，`baseof.html` 中引入）。
- **自定义 shortcode**：`bilibili`、`tencent`、`video`（视频平台解析/自定义视频）。
- **Extra 独立页**：Vue2 + Tailwind CDN 实现的开源项目展示画廊（脱离主题模板体系）。
- **移动端适配**：自定义抽屉式导航（`mobile.js` + `mobile.scss`）。

---

## 技术栈

### 核心

| 项 | 说明 |
|---|---|
| 静态生成器 | Hugo **v0.83.0**（extended，Windows，`hugo.exe` 提交在仓库根目录） |
| 主题 | PaperMod（vendored 在 `themes/PaperMod/`，深度定制） |
| 内容 | Markdown + YAML front matter |
| 配置 | `config.yml`（单文件，非目录） |

### 前端（模板层 + 原生 JS）

| 项 | 说明 |
|---|---|
| 模板语言 | Go template（Hugo 布局） |
| 样式预处理 | SCSS（`assets/scss/`，经 `resources.ToCSS` 编译） |
| JS | 原生 ES5/ES6，`assets/js/extended/*.js` 拼接 + minify |
| 第三方库（CDN） | KaTeX（数学）、Vue2 + VueResource + Tailwind（仅 Extra 页）、Valine（评论）、animate.min.css、font-awesome.min.css |
| 构建/打包 | 无 Node 工具链，全部由 Hugo `resources` pipeline 完成 |
| 搜索 | Fuse.js（本地 `fuse.basic.min.js`）+ `fastsearch.js` |

### 部署

- **GitHub → Vercel 自动部署**，无手动部署脚本。
- `public/` 被 `.gitignore`，构建产物不进入源码仓库。
- 无 Docker / 无 CI 配置文件（Vercel 侧配置，不在仓库内）。

---

## 项目目录结构

```
hugo-auto-deploy/
├── AGENTS.md                 # 已有：给 AI 的简要操作说明（本项目维护者手写）
├── config.yml                # Hugo 单文件配置（站点、参数、菜单、markup、fuseOpts）
├── README.md                 # 项目介绍 + Timeline（历史改动日志）
├── hugo.exe                  # Hugo v0.83.0 二进制（Windows，约 47MB，已提交）
├── .gitignore                # 忽略 public/ resources/ .idea/ push.sh deploy.sh server.bat 等
├── push.sh                   # 本地推送脚本（gitignored，不追踪）
├── server.bat                # 本地开发脚本 hugo server -D（gitignored，不追踪）
│
├── docs/                     # AI 协作文档（本文件所在目录）
│   ├── PROJECT_CONTEXT.md    # 长期知识库
│   ├── AI_RULES.md           # AI 修改代码的约束规范
│   ├── ARCHITECTURE_DECISIONS.md  # 架构决策记录
│   └── CHANGELOG_AI.md       # AI 参与开发的改动日志
│
├── content/                  # 全部 Markdown 内容
│   ├── posts/                # 博客文章，按 年/月/日 目录组织
│   │   ├── 2019/ 2020/ 2021/ 2022/ 2026/
│   │   └── ...每个文章目录含 index.md 或 具名.md + 可选 index.assets/ 图片
│   ├── page/                 # 静态页（如 about.md）
│   ├── extra/                # 特殊独立 HTML 页（index.html，脱离主题）
│   ├── archives.md           # 归档页（layout: archives）
│   └── search.md             # 搜索页（layout: search）
│
├── static/                   # 站点根目录静态资源（served from /）
│   ├── images/               # favicon、头像、head.gif、poster1.png、extra/ 缩略图
│   ├── videos/bg.mp4         # 首页背景视频
│   ├── fonts/                # FontAwesome 字体文件
│   └── data/lists.json       # Extra 页数据源（项目展示列表）
│
├── resources/                # Hugo 缓存（gitignored）
└── themes/PaperMod/          # vendored 主题（深度定制）
    ├── assets/
    │   ├── css/              # 主题默认 CSS（core/common/hljs/external）
    │   ├── js/               # fastsearch.js、fuse.basic.min.js、highlight.min.js + extended/
    │   └── scss/             # ★ 自定义样式（style.scss 汇总 + common/mobile/dark）
    ├── layouts/              # 模板（大量定制）
    │   ├── _default/         # baseof/single/list/search/archives/terms/index.json/rss
    │   ├── partials/         # head/header/footer/toc/comments 等
    │   ├── shortcodes/       # bilibili/tencent/video + 主题默认
    │   └── _default/_markup/ # render-image.html（图片下方 alt 注释）
    ├── i18n/                 # 多语言（zh.yaml 使用中）
    └── go.mod                # 仅声明 module，勿运行 hugo mod
```

---

## 核心模块

### 1. 布局层（`themes/PaperMod/layouts/`）

| 文件 | 职责 |
|---|---|
| `_default/baseof.html` | 全局骨架。额外引入 KaTeX CDN 与 `renderMathInElement`；末尾挂 `<video id="liveBgBox">` 供背景视频 |
| `_default/single.html` | 文章详情页模板 |
| `_default/list.html` | 列表页（含首页）。`profileMode` 时渲染 `index_profile.html` |
| `_default/search.html` / `archives.html` | 搜索页 / 归档页 |
| `_default/index.json` | 生成搜索索引（title/content/permalink/summary） |
| `partials/head.html` | `<head>` 组装 + CSS pipeline（core.css）+ 搜索资源 + 调用 `extend_head.html` |
| `partials/header.html` | 导航 + 主题切换初始判断 + 语言切换 |
| `partials/footer.html` | 页脚 + 回到顶部 + 主题切换 + 代码复制按钮 + 调用 `extend_footer.html` + `window.onerror` 吞错 |
| `partials/toc.html` | 目录（含 `pinToc` 固定按钮） |
| `partials/comments.html` | Valine 评论（密钥硬编码） |
| `partials/extend_head.html` | 编译 SCSS + 合并 external CSS |
| `partials/extend_footer.html` | 合并 `js/extended/*.js` + 最后执行 `finally.js` |

### 2. 样式层（`assets/scss/`）

- `style.scss`：入口，`@import` common 下 5 个 + mobile + dark。
- `common/homepage.scss`：首页动效（背景视频、profile 透明 hover、菜单动效）。
- `common/article.scss`：文章内链接样式。
- `common/articleList.scss`：列表卡片 `pinned`/`newest` 角标样式。
- `common/comment.scss`：Valine 评论区深度定制。
- `common/custom.scss`：菜单/按钮/卡片 hover 微调。
- `mobile.scss`：移动端抽屉导航。
- `dark.scss`：深色模式覆盖 + hljs 配色。

### 3. 脚本层（`assets/js/extended/`）

> 这些文件被 `extend_footer.html` 用 `resources.Match("js/extended/*.js")` 按文件名排序拼接成**一个** minify 后的文件，共享同一脚本作用域。

| 文件 | 职责 |
|---|---|
| `getSetResource.js` | 定义 `blobAjax`/`getSetAllResource`/`setBgvidCallBack`（背景视频 Blob 加载，防嗅探） |
| `mobile.js` | 定义 `isMobile`/`hideEl`/`showEl` + 移动端导航控制 + **声明全局 `main`/`body` 等变量** |
| `randomLine.js` | 已整体注释掉（随机线条功能废弃） |
| `style.js` | 首页控制、文章列表 `newest/pinned` 标记、TOC 固定、标签染色。**依赖 mobile.js 声明的全局变量** |
| `finally.js` | 最后单独执行，去除 header 链接内联样式（覆盖主题默认） |

### 4. Shortcode（`layouts/shortcodes/`）

- `bilibili.html`：`{{< bilibili AV或BV号 [分P号] >}}` → B站播放器 iframe。
- `tencent.html`：`{{< tencent vid >}}` → 腾讯视频 iframe。
- `video.html`：`{{< video src=... poster=... autoplay=... >}}` → 原生 `<video>`。
- 主题自带：`figure`、`collapse`、`blockquote`、`ltr`、`rtl`、`rawhtml`。

---

## 数据流

```
content/*.md (front matter + Markdown)
        │  Hugo 构建 (hugo / hugo server -D)
        ▼
layouts/* (Go template 渲染)
        │  依赖
        ├── assets/scss/* → 编译 CSS
        ├── assets/js/extended/* → 拼接 JS
        └── static/* → 原样拷贝
        ▼
public/ (静态站点，gitignored)
        │  push 到 GitHub
        ▼
Vercel 自动部署 → https://blog.archai.space
```

**运行时数据流（浏览器端）**：
- 搜索：`search.html` 预加载 `../index.json` → `fastsearch.js` 构建 Fuse 索引 → 实时过滤。
- 评论：页面加载 `Valine.min.js` → 初始化（依赖硬编码 appId/appKey）。
- 背景视频：`mobile.js` 检测非移动端 → `getSetResource.js` 用 XHR blob 加载 `/videos/bg.mp4` → 赋给 `#liveBgBox`。
- Extra 页：`extra/index.html` 用 VueResource 请求 `/data/lists.json` → 渲染项目卡片。

---

## 组件关系

- `baseof.html` 是所有页面的唯一入口，`<body class>` 根据 `.Kind`/`.Layout`/默认主题决定 `list`/`dark` class。
- 首页（`.IsHome` 且 `profileMode.enabled`）走 `list.html → index_profile.html`，否则渲染文章列表。
- 所有自定义样式统一由 `extend_head.html` 注入（SCSS + external CSS）。
- 所有自定义 JS 统一由 `extend_footer.html` 注入（拼接 + finally.js 兜底）。
- `theme-vars.css` 定义 CSS 变量（明/暗两套），`dark.scss` 与 `custom.scss` 在此基础上覆盖。

---

## API 结构

无自有后端 API。仅有的外部接口为第三方：
- **Valine**（LeanCloud 评论）：`comments.html` 中的 `appId/appKey/master`。
- **CDN**：jsdelivr（KaTeX、Vue、Valine、Tailwind）、bootcdn（Tailwind）。
- **视频播放器 iframe**：`player.bilibili.com`、`v.qq.com`。

---

## 数据库结构

无。评论数据存储在第三方 LeanCloud（Valine 后端），不属于本仓库。

---

## 当前架构

单仓库、纯静态、无构建脚本（除 Hugo 本身）、无 Node/npm、无 CI 文件。核心复杂度集中在 `themes/PaperMod/` 的定制模板与自定义 SCSS/JS。

架构分层：
1. **内容层**：`content/`（作者只改这里即可发文章）。
2. **主题层**：`themes/PaperMod/`（布局、样式、脚本）。
3. **静态资源层**：`static/`。
4. **配置层**：`config.yml`。

---

## 已知问题

1. **Valine 密钥硬编码**：`appId/appKey/master` 明文写在公开仓库 `comments.html`，存在安全隐患。
2. **`window.onerror` 吞错**：`footer.html` 末尾 `window.onerror=function(){return true;}` 会屏蔽所有 JS 报错，调试极难。
3. **JS 隐式跨文件依赖**：`style.js` 依赖 `mobile.js` 声明的全局变量（`main`/`body`/`isMobile` 等）。拼接顺序由文件名排序决定（`getSetResource` < `mobile` < `randomLine` < `style`），一旦改名或重排即破坏功能。
4. **首页隐藏滚动条**：`style.js` 在 profileMode 下设置 `documentElement.style.overflowY='hidden'`，内容超出时用户可能无法滚动。
5. **文件名含中文**：`content/posts/2026/08/26/FRP+Guacamole远程桌面访问方案记录.md`（及部分 `.assets` 中文图片名），在非 UTF-8 环境或某些 CI 上可能出问题（本机 `hugo` 构建通过）。
6. **`extra/index.html` 脱离主题**：独立 HTML + CDN 引入 Vue2/Tailwind，不受 Hugo 模板管理，维护成本高，且依赖外部 CDN 可用性。
7. **`randomLine.js` 整段注释**：死代码残留。
8. **图片体积大**：`poster1.png`（约 3.8MB）、`head.gif`（486KB）、`bg.mp4`（2.6MB）直接放静态目录，影响首屏。

---

## 开发注意事项

1. **不要换 Hugo 版本**：v0.83.0 被 pin 住，新版有已知 bug。二进制用仓库根目录 `./hugo.exe`。
2. **不要运行 `hugo mod`**：主题是 vendored 的，`go.mod` 仅作声明。
3. **配置是单文件 `config.yml`**，不是目录。
4. **`push.sh`/`server.bat` 是 gitignored 的**，只在本地存在，不要尝试按追踪文件读取/编辑。
5. **`resources/`、`public/` 是 gitignored**，是构建缓存/产物。
6. 静态资源放 `static/`，served from 根路径 `/`。
7. 发布文章只改 `content/`，文章 permalink 为 `/p/:slug/`。
8. 提交信息 emoji 约定：📑 新文章、✨ 样式、🛠️ bugfix。
9. 自定义 JS 统一放 `assets/js/extended/`，自定义 SCSS 统一放 `assets/scss/`，通过既有 pipeline 自动打包，勿直接在模板里写大段样式/脚本。

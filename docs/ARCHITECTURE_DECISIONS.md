# ARCHITECTURE_DECISIONS.md

> 记录本项目的重要架构决策。新增决策按下方模板追加。

---

# 架构决策记录

## 决策模板

```
## <决策名称>

日期：
背景：
问题：
选择方案：
最终方案：
原因：
影响范围：
未来注意事项：
```

---

## 1. 采用 Hugo 而非 Vue/React SPA

- **日期**：项目早期（约 2022-04）
- **背景**：作者需要个人技术博客。
- **问题**：选择博客技术方案。
- **选择方案**：Hugo、Hexo、VuePress、手写 SPA。
- **最终方案**：Hugo 静态站点。
- **原因**：构建速度快、纯静态、易部署、写作即 Markdown。README 引用官网口号 "The world's fastest framework for building websites"。
- **影响范围**：全站。没有 `package.json`/`src`/后端，一切以 Hugo 模板 + 静态资源实现。
- **未来注意事项**：不要试图"前端框架化"重构；本项目价值在于内容与已定制的主题。

---

## 2. Vendored 主题而非 git submodule / hugo module

- **日期**：项目早期
- **背景**：需要深度定制 PaperMod。
- **问题**：如何引入并管理主题。
- **最终方案**：把 PaperMod 完整 vendor 进 `themes/PaperMod/`，直接修改主题源码；`go.mod` 仅作声明。
- **原因**：定制点过多（模板、SCSS、JS、shortcode），submodule/module 方式维护成本高且易被上游更新覆盖。
- **影响范围**：所有主题定制都直接在 `themes/PaperMod/` 内。
- **未来注意事项**：**禁止运行 `hugo mod`**；升级主题需手动 diff，风险高，通常不做。

---

## 3. Hugo 版本锁死 v0.83.0，二进制提交进仓库

- **日期**：项目早期
- **背景**：Hugo 版本更新引入兼容性问题。
- **问题**：主题定制依赖特定版本行为。
- **最终方案**：固定 Hugo v0.83.0（extended，Windows），`hugo.exe` 直接提交在仓库根目录。
- **原因**：新版 Hugo 与本项目 setup 存在已知 bug（见 `AGENTS.md`）；提交二进制保证环境一致、免安装。
- **影响范围**：构建工具链。Windows 专属二进制（约 47MB）。
- **未来注意事项**：**不要升级 Hugo 版本**；本地开发一律用 `./hugo.exe`。

---

## 4. 部署走 GitHub → Vercel 自动部署

- **日期**：2022-04-28（README Timeline）
- **背景**：需要免运维的公网访问。
- **最终方案**：push 到 GitHub，Vercel 自动构建部署，提供 `blog.archai.space` 域名。
- **原因**：无需自建服务器、免费、自动 HTTPS、CI 内置。
- **影响范围**：`public/` 构建产物 gitignored，仓库只存源码；无仓库内 CI 配置文件。
- **未来注意事项**：构建参数在 Vercel 面板配置，不在仓库；改 `config.yml` 的 `baseURL` 等会影响线上。

---

## 5. 自定义样式/脚本走 Hugo resources pipeline（而非裸文件）

- **日期**：2022-04-04 左右（README：代码结构优化）
- **背景**：需要引入自定义 SCSS 与多段 JS。
- **最终方案**：
  - SCSS：`assets/scss/` 由 `style.scss` `@import` 汇总，`extend_head.html` 用 `resources.Get("scss/style.scss") | ToCSS | minify | fingerprint` 编译注入。
  - JS：`assets/js/extended/*.js` 由 `extend_footer.html` 用 `resources.Match(...) | Concat | minify | fingerprint` 拼成一个文件；`finally.js` 单独最后执行。
  - external CSS（animate/font-awesome）：`resources.Match("css/external/*.min.css") | Concat`。
- **原因**：借助 Hugo 内建资源管道做打包/压缩/指纹，无需 Node 工具链。
- **影响范围**：所有自定义前端代码的存放与加载方式。
- **未来注意事项**：
  - JS 拼接**按文件名字典序**，`style.js` 依赖 `mobile.js` 声明的全局变量，**勿改文件名/排序**。
  - 新样式/脚本必须进入对应 `assets/` 目录，不要内联。

---

## 6. 首页 profileMode + Blob 背景视频

- **日期**：2022-03 至 04（README Timeline）
- **背景**：首页想要动态背景。
- **问题**：视频易被嗅探下载。
- **最终方案**：profileMode 首页；`getSetResource.js` 用 XHR 以 blob 方式加载 `/videos/bg.mp4`，赋给 `baseof.html` 里预置的 `<video id="liveBgBox">`；仅非移动端加载。
- **原因**：Blob 方式避免直接暴露视频直链；移动端不加载以省流量。
- **影响范围**：`baseof.html`、`mobile.js`、`getSetResource.js`、`homepage.scss`。
- **未来注意事项**：`#liveBgBox` 与 `.profile` 的显隐逻辑强耦合，改动时需同时核对 JS 与 SCSS。

---

## 7. 评论选 Valine 且密钥硬编码

- **日期**：项目早期
- **背景**：需要轻量评论系统。
- **最终方案**：Valine（LeanCloud），`appId/appKey/master` 明文写在 `layouts/partials/comments.html`。
- **原因**：Valine 免自建后端、免费；作者当时接受简单方案。
- **影响范围**：`comments.html` + `comment.scss` 深度样式定制。
- **未来注意事项**：密钥已暴露在公开仓库，属安全隐患；如需更换评论系统（如 Waline）需改动 `comments.html` 与 `config.yml`（已有被注释的 waline 配置片段）。

---

## 8. 全文搜索用 Fuse.js（客户端）

- **日期**：项目早期
- **背景**：静态站需要站内搜索。
- **最终方案**：Hugo 输出 `index.json`（`layouts/_default/index.json`），`fastsearch.js` + 本地 `fuse.basic.min.js` 在浏览器端构建索引搜索。
- **原因**：纯静态、无需后端；`config.yml` 的 `fuseOpts` 控制匹配参数。
- **影响范围**：`search.md`、`search.html`、`fastsearch.js`、`index.json` 模板、`head.html` 搜索资源加载。
- **未来注意事项**：搜索依赖 `/index.json` 与 `fuse.basic.min.js` 本地文件，改动索引字段需同步 `index.json` 模板与 `fastsearch.js` 的 `keys`。

---

## 9. 数学公式用 KaTeX（CDN）

- **日期**：约 2022（文章多为算法/数学）
- **背景**：文章需要渲染公式。
- **最终方案**：在 `baseof.html` 直接 CDN 引入 KaTeX 与 auto-render，`DOMContentLoaded` 时 `renderMathInElement` 全局渲染（`$`/`$$`/`\(\)`/`\[\]` 分隔符）。
- **原因**：实现简单，全局可用。
- **影响范围**：`baseof.html`（全站每个页面都加载 KaTeX CDN）。
- **未来注意事项**：全站引入有性能开销；`$` 分隔符可能误伤正文中的美元符号，需注意 `strict: "ignore"` 已设置。

---

## 10. Extra 页脱离主题（独立 HTML + Vue2/Tailwind CDN）

- **日期**：约 2022-03
- **背景**：想展示开源 side project，用卡片画廊。
- **最终方案**：`content/extra/index.html` 为完整独立 HTML（非 Markdown/主题模板），CDN 引入 Vue2 + VueResource + Tailwind，数据从 `static/data/lists.json` 拉取。
- **原因**：复用已有的 Vue 项目经验，快速实现卡片展示。
- **影响范围**：`content/extra/index.html`、`static/data/lists.json`、`static/images/extra/*`。
- **未来注意事项**：该页完全脱离 Hugo 主题体系，样式/依赖/数据都要单独维护；依赖外部 CDN 可用性；新增项目改 `lists.json` 即可。

---

## 11. 文章按 年/月/日 目录组织

- **日期**：建站起
- **背景**：内容随时间增长需要组织结构。
- **最终方案**：`content/posts/年/月/日/index.md`（老文章）或 `年/月/日/具名.md`（新文章），图片放同级 `index.assets/`。
- **原因**：按日期归档，便于作者管理历史内容；与归档页 `GroupByPublishDate` 呼应。
- **影响范围**：内容目录结构、`archives.html` 分组逻辑。
- **未来注意事项**：新文章建议沿用该结构；含中文/特殊字符的文件名存在编码风险（见 PROJECT_CONTEXT 已知问题 5）。

# AI Change Log

> 记录 AI 参与本项目开发/维护的每次改动。每次修改代码后按模板追加一条。

## 模板

```
## YYYY-MM-DD

### 修改内容

（做了什么）

### 修改文件

（改动的文件路径列表）

### 修改原因

（为什么改）

### 测试结果

（hugo 构建结果、关键交互是否正常等）

### 注意事项

（遗留问题、对后续 AI 的提醒）
```

---

## 2026-08-27

### 修改内容

首次接管项目，建立 AI 协作认知体系。未改动任何业务代码，仅新增 4 个协作文档：
`PROJECT_CONTEXT.md`、`AI_RULES.md`、`ARCHITECTURE_DECISIONS.md`、`CHANGELOG_AI.md`。

### 修改文件

- `PROJECT_CONTEXT.md`（新增）
- `AI_RULES.md`（新增）
- `ARCHITECTURE_DECISIONS.md`（新增）
- `CHANGELOG_AI.md`（新增）

### 修改原因

作为长期维护者首次接手，需要沉淀一套可复用的项目知识库，供后续 AI 会话快速理解项目、约束修改行为。

### 测试结果

- `.\hugo.exe version`：`hugo v0.83.0-4C65CECC+extended windows/amd64`
- `.\hugo.exe`（生产构建）：BUILD_OK

### 注意事项

- 本项目为 Hugo 静态博客（非 SPA），无 `package.json`/后端/数据库。
- 已知问题见 `PROJECT_CONTEXT.md`「已知问题」小节（Valine 密钥硬编码、`window.onerror` 吞错、JS 拼接顺序依赖等），后续维护需留意。
- 现有 git 工作区有未提交改动（`config.yml`、`.gitignore`、`static/images/head1.gif` 删除、`content/posts/2026/` 新增），与本次文档工作无关，未做处理。

---

## 2026-08-27

### 修改内容

升级 AI 协作文档体系，建立完整 AI 辅助开发工作流：

1. 新增 `docs/DEVELOPMENT_WORKFLOW.md`：AI 协作流程、Git 提交规范（`feat`/`fix`/`refactor`/`docs`/`post`/`chore`）、Commit 边界规则、提交前检查、AI 提交建议流程、测试要求、发布流程。
2. `docs/AI_RULES.md`：新增「Git 提交规范」与「AI 任务完成标准」章节；更新文档头阅读清单；将修改流程扩至 8 步（末尾输出 Git 提交建议）；提交规范改为引用新工作流。
3. `docs/PROJECT_CONTEXT.md`：新增「开发流程」章节（说明 AI 辅助长期维护模式 + docs/ 各文件用途）；目录结构补充 `DEVELOPMENT_WORKFLOW.md`；开发注意事项第 8 条改为引用新提交规范。
4. `docs/ARCHITECTURE_DECISIONS.md`：新增决策 #12（小粒度 + Conventional Commit + AI 协作）。
5. 根目录 `AGENTS.md` 未改动（本次仅改 docs/）。

### 修改文件

- `docs/DEVELOPMENT_WORKFLOW.md`（新增）
- `docs/AI_RULES.md`（修改）
- `docs/PROJECT_CONTEXT.md`（修改）
- `docs/ARCHITECTURE_DECISIONS.md`（修改）
- `docs/CHANGELOG_AI.md`（修改，本条目）

### 修改原因

为长期 AI 辅助维护建立统一、可审查的开发与 Git 提交工作流，避免未来 AI 修改代码、提交 Git 时出现混合 commit / 无边界大 commit 等混乱。

### 测试结果

- 纯文档改动，未涉及业务代码；未运行 Hugo 构建（无需验证渲染）。
- 已完成一致性检查：docs/ 五个文档间引用关系一致；无重复规则冲突；`AI_RULES.md` 与 `DEVELOPMENT_WORKFLOW.md` 的提交类型定义一致。

### 注意事项

- 提交类型定义以 `docs/DEVELOPMENT_WORKFLOW.md` §2 为唯一权威来源，`AI_RULES.md` 仅摘要引用，后续修改只需改工作流文件。
- 历史 emoji 约定（📑✨🛠️）已兼容进新规范，不冲突。
- 下次提交建议：`docs: upgrade AI collaboration workflow`（单独提交，仅含 docs/ 下文件）。

---

## 2026-08-27

### 修改内容

优化文章详情页 markdown 文档渲染样式（方案A第一阶段）：

1. **新增 `article-detail.scss`**：集中管理文章详情页样式优化
   - 标题层级字号/间距优化（h2-h6）
   - 段落行高调整（line-height: 1.8）
   - 引用块美化（左边框 + 背景色）
   - 表格响应式处理
   - 图片圆角 + 阴影 + hover 效果
   - 代码块、列表、脚注等样式优化
   - 移动端适配

2. **修复 `dark.scss` hljs 冲突**：
   - 移除底部大段自定义 hljs 配色（与 qtcreator-dark 主题冲突）
   - 改用 head.html 引入的 qtcreator-dark.min.css 主题

3. **清理 `custom.scss` 重复样式**：
   - 移除 `.post-content` 的 padding/border 定义（已迁移至 article-detail.scss）
   - 保留 `.post-tags>li>a,.toc,.paginav` 背景色

4. **更新 `style.scss`**：新增 `@import "common/article-detail"`

### 修改文件

- `themes/PaperMod/assets/scss/common/article-detail.scss`（新增）
- `themes/PaperMod/assets/scss/style.scss`（修改）
- `themes/PaperMod/assets/scss/dark.scss`（修改）
- `themes/PaperMod/assets/scss/common/custom.scss`（修改）

### 修改原因

文章详情页 markdown 渲染样式存在以下问题需要优化：
1. 排版细节缺失：段落行高、标题间距、引用块样式不够美观
2. 样式冲突：dark.scss 中的自定义 hljs 配色与 qtcreator-dark 主题冲突
3. 样式重复：custom.scss 和 article-detail.scss 都定义了 .post-content 样式

### 测试结果

- `.\hugo.exe`（生产构建）：BUILD_OK
- 257 pages，无错误输出

### 注意事项

- 本次仅优化样式，未涉及模板/配置变更
- hljs 样式改为使用 head.html 引入的 qtcreator-dark.min.css 主题，不再自定义配色
- 后续可考虑方案B（Chroma CSS类模式）和方案C（图片灯箱、Callout提示框）

---

## 2026-08-27

### 修改内容

文章详情页 markdown 渲染样式第二期（方案A补全 + 方案B Chroma CSS 类模式）：

1. **表格响应式接线（A1）**：Hugo v0.83 不支持 `render-table.html` render hook，改为在 `finally.js` 中用 JS 将 `.post-content` 下的普通表格包裹进 `.article-table-wrapper`（排除 `.highlight` 内代码行号表），使移动端表格可横向滚动。
2. **图片 alt 说明修复（A2）**：`render-image.html` 原先生成空 `.imgAlt` div，改为有 alt 文本时才输出且填入文本；`.imgAlt` 内联样式迁移到 `article-detail.scss`。
3. **Chroma CSS 类模式（B1）**：
   - `config.yml`：`markup.highlight` 改为 `noClasses: false`（移除 `style: monokai`），并设置 `assets.disableHLJS: true`，停止加载从未初始化的 hljs 主题（qtcreator-dark.min.css），消除死资源与内联 monokai 深色配色不协调问题。
   - 新增 `common/chroma.scss`：浅色模式基于 github、深色模式基于 monokai，两套 `.chroma` 配色随 `body.dark` 切换；同时覆盖 `post-single.css` 中 `pre`/`pre code` 的硬编码深色背景与浅灰文字，保证深浅两态可读。
4. 更新 `style.scss` 引入 `common/chroma`；同步修正 `dark.scss` 中过时注释。

### 修改文件

- `config.yml`（修改）
- `themes/PaperMod/assets/scss/common/chroma.scss`（新增）
- `themes/PaperMod/assets/scss/common/article-detail.scss`（修改，新增 `.imgAlt` 样式）
- `themes/PaperMod/assets/scss/style.scss`（修改）
- `themes/PaperMod/assets/scss/dark.scss`（修改，更新注释）
- `themes/PaperMod/layouts/_default/_markup/render-image.html`（修改）
- `themes/PaperMod/assets/js/extended/finally.js`（修改）
- `docs/CHANGELOG_AI.md`（修改，本条目）

### 修改原因

- 表格响应式 `.article-table-wrapper` 此前只写了 CSS 没有接线，移动端宽表格仍会溢出。
- `.imgAlt` 空 div 占位且 alt 文本丢失，违反"不内联样式"规范。
- 代码高亮名不副实：Chroma 内联 monokai（深色）在浅色主题下不协调，且加载了未被初始化的 hljs 主题 CSS。切换到 Chroma CSS 类模式后配色可控、深浅统一。

### 测试结果

- `.\hugo.exe`（生产构建）：BUILD_OK，257 pages，无错误输出
- 渲染产物验证：代码块输出 `<pre class="chroma"><span class="nx">`（无内联 style）；最新 `scss/style.min.8431d3a2...css` 含 `.chroma` 深浅两套、`.imgAlt`、`.article-table-wrapper`；qtcreator-dark.min.css 不再被引用；`finally.min.js` 含表格包裹逻辑。

### 注意事项

- `noClasses: false` 后代码高亮完全由 `chroma.scss` 的 `.chroma` 类控制；新增高亮需求只需改该文件。
- `highlight.min.js`（`assets/js/highlight.min.js`）与 `assets/css/hljs/*.min.css` 现为死资源，可留待后续清理。
- 方案C（图片灯箱、Callout 提示框）仍未实施。

---

## 2026-08-27

### 修改内容

文章详情页样式现代化重构（第一批，纯 SCSS + CSS 变量）：

1. **修复代码块无背景色问题**：
   - `theme-vars.css` 新增 `--code-block-bg` / `--code-block-border` 变量（浅色 `rgb(246,248,250)` 灰、深色 `rgb(46,46,51)`），深浅色由变量自动切换。
   - `chroma.scss` 代码块背景由 `var(--code-bg)`（近白浅粉，导致无背景感）改为 `var(--code-block-bg)`（浅灰，视觉可辨）；删除冗余的 `body.dark` 背景特判，token 配色保留 github（浅）/ monokai（深）两套。
2. **现代排版重写 `article-detail.scss`**：
   - 正文 16px / line-height 1.85 / 段落两端对齐。
   - 标题层级：h1 下边框、h2 主题色左竖条+渐变底、h3 左竖条、h4-h6 分级；全部加 `scroll-margin-top: 76px` 避免固定 header 遮挡锚点。
   - 列表：`::marker` 主题色、任务列表 `accent-color`。
   - 表格：样式收敛到 `.article-table-wrapper`（与 finally.js 包裹逻辑对应），表头灰底、hover 行高亮、圆角。
   - 代码块：外层 `.highlight` 加边框+圆角+`overflow:hidden`，内层 `pre` 横向滚动，`pre code` 统一等宽字体族（JetBrains Mono 优先）。
   - 引用块 / kbd / 定义列表 / hr / 脚注统一变量化。
   - TOC 现代化：卡片化 + 内边距 + 链接 hover 主题色。
   - 自定义滚动条、主题色 `::selection`、`body` 深浅色切换过渡。
   - 移动端字号降级。
3. **死代码清理**：`custom.scss` 删除 `.chroma{background-color:unset}` 与 `.toc{background:#fff}`（TOC 样式归 article-detail 管）；`dark.scss` 删除被覆盖的 `body.dark .highlight code` 规则。

### 修改文件

- `themes/PaperMod/assets/css/core/theme-vars.css`（新增 2 对变量）
- `themes/PaperMod/assets/scss/common/article-detail.scss`（重写）
- `themes/PaperMod/assets/scss/common/chroma.scss`（背景逻辑修复）
- `themes/PaperMod/assets/scss/common/custom.scss`（清理）
- `themes/PaperMod/assets/scss/dark.scss`（清理）
- `docs/CHANGELOG_AI.md`（修改，本条目）

### 修改原因

用户反馈详情页代码块无背景、样式名不副实；且旧样式存在两层 CSS 管线 `!important` 互怼、硬编码色值散落、TOC 深色背景被 `custom.scss` 白底覆盖等问题。按「现代博客风格」统一重构，全部走 SCSS pipeline + CSS 变量。

### 测试结果

- `.\hugo.exe`（生产构建）：BUILD_OK，257 pages，无错误输出
- 产物验证：新 CSS 含 `--code-block-bg` 两套变量、`.highlight:not(table){background:var(--code-block-bg)!important}`、`scroll-margin-top`、`.article-table-wrapper` 系列规则
- 渲染 DOM 核对：`<div class="highlight"><pre class="chroma"><code class="language-js">…<span class="nx">` 结构与 CSS 匹配
- 未改动模板/JS，未影响列表页/首页/搜索/评论

### 注意事项

- 第二批（Callout shortcode、图片灯箱、阅读进度条）未实施，涉及模板/JS，需单独确认。
- `article.post-single` 上仍带 `animate__animated animate__bounce` 入场动画（模板属性），与"现代风格"略有出入，未动模板，可后续确认是否移除。
- `--hljs-bg` 变量仍被 `post-single.css` 滚动条规则引用，未删除。

---

## 2026-08-27

### 修改内容

文章详情页第二批（卡片化风格增强，shortcode + JS + SCSS）：

1. **Callout 提示框卡片**：
   - 新增 `layouts/shortcodes/callout.html`：`{{< callout type="info|success|warn|danger" title="可选" >}}内容{{< /callout >}}`，未指定 title 时按类型给默认中文标题（提示/成功/警告/注意）。
   - `theme-vars.css` 新增 4 类型 × 2 变量（`--callout-{info,success,warn,danger}-{bg,border}`），深浅两套配色。
   - 卡片样式：主题色左边框 + 浅色底 + 圆角 + 阴影 + 标题前小色块。
2. **图片灯箱**：
   - 新增 `assets/js/extended/lightbox.js`：点击文章内图片全屏预览（跳过位于 `<a>` 内的图片），暗色遮罩，点击/ESC 关闭，原生 JS 无依赖。
   - CSS：`.lightbox` 全屏遮罩 + 淡入淡出，图片 90vw/90vh 上限 + 阴影。
3. **阅读进度条**：
   - 新增 `assets/js/extended/progressbar.js`：仅文章详情页注入，顶部 3px 渐变进度条随滚动推进，passive 监听。
   - CSS：`.reading-progress` 固定顶部，主题色渐变。
4. **卡片化增强**：文章容器/代码块加柔和投影，图片加 1px 边框，引用块加投影，整体统一卡片质感。

### 修改文件

- `themes/PaperMod/layouts/shortcodes/callout.html`（新增）
- `themes/PaperMod/assets/js/extended/lightbox.js`（新增）
- `themes/PaperMod/assets/js/extended/progressbar.js`（新增）
- `themes/PaperMod/assets/css/core/theme-vars.css`（新增 callout 变量）
- `themes/PaperMod/assets/scss/common/article-detail.scss`（新增 callout/灯箱/进度条/卡片化）
- `docs/CHANGELOG_AI.md`（修改，本条目）

### 修改原因

延续第一批「现代博客风格 + 卡片化」方向，补齐现代博客常见交互：提示框、图片放大预览、阅读进度指示；并通过统一投影/边框强化卡片视觉语言。

### 测试结果

- `.\hugo.exe`（生产构建）：BUILD_OK，257 pages，无错误输出
- Callout shortcode 用临时草稿文章实测：4 种类型均正确渲染 `<div class="callout callout-{type}">` + 标题 + 正文（含自定义/默认标题），测试文件已删除
- JS 拼接顺序核对：产物 `extend.*.min.js` 中 `blobAjax`(getSetResource) < `lightbox` < `isMobile`(mobile) < `reading-progress` < `pinToc`(style)，`mobile.js` 仍在 `style.js` 前，未破坏既有依赖
- 产物验证：CSS 含 `.callout-*`、`.lightbox`、`.reading-progress`、`.lightboxable` 规则
- 未改动既有模板/既有 JS 文件，未影响列表页/首页/搜索/评论

### 注意事项

- 新 JS 文件命名不影响字典序拼接（getSetResource < lightbox < mobile < progressbar < randomLine < style），已核实。
- 灯箱跳过 `<a>` 包裹的图片，避免干扰外链图片。
- 进度条仅在 `article.post-single` 存在时注入，其他页面无影响。
- 遗留：`article.post-single` 上的 `animate__animated animate__bounce` 入场动画仍未移除（模板属性）。

---

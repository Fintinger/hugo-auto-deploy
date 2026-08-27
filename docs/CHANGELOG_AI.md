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

## 2026-08-27

### 修改内容

修复文章 post-meta 直接显示 `:date_medium` 字面量的问题。

### 修改文件

- `config.yml`（`params.DateFormat` 由 `:date_medium` 改为 `2006年1月2日`）
- `docs/CHANGELOG_AI.md`（修改，本条目）

### 修改原因

`post_meta.html` 通过 `time.Format .Site.Params.DateFormat` 渲染日期，而 Hugo v0.83 的 `time.Format`/`.Format` 不支持 `:date_medium` 这类冒号速记 layout（实测原样返回字面量），导致详情页 meta 直接显示 `:date_medium`。改用标准 Go layout 中文日期格式。

### 测试结果

- `.\hugo.exe`（生产构建）：BUILD_OK，257 pages，无错误输出
- 渲染验证：全部文章 post-meta 显示中文日期（如 `2026年8月22日`、`2026年8月26日`），不再出现 `:date_medium`
- 已用临时 shortcode 实测：`time.Format ":date_medium"` / `:date_short` 在 v0.83 均原样输出；标准 layout（`2006-01-02`、`2006年1月2日`）正常（测试文件已清理）

### 注意事项

- `DateFormat` 是全局配置，仅 `post_meta.html` 使用（已 grep 确认），改动不影响列表页/首页。
- 若后续想换日期格式，直接在 `config.yml` 改 Go layout 字符串即可，勿再使用 `:xxx` 速记。

---

## 2026-08-27

### 修改内容

文章目录（TOC）体验优化：

1. **ScrollSpy 滚动高亮**：新增 `assets/js/extended/scrollspy.js`，用 `IntersectionObserver` 跟踪文章标题，滚动时给当前章节对应 TOC 链接加 `.active` 高亮（主题色左边框 + 加粗）；TOC 可滚动时 active 项自动滚动到可见位置。注意：TOC 链接 href 被 URL 编码（中文标题 id），已用 `decodeURIComponent` 解码后再匹配。
2. **TOC 默认展开**：`config.yml` `tocopen` 由 `false` 改为 `true`，进文章即可见目录。
3. **图钉逻辑重构**：`style.js` 中 `#pinToc` 点击由脆弱的 `parentElement.parentElement.parentElement.parentElement` 链条改为 `evt.target.closest('.toc')`，并移除 `animate__fadeInRight` 硬切换动画。
4. **样式**：`article-detail.scss` 新增 `.toc a.active` 当前章节高亮样式、`.toc` 内部滚动条样式。

### 修改文件

- `themes/PaperMod/assets/js/extended/scrollspy.js`（新增）
- `themes/PaperMod/assets/js/extended/style.js`（pinToc 重构）
- `themes/PaperMod/assets/scss/common/article-detail.scss`（active 高亮 + 滚动条）
- `config.yml`（tocopen: true）
- `docs/CHANGELOG_AI.md`（修改，本条目）

### 修改原因

原 TOC 无滚动高亮，长文阅读时读者无法定位当前章节；图钉逻辑依赖 DOM 层级脆弱；默认折叠需手动展开。按「现代博客」体验补齐 ScrollSpy、默认展开并加固代码。

### 测试结果

- `.\hugo.exe`（生产构建）：BUILD_OK，257 pages，无错误输出
- JS 拼接顺序核对：`blobAjax < lightbox < isMobile < reading-progress < IntersectionObserver(scrollspy) < pinToc(style)`，`mobile.js` 仍在 `style.js` 前，依赖未破坏
- TOC 链接解码匹配验证：以 FRP 长文为例，36 个 TOC 链接全部 `decodeURIComponent` 后与标题 id 匹配（36/36）
- 产物验证：新 JS 含 `IntersectionObserver`/`decodeURIComponent`/`closest('.toc')`，`fadeInRight` 已从产物移除
- 渲染验证：`<details open>`（默认展开生效）

### 注意事项

- ScrollSpy 依赖标题 id 与 TOC href 一致；中文 id 需 URL 解码（已处理，与 `footer.html` 平滑滚动逻辑一致）。
- `IntersectionObserver` rootMargin `-80px 0px -70% 0px` 与标题 `scroll-margin-top: 76px` 配合，高亮窗口为视口顶部 80px 至底部 30% 区间。
- 遗留：`toc.html` 的 `bareul` 嵌套逻辑复杂、无章节序号，属可选后续项。

---

## 2026-08-27

### 修改内容

修复图钉（pinToc）失效问题：

1. **删除 `style.js` 中过时的 `.imgAlt` JS 填充逻辑**。该逻辑 `el.previousElementSibling.children[0].attributes.alt.value` 假设 `.imgAlt` 前一个兄弟元素的 `children[0]` 是带 `alt` 的节点，但 `.imgAlt` 前正是 `<img>`（void 元素，`children` 为空），导致 `undefined.attributes` 抛 TypeError，**中断整个 `post-single` 判断块**，使后续 `#pinToc` 点击绑定与 `printTags` 均不执行——凡带图片（有 `.imgAlt`）的文章，图钉全部失效。
2. `render-image.html` 现在直接输出 alt 文本到 `.imgAlt`（`{{- with .Text }}<div class="imgAlt">{{ . }}</div>{{- end }}`），模板已替代该 JS 填充，故直接删除而非改写。

### 修改文件

- `themes/PaperMod/assets/js/extended/style.js`（删除 imgAlt 填充逻辑）
- `docs/CHANGELOG_AI.md`（修改，本条目）

### 修改原因

用户反馈图钉点击后无法固定到右侧。定位到 `style.js` 中 `.imgAlt` 填充逻辑在带图文章上抛错，导致 pinToc 事件从未绑定（重构前同样存在，属既有 bug，本次排查暴露）。`closest('.toc')` 重构本身逻辑正确。

### 测试结果

- `.\hugo.exe`（生产构建）：BUILD_OK，257 pages，无错误输出
- 产物验证：`extend.*.min.js` 中 `post-single` 块已无 `imgAlt` 相关代码，`#pinToc` 绑定直接在块内执行
- `.toc.pinned{position:fixed;right:0;max-height:600px;overflow:auto;z-index:999}` 确认存在于 core.css 产物（Pipeline A），钉住样式完整
- 待浏览器人工核对：带图文章图钉可固定、取消固定，滚动时 ScrollSpy 高亮联动

### 注意事项

- 教训：`style.js` 无 try-catch 且 `window.onerror` 吞错，块内任何抛错都会静默中断后续逻辑。后续往文章详情页块内加逻辑时应放在敏感操作之前或加防御。
- `.imgAlt` 显示已完全由模板 + SCSS 负责，无需 JS。

---

## 2026-08-27

### 修改内容

紧急修复首页空白：`scrollspy.js` 在顶层块 `{ }` 内使用 `return`（`if (!tocInner || !content) return` 等），`return` 只能在函数内，导致整个拼接产物 `extend.*.min.js` 解析失败（浏览器报 `Uncaught SyntaxError: Illegal return statement`），全部脚本（含首页依赖的 `mobile.js`/`getSetResource.js`/`style.js` 首页控制）均不执行，首页渲染为空。

修复：`scrollspy.js` 改为 IIFE `(function () { ... })()` 包裹，`return` 落入函数作用域，语法合法。

### 修改文件

- `themes/PaperMod/assets/js/extended/scrollspy.js`（顶层块改 IIFE）
- `docs/CHANGELOG_AI.md`（修改，本条目）

### 修改原因

新增 `scrollspy.js` 时在顶层块内使用了 `return`（非法），未像 `progressbar.js` 那样规避（`progressbar.js` 曾遇同类问题，当时已改用 `if (article) {}` 结构，但 `scrollspy.js` 遗漏）。Hugo v0.83 的 minify 不拦截该语法错误，构建看似通过，浏览器执行时才崩溃。

### 测试结果

- `.\hugo.exe`（生产构建）：BUILD_OK，257 pages
- `node --check` 校验产物 `extend.*.min.js`：SYNTAX OK
- `node --check` 校验全部 `assets/js/extended/*.js` 源文件：全部 OK
- 拼接顺序复核：`blobAjax < lightbox < isMobile < reading-progress < IntersectionObserver < pinToc`，`mobile.js` 仍在 `style.js` 前
- 待浏览器人工核对：首页 profile 正常、图钉/ScrollSpy/灯箱/进度条均正常

### 注意事项

- **重要教训**：本项目 JS 经 `resources.Concat` + minify 拼成单文件，任意一个源文件的顶层语法错误会令整包失效、全站脚本停摆（首页空白）。新增 `assets/js/extended/` 文件后必须用 `node --check` 校验语法（Hugo 构建不会拦截）。
- 顶层脚本禁止裸 `return`，统一用 IIFE 或 `if (cond) { ... }` 结构。

---

## 2026-08-27

### 修改内容

修复 TOC 固定（pinned）模式样式问题：

1. **限制宽度**：`.toc.pinned` 增加 `width: 240px; max-width: 240px`。原 `.toc.pinned` 仅 `position:fixed; right:0` 无宽度约束，目录较宽时遮挡正文。
2. **优化固定模式头部**：
   - 隐藏 `<details>` 默认折叠三角（`summary` 的 `list-style:none` + `::-webkit-details-marker{display:none}`），改用 CSS 自定义折叠箭头（`summary::before` 用 border 画，closed 朝右 / open 朝下随 `details[open]` 旋转），保留折叠/展开功能且视觉统一。
   - `summary` 改 flex `justify-content: space-between`，pinned 时标题（`.details`）被隐藏后，折叠箭头靠左、图钉靠右，两端分布不挤。
   - `summary` 加 `position: sticky; top: 0`（背景 `var(--entry)`），长目录滚动时图钉按钮始终可见，可随时取消固定。

### 修改文件

- `themes/PaperMod/assets/scss/common/article-detail.scss`（pinned 样式）
- `docs/CHANGELOG_AI.md`（修改，本条目）

### 修改原因

用户反馈 pinned 后无宽度限制遮挡正文，且折叠三角与图钉横向排列不美观。迭代修正：初次隐藏原生三角后用户反馈折叠图标消失，改为自定义 CSS 折叠箭头替代，兼顾美观与功能。

### 测试结果

- `.\hugo.exe`（生产构建）：BUILD_OK，257 pages，无错误输出
- 产物验证：`article .toc.pinned{width:240px;max-width:240px}`、`summary{...justify-content:space-between...}`、`summary::before`（自定义箭头）与 `details[open] summary::before{transform:rotate(45deg)}` 已编译进 style.min.css
- 待浏览器人工核对：pinned 后右侧 240px 目录、左侧折叠箭头（点击可折叠/展开）、右侧图钉（点击取消固定）、长目录滚动时头部保持可见

### 注意事项

- 移动端（≤520px）pinned 仍会占据 240px 宽度，遮挡较多，移动端建议避免使用 pinned。
- 宽度 240px 为固定值，如需调整改 `article-detail.scss` 中 `.toc.pinned` 的 `width`。

---

## 2026-08-27

### 修改内容

代码块体验 + 全文字体优化（按用户确认的 6 项决策实施）：

1. **代码块顶部信息栏**：新增 `assets/js/extended/codeblock.js`（IIFE），遍历 `.post-content .highlight`，从 `code.language-xxx` 读取语言渲染顶栏标签，并向顶栏注入「语言标签（左）+ 复制按钮（右）」；复制用 Clipboard API + `execCommand` 兜底，含「复制 / 已复制 / 复制失败」状态。同时删除 `footer.html` 内联复制 `<script>`，避免重复按钮（顶栏内常显，天然支持行号场景）。
2. **长代码块高度限制**：`.highlight` 容器 `max-height: 480px`（移动端 `360px`）+ `overflow: auto` + 顶栏 `position: sticky; top: 0` 常驻 + 底部渐隐提示（JS 切 `.is-clipped` 时显示 `::after` 渐变）。
3. **行号开启**：`config.yml` `markup.highlight.lineNos: true`（原 false）；新增行号列分隔样式（`td.lntd` 右边框 + 内边距）与 `.lnt/.ln` 主题次要色（替代 chroma 写死 `#7f7f7f`）。
4. **全文字体系统栈**：`theme-vars.css` 新增 `--font-sans`（Latin + 中文系统字体：PingFang SC / Microsoft YaHei / Noto Sans CJK SC 等）、`--font-mono`（系统等宽栈），并**删除失效的 `jet-mono` webfont `@font-face`**（GitHub raw，永不引用，不引 web font）；`article-detail.scss` 全局 `body` 字体覆盖 + 代码 / kbd / 行内代码改用 `var(--font-mono)`。
5. **行内代码底色中性化**：浅色 `--code-bg` 由粉色 `rgb(255, 243, 240)` 改为中性灰 `rgb(244, 245, 247)`（kbd / 引用块 / 表格 hover 同步中性化，保持一致）。

### 修改文件

- `config.yml`（lineNos: true）
- `themes/PaperMod/assets/css/core/theme-vars.css`（新增 `--font-sans`/`--font-mono`、删除 jet-mono、中性灰 `--code-bg`）
- `themes/PaperMod/assets/scss/common/article-detail.scss`（顶栏/行号/限高/渐隐样式 + body 字体覆盖 + 代码字体走变量）
- `themes/PaperMod/layouts/partials/footer.html`（删除内联复制脚本）
- `themes/PaperMod/assets/js/extended/codeblock.js`（新增）
- `docs/CHANGELOG_AI.md`（本条目）

### 修改原因

用户确认方向：① 代码等宽字体用系统栈（不引 web font）；② 做代码块顶部信息栏 + 优化复制按钮；③ 启用长代码块高度限制 + 渐隐；④ 开行号；⑤ 全文字体用纯系统栈；⑥ 行内代码底色改中性灰。解决此前代码块无语言标识、复制按钮仅 hover 出现、超长代码溢出、行号缺失、字体栈缺中文、失效 webfont 等体验问题。

### 测试结果

- `.\hugo.exe`（生产构建）：BUILD_OK，257 pages，无错误输出
- `node --check`：`codeblock.js` 与拼接产物 `extend.*.min.js` 均 SYNTAX OK（吸取 scrollspy 顶层 return 教训，用 IIFE）
- 产物验证：`stylesheet.min.*.css` 含 `--font-sans`/`--font-mono`/中性灰 `--code-bg`；`style.min.*.css` 含 `highlight-header`/`is-clipped`/`lntd`/`.lnt`/`body{font-family:var(--font-sans)}`；`extend.*.min.js` 含 `highlight-header`/`is-clipped`/`copy-code`
- 渲染 DOM：52 个 HTML 含 `lntable`（行号生效）+ `language-*`（语言标签可用）；0 个 HTML 含旧内联复制脚本（已清除）
- 未改动模板结构 / JS 拼接顺序（`codeblock.js` 字典序最前，仅碰 `.highlight` DOM，不依赖其他 extended 脚本）

### 注意事项

- **待浏览器人工核对**：顶栏语言标签 + 复制按钮、sticky 顶栏滚动常驻、底部渐隐、点击复制交互、行号列对齐、深浅色表现。本项目 `window.onerror` 吞错，JS 异常不会显式报错，需肉眼确认。
- 复制按钮标签改为中文「复制 / 已复制 / 复制失败」（原 i18n 英文 copy/copied 不再使用）。
- 底部渐隐用 `::after{position:sticky;bottom:0;margin-top:-30px}` 实现，像素与对齐可能需浏览器微调。
- 全局 `body` 字体覆盖影响全站（列表 / 首页 / 搜索 / 评论），属预期改进；如需局部回退可改 `body` 选择器范围。
- `footer.html` 内联复制脚本依赖 `ShowCodeCopyButtons` 参数，现由 `codeblock.js` 无条件注入顶栏，该参数对代码块复制已失效（如需恢复开关可加 data 属性判断）。

---

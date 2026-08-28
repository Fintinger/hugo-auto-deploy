# AI_RULES.md

> 约束 AI 在本仓库中的一切代码修改行为。修改任何文件前必须阅读本文件 + `DEVELOPMENT_WORKFLOW.md` + `PROJECT_CONTEXT.md` + `ARCHITECTURE_DECISIONS.md` + `CHANGELOG_AI.md` + 根目录 `AGENTS.md`。

---

## AI 开发原则

1. **修改前必须理解上下文**：先读 `PROJECT_CONTEXT.md`、`AGENTS.md`，以及要改动文件及其被引用处，理解数据流后再动手。
2. **不允许破坏已有功能**：Hugo 构建必须通过；改动模板/SCSS/JS 不能影响其它页面。
3. **不允许无意义重构**：本项目是长期运行的静态博客，不追求"现代框架化"。除非有明确 bug 或用户要求，不做无收益的大改。
4. **修改前说明方案**：先给出改动方案（影响范围 + 理由），再动手。
5. **最小改动优先**：只改与目标直接相关的文件，不顺手改无关内容。
6. **遵循既有约定**：样式走 SCSS pipeline、脚本走 `assets/js/extended/`、不要破坏文件拼接顺序。

---

## 项目特定规范（比通用前端规范更重要）

### Hugo / 构建规范
- **Hugo 版本锁死 v0.83.0**，用 `./hugo.exe`。禁止升级版本。
- **禁止运行 `hugo mod`** 相关命令；主题是 vendored 的。
- 配置只在 `config.yml`（单文件），不要新建 `config/` 目录。
- 不改 `resources/`、`public/`（gitignored 缓存/产物）。
- `push.sh`、`server.bat` 是本地文件（gitignored），不作为源码维护。

### 模板（Go template）规范
- 布局改动集中在 `themes/PaperMod/layouts/`，保持现有 partial 拆分习惯。
- 新 shortcode 放 `layouts/shortcodes/`，参考 `bilibili.html` 的写法（`{{ .Get 0 }}` / `.Get "name"`）。
- 不要在模板内大段内联 JS/CSS；JS 进 `assets/js/extended/`，CSS 进 `assets/scss/`。

### SCSS 规范
- 新样式必须写进 `assets/scss/`，由 `style.scss` 通过 `@import` 汇总（或新建文件后 import）。
- 变量沿用 `theme-vars.css` 的 CSS 自定义属性（`--theme`、`--entry`、`--primary` 等），深浅色两套都要覆盖。
- 不要直接改 `assets/css/core/` 下主题原始 CSS（会被 `resources.Concat` 复用）。

### JS 规范
- 自定义脚本放 `assets/js/extended/`，会被 `extend_footer.html` 拼接 + minify。
- **强约束**：`assets/js/extended/*.js` 会按**文件名字典序**拼接成单一作用域。`style.js` 依赖 `mobile.js` 里声明的全局变量/函数（`main`、`body`、`isMobile`、`hideEl`、`showEl` 等）。**不要重命名或改变这些文件的排序关系**；新增文件注意命名不影响既有依赖。
- 最终兜底脚本用 `finally.js`（单独 minify、最后执行），用于覆盖主题默认行为。
- 用原生 JS，不引入 npm/打包工具链。

### 内容规范
- 文章在 `content/posts/`，按 `年/月/日` 目录放 `index.md`（或具名 `.md`）。
- front matter：`title`、`date`、`categories`、`tags`。
- permalink 为 `/p/:slug/`，不要手动改 permalink 规则。
- 图片等资源放文章目录 `index.assets/` 或 `static/`。

### 提交规范
- 提交类型遵循 `DEVELOPMENT_WORKFLOW.md` §2（`feat`/`fix`/`refactor`/`docs`/`post`/`chore`），小粒度、类型分开提交；提交前先输出 Git 建议等待用户确认。
- 历史 emoji 约定保留作辅助标记：📑 新文章、✨ 样式、🛠️ bugfix。
- 不主动 commit/push，除非用户明确要求。

---

## 修改流程（必须按顺序执行）

1. **阅读上下文**：`PROJECT_CONTEXT.md` + `AGENTS.md` + 目标文件及引用处。
2. **分析影响范围**：找出所有依赖/引用点（grep 模板变量、SCSS `@import`、JS 拼接顺序、`config.yml` 参数）。
3. **提出修改方案**：说明改什么、为什么、影响哪些页面/功能。
4. **修改代码**：按上述规范实施。
5. **执行构建**：`.\hugo.exe`（排除 drafts）确认 BUILD_OK；如涉及草稿用 `.\hugo.exe server -D` 冒烟。
6. **检查浏览器 Console 错误**：注意本项目 `footer.html` 里 `window.onerror` 会吞错，不能依赖"无报错"就通过，需人工核对关键交互（首页、搜索、评论、TOC、深色切换）。
7. **更新 CHANGELOG_AI.md**：记录本次改动。模板中的「模型」字段必须填写**本会话实际使用的模型名**（以系统提示/工具信息中声明的模型标识为准，例如 `deepseek-v4-pro`、`claude-xxx`、`gpt-xxx` 等），**严禁照抄历史条目中的模型名**；若无法确认自身模型名，填「未知」。
8. **输出 Git 提交建议**：按 `DEVELOPMENT_WORKFLOW.md` §5 输出修改摘要与 Git 建议（Commit 类型 / message / 包含文件 / 不包含文件），等待用户确认后提交。

---

## Git 提交规范

AI 参与开发时必须遵守项目 Git 管理规则（详见 `DEVELOPMENT_WORKFLOW.md` §2）：

要求：
- 修改前确认任务范围
- 修改后检查 `git status`
- 不自动提交包含无关文件的 commit

不同类型修改必须分开提交：

- 代码：`feat` / `fix` / `refactor`
- 文档：`docs`
- 文章：`post`
- 配置：`chore`

禁止：
- 混合 commit（功能 + 文档 + 文章 + 配置 混在一个 commit）
- 无意义的大 commit
- 不检查暂存内容直接提交

---

## AI 任务完成标准

一个任务只有满足以下条件才算完成：

1. 代码修改完成
2. 测试通过
3. `CHANGELOG_AI.md` 已更新
4. Git 提交范围明确（按 `DEVELOPMENT_WORKFLOW.md` §5 输出建议并获用户确认）
5. 没有影响其他模块

---

## 禁止行为

- ❌ 删除/改写未知用途的代码（如 `finally.js` 的覆盖逻辑、`mobile.js` 的全局变量声明），除非先确认其作用。
- ❌ 修改无关文件。
- ❌ 引入大型依赖（npm 包、新 CDN 框架）而不说明理由。
- ❌ 升级 Hugo 版本或运行 `hugo mod`。
- ❌ 把 `comments.html` 里的 Valine 密钥再往外暴露/复制到别处。
- ❌ 移除 `window.onerror` 吞错逻辑以外的"看起来多余"的代码，未确认前不改。
- ❌ 更改 `assets/js/extended/` 文件命名（会破坏拼接顺序依赖）。
- ❌ 在模板/文章里内联大段 JS/CSS。
- ❌ 编造不存在的文件、配置或 API。

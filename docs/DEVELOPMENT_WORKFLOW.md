# Development Workflow

> 项目完整开发工作流：AI 协作流程、Git 提交规范、测试要求、发布流程。
> 本文件是 docs/ 协作文档体系的核心之一，配合 `PROJECT_CONTEXT.md` / `AI_RULES.md` / `ARCHITECTURE_DECISIONS.md` / `CHANGELOG_AI.md` 使用。

---

## 1. AI 辅助开发流程

任何 AI 任务执行前，必须按以下顺序进行：

1. **阅读协作文档**（`docs/` 目录）：
   - `PROJECT_CONTEXT.md` —— 项目整体认知
   - `AI_RULES.md` —— 行为约束与各模块规范
   - `ARCHITECTURE_DECISIONS.md` —— 既有架构决策，避免违背
   - `CHANGELOG_AI.md` —— 历史 AI 改动记录
   - 本文件 `DEVELOPMENT_WORKFLOW.md` —— 流程规范
   - 根目录 `AGENTS.md` —— 本项目维护者的补充说明

2. **理解当前架构**：重点阅读 `PROJECT_CONTEXT.md` 的「数据流」「核心模块」「组件关系」。

3. **分析任务影响范围**：grep 模板变量、SCSS `@import`、JS 拼接顺序（`assets/js/extended/`）、`config.yml` 参数等所有依赖点。

4. **提出修改方案**：说明改什么、为什么、影响哪些页面/功能，等待确认后再动手。

5. **修改代码**：遵守 `AI_RULES.md` 中对应模块（Hugo/模板/SCSS/JS/内容）的规范。

6. **执行测试**：见 §6 测试要求。

7. **更新 `CHANGELOG_AI.md`**：记录本次改动。

8. **输出 Git 提交建议**：见 §5，等待用户确认后提交。

---

## 2. Git 提交规范

项目采用 **小粒度 commit**。不同类型修改必须分开提交，一次 commit 必须表达一个明确目的。

### 功能开发

- **范围**：Hugo 模板 / layouts、SCSS 样式、`assets/js/extended/` 脚本、shortcode。
- **commit 类型**：`feat:`
- **示例**：`feat: add xxx feature`

### Bug 修复

- **范围**：修复已有问题。
- **commit 类型**：`fix:`
- **示例**：`fix: resolve xxx issue`

### 重构

- **范围**：代码结构优化（不改变行为）。
- **commit 类型**：`refactor:`
- **示例**：`refactor: extract xxx partial`

### AI 文档修改

- **范围**：
  - `docs/PROJECT_CONTEXT.md`
  - `docs/AI_RULES.md`
  - `docs/ARCHITECTURE_DECISIONS.md`
  - `docs/CHANGELOG_AI.md`
  - `docs/DEVELOPMENT_WORKFLOW.md`
- **必须单独提交**。
- **commit 类型**：`docs:`
- **示例**：`docs: update AI development workflow`

### 博客文章 / 内容修改

- **范围**：
  - `content/posts/`
  - Markdown 文章、文章图片资源
- **必须独立提交**。
- **commit 类型**：`post:`
- **示例**：`post: add xxx article`

### 配置修改

- **范围**：
  - `config.yml`
  - `.gitignore`
  - 部署/CI 配置（如有）
- **根据影响单独提交**。
- **commit 类型**：`chore:`
- **示例**：`chore: update hugo config`

### 历史约定兼容

本项目历史提交使用 emoji 约定（📑 / ✨ / 🛠️）。新规范为 Conventional Commit 前缀，可保留 emoji 增强可读性：

- `post:` → 📑（新文章）
- `feat:` / `refactor:` → ✨（功能/样式）
- `fix:` → 🛠️（bugfix）

---

## 3. Commit 边界规则

**禁止**：

- 功能代码和 AI 文档混合 commit
- 博客文章和代码混合 commit
- 配置修改和业务功能混合 commit
- 多个无关任务一次 commit

一次 commit 必须表达一个明确目的。

---

## 4. Commit 提交前检查

提交前必须：

1. 执行 `git status`，查看完整变更列表。
2. 检查暂存文件是否符合 commit 目的（`git diff --cached` 审查）。
3. 确认**没有混入**：
   - 无关代码
   - 文章内容
   - AI 文档
   - 配置文件
4. 确认**没有误暂存** gitignored / 本地文件：`push.sh`、`server.bat`、`resources/`、`public/`、`.idea/`。

---

## 5. AI 提交建议流程

AI 完成修改后**不直接提交**，必须先输出以下内容：

**修改摘要**
- 修改内容
- 修改文件
- 测试结果

**Git 建议**
- Commit 类型：
- Commit message：
- 包含文件：
- 不包含文件：

等待用户确认后提交。

---

## 6. 测试要求

本项目为 Hugo 静态站，无 Node/npm 工具链。

### 代码 / 模板 / 样式修改后必须执行

- **Hugo 生产构建**：`.\hugo.exe`（排除 drafts），确认 `BUILD_OK`。
- **草稿相关**：`.\hugo.exe server -D` 冒烟。

### 浏览器 Console 检查

- 核对关键交互：首页 profile 动效、搜索、评论、TOC、深色模式切换、移动端导航。
- **注意**：`footer.html` 末尾 `window.onerror` 会吞掉 JS 报错，不能依赖「无报错」判断，需人工核对功能。

### 内容修改

- 构建通过 + 文章 permalink、图片、shortcode 正常渲染。

---

## 7. 发布流程

1. 本地执行 `.\hugo.exe` 构建验证通过。
2. 按 §2 规范分类型、小粒度提交（每次 commit 边界清晰）。
3. push 到 GitHub `main` 分支（可用 `push.sh`，但先确认 commit 信息正确）。
4. Vercel 自动构建部署。
5. 访问 `https://blog.archai.space` 验证线上效果。

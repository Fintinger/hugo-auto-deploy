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

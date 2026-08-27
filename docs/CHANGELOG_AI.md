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

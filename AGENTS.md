# AGENTS.md

> 给 AI 的操作说明。本项目维护者手写。
> 修改 Admin 时必须同时阅读 `docs/PROJECT_CONTEXT.md` + `docs/AI_RULES.md` + `docs/ARCHITECTURE_DECISIONS.md` + `docs/CHANGELOG_AI.md` + `docs/DEVELOPMENT_WORKFLOW.md`。

---

## 严禁（AI 维护者红线）

### 改文件

- ❌ 不要修改 `themes/PaperMod/`（除非有明确 ADR 记录）
- ❌ 不要修改 `content/` 做测试（用 Admin 或 GitHub 网页）
- ❌ 不要整体 `yaml.dump()` 旧文章 Front Matter（必须 field-level patch）
- ❌ 不要在 Admin 代码中使用 `force: true`（Git Data API 强制更新）
- ❌ 不要把 Token 写入源码 / URL / localStorage / Cookie / URL hash

### 危险操作

- ❌ 不要把用户输入直接 `innerHTML`（必须经 sanitizer）
- ❌ 不要在控制台 `console.log` Token / Authorization header / 完整 response
- ❌ 不要用 `eval` / `new Function` / `document.write`
- ❌ 不要 CDN 用 `@latest` / `@next` / `^version`（必须固定版本 + SRI）
- ❌ 不要 `<a target="_blank">` 缺 `rel="noopener noreferrer"`

## 必须（V1 最低标准）

### Admin 写入

- ✅ `getFile` / `createFile` / `updateFile` / `deleteFile` / Git Data API 必须 `force: false`
- ✅ Front Matter 使用 field-level patch（`FrontMatter.patch`），未知字段保留
- ✅ Preview 经过 sanitizer 才能进 DOM
- ✅ Token 仅 `sessionStorage`（`admin.github.token`），关闭标签自动失效
- ✅ `handleApiError` 在 401 / 403（非 rate limit）时清除 Token
- ✅ 同一编辑会话内 object URL 必须 `URL.revokeObjectURL`
- ✅ 离开页面前 `beforeunload` 守卫：dirty 或 pending uploads 非空

### CDN / SRI

- ✅ `marked@12.0.2` / `highlight.js@11.9.0` / `katex@0.16.11`
- ✅ 全部 `crossorigin="anonymous"`
- ✅ 全部标准 Base64 SHA-384 `integrity` 属性
- ✅ 升级依赖时**必须**重新计算 SRI

### Headers

- ✅ 仅 `/admin/*` 应用 CSP / X-Frame-Options / X-Content-Type-Options / Referrer-Policy / Permissions-Policy / X-Robots-Tag
- ✅ 通过 `vercel.json` 配置，**不**通过 `<meta>` 单独提供
- ✅ CSP 不含 `data:`（Stage 10 收口）

### Image

- ✅ 单图 ≤ 5MB
- ✅ 单次提交图片总和 ≤ 20MB
- ✅ 仅 png / jpg / jpeg / gif / webp（**禁止 SVG**）
- ✅ 中文文件名允许
- ✅ 重名自动 `name-1.ext` / `name-2.ext`
- ✅ 图片 + 文章**一个 commit**（Git Data API 原子性）

### Front Matter

- ✅ 编辑流程：`getFile → baseline check (latestRaw === originalRaw) → patch → updateFile`
- ✅ 冲突时**不**自动重试 / 自动覆盖 → 显示 CONFLICT UI
- ✅ `bodyChanged` 才替换正文，否则保留 `originalBody`

### Authorize

- ✅ Fine-grained PAT `Contents: Read and write`（仅 `Fintinger/hugo-auto-deploy`）
- ✅ 无 OAuth / GitHub App / Cloudflare Access（V1 不引入）
- ✅ 无后端 / 无数据库

## 修改流程（精简）

1. 读取 `docs/PROJECT_CONTEXT.md` + `docs/AI_RULES.md` + `docs/ARCHITECTURE_DECISIONS.md`
2. **不要**修改 `themes/PaperMod/` / `content/` / `config.yml`（除非明确必要）
3. 修改 Admin → `node --check` 全部 JS → `node tools/admin-static-check.js` → `.\hugo.exe` → 安全扫描
4. 更新 `docs/CHANGELOG_AI.md`
5. 输出 Git commit 建议 → 等待用户确认 → **不**自动 commit
6. 修改 Vercel 配置（`vercel.json`）→ 重新计算 SRI hash

## 测试纪律

- ✅ 代码级静态检查必做
- ✅ 单元测试必做（`node` 直接跑）
- ✅ Hugo 构建必跑
- ❌ **不**引入 npm / Node build pipeline / Vite / ESLint / Jest / Playwright / GitHub Actions
- ⏳ 生产浏览器 E2E 必由**用户**执行（AI 无浏览器能力）
- 测试文章路径：`e2e-test.*`，完成后**必须**用 Admin 删除功能清理

## Git 提交规范

- `feat:` 新功能（模板 / SCSS / JS / shortcode）
- `fix:` 修复
- `refactor:` 重构
- `docs:` 文档
- `post:` 文章
- `chore:` 配置
- 提交粒度：一次一个明确目的，**不**混合
- commit message 严禁包含：Token / URL 含 Token / 完整 response
- **不**自动 commit / **不**自动 push / **不** force push

## 已知限制（V1 范围外）

- 多用户协同编辑 → 不支持
- 自动 merge → 不支持
- 回收站 / restore → 不支持
- 自动保存 → 不支持
- OAuth / GitHub App / Cloudflare Access → V2 范围
- SVG 上传预览 → 不支持
- 非 Page Bundle 文章图片上传 → 不支持
- 图片清理工具 → 不支持

---

**项目当前状态：MAINTENANCE MODE（V1 已收官）**

除非用户明确提出新需求，AI 不主动扩展功能。

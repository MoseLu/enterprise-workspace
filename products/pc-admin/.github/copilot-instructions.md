# GitHub Copilot / AI Agent Instructions for BTC ShopFlow

**Purpose:** 快速让 AI 代码代理在本仓库中立刻进入高产模式：理解架构、关键开发/构建流程、约定和常见陷阱，提供可执行建议与安全变更路径。

## 一眼看懂（Big picture）
- 这是一个基于 **qiankun 微前端** 的 Vue 3 + TypeScript 单体式 monorepo（`pnpm` + `turbo`）。主目录 `apps/` 存放子应用，`packages/` 存放共享库（如 `@btc/shared-components`、`@btc/shared-core`、`@btc/shared-utils`）。
- 主应用：`system-app`（微前端容器）；业务子应用：`admin-app`, `logistics-app`, `production-app` 等。
- 构建/缓存由 `turbo.json` 驱动，工程化脚本集中在 `scripts/`。部署通过 `scripts/*.sh` 将镜像推送到 GHCR 并以 `repository_dispatch` 触发 GitHub Actions（见 `.github/workflows/`）。

## 快速上手命令（必记）
- 环境：Node >= `20.19.0`，pnpm >= `8.x`（见 `package.json` `engines`）
- 安装：`pnpm install`
- 启动所有开发服务：`pnpm dev` 或 `pnpm dev:all`
- 启动单个子应用：`pnpm dev:admin` 或 `pnpm --filter admin-app dev`
- 构建：`pnpm build:all` 或 `pnpm build:admin`
- 本地构建并触发远端部署：`pnpm build-deploy:admin`（脚本：`scripts/build-and-push-local.sh`）

## 测试 / 静态检查
- 单元：`pnpm test:unit`（主要在 `admin-app`）
- 集成：`pnpm test:integration`
- E2E：`pnpm test:e2e`（首次运行需 `pnpm exec playwright install --with-deps`）
- 类型检查：`pnpm type-check` / `pnpm tsc:*`
- Lint/格式化：`pnpm lint` / `pnpm lint:fix` / `pnpm format`
- 循环依赖检查：`pnpm check:circular`（`scripts/check-circular-deps.mjs`）

## 重要约定与发现（供智能代理使用）
- 组件前缀：所有自研组件使用 `btc-` 前缀；文件命名示例：`btc-component-name.vue`，注册名 `BtcComponentName`（见 `packages/shared-components/README.md`）。
- 子应用独立：每个 `apps/<name>` 是独立的 Vue 项目，使用 `pnpm --filter <app>` 进行精确操作。
- 共享包优先：`predev:all` 会先构建共享包（`@btc/*`），AI 在添加新共享模块时应更新 `predev`/`build` 流程并验证 `turbo` 缓存。
- 构建后校验：某些构建（如 `logistics-app`）会运行额外校验脚本（`scripts/verify-build-assets.mjs`），提交 PR 前应运行对应命令。

## 部署与集成点（风险点）
- 镜像仓库：GHCR（脚本在 `scripts/`）——推送镜像与 `repository_dispatch` 结合触发 CI/CD（见 `scripts/build-and-push-local.sh` 与 `.github/workflows/*`）。
- Kubernetes：有一组脚本支持增量构建与部署（`build-deploy:k8s`, `deploy:k8s:*`）；变更涉及这些脚本或 k8s 模板须先在 staging 验证。
- Secrets 与必需环境变量：`GITHUB_TOKEN`、`SERVER_HOST`、`SERVER_KEY` 等（见 README 部署章节）。AI 不应在 PR 中直接 inject secrets。

## 编辑/提交/审查策略（对 AI 的具体规则）
- 变更流程：修改后运行 `pnpm lint`, `pnpm type-check`, `pnpm test:ci`（或子集）并附上可复现的本地运行步骤到 PR 描述。
- 不破坏 CI：若变更影响构建或部署脚本（`scripts/*.sh`、`.github/workflows/`），必须在 PR 中标注风险并提供回滚/测试步骤。
- 分支与合并：主分支为 `develop`（此仓库以 `develop` 为默认分支），生产分支为 `main`，发布分支为 `release/*`。

## 有助于定位代码的目录或文件（快速 lookup）
- 架构与说明：`README.md`, `implementation-docs/`，`apps/docs-app/`
- 全局脚本：`scripts/`（构建/部署/verify/test）
- CI 工作流：`.github/workflows/`（部署流程和 repository_dispatch handler）
- 包配置：`packages/*`（`shared-components`, `shared-core`, `shared-utils`, `vite-plugin`）
- 根级任务入口：`package.json`（大量 `pnpm` 脚本）
- 缓存与任务策略：`turbo.json`

## 行为准则（简单、可执行）
- 优先使用现有脚本（`pnpm` 脚本、`scripts/`）复用流程，不要新增类似功能的并行实现。
- 在建议更改 CI/CD/部署脚本前，先给出最小可行验证步骤（本地构建命令 + 需要的 env vars + 预期结果）。
- 如果建议改动影响跨应用（packages ↔ apps），请同时列出受影响的 package 名称与受影响的 `apps/<name>`。

---

如果这份指令不够具体或你希望补充常见问题/PR 模板示例，我可以把它扩展为更详尽的条目或把重要规则追加到 `.github/PULL_REQUEST_TEMPLATE.md`。请告知你想补充的部分。

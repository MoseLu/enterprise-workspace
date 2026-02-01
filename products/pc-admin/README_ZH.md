# BTC ShopFlow Monorepo

<div align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat&logo=vue.js" alt="Vue 3.x" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Micro--Frontend-qiankun-FF6B6B?style=flat" alt="Micro Frontend" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" alt="License" />
  <img src="https://img.shields.io/badge/Branch-develop-blue?style=flat&logo=git" alt="Develop Branch" />
</div>

> 🌐 **多语言版本**: [English](./README_EN.md) | [简体中文](./README.md)

---

一个基于微前端架构的企业级供应链管理系统，采用 qiankun 微前端框架构建。

## 📋 项目概述

BTC ShopFlow 是一个完整的供应链管理解决方案，包含以下核心模块：

- **系统应用 (System App)** - 系统管理和微前端容器
- **管理应用 (Admin App)** - 后台管理模块
- **物流应用 (Logistics App)** - 物流管理模块
- **生产应用 (Production App)** - 生产计划与管理
- **品质应用 (Quality App)** - 质量控制与检验
- **工程应用 (Engineering App)** - 工程设计与管理
- **财务应用 (Finance App)** - 财务管理模块
- **移动应用 (Mobile App)** - 移动端应用
- **文档站点 (Docs Site)** - 项目文档和组件库文档

## 🏗️ 技术架构

### 核心技术栈

- **前端框架**: Vue 3 + TypeScript
- **微前端**: qiankun
- **构建工具**: Vite + Turbo
- **UI 组件**: Element Plus + 自定义组件库
- **样式方案**: SCSS + UnoCSS
- **包管理**: pnpm
- **代码规范**: ESLint + Prettier + Commitlint
- **容器化**: Docker + GitHub Container Registry (GHCR)
- **CI/CD**: GitHub Actions

### 项目结构

```
btc-shopflow-monorepo/
├── apps/                          # 应用目录
│   ├── system-app/                # 系统应用 (微前端容器)
│   ├── admin-app/                 # 管理应用
│   ├── logistics-app/             # 物流应用
│   ├── production-app/            # 生产应用
│   ├── quality-app/               # 品质应用
│   ├── engineering-app/           # 工程应用
│   ├── finance-app/               # 财务应用
│   ├── monitor-app/               # 监控应用
│   ├── layout-app/                # 布局应用
│   ├── mobile-app/                # 移动应用
│   └── docs-app/             # 文档站点
├── packages/                       # 共享包
│   ├── shared-components/         # 共享组件库
│   ├── shared-core/               # 核心功能库
│   ├── shared-utils/              # 工具函数库
│   ├── vite-plugin/               # Vite 插件
│   └── subapp-manifests/          # 子应用清单
├── scripts/                        # 脚本目录
│   ├── build-and-push-local.sh    # 本地构建并推送镜像
│   ├── deploy-app-local.sh        # 本地部署脚本
│   ├── trigger-deploy.sh          # 触发部署脚本
│   ├── build-deploy-incremental-k8s.sh  # K8s 增量部署脚本
│   └── generate-lint-error-reports.mjs  # 生成 lint 错误报告
├── .github/workflows/              # GitHub Actions 工作流
│   ├── deploy-system-app.yml       # 系统应用部署工作流
│   ├── deploy-only.yml             # 通用部署工作流
│   ├── deploy-app-reusable.yml    # 可复用部署工作流
│   └── build-all-apps.yml         # 构建所有应用工作流
├── configs/                        # 配置文件
│   ├── app-scanner.ts             # 应用扫描器
│   └── unified-env-config.ts     # 统一环境配置
└── implementation-docs/           # 实现文档
```

## ✨ 最近更新 (v1.0.0)

- ✅ **分支策略优化**：从 `master` 迁移到 `develop` 作为开发分支，建立 `main`（生产）、`develop`（开发）、`release/*`（发布）三分支体系
- ✅ **系统域流程确认功能**：实现流程确认功能，支持状态标签渲染和操作列确认按钮
- ✅ **统一使用 `repository_dispatch` 触发部署工作流**：优化 CI/CD 流程
- ✅ **完善了 GitHub Actions CI/CD 工作流**：支持多应用独立部署
- ✅ **支持本地构建并自动触发远程部署**：简化部署流程
- ✅ **EPS 系统优化**：自动生成类型定义和服务方法
- ✅ **组件库增强**：新增 BtcTableGroup、BtcMasterList 等复合组件

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 20.19.0
- **pnpm**: >= 8.0.0
- **Docker**: 用于构建和推送镜像（可选）

### 安装依赖

```bash
# 安装所有依赖（包括根目录和所有子项目）
pnpm install
```

### 开发模式

```bash
# 启动所有应用开发服务器
pnpm dev

# 或启动所有应用（包含依赖构建）
pnpm dev:all

# 启动特定应用
pnpm dev:system      # 系统应用
pnpm dev:admin       # 管理应用
pnpm dev:logistics   # 物流应用
pnpm dev:production  # 生产应用
pnpm dev:quality     # 品质应用
pnpm dev:engineering # 工程应用
pnpm dev:finance     # 财务应用
pnpm dev:docs        # 文档站点
```

### 构建项目

```bash
# 构建所有应用
pnpm build:all

# 构建特定应用
pnpm build:system
pnpm build:admin
pnpm build:logistics
# ... 其他应用类似
```

## 🚢 部署

### 本地构建并部署

项目支持在本地构建 Docker 镜像并自动触发 GitHub Actions 进行远程部署：

```bash
# 构建并部署系统应用
pnpm build-deploy:system

# 构建并部署其他应用
pnpm build-deploy:admin
pnpm build-deploy:logistics
pnpm build-deploy:quality
pnpm build-deploy:production
pnpm build-deploy:engineering
pnpm build-deploy:finance
pnpm build-deploy:mobile

# 部署所有应用
pnpm deploy:all

# Kubernetes 部署（增量部署）
pnpm build-deploy:k8s              # 自动检测变更的应用
pnpm build-deploy:k8s:all          # 部署所有应用
pnpm build-deploy:k8s:system       # 部署特定应用
```

### 部署流程

1. **本地构建**: 在本地构建 Docker 镜像
2. **推送镜像**: 将镜像推送到 GitHub Container Registry (GHCR)
3. **触发工作流**: 通过 `repository_dispatch` API 触发 GitHub Actions 工作流
4. **远程部署**: GitHub Actions 在服务器上拉取镜像并部署

### 环境变量配置

部署脚本需要以下环境变量：

- **GITHUB_TOKEN**: GitHub Personal Access Token
  - 必需权限：`repo`（全选）、`write:packages`、`actions:write`
  - 设置方法（PowerShell）：
    ```powershell
    [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token', 'User')
    ```

### GitHub Actions Secrets

在 GitHub 仓库设置中配置以下 Secrets：

- **SERVER_HOST**: 服务器地址
- **SERVER_USER**: 服务器用户名（默认：root）
- **SERVER_PORT**: SSH 端口（默认：22）
- **SERVER_KEY**: SSH 私钥
- **SERVER_PAT**: GitHub Token（用于拉取镜像）

## 📦 包说明

### 共享包

- **@btc/shared-components**: 通用组件库，包含表格、表单、CRUD、图表等组件
- **@btc/shared-core**: 核心功能库，包含 CRUD 逻辑、服务管理、插件系统等
- **@btc/shared-utils**: 工具函数库，包含数组、日期、格式化、验证等工具函数
- **@btc/vite-plugin**: 自定义 Vite 插件，支持 SVG 处理、EPS 自动生成、虚拟模块等
- **@btc/subapp-manifests**: 子应用清单配置

### 应用包

- **system-app**: 系统应用，作为微前端容器和系统管理
- **admin-app**: 管理应用，后台管理功能
- **logistics-app**: 物流管理应用
- **production-app**: 生产管理应用
- **quality-app**: 品质管理应用
- **engineering-app**: 工程管理应用
- **finance-app**: 财务管理应用
- **mobile-app**: 移动端应用（支持 Capacitor）
- **docs-app**: 文档站点，包含项目文档和组件库文档

## 🌿 分支策略

### 分支说明

- **`develop`** - **开发分支**：默认分支，核心代码源
  - 所有日常开发工作都在此分支进行
  - 包含最新的开发代码，会频繁提交
  - GitHub Actions 工作流基于此分支运行
  - 作为其他分支的代码源

- **`main`** - **生产分支**：稳定代码，用于生产环境
  - 只包含经过测试验证的稳定代码
  - 从 `release/*` 分支合并而来
  - 每个版本都会打标签（如 v1.0.0）

- **`release/*`** - **发布分支**：准备发布的版本分支
  - 从 `develop` 分支创建（如 `release/v1.1.0`）
  - 用于版本测试、修复和准备
  - 最接近生产版本的代码，但会有多个版本分支
  - 测试通过后合并到 `main` 并打标签

### 工作流程

```
develop (开发) → release/* (测试) → main (生产)
```

1. **日常开发**：所有开发工作都在 `develop` 分支进行，频繁提交代码
2. **发布准备**：从 `develop` 创建 `release/v1.x.x` 分支进行测试和修复
3. **生产部署**：测试通过后合并到 `main` 分支并打版本标签（如 v1.0.0）
4. **自动部署**：通过 `pnpm build-deploy:*` 命令自动触发部署

## 🔧 开发指南

### 代码规范

项目使用 ESLint + Prettier 进行代码格式化，使用 Commitlint 规范提交信息。

```bash
# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 类型检查
pnpm type-check

# 检查循环依赖
pnpm check:circular
```

### 提交规范

使用 Conventional Commits 规范：

```bash
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式化
refactor: 重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 组件开发

所有自定义组件都使用 `btc-` 前缀，遵循以下规范：

- 组件文件命名：`btc-component-name.vue`
- 组件注册名：`BtcComponentName`
- 每个组件需要提供对应的 README 文档

## 🧪 自动化测试

项目提供三层测试保障，均可通过 pnpm 命令运行：

```bash
# 单元与组件测试（Vitest + Testing Library）
pnpm test:unit

# 业务契约集成测试（Vitest + MSW）
pnpm test:integration

# 端到端测试（Playwright）
pnpm test:e2e

# CI 一次性跑完所有测试
pnpm test:ci
```

> 首次执行端到端测试前，请运行 `pnpm exec playwright install --with-deps` 安装浏览器依赖。

## 🌐 微前端架构

### qiankun 配置

项目使用 qiankun 实现微前端架构：

- **主应用 (system-app)**: 负责路由管理和子应用加载
- **子应用**: 独立开发和部署的业务模块（admin-app、logistics-app 等）
- **通信**: 通过 props 和全局状态管理进行应用间通信

### 子应用开发

每个子应用都是独立的 Vue 3 项目，支持：

- 独立开发和调试
- 独立构建和部署
- 与主应用的数据通信
- 共享组件和工具库

## 🔄 CI/CD 工作流

### GitHub Actions 工作流

项目使用 GitHub Actions 实现自动化 CI/CD：

- **deploy-system-app.yml**: 系统应用专用部署工作流
- **deploy-only.yml**: 通用部署工作流（支持多应用批量部署）
- **deploy-app-reusable.yml**: 可复用部署工作流
- **repository-dispatch-handler.yml**: 统一处理 `repository_dispatch` 事件

### 工作流触发方式

1. **repository_dispatch**: 通过 API 触发（推荐，由本地脚本自动触发）
2. **workflow_dispatch**: 手动触发（GitHub 网页界面）
3. **push**: 推送到 `develop` 分支的特定路径触发（如 `.deploy/system-app/**`）

### 部署流程

1. 本地运行 `pnpm build-deploy:*` 命令
2. 脚本构建 Docker 镜像并推送到 GHCR
3. 脚本通过 `repository_dispatch` API 触发 GitHub Actions
4. GitHub Actions 在服务器上拉取镜像并部署

## 📚 文档

- [架构设计文档](./implementation-docs/)
- [组件文档](./apps/docs-app/)
- [部署文档](./apps/docs-app/guides/deployment/)
  - [K8s 增量部署](./docs/K8S_INCREMENTAL_DEPLOYMENT.md)
  - [GitHub Actions K8s 配置](./docs/GITHUB_ACTIONS_K8S_SETUP.md)
  - [静态部署](./apps/docs-app/guides/deployment/static-deployment.md)
  - [子域名代理配置](./apps/docs-app/guides/deployment/nginx-subdomain-proxy.md)

## 🤝 贡献指南

1. Fork 项目
2. 从 `develop` 分支创建功能分支 (`git checkout -b feature/AmazingFeature develop`)
3. 提交更改 (`git commit -m 'feat: add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request 到 `develop` 分支

### 版本发布流程

1. **创建 Release 分支**：从 `develop` 创建 `release/v1.x.x` 分支
2. **测试和修复**：在 release 分支上进行测试和 bug 修复
3. **合并到 main**：测试通过后合并到 `main` 分支
4. **打标签**：在 `main` 分支上打版本标签（如 `v1.0.0`）
5. **推送标签**：将标签推送到远程仓库

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目维护者: BTC IT Team
- OutLook邮箱: mlu@bellis-technology.cn
- 项目地址: https://github.com/BellisGit/btc-shopflow-monorepo

---

**注意**: 这是一个企业级项目，请确保在开发前阅读相关的架构文档和开发指南。

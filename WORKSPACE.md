# Enterprise Workspace Monorepo

企业级工作区（Enterprise Workspace），采用 Monorepo 架构组织多个相关项目。

**GitHub 仓库**：[BellisGit/enterprise-workspace](https://github.com/BellisGit/enterprise-workspace)

> **重要说明**：这是一个**工作区根目录**，本身**不是 Git 仓库**。各个子项目可能有自己的 Git 仓库，但工作区根目录不涉及版本控制。

## 目录结构总览

```
E:\enterprise-workspace\
├── products/                    # 核心产品项目
│   ├── pc-admin/               # PC中后台管理系统（重构后的主项目）
│   ├── agent-orchestrator/     # Agent编排平台
│   ├── agent-cli-web/          # Agent CLI Web
│   └── ops-platform/           # 运维平台
├── docs/                       # 文档目录（英文子目录结构）
│   ├── architecture/           # 架构设计文档
│   ├── cicd/                   # CI/CD配置与规范
│   ├── development/            # 开发规范与指南
│   └── middleware/             # 中间件配置与使用
├── references/                 # 参考资料与资源
├── backup/                     # 备份目录
│   └── pre-submodule-20260201-165512/  # 迁移前的备份
├── .github/                    # GitHub配置与工作流
├── WORKSPACE.md                # 工作区说明（本文档）
└── 项目指导.md                  # 项目指导文档
```

## 主项目说明

### products/pc-admin

`products/pc-admin` 是企业级中后台管理系统，采用 **Ant Design Pro + Vue 3 + TypeScript** 技术栈，是重构后的核心项目。

**技术架构**：

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端框架 | Vue 3 + TypeScript | 组件化开发 |
| UI组件库 | Ant Design Pro | 企业级UI组件 |
| 构建工具 | Vite | 快速构建与热更新 |
| 状态管理 | Pinia | 轻量级状态管理 |
| 样式方案 | UnoCSS | 原子化CSS |
| 多应用 | qiankun | 微前端架构 |
| 包管理 | pnpm | Monorepo包管理 |

**核心模块**：

- **apps/**：30+业务应用，支持独立开发与部署
- **packages/**：公共包，core、shared、UI组件等
- **auth/**：认证模块（登录、注册、密码找回）
- **locales/**：国际化支持
- **configs/**：构建配置（Vite、ESLint、TypeScript）

**开发规范**：

所有子应用必须遵循以下规范：

1. **Design Token体系**：使用全局设计令牌管理样式
2. **Bootstrap启动**：统一的应用启动与加载机制
3. **微前端架构**：基于qiankun的微前端实现
4. **懒加载**：按业务线分组，支持懒加载与预加载

详细规范请参考 [docs/README.md](./docs/README.md)

## 快速开始

### 环境要求

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 18.0.0 | 前端运行时 |
| pnpm | >= 8.0.0 | 包管理器 |
| Git | - | 版本控制 |

### 安装依赖

```bash
# 安装pnpm（如果未安装）
npm install -g pnpm

# 安装所有依赖
pnpm install
```

### 启动开发环境

```bash
# 启动pc-admin主项目
cd products/pc-admin
pnpm dev
```

### 构建生产版本

```bash
# 构建pc-admin
cd products/pc-admin
pnpm build
```

## 系统级规范（强制执行）

Enterprise Workspace 采用**系统级开发规范**，所有子项目必须强制遵循。这些规范是确保多项目协同开发一致性的基础。

### 规范文档

| 文档 | 路径 | 说明 |
|------|------|------|
| **系统开发规范** | [docs/development/系统开发规范.md](./docs/development/系统开发规范.md) | 完整的系统级规范文档 |
| 分支策略 | [.github/BRANCH_STRATEGY.md](./.github/BRANCH_STRATEGY.md) | Git分支管理详细规范 |
| CI/CD配置 | [.github/workflows/](./.github/workflows/) | 流水线配置 |
| 项目结构 | [docs/architecture/项目结构.txt](./docs/architecture/项目结构.txt) | 目录结构规范 |

### 规范要点

#### 1. Git分支策略（强制）

本仓库采用 **Git Flow** 分支模型，包含5种分支类型：

| 分支类型 | 用途 | 命名规范 | 保护级别 |
|---------|------|----------|----------|
| `main` | 生产环境代码 | `main` | 🔴 受保护 |
| `develop` | 开发主干 | `develop` | 🔴 受保护 |
| `feature/*` | 新功能开发 | `feature/<功能名>` | - |
| `bugfix/*` | 常规bug修复 | `bugfix/<描述>` | - |
| `hotfix/*` | 紧急热修复 | `hotfix/<版本>` | - |

#### 2. 提交规范（强制）

遵循 **Conventional Commits** 标准：

```
<type>(<scope>): <subject>
```

类型包括：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`chore`、`hotfix`、`release`

#### 3. 代码质量（强制）

所有项目必须通过CI/CD质量门禁：

- [x] Lint检查
- [x] 单元测试
- [x] 提交格式验证
- [x] 分支命名验证

### 分支保护规则

**main分支**：

- 禁止直接推送
- 禁止强制推送
- 必须通过PR合并
- 必须通过CI检查
- 至少1人审批

**develop分支**：

- 禁止直接推送
- 禁止强制推送
- 必须通过PR合并
- 必须通过CI检查
- 至少1人审批

### CI/CD流水线

```
feature/* ──PR──► develop ──PR──► main ──► 生产环境
                │                   │
                │                   ▼
                │              hotfix/*
                │
                ▼
             bugfix/*
```

所有子项目必须通过CI流水线检查，否则无法合并。

## 子项目规范要求

每个子项目必须在README.md中引用系统规范：

```markdown
## 开发规范

本项目遵循 [Enterprise Workspace 系统级开发规范](../../docs/development/系统开发规范.md)。

### 快速链接

- [分支策略](../../.github/BRANCH_STRATEGY.md)
- [CI/CD配置](../../.github/workflows/)
```

## 文档索引

### 开发文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 系统开发规范 | [docs/development/系统开发规范.md](./docs/development/系统开发规范.md) | 完整的开发规范 |
| 规范速查卡 | [docs/development/规范速查卡.md](./docs/development/规范速查卡.md) | 规范快速参考 |
| 规范徽章 | [docs/development/规范徽章.md](./docs/development/规范徽章.md) | 规范状态徽章 |
| 文档恢复报告 | [docs/development/文档恢复报告.md](./docs/development/文档恢复报告.md) | 恢复操作记录 |

### 架构文档

| 文档 | 路径 | 说明 |
|------|------|------|
| Git仓库架构 | [docs/architecture/git仓库架构.txt](./docs/architecture/git仓库架构.txt) | Git仓库结构说明 |
| 项目结构 | [docs/architecture/项目结构.txt](./docs/architecture/项目结构.txt) | 标准目录结构规范 |

### CI/CD文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 一致性校验 | [docs/cicd/一致性校验.txt](./docs/cicd/一致性校验.txt) | CI/CD一致性校验规则 |

### 中间件文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 环境同步 | [docs/middleware/环境同步.txt](./docs/middleware/环境同步.txt) | 中间件环境配置 |

## 相关文档

- [MONOREPO.md](./MONOREPO.md)：Monorepo架构详细设计
- [系统开发规范](./docs/development/系统开发规范.md)：完整的系统级规范文档
- [分支策略](./.github/BRANCH_STRATEGY.md)：Git分支管理规范
- [GitHub配置](./.github/)：CI/CD流水线和工作流配置
- [项目指导](./项目指导.md)：项目指导文档

---

**规范等级**：强制执行（Mandatory）

**适用范围**：Enterprise Workspace Monorepo所有项目

**最后更新**：2026-02-01

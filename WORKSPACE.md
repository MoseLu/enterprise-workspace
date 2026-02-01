# Enterprise Workspace Monorepo

企业级工作区（Enterprise Workspace），采用 Monorepo 架构组织多个相关项目。

**GitHub 仓库**：[BellisGit/enterprise-workspace](https://github.com/BellisGit/enterprise-workspace)

> **重要说明**：这是一个**工作区根目录**，本身**不是 Git 仓库**。各个子项目可能有自己的 Git 仓库，但工作区根目录不涉及版本控制。

## 目录结构总览

```
E:\enterprise-workspace\
├── products/                    # 核心产品项目
│   ├── devstation/              # 开发工作站
│   ├── ops-platform/            # 运维平台
│   ├── agent-orchestrator/      # Agent 编排平台
│   └── agent-cli-web/           # Agent CLI Web
├── services/                    # 后端服务
│   ├── backend/                 # 通用后端服务
│   └── rag/                     # RAG 知识库服务
├── tools/                       # 工具项目
│   └── scheduler/               # 任务调度器
├── docs/                        # 文档目录
│   ├── 规范/                    # 系统级开发规范
│   ├── devstation-docs/         # DevStation 文档
│   └── ops-platform-docs/       # 运维平台文档
├── infrastructure/              # 基础设施
│   ├── deployments/             # 部署配置
│   └── scripts/                 # 公共脚本
├── config/                      # 配置目录
│   ├── cursor/                  # Cursor IDE 配置
│   ├── spec-workflow/           # 工作流规范
│   └── shared/                  # 共享资源
├── sandbox/                     # 沙箱/归档
├── references/                  # 参考资料
├── .github/                     # GitHub 配置
├── MONOREPO.md                  # 架构设计文档
└── WORKSPACE.md                 # 工作区说明（本文档）
```

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/BellisGit/enterprise-workspace.git
cd enterprise-workspace
```

## 系统级规范（强制执行）

Enterprise Workspace 采用**系统级开发规范**，所有子项目必须强制遵循。这些规范是确保多项目协同开发一致性的基础。

### 规范文档

| 文档 | 路径 | 说明 |
|------|------|------|
| **系统开发规范** | [docs/规范/系统开发规范.md](./docs/规范/系统开发规范.md) | 完整的系统级规范文档 |
| 分支策略 | [.github/BRANCH_STRATEGY.md](./.github/BRANCH_STRATEGY.md) | Git 分支管理详细规范 |
| CI/CD 配置 | [.github/workflows/](./.github/workflows/) | 流水线配置 |

### 规范要点

#### 1. Git 分支策略（强制）

本仓库采用 **Git Flow** 分支模型，包含 5 种分支类型：

| 分支类型 | 用途 | 命名规范 | 保护级别 |
|---------|------|----------|----------|
| `main` | 生产环境代码 | `main` | 🔴 受保护 |
| `develop` | 开发主干 | `develop` | 🔴 受保护 |
| `feature/*` | 新功能开发 | `feature/<功能名>` | - |
| `bugfix/*` | 常规 bug 修复 | `bugfix/<描述>` | - |
| `hotfix/*` | 紧急热修复 | `hotfix/<版本>` | - |

#### 2. 提交规范（强制）

遵循 **Conventional Commits** 标准：

```
<type>(<scope>): <subject>
```

类型包括：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`chore`、`hotfix`、`release`

#### 3. 代码质量（强制）

所有项目必须通过 CI/CD 质量门禁：

- [x] Lint 检查
- [x] 单元测试
- [x] 提交格式验证
- [x] 分支命名验证

### 分支保护规则

**main 分支**：
- 禁止直接推送
- 禁止强制推送
- 必须通过 PR 合并
- 必须通过 CI 检查
- 至少 1 人审批

**develop 分支**：
- 禁止直接推送
- 禁止强制推送
- 必须通过 PR 合并
- 必须通过 CI 检查
- 至少 1 人审批

### CI/CD 流水线

```
feature/* ──PR──► develop ──PR──► main ──► 生产环境
                │                   │
                │                   ▼
                │              hotfix/*
                │
                ▼
             bugfix/*
```

所有子项目必须通过 CI 流水线检查，否则无法合并。

## 子项目规范要求

每个子项目必须在 README.md 中引用系统规范：

```markdown
## 开发规范

本项目遵循 [Enterprise Workspace 系统级开发规范](../../docs/规范/系统开发规范.md)。

### 快速链接

- [分支策略](../../.github/BRANCH_STRATEGY.md)
- [CI/CD 配置](../../.github/workflows/)
```

## 相关文档

- [MONOREPO.md](./MONOREPO.md)：Monorepo 架构详细设计
- [系统开发规范](./docs/规范/系统开发规范.md)：完整的系统级规范文档
- [分支策略](./.github/BRANCH_STRATEGY.md)：Git 分支管理规范
- [GitHub 配置](./.github/)：CI/CD 流水线和工作流配置

---

**规范等级**：强制执行（Mandatory）

**适用范围**：Enterprise Workspace Monorepo 所有项目

**最后更新**：2026-02-01

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
│   ├── devstation-docs/         # DevStation 文档
│   ├── ops-platform-docs/       # 运维平台文档
│   └── *.txt                    # 杂项文档
├── infrastructure/              # 基础设施
│   ├── deployments/             # 部署配置
│   └── scripts/                 # 公共脚本
├── config/                      # 配置目录
│   ├── cursor/                  # Cursor IDE 配置
│   ├── spec-workflow/           # 工作流规范
│   └── shared/                  # 共享资源
├── sandbox/                     # 沙箱/归档
├── references/                  # 参考资料
├── MONOREPO.md                  # 架构设计文档
└── WORKSPACE.md                 # 工作区说明（本文档）
```

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/BellisGit/enterprise-workspace.git
cd enterprise-workspace
```

## 相关文档

- [MONOREPO.md](./MONOREPO.md)：Monorepo 架构详细设计
- [分支策略](./.github/BRANCH_STRATEGY.md)：Git 分支管理规范
- [GitHub 配置](./.github/)：CI/CD 流水线和工作流配置

## Git 分支策略

本仓库采用 **Git Flow** 分支模型，包含 5 种分支类型：

| 分支类型 | 用途 | 命名规范 |
|---------|------|----------|
| `main` | 生产环境代码 | `main` |
| `develop` | 开发主干 | `develop` |
| `feature/*` | 新功能开发 | `feature/<功能名>` |
| `bugfix/*` | 常规 bug 修复 | `bugfix/<描述>` |
| `hotfix/*` | 紧急热修复 | `hotfix/<版本>` |

### 分支保护规则

- **main 分支**：受保护，禁止直接推送，必须通过 PR 合并
- **develop 分支**：受保护，禁止直接推送，必须通过 PR 合并

### CI/CD 流水线

```bash
feature/* ──PR──► develop ──PR──► main ──► 生产环境
                │                   │
                │                   ▼
                │              hotfix/*
                │
                ▼
             bugfix/*
```

详细规范请参考：[.github/BRANCH_STRATEGY.md](./.github/BRANCH_STRATEGY.md)

**最后更新**：2026-02-01

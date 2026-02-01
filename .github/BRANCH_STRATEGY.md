# Git 分支策略规范

## 概述

本文档定义了 Enterprise Workspace Monorepo 的 Git 分支策略，采用 **Git Flow** 变体模型，适用于多项目协同开发。

## 分支结构

```
┌─────────────────────────────────────────────────────────────┐
│                      分支层级结构                            │
├─────────────────────────────────────────────────────────────┤
│  长期分支                                                   │
│  ├── main/release     ← 生产环境代码 (受保护)               │
│  └── develop          ← 开发主干 (受保护)                   │
├─────────────────────────────────────────────────────────────┤
│  短期分支                                                   │
│  ├── feature/*        ← 新功能开发                          │
│  ├── bugfix/*         ← 常规 bug 修复                       │
│  └── hotfix/*         ← 紧急热修复                          │
└─────────────────────────────────────────────────────────────┘
```

## 分支说明

### 1. main/release 分支

**用途**：生产环境代码稳定版本

**特性**：
- 只接受来自 `develop` 的合并（发布流程）
- 只接受来自 `hotfix/*` 的紧急修复
- 永远不应直接从 `feature/*` 或 `bugfix/*` 合并
- 受保护分支：禁止直接推送，必须通过 PR

**命名**：`main` 或 `release/v1.x.x`

**操作规范**：
```bash
# 禁止直接推送
git push origin main  # ❌ 拒绝

# 通过 PR 合并
# 创建 PR: develop → main
```

### 2. develop 分支

**用途**：开发主干，集成所有已完成的功能

**特性**：
- 所有功能分支完成后合并到此分支
- 每日构建和测试的基础
- 代码质量门禁的入口
- 受保护分支：禁止直接推送，必须通过 PR

**命名**：`develop`

**操作规范**：
```bash
# 新功能完成后
git checkout develop
git merge feature/xxx  # 通过 PR
```

### 3. feature/* 分支

**用途**：新功能开发

**特性**：
- 从 `develop` 分支创建
- 开发完成后合并回 `develop`
- 命名规范：`feature/<功能名称>` 或 `feature/<JIRA-ID>`

**命名**：`feature/user-auth`、`feature/api-v2`

**生命周期**：
```bash
# 1. 从 develop 创建
git checkout develop
git checkout -b feature/new-feature

# 2. 开发完成后合并回 develop
git checkout develop
git merge feature/new-feature  # 通过 PR
```

### 4. bugfix/* 分支

**用途**：常规 bug 修复（非紧急）

**特性**：
- 从 `develop` 分支创建
- 修复完成后合并回 `develop`
- 不需要立即发布到生产环境
- 命名规范：`bugfix/<描述>` 或 `bugfix/<JIRA-ID>`

**命名**：`bugfix/login-error`、`bugfix/memory-leak`

**生命周期**：
```bash
# 1. 从 develop 创建
git checkout develop
git checkout -b bugfix/fix-description

# 2. 修复完成后合并
git checkout develop
git merge bugfix/fix-description  # 通过 PR
```

### 5. hotfix/* 分支

**用途**：紧急生产环境修复

**特性**：
- 从 `main` 分支创建
- 修复完成后同时合并到 `main` 和 `develop`
- 需要立即发布到生产环境
- 命名规范：`hotfix/<版本号>` 或 `hotfix/<描述>`

**命名**：`hotfix/v1.2.1-security`、`hotfix/critical-error`

**生命周期**：
```bash
# 1. 从 main 创建
git checkout main
git checkout -b hotfix/urgent-fix

# 2. 修复完成后合并到 main
git checkout main
git merge hotfix/urgent-fix  # 通过 PR
git tag -a v1.2.1 -m "Release v1.2.1"

# 3. 同时合并到 develop
git checkout develop
git merge hotfix/urgent-fix  # 通过 PR
```

## 工作流程图

```
                    ┌─────────────────┐
                    │   main/release  │
                    │  (生产环境代码) │
                    └────────┬────────┘
                             │
              hotfix ←───────┤
                             │
                    ┌────────▼────────┐
                    │     develop     │
                    │   (开发主干)     │
                    └────────┬────────┘
                             │
              bugfix ←───────┤
                             │
              feature ←──────┤
                             │
                    ┌────────▼────────┐
                    │  feature/*      │
                    │  (新功能开发)   │
                    └─────────────────┘
```

## 提交规范

遵循 **Conventional Commits** 标准：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型 (Type)

| 类型 | 描述 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建或辅助工具 |

### 示例

```bash
feat(auth): add OAuth2 login support

fix(api): resolve timeout issue in high load

docs: update README with new setup instructions

hotfix: security patch for authentication bypass
```

## 分支保护规则

### 受保护分支

| 分支 | 直接推送 | 强制推送 | 合并 PR | 状态检查 |
|------|---------|---------|---------|----------|
| `main` | ❌ | ❌ | ✅ 必须 | ✅ 必须 |
| `develop` | ❌ | ❌ | ✅ 必须 | ✅ 必须 |

### 分支保护配置

在 GitHub 设置中配置以下规则：

1. **main 分支**
   - 禁止直接推送
   - 禁止强制推送
   - 合并前必须通过所有 CI 检查
   - 合并前必须至少 1 人审批
   - 管理员除外

2. **develop 分支**
   - 禁止直接推送
   - 禁止强制推送
   - 合并前必须通过所有 CI 检查
   - 合并前必须至少 1 人审批

## CI/CD 流水线

### 工作流程

```
feature/* ──PR──► develop ──PR──► main ──► 生产环境
                │                   │
                │                   ▼
                │              hotfix/*
                │
                ▼
             bugfix/*
```

### GitHub Actions

创建以下工作流：

1. **ci.yml** - 持续集成
   - 代码检查
   - 单元测试
   - 构建验证

2. **pr-validation.yml** - PR 验证
   - PR 标题检查
   - 提交规范检查
   - 冲突检测

3. **merge-check.yml** - 合并检查
   - 合并前状态检查
   - 里程碑关联

## 版本管理

### 版本号规范

采用 **语义化版本** (Semantic Versioning)：

```
<major>.<minor>.<patch>

例如：v1.2.3
- major: 不兼容的 API 变更
- minor: 新功能（向后兼容）
- patch: Bug 修复（向后兼容）
```

### 标签 (Tag)

```bash
# 创建发布标签
git tag -a v1.0.0 -m "Release v1.0.0"

# 推送标签
git push origin v1.0.0
```

## 常见问题

### Q1: 如何开始一个新功能？

```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
# 开发...
# 提交...
git push -u origin feature/my-feature
# 创建 PR → develop
```

### Q2: 如何修复一个紧急 bug？

```bash
git checkout main
git pull origin main
git checkout -b hotfix/urgent-fix
# 修复...
git push -u origin hotfix/urgent-fix
# 创建两个 PR:
#   1. hotfix → main (紧急发布)
#   2. hotfix → develop (同步更改)
```

### Q3: 分支命名规范？

| 分支类型 | 命名模式 | 示例 |
|---------|---------|------|
| 主分支 | `main`, `develop` | `main`, `develop` |
| 功能分支 | `feature/<name>` | `feature/user-auth` |
| Bug 修复 | `bugfix/<desc>` | `bugfix/login-error` |
| 热修复 | `hotfix/<ver>` | `hotfix/v1.2.1` |
| 发布分支 | `release/<ver>` | `release/v1.3.0` |

### Q4: 如何回滚错误的合并？

```bash
# 通过 git revert
git revert -m 1 <commit-hash>

# 或通过 PR 回滚
# 在 GitHub PR 页面点击 "Revert"
```

## 相关文档

- [CONTRIBUTING.md](../11-contrib/01-contributing.md)：贡献指南
- `.github/workflows/`：CI/CD 配置
- 项目各自的 README.md：项目具体说明

---

**版本**：1.0.0
**创建时间**：2026-02-01
**最后更新**：2026-02-01

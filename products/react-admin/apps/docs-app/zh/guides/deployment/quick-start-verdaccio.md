---
title: Verdaccio 快速开始指南
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-01-27'
updated: '2025-01-27'
publish: true
tags:
- guides
- deployment
- verdaccio
- npm
sidebar_label: Verdaccio快速开始
sidebar_order: 9
sidebar_group: deployment
---

# Verdaccio 快速开始指南

## 当前状态

**目前还不能通过 npm 使用这些包**，需要先完成以下步骤。

> **提示**：推荐使用 shell 脚本（`.sh`），避免 PowerShell 乱码问题。在 Windows 上可以使用 Git Bash 运行。

## 完整设置流程

### 步骤 1: 启动 Verdaccio

**使用 shell 脚本（推荐，避免乱码）：**

在 Git Bash 或 Linux/Mac 终端中运行：
```bash
# Linux/Mac 需要先添加执行权限
chmod +x scripts/start-verdaccio.sh
./scripts/start-verdaccio.sh

# Windows Git Bash 可以直接运行
bash scripts/start-verdaccio.sh
```

**或使用 PowerShell 脚本：**
```powershell
.\scripts\start-verdaccio.ps1
```

服务将在 `http://localhost:4873` 启动。

### 步骤 2: 创建用户并登录

在新的终端窗口中运行：

```bash
npm adduser --registry http://localhost:4873
```

输入：
- Username: （你的用户名）
- Password: （你的密码）
- Email: （你的邮箱）

或者如果已有用户：

```bash
npm login --registry http://localhost:4873
```

### 步骤 3: 构建所有共享组件库

```bash
# 构建所有共享包
pnpm run predev:all
```

或者单独构建：

```bash
pnpm --filter "@btc/shared-utils" build
pnpm --filter "@btc/shared-core" build
pnpm --filter "@btc/subapp-manifests" build
pnpm --filter "@btc/vite-plugin" build
pnpm --filter "@btc/shared-components" build
```

### 步骤 4: 发布所有包

**使用 shell 脚本（推荐，避免乱码）：**

在 Git Bash 或 Linux/Mac 终端中运行：
```bash
# Linux/Mac 需要先添加执行权限
chmod +x scripts/publish-to-verdaccio.sh
./scripts/publish-to-verdaccio.sh

# Windows Git Bash 可以直接运行
bash scripts/publish-to-verdaccio.sh
```

**或使用 PowerShell 脚本：**
```powershell
.\scripts\publish-to-verdaccio.ps1
```

脚本会自动：
- 检查 Verdaccio 是否运行
- 检查登录状态
- 构建所有包
- 按依赖顺序发布所有包

### 步骤 5: 验证发布

**使用 shell 脚本（推荐，避免乱码）：**

在 Git Bash 或 Linux/Mac 终端中运行：
```bash
# Linux/Mac 需要先添加执行权限
chmod +x scripts/check-verdaccio-status.sh
./scripts/check-verdaccio-status.sh

# Windows Git Bash 可以直接运行
bash scripts/check-verdaccio-status.sh
```

**或使用 PowerShell 脚本：**
```powershell
.\scripts\check-verdaccio-status.ps1
```

或者访问 Web UI：http://localhost:4873

## 使用已发布的包

发布完成后，可以在任何项目中使用：

### 1. 配置 .npmrc

在项目根目录创建或更新 `.npmrc`：

```
@btc:registry=http://localhost:4873
```

### 2. 安装包

```bash
pnpm add @btc/shared-components @btc/shared-core @btc/shared-utils @btc/subapp-manifests @btc/vite-plugin
```

### 3. 使用包

```typescript
import { BtcCrud } from '@btc/shared-components';
import { usePluginManager } from '@btc/shared-core';
```

## 检查当前状态

运行检查脚本查看当前状态：

**使用 shell 脚本（推荐，避免乱码）：**

在 Git Bash 或 Linux/Mac 终端中运行：
```bash
# Linux/Mac
chmod +x scripts/check-verdaccio-status.sh
./scripts/check-verdaccio-status.sh

# Windows Git Bash
bash scripts/check-verdaccio-status.sh
```

**或使用 PowerShell 脚本：**
```powershell
.\scripts\check-verdaccio-status.ps1
```

## 常见问题

### Q: 如何知道包是否已发布？

A: 运行检查脚本或访问 http://localhost:4873 查看 Web UI。

### Q: 发布失败怎么办？

A: 
1. 确保 Verdaccio 正在运行
2. 确保已登录
3. 确保所有包已构建（有 dist 目录）
4. 检查包的依赖顺序（先发布基础包）

### Q: 如何在其他项目中使用？

A: 
1. 配置 `.npmrc` 添加 `@btc:registry=http://localhost:4873`
2. 确保 Verdaccio 服务可访问（如果是团队使用，需要部署到服务器）
3. 安装包：`pnpm add @btc/shared-components`

## 下一步

完成上述步骤后，所有 `@btc/*` 包就可以通过 npm/pnpm 正常安装和使用了。

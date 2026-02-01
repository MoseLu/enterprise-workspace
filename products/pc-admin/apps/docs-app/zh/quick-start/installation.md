---
title: 环境安装
sidebar_label: 环境安装
sidebar_order: 1
---

# 环境安装指南

## 前置要求

### Node.js 版本
- **推荐版本**: Node.js >= 18.0.0
- **最低版本**: Node.js >= 16.0.0

### 包管理器
- **推荐**: pnpm >= 8.0.0
- **安装**: `npm install -g pnpm`

### 其他工具
- Git >= 2.0.0
- 代码编辑器（推荐 VS Code）

## 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd btc-shopflow-monorepo
```

### 2. 安装依赖

```bash
# 安装所有依赖（包括所有应用和共享包）
pnpm install
```

### 3. 环境变量配置

复制环境变量模板文件：

```bash
# 主应用
cp apps/main-app/.env.example apps/main-app/.env

# 子应用（按需）
cp apps/admin-app/.env.example apps/admin-app/.env
```

编辑 `.env` 文件，配置必要的环境变量。

### 4. 验证安装

```bash
# 检查 Node 版本
node --version

# 检查 pnpm 版本
pnpm --version

# 检查依赖安装
pnpm list --depth=0
```

## 常见问题

### 依赖安装失败
- 清除缓存：`pnpm store prune`
- 删除 `node_modules` 和 `pnpm-lock.yaml`，重新安装

### 端口冲突
- 修改各应用的 `vite.config.ts` 中的端口配置

### 权限问题（Windows）
- 以管理员身份运行终端
- 或使用 Git Bash

## 下一步

安装完成后，请查看：
- [启动项目](./quick-start.md) - 启动项目
- [项目结构](./project-structure.md) - 了解目录结构

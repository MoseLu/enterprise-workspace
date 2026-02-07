---
title: 发布共享组件库到 Verdaccio
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
sidebar_label: 包发布
sidebar_order: 8
sidebar_group: deployment
---

# 发布共享组件库到 Verdaccio

## 概述

本文档说明如何将项目的共享组件库发布到 Verdaccio 私有仓库。

## 共享组件库列表

项目包含以下共享组件库（按依赖顺序）：

1. **@btc/shared-utils** - 共享工具库（基础，无内部依赖）
2. **@btc/shared-core** - 共享核心库（依赖 shared-utils）
3. **@btc/subapp-manifests** - 子应用清单配置
4. **@btc/vite-plugin** - Vite 插件集合
5. **@btc/shared-components** - 共享组件库（依赖 shared-core、shared-utils、subapp-manifests）

## 发布前准备

### 1. 确保 Verdaccio 运行

```powershell
# Windows
.\scripts\start-verdaccio.ps1

# Linux/Mac
./scripts/start-verdaccio.sh
```

### 2. 登录 Verdaccio

```bash
npm login --registry http://localhost:4873
```

输入用户名、密码和邮箱。

### 3. 构建所有包

```bash
# 构建所有共享包
pnpm --filter "@btc/shared-utils" build
pnpm --filter "@btc/shared-core" build
pnpm --filter "@btc/subapp-manifests" build
pnpm --filter "@btc/vite-plugin" build
pnpm --filter "@btc/shared-components" build
```

或者使用项目脚本：

```bash
pnpm run predev:all
```

## 发布流程

### 方式一：使用自动发布脚本（推荐）

```powershell
# Windows
.\scripts\publish-to-verdaccio.ps1
```

脚本会自动：
1. 检查 Verdaccio 是否运行
2. 检查登录状态
3. 构建所有包
4. 按依赖顺序发布所有包

### 方式二：手动发布

按依赖顺序逐个发布：

```bash
# 1. 发布 shared-utils（基础包）
cd packages/shared-utils
npm publish --registry http://localhost:4873

# 2. 发布 shared-core
cd ../shared-core
npm publish --registry http://localhost:4873

# 3. 发布 subapp-manifests
cd ../subapp-manifests
npm publish --registry http://localhost:4873

# 4. 发布 vite-plugin
cd ../vite-plugin
npm publish --registry http://localhost:4873

# 5. 发布 shared-components
cd ../shared-components
npm publish --registry http://localhost:4873
```

## 依赖关系说明

### workspace 依赖处理

在发布时，`workspace:*` 依赖会被转换为 `peerDependencies`，使用项目需要自己安装这些依赖。

例如，`@btc/shared-components` 的依赖关系：

```json
{
  "peerDependencies": {
    "@btc/shared-core": "^1.0.0",
    "@btc/shared-utils": "^1.0.0",
    "@btc/subapp-manifests": "^0.0.1"
  }
}
```

### 使用已发布的包

在项目中使用已发布的包时，需要安装所有 peerDependencies：

```bash
pnpm add @btc/shared-components @btc/shared-core @btc/shared-utils @btc/subapp-manifests
```

## 版本管理

### 版本号说明

**Verdaccio 不会自动设置版本号**，版本号由每个包的 `package.json` 中的 `version` 字段决定。每次发布新版本前，需要手动更新版本号。

### 更新版本号

#### 方式一：使用批量更新脚本（推荐）

项目提供了批量更新所有包版本号的脚本：

**Windows (PowerShell):**
```powershell
# 更新补丁版本 (1.0.0 -> 1.0.1)
.\scripts\version-packages.ps1 patch

# 更新次要版本 (1.0.0 -> 1.1.0)
.\scripts\version-packages.ps1 minor

# 更新主版本 (1.0.0 -> 2.0.0)
.\scripts\version-packages.ps1 major

# 使用自定义版本号
.\scripts\version-packages.ps1 patch 1.0.5
```

**Linux/Mac (Bash):**
```bash
# 添加执行权限（首次运行）
chmod +x scripts/version-packages.sh

# 更新补丁版本
./scripts/version-packages.sh patch

# 更新次要版本
./scripts/version-packages.sh minor

# 更新主版本
./scripts/version-packages.sh major

# 使用自定义版本号
./scripts/version-packages.sh patch 1.0.5
```

脚本会自动按依赖顺序更新所有包的版本号。

#### 方式二：手动更新单个包

```bash
# 进入包目录
cd packages/shared-components

# 使用 pnpm version 命令
pnpm version patch  # 1.0.0 -> 1.0.1
pnpm version minor  # 1.0.0 -> 1.1.0
pnpm version major  # 1.0.0 -> 2.0.0

# 或直接编辑 package.json
```

#### 版本号类型说明

- **patch** (补丁版本): 修复 bug，向后兼容 (1.0.0 -> 1.0.1)
- **minor** (次要版本): 新功能，向后兼容 (1.0.0 -> 1.1.0)
- **major** (主版本): 重大变更，可能不兼容 (1.0.0 -> 2.0.0)
- **prepatch/preminor/premajor**: 预发布版本 (1.0.0 -> 1.0.1-0)

### 发布新版本流程

1. **更新版本号**
   ```bash
   # 使用脚本批量更新
   .\scripts\version-packages.ps1 patch
   ```

2. **构建所有包**
   ```bash
   pnpm run predev:all
   ```

3. **发布到 Verdaccio**
   ```bash
   # 使用发布脚本
   .\scripts\publish-with-pnpm.ps1
   ```

### 版本号一致性

建议保持相关包的版本号同步更新，特别是：
- `@btc/shared-utils`、`@btc/shared-core`、`@btc/shared-components` 通常保持相同的主版本号
- `@btc/subapp-manifests` 和 `@btc/vite-plugin` 可以独立版本号

## 验证发布

### 查看已发布的包

访问 Verdaccio Web UI：http://localhost:4873

### 测试安装

在另一个项目中测试安装：

```bash
# 创建测试项目
mkdir test-package && cd test-package
pnpm init

# 配置 .npmrc
echo "@btc:registry=http://localhost:4873" >> .npmrc

# 安装包
pnpm add @btc/shared-components @btc/shared-core @btc/shared-utils @btc/subapp-manifests
```

## 常见问题

### 1. 发布失败：401 Unauthorized

- 确保已登录：`npm whoami --registry http://localhost:4873`
- 重新登录：`npm login --registry http://localhost:4873`

### 2. 发布失败：包已存在

- 更新版本号：`npm version patch`
- 或使用 `--force` 强制发布（不推荐）

### 3. 依赖找不到

- 确保按依赖顺序发布
- 检查 peerDependencies 是否正确配置
- 确保依赖包已发布到私有仓库

### 4. 构建失败

- 检查 TypeScript 类型错误
- 确保所有依赖已安装：`pnpm install`
- 检查构建脚本配置

## 维护建议

1. **版本一致性**：保持相关包的版本号同步更新
2. **依赖管理**：定期检查并更新 peerDependencies
3. **文档更新**：发布新版本时更新 README 和变更日志
4. **测试验证**：发布前在测试项目中验证包的功能

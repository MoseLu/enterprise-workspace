---
title: 启动项目
sidebar_label: 启动项目
sidebar_order: 2
---

# 启动项目

## 启动开发服务器

### 启动所有应用（推荐）

```bash
# 在项目根目录执行
pnpm dev:all
```

这将自动：
- 检查并清理端口占用
- 构建共享包（如果需要）
- 启动所有应用的开发服务器（已排除移动应用）

所有应用将在不同端口启动，可以通过主应用访问。

### 启动单个应用

```bash
# 进入应用目录
cd apps/main-app

# 启动开发服务器
pnpm dev
```

访问：`http://localhost:8080`（根据应用配置的端口）

### 启动文档站点

```bash
cd apps/docs-app
pnpm dev
```

访问：`http://localhost:8093`（或配置的端口）

## 构建项目

### 构建单个应用

```bash
cd apps/main-app
pnpm build
```

### 构建所有应用

```bash
# 在根目录执行
pnpm build:all
```

## 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定应用的测试
cd apps/main-app
pnpm test
```

## 常用命令

### 根目录命令

```bash
# 安装依赖
pnpm install

# 构建所有包和应用
pnpm build:all

# 运行所有测试
pnpm test

# 代码检查
pnpm lint

# 格式化代码
pnpm format
```

### 应用级命令

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 下一步

- [项目结构](./project-structure.md) - 了解 Monorepo 结构
- [开发指南](/zh/guides/) - 开始开发
- [架构设计](/zh/docs-sources/global/architecture/overview) - 了解系统架构

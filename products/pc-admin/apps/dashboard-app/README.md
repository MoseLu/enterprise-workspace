# dashboard-app

## 📋 应用概述

简要描述此应用的功能和用途。

## 🏗️ 架构说明

### 技术栈
- Vue 3 + TypeScript
- Vite
- Pinia
- Element Plus
- @btc/shared-components
- @btc/shared-core

### 目录结构

```
dashboard-app/
├── src/
│   ├── modules/          # 业务模块
│   ├── plugins/          # 应用插件
│   ├── bootstrap/        # 启动配置
│   ├── router/           # 路由配置
│   ├── locales/          # 国际化
│   └── main.ts          # 入口文件
├── public/               # 静态资源
├── package.json
└── vite.config.ts
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

## 📦 依赖说明

### 核心依赖
- `@btc/shared-core` - 核心业务逻辑
- `@btc/shared-components` - 共享组件库

### 开发依赖
- `vite` - 构建工具
- `vue` - 前端框架

## 🔧 配置说明

### 环境变量

```env
# 应用端口
VITE_PORT=8080

# API 地址
VITE_API_BASE_URL=http://localhost:3000
```

## 📚 相关文档

- [开发指南](../../../docs/development/app-development.md)
- [组件文档](../../../packages/shared-components/README.md)
- [CHANGELOG](./CHANGELOG.md)

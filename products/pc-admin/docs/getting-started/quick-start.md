# 快速开始

## 启动开发服务器

### 启动主应用

```bash
# 进入主应用目录
cd apps/main-app

# 启动开发服务器
pnpm dev
```

访问：`http://localhost:5173`

### 启动子应用

```bash
# Admin App
cd apps/admin-app
pnpm dev

# System App
cd apps/system-app
pnpm dev

# Logistics App
cd apps/logistics-app
pnpm dev
```

### 启动文档站点

```bash
cd apps/docs-app
pnpm dev
```

访问：`http://localhost:5173`（或配置的端口）

## 构建项目

### 构建单个应用

```bash
cd apps/main-app
pnpm build
```

### 构建所有应用

```bash
# 在根目录执行
pnpm build
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
pnpm build

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
- [开发指南](../development/app-development.md) - 开始开发
- [架构设计](../architecture/overview.md) - 了解系统架构

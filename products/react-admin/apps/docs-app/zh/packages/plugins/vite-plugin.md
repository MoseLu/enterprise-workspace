---
title: 'BTC Vite 插件'
type: package
project: plugins
owner: dev-team
created: '2025-10-10'
updated: '2025-10-13'
publish: true
tags:
- packages
- plugins
- vite
sidebar_label: Vite插件
sidebar_order: 16
sidebar_group: packages
---
# BTC Vite 插件

> BTC 微前端 Vite 插件集合

## 包含功能

| 功能 | 状态 | 对应文档 | 说明 |
| ----------- | --------- | -------- | ------------------------------ |
| **EPS** | 已实现 | 12-13 | Endpoint Service（API 自动化） |
| **SVG** | 已实现 | 11 | SVG 图标处理 |
| **Ctx** | 已实现 | 11 | 上下文（模块扫描） |
| **Tag** | 已实现 | 11 | 组件名称标签 |
| **Virtual** | 待实现 | 13 | 虚拟模块整合 |
| **File** | 待实现 | 69-71 | 文件操作工具 |
| **Proxy** | 待实现 | 65 | 代理配置管理 |

## 使用方式

### 方式 1：统一配置（推荐）

```typescript
import { btc } from '@btc/vite-plugin';

export default defineConfig({
plugins: [
vue(),
btc({
eps: {
enable: true,
api: '/admin/base/open/eps',
dist: 'build/eps',
},
svg: {
enable: true,
dirs: ['src/assets/icons'],
},
ctx: {
enable: true,
modulesDir: 'src/modules',
},
nameTag: true,
}),
],
});
```

### 方式 2：按需引入

```typescript
import { epsPlugin, svgPlugin } from '@btc/vite-plugin';

export default defineConfig({
plugins: [
vue(),
epsPlugin({
epsUrl: '/admin/base/open/eps',
outputDir: 'build/eps',
}),
// svgPlugin(), // 按需添加
],
});
```

## 功能详解

### EPS（Endpoint Service）

从后端自动生成 API 服务层：

```typescript
// 自动生成
import { service } from 'virtual:eps';

// 使用
await service.user.list({ page: 1 });
await service.order.create({ name: 'xxx' });
```

### SVG 图标

自动扫描和优化 SVG 文件，生成 SVG sprite：

```vue
<template>
<!-- 使用 icon- 前缀引用图标 -->
<svg><use href="#icon-user-avatar"></use></svg>
<svg><use href="#icon-order-cart"></use></svg>
</template>

<script setup>
import 'virtual:svg-icons'; // 自动注入
</script>
```

**特点**：

- 自动扫描 `src/` 目录下所有 `.svg` 文件
- 使用 `svgo` 优化 SVG 代码
- 根据模块名自动生成图标名称（如 `user/avatar.svg` `icon-user-avatar`）
- 支持跳过特定模块名

### Ctx 上下文

自动扫描模块并获取上下文信息：

```typescript
import ctx from 'virtual:ctx';

console.log(ctx.modules); // ['user', 'order', 'product']
console.log(ctx.serviceLang); // 'Node' | 'Java'
```

**特点**：

- 自动扫描 `src/modules/` 目录
- 获取所有模块名称列表
- 从后端 API 获取服务语言类型（可选）

### Tag 标签

自动给 Vue 组件添加 name 属性：

```vue
<script setup lang="ts" name="UserList">
// Tag 插件会自动转换为：
// <script lang="ts">
// export default defineComponent({ name: "UserList" })
// </script>
</script>
```

**特点**：

- 支持 `<script setup name="ComponentName">` 语法
- 用于 Vue DevTools 显示组件名称
- 支持 keep-alive 缓存

## 实施计划

当前进度：15/76

**已完成**：

- EPS 基础插件（文档 12-13）
- SVG 图标插件（文档 11）
- Ctx 上下文插件（文档 11）
- Tag 标签插件（文档 11）

**待实施**（按文档顺序）：

- 文档 13-14: EPS 完善
- 文档 21-23: 业务插件（ExcelPDFUpload）
- 文档 65: Proxy 代理配置
- 文档 69-71: CLI 工具

## 测试

查看 `apps/test-app` 测试应用示例：

```bash
cd apps/test-app
pnpm dev
# 访问 http://localhost:3100
```

测试内容：

- SVG 图标显示
- Ctx 模块扫描
- Tag 组件命名

---

**参考 Cool-Admin 架构，完整实现所有功能！**

---
title: "Breadcrumb 组件（面包屑导航）"
type: api
project: layout
owner: dev-team
created: 2025-10-11
updated: 2025-10-11
publish: true
tags: ["layout"]
sidebar_label: "面包屑组件"
sidebar_order: 4
sidebar_collapsed: false
sidebar_group: "Layout 组件"
---
# Breadcrumb 组件（面包屑导航）

## 功能描述

面包屑导航组件，显示当前页面在应用中的层级位置

## 特性

### 应用隔离
- 每个微应用的面包屑独立生成
- 切换应用时面包屑自动更新
- 面包屑路径不会跨应用

### 智能路由映射
- 自动从路由路径生成面包屑
- 支持国际化（动态语言切换）
- 最后一级不可点击（当前页面）

### 一致性
- 高度与标签页进程栏一致（40px）
- 样式与整体布局统一
- 响应式设计

## Props

无需 props，自动根据路由生成

## Events

无事件

## 使用示例

```vue
<template>
<Breadcrumb />
</template>

<script setup lang="ts">
import Breadcrumb from '@/layout/breadcrumb'
</script>
```

## 面包屑生成规则

### 主应用
```
首页: 系统管理
域列表: 系统管理 / 权限管理 / 域列表
```

### 子应用
```
物流首页: 物流应用
订单管理: 物流应用 / 订单管理
```

## 路径映射配置

### 主应用路径
```typescript
const mainAppPathMap = {
'/system/permission/domain': 'menu.system.permission.domain',
'/crud': 'menu.business_components.crud',
// ...
}
```

### 子应用路径
```typescript
const subAppPathMap = {
'logistics': {
'/logistics/orders': 'menu.logistics.orders',
// ...
},
// ...
}
```

## 样式定制

### 面包屑高度
```scss
.app-breadcrumb {
min-height: 40px;
height: 40px;
padding: 5px 10px;
margin-bottom: 10px; // 与内容区域的间距
}
```

### 文字颜色
```scss
.el-breadcrumb__inner {
color: var(--el-text-color-regular); // 普通层级

&:hover {
color: var(--el-color-primary); // 悬浮
}
}

// 最后一级（当前页面）
&:last-child .el-breadcrumb__inner {
color: var(--el-text-color-primary);
font-weight: 500;
}
```

## 国际化支持

使用以下国际化 key：
- `menu.system.*` - 主应用菜单
- `menu.logistics.*` - 物流应用菜单
- `menu.engineering.*` - 工程应用菜单
- `menu.quality.*` - 品质应用菜单
- `menu.production.*` - 生产应用菜单
- `micro_app.*.title` - 应用名称

## 注意事项

1. **应用隔离**：面包屑只显示当前应用的路径
2. **最后一级**：当前页面不可点击（path 为 undefined）
3. **首页处理**：主应用首页不显示额外面包屑
4. **路径同步**：需要与路由配置和菜单保持一致

## 扩展性

如需添加新路径，更新 `breadcrumbList` 计算属性中的映射：

```typescript
const mainAppPathMap: Record<string, string> = {
'/new/path': 'menu.new.path',
// ...
}
```

## 相关组件

- [Process](../process/README.md) - 标签页进程栏
- [DynamicMenu](../dynamic-menu/README.md) - 动态菜单


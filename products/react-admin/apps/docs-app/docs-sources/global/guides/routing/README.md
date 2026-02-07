# 路由系统指南

## 概述

BTC Shopflow 采用自动路由发现机制，从模块配置中自动提取路由，无需手动配置。

## 核心功能

- [自动路由发现](./auto-discovery.md) - 如何使用自动路由发现

## 工作原理

1. **模块配置**: 在模块的 `config.ts` 中定义 `views` 字段
2. **自动扫描**: 应用启动时自动扫描所有模块配置
3. **路由注册**: 自动注册到 Vue Router

## 示例

```typescript
// modules/navigation/config.ts
export default {
  name: 'navigation',
  views: [
    {
      path: '/navigation/menus',
      name: 'NavigationMenus',
      component: () => import('./views/menus/index.vue'),
      meta: { isPage: true, titleKey: 'menu.navigation.menus' },
    },
  ],
} satisfies ModuleConfig;
```

## 相关文档

- [模块系统](../../architecture/module-system.md) - 模块系统详解
- [路由架构](../../architecture/routing.md) - 路由架构设计

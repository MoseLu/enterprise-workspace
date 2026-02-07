# 自动路由发现功能使用指南

## 概述

自动路由发现功能允许你从模块的 `config.ts` 中自动提取 `views` 和 `pages` 路由配置，自动注册到 Vue Router 中，无需手动在 `router/routes/*.ts` 中配置。

## 功能特性

- ✅ **自动扫描**：自动扫描所有模块的 `config.ts` 文件
- ✅ **支持 views 和 pages**：自动提取 `views`（视图路由）和 `pages`（页面路由，如 404）
- ✅ **冲突处理**：手动配置的路由优先，自动发现的路由不会覆盖手动路由
- ✅ **模块信息**：自动添加模块信息到路由的 `meta` 中
- ✅ **可配置**：可通过环境变量 `VITE_ENABLE_AUTO_ROUTE_DISCOVERY` 控制是否启用

## 使用方法

### 1. 在 config.ts 中添加路由配置

```typescript
// modules/{module-name}/config.ts
import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  // ModuleConfig 字段
  name: 'navigation',
  label: 'common.module.navigation.label',
  order: 40,

  // 路由配置（可选）
  views: [
    {
      path: '/navigation/menus',
      name: 'NavigationMenus',
      component: () => import('./views/menus/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.navigation.menus',
      },
    },
    {
      path: '/navigation/menus/:id/permissions',
      name: 'NavigationMenuPermBind',
      component: () => import('./views/menu-perm-bind/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.navigation.menu_perm_bind',
      },
    },
  ],

  // 页面路由（如错误页面）
  pages: [
    {
      path: '/404',
      name: 'NotFound404',
      component: () => import('./pages/error/404.vue'),
      meta: {
        isPage: true,
        pageType: 'error',
        process: false, // 不显示在标签页中
      },
    },
  ],

  // PageConfig 字段（保留）
  locale: { ... },
  columns: { ... },
  forms: { ... },
  service: { ... },
} satisfies ModuleConfig;
```

### 2. 路由配置格式

#### views 路由（视图路由）

用于业务页面，通常会显示在菜单中：

```typescript
views: [
  {
    path: '/module/page',
    name: 'ModulePage', // 路由名称（必需）
    component: () => import('./views/page/index.vue'),
    meta: {
      isPage: true, // 标记为页面路由
      titleKey: 'menu.module.page', // 国际化 key
      keepAlive: true, // 是否缓存
    },
  },
]
```

#### pages 路由（页面路由）

用于特殊页面，如错误页面、登录页等：

```typescript
pages: [
  {
    path: '/404',
    name: 'NotFound404',
    component: () => import('./pages/error/404.vue'),
    meta: {
      isPage: true,
      pageType: 'error',
      process: false, // 不显示在标签页中
    },
  },
]
```

### 3. 启用/禁用自动路由发现

默认情况下，自动路由发现功能是**启用的**。如果需要禁用，可以设置环境变量：

```bash
# .env
VITE_ENABLE_AUTO_ROUTE_DISCOVERY=false
```

### 4. 路由合并规则

- **手动路由优先**：如果自动发现的路由与手动配置的路由路径冲突，手动路由会优先使用
- **冲突日志**：开发环境下会输出冲突警告，帮助识别重复路由
- **自动过滤**：自动发现的路由如果与手动路由冲突，会被自动过滤掉

## 示例

### 示例 1：为 navigation 模块添加 views 路由

```typescript
// modules/navigation/config.ts
export default {
  name: 'navigation',
  label: 'common.module.navigation.label',
  order: 40,

  // 添加 views 路由配置
  views: [
    {
      path: '/navigation/menus',
      name: 'NavigationMenus',
      component: () => import('./views/menus/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.navigation.menus',
      },
    },
    {
      path: '/navigation/menus/:id/permissions',
      name: 'NavigationMenuPermBind',
      component: () => import('./views/menu-perm-bind/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.navigation.menu_perm_bind',
      },
    },
    {
      path: '/navigation/menus/preview',
      name: 'NavigationMenuPreview',
      component: () => import('./views/menu-preview/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.navigation.menu_preview',
      },
    },
  ],

  locale: { ... },
  // ... 其他配置
} satisfies ModuleConfig;
```

### 示例 2：为 base 模块添加 pages 路由（404 错误页面）

```typescript
// modules/base/config.ts
export default {
  name: 'base',
  label: 'common.module.base.label',
  order: 0,

  // 添加 pages 路由配置
  pages: [
    {
      path: '/404',
      name: 'NotFound404',
      component: () => import('./pages/error/404.vue'),
      meta: {
        isPage: true,
        pageType: 'error',
        process: false, // 不显示在标签页中
      },
    },
    {
      path: '/401',
      name: 'Unauthorized401',
      component: () => import('./pages/error/401.vue'),
      meta: {
        isPage: true,
        pageType: 'error',
        process: false,
      },
    },
  ],

  locale: { ... },
} satisfies ModuleConfig;
```

## 注意事项

1. **路径冲突**：如果自动发现的路由路径与手动配置的路由路径相同，手动路由会优先使用，自动路由会被忽略

2. **路由名称**：建议为每个路由指定唯一的 `name`，避免路由名称冲突

3. **组件路径**：`component` 应该使用相对路径指向模块内的 Vue 组件文件

4. **meta 字段**：
   - `isPage: true`：标记为页面路由
   - `titleKey`：国际化 key，用于页面标题和菜单显示
   - `process: false`：不显示在标签页中（适用于错误页面等）

5. **模块 order**：路由按模块的 `order` 字段排序加载，`order` 越小越先加载

## 与手动路由的兼容性

自动路由发现功能与现有的手动路由配置完全兼容：

- ✅ **可以共存**：手动路由和自动路由可以同时存在
- ✅ **手动路由优先**：手动路由优先级更高，不会被自动路由覆盖
- ✅ **渐进式迁移**：可以逐步将手动路由迁移到模块配置中

## 开发调试

开发环境下，路由扫描器会输出以下日志：

```
[AdminRouter] Route discovery: 3 views, 1 pages, 0 conflicts
```

如果有冲突：

```
[AdminRouter] Route conflicts (manual routes take precedence): [
  { path: '/navigation/menus', module: 'navigation', type: 'views' }
]
```

## 相关文件

- **路由扫描器**：`packages/shared-core/src/utils/route-scanner.ts`
- **路由配置**：`apps/{app-name}/src/router/routes/{app-name}.ts`
- **模块配置**：`apps/{app-name}/src/modules/{module-name}/config.ts`

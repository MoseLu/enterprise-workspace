# 模块架构对比分析：cool-admin-vue-7.x vs btc-shopflow-monorepo

## 一、核心差异概览

### cool-admin-vue-7.x 的模块架构

#### 1. 模块配置系统（ModuleConfig）
每个模块必须有一个 `config.ts` 文件，导出 `ModuleConfig` 类型：

```typescript
// modules/{module-name}/config.ts
import type { ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
  return {
    order: 99,                    // 模块加载顺序
    components: [...],            // 模块组件列表
    views: [...],                 // 视图路由配置
    pages: [...],                 // 页面路由配置（如 404）
    install(app) { ... },         // 安装钩子
    onLoad(events) { ... }        // 加载完成钩子
  };
};
```

#### 2. 模块入口文件（index.ts）
每个模块应该有一个 `index.ts` 文件，导出模块的工具函数、hooks：

```typescript
// modules/{module-name}/index.ts
import { useStore } from './store';

export function useModule() {
  return {
    ...useStore()
  };
}

export * from './hooks';
export * from './types';
```

#### 3. 标准目录结构
```
modules/
  {module-name}/
    config.ts          # 模块配置（必需）
    index.ts           # 模块入口（推荐）
    components/        # 模块组件
    views/             # 视图页面
    pages/             # 页面（如 error/404.vue）
    service/           # 服务层（API 调用）
    store/             # 状态管理（Pinia）
    hooks/             # 组合式函数
    utils/             # 工具函数
    types/             # 类型定义
    static/            # 静态资源（svg、css）
    directives/        # 自定义指令
```

#### 4. 自动模块注册
- 通过 `import.meta.glob` 自动扫描所有 `modules/*/config.ts`
- 自动注册组件、指令、路由
- 按 `order` 排序执行 `install()` 和 `onLoad()`

### btc-shopflow-monorepo 的当前架构

#### 1. 模块配置系统（不统一）
- **部分模块有 `config.ts`**，但格式不同：
  - `warehouse/config.ts`: `PageConfig` 类型（表格列、表单配置）
  - `base/config.ts`: 简单对象（`{ name, label, order }`）
  - `data/config.ts`: `PageConfig` 类型
- **缺少 `ModuleConfig` 类型的统一配置**
- **没有模块注册机制**

#### 2. 模块入口文件（缺失）
- **大部分模块没有 `index.ts`**
- 工具函数、hooks 分散在各处
- 无法统一导出模块功能

#### 3. 目录结构（不统一）
```
modules/
  {module-name}/
    config.ts?         # 存在但格式不统一
    index.ts?          # 大部分缺失
    views/              # ✅ 统一存在
    composables/        # ❌ 部分模块有，部分没有
    locales/            # ❌ 部分模块有，部分没有
    utils/              # ❌ 部分模块有，部分没有
    # 缺少：
    # - service/        # API 调用在独立的 api-services 模块
    # - store/          # 状态管理在全局
    # - types/          # 类型定义分散
    # - static/         # 静态资源分散
    # - directives/     # 自定义指令在全局
```

#### 4. 路由注册（手动）
- 路由在 `router/routes/*.ts` 中手动配置
- 没有自动发现机制
- 与模块配置分离

## 二、具体问题清单

### 问题 1：config.ts 格式不统一

**cool-admin 标准：**
```typescript
export default (): ModuleConfig => {
  return {
    order: 99,
    views: [{ path: '/xxx', component: () => import('./views/xxx.vue') }],
    pages: [{ path: '/404', component: () => import('./pages/error/404.vue') }]
  };
};
```

**当前项目：**
```typescript
// warehouse/config.ts - PageConfig 类型
export default {
  locale: { ... },
  columns: { ... },
  forms: { ... },
  service: { ... }
} satisfies PageConfig;

// base/config.ts - 简单对象
export default {
  name: 'base',
  label: 'common.module.base.label',
  order: 0
};
```

### 问题 2：缺少 index.ts 入口文件

**cool-admin 标准：**
```typescript
// modules/dict/index.ts
export function useDict() { ... }
export * from './store';
export * from './types';
```

**当前项目：**
- 大部分模块没有 `index.ts`
- 工具函数直接导入：`import { useMenuAggregation } from '@/modules/overview/composables/useMenuAggregation'`
- 无法统一导出：`import { useOverview } from '@/modules/overview'`

### 问题 3：目录结构不统一

| 目录 | cool-admin | 当前项目 | 问题 |
|------|-----------|---------|------|
| `config.ts` | ✅ 必需 | ⚠️ 部分有，格式不统一 | 需要统一为 `ModuleConfig` |
| `index.ts` | ✅ 推荐 | ❌ 大部分缺失 | 需要创建 |
| `components/` | ✅ 标准 | ⚠️ 部分有 | 不统一 |
| `views/` | ✅ 标准 | ✅ 统一存在 | 正常 |
| `pages/` | ✅ 标准 | ⚠️ 仅在 base 模块 | 不统一 |
| `service/` | ✅ 标准 | ❌ 缺失（在 api-services） | 架构差异 |
| `store/` | ✅ 标准 | ❌ 缺失（在全局） | 架构差异 |
| `hooks/` | ✅ 标准 | ⚠️ 部分有（composables） | 命名差异 |
| `utils/` | ✅ 标准 | ⚠️ 部分有 | 不统一 |
| `types/` | ✅ 标准 | ❌ 缺失 | 需要创建 |
| `static/` | ✅ 标准 | ❌ 缺失 | 需要创建 |
| `directives/` | ✅ 标准 | ❌ 缺失（在全局） | 架构差异 |

### 问题 4：模块注册机制缺失

**cool-admin：**
- 自动扫描 `modules/*/config.ts`
- 自动注册组件、指令、路由
- 支持 `install()` 和 `onLoad()` 钩子

**当前项目：**
- 手动在 `router/routes/*.ts` 配置路由
- 没有模块注册机制
- 组件、指令在全局注册

## 三、改进建议

### 建议 1：统一 config.ts 格式

为每个模块创建标准的 `ModuleConfig`：

```typescript
// modules/{module-name}/config.ts
import type { ModuleConfig } from '@btc/shared-core/types/module';

export default (): ModuleConfig => {
  return {
    name: 'module-name',
    order: 0,
    views: [
      {
        path: '/module/xxx',
        component: () => import('./views/xxx.vue'),
        meta: { ... }
      }
    ],
    pages: [
      {
        path: '/module/404',
        component: () => import('./pages/error/404.vue'),
        meta: { isPage: true, pageType: 'error' }
      }
    ]
  };
};
```

### 建议 2：创建 index.ts 入口文件

为每个模块创建 `index.ts`：

```typescript
// modules/{module-name}/index.ts
export * from './composables';
export * from './utils';
export * from './types';

// 如果有 store
export function useModule() {
  return {
    ...useStore()
  };
}
```

### 建议 3：统一目录结构

建议的标准结构：
```
modules/
  {module-name}/
    config.ts          # ModuleConfig（必需）
    index.ts           # 模块入口（推荐）
    components/        # 模块组件（可选）
    views/             # 视图页面（必需）
    pages/             # 页面（可选，如 error）
    composables/       # 组合式函数（推荐）
    utils/             # 工具函数（可选）
    types/             # 类型定义（推荐）
    locales/           # 国际化（可选）
    # 注意：service、store、directives 根据项目架构决定是否放在模块内
```

### 建议 4：考虑模块注册机制（可选）

如果需要自动路由发现，可以考虑：
1. 创建模块扫描器（类似 cool-admin）
2. 自动从 `config.ts` 读取路由配置
3. 支持 `install()` 和 `onLoad()` 钩子

## 四、优先级建议

### 高优先级（必须修复）
1. ✅ **统一 views 目录位置**（已完成）
2. ✅ **统一 404 页面位置**（已完成）
3. ⚠️ **为所有模块创建 `index.ts`**（待完成）
4. ⚠️ **统一 `config.ts` 格式**（待完成，至少要有基本配置）

### 中优先级（推荐修复）
5. 统一目录结构（确保所有模块都有 `composables/`、`utils/`、`types/`）
6. 创建模块类型定义文件（`types/index.d.ts`）

### 低优先级（可选）
7. 实现自动模块注册机制
8. 将 `api-services` 迁移到各模块的 `service/` 目录
9. 将全局 store 迁移到各模块的 `store/` 目录

# 子应用国际化注册工具

## 简介

`registerSubAppI18n` 是一个统一的工具函数，用于从子应用的 `config.ts` 文件中提取国际化配置并注册到主应用，让主应用能够访问子应用的国际化配置（特别是 `app` 和 `menu` 部分）。

## 使用场景

主应用的概览页需要显示各个子应用的模块信息，包括：
- 应用名称（从 `config.ts` 的 `app.name` 或 `app.title` 获取）
- 菜单名称（从 `config.ts` 的 `menu` 配置获取）

通过注册子应用的国际化配置，主应用可以在概览页正确显示这些信息。

## 使用方法

### 1. 在子应用的 `i18n/getters.ts` 中注册

```typescript
// apps/system-app/src/i18n/getters.ts
import { registerSubAppI18n } from '@btc/shared-core';

// 动态加载所有 config.ts 文件（应用级和页面级）
const configFiles = import.meta.glob<{ default: any }>(
  [
    '../locales/config.ts',
    '../modules/**/config.ts',
  ],
  { eager: true }
);

// 关键：注册子应用的国际化消息获取器
// 这样主应用就能访问子应用的国际化配置
if (typeof window !== 'undefined') {
  const SYSTEM_APP_ID = 'system';
  registerSubAppI18n(SYSTEM_APP_ID, configFiles);
}
```

### 2. 确保 config.ts 文件格式正确

子应用的 `config.ts` 文件应该遵循以下格式：

```typescript
// apps/system-app/src/locales/config.ts
export default {
  'zh-CN': {
    app: {
      name: '系统应用',
      title: '系统应用',
      // ... 其他应用配置
    },
    menu: {
      data: {
        files: '文件管理',
        // ... 其他菜单配置
      },
    },
  },
  'en-US': {
    app: {
      name: 'System Application',
      title: 'System Application',
      // ... 其他应用配置
    },
    menu: {
      data: {
        files: 'File Management',
        // ... 其他菜单配置
      },
    },
  },
} satisfies LocaleConfig;
```

### 3. 主应用自动获取

主应用会在以下场景自动获取子应用的国际化配置：

1. **概览页预加载**：在概览页加载时，通过 `preloadAllSubAppsI18n` 预加载所有子应用的国际化数据
2. **子应用挂载时**：在子应用 `beforeMount` 时，通过 `loadAndMergeSubAppI18n` 加载子应用的国际化数据

## 工作原理

1. **提取配置**：从 `config.ts` 文件中提取 `app`、`menu`、`page` 等国际化配置
2. **扁平化处理**：将嵌套的配置对象转换为扁平化的键值对（如 `app.name`、`menu.data.files`）
3. **注册到全局**：将获取器函数注册到 `window.__SUBAPP_I18N_GETTERS__`，供主应用调用
4. **主应用合并**：主应用在需要时调用获取器函数，获取国际化消息并合并到主应用的 i18n 实例中

## 配置结构说明

### 应用级配置（`src/locales/config.ts`）

```typescript
{
  'zh-CN': {
    app: {
      name: '应用名称',
      title: '应用标题',
      // ... 其他应用配置
    },
    menu: {
      // 菜单配置
    },
    page: {
      // 页面配置（可选）
    },
  },
  'en-US': {
    // 英文配置
  },
}
```

### 页面级配置（`src/modules/**/config.ts`）

```typescript
{
  locale: {
    app: {
      // 应用配置（可选，用于覆盖）
    },
    menu: {
      // 菜单配置（可选，用于覆盖）
    },
    page: {
      // 页面配置
    },
  },
  columns: {
    // 表格列配置
  },
  forms: {
    // 表单配置
  },
}
```

## 注意事项

1. **模块加载时机**：`registerSubAppI18n` 应该在模块加载时就执行，而不是等到应用挂载时，这样可以确保主应用在 `beforeMount` 时就能获取到国际化配置。

2. **应用 ID**：确保传入的 `appId` 与 manifest 中的 `app.id` 一致。

3. **配置合并**：多个 `config.ts` 文件中的配置会自动合并，后面的配置会覆盖前面的同名配置。

4. **扁平化键名**：配置会被扁平化为点分隔的键名，如：
   - `app.name` → `app.name`
   - `menu.data.files` → `menu.data.files`

## 示例

### system-app 示例

```typescript
// apps/system-app/src/i18n/getters.ts
import { registerSubAppI18n } from '@btc/shared-core';

const configFiles = import.meta.glob<{ default: any }>(
  [
    '../locales/config.ts',
    '../modules/**/config.ts',
  ],
  { eager: true }
);

// 注册国际化消息获取器
if (typeof window !== 'undefined') {
  registerSubAppI18n('system', configFiles);
}
```

### logistics-app 示例

```typescript
// apps/logistics-app/src/i18n/getters.ts
import { registerSubAppI18n } from '@btc/shared-core';

const configFiles = import.meta.glob<{ default: any }>(
  [
    '../locales/config.ts',
    '../modules/**/config.ts',
  ],
  { eager: true }
);

// 注册国际化消息获取器
if (typeof window !== 'undefined') {
  registerSubAppI18n('logistics', configFiles);
}
```

## 相关文件

- `packages/shared-core/src/composables/subapp-i18n/registerSubAppI18n.ts` - 工具函数实现
- `apps/main-app/src/i18n/subapp-i18n-manager.ts` - 主应用的国际化管理器
- `apps/main-app/src/modules/overview/views/index.vue` - 概览页使用示例

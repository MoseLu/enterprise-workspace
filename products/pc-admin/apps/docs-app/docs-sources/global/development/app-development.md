# 应用开发规范

## 概述

本文档描述了在 BTC ShopFlow 微前端项目中创建和开发新应用的规范和最佳实践。

## 核心原则

### 1. 统一布局实现

所有应用（包括主应用 system-app）都必须使用 `@btc/shared-components` 的 `AppLayout` 组件，不允许自定义布局组件。

```vue
<!-- ✅ 正确：使用共享组件 -->
<template>
  <AppLayout />
</template>

<script setup lang="ts">
import { AppLayout } from '@btc/shared-components';
</script>

<!-- ❌ 错误：自定义布局组件 -->
<template>
  <div class="custom-layout">
    <!-- 自定义布局实现 -->
  </div>
</template>
```

### 2. 统一登录/退出逻辑

所有应用（除主应用 system-app）必须使用共享包的 `useLogout`，不允许覆写。

```typescript
// ✅ 正确：使用共享包的 useLogout
import { useLogout as useSharedLogout } from '@btc/shared-core/composables/useLogout';

export function useLogout() {
  return useSharedLogout({
    // 传递应用特定的配置
    authApi: getAuthApi(),
    clearUserInfo: clearUserInfo,
    getProcessStore: async () => processStore,
    deleteCookie: deleteCookie,
    getAppStorage: () => appStorage,
  });
}

// ❌ 错误：自定义 useLogout 实现
export function useLogout() {
  // 自定义退出逻辑
  // ...
}
```

**注意**：主应用 system-app 使用路由守卫处理登录/退出，不需要使用共享包的 useLogout。

### 3. 统一目录结构

所有应用必须遵循标准化的目录结构：

```
app-name/
├── src/
│   ├── main.ts              # 应用入口
│   ├── App.vue              # 根组件
│   ├── router/              # 路由配置
│   │   └── index.ts
│   ├── composables/         # 组合式函数
│   │   └── useLogout.ts     # 退出登录（使用共享包）
│   ├── pages/               # 页面组件
│   ├── components/          # 业务组件
│   └── ...
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
├── package.json             # 依赖声明
└── index.html               # HTML 模板
```

## 创建新应用

### 使用交互式脚手架（推荐）

```bash
# 从根目录执行（交互式）
pnpm create-app

# 或直接提供应用名称（快速创建）
pnpm create-app new-app-name
```

脚手架会引导你完成应用配置，包括：
- 应用名称和标题
- 开发服务器端口（自动检测已使用端口）
- 模板类型和功能特性选择

创建完成后：

```bash
# 进入新应用目录
cd apps/new-app-name-app

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

**注意**：脚手架脚本会基于 `layout-app/src/template/` 模板创建新应用。`layout-app` 同时作为布局容器（运行时）和模板应用（开发时），为所有应用提供统一的布局框架和标准化的项目结构。

### 手动创建（不推荐）

如果必须手动创建，请参考 `apps/layout-app/src/template/` 模板代码，确保：

1. 目录结构与模板一致
2. 使用 `@btc/shared-components` 的 `AppLayout`
3. 实现 qiankun 生命周期（bootstrap、mount、unmount）
4. 支持独立运行模式
5. 使用 layout-app 作为布局容器（通过 `initLayoutApp`）

## 标准化配置

### vite.config.ts

必须包含以下配置：

- TypeScript 支持
- Vue 插件
- qiankun 插件（vite-plugin-qiankun）
- 路径别名（@btc/shared-*）
- 环境变量支持

参考 `apps/layout-app/vite.config.ts`。

### tsconfig.json

必须继承根级配置：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### package.json

必须包含以下依赖：

```json
{
  "dependencies": {
    "@btc/shared-components": "workspace:*",
    "@btc/shared-core": "workspace:*",
    "@btc/shared-utils": "workspace:*",
    "vue": "^3.4.0",
    "vue-router": "^4.5.0",
    "qiankun": "^2.10.16"
  },
  "devDependencies": {
    "vite-plugin-qiankun": "^1.0.15",
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.3"
  }
}
```

## qiankun 适配

所有子应用必须实现 qiankun 生命周期：

```typescript
// src/main.ts
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

function bootstrap() {
  return Promise.resolve();
}

async function mount(props: QiankunProps) {
  // 挂载应用
  const app = createApp(App);
  app.use(router);
  app.mount(props.container || '#app');
}

async function unmount() {
  // 卸载应用
  if (app) {
    app.unmount();
    app = null;
  }
}

if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  renderWithQiankun({
    bootstrap,
    mount,
    unmount,
  });
}
```

## 独立运行支持

子应用需要支持独立运行（通过子域名访问）：

```typescript
// src/main.ts
const shouldRunStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;

if (shouldRunStandalone()) {
  // 检查是否需要加载 layout-app
  const shouldLoadLayout = /\.bellis\.com\.cn$/i.test(window.location.hostname);

  if (shouldLoadLayout) {
    // 加载 layout-app 布局
    import('./utils/init-layout-app').then(({ initLayoutApp }) => {
      initLayoutApp().then(() => {
        // layout-app 加载成功后挂载应用
        render();
      });
    });
  } else {
    // 直接渲染
    render();
  }
}
```

## 样式规范

1. **不使用内联样式**：所有样式应放在独立的样式文件中
2. **使用全局样式**：Element Plus 组件样式修改应放在全局样式表中
3. **支持暗色模式**：确保样式在暗色模式下正常工作
4. **避免样式污染**：使用 scoped 样式或 CSS Modules

## 代码规范

1. **TypeScript**：所有代码必须使用 TypeScript
2. **ESLint**：遵循项目的 ESLint 配置
3. **命名规范**：
   - 组件名使用 PascalCase（如 `UserInfo.vue`）
   - 文件名使用 kebab-case（如 `user-info.vue`）
   - 变量和函数使用 camelCase
4. **组件前缀**：自定义组件必须使用 `btc-` 前缀

## 测试

1. **单元测试**：关键业务逻辑应编写单元测试
2. **集成测试**：应用级别的集成测试
3. **E2E 测试**：关键用户流程的端到端测试

## 部署

1. **构建**：使用 `pnpm build` 构建应用
2. **预览**：使用 `pnpm preview` 预览构建结果
3. **部署**：按照项目部署流程部署到服务器

## 参考资源

- [layout-app 模板应用](../apps/layout-app/README.md)
- [共享组件库文档](../packages/shared-components/README.md)
- [qiankun 文档](https://qiankun.umijs.org/)

## 常见问题

### Q: 如何自定义布局？

A: 不允许自定义布局。如果需要自定义，请在 `@btc/shared-components` 的 `AppLayout` 中添加支持，或通过 props 和插槽进行配置。

### Q: 如何添加新的共享功能？

A: 
1. 如果功能是通用的，添加到 `@btc/shared-core` 或 `@btc/shared-components`
2. 在 `layout-app` 模板中更新示例代码
3. 同步更新所有使用该功能的应用

### Q: 子应用可以有自己的路由守卫吗？

A: 可以，但必须确保与主应用的路由守卫逻辑一致。建议使用共享的路由守卫逻辑。

### Q: 如何调试子应用？

A: 
1. 使用 `pnpm dev` 启动开发服务器
2. 使用 Vue DevTools 调试组件状态
3. 使用浏览器开发者工具调试网络请求和性能

## 更新日志

- 2024-XX-XX: 初始版本


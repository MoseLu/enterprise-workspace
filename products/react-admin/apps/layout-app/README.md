# layout-app 布局容器和模板应用

## 概述

`layout-app` 具有**双重身份**：

1. **布局容器应用（运行时）**：提供统一的布局框架，配合共享组件库的 `AppLayout` 组件，为所有子应用提供布局骨架。挂载登录/退出逻辑，任何应用只需要提供自己的 manifest 和内容信息等，并使用 layout-app，就能成为一个完整的应用。

2. **模板应用（开发时）**：作为业务应用的脚手架模板，为后续业务逻辑新应用提供标准化的项目结构。通过交互式脚手架工具，可以快速创建新的业务应用。

## 双重身份说明

### 作为布局容器（运行时）

- 提供统一的布局框架（使用 `AppLayout` 组件）
- 管理 qiankun 子应用的加载和卸载
- 提供全局的登录/退出逻辑
- 处理路由和菜单管理
- 支持子域名独立访问模式

### 作为模板应用（开发时）

- 提供完整的业务应用模板结构
- 包含 bootstrap、composables、modules 等标准目录
- 支持交互式创建新应用
- 自动配置端口、依赖和基础功能

## 目录结构

### layout-app 的目录结构

`layout-app` 的目录结构分为两部分：运行时代码和模板代码。

```
layout-app/
├── src/
│   ├── main.ts              # 入口文件（重新导出 runtime/main.ts）
│   ├── runtime/             # 运行时代码（布局容器）
│   │   ├── main.ts          # 布局容器入口
│   │   ├── App.vue          # 布局容器根组件
│   │   ├── router.ts        # 布局容器路由
│   │   ├── pages/           # 404等运行时页面
│   │   ├── plugins/         # 运行时插件
│   │   ├── services/        # 运行时服务
│   │   └── types/           # 类型定义
│   └── template/             # 模板代码（用于脚手架）
│       ├── bootstrap/       # 应用初始化模板
│       ├── composables/    # 组合式函数模板
│       ├── modules/         # 业务模块模板
│       ├── router/          # 路由配置模板
│       ├── store/           # 状态管理模板
│       ├── utils/           # 工具函数模板
│       ├── main.ts          # 应用入口模板
│       ├── App.vue          # 根组件模板
│       ├── *.template       # 配置文件模板
│       └── ...              # 其他模板文件
├── vite.config.ts           # Vite配置
├── tsconfig.json            # TypeScript配置
├── package.json             # 依赖声明
└── README.md                # 本文档
```

### 业务子应用的完整目录结构（模板）

完整的业务子应用应该包含以下目录结构（模板代码位于 `src/template/`）：

```
layout-app/
├── src/
│   ├── main.ts              # 应用入口（qiankun生命周期+独立运行）
│   ├── App.vue              # 根组件（使用AppLayout）
│   ├── app.d.ts             # 类型声明
│   ├── app.ts               # 应用配置
│   ├── env.d.ts             # 环境变量类型
│   ├── auto-imports.d.ts    # 自动导入类型
│   ├── components.d.ts      # 组件类型
│   ├── shims-vue.d.ts       # Vue类型声明
│   │
│   ├── bootstrap/           # 应用初始化
│   │   ├── index.ts         # 导出create/mount/unmount函数
│   │   └── core/            # 核心初始化
│   │       ├── index.ts     # 导出所有core模块
│   │       ├── router.ts    # 路由初始化
│   │       ├── store.ts     # 状态管理初始化
│   │       ├── i18n.ts      # 国际化初始化
│   │       └── ui.ts        # UI组件库初始化
│   │
│   ├── composables/         # 组合式函数
│   │   ├── useLogout.ts     # 退出登录（使用共享包）
│   │   └── README.md        # 说明文档
│   │
│   ├── config/              # 配置文件
│   │   ├── index.ts         # 配置导出
│   │   └── README.md        # 说明文档
│   │
│   ├── i18n/                # 国际化
│   │   └── getters.ts       # 语言获取函数
│   │
│   ├── locales/             # 语言文件
│   │   ├── zh-CN.json       # 中文
│   │   └── en-US.json       # 英文
│   │
│   ├── micro/               # 微前端配置（可选）
│   │   └── README.md        # 说明文档
│   │
│   ├── modules/             # 业务模块
│   │   └── home/            # 首页模块（示例）
│   │       └── views/
│   │           └── index.vue
│   │
│   ├── plugins/             # 插件
│   │   ├── echarts/         # ECharts插件
│   │   │   ├── config.ts
│   │   │   └── index.ts
│   │   └── README.md        # 说明文档
│   │
│   ├── router/              # 路由配置
│   │   ├── index.ts         # 路由创建函数
│   │   └── routes/          # 路由定义
│   │       └── app.ts       # 应用路由（示例）
│   │
│   ├── services/            # 服务
│   │   ├── eps.ts           # EPS服务
│   │   └── README.md        # 说明文档
│   │
│   ├── store/               # 状态管理
│   │   ├── index.ts         # Store导出
│   │   └── modules/         # Store模块
│   │       └── process.ts   # Process Store（标签页管理）
│   │
│   ├── styles/              # 样式文件
│   │   ├── global.scss      # 全局样式
│   │   └── theme.scss       # 主题样式
│   │
│   ├── types/               # 类型定义
│   │   └── qiankun.ts       # qiankun类型
│   │
│   └── utils/               # 工具函数
│       ├── app-storage.ts   # 应用存储
│       ├── cookie.ts        # Cookie工具
│       ├── domain-cache.ts  # 域名缓存
│       ├── init-layout-app.ts # 初始化layout-app
│       └── README.md        # 说明文档
│
├── vite.config.ts           # Vite配置
├── tsconfig.json            # TypeScript配置
├── tsconfig.node.json       # Node环境TS配置
├── postcss.config.js        # PostCSS配置
├── package.json             # 依赖声明
├── index.html               # HTML模板
└── README.md                # 本文档
```

**注意**：以上结构是完整的业务子应用模板结构。如果需要创建新的业务子应用，建议：

1. **参考 `finance-app` 或 `logistics-app`**：它们包含完整的业务子应用结构
2. **使用脚手架脚本**：`pnpm create-app new-app-name` 会基于这些应用创建新应用
3. **理解 `layout-app` 的定位**：它是布局容器应用的模板，不是业务子应用的模板

## 重要说明

### layout-app vs 业务子应用

- **layout-app**：布局容器应用，负责提供统一的布局框架和加载子应用
- **业务子应用**：如 `finance-app`、`logistics-app` 等，包含完整的业务逻辑

如果需要创建新的**业务子应用**，建议：
1. 使用脚手架脚本：`pnpm create-app new-app-name`
2. 参考 `finance-app` 或 `logistics-app` 的完整结构
3. 理解 `layout-app` 只是布局容器，不是业务应用的模板

## 核心特性

### 1. 布局接入

所有应用必须使用 `@btc/shared-components` 的 `AppLayout` 组件：

```vue
<!-- src/App.vue -->
<template>
  <div id="app">
    <AppLayout />
  </div>
</template>

<script setup lang="ts">
import { AppLayout } from '@btc/shared-components';
</script>
```

### 2. 登录/退出逻辑

所有应用（除主应用 main-app）必须使用共享包的 `useLogout`：

```typescript
// src/composables/useLogout.ts
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
```

### 3. qiankun 适配

所有子应用必须实现 qiankun 生命周期：

```typescript
// src/main.ts
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

function bootstrap() {
  return Promise.resolve();
}

async function mount(props: QiankunProps) {
  // 挂载应用
  await render(props);
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

### 4. 独立运行支持

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

## 使用模板创建新应用

### 交互式脚手架（推荐）

使用交互式脚手架创建新的业务子应用，脚本会基于 `layout-app/src/template/` 创建：

```bash
# 从根目录执行（交互式）
pnpm create-app

# 或直接提供应用名称（快速创建）
pnpm create-app new-app-name
```

脚手架会引导你完成以下配置：
- 应用名称（kebab-case）
- 应用标题（显示名称）
- 开发服务器端口（自动检测已使用端口）
- 模板类型（完整/最小化）
- 功能特性选择（ECharts、i18n、store、router、EPS）
- 是否使用 layout-app 作为布局容器

创建完成后：

```bash
# 进入新应用目录
cd apps/new-app-name-app

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

**注意**：脚手架脚本会从 `layout-app/src/template/` 复制模板文件，并自动替换占位符和配置端口。

### 手动创建业务子应用

如果需要手动创建，建议：

1. **参考 `finance-app` 作为模板**（它是最简单的标准业务子应用）
2. 复制其完整的目录结构到新应用
3. 修改应用名称和特定配置
4. 根据业务需求添加模块和页面

## 标准化配置

### vite.config.ts

必须包含以下配置：

- TypeScript 支持
- Vue 插件
- qiankun 插件
- 路径别名（@btc/shared-*）
- 环境变量

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
  }
}
```

### package.json

必须包含以下依赖：

- `@btc/shared-components`
- `@btc/shared-core`
- `@btc/shared-utils`
- `vue`
- `vue-router`
- `qiankun`
- `vite-plugin-qiankun`

## 注意事项

1. **布局组件**：必须使用 `@btc/shared-components` 的 `AppLayout`，不允许自定义布局组件
2. **登录/退出逻辑**：必须使用共享包的 `useLogout`，不允许覆写
3. **目录结构**：必须遵循模板的目录结构，便于维护和统一管理
4. **配置继承**：vite.config.ts 和 tsconfig.json 应该继承根级配置，避免重复配置

## 开发规范

1. 所有新应用都应该基于此模板创建
2. 模板更新时，需要同步更新所有基于模板创建的应用
3. 模板中不应该包含业务逻辑，只提供标准化的示例代码
4. 应用特定的逻辑应该放在应用自己的目录中

## 模板维护

- 模板的更新应该反映所有应用的最佳实践
- 新增标准化功能时，先在模板中实现，再同步到其他应用
- 保持模板代码简洁，避免复杂的业务逻辑


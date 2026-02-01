# 插件自动扫描系统

## 概述

本项目实现了类似 cool-admin-vue 的插件自动扫描功能，能够自动发现和注册 `modules` 和 `plugins` 目录下的所有插件。

## 目录结构

```
src/
├── modules/           # 业务模块
│   └── {module-name}/
│       └── config.ts  # 模块配置文件
├── plugins/           # 插件目录
│   └── {plugin-name}/
│       └── config.ts  # 插件配置文件
```

## 插件配置格式

### 标准 Plugin 格式

```typescript
import type { Plugin } from '@btc/shared-core';

export default (): Plugin => {
  return {
    name: 'plugin-name',
    version: '1.0.0',
    description: '插件描述',
    author: '作者',
    order: 1, // 加载顺序，数字越大优先级越高
    enable: true, // 是否启用

    // 工具栏配置
    toolbar: {
      order: 1,
      pc: true,
      h5: true,
      component: () => import('./components/toolbar.vue'),
    },

    // 布局配置
    layout: {
      position: 'header',
      order: 1,
      component: () => import('./components/layout.vue'),
    },

    // 全局组件
    components: [() => import('./components/global.vue')],

    // 全局指令
    directives: {
      'my-directive': {
        mounted(el, binding) {
          // 指令逻辑
        },
      },
    },

    // 路由配置
    views: [
      {
        path: '/plugin',
        component: () => import('./views/index.vue'),
      },
    ],

    // 安装钩子
    install(app) {
      console.log('插件安装');
    },

    // 卸载钩子
    uninstall() {
      console.log('插件卸载');
    },

    // 加载完成钩子
    onLoad(events) {
      return {
        // 导出给其他插件使用的方法
      };
    },
  };
};
```

### Cool-Admin-Vue 兼容格式

扫描器也支持 cool-admin-vue 风格的配置：

```typescript
export default (): ModuleConfig => {
  return {
    enable: true,
    order: 99,
    toolbar: {
      component: import('./components/toolbar.vue'),
      h5: false,
    },
    components: [() => import('./components/global.vue')],
    install() {
      // 安装逻辑
    },
  };
};
```

## 自动扫描机制

### 扫描规则

1. **目录扫描**: 自动扫描 `src/modules/*/config.ts` 和 `src/plugins/*/config.ts`
2. **插件扫描**: 额外扫描 `src/plugins/**/plugin.ts` 文件
3. **配置解析**: 支持函数式配置和对象式配置
4. **格式转换**: 自动将 cool-admin-vue 格式转换为标准 Plugin 格式

### 加载顺序

插件按 `order` 属性排序加载：

- 数字越大，优先级越高
- 相同 order 的插件按文件名排序
- 禁用的插件（`enable: false`）会被跳过

### 生命周期

1. **扫描阶段**: 扫描所有配置文件
2. **注册阶段**: 注册插件到插件管理器
3. **安装阶段**: 调用插件的 `install` 钩子
4. **加载阶段**: 调用插件的 `onLoad` 钩子

## 使用示例

### 创建主题切换器插件

```typescript
// src/plugins/theme-switcher/config.ts
import type { Plugin } from '@btc/shared-core';

export default (): Plugin => {
  return {
    name: 'theme-switcher',
    version: '1.0.0',
    description: '主题切换器',
    order: 1,
    toolbar: {
      order: 1,
      component: () => import('./components/theme-switcher.vue'),
    },
    install(app) {
      console.log('主题切换器已安装');
    },
  };
};
```

### 创建业务模块

```typescript
// src/modules/user/config.ts
import type { Plugin } from '@btc/shared-core';

export default (): Plugin => {
  return {
    name: 'user-module',
    version: '1.0.0',
    description: '用户管理模块',
    order: 10,
    views: [
      {
        path: '/user',
        component: () => import('./views/user-list.vue'),
      },
    ],
    install(app) {
      console.log('用户模块已安装');
    },
  };
};
```

## 调试信息

启用调试模式后，控制台会输出详细的扫描和加载信息：

```
[ModuleScanner] 开始扫描模块和插件...
[ModuleScanner] 扫描到 plugins/theme-switcher: config.ts
[ModuleScanner] 成功解析插件: theme-switcher (order: 1)
[PluginManager] 注册插件: theme-switcher
[PluginManager] 安装插件: theme-switcher
```

## 注意事项

1. **文件命名**: 配置文件必须命名为 `config.ts` 或 `plugin.ts`
2. **导出格式**: 配置文件必须导出默认函数或对象
3. **插件名称**: 每个插件必须有唯一的 `name` 属性
4. **依赖管理**: 插件可以通过 `dependencies` 属性声明依赖关系
5. **错误处理**: 扫描和安装过程中的错误会被捕获并记录，不会影响其他插件

## 扩展功能

### 自定义扫描规则

可以通过修改 `module-scanner.ts` 中的 glob 模式来自定义扫描规则：

```typescript
// 扫描更多文件类型
const moduleFiles = import.meta.glob('/src/{modules,plugins}/*/{config.ts,index.ts,plugin.ts}', {
  eager: true,
  import: 'default',
});
```

### 插件热重载

开发模式下，插件支持热重载，修改配置文件后会自动重新扫描和加载。

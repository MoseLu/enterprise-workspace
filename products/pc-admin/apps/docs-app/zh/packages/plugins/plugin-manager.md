---
title: '插件管理器 (Plugin Manager)'
type: package
project: plugins
owner: dev-team
created: '2025-10-11'
updated: '2025-10-13'
publish: true
tags:
- packages
- plugins
- manager
sidebar_label: 插件管理器
sidebar_order: 15
sidebar_group: packages
---
# 插件管理器 (Plugin Manager)

统一管理应用中的各种功能插件（ExcelPDFUpload 等）

## 特性

? **类型安全** - 完整的 TypeScript 类型定义
? **依赖检查** - 自动检查插件依赖
? **生命周期** - install/uninstall 钩子
? **单例模式** - 全局唯一实例
? **链式调用** - 支持链式注册
? **状态管理** - 跟踪插件状态

## 基本使用

### 1. 创建插件

```typescript
import type { Plugin } from '@btc/shared-core';
import { exportJsonToExcel } from './utils';

// 定义插件
export const excelPlugin: Plugin = {
name: 'excel',
version: '1.0.0',
description: 'Excel import/export plugin',

// 插件功能 API
api: {
export: exportJsonToExcel,
},

// 安装钩子（可选）
install(app, options) {
console.log('Excel plugin installed');
},

// 卸载钩子（可选）
uninstall() {
console.log('Excel plugin uninstalled');
},
};
```

### 2. 注册和使用插件

```typescript
import { usePluginManager } from '@btc/shared-core';

// 获取插件管理器实例
const pluginManager = usePluginManager({
debug: true,
checkDependencies: true,
});

// 注册插件
pluginManager.register(excelPlugin);

// 设置 Vue 应用实例
pluginManager.setApp(app);

// 安装插件
await pluginManager.install('excel');

// 获取插件 API
const excelApi = pluginManager.getApi('excel');
excelApi.export({ header: ['Name'], data: [['Tom']] });
```

## API 文档

### PluginManager 类

#### 构造函数

```typescript
new PluginManager(options?: PluginManagerOptions)
```

**选项：**
- `checkDependencies`: 是否检查插件依赖（默认 `true`）
- `allowOverride`: 是否允许覆盖已注册的插件（默认 `false`）
- `debug`: 是否启用调试日志（默认 `false`）

#### 方法

##### `register(plugin: Plugin): this`

注册插件（不安装）

```typescript
pluginManager.register(excelPlugin);
```

##### `install(name: string, options?: PluginOptions): Promise<void>`

安装已注册的插件

```typescript
await pluginManager.install('excel', { apiUrl: '/api' });
```

##### `uninstall(name: string): Promise<void>`

卸载插件

```typescript
await pluginManager.uninstall('excel');
```

##### `get<T>(name: string): Plugin<T> | undefined`

获取插件对象

```typescript
const plugin = pluginManager.get('excel');
console.log(plugin.name, plugin.version);
```

##### `getApi<T>(name: string): T | undefined`

获取插件 API

```typescript
const excelApi = pluginManager.getApi('excel');
excelApi.export(...);
```

##### `has(name: string): boolean`

检查插件是否已注册

```typescript
if (pluginManager.has('excel')) {
// 插件存在
}
```

##### `isInstalled(name: string): boolean`

检查插件是否已安装

```typescript
if (pluginManager.isInstalled('excel')) {
// 插件已安装
}
```

##### `list(): string[]`

获取所有已注册的插件名称

```typescript
const plugins = pluginManager.list();
// ['excel', 'pdf', 'upload']
```

##### `listInstalled(): string[]`

获取所有已安装的插件名称

```typescript
const installed = pluginManager.listInstalled();
// ['excel', 'pdf']
```

##### `getStatus(name: string): PluginStatus | undefined`

获取插件状态

```typescript
const status = pluginManager.getStatus('excel');
// 'installed' | 'registered' | 'uninstalled' | 'failed'
```

##### `installAll(names: string[], options?: PluginOptions): Promise<void>`

批量安装插件

```typescript
await pluginManager.installAll(['excel', 'pdf', 'upload']);
```

##### `remove(name: string): Promise<void>`

从管理器中移除插件

```typescript
await pluginManager.remove('excel');
```

## 完整示例

### 创建带依赖的插件

```typescript
// PDF 插件依赖 Excel 插件
export const pdfPlugin: Plugin = {
name: 'pdf',
version: '1.0.0',
dependencies: ['excel'], // 依赖 Excel 插件

api: {
exportPdf(data) {
// 使用 Excel 插件的功能
const excelApi = pluginManager.getApi('excel');
// ...
},
},

install(app) {
console.log('PDF plugin installed');
},
};

// 注册顺序很重要
pluginManager
.register(excelPlugin) // 先注册依赖
.register(pdfPlugin); // 再注册依赖者

await pluginManager.install('excel');
await pluginManager.install('pdf'); // 会检查 excel 是否已注册
```

### 在 Vue 应用中使用

```typescript
// main.ts
import { createApp } from 'vue';
import { usePluginManager } from '@btc/shared-core';
import { excelPlugin, pdfPlugin, uploadPlugin } from './plugins';

const app = createApp(App);

// 初始化插件管理器
const pluginManager = usePluginManager({ debug: true });
pluginManager.setApp(app);

// 注册所有插件
pluginManager
.register(excelPlugin)
.register(pdfPlugin)
.register(uploadPlugin);

// 安装需要的插件
await pluginManager.installAll(['excel', 'upload']);

app.mount('#app');
```

### 在组件中使用插件

```vue
<script setup lang="ts">
import { usePluginManager } from '@btc/shared-core';

const pluginManager = usePluginManager();

const handleExport = () => {
// 检查插件是否可用
if (!pluginManager.isInstalled('excel')) {
console.error('Excel plugin not installed');
return;
}

// 获取插件 API
const excelApi = pluginManager.getApi('excel');

// 调用插件功能
excelApi.export({
header: ['Name', 'Age'],
data: [['Tom', 25]],
filename: 'users',
});
};
</script>
```

## 插件接口定义

```typescript
interface Plugin<T = any> {
name: string; // 插件名称（必填）
version?: string; // 版本号
description?: string; // 描述
dependencies?: string[]; // 依赖的其他插件
install?: (app: App, options?: PluginOptions) => void | Promise<void>;
uninstall?: () => void | Promise<void>;
api?: T; // 插件功能 API
meta?: Record<string, any>; // 元数据
}
```

## 插件状态

```typescript
enum PluginStatus {
Registered = 'registered', // 已注册但未安装
Installed = 'installed', // 已安装
Uninstalled = 'uninstalled', // 已卸载
Failed = 'failed', // 安装失败
}
```

## 最佳实践

### 1. 单例模式

始终使用 `usePluginManager()` 获取实例，确保全局唯一

```typescript
// ? 推荐
const pluginManager = usePluginManager();

// ? 不推荐
const pluginManager = new PluginManager();
```

### 2. 链式注册

利用链式调用简化代码

```typescript
pluginManager
.register(excelPlugin)
.register(pdfPlugin)
.register(uploadPlugin);
```

### 3. 依赖管理

合理设置插件依赖，确保正确的加载顺序

```typescript
// 插件 A 依赖插件 B
const pluginA: Plugin = {
name: 'plugin-a',
dependencies: ['plugin-b'],
};
```

### 4. 错误处理

使用 try-catch 处理安装失败

```typescript
try {
await pluginManager.install('excel');
} catch (error) {
console.error('Failed to install excel plugin:', error);
}
```

### 5. 状态检查

在使用前检查插件状态

```typescript
if (pluginManager.isInstalled('excel')) {
const api = pluginManager.getApi('excel');
api.export(...);
}
```

## 常见问题

### Q: 插件管理器和 Vue Plugin 有什么区别？

**A:**
- **Vue Plugin** - Vue 官方的插件系统，主要用于扩展 Vue 实例
- **PluginManager** - 业务插件管理系统，用于管理功能模块（ExcelPDF等）

两者可以结合使用：Vue Plugin 可以注册到 PluginManager

### Q: 为什么需要插件管理器？

**A:**
- ? **统一管理** - 所有插件集中管理，易于维护
- ? **按需加载** - 只安装需要的插件
- ? **依赖检查** - 自动检查插件依赖关系
- ? **状态追踪** - 知道哪些插件已安装
- ? **类型安全** - TypeScript 支持

### Q: 如何动态加载插件？

**A:**
```typescript
// 异步导入插件
const { excelPlugin } = await import('./plugins/excel');
pluginManager.register(excelPlugin);
await pluginManager.install('excel');
```

## 未来扩展

- [ ] 插件热重载
- [ ] 插件版本冲突检测
- [ ] 插件配置持久化
- [ ] 插件市场/远程加载
- [ ] 插件权限控制


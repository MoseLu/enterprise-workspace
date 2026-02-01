---
title: 'Plugin Manager'
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
sidebar_label: Plugin Manager
sidebar_order: 15
sidebar_group: packages
---
# Plugin Manager

Unified management of various functional plugins in applications (Excel, PDF, Upload, etc.)

## Features

✅ **Type Safety** - Complete TypeScript type definitions
✅ **Dependency Checking** - Automatic plugin dependency checking
✅ **Lifecycle** - install/uninstall hooks
✅ **Singleton Pattern** - Globally unique instance
✅ **Chained Calls** - Supports chained registration
✅ **State Management** - Tracks plugin status

## Basic Usage

### 1. Create Plugin

```typescript
import type { Plugin } from '@btc/shared-core';
import { exportJsonToExcel } from './utils';

// Define plugin
export const excelPlugin: Plugin = {
name: 'excel',
version: '1.0.0',
description: 'Excel import/export plugin',

// Plugin functionality API
api: {
export: exportJsonToExcel,
},

// Install hook (optional)
install(app, options) {
console.log('Excel plugin installed');
},

// Uninstall hook (optional)
uninstall() {
console.log('Excel plugin uninstalled');
},
};
```

### 2. Register and Use Plugin

```typescript
import { usePluginManager } from '@btc/shared-core';

// Get plugin manager instance
const pluginManager = usePluginManager({
debug: true,
checkDependencies: true,
});

// Register plugin
pluginManager.register(excelPlugin);

// Set Vue app instance
pluginManager.setApp(app);

// Install plugin
await pluginManager.install('excel');

// Get plugin API
const excelApi = pluginManager.getApi('excel');
excelApi.export({ header: ['Name'], data: [['Tom']] });
```

## API Documentation

### PluginManager Class

#### Constructor

```typescript
new PluginManager(options?: PluginManagerOptions)
```

**Options:**
- `checkDependencies`: Whether to check plugin dependencies (default `true`)
- `allowOverride`: Whether to allow overriding registered plugins (default `false`)
- `debug`: Whether to enable debug logging (default `false`)

#### Methods

##### `register(plugin: Plugin): this`

Register plugin (not installed)

```typescript
pluginManager.register(excelPlugin);
```

##### `install(name: string, options?: PluginOptions): Promise<void>`

Install registered plugin

```typescript
await pluginManager.install('excel', { apiUrl: '/api' });
```

##### `uninstall(name: string): Promise<void>`

Uninstall plugin

```typescript
await pluginManager.uninstall('excel');
```

##### `get<T>(name: string): Plugin<T> | undefined`

Get plugin object

```typescript
const plugin = pluginManager.get('excel');
console.log(plugin.name, plugin.version);
```

##### `getApi<T>(name: string): T | undefined`

Get plugin API

```typescript
const excelApi = pluginManager.getApi('excel');
excelApi.export(...);
```

##### `has(name: string): boolean`

Check if plugin is registered

```typescript
if (pluginManager.has('excel')) {
// Plugin exists
}
```

##### `isInstalled(name: string): boolean`

Check if plugin is installed

```typescript
if (pluginManager.isInstalled('excel')) {
// Plugin is installed
}
```

##### `list(): string[]`

Get all registered plugin names

```typescript
const plugins = pluginManager.list();
// ['excel', 'pdf', 'upload']
```

##### `listInstalled(): string[]`

Get all installed plugin names

```typescript
const installed = pluginManager.listInstalled();
// ['excel', 'pdf']
```

##### `getStatus(name: string): PluginStatus | undefined`

Get plugin status

```typescript
const status = pluginManager.getStatus('excel');
// 'installed' | 'registered' | 'uninstalled' | 'failed'
```

##### `installAll(names: string[], options?: PluginOptions): Promise<void>`

Batch install plugins

```typescript
await pluginManager.installAll(['excel', 'pdf', 'upload']);
```

##### `remove(name: string): Promise<void>`

Remove plugin from manager

```typescript
await pluginManager.remove('excel');
```

## Complete Examples

### Create Plugin with Dependencies

```typescript
// PDF plugin depends on Excel plugin
export const pdfPlugin: Plugin = {
name: 'pdf',
version: '1.0.0',
dependencies: ['excel'], // Depends on Excel plugin

api: {
exportPdf(data) {
// Use Excel plugin functionality
const excelApi = pluginManager.getApi('excel');
// ...
},
},

install(app) {
console.log('PDF plugin installed');
},
};

// Registration order is important
pluginManager
.register(excelPlugin) // Register dependency first
.register(pdfPlugin); // Then register dependent

await pluginManager.install('excel');
await pluginManager.install('pdf'); // Will check if excel is registered
```

### Use in Vue Application

```typescript
// main.ts
import { createApp } from 'vue';
import { usePluginManager } from '@btc/shared-core';
import { excelPlugin, pdfPlugin, uploadPlugin } from './plugins';

const app = createApp(App);

// Initialize plugin manager
const pluginManager = usePluginManager({ debug: true });
pluginManager.setApp(app);

// Register all plugins
pluginManager
.register(excelPlugin)
.register(pdfPlugin)
.register(uploadPlugin);

// Install needed plugins
await pluginManager.installAll(['excel', 'upload']);

app.mount('#app');
```

### Use Plugin in Component

```vue
<script setup lang="ts">
import { usePluginManager } from '@btc/shared-core';

const pluginManager = usePluginManager();

const handleExport = () => {
// Check if plugin is available
if (!pluginManager.isInstalled('excel')) {
console.error('Excel plugin not installed');
return;
}

// Get plugin API
const excelApi = pluginManager.getApi('excel');

// Call plugin functionality
excelApi.export({
header: ['Name', 'Age'],
data: [['Tom', 25]],
filename: 'users',
});
};
</script>
```

## Plugin Interface Definition

```typescript
interface Plugin<T = any> {
name: string; // Plugin name (required)
version?: string; // Version number
description?: string; // Description
dependencies?: string[]; // Dependencies on other plugins
install?: (app: App, options?: PluginOptions) => void | Promise<void>;
uninstall?: () => void | Promise<void>;
api?: T; // Plugin functionality API
meta?: Record<string, any>; // Metadata
}
```

## Plugin Status

```typescript
enum PluginStatus {
Registered = 'registered', // Registered but not installed
Installed = 'installed', // Installed
Uninstalled = 'uninstalled', // Uninstalled
Failed = 'failed', // Installation failed
}
```

## Best Practices

### 1. Singleton Pattern

Always use `usePluginManager()` to get instance, ensuring global uniqueness

```typescript
// ✅ Recommended
const pluginManager = usePluginManager();

// ❌ Not recommended
const pluginManager = new PluginManager();
```

### 2. Chained Registration

Use chained calls to simplify code

```typescript
pluginManager
.register(excelPlugin)
.register(pdfPlugin)
.register(uploadPlugin);
```

### 3. Dependency Management

Set plugin dependencies appropriately, ensuring correct loading order

```typescript
// Plugin A depends on Plugin B
const pluginA: Plugin = {
name: 'plugin-a',
dependencies: ['plugin-b'],
};
```

### 4. Error Handling

Use try-catch to handle installation failures

```typescript
try {
await pluginManager.install('excel');
} catch (error) {
console.error('Failed to install excel plugin:', error);
}
```

### 5. Status Check

Check plugin status before use

```typescript
if (pluginManager.isInstalled('excel')) {
const api = pluginManager.getApi('excel');
api.export(...);
}
```

## FAQ

### Q: What's the difference between Plugin Manager and Vue Plugin?

**A:**
- **Vue Plugin** - Vue's official plugin system, mainly for extending Vue instances
- **PluginManager** - Business plugin management system, for managing functional modules (Excel, PDF, etc.)

Both can be used together: Vue Plugins can be registered to PluginManager

### Q: Why do we need Plugin Manager?

**A:**
- ✅ **Unified Management** - All plugins centrally managed, easy to maintain
- ✅ **On-demand Loading** - Only install needed plugins
- ✅ **Dependency Checking** - Automatically checks plugin dependencies
- ✅ **Status Tracking** - Know which plugins are installed
- ✅ **Type Safety** - TypeScript support

### Q: How to dynamically load plugins?

**A:**
```typescript
// Async import plugin
const { excelPlugin } = await import('./plugins/excel');
pluginManager.register(excelPlugin);
await pluginManager.install('excel');
```

## Future Extensions

- [ ] Plugin hot reload
- [ ] Plugin version conflict detection
- [ ] Plugin configuration persistence
- [ ] Plugin marketplace/remote loading
- [ ] Plugin permission control

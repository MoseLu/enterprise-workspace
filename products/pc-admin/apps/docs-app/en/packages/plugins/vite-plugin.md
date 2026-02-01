---
title: 'BTC Vite Plugin'
type: package
project: plugins
owner: dev-team
created: 2025-10-10
updated: 2025-10-13
publish: true
tags:
- packages
- plugins
- vite
sidebar_label: Vite Plugin
sidebar_order: 16
sidebar_group: packages
---

# BTC Vite Plugin

> BTC Micro-frontend Vite Plugin Collection

## Included Features

| Feature | Status | Documentation | Description |
| ----------- | --------- | -------- | ------------------------------ |
| **EPS** | Implemented | 12-13 | Endpoint Service (API automation) |
| **SVG** | Implemented | 11 | SVG icon processing |
| **Ctx** | Implemented | 11 | Context (module scanning) |
| **Tag** | Implemented | 11 | Component name tag |
| **Virtual** | To be implemented | 13 | Virtual module integration |
| **File** | To be implemented | 69-71 | File operation utilities |
| **Proxy** | To be implemented | 65 | Proxy configuration management |

## Usage

### Method 1: Unified Configuration (Recommended)

```typescript
import { btc } from '@btc/vite-plugin';

export default defineConfig({
plugins: [
vue(),
btc({
eps: {
enable: true,
api: '/admin/base/open/eps',
dist: 'build/eps',
},
svg: {
enable: true,
dirs: ['src/assets/icons'],
},
ctx: {
enable: true,
modulesDir: 'src/modules',
},
nameTag: true,
}),
],
});
```

### Method 2: Import on Demand

```typescript
import { epsPlugin, svgPlugin } from '@btc/vite-plugin';

export default defineConfig({
plugins: [
vue(),
epsPlugin({
epsUrl: '/admin/base/open/eps',
outputDir: 'build/eps',
}),
// svgPlugin(), // Add as needed
],
});
```

## Feature Details

### EPS (Endpoint Service)

Automatically generates API service layer from backend:

```typescript
// Auto-generated
import { service } from 'virtual:eps';

// Usage
await service.user.list({ page: 1 });
await service.order.create({ name: 'xxx' });
```

### SVG Icons

Automatically scans and optimizes SVG files, generates SVG sprites:

```vue
<template>
<!-- Use icon- prefix to reference icons -->
<svg><use href="#icon-user-avatar"></use></svg>
<svg><use href="#icon-order-cart"></use></svg>
</template>

<script setup>
import 'virtual:svg-icons'; // Auto-injected
</script>
```

**Features**:

- Automatically scans all `.svg` files in `src/` directory
- Uses `svgo` to optimize SVG code
- Automatically generates icon names based on module names (e.g., `user/avatar.svg` → `icon-user-avatar`)
- Supports skipping specific module names

### Ctx Context

Automatically scans modules and retrieves context information:

```typescript
import ctx from 'virtual:ctx';

console.log(ctx.modules); // ['user', 'order', 'product']
console.log(ctx.serviceLang); // 'Node' | 'Java'
```

**Features**:

- Automatically scans `src/modules/` directory
- Gets all module name lists
- Gets service language type from backend API (optional)

### Tag

Automatically adds name attribute to Vue components:

```vue
<script setup lang="ts" name="UserList">
// Tag plugin automatically converts to:
// <script lang="ts">
// export default defineComponent({ name: "UserList" })
// </script>
</script>
```

**Features**:

- Supports `<script setup name="ComponentName">` syntax
- Used for Vue DevTools to display component names
- Supports keep-alive cache

## Implementation Plan

Current progress: 15/76

**Completed**:

- EPS base plugin (docs 12-13)
- SVG icon plugin (doc 11)
- Ctx context plugin (doc 11)
- Tag plugin (doc 11)

**To be implemented** (in document order):

- Docs 13-14: EPS improvements
- Docs 21-23: Business plugins (Excel, PDF, Upload)
- Doc 65: Proxy configuration
- Docs 69-71: CLI tools

## Testing

Check `apps/test-app` test application examples:

```bash
cd apps/test-app
pnpm dev
# Access http://localhost:3100
```

Test content:

- SVG icon display
- Ctx module scanning
- Tag component naming

---

**Reference Cool-Admin architecture, complete implementation of all features!**

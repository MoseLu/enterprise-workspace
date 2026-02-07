---
title: "Breadcrumb Component"
type: api
project: layout
owner: dev-team
created: 2025-10-11
updated: 2025-10-11
publish: true
tags: ["layout"]
sidebar_label: "Breadcrumb Component"
sidebar_order: 4
sidebar_collapsed: false
sidebar_group: "Layout Components"
---
# Breadcrumb Component

## Description

Breadcrumb navigation component that displays the current page's hierarchical position in the application

## Features

### Application Isolation
- Each micro app's breadcrumb is independently generated
- Breadcrumb automatically updates when switching apps
- Breadcrumb paths do not cross applications

### Smart Route Mapping
- Automatically generates breadcrumb from route path
- Supports internationalization (dynamic language switching)
- Last level is not clickable (current page)

### Consistency
- Height consistent with tab process bar (40px)
- Style unified with overall layout
- Responsive design

## Props

No props needed, automatically generated based on routes

## Events

No events

## Usage Example

```vue
<template>
<Breadcrumb />
</template>

<script setup lang="ts">
import Breadcrumb from '@/layout/breadcrumb'
</script>
```

## Breadcrumb Generation Rules

### Main App
```
Home: System Management
Domain List: System Management / Permission Management / Domain List
```

### Sub Apps
```
Logistics Home: Logistics App
Order Management: Logistics App / Order Management
```

## Path Mapping Configuration

### Main App Paths
```typescript
const mainAppPathMap = {
'/system/permission/domain': 'menu.system.permission.domain',
'/crud': 'menu.business_components.crud',
// ...
}
```

### Sub App Paths
```typescript
const subAppPathMap = {
'logistics': {
'/logistics/orders': 'menu.logistics.orders',
// ...
},
// ...
}
```

## Style Customization

### Breadcrumb Height
```scss
.app-breadcrumb {
min-height: 40px;
height: 40px;
padding: 5px 10px;
margin-bottom: 10px; // Spacing with content area
}
```

### Text Color
```scss
.el-breadcrumb__inner {
color: var(--el-text-color-regular); // Normal level

&:hover {
color: var(--el-color-primary); // Hover
}
}

// Last level (current page)
&:last-child .el-breadcrumb__inner {
color: var(--el-text-color-primary);
font-weight: 500;
}
```

## Internationalization Support

Uses the following i18n keys:
- `menu.system.*` - Main app menu
- `menu.logistics.*` - Logistics app menu
- `menu.engineering.*` - Engineering app menu
- `menu.quality.*` - Quality app menu
- `menu.production.*` - Production app menu
- `micro_app.*.title` - App name

## Notes

1. **Application Isolation**: Breadcrumb only displays current app's path
2. **Last Level**: Current page is not clickable (path is undefined)
3. **Home Handling**: Main app home doesn't show extra breadcrumb
4. **Path Synchronization**: Needs to be consistent with route configuration and menu

## Extensibility

To add new paths, update the mapping in the `breadcrumbList` computed property:

```typescript
const mainAppPathMap: Record<string, string> = {
'/new/path': 'menu.new.path',
// ...
}
```

## Related Components

- [Process](../process/README.md) - Tab process bar
- [DynamicMenu](../dynamic-menu/README.md) - Dynamic menu

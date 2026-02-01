---
title: BtcViewGroup Component
type: package
project: components
owner: dev-team
created: '2025-10-12'
updated: '2025-10-13'
publish: true
tags:
- packages
- components
- view-group
sidebar_label: BtcViewGroup
sidebar_order: 9
sidebar_group: packages
---
# BtcViewGroup Component

## Overview

Left-right split panel component, implemented with reference to cool-admin's `cl-view-group`. Commonly used for **left tree menu/list + right CRUD table** layout scenarios, such as user management, department management, etc.

## Features

- Left-right split panel layout
- Left side supports tree structure or list
- Responsive design (auto-collapse on mobile)
- Keyword search
- Lazy loading (infinite scroll)
- Refresh/add/right-click menu
- Fully customizable slots

## Basic Usage

```vue
<template>
<BtcViewGroup ref="viewGroupRef">
<template #left>
<!-- Left content (custom) -->
<dept-list @select="handleSelect" />
</template>

<template #right>
<!-- Right content -->
<BtcCrud :service="service">
<BtcTable :columns="columns" />
</BtcCrud>
</template>
</BtcViewGroup>
</template>

<script setup lang="ts">
const viewGroupRef = ref();
const service = {}; // Your service

function handleSelect(item: any) {
// Handle when left item is selected
}
</script>
```

## Using Service (Auto Tree/List)

When `#left` slot is not provided, the component will automatically render left content based on configuration:

```vue
<template>
<BtcViewGroup :options="viewGroupOptions">
<template #right>
<BtcCrud :service="userService">
<BtcTable :columns="userColumns" />
</BtcCrud>
</template>
</BtcViewGroup>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const viewGroupOptions = reactive({
label: 'Department',
title: 'User List',
leftWidth: '300px',
service: deptService, // Department service
enableRefresh: true,
enableAdd: true,
enableKeySearch: true,
tree: {
visible: true, // Tree structure
props: {
label: 'name',
children: 'children'
}
},
onSelect(item) {
// When department is selected, refresh right user list
userCrud.refresh({ deptId: item.id });
}
});
</script>
```

## Props

### Options Configuration

| Parameter | Description | Type | Default |
|------|------|------|--------|
| label | Left title | string | 'Group' |
| title | Right title | string | 'List' |
| leftWidth | Left width | string | '300px' |
| data | Additional request parameters | object | {} |
| service | Service object (needs list/page methods) | object | - |
| enableContextMenu | Enable right-click menu | boolean | true |
| enableRefresh | Enable refresh button | boolean | true |
| enableKeySearch | Enable keyword search | boolean | true |
| enableDrag | Enable drag sorting (tree only) | boolean | false |
| enableEdit | Show edit in right-click menu | boolean | true |
| enableDelete | Show delete in right-click menu | boolean | true |
| custom | Whether right side is custom (no left selection required) | boolean | false |
| tree | Tree configuration | object | - |
| onSelect | Selection callback | (item) => void | - |
| onEdit | Edit callback | (item?) => void | - |
| onDelete | Delete callback | (item, {next}) => void | - |
| onData | Data processing callback | (list) => list | - |
| onContextMenu | Right-click menu callback | (item) => object | - |

### Tree Configuration

| Parameter | Description | Type | Default |
|------|------|------|--------|
| visible | Whether to show tree | boolean | false |
| lazy | Whether to lazy load | boolean | false |
| props.label | Label field | string | 'name' |
| props.children | Children field | string | 'children' |
| props.disabled | Disabled field | string | 'disabled' |
| props.isLeaf | Leaf node field | string | 'isLeaf' |
| props.id | ID field (for selection state) | string | 'id' |
| onLoad | Lazy load callback | Function | - |
| allowDrag | Drag rule (returns whether dragging is allowed) | (node) => boolean | - |
| allowDrop | Drop rule (returns whether dropping is allowed) | (draggingNode, dropNode, type) => boolean | - |

## Events

| Event Name | Description | Callback Parameters |
|--------|------|----------|
| update:selected | Selection changed | item |
| refresh | Refresh completed | params |

## Slots

| Slot Name | Description | Scope |
|--------|------|--------|
| left | Left side fully custom | - |
| left-op | Left header operation area | - |
| right | Right content area | - |
| right-op | Right header operation area | - |
| title | Right title | { selected } |
| item | Left list item | { item, selected, index } |
| item-name | Left item name | { item, selected, index } |

## Expose

| Method/Property | Description | Type |
|-----------|------|------|
| list | Left list data | Ref\<any[]\> |
| selected | Current selected item | Ref\<any\> |
| isExpand | Whether expanded | Ref\<boolean\> |
| expand | Expand/collapse | (val?: boolean) => void |
| select | Select item | (item) => void |
| refresh | Refresh left list | (params?) => Promise |
| edit | Edit item | (item?) => void |
| remove | Remove item | (item) => void |

## Examples

### User Management (Department Tree + User Table)

```vue
<template>
<BtcViewGroup ref="ViewGroup">
<template #left>
<dept-tree @select="handleDeptSelect" />
</template>

<template #right>
<BtcCrud ref="userCrud" :service="userService">
<BtcCrudRow>
<BtcRefreshBtn />
<BtcAddBtn />
<BtcMultiDeleteBtn />
<BtcCrudFlex1 />
<BtcCrudSearchKey placeholder="Search username" />
</BtcCrudRow>

<BtcCrudRow>
<BtcTable :columns="userColumns" />
</BtcCrudRow>

<BtcCrudRow>
<BtcCrudFlex1 />
<BtcPagination />
</BtcCrudRow>

<BtcUpsert :form-items="userFormItems" />
</BtcCrud>
</template>
</BtcViewGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const ViewGroup = ref();
const userCrud = ref();

function handleDeptSelect(dept: any) {
// Refresh user list based on department ID
userCrud.value?.refresh({ deptId: dept.id, page: 1 });
}
</script>
```

### Auto Render Left Tree List

```vue
<template>
<BtcViewGroup :options="options">
<template #right>
<BtcCrud ref="Crud" :service="userService">
<!-- CRUD content -->
</BtcCrud>
</template>
</BtcViewGroup>
</template>

<script setup lang="ts">
const options = {
label: 'Department',
title: 'User List',
service: deptService,
tree: {
visible: true,
props: {
label: 'name',
children: 'children'
}
},
onSelect(dept) {
Crud.value?.refresh({ deptId: dept.id });
}
};
</script>
```

### Custom Left Item Rendering

```vue
<template>
<BtcViewGroup :options="options">
<template #item-name="{ item, selected }">
<el-icon><Folder /></el-icon>
<span>{{ item.name }}</span>
<el-tag v-if="item.count" size="small">{{ item.count }}</el-tag>
</template>

<template #right>
<!-- Right content -->
</template>
</BtcViewGroup>
</template>
```

### Lazy Load Tree Structure

```vue
<script setup lang="ts">
const options = {
label: 'Menu',
title: 'Details',
service: menuService,
tree: {
visible: true,
lazy: true,
props: {
label: 'title',
children: 'children',
isLeaf: 'leaf'
},
async onLoad(node, resolve) {
if (node.level === 0) {
return resolve([/* root nodes */]);
}

const children = await menuService.list({ parentId: node.data.id });
resolve(children);
}
}
};
</script>
```

### Advanced Drag Rules

```vue
<script setup lang="ts">
const options = {
label: 'Department',
title: 'User List',
service: departmentService,
enableDrag: true,
tree: {
visible: true,
props: {
label: 'name',
children: 'children',
},
// Don't allow dragging first-level nodes
allowDrag: (node) => {
return node.data.parentId !== null;
},
// Only allow same-level dragging
allowDrop: (draggingNode, dropNode, type) => {
return draggingNode.data.parentId === dropNode.data.parentId;
}
},
onDragEnd(newList) {
// Save new order
departmentService.updateOrder(newList);
}
};
</script>
```

### Delete Confirmation and Special Logic

```vue
<script setup lang="ts">
import { BtcConfirm } from '@btc/shared-components';
const options = {
label: 'Department',
service: departmentService,
tree: { visible: true },

// Special handling when deleting department
onDelete(dept, { next, done }) {
BtcConfirm(
`When deleting "${dept.name}", how to handle users in this department?`,
'Tip',
{
confirmButtonText: 'Delete directly',
cancelButtonText: 'Transfer users',
distinguishCancelAndClose: true,
type: 'warning'
}
)
.then(() => {
// Delete directly
next({ ids: [dept.id], deleteUsers: true });
})
.catch((action) => {
if (action === 'cancel') {
// Transfer users to parent department
next({ ids: [dept.id], deleteUsers: false });
} else {
done(); // Cancel operation
}
});
}
};
</script>
```

### Mobile Adaptation

The component automatically detects screen size:

- **Desktop** (> 768px): Left-right split panel
- **Mobile** (≤ 768px): Left side hidden by default, floating button in bottom-right corner, click to expand left side

## Differences from cool-admin cl-view-group

| Feature | cl-view-group | BtcViewGroup |
|------|---------------|--------------|
| Basic Functionality | ✓ | ✓ |
| Tree Structure | ✓ | ✓ |
| Lazy Loading | ✓ | ✓ |
| Responsive | ✓ | ✓ |
| Right-click Menu | Built-in | Simplified (external needed) |
| Form Editing | Built-in cl-form | External implementation needed |
| Dependencies | cool-vue/crud | Independent |

**Note**: `BtcViewGroup` simplifies right-click menu and editing functionality, requiring external coordination. The purpose is:

1. **Reduce dependencies**: Not forced to bind to specific form components
2. **Flexibility**: You can use any form component (el-dialog + el-form, BtcUpsert, etc.)
3. **Consistency**: Consistent with other component styles in BTC project

## Style Customization

The component uses CSS variables, automatically adapting to Element Plus theme:

```scss
.btc-view-group {
--left-width: 300px; // Left width

&__left {
background-color: var(--el-bg-color);
border-right: 1px solid var(--el-border-color-extra-light);
}

.item.is-active {
background-color: var(--el-color-primary);
color: #fff;
}
}
```

## Notes

1. **Service Requirements**:
- **Tree data**: Needs `list()` method, returns tree array
- **List data**: Needs `page()` method, returns `{ list, pagination }`

2. **Custom Left**: When `#left` slot is provided, `service` configuration is invalid

3. **Right-click Menu**: Simplified version, recommend using external context menu component

4. **Edit Functionality**: Need to implement form dialog in `config.onEdit` callback

## Related Components

- [BtcCrud](../../crud/README.md) - CRUD context container
- [BtcDialog](../dialog/index.vue) - Enhanced dialog component
- [BtcUpsert](../../crud/upsert/index.vue) - Form component

---
title: BtcMasterTableGroup Component
type: package
project: components
owner: dev-team
created: '2025-01-27'
updated: '2025-01-27'
publish: true
tags:
- packages
- components
- master-table-group
sidebar_label: BtcMasterTableGroup
sidebar_order: 9
sidebar_group: packages
---

# BtcMasterTableGroup Component

`BtcMasterTableGroup` is an enhanced composite component that builds on `BtcDoubleLayout`, with `BtcMasterList` built-in as left content and `BtcCrud` built-in as right content, aiming to provide an out-of-the-box "left tree right table" linkage solution.

## Features

- **Left MasterList**: Supports tree or list data display, built-in "Unassigned" option, supports default selection.
- **Right CRUD Table**: Provides complete CRUD functionality (add, delete, update, query, pagination, search).
- **Auto Linkage**: When left selection changes, automatically refreshes right table data and intelligently passes parameters.
- **Parameter Standardization**: Automatically passes left selected item's ID as `keyword` to right `page` request, ensuring request parameter format meets backend requirements.
- **Data Sharing**: Left list data automatically injected into right form's cascade selectors.
- **Single Responsibility**: Only responsible for layout and basic state management, specific business handled by user
- **Flexible Configuration**: Supports custom left and right content

## Basic Usage

### Simple Usage (Recommended)

```vue
<template>
  <BtcMasterTableGroup
    ref="tableGroupRef"
    :left-service="services.sysdepartment"
    :right-service="services.sysuser"
    :table-columns="userColumns"
    :form-items="getUserFormItems()"
    left-title="Department List"
    right-title="User List"
    search-placeholder="Search users"
    :show-unassigned="true"
    unassigned-label="Unassigned"
    @select="handleDepartmentSelect"
    @refresh="handleRefresh"
  />
</template>

<script setup lang="ts">
import { BtcMasterTableGroup } from '@btc/shared-components';
import { userColumns, getUserFormItems, services } from './config';

const tableGroupRef = ref();

// Handle department selection (optional, for logging or other processing)
const handleDepartmentSelect = (item: any, keyword?: any) => {
  console.log('Selected department:', item, 'Keyword:', keyword);
};

// Handle refresh event (optional)
const handleRefresh = (params?: any) => {
  console.log('Refresh params:', params);
};
</script>
```

### Automatic Parameter Passing

`BtcMasterTableGroup` automatically handles parameter passing for left and right services, ensuring both use the same object format:

#### Left Service (list request)
```typescript
// Left department list request parameters
{
  "order": "createdAt",
  "sort": "asc",
  "page": 1,
  "size": 50,
  "keyword": "",
  "status": "ACTIVE" // From leftParams
}
```

#### Right Service (page request)
- **Normal Department**: Passes selected department's ID as `keyword` to right `page` request
- **Unassigned Department**: Clears `keyword`, letting backend return all data

```typescript
// Right user list request parameters
{
  "order": "createdAt",
  "sort": "asc",
  "page": 1,
  "size": 20,
  "keyword": "Department ID or ID array" // Automatically passed
}
```

### Custom Left Content

```vue
<template>
  <BtcMasterTableGroup :right-service="services.sysuser">
    <template #left>
      <!-- Fully custom left content, e.g., a custom department tree -->
      <CustomDepartmentTree @select="handleCustomSelect" />
    </template>
    <template #right="{ selected, crud }">
      <!-- Right content can access left selected item and built-in crud instance -->
      <CustomUserTable :department-id="selected?.id" :crud-instance="crud" />
    </template>
  </BtcTableGroup>
</template>

<script setup lang="ts">
import { BtcMasterTableGroup } from '@btc/shared-components';
import CustomDepartmentTree from './CustomDepartmentTree.vue';
import CustomUserTable from './CustomUserTable.vue';
import { services } from './config';

const handleCustomSelect = (item: any) => {
  // Handle custom left component selection logic
  // Can manually call tableGroupRef.value.crudRef.refresh() to refresh right table
};
</script>
```

## Props

| Parameter | Description | Type | Default |
|------|------|------|--------|
| leftService | Left service object | `any` | - |
| leftTitle | Left title | `string` | `'List'` |
| rightService | Right service object | `any` | - |
| rightTitle | Right title | `string` | `'Details'` |
| tableColumns | Table column configuration | `any[]` | - |
| formItems | Form item configuration | `any[]` | - |
| idField | ID field name | `string` | `'id'` |
| labelField | Label field name | `string` | `'name'` |
| parentField | Parent field name | `string` | `'parentId'` |
| enableDrag | Whether to enable drag sorting | `boolean` | `false` |
| showUnassigned | Whether to show "Unassigned" group | `boolean` | `false` |
| unassignedLabel | "Unassigned" group label | `string` | `'Unassigned'` |
| leftWidth | Left width | `string` | `'300px'` |
| upsertWidth | Add/edit dialog width | `string \| number` | `800` |
| searchPlaceholder | Search box placeholder | `string` | `'Search'` |

## Events

| Event Name | Description | Parameters |
|--------|------|------|
| select | Triggered when left selection changes | `(item: any, keyword?: any)` |
| update:selected | Triggered when left selection changes (v-model support) | `(value: any)` |
| refresh | Refresh event | `(params?: any)` |
| form-submit | Triggered when form is submitted | `(data: any, event: { close: () => void; done: () => void; next: (data: any) => Promise<any>; defaultPrevented: boolean })` |
| load | Triggered when left data loading completes | `(data: any[])` |

## Expose

| Property | Description | Type |
|------|------|------|
| viewGroupRef | `BtcViewGroup` component instance reference | `any` |
| crudRef | `BtcCrud` component instance reference | `any` |
| refresh | Refresh entire component (including left MasterList and right CRUD) | `(params?: any) => Promise<void>` |

## Data Sharing Mechanism

`BtcMasterTableGroup` implements data sharing through the following mechanisms:

1. **Left Data Auto Injection**: Left list data automatically injected into right form's cascade selectors
2. **Parameter Auto Passing**: Left selected item's ID automatically passed as `keyword` to right `page` request
3. **Form Auto Fill**: Add/edit form automatically fills current selected department ID

## Use Cases

### 1. Department-User Management
```vue
<BtcTableGroup
  :left-service="services.sysdepartment"
  :right-service="services.sysuser"
  :table-columns="userColumns"
  :form-items="userFormItems"
  left-title="Department List"
  right-title="User List"
  :show-unassigned="true"
/>
```

### 2. Category-Product Management
```vue
<BtcTableGroup
  :left-service="services.category"
  :right-service="services.product"
  :table-columns="productColumns"
  :form-items="productFormItems"
  left-title="Category List"
  right-title="Product List"
  :show-unassigned="true"
/>
```

### 3. Role-Permission Management
```vue
<BtcTableGroup
  :left-service="services.role"
  :right-service="services.permission"
  :table-columns="permissionColumns"
  :form-items="permissionFormItems"
  left-title="Role List"
  right-title="Permission List"
  :show-unassigned="true"
/>
```

## Notes

1. **Service Object Format**: Left service must provide `list` method, right service must provide `page`, `add`, `update`, `delete` methods
2. **Parameter Format**: All service calls automatically construct standard parameter objects, containing `order`, `sort`, `page`, `size`, `keyword` and other fields
3. **Data Linkage**: When left selection changes, right table automatically refreshes, no manual handling needed
4. **Form Integration**: Cascade selectors in right form automatically use left data, no additional configuration needed

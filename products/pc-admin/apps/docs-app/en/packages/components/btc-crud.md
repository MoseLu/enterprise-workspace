---
title: BTC CRUD Component System
type: package
project: components
owner: dev-team
created: 2025-10-11
updated: 2025-10-13
publish: true
tags:
- packages
- components
- crud
sidebar_label: BTC CRUD
sidebar_order: 4
sidebar_group: packages
---
# BTC CRUD Component System

## Design Philosophy

Adopts **context-driven + free composition** architecture, fully aligned with cool-admin-vue design:

- `<BtcCrud>` provides context container (no UI rendering)
- All child components obtain CRUD state via `inject`
- Developers have **complete freedom** to compose layouts

## Component List

### Core Components

| Component | Description | Corresponds to cool-admin |
|------|------|----------------|
| `<BtcCrud>` | Context container | `<cl-crud>` |
| `<BtcTable>` | Table component | `<cl-table>` |
| `<BtcUpsert>` | Create/Edit dialog | `<cl-upsert>` |
| `<BtcPagination>` | Pagination component | `<cl-pagination>` |

### Button Components

| Component | Description | Corresponds to cool-admin |
|------|------|----------------|
| `<BtcAddBtn>` | Add button | `<cl-add-btn>` |
| `<BtcRefreshBtn>` | Refresh button | `<cl-refresh-btn>` |
| `<BtcMultiDeleteBtn>` | Batch delete button | `<cl-multi-delete-btn>` |

### Auxiliary Components

| Component | Description | Corresponds to cool-admin |
|------|------|----------------|
| `<BtcCrudRow>` | Row layout | `<cl-row>` |
| `<BtcCrudFlex1>` | Flex space | `<cl-flex1>` |
| `<BtcCrudSearchKey>` | Search box | `<cl-search-key>` |

---

## Quick Start

### Basic Example

```vue
<template>
<BtcCrud :service="userService">
<!-- Toolbar -->
<BtcCrudRow>
<BtcAddBtn />
<BtcMultiDeleteBtn />
<BtcRefreshBtn />
<BtcCrudFlex1 />
<BtcCrudSearchKey placeholder="Search username or name" />
</BtcCrudRow>

<!-- Table -->
<BtcCrudRow>
<BtcTable :columns="columns">
<!-- Custom column -->
<template #column-status="{ row }">
<el-tag :type="row.status === 1 ? 'success' : 'danger'">
{{ row.status === 1 ? 'Enabled' : 'Disabled' }}
</el-tag>
</template>

<!-- Custom action buttons -->
<template #slot-custom="{ row }">
<el-button link @click="handleCustom(row)">Custom</el-button>
</template>
</BtcTable>
</BtcCrudRow>

<!-- Pagination -->
<BtcCrudRow>
<BtcCrudFlex1 />
<BtcPagination />
</BtcCrudRow>

<!-- Create/Edit dialog -->
<BtcUpsert :items="formItems" />
</BtcCrud>
</template>

<script setup lang="ts">
import {
BtcCrud,
BtcTable,
BtcUpsert,
BtcPagination,
BtcAddBtn,
BtcRefreshBtn,
BtcMultiDeleteBtn,
BtcCrudRow,
  BtcCrudFlex1,
  BtcCrudSearchKey,
type TableColumn,
type FormItem,
} from '@btc/shared-components';

// Define service
const userService = {
page: async (params) => ({
list: [{ id: 1, name: 'John', status: 1 }],
total: 1,
}),
add: async (data) => ({}),
update: async (data) => ({}),
delete: async ({ ids }) => ({}),
};

// Table column configuration
const columns: TableColumn[] = [
{ type: 'selection', width: 60 },
{ prop: 'id', label: 'ID', width: 80 },
{ prop: 'name', label: 'Name', minWidth: 120 },
{ prop: 'status', label: 'Status', width: 100 },
{
type: 'op',
label: 'Actions',
width: 200,
buttons: ['info', 'edit', 'slot-custom', 'delete']
},
];

// Form item configuration
const formItems: FormItem[] = [
{
prop: 'name',
label: 'Name',
required: true,
component: {
name: 'el-input',
},
},
{
prop: 'status',
label: 'Status',
value: 1,
component: {
name: 'el-radio-group',
options: [
{ label: 'Enabled', value: 1 },
{ label: 'Disabled', value: 0 },
],
},
},
];

const handleCustom = (row: any) => {
console.log('Custom action:', row);
};
</script>
```

---

## Component Details

### 1. BtcCrud - Context Container

**Props:**
- `service`: CrudService (required)
- `options`: CrudOptions (optional, passed to useCrud)
- `border`: boolean (whether to show border)
- `padding`: string (padding)

**Expose:**
- `crud`: Complete CRUD instance

**Example:**
```vue
<BtcCrud
ref="crudRef"
:service="service"
:options="{ onSuccess: (msg) => BtcMessage.success(msg) }"
>
<!-- Child components -->
</BtcCrud>

<script setup>
const crudRef = ref();

// Access CRUD instance
const refresh = () => {
crudRef.value?.crud.loadData();
};
</script>
```

---

### 2. BtcTable - Table Component

**Props:**
- `columns`: TableColumn[] (column configuration)
- Other attributes are passed through to `el-table`

**Slots:**
- `column-{prop}`: Custom column rendering
- `op-buttons`: Custom operation column
- `slot-{name}`: Custom operation buttons

**TableColumn Configuration:**
```typescript
interface TableColumn {
type?: 'selection' | 'index' | 'op'; // Column type
prop?: string; // Field name
label?: string; // Column title
width?: number; // Width
minWidth?: number; // Minimum width
align?: 'left' | 'center' | 'right';
sortable?: boolean; // Sortable

// Rendering
formatter?: (row, column, cellValue, index) => string;
component?: {
name: string | Component;
props?: Record<string, any>;
};

// Operation column
buttons?: OpButton[] | ((options: { scope: any }) => OpButton[]);
}

// Operation button type
type OpButton =
| 'edit' | 'delete' | 'info' // Predefined
| `slot-${string}` // Slot
| { // Custom
label: string;
type?: string;
onClick?: (options: { scope: any }) => void;
};
```

---

### 3. BtcUpsert - Create/Edit Dialog

**Props:**
- `items`: FormItem[] (form item configuration)
- `width`: string (dialog width)
- `labelWidth`: string (label width)
- `onSubmit`: (data, { close, done }) => void (submit callback)
- `onOpen`: (data) => void (open callback)

**Slots:**
- `item-{prop}`: Custom form items
- `footer`: Custom footer buttons

**FormItem Configuration:**
```typescript
interface FormItem {
prop: string;
label: string;
required?: boolean;
span?: number; // Grid layout
value?: any; // Default value

component?: {
name: string | Component;
props?: Record<string, any>;
options?: any[]; // Options (select/radio/checkbox)
};

rules?: any | any[]; // Validation rules
}
```

---

### 4. Button Components

**BtcAddBtn / BtcRefreshBtn / BtcMultiDeleteBtn**

```vue
<BtcAddBtn type="primary" text="Add User">
<template #default>
<el-icon><Plus /></el-icon> Add
</template>
</BtcAddBtn>

<BtcMultiDeleteBtn text="Batch Delete" />
<BtcRefreshBtn />
```

---

### 5. Auxiliary Components

**BtcCrudRow** - Row layout
```vue
<BtcCrudRow margin-bottom="20px" align="flex-start">
<BtcAddBtn />
<BtcRefreshBtn />
</BtcCrudRow>
```

**BtcCrudFlex1** - Flex space (takes remaining space)
```vue
<BtcCrudRow>
<BtcAddBtn />
<BtcCrudFlex1 /> <!-- Takes remaining space -->
<BtcCrudSearchKey />
</BtcCrudRow>
```

**BtcCrudSearchKey** - Search box
```vue
<BtcCrudSearchKey
placeholder="Search keyword"
field="keyword" <!-- Search field name -->
/>
```

---

## Advanced Usage

### 1. Completely Free Layout

```vue
<BtcCrud :service="service">
<!-- First row: Main actions -->
<BtcCrudRow>
<BtcAddBtn />
<BtcMultiDeleteBtn />
<el-button type="success">Export</el-button>
<el-button type="warning">Import</el-button>
</BtcCrudRow>

<!-- Second row: Search area -->
<BtcCrudRow>
<el-form inline>
<el-form-item label="Status">
<el-select v-model="searchForm.status">
<el-option label="All" :value="null" />
<el-option label="Enabled" :value="1" />
</el-select>
</el-form-item>
</el-form>
<BtcCrudFlex1 />
<BtcCrudSearchKey />
</BtcCrudRow>

<!-- Third row: Table -->
<BtcCrudRow>
<BtcTable :columns="columns" stripe border />
</BtcCrudRow>

<!-- Fourth row: Pagination -->
<BtcCrudRow>
<BtcCrudFlex1 />
<BtcPagination />
</BtcCrudRow>

<!-- Dialog -->
<BtcUpsert :items="formItems" />
</BtcCrud>
```

### 2. Custom Operation Column

```typescript
const columns: TableColumn[] = [
// ...
{
type: 'op',
label: 'Actions',
width: 300,
buttons: ({ scope }) => {
// Dynamically generate buttons based on row data
const btns: OpButton[] = ['info', 'edit'];

if (scope.row.canDelete) {
btns.push('delete');
}

if (scope.row.isOwner) {
btns.push('slot-transfer'); // Custom slot
}

return btns;
},
},
];
```

```vue
<BtcTable :columns="columns">
<template #slot-transfer="{ row }">
<el-button link type="success" @click="handleTransfer(row)">
Transfer
</el-button>
</template>
</BtcTable>
```

### 3. Dynamic Form Items

```typescript
const formItems: FormItem[] = [
{
prop: 'name',
label: 'Name',
required: true,
span: 12, // Half width
},
{
prop: 'type',
label: 'Type',
span: 12,
component: {
name: 'el-select',
options: [
{ label: 'Type 1', value: 1 },
{ label: 'Type 2', value: 2 },
],
},
},
// Functional form items (dynamically displayed based on conditions)
() => {
if (formData.value.type === 1) {
return {
prop: 'extra',
label: 'Extra Field',
component: { name: 'el-input' },
};
}
return null;
},
];
```

### 4. Access CRUD Instance

```vue
<template>
<BtcCrud ref="crudRef" :service="service">
<BtcTable :columns="columns" />
<el-button @click="customRefresh">Custom Refresh</el-button>
</BtcCrud>
</template>

<script setup lang="ts">
const crudRef = ref();

const customRefresh = () => {
// Access complete CRUD instance
const crud = crudRef.value?.crud;

crud.setParams({ status: 1 }); // Set parameters
crud.loadData(); // Refresh data

console.log(crud.selection.value); // Access selected rows
console.log(crud.pagination); // Access pagination info
};
</script>
```

---

## Complete Example

```vue
<template>
<BtcCrud ref="Crud" :service="userService">
<!-- Toolbar -->
<BtcCrudRow>
<BtcRefreshBtn />
<BtcAddBtn />
<BtcMultiDeleteBtn />
<el-button type="success" :disabled="Table?.selection.length === 0" @click="handleMove">
Transfer
</el-button>
<BtcCrudFlex1 />
<BtcCrudSearchKey placeholder="Search username or name" />
</BtcCrudRow>

<!-- Table -->
<BtcCrudRow>
<BtcTable ref="Table" :columns="columns">
<!-- Custom operation buttons -->
<template #slot-move="{ row }">
<el-button link type="warning" @click="handleMove(row)">
Transfer
</el-button>
</template>
</BtcTable>
</BtcCrudRow>

<!-- Pagination -->
<BtcCrudRow>
<BtcCrudFlex1 />
<BtcPagination />
</BtcCrudRow>

<!-- Create/Edit dialog -->
<BtcUpsert
ref="Upsert"
:items="formItems"
width="800px"
@open="handleFormOpen"
/>
</BtcCrud>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCore } from '@btc/shared-core';
import {
BtcCrud,
BtcTable,
BtcUpsert,
BtcPagination,
BtcAddBtn,
BtcRefreshBtn,
BtcMultiDeleteBtn,
BtcCrudRow,
  BtcCrudFlex1,
  BtcCrudSearchKey,
type TableColumn,
type FormItem,
} from '@btc/shared-components';

const { service } = useCore();
const userService = service.user;

const Crud = ref();
const Table = ref();
const Upsert = ref();

// Table column configuration
const columns: TableColumn[] = [
{ type: 'selection', width: 60 },
{ prop: 'username', label: 'Username', minWidth: 150 },
{ prop: 'name', label: 'Name', minWidth: 120 },
{ prop: 'phone', label: 'Phone', minWidth: 120 },
{ prop: 'status', label: 'Status', width: 100 },
{
type: 'op',
label: 'Actions',
width: 270,
buttons: ['slot-move', 'edit', 'delete']
},
];

// Form item configuration
const formItems: FormItem[] = [
{
prop: 'name',
label: 'Name',
span: 12,
required: true,
component: { name: 'el-input' },
},
{
prop: 'username',
label: 'Username',
span: 12,
required: true,
component: { name: 'el-input' },
},
{
prop: 'phone',
label: 'Phone',
span: 12,
component: { name: 'el-input' },
},
{
prop: 'status',
label: 'Status',
value: 1,
span: 12,
component: {
name: 'el-radio-group',
options: [
{ label: 'Enabled', value: 1 },
{ label: 'Disabled', value: 0 },
],
},
},
];

const handleFormOpen = (data: any) => {
console.log('Form opened:', data);
};

const handleMove = (row?: any) => {
const ids = row ? [row.id] : Table.value?.selection.map((e: any) => e.id) || [];
console.log('Transfer users:', ids);
};
</script>
```

---

## Core Advantages

### 1. **Complete Layout Freedom**
- ✨ No forced layout structure
- ✨ Can insert any component at any position
- ✨ Fully consistent with cool-admin-vue

### 2. **Context Sharing**
```typescript
// All child components automatically access CRUD state
const crud = inject('btc-crud');

crud.tableData // Table data
crud.loading // Loading state
crud.selection // Selected rows
crud.handleAdd() // Add
crud.handleEdit(row) // Edit
```

### 3. **Type Safety**
- ✨ Complete TypeScript support
- ✨ All methods have type hints
- ✨ Compile-time error checking

### 4. **Progressive Enhancement**
```vue
<!-- Simplest: Only table -->
<BtcCrud :service="service">
<BtcTable :columns="columns" />
</BtcCrud>

<!-- Advanced: Add toolbar -->
<BtcCrud :service="service">
<BtcCrudRow>
<BtcAddBtn />
<BtcRefreshBtn />
</BtcCrudRow>
<BtcTable :columns="columns" />
</BtcCrud>

<!-- Complete: Add all features -->
<!-- See complete example above -->
```

---

## Comparison with cool-admin-vue

| Dimension | cool-admin-vue | BTC CRUD |
|------|---------------|----------|
| **Architecture** | Context components | ✨ **Fully consistent** |
| **Flexibility** | Complete layout freedom | ✨ **Fully consistent** |
| **Component Count** | 15+ | ✨ **10+ (growing)** |
| **Type Safety** | ✨ Partial | ✨ **Complete** |
| **Usage** | `<cl-crud>` | `<BtcCrud>` |

**✨ Our new design is fully aligned with cool-admin-vue architecture!**

---

## Related Documentation

- [useCrud API](../../../shared-core/src/btc/crud/README.md)
- [Feature Comparison Table](../../../../implementation-docs/CRUD-FEATURE-COMPARISON.md)
- [Event System Analysis](../../../../implementation-docs/EVENT-SYSTEM-ANALYSIS.md)

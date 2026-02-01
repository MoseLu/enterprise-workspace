---
title: CRUD Composable Usage Documentation
type: package
project: utils
owner: dev-team
created: '2025-10-11'
updated: '2025-10-13'
publish: true
tags:
- packages
- utils
- crud
- composable
sidebar_label: CRUD Composable
sidebar_order: 12
sidebar_group: packages
---
# CRUD Composable Usage Documentation

## Introduction

`useCrud` is a powerful Vue 3 Composable that encapsulates common CRUD (Create, Read, Update, Delete) operation logic, including:
- Data loading and pagination
- Search and reset
- Add, edit, view, delete (single/batch)
- Row selection management

## Quick Start

### Basic Usage

```typescript
import { useCrud } from '@btc/shared-core';
import type { User } from './types';
import { BtcMessage } from '@btc/shared-components';

const userService = {
page: async (params) => ({
list: [...],
total: 100,
}),
add: async (data) => ({ id: 1 }),
update: async (data) => ({}),
delete: async ({ ids }) => ({}),
};

const {
// Data state
tableData, // Ref<User[]> - Table data
loading, // Ref<boolean> - Loading state
pagination, // { page, size, total } - Pagination info
selection, // Ref<User[]> - Selected rows

// Dialog state
upsertVisible, // Ref<boolean> - Add/edit dialog
currentRow, // Ref<User | null> - Current editing row
viewVisible, // Ref<boolean> - Details dialog
viewRow, // Ref<User | null> - Current viewing row

// Methods
loadData,
handleAdd,
handleEdit,
handleView,
handleDelete,
handleMultiDelete,
handleSelectionChange,
clearSelection,
} = useCrud<User>({
service: userService,
onSuccess: (msg) => BtcMessage.success(msg),
onError: (err) => BtcMessage.error(err.message),
});

// Initial load
onMounted(() => {
loadData();
});
```

### Use in Template

```vue
<template>
<div class="crud-page">
<!-- Toolbar -->
<div class="toolbar">
<el-button type="primary" @click="handleAdd">Add</el-button>
<el-button
type="danger"
:disabled="selection.length === 0"
@click="handleMultiDelete"
>
Batch Delete ({{ selection.length }})
</el-button>
<el-button @click="handleRefresh">Refresh</el-button>
</div>

<!-- Table -->
<el-table
:data="tableData"
:loading="loading"
@selection-change="handleSelectionChange"
>
<el-table-column type="selection" width="55" />
<el-table-column prop="name" label="Name" />
<el-table-column prop="email" label="Email" />
<el-table-column label="Actions" width="200">
<template #default="{ row }">
<el-button link @click="handleView(row)">View</el-button>
<el-button link type="primary" @click="handleEdit(row)">Edit</el-button>
<el-button link type="danger" @click="handleDelete(row)">Delete</el-button>
</template>
</el-table-column>
</el-table>

<!-- Pagination -->
<el-pagination
v-model:current-page="pagination.page"
v-model:page-size="pagination.size"
:total="pagination.total"
@current-change="handlePageChange"
@size-change="handleSizeChange"
/>

<!-- Add/Edit Dialog -->
<el-dialog v-model="upsertVisible" :title="currentRow ? 'Edit' : 'Add'">
<el-form :model="currentRow || {}">
<el-form-item label="Name">
<el-input v-model="currentRow.name" />
</el-form-item>
</el-form>
</el-dialog>

<!-- Details Dialog -->
<el-dialog v-model="viewVisible" title="Details">
<div v-if="viewRow">
<p>Name: {{ viewRow.name }}</p>
<p>Email: {{ viewRow.email }}</p>
</div>
</el-dialog>
</div>
</template>
```

## API Documentation

### Parameters (CrudOptions)

```typescript
interface CrudOptions<T> {
service: CrudService<T>; // Required: CRUD service object
onLoad?: () => void; // Optional: Pre-load hook
onSuccess?: (message: string) => void; // Optional: Success callback
onError?: (error: unknown) => void; // Optional: Error callback
}
```

### Return Value (UseCrudReturn)

#### Data State

| Property | Type | Description |
|------|------|------|
| `tableData` | `Ref<T[]>` | Table data list |
| `loading` | `Ref<boolean>` | Loading state |
| `pagination` | `PaginationConfig` | Pagination config `{ page, size, total }` |
| `searchParams` | `Ref<Record<string, unknown>>` | Current search parameters |
| `selection` | `Ref<T[]>` | Selected rows |
| `upsertVisible` | `Ref<boolean>` | Add/edit dialog visibility |
| `currentRow` | `Ref<T \| null>` | Current editing row data |
| `viewVisible` | `Ref<boolean>` | Details dialog visibility |
| `viewRow` | `Ref<T \| null>` | Current viewing row data |

#### Data Loading Methods

| Method | Description |
|------|------|
| `loadData()` | Load data (using current pagination and search parameters) |
| `handleSearch(params)` | Search (reset to first page) |
| `handleReset()` | Reset search parameters |
| `handleRefresh()` | Refresh current page |

#### Add/Edit/View Methods

| Method | Description |
|------|------|
| `handleAdd()` | Open add dialog |
| `handleEdit(row)` | Open edit dialog |
| `handleView(row)` | Open details dialog |
| `handleViewClose()` | Close details dialog |

#### Delete Methods

| Method | Description |
|------|------|
| `handleDelete(row)` | Delete single row |
| `handleMultiDelete()` | Batch delete selected rows |

#### Selection Management Methods

| Method | Description |
|------|------|
| `handleSelectionChange(rows)` | Selection change callback (works with el-table) |
| `clearSelection()` | Clear all selections |
| `toggleSelection(row, selected?)` | Toggle single row selection state |

#### Pagination Methods

| Method | Description |
|------|------|
| `handlePageChange(page)` | Page number change |
| `handleSizeChange(size)` | Page size change |

## Advanced Usage

### Search Functionality

```vue
<template>
<el-form inline @submit.prevent="onSearch">
<el-form-item label="Name">
<el-input v-model="searchForm.name" />
</el-form-item>
<el-button type="primary" native-type="submit">Search</el-button>
<el-button @click="onReset">Reset</el-button>
</el-form>
</template>

<script setup lang="ts">
const searchForm = reactive({ name: '' });

const onSearch = () => {
handleSearch(searchForm);
};

const onReset = () => {
Object.assign(searchForm, { name: '' });
handleReset();
};
</script>
```

### Batch Operations

```vue
<template>
<el-button
:disabled="selection.length === 0"
@click="handleMultiDelete"
>
Batch Delete ({{ selection.length }})
</el-button>
</template>

<script setup lang="ts">
// selection will automatically update
// handleMultiDelete will automatically call service.delete({ ids: [...] })
</script>
```

### Custom Hooks

```typescript
const crud = useCrud<User>({
service: userService,
onLoad: () => {
console.log('Loading started...');
},
onSuccess: (msg) => {
BtcMessage.success(msg);
// Can do other operations here, such as refreshing other data
},
onError: (error) => {
console.error('Operation failed:', error);
BtcMessage.error(error.message);
},
});
```

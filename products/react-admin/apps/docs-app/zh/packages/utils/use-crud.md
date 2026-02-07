---
title: CRUD Composable 使用文档
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
# CRUD Composable 使用文档

## 简介

`useCrud` 是一个强大的 Vue 3 Composable，封装了常见 CRUD（增删改查）操作的通用逻辑，包括：
- 数据加载与分页
- 搜索与重置
- 新增编辑查看删除（单个/批量）
- 选择行管理

## 快速开始

### 基础用法

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
// 数据状态
tableData, // Ref<User[]> - 表格数据
loading, // Ref<boolean> - 加载状态
pagination, // { page, size, total } - 分页信息
selection, // Ref<User[]> - 已选行

// 弹窗状态
upsertVisible, // Ref<boolean> - 新增/编辑弹窗
currentRow, // Ref<User | null> - 当前编辑行
viewVisible, // Ref<boolean> - 详情弹窗
viewRow, // Ref<User | null> - 当前查看行

// 方法
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

// 初始加载
onMounted(() => {
loadData();
});
```

### 在模板中使用

```vue
<template>
<div class="crud-page">
<!-- 工具栏 -->
<div class="toolbar">
<el-button type="primary" @click="handleAdd">新增</el-button>
<el-button
type="danger"
:disabled="selection.length === 0"
@click="handleMultiDelete"
>
批量删除 ({{ selection.length }})
</el-button>
<el-button @click="handleRefresh">刷新</el-button>
</div>

<!-- 表格 -->
<el-table
:data="tableData"
:loading="loading"
@selection-change="handleSelectionChange"
>
<el-table-column type="selection" width="55" />
<el-table-column prop="name" label="姓名" />
<el-table-column prop="email" label="邮箱" />
<el-table-column label="操作" width="200">
<template #default="{ row }">
<el-button link @click="handleView(row)">查看</el-button>
<el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
<el-button link type="danger" @click="handleDelete(row)">删除</el-button>
</template>
</el-table-column>
</el-table>

<!-- 分页 -->
<el-pagination
v-model:current-page="pagination.page"
v-model:page-size="pagination.size"
:total="pagination.total"
@current-change="handlePageChange"
@size-change="handleSizeChange"
/>

<!-- 新增/编辑弹窗 -->
<el-dialog v-model="upsertVisible" :title="currentRow ? '编辑' : '新增'">
<el-form :model="currentRow || {}">
<el-form-item label="姓名">
<el-input v-model="currentRow.name" />
</el-form-item>
</el-form>
</el-dialog>

<!-- 详情弹窗 -->
<el-dialog v-model="viewVisible" title="详情">
<div v-if="viewRow">
<p>姓名: {{ viewRow.name }}</p>
<p>邮箱: {{ viewRow.email }}</p>
</div>
</el-dialog>
</div>
</template>
```

## API 文档

### 参数 (CrudOptions)

```typescript
interface CrudOptions<T> {
service: CrudService<T>; // 必填：CRUD 服务对象
onLoad?: () => void; // 可选：加载前钩子
onSuccess?: (message: string) => void; // 可选：成功回调
onError?: (error: unknown) => void; // 可选：错误回调
}
```

### 返回值 (UseCrudReturn)

#### 数据状态

| 属性 | 类型 | 说明 |
|------|------|------|
| `tableData` | `Ref<T[]>` | 表格数据列表 |
| `loading` | `Ref<boolean>` | 加载状态 |
| `pagination` | `PaginationConfig` | 分页配置 `{ page, size, total }` |
| `searchParams` | `Ref<Record<string, unknown>>` | 当前搜索参数 |
| `selection` | `Ref<T[]>` | 已选中的行 |
| `upsertVisible` | `Ref<boolean>` | 新增/编辑弹窗显示状态 |
| `currentRow` | `Ref<T \| null>` | 当前编辑的行数据 |
| `viewVisible` | `Ref<boolean>` | 详情弹窗显示状态 |
| `viewRow` | `Ref<T \| null>` | 当前查看的行数据 |

#### 数据加载方法

| 方法 | 说明 |
|------|------|
| `loadData()` | 加载数据（使用当前分页和搜索参数） |
| `handleSearch(params)` | 搜索（重置到第一页） |
| `handleReset()` | 重置搜索参数 |
| `handleRefresh()` | 刷新当前页 |

#### 新增/编辑/查看方法

| 方法 | 说明 |
|------|------|
| `handleAdd()` | 打开新增弹窗 |
| `handleEdit(row)` | 打开编辑弹窗 |
| `handleView(row)` | 打开详情弹窗 |
| `handleViewClose()` | 关闭详情弹窗 |

#### 删除方法

| 方法 | 说明 |
|------|------|
| `handleDelete(row)` | 删除单行 |
| `handleMultiDelete()` | 批量删除已选行 |

#### 选择管理方法

| 方法 | 说明 |
|------|------|
| `handleSelectionChange(rows)` | 选择变化回调（与 el-table 配合） |
| `clearSelection()` | 清空所有选择 |
| `toggleSelection(row, selected?)` | 切换单行选择状态 |

#### 分页方法

| 方法 | 说明 |
|------|------|
| `handlePageChange(page)` | 页码变化 |
| `handleSizeChange(size)` | 每页条数变化 |

## 高级用法

### 搜索功能

```vue
<template>
<el-form inline @submit.prevent="onSearch">
<el-form-item label="姓名">
<el-input v-model="searchForm.name" />
</el-form-item>
<el-button type="primary" native-type="submit">搜索</el-button>
<el-button @click="onReset">重置</el-button>
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

### 批量操作

```vue
<template>
<el-button
:disabled="selection.length === 0"
@click="handleMultiDelete"
>
批量删除 ({{ selection.length }})
</el-button>
</template>

<script setup lang="ts">
// selection 会自动更新
// handleMultiDelete 会自动调用 service.delete({ ids: [...] })
</script>
```

### 自定义钩子

```typescript
const crud = useCrud<User>({
service: userService,
onLoad: () => {
console.log('开始加载...');
},
onSuccess: (msg) => {
BtcMessage.success(msg);
// 可以在这里做其他操作，如刷新其他数据
},
onError: (error) => {
console.error('操作失败:', error);
BtcMessage.error(error.message);
},
});
```
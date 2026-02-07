---
title: BTC CRUD 组件系统
type: package
project: components
owner: dev-team
created: '2025-10-11'
updated: '2025-10-13'
publish: true
tags:
- packages
- components
- crud
sidebar_label: BTC CRUD
sidebar_order: 4
sidebar_group: packages
---
# BTC CRUD 组件系统

## 设计理念

采用**上下文驱动 + 自由组合**架构，完全对齐 cool-admin-vue 的设计：

- `<BtcCrud>` 提供上下文容器（不渲染UI）
- 所有子组件通过 `inject` 获取 CRUD 状态
- 开发者**完全自由**组合布局

##组件列表

### 核心组件

| 组件 | 说明 | 对应 cool-admin |
|------|------|----------------|
| `<BtcCrud>` | 上下文容器 | `<cl-crud>` |
| `<BtcTable>` | 表格组件 | `<cl-table>` |
| `<BtcUpsert>` | 新增/编辑弹窗 | `<cl-upsert>` |
| `<BtcPagination>` | 分页组件 | `<cl-pagination>` |

### 按钮组件

| 组件 | 说明 | 对应 cool-admin |
|------|------|----------------|
| `<BtcAddBtn>` | 新增按钮 | `<cl-add-btn>` |
| `<BtcRefreshBtn>` | 刷新按钮 | `<cl-refresh-btn>` |
| `<BtcMultiDeleteBtn>` | 批量删除按钮 | `<cl-multi-delete-btn>` |

### 辅助组件

| 组件 | 说明 | 对应 cool-admin |
|------|------|----------------|
| `<BtcCrudRow>` | 行布局 | `<cl-row>` |
| `<BtcCrudFlex1>` | 弹性空间 | `<cl-flex1>` |
| `<BtcCrudSearchKey>` | 搜索框 | `<cl-search-key>` |

---

## 快速开始

### 基础示例

```vue
<template>
<BtcCrud :service="userService">
<!-- 工具栏 -->
<BtcCrudRow>
<BtcAddBtn />
<BtcMultiDeleteBtn />
<BtcRefreshBtn />
<BtcCrudFlex1 />
<BtcCrudSearchKey placeholder="搜索用户名姓名" />
</BtcCrudRow>

<!-- 表格 -->
<BtcCrudRow>
<BtcTable :columns="columns">
<!-- 自定义列 -->
<template #column-status="{ row }">
<el-tag :type="row.status === 1 ? 'success' : 'danger'">
{{ row.status === 1 ? '启用' : '禁用' }}
</el-tag>
</template>

<!-- 自定义操作按钮 -->
<template #slot-custom="{ row }">
<el-button link @click="handleCustom(row)">自定义</el-button>
</template>
</BtcTable>
</BtcCrudRow>

<!-- 分页 -->
<BtcCrudRow>
<BtcCrudFlex1 />
<BtcPagination />
</BtcCrudRow>

<!-- 新增/编辑弹窗 -->
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

// 定义服务
const userService = {
page: async (params) => ({
list: [{ id: 1, name: '张三', status: 1 }],
total: 1,
}),
add: async (data) => ({}),
update: async (data) => ({}),
delete: async ({ ids }) => ({}),
};

// 表格列配置
const columns: TableColumn[] = [
{ type: 'selection', width: 60 },
{ prop: 'id', label: 'ID', width: 80 },
{ prop: 'name', label: '姓名', minWidth: 120 },
{ prop: 'status', label: '状态', width: 100 },
{
type: 'op',
label: '操作',
width: 200,
buttons: ['info', 'edit', 'slot-custom', 'delete']
},
];

// 表单项配置
const formItems: FormItem[] = [
{
prop: 'name',
label: '姓名',
required: true,
component: {
name: 'el-input',
},
},
{
prop: 'status',
label: '状态',
value: 1,
component: {
name: 'el-radio-group',
options: [
{ label: '启用', value: 1 },
{ label: '禁用', value: 0 },
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

## 组件详细说明

### 1. BtcCrud - 上下文容器

**Props:**
- `service`: CrudService（必填）
- `options`: CrudOptions（可选，传递给 useCrud）
- `border`: boolean（是否显示边框）
- `padding`: string（内边距）

**Expose:**
- `crud`: 完整的 CRUD 实例

**示例:**
```vue
<BtcCrud
ref="crudRef"
:service="service"
:options="{ onSuccess: (msg) => BtcMessage.success(msg) }"
>
<!-- 子组件 -->
</BtcCrud>

<script setup>
const crudRef = ref();

// 访问 CRUD 实例
const refresh = () => {
crudRef.value?.crud.loadData();
};
</script>
```

---

### 2. BtcTable - 表格组件

**Props:**
- `columns`: TableColumn[]（列配置）
- 其他属性透传给 `el-table`

**Slots:**
- `column-{prop}`: 自定义列渲染
- `op-buttons`: 自定义操作列
- `slot-{name}`: 自定义操作按钮

**TableColumn 配置:**
```typescript
interface TableColumn {
type?: 'selection' | 'index' | 'op'; // 列类型
prop?: string; // 字段名
label?: string; // 列标题
width?: number; // 宽度
minWidth?: number; // 最小宽度
align?: 'left' | 'center' | 'right';
sortable?: boolean; // 可排序

// 渲染
formatter?: (row, column, cellValue, index) => string;
component?: {
name: string | Component;
props?: Record<string, any>;
};

// 操作列
buttons?: OpButton[] | ((options: { scope: any }) => OpButton[]);
}

// 操作按钮类型
type OpButton =
| 'edit' | 'delete' | 'info' // 预定义
| `slot-${string}` // 插槽
| { // 自定义
label: string;
type?: string;
onClick?: (options: { scope: any }) => void;
};
```

---

### 3. BtcUpsert - 新增/编辑弹窗

**Props:**
- `items`: FormItem[]（表单项配置）
- `width`: string（弹窗宽度）
- `labelWidth`: string（标签宽度）
- `onSubmit`: (data, { close, done }) => void（提交回调）
- `onOpen`: (data) => void（打开回调）

**Slots:**
- `item-{prop}`: 自定义表单项
- `footer`: 自定义底部按钮

**FormItem 配置:**
```typescript
interface FormItem {
prop: string;
label: string;
required?: boolean;
span?: number; // 栅格布局
value?: any; // 默认值

component?: {
name: string | Component;
props?: Record<string, any>;
options?: any[]; // 选项（select/radio/checkbox）
};

rules?: any | any[]; // 验证规则
}
```

---

### 4. 按钮组件

**BtcAddBtn / BtcRefreshBtn / BtcMultiDeleteBtn**

```vue
<BtcAddBtn type="primary" text="新增用户">
<template #default>
<el-icon><Plus /></el-icon> 新增
</template>
</BtcAddBtn>

<BtcMultiDeleteBtn text="批量删除" />
<BtcRefreshBtn />
```

---

### 5. 辅助组件

**BtcCrudRow** - 行布局
```vue
<BtcCrudRow margin-bottom="20px" align="flex-start">
<BtcAddBtn />
<BtcRefreshBtn />
</BtcCrudRow>
```

**BtcCrudFlex1** - 弹性空间（占据剩余空间）
```vue
<BtcCrudRow>
<BtcAddBtn />
<BtcCrudFlex1 /> <!-- 占据剩余空间 -->
<BtcCrudSearchKey />
</BtcCrudRow>
```

**BtcCrudSearchKey** - 搜索框
```vue
<BtcCrudSearchKey
placeholder="搜索关键词"
field="keyword" <!-- 搜索字段名 -->
/>
```

---

## 高级用法

### 1. 完全自由的布局

```vue
<BtcCrud :service="service">
<!-- 第一行：主要操作 -->
<BtcCrudRow>
<BtcAddBtn />
<BtcMultiDeleteBtn />
<el-button type="success">导出</el-button>
<el-button type="warning">导入</el-button>
</BtcCrudRow>

<!-- 第二行：搜索区域 -->
<BtcCrudRow>
<el-form inline>
<el-form-item label="状态">
<el-select v-model="searchForm.status">
<el-option label="全部" :value="null" />
<el-option label="启用" :value="1" />
</el-select>
</el-form-item>
</el-form>
<BtcCrudFlex1 />
<BtcCrudSearchKey />
</BtcCrudRow>

<!-- 第三行：表格 -->
<BtcCrudRow>
<BtcTable :columns="columns" stripe border />
</BtcCrudRow>

<!-- 第四行：分页 -->
<BtcCrudRow>
<BtcCrudFlex1 />
<BtcPagination />
</BtcCrudRow>

<!-- 弹窗 -->
<BtcUpsert :items="formItems" />
</BtcCrud>
```

### 2. 自定义操作列

```typescript
const columns: TableColumn[] = [
// ...
{
type: 'op',
label: '操作',
width: 300,
buttons: ({ scope }) => {
// 根据行数据动态生成按钮
const btns: OpButton[] = ['info', 'edit'];

if (scope.row.canDelete) {
btns.push('delete');
}

if (scope.row.isOwner) {
btns.push('slot-transfer'); // 自定义插槽
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
转移
</el-button>
</template>
</BtcTable>
```

### 3. 动态表单项

```typescript
const formItems: FormItem[] = [
{
prop: 'name',
label: '姓名',
required: true,
span: 12, // 占一半宽度
},
{
prop: 'type',
label: '类型',
span: 12,
component: {
name: 'el-select',
options: [
{ label: '类型1', value: 1 },
{ label: '类型2', value: 2 },
],
},
},
// 函数式表单项（根据条件动态显示）
() => {
if (formData.value.type === 1) {
return {
prop: 'extra',
label: '额外字段',
component: { name: 'el-input' },
};
}
return null;
},
];
```

### 4. 访问 CRUD 实例

```vue
<template>
<BtcCrud ref="crudRef" :service="service">
<BtcTable :columns="columns" />
<el-button @click="customRefresh">自定义刷新</el-button>
</BtcCrud>
</template>

<script setup lang="ts">
const crudRef = ref();

const customRefresh = () => {
// 访问完整的 CRUD 实例
const crud = crudRef.value?.crud;

crud.setParams({ status: 1 }); // 设置参数
crud.loadData(); // 刷新数据

console.log(crud.selection.value); // 访问选中行
console.log(crud.pagination); // 访问分页信息
};
</script>
```

---

## 完整示例

```vue
<template>
<BtcCrud ref="Crud" :service="userService">
<!-- 工具栏 -->
<BtcCrudRow>
<BtcRefreshBtn />
<BtcAddBtn />
<BtcMultiDeleteBtn />
<el-button type="success" :disabled="Table?.selection.length === 0" @click="handleMove">
转移
</el-button>
<BtcCrudFlex1 />
<BtcCrudSearchKey placeholder="搜索用户名姓名" />
</BtcCrudRow>

<!-- 表格 -->
<BtcCrudRow>
<BtcTable ref="Table" :columns="columns">
<!-- 自定义操作按钮 -->
<template #slot-move="{ row }">
<el-button link type="warning" @click="handleMove(row)">
转移
</el-button>
</template>
</BtcTable>
</BtcCrudRow>

<!-- 分页 -->
<BtcCrudRow>
<BtcCrudFlex1 />
<BtcPagination />
</BtcCrudRow>

<!-- 新增/编辑弹窗 -->
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

// 表格列配置
const columns: TableColumn[] = [
{ type: 'selection', width: 60 },
{ prop: 'username', label: '用户名', minWidth: 150 },
{ prop: 'name', label: '姓名', minWidth: 120 },
{ prop: 'phone', label: '手机号', minWidth: 120 },
{ prop: 'status', label: '状态', width: 100 },
{
type: 'op',
label: '操作',
width: 270,
buttons: ['slot-move', 'edit', 'delete']
},
];

// 表单项配置
const formItems: FormItem[] = [
{
prop: 'name',
label: '姓名',
span: 12,
required: true,
component: { name: 'el-input' },
},
{
prop: 'username',
label: '用户名',
span: 12,
required: true,
component: { name: 'el-input' },
},
{
prop: 'phone',
label: '手机号',
span: 12,
component: { name: 'el-input' },
},
{
prop: 'status',
label: '状态',
value: 1,
span: 12,
component: {
name: 'el-radio-group',
options: [
{ label: '启用', value: 1 },
{ label: '禁用', value: 0 },
],
},
},
];

const handleFormOpen = (data: any) => {
console.log('表单打开:', data);
};

const handleMove = (row?: any) => {
const ids = row ? [row.id] : Table.value?.selection.map((e: any) => e.id) || [];
console.log('转移用户:', ids);
};
</script>
```

---

## 核心优势

### 1. **完全自由的布局**
- ? 不强制布局结构
- ? 可以在任意位置插入任何组件
- ? 与 cool-admin-vue 完全一致

### 2. **上下文共享**
```typescript
// 所有子组件自动访问 CRUD 状态
const crud = inject('btc-crud');

crud.tableData // 表格数据
crud.loading // 加载状态
crud.selection // 选中行
crud.handleAdd() // 新增
crud.handleEdit(row) // 编辑
```

### 3. **类型安全**
- ? 完整的 TypeScript 支持
- ? 所有方法都有类型提示
- ? 编译时错误检查

### 4. **渐进增强**
```vue
<!-- 最简单：只用表格 -->
<BtcCrud :service="service">
<BtcTable :columns="columns" />
</BtcCrud>

<!-- 进阶：添加工具栏 -->
<BtcCrud :service="service">
<BtcCrudRow>
<BtcAddBtn />
<BtcRefreshBtn />
</BtcCrudRow>
<BtcTable :columns="columns" />
</BtcCrud>

<!-- 完整：添加所有功能 -->
<!-- 见上面完整示例 -->
```

---

## 与 cool-admin-vue 对比

| 维度 | cool-admin-vue | BTC CRUD |
|------|---------------|----------|
| **架构** | 上下文组件 | ? **完全一致** |
| **灵活性** | 完全自由布局 | ? **完全一致** |
| **组件数量** | 15+ | ? **10+ (持续增加)** |
| **类型安全** | ? 部分 | ? **完全** |
| **使用方式** | `<cl-crud>` | `<BtcCrud>` |

**? 我们的新设计与 cool-admin-vue 架构完全对齐！**

---

## 相关文档

- [useCrud API](../../../shared-core/src/btc/crud/README.md)
- [功能对比表](../../../../implementation-docs/CRUD-FEATURE-COMPARISON.md)
- [事件系统分析](../../../../implementation-docs/EVENT-SYSTEM-ANALYSIS.md)


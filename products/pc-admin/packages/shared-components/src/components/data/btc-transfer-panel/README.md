## BtcTransferPanel

一个基于 `BtcCrud` 的可复用穿梭式分配面板，左侧使用 CRUD 表格呈现可选择的数据，右侧展示已选条目，可折叠并支持分页、多页缓存。

### 基本用法

```vue
<template>
  <BtcTransferPanel
    ref="userTransferRef"
    v-model="selectedUserIds"
    :service="userService"
    :columns="userColumns"
    :options="{
      onBeforeRefresh: (params) => ({ ...params, keyword })
    }"
  >
    <template #filters>
      <el-input v-model="keyword" placeholder="搜索用户" @keyup.enter="handleSearch" />
      <el-button @click="handleSearch">搜索</el-button>
    </template>
  </BtcTransferPanel>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { service } from '@services/eps';

const selectedUserIds = ref<string[]>([]);
const keyword = ref('');

const userService = service.system?.iam?.user; // EPS CRUD 服务

const userColumns = [
  { prop: 'username', label: '账号', minWidth: 160 },
  { prop: 'realName', label: '姓名', minWidth: 160 },
];

const userTransferRef = ref();
const handleSearch = () => {
  userTransferRef.value?.refresh({ keyword: keyword.value || undefined });
};
</script>
```

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `modelValue` | 已选项主键集合，支持 `v-model` | `(string \| number)[]` | `[]` |
| `service` | CRUD 服务（优先使用，与 `BtcCrud` 一致） | `CrudService` | `undefined` |
| `data` | 备用数据源（未提供 `service` 时使用） | `any[]` | `[]` |
| `columns` | 左侧表格列定义，若未包含选择列会自动补充 | `TransferPanelColumn[]` | `[]` |
| `rowKey` | 行主键字段或函数 | `string \| (row) => TransferKey` | `'id'` |
| `autoLoad` | 是否自动加载数据 | `boolean` | `true` |
| `options` | 透传给 `BtcCrud` 的配置（不包含 `service`） | `Record<string, any>` | `{}` |
| `sourceTitle` | 左侧标题 | `string` | `全部数据` |
| `targetTitle` | 右侧标题 | `string` | `已选择` |
| `displayProp` | 默认展示字段（用于右侧已选列表） | `string` | `undefined` |
| `descriptionProp` | 默认描述字段 | `string` | `undefined` |
| `selectedFormatter` | 自定义已选项渲染 | `(item, key) => SelectedItemDisplay \| string` | `undefined` |
| `collapsible` | 是否允许折叠右侧面板 | `boolean` | `true` |
| `height` | 组件整体高度 | `string \| number` | `undefined` |
| `targetEmptyText` | 右侧无数据文案 | `string` | `暂无选择` |
| `collapseText` | 折叠按钮文案 | `{ expand?: string; collapse?: string }` | `{}` |

### 插槽

| 插槽名 | 说明 |
| --- | --- |
| `filters` | 左侧顶部筛选区域，可在内调用 `ref.refresh(params)` 触发搜索 |
| `header-actions` | 左侧标题栏右侧操作区域 |
| `column-xxx` | 自定义某一列的单元格内容，语法与 `BtcTable` 一致 |
| `selected-item` | 自定义右侧已选项渲染（可获取 `item` 与 `keyValue`） |

### 事件

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| `update:modelValue` | 已选项变化（`v-model`） | `(keys: TransferKey[])` |
| `change` | 已选项变化（包含实体数据） | `({ keys, items })` |
| `remove` | 单个已选项被移除 | `({ key, item })` |
| `clear` | 已选项被清空 | `()` |
| `page-change` | 分页变化 | `(page: number, size: number)` |

### 暴露方法

| 方法 | 说明 |
| --- | --- |
| `refresh(params?)` | 触发刷新 / 搜索，参数会透传给 `BtcCrud.handleSearch` |
| `clear()` | 清空所有已选项 |
| `toggleCollapse(value?)` | 折叠 / 展开右侧面板 |
| `selectedItems` | `ComputedRef`，返回当前缓存的已选实体集合 |



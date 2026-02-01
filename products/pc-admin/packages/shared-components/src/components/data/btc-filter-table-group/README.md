# BtcFilterTableGroup

一个增强型的筛选+表格组合组件，在 `BtcFilterGroup` 的基础上，内置了 `BtcCrud` 和 `BtcTable`，并提供了高复杂交互功能。

## 功能特性

1. **左右侧联动**：基于左侧的分类优先渲染对应的列（宽度充足再渲染其他列）
2. **选择提前**：基于用户选中的分类将列提前显示
3. **宽度交互**：左侧宽度自动根据页面实际渲染调整尺寸（列非常少时可以突破 large，但有上限）

## 基础用法

```vue
<template>
  <BtcFilterTableGroup
    :filter-category="filterCategory"
    :right-service="rightService"
    :table-columns="tableColumns"
    :form-items="formItems"
    :category-column-map="categoryColumnMap"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BtcFilterTableGroup } from '@btc/shared-components';
import type { FilterCategory, TableColumn } from '@btc/shared-components';

const filterCategory = ref<FilterCategory[]>([
  {
    id: 'production',
    name: '产品',
    options: [
      { label: '产品A', value: 'prod_a' },
      { label: '产品B', value: 'prod_b' },
    ],
  },
  {
    id: 'status',
    name: '状态',
    options: [
      { label: '启用', value: 'enabled' },
      { label: '禁用', value: 'disabled' },
    ],
  },
]);

const tableColumns = ref<TableColumn[]>([
  { prop: 'productName', label: '产品名称' },
  { prop: 'productCode', label: '产品编码' },
  { prop: 'status', label: '状态' },
  { prop: 'createTime', label: '创建时间' },
]);

// 分类到列的映射：当选中某个分类时，对应的列会优先显示
const categoryColumnMap = {
  production: ['productName', 'productCode'], // 选中"产品"分类时，优先显示产品名称和编码列
  status: ['status'], // 选中"状态"分类时，优先显示状态列
};

const rightService = {
  // CRUD 服务
  page: async (params: any) => {
    // 实现分页查询
  },
  // ... 其他服务方法
};
</script>
```

## Props

### 筛选相关

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `filterCategory` | `FilterCategory[]` | - | 筛选分类数据（直接传入） |
| `filterService` | `{ list: () => Promise<FilterCategory[]> }` | - | 筛选分类服务（EPS 服务） |
| `enableFilterSearch` | `boolean` | `true` | 是否启用搜索功能 |
| `defaultExpandedCount` | `number` | `3` | 默认展开的分类数量 |
| `rightTitle` | `string` | - | 右侧标题 |

### 表格相关

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `rightService` | `any` | - | 右侧服务（CRUD）**必填** |
| `tableColumns` | `TableColumn[]` | - | 表格列配置**必填** |
| `formItems` | `any[]` | - | 表单配置项 |
| `op` | `{ buttons?: any[] }` | - | 操作列配置 |

### 列优先级配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `columnPriority` | `'auto' \| 'manual'` | `'auto'` | 列优先级模式：'auto' 自动（基于筛选结果），'manual' 手动（使用原始顺序） |
| `enableColumnReorder` | `boolean` | `false` | 是否允许列重排序（暂未实现） |
| `categoryColumnMap` | `Record<string, string[]>` | `{}` | 分类ID到列prop的映射，例如：`{ 'production': ['productName', 'productCode'] }` |

### 宽度配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `minLeftWidth` | `string` | `'200px'` | 最小左侧宽度 |
| `maxLeftWidth` | `string` | `'600px'` | 最大左侧宽度 |
| `enableAutoWidth` | `boolean` | `true` | 是否启用自动宽度调整 |
| `baseWidth` | `{ small: number; default: number; large: number }` | `{ small: 200, default: 300, large: 450 }` | 基准宽度配置 |
| `leftWidth` | `string` | - | 左侧宽度（当 `enableAutoWidth` 为 `false` 时使用） |
| `leftSize` | `'default' \| 'small' \| 'middle'` | - | 左侧宽度类型（当 `enableAutoWidth` 为 `false` 时使用） |

### 其他配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showAddBtn` | `boolean` | `true` | 是否显示新增按钮 |
| `showMultiDeleteBtn` | `boolean` | `true` | 是否显示批量删除按钮 |
| `showSearchKey` | `boolean` | `true` | 是否显示搜索框 |
| `showToolbar` | `boolean` | `true` | 是否显示工具栏 |
| `upsertWidth` | `string \| number` | `800` | 表单弹窗宽度 |
| `searchPlaceholder` | `string` | `'搜索'` | 搜索框占位符 |
| `defaultExpand` | `boolean` | `true` | 是否默认展开左侧 |
| `autoCollapseOnMobile` | `boolean` | `true` | 移动端自动收起 |
| `autoLoad` | `boolean` | `true` | 是否自动加载数据 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `filter-change` | `(result: FilterResult[])` | 筛选结果变化 |
| `expand-change` | `(isExpand: boolean)` | 展开/收起状态变化 |
| `column-change` | `(columns: TableColumn[])` | 列变化事件（列顺序或显示状态变化） |
| `width-change` | `(width: string)` | 宽度变化事件 |
| `refresh` | `(params?: any)` | 刷新事件 |
| `form-submit` | `(data: any, formEvent: {...})` | 表单提交事件 |
| `load` | `(data: any[])` | 数据加载完成事件 |

## Slots

| 插槽名 | 作用域 | 说明 |
|--------|--------|------|
| `actions` | `{ filterResult: FilterResult[] }` | 右侧工具栏操作按钮 |
| `add-btn` | - | 新增按钮（覆盖默认） |
| `multi-delete-btn` | - | 批量删除按钮（覆盖默认） |
| `after-refresh-btn` | - | 刷新按钮后的内容 |
| `search` | - | 搜索框（覆盖默认） |

## Expose

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `filterResult` | `ComputedRef<FilterResult[]>` | 筛选结果 |
| `crudRef` | `any` | CRUD 组件引用 |
| `filterListRef` | `any` | FilterList 组件引用 |
| `refresh` | `(params?: any) => Promise<void>` | 刷新数据 |
| `updateColumns` | `(columns: TableColumn[]) => void` | 手动更新列（暂未实现） |

## 使用示例

### 基础示例

```vue
<template>
  <BtcFilterTableGroup
    :filter-category="filterCategory"
    :right-service="rightService"
    :table-columns="tableColumns"
    :category-column-map="categoryColumnMap"
    @filter-change="handleFilterChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const filterCategory = ref([
  {
    id: 'production',
    name: '产品',
    options: [
      { label: '产品A', value: 'prod_a' },
      { label: '产品B', value: 'prod_b' },
    ],
  },
]);

const tableColumns = ref([
  { prop: 'productName', label: '产品名称' },
  { prop: 'productCode', label: '产品编码' },
]);

const categoryColumnMap = {
  production: ['productName', 'productCode'],
};

const handleFilterChange = (result: FilterResult[]) => {
  console.log('筛选结果:', result);
};
</script>
```

### 禁用自动宽度调整

```vue
<template>
  <BtcFilterTableGroup
    :filter-category="filterCategory"
    :right-service="rightService"
    :table-columns="tableColumns"
    :enable-auto-width="false"
    left-width="300px"
  />
</template>
```

### 自定义操作按钮

```vue
<template>
  <BtcFilterTableGroup
    :filter-category="filterCategory"
    :right-service="rightService"
    :table-columns="tableColumns"
  >
    <template #actions="{ filterResult }">
      <el-button @click="handleExport(filterResult)">导出</el-button>
    </template>
  </BtcFilterTableGroup>
</template>
```

## 工作原理

### 列优先级管理

1. 当用户选中某个分类时，`useColumnPriority` 会根据 `categoryColumnMap` 找到对应的列
2. 这些列的优先级会被提升，优先级高的列会排在前面
3. 表格会按照优先级顺序渲染列

### 动态宽度计算

1. `useDynamicWidth` 会监听表格的实际列数
2. 根据列数计算合适的左侧宽度：
   - 列数 ≤ 3：可以突破 large（450px），但不超过 maxWidth
   - 列数 4-5：使用 large（450px）
   - 列数 6-7：使用 default（300px）
   - 列数 ≥ 8：使用 small（200px）
3. 宽度会在列数变化、筛选结果变化、窗口大小变化时自动重新计算

### 列渲染优化

`useColumnRender` 会根据可用宽度动态决定显示哪些列，优先显示高优先级的列。目前这个功能已预留接口，但需要根据实际的表格组件API来实现。

## 注意事项

1. **categoryColumnMap 配置**：必须正确配置分类ID到列prop的映射，否则列优先级功能无法正常工作
2. **列 prop 唯一性**：确保表格列的 `prop` 属性唯一，否则优先级计算可能出错
3. **性能考虑**：自动宽度计算会在多个时机触发，如果性能有问题，可以考虑禁用 `enableAutoWidth`
4. **响应式**：组件会自动响应窗口大小变化，但需要确保容器有明确的宽度

## 与 BtcFilterGroup 的区别

- **BtcFilterGroup**：灵活的布局组件，右侧内容完全由插槽控制
- **BtcFilterTableGroup**：专门用于"筛选+表格"场景，内置了表格和复杂交互逻辑

如果只需要简单的筛选+表格功能，可以直接使用 `BtcFilterGroup`；如果需要列优先级、动态宽度等复杂功能，使用 `BtcFilterTableGroup`。

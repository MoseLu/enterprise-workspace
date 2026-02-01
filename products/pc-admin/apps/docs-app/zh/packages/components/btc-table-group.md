---
title: BtcMasterTableGroup 组件
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

# BtcMasterTableGroup 组件

`BtcMasterTableGroup` 是一个增强型的复合组件，它在 `BtcDoubleLayout` 的基础上，内置了 `BtcMasterList` 作为左侧内容，并内置了 `BtcCrud` 作为右侧内容，旨在提供一个开箱即用的"左树右表"联动解决方案。

## 功能特性

- **左侧 MasterList**：支持树形或列表数据展示，内置"未分配"选项，支持默认选中。
- **右侧 CRUD 表格**：提供完整的 CRUD 功能（增删改查、分页、搜索）。
- **自动联动**：左侧选择项变化时，自动刷新右侧表格数据，并智能传递参数。
- **参数标准化**：自动将左侧选中项的 ID 作为 `keyword` 传递给右侧 `page` 请求，并确保请求参数格式符合后端要求。
- **数据共享**：左侧列表数据自动注入到右侧表单的级联选择器中。
- **职责单一**：只负责布局和基础状态管理，具体业务由使用者处理
- **灵活配置**：支持自定义左侧和右侧内容

## 基本用法

### 简单使用（推荐）

```vue
<template>
  <BtcMasterTableGroup
    ref="tableGroupRef"
    :left-service="services.sysdepartment"
    :right-service="services.sysuser"
    :table-columns="userColumns"
    :form-items="getUserFormItems()"
    left-title="部门列表"
    right-title="用户列表"
    search-placeholder="搜索用户"
    :show-unassigned="true"
    unassigned-label="未分配"
    @select="handleDepartmentSelect"
    @refresh="handleRefresh"
  />
</template>

<script setup lang="ts">
import { BtcMasterTableGroup } from '@btc/shared-components';
import { userColumns, getUserFormItems, services } from './config';

const tableGroupRef = ref();

// 处理部门选择（可选，用于日志或其他处理）
const handleDepartmentSelect = (item: any, keyword?: any) => {
  console.log('选中部门:', item, 'Keyword:', keyword);
};

// 处理刷新事件（可选）
const handleRefresh = (params?: any) => {
  console.log('刷新参数:', params);
};
</script>
```

### 自动参数传递

`BtcMasterTableGroup` 会自动处理左侧和右侧服务的参数传递，确保都使用相同的对象格式：

#### 左侧服务（list 请求）
```typescript
// 左侧部门列表请求参数
{
  "order": "createdAt",
  "sort": "asc",
  "page": 1,
  "size": 50,
  "keyword": "",
  "status": "ACTIVE" // 来自 leftParams
}
```

#### 右侧服务（page 请求）
- **正常部门**：将选中部门的 ID 作为 `keyword` 传递给右侧 `page` 请求
- **未分配部门**：清空 `keyword`，让后端返回所有数据

```typescript
// 右侧用户列表请求参数
{
  "order": "createdAt",
  "sort": "asc",
  "page": 1,
  "size": 20,
  "keyword": "部门ID或ID数组" // 自动传递
}
```

### 自定义左侧内容

```vue
<template>
  <BtcMasterTableGroup :right-service="services.sysuser">
    <template #left>
      <!-- 完全自定义左侧内容，例如一个自定义的部门树 -->
      <CustomDepartmentTree @select="handleCustomSelect" />
    </template>
    <template #right="{ selected, crud }">
      <!-- 右侧内容可以访问到左侧的选中项和内置的 crud 实例 -->
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
  // 处理自定义左侧组件的选择逻辑
  // 可以手动调用 tableGroupRef.value.crudRef.refresh() 来刷新右侧表格
};
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| leftService | 左侧服务对象 | `any` | - |
| leftTitle | 左侧标题 | `string` | `'列表'` |
| rightService | 右侧服务对象 | `any` | - |
| rightTitle | 右侧标题 | `string` | `'详情'` |
| tableColumns | 表格列配置 | `any[]` | - |
| formItems | 表单项配置 | `any[]` | - |
| idField | ID字段名 | `string` | `'id'` |
| labelField | 标签字段名 | `string` | `'name'` |
| parentField | 父级字段名 | `string` | `'parentId'` |
| enableDrag | 是否启用拖拽排序 | `boolean` | `false` |
| showUnassigned | 是否显示"未分配"分组 | `boolean` | `false` |
| unassignedLabel | "未分配"分组的标签 | `string` | `'未分配'` |
| leftWidth | 左侧宽度 | `string` | `'300px'` |
| upsertWidth | 新增/编辑弹窗宽度 | `string \| number` | `800` |
| searchPlaceholder | 搜索框占位符 | `string` | `'搜索'` |

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| select | 左侧选择项变化时触发 | `(item: any, keyword?: any)` |
| update:selected | 左侧选择项变化时触发（v-model 支持） | `(value: any)` |
| refresh | 刷新事件 | `(params?: any)` |
| form-submit | 表单提交时触发 | `(data: any, event: { close: () => void; done: () => void; next: (data: any) => Promise<any>; defaultPrevented: boolean })` |
| load | 左侧数据加载完成时触发 | `(data: any[])` |

## Expose

| 属性 | 说明 | 类型 |
|------|------|------|
| viewGroupRef | `BtcViewGroup` 组件实例引用 | `any` |
| crudRef | `BtcCrud` 组件实例引用 | `any` |
| refresh | 刷新整个组件（包括左侧 MasterList 和右侧 CRUD） | `(params?: any) => Promise<void>` |

## 数据共享机制

`BtcMasterTableGroup` 通过以下机制实现数据共享：

1. **左侧数据自动注入**：左侧列表数据会自动注入到右侧表单的级联选择器中
2. **参数自动传递**：左侧选中项的 ID 会自动作为 `keyword` 传递给右侧 `page` 请求
3. **表单自动填充**：新增/编辑表单会自动填充当前选中的部门 ID

## 使用场景

### 1. 部门-用户管理
```vue
<BtcTableGroup
  :left-service="services.sysdepartment"
  :right-service="services.sysuser"
  :table-columns="userColumns"
  :form-items="userFormItems"
  left-title="部门列表"
  right-title="用户列表"
  :show-unassigned="true"
/>
```

### 2. 分类-商品管理
```vue
<BtcTableGroup
  :left-service="services.category"
  :right-service="services.product"
  :table-columns="productColumns"
  :form-items="productFormItems"
  left-title="分类列表"
  right-title="商品列表"
  :show-unassigned="true"
/>
```

### 3. 角色-权限管理
```vue
<BtcTableGroup
  :left-service="services.role"
  :right-service="services.permission"
  :table-columns="permissionColumns"
  :form-items="permissionFormItems"
  left-title="角色列表"
  right-title="权限列表"
  :show-unassigned="true"
/>
```

## 注意事项

1. **服务对象格式**：左侧服务必须提供 `list` 方法，右侧服务必须提供 `page`、`add`、`update`、`delete` 方法
2. **参数格式**：所有服务调用都会自动构造标准参数对象，包含 `order`、`sort`、`page`、`size`、`keyword` 等字段
3. **数据联动**：左侧选择变化时，右侧表格会自动刷新，无需手动处理
4. **表单集成**：右侧表单中的级联选择器会自动使用左侧数据，无需额外配置

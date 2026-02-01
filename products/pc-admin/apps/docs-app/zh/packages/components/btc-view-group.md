---
title: BtcViewGroup 组件
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
# BtcViewGroup 组件

## 概述

左右分栏组件，参考 cool-admin 的 `cl-view-group` 实现常用于**左侧树形菜单/列表 + 右侧CRUD表格**的布局场景，如用户管理部门管理等

## 特性

- 左右分栏布局
- 左侧支持树形结构或列表
- 响应式设计（移动端自动折叠）
- 关键字搜索
- 懒加载（无限滚动）
- 刷新/新增/右键菜单
- 完全可定制的插槽

## 基础用法

```vue
<template>
<BtcViewGroup ref="viewGroupRef">
<template #left>
<!-- 左侧内容（自定义） -->
<dept-list @select="handleSelect" />
</template>

<template #right>
<!-- 右侧内容 -->
<BtcCrud :service="service">
<BtcTable :columns="columns" />
</BtcCrud>
</template>
</BtcViewGroup>
</template>

<script setup lang="ts">
const viewGroupRef = ref();
const service = {}; // 你的服务

function handleSelect(item: any) {
// 选中左侧项时的处理
}
</script>
```

## 使用 Service（自动树形/列表）

不提供 `#left` 插槽时，组件会根据配置自动渲染左侧内容：

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
label: '部门',
title: '用户列表',
leftWidth: '300px',
service: deptService, // 部门服务
enableRefresh: true,
enableAdd: true,
enableKeySearch: true,
tree: {
visible: true, // 树形结构
props: {
label: 'name',
children: 'children'
}
},
onSelect(item) {
// 选中部门时，刷新右侧用户列表
userCrud.refresh({ deptId: item.id });
}
});
</script>
```

## Props

### Options 配置

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| label | 左侧标题 | string | '组' |
| title | 右侧标题 | string | '列表' |
| leftWidth | 左侧宽度 | string | '300px' |
| data | 额外请求参数 | object | {} |
| service | 服务对象（需有 list/page 方法） | object | - |
| enableContextMenu | 启用右键菜单 | boolean | true |
| enableRefresh | 启用刷新按钮 | boolean | true |
| enableKeySearch | 启用关键字搜索 | boolean | true |
| enableDrag | 启用拖拽排序（仅树形） | boolean | false |
| enableEdit | 右键菜单显示编辑 | boolean | true |
| enableDelete | 右键菜单显示删除 | boolean | true |
| custom | 右侧是否自定义（不要求左侧选中） | boolean | false |
| tree | 树形配置 | object | - |
| onSelect | 选中回调 | (item) => void | - |
| onEdit | 编辑回调 | (item?) => void | - |
| onDelete | 删除回调 | (item, {next}) => void | - |
| onData | 数据处理回调 | (list) => list | - |
| onContextMenu | 右键菜单回调 | (item) => object | - |

### Tree 配置

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| visible | 是否显示树形 | boolean | false |
| lazy | 是否懒加载 | boolean | false |
| props.label | 标签字段 | string | 'name' |
| props.children | 子节点字段 | string | 'children' |
| props.disabled | 禁用字段 | string | 'disabled' |
| props.isLeaf | 叶子节点字段 | string | 'isLeaf' |
| props.id | ID字段（用于选中状态判断） | string | 'id' |
| onLoad | 懒加载回调 | Function | - |
| allowDrag | 拖拽规则（返回是否允许拖拽该节点） | (node) => boolean | - |
| allowDrop | 放置规则（返回是否允许放置） | (draggingNode, dropNode, type) => boolean | - |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:selected | 选中项变化 | item |
| refresh | 刷新完成 | params |

## Slots

| 插槽名 | 说明 | 作用域 |
|--------|------|--------|
| left | 左侧完全自定义 | - |
| left-op | 左侧头部操作区 | - |
| right | 右侧内容区 | - |
| right-op | 右侧头部操作区 | - |
| title | 右侧标题 | { selected } |
| item | 左侧列表项 | { item, selected, index } |
| item-name | 左侧项名称 | { item, selected, index } |

## Expose

| 方法/属性 | 说明 | 类型 |
|-----------|------|------|
| list | 左侧列表数据 | Ref\<any[]\> |
| selected | 当前选中项 | Ref\<any\> |
| isExpand | 是否展开 | Ref\<boolean\> |
| expand | 展开/收起 | (val?: boolean) => void |
| select | 选中项 | (item) => void |
| refresh | 刷新左侧列表 | (params?) => Promise |
| edit | 编辑项 | (item?) => void |
| remove | 删除项 | (item) => void |

## 示例

### 用户管理（部门树 + 用户表）

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
<BtcCrudSearchKey placeholder="搜索用户名" />
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
// 根据部门 ID 刷新用户列表
userCrud.value?.refresh({ deptId: dept.id, page: 1 });
}
</script>
```

### 自动渲染左侧树形列表

```vue
<template>
<BtcViewGroup :options="options">
<template #right>
<BtcCrud ref="Crud" :service="userService">
<!-- CRUD 内容 -->
</BtcCrud>
</template>
</BtcViewGroup>
</template>

<script setup lang="ts">
const options = {
label: '部门',
title: '用户列表',
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

### 自定义左侧项渲染

```vue
<template>
<BtcViewGroup :options="options">
<template #item-name="{ item, selected }">
<el-icon><Folder /></el-icon>
<span>{{ item.name }}</span>
<el-tag v-if="item.count" size="small">{{ item.count }}</el-tag>
</template>

<template #right>
<!-- 右侧内容 -->
</template>
</BtcViewGroup>
</template>
```

### 懒加载树形结构

```vue
<script setup lang="ts">
const options = {
label: '菜单',
title: '详情',
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
return resolve([/* 根节点 */]);
}

const children = await menuService.list({ parentId: node.data.id });
resolve(children);
}
}
};
</script>
```

### 高级拖拽规则

```vue
<script setup lang="ts">
const options = {
label: '部门',
title: '用户列表',
service: departmentService,
enableDrag: true,
tree: {
visible: true,
props: {
label: 'name',
children: 'children',
},
// 不允许拖动一级节点
allowDrag: (node) => {
return node.data.parentId !== null;
},
// 只允许同级拖拽
allowDrop: (draggingNode, dropNode, type) => {
return draggingNode.data.parentId === dropNode.data.parentId;
}
},
onDragEnd(newList) {
// 保存新的排序
departmentService.updateOrder(newList);
}
};
</script>
```

### 删除确认与特殊逻辑

```vue
<script setup lang="ts">
import { BtcConfirm } from '@btc/shared-components';
const options = {
label: '部门',
service: departmentService,
tree: { visible: true },

// 删除部门时的特殊处理
onDelete(dept, { next, done }) {
BtcConfirm(
`删除"${dept.name}"时，该部门的用户如何处理？`,
'提示',
{
confirmButtonText: '直接删除',
cancelButtonText: '转移用户',
distinguishCancelAndClose: true,
type: 'warning'
}
)
.then(() => {
// 直接删除
next({ ids: [dept.id], deleteUsers: true });
})
.catch((action) => {
if (action === 'cancel') {
// 转移用户到上级部门
next({ ids: [dept.id], deleteUsers: false });
} else {
done(); // 取消操作
}
});
}
};
</script>
```

### 移动端适配

组件会自动检测屏幕尺寸：

- **桌面端**（> 768px）：左右分栏
- **移动端**（ 768px）：左侧默认隐藏，右下角显示悬浮按钮，点击展开左侧

## 与 cool-admin cl-view-group 的区别

| 特性 | cl-view-group | BtcViewGroup |
|------|---------------|--------------|
| 基础功能 | | |
| 树形结构 | | |
| 懒加载 | | |
| 响应式 | | |
| 右键菜单 | 内置 | 简化版（需外部） |
| 表单编辑 | 内置 cl-form | 需外部实现 |
| 依赖 | cool-vue/crud | 独立 |

**注意**：`BtcViewGroup` 简化了右键菜单和编辑功能，需要外部配合使用这样做的目的是：

1. **减少依赖**：不强制绑定特定的表单组件
2. **灵活性**：你可以使用任何表单组件（el-dialog + el-formBtcUpsert 等）
3. **统一性**：与 BTC 项目的其他组件风格一致

## 样式定制

组件使用 CSS 变量，自动适配 Element Plus 主题：

```scss
.btc-view-group {
--left-width: 300px; // 左侧宽度

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

## 注意事项

1. **Service 要求**：
- **树形数据**：需要 `list()` 方法，返回树形数组
- **列表数据**：需要 `page()` 方法，返回 `{ list, pagination }`

2. **自定义左侧**：提供 `#left` 插槽时，`service` 配置无效

3. **右键菜单**：简化版，建议使用外部上下文菜单组件

4. **编辑功能**：`config.onEdit` 回调中需自行实现表单弹窗

## 相关组件

- [BtcCrud](../../crud/README.md) - CRUD 上下文容器
- [BtcDialog](../dialog/index.vue) - 增强弹窗组件
- [BtcUpsert](../../crud/upsert/index.vue) - 表单组件


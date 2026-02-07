---
title: BtcForm 组件
type: package
project: components
owner: dev-team
created: '2025-10-12'
updated: '2025-10-13'
publish: true
tags:
- packages
- components
- form
sidebar_label: BtcForm
sidebar_order: 6
sidebar_group: packages
---
# BtcForm 组件

高级表单组件，对标 cool-admin 的 `cl-form`，提供完整的表单管理功能

## 特性

- 声明式表单配置
- 内置 el-dialog 弹窗
- 支持表单项动态控制
- 支持分组和标签页
- 支持数据转换 hooks
- 支持插件系统
- 完整的表单验证
- 支持表单重置和清空

## 基本用法

### 1. 引入组件

```vue
<template>
<BtcForm ref="formRef" />
</template>

<script setup>
import { ref } from 'vue';
import { useBtcForm } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';

const { Form } = useBtcForm();
</script>
```

### 2. 打开表单

```typescript
// 新增
function handleAdd() {
Form.value?.open({
title: '新增用户',
width: '800px',
items: [
{ prop: 'name', label: '姓名', span: 12, required: true, component: { name: 'el-input' } },
{ prop: 'email', label: '邮箱', span: 12, component: { name: 'el-input' } },
],
on: {
submit: async (data, { close, done }) => {
try {
await userService.add(data);
BtcMessage.success('保存成功');
close();
} catch (error) {
done();
}
}
}
});
}

// 编辑
function handleEdit(row) {
Form.value?.open({
title: '编辑用户',
width: '800px',
form: row, // 预填数据
items: [ /* ... */ ],
on: {
submit: async (data, { close, done }) => {
// ...
}
}
});
}
```

## 配置选项

### FormOptions

```typescript
interface FormOptions {
title?: string; // 对话框标题
width?: string; // 对话框宽度，默认 '50%'
height?: string; // 对话框高度
form?: Record<string, any>; // 预填表单数据
items: FormItem[]; // 表单项配置
props?: {
labelWidth?: string; // 标签宽度，默认 '100px'
labelPosition?: 'top' | 'left' | 'right'; // 标签位置，默认 'top'
};
op?: {
hidden?: boolean; // 隐藏底部按钮
saveButtonText?: string; // 保存按钮文字
closeButtonText?: string; // 关闭按钮文字
justify?: string; // 按钮对齐方式
buttons?: any[]; // 自定义按钮
};
on?: {
open?: (form) => void; // 打开回调
submit?: (data, { close, done }) => void; // 提交回调
close?: (action, done) => void; // 关闭前回调
closed?: () => void; // 关闭后回调
};
dialog?: Record<string, any>; // el-dialog 其他属性
}
```

### FormItem

```typescript
interface FormItem {
prop: string; // 字段名
label: string; // 标签
span?: number; // 栅格占据列数（1-24）
required?: boolean; // 是否必填
rules?: any; // 验证规则
hidden?: boolean | ((scope) => boolean); // 是否隐藏
component: {
name: string; // 组件名称
props?: Record<string, any>; // 组件属性
options?: any[]; // 选项数据（select/radio/checkbox）
};
children?: FormItem[]; // 子表单项
group?: string; // 分组名称（配合 tabs 使用）
}
```

## 高级功能

### 1. 下拉选项动态更新

```typescript
const options = ref([]);

// 获取选项数据
const fetchOptions = async () => {
options.value = await api.getOptions();
};

// 使用 computed 保持响应性
{
prop: 'category',
label: '分类',
component: {
name: 'el-select',
props: { clearable: true, filterable: true },
options: computed(() => options.value)
}
}
```

### 2. 表单项动态控制

```typescript
// 使用 Action API
const { Form } = useBtcForm();

// 显示/隐藏表单项
Form.value?.showItem('field1', 'field2');
Form.value?.hideItem('field3');

// 设置表单项选项
Form.value?.setOptions('category', newOptions);

// 设置表单项属性
Form.value?.setProps('name', { disabled: true });
```

### 3. 分组和标签页

```typescript
{
items: [
{
type: 'tabs',
value: 'basic',
props: {
labels: [
{ label: '基本信息', value: 'basic' },
{ label: '详细信息', value: 'detail' }
]
}
},
{ prop: 'name', label: '姓名', group: 'basic', component: { name: 'el-input' } },
{ prop: 'bio', label: '简介', group: 'detail', component: { name: 'el-input', props: { type: 'textarea' } } },
]
}
```

## 实例方法

| 方法 | 说明 | 参数 |
|------|------|------|
| `open(options)` | 打开表单 | `FormOptions` |
| `close(action?)` | 关闭表单 | `'close' \| 'save'` |
| `submit()` | 提交表单 | - |
| `reset()` | 重置表单 | - |
| `clear()` | 清空表单 | - |
| `validate()` | 验证表单 | - |
| `clearValidate()` | 清除验证 | - |

## 注意事项

1. **组件名称必须是字符串**：`component.name` 必须是组件的字符串名称，如 `'el-input'``'el-select'` 等
2. **动态选项使用 computed**：下拉选项如果是响应式数据，需要使用 `computed(() => options.value)` 包装
3. **表单验证**：`required: true` 会自动添加必填验证，复杂验证使用 `rules` 属性
4. **标签位置默认为 top**：为了更紧凑的布局，默认标签位置是 `top`，可通过 `props.labelPosition` 修改

## 与 BtcUpsert 的区别

| 特性 | BtcUpsert | BtcForm |
|------|-----------|---------|
| 使用方式 | 声明式（template） | 命令式（open 方法） |
| 表单配置 | Props 传递 | 方法参数 |
| 动态控制 | 较弱 | 强大的 Action API |
| 插件支持 | 无 | 支持 |
| 代码复用 | 较低 | 高（配置可复用） |

## 迁移指南

从 `BtcUpsert` 迁移到 `BtcForm`：

```vue
<!-- Before -->
<BtcUpsert ref="upsertRef" :items="formItems" :on-submit="handleSubmit" />

<!-- After -->
<BtcForm ref="Form" />

<script setup>
const { Form } = useBtcForm();

function openForm(row) {
Form.value?.open({
title: row ? '编辑' : '新增',
form: row,
items: [...],
on: { submit: handleSubmit }
});
}
</script>
```

## 相关组件

- `BtcFormCard` - 表单卡片（可折叠）
- `BtcFormTabs` - 表单标签页
- `BtcDialog` - 对话框组件（BtcForm 的底层依赖）

## 更多示例

查看 `apps/admin-app/src/pages/system/` 目录下的权限管理页面，了解更多实际使用案例


---
title: BtcUpsert 组件
type: package
project: components
owner: dev-team
created: '2025-10-12'
updated: '2025-10-13'
publish: true
tags:
- packages
- components
- upsert
sidebar_label: BtcUpsert
sidebar_order: 8
sidebar_group: packages
---
# BtcUpsert 组件

CRUD 专用表单组件，对标 cool-admin 的 `cl-upsert`

## 重要

**BtcUpsert 必须在 `<BtcCrud>` 组件内使用！**

如果您需要独立表单，请使用 `BtcForm` 组件

## 特性

- 专为 CRUD 场景优化
- 自动处理新增/编辑/详情模式
- 与 BtcCrud 深度集成
- 完整的生命周期钩子
- 支持动态表单项
- 支持 form-hook 数据转换
- 基于 BtcDialog（全屏/最小化）

## 基本用法

```vue
<template>
<BtcCrud ref="crudRef" :service="userService">
<BtcCrudRow>
<BtcRefreshBtn />
<BtcAddBtn /> <!-- 点击打开新增表单 -->
<BtcMultiDeleteBtn />
</BtcCrudRow>

<BtcCrudRow>
<BtcTable :columns="columns" />
</BtcCrudRow>

<BtcCrudRow>
<BtcPagination />
</BtcCrudRow>

<!-- BtcUpsert 组件 -->
<BtcUpsert
:items="formItems"
width="800px"
:on-submit="handleFormSubmit"
/>
</BtcCrud>
</template>

<script setup>
import { computed } from 'vue';
import type { FormItem } from '@btc/shared-components';
import { BtcMessage } from '@btc/shared-components';
import { BtcConfirm } from '@btc/shared-components';

const formItems = computed<FormItem[]>(() => [
{
prop: 'name',
label: '姓名',
span: 12,
required: true,
component: { name: 'el-input' }
},
{
prop: 'email',
label: '邮箱',
span: 12,
component: { name: 'el-input' }
},
]);

const handleFormSubmit = async (data, { close, done }) => {
try {
if (data.id) {
await userService.update(data);
} else {
await userService.add(data);
}
close();
crudRef.value?.crud.loadData();
BtcMessage.success('保存成功');
} catch (error) {
done(); // 恢复按钮状态
BtcMessage.error(error?.message || '保存失败');
}
};
</script>

## 配置选项

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `FormItem[]` | `[]` | 表单项配置 |
| `width` | `string \| number` | `'800px'` | 弹窗宽度 |
| `padding` | `string` | `'10px 20px'` | 内容padding |
| `labelWidth` | `string \| number` | `'100px'` | 标签宽度 |
| `labelPosition` | `'left' \| 'right' \| 'top'` | `'top'` | 标签位置 |
| `gutter` | `number` | `20` | 栅格间距 |
| `addTitle` | `string` | `'新增'` | 新增标题 |
| `editTitle` | `string` | `'编辑'` | 编辑标题 |
| `infoTitle` | `string` | `'详情'` | 详情标题 |
| `submitText` | `string` | `'确定'` | 提交按钮文字 |
| `cancelText` | `string` | `'取消'` | 取消按钮文字 |

### 生命周期钩子

| 钩子 | 参数 | 说明 | 触发时机 |
|------|------|------|----------|
| `onOpen` | `()` | 打开时 | 弹窗打开，数据加载前 |
| `onInfo` | `(row, { next, done })` | 获取详情 | 编辑/详情模式，加载数据 |
| `onOpened` | `(data)` | 打开后 | 数据加载完成 |
| `onSubmit` | `(data, { close, done, next })` | 提交 | 表单验证通过后 |
| `onClose` | `(action, done)` | 关闭前 | 点击取消/关闭 |
| `onClosed` | `()` | 关闭后 | 弹窗完全关闭 |

### FormItem 配置

```typescript
interface FormItem {
prop: string; // 字段名
label: string; // 标签
span?: number; // 栅格列数（1-24）
required?: boolean; // 是否必填
rules?: any; // 验证规则
value?: any; // 默认值
hidden?: boolean | ((data) => boolean); // 是否隐藏
hook?: any; // form-hook 转换
component?: {
name: string; // 组件名
props?: any; // 组件属性
options?: any[]; // 选项（select/radio/checkbox）
};
}
```

## 高级用法

### 1. 模式切换（add/update/info）

```vue
<BtcTable :columns="columns" />

<script setup>
const columns = [
// ...
{
type: 'op',
buttons: [
'edit', // 打开 update 模式
'info', // 打开 info 模式（只读）
'delete'
]
},
];
</script>
```

### 2. 详情获取钩子

```vue
<BtcUpsert
:items="formItems"
:on-info="handleInfo"
/>

<script setup>
const handleInfo = async (row, { next, done }) => {
// 方式1：使用默认 service.info
// const res = await next(row);

// 方式2：自定义接口
const res = await customApi.getUserDetail(row.id);

// 处理并返回数据
done({
...res,
name: `[VIP] ${res.name}`,
tags: res.tags.join(',')
});
};
</script>
```

### 3. 提交钩子

```vue
<BtcUpsert
:items="formItems"
:on-submit="handleSubmit"
/>

<script setup>
const handleSubmit = async (data, { next, close, done }) => {
try {
// 提交前处理
const processedData = {
...data,
tags: data.tags.split(','),
status: 1
};

// 调用默认接口（service.update/add）
await next(processedData);

// 提交后处理
BtcMessage.success('保存成功');
close();

} catch (error) {
done(); // 恢复按钮状态
}
};
</script>
```

### 4. 动态表单项

```vue
<script setup>
const upsertRef = ref();

const formItems = computed(() => [
{ prop: 'name', label: '姓名', component: { name: 'el-input' } },

// 函数返回：可访问 mode
() => {
return {
prop: 'password',
label: '密码',
// 编辑时隐藏
hidden: upsertRef.value?.mode === 'update',
component: { name: 'el-input', props: { type: 'password' } }
};
},

// 动态 disabled
() => {
return {
prop: 'email',
label: '邮箱',
component: {
name: 'el-input',
props: {
// 详情模式自动禁用，但也可以手动控制
disabled: upsertRef.value?.mode === 'info'
}
}
};
}
]);
</script>
```

### 5. 动态下拉选项

```vue
<script setup>
const options = ref([]);

// 获取选项
onMounted(async () => {
options.value = await api.getOptions();
});

const formItems = computed(() => [
{
prop: 'category',
label: '分类',
component: {
name: 'el-select',
props: { clearable: true, filterable: true },
options: options.value // 响应式选项
}
}
]);
</script>
```

### 6. 关闭确认

```vue
<BtcUpsert
:items="formItems"
:on-close="handleClose"
/>

<script setup>
const handleClose = (action, done) => {
if (action === 'close') {
BtcConfirm('表单未保存，确定关闭？', '提示', {
type: 'warning'
})
.then(() => done()) // 确认关闭
.catch(() => {}); // 取消
} else {
done(); // 保存后直接关闭
}
};
</script>
```

## 实例方法

通过 ref 访问：

```vue
<BtcUpsert ref="upsertRef" />

<script setup>
const upsertRef = ref();

// 访问表单实例
upsertRef.value?.formRef

// 访问表单数据
upsertRef.value?.formData

// 访问当前模式
upsertRef.value?.mode // 'add' | 'update' | 'info'
</script>
```

## 与 cool-admin cl-upsert 的对比

| 功能 | cl-upsert | BtcUpsert |
|------|-----------|-----------|
| 模式支持 | add/update/info | add/update/info |
| 生命周期钩子 | 6个 | 6个 |
| 动态表单项 | 函数返回 | 函数返回 |
| hook 转换 | 完整 | 简化版 |
| 插件系统 | | 计划中 |
| 分组/Tabs | | 计划中 |
| 实现方式 | TSX | Template |

## 注意事项

1. **必须在 BtcCrud 内**：BtcUpsert 依赖 CRUD 上下文
2. **默认 label-top**：为了紧凑布局，标签默认在上方
3. **响应式选项**：下拉选项使用 `ref` 即可，会自动响应更新
4. **mode 自动管理**：BtcCrud 自动设置 mode，无需手动控制

## 相关组件

- `BtcCrud` - CRUD 上下文容器
- `BtcTable` - 数据表格
- `BtcDialog` - 对话框（BtcUpsert 的底层）
- `BtcForm` - 独立表单组件

## 完整示例

查看 `apps/admin-app/src/pages/system/` 目录下的10个权限管理页面


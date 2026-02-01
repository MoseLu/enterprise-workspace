---
title: 表单开发指南
type: guide
project: components
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- form
- components
sidebar_label: 表单组件
sidebar_order: 2
sidebar_group: components
---

# 表单开发指南

基于 BTC 组件库的表单开发最佳实践

## 表单设计原则

- **数据驱动**：通过配置生成表单，减少模板代码
- **类型安全**：完整的 TypeScript 类型支持
- **验证统一**：统一的表单验证规则和错误处理
- **响应式布局**：自适应不同屏幕尺寸

## 基础表单

### 简单表单
```vue
<template>
<btc-form
:model="formData"
:items="formItems"
:rules="formRules"
@submit="handleSubmit"
/>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormItem, FormRules } from '@btc/shared-components'

// 表单数据
const formData = ref({
name: '',
email: '',
age: null
})

// 表单项配置
const formItems: FormItem[] = [
{
prop: 'name',
label: '姓名',
component: 'el-input',
required: true,
placeholder: '请输入姓名'
},
{
prop: 'email',
label: '邮箱',
component: 'el-input',
type: 'email',
required: true,
placeholder: '请输入邮箱'
},
{
prop: 'age',
label: '年龄',
component: 'el-input-number',
min: 0,
max: 120,
placeholder: '请输入年龄'
}
]

// 验证规则
const formRules: FormRules = {
name: [
{ required: true, message: '请输入姓名', trigger: 'blur' },
{ min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
],
email: [
{ required: true, message: '请输入邮箱', trigger: 'blur' },
{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
]
}

// 提交处理
function handleSubmit(data: any) {
console.log('表单数据:', data)
// 处理表单提交
}
</script>
```

### 复杂表单
```vue
<template>
<btc-form
:model="formData"
:items="formItems"
:rules="formRules"
:layout="layoutConfig"
@submit="handleSubmit"
@reset="handleReset"
>
<!-- 自定义表单项 -->
<template #custom-field="{ item, model }">
<el-upload
v-model:file-list="model.attachments"
action="/api/upload"
multiple
>
<el-button type="primary">上传附件</el-button>
</el-upload>
</template>
</btc-form>
</template>

<script setup lang="ts">
// 表单数据
const formData = ref({
title: '',
content: '',
category: '',
tags: [],
status: 'draft',
attachments: []
})

// 布局配置
const layoutConfig = {
labelWidth: '120px',
labelPosition: 'right',
colSpan: 24
}

// 表单项配置
const formItems: FormItem[] = [
{
prop: 'title',
label: '标题',
component: 'el-input',
required: true,
placeholder: '请输入标题'
},
{
prop: 'category',
label: '分类',
component: 'el-select',
required: true,
options: [
{ label: '技术', value: 'tech' },
{ label: '产品', value: 'product' },
{ label: '设计', value: 'design' }
],
placeholder: '请选择分类'
},
{
prop: 'content',
label: '内容',
component: 'el-input',
type: 'textarea',
rows: 6,
placeholder: '请输入内容'
},
{
prop: 'tags',
label: '标签',
component: 'el-select',
multiple: true,
filterable: true,
allowCreate: true,
placeholder: '请输入或选择标签'
},
{
prop: 'status',
label: '状态',
component: 'el-radio-group',
options: [
{ label: '草稿', value: 'draft' },
{ label: '发布', value: 'published' }
]
},
{
prop: 'attachments',
label: '附件',
component: 'custom-field',
slot: 'custom-field'
}
]

// 验证规则
const formRules: FormRules = {
title: [
{ required: true, message: '请输入标题', trigger: 'blur' },
{ min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
],
category: [
{ required: true, message: '请选择分类', trigger: 'change' }
],
content: [
{ required: true, message: '请输入内容', trigger: 'blur' },
{ min: 10, message: '内容至少 10 个字符', trigger: 'blur' }
]
}

// 提交处理
function handleSubmit(data: any) {
console.log('表单数据:', data)
// 处理表单提交
}

// 重置处理
function handleReset() {
console.log('表单已重置')
}
</script>
```

## 表单项配置

### 基础配置 (FormItem)
```typescript
interface FormItem {
prop: string // 字段名
label: string // 标签
component: string // 组件类型
type?: string // 输入类型
placeholder?: string // 占位符
required?: boolean // 是否必填
disabled?: boolean // 是否禁用
readonly?: boolean // 是否只读
options?: Array<{label: string, value: any}> // 选项
rules?: any[] // 验证规则
span?: number // 栅格占位
offset?: number // 栅格偏移
slot?: string // 插槽名
}
```

### 组件类型支持
```typescript
// 支持的组件类型
type ComponentType =
| 'el-input' // 输入框
| 'el-input-number' // 数字输入框
| 'el-select' // 选择器
| 'el-radio-group' // 单选框组
| 'el-checkbox-group' // 复选框组
| 'el-date-picker' // 日期选择器
| 'el-time-picker' // 时间选择器
| 'el-switch' // 开关
| 'el-rate' // 评分
| 'el-slider' // 滑块
| 'el-color-picker' // 颜色选择器
| 'el-cascader' // 级联选择器
| 'el-transfer' // 穿梭框
```

## 布局配置

### 栅格布局
```typescript
// 布局配置
const layoutConfig = {
labelWidth: '120px', // 标签宽度
labelPosition: 'right', // 标签位置
colSpan: 24, // 默认栅格占位
gutter: 20 // 栅格间隔
}

// 表单项栅格配置
const formItems: FormItem[] = [
{
prop: 'name',
label: '姓名',
component: 'el-input',
span: 12 // 占 12 列
},
{
prop: 'email',
label: '邮箱',
component: 'el-input',
span: 12 // 占 12 列
},
{
prop: 'address',
label: '地址',
component: 'el-input',
span: 24 // 占 24 列（全宽）
}
]
```

### 分组布局
```vue
<template>
<btc-form
:model="formData"
:groups="formGroups"
:rules="formRules"
@submit="handleSubmit"
/>
</template>

<script setup lang="ts">
// 表单分组
const formGroups = [
{
title: '基本信息',
items: [
{ prop: 'name', label: '姓名', component: 'el-input' },
{ prop: 'email', label: '邮箱', component: 'el-input' }
]
},
{
title: '详细信息',
items: [
{ prop: 'address', label: '地址', component: 'el-input' },
{ prop: 'phone', label: '电话', component: 'el-input' }
]
}
]
</script>
```

## 表单验证

### 内置验证规则
```typescript
// 验证规则配置
const formRules: FormRules = {
name: [
{ required: true, message: '请输入姓名', trigger: 'blur' },
{ min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
],
email: [
{ required: true, message: '请输入邮箱', trigger: 'blur' },
{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
],
age: [
{ type: 'number', min: 0, max: 120, message: '年龄必须在 0 到 120 之间', trigger: 'blur' }
],
phone: [
{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
]
}
```

### 自定义验证
```typescript
// 自定义验证函数
const customValidator = (rule: any, value: any, callback: any) => {
if (value && value.length < 3) {
callback(new Error('至少输入3个字符'))
} else {
callback()
}
}

const formRules: FormRules = {
customField: [
{ validator: customValidator, trigger: 'blur' }
]
}
```

## 动态表单

### 条件显示
```typescript
// 条件显示配置
const formItems: FormItem[] = [
{
prop: 'type',
label: '类型',
component: 'el-select',
options: [
{ label: '个人', value: 'personal' },
{ label: '企业', value: 'company' }
]
},
{
prop: 'companyName',
label: '公司名称',
component: 'el-input',
show: (model: any) => model.type === 'company' // 条件显示
},
{
prop: 'personalName',
label: '个人姓名',
component: 'el-input',
show: (model: any) => model.type === 'personal' // 条件显示
}
]
```

### 动态选项
```typescript
// 动态选项配置
const formItems: FormItem[] = [
{
prop: 'province',
label: '省份',
component: 'el-select',
options: [], // 动态加载
onChange: (value: any, model: any) => {
// 省份改变时，重新加载城市选项
loadCities(value).then(cities => {
// 更新城市选项
model.cityOptions = cities
model.city = '' // 重置城市选择
})
}
},
{
prop: 'city',
label: '城市',
component: 'el-select',
options: (model: any) => model.cityOptions || [] // 动态选项
}
]
```

## 相关文档

- [组件开发指南](./index.md)
- [CRUD 组件指南](./crud.md)
- [表单组件文档](../components/form.md)

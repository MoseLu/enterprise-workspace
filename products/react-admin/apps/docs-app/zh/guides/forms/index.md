---
title: 表单处理指南
type: guide
project: forms
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- forms
- development
sidebar_label: 表单处理
sidebar_order: 4
sidebar_group: forms
---

# 表单处理指南

表单系统的开发规范和处理流程

## 表单系统概览

BTC 表单系统基于 Element Plus 构建，提供完整的表单开发验证提交和数据处理能力

## 表单类型

### 基础表单
- **数据收集表单**：用户信息配置设置等
- **搜索表单**：数据筛选条件查询等
- **登录表单**：用户认证权限验证等

### 动态表单
- **条件表单**：根据用户选择动态显示字段
- **分步表单**：多步骤数据收集流程
- **向导表单**：引导式数据录入

### 业务表单
- **CRUD 表单**：数据的创建编辑查看
- **审批表单**：工作流审批流程
- **报表表单**：数据查询和导出

## 开发流程

### 1. 表单设计
```typescript
// 定义表单数据结构
export interface UserFormData {
id?: number
name: string
email: string
role: 'admin' | 'user'
department?: string
avatar?: string
status: 'active' | 'inactive'
}

// 定义表单配置
export interface FormConfig {
title: string
mode: 'create' | 'edit' | 'view'
layout: 'horizontal' | 'vertical'
labelWidth: string
rules: FormRules
}
```

### 2. 表单实现
```vue
<template>
<div class="form-container">
<el-form
ref="formRef"
:model="formData"
:rules="formRules"
:label-width="labelWidth"
:label-position="labelPosition"
>
<el-form-item label="姓名" prop="name">
<el-input
v-model="formData.name"
placeholder="请输入姓名"
:disabled="mode === 'view'"
/>
</el-form-item>

<el-form-item label="邮箱" prop="email">
<el-input
v-model="formData.email"
type="email"
placeholder="请输入邮箱"
:disabled="mode === 'view'"
/>
</el-form-item>

<el-form-item label="角色" prop="role">
<el-select
v-model="formData.role"
placeholder="请选择角色"
:disabled="mode === 'view'"
>
<el-option label="管理员" value="admin" />
<el-option label="普通用户" value="user" />
</el-select>
</el-form-item>

<el-form-item v-if="mode !== 'view'">
<el-button type="primary" @click="handleSubmit">
{{ mode === 'create' ? '创建' : '更新' }}
</el-button>
<el-button @click="handleReset">重置</el-button>
</el-form-item>
</el-form>
</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { BtcMessage } from '@btc/shared-components';

// Props
interface Props {
data?: UserFormData
mode?: 'create' | 'edit' | 'view'
}

const props = withDefaults(defineProps<Props>(), {
mode: 'create'
})

// Emits
const emit = defineEmits<{
submit: [data: UserFormData]
reset: []
}>()

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<UserFormData>({
name: props.data?.name || '',
email: props.data?.email || '',
role: props.data?.role || 'user',
department: props.data?.department || '',
avatar: props.data?.avatar || '',
status: props.data?.status || 'active'
})

// 验证规则
const formRules: FormRules = {
name: [
{ required: true, message: '请输入姓名', trigger: 'blur' },
{ min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
],
email: [
{ required: true, message: '请输入邮箱', trigger: 'blur' },
{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
],
role: [
{ required: true, message: '请选择角色', trigger: 'change' }
]
}

// 计算属性
const labelWidth = computed(() => {
return props.mode === 'view' ? '100px' : '120px'
})

const labelPosition = computed(() => {
return props.mode === 'view' ? 'left' : 'right'
})

// 方法
async function handleSubmit() {
if (!formRef.value) return

try {
await formRef.value.validate()
emit('submit', { ...formData })
} catch (error) {
console.error('表单验证失败:', error)
}
}

function handleReset() {
if (!formRef.value) return

formRef.value.resetFields()
emit('reset')
}

// 暴露方法
defineExpose({
validate: () => formRef.value?.validate(),
resetFields: () => formRef.value?.resetFields(),
submit: handleSubmit
})
</script>
```

### 3. 表单验证
```typescript
// 自定义验证器
export const validators = {
// 手机号验证
phone: (rule: any, value: string, callback: any) => {
const phoneRegex = /^1[3-9]\d{9}$/
if (value && !phoneRegex.test(value)) {
callback(new Error('请输入正确的手机号码'))
} else {
callback()
}
},

// 身份证验证
idCard: (rule: any, value: string, callback: any) => {
const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
if (value && !idCardRegex.test(value)) {
callback(new Error('请输入正确的身份证号码'))
} else {
callback()
}
},

// 密码强度验证
password: (rule: any, value: string, callback: any) => {
if (value) {
const hasUpperCase = /[A-Z]/.test(value)
const hasLowerCase = /[a-z]/.test(value)
const hasNumbers = /\d/.test(value)
const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)

if (value.length < 8) {
callback(new Error('密码至少8位'))
} else if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
callback(new Error('密码必须包含大小写字母数字和特殊字符'))
} else {
callback()
}
} else {
callback()
}
}
}
```

### 4. 表单提交
```typescript
// 表单提交处理
export class FormHandler {
// 提交前处理
static async beforeSubmit(data: any): Promise<any> {
// 数据清理
const cleanedData = { ...data }

// 移除空值
Object.keys(cleanedData).forEach(key => {
if (cleanedData[key] === '' || cleanedData[key] === null) {
delete cleanedData[key]
}
})

// 数据转换
if (cleanedData.date) {
cleanedData.date = new Date(cleanedData.date).toISOString()
}

return cleanedData
}

// 提交处理
static async submit(data: any, api: string): Promise<any> {
try {
const processedData = await this.beforeSubmit(data)
const response = await request.post(api, processedData)
return response.data
} catch (error) {
console.error('表单提交失败:', error)
throw error
}
}

// 提交后处理
static afterSubmit(response: any, mode: string) {
const message = mode === 'create' ? '创建成功' : '更新成功'
BtcMessage.success(message)

// 触发刷新事件
window.dispatchEvent(new CustomEvent('form-submitted', {
detail: { response, mode }
}))
}
}
```

## 表单样式

### 主题定制
```scss
// 表单主题样式
.form-container {
padding: 20px;
background: var(--el-bg-color-page);
border-radius: 8px;

.el-form {
.el-form-item {
margin-bottom: 20px;

.el-form-item__label {
color: var(--el-text-color-primary);
font-weight: 500;
}

.el-form-item__content {
.el-input,
.el-select,
.el-date-picker {
width: 100%;
}
}
}

.el-form-item__error {
color: var(--el-color-danger);
font-size: 12px;
margin-top: 4px;
}
}

// 表单按钮组
.form-actions {
display: flex;
justify-content: center;
gap: 12px;
margin-top: 30px;
padding-top: 20px;
border-top: 1px solid var(--el-border-color-lighter);
}
}
```

### 响应式布局
```scss
// 响应式表单布局
.form-container {
@media (max-width: 768px) {
padding: 16px;

.el-form {
.el-form-item {
.el-form-item__label {
width: 100% !important;
text-align: left !important;
margin-bottom: 8px;
}

.el-form-item__content {
margin-left: 0 !important;
}
}
}
}
}
```

## 数据处理

### 数据转换
```typescript
// 表单数据转换工具
export class FormDataTransformer {
// 日期转换
static transformDate(data: any, fields: string[]) {
const transformed = { ...data }
fields.forEach(field => {
if (transformed[field]) {
transformed[field] = new Date(transformed[field]).toISOString()
}
})
return transformed
}

// 数字转换
static transformNumber(data: any, fields: string[]) {
const transformed = { ...data }
fields.forEach(field => {
if (transformed[field]) {
transformed[field] = Number(transformed[field])
}
})
return transformed
}

// 布尔值转换
static transformBoolean(data: any, fields: string[]) {
const transformed = { ...data }
fields.forEach(field => {
if (transformed[field] !== undefined) {
transformed[field] = Boolean(transformed[field])
}
})
return transformed
}
}
```

### 数据验证
```typescript
// 服务端数据验证
export class ServerValidator {
// 异步验证
static async validateField(field: string, value: any): Promise<boolean> {
try {
const response = await request.post('/api/validate', { field, value })
return response.data.valid
} catch (error) {
console.error('字段验证失败:', error)
return false
}
}

// 批量验证
static async validateForm(data: any): Promise<ValidationResult> {
try {
const response = await request.post('/api/validate-form', data)
return response.data
} catch (error) {
console.error('表单验证失败:', error)
return { valid: false, errors: {} }
}
}
}
```

## 测试策略

### 单元测试
```typescript
import { mount } from '@vue/test-utils'
import UserForm from './UserForm.vue'

describe('UserForm', () => {
it('should render form fields correctly', () => {
const wrapper = mount(UserForm, {
props: { mode: 'create' }
})

expect(wrapper.find('[prop="name"]').exists()).toBe(true)
expect(wrapper.find('[prop="email"]').exists()).toBe(true)
expect(wrapper.find('[prop="role"]').exists()).toBe(true)
})

it('should validate required fields', async () => {
const wrapper = mount(UserForm)
const form = wrapper.findComponent({ name: 'ElForm' })

await form.vm.validate()
expect(form.vm.validate()).rejects.toThrow()
})

it('should handle form submission', async () => {
const wrapper = mount(UserForm, {
props: { mode: 'create' }
})

const submitBtn = wrapper.find('[data-test="submit-btn"]')
await submitBtn.trigger('click')

// 验证提交逻辑
})
})
```

## 相关文档

- [组件开发指南](../components/index.md)
- [表单组件文档](../components/form.md)
- [CRUD 组件指南](../components/crud.md)

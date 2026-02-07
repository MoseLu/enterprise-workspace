---
title: CRUD 组件开发指南
type: guide
project: components
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- crud
- components
sidebar_label: CRUD 组件
sidebar_order: 1
sidebar_group: components
---

# CRUD 组件开发指南

基于 BTC 组件库的 CRUD 页面开发流程和最佳实践

## 开发流程

### 1. 数据模型设计
```typescript
// 定义数据接口
export interface User {
id: number
name: string
email: string
role: 'admin' | 'user'
createdAt: Date
updatedAt: Date
}

// 定义查询参数
export interface UserQuery {
page: number
pageSize: number
name?: string
role?: string
}
```

### 2. API 服务定义
```typescript
// 用户服务
export class UserService {
// 获取用户列表
static async getList(query: UserQuery): Promise<PageResult<User>> {
return request.get('/api/users', { params: query })
}

// 获取用户详情
static async getDetail(id: number): Promise<User> {
return request.get(`/api/users/${id}`)
}

// 创建用户
static async create(data: CreateUserDto): Promise<User> {
return request.post('/api/users', data)
}

// 更新用户
static async update(id: number, data: UpdateUserDto): Promise<User> {
return request.put(`/api/users/${id}`, data)
}

// 删除用户
static async delete(id: number): Promise<void> {
return request.delete(`/api/users/${id}`)
}
}
```

### 3. CRUD 页面实现
```vue
<template>
<btc-crud
:service="UserService"
:columns="columns"
:search-items="searchItems"
:form-items="formItems"
:table-ops="tableOps"
>
<!-- 自定义工具栏 -->
<template #toolbar>
<el-button type="primary" @click="handleExport">
导出数据
</el-button>
</template>

<!-- 自定义表格操作 -->
<template #table-ops="{ row }">
<el-button
type="primary"
size="small"
@click="handleView(row)"
>
查看详情
</el-button>
</template>
</btc-crud>
</template>

<script setup lang="ts">
import { UserService } from './service'
import type { CrudColumn, CrudSearchItem, CrudFormItem } from '@btc/shared-components'

// 表格列配置
const columns: CrudColumn[] = [
{ prop: 'id', label: 'ID', width: 80 },
{ prop: 'name', label: '用户名', minWidth: 120 },
{ prop: 'email', label: '邮箱', minWidth: 180 },
{ prop: 'role', label: '角色', width: 100 },
{ prop: 'createdAt', label: '创建时间', width: 160 }
]

// 搜索项配置
const searchItems: CrudSearchItem[] = [
{ prop: 'name', label: '用户名', component: 'el-input' },
{ prop: 'role', label: '角色', component: 'el-select', options: [
{ label: '管理员', value: 'admin' },
{ label: '普通用户', value: 'user' }
]}
]

// 表单项配置
const formItems: CrudFormItem[] = [
{ prop: 'name', label: '用户名', component: 'el-input', required: true },
{ prop: 'email', label: '邮箱', component: 'el-input', type: 'email', required: true },
{ prop: 'role', label: '角色', component: 'el-select', options: [
{ label: '管理员', value: 'admin' },
{ label: '普通用户', value: 'user' }
], required: true }
]

// 表格操作配置
const tableOps = ['edit', 'delete']

// 自定义操作处理
function handleView(row: User) {
// 查看详情逻辑
}

function handleExport() {
// 导出数据逻辑
}
</script>
```

## 配置选项

### 表格列配置 (CrudColumn)
```typescript
interface CrudColumn {
prop: string // 字段名
label: string // 列标题
width?: number // 列宽度
minWidth?: number // 最小宽度
fixed?: 'left' | 'right' // 固定列
sortable?: boolean // 是否可排序
formatter?: (row: any) => string // 格式化函数
component?: string // 自定义组件
}
```

### 搜索项配置 (CrudSearchItem)
```typescript
interface CrudSearchItem {
prop: string // 字段名
label: string // 标签
component: string // 组件类型
placeholder?: string // 占位符
options?: Array<{label: string, value: any}> // 选项
span?: number // 栅格占位
}
```

### 表单项配置 (CrudFormItem)
```typescript
interface CrudFormItem {
prop: string // 字段名
label: string // 标签
component: string // 组件类型
type?: string // 输入类型
required?: boolean // 是否必填
rules?: any[] // 验证规则
options?: Array<{label: string, value: any}> // 选项
span?: number // 栅格占位
}
```

## 自定义样式

### 主题定制
```scss
// 自定义 CRUD 样式
.btc-crud {
// 表格样式
.el-table {
border-radius: 8px;
}

// 搜索表单样式
.search-form {
background: var(--el-bg-color-page);
padding: 20px;
border-radius: 8px;
margin-bottom: 20px;
}

// 工具栏样式
.toolbar {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 20px;
}
}
```

## 数据流管理

### 状态管理
```typescript
// 使用 Pinia 管理 CRUD 状态
export const useUserStore = defineStore('user', () => {
const users = ref<User[]>([])
const loading = ref(false)
const total = ref(0)

// 获取用户列表
async function fetchUsers(query: UserQuery) {
loading.value = true
try {
const result = await UserService.getList(query)
users.value = result.data
total.value = result.total
} finally {
loading.value = false
}
}

return {
users,
loading,
total,
fetchUsers
}
})
```

### 事件处理
```typescript
// CRUD 事件处理
function handleCrudEvent(event: CrudEvent) {
switch (event.type) {
case 'create':
// 创建后处理
break
case 'update':
// 更新后处理
break
case 'delete':
// 删除后处理
break
}
}
```

## 测试策略

### 单元测试
```typescript
import { mount } from '@vue/test-utils'
import UserCrud from './UserCrud.vue'

describe('UserCrud', () => {
it('should render table with correct columns', () => {
const wrapper = mount(UserCrud)
const table = wrapper.findComponent({ name: 'ElTable' })
expect(table.exists()).toBe(true)
})

it('should handle search correctly', async () => {
const wrapper = mount(UserCrud)
const searchBtn = wrapper.find('[data-test="search-btn"]')
await searchBtn.trigger('click')
// 验证搜索逻辑
})
})
```

### 集成测试
- 测试数据加载和显示
- 测试搜索和筛选功能
- 测试表单提交和验证
- 测试删除确认流程

## 相关文档

- [组件开发指南](./index.md)
- [表单开发指南](./form.md)
- [表格组件文档](../components/table.md)

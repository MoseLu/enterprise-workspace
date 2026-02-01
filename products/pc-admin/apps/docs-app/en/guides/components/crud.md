---
title: CRUD Component Development Guide
type: guide
project: components
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- crud
- components
sidebar_label: CRUD Component
sidebar_order: 1
sidebar_group: components
---

# CRUD Component Development Guide

CRUD page development process and best practices based on BTC component library.

## Development Process

### 1. Data Model Design
```typescript
// Define data interface
export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: Date
  updatedAt: Date
}

// Define query parameters
export interface UserQuery {
  page: number
  pageSize: number
  name?: string
  role?: string
}
```

### 2. API Service Definition
```typescript
// User service
export class UserService {
  // Get user list
  static async getList(query: UserQuery): Promise<PageResult<User>> {
    return request.get('/api/users', { params: query })
  }

  // Get user details
  static async getDetail(id: number): Promise<User> {
    return request.get(`/api/users/${id}`)
  }

  // Create user
  static async create(data: CreateUserDto): Promise<User> {
    return request.post('/api/users', data)
  }

  // Update user
  static async update(id: number, data: UpdateUserDto): Promise<User> {
    return request.put(`/api/users/${id}`, data)
  }

  // Delete user
  static async delete(id: number): Promise<void> {
    return request.delete(`/api/users/${id}`)
  }
}
```

### 3. CRUD Page Implementation
```vue
<template>
  <btc-crud
    :service="UserService"
    :columns="columns"
    :search-items="searchItems"
    :form-items="formItems"
    :table-ops="tableOps"
  >
    <!-- Custom toolbar -->
    <template #toolbar>
      <el-button type="primary" @click="handleExport">
        Export Data
      </el-button>
    </template>

    <!-- Custom table operations -->
    <template #table-ops="{ row }">
      <el-button
        type="primary"
        size="small"
        @click="handleView(row)"
      >
        View Details
      </el-button>
    </template>
  </btc-crud>
</template>

<script setup lang="ts">
import { UserService } from './service'
import type { CrudColumn, CrudSearchItem, CrudFormItem } from '@btc/shared-components'

// Table column configuration
const columns: CrudColumn[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: 'Username', minWidth: 120 },
  { prop: 'email', label: 'Email', minWidth: 180 },
  { prop: 'role', label: 'Role', width: 100 },
  { prop: 'createdAt', label: 'Created At', width: 160 }
]

// Search items configuration
const searchItems: CrudSearchItem[] = [
  { prop: 'name', label: 'Username', component: 'el-input' },
  { prop: 'role', label: 'Role', component: 'el-select', options: [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' }
  ]}
]

// Form items configuration
const formItems: CrudFormItem[] = [
  { prop: 'name', label: 'Username', component: 'el-input', required: true },
  { prop: 'email', label: 'Email', component: 'el-input', type: 'email', required: true },
  { prop: 'role', label: 'Role', component: 'el-select', options: [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' }
  ], required: true }
]

// Table operations configuration
const tableOps = ['edit', 'delete']

// Custom operation handlers
function handleView(row: User) {
  // View details logic
}

function handleExport() {
  // Export data logic
}
</script>
```

## Configuration Options

### Table Column Configuration (CrudColumn)
```typescript
interface CrudColumn {
  prop: string // Field name
  label: string // Column title
  width?: number // Column width
  minWidth?: number // Minimum width
  fixed?: 'left' | 'right' // Fixed column
  sortable?: boolean // Sortable
  formatter?: (row: any) => string // Formatter function
  component?: string // Custom component
}
```

### Search Item Configuration (CrudSearchItem)
```typescript
interface CrudSearchItem {
  prop: string // Field name
  label: string // Label
  component: string // Component type
  placeholder?: string // Placeholder
  options?: Array<{label: string, value: any}> // Options
  span?: number // Grid span
}
```

### Form Item Configuration (CrudFormItem)
```typescript
interface CrudFormItem {
  prop: string // Field name
  label: string // Label
  component: string // Component type
  type?: string // Input type
  required?: boolean // Required
  rules?: any[] // Validation rules
  options?: Array<{label: string, value: any}> // Options
  span?: number // Grid span
}
```

## Custom Styles

### Theme Customization
```scss
// Custom CRUD styles
.btc-crud {
  // Table styles
  .el-table {
    border-radius: 8px;
  }

  // Search form styles
  .search-form {
    background: var(--el-bg-color-page);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  // Toolbar styles
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
}
```

## Data Flow Management

### State Management
```typescript
// Use Pinia to manage CRUD state
export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const total = ref(0)

  // Get user list
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

### Event Handling
```typescript
// CRUD event handling
function handleCrudEvent(event: CrudEvent) {
  switch (event.type) {
    case 'create':
      // Post-create handling
      break
    case 'update':
      // Post-update handling
      break
    case 'delete':
      // Post-delete handling
      break
  }
}
```

## Testing Strategy

### Unit Testing
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
    // Verify search logic
  })
})
```

### Integration Testing
- Test data loading and display
- Test search and filter functionality
- Test form submission and validation
- Test delete confirmation flow

## Related Documentation

- [Component Development Guide](./index.md)
- [Form Development Guide](./form.md)
- [Table Component Documentation](../components/table.md)

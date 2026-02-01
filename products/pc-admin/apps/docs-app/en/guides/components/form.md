---
title: Form Development Guide
type: guide
project: components
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- form
- components
sidebar_label: Form Component
sidebar_order: 2
sidebar_group: components
---

# Form Development Guide

Form development best practices based on BTC component library.

## Form Design Principles

- **Data-Driven**: Generate forms through configuration, reduce template code
- **Type Safety**: Complete TypeScript type support
- **Unified Validation**: Unified form validation rules and error handling
- **Responsive Layout**: Adaptive to different screen sizes

## Basic Forms

### Simple Form
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

// Form data
const formData = ref({
  name: '',
  email: '',
  age: null
})

// Form items configuration
const formItems: FormItem[] = [
  {
    prop: 'name',
    label: 'Name',
    component: 'el-input',
    required: true,
    placeholder: 'Please enter name'
  },
  {
    prop: 'email',
    label: 'Email',
    component: 'el-input',
    type: 'email',
    required: true,
    placeholder: 'Please enter email'
  },
  {
    prop: 'age',
    label: 'Age',
    component: 'el-input-number',
    min: 0,
    max: 120,
    placeholder: 'Please enter age'
  }
]

// Validation rules
const formRules: FormRules = {
  name: [
    { required: true, message: 'Please enter name', trigger: 'blur' },
    { min: 2, max: 20, message: 'Name length should be 2-20 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter valid email format', trigger: 'blur' }
  ]
}

// Submit handler
function handleSubmit(data: any) {
  console.log('Form data:', data)
  // Handle form submission
}
</script>
```

### Complex Form
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
    <!-- Custom form item -->
    <template #custom-field="{ item, model }">
      <el-upload
        v-model:file-list="model.attachments"
        action="/api/upload"
        multiple
      >
        <el-button type="primary">Upload Attachment</el-button>
      </el-upload>
    </template>
  </btc-form>
</template>

<script setup lang="ts">
// Form data
const formData = ref({
  title: '',
  content: '',
  category: '',
  tags: [],
  status: 'draft',
  attachments: []
})

// Layout configuration
const layoutConfig = {
  labelWidth: '120px',
  labelPosition: 'right',
  colSpan: 24
}

// Form items configuration
const formItems: FormItem[] = [
  {
    prop: 'title',
    label: 'Title',
    component: 'el-input',
    required: true,
    placeholder: 'Please enter title'
  },
  {
    prop: 'category',
    label: 'Category',
    component: 'el-select',
    required: true,
    options: [
      { label: 'Tech', value: 'tech' },
      { label: 'Product', value: 'product' },
      { label: 'Design', value: 'design' }
    ],
    placeholder: 'Please select category'
  },
  {
    prop: 'content',
    label: 'Content',
    component: 'el-input',
    type: 'textarea',
    rows: 6,
    placeholder: 'Please enter content'
  },
  {
    prop: 'tags',
    label: 'Tags',
    component: 'el-select',
    multiple: true,
    filterable: true,
    allowCreate: true,
    placeholder: 'Please enter or select tags'
  },
  {
    prop: 'status',
    label: 'Status',
    component: 'el-radio-group',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Published', value: 'published' }
    ]
  },
  {
    prop: 'attachments',
    label: 'Attachments',
    component: 'custom-field',
    slot: 'custom-field'
  }
]

// Validation rules
const formRules: FormRules = {
  title: [
    { required: true, message: 'Please enter title', trigger: 'blur' },
    { min: 5, max: 100, message: 'Title length should be 5-100 characters', trigger: 'blur' }
  ],
  category: [
    { required: true, message: 'Please select category', trigger: 'change' }
  ],
  content: [
    { required: true, message: 'Please enter content', trigger: 'blur' },
    { min: 10, message: 'Content should be at least 10 characters', trigger: 'blur' }
  ]
}

// Submit handler
function handleSubmit(data: any) {
  console.log('Form data:', data)
  // Handle form submission
}

// Reset handler
function handleReset() {
  console.log('Form reset')
}
</script>
```

## Form Item Configuration

### Basic Configuration (FormItem)
```typescript
interface FormItem {
  prop: string // Field name
  label: string // Label
  component: string // Component type
  type?: string // Input type
  placeholder?: string // Placeholder
  required?: boolean // Required
  disabled?: boolean // Disabled
  readonly?: boolean // Readonly
  options?: Array<{label: string, value: any}> // Options
  rules?: any[] // Validation rules
  span?: number // Grid span
  offset?: number // Grid offset
  slot?: string // Slot name
}
```

### Supported Component Types
```typescript
// Supported component types
type ComponentType =
  | 'el-input' // Input
  | 'el-input-number' // Number input
  | 'el-select' // Select
  | 'el-radio-group' // Radio group
  | 'el-checkbox-group' // Checkbox group
  | 'el-date-picker' // Date picker
  | 'el-time-picker' // Time picker
  | 'el-switch' // Switch
  | 'el-rate' // Rate
  | 'el-slider' // Slider
  | 'el-color-picker' // Color picker
  | 'el-cascader' // Cascader
  | 'el-transfer' // Transfer
```

## Layout Configuration

### Grid Layout
```typescript
// Layout configuration
const layoutConfig = {
  labelWidth: '120px', // Label width
  labelPosition: 'right', // Label position
  colSpan: 24, // Default grid span
  gutter: 20 // Grid gutter
}

// Form item grid configuration
const formItems: FormItem[] = [
  {
    prop: 'name',
    label: 'Name',
    component: 'el-input',
    span: 12 // 12 columns
  },
  {
    prop: 'email',
    label: 'Email',
    component: 'el-input',
    span: 12 // 12 columns
  },
  {
    prop: 'address',
    label: 'Address',
    component: 'el-input',
    span: 24 // 24 columns (full width)
  }
]
```

### Grouped Layout
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
// Form groups
const formGroups = [
  {
    title: 'Basic Information',
    items: [
      { prop: 'name', label: 'Name', component: 'el-input' },
      { prop: 'email', label: 'Email', component: 'el-input' }
    ]
  },
  {
    title: 'Detailed Information',
    items: [
      { prop: 'address', label: 'Address', component: 'el-input' },
      { prop: 'phone', label: 'Phone', component: 'el-input' }
    ]
  }
]
</script>
```

## Form Validation

### Built-in Validation Rules
```typescript
// Validation rules configuration
const formRules: FormRules = {
  name: [
    { required: true, message: 'Please enter name', trigger: 'blur' },
    { min: 2, max: 20, message: 'Name length should be 2-20 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter valid email format', trigger: 'blur' }
  ],
  age: [
    { type: 'number', min: 0, max: 120, message: 'Age must be between 0-120', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: 'Please enter valid phone number', trigger: 'blur' }
  ]
}
```

### Custom Validation
```typescript
// Custom validation function
const customValidator = (rule: any, value: any, callback: any) => {
  if (value && value.length < 3) {
    callback(new Error('At least 3 characters'))
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

## Dynamic Forms

### Conditional Display
```typescript
// Conditional display configuration
const formItems: FormItem[] = [
  {
    prop: 'type',
    label: 'Type',
    component: 'el-select',
    options: [
      { label: 'Personal', value: 'personal' },
      { label: 'Company', value: 'company' }
    ]
  },
  {
    prop: 'companyName',
    label: 'Company Name',
    component: 'el-input',
    show: (model: any) => model.type === 'company' // Conditional display
  },
  {
    prop: 'personalName',
    label: 'Personal Name',
    component: 'el-input',
    show: (model: any) => model.type === 'personal' // Conditional display
  }
]
```

### Dynamic Options
```typescript
// Dynamic options configuration
const formItems: FormItem[] = [
  {
    prop: 'province',
    label: 'Province',
    component: 'el-select',
    options: [], // Dynamic load
    onChange: (value: any, model: any) => {
      // When province changes, reload city options
      loadCities(value).then(cities => {
        // Update city options
        model.cityOptions = cities
        model.city = '' // Reset city selection
      })
    }
  },
  {
    prop: 'city',
    label: 'City',
    component: 'el-select',
    options: (model: any) => model.cityOptions || [] // Dynamic options
  }
]
```

## Related Documentation

- [Component Development Guide](./index.md)
- [CRUD Component Guide](./crud.md)
- [Form Component Documentation](../components/form.md)

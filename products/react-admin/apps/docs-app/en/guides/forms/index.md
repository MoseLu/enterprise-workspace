---
title: Form Processing Guide
type: guide
project: forms
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- forms
- development
sidebar_label: Form Processing
sidebar_order: 4
sidebar_group: forms
---

# Form Processing Guide

Form system development standards and processing flow.

## Form System Overview

BTC form system is built on Element Plus, providing complete form development, validation, submission, and data processing capabilities.

## Form Types

### Basic Forms
- **Data Collection Forms**: User information, configuration, settings, etc.
- **Search Forms**: Data filtering, conditional queries, etc.
- **Login Forms**: User authentication, permission validation, etc.

### Dynamic Forms
- **Conditional Forms**: Dynamically display fields based on user selection
- **Multi-Step Forms**: Multi-step data collection flow
- **Wizard Forms**: Guided data entry

### Business Forms
- **CRUD Forms**: Data creation, editing, viewing
- **Approval Forms**: Workflow approval processes
- **Report Forms**: Data queries and exports

## Development Process

### 1. Form Design
```typescript
// Define form data structure
export interface UserFormData {
  id?: number
  name: string
  email: string
  role: 'admin' | 'user'
  department?: string
  avatar?: string
  status: 'active' | 'inactive'
}

// Define form configuration
export interface FormConfig {
  title: string
  mode: 'create' | 'edit' | 'view'
  layout: 'horizontal' | 'vertical'
  labelWidth: string
  rules: FormRules
}
```

### 2. Form Implementation
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
      <el-form-item label="Name" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="Please enter name"
          :disabled="mode === 'view'"
        />
      </el-form-item>

      <el-form-item label="Email" prop="email">
        <el-input
          v-model="formData.email"
          type="email"
          placeholder="Please enter email"
          :disabled="mode === 'view'"
        />
      </el-form-item>

      <el-form-item label="Role" prop="role">
        <el-select
          v-model="formData.role"
          placeholder="Please select role"
          :disabled="mode === 'view'"
        >
          <el-option label="Admin" value="admin" />
          <el-option label="User" value="user" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="mode !== 'view'">
        <el-button type="primary" @click="handleSubmit">
          {{ mode === 'create' ? 'Create' : 'Update' }}
        </el-button>
        <el-button @click="handleReset">Reset</el-button>
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

// Form reference
const formRef = ref<FormInstance>()

// Form data
const formData = reactive<UserFormData>({
  name: props.data?.name || '',
  email: props.data?.email || '',
  role: props.data?.role || 'user',
  department: props.data?.department || '',
  avatar: props.data?.avatar || '',
  status: props.data?.status || 'active'
})

// Validation rules
const formRules: FormRules = {
  name: [
    { required: true, message: 'Please enter name', trigger: 'blur' },
    { min: 2, max: 20, message: 'Name length should be 2-20 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter valid email format', trigger: 'blur' }
  ],
  role: [
    { required: true, message: 'Please select role', trigger: 'change' }
  ]
}

// Computed properties
const labelWidth = computed(() => {
  return props.mode === 'view' ? '100px' : '120px'
})

const labelPosition = computed(() => {
  return props.mode === 'view' ? 'left' : 'right'
})

// Methods
async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    emit('submit', { ...formData })
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

function handleReset() {
  if (!formRef.value) return

  formRef.value.resetFields()
  emit('reset')
}

// Expose methods
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  submit: handleSubmit
})
</script>
```

### 3. Form Validation
```typescript
// Custom validators
export const validators = {
  // Phone number validation
  phone: (rule: any, value: string, callback: any) => {
    const phoneRegex = /^1[3-9]\d{9}$/
    if (value && !phoneRegex.test(value)) {
      callback(new Error('Please enter valid phone number'))
    } else {
      callback()
    }
  },

  // ID card validation
  idCard: (rule: any, value: string, callback: any) => {
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (value && !idCardRegex.test(value)) {
      callback(new Error('Please enter valid ID card number'))
    } else {
      callback()
    }
  },

  // Password strength validation
  password: (rule: any, value: string, callback: any) => {
    if (value) {
      const hasUpperCase = /[A-Z]/.test(value)
      const hasLowerCase = /[a-z]/.test(value)
      const hasNumbers = /\d/.test(value)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)

      if (value.length < 8) {
        callback(new Error('Password must be at least 8 characters'))
      } else if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        callback(new Error('Password must contain uppercase, lowercase, numbers, and special characters'))
      } else {
        callback()
      }
    } else {
      callback()
    }
  }
}
```

### 4. Form Submission
```typescript
// Form submission handling
export class FormHandler {
  // Pre-submit processing
  static async beforeSubmit(data: any): Promise<any> {
    // Data cleaning
    const cleanedData = { ...data }

    // Remove empty values
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === '' || cleanedData[key] === null) {
        delete cleanedData[key]
      }
    })

    // Data transformation
    if (cleanedData.date) {
      cleanedData.date = new Date(cleanedData.date).toISOString()
    }

    return cleanedData
  }

  // Submit handling
  static async submit(data: any, api: string): Promise<any> {
    try {
      const processedData = await this.beforeSubmit(data)
      const response = await request.post(api, processedData)
      return response.data
    } catch (error) {
      console.error('Form submission failed:', error)
      throw error
    }
  }

  // Post-submit processing
  static afterSubmit(response: any, mode: string) {
    const message = mode === 'create' ? 'Created successfully' : 'Updated successfully'
    BtcMessage.success(message)

    // Trigger refresh event
    window.dispatchEvent(new CustomEvent('form-submitted', {
      detail: { response, mode }
    }))
  }
}
```

## Form Styles

### Theme Customization
```scss
// Form theme styles
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

  // Form button group
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

### Responsive Layout
```scss
// Responsive form layout
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

## Data Processing

### Data Transformation
```typescript
// Form data transformation utilities
export class FormDataTransformer {
  // Date transformation
  static transformDate(data: any, fields: string[]) {
    const transformed = { ...data }
    fields.forEach(field => {
      if (transformed[field]) {
        transformed[field] = new Date(transformed[field]).toISOString()
      }
    })
    return transformed
  }

  // Number transformation
  static transformNumber(data: any, fields: string[]) {
    const transformed = { ...data }
    fields.forEach(field => {
      if (transformed[field]) {
        transformed[field] = Number(transformed[field])
      }
    })
    return transformed
  }

  // Boolean transformation
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

### Data Validation
```typescript
// Server-side data validation
export class ServerValidator {
  // Async validation
  static async validateField(field: string, value: any): Promise<boolean> {
    try {
      const response = await request.post('/api/validate', { field, value })
      return response.data.valid
    } catch (error) {
      console.error('Field validation failed:', error)
      return false
    }
  }

  // Batch validation
  static async validateForm(data: any): Promise<ValidationResult> {
    try {
      const response = await request.post('/api/validate-form', data)
      return response.data
    } catch (error) {
      console.error('Form validation failed:', error)
      return { valid: false, errors: {} }
    }
  }
}
```

## Testing Strategy

### Unit Testing
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

    // Verify submission logic
  })
})
```

## Related Documentation

- [Component Development Guide](../components/index.md)
- [Form Component Documentation](../components/form.md)
- [CRUD Component Guide](../components/crud.md)

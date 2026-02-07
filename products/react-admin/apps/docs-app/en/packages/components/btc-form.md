---
title: BtcForm Component
type: package
project: components
owner: dev-team
created: 2025-10-12
updated: 2025-10-13
publish: true
tags:
- packages
- components
- form
sidebar_label: BtcForm
sidebar_order: 6
sidebar_group: packages
---

# BtcForm Component

Advanced form component, aligned with cool-admin's `cl-form`, providing complete form management functionality.

## Features

- Declarative form configuration
- Built-in el-dialog dialog
- Support for dynamic form item control
- Support for grouping and tabs
- Support for data transformation hooks
- Support for plugin system
- Complete form validation
- Support for form reset and clear

## Basic Usage

### 1. Import Component

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

### 2. Open Form

```typescript
// Create
function handleAdd() {
Form.value?.open({
title: 'Add User',
width: '800px',
items: [
{ prop: 'name', label: 'Name', span: 12, required: true, component: { name: 'el-input' } },
{ prop: 'email', label: 'Email', span: 12, component: { name: 'el-input' } },
],
on: {
submit: async (data, { close, done }) => {
try {
await userService.add(data);
BtcMessage.success('Saved successfully');
close();
} catch (error) {
done();
}
}
}
});
}

// Edit
function handleEdit(row) {
Form.value?.open({
title: 'Edit User',
width: '800px',
form: row, // Pre-filled data
items: [ /* ... */ ],
on: {
submit: async (data, { close, done }) => {
// ...
}
}
});
}
```

## Configuration Options

### FormOptions

```typescript
interface FormOptions {
title?: string; // Dialog title
width?: string; // Dialog width, default '50%'
height?: string; // Dialog height
form?: Record<string, any>; // Pre-filled form data
items: FormItem[]; // Form item configuration
props?: {
labelWidth?: string; // Label width, default '100px'
labelPosition?: 'top' | 'left' | 'right'; // Label position, default 'top'
};
op?: {
hidden?: boolean; // Hide bottom buttons
saveButtonText?: string; // Save button text
closeButtonText?: string; // Close button text
justify?: string; // Button alignment
buttons?: any[]; // Custom buttons
};
on?: {
open?: (form) => void; // Open callback
submit?: (data, { close, done }) => void; // Submit callback
close?: (action, done) => void; // Before close callback
closed?: () => void; // After close callback
};
dialog?: Record<string, any>; // Other el-dialog attributes
}
```

### FormItem

```typescript
interface FormItem {
prop: string; // Field name
label: string; // Label
span?: number; // Grid column span (1-24)
required?: boolean; // Required
rules?: any; // Validation rules
hidden?: boolean | ((scope) => boolean); // Hidden
component: {
name: string; // Component name
props?: Record<string, any>; // Component props
options?: any[]; // Option data (select/radio/checkbox)
};
children?: FormItem[]; // Child form items
group?: string; // Group name (used with tabs)
}
```

## Advanced Features

### 1. Dynamic Dropdown Options Update

```typescript
const options = ref([]);

// Fetch option data
const fetchOptions = async () => {
options.value = await api.getOptions();
};

// Use computed to maintain reactivity
{
prop: 'category',
label: 'Category',
component: {
name: 'el-select',
props: { clearable: true, filterable: true },
options: computed(() => options.value)
}
}
```

### 2. Dynamic Form Item Control

```typescript
// Use Action API
const { Form } = useBtcForm();

// Show/hide form items
Form.value?.showItem('field1', 'field2');
Form.value?.hideItem('field3');

// Set form item options
Form.value?.setOptions('category', newOptions);

// Set form item props
Form.value?.setProps('name', { disabled: true });
```

### 3. Grouping and Tabs

```typescript
{
items: [
{
type: 'tabs',
value: 'basic',
props: {
labels: [
{ label: 'Basic Info', value: 'basic' },
{ label: 'Details', value: 'detail' }
]
}
}
],
{ prop: 'name', label: 'Name', group: 'basic', component: { name: 'el-input' } },
{ prop: 'bio', label: 'Bio', group: 'detail', component: { name: 'el-input', props: { type: 'textarea' } } },
]
}
```

## Instance Methods

| Method | Description | Parameters |
|------|------|------|
| `open(options)` | Open form | `FormOptions` |
| `close(action?)` | Close form | `'close' \| 'save'` |
| `submit()` | Submit form | - |
| `reset()` | Reset form | - |
| `clear()` | Clear form | - |
| `validate()` | Validate form | - |
| `clearValidate()` | Clear validation | - |

## Notes

1. **Component names must be strings**: `component.name` must be a component's string name, such as `'el-input'`, `'el-select'`, etc.
2. **Dynamic options use computed**: If dropdown options are reactive data, wrap them with `computed(() => options.value)`
3. **Form validation**: `required: true` automatically adds required validation, complex validation uses `rules` property
4. **Label position defaults to top**: For more compact layout, default label position is `top`, can be modified via `props.labelPosition`

## Differences from BtcUpsert

| Feature | BtcUpsert | BtcForm |
|------|-----------|---------|
| Usage | Declarative (template) | Imperative (open method) |
| Form configuration | Props passing | Method parameters |
| Dynamic control | Weak | Powerful Action API |
| Plugin support | None | Supported |
| Code reusability | Lower | High (configurable and reusable) |

## Migration Guide

Migrating from `BtcUpsert` to `BtcForm`:

```vue
<!-- Before -->
<BtcUpsert ref="upsertRef" :items="formItems" :on-submit="handleSubmit" />

<!-- After -->
<BtcForm ref="Form" />

<script setup>
const { Form } = useBtcForm();

function openForm(row) {
Form.value?.open({
title: row ? 'Edit' : 'Add',
form: row,
items: [...],
on: { submit: handleSubmit }
});
}
</script>
```

## Related Components

- `BtcFormCard` - Form card (collapsible)
- `BtcFormTabs` - Form tabs
- `BtcDialog` - Dialog component (BtcForm's underlying dependency)

## More Examples

Check the permission management pages in `apps/admin-app/src/pages/system/` directory for more practical usage examples

---
title: BtcUpsert Component
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
# BtcUpsert Component

CRUD-specific form component, equivalent to cool-admin's `cl-upsert`

## Important

**BtcUpsert must be used inside `<BtcCrud>` component!**

If you need a standalone form, please use the `BtcForm` component

## Features

- Optimized for CRUD scenarios
- Automatically handles add/edit/info modes
- Deep integration with BtcCrud
- Complete lifecycle hooks
- Supports dynamic form items
- Supports form-hook data transformation
- Based on BtcDialog (fullscreen/minimize)

## Basic Usage

```vue
<template>
<BtcCrud ref="crudRef" :service="userService">
<BtcCrudRow>
<BtcRefreshBtn />
<BtcAddBtn /> <!-- Click to open add form -->
<BtcMultiDeleteBtn />
</BtcCrudRow>

<BtcCrudRow>
<BtcTable :columns="columns" />
</BtcCrudRow>

<BtcCrudRow>
<BtcPagination />
</BtcCrudRow>

<!-- BtcUpsert component -->
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
label: 'Name',
span: 12,
required: true,
component: { name: 'el-input' }
},
{
prop: 'email',
label: 'Email',
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
BtcMessage.success('Saved successfully');
} catch (error) {
done(); // Restore button state
BtcMessage.error(error?.message || 'Save failed');
}
};
</script>
```

## Configuration Options

### Props

| Property | Type | Default | Description |
|------|------|--------|------|
| `items` | `FormItem[]` | `[]` | Form item configuration |
| `width` | `string \| number` | `'800px'` | Dialog width |
| `padding` | `string` | `'10px 20px'` | Content padding |
| `labelWidth` | `string \| number` | `'100px'` | Label width |
| `labelPosition` | `'left' \| 'right' \| 'top'` | `'top'` | Label position |
| `gutter` | `number` | `20` | Grid spacing |
| `addTitle` | `string` | `'Add'` | Add title |
| `editTitle` | `string` | `'Edit'` | Edit title |
| `infoTitle` | `string` | `'Details'` | Details title |
| `submitText` | `string` | `'Confirm'` | Submit button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |

### Lifecycle Hooks

| Hook | Parameters | Description | Trigger Timing |
|------|------|------|----------|
| `onOpen` | `()` | On open | Dialog opens, before data loading |
| `onInfo` | `(row, { next, done })` | Get details | Edit/details mode, loading data |
| `onOpened` | `(data)` | After open | Data loading completed |
| `onSubmit` | `(data, { close, done, next })` | Submit | After form validation passes |
| `onClose` | `(action, done)` | Before close | Click cancel/close |
| `onClosed` | `()` | After close | Dialog completely closed |

### FormItem Configuration

```typescript
interface FormItem {
prop: string; // Field name
label: string; // Label
span?: number; // Grid columns (1-24)
required?: boolean; // Required or not
rules?: any; // Validation rules
value?: any; // Default value
hidden?: boolean | ((data) => boolean); // Hidden or not
hook?: any; // form-hook transformation
component?: {
name: string; // Component name
props?: any; // Component properties
options?: any[]; // Options (select/radio/checkbox)
};
}
```

## Advanced Usage

### 1. Mode Switching (add/update/info)

```vue
<BtcTable :columns="columns" />

<script setup>
const columns = [
// ...
{
type: 'op',
buttons: [
'edit', // Open update mode
'info', // Open info mode (read-only)
'delete'
]
},
];
</script>
```

### 2. Details Fetch Hook

```vue
<BtcUpsert
:items="formItems"
:on-info="handleInfo"
/>

<script setup>
const handleInfo = async (row, { next, done }) => {
// Method 1: Use default service.info
// const res = await next(row);

// Method 2: Custom API
const res = await customApi.getUserDetail(row.id);

// Process and return data
done({
...res,
name: `[VIP] ${res.name}`,
tags: res.tags.join(',')
});
};
</script>
```

### 3. Submit Hook

```vue
<BtcUpsert
:items="formItems"
:on-submit="handleSubmit"
/>

<script setup>
const handleSubmit = async (data, { next, close, done }) => {
try {
// Pre-submit processing
const processedData = {
...data,
tags: data.tags.split(','),
status: 1
};

// Call default API (service.update/add)
await next(processedData);

// Post-submit processing
BtcMessage.success('Saved successfully');
close();

} catch (error) {
done(); // Restore button state
}
};
</script>
```

### 4. Dynamic Form Items

```vue
<script setup>
const upsertRef = ref();

const formItems = computed(() => [
{ prop: 'name', label: 'Name', component: { name: 'el-input' } },

// Function return: can access mode
() => {
return {
prop: 'password',
label: 'Password',
// Hide when editing
hidden: upsertRef.value?.mode === 'update',
component: { name: 'el-input', props: { type: 'password' } }
};
},

// Dynamic disabled
() => {
return {
prop: 'email',
label: 'Email',
component: {
name: 'el-input',
props: {
// Details mode automatically disabled, but can also be manually controlled
disabled: upsertRef.value?.mode === 'info'
}
}
};
}
]);
</script>
```

### 5. Dynamic Dropdown Options

```vue
<script setup>
const options = ref([]);

// Get options
onMounted(async () => {
options.value = await api.getOptions();
});

const formItems = computed(() => [
{
prop: 'category',
label: 'Category',
component: {
name: 'el-select',
props: { clearable: true, filterable: true },
options: options.value // Reactive options
}
}
]);
</script>
```

### 6. Close Confirmation

```vue
<BtcUpsert
:items="formItems"
:on-close="handleClose"
/>

<script setup>
const handleClose = (action, done) => {
if (action === 'close') {
BtcConfirm('Form not saved, confirm close?', 'Tip', {
type: 'warning'
})
.then(() => done()) // Confirm close
.catch(() => {}); // Cancel
} else {
done(); // Close directly after save
}
};
</script>
```

## Instance Methods

Access via ref:

```vue
<BtcUpsert ref="upsertRef" />

<script setup>
const upsertRef = ref();

// Access form instance
upsertRef.value?.formRef

// Access form data
upsertRef.value?.formData

// Access current mode
upsertRef.value?.mode // 'add' | 'update' | 'info'
</script>
```

## Comparison with cool-admin cl-upsert

| Feature | cl-upsert | BtcUpsert |
|------|-----------|-----------|
| Mode Support | add/update/info | add/update/info |
| Lifecycle Hooks | 6 | 6 |
| Dynamic Form Items | Function return | Function return |
| Hook Transformation | Full | Simplified |
| Plugin System | | Planned |
| Grouping/Tabs | | Planned |
| Implementation | TSX | Template |

## Notes

1. **Must be inside BtcCrud**: BtcUpsert depends on CRUD context
2. **Default label-top**: For compact layout, labels are on top by default
3. **Reactive options**: Dropdown options using `ref` will automatically respond to updates
4. **Mode auto-management**: BtcCrud automatically sets mode, no manual control needed

## Related Components

- `BtcCrud` - CRUD context container
- `BtcTable` - Data table
- `BtcDialog` - Dialog (underlying component of BtcUpsert)
- `BtcForm` - Standalone form component

## Complete Example

See the 10 permission management pages in `apps/admin-app/src/pages/system/` directory

---
title: BtcDialog Component
type: package
project: components
owner: dev-team
created: 2025-10-12
updated: 2025-10-13
publish: true
tags:
- packages
- components
- dialog
sidebar_label: BtcDialog
sidebar_order: 5
sidebar_group: packages
---

# BtcDialog Component

## Overview

Enhanced version of `el-dialog` component, referencing cool-admin's `cl-dialog` implementation, providing richer features and better user experience.

**Implementation**: Uses **TSX + render functions** to ensure correct slot passing and rendering.

## Features

- Fullscreen/minimize control
- Double-click title bar to toggle fullscreen
- Custom control buttons
- KeepAlive cache support
- Custom scrollbar
- Transparent background option
- Before close confirmation hook

## Basic Usage

```vue
<template>
<BtcDialog v-model="visible" title="User Details" width="600px">
<p>Dialog content</p>
</BtcDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
</script>
```

## Props

| Parameter | Description | Type | Default |
|------|------|------|--------|
| modelValue | Visibility | boolean | false |
| title | Title | string | '-' |
| width | Width | string | '50%' |
| height | Height | string | - |
| padding | Padding | string | '20px' |
| keepAlive | Cache content | boolean | false |
| fullscreen | Fullscreen | boolean | false |
| controls | Control buttons | Array | ['fullscreen', 'close'] |
| hideHeader | Hide header | boolean | false |
| beforeClose | Before close callback | Function | - |
| scrollbar | Use scrollbar | boolean | true |
| transparent | Transparent background | boolean | false |

## Events

| Event Name | Description | Callback Parameters |
|--------|------|----------|
| update:modelValue | Visibility change | boolean |
| fullscreen-change | Fullscreen state change | boolean |

## Slots

| Slot Name | Description |
|--------|------|
| default | Dialog content |
| footer | Footer area |

## Expose

| Method/Property | Description | Type |
|-----------|------|------|
| visible | Visibility | Ref\<boolean\> |
| isFullscreen | Is fullscreen | ComputedRef\<boolean\> |
| open | Open dialog | () => void |
| close | Close dialog | () => void |
| toggleFullscreen | Toggle fullscreen | (val?: boolean) => void |

## Examples

### With Fullscreen Control

```vue
<template>
<BtcDialog
v-model="visible"
title="CRUD Table"
width="80%"
:controls="['fullscreen', 'close']"
>
<BtcCrud :service="service">
<BtcTable :columns="columns" />
</BtcCrud>
</BtcDialog>
</template>
```

### Double-Click Title Bar Fullscreen

Users can double-click the title bar to quickly toggle fullscreen state (only when controls includes 'fullscreen').

### Before Close Confirmation

```vue
<template>
<BtcDialog
v-model="visible"
title="Edit User"
:before-close="handleBeforeClose"
>
<el-form v-model="form">
<!-- Form content -->
</el-form>
</BtcDialog>
</template>

<script setup lang="ts">
import { BtcConfirm } from '@btc/shared-components';

const handleBeforeClose = (done: () => void) => {
BtcConfirm('Are you sure you want to close? Data will not be saved')
.then(() => {
done(); // Call done to actually close
})
.catch(() => {
// Cancel closing
});
};
</script>
```

### KeepAlive Cache

```vue
<BtcDialog v-model="visible" title="Table" :keep-alive="true">
<!-- When keepAlive is true, closing dialog won't re-render content -->
<BtcCrud :service="service">
<!-- ... -->
</BtcCrud>
</BtcDialog>
```

### Custom Control Buttons

```vue
<template>
<BtcDialog
v-model="visible"
title="Custom Controls"
:controls="['fullscreen', customButton, 'close']"
>
Content
</BtcDialog>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { Download } from '@element-plus/icons-vue';

const customButton = h(
'button',
{
type: 'button',
class: 'control-btn',
onClick: () => {
console.log('Custom button clicked');
}
},
h(Download)
);
</script>
```

### Fixed Height + Scrollbar

```vue
<BtcDialog
v-model="visible"
title="Long Content"
height="500px"
:scrollbar="true"
>
<!-- Content exceeding 500px will show scrollbar -->
<div style="height: 1000px">Very long content...</div>
</BtcDialog>
```

### Transparent Background

```vue
<BtcDialog v-model="visible" :transparent="true">
<!-- Transparent background dialog, no shadow -->
</BtcDialog>
```

## Differences from el-dialog

| Feature | el-dialog | BtcDialog |
|------|-----------|-----------|
| Fullscreen control | Need to implement yourself | Built-in |
| Double-click fullscreen | | Supported |
| Custom control buttons | | Supported |
| KeepAlive | | Supported |
| Scrollbar control | | Built-in el-scrollbar |
| Close button hover effect | Normal | Theme color highlight |

## Style Customization

Component uses CSS variables, automatically adapts to Element Plus theme:

```scss
.btc-dialog {
// Header
&__header {
padding: 16px 20px;
border-bottom: 1px solid var(--el-border-color-lighter);
}

// Title
&__title {
font-size: 16px;
font-weight: 600;
}

// Control buttons
&__controls {
.control-btn {
&.close:hover {
background-color: var(--el-color-danger);
color: #fff;
}
}
}
}
```

## Notes

1. **Auto import**: Component is automatically imported via `unplugin-vue-components`, no manual import needed
2. **Type support**: Complete TypeScript type definitions
3. **Performance**: Recommend setting `keepAlive: true` for large tables or complex content
4. **Mobile**: On small screen devices, fullscreen button automatically hidden

## Related Components

- [BtcCrud](../../crud/README.md) - CRUD context container
- [BtcUpsert](../../crud/upsert/index.vue) - Form dialog (based on el-dialog)

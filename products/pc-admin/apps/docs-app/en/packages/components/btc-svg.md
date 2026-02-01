---
title: 'BTC SVG Icon Component'
type: package
project: components
owner: dev-team
created: '2025-10-11'
updated: '2025-10-13'
publish: true
tags:
- packages
- components
- svg
sidebar_label: btc-svg
sidebar_order: 7
sidebar_group: packages
---
# BTC SVG Icon Component

SVG icon component for displaying SVG icons automatically scanned by vite-plugin

## Features

- Automatically recognizes icons in SVG sprite
- Supports custom size and color
- Inherits parent element's text color (via currentColor)
- Supports rich icon animation effects
- Fully compatible API with cool-admin-vue's cl-svg component

## Usage

### Basic Usage

```vue
<template>
<!-- Display icon-home.svg -->
<btc-svg name="home" />

<!-- Display icon-user.svg -->
<btc-svg name="user" />
</template>
```

### Custom Size

```vue
<template>
<!-- String format -->
<btc-svg name="home" size="24px" />

<!-- Number format (automatically adds px) -->
<btc-svg name="home" :size="32" />
</template>
```

### Custom Color

```vue
<template>
<!-- Direct color setting -->
<btc-svg name="home" color="#409eff" />

<!-- Inherit parent element color (default) -->
<div style="color: red">
<btc-svg name="home" />
</div>
</template>
```

### Custom Class Name

```vue
<template>
<btc-svg name="home" class-name="my-custom-icon" />
</template>

<style>
.my-custom-icon {
margin-right: 8px;
}
</style>
```

### Icon Animations

`btc-svg` supports multiple animation effects, which can be enabled via the `animation` property:

```vue
<template>
<!-- Rotate 180 degrees on hover -->
<btc-svg name="set" :size="16" animation="rotate" animation-trigger="hover" />

<!-- Continuous rotation (loading animation) -->
<btc-svg name="loading" :size="16" animation="spin" animation-trigger="always" />

<!-- Slightly enlarge on hover -->
<btc-svg name="bell" :size="16" animation="grow" animation-trigger="hover" />

<!-- Pulse animation -->
<btc-svg name="notification" :size="16" animation="pulse" animation-trigger="always" />

<!-- Custom animation duration -->
<btc-svg name="icon" :size="16" animation="spin" :animation-duration="2" />
</template>
```

#### Supported Animation Types

| Animation Type | Description | Use Cases |
|---------|------|---------|
| `rotate` | Rotate (180 degrees on hover) | Settings button, toggle button |
| `spin` | Continuous rotation (360 degree loop) | Loading state, refresh button |
| `pulse` | Pulse (scale animation with opacity change) | Notification reminder, important alert |
| `grow` | Slightly enlarge (scale up on hover) | Interactive feedback, button icon |
| `bounce` | Bounce | Error alert, warning |
| `shake` | Shake | Error alert, warning |
| `fade` | Fade in/out | State switch, notification |
| `flip` | Flip | State switch, direction change |

#### Animation Trigger Modes

- `hover` (default): Trigger animation on hover
- `always`: Always play animation

## Props

| Parameter | Description | Type | Default |
|------|------|------|--------|
| name | Icon name (no icon- prefix needed) | string | - |
| size | Icon size | string \| number | - |
| color | Icon color | string | - |
| className | Custom class name | string | - |
| animation | Animation type | `'rotate' \| 'spin' \| 'pulse' \| 'grow' \| 'bounce' \| 'shake' \| 'fade' \| 'flip' \| false` | `false` |
| animationTrigger | Animation trigger mode | `'always' \| 'hover'` | `'hover'` |
| animationDuration | Animation duration (seconds) | string \| number | - |
| animationDelay | Animation delay (seconds) | string \| number | - |

## SVG File Naming Rules

### 1. Common Icons (with icon- prefix)

File name: `icon-home.svg`
Usage: `<btc-svg name="home" />`

vite-plugin will automatically skip module name concatenation and use `icon-home` directly as the symbol id

### 2. Module Icons (without icon- prefix)

File name: `modules/user/avatar.svg`
Usage: `<btc-svg name="user-avatar" />`

vite-plugin will automatically concatenate the module name as `user-avatar`

## Comparison with cool-admin-vue's cl-svg

| Feature | btc-svg | cl-svg |
|------|---------|--------|
| Component Name | btc-svg | cl-svg |
| API | Fully compatible | - |
| Style Class Name | btc-svg | cl-svg |
| Functionality | Fully compatible | - |

## Internationalization Icon Examples

```vue
<template>
<!-- Chinese icon -->
<btc-svg name="icon-zh" />

<!-- English icon -->
<btc-svg name="icon-en" />

<!-- Japanese icon -->
<btc-svg name="icon-ja" />
</template>
```

## Notes

1. **Icon name doesn't need `icon-` prefix**: The component will automatically add it
2. **SVG file location**: Place in `src/` directory, vite-plugin will automatically scan
3. **Color inheritance**: By default inherits parent element's text color (`fill: currentColor`)
4. **Size unit**: Number type will automatically add `px` unit
5. **Animation performance**: Animations use CSS transform and opacity, with good performance optimization
6. **Animation trigger**: `hover` mode only works on devices that support hover, touch devices will automatically degrade
7. **Animation duration**: If `animationDuration` is not specified, default values for each animation type will be used

## Complete Example

```vue
<template>
<div class="icon-demo">
<!-- Basic icon -->
<btc-svg name="home" />

<!-- Large icon -->
<btc-svg name="user" :size="48" />

<!-- Colored icon -->
<btc-svg name="star" color="#f5a623" :size="32" />

<!-- Used in button -->
<el-button>
<btc-svg name="add" :size="16" />
Add
</el-button>

<!-- Internationalization switch -->
<btc-svg
:name="locale === 'zh-CN' ? 'icon-zh' : 'icon-en'"
:size="24"
/>

<!-- Icons with animations -->
<div class="animated-icons">
<!-- Settings button: rotate on hover -->
<btc-svg name="set" :size="16" animation="rotate" animation-trigger="hover" />

<!-- Loading icon: continuous rotation -->
<btc-svg name="loading" :size="16" animation="spin" animation-trigger="always" />

<!-- Notification icon: enlarge on hover -->
<btc-svg name="bell" :size="16" animation="grow" animation-trigger="hover" />

<!-- Message icon: pulse animation -->
<btc-svg name="msg" :size="16" animation="pulse" animation-trigger="always" />
</div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const locale = ref('zh-CN');
</script>
```

## Animation Use Case Examples

### 1. Settings Button (Rotate on Hover)

```vue
<template>
<btc-svg name="set" :size="16" animation="rotate" animation-trigger="hover" />
</template>
```

### 2. Loading State (Continuous Rotation)

```vue
<template>
<btc-svg name="loading" :size="16" animation="spin" animation-trigger="always" />
</template>
```

### 3. Notification Reminder (Enlarge on Hover)

```vue
<template>
<btc-svg name="bell" :size="16" animation="grow" animation-trigger="hover" />
</template>
```

### 4. Important Alert (Pulse Animation)

```vue
<template>
<btc-svg name="notification" :size="16" animation="pulse" animation-trigger="always" />
</template>
```

### 5. Custom Animation Speed

```vue
<template>
<!-- Slow rotation (2 seconds per cycle) -->
<btc-svg name="loading" :size="16" animation="spin" :animation-duration="2" />

<!-- Fast pulse (0.5 seconds per cycle) -->
<btc-svg name="bell" :size="16" animation="pulse" :animation-duration="0.5" />
</template>
```

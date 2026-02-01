---
title: "Process Component"
type: api
project: layout
owner: dev-team
created: 2025-10-11
updated: 2025-10-11
publish: true
tags: ["layout"]
sidebar_label: "Process Bar"
sidebar_order: 3
sidebar_collapsed: false
sidebar_group: "Layout Components"
---
# Process Component

## Description

Tab process bar component for displaying and managing currently open tabs in the current app

## Features

### Application Isolation
- Each micro app's tabs are independently managed
- When switching apps, only tabs of the current app are displayed
- Closing tabs only affects the current app

### Tab Operations
- **Click Tab**: Switch to corresponding page
- **Click Close**: Close single tab
- **Right-click Menu**: Close current/other tabs
- **Operation Menu**: Close other/all tabs

### Quick Operations
- **Back**: Go back to previous page (within current app)
- **Refresh**: Refresh current view
- **Home**: Return to current app home page
- **Fullscreen**: Page-level fullscreen (hide topbar and sidebar)

## Props

| Property | Type | Default | Description |
|------|------|--------|------|
| isFullscreen | boolean | false | Whether in fullscreen mode |

## Events

| Event Name | Parameters | Description |
|--------|------|------|
| toggle-fullscreen | - | Toggle fullscreen mode |

## Usage Example

```vue
<template>
<Process
:is-fullscreen="isFullscreen"
@toggle-fullscreen="toggleFullscreen"
/>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Process from '@/layout/process'

const isFullscreen = ref(false)

function toggleFullscreen() {
isFullscreen.value = !isFullscreen.value
}
</script>
```

## Tab Operation Menu

Dropdown menu located to the left of the fullscreen button, providing the following functions:

### Close Others
- Close all tabs in current app except the current tab
- Tabs in other apps remain unaffected
- Disabled when there's only 1 tab

### Close All
- Close all tabs in current app
- Tabs in other apps remain unaffected
- Automatically navigate to current app home page
- Disabled when there are no tabs

## Fullscreen Mode

### Page-level Fullscreen (Not Browser Fullscreen)

After clicking the fullscreen button:
- Hide sidebar
- Hide topbar
- **Keep tab process bar** (for restoring fullscreen and switching tabs)
- Maximize content area
- Click fullscreen button again to restore normal mode

**Advantages**:
- No browser fullscreen warning
- Smoother user experience
- No shortcut conflicts (e.g., F11)
- Doesn't affect other tabs
- Keep tab bar for quick switching and restoration

## Internationalization Support

Uses the following i18n keys:
- `common.close_other` - Close Others
- `common.close_all` - Close All
- `common.tip` - Tip
- `common.close_current` - Close Current
- `common.button.cancel` - Cancel

## App Home Page Configuration

Home page routes for different apps:

```typescript
const appHomes: Record<string, string> = {
'main': '/',
'logistics': '/logistics',
'engineering': '/engineering',
'quality': '/quality',
'production': '/production',
}
```

## Notes

1. **Application Isolation**: All tab operations only affect the current app
2. **State Synchronization**: Fullscreen state managed by parent component to avoid state inconsistency
3. **Performance Optimization**: Use virtual scrolling for large numbers of tabs (if needed)
4. **Internationalization**: Tab names prioritize using i18n keys

## Style Customization

### Active Tab Style
```scss
&.active {
background-color: var(--el-color-primary);
border-color: var(--el-color-primary);
color: #fff;
}
```

### Close Button Style
```scss
.close {
font-size: 14px;
&:hover {
background-color: rgba(0, 0, 0, 0.1); // Normal tab
}
}

&.active .close:hover {
background-color: rgba(255, 255, 255, 0.3); // Active tab
}
```

## Related Components

- [Layout](../README.md) - Main layout
- [Topbar](../topbar/README.md) - Topbar
- [Sidebar](../sidebar/README.md) - Sidebar

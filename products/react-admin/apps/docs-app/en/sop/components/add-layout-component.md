---
title: Add New Layout Component
type: sop
project: components
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- sop
- components
- layout
sidebar_label: Add Layout Component
sidebar_order: 1
sidebar_group: sop-components
---

# Add New Layout Component

## Prerequisites
- Understand "directory-as-component" architecture standards
- Component functionality is clear

## Operation Steps

### 1. Create Component Directory
```bash
cd apps/admin-app/src/layout
mkdir my-component
```

### 2. Create Component Files
```bash
# Create main file
touch my-component/index.vue

# Create documentation
touch my-component/README.md
```

### 3. Write Component Code
```vue
<!-- my-component/index.vue -->
<template>
  <div class="my-component">
    <!-- Component content -->
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutMyComponent'
});

// Component logic
</script>

<style lang="scss" scoped>
.my-component {
  // Styles
}
</style>
```

### 4. Import and Use in Main Layout
```vue
<!-- layout/index.vue -->
<script setup lang="ts">
import MyComponent from './my-component/index.vue'
</script>

<template>
  <MyComponent />
</template>
```

### 5. Update Layout README
Add new component description in `layout/README.md`

## Verification
1. Component displays normally
2. No TypeScript errors
3. No Lint errors

## Failure Rollback
Delete created directory:
```bash
rm -rf apps/admin-app/src/layout/my-component
```

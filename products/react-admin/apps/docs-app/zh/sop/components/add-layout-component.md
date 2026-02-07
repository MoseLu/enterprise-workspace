---
title: 添加新的布局组件
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
sidebar_label: 添加布局组件
sidebar_order: 1
sidebar_group: sop-components
---

# 添加新的布局组件

## 前提条件
- 了解"目录即组件"架构规范
- 组件功能已明确
## 操作步骤

### 1. 创建组件目录
```bash
cd apps/admin-app/src/layout
mkdir my-component
```

### 2. 创建组件文件
```bash
# 创建主文件
touch my-component/index.vue

# 创建文档
touch my-component/README.md
```

### 3. 编写组件代码
```vue
<!-- my-component/index.vue -->
<template>
<div class="my-component">
<!-- 组件内容 -->
</div>
</template>

<script setup lang="ts">
defineOptions({
name: 'LayoutMyComponent'
});

// 组件逻辑
</script>

<style lang="scss" scoped>
.my-component {
// 样式
}
</style>
```

### 4. 在主布局中导入并使用
```vue
<!-- layout/index.vue -->
<script setup lang="ts">
import MyComponent from './my-component/index.vue'
</script>

<template>
<MyComponent />
</template>
```

### 5. 更新布局 README
在 `layout/README.md` 中添加新组件说明
## 验证
1. 组件正常显示
2. 无 TypeScript 错误
3. 无 Lint 错误

## 失败回滚
删除创建的目录：
```bash
rm -rf apps/admin-app/src/layout/my-component
```


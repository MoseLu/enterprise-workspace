# Auth 共享资源模块

Auth 模块的共享资源，包括共享组件、组合式函数和样式，供 login、register、forget-password 等页面使用。

## 目录结构

```
shared/
├── components/      # 共享组件（如登录容器、表单组件等）
├── composables/     # 共享的组合式函数（如认证逻辑、验证工具等）
├── styles/          # 共享样式文件
└── README.md        # 本文件
```

## 功能说明

### 共享组件
- 登录/注册表单容器
- 统一的输入组件
- 认证相关的 UI 组件

### 共享组合式函数
- 认证状态管理
- 表单验证工具
- API 调用封装

### 共享样式
- 认证页面的基础样式
- 表单样式
- 响应式布局样式

## 使用说明

### 在子模块中使用共享组件

```vue
<script setup lang="ts">
import SharedComponent from '../shared/components/SharedComponent.vue';
import { useSharedComposable } from '../shared/composables/useSharedComposable';
</script>

<template>
  <SharedComponent />
</template>
```

### 在子模块中使用共享样式

```vue
<style lang="scss">
@use '../shared/styles/index.scss';
</style>
```

## 相关文档

- [登录模块](../login/README.md)
- [注册模块](../register/README.md)
- [忘记密码模块](../forget-password/README.md)


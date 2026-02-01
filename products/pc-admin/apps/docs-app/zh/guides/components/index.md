---
title: 组件开发指南
type: guide
project: components
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- components
- development
sidebar_label: 组件开发
sidebar_order: 3
sidebar_group: components
---

# 组件开发指南

BTC 组件库的开发规范和最佳实践

## 开发理念

- **声明式优先**：通过配置驱动，减少模板代码
- **类型安全**：完整的 TypeScript 类型支持
- **自动导入**：通过 unplugin-vue-components 自动导入
- **风格统一**：与 cool-admin-vue 设计保持一致

## 组件分类

### 核心组件
- **[CRUD 组件](./crud.md)** - CRUD 页面开发流程
- 数据表格配置
- 表单验证规则
- 操作按钮配置

- **[表单组件](./form.md)** - 表单开发最佳实践
- 表单布局配置
- 字段验证规则
- 提交处理逻辑

### 布局组件
- **[布局组件](../components/layout/index.md)** - 页面布局组件
- 侧边栏配置
- 面包屑导航
- 主题切换器

### 业务组件
- **[表格组件](../components/table.md)** - 数据表格组件
- 列配置
- 分页处理
- 排序筛选

- **[对话框组件](../components/dialog.md)** - 模态对话框
- 弹窗配置
- 表单集成
- 事件处理

## 开发流程

### 1. 组件设计
```typescript
// 定义组件接口
export interface ComponentProps {
// 属性定义
}

// 定义组件事件
export interface ComponentEmits {
// 事件定义
}
```

### 2. 组件实现
```vue
<template>
<!-- 组件模板 -->
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style scoped>
/* 组件样式 */
</style>
```

### 3. 类型定义
```typescript
// 导出类型定义
export type { ComponentProps, ComponentEmits }
```

### 4. 文档编写
```markdown
# 组件文档

## 基本用法
## API 参考
## 示例代码
```

## 开发规范

### 命名规范
- 组件名：`Btc` + `功能名`（如：`BtcTable``BtcForm`）
- 文件名：kebab-case（如：`btc-table.vue`）
- 类型名：PascalCase（如：`TableProps`）

### 文件结构
```
components/
btc-table/
index.vue # 主组件
types.ts # 类型定义
style.scss # 样式文件
README.md # 组件文档
```

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 Vue 3 Composition API
- 使用 ESLint + Prettier 格式化
- 编写单元测试

## 测试规范

### 单元测试
```typescript
import { mount } from '@vue/test-utils'
import BtcTable from '../btc-table.vue'

describe('BtcTable', () => {
it('renders correctly', () => {
const wrapper = mount(BtcTable, {
props: { /* props */ }
})
expect(wrapper.exists()).toBe(true)
})
})
```

### 集成测试
- 测试组件与其他组件的交互
- 测试事件传递和数据流
- 测试样式和布局

## 相关文档

- [组件总览](../components/index.md)
- [表单开发指南](../forms/index.md)
- [系统集成指南](../integration/index.md)

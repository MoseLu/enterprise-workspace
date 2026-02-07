---
title: 组件文档
type: guide
project: components
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- components
sidebar_label: 组件文档
sidebar_order: 1
sidebar_group: components
---

# 组件总览

BTC 组件库基于 Element Plus 构建，提供完整的 CRUD表单布局等业务组件

<ClientOnly>
<ComponentOverview />
</ClientOnly>

---

## 设计理念

- **声明式优先**：通过配置驱动，减少模板代码
- **类型安全**：完整的 TypeScript 类型支持
- **自动导入**：通过 unplugin-vue-components 自动导入
- **风格统一**：与 cool-admin-vue 设计保持一致

---

## 快速开始

### 自动导入

所有 BTC 组件都支持自动导入，无需手动 import：

```vue
<template>
<!-- 直接使用，无需导入 -->
<BtcCrud ref="crudRef">
<BtcTable />
<BtcUpsert />
</BtcCrud>
</template>

<script setup lang="ts">
// 无需 import，自动导入已配置
const crudRef = ref();
</script>
```

### 手动导入（可选）

如果需要明确导入：

```typescript
import { BtcCrud, BtcTable, BtcUpsert } from '@btc/shared-components';
```

---

## 使用指南

### CRUD 页面开发流程

1. **创建页面组件**
2. **使用 BtcCrud 包裹**
3. **配置 BtcTable 显示列表**
4. **配置 BtcUpsert 编辑表单**
5. **完成！自动拥有增删改查功能**

### 组件选择决策

| 场景 | 推荐组件 |
|------|---------|
| 数据列表（增删改查） | BtcCrud + BtcTable + BtcUpsert |
| 独立表单 | BtcForm |
| 增强弹窗 | BtcDialog |
| 左树右表布局 | BtcViewGroup |
| 普通弹窗 | el-dialog |

---

## 提示

::: tip 推荐阅读顺序
1. 先看 [BTC CRUD](../packages/components/btc-crud.md) 了解 CRUD 体系
2. 再看 [BtcUpsert](../packages/components/btc-upsert.md) 和 [BtcDialog](../packages/components/btc-dialog.md)
3. 最后根据需要查看其他组件
:::

::: warning 注意事项
- BtcUpsert 必须在 BtcCrud 内部使用
- BtcForm 用于非 CRUD 场景的独立表单
- Layout 组件已在主应用中集成，子应用无需使用
:::

---
title: 快速开始
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- guides
- getting-started
sidebar_label: 快速开始
sidebar_order: 2
sidebar_group: guides
---

# 快速开始

本指南将帮助您快速上手 BTC 组件库的开发

## 环境要求

- Node.js >= 16.0.0
- pnpm >= 7.0.0
- Vue 3.0+
- TypeScript 4.0+

## 安装和启动

### 1. 克隆项目

```bash
git clone <repository-url>
cd btc-shopflow
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
# 启动主应用
pnpm dev:main

# 启动文档应用
pnpm dev:docs
```

## 第一个组件

创建一个简单的 CRUD 页面：

```vue
<template>
<BtcCrud
:api="userApi"
:columns="userColumns"
:form-schema="userFormSchema"
/>
</template>

<script setup lang="ts">
import { BtcCrud } from '@btc/shared-components';

// API 配置
const userApi = {
list: (params) => fetch('/api/users', { params }),
add: (data) => fetch('/api/users', { method: 'POST', body: data }),
update: (id, data) => fetch(`/api/users/${id}`, { method: 'PUT', body: data }),
remove: (id) => fetch(`/api/users/${id}`, { method: 'DELETE' }),
};

// 表格列配置
const userColumns = [
{ label: 'ID', prop: 'id', width: 80 },
{ label: '姓名', prop: 'name', searchable: true },
{ label: '邮箱', prop: 'email', searchable: true },
{ label: '状态', prop: 'status', type: 'select', options: [
{ label: '启用', value: 1 },
{ label: '禁用', value: 0 }
]},
{ label: '操作', type: 'action', actions: ['edit', 'delete'] },
];

// 表单配置
const userFormSchema = {
name: { label: '姓名', type: 'input', rules: [{ required: true }] },
email: { label: '邮箱', type: 'input', rules: [{ type: 'email' }] },
status: { label: '状态', type: 'radio', options: [
{ label: '启用', value: 1 },
{ label: '禁用', value: 0 }
]},
};
</script>
```

## 下一步

- [组件开发](/zh/guides/components/) - 深入了解组件开发规范
- [表单处理](/zh/guides/forms/) - 学习表单设计和验证
- [系统配置](/zh/guides/system/) - 配置开发环境

---

## 常见问题

**Q: 如何自定义主题？**
A: 参考[系统配置](/zh/guides/system/)中的主题定制部分

**Q: 如何添加新的组件？**
A: 参考[组件开发](/zh/guides/components/)中的组件开发规范

**Q: 如何配置国际化？**
A: 参考[系统配置](/zh/guides/system/)中的国际化配置部分

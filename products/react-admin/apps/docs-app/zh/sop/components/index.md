---
title: 组件开发操作流程
type: sop
project: components
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- sop
- components
- development
sidebar_label: 组件开发
sidebar_order: 2
sidebar_group: sop-components
---

# 组件开发操作流程

本部分提供了组件开发相关的标准操作流程，包括新增组件图标管理组件维护等组件开发操作

## 操作流程

### 组件创建
- **[添加布局组件](/zh/sop/components/add-layout-component)** - 新增布局组件的标准流程

### 资源管理
- **[添加SVG图标](/zh/sop/components/add-new-svg-icon)** - 添加新SVG图标的标准步骤

---

## 开发规范

### 1. 命名规范
- 组件名使用PascalCase
- 文件名使用kebab-case
- 目录名使用kebab-case

### 2. 文件结构
- 每个组件一个独立目录
- 包含组件文件样式文件测试文件
- 提供完整的文档说明

### 3. 代码规范
- 使用TypeScript编写
- 遵循Vue 3 Composition API
- 提供完整的类型定义

---

## 组件分类

### 基础组件
- 按钮输入框选择器等基础UI组件
- 提供统一的样式和交互

### 业务组件
- CRUD表单表格等业务相关组件
- 封装常用的业务逻辑

### 布局组件
- 头部侧边栏内容区等布局组件
- 提供灵活的布局方案

---

## 开发工具

### 组件库
- **Element Plus** - 基础UI组件库
- **Vue 3** - 前端框架
- **TypeScript** - 类型支持

### 开发工具
- **Vite** - 构建工具
- **Vitest** - 测试框架
- **Storybook** - 组件文档

---

## 相关文档

- [组件文档](/components)
- [组件开发指南](/zh/guides/components)
- [设计规范](/zh/guides/design)

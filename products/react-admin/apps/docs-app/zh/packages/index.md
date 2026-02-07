---
title: 共享包文档
type: package
project: btc-shopflow
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- packages
- shared
sidebar_label: 共享包
sidebar_order: 1
sidebar_group: packages
---

# 共享包文档

> Shared Packages Documentation

共享包提供了项目中可复用的核心功能，包括组件库工具函数业务逻辑等，确保代码的一致性和可维护性

## 目的

- **代码复用**：提供可复用的组件和工具函数
- **统一标准**：确保项目中的代码风格和功能一致性
- **模块化**：将功能按模块组织，便于维护和扩展
- **类型安全**：提供完整的TypeScript类型定义

## 包分类

### 组件包
- **[组件包概览](/zh/packages/components/)** - BTC组件库总览
- **[BTC CRUD](/zh/packages/components/btc-crud)** - CRUD操作组件
- **[BtcDialog](/zh/packages/components/btc-dialog)** - 对话框和弹窗组件
- **[BtcForm](/zh/packages/components/btc-form)** - 表单输入和验证组件
- **[btc-svg](/zh/packages/components/btc-svg)** - SVG图标组件
- **[BtcUpsert](/zh/packages/components/btc-upsert)** - 新增/编辑组件
- **[BtcViewGroup](/zh/packages/components/btc-view-group)** - 视图组合组件

### 工具包
- **[工具包概览](/zh/packages/utils/)** - 工具包总览
- **[共享核心](/zh/packages/utils/shared-core)** - 核心业务逻辑
- **[共享工具](/zh/packages/utils/shared-utils)** - 工具函数和辅助方法
- **[CRUD Composable](/zh/packages/utils/use-crud)** - CRUD操作组合式函数

### 插件包
- **[Excel插件](/zh/packages/plugins/excel-plugin)** - Excel导入导出插件
- **[国际化插件](/zh/packages/plugins/i18n-plugin)** - 多语言支持插件
- **[插件管理器](/zh/packages/plugins/plugin-manager)** - 插件管理系统
- **[Vite插件](/zh/packages/plugins/vite-plugin)** - Vite构建插件

---

## 架构设计

### 包依赖关系
```
shared-core (核心业务逻辑)

shared-utils (工具函数)

use-crud (CRUD组合式函数)

btc-* (业务组件)
```

### 设计原则
1. **单一职责**：每个包专注于特定功能
2. **低耦合**：包之间依赖关系清晰
3. **高内聚**：相关功能组织在一起
4. **可测试**：提供完整的测试覆盖

---

## 使用方式

### 安装依赖
```bash
# 安装特定包
pnpm add @btc/shared-components

# 安装所有依赖
pnpm install
```

### 导入使用
```typescript
// 导入组件
import { BtcCrud, BtcTable } from '@btc/shared-components'

// 导入工具函数
import { formatDate } from '@btc/shared-utils'

// 导入核心功能
import { useCrud } from '@btc/shared-core'
```

---

## 版本管理

- **语义化版本**：遵循SemVer规范
- **变更日志**：记录每个版本的变更
- **向后兼容**：保持API的向后兼容性
- **废弃策略**：提供平滑的废弃迁移方案

---

## 开发指南

- [组件开发规范](/zh/guides/components)
- [包开发指南](/zh/guides/packages)
- [测试规范](/zh/guides/testing)
- [发布流程](/zh/guides/release)

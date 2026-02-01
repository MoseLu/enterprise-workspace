---
title: 工具包文档
type: package
project: utils
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- packages
- utils
sidebar_label: 工具包
sidebar_order: 2
sidebar_group: packages
---

# 工具包文档

本部分包含了所有工具包的详细文档，提供核心业务逻辑工具函数和辅助方法

## 工具列表

### 核心工具
- **[共享核心](/zh/packages/utils/shared-core)** - 核心业务逻辑，提供项目的基础功能
- **[CRUD工具](/zh/packages/utils/use-crud)** - CRUD操作的组合式函数，简化数据操作

### 基础工具
- **[共享工具](/zh/packages/utils/shared-utils)** - 工具函数和辅助方法，提供常用功能

---

## 设计原则

### 1. 模块化
- 按功能划分模块
- 清晰的依赖关系
- 独立的版本管理

### 2. 可复用性
- 通用的功能设计
- 灵活的配置选项
- 完整的类型支持

### 3. 性能优化
- 按需加载机制
- 高效的算法实现
- 最小化包体积

---

## 架构设计

### 分层架构
```
shared-core (核心业务逻辑)

shared-utils (工具函数)

use-crud (CRUD组合式函数)
```

### 依赖管理
- 最小化外部依赖
- 版本锁定机制
- 兼容性保证

---

## 安装使用

### 安装核心工具
```bash
pnpm add @btc/shared-core
```

### 安装工具函数
```bash
pnpm add @btc/shared-utils
```

### 使用示例
```typescript
// 使用核心功能
import { useCrud } from '@btc/shared-core'

// 使用工具函数
import { formatDate, debounce } from '@btc/shared-utils'

// 使用CRUD组合式函数
import { useCrud } from '@btc/shared-core'
```

---

## 开发工具

### 调试工具
- 完整的TypeScript类型
- 详细的错误信息
- 调试模式支持

### 测试工具
- 单元测试覆盖
- 集成测试支持
- 性能测试工具

---

## 相关文档

- [组件包文档](/zh/packages/components/) - BTC组件库文档
- [插件包文档](/zh/packages/plugins/) - 插件系统文档

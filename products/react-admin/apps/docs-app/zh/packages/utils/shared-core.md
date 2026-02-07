---
title: 'BTC 共享核心库'
type: package
project: utils
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- packages
- utils
- core
sidebar_label: 共享核心
sidebar_order: 10
sidebar_group: packages
---
# BTC 共享核心库

> **版本**: 1.0.0
> **类型**: 核心功能库
> **用途**: 跨应用共享的核心逻辑插件工具

---

## 包含内容

### BTC 核心系统

#### CRUD 系统
- `useCrud` - CRUD 状态管理
- `createCrudService` - CRUD 服务构建器
- [文档](./src/btc/crud/README.md)

#### 表单系统
- `useBtcForm` - 表单状态管理
- `useTabs` - 表单分组
- `useAction` - 表单动作
- `useElApi` - Element Plus API 代理

#### 插件系统
- `usePluginManager` - 插件管理器
- `createI18nPlugin` - 国际化插件
- `createThemePlugin` - 主题插件
- [插件开发指南](./src/btc/plugins/PLUGIN-DEVELOPMENT-GUIDE.md)

---

## 快速开始

### 安装

```bash
pnpm add @btc/shared-core
```

### 使用

#### CRUD

```typescript
import { useCrud, createCrudService } from '@btc/shared-core';

const userService = createCrudService('user');
const crud = useCrud({ service: userService });

// 加载数据
await crud.loadData();

// 新增
crud.handleAdd();

// 编辑
crud.handleEdit(row);

// 删除
crud.handleDelete(row);
```

#### 国际化

```typescript
import { useI18n } from '@btc/shared-core';

const { t, setLocale } = useI18n();

// 使用翻译
const title = t('common.button.save'); // "保存"

// 切换语言
setLocale('en-US');
```

#### 主题

```typescript
import { useTheme } from '@btc/shared-core';

const { setTheme, theme } = useTheme();

// 设置主题色
setTheme('#409EFF');

// 切换暗黑模式
toggleDark();
```

---

## 文档

### 核心功能
- **[CRUD 系统](./src/btc/crud/README.md)** - CRUD 状态管理
- **[插件系统](./src/btc/plugins/README.md)** - 插件开发指南

### 插件文档
- **[国际化插件](./src/btc/plugins/i18n/README.md)** - i18n 配置
- **[国际化键命名规范](./src/btc/plugins/i18n/KEY-NAMING-CONVENTION.md)** - 命名规则
- **[国际化键优先级](./src/btc/plugins/i18n/KEY-PRIORITY.md)** - 优先级管理
- **[Excel 插件](./src/btc/plugins/excel/README.md)** - 导入导出
- **[插件管理器](./src/btc/plugins/manager/README.md)** - 插件管理

---

## 架构

```
src/
btc/ # BTC 核心系统
crud/ # CRUD 系统
plugins/ # 插件系统
i18n/ # 国际化
theme/ # 主题
excel/ # Excel
manager/ # 管理器
index.ts
index.ts
```

---

## 导出内容

### Composables
- `useCrud` - CRUD 状态管理
- `useBtcForm` - 表单状态管理
- `useTabs` - 表单分组
- `useAction` - 表单动作
- `useI18n` - 国际化
- `useTheme` - 主题管理
- `usePluginManager` - 插件管理

### 工具函数
- `createCrudService` - 创建 CRUD 服务
- `createI18nPlugin` - 创建国际化插件
- `createThemePlugin` - 创建主题插件

### 类型
- `CrudService` - CRUD 服务接口
- `UseCrudReturn` - CRUD 返回类型
- `I18nPluginOptions` - i18n 配置
- `ThemePluginOptions` - 主题配置

---

## 开发

### 构建

```bash
pnpm build
```

### 类型检查

```bash
pnpm type-check
```

---

## 许可证

MIT


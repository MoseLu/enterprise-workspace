---
title: 项目总览
sidebar_label: 项目总览
sidebar_order: 0
---

# BTC Shopflow 项目总览

> BTC 车间管理系统 Monorepo 项目说明书

本文档提供了 BTC Shopflow 项目的完整概览，包括所有应用、共享包、自定义插件和组件的详细信息。

## 📋 目录

- [应用列表](#应用列表)
- [共享包](#共享包)
- [自定义插件](#自定义插件)
- [自定义组件](#自定义组件)

---

## 🚀 应用列表

本项目采用 Monorepo 架构，包含以下应用：

### 核心应用

| 应用名称 | 路径 | 功能描述 | 文档链接 |
|---------|------|---------|---------|
| **主应用** | `apps/main-app` | 系统核心应用，提供基础功能和主界面 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/main-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/main-app/CHANGELOG.md) |
| **系统应用** | `apps/system-app` | 系统管理和微前端容器应用，负责子应用的加载和管理 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/system-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/system-app/CHANGELOG.md) |
| **布局应用** | `apps/layout-app` | 统一的布局容器，提供全局布局和导航功能 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/layout-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/layout-app/CHANGELOG.md) |
| **首页应用** | `apps/home-app` | 系统首页和欢迎页面 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/home-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/home-app/CHANGELOG.md) |

### 业务应用

| 应用名称 | 路径 | 功能描述 | 文档链接 |
|---------|------|---------|---------|
| **管理应用** | `apps/admin-app` | 后台管理功能模块，提供系统配置和用户管理 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/admin-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/admin-app/CHANGELOG.md) |
| **物流应用** | `apps/logistics-app` | 物流管理模块，处理物流运输和配送 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/logistics-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/logistics-app/CHANGELOG.md) |
| **生产应用** | `apps/production-app` | 生产计划与管理模块，管理生产流程和计划 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/production-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/production-app/CHANGELOG.md) |
| **品质应用** | `apps/quality-app` | 质量控制与检验模块，处理质量检测和管理 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/quality-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/quality-app/CHANGELOG.md) |
| **工程应用** | `apps/engineering-app` | 工程设计与管理模块，管理工程设计和实施 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/engineering-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/engineering-app/CHANGELOG.md) |
| **财务应用** | `apps/finance-app` | 财务管理模块，处理财务数据和报表 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/finance-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/finance-app/CHANGELOG.md) |
| **运营应用** | `apps/operations-app` | 运营管理模块，处理日常运营事务 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/operations-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/operations-app/CHANGELOG.md) |
| **人事应用** | `apps/personnel-app` | 人事管理模块，处理员工信息和人事管理 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/personnel-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/personnel-app/CHANGELOG.md) |
| **仪表盘应用** | `apps/dashboard-app` | 数据仪表盘和报表展示 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/dashboard-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/dashboard-app/CHANGELOG.md) |

### 其他应用

| 应用名称 | 路径 | 功能描述 | 文档链接 |
|---------|------|---------|---------|
| **移动应用** | `apps/mobile-app` | 移动端应用，支持 Capacitor 框架 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/mobile-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/mobile-app/CHANGELOG.md) |
| **文档应用** | `apps/docs-app` | 项目文档站点（VitePress），提供完整的开发文档 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/docs-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/docs-app/CHANGELOG.md) |

---

## 📦 共享包

所有共享包位于 `packages/` 目录下，供多个应用复用：

### 核心包

| 包名称 | 路径 | 功能描述 | 文档链接 |
|-------|------|---------|---------|
| **@btc/shared-core** | `packages/shared-core` | 核心业务逻辑包，提供基础功能、CRUD服务、插件管理等 | [工具包文档](/zh/packages/utils/shared-core) \| [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/shared-core/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/shared-core/CHANGELOG.md) |
| **@btc/shared-components** | `packages/shared-components` | 共享组件库，提供所有应用共享的可复用 Vue 组件 | [组件包文档](/zh/packages/components-overview) \| [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/shared-components/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/shared-components/CHANGELOG.md) |
| **@btc/shared-utils** | `packages/shared-utils` | 工具函数库，提供常用工具函数和辅助方法 | [共享工具文档](/zh/packages/utils/shared-utils) |
| **@btc/shared-router** | `packages/shared-router` | 路由工具包，提供路由守卫和路由工具函数 | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/shared-router/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/shared-router/CHANGELOG.md) |

### 构建与设计

| 包名称 | 路径 | 功能描述 | 文档链接 |
|-------|------|---------|---------|
| **@btc/vite-plugin** | `packages/vite-plugin` | Vite 插件集合，提供构建优化和功能扩展 | [Vite插件文档](/zh/packages/plugins/vite-plugin) \| [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/vite-plugin/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/vite-plugin/CHANGELOG.md) |
| **design-tokens** | `packages/design-tokens` | 设计令牌包，统一管理设计系统变量（颜色、间距等） | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/design-tokens/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/design-tokens/CHANGELOG.md) |

---

## 🔌 自定义插件

### Vite 构建插件（@btc/vite-plugin）

位于 `packages/vite-plugin`，提供 Vite 构建时的功能扩展：

#### 1. EPS（Endpoint Service）插件

- **功能**：从后端自动生成 API 服务层
- **用途**：根据后端 API 定义自动生成 TypeScript 服务代码
- **使用方式**：
  ```typescript
  import { service } from 'virtual:eps';
  await service.user.list({ page: 1 });
  ```
- **详细文档**：[Vite插件文档](/zh/packages/plugins/vite-plugin)

#### 2. SVG 图标插件

- **功能**：自动扫描和优化 SVG 文件，生成 SVG sprite
- **用途**：统一管理项目中的 SVG 图标，自动优化和命名
- **特点**：
  - 自动扫描 `src/` 目录下所有 `.svg` 文件
  - 使用 `svgo` 优化 SVG 代码
  - 根据模块名自动生成图标名称
- **详细文档**：[Vite插件文档](/zh/packages/plugins/vite-plugin)

#### 3. Ctx 上下文插件

- **功能**：自动扫描模块并获取上下文信息
- **用途**：获取应用中的所有模块列表和服务语言类型
- **使用方式**：
  ```typescript
  import ctx from 'virtual:ctx';
  console.log(ctx.modules); // ['user', 'order', 'product']
  ```
- **详细文档**：[Vite插件文档](/zh/packages/plugins/vite-plugin)

#### 4. Tag 标签插件

- **功能**：自动给 Vue 组件添加 name 属性
- **用途**：支持 `<script setup name="ComponentName">` 语法，用于 Vue DevTools 显示组件名称
- **详细文档**：[Vite插件文档](/zh/packages/plugins/vite-plugin)

#### 5. Proxy 代理插件

- **功能**：代理配置管理
- **状态**：待实现
- **详细文档**：[Vite插件文档](/zh/packages/plugins/vite-plugin)

### 业务插件（@btc/shared-components）

位于 `packages/shared-components/src/plugins/`，提供业务功能扩展：

#### 1. Excel 插件

- **功能**：Excel 导入导出功能
- **组件**：
  - `BtcExportBtn` - 导出按钮组件
  - `BtcImportBtn` - 导入按钮组件
- **详细文档**：[Excel插件文档](/zh/packages/plugins/excel-plugin)

#### 2. Code 插件

- **功能**：代码展示功能
- **组件**：
  - `BtcCodeJson` - JSON 代码展示组件
- **详细文档**：[组件包文档](/zh/packages/components-overview)

#### 3. i18n 插件

- **功能**：国际化支持
- **用途**：提供多语言切换和翻译功能
- **详细文档**：[国际化插件文档](/zh/packages/plugins/i18n-plugin)

#### 4. Theme 插件

- **功能**：主题切换功能
- **用途**：支持浅色/深色主题切换
- **详细文档**：[组件包文档](/zh/packages/components-overview)

#### 5. Message 插件

- **功能**：全局消息提示
- **组件**：`BtcMessage` - 消息提示组件（全局 API）
- **详细文档**：[Message组件文档](/zh/packages/components/btc-message)

#### 6. Notification 插件

- **功能**：全局通知功能
- **组件**：`BtcNotification` - 通知组件（全局 API）
- **详细文档**：[Notification组件文档](/zh/packages/components/btc-notification)

---

## 🧩 自定义组件

所有自定义组件位于 `packages/shared-components`，使用 `btc-` 前缀命名。

### CRUD 组件系统

完整的 CRUD（创建、读取、更新、删除）数据操作解决方案：

| 组件名称 | 功能描述 | 文档链接 |
|---------|---------|---------|
| **BtcCrud** | CRUD 上下文组件，提供全局状态管理 | [CRUD文档](/zh/packages/components/btc-crud) |
| **BtcTable** | 数据表格组件，支持排序、筛选、分页等功能 | [CRUD文档](/zh/packages/components/btc-crud) |
| **BtcUpsert** | 新增/编辑组件，统一的数据操作界面 | [CRUD文档](/zh/packages/components/btc-crud) |
| **BtcPagination** | 分页组件 | [CRUD文档](/zh/packages/components/btc-crud) |
| **BtcAddBtn** | 新增按钮 | [CRUD文档](/zh/packages/components/btc-crud) |
| **BtcRefreshBtn** | 刷新按钮 | [CRUD文档](/zh/packages/components/btc-crud) |
| **BtcMultiDeleteBtn** | 批量删除按钮 | [CRUD文档](/zh/packages/components/btc-crud) |

### 通用组件

| 组件名称 | 功能描述 | 文档链接 |
|---------|---------|---------|
| **BtcButton** | 按钮组件 | [组件包文档](/zh/packages/components-overview) |
| **BtcSvg** | SVG 图标组件，提供统一的图标管理 | [组件包文档](/zh/packages/components-overview) |
| **BtcContainer** | 容器组件，提供统一的布局容器 | [组件包文档](/zh/packages/components-overview) |
| **BtcDialog** | 对话框和弹窗组件，支持多种交互模式 | [Dialog文档](/zh/packages/components/btc-dialog) |
| **BtcForm** | 表单组件，支持复杂表单场景和验证 | [Form文档](/zh/packages/components/btc-form) |
| **BtcFormCard** | 表单卡片组件，用于表单分组 | [组件包文档](/zh/packages/components-overview) |
| **BtcFormTabs** | 表单标签页组件，用于表单分页 | [组件包文档](/zh/packages/components-overview) |
| **BtcSearch** | 搜索组件，用于快速搜索功能 | [组件包文档](/zh/packages/components-overview) |

### 业务组件

| 组件名称 | 功能描述 | 文档链接 |
|---------|---------|---------|
| **BtcMasterList** | 通用主列表组件，用于处理主从关系场景 | [组件包文档](/zh/packages/components-overview) |
| **BtcCard** | 卡片组件 | [组件包文档](/zh/packages/components-overview) |
| **BtcTabs** | 标签页组件 | [组件包文档](/zh/packages/components-overview) |
| **BtcViewsTabsGroup** | 视图标签组组件，支持多个视图的标签切换 | [组件包文档](/zh/packages/components-overview) |
| **BtcCascader** | 级联选择器组件 | [组件包文档](/zh/packages/components-overview) |
| **BtcMasterTableGroup** | 主列表表格组组件，左侧 MasterList + 右侧 CRUD 表格 | [组件包文档](/zh/packages/components-overview) |
| **BtcDoubleGroup** | 双列分组组件，提供双左栏 + CRUD 联动 | [组件包文档](/zh/packages/components-overview) |
| **BtcViewGroup** | 视图组合组件，支持多种视图模式 | [组件包文档](/zh/packages/components-overview) |
| **BtcGridGroup** | 网格组组件，用于网格布局 | [组件包文档](/zh/packages/components-overview) |
| **BtcUpload** | 文件上传组件 | [组件包文档](/zh/packages/components-overview) |

### 图表组件

基于 ECharts 的图表组件：

| 组件名称 | 功能描述 | 文档链接 |
|---------|---------|---------|
| **BtcLineChart** | 折线图组件 | [组件包文档](/zh/packages/components-overview) |
| **BtcBarChart** | 柱状图组件 | [组件包文档](/zh/packages/components-overview) |
| **BtcPieChart** | 饼图组件 | [组件包文档](/zh/packages/components-overview) |

### 布局组件

位于 `apps/docs-app/components/layout/`：

| 组件名称 | 功能描述 | 文档链接 |
|---------|---------|---------|
| **Breadcrumb** | 面包屑导航组件 | [布局组件文档](/zh/components/layout/breadcrumb) |
| **DynamicMenu** | 动态菜单组件 | [布局组件文档](/zh/components/layout/dynamic-menu) |
| **GlobalSearch** | 全局搜索组件 | [布局组件文档](/zh/components/layout/global-search) |
| **LocaleSwitcher** | 语言切换组件 | [布局组件文档](/zh/components/layout/locale-switcher) |
| **MenuDrawer** | 菜单抽屉组件 | [布局组件文档](/zh/components/layout/menu-drawer) |
| **Process** | 流程组件 | [布局组件文档](/zh/components/layout/process) |
| **Sidebar** | 侧边栏组件 | [布局组件文档](/zh/components/layout/sidebar) |
| **ThemeSwitcher** | 主题切换组件 | [布局组件文档](/zh/components/layout/theme-switcher) |
| **Topbar** | 顶部栏组件 | [布局组件文档](/zh/components/layout/topbar) |

---

## 🔗 快速链接

### 开发指南

- [环境安装](./installation.md) - 开发环境搭建
- [启动项目](./quick-start.md) - 项目启动指南
- [项目结构](./project-structure.md) - 目录结构说明
- [文档索引](./docs-index.md) - 所有应用和包的 README 和 CHANGELOG 索引

### 文档导航

- [开发指南](/zh/guides/) - 完整的开发指南
- [组件文档](/zh/components/) - 所有组件文档
- [共享包文档](/zh/packages/) - 共享包使用说明
- [版本更新日志](/zh/changelog/) - 项目版本更新记录
- [架构决策 (ADR)](/zh/adr/) - 架构设计文档
- [标准操作 (SOP)](/zh/sop/) - 开发流程文档

---

## 📊 项目统计

- **应用总数**：14 个
  - 核心应用：4 个
  - 业务应用：9 个
  - 其他应用：1 个

- **共享包总数**：6 个
  - 核心包：4 个
  - 构建与设计：2 个

- **Vite 插件**：5 个
  - 已实现：4 个
  - 待实现：1 个

- **业务插件**：6 个

- **自定义组件**：40+ 个
  - CRUD 组件：7+ 个
  - 通用组件：10+ 个
  - 业务组件：10+ 个
  - 图表组件：3 个
  - 布局组件：9 个

---

## 🎯 下一步

完成项目总览后，建议阅读：

1. [环境安装](./installation.md) - 开始搭建开发环境
2. [启动项目](./quick-start.md) - 启动并运行项目
3. [项目结构](./project-structure.md) - 深入了解项目组织方式
4. [开发指南](/zh/guides/) - 查看详细的开发文档

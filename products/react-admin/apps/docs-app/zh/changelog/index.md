---
title: 版本更新日志
sidebar_label: 版本更新
sidebar_order: 1
---

# 版本更新日志

本文档记录 BTC Shopflow 项目的所有版本更新信息。版本号遵循[语义化版本规范](https://semver.org/lang/zh-CN/)。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

::: tip 自动同步
本文档内容自动从项目根目录的 `CHANGELOG.md` 同步而来。每次运行文档同步脚本（`pnpm sync` 或构建时）会自动更新。
:::

---

<!-- CHANGELOG_CONTENT -->

本文档记录项目的所有重要变更。版本号遵循[语义化版本规范](https://semver.org/lang/zh-CN/)。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

## [未发布]

---

## [1.0.10] - 2026-01-14

### 变更
- Scripts 架构重构完成

---


## [1.0.9] - 2026-01-11

### 重构
- BTC组件库全面重构优化：完成组件分类调整、命名规范化和必要检查
  - 分类调整：BtcSvg、BtcSearch、BtcForm、BtcViewGroup、BtcDialog 移动到正确目录
  - 重命名：BtcChartDemo→BtcChartGallery, BtcViewGroup→BtcMasterViewGroup
  - CRUD组件命名规范化：BtcRow→BtcCrudRow, BtcFlex1→BtcCrudFlex1, BtcSearchKey→BtcCrudSearchKey, BtcMenuExp→BtcMenuExport
  - 统一命名前缀：AppLayout→BtcAppLayout, AppSkeleton→BtcAppSkeleton, AppLoading→BtcAppLoading, RootLoading→BtcRootLoading, GlobalSearch→BtcGlobalSearch
  - 数据组件优化：BtcDoubleGroup→BtcDoubleLeftGroup
  - 更新所有导入导出路径和使用处，确保组件库结构科学、命名规范

---

## [1.0.8] - 2025-01-XX

### 新增
- 添加 Git 提交模板和标签规范文档
- 统一管理应用和物流应用的国际化配置方式
- 新增存储有效性检查工具（`checkStorageValidity` 和 `triggerAutoLogout`），实现自动退出功能
- 新增统一登录跳转工具（`getMainAppLoginUrl`），支持所有子应用统一跳转到主应用登录页

### 变更
- 将管理应用的 JSON 国际化文件置空，统一使用 config.ts 扫描方案
- 修复物流应用菜单层级结构，使用 `_` 键作为一级菜单文本
- 统一重定向参数：所有登录、退出、重定向统一使用 `oauth_callback` 参数，移除 `redirect` 参数兼容性
- 统一登录跳转逻辑：所有子应用使用共享的 `getMainAppLoginUrl` 函数，支持跨域/跨端口跳转
- 优化路由变化事件处理：从 manifest 获取路由信息，补充 labelKey 等 meta 信息

### 修复
- 修复 `registerSubAppI18n` 中 `flattenObject` 和 `unflattenObject` 对 `_` 键的处理逻辑
- 修复自动退出逻辑：改为在存储工具中检查有效性，只检查 `btc_profile_info_data` 是否存在
- 修复概览页面跳转时 tag 国际化失效问题：从 manifest 获取路由信息并补充 labelKey
- 修复登录页面刷新瞬间显示整个紫色背景的问题：为渐变边框添加初始隐藏状态和淡入动画
- 修复构建时 `@btc/subapp-manifests` 导入错误：改为使用相对路径导入 manifest 模块

---

## [1.0.7] - 2026-01-07

### 变更
- 存储系统重构: 引入 pinia-plugin-persistedstate，统一管理所有 Store 持久化
- 存储工具重组: 统一到 utils/storage/ 目录，新增 SessionStorage 和 IndexedDB 工具
- 重构所有 Store: 移除手动持久化逻辑，使用插件自动管理
- 新增 IndexedDB 工具: 基于 Dexie.js，支持大容量历史数据查询（可视化看板场景）

---

## [1.0.6] - 2025-12-29

### 变更
- 加载样式系统优化

---

## [1.0.5] - 2025-12-27

### 新增
- 添加物流应用菜单配置
- 添加国际化扫描功能

---

## [1.0.4] - 2025-12-23

### 变更
- 优化构建流程
- 更新依赖版本

---

## [1.0.3] - 2025-12-20

### 修复
- 修复已知问题

---

## [1.0.2] - 2025-12-19

### 新增
- 新增功能

---

## [1.0.1] - 2025-12-18

### 修复
- 修复初始版本问题

---

## [1.0.0] - 2025-12-18

### 新增
- 项目初始版本
- 基础功能实现

---

## 版本说明

- **[未发布]**: 当前开发中的变更，将在下一个版本发布
- **[主版本.次版本.修订号]**: 已发布的版本标签

## 变更类型

- **新增**: 新功能
- **变更**: 现有功能的变更
- **废弃**: 即将移除的功能
- **移除**: 已移除的功能
- **修复**: Bug 修复
- **安全**: 安全相关的修复

## 相关链接

- [Git 标签规范指南](./docs/GIT_TAG_GUIDE.md)
- [版本发布指南](./docs/VERSION_RELEASE_GUIDE.md)
- [GitHub Releases](https://github.com/your-org/your-repo/releases)
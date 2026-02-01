---
title: 创建 BtcDialog 和 BtcViewGroup 组件
type: adr
project: technical
owner: dev-team
created: '2025-10-12'
updated: '2025-10-13'
publish: true
tags:
- adr
- technical
- components
- dialog
sidebar_label: BtcDialog 组件
sidebar_order: 3
sidebar_group: adr-technical
---

# ADR: 创建 BtcDialog 和 BtcViewGroup 组件

> **状态**: 已采纳  
> **日期**: 2025-10-12  
> **决策者**: 开发团队  
> **影响范围**: 组件库和UI系统  

---

## Context

当前系统使用 Element Plus 的 `el-dialog` 作为弹窗组件，但缺少以下功能：
1. 全屏/最小化控制
2. 双击标题栏快速切换全屏
3. 自定义控制按钮
4. KeepAlive 缓存

同时，权限管理页面（如用户列表）需要左右分栏布局（左侧树形菜单 + 右侧 CRUD 表格），但没有现成的组件

参考 cool-admin 的 `cl-dialog` 和 `cl-view-group` 组件，决定为 BTC 项目创建对应的增强组件

## Options

### Option A: 继续使用 el-dialog
- 无需额外开发
- Element Plus 原生支持
- 功能受限
- 需要在每个页面重复实现全屏逻辑

### Option B: 直接复用 cool-admin 组件
- 功能完整
- 依赖 @cool-vue/crud
- 与 BTC 组件体系不统一
- 样式风格不一致

### Option C: 创建 BtcDialog 和 BtcViewGroup（ 选择）
- 功能完整且符合 BTC 需求
- 独立实现，无外部依赖
- 与现有组件体系统一
- 支持自动导入
- 需要开发和维护

## Decision

**选择 Option C**：创建 `BtcDialog` 和 `BtcViewGroup` 组件

**理由**：
1. **功能完整性**：提供全屏最小化自定义控制等增强功能
2. **独立性**：不依赖外部 CRUD 库，减少依赖
3. **统一性**：与 BTC 组件命名和风格保持一致
4. **可维护性**：代码简洁，易于理解和修改
5. **自动导入**：通过 unplugin-vue-components 自动导入，开箱即用

## Implementation

### 1. BtcDialog 组件

**位置**：`packages/shared-components/src/common/dialog/index.vue`

**特性**：
- 基于 `el-dialog` 封装
- 支持全屏/最小化控制
- 支持双击标题栏全屏
- 支持自定义控制按钮
- 支持 KeepAlive 缓存
- 支持 el-scrollbar 滚动
- 支持背景透明

**API**：
- Props: `modelValue`, `title`, `width`, `height`, `padding`, `keepAlive`, `fullscreen`, `controls`, `hideHeader`, `beforeClose`, `scrollbar`, `transparent`
- Events: `update:modelValue`, `fullscreen-change`
- Expose: `visible`, `isFullscreen`, `open()`, `close()`, `toggleFullscreen()`

### 2. BtcViewGroup 组件

**位置**：`packages/shared-components/src/common/view-group/index.vue`

**特性**：
- 左右分栏布局
- 左侧支持树形结构或列表
- 响应式设计（移动端折叠）
- 关键字搜索
- 懒加载（无限滚动）
- 刷新/新增/右键菜单

**API**：
- Props: `options` (配置对象)
- Slots: `left`, `right`, `left-op`, `right-op`, `title`, `item`, `item-name`
- Expose: `list`, `selected`, `expand()`, `select()`, `refresh()`, `edit()`, `remove()`

### 3. BtcUpsert 升级

**变更**：
- 将内部 `el-dialog` 替换为 `BtcDialog`
- 移除 `closeOnClickModal` prop（改为通过 `dialogProps` 传递）
- 优化关闭时的表单清理逻辑

**影响页面**：10 个权限管理页面（自动升级，无需手动修改）

## Consequences

### 正向影响

1. **用户体验提升**：
- 长表单可以全屏编辑，提升效率
- 双击快速切换，操作更流畅
- 统一的视觉风格，更专业

2. **开发体验提升**：
- 自动导入，无需手动 import
- 简化的 API，易于使用
- 完整的 TypeScript 类型支持

3. **可维护性提升**：
- 组件独立，易于测试和修改
- 文档完善，便于新人上手
- 统一管理，减少重复代码

4. **功能扩展性**：
- 可以轻松添加更多控制按钮
- 支持自定义样式和行为
- 为未来的功能预留空间

### 负向影响

1. **维护成本**：
- 需要维护两个新组件
- 需要同步 Element Plus 的更新

2. **学习成本**：
- 开发者需要了解新组件的 API
- 需要阅读相关文档

3. **破坏性变更**：
- 移除了 `closeOnClickModal` prop（影响较小）
- 使用该 prop 的代码需要迁移

### 缓解措施

1. **完善文档**：
- 创建详细的 README 和使用示例
- 提供迁移指南和最佳实践
- 记录 CHANGELOG

2. **自动升级**：
- `BtcUpsert` 的升级是透明的
- 大部分页面无需修改代码

3. **向后兼容**：
- 保留 `dialogProps` 属性，允许灵活配置
- 默认行为与 `el-dialog` 一致

---

## 相关文件

- `packages/shared-components/src/common/dialog/index.vue`
- `packages/shared-components/src/common/dialog/README.md`
- `packages/shared-components/src/common/view-group/index.vue`
- `packages/shared-components/src/common/view-group/README.md`
- `packages/shared-components/src/crud/upsert/index.vue`
- `packages/shared-components/CHANGELOG.md`
- `docs/UPSERT-DIALOG-UPGRADE.md`
- `docs/BTC-GLOBAL-COMPONENTS.md`


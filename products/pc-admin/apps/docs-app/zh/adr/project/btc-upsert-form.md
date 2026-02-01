---
title: 'BtcUpsert 与 BtcForm 职责澄清 - 对标 cool-admin'
type: adr
project: project
owner: dev-team
created: '2025-10-12'
updated: '2025-10-13'
publish: true
tags:
- adr
- project
- components
- clarification
sidebar_label: BtcUpsert 职责
sidebar_order: 2
sidebar_group: adr-project
---

# ADR: BtcUpsert 与 BtcForm 职责澄清

> **状态**: 已采纳  
> **日期**: 2025-10-12  
> **决策者**: 开发团队  
> **影响范围**: 组件库设计和CRUD系统  

---

## Context

在初期实现中，我们错误地认为 BtcForm 应该替代 BtcUpsert，导致将所有 CRUD 页面迁移到了 BtcForm但通过深入研究 cool-admin 的设计后发现：
1. **cool-admin 的主要使用方式是 `cl-upsert`**（声明式，在 CRUD 上下文中）
2. **`cl-form` 是独立组件**（命令式，用于非 CRUD 场景）
3. **两者用途完全不同**，不是替代关系

这导致了架构理解偏差，需要纠正

## Options

### Option A: 删除 BtcForm，只保留 BtcUpsert

**优点**：
- 简化组件体系
- 减少维护负担
- 避免选择困惑

**缺点**：
- 失去处理独立表单的能力
- BtcUpsert 必须在 BtcCrud 内使用，限制灵活性
- 与 cool-admin 的设计不一致

### Option B: 保留两者，澄清用途

**优点**：
- 符合 cool-admin 的设计理念
- 各司其职：BtcUpsert for CRUD, BtcForm for 独立表单
- 已经实现的 BtcForm 可用于未来的独立表单场景
- 提供完整的解决方案

**缺点**：
- 需要维护两个组件
- 需要明确文档说明用途
- 开发者需要理解何时用哪个

### Option C: BtcUpsert 继承 BtcForm

**优点**：
- 代码复用
- 统一底层实现

**缺点**：
- 增加复杂度
- 两者的 API 设计有本质差异（声明式 vs 命令式）
- 过度工程化

## Decision

**选择 Option B**：保留两者，明确澄清用途

核心理由：

1. **对标最佳实践**：cool-admin 也是这样设计的（cl-upsert + cl-form）
2. **职责清晰**：
- BtcUpsert：CRUD 专用（99% 的场景）
- BtcForm：通用表单（1% 的场景）
3. **未来扩展性**：保留处理复杂独立表单的能力
4. **符合单一职责原则**：每个组件做好一件事

### 实施策略

1. **恢复所有 CRUD 页面使用 BtcUpsert**（10个权限管理页面）
2. **增强 BtcUpsert**：
- 添加 mode 属性（add/update/info）
- 添加完整生命周期钩子
- 支持动态表单项
- 集成 form-hook
3. **保留 BtcForm**用于未来的独立表单场景
4. **创建详细文档**：明确两者的用途区别

## Consequences

### 正向

- 架构清晰：CRUD 用 BtcUpsert，独立表单用 BtcForm
- 对标 cool-admin：降低学习曲线
- 职责分离：每个组件专注于自己的场景
- 代码简洁：CRUD 页面使用声明式配置更简单
- 未来可扩展：保留处理复杂表单的能力

### 负向

- 双组件维护：需要维护两个表单组件
- 学习成本：开发者需要理解何时用哪个
- 文档负担：需要清晰说明两者区别

### 风险缓解

1. **详细文档**：创建 `BTC-UPSERT-VS-FORM-GUIDE.md` 明确说明
2. **清晰示例**：10个权限管理页面作为 BtcUpsert 示例
3. **优先级指引**：文档中明确"99% 情况用 BtcUpsert"
4. **命名明确**：Upsert 暗示 CRUD，Form 暗示通用

## 实施结果

### 已完成（2025-10-12）

1. 恢复 10 个权限管理页面使用 BtcUpsert
2. 增强 BtcUpsert：
- mode 属性（add/update/info）
- 6个生命周期钩子（onOpen, onInfo, onOpened, onSubmit, onClose, onClosed）
- 动态表单项支持（函数返回）
- form-hook 集成（简化版）
3. 完善 BtcForm：
- 组件映射表（支持所有 Element Plus 组件）
- 完整渲染函数实现
4. 创建完整文档：
- `BTC-UPSERT-VS-FORM-GUIDE.md` - 对比指南
- `packages/shared-components/src/crud/upsert/README.md` - BtcUpsert 文档
- `packages/shared-components/src/common/form/README.md` - BtcForm 文档

### 组件对比

```
BtcUpsert (CRUD 专用) cl-upsert
- 声明式
- 在 <BtcCrud> 内使用
- 99% 的场景

BtcForm (通用表单) cl-form
- 命令式
- 独立使用
- 1% 的场景
```

## 后续行动

- [ ] 添加 BtcTable 的 'info' 按钮支持（详情模式）
- [ ] 为 BtcUpsert 添加插件系统（参考 cl-upsert）
- [ ] 为 BtcUpsert 添加分组/Tabs 支持
- [ ] 完善 form-hook 系统（完整转换器）
- [ ] 创建视频教程说明两者区别

## 参考

- `docs/BTC-UPSERT-VS-FORM-GUIDE.md` - 使用指南
- `cool-admin-vue-8.x/packages/crud/src/components/upsert/` - 参考实现
- `cool-admin-vue-8.x/packages/crud/src/components/form/` - 参考实现
- `apps/admin-app/src/pages/system/` - 实际使用示例（10个页面）

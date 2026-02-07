---
title: '系统管理菜单重构 - 按业务领域重组权限管理'
type: adr
project: system
owner: dev-team
created: '2025-10-12'
updated: '2025-10-13'
publish: true
tags:
- adr
- system
- menu
- restructure
sidebar_label: 菜单重构
sidebar_order: 3
sidebar_group: adr-system
---

# ADR: 系统管理菜单重构

> **状态**: 已采纳  
> **日期**: 2025-10-12  
> **决策者**: 系统架构师  
> **影响范围**: 系统管理界面和权限体系  

---

## Context

**问题**：原有菜单结构采用"系统管理 权限管理"的单层嵌套，将所有 10个页面平铺在同一级别：域插件模块用户租户菜单行为角色资源部门

**痛点**：
1. **业务语义不清**：不同业务领域的概念混在一起（平台 vs 组织 vs 访问控制）
2. **扩展性差**：新增绑定页面高级功能无合适归属
3. **认知负担高**：10个页面平铺，难以快速定位

**触发因素**：用户提供了新的权限系统设计，包含5大业务模块和13个新页面需求

## Options

### A. 保留现有结构，新增平级模块
**方案**：在"系统管理"下新增"平台治理""组织与账号"等平级子菜单

**优点**：
- 改动最小
- 旧路径继续可用

**缺点**：
- 菜单层级更深（3-4层）
- "系统管理"变得臃肿

### B. 完全重构为5大业务模块（选择）
**方案**：
```
平台治理（域模块插件）
组织与账号（租户部门用户 + 绑定管理）
访问控制（资源行为权限角色策略 + 组合工具）
导航与可见性（菜单 + 预览）
运维与审计（日志基线模拟器）
```

**优点**：
- **业务语义清晰**：按领域分组
- **可扩展性强**：每个模块可独立扩展
- **认知负担低**：层级扁平，分类明确

**缺点**：
- 需要迁移所有页面路径
- 旧路径需要兼容处理

### C. 混合方案

**方案**：保留部分旧路径，新功能用新结构

**缺点**：
- 结构不一致，更混乱

## Decision

**选择方案 B：完全重构为5大业务模块**

**理由**：
1. **业务语义优先**：清晰的领域划分 > 保持旧路径
2. **长期收益**：初期迁移成本可控，长期维护成本降低
3. **用户体验**：新用户更容易理解系统结构

**实施策略**：
1. 页面迁移：物理移动目录（10个页面）
2. 路径更新：所有路由从 `/system/permission/*` 改为 `/platform/*``/org/*` 等
3. 兼容处理：tabRegistry 保留旧路径映射，避免刷新丢失
4. 新页面创建：13个新页面，使用 Mock 数据

## Consequences

### 正向

1. **业务清晰**：5大模块语义明确
2. **易于扩展**：每个模块独立，不互相干扰
3. **降低认知**：菜单项从10个分散到5个模块，每个模块2-6项
4. **支持高级功能**：绑定管理组合工具模拟器等都有合理归属

### 负向

1. **路径变更**：旧书签/链接失效（已通过 tabRegistry 兼容缓解）
2. **迁移成本**：需要更新13个文件（路由菜单搜索i18n）
3. **Mock数据**：13个新页面暂时使用 Mock，待后端就绪后替换

## Implementation

### 文件变更统计

**新建**：23个页面
- 10个迁移页面（复制到新位置）
- 2个权限页面（permissions, policies）
- 4个绑定管理页面
- 5个高级功能页面（perm-compose, menu-preview, audit, baseline, simulator）
- 1个Mock工具（utils/mock.ts）

**修改**：7个配置文件
- `router/index.ts` - 路由配置
- `micro/menus.ts` - 菜单定义
- `layout/dynamic-menu/index.vue` - 菜单渲染
- `layout/global-search/index.vue` - 搜索数据
- `store/tabRegistry.ts` - Tab注册
- `i18n/locales/zh-CN.ts` - 中文翻译
- `i18n/locales/en-US.ts` - 英文翻译

**删除**：1个目录
- `pages/system/` - 旧页面目录

### 新菜单结构
```
平台治理 (platform)
域 (domains)
模块 (modules)
插件 (plugins)
组织与账号 (org)
租户 (tenants)
部门 (departments)
用户 (users)
访问控制 (access)
资源 (resources)
行为 (actions)
权限 (permissions)
角色 (roles)
策略 (policies)
权限组合 (permissions/compose)
导航与可见性 (navigation)
菜单 (menus)
菜单预览 (menus/preview)
运维与审计 (ops)
操作日志 (audit)
权限基线 (baseline)
策略模拟器 (simulator)
```

### Mock 数据策略

**原则**：
- 使用 `localStorage` 模拟持久化
- CRUD 完整支持（add/update/delete/page）
- 带默认数据，便于演示
- 提供 `createMockCrudService` 工具

**后端就绪后**：只需替换 service 引用，页面代码无需修改

## Risks & Mitigation

| 风险 | 影响 | 缓解措施 | 状态 |
|------|------|---------|:----:|
| 旧链接失效 | 中 | tabRegistry 兼容映射 | |
| Mock数据与真实API不一致 | 中 | 严格遵循现有service接口 | |
| 新页面功能不完整 | 低 | 核心CRUD已实现，高级功能待扩展 | |

## Review

**预期收益**：
- 菜单清晰度提升：
- 可扩展性提升：
- 用户体验提升：

**实施难度**：（中等）

**建议后续**：
1. 后端API就绪后，替换Mock服务
2. 增加绑定管理页面的实际功能测试
3. 高级功能（baseline对比simulator）完善逻辑

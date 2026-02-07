---
title: 基于目录的布局架构
type: adr
project: system
owner: dev-team
created: '2025-10-11'
updated: '2025-10-13'
publish: true
tags:
- adr
- system
- layout
sidebar_label: 目录布局架构
sidebar_order: 1
sidebar_group: adr-system
---

# ADR: 基于目录的布局架构

> **状态**: 已采纳  
> **日期**: 2025-10-11  
> **决策者**: 开发团队  
> **影响范围**: 组件架构和开发流程  

---

## Context
布局组件（TopbarSidebarProcess 等）原本以单文件形式存放在 `layout/components/` 目录下随着功能增长，单文件难以扩展，相关逻辑类型样式混在一起，维护困难

约束：
- 需要支持组件逻辑拆分（composablestypes）
- 需要符合现代前端生态（Nuxtunplugin-vue-router）
- 需要清晰的功能边界

## Options
- **Option A**: 保持单文件
- 优点: 简单直接
- 缺点: 组件长大后难以维护，无法就地扩展

- **Option B**: 目录即组件
- 优点: 可扩展职责清晰符合生态
- 缺点: 初期目录稍多

- **Option C**: 混合模式
- 优点: 灵活
- 缺点: 规范不统一，混乱

## Decision
采用 Option B: 目录即组件架构

核心理由：
- 可扩展性：组件长大时可添加 composables.ts、types.ts、styles.scss
- 生态契合：Nuxt、unplugin-vue-router 默认此模式
- 协作友好：新人一看目录就懂组件边界

结构：
```
layout/
├── topbar/
│   ├── index.vue
│   └── README.md
├── sidebar/
│   ├── index.vue
│   └── README.md
└── index.vue
```

命名规范：
- 目录名：kebab-case（theme-switcher）
- 组件名：PascalCase（LayoutThemeSwitcher）
- 主文件：统一 index.vue

## Consequences
正向影响:
- 组件逻辑可拆分，便于维护
- 目录即功能边界，职责清晰
- 未来切换到文件路由几乎零成本

负向影响/需要注意:
- 导入路径变长：./topbar/index.vue
- 需要统一规范，避免混乱

行动项:
- [x] 创建新目录结构
- [x] 迁移所有布局组件
- [x] 更新导入路径
- [x] 为每个组件添加 README.md
- [ ] 其他应用（logistics、engineering 等）逐步跟进

---

**状态**: 已实施
**最后评审**: 2025-10-13
**下次评审**: 2025-11-13

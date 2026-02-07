---
title: '删除重复的 test-app 应用'
type: adr
project: project
owner: dev-team
created: '2025-10-11'
updated: '2025-10-13'
publish: true
tags:
- adr
- project
- cleanup
sidebar_label: 删除测试应用
sidebar_order: 1
sidebar_group: adr-project
---

# ADR: 删除重复的 test-app 应用

> **状态**: 已采纳  
> **日期**: 2025-10-11  
> **决策者**: 开发团队  
> **影响范围**: 项目结构和维护成本  

---

## Context
test-app 最初作为"Vite 插件测试应用"创建，但实际包含了完整的业务页面（系统管理权限配置等），与 admin-app 功能 100% 重复

问题：
- 维护成本翻倍（每次改动需同步两个应用）
- 技术债务累积（test-app 使用旧架构）
- 定位模糊（名为测试，实为业务副本）
- 占用资源（~500KB 代码，100+ 重复文件）

## Options
- **Option A: 保留 test-app，同步维护**
- 优点: 有独立测试环境
- 缺点: 维护成本高，技术债务持续

- **Option B: 删除 test-app**
- 优点: 消除重复，降低维护成本
- 缺点: 失去独立测试应用

- **Option C: 简化为纯插件测试**
- 优点: 保留测试环境，减少代码
- 缺点: 仍需维护，收益有限

## Decision
采用 **Option B: 删除 test-app**

核心理由：
1. admin-app 已充分验证所有插件功能
2. 插件测试应该用单元测试（Vitest），而非完整应用
3. 消除 100% 重复代码，专注 5 个正式应用

插件测试改用：
- 单元测试：`packages/vite-plugin/test/*.test.ts`
- 实际使用：admin-app 就是最好的测试环境

## Consequences
**正向影响**:
- 节省 ~500KB 代码
- 减少 ~100 个重复文件
- 维护成本减半
- 项目结构更清晰

**负向影响/需要注意**:
- 失去独立测试环境（用单元测试替代）
- 需要更新相关文档和配置

**行动项**:
- [x] 删除 apps/test-app/ 目录
- [x] 更新 apps/README.md
- [ ] 为 vite-plugin 添加单元测试（未来）


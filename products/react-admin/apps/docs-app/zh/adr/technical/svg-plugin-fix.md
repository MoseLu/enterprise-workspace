---
title: 修复 SVG 插件双连字符 Bug
type: adr
project: technical
owner: dev-team
created: '2025-10-11'
updated: '2025-10-13'
publish: true
tags:
- adr
- technical
- svg
- plugin
sidebar_label: SVG 插件修复
sidebar_order: 1
sidebar_group: adr-technical
---

# ADR: 修复 SVG 插件双连字符 Bug

> **状态**: 已采纳  
> **日期**: 2025-10-11  
> **决策者**: 开发团队  
> **影响范围**: SVG 图标系统和构建工具  

---

## Context
SVG 插件在扫描 `src/assets/icons/` 目录时，生成的 symbol ID 出现双连字符（`icon--lang`），导致 btc-svg 组件查找失败（查找 `icon-lang`）

根因：
- 插件在非模块目录扫描时，`moduleName` 为空字符串
- 拼接逻辑：`moduleName + '-' + baseName` `'' + '-' + 'lang'` `'-lang'`
- 最终生成 ID：`icon-` + `-lang` = `icon--lang`

## Options
- **Option A: 修改 btc-svg 组件查找逻辑**
- 优点: 不改插件
- 缺点: 违反直觉，ID 不应该有双连字符

- **Option B: 修复插件拼接逻辑**
- 优点: 从根源解决，ID 命名规范
- 缺点: 需要重新构建插件

- **Option C: 跳过空目录扫描**
- 优点: 简单
- 缺点: 无法使用 assets/icons 目录

## Decision
采用 **Option B: 修复插件拼接逻辑**

在 `packages/vite-plugin/src/svg/index.ts` 添加判断：
```typescript
// 如果 moduleName 为空，跳过拼接
if (!moduleName) {
shouldSkip = true;
}
```

这样：
- `moduleName` 为空 `shouldSkip = true` `iconName = baseName`
- 生成 ID: `icon-` + `lang` = `icon-lang`

## Consequences
**正向影响**:
- Symbol ID 命名规范，无双连字符
- 与 btc-svg 组件查找逻辑一致
- 扩展性好，未来新增图标目录也能正常工作

**负向影响/需要注意**:
- 需要重新构建插件包：`pnpm --filter @btc/vite-plugin build`
- 需要重启应用才能生效

**行动项**:
- [x] 修改插件代码
- [x] 重新构建插件
- [x] 验证图标显示正常


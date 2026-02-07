---
title: 集成部署
type: guide
project: integration
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags: ["integration", "guides"]
sidebar_label: 集成部署
sidebar_order: 5
sidebar_group: guides
---

# 集成部署

本部分介绍了文档中心与主应用的集成方案，以及相关的部署和优化策略

## 目录

- [文档集成](/zh/guides/integration/vitepress-integration-complete) - VitePress 文档中心集成
- [缓存优化](/zh/guides/integration/docs-cache-debug) - 文档缓存策略和优化
- [iframe 优化](/zh/guides/integration/docs-iframe-cache-optimization) - iframe 性能优化
- [瞬间切换](/zh/guides/integration/docs-instant-switch) - 应用间快速切换
- [搜索集成](/zh/guides/integration/vitepress-search-integration) - 全局搜索整合
- [布局隐藏](/zh/guides/integration/docs-layout-hide-strategy) - 布局隐藏策略
- [布局重构](/zh/guides/integration/layout-refactor-complete) - 布局系统重构
- [文档迁移](/zh/guides/integration/doc-migration-complete) - 文档系统迁移
- [集成总结](/zh/guides/integration/docs-integration-summary) - 完整集成方案总结

---

## 目标

- 实现文档中心与主应用的无缝集成
- 优化文档应用的加载速度和切换体验
- 确保主题语言等配置在主应用和文档应用之间同步
- 提供清晰的集成方案和最佳实践

---

## 关键技术

- **iframe 嵌入**：将 VitePress 文档应用作为 iframe 嵌入到主应用中
- **PostMessage**：用于主应用和 iframe 之间进行跨域通信，实现主题语言等状态同步
- **VitePress 配置**：通过 `config.ts` 配置 VitePress 的行为，如禁用 `appearance`
- **LocalStorage**：用于持久化主题状态，确保刷新后主题一致

---

## 快速开始

请按照以下步骤进行系统集成：

1. **配置 VitePress**：禁用 `appearance`，注入早期脚本
2. **配置主应用**：在 `docs-iframe/index.vue` 中实现主题同步逻辑
3. **部署**：确保 VitePress 应用独立部署并可通过 URL 访问

详细步骤请参考各子文档

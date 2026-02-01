---
title: "\U0001F3F7 类型索引"
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags: []
sidebar_label: "\U0001F3F7 类型索引"
sidebar_order: 0
sidebar_collapsed: false
---
# 类型索引

> 按文档类型分类

::: tip 提示
目前还没有收录任何文档请运行 `pnpm --filter docs-site-app ingest` 来收录文档
:::

## 文档类型说明

### guide - 功能指南
功能使用指南最佳实践使用教程

### api - API 文档
组件 API函数 API类型定义

### decision - 架构决策 (ADR)
重要的技术决策架构选型设计权衡

### howto - 操作手册 (SOP)
标准操作流程部署步骤故障排查

### summary - 总结归纳
项目总结迁移报告完成总结

### rca - 问题根因分析
问题分析故障复盘根因追溯

### retro - 复盘回顾
项目复盘经验总结改进建议

### checklist - 检查清单
发布检查质量检查安全检查

## 如何收录文档

```bash
# 1. 为文档添加 frontmatter（指定 type）
pnpm --filter docs-site-app add-frontmatter

# 2. 运行收录脚本
pnpm --filter docs-site-app ingest
```

收录完成后，此页面会按类型自动生成索引


---
title: "\U0001F4C1 项目索引"
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags: []
sidebar_label: "\U0001F4C1 项目索引"
sidebar_order: 0
sidebar_collapsed: false
---
# 项目索引

> 按项目分类的所有文档

::: tip 提示
目前还没有收录任何文档请运行 `pnpm --filter docs-site-app ingest` 来收录文档
:::

## 项目说明

文档会按以下项目分类：

- **components** - 组件系统
- **forms** - 表单系统
- **system** - 系统功能
- **layout** - 布局系统
- **shared-core** - 核心共享库
- **shared-components** - 共享组件库
- **shared-utils** - 工具函数库
- **architecture** - 架构决策
- **operations** - 运维操作

## 如何收录文档

```bash
# 1. 为文档添加 frontmatter
pnpm --filter docs-site-app add-frontmatter

# 2. 运行收录脚本
pnpm --filter docs-site-app ingest
```

收录完成后，此页面会自动生成项目索引


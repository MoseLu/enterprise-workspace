---
title: "\U0001F516 标签云"
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags: []
sidebar_label: "\U0001F516 标签云"
sidebar_order: 0
sidebar_collapsed: false
---
# 标签云

> 按标签聚合的文档

::: tip 提示
目前还没有收录任何文档请运行 `pnpm --filter docs-site-app ingest` 来收录文档
:::

## 标签说明

标签用于标识文档的关键主题和技术栈，方便快速查找相关文档

常见标签示例：
- **vue** - Vue.js 相关
- **typescript** - TypeScript 相关
- **component** - 组件开发
- **form** - 表单处理
- **table** - 表格组件
- **theme** - 主题相关
- **i18n** - 国际化
- **qiankun** - 微前端
- **vitepress** - VitePress 文档

## 如何添加标签

在文档的 frontmatter 中添加 tags 数组：

```yaml
---
title: 我的文档
type: guide
project: components
tags:
- vue
- typescript
- component
---
```

## 如何收录文档

```bash
# 1. 为文档添加 frontmatter（包含 tags）
pnpm --filter docs-site-app add-frontmatter

# 2. 运行收录脚本
pnpm --filter docs-site-app ingest
```

收录完成后，此页面会自动生成标签云和标签索引


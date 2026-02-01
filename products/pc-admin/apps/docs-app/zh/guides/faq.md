---
title: 常见问题
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-01-14'
updated: '2025-01-14'
publish: true
tags:
  - faq
  - troubleshooting
sidebar_label: 常见问题
sidebar_order: 100
---

# 常见问题 (FAQ)

本文档收集了开发过程中常见的问题和解决方案。

## 开发环境

### Q: 如何启动开发服务器？

A: 在项目根目录运行：

```bash
pnpm dev
```

或者启动特定应用：

```bash
pnpm --filter main-app dev
```

### Q: 端口冲突怎么办？

A: 可以修改应用的 `vite.config.ts` 中的端口配置，或者使用 `pnpm --filter docs-app dev:clean` 来清理端口。

## 构建问题

### Q: 构建时出现 "Element is missing end tag" 错误？

A: 这通常是因为 Markdown 文件中有未闭合的 HTML 标签。检查报错的文件，确保所有标签都正确闭合。

### Q: 构建时出现语法高亮语言未加载警告？

A: 某些代码块使用的语言标识符可能不被支持。可以改用常见的语言标识符（如 `js`、`ts`、`vue`、`bash` 等）。

## 文档相关

### Q: 如何添加新文档？

A: 使用命令创建：

```bash
pnpm --filter docs-app new-doc
```

或者手动在相应目录下创建 `.md` 文件，并添加 frontmatter。

### Q: 如何同步文档？

A: 运行同步脚本：

```bash
pnpm --filter docs-app sync
```

## 组件开发

### Q: 如何添加新的组件？

A: 参考[组件开发指南](/zh/guides/components/)中的组件开发规范。

### Q: 如何自定义主题？

A: 参考[系统配置](/zh/guides/system/)中的主题定制部分。

## 国际化

### Q: 如何配置国际化？

A: 参考[系统配置](/zh/guides/system/)中的国际化配置部分。

### Q: 如何添加新的翻译？

A: 在 `locales` 目录下找到对应的语言文件，添加新的键值对。

## 部署

### Q: 如何部署到生产环境？

A: 参考[部署指南](/zh/guides/deployment/)中的相关文档。

### Q: 如何配置 CDN 加速？

A: 参考[CDN 加速配置](/zh/guides/deployment/cdn-acceleration.md)。

## 其他问题

### Q: 遇到其他问题怎么办？

A: 
1. 检查本文档是否有相关解答
2. 查看项目的 GitHub Issues
3. 联系开发团队

---

> 💡 **提示**: 如果本文档没有解答您的问题，欢迎提交 Issue 或 PR 来完善文档。

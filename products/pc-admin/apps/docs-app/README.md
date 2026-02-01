# BTC 文档中心

内部开发者档案库 - Engineering Knowledge Archive

**所有技术文档组件文档架构决策操作手册的统一管理平台**

## 启动

```bash
cd apps/docs-site
pnpm dev
```

访问：http://localhost:8085

或在主应用中点击"文档中心"菜单（iframe 嵌入）

## 构建

```bash
pnpm build
```

构建产物：`.vitepress/dist/`

## 文档结构

```
apps/docs-site/
guides/ # 开发指南
integration/ # 集成指南（VitePress搜索布局等）
components/ # 组件指南
forms/ # 表单指南
system/ # 系统指南
layout/ # Layout 组件文档
adr/ # 架构决策记录（ADR）
rfc/ # 方案设计
sop/ # 操作手册（SOP）
packages/ # 包文档（API 参考）
components/ # 组件使用文档
templates/ # 文档模板
timeline/ # 时间线（自动生成）
projects/ # 项目索引（自动生成）
types/ # 类型索引（自动生成）
tags/ # 标签云（自动生成）
```

## 特性

- **主题统一** - 复用主应用的主题和 CSS 变量
- **i18n 统一** - 使用主应用的 @btc/shared-core i18n
- **全局搜索** - 集成到主应用的全局搜索（Ctrl+K）
- **暗黑模式** - 与主应用双向同步
- **响应式** - 完美适配桌面和移动端
- **Markdown 增强** - 代码高亮容器frontmatter
- **组件演示** - 支持组件在线演示

## 创建新文档

### 使用命令创建

```bash
pnpm new-doc
```

### 手动创建

1. 在相应目录下创建 .md 文件
2. 添加 frontmatter：

```yaml
---
title: 文档标题
type: guide|decision|rfc|howto|api|summary
project: btc-shopflow
owner: dev-team
created: YYYY-MM-DD
updated: YYYY-MM-DD
publish: true
tags: [tag1, tag2]
---
```

3. 编写内容
4. 在 `.vitepress/config.ts` 中添加 sidebar 链接（可选）

## 文档类型

| 类型 | 说明 | 目录 |
|------|------|------|
| **guide** | 开发指南教程 | `guides/` |
| **decision** | 架构决策记录（ADR） | `adr/` |
| **rfc** | 方案设计 | `rfc/` |
| **howto** | 操作手册（SOP） | `sop/` |
| **api** | API 参考文档 | `packages/` |
| **summary** | 总结报告 | `guides/integration/` |

## 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建静态站点 |
| `pnpm preview` | 预览构建产物 |
| `pnpm migrate` | 迁移文档（已执行） |
| `pnpm new-doc` | 创建新文档（交互式） |
| `pnpm validate-frontmatter` | 验证 frontmatter |

## 重要规则

1. **禁止在文档中心之外创建 .md 文档**
2. **所有技术文档必须在此目录下**
3. **使用 frontmatter 管理元数据**
4. **遵循文档类型规范**

## 相关链接

- [主应用](../admin-app/README.md)
- [项目根目录](../../README.md)

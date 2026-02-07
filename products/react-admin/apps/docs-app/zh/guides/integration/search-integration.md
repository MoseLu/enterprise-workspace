---
title: "搜索集成"
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags: ["integration", "guides"]
sidebar_label: 搜索集成
sidebar_order: 5
sidebar_group: integration
---
# VitePress 搜索整合到全局搜索

## 概述

已将 VitePress 文档搜索功能整合到主应用的全局搜索框（`Ctrl+K`），用户可以在一个统一的搜索界面中搜索：
- 菜单项（Menu Items）
- 页面（Pages）
- 文档内容（Documentation）

## 技术实现

### 1. 搜索端点

新增了文档搜索端点：
```
GET /api/docs/search?q={query}&limit={limit}
```

### 2. 搜索逻辑

```typescript
// 搜索实现
async function searchDocs(query: string, limit = 10) {
  // 调用 VitePress 搜索 API
  const results = await fetch(`/docs-search?q=${query}&limit=${limit}`);
  return results.json();
}
```

### 3. 集成方式

在主应用的搜索组件中集成了文档搜索：
- 统一搜索结果展示
- 支持键盘导航
- 保持一致的搜索体验

## 使用方式

### 快捷键搜索

1. 按 `Ctrl+K` 打开全局搜索
2. 输入搜索关键词
3. 在搜索结果中选择文档

### 搜索范围

- **文档标题**: 匹配文档标题
- **文档内容**: 全文搜索
- **标签**: 基于标签搜索
- **分类**: 基于文档分类搜索

## 配置说明

### 搜索配置

```typescript
// VitePress 搜索配置
export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              }
            }
          }
        }
      }
    }
  }
})
```

### 主应用集成

```typescript
// 主应用搜索组件
const searchResults = await searchDocs(query);
// 合并到全局搜索结果中
```

## 性能优化

### 搜索性能

- 使用本地搜索索引
- 支持异步搜索
- 结果缓存机制

### 用户体验

- 实时搜索建议
- 搜索结果高亮
- 键盘导航支持

## 测试验证

### 功能测试

1. **基础搜索**: 验证基本搜索功能
2. **中文搜索**: 验证中文关键词搜索
3. **结果展示**: 验证搜索结果正确显示
4. **导航功能**: 验证搜索结果导航

### 性能测试

- 搜索响应时间 < 100ms
- 支持并发搜索请求
- 内存使用合理

---

**集成状态**: 完成
**测试状态**: 通过
**维护团队**: 开发团队

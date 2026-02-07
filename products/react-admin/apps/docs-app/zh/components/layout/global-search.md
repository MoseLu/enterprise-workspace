---
title: "GlobalSearch 组件（全局搜索）"
type: api
project: layout
owner: dev-team
created: 2025-10-11
updated: 2025-10-11
publish: true
tags: ["layout"]
sidebar_label: "全局搜索"
sidebar_order: 7
sidebar_collapsed: false
sidebar_group: "Layout 组件"
---
# GlobalSearch 组件

## 功能概述

全局搜索组件，类似 VitePress 的顶栏搜索，提供快速查找菜单项和页面的功能

## 特性

### 核心功能
- **实时搜索**：输入关键词即时过滤结果
- **分组显示**：菜单项和页面分组展示
- **关键词高亮**：搜索结果中高亮匹配的关键词
- **面包屑导航**：显示菜单项的层级路径

### 键盘操作
- `Ctrl+K` / `Cmd+K`：快速聚焦搜索框
- `` / ``：导航搜索结果
- `Enter`：跳转到选中的结果
- `Esc`：关闭搜索弹层

### 搜索历史
- 自动保存最近 5 条搜索记录
- 数据存储在 localStorage
- 点击历史记录可快速重新搜索

### 快速访问
- 首页
- CRUD 测试页面
- 可自定义快捷访问列表

## 组件结构

```
global-search/
index.vue # 主组件
README.md # 说明文档
```

## 使用方式

```vue
<template>
<GlobalSearch />
</template>

<script setup>
import GlobalSearch from '@/layout/global-search/index.vue';
</script>
```

## Props

无需传入 props，组件完全自包含

## 搜索数据源

当前搜索范围包括：

### 菜单项
- 系统管理下的所有菜单
- 业务组件菜单
- Vite 插件菜单
- 国际化菜单

### 页面
- 主应用首页
- 各子应用概览页（物流工程品质生产）

## 样式定制

组件使用 CSS 变量，自动适配主题：

```scss
.global-search {
// 输入框宽度
width: 240px;

// 下拉框最小宽度
__dropdown {
min-width: 400px;
max-height: 480px;
}
}
```

## 国际化

支持中英文切换，使用以下 i18n keys：

- `common.global_search_placeholder`：搜索框占位符
- `common.no_search_results`：无结果提示
- `common.try_different_keywords`：建议文案
- `common.recent_searches`：最近搜索标题
- `common.quick_access`：快速访问标题
- `common.menu_items`：菜单项分组标题
- `common.pages`：页面分组标题
- `common.navigate`：键盘导航提示
- `common.select`：选择提示
- `common.close`：关闭提示

## 交互流程

```
用户输入 实时过滤 分组展示 键盘/鼠标选择 跳转页面 保存历史
```

## 扩展建议

### 1. 添加更多搜索源
```typescript
// 可以扩展搜索数据源
const searchData = ref([
// 添加文档
{ id: 'd1', type: 'doc', title: '快速开始', path: '/docs/quick-start' },

// 添加命令
{ id: 'c1', type: 'command', title: '切换主题', action: () => toggleTheme() },

// 添加设置项
{ id: 's1', type: 'setting', title: '通知设置', path: '/settings/notifications' },
]);
```

### 2. 远程搜索
```typescript
// 支持远程 API 搜索
const searchResults = computed(async () => {
if (!searchKeyword.value.trim()) return [];

const response = await fetch(`/api/search?q=${searchKeyword.value}`);
return await response.json();
});
```

### 3. 搜索结果页
```typescript
// 点击"查看全部结果"跳转到专门的搜索结果页
const handleViewAll = () => {
router.push({
path: '/search',
query: { q: searchKeyword.value }
});
};
```

### 4. 高级过滤
```typescript
// 支持过滤器语法
// 例如: "type:menu 用户" 只搜索菜单中包含"用户"的项
// 例如: "app:logistics 订单" 只搜索物流应用中的"订单"
```

## 性能优化

- 使用 `computed` 缓存搜索结果
- 键盘导航使用索引，避免 DOM 操作
- 下拉框使用虚拟滚动（当结果>100时）
- 搜索历史限制为 5 条，避免存储过多数据

## 可访问性

- 支持键盘完整操作
- 支持屏幕阅读器（role="combobox"）
- 清晰的焦点状态
- 高对比度文本

## 浏览器兼容性

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 未来规划

- [ ] 支持模糊搜索（拼音缩写）
- [ ] 搜索结果权重排序
- [ ] 搜索统计和热门关键词
- [ ] 自定义搜索源插件系统
- [ ] 离线搜索索引


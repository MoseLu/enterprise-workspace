---
title: "布局组件架构说明"
type: api
project: layout
owner: dev-team
created: 2025-10-11
updated: 2025-10-11
publish: true
tags: ["layout"]
---
# 布局组件架构说明

## 目录结构

本目录采用 **"目录即组件"** 架构，每个布局组件都是一个独立的文件夹

```
layout/
index.vue # 主布局入口
topbar/ # 顶栏组件
index.vue # 组件主文件
README.md # 组件文档
sidebar/ # 侧边栏组件
index.vue
README.md
process/ # 标签页进程栏
index.vue
README.md
breadcrumb/ # 面包屑导航
index.vue
README.md
menu-drawer/ # 菜单抽屉（应用切换）
index.vue
README.md
theme-switcher/ # 主题切换器
index.vue
README.md
locale-switcher/ # 语言切换器
index.vue
README.md
global-search/ # 全局搜索
index.vue
README.md
dynamic-menu/ # 动态菜单
index.vue
README.md
```

## 组件说明

### 主布局 (index.vue)
- 整体布局容器
- 管理侧边栏折叠状态
- 集成事件总线
- 区分主应用和子应用视图

### 顶栏 (topbar/)
- 折叠/展开按钮
- 全局搜索框
- 主题切换
- 语言切换
- 用户菜单（个人中心设置退出）

### 侧边栏 (sidebar/)
- Logo 区域
- 汉堡菜单按钮（打开应用抽屉）
- 动态菜单内容

### 标签页进程栏 (process/)
- 返回刷新首页按钮
- 标签页列表（可滚动）
- 标签页关闭
- 标签操作菜单（关闭其他/所有）
- 全屏切换

### 面包屑导航 (breadcrumb/)
- 显示当前页面层级位置
- 支持点击跳转到上级
- 应用隔离（每个应用独立）
- 国际化支持

### 菜单抽屉 (menu-drawer/)
- 显示所有微应用
- 应用卡片
- 应用切换
- 点击外部关闭

### 主题切换器 (theme-switcher/)
- 主题设置按钮
- 暗黑模式切换
- 预设主题选择
- 自定义颜色

### 语言切换器 (locale-switcher/)
- 语言下拉菜单
- 简体中文/English 切换
- 发送语言变更事件

### 全局搜索 (global-search/)
- 全局搜索框（Ctrl+K 快捷键）
- 实时搜索菜单和页面
- 弹层联想显示结果
- 键盘导航（上下键EnterEsc）
- 搜索历史记录
- 关键词高亮
- 快速访问常用页面

### 动态菜单 (dynamic-menu/)
- 根据当前应用显示不同菜单
- 支持多级子菜单
- 折叠/展开动画

## 导入方式

```typescript
// 从主布局导入
import Topbar from './topbar/index.vue'
import Sidebar from './sidebar/index.vue'
import Process from './process/index.vue'
import MenuDrawer from './menu-drawer/index.vue'

// 或使用简短路径（需要配置 resolve alias）
import Topbar from '@/layout/topbar'
```

## 命名规范

- **文件夹名**：kebab-case（如 `theme-switcher`）
- **组件名**：PascalCase（如 `LayoutThemeSwitcher`）
- **主文件**：统一为 `index.vue`

## 扩展性设计

每个组件目录可以根据需要添加：

```
topbar/
index.vue # 主组件
components/ # 子组件（如果需要）
composables.ts # 组合式函数（如果需要）
types.ts # 类型定义（如果需要）
styles.scss # 独立样式（如果需要）
README.md # 组件文档
```

## 优势

**可扩展**：组件长大时可轻松添加相关文件
**职责清晰**：每个文件夹就是一个功能边界
**易协作**：新人一看目录就懂组件结构
**便于维护**：相关文件就近放置，不用全局搜索
**性能优化**：代码分割粒度清晰

## 注意事项

1. **组件命名**：所有组件都使用 `defineOptions({ name: 'LayoutXxx' })` 声明名称
2. **样式作用域**：使用 `scoped` 避免样式污染
3. **类型安全**：Props 和 Emits 都有完整的 TypeScript 类型定义
4. **性能优化**：使用 CSS `transform: translateZ(0)` 开启硬件加速

## 相关文档

- [布局重构指南](../../../LAYOUT-REFACTOR-GUIDE.md)
- [SVG 图标问题排查](../../../SVG-ICONS-TROUBLESHOOTING.md)


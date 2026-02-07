---
title: "Process 组件（标签页进程栏）"
type: api
project: layout
owner: dev-team
created: 2025-10-11
updated: 2025-10-11
publish: true
tags: ["layout"]
sidebar_label: "进程栏"
sidebar_order: 3
sidebar_collapsed: false
sidebar_group: "Layout 组件"
---
# Process 组件（标签页进程栏）

## 功能描述

标签页进程栏组件，用于显示和管理当前应用的打开标签页

## 特性

### 应用隔离
- 每个微应用的标签页独立管理
- 切换应用时只显示当前应用的标签
- 关闭标签操作只影响当前应用

### 标签页操作
- **点击标签**：切换到对应页面
- **点击关闭**：关闭单个标签
- **右键菜单**：关闭当前/其他标签
- **操作菜单**：关闭其他/所有标签

### 快捷操作
- **返回**：返回上一页（当前应用内）
- **刷新**：刷新当前视图
- **首页**：返回当前应用首页
- **全屏**：页面内全屏（隐藏顶栏和侧边栏）

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| isFullscreen | boolean | false | 是否全屏模式 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| toggle-fullscreen | - | 切换全屏模式 |

## 使用示例

```vue
<template>
<Process
:is-fullscreen="isFullscreen"
@toggle-fullscreen="toggleFullscreen"
/>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Process from '@/layout/process'

const isFullscreen = ref(false)

function toggleFullscreen() {
isFullscreen.value = !isFullscreen.value
}
</script>
```

## 标签页操作菜单

位于全屏按钮左侧的下拉菜单，提供以下功能：

### 关闭其他
- 关闭当前应用内除当前标签外的所有标签
- 保留其他应用的标签不受影响
- 当只有 1 个标签时禁用

### 关闭所有
- 关闭当前应用内的所有标签
- 保留其他应用的标签不受影响
- 自动跳转到当前应用首页
- 当没有标签时禁用

## 全屏模式

### 页面内全屏（非浏览器全屏）

点击全屏按钮后：
- 隐藏侧边栏
- 隐藏顶栏
- **保留标签页进程栏**（用于恢复全屏和切换标签）
- 内容区域最大化
- 再次点击全屏按钮恢复正常

**优势**：
- 不触发浏览器全屏警告
- 用户体验更流畅
- 快捷键不冲突（如 F11）
- 不影响其他标签页
- 保留标签栏便于快速切换和恢复

## 国际化支持

使用以下国际化 key：
- `common.close_other` - 关闭其他
- `common.close_all` - 关闭所有
- `common.tip` - 提示
- `common.close_current` - 关闭当前
- `common.button.cancel` - 取消

## 应用首页配置

不同应用的首页路由：

```typescript
const appHomes: Record<string, string> = {
'main': '/',
'logistics': '/logistics',
'engineering': '/engineering',
'quality': '/quality',
'production': '/production',
}
```

## 注意事项

1. **应用隔离**：所有标签页操作都只影响当前应用
2. **状态同步**：全屏状态由父组件管理，避免状态不一致
3. **性能优化**：使用虚拟滚动处理大量标签（如需要）
4. **国际化**：标签名称优先使用 i18n key

## 样式定制

### 激活标签样式
```scss
&.active {
background-color: var(--el-color-primary);
border-color: var(--el-color-primary);
color: #fff;
}
```

### 关闭按钮样式
```scss
.close {
font-size: 14px;
&:hover {
background-color: rgba(0, 0, 0, 0.1); // 普通标签
}
}

&.active .close:hover {
background-color: rgba(255, 255, 255, 0.3); // 激活标签
}
```

## 相关组件

- [Layout](../README.md) - 主布局
- [Topbar](../topbar/README.md) - 顶栏
- [Sidebar](../sidebar/README.md) - 侧边栏

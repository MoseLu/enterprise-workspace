---
title: 'BTC SVG 图标组件'
type: package
project: components
owner: dev-team
created: '2025-10-11'
updated: '2025-10-13'
publish: true
tags:
- packages
- components
- svg
sidebar_label: btc-svg
sidebar_order: 7
sidebar_group: packages
---
# BTC SVG 图标组件

SVG 图标组件，用于显示通过 vite-plugin 自动扫描的 SVG 图标

## 功能特性

- 自动识别 SVG sprite 中的图标
- 支持自定义大小颜色
- 继承父元素的文本颜色（通过 currentColor）
- 支持丰富的图标动画效果
- 与 cool-admin-vue 的 cl-svg 组件 API 完全一致

## 使用方式

### 基础用法

```vue
<template>
<!-- 显示 icon-home.svg -->
<btc-svg name="home" />

<!-- 显示 icon-user.svg -->
<btc-svg name="user" />
</template>
```

### 自定义大小

```vue
<template>
<!-- 字符串形式 -->
<btc-svg name="home" size="24px" />

<!-- 数字形式（自动添加 px） -->
<btc-svg name="home" :size="32" />
</template>
```

### 自定义颜色

```vue
<template>
<!-- 直接设置颜色 -->
<btc-svg name="home" color="#409eff" />

<!-- 继承父元素颜色（默认） -->
<div style="color: red">
<btc-svg name="home" />
</div>
</template>
```

### 自定义类名

```vue
<template>
<btc-svg name="home" class-name="my-custom-icon" />
</template>

<style>
.my-custom-icon {
margin-right: 8px;
}
</style>
```

### 图标动画

`btc-svg` 支持多种动画效果，可以通过 `animation` 属性启用：

```vue
<template>
<!-- 悬浮时旋转180度 -->
<btc-svg name="set" :size="16" animation="rotate" animation-trigger="hover" />

<!-- 持续旋转（加载动画） -->
<btc-svg name="loading" :size="16" animation="spin" animation-trigger="always" />

<!-- 悬浮时略微变大 -->
<btc-svg name="bell" :size="16" animation="grow" animation-trigger="hover" />

<!-- 脉冲动画 -->
<btc-svg name="notification" :size="16" animation="pulse" animation-trigger="always" />

<!-- 自定义动画持续时间 -->
<btc-svg name="icon" :size="16" animation="spin" :animation-duration="2" />
</template>
```

#### 支持的动画类型

| 动画类型 | 说明 | 适用场景 |
|---------|------|---------|
| `rotate` | 旋转（悬浮时旋转180度） | 设置按钮、切换按钮 |
| `spin` | 持续旋转（360度循环） | 加载状态、刷新按钮 |
| `pulse` | 脉冲（缩放动画，带透明度变化） | 通知提醒、重要提示 |
| `grow` | 略微变大（悬浮时放大） | 交互反馈、按钮图标 |
| `bounce` | 弹跳 | 错误提示、警告 |
| `shake` | 摇晃 | 错误提示、警告 |
| `fade` | 淡入淡出 | 状态切换、提示信息 |
| `flip` | 翻转 | 切换状态、方向改变 |

#### 动画触发方式

- `hover`（默认）：悬浮时触发动画
- `always`：始终播放动画

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 图标名称（不需要 icon- 前缀） | string | - |
| size | 图标大小 | string \| number | - |
| color | 图标颜色 | string | - |
| className | 自定义类名 | string | - |
| animation | 动画类型 | `'rotate' \| 'spin' \| 'pulse' \| 'grow' \| 'bounce' \| 'shake' \| 'fade' \| 'flip' \| false` | `false` |
| animationTrigger | 动画触发方式 | `'always' \| 'hover'` | `'hover'` |
| animationDuration | 动画持续时间（秒） | string \| number | - |
| animationDelay | 动画延迟（秒） | string \| number | - |

## SVG 文件命名规则

### 1. 通用图标（带 icon- 前缀）

文件名：`icon-home.svg`
使用：`<btc-svg name="home" />`

vite-plugin 会自动跳过模块名拼接，直接使用 `icon-home` 作为 symbol id

### 2. 模块图标（不带 icon- 前缀）

文件名：`modules/user/avatar.svg`
使用：`<btc-svg name="user-avatar" />`

vite-plugin 会自动拼接模块名 `user-avatar`

## 与 cool-admin-vue 的 cl-svg 对比

| 特性 | btc-svg | cl-svg |
|------|---------|--------|
| 组件名称 | btc-svg | cl-svg |
| API | 完全一致 | - |
| 样式类名 | btc-svg | cl-svg |
| 功能 | 完全一致 | - |

## 国际化图标示例

```vue
<template>
<!-- 中文图标 -->
<btc-svg name="icon-zh" />

<!-- 英文图标 -->
<btc-svg name="icon-en" />

<!-- 日文图标 -->
<btc-svg name="icon-ja" />
</template>
```

## 注意事项

1. **图标名称不需要 `icon-` 前缀**：组件会自动添加
2. **SVG 文件位置**：放在 `src/` 目录下，vite-plugin 会自动扫描
3. **颜色继承**：默认继承父元素的文本颜色（`fill: currentColor`）
4. **大小单位**：数字类型会自动添加 `px` 单位
5. **动画性能**：动画使用 CSS transform 和 opacity，性能优化良好
6. **动画触发**：`hover` 模式只在支持悬浮的设备上生效，触摸设备会自动降级
7. **动画持续时间**：如果不指定 `animationDuration`，将使用各动画类型的默认值

## 完整示例

```vue
<template>
<div class="icon-demo">
<!-- 基础图标 -->
<btc-svg name="home" />

<!-- 大图标 -->
<btc-svg name="user" :size="48" />

<!-- 彩色图标 -->
<btc-svg name="star" color="#f5a623" :size="32" />

<!-- 在按钮中使用 -->
<el-button>
<btc-svg name="add" :size="16" />
添加
</el-button>

<!-- 国际化切换 -->
<btc-svg
:name="locale === 'zh-CN' ? 'icon-zh' : 'icon-en'"
:size="24"
/>

<!-- 带动画的图标 -->
<div class="animated-icons">
<!-- 设置按钮：悬浮时旋转 -->
<btc-svg name="set" :size="16" animation="rotate" animation-trigger="hover" />

<!-- 加载图标：持续旋转 -->
<btc-svg name="loading" :size="16" animation="spin" animation-trigger="always" />

<!-- 通知图标：悬浮时放大 -->
<btc-svg name="bell" :size="16" animation="grow" animation-trigger="hover" />

<!-- 消息图标：脉冲动画 -->
<btc-svg name="msg" :size="16" animation="pulse" animation-trigger="always" />
</div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const locale = ref('zh-CN');
</script>
```

## 动画使用场景示例

### 1. 设置按钮（悬浮旋转）

```vue
<template>
<btc-svg name="set" :size="16" animation="rotate" animation-trigger="hover" />
</template>
```

### 2. 加载状态（持续旋转）

```vue
<template>
<btc-svg name="loading" :size="16" animation="spin" animation-trigger="always" />
</template>
```

### 3. 通知提醒（悬浮放大）

```vue
<template>
<btc-svg name="bell" :size="16" animation="grow" animation-trigger="hover" />
</template>
```

### 4. 重要提示（脉冲动画）

```vue
<template>
<btc-svg name="notification" :size="16" animation="pulse" animation-trigger="always" />
</template>
```

### 5. 自定义动画速度

```vue
<template>
<!-- 慢速旋转（2秒一圈） -->
<btc-svg name="loading" :size="16" animation="spin" :animation-duration="2" />

<!-- 快速脉冲（0.5秒一次） -->
<btc-svg name="bell" :size="16" animation="pulse" :animation-duration="0.5" />
</template>
```


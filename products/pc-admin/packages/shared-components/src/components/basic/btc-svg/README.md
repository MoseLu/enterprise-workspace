# BtcSvg 图标组件

SVG 图标组件，用于显示通过 vite-plugin 自动扫描的 SVG 图标。

## 概述

`BtcSvg` 是一个 SVG 图标组件，通过 vite-plugin 自动扫描项目中的 SVG 文件并生成 sprite，提供统一的图标使用方式。与 cool-admin-vue 的 `cl-svg` 组件 API 完全一致。

## 特性

- ✅ **自动识别 SVG sprite**：通过 vite-plugin 自动扫描和生成
- ✅ **自定义大小颜色**：支持灵活的大小和颜色配置
- ✅ **继承父元素颜色**：默认通过 `currentColor` 继承父元素文本颜色
- ✅ **丰富的动画效果**：支持 8 种动画类型（旋转、脉冲、弹跳等）
- ✅ **完全兼容 cl-svg**：API 与 cool-admin-vue 的 cl-svg 完全一致
- ✅ **TypeScript 支持**：完整的类型定义

## 基本用法

### 基础图标

```vue
<template>
  <!-- 显示 icon-home.svg -->
  <BtcSvg name="home" />

  <!-- 显示 icon-user.svg -->
  <BtcSvg name="user" />
</template>

<script setup lang="ts">
import { BtcSvg } from '@btc/shared-components';
</script>
```

### 自定义大小

```vue
<template>
  <!-- 字符串形式 -->
  <BtcSvg name="home" size="24px" />

  <!-- 数字形式（自动添加 px） -->
  <BtcSvg name="home" :size="32" />
</template>
```

### 自定义颜色

```vue
<template>
  <!-- 直接设置颜色 -->
  <BtcSvg name="home" color="#409eff" />

  <!-- 继承父元素颜色（默认） -->
  <div style="color: red">
    <BtcSvg name="home" />
  </div>
</template>
```

### 自定义类名

```vue
<template>
  <BtcSvg name="home" class-name="my-custom-icon" />
</template>

<style>
.my-custom-icon {
  margin-right: 8px;
}
</style>
```

## 图标动画

`BtcSvg` 支持多种动画效果，可以通过 `animation` 属性启用：

### 动画类型

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

### 动画触发方式

- `hover`（默认）：悬浮时触发动画
- `always`：始终播放动画

### 使用示例

```vue
<template>
  <!-- 悬浮时旋转180度 -->
  <BtcSvg name="set" :size="16" animation="rotate" animation-trigger="hover" />

  <!-- 持续旋转（加载动画） -->
  <BtcSvg name="loading" :size="16" animation="spin" animation-trigger="always" />

  <!-- 悬浮时略微变大 -->
  <BtcSvg name="bell" :size="16" animation="grow" animation-trigger="hover" />

  <!-- 脉冲动画 -->
  <BtcSvg name="notification" :size="16" animation="pulse" animation-trigger="always" />

  <!-- 自定义动画持续时间 -->
  <BtcSvg name="icon" :size="16" animation="spin" :animation-duration="2" />
</template>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `name` | 图标名称（不需要 icon- 前缀） | `string` | - |
| `size` | 图标大小 | `string \| number` | - |
| `color` | 图标颜色 | `string` | - |
| `className` | 自定义类名 | `string` | - |
| `animation` | 动画类型 | `'rotate' \| 'spin' \| 'pulse' \| 'grow' \| 'bounce' \| 'shake' \| 'fade' \| 'flip' \| false` | `false` |
| `animationTrigger` | 动画触发方式 | `'always' \| 'hover'` | `'hover'` |
| `animationDuration` | 动画持续时间（秒） | `string \| number` | - |
| `animationDelay` | 动画延迟（秒） | `string \| number` | - |

## SVG 文件命名规则

### 1. 通用图标（带 icon- 前缀）

文件名：`icon-home.svg`  
使用：`<BtcSvg name="home" />`

vite-plugin 会自动跳过模块名拼接，直接使用 `icon-home` 作为 symbol id。

### 2. 模块图标（不带 icon- 前缀）

文件名：`modules/user/avatar.svg`  
使用：`<BtcSvg name="user-avatar" />`

vite-plugin 会自动拼接模块名 `user-avatar`。

## 使用场景示例

### 1. 设置按钮（悬浮旋转）

```vue
<template>
  <BtcSvg name="set" :size="16" animation="rotate" animation-trigger="hover" />
</template>
```

### 2. 加载状态（持续旋转）

```vue
<template>
  <BtcSvg name="loading" :size="16" animation="spin" animation-trigger="always" />
</template>
```

### 3. 通知提醒（悬浮放大）

```vue
<template>
  <BtcSvg name="bell" :size="16" animation="grow" animation-trigger="hover" />
</template>
```

### 4. 重要提示（脉冲动画）

```vue
<template>
  <BtcSvg name="notification" :size="16" animation="pulse" animation-trigger="always" />
</template>
```

### 5. 在按钮中使用

```vue
<template>
  <el-button>
    <BtcSvg name="add" :size="16" />
    添加
  </el-button>
</template>
```

### 6. 国际化切换

```vue
<template>
  <BtcSvg
    :name="locale === 'zh-CN' ? 'icon-zh' : 'icon-en'"
    :size="24"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const locale = ref('zh-CN');
</script>
```

## 注意事项

1. **图标名称不需要 `icon-` 前缀**：组件会自动添加
2. **SVG 文件位置**：放在 `src/` 目录下，vite-plugin 会自动扫描
3. **颜色继承**：默认继承父元素的文本颜色（`fill: currentColor`）
4. **大小单位**：数字类型会自动添加 `px` 单位
5. **动画性能**：动画使用 CSS transform 和 opacity，性能优化良好
6. **动画触发**：`hover` 模式只在支持悬浮的设备上生效，触摸设备会自动降级
7. **动画持续时间**：如果不指定 `animationDuration`，将使用各动画类型的默认值

## 与 cool-admin-vue 的 cl-svg 对比

| 特性 | btc-svg | cl-svg |
|------|---------|--------|
| 组件名称 | `BtcSvg` | `ClSvg` |
| API | 完全一致 | - |
| 样式类名 | `btc-svg` | `cl-svg` |
| 基础功能 | ✅ | ✅ |
| 动画支持 | ✅（8种动画） | - |
| TypeScript | ✅ | - |

## 类型定义

```typescript
import type { BtcSvgAnimation, BtcSvgAnimationTrigger } from '@btc/shared-components';

// 动画类型
type BtcSvgAnimation = 
  | 'rotate'      // 旋转（悬浮时旋转180度）
  | 'spin'        // 持续旋转（360度循环）
  | 'pulse'       // 脉冲（缩放动画）
  | 'grow'        // 略微变大（悬浮时放大）
  | 'bounce'      // 弹跳
  | 'shake'       // 摇晃
  | 'fade'        // 淡入淡出
  | 'flip'        // 翻转
  | false         // 无动画
  | undefined;    // 无动画

// 动画触发方式
type BtcSvgAnimationTrigger = 'always' | 'hover';
```

## 最佳实践

1. **统一使用**：在项目中统一使用 `BtcSvg` 替代直接使用 SVG，保持一致性
2. **动画选择**：根据使用场景选择合适的动画类型和触发方式
3. **性能优化**：对于频繁使用的图标，避免使用 `always` 模式的动画
4. **颜色继承**：优先使用 `currentColor` 继承父元素颜色，而非直接设置 `color` 属性
5. **大小统一**：在项目中统一图标大小，建议使用预设值（16、20、24、32）

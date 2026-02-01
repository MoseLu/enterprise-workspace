# BtcEmpty 组件

基于 `el-empty` 封装，优化了样式和布局的空状态组件。

## 概述

`BtcEmpty` 是对 Element Plus `el-empty` 组件的封装，在保持所有原有功能的基础上，优化了样式和布局，提供了更统一的视觉体验。

## 特性

- ✅ **完全兼容 `el-empty`**：支持所有 `el-empty` 的 Props、Slots 和功能
- ✅ **优化样式**：统一间距、字体大小、透明度等
- ✅ **尺寸预设**：提供 `small`、`default`、`large` 三种尺寸
- ✅ **自定义样式支持**：支持 Element Plus 的 CSS 变量自定义

## 基本用法

```vue
<template>
  <BtcEmpty description="暂无数据" />
</template>

<script setup lang="ts">
import { BtcEmpty } from '@btc/shared-components';
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `image` | 空状态图片类型（URL） | `string` | - |
| `imageSize` | 图片大小（像素） | `number` | `100` |
| `description` | 描述文本 | `string` | - |
| `size` | 尺寸大小：`small`(80px)、`default`(100px)、`large`(120px) | `'small' \| 'default' \| 'large'` | `'default'` |

### 说明

- 所有 `el-empty` 的原生 Props 都通过 `v-bind="$attrs"` 传递，完全兼容
- `imageSize` 和 `size` 可以同时使用，`imageSize` 优先级更高

## 插槽

| 插槽名 | 说明 |
|--------|------|
| `default` | 底部内容（在描述文本下方） |
| `image` | 自定义图片内容 |
| `description` | 自定义描述内容 |

### 插槽示例

```vue
<template>
  <!-- 底部内容 -->
  <BtcEmpty description="暂无数据">
    <el-button type="primary">刷新</el-button>
  </BtcEmpty>

  <!-- 自定义图片 -->
  <BtcEmpty>
    <template #image>
      <el-icon :size="100"><Document /></el-icon>
    </template>
    <template #description>
      <span>暂无数据</span>
    </template>
  </BtcEmpty>
</template>
```

## 功能支持

### ✅ 完全支持的功能

1. **image-size 属性**：通过 `imageSize` prop 或 `image-size` 属性控制图片大小
2. **默认插槽**：支持在底部插入内容（按钮、链接等）
3. **自定义样式**：支持 Element Plus 的 CSS 变量自定义
   - `--el-empty-fill-color-0` 到 `--el-empty-fill-color-9`
4. **image 插槽**：支持自定义图片内容
5. **description 插槽**：支持自定义描述内容
6. **image 属性**：支持自定义图片 URL
7. **description 属性**：支持描述文本

### 自定义样式示例

```vue
<template>
  <BtcEmpty description="暂无数据" />
</template>

<style>
:root {
  --el-empty-fill-color-0: #ffffff;
  --el-empty-fill-color-1: #fcfcfd;
  --el-empty-fill-color-2: #f8f9fb;
  /* ... 其他颜色变量 */
}
</style>
```

## 使用示例

### 示例 1：基础用法

```vue
<template>
  <BtcEmpty description="暂无数据" />
</template>
```

### 示例 2：自定义图片大小

```vue
<template>
  <BtcEmpty :image-size="120" description="暂无数据" />
</template>
```

### 示例 3：使用尺寸预设

```vue
<template>
  <BtcEmpty size="small" description="暂无数据" />
  <BtcEmpty size="default" description="暂无数据" />
  <BtcEmpty size="large" description="暂无数据" />
</template>
```

### 示例 4：底部内容

```vue
<template>
  <BtcEmpty description="暂无数据">
    <el-button type="primary" @click="handleRefresh">刷新</el-button>
  </BtcEmpty>
</template>
```

### 示例 5：自定义图片

```vue
<template>
  <BtcEmpty>
    <template #image>
      <el-icon :size="100" color="#909399">
        <Document />
      </el-icon>
    </template>
    <template #description>
      <span>暂无数据</span>
    </template>
  </BtcEmpty>
</template>
```

### 示例 6：自定义图片 URL

```vue
<template>
  <BtcEmpty 
    image="https://via.placeholder.com/150" 
    :image-size="150"
    description="暂无数据" 
  />
</template>
```

## 样式定制

组件使用 CSS 变量，可以通过覆盖变量来定制样式：

```scss
.btc-empty {
  --el-text-color-secondary: #909399;
}
```

### Element Plus 空状态颜色变量

```scss
:root {
  --el-empty-fill-color-0: var(--el-color-white);
  --el-empty-fill-color-1: #fcfcfd;
  --el-empty-fill-color-2: #f8f9fb;
  --el-empty-fill-color-3: #f7f8fc;
  --el-empty-fill-color-4: #eeeff3;
  --el-empty-fill-color-5: #edeef2;
  --el-empty-fill-color-6: #e9ebef;
  --el-empty-fill-color-7: #e5e7e9;
  --el-empty-fill-color-8: #e0e3e9;
  --el-empty-fill-color-9: #d5d7de;
}
```

## 注意事项

1. **属性优先级**：`props.imageSize` 优先级高于 `size` 预设
2. **样式继承**：组件样式会继承 Element Plus 的 CSS 变量
3. **完全兼容**：所有 `el-empty` 的功能都通过 `v-bind="$attrs"` 传递，完全兼容

## 与 el-empty 的区别

| 特性 | el-empty | BtcEmpty |
|------|----------|----------|
| 基础功能 | ✅ | ✅（完全兼容） |
| 样式优化 | - | ✅（统一间距、字体等） |
| 尺寸预设 | - | ✅（small/default/large） |
| CSS 变量支持 | ✅ | ✅（完全支持） |
| 插槽支持 | ✅ | ✅（完全支持） |

## 最佳实践

1. **统一使用**：在项目中统一使用 `BtcEmpty` 替代 `el-empty`，保持视觉一致性
2. **尺寸选择**：根据使用场景选择合适的尺寸（表格用 `default`，卡片用 `small`）
3. **自定义样式**：如需全局修改空状态颜色，使用 CSS 变量而非直接覆盖样式

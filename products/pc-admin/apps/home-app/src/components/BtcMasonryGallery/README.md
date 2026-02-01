# BtcMasonryGallery 瀑布流照片墙组件

一个响应式的瀑布流照片墙组件，支持自动列数调整和图片懒加载。

## 功能特性

- ✅ 响应式布局，自动适配不同屏幕尺寸
- ✅ 支持自定义列数和间距
- ✅ 图片悬停效果
- ✅ 支持标题和描述信息
- ✅ 图片加载状态管理
- ✅ 点击事件支持

## 使用方法

### 基本用法

```vue
<template>
  <BtcMasonryGallery
    :items="galleryItems"
    :columns="'auto'"
    :gap="16"
    @item-click="handleItemClick"
  />
</template>

<script setup lang="ts">
import BtcMasonryGallery from '@/components/BtcMasonryGallery.vue';
import type { MasonryItem } from '@/components/BtcMasonryGallery.vue';

const galleryItems: MasonryItem[] = [
  {
    id: 1,
    src: '/path/to/image1.jpg',
    alt: '图片1',
    title: '标题',
    description: '描述信息',
  },
  // ... 更多图片
];

const handleItemClick = (item: MasonryItem, index: number) => {
  console.log('点击了图片:', item, index);
};
</script>
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| items | `MasonryItem[]` | `[]` | 图片数据数组（必填） |
| columns | `number \| 'auto'` | `'auto'` | 列数，'auto' 表示自动适配 |
| gap | `number` | `16` | 图片间距（像素） |

## MasonryItem 接口

```typescript
interface MasonryItem {
  id?: string | number;      // 唯一标识
  src: string;               // 图片地址（必填）
  alt?: string;              // 图片替代文本
  title?: string;            // 标题
  description?: string;      // 描述
  width?: number;            // 图片宽度（可选）
  height?: number;           // 图片高度（可选）
}
```

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| item-click | `(item: MasonryItem, index: number)` | 点击图片时触发 |

## 响应式列数

当 `columns` 设置为 `'auto'` 时，组件会根据屏幕宽度自动调整列数：

- 宽度 ≥ 1200px: 4 列
- 宽度 ≥ 768px: 3 列
- 宽度 ≥ 480px: 2 列
- 宽度 < 480px: 1 列

## 样式定制

组件使用 scoped 样式，如需自定义样式，可以通过以下方式：

1. 使用 CSS 变量（如果组件支持）
2. 通过父容器类名覆盖样式
3. 使用深度选择器 `:deep()`

## 注意事项

- 确保图片地址有效，组件会处理加载失败的情况
- 建议为每张图片提供合适的 `alt` 文本以提升可访问性
- 大量图片时建议使用图片懒加载优化性能


# BtcImageContainer 图片容器组件

`BtcImageContainer` 是一个图片网格展示容器组件，使用 CSS Grid 布局，支持响应式设计，用于展示图片卡片列表。

## 功能特性

- ✅ CSS Grid 网格布局，默认 3 列
- ✅ 响应式设计（桌面 3 列，平板 2 列，手机 1 列）
- ✅ 图片懒加载
- ✅ 卡片悬停效果
- ✅ 标签和统计信息展示
- ✅ 点击事件支持

## 基本用法

```vue
<template>
  <BtcImageContainer
    :items="imageList"
    :columns="3"
    :gap="16"
    @card-click="handleCardClick"
  />
</template>

<script setup lang="ts">
import { BtcImageContainer } from '@btc/shared-components';
import type { ImageItem } from '@btc/shared-components';

const imageList: ImageItem[] = [
  {
    id: 1,
    src: 'https://example.com/image1.jpg',
    title: '图片标题',
    tags: ['标签1', '标签2'],
    downloads: 100,
    favorites: 50,
    resolution: '1920x1080',
    fileSize: '1.5 MB',
  },
];

const handleCardClick = (item: ImageItem) => {
  console.log('点击了图片:', item);
};
</script>
```

## Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| items | `ImageItem[]` | `[]` | 图片数据数组（必填） |
| columns | `number` | `3` | 列数，默认 3 列 |
| gap | `number \| string` | `16` | 卡片间距，默认 16px |
| cardMinHeight | `number` | - | 卡片最小高度（暂未使用） |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| card-click | `(item: ImageItem)` | 点击卡片时触发 |

## ImageItem 接口

```typescript
export interface ImageItem {
  id: string | number;           // 图片ID（必填）
  src: string;                    // 图片地址（必填）
  alt?: string;                   // 图片描述
  title?: string;                 // 图片标题
  tags?: string[];                // 标签数组
  downloads?: number;             // 下载数
  favorites?: number;             // 收藏数
  resolution?: string;            // 分辨率（如 "2358x1740"）
  fileSize?: string;              // 文件大小（如 "585 KB"）
  category?: string;              // 分类
  colorScheme?: string;           // 色系
  publishDate?: string;           // 发布时间
  link?: string;                  // 点击链接
  // 图表图片相关参数
  chartType?: string;             // 图表类型
  chartConfig?: Record<string, any>; // 图表配置参数
  dataSource?: string;            // 数据源
  dataRange?: string;             // 数据时间范围
  [key: string]: any;            // 允许扩展其他参数
}
```

## 响应式断点

- **桌面（>1200px）**：使用指定的列数（默认 3 列）
- **平板（769px-1200px）**：强制 2 列
- **手机（≤768px）**：强制 1 列

## 样式定制

组件使用 CSS 变量和 SCSS，可以通过覆盖样式进行定制：

```scss
.btc-image-container {
  // 自定义样式
}
```

## 注意事项

1. `items` 数组中的每个项必须包含 `id` 和 `src` 字段
2. 图片使用懒加载，提升性能
3. 卡片点击事件会传递完整的 `ImageItem` 对象
4. 标签最多显示 3 个，超出部分显示 "+N"

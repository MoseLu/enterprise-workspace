# BtcImageDetail 图片详情页组件

`BtcImageDetail` 是一个图片详情页组件，主要用于展示图表图片的参数信息，包括图片基本信息、图表配置参数、数据源信息等。

## 功能特性

- ✅ 大图展示，支持缩放和全屏查看
- ✅ 图片基本信息展示（标题、分辨率、大小等）
- ✅ 图片参数信息展示（图表类型、配置参数、数据源等）
- ✅ 标签列表展示
- ✅ 相关图片推荐
- ✅ 响应式布局

## 基本用法

```vue
<template>
  <BtcImageDetail
    :image="imageData"
    :show-related="true"
    @tag-click="handleTagClick"
    @related-click="handleRelatedClick"
  />
</template>

<script setup lang="ts">
import { BtcImageDetail } from '@btc/shared-components';
import type { ImageItem } from '@btc/shared-components';

const imageData: ImageItem = {
  id: 1,
  src: 'https://example.com/image.jpg',
  title: '销售趋势图',
  resolution: '1920x1080',
  fileSize: '1.5 MB',
  chartType: 'line',
  chartConfig: {
    color: '#409EFF',
    animation: true,
  },
  dataSource: '销售数据库',
  dataRange: '2024-01-01 至 2024-12-31',
  tags: ['销售', '趋势', '图表'],
};

const handleTagClick = (tag: string) => {
  console.log('点击了标签:', tag);
};

const handleRelatedClick = (image: ImageItem) => {
  console.log('点击了相关图片:', image);
};
</script>
```

## Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| imageId | `string \| number` | - | 图片ID（用于加载详情数据，可选） |
| image | `ImageItem` | - | 图片数据（如果已加载，可直接传入） |
| showRelated | `boolean` | `true` | 是否显示相关图片推荐 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| tag-click | `(tag: string)` | 点击标签时触发 |
| related-click | `(image: ImageItem)` | 点击相关图片时触发 |
| download | `(image: ImageItem)` | 下载图片时触发（如果需要） |

## 组件结构

详情页包含以下子组件：

1. **ImageViewer** - 主图片查看器
   - 支持图片预览和缩放
   - 使用 Element Plus 的 `el-image` 组件

2. **ImageInfo** - 图片基本信息
   - 标题、分类、分辨率、文件大小等
   - 使用 `el-descriptions` 组件展示

3. **ImageParams** - 图片参数信息
   - 图表类型、配置参数、数据源等
   - 支持 JSON 格式的配置参数展示（使用折叠面板）

4. **ImageTags** - 标签列表
   - 显示所有相关标签
   - 标签可点击

5. **RelatedImages** - 相关图片推荐
   - 使用 `BtcImageContainer` 组件展示
   - 点击可跳转到对应的详情页

## 布局说明

- **桌面（≥1200px）**：信息区域采用 2 列网格布局
- **移动端（<1200px）**：信息区域采用单列布局
- 主图片区域始终占据全宽

## 注意事项

1. 必须提供 `image` 或 `imageId` 之一
2. 如果提供 `imageId`，需要实现相应的 API 调用逻辑（目前为占位）
3. 相关图片的加载逻辑需要根据实际需求实现
4. 图表配置参数会以 JSON 格式展示在折叠面板中

## 扩展说明

组件支持通过 `ImageItem` 接口扩展其他参数：

```typescript
const imageData: ImageItem = {
  id: 1,
  src: '...',
  // 扩展其他参数
  customParam1: 'value1',
  customParam2: 'value2',
};
```

这些扩展参数可以在子组件中通过 `image[key]` 访问。

# BtcTabsCategoryContainer 分类标签容器

`BtcTabsCategoryContainer` 是一个智能的分类标签容器组件，它结合了 `BtcTabs` 和 `BtcContainer` 的功能，用于渲染类似图标展示页面这种多种类别的平行子元素。组件会根据分类数量和元素数量自动选择最佳的布局方式（垂直 tabs 或水平 tabs）。

## 设计理念

1. **智能布局切换**：根据分类数量和元素数量动态选择布局方向
   - **垂直 Tabs（左侧）**：当分类数量 ≥ 4 个，或单个分类的元素数量较多时使用
   - **水平 Tabs（顶部）**：当分类数量 < 4 个，且元素数量较少时使用
2. **响应式适配**：自动根据屏幕尺寸调整布局
3. **灵活的内容渲染**：支持通过插槽自定义每个分类的内容展示

## 布局规则

### 垂直 Tabs（左侧布局）
- **触发条件**：
  - 分类数量 ≥ 4 个
  - 或单个分类的元素数量 ≥ 20 个
  - 或通过 `layout` prop 强制指定为 `'vertical'`
- **布局结构**：
  ```
  ┌─────────┬──────────────────┐
  │         │                  │
  │  Tabs   │   Content Area  │
  │ (左侧)  │   (右侧)         │
  │         │                  │
  └─────────┴──────────────────┘
  ```

### 水平 Tabs（顶部布局）
- **触发条件**：
  - 分类数量 < 4 个
  - 且单个分类的元素数量 < 20 个
  - 或通过 `layout` prop 强制指定为 `'horizontal'`
- **布局结构**：
  ```
  ┌──────────────────────────┐
  │      Tabs (顶部)          │
  ├──────────────────────────┤
  │                          │
  │     Content Area         │
  │                          │
  └──────────────────────────┘
  ```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `categories` | 分类数据数组 | `BtcCategory[]` | `[]` |
| `modelValue` | 当前激活的分类名称 | `string \| number` | - |
| `defaultCategory` | 默认激活的分类名称 | `string \| number` | - |
| `layout` | 布局方向，`'auto'` 表示自动选择 | `'auto' \| 'horizontal' \| 'vertical'` | `'auto'` |
| `verticalTabsWidth` | 垂直布局时左侧 tabs 的宽度 | `number \| string` | `200` |
| `gap` | 内容区域子元素之间的间距 | `number \| string` | `10` |
| `colsPerRow` | 内容区域每行列数（传递给 BtcContainer） | `number` | - |
| `autoFill` | 是否使用自动填充响应式布局 | `boolean` | `false` |
| `minItemWidth` | 自动填充模式下的最小项目宽度 | `number \| string` | `300` |

### BtcCategory 类型定义

```typescript
interface BtcCategory {
  /** 分类唯一标识 */
  name: string | number;
  /** 分类显示标签 */
  label: string;
  /** 分类下的元素数量（用于自动布局判断） */
  count?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义数据，可通过插槽访问 */
  data?: any;
}
```

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `update:modelValue` | 激活的分类改变时触发 | `(value: string \| number)` |
| `category-change` | 分类切换时触发 | `(category: BtcCategory, index: number)` |

## Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| `default` | 默认插槽，用于渲染每个分类的内容 | `{ category: BtcCategory, index: number, activeCategory: string \| number }` |
| `category-{name}` | 具名插槽，用于渲染特定分类的内容 | `{ category: BtcCategory, index: number }` |
| `empty` | 当某个分类没有内容时显示 | `{ category: BtcCategory }` |

## 使用示例

### 基础用法

```vue
<template>
  <div style="height: 600px;">
    <BtcTabsCategoryContainer
      :categories="categories"
      v-model="activeCategory"
      @category-change="handleCategoryChange"
    >
      <template #default="{ category }">
        <BtcContainer :gap="16" :auto-fill="true" :min-item-width="120">
          <div
            v-for="item in getCategoryItems(category.name)"
            :key="item.id"
            class="category-item"
          >
            {{ item.name }}
          </div>
        </BtcContainer>
      </template>
    </BtcTabsCategoryContainer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BtcTabsCategoryContainer, BtcContainer } from '@btc/shared-components';
import type { BtcCategory } from '@btc/shared-components';

const activeCategory = ref('all');

const categories: BtcCategory[] = [
  { name: 'all', label: '全部', count: 100 },
  { name: 'operation', label: '操作类', count: 25 },
  { name: 'data', label: '数据分析类', count: 30 },
  { name: 'business', label: '商业类', count: 20 },
];

const getCategoryItems = (categoryName: string | number) => {
  // 根据分类名称返回对应的元素列表
  return []; // 示例数据
};

const handleCategoryChange = (category: BtcCategory, index: number) => {
  console.log('切换到分类:', category.label);
};
</script>

<style scoped>
.category-item {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}
</style>
```

### 使用具名插槽

```vue
<template>
  <BtcTabsCategoryContainer :categories="categories" v-model="activeCategory">
    <!-- 全部分类使用默认插槽 -->
    <template #default="{ category }">
      <BtcContainer>
        <div v-for="item in allItems" :key="item.id">{{ item.name }}</div>
      </BtcContainer>
    </template>
    
    <!-- 操作类使用具名插槽 -->
    <template #category-operation="{ category }">
      <BtcContainer>
        <div v-for="item in operationItems" :key="item.id">{{ item.name }}</div>
      </BtcContainer>
    </template>
  </BtcTabsCategoryContainer>
</template>
```

### 强制使用垂直布局

```vue
<template>
  <BtcTabsCategoryContainer
    :categories="categories"
    layout="vertical"
    :vertical-tabs-width="240"
  >
    <!-- 内容 -->
  </BtcTabsCategoryContainer>
</template>
```

### 自定义空状态

```vue
<template>
  <BtcTabsCategoryContainer :categories="categories">
    <template #default="{ category }">
      <BtcContainer>
        <div v-if="hasItems(category)">内容</div>
      </BtcContainer>
    </template>
    
    <template #empty="{ category }">
      <div class="empty-state">
        {{ category.label }} 暂无内容
      </div>
    </template>
  </BtcTabsCategoryContainer>
</template>
```

## 响应式行为

- **大屏幕（> 1200px）**：按照布局规则显示垂直或水平 tabs
- **中等屏幕（768px - 1200px）**：
  - 垂直布局：tabs 宽度自动缩小
  - 水平布局：tabs 可能显示滚动箭头
- **小屏幕（< 768px）**：
  - 垂直布局：tabs 宽度进一步缩小，或切换为水平布局
  - 水平布局：tabs 支持横向滚动

## 使用场景

- **图标库展示页面**：按分类展示不同类型的图标
- **组件库文档**：按分类展示组件列表
- **资源中心**：按分类展示模板、素材等资源
- **商品分类展示**：按分类展示商品列表
- **任何需要分类展示的场景**

## 注意事项

1. 组件需要明确的高度才能正常显示，建议在外层容器设置固定高度
2. 当使用 `layout="auto"` 时，组件会根据分类数量和元素数量自动选择布局，但可以通过 `layout` prop 强制指定
3. `BtcContainer` 的所有 props 都可以通过组件传递，用于控制内容区域的布局
4. 分类数据中的 `count` 字段用于自动布局判断，如果不提供，组件会尝试从插槽内容中计算元素数量

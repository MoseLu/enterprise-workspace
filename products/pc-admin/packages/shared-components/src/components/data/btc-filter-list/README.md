# BtcFilterList 组件

一个功能强大的筛选列表组件，支持多分类筛选、搜索、标签展示等功能。常用于数据筛选、条件选择等场景。

## 概述

`BtcFilterList` 是一个筛选列表组件，提供以下功能：
- 多分类筛选（每个分类可包含多个选项）
- 分类搜索功能
- 已选标签展示（固定高度，支持溢出显示）
- 折叠面板展示分类选项
- 自动展开逻辑（选择后自动展开对应分类）
- 支持 EPS 服务或直接数据传入

**组件地位：**
- 与 `BtcMasterList` 同级，是独立的数据组件
- 不集成在 `BtcViewGroup` 中，可单独使用
- 可作为 `BtcSplitLayout` 的左侧内容使用

## 特性

- ✅ **多分类筛选**：支持多个分类，每个分类包含多个选项
- ✅ **灵活数据源**：支持 EPS 服务或直接传入数据
- ✅ **搜索功能**：支持按分类名称和选项名称搜索
- ✅ **标签展示**：顶部固定区域展示已选标签，不同分类使用不同颜色
- ✅ **溢出处理**：标签超过 3 排时显示 "+N"，悬停查看全部
- ✅ **折叠面板**：使用 Element Plus 折叠面板展示分类选项
- ✅ **自动展开**：选择选项后自动展开对应分类
- ✅ **默认展开**：支持配置默认展开的分类数量
- ✅ **多选支持**：每个分类内支持多选
- ✅ **TypeScript**：完整的 TypeScript 类型支持

## 基本用法

### 使用直接数据

```vue
<template>
  <BtcFilterList
    :category="filterCategories"
    :enable-search="true"
    :default-expanded-count="3"
    @change="handleFilterChange"
  />
</template>

<script setup lang="ts">
import { BtcFilterList } from '@btc/shared-components';
import type { FilterCategory, FilterResult } from '@btc/shared-components';

const filterCategories: FilterCategory[] = [
  {
    id: 'status',
    name: '状态',
    options: [
      { label: '启用', value: 'enabled' },
      { label: '禁用', value: 'disabled' },
      { label: '待审核', value: 'pending' },
    ],
  },
  {
    id: 'type',
    name: '类型',
    options: [
      { label: '类型A', value: 'type_a' },
      { label: '类型B', value: 'type_b' },
    ],
  },
];

const handleFilterChange = (result: FilterResult[]) => {
  console.log('筛选结果:', result);
  // result 格式: [{ name: 'status', value: ['enabled', 'pending'] }, ...]
};
</script>
```

### 使用 EPS 服务

```vue
<template>
  <BtcFilterList
    :service="filterService"
    :enable-search="true"
    :default-expanded-count="3"
    @change="handleFilterChange"
  />
</template>

<script setup lang="ts">
import { BtcFilterList } from '@btc/shared-components';
import type { FilterResult } from '@btc/shared-components';
import { service } from '@btc/shared-core';

const filterService = {
  list: async () => {
    // 调用 EPS 服务获取筛选分类数据
    const res = await service.admin?.test?.getFilterCategories();
    return res || [];
  },
};

const handleFilterChange = (result: FilterResult[]) => {
  // 处理筛选结果
};
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `service` | EPS 服务对象，包含 `list` 方法 | `{ list: (params?: any) => Promise<FilterCategory[]> }` | - |
| `category` | 直接传入的分类数据 | `FilterCategory[]` | - |
| `title` | 组件标题（当前未使用） | `string` | `''` |
| `enableSearch` | 是否启用搜索功能 | `boolean` | `true` |
| `defaultExpandedCount` | 默认展开的分类数量 | `number` | `3` |
| `multiple` | 是否支持多选（当前固定为 true） | `boolean` | `true` |

### 数据优先级

1. 如果提供了 `category`，优先使用 `category`（直接数据）
2. 否则使用 `service.list()` 方法加载数据（EPS 服务）
3. 如果两者都未提供，组件将显示空状态

## 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| `change` | 筛选结果变化时触发 | `result: FilterResult[]` |
| `update:modelValue` | 支持 v-model 双向绑定 | `result: FilterResult[]` |

### 结果格式

```typescript
interface FilterResult {
  name: string;    // 分类的 id
  value: any[];    // 选中的选项值数组
}

// 示例
[
  { name: 'status', value: ['enabled', 'pending'] },
  { name: 'type', value: ['type_a', 'type_b'] }
]
```

## 类型定义

### FilterCategory

```typescript
interface FilterCategory {
  id: string;              // 分类唯一标识
  name: string;            // 分类名称
  options: FilterOption[]; // 选项列表
}
```

### FilterOption

```typescript
interface FilterOption {
  label: string;  // 选项显示文本
  value: any;      // 选项值（可以是任意类型）
}
```

### FilterResult

```typescript
interface FilterResult {
  name: string;  // 分类的 id
  value: any[];  // 选中的选项值数组
}
```

## 使用示例

### 示例 1：基础用法

```vue
<template>
  <BtcFilterList
    :category="categories"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { BtcFilterList } from '@btc/shared-components';
import type { FilterCategory, FilterResult } from '@btc/shared-components';

const categories: FilterCategory[] = [
  {
    id: 'product',
    name: '产品',
    options: [
      { label: '产品A', value: 'prod_a' },
      { label: '产品B', value: 'prod_b' },
    ],
  },
];

const handleChange = (result: FilterResult[]) => {
  console.log('筛选结果:', result);
};
</script>
```

### 示例 2：禁用搜索

```vue
<template>
  <BtcFilterList
    :category="categories"
    :enable-search="false"
    @change="handleChange"
  />
</template>
```

### 示例 3：自定义默认展开数量

```vue
<template>
  <BtcFilterList
    :category="categories"
    :default-expanded-count="5"
    @change="handleChange"
  />
</template>
```

### 示例 4：使用 v-model

```vue
<template>
  <BtcFilterList
    :category="categories"
    v-model="filterResult"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BtcFilterList } from '@btc/shared-components';
import type { FilterCategory, FilterResult } from '@btc/shared-components';

const filterResult = ref<FilterResult[]>([]);
</script>
```

### 示例 5：在 BtcSplitLayout 中使用

```vue
<template>
  <BtcSplitLayout>
    <template #left>
      <BtcFilterList
        :category="filterCategories"
        :enable-search="true"
        :default-expanded-count="3"
        @change="handleFilterChange"
      />
    </template>
    
    <template #right>
      <BtcCrud :service="dataService">
        <BtcTable :columns="columns" />
      </BtcCrud>
    </template>
  </BtcSplitLayout>
</template>
```

## 功能说明

### 标签展示

- **固定高度**：标签区域固定高度 96px（3排标签），即使没有标签也会占据空间
- **边框样式**：标签区域有边框和圆角
- **溢出处理**：超过 15 个标签时，显示前 15 个 + "+N" 标签
- **颜色区分**：不同分类的标签使用不同的颜色类型（17种颜色循环使用）
- **悬停查看**：点击 "+N" 标签可查看所有溢出的标签

### 折叠面板

- **默认展开**：默认展开前 N 个分类（可通过 `defaultExpandedCount` 配置）
- **自动展开**：当用户选择某个分类的选项时，如果该分类未展开，会自动展开
- **手动控制**：用户可以手动展开/收起任意分类
- **选中计数**：每个分类标题显示已选数量/总数量，格式：`分类名称 (已选/总数)`

### 搜索功能

- **搜索范围**：搜索分类名称和选项名称
- **实时过滤**：输入关键词后实时过滤显示匹配的分类
- **不区分大小写**：搜索不区分大小写

### 数据加载

- **EPS 服务**：如果提供 `service`，组件会自动调用 `service.list()` 加载数据
- **直接数据**：如果提供 `category`，直接使用传入的数据
- **加载状态**：使用 EPS 服务时会显示 loading 状态

## 样式定制

组件使用 CSS 变量，可以通过覆盖变量来定制样式：

```scss
.btc-filter-list {
  --el-bg-color: #ffffff;
  --el-border-color-light: #e4e7ed;
  --el-border-radius-base: 4px;
}
```

### 自定义样式类

组件提供以下 CSS 类，可以通过深度选择器覆盖：

- `.btc-filter-list`：根容器
- `.btc-filter-list__header`：顶部区域（搜索 + 标签）
- `.btc-filter-list__search`：搜索框容器
- `.btc-filter-list__tags`：标签展示区域
- `.btc-filter-list__container`：内容区域
- `.btc-filter-list__category-title`：分类标题
- `.btc-filter-list__category-count`：分类计数
- `.btc-filter-list__options`：选项列表容器
- `.btc-filter-list__option`：单个选项

## 注意事项

1. **必须提供数据源**：`service` 和 `category` 至少提供一个
2. **标签区域固定高度**：标签区域固定为 96px，即使没有标签也会占据空间
3. **标签溢出**：超过 15 个标签时会显示 "+N"，悬停可查看全部
4. **自动展开**：选择选项后会自动展开对应分类，用户也可以手动控制
5. **分类颜色**：不同分类的标签使用不同颜色，颜色根据分类在列表中的索引循环分配
6. **数据格式**：确保传入的数据符合 `FilterCategory[]` 格式
7. **结果格式**：`change` 事件返回的结果中，`name` 字段对应分类的 `id`

## 与其他组件的关系

### 与 BtcMasterList 的区别

| 特性 | BtcFilterList | BtcMasterList |
|------|---------------|---------------|
| 用途 | 多分类筛选 | 单列表/树形列表 |
| 数据结构 | 分类 + 选项 | 列表项/树节点 |
| 选择方式 | 多选（每个分类内） | 单选（列表项） |
| 输出格式 | `[{ name, value: [] }]` | 选中的项对象 |
| 集成位置 | 不集成在 BtcViewGroup | 集成在 BtcViewGroup |

### 使用场景

- ✅ **使用 BtcFilterList**：需要多分类筛选的场景（如：状态筛选、类型筛选、标签筛选等）
- ✅ **使用 BtcMasterList**：需要单列表或树形列表的场景（如：部门列表、菜单列表等）

## 最佳实践

1. **数据格式**：确保分类 `id` 唯一，选项 `value` 在分类内唯一
2. **性能优化**：大量选项时，考虑使用虚拟滚动（当前未实现）
3. **用户体验**：合理设置 `defaultExpandedCount`，避免默认展开过多分类
4. **搜索优化**：如果选项很多，建议启用搜索功能
5. **结果处理**：在 `change` 事件中处理筛选结果，用于刷新数据列表

## 常见问题

### Q: 如何清空所有选择？

A: 可以通过关闭所有标签来清空选择，或者通过外部控制重置 `selectedValues`。

### Q: 如何设置默认选中？

A: 当前版本不支持默认选中，需要在组件外部处理初始状态。

### Q: 标签颜色是如何分配的？

A: 根据分类在列表中的索引，循环使用 17 种颜色类型。

### Q: 可以禁用某个分类吗？

A: 当前版本不支持禁用分类，可以通过过滤数据源来实现。

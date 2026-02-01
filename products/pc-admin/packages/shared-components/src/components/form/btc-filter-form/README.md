# BtcFilterForm 筛选表单组件

一个专门用于筛选条件的共享表单组件，内置折叠面板、Enter 提交防抖、统一间距样式等功能。

## 特性

- ✅ **多行布局**：支持横向多排表单项布局
- ✅ **折叠面板**：外层使用 `BtcCollapse`，可展开/收起
- ✅ **统一间距**：四周边距和表单项间距均为 10px
- ✅ **Enter 提交**：内置防抖的 Enter 键提交功能（默认 300ms）
- ✅ **双向绑定**：支持 `v-model` 双向数据同步
- ✅ **事件钩子**：提供 `@submit` 和 `@expand-change` 事件，方便与 `BtcCrud` 联动
- ✅ **响应式配置**：支持动态更新表单项配置

## 基础用法

```vue
<template>
  <BtcFilterForm
    v-model="filters"
    :items="filterFormItems"
    :default-expand="false"
    :enable-enter-submit="true"
    @submit="handleSearch"
    @expand-change="handleExpandChange"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { BtcFilterForm } from '@btc/shared-components';
import type { BtcFormItem } from '@btc/shared-components';

const filters = ref({
  keyword: '',
  status: '',
  dateRange: null,
});

const filterFormItems = computed<BtcFormItem[]>(() => [
  {
    prop: 'keyword',
    label: '关键词',
    span: 8,
    component: {
      name: 'el-input',
      props: {
        placeholder: '请输入关键词',
        clearable: true,
      },
    },
  },
  {
    prop: 'status',
    label: '状态',
    span: 8,
    component: {
      name: 'el-select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
      },
      options: [
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' },
      ],
    },
  },
  {
    prop: 'dateRange',
    label: '日期范围',
    span: 8,
    component: {
      name: 'el-date-picker',
      props: {
        type: 'datetimerange',
        rangeSeparator: '至',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
      },
    },
  },
]);

const handleSearch = () => {
  console.log('搜索条件:', filters.value);
  // 触发查询逻辑
};

const handleExpandChange = (expanded: boolean) => {
  console.log('展开状态:', expanded);
};
</script>
```

## 与 BtcCrud 联动

```vue
<template>
  <BtcCrud ref="crudRef" :crud-options="crudOptions">
    <BtcCrudRow>
      <BtcFilterForm
        ref="filterFormRef"
        v-model="filters"
        :items="filterFormItems"
        @submit="handleSearch"
      />
    </BtcCrudRow>
    <BtcCrudRow>
      <BtcTable :columns="columns" />
    </BtcCrudRow>
  </BtcCrud>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BtcCrud, BtcCrudRow, BtcTable, BtcFilterForm } from '@btc/shared-components';

const crudRef = ref();
const filterFormRef = ref();
const filters = ref({});

const handleSearch = () => {
  // 触发 BtcCrud 刷新
  crudRef.value?.handleRefresh();
};

const crudOptions = {
  // 在刷新前钩子中获取筛选条件
  onBeforeRefresh: (params: Record<string, any>) => {
    const formData = filterFormRef.value?.getForm() || {};
    return { ...params, ...formData };
  },
};
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `modelValue` | 表单数据（支持 v-model） | `Record<string, any>` | `{}` |
| `items` | 表单项配置数组 | `BtcFormItem[]` | `[]` |
| `title` | 折叠面板标题 | `string` | `'筛选条件'` |
| `defaultExpand` | 是否默认展开 | `boolean` | `false` |
| `enableEnterSubmit` | 是否启用 Enter 提交 | `boolean` | `true` |
| `enterDebounce` | Enter 提交防抖延迟（毫秒） | `number` | `300` |
| `labelWidth` | 表单标签宽度 | `string \| number` | `'100px'` |
| `labelPosition` | 表单标签位置 | `'left' \| 'right' \| 'top'` | `'right'` |
| `gutter` | 栅格间距 | `number` | `12` |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `update:modelValue` | 表单数据变化时触发（v-model） | `(value: Record<string, any>) => void` |
| `submit` | 提交表单时触发 | `(data: Record<string, any>) => void` |
| `reset` | 重置表单时触发 | `() => void` |
| `expand-change` | 折叠状态变化时触发 | `(expanded: boolean) => void` |

## Methods

通过 `ref` 可以访问到以下方法：

| 方法名 | 说明 | 参数 |
|--------|------|------|
| `submit()` | 提交表单 | - |
| `reset()` | 重置表单 | - |
| `getForm()` | 获取表单数据 | - |
| `clear()` | 清空表单 | - |

## 样式说明

组件内置了统一的间距样式：

- **四周边距**：10px（通过 `collapse-item__content-inner` 的 `padding` 控制）
- **表单项间距**：10px（通过 `el-form-item` 的 `margin-bottom` 控制）
- **折叠面板边框**：1px 实线边框，圆角为 `var(--el-border-radius-base)`

## 注意事项

1. **表单项配置**：`items` 必须是一个 `BtcFormItem[]` 数组，配置格式与 `BtcForm` 完全一致
2. **响应式更新**：当 `items` 发生变化时，组件会自动更新表单配置
3. **Enter 提交**：默认启用，会在用户按下 Enter 键时自动提交表单（带 300ms 防抖）
4. **数据同步**：通过 `v-model` 实现双向数据绑定，表单数据变化会自动同步到外部
5. **隐藏表单项**：可以通过 `hidden` 属性控制表单项的显示/隐藏，支持响应式更新

## 示例：动态显示/隐藏表单项

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const isExpanded = ref(false);

const filterFormItems = computed(() => [
  {
    prop: 'keyword',
    label: '关键词',
    span: 8,
    component: { name: 'el-input' },
  },
  {
    prop: 'status',
    label: '状态',
    span: 8,
    hidden: !isExpanded.value, // 根据展开状态控制显示
    component: { name: 'el-select' },
  },
]);
</script>
```

## 相关组件

- `BtcForm` - 基础表单组件
- `BtcCollapse` - 折叠面板组件
- `BtcCrud` - CRUD 组件（常用于与筛选表单联动）

# BtcCascader 级联选择器组件

基于 Element Plus `el-cascader` 封装的级联选择器组件，提供统一的配置和增强功能。

## 功能特性

- 🎯 自动数据格式转换（`id/name` → `value/label`）
- 📊 节点数量显示
- 🔍 搜索和清空功能
- 🏷️ 标签折叠（多选时）
- ⚙️ 统一的配置接口
- 📱 响应式设计

## 基础用法

### 单选模式

```vue
<template>
  <BtcCascader
    v-model="selectedValue"
    :options="departmentOptions"
    placeholder="请选择部门"
    show-count
  />
</template>

<script setup>
import { ref } from 'vue';
import { BtcCascader } from '@btc/shared-components';

const selectedValue = ref('');
const departmentOptions = ref([
  {
    id: '1',
    name: '技术部',
    children: [
      { id: '11', name: '前端组' },
      { id: '12', name: '后端组' }
    ]
  },
  {
    id: '2',
    name: '产品部',
    children: [
      { id: '21', name: '产品组' },
      { id: '22', name: '设计组' }
    ]
  }
]);
</script>
```

### 多选模式

```vue
<template>
  <BtcCascader
    v-model="selectedValues"
    :options="departmentOptions"
    placeholder="请选择多个部门"
    multiple
    collapse-tags
    collapse-tags-tooltip
    :max-collapse-tags="2"
    show-count
  />
</template>

<script setup>
import { ref } from 'vue';
import { BtcCascader } from '@btc/shared-components';

const selectedValues = ref([]);
const departmentOptions = ref([
  // ... 同上
]);
</script>
```

## 在表单中使用

### 单选配置

```typescript
{
  prop: 'deptId',
  label: '部门',
  span: 12,
  component: {
    name: 'BtcCascader',
    props: {
      placeholder: '请选择部门',
      options: deptOptions,
      showCount: true,
      multiple: false, // 单选模式
      clearable: true,
      filterable: true
    }
  }
}
```

### 多选配置

```typescript
{
  prop: 'deptIds',
  label: '多选部门',
  span: 12,
  component: {
    name: 'BtcCascader',
    props: {
      placeholder: '请选择多个部门',
      options: deptOptions,
      showCount: true,
      multiple: true, // 多选模式
      collapseTags: true, // 折叠标签
      collapseTagsTooltip: true, // 显示折叠提示
      maxCollapseTags: 2, // 最多显示2个标签，其余折叠
      clearable: true,
      filterable: true
    }
  }
}
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| modelValue | any | - | 绑定值 |
| options | Array | [] | 选项数据 |
| placeholder | string | '请选择' | 占位符文本 |
| clearable | boolean | true | 是否可清空 |
| filterable | boolean | true | 是否可搜索 |
| showAllLevels | boolean | false | 是否显示完整路径 |
| checkStrictly | boolean | true | 是否严格模式 |
| emitPath | boolean | false | 是否返回完整路径 |
| checkOnClickNode | boolean | true | 是否点击节点选择 |
| multiple | boolean | false | 是否多选 |
| collapseTags | boolean | true | 多选时是否折叠标签 |
| collapseTagsTooltip | boolean | true | 折叠标签是否显示提示 |
| maxCollapseTags | number | 3 | 最大折叠标签数量 |
| style | object | { width: '100%' } | 自定义样式 |
| showCount | boolean | true | 是否显示子节点数量 |

## 数据格式

组件会自动处理以下数据格式：

### 输入格式（支持两种）

```typescript
// 格式1：id/name 结构
[
  {
    id: '1',
    name: '技术部',
    children: [
      { id: '11', name: '前端组' },
      { id: '12', name: '后端组' }
    ]
  }
]

// 格式2：value/label 结构
[
  {
    value: '1',
    label: '技术部',
    children: [
      { value: '11', label: '前端组' },
      { value: '12', label: '后端组' }
    ]
  }
]
```

### 输出格式

- **单选**：返回选中节点的值（字符串或数字）
- **多选**：返回选中节点值的数组

## 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | (value: any) |
| change | 值变化时触发 | (value: any) |

## 插槽

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 自定义节点内容 | { data, count } |

### 插槽示例

```vue
<BtcCascader v-model="value" :options="options">
  <template #default="{ data, count }">
    <span>{{ data.label }}</span>
    <span v-if="count > 0" class="count">({{ count }})</span>
  </template>
</BtcCascader>
```

## 注意事项

1. 数据会自动转换为 `el-cascader` 需要的 `value/label` 格式
2. 多选模式下，建议设置 `collapseTags` 和 `maxCollapseTags` 以避免界面过于拥挤
3. 搜索功能基于 `filterable` 属性，支持模糊匹配
4. 节点数量显示基于 `showCount` 属性，会显示子节点数量

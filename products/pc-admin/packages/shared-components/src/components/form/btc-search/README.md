# BtcSearch 搜索框组件

## 概述

`BtcSearch` 是一个独立的通用搜索框组件，复用了左侧边栏搜索框的视觉样式，可在任何地方使用。与 `btc-search-key` 不同，它不依赖 CRUD 上下文，是一个纯粹的输入组件。

## 特性

- 🎨 **统一样式**：复用左侧边栏搜索框的视觉样式
- 🔍 **搜索图标**：使用 `btc-svg` 组件显示搜索图标
- ⌨️ **键盘支持**：支持回车键触发搜索
- 🧹 **清空功能**：支持一键清空输入内容
- 📱 **响应式**：支持不同尺寸和状态
- 🔗 **双向绑定**：支持 `v-model` 双向数据绑定

## Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| modelValue | 搜索框的值 | `string` | — | `''` |
| placeholder | 占位符文本 | `string` | — | `'请输入搜索内容'` |
| clearable | 是否可清空 | `boolean` | — | `true` |
| disabled | 是否禁用 | `boolean` | — | `false` |
| size | 输入框大小 | `string` | `large` / `default` / `small` | `'default'` |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 输入值变化时触发 | `(value: string)` |
| search | 搜索事件（回车或点击搜索时触发） | `(value: string)` |
| clear | 清空事件 | `()` |
| focus | 聚焦事件 | `(event: FocusEvent)` |
| blur | 失焦事件 | `(event: FocusEvent)` |

## 使用示例

### 基础用法

```vue
<template>
  <btc-search v-model="searchValue" />
</template>

<script setup>
import { ref } from 'vue';

const searchValue = ref('');
</script>
```

### 自定义占位符

```vue
<template>
  <btc-search 
    v-model="searchValue" 
    placeholder="搜索组件..." 
  />
</template>
```

### 监听搜索事件

```vue
<template>
  <btc-search 
    v-model="searchValue" 
    @search="handleSearch"
    @clear="handleClear"
  />
</template>

<script setup>
import { ref } from 'vue';

const searchValue = ref('');

const handleSearch = (value) => {
  console.log('搜索:', value);
};

const handleClear = () => {
  console.log('已清空');
};
</script>
```

### 禁用状态

```vue
<template>
  <btc-search 
    v-model="searchValue" 
    :disabled="true"
  />
</template>
```

## 与 btc-search-key 的区别

| 特性 | BtcSearch | BtcSearchKey |
|------|-----------|--------------|
| 使用场景 | 通用搜索框，任何地方可用 | CRUD 系统中的搜索功能 |
| 依赖关系 | 无依赖，独立组件 | 必须在 `btc-crud` 上下文中使用 |
| 功能范围 | 纯输入组件，样式统一 | 集成 CRUD 搜索逻辑 |
| 事件处理 | 自定义事件处理 | 自动与 CRUD 系统集成 |

## 样式说明

组件复用了左侧边栏搜索框的样式规范：

- 背景色：`var(--el-fill-color-light)`
- 高度：`27px`
- 圆角：`6px`
- 字体大小：`13px`
- 内边距：`0 12px`

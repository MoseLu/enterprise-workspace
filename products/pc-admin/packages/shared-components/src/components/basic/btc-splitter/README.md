# BtcColumnLayout 分栏布局组件

一个支持水平或垂直任意数量分栏的布局组件，每个分栏都有独立的滚动容器，互不干扰。

## 特性

- ✅ **支持任意数量分栏**：可以创建 2 栏、3 栏、4 栏或更多
- ✅ **支持水平和垂直方向**：`direction: 'horizontal' | 'vertical'`
- ✅ **独立滚动容器**：每个分栏使用 `column-container-core`，与全局 `.container` 互不影响
- ✅ **依赖 CSS 原生布局**：无需手动测算高度，完全依赖浏览器文档流
- ✅ **灵活宽度配置**：支持固定宽度、弹性宽度、flex 比例等多种配置方式
- ✅ **可选分栏头部**：每个分栏可以单独配置头部区域

## 基本用法

### 水平分栏（默认）

```vue
<template>
  <div style="height: 500px;">
    <BtcColumnLayout :columns="3" :gap="16">
      <template #column-0>
        <div>分栏 1 的内容</div>
      </template>
      <template #column-1>
        <div>分栏 2 的内容</div>
      </template>
      <template #column-2>
        <div>分栏 3 的内容</div>
      </template>
    </BtcColumnLayout>
  </div>
</template>

<script setup>
import { BtcColumnLayout } from '@btc/shared-components';
</script>
```

### 垂直分栏

```vue
<template>
  <div style="height: 500px;">
    <BtcColumnLayout direction="vertical" :columns="3" :gap="16">
      <template #column-0>
        <div>分栏 1 的内容</div>
      </template>
      <template #column-1>
        <div>分栏 2 的内容</div>
      </template>
      <template #column-2>
        <div>分栏 3 的内容</div>
      </template>
    </BtcColumnLayout>
  </div>
</template>
```

## 自定义宽度配置

### 数组配置（精确控制每个分栏宽度）

```vue
<template>
  <BtcColumnLayout 
    :columns="3" 
    :column-widths="['300px', '1fr', '200px']"
    :gap="16"
  >
    <template #column-0>固定 300px 宽度</template>
    <template #column-1>弹性宽度（占据剩余空间）</template>
    <template #column-2>固定 200px 宽度</template>
  </BtcColumnLayout>
</template>
```

### Flex 比例配置

```vue
<template>
  <BtcColumnLayout 
    :columns="3" 
    :column-widths="[1, 2, 1]"
    :gap="16"
  >
    <template #column-0>1 份宽度</template>
    <template #column-1>2 份宽度（占据双倍空间）</template>
    <template #column-2>1 份宽度</template>
  </BtcColumnLayout>
</template>
```

### 单个值配置（所有分栏相同）

```vue
<template>
  <!-- 所有分栏使用相同的 flex 比例 -->
  <BtcColumnLayout 
    :columns="4" 
    :column-widths="1"
    :gap="16"
  >
    <!-- 所有分栏均分宽度 -->
  </BtcColumnLayout>

  <!-- 所有分栏使用相同的固定宽度 -->
  <BtcColumnLayout 
    :columns="4" 
    column-widths="250px"
    :gap="16"
  >
    <!-- 所有分栏都是 250px 宽度 -->
  </BtcColumnLayout>
</template>
```

## 带头部的分栏

```vue
<template>
  <BtcColumnLayout :columns="2" :gap="16">
    <template #header-0>
      <div>分栏 1 的头部</div>
    </template>
    <template #column-0>
      <div>分栏 1 的内容</div>
    </template>

    <template #header-1>
      <div>分栏 2 的头部</div>
    </template>
    <template #column-1>
      <div>分栏 2 的内容</div>
    </template>
  </BtcColumnLayout>
</template>
```

## 实际应用场景

### 三栏布局（左中右）

```vue
<template>
  <BtcColumnLayout 
    :columns="3" 
    :column-widths="['300px', '1fr', '250px']"
    :gap="16"
  >
    <template #column-0>
      <BtcFilterList :service="filterService" />
    </template>
    <template #column-1>
      <BtcCrud :service="crudService">
        <BtcCrudRow>
          <BtcTable :columns="columns" />
        </BtcCrudRow>
      </BtcCrud>
    </template>
    <template #column-2>
      <div>右侧面板</div>
    </template>
  </BtcColumnLayout>
</template>
```

### 四栏布局

```vue
<template>
  <BtcColumnLayout 
    :columns="4" 
    :column-widths="[1, 2, 1, 1]"
    :gap="12"
  >
    <template #column-0>侧边栏 1</template>
    <template #column-1>主内容区（占据双倍空间）</template>
    <template #column-2>侧边栏 2</template>
    <template #column-3>侧边栏 3</template>
  </BtcColumnLayout>
</template>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| direction | 分栏方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| columns | 分栏数量 | `number` | `2` |
| gap | 分栏之间的间距（px） | `number` | `16` |
| columnWidths | 分栏宽度配置（仅水平方向有效） | `(string \| number)[] \| string \| number` | - |

### columnWidths 配置说明

- **数组配置**：`['300px', '1fr', '200px']` 或 `[1, 2, 1]`
  - 字符串数组：精确控制每个分栏的宽度（支持 `px`、`%`、`fr` 等单位）
  - 数字数组：使用 flex 比例（如 `[1, 2, 1]` 表示 1:2:1 的比例）
- **单个字符串**：所有分栏使用相同的固定宽度，如 `'250px'`
- **单个数字**：所有分栏使用相同的 flex 比例，如 `1`（均分）

## Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| `column-{index}` | 分栏内容 | `{ columnIndex: number }` |
| `header-{index}` | 分栏头部（可选） | `{ columnIndex: number }` |

### 插槽命名规则

- 分栏内容：`column-0`、`column-1`、`column-2` ...
- 分栏头部：`header-0`、`header-1`、`header-2` ...

## 核心设计原理

### 1. 独立高度约束

每个分栏使用 `column-container-core` mixin，提供独立的高度约束和布局能力，与全局 `.container` 互不影响。

### 2. 原生滚动

每个分栏内容区域使用原生滚动或内部的 `el-scrollbar`，完全依赖 CSS 原生布局，无需手动测算高度。

### 3. 高度隔离

- 水平分栏：所有分栏高度一致（通过 `align-items: stretch`），但内容区域独立滚动
- 垂直分栏：所有分栏宽度一致，高度均分，内容区域独立滚动

### 4. 布局方式

- **数组宽度配置**：使用 CSS Grid 布局，精确控制每个分栏宽度
- **默认或单个值配置**：使用 Flex 布局，灵活分配空间

## 与 BtcSplitLayout 的区别

| 特性 | BtcSplitLayout | BtcColumnLayout |
|------|----------------|-----------------|
| 分栏数量 | 固定 2 栏（左右） | 任意数量 |
| 方向 | 仅水平 | 水平或垂直 |
| 折叠功能 | ✅ 支持左侧折叠 | ❌ 不支持 |
| 头部插槽 | ✅ 支持左右头部 | ✅ 支持每个分栏头部 |
| 宽度配置 | 仅左侧可配置 | 每个分栏可配置 |
| 使用场景 | 筛选列表 + CRUD | 多栏布局、仪表盘等 |

## 注意事项

1. **父容器高度**：确保父容器有明确的高度，分栏布局才能正确工作
2. **分栏数量**：`columns` 必须与提供的插槽数量匹配
3. **宽度配置**：`columnWidths` 仅在 `direction: 'horizontal'` 时有效
4. **滚动容器**：每个分栏内容区域已自动应用 `column-container-core`，无需手动添加滚动容器

# BtcContainer 布局容器

`BtcContainer` 是一个智能的布局容器组件，它继承父组件的完整宽高，根据子组件数量智能划分空间，优先宽度布局，超出时显示滚动条。

## 设计逻辑

1. **继承父组件完整宽高**：容器会占满父组件的所有可用空间
2. **根据子组件数量智能划分空间**：
   - **大屏幕（>1200px）**：
     - 1个子组件：1列1行
     - 2个子组件：1列2行（一排一个）
     - 3个子组件：2列2行（第一行2个，第二行1个）
     - 4个子组件：2列2行
     - 5个及以上：保持2列2行布局，出现滚动条
   - **中小屏幕（≤1200px）**：
     - 所有布局强制变为1列N行（N=子组件数量）
     - 4个子组件：1列4行（1×4布局）
     - 禁用滚动，显示所有内容
3. **优先宽度布局**：布局优先考虑宽度分配，而不是高度
4. **固定间距**：子组件之间始终保持指定间距（默认10px，移动端稍微减少）
5. **响应式适配**：自动根据屏幕宽度切换布局模式

## 使用场景

- 仪表盘图表布局
- 策略监控页面
- 任何需要智能网格布局的场景

## 基本示例

```vue
<template>
  <div style="height: 500px; border: 1px solid #ccc;">
    <BtcContainer :gap="10">
      <div class="chart-item">图表 1</div>
      <div class="chart-item">图表 2</div>
      <div class="chart-item">图表 3</div>
      <div class="chart-item">图表 4</div>
    </BtcContainer>
  </div>
</template>

<script setup lang="ts">
import { BtcContainer } from '@btc/shared-components';
</script>

<style scoped>
.chart-item {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}
</style>
```

## 不同数量的布局效果

### 2个子组件（1列2行）
```vue
<BtcContainer :gap="10">
  <div class="chart-item">图表 1</div>
  <div class="chart-item">图表 2</div>
</BtcContainer>
```

### 4个子组件（2列2行）
```vue
<BtcContainer :gap="10">
  <div class="chart-item">图表 1</div>
  <div class="chart-item">图表 2</div>
  <div class="chart-item">图表 3</div>
  <div class="chart-item">图表 4</div>
</BtcContainer>
```

### 5个子组件（2列2行 + 滚动）
```vue
<BtcContainer :gap="10">
  <div class="chart-item">图表 1</div>
  <div class="chart-item">图表 2</div>
  <div class="chart-item">图表 3</div>
  <div class="chart-item">图表 4</div>
  <div class="chart-item">图表 5</div>
</BtcContainer>
```

## 响应式布局效果

### 大屏幕（>1200px）
- 4个图表：2×2网格布局
- 5个图表：2×2网格 + 垂直滚动

### 中小屏幕（≤1200px）
- 4个图表：1×4垂直布局（每行一个）
- 5个图表：1×5垂直布局（每行一个）
- 平板（≤768px）：间距调整为9px
- 手机（≤480px）：间距调整为8px

```vue
<template>
  <!-- 这个容器在不同屏幕尺寸下会自动调整布局 -->
  <BtcContainer :gap="10">
    <div class="chart-item">执行次数趋势</div>
    <div class="chart-item">响应时间分布</div>
    <div class="chart-item">策略类型分布</div>
    <div class="chart-item">成功率统计</div>
  </BtcContainer>
</template>

<!-- 
大屏幕效果（>1200px）：
┌─────────┬─────────┐
│ 图表1   │ 图表2   │
├─────────┼─────────┤
│ 图表3   │ 图表4   │
└─────────┴─────────┘

中小屏幕效果（≤1200px）：
┌─────────────────┐
│     图表1       │
├─────────────────┤
│     图表2       │
├─────────────────┤
│     图表3       │
├─────────────────┤
│     图表4       │
└─────────────────┘
-->
```

## 自定义每行列数

```vue
<template>
  <!-- 强制每行最多3列 -->
  <BtcContainer :gap="10" :max-cols-per-row="3">
    <div class="chart-item">图表 1</div>
    <div class="chart-item">图表 2</div>
    <div class="chart-item">图表 3</div>
    <div class="chart-item">图表 4</div>
    <div class="chart-item">图表 5</div>
    <div class="chart-item">图表 6</div>
  </BtcContainer>
</template>
```

## 自动填充响应式布局

使用 `autoFill` 模式可以实现完全响应式的网格布局，类似于 `repeat(auto-fill, minmax(300px, 1fr))` 的效果：

```vue
<template>
  <!-- 自动填充布局：每个项目最小宽度 300px，自动根据容器宽度调整列数 -->
  <BtcContainer :gap="16" :auto-fill="true" :min-item-width="300">
    <div class="card-item">卡片 1</div>
    <div class="card-item">卡片 2</div>
    <div class="card-item">卡片 3</div>
    <div class="card-item">卡片 4</div>
    <div class="card-item">卡片 5</div>
  </BtcContainer>
</template>
```

**自动填充模式的特点**：
- ✅ 完全响应式：根据容器宽度自动调整列数
- ✅ 最小宽度保证：每个项目至少保持 `minItemWidth` 的宽度
- ✅ 自动换行：空间不足时自动换到下一行
- ✅ 均匀分布：剩余空间在所有列之间均匀分配
- ✅ 无滚动限制：所有内容都会显示，不会限制为2行

**使用场景**：
- 商品卡片列表
- 内容卡片网格
- 任何需要根据容器宽度自动调整列数的场景

## Props

| 属性名           | 类型            | 默认值 | 说明                                    |
|------------------|-----------------|--------|-----------------------------------------|
| gap              | `number\|string`| `10`   | 子组件之间的间距                        |
| colsPerRow       | `number`        | -      | 每行列数，不指定时根据子组件数量智能计算 |
| maxColsPerRow    | `number`        | -      | 每行最大列数（已废弃，使用 colsPerRow） |
| autoFill         | `boolean`       | `false`| 是否使用自动填充响应式布局（repeat(auto-fill, minmax(...))） |
| minItemWidth     | `number\|string`| `300`  | 自动填充模式下的最小项目宽度（单位：px） |

## 布局规则详解

### 智能列数计算
当不指定 `maxColsPerRow` 时，组件会根据子组件数量智能计算：

- **1个组件**：1列1行，组件占满整个容器
- **2个组件**：1列2行，每个组件占一半高度
- **3个组件**：2列2行，第一行2个，第二行1个居中
- **4个组件**：2列2行，完美的2×2网格
- **5个及以上**：固定2列布局，超出2行的内容可滚动

### 滚动行为
当子组件数量超过4个时：
- 容器固定显示2行内容
- 超出的内容通过垂直滚动查看
- 保持每个子组件的尺寸与4个组件时完全一致
- 自定义滚动条样式，支持暗色模式

## 样式特性

- **完全继承父容器尺寸**：`width: 100%; height: 100%`
- **CSS Grid 布局**：使用现代网格布局技术
- **自适应子组件**：子组件自动填满分配的网格空间
- **优雅滚动条**：半透明滚动条，悬停时加深
- **暗色模式支持**：自动适配系统主题

## 最佳实践

1. **父容器设置高度**：确保父容器有明确的高度，BtcContainer 才能正确继承
2. **子组件响应式**：子组件内部使用相对单位和弹性布局
3. **间距一致性**：使用统一的间距值保持视觉一致性
4. **内容溢出处理**：子组件内部处理好内容溢出，避免破坏网格布局

```vue
<!-- ✅ 推荐用法 -->
<div class="dashboard" style="height: 600px;">
  <BtcContainer :gap="10">
    <BtcLineChart :data="data1" />
    <BtcBarChart :data="data2" />
    <BtcPieChart :data="data3" />
    <BtcAreaChart :data="data4" />
  </BtcContainer>
</div>

<!-- ❌ 不推荐：父容器没有高度 -->
<div class="dashboard">
  <BtcContainer :gap="10">
    <!-- 子组件可能无法正确显示 -->
  </BtcContainer>
</div>
```

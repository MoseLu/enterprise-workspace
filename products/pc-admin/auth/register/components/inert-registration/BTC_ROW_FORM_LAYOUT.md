# btc-row 表单布局解决方案

## 核心思路

通过 `btc-row` + 统一宽度策略，实现：
1. **标签左对齐**
2. **所有表单项总宽度一致**
3. **输入框宽度一致**

## 三段式配宽策略

```
itemWidth = 固定 → labelWidth = 固定 → contentWidth = item - label → input = 100%
```

## 方案对比

### 传统方案（复杂且容易出错）
```scss
// 需要手动计算各种 margin、padding
.el-form-item {
  margin: 0 auto 20px auto !important;
  width: fit-content !important;
  // ... 复杂的样式计算
}
```

### btc-row 方案（简洁且可靠）
```scss
// 使用 CSS 变量统一管理
.form {
  --item-w: 500px;   /* 每个表单项的"总宽度" */
  --label-w: 120px;  /* label 固定宽度，左对齐 */
  --gap: 20px;       /* 表单项间距 */
  
  // btc-row 自动处理居中
  :deep(.el-form) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap);
  }
}
```

## 三种布局方案

### 1. 单列表单（每项独占一行）

```vue
<template>
  <btc-row justify="center">
    <el-form class="single-form" label-width="var(--label-w)">
      <el-form-item label="工号" class="single-form__item">
        <el-input placeholder="请输入工号" />
      </el-form-item>
      <el-form-item label="密码" class="single-form__item">
        <el-input type="password" placeholder="请输入密码" />
      </el-form-item>
    </el-form>
  </btc-row>
</template>

<style scoped>
.single-form {
  --item-w: 500px;   /* 每个表单项的"总宽度" */
  --label-w: 120px;  /* label 固定宽度，左对齐 */
  --gap: 20px;       /* 表单项间距 */
  
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap);
}

.single-form__item {
  width: var(--item-w);
  margin: 0 !important;
}

.single-form :deep(.el-form-item__label) {
  width: var(--label-w) !important;
  text-align: left !important;
  white-space: nowrap;
  padding-right: 12px;
}

.single-form :deep(.el-form-item__content) {
  width: calc(var(--item-w) - var(--label-w));
}

.single-form :deep(.el-input) {
  width: 100%;
  box-sizing: border-box;
}
</style>
```

**结果：**
- ✅ 标签始终左对齐
- ✅ 每项总宽度一致（500px）
- ✅ 输入框宽度一致（380px）

### 2. 同排多列（两项并排且整排可居中）

```vue
<template>
  <btc-row justify="center" :gutter="32">
    <el-form class="multi-form" label-width="var(--label-w)">
      <btc-row :gutter="32">
        <el-form-item label="工号" class="multi-form__item">
          <el-input placeholder="请输入工号" />
        </el-form-item>
        <el-form-item label="密码" class="multi-form__item">
          <el-input type="password" placeholder="请输入密码" />
        </el-form-item>
      </btc-row>
    </el-form>
  </btc-row>
</template>

<style scoped>
.multi-form {
  --item-w: 300px;   /* 每个表单项的"总宽度" */
  --label-w: 100px;  /* label 固定宽度，左对齐 */
}

.multi-form__item {
  width: var(--item-w);
  margin: 0 !important;
}

.multi-form :deep(.el-form-item__label) {
  width: var(--label-w) !important;
  text-align: left !important;
  white-space: nowrap;
  padding-right: 12px;
}

.multi-form :deep(.el-form-item__content) {
  width: calc(var(--item-w) - var(--label-w));
}

.multi-form :deep(.el-input) {
  width: 100%;
  box-sizing: border-box;
}
</style>
```

**结果：**
- ✅ 整排水平居中
- ✅ 每个单元块总宽统一（300px）
- ✅ 输入框宽度一致（200px）

### 3. 响应式布局（btc-row 自适应）

```vue
<template>
  <btc-row justify="center" :gutter="[16, 20]">
    <el-form class="responsive-form" label-width="var(--label-w)">
      <btc-row :gutter="[16, 20]">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="工号" class="responsive-form__item">
            <el-input placeholder="请输入工号" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="密码" class="responsive-form__item">
            <el-input type="password" placeholder="请输入密码" />
          </el-form-item>
        </el-col>
      </btc-row>
    </el-form>
  </btc-row>
</template>

<style scoped>
.responsive-form {
  --label-w: 100px;  /* label 固定宽度，左对齐 */
}

.responsive-form__item {
  margin: 0 !important;
}

.responsive-form :deep(.el-form-item__label) {
  width: var(--label-w) !important;
  text-align: left !important;
  white-space: nowrap;
  padding-right: 12px;
}

.responsive-form :deep(.el-form-item__content) {
  width: calc(100% - var(--label-w));
}

.responsive-form :deep(.el-input) {
  width: 100%;
  box-sizing: border-box;
}
</style>
```

**结果：**
- ✅ 响应式断点自适应
- ✅ 标签始终左对齐
- ✅ 输入框宽度一致

## btc-row 的优势

### 1. 语义化清晰
```vue
<!-- 传统方式：需要手写 flex -->
<div style="display: flex; justify-content: center; align-items: center; gap: 20px;">

<!-- btc-row 方式：语义化清晰 -->
<btc-row justify="center" :gutter="20">
```

### 2. 内置响应式支持
```vue
<!-- 自动处理不同屏幕尺寸的间距 -->
<btc-row :gutter="[16, 20]">  <!-- 水平16px，垂直20px -->
<btc-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">  <!-- 响应式间距 -->
```

### 3. 与 Element Plus 完美集成
```vue
<!-- 可以直接使用 el-col 进行栅格布局 -->
<btc-row>
  <el-col :span="12">
    <el-form-item>...</el-form-item>
  </el-col>
  <el-col :span="12">
    <el-form-item>...</el-form-item>
  </el-col>
</btc-row>
```

## 关键细节

### 1. 强制覆盖 Element Plus 内联样式
```scss
// 必须强制覆盖，因为 Element Plus 会注入内联样式
:deep(.el-form-item__label[style*="width: 120px"]) {
  width: var(--label-w) !important;
}
```

### 2. 输入框宽度控制
```scss
// 确保所有输入类控件都占满 content 区域
:deep(.el-input),
:deep(.el-select),
:deep(.el-date-editor),
:deep(.el-input-number) {
  width: 100%;
  box-sizing: border-box;  // 重要：包含 padding 和 border
}
```

### 3. 暗色模式适配
```scss
html.dark & {
  :deep(.el-form-item__label) {
    color: var(--el-text-color-regular);
  }
}
```

## 总结

使用 `btc-row` + 统一宽度策略可以：

1. **彻底解决居中问题**：`btc-row` 的 `justify="center"` 自动处理水平居中
2. **实现完美对齐**：三段式配宽确保标签左对齐、输入框宽度一致
3. **支持响应式**：`btc-row` 内置响应式栅格系统
4. **代码简洁**：比手写 flex 布局更清晰、更易维护
5. **兼容性好**：与 Element Plus 完美集成，支持暗色模式

这个方案不仅解决了当前的布局问题，还为未来的表单开发提供了标准化的解决方案。

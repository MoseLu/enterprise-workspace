# 高对比度颜色变体使用指南

## 概述

项目在原有的 `--el-color-primary` 颜色体系基础上，新增了基于 WCAG 2.1 标准的高对比度变体，用于满足可访问性要求。

## 新增变量

| 变量名 | 说明 | 对比度要求 |
|--------|------|-----------|
| `--el-color-primary-contrast-light` | 用于深色背景的高对比度浅色 | ≥ 4.5:1 |
| `--el-color-primary-contrast-dark` | 用于浅色背景的高对比度深色 | ≥ 4.5:1 |
| `--el-color-primary-contrast-aa` | 满足 WCAG AA 级对比度 | ≥ 4.5:1 |
| `--el-color-primary-contrast-aaa` | 满足 WCAG AAA 级对比度 | ≥ 7:1 |

## 使用场景

### 1. 按钮文本

```vue
<template>
  <el-button type="primary" class="high-contrast-button">
    高对比度按钮
  </el-button>
</template>

<style scoped>
.high-contrast-button {
  background-color: var(--el-color-primary);
  color: var(--el-color-primary-contrast-aa);
}
</style>
```

### 2. 链接文本

```vue
<template>
  <a href="#" class="high-contrast-link">高对比度链接</a>
</template>

<style scoped>
.high-contrast-link {
  color: var(--el-color-primary-contrast-aaa);
  text-decoration: underline;
}

.high-contrast-link:hover {
  opacity: 0.8;
}
</style>
```

### 3. 表单标签

```vue
<template>
  <el-form-item label="用户名" class="high-contrast-form-item">
    <el-input v-model="username" />
  </el-form-item>
</template>

<style scoped>
.high-contrast-form-item :deep(.el-form-item__label) {
  color: var(--el-color-primary-contrast-aa);
  font-weight: 500;
}
</style>
```

### 4. 重要信息提示

```vue
<template>
  <div class="important-notice">
    <p>这是一条重要信息</p>
  </div>
</template>

<style scoped>
.important-notice {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary-contrast-aaa);
  padding: 16px;
  border-radius: 4px;
}
</style>
```

### 5. 深色背景上的文本

```vue
<template>
  <div class="dark-card">
    <h3>深色卡片标题</h3>
    <p>深色卡片内容</p>
  </div>
</template>

<style scoped>
.dark-card {
  background-color: #131313;
  color: var(--el-color-primary-contrast-light);
  padding: 20px;
  border-radius: 8px;
}
</style>
```

### 6. 浅色背景上的文本

```vue
<template>
  <div class="light-card">
    <h3>浅色卡片标题</h3>
    <p>浅色卡片内容</p>
  </div>
</template>

<style scoped>
.light-card {
  background-color: #ffffff;
  color: var(--el-color-primary-contrast-dark);
  padding: 20px;
  border-radius: 8px;
}
</style>
```

## 对比度级别选择

### WCAG AA 级（推荐）

- **对比度要求**：≥ 4.5:1（正常文本）或 ≥ 3:1（大文本）
- **使用变量**：`--el-color-primary-contrast-aa`
- **适用场景**：大多数文本和 UI 元素

```scss
.text-aa {
  color: var(--el-color-primary-contrast-aa);
}
```

### WCAG AAA 级（最高标准）

- **对比度要求**：≥ 7:1（正常文本）或 ≥ 4.5:1（大文本）
- **使用变量**：`--el-color-primary-contrast-aaa`
- **适用场景**：重要信息、法律文本、可访问性要求极高的场景

```scss
.text-aaa {
  color: var(--el-color-primary-contrast-aaa);
}
```

## 与普通变体的对比

### 普通变体（light/dark）

```scss
// 基于线性混合，不保证对比度
.button-normal {
  background-color: var(--el-color-primary);
  color: var(--el-color-primary-light-1); // 可能对比度不足
}
```

### 高对比度变体（contrast）

```scss
// 基于感知亮度算法，保证对比度
.button-contrast {
  background-color: var(--el-color-primary);
  color: var(--el-color-primary-contrast-aa); // 保证对比度 ≥ 4.5:1
}
```

## 最佳实践

### ✅ 推荐做法

1. **按钮文本**：使用 `contrast-aa` 或 `contrast-aaa`
2. **链接文本**：使用 `contrast-aaa` 确保清晰可见
3. **表单标签**：使用 `contrast-aa` 确保可读性
4. **重要信息**：使用 `contrast-aaa` 强调显示

### ❌ 不推荐做法

1. **不要混用**：不要在同一个元素上混用普通变体和高对比度变体
2. **不要过度使用**：高对比度变体主要用于文本，背景色仍可使用普通变体
3. **不要忽略主题**：高对比度变体会根据亮色/暗色主题自动调整

## 技术实现

高对比度变体基于以下算法生成：

1. **相对亮度计算**：使用 WCAG 2.1 标准的相对亮度公式
2. **对比度计算**：计算颜色与背景的对比度比值
3. **迭代调整**：逐步调整 RGB 值，直到达到目标对比度

详细实现请参考：`packages/shared-core/src/btc/utils/color-contrast.ts`

## 注意事项

1. **自动生成**：高对比度变体会在设置主题色时自动生成，无需手动配置
2. **主题适配**：变体会根据当前主题（亮色/暗色）自动调整
3. **性能考虑**：生成过程使用迭代算法，但计算量很小，不影响性能
4. **向后兼容**：新增变量不影响现有代码，现有使用 `light-{i}` 和 `dark-{i}` 的代码无需修改

## 相关文档

- [颜色令牌扩展机制分析](../analysis/color-tokens-extension-analysis.md)
- [CSS 变量清单](../../packages/shared-components/src/styles/CSS_VARIABLES.md)

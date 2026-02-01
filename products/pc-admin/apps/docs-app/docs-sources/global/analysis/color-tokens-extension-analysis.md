# 样式令牌颜色扩展机制分析

## 一、当前颜色扩展机制

### 1.1 核心实现位置

项目中的颜色扩展主要在以下文件中实现：

- **主要实现**：`packages/shared-core/src/btc/plugins/theme/composables/useThemeColor.ts`
- **辅助实现**：`packages/shared-core/src/btc/composables/useTheme.ts`
- **Store 管理**：`packages/shared-core/src/btc/store/theme.ts`

### 1.2 颜色混合算法

使用 `mixColor` 函数进行颜色混合：

```typescript
export function mixColor(color1: string, color2: string, weight: number): string {
  // weight: 0-1 之间的值，表示 color2 的混合比例
  // 计算公式：result = color1 * (1 - weight) + color2 * weight
  const r = Math.round(r1 * (1 - weight) + r2 * weight);
  const g = Math.round(g1 * (1 - weight) + g2 * weight);
  const b = Math.round(b1 * (1 - weight) + b2 * weight);
}
```

### 1.3 当前颜色变体生成逻辑

在 `setThemeColor` 函数中，生成颜色变体的逻辑如下：

```typescript
// 亮色模式
for (let i = 1; i < 10; i += 1) {
  const weight = i * 0.1;  // 10%, 20%, ..., 90%
  
  // light-{i}: 主色与白色混合（变浅）
  const lightColor = mixColor(primaryColor, '#ffffff', weight);
  
  // dark-{i}: 主色与黑色混合（变深）
  const darkColor = mixColor(primaryColor, '#131313', weight);
  
  el.style.setProperty(`--el-color-primary-light-${i}`, lightColor);
  el.style.setProperty(`--el-color-primary-dark-${i}`, darkColor);
}
```

**暗色模式**下的逻辑相反：
- `light-{i}`: 主色与黑色混合（变深）
- `dark-{i}`: 主色与白色混合（变浅）

### 1.4 当前颜色体系

| 变量名 | 说明 | 生成方式 |
|--------|------|----------|
| `--el-color-primary` | 主色（基础色） | 用户设置或预设主题 |
| `--el-color-primary-light-1` ~ `light-9` | 浅色变体（1-9级） | 主色与白色/黑色混合，10%-90% |
| `--el-color-primary-dark-1` ~ `dark-9` | 深色变体（1-9级） | 主色与黑色/白色混合，10%-90% |

### 1.5 使用场景

- **light-{i}**: 用于悬停状态、背景色、边框等需要较浅颜色的场景
- **dark-{i}**: 用于激活状态、强调文本、按钮等需要较深颜色的场景

## 二、对比度增强需求分析

### 2.1 什么是对比度更强的颜色？

对比度（Contrast Ratio）是指前景色与背景色之间的亮度差异。WCAG 2.1 标准要求：

- **AA 级**：文本与背景对比度 ≥ 4.5:1（正常文本）或 3:1（大文本）
- **AAA 级**：文本与背景对比度 ≥ 7:1（正常文本）或 4.5:1（大文本）

### 2.2 当前问题

当前的 `light-{i}` 和 `dark-{i}` 变体是基于**线性混合**生成的，可能无法满足高对比度需求：

1. **线性混合的局限性**：
   - 混合比例固定（10% 递增）
   - 不考虑感知亮度（Perceptual Brightness）
   - 不保证达到 WCAG 对比度标准

2. **实际使用中的问题**：
   - 某些 `light-{i}` 变体在白色背景上对比度不足
   - 某些 `dark-{i}` 变体在深色背景上对比度不足
   - 无法直接获取符合 WCAG 标准的对比色

## 三、增强方案设计

### 3.1 方案一：添加高对比度变体（推荐）

在现有体系基础上，添加专门的高对比度变体：

```typescript
// 新增变量
--el-color-primary-contrast-light  // 高对比度浅色（用于深色背景）
--el-color-primary-contrast-dark   // 高对比度深色（用于浅色背景）
--el-color-primary-contrast-aa     // 满足 WCAG AA 级的对比色
--el-color-primary-contrast-aaa    // 满足 WCAG AAA 级的对比色
```

**优点**：
- 不破坏现有体系
- 语义清晰，专门用于高对比度场景
- 可以基于 WCAG 标准计算

### 3.2 方案二：扩展现有变体范围

将 `light` 和 `dark` 变体扩展到更大的范围：

```typescript
// 扩展 light 变体到 light-10, light-11, ...
// 扩展 dark 变体到 dark-10, dark-11, ...
// 使用更大的混合比例（如 95%, 98%）
```

**优点**：
- 保持现有命名规范
- 向后兼容

**缺点**：
- 仍然基于线性混合，可能无法精确满足对比度要求

### 3.3 方案三：基于感知亮度的智能生成

使用感知亮度算法（如相对亮度 Relative Luminance）生成对比度更强的颜色：

```typescript
// 计算相对亮度
function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// 计算对比度
function getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// 生成满足对比度要求的颜色
function generateContrastColor(baseColor: string, targetContrast: number, isDark: boolean): string {
  // 迭代调整颜色，直到达到目标对比度
}
```

**优点**：
- 精确满足 WCAG 标准
- 基于科学的感知亮度计算

**缺点**：
- 实现复杂度较高
- 需要迭代计算

## 四、推荐实现方案

### 4.1 混合方案：方案一 + 方案三

结合两种方案的优点：

1. **添加高对比度变体**（方案一）
   - 提供语义化的高对比度变量
   - 不破坏现有体系

2. **使用感知亮度算法**（方案三）
   - 精确计算对比度
   - 确保满足 WCAG 标准

### 4.2 实现步骤

1. **创建对比度计算工具函数**
   ```typescript
   // packages/shared-core/src/btc/utils/color-contrast.ts
   - getRelativeLuminance()
   - getContrastRatio()
   - generateContrastColor()
   ```

2. **扩展 setThemeColor 函数**
   ```typescript
   // 在生成 light/dark 变体的同时，生成高对比度变体
   - --el-color-primary-contrast-light
   - --el-color-primary-contrast-dark
   - --el-color-primary-contrast-aa
   - --el-color-primary-contrast-aaa
   ```

3. **更新文档**
   - 在 `CSS_VARIABLES.md` 中添加新变量的说明
   - 提供使用示例

### 4.3 使用示例

```scss
// 高对比度按钮（满足 WCAG AA 级）
.high-contrast-button {
  background-color: var(--el-color-primary);
  color: var(--el-color-primary-contrast-aa);
}

// 高对比度文本（满足 WCAG AAA 级）
.high-contrast-text {
  color: var(--el-color-primary-contrast-aaa);
}
```

## 五、技术细节

### 5.1 相对亮度计算公式

根据 WCAG 2.1 标准：

```
L = 0.2126 * R' + 0.7152 * G' + 0.0722 * B'

其中：
R' = (R/255) <= 0.03928 ? (R/255)/12.92 : ((R/255 + 0.055)/1.055)^2.4
G' = (G/255) <= 0.03928 ? (G/255)/12.92 : ((G/255 + 0.055)/1.055)^2.4
B' = (B/255) <= 0.03928 ? (B/255)/12.92 : ((B/255 + 0.055)/1.055)^2.4
```

### 5.2 对比度计算公式

```
对比度 = (L1 + 0.05) / (L2 + 0.05)

其中：
L1 = 较亮颜色的相对亮度
L2 = 较暗颜色的相对亮度
```

### 5.3 生成高对比度颜色的算法

1. 确定目标对比度（如 4.5:1 或 7:1）
2. 确定背景色（白色 #ffffff 或深色 #131313）
3. 从主色开始，逐步调整 RGB 值
4. 每次调整后计算对比度
5. 当达到目标对比度时停止

## 六、迁移指南

### 6.1 现有代码兼容性

- ✅ 现有使用 `--el-color-primary-light-{i}` 和 `--el-color-primary-dark-{i}` 的代码**无需修改**
- ✅ 新变量是**增量添加**，不影响现有功能

### 6.2 推荐迁移场景

以下场景建议迁移到高对比度变量：

1. **按钮文本**：需要清晰可读
2. **链接文本**：需要突出显示
3. **表单标签**：需要清晰标识
4. **错误提示**：需要醒目显示
5. **重要信息**：需要强调显示

## 七、总结

当前的颜色扩展机制基于**线性混合**，适合一般的视觉设计需求。为了满足**可访问性（WCAG）标准**和**高对比度场景**的需求，建议：

1. ✅ **保留现有体系**：继续使用 `light-{i}` 和 `dark-{i}` 变体
2. ✅ **添加高对比度变体**：新增 `contrast-*` 系列变量
3. ✅ **使用感知亮度算法**：确保精确满足对比度要求
4. ✅ **提供文档和示例**：帮助开发者正确使用

这样既保持了向后兼容性，又满足了高对比度的需求。

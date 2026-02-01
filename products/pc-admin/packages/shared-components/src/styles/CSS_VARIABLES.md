# CSS 变量清单（设计令牌）

本文档列出了项目中使用的所有 CSS 变量（设计令牌），用于确保跨应用设计规范统一。

## 变量分类

### 一、Element Plus 变量（`--el-*`）

来自 Element Plus 组件库的设计令牌，所有应用统一使用。这些变量会在主题切换时自动更新。

#### 颜色系统

| 变量名 | 说明 | 默认值（亮色） | 暗色值 | 使用场景 |
|--------|------|---------------|--------|----------|
| `--el-color-primary` | 主色 | `#409eff` | `#409eff` | 按钮、链接、激活状态 |
| `--el-color-success` | 成功色 | `#67c23a` | `#67c23a` | 成功提示、完成状态 |
| `--el-color-warning` | 警告色 | `#e6a23c` | `#e6a23c` | 警告提示 |
| `--el-color-danger` | 危险色 | `#f56c6c` | `#f56c6c` | 错误提示、删除操作 |
| `--el-color-info` | 信息色 | `#909399` | `#909399` | 信息提示 |
| `--el-color-error` | 错误色 | `#ff4d4f` | `#ff4d4f` | 错误状态（部分场景） |

**颜色变体**：
- `--el-color-primary-light-1` 到 `--el-color-primary-light-9`：主色浅色变体（基于线性混合）
- `--el-color-primary-dark-1` 到 `--el-color-primary-dark-9`：主色深色变体（基于线性混合）
- 其他颜色也有类似的变体

**高对比度变体**（基于 WCAG 2.1 标准）：
- `--el-color-primary-contrast-light`：用于深色背景的高对比度浅色
- `--el-color-primary-contrast-dark`：用于浅色背景的高对比度深色
- `--el-color-primary-contrast-aa`：满足 WCAG AA 级对比度（4.5:1）
- `--el-color-primary-contrast-aaa`：满足 WCAG AAA 级对比度（7:1）

> **注意**：高对比度变体基于感知亮度（Relative Luminance）算法生成，确保满足可访问性标准。适用于需要高对比度的场景，如按钮文本、链接文本、表单标签等。

#### 背景色系统

| 变量名 | 说明 | 默认值（亮色） | 暗色值 | 使用场景 |
|--------|------|---------------|--------|----------|
| `--el-bg-color` | 组件背景色 | `#ffffff` | `#0a0a0a` | 所有组件的背景 |
| `--el-bg-color-page` | 页面背景色 | `#f2f3f5` | `#141414` | 页面整体背景 |
| `--el-fill-color` | 填充色 | `#f0f2f5` | `#424243` | 输入框、卡片背景 |
| `--el-fill-color-light` | 浅填充色 | `#f5f7fa` | `#39393a` | 表格行悬停、菜单悬停 |
| `--el-fill-color-lighter` | 更浅填充色 | `#fafafa` | `#2d2d2d` | 浅色背景区域 |
| `--el-fill-color-extra-light` | 极浅填充色 | - | `#1d1d1d` | 极浅背景 |
| `--el-fill-color-dark` | 深填充色 | - | `#4c4d4f` | 深色背景 |
| `--el-fill-color-darker` | 更深填充色 | - | `#636466` | 更深背景 |
| `--el-fill-color-blank` | 透明填充 | `transparent` | `transparent` | 透明背景 |

#### 文本颜色系统

| 变量名 | 说明 | 默认值（亮色） | 暗色值 | 使用场景 |
|--------|------|---------------|--------|----------|
| `--el-text-color-primary` | 主要文本 | `#303133` | `#e5eaf3` | 标题、重要文本 |
| `--el-text-color-regular` | 常规文本 | `#606266` | `#cfd3dc` | 正文、描述文本 |
| `--el-text-color-secondary` | 次要文本 | `#909399` | `#a3a6ad` | 辅助信息、提示文本 |
| `--el-text-color-placeholder` | 占位符文本 | `#a8abb2` | `#6c6e72` | 输入框占位符 |
| `--el-text-color-disabled` | 禁用文本 | `#c0c4cc` | `#6c6e72` | 禁用状态文本 |

#### 边框颜色系统

| 变量名 | 说明 | 默认值（亮色） | 暗色值 | 使用场景 |
|--------|------|---------------|--------|----------|
| `--el-border-color` | 边框颜色 | `#dcdfe6` | `#4c4d4f` | 默认边框 |
| `--el-border-color-light` | 浅色边框 | `#e4e7ed` | `#414243` | 浅色边框 |
| `--el-border-color-lighter` | 更浅边框 | `#ebeef5` | `#363637` | 更浅边框 |
| `--el-border-color-extra-light` | 极浅边框 | `#f2f6fc` | `#2b2b2c` | 极浅边框、分隔线 |
| `--el-border-color-hover` | 悬停边框 | - | - | 悬停状态边框 |

#### 组件特定变量

| 变量名 | 说明 | 使用场景 |
|--------|------|----------|
| `--el-menu-bg-color` | 菜单背景色 | 侧边栏菜单 |
| `--el-menu-hover-bg-color` | 菜单悬停背景色 | 菜单项悬停 |
| `--el-menu-text-color` | 菜单文本颜色 | 菜单项文本 |
| `--el-menu-active-color` | 菜单激活色 | 激活的菜单项 |
| `--el-menu-active-text-color` | 菜单激活文本色 | 激活菜单项的文本 |
| `--el-table-bg-color` | 表格背景色 | 表格容器 |
| `--el-table-tr-bg-color` | 表格行背景色 | 表格行 |
| `--el-table-row-hover-bg-color` | 表格行悬停背景色 | 表格行悬停 |
| `--el-table-header-height` | 表格头部高度 | 表格头部 |
| `--el-table-row-height` | 表格行高度 | 表格行 |
| `--el-drawer-bg-color` | 抽屉背景色 | 抽屉组件 |
| `--el-dialog-bg-color` | 对话框背景色 | 对话框组件 |
| `--el-popover-bg-color` | 弹出框背景色 | 弹出框组件 |
| `--el-tooltip-bg-color` | 提示框背景色 | 提示框组件 |
| `--el-card-bg-color` | 卡片背景色 | 卡片组件 |
| `--el-button-bg-color` | 按钮背景色 | 按钮组件 |
| `--el-button-border-color` | 按钮边框色 | 按钮组件 |
| `--el-input-bg-color` | 输入框背景色 | 输入框组件 |
| `--el-select-dropdown-bg-color` | 下拉框背景色 | 下拉框组件 |
| `--el-datepicker-bg-color` | 日期选择器背景色 | 日期选择器 |
| `--el-select-input-color` | 下拉框输入文本色 | 下拉框组件 |
| `--el-pagination-border-radius` | 分页器圆角 | 分页器组件 |
| `--el-border-radius-base` | 基础圆角 | 通用圆角值 |

#### 阴影系统

| 变量名 | 说明 | 使用场景 |
|--------|------|----------|
| `--el-box-shadow-light` | 浅色阴影 | 下拉菜单、弹出框 |

### 二、BTC 自定义变量（`--btc-*`）

项目自定义的设计令牌，用于扩展 Element Plus 未覆盖的场景。

#### CRUD 相关变量

| 变量名 | 说明 | 默认值 | 定义位置 | 使用场景 |
|--------|------|--------|----------|----------|
| `--btc-crud-gap` | CRUD 行间距 | `10px` | `crud/_base.scss` | CRUD 组件行之间的间距 |
| `--btc-crud-op-width` | 操作列宽度 | `220px` | `crud/_base.scss` | 表格操作列的宽度 |
| `--btc-crud-search-width` | 搜索框宽度 | `220px`（继承 op-width） | `crud/_search.scss` | CRUD 搜索框的宽度 |
| `--btc-crud-btn-color` | CRUD 按钮颜色 | `var(--el-text-color-primary)` | `crud/_button.scss` | CRUD 按钮的文字颜色 |
| `--btc-crud-icon-color` | CRUD 图标颜色 | `var(--el-color-primary)` | `crud/_button.scss` | CRUD 图标按钮的颜色 |

**使用示例**：
```scss
.btc-crud {
  --btc-crud-gap: 10px;
  --btc-crud-op-width: 220px;
}

.btc-crud-row {
  margin-top: var(--btc-crud-gap, 10px);
}
```

#### 图标相关变量

| 变量名 | 说明 | 默认值 | 定义位置 | 使用场景 |
|--------|------|--------|----------|----------|
| `--btc-icon-color` | 图标颜色 | `var(--el-text-color-primary)` | `_components.scss` | 通用图标按钮的颜色 |
| `--btc-breath-color` | 呼吸灯颜色 | `var(--el-color-primary)` | `_components.scss` | 通知/消息图标的呼吸灯颜色 |

**使用示例**：
```scss
.btc-comm__icon {
  --btc-icon-color: var(--el-text-color-primary);
  color: var(--btc-icon-color);
}

.btc-icon-button--breath {
  --btc-breath-color: var(--el-color-primary);
}
```

#### 表格相关变量

| 变量名 | 说明 | 默认值 | 定义位置 | 使用场景 |
|--------|------|--------|----------|----------|
| `--btc-table-button-color` | 表格按钮颜色 | `var(--el-color-primary)` | `dark-theme.css` | 表格工具栏按钮颜色 |

## 变量使用规范

### 1. 优先使用 Element Plus 变量

```scss
// ✅ 推荐：使用 Element Plus 变量
.component {
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border: 1px solid var(--el-border-color);
}

// ❌ 不推荐：硬编码值
.component {
  background: #ffffff;
  color: #303133;
  border: 1px solid #dcdfe6;
}
```

### 2. 提供默认值

```scss
// ✅ 推荐：提供默认值
.component {
  gap: var(--btc-crud-gap, 10px);
  width: var(--btc-crud-op-width, 220px);
}

// ❌ 不推荐：不提供默认值
.component {
  gap: var(--btc-crud-gap);  // 如果变量未定义会失效
}
```

### 3. 使用语义化命名

```scss
// ✅ 推荐：语义化命名
--btc-primary-color
--btc-crud-gap
--btc-icon-color

// ❌ 不推荐：非语义化命名
--btc-blue-500
--btc-spacing-10
--btc-color-1
```

### 4. 变量作用域

#### 全局变量（Settings 层）

定义在 `:root` 或 `html.dark` 选择器中，全局可用：

```scss
// dark-theme.scss
:root {
  --el-bg-color: #0a0a0a;
}
```

#### 组件级变量（Components 层）

定义在组件选择器中，只在组件内有效：

```scss
// crud/_base.scss
.btc-crud {
  --btc-crud-gap: 10px;
  --btc-crud-op-width: 220px;
}
```

## 变量定义位置

### Element Plus 变量

- **定义位置**：Element Plus 组件库内部
- **覆盖位置**：`dark-theme.scss`（仅暗色主题）
- **使用位置**：所有样式文件

### BTC 自定义变量

| 变量类别 | 定义位置 | 说明 |
|----------|----------|------|
| CRUD 相关 | `crud/_base.scss`、`crud/_button.scss` | CRUD 组件内部定义 |
| 图标相关 | `_components.scss` | 通用组件样式文件 |
| 表格相关 | `dark-theme.css` | 暗色主题文件 |

## 主题切换

### 亮色主题

使用 Element Plus 的默认变量值，无需额外定义。

### 暗色主题

在 `dark-theme.scss` 中覆盖 Element Plus 变量：

```scss
html.dark {
  --el-bg-color: #0a0a0a;
  --el-bg-color-page: #141414;
  --el-text-color-primary: #e5eaf3;
  // ...
}
```

### 变量继承关系

```
Element Plus 默认变量
  ↓
dark-theme.scss 覆盖（暗色主题）
  ↓
组件级变量（--btc-*）可以引用 Element Plus 变量
  ↓
组件样式使用变量
```

## 新增变量指南

### 何时新增变量？

1. **需要全局统一的设计规范**（如间距、颜色）
2. **需要支持主题切换的值**（如颜色、背景）
3. **需要动态调整的值**（如组件尺寸）

### 如何新增变量？

#### 步骤 1：确定变量作用域

- **全局使用** → 定义在 `_tokens.scss` 或 `dark-theme.scss`
- **组件特定** → 定义在组件样式文件中

#### 步骤 2：使用语义化命名

```scss
// ✅ 推荐
--btc-primary-color
--btc-spacing-md
--btc-border-radius-sm

// ❌ 不推荐
--btc-blue-500
--btc-10px
--btc-radius-4
```

#### 步骤 3：提供默认值

```scss
// ✅ 推荐
.component {
  color: var(--btc-primary-color, var(--el-color-primary));
  gap: var(--btc-spacing-md, 12px);
}
```

#### 步骤 4：更新文档

在本文档中添加新变量的说明。

## 变量查找指南

### 按用途查找

- **颜色** → 查看 "颜色系统" 部分
- **背景** → 查看 "背景色系统" 部分
- **文本** → 查看 "文本颜色系统" 部分
- **边框** → 查看 "边框颜色系统" 部分
- **组件特定** → 查看 "组件特定变量" 部分

### 按前缀查找

- `--el-*` → Element Plus 变量（优先使用）
- `--btc-*` → BTC 自定义变量

## 注意事项

1. **不要覆盖 Element Plus 核心变量**：除非在主题文件中
2. **使用变量而非硬编码**：确保主题切换正常工作
3. **提供默认值**：避免变量未定义时样式失效
4. **语义化命名**：让变量名表达含义，而非具体值
5. **文档同步**：新增变量后及时更新本文档

## 高对比度变体使用指南

### 何时使用高对比度变体？

高对比度变体适用于需要满足**可访问性（WCAG）标准**的场景：

1. **按钮文本**：确保按钮上的文字清晰可读
2. **链接文本**：确保链接文字在背景上清晰可见
3. **表单标签**：确保表单标签清晰可读
4. **重要信息**：需要强调显示的重要文本
5. **错误提示**：需要醒目显示的错误信息

### 使用示例

```scss
// ✅ 高对比度按钮（满足 WCAG AA 级）
.high-contrast-button {
  background-color: var(--el-color-primary);
  color: var(--el-color-primary-contrast-aa);
}

// ✅ 高对比度链接（满足 WCAG AAA 级）
.high-contrast-link {
  color: var(--el-color-primary-contrast-aaa);
  text-decoration: underline;
}

// ✅ 深色背景上的高对比度文本
.dark-bg-text {
  background-color: #131313;
  color: var(--el-color-primary-contrast-light);
}

// ✅ 浅色背景上的高对比度文本
.light-bg-text {
  background-color: #ffffff;
  color: var(--el-color-primary-contrast-dark);
}

// ✅ 表单标签（满足 WCAG AA 级）
.form-label {
  color: var(--el-color-primary-contrast-aa);
  font-weight: 500;
}
```

### 对比度级别说明

| 变量名 | 对比度要求 | 适用场景 | WCAG 级别 |
|--------|-----------|----------|-----------|
| `--el-color-primary-contrast-light` | ≥ 4.5:1（相对于深色背景） | 深色背景上的文本 | AA |
| `--el-color-primary-contrast-dark` | ≥ 4.5:1（相对于浅色背景） | 浅色背景上的文本 | AA |
| `--el-color-primary-contrast-aa` | ≥ 4.5:1 | 正常文本（推荐） | AA |
| `--el-color-primary-contrast-aaa` | ≥ 7:1 | 重要文本、大文本 | AAA |

### 与普通变体的区别

| 特性 | 普通变体（light/dark） | 高对比度变体（contrast） |
|------|----------------------|------------------------|
| 生成方式 | 线性混合（固定比例） | 基于感知亮度算法 |
| 对比度保证 | ❌ 不保证 | ✅ 保证满足 WCAG 标准 |
| 使用场景 | 一般视觉设计 | 可访问性要求高的场景 |
| 计算复杂度 | 低（简单混合） | 高（迭代计算） |

## 参考资源

- [Element Plus 主题定制](https://element-plus.org/zh-CN/guide/theming.html)
- [CSS 自定义属性（变量）](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)
- [WCAG 2.1 对比度标准](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [颜色对比度计算器](https://webaim.org/resources/contrastchecker/)

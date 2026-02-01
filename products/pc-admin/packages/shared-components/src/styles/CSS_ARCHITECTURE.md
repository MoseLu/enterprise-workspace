# CSS 架构规范文档

## 概述

本项目采用 **ITCSS（倒三角 CSS）+ BEM（块-元素-修饰符）+ 设计令牌（Design Tokens）** 的组合模式，确保 monorepo 中跨包样式统一、低冲突、易维护。

## 一、ITCSS 分层架构

ITCSS（Inverted Triangle CSS）通过分层管理样式，从全局通用到局部特定，确保特异性从低到高，避免样式冲突。

### 分层结构

```
packages/shared-components/src/styles/
├── index.scss                    # 入口文件，统一导入所有样式
├── _base.scss                    # Generic 层：浏览器重置
├── _components.scss              # Components 层：通用组件样式
├── _crud.scss                    # Components 层：CRUD 相关组件
├── _layout.scss                  # Objects 层：布局对象
├── _menu.scss                    # Components 层：菜单组件
├── _loading.scss                 # Components 层：加载动画
├── dark-theme.scss               # Settings 层：暗色主题变量
├── menu-themes.scss              # Settings 层：菜单主题
├── transitions.scss              # Utilities 层：过渡动画
├── responsive-layout.scss        # Utilities 层：响应式布局
└── crud/                         # Components 层：CRUD 子模块
    ├── _base.scss
    ├── _button.scss
    ├── _table.scss
    └── ...
```

### 各层说明

#### 1. Settings 层（设计令牌）

**位置**：`_tokens.scss`（从 `@btc/design-tokens` 包导入）、`dark-theme.scss`、`menu-themes.scss`、组件内部变量定义

**职责**：
- 定义全局 CSS 变量（设计令牌）
- 不产生任何 CSS 输出，只定义变量
- 支持主题切换（亮色/暗色）

**设计令牌包**：
- 使用 `@btc/design-tokens` 包管理核心设计令牌
- 通过 `_tokens.scss` 导入编译后的设计令牌
- 设计令牌使用 Style Dictionary 从 JSON 文件编译生成

**示例**：
```scss
// _tokens.scss - 从设计令牌包导入
@use '@btc/design-tokens/scss' as *;

// dark-theme.scss
:root {
  --el-bg-color: #0a0a0a;
  --el-color-primary: #409eff;
}

// 组件内部（组件级变量定义，用于覆盖全局值）
.btc-crud {
  --btc-crud-gap: 10px;
  --btc-crud-op-width: 220px;
}
```

**开发规范**：
- ✅ 使用语义化命名：`--btc-primary-color` 而不是 `--btc-blue-500`
- ✅ 变量名使用 kebab-case：`--btc-crud-gap`
- ✅ 提供默认值：`var(--btc-crud-gap, 10px)`
- ✅ 全局变量从设计令牌包导入（`_tokens.scss`）
- ✅ 组件级变量可以在组件选择器中定义（用于覆盖全局值）
- ❌ 禁止硬编码颜色值（除非是设计令牌定义）

**设计令牌包使用**：
- 全局变量定义在 `@btc/design-tokens` 包中
- 通过 `_tokens.scss` 导入：`@use '@btc/design-tokens/scss' as *;`
- 组件级变量可以在组件样式中定义，用于动态覆盖

#### 2. Generic 层（浏览器重置）

**位置**：`_base.scss`

**职责**：
- 浏览器默认样式重置
- 全局元素样式（ul/li 等）
- 不包含业务逻辑

**示例**：
```scss
// _base.scss
ul.app-process__op,
ul.topbar__tools {
  margin: 0;
  padding: 0;
  list-style: none;
}
```

**开发规范**：
- ✅ 只包含全局重置样式
- ✅ 使用通用选择器，避免特定业务类名
- ❌ 禁止添加组件特定样式

#### 3. Elements 层（基础元素）

**位置**：`_base.scss`、`_components.scss` 中的元素级样式

**职责**：
- HTML 元素的基础样式（如 a、h1-h6、input 等）
- 第三方库元素的覆盖样式（如 `.el-drawer__body`）

**示例**：
```scss
// _components.scss
.el-drawer__body {
  padding: 0 !important;
  overflow-y: auto !important;
}
```

**开发规范**：
- ✅ 只针对元素本身，不涉及布局
- ✅ 使用低特异性选择器
- ❌ 禁止使用业务类名

#### 4. Objects 层（布局对象）

**位置**：`_layout.scss`

**职责**：
- 纯布局样式，不包含视觉样式
- 可复用的布局模式（如网格、容器、分栏）

**示例**：
```scss
// _layout.scss
.btc-page-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
```

**开发规范**：
- ✅ 只包含布局相关属性（display、position、width、height 等）
- ✅ 不包含颜色、字体、边框等视觉样式
- ✅ 类名使用 `.o-` 前缀（可选，当前使用 `.btc-` 前缀）

#### 5. Components 层（组件样式）

**位置**：`_components.scss`、`_crud.scss`、`_menu.scss`、`_loading.scss`、`crud/` 目录

**职责**：
- 具体组件的样式
- 使用 BEM 命名规范
- 可以包含布局和视觉样式

**示例**：
```scss
// _components.scss
.btc-comm__icon {
  display: flex;
  align-items: center;
  border: 1px solid var(--el-fill-color-dark);
  border-radius: 6px;
}
```

**开发规范**：
- ✅ 严格遵循 BEM 命名：`.btc-block__element--modifier`
- ✅ 使用 CSS 变量而非硬编码值
- ✅ 组件样式应该独立，不依赖外部样式
- ❌ 禁止使用 `!important`（除非覆盖第三方库）

#### 6. Utilities 层（工具类）

**位置**：`transitions.scss`、`responsive-layout.scss`

**职责**：
- 单一用途的工具类
- 高优先级，用于覆盖其他层
- 可组合使用

**示例**：
```scss
// transitions.scss
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
```

**开发规范**：
- ✅ 单一职责，一个类只做一件事
- ✅ 可以使用 `!important`（工具类需要高优先级）
- ✅ 类名使用 `.u-` 前缀（可选，当前使用语义化命名）

### 样式文件组织规则

1. **按功能模块拆分**：CRUD 相关样式放在 `crud/` 目录
2. **按层级拆分**：基础样式、组件样式、工具类分开
3. **统一入口**：所有样式通过 `index.scss` 导入

## 二、BEM 命名规范

### 命名格式

```
.block__element--modifier
```

- **Block（块）**：独立的组件，如 `.btc-icon-button`
- **Element（元素）**：块的组成部分，如 `.btc-icon-button__icon`
- **Modifier（修饰符）**：块或元素的状态/变体，如 `.btc-icon-button--disabled`

### 命名规范

#### 1. 统一前缀

所有 BTC 组件使用 `.btc-` 前缀，避免跨包类名冲突：

```scss
// ✅ 正确
.btc-icon-button { }
.btc-master-list { }
.btc-crud { }

// ❌ 错误
.icon-button { }  // 缺少前缀，可能冲突
```

#### 2. BEM 结构

```scss
// ✅ 正确：块-元素-修饰符
.btc-icon-button { }                    // 块
.btc-icon-button__icon { }              // 元素
.btc-icon-button__dropdown-item { }      // 元素
.btc-icon-button--disabled { }           // 修饰符（块级别）
.btc-icon-button__icon--large { }        // 修饰符（元素级别）

// ❌ 错误：嵌套选择器
.btc-icon-button {
  .icon { }  // 应该使用 .btc-icon-button__icon
}
```

#### 3. 状态修饰符

使用 `.is-` 或 `.has-` 前缀表示状态：

```scss
// ✅ 正确
.btc-master-list__node-label.is-active { }
.btc-views.is-expand { }
.btc-views.is-collapse { }

// ❌ 错误
.btc-master-list__node-label.active { }  // 缺少 is- 前缀
```

#### 4. 命名语义化

```scss
// ✅ 正确：语义化命名
.btc-master-list__node-label { }         // 清晰表达用途
.btc-crud-primary-actions { }            // 表达功能

// ❌ 错误：非语义化命名
.btc-master-list__text { }               // 不够具体
.btc-crud__div1 { }                      // 无意义
```

### BEM 最佳实践

1. **保持扁平结构**：避免深层嵌套，最多 2-3 层
2. **元素依赖块**：元素必须属于某个块，不能独立存在
3. **修饰符独立**：修饰符可以单独使用，也可以与元素组合
4. **避免嵌套选择器**：使用 BEM 命名代替 CSS 嵌套

```scss
// ✅ 推荐：扁平结构
.btc-icon-button { }
.btc-icon-button__icon { }
.btc-icon-button__dropdown { }
.btc-icon-button__dropdown-item { }

// ❌ 不推荐：深层嵌套
.btc-icon-button {
  .dropdown {
    .item { }  // 应该使用 .btc-icon-button__dropdown-item
  }
}
```

## 三、设计令牌（CSS 变量）使用指南

### 变量分类

#### 1. Element Plus 变量（`--el-*`）

来自 Element Plus 组件库的设计令牌，所有应用统一使用：

```scss
// 颜色
--el-color-primary          // 主色
--el-color-success          // 成功色
--el-color-warning          // 警告色
--el-color-danger           // 危险色
--el-color-info             // 信息色

// 背景色
--el-bg-color                // 组件背景色
--el-bg-color-page           // 页面背景色

// 文本颜色
--el-text-color-primary      // 主要文本
--el-text-color-regular      // 常规文本
--el-text-color-secondary    // 次要文本

// 边框
--el-border-color            // 边框颜色
--el-border-color-light      // 浅色边框
--el-border-color-extra-light // 极浅边框

// 填充色
--el-fill-color-light        // 浅色填充
--el-fill-color-lighter      // 更浅填充
```

**使用规范**：
- ✅ 优先使用 Element Plus 变量，确保与组件库一致
- ✅ 主题切换时，Element Plus 会自动更新这些变量
- ❌ 禁止覆盖 Element Plus 的核心变量（除非在主题文件中）

#### 2. BTC 自定义变量（`--btc-*`）

项目自定义的设计令牌，用于扩展 Element Plus 未覆盖的场景：

```scss
// CRUD 相关
--btc-crud-gap               // CRUD 行间距（默认 10px）
--btc-crud-op-width          // 操作列宽度（默认 220px）
--btc-crud-search-width      // 搜索框宽度
--btc-crud-btn-color         // CRUD 按钮颜色
--btc-crud-icon-color        // CRUD 图标颜色

// 图标相关
--btc-icon-color             // 图标颜色
--btc-breath-color           // 呼吸灯颜色

// 表格相关
--btc-table-button-color     // 表格按钮颜色
```

**使用规范**：
- ✅ 使用语义化命名：`--btc-primary-color` 而不是 `--btc-blue-500`
- ✅ 提供默认值：`var(--btc-crud-gap, 10px)`
- ✅ 变量名使用 kebab-case
- ❌ 禁止硬编码值（除非是设计令牌定义）

### 变量定义位置

#### 1. 全局变量（Settings 层）

**位置**：`dark-theme.scss`、`menu-themes.scss`

```scss
// dark-theme.scss
:root {
  --el-bg-color: #0a0a0a;
  --el-color-primary: #409eff;
}
```

#### 2. 组件级变量（Components 层）

**位置**：组件样式文件或组件内部

```scss
// _crud.scss
.btc-crud {
  --btc-crud-gap: 10px;
  --btc-crud-op-width: 220px;
}
```

### 变量使用示例

```scss
// ✅ 正确：使用变量
.btc-icon-button {
  border: 1px solid var(--el-border-color);
  color: var(--btc-icon-color, var(--el-text-color-primary));
}

// ❌ 错误：硬编码值
.btc-icon-button {
  border: 1px solid #dcdfe6;
  color: #303133;
}
```

## 四、样式开发规范

### 1. 文件组织

```
styles/
├── index.scss              # 统一入口
├── _base.scss              # Generic 层
├── _components.scss        # Components 层（通用组件）
├── _crud.scss              # Components 层（CRUD 组件）
├── _layout.scss            # Objects 层
├── _menu.scss              # Components 层（菜单）
├── _loading.scss           # Components 层（加载）
├── dark-theme.scss         # Settings 层（暗色主题）
├── menu-themes.scss        # Settings 层（菜单主题）
├── transitions.scss        # Utilities 层
└── crud/                   # CRUD 子模块
    ├── _base.scss
    ├── _button.scss
    └── ...
```

### 2. 样式编写规范

#### 选择器优先级

1. **避免深层嵌套**：最多 2-3 层
2. **使用 BEM 命名**：减少选择器复杂度
3. **避免 `!important`**：除非覆盖第三方库

```scss
// ✅ 推荐：扁平结构
.btc-icon-button { }
.btc-icon-button__icon { }
.btc-icon-button--disabled { }

// ❌ 不推荐：深层嵌套
.btc-icon-button {
  .wrapper {
    .icon { }  // 应该使用 .btc-icon-button__icon
  }
}
```

#### 变量使用

```scss
// ✅ 推荐：使用变量
.btc-component {
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
}

// ❌ 不推荐：硬编码
.btc-component {
  color: #303133;
  background: #ffffff;
  border: 1px solid #dcdfe6;
}
```

#### 响应式设计

```scss
// ✅ 推荐：使用媒体查询
@media (max-width: 768px) {
  .btc-component {
    width: 100%;
  }
}
```

### 3. 样式冲突处理

#### 避免冲突的原则

1. **使用 BEM 命名**：确保类名唯一性
2. **统一前缀**：所有 BTC 组件使用 `.btc-` 前缀
3. **遵循 ITCSS 分层**：从低到高的特异性顺序

#### 处理第三方库样式

```scss
// ✅ 推荐：使用 :deep() 或具体选择器
.btc-component {
  :deep(.el-button) {
    // Element Plus 组件样式覆盖
  }
}

// ✅ 或使用具体选择器
.btc-component .el-button {
  // 样式覆盖
}
```

## 五、主题切换支持

### 亮色/暗色主题

项目支持亮色和暗色主题切换，通过 CSS 变量实现：

```scss
// dark-theme.scss
:root {
  --el-bg-color: #0a0a0a;        // 暗色背景
  --el-text-color-primary: #e5eaf3; // 暗色文本
}

// 亮色主题使用 Element Plus 默认值
```

### 主题变量使用

```scss
// ✅ 正确：使用主题变量
.component {
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
}

// ❌ 错误：硬编码颜色
.component {
  background: #ffffff;  // 暗色主题下不生效
  color: #303133;
}
```

## 六、跨应用样式复用

### Monorepo 中的样式共享

所有应用通过 `@btc/shared-components` 共享样式：

```typescript
// 在应用中使用
import '@btc/shared-components/dist/style.css';
```

### 新应用接入

1. **安装依赖**：`@btc/shared-components`
2. **导入样式**：在入口文件导入样式文件
3. **使用组件**：直接使用共享组件，样式自动生效

## 七、开发检查清单

编写样式时，请检查：

- [ ] 是否使用了 BEM 命名规范？
- [ ] 类名是否有 `.btc-` 前缀？
- [ ] 是否使用了 CSS 变量而非硬编码值？
- [ ] 样式是否放在了正确的 ITCSS 层级？
- [ ] 是否避免了深层嵌套（最多 2-3 层）？
- [ ] 是否避免了不必要的 `!important`？
- [ ] 是否考虑了主题切换（使用变量）？
- [ ] 是否考虑了响应式设计？

## 八、常见问题

### Q1: 什么时候使用 `!important`？

**A**: 仅在以下场景使用：
- 覆盖第三方库（如 Element Plus）的样式
- Utilities 层的工具类需要高优先级
- 主题切换时的强制覆盖

### Q2: 如何决定样式放在哪个文件？

**A**: 参考 ITCSS 分层：
- 全局重置 → `_base.scss`（Generic 层）
- 布局相关 → `_layout.scss`（Objects 层）
- 组件样式 → `_components.scss` 或对应模块文件（Components 层）
- 工具类 → `transitions.scss` 等（Utilities 层）

### Q3: 如何避免样式冲突？

**A**: 
1. 使用 BEM 命名确保类名唯一
2. 使用 `.btc-` 前缀避免跨包冲突
3. 遵循 ITCSS 分层，从低到高的特异性顺序

### Q4: 新增设计令牌应该放在哪里？

**A**: 
- 全局使用的 → `dark-theme.scss` 或新建 `_tokens.scss`
- 组件特定的 → 在组件样式文件中定义

## 九、参考资源

- [ITCSS 官方文档](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
- [BEM 命名规范](http://getbem.com/)
- [Element Plus 设计令牌](https://element-plus.org/zh-CN/guide/theming.html)

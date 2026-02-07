# ITCSS 重组计划

## 当前结构分析

当前样式文件结构已经基本符合ITCSS分层，但需要进行一些优化：

### 当前分层情况

1. **Settings 层** ✅
   - `_tokens.scss` - 设计令牌
   - `dark-theme.scss` - 暗色主题变量
   - `menu-themes.scss` - 菜单主题变量

2. **Generic 层** ✅
   - `_base.scss` - 浏览器重置

3. **Elements 层** ⚠️
   - 部分在 `_base.scss` 中
   - 部分在 `_components.scss` 中（第三方库元素覆盖）

4. **Objects 层** ✅
   - `_layout.scss` - 布局对象

5. **Components 层** ✅
   - `_components.scss` - 通用组件
   - `_crud.scss` - CRUD组件入口
   - `crud/` - CRUD子模块
   - `_menu.scss` - 菜单组件
   - `_loading.scss` - 加载组件
   - `loading/` - 加载子模块

6. **Utilities 层** ✅
   - `transitions.scss` - 过渡动画
   - `responsive-layout.scss` - 响应式布局

## 需要优化的地方

### 1. Elements 层需要明确分离

**问题**：Elements 层的样式分散在 `_base.scss` 和 `_components.scss` 中

**解决方案**：
- 创建 `_elements.scss` 专门存放元素级样式
- 将第三方库元素覆盖样式移到 `_elements.scss`
- `_base.scss` 只保留浏览器重置

### 2. 确保导入顺序正确

**当前顺序**（index.scss）：
```scss
@use './tokens' as *;      // Settings
@use './base' as *;        // Generic
@use './menu' as *;         // Components
@use './layout' as *;       // Objects
@use './crud' as *;         // Components
@use './components' as *;   // Components
@use './loading' as *;      // Components
```

**优化后顺序**：
```scss
// Settings 层
@use './tokens' as *;

// Generic 层
@use './base' as *;

// Elements 层
@use './elements' as *;

// Objects 层
@use './layout' as *;

// Components 层
@use './components' as *;
@use './menu' as *;
@use './crud' as *;
@use './loading' as *;

// Utilities 层
@forward './transitions.scss';
@forward './responsive-layout.scss';
```

## 重组步骤

### 步骤1：创建 _elements.scss

从 `_components.scss` 和 `_base.scss` 中提取元素级样式。

### 步骤2：更新 _base.scss

确保 `_base.scss` 只包含浏览器重置样式。

### 步骤3：更新 _components.scss

移除元素级样式，只保留组件样式。

### 步骤4：更新 index.scss

按照ITCSS顺序重新组织导入。

### 步骤5：验证

构建并测试，确保样式优先级正确。

## 注意事项

1. **保持向后兼容**：重组过程中确保样式输出不变
2. **验证优先级**：确保ITCSS分层后的样式优先级正确
3. **充分测试**：重组后测试所有组件样式

## 实施状态

- [ ] 创建 _elements.scss
- [ ] 提取元素级样式
- [ ] 更新 _base.scss
- [ ] 更新 _components.scss
- [ ] 更新 index.scss
- [ ] 验证和测试

# 新后台样式集成指南

本文档说明如何在 btc-monorepo 框架下创建新的后台应用，并正确集成共享样式系统。

## 前置条件

1. 新后台应用已创建在 `apps/` 目录下
2. 已安装 `@btc/shared-components` 依赖
3. 使用 Vue 3 + TypeScript + Vite

## 一、样式导入步骤

### 步骤 1：在入口文件中导入共享样式

在应用的入口文件（通常是 `src/main.ts` 或 `src/bootstrap/index.ts`）中导入：

```typescript
// src/bootstrap/index.ts 或 src/main.ts

// 1. 导入共享组件样式（必须在最前面）
// 注意：此文件已包含设计令牌（从 @btc/design-tokens 包导入）
import '@btc/shared-components/styles/index.scss';

// 2. 导入暗色主题样式（如果需要在暗色主题下运行）
import '@btc/shared-components/styles/dark-theme.css';

// 3. 导入应用特定的全局样式（可选）
import './styles/global.scss';
```

**导入顺序很重要**：
1. 共享组件样式（`@btc/shared-components/styles/index.scss`）必须在最前面
   - 此文件已包含设计令牌（通过 `_tokens.scss` 从 `@btc/design-tokens` 包导入）
2. 暗色主题样式（`dark-theme.css`）必须在 Element Plus 暗色样式之后
3. 应用特定样式最后导入（用于覆盖或扩展）

**设计令牌说明**：
- 设计令牌已包含在 `@btc/shared-components/styles/index.scss` 中
- 无需单独导入 `@btc/design-tokens` 包
- 所有 `--btc-*` CSS 变量自动可用

### 步骤 2：创建应用全局样式文件（可选）

如果应用有特定的样式需求，创建 `src/styles/global.scss`：

```scss
// src/styles/global.scss

// 导入共享组件样式（使用 @use 确保样式被正确导入）
@use '@btc/shared-components/styles/index.scss' as *;

// 应用特定的全局样式
:root {
  // 应用特定的 CSS 变量（如果需要）
  --app-custom-color: var(--el-color-primary);
}

// 应用特定的全局样式
body {
  // 应用特定的 body 样式
}

// 应用特定的组件样式覆盖
.app-custom-component {
  // 使用共享变量
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
}
```

### 步骤 3：在 UI 初始化中导入 Element Plus 样式

在 UI 初始化文件（如 `src/bootstrap/core/ui.ts`）中：

```typescript
// src/bootstrap/core/ui.ts

// Element Plus 基础样式
import 'element-plus/dist/index.css';

// Element Plus 暗色主题样式（必须在 dark-theme.css 之前）
import 'element-plus/theme-chalk/dark/css-vars.css';

// 应用主题样式（可选）
import '../../styles/theme.scss';
```

## 二、样式文件结构

推荐的应用样式文件结构：

```
apps/your-app/src/
├── styles/
│   ├── global.scss          # 全局样式（导入共享样式 + 应用特定样式）
│   ├── theme.scss           # 主题样式（可选）
│   └── nprogress.scss       # 进度条样式（可选）
├── bootstrap/
│   └── index.ts            # 导入样式
└── bootstrap/core/
    └── ui.ts               # UI 初始化（导入 Element Plus 样式）
```

## 三、样式导入示例

### 完整示例：bootstrap/index.ts

```typescript
// src/bootstrap/index.ts

// ========== 样式导入（必须在最前面）==========
// 1. 共享组件样式（包含所有 ITCSS 分层样式）
import '@btc/shared-components/styles/index.scss';

// 2. 应用全局样式
import '../styles/global.scss';

// 3. 应用主题样式（可选）
import '../styles/theme.scss';

// ========== 其他导入 ==========
import { createSubApp } from '@btc/shared-core';
// ...
```

### 完整示例：bootstrap/core/ui.ts

```typescript
// src/bootstrap/core/ui.ts

// Element Plus 基础样式
import 'element-plus/dist/index.css';

// Element Plus 暗色主题样式
import 'element-plus/theme-chalk/dark/css-vars.css';

// UnoCSS（如果使用）
import 'virtual:uno.css';

// 应用样式
import '../../styles/global.scss';
import '../../styles/theme.scss';

// 其他 UI 初始化代码...
```

### 完整示例：styles/global.scss

```scss
// src/styles/global.scss

// ========== 导入共享样式 ==========
// 使用 @use 确保样式被正确导入并应用到全局
@use '@btc/shared-components/styles/index.scss' as *;

// ========== 应用特定的全局样式 ==========

// 自定义 CSS 变量（如果需要）
:root {
  --app-custom-spacing: 12px;
}

// 全局重置（如果需要）
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
}

// 应用根元素样式
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

// 应用特定的组件样式
.app-custom-component {
  // 使用共享变量
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border: 1px solid var(--el-border-color);
}
```

## 四、使用共享组件和样式

### 1. 使用共享组件

导入后，可以直接使用共享组件，样式自动生效：

```vue
<template>
  <div class="your-page">
    <!-- 使用共享组件，样式自动生效 -->
    <BtcCrud :service="service">
      <BtcCrudRow>
        <BtcRefreshBtn />
        <BtcAddBtn />
      </BtcCrudRow>
      <BtcCrudRow>
        <BtcTable :columns="columns" />
      </BtcCrudRow>
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { BtcCrud, BtcCrudRow, BtcRefreshBtn, BtcAddBtn, BtcTable } from '@btc/shared-components';
</script>

<style lang="scss" scoped>
.your-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
```

### 2. 使用 CSS 变量

在组件样式中使用设计令牌：

```scss
// ✅ 推荐：使用 CSS 变量
.your-component {
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border: 1px solid var(--el-border-color);
  gap: var(--btc-crud-gap, 10px);
}

// ❌ 不推荐：硬编码值
.your-component {
  background: #ffffff;
  color: #303133;
  border: 1px solid #dcdfe6;
  gap: 10px;
}
```

### 3. 使用 BEM 命名规范

创建新组件时，遵循 BEM 命名规范：

```vue
<template>
  <div class="btc-your-component">
    <div class="btc-your-component__header">
      <span class="btc-your-component__title">标题</span>
    </div>
    <div class="btc-your-component__content">
      <div class="btc-your-component__item">内容项</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.btc-your-component {
  // 块样式
  display: flex;
  flex-direction: column;
  
  &__header {
    // 元素样式
    height: 40px;
  }
  
  &__title {
    // 元素样式
    color: var(--el-text-color-primary);
  }
  
  &__content {
    // 元素样式
    flex: 1;
  }
  
  &__item {
    // 元素样式
    padding: 10px;
    
    &.is-active {
      // 修饰符样式
      background: var(--el-color-primary-light-9);
    }
  }
}
</style>
```

## 五、页面组件样式规范

### 页面根元素样式

所有页面组件都应该有一个包裹容器，并设置正确的高度：

```vue
<template>
  <div class="your-page">
    <!-- 页面内容 -->
  </div>
</template>

<style lang="scss" scoped>
.your-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
```

**为什么需要包裹容器？**

1. 确保页面占据完整高度（`height: 100%`）
2. 符合全局样式规范（`.btc-page-content` 等选择器）
3. 避免样式冲突和布局问题

### 使用 BtcCrud 的页面

如果页面使用 `BtcCrud` 组件，必须添加包裹容器：

```vue
<template>
  <div class="your-page">
    <BtcCrud :service="service">
      <!-- CRUD 内容 -->
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import { BtcCrud } from '@btc/shared-components';
</script>

<style lang="scss" scoped>
.your-page {
  height: 100%;
  box-sizing: border-box;
}
</style>
```

## 六、主题切换支持

### 亮色/暗色主题

共享样式系统自动支持主题切换，无需额外配置：

1. **亮色主题**：使用 Element Plus 默认变量值
2. **暗色主题**：通过 `dark-theme.css` 覆盖变量值

### 自定义主题变量

如果应用需要自定义主题变量，在 `styles/theme.scss` 中定义：

```scss
// src/styles/theme.scss

// 亮色主题变量
:root {
  --app-primary-color: #409eff;
}

// 暗色主题变量
html.dark {
  --app-primary-color: #66b1ff;
}
```

## 七、常见问题

### Q1: 样式没有生效？

**检查清单**：
1. ✅ 是否在入口文件中导入了 `@btc/shared-components/styles/index.scss`？
2. ✅ 导入顺序是否正确（共享样式在最前面）？
3. ✅ 是否在 UI 初始化中导入了 Element Plus 样式？
4. ✅ 页面组件是否有包裹容器（`<div class="xxx-page">`）？

### Q2: 暗色主题不生效？

**检查清单**：
1. ✅ 是否导入了 `dark-theme.css`？
2. ✅ `dark-theme.css` 是否在 Element Plus 暗色样式之后导入？
3. ✅ HTML 元素是否有 `dark` 类名（`<html class="dark">`）？

### Q3: 样式冲突怎么办？

**解决方案**：
1. 检查类名是否有 `.btc-` 前缀（避免跨包冲突）
2. 遵循 BEM 命名规范（确保类名唯一）
3. 使用 CSS 变量而非硬编码值（确保主题切换正常）
4. 检查样式导入顺序（共享样式在前，应用样式在后）

### Q4: 如何覆盖共享组件样式？

**推荐方式**：

```scss
// ✅ 推荐：使用 :deep() 或具体选择器
.your-component {
  :deep(.btc-crud) {
    // 覆盖共享组件样式
    padding: 20px;
  }
}

// ✅ 或使用具体选择器
.your-component .btc-crud {
  padding: 20px;
}

// ❌ 不推荐：使用 !important（除非必要）
.your-component {
  :deep(.btc-crud) {
    padding: 20px !important;  // 尽量避免
  }
}
```

## 八、样式开发最佳实践

### 1. 使用 CSS 变量

```scss
// ✅ 推荐
.component {
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
}

// ❌ 不推荐
.component {
  color: #303133;
  background: #ffffff;
}
```

### 2. 遵循 BEM 命名

```scss
// ✅ 推荐
.btc-your-component { }
.btc-your-component__header { }
.btc-your-component__item.is-active { }

// ❌ 不推荐
.your-component { }  // 缺少 btc- 前缀
.your-component .header { }  // 应该使用 __header
```

### 3. 页面包裹容器

```vue
<!-- ✅ 推荐 -->
<template>
  <div class="your-page">
    <!-- 内容 -->
  </div>
</template>

<!-- ❌ 不推荐 -->
<template>
  <!-- 直接使用组件，没有包裹容器 -->
  <BtcCrud />
</template>
```

### 4. 样式文件组织

```
styles/
├── global.scss    # 全局样式（导入共享样式 + 应用特定样式）
├── theme.scss     # 主题样式（可选）
└── *.scss         # 其他样式文件
```

## 九、检查清单

新后台接入时，请确认：

- [ ] 在 `bootstrap/index.ts` 中导入了 `@btc/shared-components/styles/index.scss`
- [ ] 在 `bootstrap/core/ui.ts` 中导入了 Element Plus 样式
- [ ] 创建了 `styles/global.scss` 文件（如果需要应用特定样式）
- [ ] 所有页面组件都有包裹容器（`<div class="xxx-page">`）
- [ ] 使用 CSS 变量而非硬编码值
- [ ] 遵循 BEM 命名规范（`.btc-` 前缀）
- [ ] 暗色主题样式已导入（如果需要）

## 十、参考示例

参考 `apps/admin-app` 的样式集成方式：

- **入口文件**：`apps/admin-app/src/bootstrap/index.ts`
- **UI 初始化**：`apps/admin-app/src/bootstrap/core/ui.ts`
- **全局样式**：`apps/admin-app/src/styles/global.scss`
- **主题样式**：`apps/admin-app/src/styles/theme.scss`

## 十一、获取帮助

如果遇到样式问题：

1. 查看 [CSS_ARCHITECTURE.md](./CSS_ARCHITECTURE.md) 了解架构规范
2. 查看 [CSS_VARIABLES.md](./CSS_VARIABLES.md) 了解可用变量
3. 参考 `apps/admin-app` 的实现方式
4. 检查控制台是否有样式加载错误

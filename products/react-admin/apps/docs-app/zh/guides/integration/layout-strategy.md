---
title: "布局隐藏"
type: guide
project: btc-shopflow
owner: dev-team
created: 2025-10-13
updated: 2025-10-13
publish: true
tags: ["integration", "guides"]
sidebar_label: 布局隐藏
sidebar_order: 6
sidebar_group: integration
---
# 文档应用布局隐藏策略

## 需要隐藏的元素

| 元素 | 正常状态 | 文档模式 |
|------|---------|---------|
| 顶栏 - 汉堡菜单 | 显示 | **保留** |
| 顶栏 - Logo + 标题 | 显示 | **隐藏** |
| 顶栏 - 分隔线 | 显示 | **隐藏** |
| 顶栏 - 折叠按钮 | 显示 | **隐藏** |
| 顶栏 - 全局搜索 | 显示 | **保留** |
| 顶栏 - 主题/语言/用户 | 显示 | **保留** |
| 侧边栏（Sidebar）| 显示 | **隐藏** |
| Tabbar（Process）| 显示 | **隐藏** |
| 面包屑（Breadcrumb）| 显示 | **隐藏** |
| 内容区域（Content）| 有 margin | **无 margin，占满** |

---

## 隐藏方案

### 1. **侧边栏（Sidebar）** - CSS 控制

**方式**：`body.docs-mode` 类 + CSS 控制宽度
**位置**：`apps/admin-app/src/styles/global.scss`

```scss
body.docs-mode {
.app-layout__sidebar {
width: 0 !important;
opacity: 0;
visibility: hidden;
}
}
```

**为什么用 CSS**：
- 侧边栏组件复杂，包含菜单、折叠状态等
- CSS 控制简单可靠，不影响组件内部逻辑
- 可以精确控制宽度、透明度、可见性

### 2. **Tabbar（Process）** - v-show + CSS

**方式**：条件渲染 + CSS 高度控制
**位置**：`apps/admin-app/src/layout/index.vue`

```vue
<!-- Tabbar 组件 -->
<AppProcess v-show="!isDocsApp" />
```

**CSS 补充**：
```scss
body.docs-mode {
.app-process {
height: 0 !important;
overflow: hidden;
}
}
```

**为什么用 v-show + CSS**：
- `v-show` 保留 DOM 结构，避免组件重新创建
- CSS 控制高度，确保完全隐藏
- 双重保障，更可靠

### 3. **面包屑（Breadcrumb）** - v-if

**方式**：条件渲染
**位置**：`apps/admin-app/src/layout/index.vue`

```vue
<!-- 面包屑组件 -->
<AppBreadcrumb v-if="!isDocsApp" />
```

**为什么用 v-if**：
- 面包屑组件相对简单
- 完全移除 DOM，节省资源
- 避免样式冲突

### 4. **顶栏元素** - CSS 控制

**方式**：`body.docs-mode` 类 + 精确的 CSS 选择器
**位置**：`apps/admin-app/src/styles/global.scss`

```scss
body.docs-mode {
// 隐藏 Logo + 标题
.topbar__brand {
width: 64px !important; // 只保留汉堡菜单宽度
border-right: none !important; // 移除分隔线

.topbar__logo-content {
display: none !important; // 隐藏 Logo + 标题
}
}

// 隐藏折叠按钮
.topbar__left {
.btc-comm__icon:first-child {
display: none !important;
}
}
}
```

**为什么用 CSS**：
- 顶栏组件复杂，包含多个子元素
- 需要精确控制每个元素的显示/隐藏
- CSS 选择器可以精确定位

### 5. **内容区域** - CSS 控制

**方式**：移除 margin，占满整个空间
**位置**：`apps/admin-app/src/styles/global.scss`

```scss
body.docs-mode {
.app-layout__main {
width: 100% !important;
margin-left: 0 !important;
}

.app-layout__content {
padding: 0 !important;
height: 100%;
}
}
```

---

## 实现细节

### 1. 路由守卫触发

**位置**：`apps/admin-app/src/router/index.ts`

```typescript
router.beforeEach((to, from) => {
// 进入文档模式
if (to.path === '/docs' || to.path.startsWith('/docs/')) {
document.body.classList.add('docs-mode');
}

// 离开文档模式
if (from.path === '/docs' || from.path.startsWith('/docs/')) {
if (to.path !== '/docs' && !to.path.startsWith('/docs/')) {
document.body.classList.remove('docs-mode');
}
}
});
```

### 2. 布局状态管理

**位置**：`apps/admin-app/src/layout/index.vue`

```typescript
const isDocsApp = computed(() => {
const route = useRoute();
return route.path === '/docs' || route.path.startsWith('/docs/');
});
```

### 3. 样式优先级

使用 `!important` 确保样式优先级：
```scss
body.docs-mode {
.app-layout__sidebar {
width: 0 !important; // 覆盖组件内部样式
opacity: 0 !important;
visibility: hidden !important;
}
}
```

---

## 效果对比

### 正常模式
```
Topbar: [☰] Logo BTC SaaS [折叠] [搜索] [主题] [语言] [用户]
Body: Sidebar (255px) Tabbar (38px)
Breadcrumb (32px)
Content (margin: 10px)
```

### 文档模式
```
Topbar: [☰] [搜索] [主题] [语言] [用户]
Body: Content (full, 100vh - 64px)
```

---

## 测试验证

### 测试步骤

1. **进入文档模式**：
- 点击"文档中心"
- 验证：侧边栏、Tabbar、面包屑完全隐藏
- 验证：顶栏只显示汉堡菜单、搜索、主题、语言、用户

2. **内容区域**：
- 验证：内容区域占满整个空间
- 验证：VitePress iframe 正常显示

3. **退出文档模式**：
- 点击其他菜单项
- 验证：所有元素恢复正常显示

---

## 注意事项

### 1. 样式优先级
- 使用 `!important` 确保样式生效
- 避免被组件内部样式覆盖

### 2. 组件状态
- `v-show` 保留组件状态
- `v-if` 完全移除组件
- 根据组件复杂度选择合适的方案

### 3. 性能考虑
- CSS 控制比 JavaScript 控制性能更好
- 避免频繁的 DOM 操作

---

## 完成状态

- [x] 侧边栏隐藏（CSS 控制）
- [x] Tabbar 隐藏（v-show + CSS）
- [x] 面包屑隐藏（v-if）
- [x] 顶栏元素隐藏（CSS 控制）
- [x] 内容区域占满（CSS 控制）
- [x] 路由守卫触发
- [x] 样式优先级处理
- [x] 测试验证

**布局隐藏策略完成！文档模式下的界面更加简洁专注！**

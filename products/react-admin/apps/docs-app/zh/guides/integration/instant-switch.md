---
title: "瞬间切换"
type: guide
project: btc-shopflow
owner: dev-team
created: 2025-10-13
updated: 2025-10-13
publish: true
tags: ["integration", "guides"]
sidebar_label: 瞬间切换
sidebar_order: 4
sidebar_group: integration
---
# 文档应用瞬间切换优化

## 问题

在 iframe 已缓存的情况下，切换到文档应用时仍然有：
- 侧边栏宽度从 255px → 0 的过渡动画（0.2s）
- 内容区域宽度从 `calc(100% - 255px)` → `100%` 的过渡动画
- 用户能看到宽度变化的过程

## 解决方案：条件禁用动画

### 核心思路

**首次加载**（iframe 未缓存）：
- 保留 Loading 动画
- 保留侧边栏过渡动画（在 Loading 遮挡下，用户看不到）

**再次访问**（iframe 已缓存）：
- 无 Loading
- **禁用侧边栏和内容区的过渡动画**
- 瞬间切换，无任何延迟

---

## 实现

### 1. 路由守卫（`router/index.ts`）

```typescript
router.beforeEach((to, from) => {
if (to.path === '/docs') {
const docsIframeLoaded = (window as any).__DOCS_IFRAME_LOADED__ || false;

if (docsIframeLoaded) {
// iframe 已加载，瞬间切换（禁用动画）
document.body.classList.add('docs-mode-instant'); // 禁用动画
document.body.classList.add('docs-mode'); // 隐藏侧边栏

// 下一帧移除 instant 类，恢复正常动画
requestAnimationFrame(() => {
document.body.classList.remove('docs-mode-instant');
});
} else {
// iframe 未加载，显示 Loading（带动画）
// ...
}
}

// 离开文档时同样处理
if (from.path === '/docs' && to.path !== '/docs') {
const docsIframeLoaded = (window as any).__DOCS_IFRAME_LOADED__ || false;

if (docsIframeLoaded) {
// 瞬间恢复侧边栏（禁用动画）
document.body.classList.add('docs-mode-instant');
document.body.classList.remove('docs-mode');

requestAnimationFrame(() => {
document.body.classList.remove('docs-mode-instant');
});
}
}
});
```

---

### 2. 全局样式（`styles/global.scss`）

```scss
// 文档模式：隐藏左侧边栏
body.docs-mode {
.app-layout__sidebar {
width: 0 !important;
opacity: 0;
visibility: hidden;
}

.app-layout__main {
width: 100% !important;
}
}

// 瞬间切换模式：禁用所有过渡动画
body.docs-mode-instant {
.app-layout__sidebar,
.app-layout__main {
transition: none !important; // 禁用宽度过渡
}
}
```

---

## 执行流程

### 首次访问（带动画）

```
用户点击文档中心

路由守卫：iframe 未加载

显示 Loading（遮挡全屏）

添加 docs-mode 类

侧边栏宽度过渡：255px → 0（0.2s，在 Loading 下不可见）

内容区域宽度过渡：auto → 100%（0.2s，在 Loading 下不可见）

iframe 加载完成

隐藏 Loading

显示文档
```

### 再次访问（无动画）

```
用户点击文档中心

路由守卫：iframe 已加载

添加 docs-mode-instant 类

添加 docs-mode 类

侧边栏宽度瞬间变化：255px → 0（无动画）

内容区域宽度瞬间变化：auto → 100%（无动画）

下一帧移除 docs-mode-instant 类

秒显文档
```

---

## 效果对比

### 首次访问
| 时间 | 之前 | 现在 |
|------|------|------|
| 0ms | 点击 | 点击 |
| 0ms | 显示 Loading | 显示 Loading |
| 0-200ms | 侧边栏动画（Loading 遮挡） | 侧边栏动画（Loading 遮挡） |
| 2000ms | Loading 消失 | Loading 消失 |
| 2000ms | 显示文档 | 显示文档 |

### 再次访问
| 时间 | 之前 | 现在 |
|------|------|------|
| 0ms | 点击 | 点击 |
| 0ms | 显示 Loading | **无 Loading** |
| 0-200ms | 侧边栏动画 | **瞬间切换** |
| 200ms | 显示文档 | **立即显示** |

---

## 测试验证

### 测试步骤

1. **刷新浏览器**
2. **首次访问**：
- 点击"文档中心"
- 验证：显示 Loading，侧边栏在 Loading 遮挡下变化

3. **切换回主应用**：
- 点击"系统管理" > "用户列表"
- 验证：侧边栏恢复显示

4. **再次访问**（关键测试）：
- 点击"文档中心"
- 验证：
- **无 Loading**
- **侧边栏瞬间消失（无动画）**
- **文档立即显示**
- **无任何宽度变化过程**

5. **快速切换**：
- 快速在"文档中心"和"用户列表"之间切换多次
- 验证：瞬间切换，无任何动画延迟

---

## 最终效果

- **首次访问**：Loading 遮挡，体验良好
- **再次访问**：瞬间切换，秒显文档
- **快速切换**：无动画延迟，完美体验

**这就是"预加载 + 瞬间切换"的最佳实践！**

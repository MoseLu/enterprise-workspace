# Speculation Rules API 引入评估

## 概述

本文档评估在当前项目中引入 Speculation Rules API 的可行性和必要性。

## Speculation Rules API 简介

Speculation Rules API 是一个浏览器原生 API，允许开发者声明性地告诉浏览器哪些链接应该在后台预渲染或预获取。用户提到的基础使用方式：

```html
<script type="speculationrules">
{
  "prerender": [{ "source": "document", "eagerness": "moderate" }]
}
</script>
```

配置后，浏览器会在用户悬停或聚焦链接时自动预渲染目标页面。

## 项目特征分析

### 1. 应用架构
- **类型**: Vue 3 SPA（单页应用）
- **路由模式**: Vue Router with `createWebHistory` (History 模式)
- **架构模式**: Monorepo + 微前端（qiankun）
- **多应用**: 包含多个子应用（admin, logistics, engineering, quality, production, finance, operations, system, dashboard, personnel 等）

### 2. 路由特性
- 使用客户端路由（Client-side Routing）
- 路由切换通过 Vue Router 进行，不涉及完整的页面重新加载
- 页面切换时通过 JavaScript 动态加载组件和更新 DOM

## 兼容性分析

### 浏览器支持情况（截至 2024 年）
- ✅ **Chrome/Edge** (Chromium 内核): 支持
- ❌ **Firefox**: 不支持
- ❌ **Safari**: 不支持（仍在考虑中）
- ❌ **移动端浏览器**: 支持有限

### 兼容性风险
1. **用户覆盖率**: 仅 Chromium 内核浏览器支持，覆盖率约 60-70%（中国市场）
2. **移动端支持**: 移动端浏览器支持有限，对移动应用收益较小
3. **渐进增强**: 即使不支持，也不会导致功能问题，属于渐进增强特性

## 适用性分析

### ❌ **不适合引入的主要原因**

#### 1. **SPA 架构不匹配**
Speculation Rules API 主要用于**多页应用（MPA）**的页面预渲染。而本项目是**单页应用（SPA）**：
- SPA 的路由切换是客户端行为，不涉及完整的 HTTP 请求和页面解析
- 浏览器无法预渲染 Vue Router 的虚拟路由
- Speculation Rules API 只能预渲染真实的 URL（需要服务器返回完整 HTML）

#### 2. **微前端架构复杂性**
项目使用 qiankun 微前端架构：
- 子应用之间通过 JavaScript 动态加载
- 跨子应用路由切换依赖 qiankun 的路由管理
- Speculation Rules API 无法预加载 JavaScript bundle 和初始化子应用状态

#### 3. **路由预加载已有方案**
Vue Router 已经提供了更合适的预加载机制：
- **路由懒加载**: `component: () => import('@/views/Page.vue')`
- **预加载**: Vue Router 会自动预加载路由组件
- **代码分割**: 配合 Vite 等构建工具实现代码分割和按需加载

#### 4. **实际收益有限**
即使技术上可行，收益也有限：
- SPA 的路由切换本身已经很快（DOM 更新 + 组件切换）
- 预渲染 Vue 组件需要执行 JavaScript，复杂度高
- 可能造成不必要的资源消耗（预渲染不一定会被访问的页面）

## 如果一定要使用的场景

如果项目中存在**真正的多页应用部分**（非 SPA 路由），可以考虑在以下场景使用：

1. **独立的多页应用入口**
   - 例如：独立的文档站点、帮助页面等
   - 这些页面是真实的 HTML 页面，不是 Vue Router 路由

2. **外部链接预渲染**
   - 链接到外部网站时，可以预渲染外部页面
   - 但这通常不在当前项目范围内

3. **混合架构中的静态页面**
   - 如果某些页面是服务端渲染（SSR）的静态 HTML
   - 可以考虑使用 Speculation Rules API 预渲染这些页面

## 替代方案建议

### 1. **优化 Vue Router 路由加载**
```typescript
// 使用路由预加载策略
const router = createRouter({
  history: createWebHistory(),
  routes,
  // Vue Router 会自动预加载路由组件
});

// 或者使用路由级别的预加载
router.beforeEach((to, from, next) => {
  // 预加载目标路由的组件
  if (to.matched.length === 0) {
    // 预加载逻辑
  }
  next();
});
```

### 2. **使用 Resource Hints**
```html
<!-- 预连接关键域名 -->
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- 预加载关键资源 -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
```

### 3. **代码分割和懒加载优化**
- 使用动态 import 进行代码分割
- 合理配置 chunk 大小
- 使用 Vite 的预加载策略

### 4. **缓存策略优化**
- Service Worker 缓存
- HTTP 缓存策略
- 浏览器缓存优化

## 结论

### ❌ **不建议引入**

**理由**:
1. **架构不匹配**: SPA + 微前端架构，Speculation Rules API 无法发挥作用
2. **兼容性有限**: 仅 Chromium 内核支持，用户覆盖率不够
3. **收益有限**: SPA 路由切换本身已很快，预渲染收益不明显
4. **已有方案**: Vue Router 的预加载机制更适合 SPA 应用

### ✅ **建议的优化方向**

1. **优化 Vue Router 路由加载策略**
2. **使用 Resource Hints 优化关键资源加载**
3. **优化代码分割和打包策略**
4. **优化缓存策略（Service Worker、HTTP 缓存）**
5. **使用 Vue Router 的路由预加载机制**

## 参考资源

- [Speculation Rules API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API)
- [Chrome 开发文档 - Speculation Rules](https://developer.chrome.com/docs/prerender/speculation-rules/)
- [Vue Router 性能优化](https://router.vuejs.org/zh/guide/advanced/lazy-loading.html)

---

**评估日期**: 2024 年
**评估人**: AI Assistant
**项目**: btc-shopflow-monorepo

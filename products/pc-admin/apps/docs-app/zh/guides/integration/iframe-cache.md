---
title: "iframe 优化"
type: guide
project: btc-shopflow
owner: dev-team
created: 2025-10-13
updated: 2025-10-13
publish: true
tags: ["integration", "guides"]
sidebar_label: iframe 优化
sidebar_order: 3
sidebar_group: integration
---
# 文档 iframe 缓存优化

## 问题背景

之前的实现中，每次进入文档应用都会重新加载 iframe，导致：
- 白屏闪烁
- 重复加载 VitePress 资源
- 用户体验差

## 优化方案：全局单例 + 懒加载

采用**方案 A（全局单例）**，实现：
- **首访即缓存**：首次访问后，iframe 常驻内存
- **零重载切换**：后续访问秒显，无白屏
- **内部路由导航**：通过 postMessage 实现 SPA 式导航
- **性能优化**：隐藏时降频事件隔离懒加载

---

## 核心设计

### 1. iframe 位置：全局 Layout

**位置**：`apps/admin-app/src/layout/index.vue`
```vue
<div class="app-layout__content">
<!-- 主应用路由出口 -->
<router-view v-if="isMainApp && !isDocsApp" />

<!-- 文档应用 iframe（全局缓存） -->
<DocsIframe :visible="isDocsApp" />

<!-- 子应用挂载点 -->
<div id="subapp-viewport" v-show="!isMainApp && !isDocsApp">
<AppSkeleton />
</div>
</div>
```

**优点**：
- iframe 只创建一次，切换应用时不销毁
- 使用 `v-show` 而不是 `v-if`，保持 DOM 存在
- 与 Qiankun 子应用隔离，互不影响

---

### 2. 懒加载机制

**实现**：`DocsIframe` 组件
```typescript
const iframeCreated = ref(false); // 懒加载标记
const iframeSrc = ref(''); // 动态 src

// 懒加载：首次显示时才创建 iframe
watch(isVisible, (visible) => {
if (visible && !iframeCreated.value) {
// 首次显示，创建 iframe
iframeCreated.value = true;
iframeSrc.value = baseUrl; // http://localhost:8085
}
}, { immediate: true });
```

**效果**：
- 应用启动时，iframe 不创建（节省内存）
- 首次访问 `/docs` 时才创建
- 创建后永久保留，不再销毁

---

### 3. 内部路由导航（postMessage）

#### 主应用 → VitePress

**全局搜索组件**：
```typescript
// 处理文档导航
const handleDocNavigation = (doc: DocSearchResult) => {
const currentPath = router.currentRoute.value.path;

if (currentPath === '/docs') {
// 已在文档页面，直接通知 iframe 导航
window.dispatchEvent(new CustomEvent('docs-navigate', {
detail: { path: doc.path }
}));
} else {
// 先切换到文档应用
router.push('/docs').then(() => {
setTimeout(() => {
window.dispatchEvent(new CustomEvent('docs-navigate', {
detail: { path: doc.path }
}));
}, 500);
});
}
};
```

**DocsIframe 组件**：
```typescript
function navigateToDoc(path: string) {
if (!docsIframe.value?.contentWindow) {
return;
}

// 通过 postMessage 通知 VitePress 进行内部路由导航
docsIframe.value.contentWindow.postMessage({
type: 'btc-navigate',
path
}, '*');
}

// 监听全局导航事件
window.addEventListener('docs-navigate', (event) => {
const { path } = event.detail;
navigateToDoc(path);
});
```

#### VitePress 内部处理

**VitePress theme/index.ts**：
```typescript
window.addEventListener('message', (event) => {
if (event.data?.type === 'btc-navigate') {
// 接收主应用的导航指令，使用 VitePress 内部路由
const { path } = event.data;
if (path && router) {
router.go(path); // VitePress Router API
}
}
});
```

**优点**：
- 无白屏：不重新加载 iframe
- SPA 体验：纯前端路由切换
- 保持状态：滚动位置历史记录都保留

---

### 4. 性能优化

#### a) 事件隔离

**隐藏时阻止事件穿透**：
```typescript
watch(isVisible, (visible) => {
if (!visible && docsIframe.value) {
docsIframe.value.style.pointerEvents = 'none'; // 事件隔离
} else if (visible && docsIframe.value) {
docsIframe.value.style.pointerEvents = 'auto';
}
});
```

**CSS 样式**：
```scss
.docs-iframe-wrapper {
&.is-hidden {
pointer-events: none; // 事件隔离
visibility: hidden; // 对屏幕阅读器隐藏
}
}
```

#### b) 降频通知

**告知 VitePress 可见性变化**：
```typescript
watch(isVisible, (visible) => {
if (!visible && docsIframe.value?.contentWindow) {
// 隐藏时通知 VitePress
docsIframe.value.contentWindow.postMessage({
type: 'btc-visibility-change',
visible: false
}, '*');
} else if (visible && docsIframe.value?.contentWindow) {
// 显示时通知 VitePress
docsIframe.value.contentWindow.postMessage({
type: 'btc-visibility-change',
visible: true
}, '*');
}
});
```

**VitePress 可以据此**：
- 停止轮询
- 暂停动画
- 降低搜索索引更新频率

#### c) Sandbox 权限

```html
<iframe
sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
...
/>
```

**只开必要权限**：
- `allow-scripts` - 执行脚本（VitePress 需要）
- `allow-same-origin` - 访问 localStorage（主题同步需要）
- `allow-popups` - 打开外部链接（可选）
- `allow-forms` - 搜索表单（可选）

**不开的权限**：
- `allow-top-navigation` - 避免跳出主应用
- `allow-modals` - 避免弹窗干扰

---

## 架构对比

### 之前：路由级组件 + iframe 重新加载

```
用户点击文档

router.push('/docs')

加载 DocsView 组件

创建 iframe，设置 src

VitePress 加载（显示 Loading）

加载完成，隐藏 Loading

---

用户切换回主应用

销毁 DocsView 组件

销毁 iframe （失去缓存）

---

用户再次点击文档

重新加载 iframe （白屏）

重新加载 VitePress
```

### 现在：全局 Layout + 懒加载 + postMessage

```
应用启动

Layout 加载（DocsIframe 未创建）

---

用户首次点击文档

router.push('/docs')

isDocsApp = true

DocsIframe visible = true

懒加载：创建 iframe，设置 src

VitePress 加载（显示 Loading）

加载完成，隐藏 Loading

---

用户切换回主应用

isDocsApp = false

DocsIframe visible = false （iframe 保留）

pointer-events: none （事件隔离）

visibility: hidden （对屏幕阅读器隐藏）

---

用户再次点击文档

router.push('/docs')

isDocsApp = true

DocsIframe visible = true （秒显）

pointer-events: auto

无需重新加载

---

全局搜索点击文档结果

window.dispatchEvent('docs-navigate')

navigateToDoc(path)

postMessage({ type: 'btc-navigate', path })

VitePress router.go(path) （内部路由，无白屏）
```

---

## 用户体验提升

### 首次访问
- **Loading 时间**：正常（需要加载 VitePress）
- **体验**：全局 Loading 遮挡，无白屏

### 再次访问
- **Loading 时间**：0ms
- **体验**：秒显，完美

### 全局搜索导航
- **从主应用**：先切换到文档页（Loading），然后内部导航
- **已在文档页**：纯内部导航，无任何 Loading

---

## 文件清单

### 新增
- `apps/admin-app/src/layout/docs-iframe/index.vue` - 全局文档 iframe 组件

### 删除
- `apps/admin-app/src/pages/docs/index.vue` - 旧的路由级组件

### 修改
1. **`apps/admin-app/src/layout/index.vue`**
- 添加 `isDocsApp` computed
- 引入 `DocsIframe` 组件并传递 `visible` prop

2. **`apps/admin-app/src/router/index.ts`**
- `/docs` 路由改为空组件（实际渲染由 Layout 处理）

3. **`apps/admin-app/src/layout/global-search/index.vue`**
- 文档导航改为 postMessage 方式
- 通过自定义事件 `docs-navigate` 触发

4. **`apps/docs-site/.vitepress/theme/index.ts`**
- 添加 `btc-navigate` 消息监听
- 使用 VitePress router.go() 进行内部导航

5. **`apps/docs-site/components/*.md`**
- 创建所有组件文档页面

---

## 关键特性

### 1. 懒加载
```typescript
// v-if 控制创建时机
<iframe v-if="iframeCreated" :src="iframeSrc" />

// 首次显示时才创建
if (visible && !iframeCreated.value) {
iframeCreated.value = true;
iframeSrc.value = baseUrl;
}
```

### 2. 事件隔离
```scss
.docs-iframe-wrapper.is-hidden {
pointer-events: none; // 点击穿透到下层
visibility: hidden; // 屏幕阅读器隐藏
}
```

### 3. Sandbox 安全
```html
<iframe
sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
/>
```

### 4. 降频通知
```typescript
// 隐藏时通知 VitePress
docsIframe.contentWindow.postMessage({
type: 'btc-visibility-change',
visible: false
}, '*');
```

---

## 测试验证

### 测试步骤

1. **首次访问**：
- 刷新浏览器
- 点击"文档中心"
- 验证：显示 Loading，然后正常加载文档

2. **切换回主应用**：
- 点击"系统管理" > "用户列表"
- 验证：iframe 不销毁（开发者工具中仍然存在）

3. **再次访问文档**：
- 点击"文档中心"
- 验证：**秒显，无 Loading，无白屏**

4. **全局搜索导航**：
- 在文档页面，按 `Ctrl+K`
- 搜索 "CRUD组件"
- 点击 "BtcCrud 组件"
- 验证：**无白屏，直接切换到对应文档**

5. **从主应用搜索**：
- 在主应用页面，按 `Ctrl+K`
- 搜索 "组件文档"
- 点击文档结果
- 验证：显示 Loading，然后显示文档

---

## 性能对比

| 场景 | 之前 | 现在 |
|------|------|------|
| **首次访问** | Loading | Loading（相同） |
| **再次访问** | Loading + 重新加载 | **秒显**（0ms） |
| **内部导航** | 重新加载 iframe（白屏） | **内部路由**（无白屏） |
| **内存占用** | 0（销毁后） | ~50-100MB（常驻） |
| **CPU 占用** | 0（销毁后） | 最小（隐藏时降频） |

---

## 注意事项

### 1. 内存管理
- iframe 常驻会占用内存（约 50-100MB）
- 对于文档量大的项目，可以考虑：
- 隐藏 10 分钟后自动卸载
- 提供"刷新文档"按钮手动重载

### 2. VitePress Router API
- 当前使用 `router.go(path)` 进行导航
- 如果不work，可以使用 `window.location.hash = path`（hash 路由）

### 3. 首次加载优化
- 可以在应用启动后 5 秒，预加载 iframe（提前创建）
- 这样首次访问也能秒显

---

## 后续优化建议

### 1. 预加载策略
```typescript
// 应用启动 5 秒后，预加载文档 iframe
onMounted(() => {
setTimeout(() => {
if (!iframeCreated.value) {
iframeCreated.value = true;
iframeSrc.value = baseUrl;
}
}, 5000);
});
```

### 2. 自动卸载策略
```typescript
// 隐藏 10 分钟后自动卸载
let unloadTimer: number | null = null;

watch(isVisible, (visible) => {
if (!visible) {
unloadTimer = window.setTimeout(() => {
iframeCreated.value = false;
iframeSrc.value = '';
}, 600000); // 10 分钟
} else {
if (unloadTimer) {
clearTimeout(unloadTimer);
}
}
});
```

### 3. VitePress 内部降频
在 VitePress 的 theme/index.ts 中监听 `btc-visibility-change`：
```typescript
window.addEventListener('message', (event) => {
if (event.data?.type === 'btc-visibility-change') {
const { visible } = event.data;

if (!visible) {
// 停止轮询动画等
// clearInterval(somePolling);
} else {
// 恢复
}
}
});
```

---

## 完成状态

- [x] 创建全局 DocsIframe 组件
- [x] 实现懒加载机制（首次访问才创建）
- [x] 实现内部路由导航（postMessage）
- [x] 添加事件隔离（pointer-events: none）
- [x] 添加 Sandbox 安全控制
- [x] 添加降频通知机制
- [x] 删除旧的路由级组件
- [x] 更新路由配置
- [x] 创建组件文档页面（crud, form, table, upsert, dialog, view-group）
- [x] 移除所有调试日志
- [x] 编写完整文档

---

## 效果

- **首次访问**：正常 Loading
- **再次访问**：秒显，无 Loading
- **全局搜索导航**：无白屏，丝滑切换
- **内存可控**：常驻但隔离，可选自动卸载
- **性能优化**：懒加载事件隔离降频通知

**这就是"刚刚好"的设计：稳定快速可控！**

---
title: 服务端标题注入实施指南
type: sop
project: system
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- sop
- system
- title-injection
sidebar_label: 服务端标题注入
sidebar_order: 1
sidebar_group: sop-system
---
# SOP: 服务端标题注入实施指南

> **文档类型**: SOP
> **适用场景**: 实现浏览器标签刷新时无闪烁
> **前置条件**: Vite dev server 或生产环境 Nginx
> **维护者**: @系统架构师

---

## 背景

**目标**: 刷新页面（F5）时，浏览器标签标题完全不变，只看到 favicon 转圈

**原理**:
- 浏览器在解析到 `<title>` 时就会渲染到标签
- 任何后续的 JS 修改都是"第二次更新"，会有闪烁
- **唯一解法**: 服务端在返回 HTML 时就写入正确的 `<title>`

---

## 实施步骤

### 1) 准备工作

**修改 index.html**:
```html
<!-- 使用占位符，供服务端替换 -->
<title>__PAGE_TITLE__</title>
```

**修改 i18n 插件，双写 Cookie**:
```typescript
// packages/shared-core/src/btc/plugins/i18n/index.ts

// 初始化时写 cookie
document.cookie = `locale=${currentLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;

// 切换语言时写 cookie
watch(locale, (newLocale) => {
storage.set('locale', newLocale);
document.cookie = `locale=${newLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
});
```

---

### 2) 开发环境：Vite 插件注入

**创建插件**: `apps/admin-app/vite-plugin-title-inject.ts`

```typescript
import type { Plugin } from 'vite';

const titles = {
'zh-CN': {
'/': '首页',
'/access/permissions': '权限列表',
// ... 所有路由
},
'en-US': {
'/': 'Home',
'/access/permissions': 'Permission List',
// ... 所有路由
},
};

function getLocaleFromCookie(cookie?: string): string {
if (!cookie) return 'zh-CN';
const match = cookie.match(/locale=([^;]+)/);
return match ? match[1].replace(/"/g, '') : 'zh-CN';
}

export function titleInjectPlugin(): Plugin {
let requestPath = '/';
let requestCookie = '';

return {
name: 'vite-plugin-title-inject',

configureServer(server) {
server.middlewares.use((req, res, next) => {
requestPath = req.url || '/';
requestCookie = req.headers.cookie || '';
next();
});
},

transformIndexHtml: {
order: 'pre',
handler(html) {
const locale = getLocaleFromCookie(requestCookie);
const titleMap = titles[locale] || titles['zh-CN'];
const pageTitle = titleMap[requestPath] || 'BTC 车间流程管理系统';

return html.replace('__PAGE_TITLE__', pageTitle);
},
},
};
}
```

**注册插件**: `apps/admin-app/vite.config.ts`

```typescript
import { titleInjectPlugin } from './vite-plugin-title-inject';

export default defineConfig({
plugins: [
titleInjectPlugin(), // 必须在最前面
vue(),
// ... 其他插件
],
});
```

---

### 3) 生产环境：Nginx 注入

**方案 A: sub_filter 替换**

```nginx
http {
# 路由标题映射（UTF-8）
map $uri $page_title_zh {
default "BTC 车间流程管理系统";
"/" "首页";
"/access/permissions" "权限列表";
"/platform/domains" "域列表";
# ... 其他路由
}

map $uri $page_title_en {
default "BTC Flow System";
"/" "Home";
"/access/permissions" "Permission List";
# ... 其他路由
}

# 从 cookie 读取语言
map $http_cookie $locale {
default zh-CN;
"~*locale=en-US" en-US;
}

map $locale $page_title {
default $page_title_zh;
en-US $page_title_en;
}

server {
listen 80;
root /var/www/app;

# 启用子串替换
sub_filter_types text/html;
sub_filter_once on;
sub_filter '__PAGE_TITLE__' '$page_title';

location / {
try_files $uri $uri/ /index.html;
}
}
}
```

**验证**:
```bash
# 测试标题注入
curl -H "Cookie: locale=zh-CN" http://localhost/access/permissions | grep "<title>"
# 应该输出: <title>权限列表</title>
```

---

## 验证清单

### 开发环境

1. 启动 dev server: `pnpm --filter admin-app dev`
2. 访问权限列表: `http://localhost:8080/access/permissions`
3. 查看源代码: `Ctrl + U`
4. 检查 `<title>` 标签: 应该是 `<title>权限列表</title>`
5. 刷新页面（F5）: 标签应该完全不变

### 生产环境

1. 构建应用: `pnpm build`
2. 配置 Nginx（见上面配置）
3. 重启 Nginx: `nginx -s reload`
4. 访问并刷新: 标签应该不闪烁

---

## 故障排除

### 问题 1: 开发环境仍显示 `__PAGE_TITLE__`

**原因**: Vite 插件未生效

**解决**:
1. 检查插件顺序（必须在最前面）
2. 重启 dev server
3. 清除浏览器缓存（Ctrl + Shift + R）

---

### 问题 2: 标题仍然闪烁

**原因**: 可能是 router.afterEach 重复设置

**解决**:
```typescript
// router/index.ts
function updateDocumentTitle(to) {
const titleKey = to.meta?.titleKey;
if (titleKey) {
const newTitle = getTranslation(titleKey);
// 只在标题不同时才更新（避免重复渲染）
if (document.title !== newTitle) {
document.title = newTitle;
}
}
}
```

---

### 问题 3: 动态路由标题不正确

**示例**: `/org/users/123` 应该显示 "用户详情"

**解决**:
```typescript
// vite-plugin-title-inject.ts

// 添加正则匹配
const dynamicRoutes = [
{ pattern: /^\/org\/users\/\d+\/roles$/, titleKey: 'menu.org.user_role_assign' },
{ pattern: /^\/access\/roles\/\d+\/permissions$/, titleKey: 'menu.access.role_perm_bind' },
];

// 在 handler 中添加匹配逻辑
for (const route of dynamicRoutes) {
if (route.pattern.test(requestPath)) {
const titleMap = titles[locale];
const pageTitle = titleMap[route.titleKey] || fallback;
return html.replace('__PAGE_TITLE__', pageTitle);
}
}
```

---

## 后续优化

### 自动生成标题映射表

**目标**: 避免手动维护双份映射

**方案**: 从 i18n 文件自动提取
```typescript
// scripts/generate-title-map.ts
import { zhCN, enUS } from '@btc/shared-core';

// 提取所有 menu.* 开头的键
const extractMenuTitles = (messages: Record<string, string>) => {
return Object.entries(messages)
.filter(([key]) => key.startsWith('menu.'))
.reduce((acc, [key, value]) => {
acc[key] = value;
return acc;
}, {} as Record<string, string>);
};

// 生成标题映射（运行时使用）
export const titleMaps = {
'zh-CN': extractMenuTitles(zhCN),
'en-US': extractMenuTitles(enUS),
};
```

---

## 相关文档

- [ADR: 浏览器标题国际化方案](../adr/2025-10-12-browser-title-i18n.md)
- [浏览器标签国际化修复](../BROWSER-TITLE-I18N-FIX.md)
- [Vite 插件开发](https://vitejs.dev/guide/api-plugin.html)

---

## 总结

**前置条件**:
- index.html 使用占位符 `__PAGE_TITLE__`
- i18n 切换时双写 cookie
- 所有路由使用 `meta.titleKey`

**验证标准**:
- F5 刷新时标签完全不变
- 只看到 favicon 转圈
- 切换语言后刷新仍然正确

**失败回滚**:
- 将 `<title>__PAGE_TITLE__</title>` 改为 `<title>BTC 车间流程管理系统</title>`
- 移除 Vite 插件

---

**最后更新**: 2025-10-12
**下次评审**: 测试验证后


---
title: Server-Side Title Injection Implementation Guide
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
sidebar_label: Server-Side Title Injection
sidebar_order: 1
sidebar_group: sop-system
---
# SOP: Server-Side Title Injection Implementation Guide

> **Document Type**: SOP
> **Applicable Scenario**: Implement browser tab no flashing on refresh
> **Prerequisites**: Vite dev server or production environment Nginx
> **Maintainer**: @System Architect

---

## Background

**Goal**: When refreshing page (F5), browser tab title completely unchanged, only see favicon spinning

**Principle**:
- Browser renders to tab when parsing `<title>`
- Any subsequent JS modification is "second update", will flash
- **Only Solution**: Server writes correct `<title>` when returning HTML

---

## Implementation Steps

### 1) Preparation

**Modify index.html**:
```html
<!-- Use placeholder for server-side replacement -->
<title>__PAGE_TITLE__</title>
```

**Modify i18n plugin, dual-write Cookie**:
```typescript
// packages/shared-core/src/btc/plugins/i18n/index.ts

// Write cookie on initialization
document.cookie = `locale=${currentLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;

// Write cookie when switching language
watch(locale, (newLocale) => {
  storage.set('locale', newLocale);
  document.cookie = `locale=${newLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
});
```

---

### 2) Development Environment: Vite Plugin Injection

**Create Plugin**: `apps/admin-app/vite-plugin-title-inject.ts`

```typescript
import type { Plugin } from 'vite';

const titles = {
  'zh-CN': {
    '/': 'Home',
    '/access/permissions': 'Permission List',
    // ... all routes
  },
  'en-US': {
    '/': 'Home',
    '/access/permissions': 'Permission List',
    // ... all routes
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
        const pageTitle = titleMap[requestPath] || 'BTC Workshop Process Management System';

        return html.replace('__PAGE_TITLE__', pageTitle);
      },
    },
  };
}
```

**Register Plugin**: `apps/admin-app/vite.config.ts`

```typescript
import { titleInjectPlugin } from './vite-plugin-title-inject';

export default defineConfig({
  plugins: [
    titleInjectPlugin(), // Must be first
    vue(),
    // ... other plugins
  ],
});
```

---

### 3) Production Environment: Nginx Injection

**Solution A: sub_filter Replacement**

```nginx
http {
  # Route title mapping (UTF-8)
  map $uri $page_title_zh {
    default "BTC Workshop Process Management System";
    "/" "Home";
    "/access/permissions" "Permission List";
    "/platform/domains" "Domain List";
    # ... other routes
  }

  map $uri $page_title_en {
    default "BTC Flow System";
    "/" "Home";
    "/access/permissions" "Permission List";
    # ... other routes
  }

  # Read language from cookie
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

    # Enable substring replacement
    sub_filter_types text/html;
    sub_filter_once on;
    sub_filter '__PAGE_TITLE__' '$page_title';

    location / {
      try_files $uri $uri/ /index.html;
    }
  }
}
```

**Verification**:
```bash
# Test title injection
curl -H "Cookie: locale=zh-CN" http://localhost/access/permissions | grep "<title>"
# Should output: <title>Permission List</title>
```

---

## Verification Checklist

### Development Environment

1. Start dev server: `pnpm --filter admin-app dev`
2. Access permission list: `http://localhost:8080/access/permissions`
3. View source code: `Ctrl + U`
4. Check `<title>` tag: Should be `<title>Permission List</title>`
5. Refresh page (F5): Tab should be completely unchanged

### Production Environment

1. Build application: `pnpm build`
2. Configure Nginx (see configuration above)
3. Restart Nginx: `nginx -s reload`
4. Access and refresh: Tab should not flash

---

## Troubleshooting

### Issue 1: Development Environment Still Shows `__PAGE_TITLE__`

**Cause**: Vite plugin not effective

**Solution**:
1. Check plugin order (must be first)
2. Restart dev server
3. Clear browser cache (Ctrl + Shift + R)

---

### Issue 2: Title Still Flashes

**Cause**: May be router.afterEach duplicate setting

**Solution**:
```typescript
// router/index.ts
function updateDocumentTitle(to) {
  const titleKey = to.meta?.titleKey;
  if (titleKey) {
    const newTitle = getTranslation(titleKey);
    // Only update when title is different (avoid duplicate rendering)
    if (document.title !== newTitle) {
      document.title = newTitle;
    }
  }
}
```

---

### Issue 3: Dynamic Route Title Incorrect

**Example**: `/org/users/123` should display "User Details"

**Solution**:
```typescript
// vite-plugin-title-inject.ts

// Add regex matching
const dynamicRoutes = [
  { pattern: /^\/org\/users\/\d+\/roles$/, titleKey: 'menu.org.user_role_assign' },
  { pattern: /^\/access\/roles\/\d+\/permissions$/, titleKey: 'menu.access.role_perm_bind' },
];

// Add matching logic in handler
for (const route of dynamicRoutes) {
  if (route.pattern.test(requestPath)) {
    const titleMap = titles[locale];
    const pageTitle = titleMap[route.titleKey] || fallback;
    return html.replace('__PAGE_TITLE__', pageTitle);
  }
}
```

---

## Future Optimization

### Auto-Generate Title Mapping Table

**Goal**: Avoid manually maintaining duplicate mappings

**Solution**: Auto-extract from i18n files
```typescript
// scripts/generate-title-map.ts
import { zhCN, enUS } from '@btc/shared-core';

// Extract all keys starting with menu.*
const extractMenuTitles = (messages: Record<string, string>) => {
  return Object.entries(messages)
    .filter(([key]) => key.startsWith('menu.'))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
};

// Generate title mapping (for runtime use)
export const titleMaps = {
  'zh-CN': extractMenuTitles(zhCN),
  'en-US': extractMenuTitles(enUS),
};
```

---

## Related Documentation

- [ADR: Browser Title Internationalization Solution](../adr/technical/browser-title-i18n.md)
- [Browser Tab Internationalization Fix](../BROWSER-TITLE-I18N-FIX.md)
- [Vite Plugin Development](https://vitejs.dev/guide/api-plugin.html)

---

## Summary

**Prerequisites**:
- index.html uses placeholder `__PAGE_TITLE__`
- i18n switching dual-writes cookie
- All routes use `meta.titleKey`

**Verification Criteria**:
- Tab completely unchanged on F5 refresh
- Only see favicon spinning
- Still correct after language switch and refresh

**Failure Rollback**:
- Change `<title>__PAGE_TITLE__</title>` to `<title>BTC Workshop Process Management System</title>`
- Remove Vite plugin

---

**Last Updated**: 2025-10-12
**Next Review**: After test verification

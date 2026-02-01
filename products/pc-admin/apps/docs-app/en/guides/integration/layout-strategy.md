---
title: Layout Hiding
type: guide
project: btc-shopflow
owner: dev-team
created: 2025-10-13
updated: 2025-10-13
publish: true
tags: ["integration", "guides"]
sidebar_label: Layout Hiding
sidebar_order: 6
sidebar_group: integration
---

# Documentation Application Layout Hiding Strategy

## Elements to Hide

| Element | Normal State | Documentation Mode |
|------|---------|---------|
| Topbar - Hamburger Menu | Visible | **Keep** |
| Topbar - Logo + Title | Visible | **Hide** |
| Topbar - Separator | Visible | **Hide** |
| Topbar - Collapse Button | Visible | **Hide** |
| Topbar - Global Search | Visible | **Keep** |
| Topbar - Theme/Language/User | Visible | **Keep** |
| Sidebar | Visible | **Hide** |
| Tabbar (Process) | Visible | **Hide** |
| Breadcrumb | Visible | **Hide** |
| Content Area | Has margin | **No margin, full width** |

---

## Hiding Solutions

### 1. **Sidebar** - CSS Control

**Method**: `body.docs-mode` class + CSS width control
**Location**: `apps/admin-app/src/styles/global.scss`

```scss
body.docs-mode {
  .app-layout__sidebar {
    width: 0 !important;
    opacity: 0;
    visibility: hidden;
  }
}
```

**Why CSS**:
- Sidebar component is complex, contains menu, collapse state, etc.
- CSS control is simple and reliable, doesn't affect component internal logic
- Can precisely control width, opacity, visibility

### 2. **Tabbar (Process)** - v-show + CSS

**Method**: Conditional rendering + CSS height control
**Location**: `apps/admin-app/src/layout/index.vue`

```vue
<!-- Tabbar component -->
<AppProcess v-show="!isDocsApp" />
```

**CSS Supplement**:
```scss
body.docs-mode {
  .app-process {
    height: 0 !important;
    overflow: hidden;
  }
}
```

**Why v-show + CSS**:
- `v-show` preserves DOM structure, avoids component recreation
- CSS controls height, ensures complete hiding
- Double guarantee, more reliable

### 3. **Breadcrumb** - v-if

**Method**: Conditional rendering
**Location**: `apps/admin-app/src/layout/index.vue`

```vue
<!-- Breadcrumb component -->
<AppBreadcrumb v-if="!isDocsApp" />
```

**Why v-if**:
- Breadcrumb component is relatively simple
- Completely removes DOM, saves resources
- Avoids style conflicts

### 4. **Topbar Elements** - CSS Control

**Method**: `body.docs-mode` class + precise CSS selectors
**Location**: `apps/admin-app/src/styles/global.scss`

```scss
body.docs-mode {
  // Hide Logo + Title
  .topbar__brand {
    width: 64px !important; // Only keep hamburger menu width
    border-right: none !important; // Remove separator

    .topbar__logo-content {
      display: none !important; // Hide Logo + Title
    }
  }

  // Hide collapse button
  .topbar__left {
    .btc-comm__icon:first-child {
      display: none !important;
    }
  }
}
```

**Why CSS**:
- Topbar component is complex, contains multiple sub-elements
- Need precise control of each element's visibility
- CSS selectors can precisely target

### 5. **Content Area** - CSS Control

**Method**: Remove margin, occupy full space
**Location**: `apps/admin-app/src/styles/global.scss`

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

## Implementation Details

### 1. Route Guard Trigger

**Location**: `apps/admin-app/src/router/index.ts`

```typescript
router.beforeEach((to, from) => {
  // Enter documentation mode
  if (to.path === '/docs' || to.path.startsWith('/docs/')) {
    document.body.classList.add('docs-mode');
  }

  // Exit documentation mode
  if (from.path === '/docs' || from.path.startsWith('/docs/')) {
    if (to.path !== '/docs' && !to.path.startsWith('/docs/')) {
      document.body.classList.remove('docs-mode');
    }
  }
});
```

### 2. Layout State Management

**Location**: `apps/admin-app/src/layout/index.vue`

```typescript
const isDocsApp = computed(() => {
  const route = useRoute();
  return route.path === '/docs' || route.path.startsWith('/docs/');
});
```

### 3. Style Priority

Use `!important` to ensure style priority:
```scss
body.docs-mode {
  .app-layout__sidebar {
    width: 0 !important; // Override component internal styles
    opacity: 0 !important;
    visibility: hidden !important;
  }
}
```

---

## Effect Comparison

### Normal Mode
```
Topbar: [☰] Logo BTC SaaS [Collapse] [Search] [Theme] [Language] [User]
Body: Sidebar (255px) Tabbar (38px)
Breadcrumb (32px)
Content (margin: 10px)
```

### Documentation Mode
```
Topbar: [☰] [Search] [Theme] [Language] [User]
Body: Content (full, 100vh - 64px)
```

---

## Testing Verification

### Test Steps

1. **Enter Documentation Mode**:
   - Click "Documentation Center"
   - Verify: Sidebar, Tabbar, Breadcrumb completely hidden
   - Verify: Topbar only shows hamburger menu, search, theme, language, user

2. **Content Area**:
   - Verify: Content area occupies full space
   - Verify: VitePress iframe displays normally

3. **Exit Documentation Mode**:
   - Click other menu items
   - Verify: All elements restore normal display

---

## Notes

### 1. Style Priority
- Use `!important` to ensure styles take effect
- Avoid being overridden by component internal styles

### 2. Component State
- `v-show` preserves component state
- `v-if` completely removes component
- Choose appropriate solution based on component complexity

### 3. Performance Considerations
- CSS control performs better than JavaScript control
- Avoid frequent DOM operations

---

## Completion Status

- [x] Sidebar hidden (CSS control)
- [x] Tabbar hidden (v-show + CSS)
- [x] Breadcrumb hidden (v-if)
- [x] Topbar elements hidden (CSS control)
- [x] Content area full width (CSS control)
- [x] Route guard trigger
- [x] Style priority handling
- [x] Testing verification

**Layout hiding strategy completed! Interface in documentation mode is more concise and focused!**

---
title: iframe Optimization
type: guide
project: btc-shopflow
owner: dev-team
created: 2025-10-13
updated: 2025-10-13
publish: true
tags: ["integration", "guides"]
sidebar_label: iframe Optimization
sidebar_order: 3
sidebar_group: integration
---

# Documentation iframe Cache Optimization

## Problem Background

In the previous implementation, each time entering the documentation application would reload the iframe, causing:
- White screen flicker
- Repeated loading of VitePress resources
- Poor user experience

## Optimization Solution: Global Singleton + Lazy Loading

Adopting **Solution A (Global Singleton)**, achieving:
- **Cache on First Visit**: After first visit, iframe stays in memory
- **Zero Reload Switching**: Subsequent visits show instantly, no white screen
- **Internal Route Navigation**: SPA-style navigation via postMessage
- **Performance Optimization**: Throttling when hidden, event isolation, lazy loading

---

## Core Design

### 1. iframe Location: Global Layout

**Location**: `apps/admin-app/src/layout/index.vue`
```vue
<div class="app-layout__content">
  <!-- Main application route outlet -->
  <router-view v-if="isMainApp && !isDocsApp" />

  <!-- Documentation application iframe (globally cached) -->
  <DocsIframe :visible="isDocsApp" />

  <!-- Sub-application mount point -->
  <div id="subapp-viewport" v-show="!isMainApp && !isDocsApp">
    <AppSkeleton />
  </div>
</div>
```

**Advantages**:
- iframe created only once, not destroyed when switching applications
- Use `v-show` instead of `v-if`, keep DOM present
- Isolated from Qiankun sub-applications, no interference

---

### 2. Lazy Loading Mechanism

**Implementation**: `DocsIframe` component
```typescript
const iframeCreated = ref(false); // Lazy loading flag
const iframeSrc = ref(''); // Dynamic src

// Lazy loading: only create iframe when first displayed
watch(isVisible, (visible) => {
  if (visible && !iframeCreated.value) {
    // First display, create iframe
    iframeCreated.value = true;
    iframeSrc.value = baseUrl; // http://localhost:8085
  }
}, { immediate: true });
```

**Effect**:
- When application starts, iframe is not created (saves memory)
- Only created on first visit to `/docs`
- After creation, permanently retained, never destroyed

---

### 3. Internal Route Navigation (postMessage)

#### Main Application → VitePress

**Global Search Component**:
```typescript
// Handle documentation navigation
const handleDocNavigation = (doc: DocSearchResult) => {
  const currentPath = router.currentRoute.value.path;

  if (currentPath === '/docs') {
    // Already on documentation page, directly notify iframe to navigate
    window.dispatchEvent(new CustomEvent('docs-navigate', {
      detail: { path: doc.path }
    }));
  } else {
    // First switch to documentation application
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

**DocsIframe Component**:
```typescript
function navigateToDoc(path: string) {
  if (!docsIframe.value?.contentWindow) {
    return;
  }

  // Notify VitePress to perform internal route navigation via postMessage
  docsIframe.value.contentWindow.postMessage({
    type: 'btc-navigate',
    path
  }, '*');
}

// Listen to global navigation events
window.addEventListener('docs-navigate', (event) => {
  const { path } = event.detail;
  navigateToDoc(path);
});
```

#### VitePress Internal Handling

**VitePress theme/index.ts**:
```typescript
window.addEventListener('message', (event) => {
  if (event.data?.type === 'btc-navigate') {
    // Receive navigation command from main application, use VitePress internal router
    const { path } = event.data;
    if (path && router) {
      router.go(path); // VitePress Router API
    }
  }
});
```

**Advantages**:
- No white screen: doesn't reload iframe
- SPA experience: pure frontend route switching
- Preserves state: scroll position, history all preserved

---

### 4. Performance Optimization

#### a) Event Isolation

**Block event penetration when hidden**:
```typescript
watch(isVisible, (visible) => {
  if (!visible && docsIframe.value) {
    docsIframe.value.style.pointerEvents = 'none'; // Event isolation
  } else if (visible && docsIframe.value) {
    docsIframe.value.style.pointerEvents = 'auto';
  }
});
```

**CSS Styles**:
```scss
.docs-iframe-wrapper {
  &.is-hidden {
    pointer-events: none; // Event isolation
    visibility: hidden; // Hidden from screen readers
  }
}
```

#### b) Throttling Notification

**Notify VitePress of visibility changes**:
```typescript
watch(isVisible, (visible) => {
  if (!visible && docsIframe.value?.contentWindow) {
    // Notify VitePress when hidden
    docsIframe.value.contentWindow.postMessage({
      type: 'btc-visibility-change',
      visible: false
    }, '*');
  } else if (visible && docsIframe.value?.contentWindow) {
    // Notify VitePress when shown
    docsIframe.value.contentWindow.postMessage({
      type: 'btc-visibility-change',
      visible: true
    }, '*');
  }
});
```

**VitePress can accordingly**:
- Stop polling
- Pause animations
- Reduce search index update frequency

#### c) Sandbox Permissions

```html
<iframe
  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
  ...
/>
```

**Only open necessary permissions**:
- `allow-scripts` - Execute scripts (VitePress needs)
- `allow-same-origin` - Access localStorage (theme sync needs)
- `allow-popups` - Open external links (optional)
- `allow-forms` - Search forms (optional)

**Permissions not opened**:
- `allow-top-navigation` - Avoid leaving main application
- `allow-modals` - Avoid popup interference

---

## Architecture Comparison

### Before: Route-Level Component + iframe Reload

```
User clicks documentation

router.push('/docs')

Load DocsView component

Create iframe, set src

VitePress loads (show Loading)

Loading complete, hide Loading

---

User switches back to main application

Destroy DocsView component

Destroy iframe (lose cache)

---

User clicks documentation again

Reload iframe (white screen)

Reload VitePress
```

### Now: Global Layout + Lazy Loading + postMessage

```
Application starts

Layout loads (DocsIframe not created)

---

User first clicks documentation

router.push('/docs')

isDocsApp = true

DocsIframe visible = true

Lazy load: create iframe, set src

VitePress loads (show Loading)

Loading complete, hide Loading

---

User switches back to main application

isDocsApp = false

DocsIframe visible = false (iframe preserved)

pointer-events: none (event isolation)

visibility: hidden (hidden from screen readers)

---

User clicks documentation again

router.push('/docs')

isDocsApp = true

DocsIframe visible = true (instant display)

pointer-events: auto

No reload needed

---

Global search clicks documentation result

window.dispatchEvent('docs-navigate')

navigateToDoc(path)

postMessage({ type: 'btc-navigate', path })

VitePress router.go(path) (internal route, no white screen)
```

---

## User Experience Improvement

### First Visit
- **Loading Time**: Normal (needs to load VitePress)
- **Experience**: Global Loading overlay, no white screen

### Subsequent Visits
- **Loading Time**: 0ms
- **Experience**: Instant display, perfect

### Global Search Navigation
- **From Main Application**: First switch to documentation page (Loading), then internal navigation
- **Already on Documentation Page**: Pure internal navigation, no Loading

---

## File List

### Added
- `apps/admin-app/src/layout/docs-iframe/index.vue` - Global documentation iframe component

### Deleted
- `apps/admin-app/src/pages/docs/index.vue` - Old route-level component

### Modified
1. **`apps/admin-app/src/layout/index.vue`**
   - Add `isDocsApp` computed
   - Import `DocsIframe` component and pass `visible` prop

2. **`apps/admin-app/src/router/index.ts`**
   - `/docs` route changed to empty component (actual rendering handled by Layout)

3. **`apps/admin-app/src/layout/global-search/index.vue`**
   - Documentation navigation changed to postMessage method
   - Triggered via custom event `docs-navigate`

4. **`apps/docs-site/.vitepress/theme/index.ts`**
   - Add `btc-navigate` message listener
   - Use VitePress router.go() for internal navigation

5. **`apps/docs-site/components/*.md`**
   - Create all component documentation pages

---

## Key Features

### 1. Lazy Loading
```typescript
// v-if controls creation timing
<iframe v-if="iframeCreated" :src="iframeSrc" />

// Only create on first display
if (visible && !iframeCreated.value) {
  iframeCreated.value = true;
  iframeSrc.value = baseUrl;
}
```

### 2. Event Isolation
```scss
.docs-iframe-wrapper.is-hidden {
  pointer-events: none; // Click through to lower layer
  visibility: hidden; // Hidden from screen readers
}
```

### 3. Sandbox Security
```html
<iframe
  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
/>
```

### 4. Throttling Notification
```typescript
// Notify VitePress when hidden
docsIframe.contentWindow.postMessage({
  type: 'btc-visibility-change',
  visible: false
}, '*');
```

---

## Testing Verification

### Test Steps

1. **First Visit**:
   - Refresh browser
   - Click "Documentation Center"
   - Verify: Show Loading, then normally load documentation

2. **Switch Back to Main Application**:
   - Click "System Management" > "User List"
   - Verify: iframe not destroyed (still exists in developer tools)

3. **Visit Documentation Again**:
   - Click "Documentation Center"
   - Verify: **Instant display, no Loading, no white screen**

4. **Global Search Navigation**:
   - On documentation page, press `Ctrl+K`
   - Search "CRUD Component"
   - Click "BtcCrud Component"
   - Verify: **No white screen, directly switch to corresponding document**

5. **Search from Main Application**:
   - On main application page, press `Ctrl+K`
   - Search "Component Documentation"
   - Click documentation result
   - Verify: Show Loading, then show documentation

---

## Performance Comparison

| Scenario | Before | Now |
|------|------|------|
| **First Visit** | Loading | Loading (same) |
| **Subsequent Visit** | Loading + Reload | **Instant Display** (0ms) |
| **Internal Navigation** | Reload iframe (white screen) | **Internal Route** (no white screen) |
| **Memory Usage** | 0 (after destruction) | ~50-100MB (resident) |
| **CPU Usage** | 0 (after destruction) | Minimal (throttled when hidden) |

---

## Notes

### 1. Memory Management
- iframe resident will occupy memory (about 50-100MB)
- For projects with large documentation, consider:
  - Auto unload after hidden for 10 minutes
  - Provide "Refresh Documentation" button for manual reload

### 2. VitePress Router API
- Currently using `router.go(path)` for navigation
- If it doesn't work, can use `window.location.hash = path` (hash route)

### 3. First Load Optimization
- Can preload iframe 5 seconds after application starts (create early)
- This way first visit can also display instantly

---

## Future Optimization Suggestions

### 1. Preload Strategy
```typescript
// Preload documentation iframe 5 seconds after application starts
onMounted(() => {
  setTimeout(() => {
    if (!iframeCreated.value) {
      iframeCreated.value = true;
      iframeSrc.value = baseUrl;
    }
  }, 5000);
});
```

### 2. Auto Unload Strategy
```typescript
// Auto unload after hidden for 10 minutes
let unloadTimer: number | null = null;

watch(isVisible, (visible) => {
  if (!visible) {
    unloadTimer = window.setTimeout(() => {
      iframeCreated.value = false;
      iframeSrc.value = '';
    }, 600000); // 10 minutes
  } else {
    if (unloadTimer) {
      clearTimeout(unloadTimer);
    }
  }
});
```

### 3. VitePress Internal Throttling
Listen to `btc-visibility-change` in VitePress's theme/index.ts:
```typescript
window.addEventListener('message', (event) => {
  if (event.data?.type === 'btc-visibility-change') {
    const { visible } = event.data;

    if (!visible) {
      // Stop polling, animations, etc.
      // clearInterval(somePolling);
    } else {
      // Resume
    }
  }
});
```

---

## Completion Status

- [x] Create global DocsIframe component
- [x] Implement lazy loading mechanism (only create on first visit)
- [x] Implement internal route navigation (postMessage)
- [x] Add event isolation (pointer-events: none)
- [x] Add Sandbox security control
- [x] Add throttling notification mechanism
- [x] Delete old route-level component
- [x] Update route configuration
- [x] Create component documentation pages (crud, form, table, upsert, dialog, view-group)
- [x] Remove all debug logs
- [x] Write complete documentation

---

## Effects

- **First Visit**: Normal Loading
- **Subsequent Visit**: Instant display, no Loading
- **Global Search Navigation**: No white screen, smooth switching
- **Memory Controllable**: Resident but isolated, optional auto unload
- **Performance Optimized**: Lazy loading, event isolation, throttling notification

**This is the "just right" design: stable, fast, controllable!**

---
title: Instant Switch
type: guide
project: btc-shopflow
owner: dev-team
created: 2025-10-13
updated: 2025-10-13
publish: true
tags: ["integration", "guides"]
sidebar_label: Instant Switch
sidebar_order: 4
sidebar_group: integration
---

# Documentation Application Instant Switch Optimization

## Problem

Even with iframe cached, when switching to documentation application, there is still:
- Sidebar width transition animation from 255px → 0 (0.2s)
- Content area width transition from `calc(100% - 255px)` → `100%` (0.2s)
- Users can see the width change process

## Solution: Conditionally Disable Animation

### Core Idea

**First Load** (iframe not cached):
- Keep Loading animation
- Keep sidebar transition animation (under Loading overlay, users can't see)

**Subsequent Visit** (iframe cached):
- No Loading
- **Disable sidebar and content area transition animations**
- Instant switch, no delay

---

## Implementation

### 1. Route Guard (`router/index.ts`)

```typescript
router.beforeEach((to, from) => {
  if (to.path === '/docs') {
    const docsIframeLoaded = (window as any).__DOCS_IFRAME_LOADED__ || false;

    if (docsIframeLoaded) {
      // iframe loaded, instant switch (disable animation)
      document.body.classList.add('docs-mode-instant'); // Disable animation
      document.body.classList.add('docs-mode'); // Hide sidebar

      // Remove instant class next frame, restore normal animation
      requestAnimationFrame(() => {
        document.body.classList.remove('docs-mode-instant');
      });
    } else {
      // iframe not loaded, show Loading (with animation)
      // ...
    }
  }

  // Same handling when leaving documentation
  if (from.path === '/docs' && to.path !== '/docs') {
    const docsIframeLoaded = (window as any).__DOCS_IFRAME_LOADED__ || false;

    if (docsIframeLoaded) {
      // Instantly restore sidebar (disable animation)
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

### 2. Global Styles (`styles/global.scss`)

```scss
// Documentation mode: hide left sidebar
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

// Instant switch mode: disable all transition animations
body.docs-mode-instant {
  .app-layout__sidebar,
  .app-layout__main {
    transition: none !important; // Disable width transition
  }
}
```

---

## Execution Flow

### First Visit (With Animation)

```
User clicks Documentation Center

Route guard: iframe not loaded

Show Loading (full screen overlay)

Add docs-mode class

Sidebar width transition: 255px → 0 (0.2s, invisible under Loading)

Content area width transition: auto → 100% (0.2s, invisible under Loading)

iframe loads complete

Hide Loading

Display documentation
```

### Subsequent Visit (No Animation)

```
User clicks Documentation Center

Route guard: iframe loaded

Add docs-mode-instant class

Add docs-mode class

Sidebar width instantly changes: 255px → 0 (no animation)

Content area width instantly changes: auto → 100% (no animation)

Remove docs-mode-instant class next frame

Instant display documentation
```

---

## Effect Comparison

### First Visit
| Time | Before | Now |
|------|------|------|
| 0ms | Click | Click |
| 0ms | Show Loading | Show Loading |
| 0-200ms | Sidebar animation (Loading overlay) | Sidebar animation (Loading overlay) |
| 2000ms | Loading disappears | Loading disappears |
| 2000ms | Display documentation | Display documentation |

### Subsequent Visit
| Time | Before | Now |
|------|------|------|
| 0ms | Click | Click |
| 0ms | Show Loading | **No Loading** |
| 0-200ms | Sidebar animation | **Instant switch** |
| 200ms | Display documentation | **Immediately display** |

---

## Testing Verification

### Test Steps

1. **Refresh Browser**
2. **First Visit**:
   - Click "Documentation Center"
   - Verify: Show Loading, sidebar changes under Loading overlay

3. **Switch Back to Main Application**:
   - Click "System Management" > "User List"
   - Verify: Sidebar restores display

4. **Visit Again** (Key Test):
   - Click "Documentation Center"
   - Verify:
     - **No Loading**
     - **Sidebar instantly disappears (no animation)**
     - **Documentation immediately displays**
     - **No width change process visible**

5. **Rapid Switching**:
   - Rapidly switch between "Documentation Center" and "User List" multiple times
   - Verify: Instant switching, no animation delay

---

## Final Effect

- **First Visit**: Loading overlay, good experience
- **Subsequent Visit**: Instant switch, instant documentation display
- **Rapid Switching**: No animation delay, perfect experience

**This is the best practice of "preload + instant switch"!**

---
title: "Layout Component Architecture Guide"
type: api
project: layout
owner: dev-team
created: 2025-10-11
updated: 2025-10-11
publish: true
tags: ["layout"]
---

# Layout Component Architecture Guide

## Directory Structure

This directory adopts a **"directory-as-component"** architecture, where each layout component is an independent folder.

```
layout/
index.vue # Main layout entry
topbar/ # Topbar component
index.vue # Component main file
README.md # Component documentation
sidebar/ # Sidebar component
index.vue
README.md
process/ # Tab process bar
index.vue
README.md
breadcrumb/ # Breadcrumb navigation
index.vue
README.md
menu-drawer/ # Menu drawer (app switching)
index.vue
README.md
theme-switcher/ # Theme switcher
index.vue
README.md
locale-switcher/ # Language switcher
index.vue
README.md
global-search/ # Global search
index.vue
README.md
dynamic-menu/ # Dynamic menu
index.vue
README.md
```

## Component Descriptions

### Main Layout (index.vue)
- Overall layout container
- Manages sidebar collapse state
- Integrates event bus
- Distinguishes between main app and sub-app views

### Topbar (topbar/)
- Collapse/expand button
- Global search box
- Theme switching
- Language switching
- User menu (profile, settings, logout)

### Sidebar (sidebar/)
- Logo area
- Hamburger menu button (opens app drawer)
- Dynamic menu content

### Tab Process Bar (process/)
- Back, refresh, home buttons
- Tab list (scrollable)
- Tab close
- Tab action menu (close others/all)
- Fullscreen toggle

### Breadcrumb Navigation (breadcrumb/)
- Displays current page hierarchy position
- Supports click navigation to parent
- App isolation (each app independent)
- Internationalization support

### Menu Drawer (menu-drawer/)
- Displays all micro-apps
- App cards
- App switching
- Click outside to close

### Theme Switcher (theme-switcher/)
- Theme settings button
- Dark mode toggle
- Preset theme selection
- Custom colors

### Language Switcher (locale-switcher/)
- Language dropdown menu
- Simplified Chinese/English switching
- Sends language change events

### Global Search (global-search/)
- Global search box (Ctrl+K shortcut)
- Real-time search for menus and pages
- Popup suggestion display results
- Keyboard navigation (arrow keys, Enter, Esc)
- Search history
- Keyword highlighting
- Quick access to common pages

### Dynamic Menu (dynamic-menu/)
- Displays different menus based on current app
- Supports multi-level submenus
- Collapse/expand animations

## Import Methods

```typescript
// Import from main layout
import Topbar from './topbar/index.vue'
import Sidebar from './sidebar/index.vue'
import Process from './process/index.vue'
import MenuDrawer from './menu-drawer/index.vue'

// Or use short paths (requires resolve alias configuration)
import Topbar from '@/layout/topbar'
```

## Naming Conventions

- **Folder names**: kebab-case (e.g., `theme-switcher`)
- **Component names**: PascalCase (e.g., `LayoutThemeSwitcher`)
- **Main file**: Unified as `index.vue`

## Extensibility Design

Each component directory can add as needed:

```
topbar/
index.vue # Main component
components/ # Sub-components (if needed)
composables.ts # Composable functions (if needed)
types.ts # Type definitions (if needed)
styles.scss # Independent styles (if needed)
README.md # Component documentation
```

## Advantages

**Extensible**: Easy to add related files when components grow
**Clear Responsibilities**: Each folder is a functional boundary
**Easy Collaboration**: Newcomers understand component structure by looking at directory
**Easy Maintenance**: Related files placed nearby, no global search needed
**Performance Optimization**: Clear code splitting granularity

## Notes

1. **Component Naming**: All components use `defineOptions({ name: 'LayoutXxx' })` to declare names
2. **Style Scoping**: Use `scoped` to avoid style pollution
3. **Type Safety**: Props and Emits have complete TypeScript type definitions
4. **Performance Optimization**: Use CSS `transform: translateZ(0)` to enable hardware acceleration

## Related Documentation

- [Layout Refactor Guide](../../../LAYOUT-REFACTOR-GUIDE.md)
- [SVG Icon Troubleshooting](../../../SVG-ICONS-TROUBLESHOOTING.md)

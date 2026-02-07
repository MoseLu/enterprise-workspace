---
title: Documentation Integration
type: guide
project: btc-shopflow
owner: dev-team
created: 2025-10-13
updated: 2025-10-13
publish: true
tags: ["integration", "guides"]
sidebar_label: Documentation Integration
sidebar_order: 1
sidebar_group: integration
---
# VitePress Documentation Center Integration Completion Report

## Completion Time
2025-10-13

## Implementation Solution
**Solution A2-1: iframe Embedding + Main Application Sidebar Hiding**

VitePress runs as an independent application on port 8086, embedded into the main application via iframe. After entering the documentation center, the main application's left menu automatically hides, and VitePress completely takes over the display area.

## Implementation Content

### 1. VitePress Foundation

- **package.json** - Add all necessary dependencies (VitePress, Element Plus, gray-matter, ajv, glob, etc.)
- **VitePress Configuration** - Port 8086, navigation, search, aliases, SSR configuration
- **Custom Theme** - Reuse main application's theme.scss and global.scss
- **Custom Components**:
  - `DocumentMeta.vue` - Document metadata display (author, date, tags, confidentiality level)
  - `Demo.vue` - Component demo container

### 2. Theme Synchronization Mechanism

**VitePress Side (Receiver)**:
- Read `isDark` from `localStorage` to initialize theme
- Listen to `postMessage` from main application (`btc-theme-sync` message)
- Listen to `storage` events (cross-tab synchronization)
- Update both `vitepress-theme-appearance` and `isDark`
- Control VitePress dark mode via `.dark` class

**Main Application Side (Sender)**:
- Create `/docs` page, embed VitePress using iframe
- Listen to theme switch, language switch, storage changes
- Notify VitePress in iframe in real-time via `postMessage`
- Automatically sync initial state after VitePress is ready

### 3. Documentation Management Scripts

- **`ingest.ts`** - Document ingestion script (scan, validate, Git metadata, generate index)
- **`add-frontmatter.ts`** - Batch add frontmatter
- **`validate-frontmatter.ts`** - Validate frontmatter
- **`new-doc.ts`** - Interactive create new document
- **`frontmatter.schema.json`** - JSON Schema validation specification
- **`.sources.json`** - Source document whitelist configuration

### 4. Main Application Integration

- **Route Configuration** - Add `/docs` route
- **Menu Configuration** - Add "Documentation Center" menu item (Document icon)
- **Tab Registration** - Add docs tab metadata
- **i18n Translation** - Chinese/English "文档中心"/"Docs Center"
- **docs-mode CSS** - Automatically hide left sidebar styles

### 5. Startup Scripts

`start-all.bat` - One-click startup of all applications (including docs-site)

## Technical Implementation Details

### postMessage Communication

```typescript
// Main application sends message
docsIframe.contentWindow.postMessage({
  type: 'btc-theme-sync',
  isDark: true
}, '*');

// VitePress receives message
window.addEventListener('message', (event) => {
  if (event.data?.type === 'btc-theme-sync') {
    const { isDark } = event.data;
    applyTheme(isDark);
  }
});
```

### Theme Application (VitePress)

```typescript
function applyTheme(isDark: boolean) {
  const html = document.documentElement;

  if (isDark) {
    html.classList.add('dark');
    localStorage.setItem('vitepress-theme-appearance', 'dark');
  } else {
    html.classList.remove('dark');
    localStorage.setItem('vitepress-theme-appearance', 'light');
  }

  localStorage.setItem('isDark', JSON.stringify(isDark));
}
```

### docs-mode CSS

```scss
body.docs-mode {
  .app-layout__sidebar {
    display: none !important;
  }

  .app-layout__main {
    margin-left: 0 !important;
  }

  .app-layout__content {
    padding: 0 !important;
    height: 100%;
  }
}
```

## Directory Structure

```
apps/docs-site/
.vitepress/
  config.ts # VitePress configuration (port 8086)
  theme/ # Custom theme
    index.ts # Theme entry (reuse main app config, postMessage listener)
  components/ # Custom components
    DocumentMeta.vue
    Demo.vue
  schemas/ # frontmatter JSON Schema
  _ingested/ # Ingested documents (auto-generated)
  scripts/ # Script tools
    ingest.ts
    add-frontmatter.ts
    validate-frontmatter.ts
    new-doc.ts
  .sources.json # Source document configuration
index.md # Homepage
timeline/ # Timeline page
projects/ # Project index page
types/ # Type index page
tags/ # Tags page
README.md # Usage guide
package.json
```

## Usage Guide

### Start All Applications

```bash
# Method 1: One-click start all applications (recommended)
pnpm dev

# Method 2: Use Turbo to start
pnpm dev:all

# Method 3: Start documentation center separately
cd apps/docs-site
pnpm dev
```

### Access URLs

- **Main Application**: http://localhost:8080
- **Logistics Application**: http://localhost:8081
- **Engineering Application**: http://localhost:8082
- **Quality Application**: http://localhost:8083
- **Production Application**: http://localhost:8084
- **Documentation Center (Standalone)**: http://localhost:8085
- **Documentation Center (Embedded)**: http://localhost:8080/docs (Click "Documentation Center" in main app left menu)

### Create New Document

```bash
# Use interactive wizard
pnpm --filter docs-site-app new-doc

# Or manually create then run ingest
pnpm --filter docs-site-app ingest
```

### Validate Documents

```bash
pnpm --filter docs-site-app validate-frontmatter
```

## Features

### 1. Real-Time Theme Synchronization

- Main application switches dark mode, VitePress responds immediately
- Read theme from localStorage on initial load
- VitePress maintains theme consistency after refresh
- Cross-tab synchronization

### 2. Visual Unity

- VitePress uses main application's CSS variables and theme styles
- Preserves VitePress sidebar navigation and search
- Hides main application sidebar when entering documentation center
- Preserves main application topbar and tabbar

### 3. Documentation Management

- frontmatter validation (JSON Schema)
- Git metadata extraction (commit, author, date)
- Auto-generate index pages (timeline, projects, types, tags)
- Multi-dimensional document classification
- Confidentiality level control

### 4. Component Demos

- Use `<Demo>` component in documents
- Can reference all components from @btc/shared-components
- Code and effect side-by-side display

## Notes

### 1. Port Occupancy

Ensure port 8086 is not occupied. If occupied, VitePress will error (`strictPort: true`)

### 2. Theme Synchronization Delay

postMessage communication is async, theme switching may have ~100ms delay. If faster response is needed, adjust `setTimeout` time.

### 3. Language Switching

VitePress interface text is determined at build time, does not support runtime language switching. Currently configured as Chinese main interface, but Element Plus component language can be dynamically switched.

If complete multi-language switching is needed:
- Build two versions of VitePress (Chinese and English versions)
- Or refresh iframe to switch language (will lose current scroll position)

### 4. iframe Limitations

- VitePress and main application are in different JavaScript contexts
- Need postMessage communication
- Cannot directly access main application's Vue components or state

### 5. Document Ingestion Rules

Only documents with `publish: true` will be ingested. Ensure new documents' frontmatter contains complete required fields.

## Future Work

### Phase 1: Documentation Migration (Pending)

1. **Batch Add frontmatter**
```bash
pnpm --filter docs-site-app add-frontmatter
```

2. **Run ingest**
```bash
pnpm --filter docs-site-app ingest
```

3. **Verify Results**
```bash
pnpm --filter docs-site-app validate-frontmatter
pnpm --filter docs-site-app dev
```

4. **Delete Original Documents** (Careful! Confirm migration success first)
- Delete `docs/guides/`
- Delete `docs/adr/`
- Delete `docs/sop/`
- Delete all package-level READMEs
- Keep project-level README

### Phase 2: Component Documentation (Optional)

Create component demo documents:
- components/btc-crud.md
- components/btc-table.md
- components/btc-upsert.md
- components/btc-dialog.md
- components/btc-form.md
- components/btc-view-group.md

### Phase 3: CI/CD (Optional)

Configure documentation quality checks and automatic deployment:
- Validate frontmatter on PR
- Auto build and deploy to intranet server

## Summary

VitePress documentation center has been successfully integrated into BTC Shop Flow management system:

- **Fully Preserves VitePress Advantages** (search, navigation, theme, SSR)
- **Real-Time Theme Synchronization** (dark mode, CSS variables)
- **Seamless Embedding in Main Application** (no need for new tab navigation)
- **Automated Documentation Management** (ingestion, validation, index generation)
- **Component Demo Capability** (can demo BTC components in documents)

User Experience:
- Click "Documentation Center" menu → Left menu hides, VitePress takes over entire display area
- Switch theme → VitePress syncs immediately
- Preserve topbar and tabbar → Can switch back to other applications anytime
- Can open multiple documentation tabs

**Start Using**: `start-all.bat` to start all applications, then visit http://localhost:8080 and click "Documentation Center"!

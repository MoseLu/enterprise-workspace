---
title: Search Integration
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags: ["integration", "guides"]
sidebar_label: Search Integration
sidebar_order: 5
sidebar_group: integration
---

# VitePress Search Integration into Global Search

## Overview

VitePress documentation search functionality has been integrated into the main application's global search box (`Ctrl+K`), allowing users to search in a unified search interface:
- Menu Items
- Pages
- Documentation Content

## Technical Implementation

### 1. Search Endpoint

New documentation search endpoint:
```
GET /api/docs/search?q={query}&limit={limit}
```

### 2. Search Logic

```typescript
// Search implementation
async function searchDocs(query: string, limit = 10) {
  // Call VitePress search API
  const results = await fetch(`/docs-search?q=${query}&limit=${limit}`);
  return results.json();
}
```

### 3. Integration Method

Documentation search integrated in main application's search component:
- Unified search result display
- Keyboard navigation support
- Consistent search experience

## Usage

### Shortcut Search

1. Press `Ctrl+K` to open global search
2. Enter search keywords
3. Select documentation in search results

### Search Scope

- **Document Titles**: Match document titles
- **Document Content**: Full-text search
- **Tags**: Search based on tags
- **Categories**: Search based on document categories

## Configuration

### Search Configuration

```typescript
// VitePress search configuration
export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              }
            }
          }
        }
      }
    }
  }
})
```

### Main Application Integration

```typescript
// Main application search component
const searchResults = await searchDocs(query);
// Merge into global search results
```

## Performance Optimization

- Async loading of search index
- Memory caching of search results
- Debounced search input
- Lazy loading of search results

---

**Integration Status**: Completed
**Test Status**: Passed

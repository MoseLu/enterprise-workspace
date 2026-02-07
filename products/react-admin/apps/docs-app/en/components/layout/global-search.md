---
title: "GlobalSearch Component"
type: api
project: layout
owner: dev-team
created: 2025-10-11
updated: 2025-10-11
publish: true
tags: ["layout"]
sidebar_label: "Global Search"
sidebar_order: 7
sidebar_collapsed: false
sidebar_group: "Layout Components"
---
# GlobalSearch Component

## Overview

Global search component, similar to VitePress's top bar search, providing quick menu item and page lookup functionality

## Features

### Core Features
- **Real-time Search**: Input keywords to filter results instantly
- **Grouped Display**: Menu items and pages displayed in groups
- **Keyword Highlighting**: Matching keywords highlighted in search results
- **Breadcrumb Navigation**: Shows hierarchical path of menu items

### Keyboard Operations
- `Ctrl+K` / `Cmd+K`: Quickly focus search box
- `↑` / `↓`: Navigate search results
- `Enter`: Jump to selected result
- `Esc`: Close search popup

### Search History
- Automatically saves the last 5 search records
- Data stored in localStorage
- Click history record to quickly re-search

### Quick Access
- Home page
- CRUD test page
- Customizable quick access list

## Component Structure

```
global-search/
index.vue # Main component
README.md # Documentation
```

## Usage

```vue
<template>
<GlobalSearch />
</template>

<script setup>
import GlobalSearch from '@/layout/global-search/index.vue';
</script>
```

## Props

No props needed, component is fully self-contained

## Search Data Sources

Current search scope includes:

### Menu Items
- All menus under System Management
- Business Components menu
- Vite Plugin menu
- Internationalization menu

### Pages
- Main app home page
- Sub-app overview pages (Logistics, Engineering, Quality, Production)

## Style Customization

Component uses CSS variables, automatically adapting to theme:

```scss
.global-search {
// Input box width
width: 240px;

// Dropdown min width
__dropdown {
min-width: 400px;
max-height: 480px;
}
}
```

## Internationalization

Supports Chinese/English switching, uses the following i18n keys:

- `common.global_search_placeholder`: Search box placeholder
- `common.no_search_results`: No results message
- `common.try_different_keywords`: Suggestion text
- `common.recent_searches`: Recent searches title
- `common.quick_access`: Quick access title
- `common.menu_items`: Menu items group title
- `common.pages`: Pages group title
- `common.navigate`: Keyboard navigation hint
- `common.select`: Selection hint
- `common.close`: Close hint

## Interaction Flow

```
User Input → Real-time Filter → Group Display → Keyboard/Mouse Selection → Navigate to Page → Save History
```

## Extension Suggestions

### 1. Add More Search Sources
```typescript
// Can extend search data sources
const searchData = ref([
// Add documents
{ id: 'd1', type: 'doc', title: 'Quick Start', path: '/docs/quick-start' },

// Add commands
{ id: 'c1', type: 'command', title: 'Toggle Theme', action: () => toggleTheme() },

// Add settings
{ id: 's1', type: 'setting', title: 'Notification Settings', path: '/settings/notifications' },
]);
```

### 2. Remote Search
```typescript
// Support remote API search
const searchResults = computed(async () => {
if (!searchKeyword.value.trim()) return [];

const response = await fetch(`/api/search?q=${searchKeyword.value}`);
return await response.json();
});
```

### 3. Search Results Page
```typescript
// Click "View All Results" to jump to dedicated search results page
const handleViewAll = () => {
router.push({
path: '/search',
query: { q: searchKeyword.value }
});
};
```

### 4. Advanced Filtering
```typescript
// Support filter syntax
// Example: "type:menu user" only searches menu items containing "user"
// Example: "app:logistics order" only searches "order" in logistics app
```

## Performance Optimization

- Use `computed` to cache search results
- Keyboard navigation uses index, avoiding DOM operations
- Dropdown uses virtual scrolling (when results > 100)
- Search history limited to 5 items, avoiding storing too much data

## Accessibility

- Supports complete keyboard operation
- Supports screen readers (role="combobox")
- Clear focus states
- High contrast text

## Browser Compatibility

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## Future Plans

- [ ] Support fuzzy search (pinyin abbreviation)
- [ ] Search result weight sorting
- [ ] Search statistics and popular keywords
- [ ] Custom search source plugin system
- [ ] Offline search index

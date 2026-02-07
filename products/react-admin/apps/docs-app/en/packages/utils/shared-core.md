---
title: 'BTC Shared Core Library'
type: package
project: utils
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- packages
- utils
- core
sidebar_label: Shared Core
sidebar_order: 10
sidebar_group: packages
---
# BTC Shared Core Library

> **Version**: 1.0.0
> **Type**: Core Function Library
> **Purpose**: Cross-application shared core logic, plugins, and tools

---

## Contents

### BTC Core System

#### CRUD System
- `useCrud` - CRUD state management
- `createCrudService` - CRUD service builder
- [Documentation](./src/btc/crud/README.md)

#### Form System
- `useBtcForm` - Form state management
- `useTabs` - Form grouping
- `useAction` - Form actions
- `useElApi` - Element Plus API proxy

#### Plugin System
- `usePluginManager` - Plugin manager
- `createI18nPlugin` - Internationalization plugin
- `createThemePlugin` - Theme plugin
- [Plugin Development Guide](./src/btc/plugins/PLUGIN-DEVELOPMENT-GUIDE.md)

---

## Quick Start

### Installation

```bash
pnpm add @btc/shared-core
```

### Usage

#### CRUD

```typescript
import { useCrud, createCrudService } from '@btc/shared-core';

const userService = createCrudService('user');
const crud = useCrud({ service: userService });

// Load data
await crud.loadData();

// Add
crud.handleAdd();

// Edit
crud.handleEdit(row);

// Delete
crud.handleDelete(row);
```

#### Internationalization

```typescript
import { useI18n } from '@btc/shared-core';

const { t, setLocale } = useI18n();

// Use translation
const title = t('common.button.save'); // "Save"

// Switch language
setLocale('en-US');
```

#### Theme

```typescript
import { useTheme } from '@btc/shared-core';

const { setTheme, theme } = useTheme();

// Set theme color
setTheme('#409EFF');

// Toggle dark mode
toggleDark();
```

---

## Documentation

### Core Features
- **[CRUD System](./src/btc/crud/README.md)** - CRUD state management
- **[Plugin System](./src/btc/plugins/README.md)** - Plugin development guide

### Plugin Documentation
- **[Internationalization Plugin](./src/btc/plugins/i18n/README.md)** - i18n configuration
- **[i18n Key Naming Convention](./src/btc/plugins/i18n/KEY-NAMING-CONVENTION.md)** - Naming rules
- **[i18n Key Priority](./src/btc/plugins/i18n/KEY-PRIORITY.md)** - Priority management
- **[Excel Plugin](./src/btc/plugins/excel/README.md)** - Import/Export
- **[Plugin Manager](./src/btc/plugins/manager/README.md)** - Plugin management

---

## Architecture

```
src/
btc/ # BTC Core System
crud/ # CRUD System
plugins/ # Plugin System
i18n/ # Internationalization
theme/ # Theme
excel/ # Excel
manager/ # Manager
index.ts
index.ts
```

---

## Exports

### Composables
- `useCrud` - CRUD state management
- `useBtcForm` - Form state management
- `useTabs` - Form grouping
- `useAction` - Form actions
- `useI18n` - Internationalization
- `useTheme` - Theme management
- `usePluginManager` - Plugin management

### Utility Functions
- `createCrudService` - Create CRUD service
- `createI18nPlugin` - Create internationalization plugin
- `createThemePlugin` - Create theme plugin

### Types
- `CrudService` - CRUD service interface
- `UseCrudReturn` - CRUD return type
- `I18nPluginOptions` - i18n configuration
- `ThemePluginOptions` - Theme configuration

---

## Development

### Build

```bash
pnpm build
```

### Type Check

```bash
pnpm type-check
```

---

## License

MIT

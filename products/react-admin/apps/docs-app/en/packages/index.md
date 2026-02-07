---
title: Shared Packages Documentation
type: package
project: btc-shopflow
owner: dev-team
created: 2025-10-13
updated: 2025-10-13
publish: true
tags:
- packages
- shared
sidebar_label: Shared Packages
sidebar_order: 1
sidebar_group: packages
---

# Shared Packages Documentation

> Shared Packages Documentation

Shared packages provide reusable core functionality in the project, including component libraries, utility functions, business logic, etc., ensuring code consistency and maintainability.

## Purpose

- **Code Reusability**: Provide reusable components and utility functions
- **Unified Standards**: Ensure consistent code style and functionality across the project
- **Modularity**: Organize functionality by modules for easy maintenance and extension
- **Type Safety**: Provide complete TypeScript type definitions

## Package Categories

### Component Packages
- **[Component Package Overview](/en/packages/components/)** - BTC component library overview
- **[BTC CRUD](/en/packages/components/btc-crud)** - CRUD operation components
- **[BtcDialog](/en/packages/components/btc-dialog)** - Dialog and modal components
- **[BtcForm](/en/packages/components/btc-form)** - Form input and validation components
- **[btc-svg](/en/packages/components/btc-svg)** - SVG icon components
- **[BtcUpsert](/en/packages/components/btc-upsert)** - Create/Edit components
- **[BtcViewGroup](/en/packages/components/btc-view-group)** - View group components

### Utility Packages
- **[Utility Package Overview](/en/packages/utils/)** - Utility package overview
- **[Shared Core](/en/packages/utils/shared-core)** - Core business logic
- **[Shared Utils](/en/packages/utils/shared-utils)** - Utility functions and helper methods
- **[CRUD Composable](/en/packages/utils/use-crud)** - CRUD operation composable functions

### Plugin Packages
- **[Excel Plugin](/en/packages/plugins/excel-plugin)** - Excel import/export plugin
- **[i18n Plugin](/en/packages/plugins/i18n-plugin)** - Multi-language support plugin
- **[Plugin Manager](/en/packages/plugins/plugin-manager)** - Plugin management system
- **[Vite Plugin](/en/packages/plugins/vite-plugin)** - Vite build plugins

---

## Architecture Design

### Package Dependencies
```
shared-core (core business logic)

shared-utils (utility functions)

use-crud (CRUD composable functions)

btc-* (business components)
```

### Design Principles
1. **Single Responsibility**: Each package focuses on specific functionality
2. **Low Coupling**: Clear dependency relationships between packages
3. **High Cohesion**: Related functionality organized together
4. **Testable**: Provide complete test coverage

---

## Usage

### Installing Dependencies
```bash
# Install specific package
pnpm add @btc/shared-components

# Install all dependencies
pnpm install
```

### Import and Use
```typescript
// Import components
import { BtcCrud, BtcTable } from '@btc/shared-components'

// Import utility functions
import { formatDate } from '@btc/shared-utils'

// Import core functionality
import { useCrud } from '@btc/shared-core'
```

---

## Version Management

- **Semantic Versioning**: Follow SemVer specification
- **Changelog**: Record changes for each version
- **Backward Compatibility**: Maintain API backward compatibility
- **Deprecation Strategy**: Provide smooth deprecation migration plan

---

## Development Guides

- [Component Development Standards](/en/guides/components)
- [Package Development Guide](/en/guides/packages)
- [Testing Standards](/en/guides/testing)
- [Release Process](/en/guides/release)

---
title: Utility Package Documentation
type: package
project: utils
owner: dev-team
created: 2025-10-13
updated: 2025-10-13
publish: true
tags:
- packages
- utils
sidebar_label: Utility Package
sidebar_order: 2
sidebar_group: packages
---

# Utility Package Documentation

This section contains detailed documentation for all utility packages, providing core business logic, utility functions, and helper methods.

## Utility List

### Core Utilities
- **[Shared Core](/en/packages/utils/shared-core)** - Core business logic providing project's basic functionality
- **[CRUD Utilities](/en/packages/utils/use-crud)** - CRUD operation composable functions simplifying data operations

### Base Utilities
- **[Shared Utils](/en/packages/utils/shared-utils)** - Utility functions and helper methods providing common functionality

---

## Design Principles

### 1. Modularity
- Module division by functionality
- Clear dependency relationships
- Independent version management

### 2. Reusability
- General functionality design
- Flexible configuration options
- Complete type support

### 3. Performance Optimization
- On-demand loading mechanism
- Efficient algorithm implementation
- Minimize package size

---

## Architecture Design

### Layered Architecture
```
shared-core (core business logic)

shared-utils (utility functions)

use-crud (CRUD composable functions)
```

### Dependency Management
- Minimize external dependencies
- Version locking mechanism
- Compatibility guarantee

---

## Installation and Usage

### Install Core Utilities
```bash
pnpm add @btc/shared-core
```

### Install Utility Functions
```bash
pnpm add @btc/shared-utils
```

### Usage Examples
```typescript
// Use core functionality
import { useCrud } from '@btc/shared-core'

// Use utility functions
import { formatDate, debounce } from '@btc/shared-utils'

// Use CRUD composable functions
import { useCrud } from '@btc/shared-core'
```

---

## Development Tools

### Debugging Tools
- Complete TypeScript types
- Detailed error messages
- Debug mode support

### Testing Tools
- Unit test coverage
- Integration test support
- Performance testing tools

---

## Related Documentation

- [Component Package Documentation](/en/packages/components/) - BTC component library documentation
- [Plugin Package Documentation](/en/packages/plugins/) - Plugin system documentation

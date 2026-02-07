---
title: Project Overview
sidebar_label: Project Overview
sidebar_order: 0
---

# BTC Shopflow Project Overview

> BTC Workshop Management System Monorepo Project Specification

This document provides a complete overview of the BTC Shopflow project, including detailed information about all applications, shared packages, custom plugins, and components.

## 📋 Table of Contents

- [Application List](#application-list)
- [Shared Packages](#shared-packages)
- [Custom Plugins](#custom-plugins)
- [Custom Components](#custom-components)

---

## 🚀 Application List

This project adopts Monorepo architecture and includes the following applications:

### Core Applications

| Application Name | Path | Function Description | Documentation Links |
|-----------------|------|---------------------|---------------------|
| **Main Application** | `apps/main-app` | System core application, provides basic functionality and main interface | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/main-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/main-app/CHANGELOG.md) |
| **System Application** | `apps/system-app` | System management and micro-frontend container application, responsible for loading and managing sub-applications | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/system-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/system-app/CHANGELOG.md) |
| **Layout Application** | `apps/layout-app` | Unified layout container, provides global layout and navigation functionality | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/layout-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/layout-app/CHANGELOG.md) |
| **Home Application** | `apps/home-app` | System home page and welcome page | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/home-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/home-app/CHANGELOG.md) |

### Business Applications

| Application Name | Path | Function Description | Documentation Links |
|-----------------|------|---------------------|---------------------|
| **Admin Application** | `apps/admin-app` | Backend management functionality module, provides system configuration and user management | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/admin-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/admin-app/CHANGELOG.md) |
| **Logistics Application** | `apps/logistics-app` | Logistics management module, handles logistics transportation and distribution | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/logistics-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/logistics-app/CHANGELOG.md) |
| **Production Application** | `apps/production-app` | Production planning and management module, manages production processes and plans | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/production-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/production-app/CHANGELOG.md) |
| **Quality Application** | `apps/quality-app` | Quality control and inspection module, handles quality testing and management | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/quality-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/quality-app/CHANGELOG.md) |
| **Engineering Application** | `apps/engineering-app` | Engineering design and management module, manages engineering design and implementation | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/engineering-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/engineering-app/CHANGELOG.md) |
| **Finance Application** | `apps/finance-app` | Finance management module, handles financial data and reports | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/finance-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/finance-app/CHANGELOG.md) |
| **Operations Application** | `apps/operations-app` | Operations management module, handles daily operations | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/operations-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/operations-app/CHANGELOG.md) |
| **Personnel Application** | `apps/personnel-app` | Personnel management module, handles employee information and personnel management | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/personnel-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/personnel-app/CHANGELOG.md) |
| **Dashboard Application** | `apps/dashboard-app` | Data dashboard and report display | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/dashboard-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/dashboard-app/CHANGELOG.md) |

### Other Applications

| Application Name | Path | Function Description | Documentation Links |
|-----------------|------|---------------------|---------------------|
| **Mobile Application** | `apps/mobile-app` | Mobile application, supports Capacitor framework | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/mobile-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/mobile-app/CHANGELOG.md) |
| **Documentation Application** | `apps/docs-app` | Project documentation site (VitePress), provides complete development documentation | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/docs-app/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/apps/docs-app/CHANGELOG.md) |

---

## 📦 Shared Packages

All shared packages are located in the `packages/` directory and are reused by multiple applications:

### Core Packages

| Package Name | Path | Function Description | Documentation Links |
|--------------|------|---------------------|---------------------|
| **@btc/shared-core** | `packages/shared-core` | Core business logic package, provides basic functionality, CRUD services, plugin management, etc. | [Utilities Documentation](/en/packages/utils/shared-core) \| [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/shared-core/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/shared-core/CHANGELOG.md) |
| **@btc/shared-components** | `packages/shared-components` | Shared component library, provides reusable Vue components shared by all applications | [Components Documentation](/en/packages/components-overview) \| [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/shared-components/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/shared-components/CHANGELOG.md) |
| **@btc/shared-utils** | `packages/shared-utils` | Utility function library, provides common utility functions and helper methods | [Shared Utilities Documentation](/en/packages/utils/shared-utils) |
| **@btc/shared-router** | `packages/shared-router` | Router utilities package, provides route guards and router utility functions | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/shared-router/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/shared-router/CHANGELOG.md) |

### Build & Design

| Package Name | Path | Function Description | Documentation Links |
|--------------|------|---------------------|---------------------|
| **@btc/vite-plugin** | `packages/vite-plugin` | Vite plugin collection, provides build optimization and feature extensions | [Vite Plugin Documentation](/en/packages/plugins/vite-plugin) \| [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/vite-plugin/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/vite-plugin/CHANGELOG.md) |
| **design-tokens** | `packages/design-tokens` | Design tokens package, unified management of design system variables (colors, spacing, etc.) | [README](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/design-tokens/README.md) \| [CHANGELOG](https://github.com/BellisGit/btc-shopflow-monorepo/blob/develop/packages/design-tokens/CHANGELOG.md) |

---

## 🔌 Custom Plugins

### Vite Build Plugins (@btc/vite-plugin)

Located in `packages/vite-plugin`, provides feature extensions during Vite build:

#### 1. EPS (Endpoint Service) Plugin

- **Function**: Automatically generate API service layer from backend
- **Purpose**: Automatically generate TypeScript service code based on backend API definitions
- **Usage**:
  ```typescript
  import { service } from 'virtual:eps';
  await service.user.list({ page: 1 });
  ```
- **Detailed Documentation**: [Vite Plugin Documentation](/en/packages/plugins/vite-plugin)

#### 2. SVG Icon Plugin

- **Function**: Automatically scan and optimize SVG files, generate SVG sprite
- **Purpose**: Unified management of SVG icons in project, automatic optimization and naming
- **Features**:
  - Automatically scans all `.svg` files in `src/` directory
  - Uses `svgo` to optimize SVG code
  - Automatically generates icon names based on module names
- **Detailed Documentation**: [Vite Plugin Documentation](/en/packages/plugins/vite-plugin)

#### 3. Ctx Context Plugin

- **Function**: Automatically scan modules and get context information
- **Purpose**: Get all module lists and service language types in application
- **Usage**:
  ```typescript
  import ctx from 'virtual:ctx';
  console.log(ctx.modules); // ['user', 'order', 'product']
  ```
- **Detailed Documentation**: [Vite Plugin Documentation](/en/packages/plugins/vite-plugin)

#### 4. Tag Plugin

- **Function**: Automatically add name attribute to Vue components
- **Purpose**: Supports `<script setup name="ComponentName">` syntax, for Vue DevTools to display component names
- **Detailed Documentation**: [Vite Plugin Documentation](/en/packages/plugins/vite-plugin)

#### 5. Proxy Plugin

- **Function**: Proxy configuration management
- **Status**: To be implemented
- **Detailed Documentation**: [Vite Plugin Documentation](/en/packages/plugins/vite-plugin)

### Business Plugins (@btc/shared-components)

Located in `packages/shared-components/src/plugins/`, provides business feature extensions:

#### 1. Excel Plugin

- **Function**: Excel import/export functionality
- **Components**:
  - `BtcExportBtn` - Export button component
  - `BtcImportBtn` - Import button component
- **Detailed Documentation**: [Excel Plugin Documentation](/en/packages/plugins/excel-plugin)

#### 2. Code Plugin

- **Function**: Code display functionality
- **Components**:
  - `BtcCodeJson` - JSON code display component
- **Detailed Documentation**: [Component Package Documentation](/en/packages/components-overview)

#### 3. i18n Plugin

- **Function**: Internationalization support
- **Purpose**: Provides multi-language switching and translation functionality
- **Detailed Documentation**: [Internationalization Plugin Documentation](/en/packages/plugins/i18n-plugin)

#### 4. Theme Plugin

- **Function**: Theme switching functionality
- **Purpose**: Supports light/dark theme switching
- **Detailed Documentation**: [Component Package Documentation](/en/packages/components-overview)

#### 5. Message Plugin

- **Function**: Global message notifications
- **Component**: `BtcMessage` - Message notification component (global API)
- **Detailed Documentation**: [Message Component Documentation](/en/packages/components/btc-message)

#### 6. Notification Plugin

- **Function**: Global notification functionality
- **Component**: `BtcNotification` - Notification component (global API)
- **Detailed Documentation**: [Notification Component Documentation](/en/packages/components/btc-notification)

---

## 🧩 Custom Components

All custom components are located in `packages/shared-components`, using `btc-` prefix naming.

### CRUD Component System

Complete CRUD (Create, Read, Update, Delete) data operation solution:

| Component Name | Function Description | Documentation Links |
|---------------|---------------------|---------------------|
| **BtcCrud** | CRUD context component, provides global state management | [CRUD Documentation](/en/packages/components/btc-crud) |
| **BtcTable** | Data table component, supports sorting, filtering, pagination, etc. | [CRUD Documentation](/en/packages/components/btc-crud) |
| **BtcUpsert** | Add/Edit component, unified data operation interface | [CRUD Documentation](/en/packages/components/btc-crud) |
| **BtcPagination** | Pagination component | [CRUD Documentation](/en/packages/components/btc-crud) |
| **BtcAddBtn** | Add button | [CRUD Documentation](/en/packages/components/btc-crud) |
| **BtcRefreshBtn** | Refresh button | [CRUD Documentation](/en/packages/components/btc-crud) |
| **BtcMultiDeleteBtn** | Batch delete button | [CRUD Documentation](/en/packages/components/btc-crud) |

### General Components

| Component Name | Function Description | Documentation Links |
|---------------|---------------------|---------------------|
| **BtcButton** | Button component | [Component Package Documentation](/en/packages/components-overview) |
| **BtcSvg** | SVG icon component, provides unified icon management | [Component Package Documentation](/en/packages/components-overview) |
| **BtcContainer** | Container component, provides unified layout container | [Component Package Documentation](/en/packages/components-overview) |
| **BtcDialog** | Dialog and popup component, supports multiple interaction modes | [Dialog Documentation](/en/packages/components/btc-dialog) |
| **BtcForm** | Form component, supports complex form scenarios and validation | [Form Documentation](/en/packages/components/btc-form) |
| **BtcFormCard** | Form card component, for form grouping | [Component Package Documentation](/en/packages/components-overview) |
| **BtcFormTabs** | Form tabs component, for form pagination | [Component Package Documentation](/en/packages/components-overview) |
| **BtcSearch** | Search component, for quick search functionality | [Component Package Documentation](/en/packages/components-overview) |

### Business Components

| Component Name | Function Description | Documentation Links |
|---------------|---------------------|---------------------|
| **BtcMasterList** | General master list component, for handling master-detail relationship scenarios | [Component Package Documentation](/en/packages/components-overview) |
| **BtcCard** | Card component | [Component Package Documentation](/en/packages/components-overview) |
| **BtcTabs** | Tabs component | [Component Package Documentation](/en/packages/components-overview) |
| **BtcViewsTabsGroup** | View tabs group component, supports tab switching for multiple views | [Component Package Documentation](/en/packages/components-overview) |
| **BtcCascader** | Cascader component | [Component Package Documentation](/en/packages/components-overview) |
| **BtcMasterTableGroup** | Master list table group component, left MasterList + right CRUD table | [Component Package Documentation](/en/packages/components-overview) |
| **BtcDoubleGroup** | Double column group component, provides double left column + CRUD linkage | [Component Package Documentation](/en/packages/components-overview) |
| **BtcViewGroup** | View combination component, supports multiple view modes | [Component Package Documentation](/en/packages/components-overview) |
| **BtcGridGroup** | Grid group component, for grid layout | [Component Package Documentation](/en/packages/components-overview) |
| **BtcUpload** | File upload component | [Component Package Documentation](/en/packages/components-overview) |

### Chart Components

ECharts-based chart components:

| Component Name | Function Description | Documentation Links |
|---------------|---------------------|---------------------|
| **BtcLineChart** | Line chart component | [Component Package Documentation](/en/packages/components-overview) |
| **BtcBarChart** | Bar chart component | [Component Package Documentation](/en/packages/components-overview) |
| **BtcPieChart** | Pie chart component | [Component Package Documentation](/en/packages/components-overview) |

### Layout Components

Located in `apps/docs-app/components/layout/`:

| Component Name | Function Description | Documentation Links |
|---------------|---------------------|---------------------|
| **Breadcrumb** | Breadcrumb navigation component | [Layout Component Documentation](/en/components/layout/breadcrumb) |
| **DynamicMenu** | Dynamic menu component | [Layout Component Documentation](/en/components/layout/dynamic-menu) |
| **GlobalSearch** | Global search component | [Layout Component Documentation](/en/components/layout/global-search) |
| **LocaleSwitcher** | Language switcher component | [Layout Component Documentation](/en/components/layout/locale-switcher) |
| **MenuDrawer** | Menu drawer component | [Layout Component Documentation](/en/components/layout/menu-drawer) |
| **Process** | Process component | [Layout Component Documentation](/en/components/layout/process) |
| **Sidebar** | Sidebar component | [Layout Component Documentation](/en/components/layout/sidebar) |
| **ThemeSwitcher** | Theme switcher component | [Layout Component Documentation](/en/components/layout/theme-switcher) |
| **Topbar** | Topbar component | [Layout Component Documentation](/en/components/layout/topbar) |

---

## 🔗 Quick Links

### Development Guides

- [Environment Installation](./installation.md) - Development environment setup
- [Start Project](./quick-start.md) - Project startup guide
- [Project Structure](./project-structure.md) - Directory structure description
- [Documentation Index](./docs-index.md) - Index of all application and package READMEs and CHANGELOGs

### Documentation Navigation

- [Development Guides](/en/guides/) - Complete development guides
- [Component Documentation](/en/components/) - All component documentation
- [Shared Package Documentation](/en/packages/) - Shared package usage instructions
- [Version Changelog](/en/changelog/) - Project version update records
- [Architecture Decision Records (ADR)](/en/adr/) - Architecture design documentation
- [Standard Operating Procedures (SOP)](/en/sop/) - Development process documentation

---

## 📊 Project Statistics

- **Total Applications**: 14
  - Core Applications: 4
  - Business Applications: 9
  - Other Applications: 1

- **Total Shared Packages**: 6
  - Core Packages: 4
  - Build & Design: 2

- **Vite Plugins**: 5
  - Implemented: 4
  - To be Implemented: 1

- **Business Plugins**: 6

- **Custom Components**: 40+
  - CRUD Components: 7+
  - General Components: 10+
  - Business Components: 10+
  - Chart Components: 3
  - Layout Components: 9

---

## 🎯 Next Steps

After completing project overview, it's recommended to read:

1. [Environment Installation](./installation.md) - Start setting up development environment
2. [Start Project](./quick-start.md) - Start and run project
3. [Project Structure](./project-structure.md) - Deep dive into project organization
4. [Development Guides](/en/guides/) - View detailed development documentation

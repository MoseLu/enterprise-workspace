---
title: Project Structure
sidebar_label: Project Structure
sidebar_order: 3
---

# Project Structure

## Monorepo Structure Overview

```
btc-shopflow-monorepo/
├── apps/                    # Applications directory
│   ├── main-app/            # Main application (core application)
│   ├── admin-app/           # Admin backend application
│   ├── system-app/          # System management application
│   ├── logistics-app/       # Logistics application
│   ├── finance-app/         # Finance application
│   ├── quality-app/         # Quality application
│   ├── engineering-app/     # Engineering application
│   ├── production-app/      # Production application
│   ├── operations-app/      # Operations application
│   ├── dashboard-app/       # Dashboard application
│   ├── personnel-app/       # Personnel application
│   ├── docs-app/            # Documentation site (VitePress)
│   ├── layout-app/          # Layout application
│   ├── home-app/            # Home application
│   └── mobile-app/          # Mobile application
│
├── packages/                # Shared packages directory
│   ├── shared-core/         # Core utilities package
│   ├── shared-components/    # Shared components package
│   ├── shared-router/       # Router utilities package
│   ├── design-tokens/       # Design tokens package
│   └── vite-plugin/         # Vite plugin package
│
├── scripts/                 # Scripts directory
│   ├── i18n/               # i18n related scripts
│   └── commands/           # Command-line tools
│
├── configs/                 # Global configuration
├── auth/                    # Authentication related
└── k8s/                     # Kubernetes configuration
```

## Application Directory Structure

Each application follows a unified structure:

```
apps/{app-name}/
├── src/
│   ├── modules/            # Business modules
│   │   └── {module-name}/
│   │       ├── config.ts   # Module configuration
│   │       ├── views/      # View components
│   │       ├── composables/# Composables
│   │       └── index.ts    # Module exports
│   ├── plugins/            # Application plugins
│   ├── bootstrap/          # Startup configuration
│   ├── router/             # Route configuration
│   ├── locales/            # Internationalization
│   └── main.ts             # Entry file
├── docs/                    # Application-specific documentation
├── package.json
└── vite.config.ts
```

## Shared Package Structure

```
packages/{package-name}/
├── src/                     # Source code
├── docs/                    # Package documentation
├── README.md                # Package description
├── CHANGELOG.md             # Changelog
└── package.json
```

## Key Directory Descriptions

### apps/
All application code, each application runs independently, can also serve as micro-frontend sub-applications.

### packages/
Shared code packages, reused by multiple applications:
- `shared-core`: Core utilities, type definitions, utility functions
- `shared-components`: UI component library
- `shared-router`: Router utilities
- `design-tokens`: Design system tokens
- `vite-plugin`: Vite plugin collection

### scripts/
Project-level script tools:
- `i18n/`: Internationalization scripts
- `commands/`: Command-line tools

## Module System

### Module Directory Structure

```
modules/{module-name}/
├── config.ts                # Module configuration (routes, i18n, etc.)
├── views/                   # View components
│   └── index.vue
├── composables/             # Composables
│   └── useModule.ts
├── utils/                   # Utility functions (optional)
└── index.ts                 # Module exports
```

### Module Configuration

Each module's `config.ts` contains:
- Module metadata (name, label, order)
- Route configuration (views)
- Internationalization configuration (locale)
- Table/form configuration (columns, forms)

## Related Documentation

- [Development Guides](/en/guides/) - Application development guides
- [Component Documentation](/en/components/) - Component usage instructions
- [Shared Packages](/en/packages/) - Shared package documentation

---
title: Plugin Package Documentation
type: package
project: plugins
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- packages
- plugins
sidebar_label: Plugin Packages
sidebar_order: 3
sidebar_group: packages
---

# Plugin Package Documentation

This section contains detailed documentation for all plugin packages, providing extended functionality and third-party integration solutions

## Plugin List

### Functional Plugins
- **[Excel Plugin](/en/packages/plugins/excel-plugin)** - Excel import/export functionality, supports data transformation and formatting
- **[Internationalization Plugin](/en/packages/plugins/i18n-plugin)** - Multi-language support, provides complete internationalization solution
- **[Plugin Manager](/en/packages/plugins/plugin-manager)** - Plugin management system, supports dynamic loading and configuration of plugins

### Build Plugins
- **[Vite Plugin](/en/packages/plugins/vite-plugin)** - Vite build tool plugin, provides build optimization and feature extensions

---

## Plugin Features

### 1. Modular Design
- Independent plugin packages
- Clear API interfaces
- Flexible configuration options

### 2. Extensibility
- Supports custom plugins
- Plugin combination usage
- Dynamic loading mechanism

### 3. Compatibility
- Backward compatibility guarantee
- Smooth version upgrades
- Multi-environment support

---

## Plugin Architecture

### Plugin System
```
Plugin Manager (Plugin Manager)

Core Plugins (Core Plugins)

Custom Plugins (Custom Plugins)
```

### Lifecycle
1. **Initialization**: Plugin registration and configuration
2. **Activation**: Plugin functionality enabled
3. **Execution**: Plugin functionality executed
4. **Destruction**: Plugin resource cleanup

---

## Installation and Usage

### Install Plugin Manager
```bash
pnpm add @btc/plugin-manager
```

### Install Functional Plugins
```bash
# Excel plugin
pnpm add @btc/excel-plugin

# Internationalization plugin
pnpm add @btc/i18n-plugin
```

### Usage Example
```typescript
// Initialize plugin manager
import { PluginManager } from '@btc/plugin-manager'

// Register plugins
import { ExcelPlugin } from '@btc/excel-plugin'
import { I18nPlugin } from '@btc/i18n-plugin'

const manager = new PluginManager()
manager.register(new ExcelPlugin())
manager.register(new I18nPlugin())
```

---

## Plugin Development

### Plugin Interface
```typescript
interface Plugin {
name: string
version: string
install(): void
uninstall(): void
}
```

### Plugin Configuration
```typescript
interface PluginConfig {
enabled: boolean
options: Record<string, any>
}
```

---

## Related Documentation

- [Plugin Development Guide](/en/guides/plugins)
- [Plugin API Documentation](/api/plugins)
- [Plugin Configuration Guide](/en/guides/plugin-config)

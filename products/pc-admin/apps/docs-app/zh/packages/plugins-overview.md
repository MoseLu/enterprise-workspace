---
title: 插件包文档
type: package
project: plugins
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- packages
- plugins
sidebar_label: 插件包
sidebar_order: 3
sidebar_group: packages
---

# 插件包文档

本部分包含了所有插件包的详细文档，提供扩展功能和第三方集成的解决方案

## 插件列表

### 功能插件
- **[Excel插件](/zh/packages/plugins/excel-plugin)** - Excel导入导出功能，支持数据转换和格式化
- **[国际化插件](/zh/packages/plugins/i18n-plugin)** - 多语言支持，提供完整的国际化解决方案
- **[插件管理器](/zh/packages/plugins/plugin-manager)** - 插件管理系统，支持插件的动态加载和配置

### 构建插件
- **[Vite插件](/zh/packages/plugins/vite-plugin)** - Vite构建工具插件，提供构建优化和功能扩展

---

## 插件特性

### 1. 模块化设计
- 独立的插件包
- 清晰的API接口
- 灵活的配置选项

### 2. 扩展性
- 支持自定义插件
- 插件组合使用
- 动态加载机制

### 3. 兼容性
- 向后兼容保证
- 版本升级平滑
- 多环境支持

---

## 插件架构

### 插件系统
```
Plugin Manager (插件管理器)

Core Plugins (核心插件)

Custom Plugins (自定义插件)
```

### 生命周期
1. **初始化**：插件注册和配置
2. **激活**：插件功能启用
3. **运行**：插件功能执行
4. **销毁**：插件资源清理

---

## 安装使用

### 安装插件管理器
```bash
pnpm add @btc/plugin-manager
```

### 安装功能插件
```bash
# Excel插件
pnpm add @btc/excel-plugin

# 国际化插件
pnpm add @btc/i18n-plugin
```

### 使用示例
```typescript
// 初始化插件管理器
import { PluginManager } from '@btc/plugin-manager'

// 注册插件
import { ExcelPlugin } from '@btc/excel-plugin'
import { I18nPlugin } from '@btc/i18n-plugin'

const manager = new PluginManager()
manager.register(new ExcelPlugin())
manager.register(new I18nPlugin())
```

---

## 开发插件

### 插件接口
```typescript
interface Plugin {
name: string
version: string
install(): void
uninstall(): void
}
```

### 插件配置
```typescript
interface PluginConfig {
enabled: boolean
options: Record<string, any>
}
```

---

## 相关文档

- [插件开发指南](/zh/guides/plugins)
- [插件API文档](/api/plugins)
- [插件配置说明](/zh/guides/plugin-config)

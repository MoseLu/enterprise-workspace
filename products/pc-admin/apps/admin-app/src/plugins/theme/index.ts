import type { Plugin } from '@btc/shared-core';
import { definePluginConfig } from '@btc/shared-core';

/**
 * 主题插件（已迁移到用户设置插件）
 * 此插件已不再提供工具栏功能，主题切换功能已整合到用户设置插件中
 */
export const themePlugin: Plugin = {
  name: 'theme',
  version: '1.0.0',
  description: 'Theme switching plugin (migrated to user-setting plugin)',
  order: 15,

  // 插件配置元数据
  config: definePluginConfig({
    label: 'Theme Switching',
    description: 'Provides light/dark theme switching and custom theme configuration (integrated into user settings)',
    author: 'BTC Team',
    version: '1.0.0',
    updateTime: '2024-01-15',
    category: 'core',
    tags: ['theme', 'dark-mode', 'light-mode'],
    recommended: true,
  }),

  // 不再提供工具栏配置，功能已整合到用户设置插件
};

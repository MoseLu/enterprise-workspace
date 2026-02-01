import type { Plugin } from '@btc/shared-core';
import { definePluginConfig } from '@btc/shared-core';

/**
 * 国际化插件（工具栏版本）
 */
export const i18nPlugin: Plugin = {
  name: 'i18n',
  version: '1.0.0',
  description: 'Internationalization plugin',
  order: 5,

  // 插件配置元数据
  config: definePluginConfig({
    label: '国际化',
    description: '提供多语言切换和国际化支持',
    author: 'BTC Team',
    version: '1.0.0',
    updateTime: '2024-01-15',
    category: 'core',
    tags: ['i18n', 'language', 'locale', 'toolbar'],
    recommended: true,
  }),

  // 工具栏配置
  toolbar: {
    order: 2, // GitHub之后
    pc: true,
    h5: true,
    component: () => import('@btc/shared-components/components/layout/app-layout/locale-switcher/index.vue')
  }
};


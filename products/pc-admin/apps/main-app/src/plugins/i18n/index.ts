import type { Plugin } from '@btc/shared-core';
import { definePluginConfig } from '@btc/shared-core';

/**
 * 国际化插件（工具栏版本）
 * 全局强管控型插件：主应用独占加载+操作，子应用仅消费状态
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
    order: 2, // GitHub 之后，优先级较高
    pc: true,
    h5: true, // 移动端也显示
    component: () => import('@btc/shared-components/components/layout/app-layout/locale-switcher/index.vue'),
  },
};

// 导出插件定义（供 module-scanner 扫描）
export default i18nPlugin;


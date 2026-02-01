/**
 * 海关模块配置
 */

import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  // ModuleConfig 字段
  name: 'customs',
  label: 'common.module.customs.label',
  order: 60,

  // 路由配置
  views: [
    {
      path: '/customs',
      name: 'LogisticsCustoms',
      component: () => import('./views/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.customs_module',
      },
    },
  ],

  // PageConfig 字段（保留）
  locale: {
    'zh-CN': {
      // 菜单配置
      'menu.customs_module': '海关模块',
      // 页面占位符
      'customs.placeholder': '海关模块页面内容待建设',
      'page.customs.placeholder': '海关模块页面内容待建设',
    },
    'en-US': {
      // 菜单配置
      'menu.customs_module': 'Customs Module',
      // 页面占位符
      'customs.placeholder': 'Customs module page is under construction',
      'page.customs.placeholder': 'Customs module page is under construction',
    },
  },

  columns: {},

  forms: {},

  service: {},
} satisfies ModuleConfig;

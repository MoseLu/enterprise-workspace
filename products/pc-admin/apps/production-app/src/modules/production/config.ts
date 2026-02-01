/**
 * 生产模块配置
 */

import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  // ModuleConfig 字段
  name: 'production',
  label: 'common.module.production.label',
  order: 80,

  // 路由配置
  views: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue'),
      meta: {
        isHome: true,
      },
    },
  ],

  // PageConfig 字段（保留）
  locale: {
    'zh-CN': {
      // 菜单配置（暂时为空，待后续添加）
    },
    'en-US': {
      // 菜单配置（暂时为空，待后续添加）
    },
  },

  columns: {},

  forms: {},

  service: {},
} satisfies ModuleConfig;

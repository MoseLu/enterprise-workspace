/**
 * 工程模块配置
 */

import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  // ModuleConfig 字段
  name: 'engineering',
  label: 'common.module.engineering.label',
  order: 110,

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

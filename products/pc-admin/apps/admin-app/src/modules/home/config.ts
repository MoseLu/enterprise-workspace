import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  // ModuleConfig 字段
  name: 'home',
  label: 'common.module.home.label',
  order: 0,

  // 路由配置
  views: [
    {
      path: '/',
      name: 'AdminHome',
      component: () => import('./views/index.vue'),
      meta: {
        isHome: true,
        titleKey: 'menu.home',
        isPage: true,
      },
    },
  ],

  // PageConfig 字段（必需）
  locale: {
    'zh-CN': {},
    'en-US': {},
  },
} satisfies ModuleConfig;

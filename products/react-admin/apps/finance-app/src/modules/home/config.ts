import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  name: 'home',
  label: 'common.module.home.label',
  order: 0,
  views: [
    {
      path: '/',
      name: 'FinanceHome',
      component: () => import('./views/index'),
      meta: {
        isHome: true,
        process: false,
        isPage: true,
      },
    },
  ],
  locale: {
    'zh-CN': {},
    'en-US': {},
  },
} satisfies ModuleConfig;

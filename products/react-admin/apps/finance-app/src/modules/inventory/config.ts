import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  name: 'inventory',
  label: 'common.module.inventory.label',
  order: 50,
  views: [
    {
      path: '/inventory',
      name: 'FinanceInventory',
      component: () => import('./views/index'),
      meta: {
        isPage: true,
        labelKey: 'menu.finance.inventory_management',
      },
    },
    {
      path: '/inventory/result',
      name: 'FinanceInventoryResult',
      component: () => import('./views/result'),
      meta: {
        isPage: true,
        labelKey: 'menu.finance.inventory_management.result',
      },
    },
  ],
  locale: {
    'zh-CN': {
      'menu.finance.inventory_management': '盘点管理',
      'menu.finance.inventory_management.result': '盘点结果',
    },
    'en-US': {
      'menu.finance.inventory_management': 'Inventory Management',
      'menu.finance.inventory_management.result': 'Inventory Result',
    },
  },
} satisfies ModuleConfig;

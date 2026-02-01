/**
 * 测试模块配置
 * 包含测试页面相关的国际化配置
 */

import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  // ModuleConfig 字段
  name: 'test',
  label: 'common.module.test.label',
  order: 999,

  // 路由配置
  views: [
    {
      path: '/test/components',
      name: 'AdminTestComponents',
      component: () => import('./views/components/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test_features.components',
      },
    },
    {
      path: '/test/api-test-center',
      name: 'AdminApiTestCenter',
      component: () => import('./views/api-test-center/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test_features.api_test_center',
      },
    },
    {
      path: '/test/inventory-ticket-print',
      name: 'AdminInventoryTicketPrint',
      component: () => import('./views/inventory-ticket-print/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test_features.inventory_ticket_print',
      },
    },
    {
      path: '/test/filter-list-test',
      name: 'AdminFilterListTest',
      component: () => import('./views/filter-list-test/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test_features.filter_list_test',
      },
    },
    {
      path: '/test/column-layout-test',
      name: 'AdminColumnLayoutTest',
      component: () => import('./views/column-layout-test/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test_features.column_layout_test',
      },
    },
    {
      path: '/test/multi-column-layout-test',
      name: 'AdminMultiColumnLayoutTest',
      component: () => import('./views/double-layout-test/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.test_features.multi_column_layout_test',
      },
    },
  ],

  // PageConfig 字段（保留）
  // 国际化配置（扁平结构）
  locale: {
    'zh-CN': {
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title 和 right-title）
      'title.inventory.dataSource.domains': '域列表',
      'title.inventory.dataSource.domains.select_required': '请先选择左侧域',
    },
    'en-US': {
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title  and right-title）
      'title.inventory.dataSource.domains': 'Domain List',
      'title.inventory.dataSource.domains.select_required': 'Please select a domain on the left first',
    },
  },
} satisfies ModuleConfig;

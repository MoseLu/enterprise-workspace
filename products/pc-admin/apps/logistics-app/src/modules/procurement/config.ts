/**
 * 采购模块配置
 */

import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  // ModuleConfig 字段
  name: 'procurement',
  label: 'common.module.procurement.label',
  order: 30,

  // 路由配置
  views: [
    {
      path: '/procurement',
      name: 'LogisticsProcurement',
      component: () => import('./views/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.procurement',
      },
    },
    {
      path: '/procurement/auxiliary',
      name: 'LogisticsProcurementAuxiliary',
      component: () => import('./views/auxiliary/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.procurement.auxiliary',
      },
    },
    {
      path: '/procurement/packaging',
      name: 'LogisticsProcurementPackaging',
      component: () => import('./views/packaging/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.procurement.packaging',
      },
    },
    {
      path: '/procurement/supplier',
      name: 'LogisticsProcurementSupplier',
      component: () => import('./views/supplier/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.procurement.supplier',
      },
    },
  ],

  // PageConfig 字段（保留）
  locale: {
    'zh-CN': {
      // 菜单配置
      'menu.procurement': '采购模块',
      'menu.procurement.auxiliary': '辅料管理',
      'menu.procurement.packaging': '包材管理',
      'menu.procurement.supplier': '供应商管理',
      // 页面占位符
      'procurement.placeholder.auxiliary': '辅料管理页面内容待建设',
      'procurement.placeholder.packaging': '包材管理页面内容待建设',
      'procurement.placeholder.supplier': '供应商管理页面内容待建设',
      // 页面占位符（带page前缀，用于页面组件）
      'page.procurement.placeholder.auxiliary': '辅料管理页面内容待建设',
      'page.procurement.placeholder.packaging': '包材管理页面内容待建设',
      'page.procurement.placeholder.supplier': '供应商管理页面内容待建设',
    },
    'en-US': {
      // 菜单配置
      'menu.procurement': 'Procurement Module',
      'menu.procurement.auxiliary': 'Auxiliary Management',
      'menu.procurement.packaging': 'Packaging Management',
      'menu.procurement.supplier': 'Supplier Management',
      // 页面占位符
      'procurement.placeholder.auxiliary': 'Auxiliary material management page is under construction',
      'procurement.placeholder.packaging': 'Packaging material management page is under construction',
      'procurement.placeholder.supplier': 'Supplier management page is under construction',
      // 页面占位符（带page前缀，用于页面组件）
      'page.procurement.placeholder.auxiliary': 'Auxiliary material management page is under construction',
      'page.procurement.placeholder.packaging': 'Packaging material management page is under construction',
      'page.procurement.placeholder.supplier': 'Supplier management page is under construction',
    },
  },

  columns: {},

  forms: {},

  service: {},
} satisfies ModuleConfig;

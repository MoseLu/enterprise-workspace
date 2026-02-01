/**
 * 仓储模块配置
 * 包含 material、config 等页面配置
 */

import type { ModuleConfig } from '@btc/shared-core/types/module';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { createCrudServiceFromEps } from '@btc/shared-core';

// 延迟获取 service，避免在 EPS 服务初始化前访问导致循环依赖
function getService() {
  if (typeof window !== 'undefined') {
    return (window as any).__APP_EPS_SERVICE__ || (window as any).service || (window as any).__BTC_SERVICE__;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const epsModule = require('@services/eps');
    return epsModule.service || epsModule.default || {};
  } catch {
    return {};
  }
}

export default {
  // ModuleConfig 字段
  name: 'warehouse',
  label: 'common.module.warehouse.label',
  order: 10,

  // 路由配置
  views: [
    {
      path: '/warehouse',
      name: 'LogisticsWarehouse',
      component: () => import('./views/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.warehouse',
      },
    },
    {
      path: '/warehouse/material',
      name: 'LogisticsWarehouseMaterial',
      component: () => import('./views/material/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.warehouse.material',
      },
    },
    {
      path: '/inventory/storage-location',
      name: 'LogisticsInventoryStorageLocation',
      component: () => import('./views/config/storage-location/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.inventory_management.storage_location',
      },
    },
  ],

  // PageConfig 字段（保留）
  locale: {
    'zh-CN': {
      // 菜单配置
      'menu.warehouse': '仓储模块',
      'menu.warehouse.material': '物料清单表',
    },
    'en-US': {
      // 菜单配置
      'menu.warehouse': 'Warehouse Module',
      'menu.warehouse.material': 'Material List',
    },
  },

  columns: {
    'logistics.warehouse.material.list': [
      { type: 'selection', width: 48 },
      { prop: 'materialCode', label: 'common.warehouse.material.fields.material_code', showOverflowTooltip: true },
      { prop: 'materialName', label: 'common.warehouse.material.fields.material_name', showOverflowTooltip: true },
      { prop: 'materialType', label: 'common.warehouse.material.fields.material_type', showOverflowTooltip: true },
      { prop: 'specification', label: 'common.warehouse.material.fields.specification', showOverflowTooltip: true },
      { prop: 'materialTexture', label: 'common.warehouse.material.fields.material_texture', showOverflowTooltip: true },
      { prop: 'unit', label: 'common.warehouse.material.fields.unit', width: 100 },
      { prop: 'supplierName', label: 'common.warehouse.material.fields.supplier_name', showOverflowTooltip: true },
      { prop: 'unitPrice', label: 'common.warehouse.material.fields.unit_price' },
      { prop: 'taxRate', label: 'common.warehouse.material.fields.tax_rate' },
      { prop: 'totalPrice', label: 'common.warehouse.material.fields.total_price' },
      { prop: 'createdAt', label: 'common.warehouse.material.fields.created_at', width: 180 },
      { prop: 'updatedAt', label: 'common.warehouse.material.fields.updated_at', width: 180 },
    ] as TableColumn[],

  },

  forms: {
    'logistics.warehouse.material.list': [
      { prop: 'materialCode', label: 'common.warehouse.material.fields.material_code', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'materialName', label: 'common.warehouse.material.fields.material_name', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'materialType', label: 'common.warehouse.material.fields.material_type', span: 12, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'specification', label: 'common.warehouse.material.fields.specification', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'materialTexture', label: 'common.warehouse.material.fields.material_texture', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'unit', label: 'common.warehouse.material.fields.unit', span: 12, component: { name: 'el-input', props: { maxlength: 20 } } },
      { prop: 'supplierCode', label: 'common.warehouse.material.fields.supplier_code', span: 12, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'supplierName', label: 'common.warehouse.material.fields.supplier_name', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'unitPrice', label: 'common.warehouse.material.fields.unit_price', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 2, controlsPosition: 'right' } } },
      { prop: 'taxRate', label: 'common.warehouse.material.fields.tax_rate', span: 12, component: { name: 'el-input-number', props: { min: 0, max: 1, step: 0.01, controlsPosition: 'right' } } },
      { prop: 'totalPrice', label: 'common.warehouse.material.fields.total_price', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 2, controlsPosition: 'right' } } },
      { prop: 'barCode', label: 'common.warehouse.material.fields.bar_code', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'safetyStock', label: 'common.warehouse.material.fields.safety_stock', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 0, controlsPosition: 'right' } } },
      { prop: 'storageRequirement', label: 'common.warehouse.material.fields.storage_requirement', span: 24, component: { name: 'el-input', props: { maxlength: 255, type: 'textarea', rows: 2 } } },
      { prop: 'expireCycle', label: 'common.warehouse.material.fields.expire_cycle', span: 12, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'remark', label: 'common.warehouse.material.fields.remark', span: 24, component: { name: 'el-input', props: { maxlength: 255, type: 'textarea', rows: 2 } } },
    ] as FormItem[],

  },

  service: {
    get material() {
      return createCrudServiceFromEps(['logistics', 'warehouse', 'material'], getService());
    },
  },
} satisfies ModuleConfig;

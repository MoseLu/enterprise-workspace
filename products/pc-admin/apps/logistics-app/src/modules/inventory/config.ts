/**
 * 盘点模块配置
 * 包含 info、detail、result 等页面配置
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
  name: 'inventory',
  label: 'common.module.inventory.label',
  order: 50,

  // 路由配置
  views: [
    {
      path: '/inventory',
      name: 'LogisticsInventory',
      component: () => import('./views/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.inventory_management',
      },
    },
    {
      path: '/inventory/info',
      name: 'LogisticsInventoryInfo',
      component: () => import('./views/info/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.inventory_management.info',
      },
    },
    {
      path: '/inventory/detail',
      name: 'LogisticsInventoryDetail',
      component: () => import('./views/detail/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.inventory_management.detail',
      },
    },
    {
      path: '/inventory/result',
      name: 'LogisticsInventoryResult',
      component: () => import('./views/result/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.inventory_management.result',
      },
    },
  ],

  // PageConfig 字段（保留）
  locale: {
    'zh-CN': {
      // 菜单配置
      'menu.inventory_management': '盘点管理',
      'menu.inventory_management.storage_location': '仓位管理',
      'menu.inventory_management.info': '盘点基础表',
      'menu.inventory_management.detail': '盘点差异表',
      'menu.inventory_management.result': '盘点结果表',
      // 页面标题
      'inventory.check.list': '盘点列表',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title 和 right-title）
      'title.logistics.inventory.check.list': '盘点列表',
      // 按钮
      'logistics.inventory.base.button.pull': '拉取数据',
      // 错误消息
      'logistics.inventory.base.pull.failed': '拉取数据失败',
      // 搜索占位符
      'logistics.inventory.result.search_placeholder': '请输入物料编码、仓位等信息',
      // 盘点差异表搜索字段占位符
      'logistics.inventory.diff.fields.material_code': '物料编码',
      'logistics.inventory.diff.fields.position': '仓位',
    },
    'en-US': {
      // 菜单配置
      'menu.inventory_management': 'Inventory Management',
      'menu.inventory_management.storage_location': 'Storage Location Management',
      'menu.inventory_management.info': 'Inventory Base Table',
      'menu.inventory_management.detail': 'Inventory Variance',
      'menu.inventory_management.result': 'Inventory Result',
      // 页面标题
      'inventory.check.list': 'Inventory Check List',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title  and right-title）
      'title.logistics.inventory.check.list': 'Inventory Check List',
      // 按钮
      'logistics.inventory.base.button.pull': 'Pull Data',
      // 错误消息
      'logistics.inventory.base.pull.failed': 'Failed to pull data',
      // 搜索占位符
      'logistics.inventory.result.search_placeholder': 'Please enter material code, storage location, etc.',
      // 盘点差异表搜索字段占位符
      'logistics.inventory.diff.fields.material_code': 'Material Code',
      'logistics.inventory.diff.fields.position': 'Position',
    },
  },

  columns: {
    'logistics.inventory.info': [
      { type: 'index', label: 'common.index', width: 80 },
      { prop: 'checkNo', label: 'common.inventory.info.fields.check_no', showOverflowTooltip: true },
      { prop: 'domainId', label: 'common.inventory.info.fields.domain_id', showOverflowTooltip: true },
      { prop: 'checkType', label: 'common.inventory.info.fields.check_type', showOverflowTooltip: true },
      { prop: 'checkStatus', label: 'common.inventory.info.fields.check_status', showOverflowTooltip: true },
      { prop: 'startTime', label: 'common.inventory.info.fields.start_time', width: 180 },
      { prop: 'endTime', label: 'common.inventory.info.fields.end_time', width: 180 },
      { prop: 'checkerId', label: 'common.inventory.info.fields.checker_id', showOverflowTooltip: true },
      { prop: 'remark', label: 'common.inventory.info.fields.remark', showOverflowTooltip: true },
      { prop: 'createdAt', label: 'common.inventory.info.fields.created_at', width: 180 },
      { prop: 'updateAt', label: 'common.inventory.info.fields.update_at', width: 180 },
    ] as TableColumn[],

    'logistics.inventory.detail': [
      { type: 'index', label: 'common.index', width: 80 },
      { prop: 'materialCode', label: 'common.inventory.detail.fields.material_code', showOverflowTooltip: true },
      { prop: 'diffReason', label: 'common.inventory.detail.fields.diff_reason', showOverflowTooltip: true },
      { prop: 'processPerson', label: 'common.inventory.detail.fields.process_person' },
      { prop: 'processTime', label: 'common.inventory.detail.fields.process_time', width: 180 },
      { prop: 'processRemark', label: 'common.inventory.detail.fields.process_remark', showOverflowTooltip: true },
    ] as TableColumn[],

    'logistics.inventory.result': [
      { type: 'selection', width: 48 },
      { type: 'index', label: 'common.index', width: 80 },
      { prop: 'materialCode', label: 'common.inventory.result.fields.material_code', showOverflowTooltip: true },
      { prop: 'position', label: 'common.inventory.result.fields.position', showOverflowTooltip: true },
      { prop: 'bookQty', label: 'common.inventory.result.fields.book_qty' },
      { prop: 'actualQty', label: 'common.inventory.result.fields.actual_qty' },
      { prop: 'diffQty', label: 'common.inventory.result.fields.diff_qty' },
    ] as TableColumn[],

    'logistics.inventory.info.subProcess': [
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'subProcessNo', label: 'common.inventory.sub_process.fields.sub_process_no', showOverflowTooltip: true },
      { prop: 'checkStatus', label: 'common.inventory.sub_process.fields.check_status', showOverflowTooltip: true },
      { prop: 'startTime', label: 'common.inventory.sub_process.fields.start_time', width: 180 },
      { prop: 'endTime', label: 'common.inventory.sub_process.fields.end_time', width: 180 },
      { prop: 'remainingSeconds', label: 'common.inventory.sub_process.fields.remaining_seconds' },
      { prop: 'parentProcessNo', label: 'common.inventory.sub_process.fields.parent_process_no', showOverflowTooltip: true },
      { prop: 'createdAt', label: 'common.inventory.info.fields.created_at', width: 180 },
      { prop: 'updatedAt', label: 'common.inventory.info.fields.update_at', width: 180 },
    ] as TableColumn[],

    'logistics.inventory.detail.export': [
      { prop: 'materialCode', label: 'common.inventory.detail.fields.material_code' },
      { prop: 'position', label: 'common.inventory.detail.fields.position' },
      { prop: 'diffQty', label: 'common.inventory.detail.fields.diff_qty' },
      { prop: 'diffReason', label: 'common.inventory.detail.fields.diff_reason' },
      { prop: 'processPerson', label: 'common.inventory.detail.fields.process_person' },
      { prop: 'processTime', label: 'common.inventory.detail.fields.process_time' },
      { prop: 'processRemark', label: 'common.inventory.detail.fields.process_remark' },
    ] as TableColumn[],

    'logistics.inventory.storage-location': [
      { type: 'selection', width: 48 },
      { prop: 'name', label: 'common.inventory.storage_location.fields.name', showOverflowTooltip: true },
      { prop: 'position', label: 'common.inventory.storage_location.fields.position', showOverflowTooltip: true },
      { prop: 'description', label: 'common.inventory.storage_location.fields.description', showOverflowTooltip: true },
      { prop: 'createdAt', label: 'common.inventory.storage_location.fields.createdAt', width: 180 },
      { prop: 'updatedAt', label: 'common.inventory.storage_location.fields.updatedAt', width: 180 },
    ] as TableColumn[],
  },

  forms: {
    'logistics.inventory.info': [
      { prop: 'checkNo', label: 'common.inventory.info.fields.check_no', span: 24, required: true, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'domainId', label: 'common.inventory.info.fields.domain_id', span: 24, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'checkType', label: 'common.inventory.info.fields.check_type', span: 24, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'checkStatus', label: 'common.inventory.info.fields.check_status', span: 24, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'startTime', label: 'common.inventory.info.fields.start_time', span: 12, component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } } },
      { prop: 'endTime', label: 'common.inventory.info.fields.end_time', span: 12, component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } } },
      { prop: 'checkerId', label: 'common.inventory.info.fields.checker_id', span: 24, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'remark', label: 'common.inventory.info.fields.remark', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 2, maxlength: 255 } } },
    ] as FormItem[],

    'logistics.inventory.detail': [
      { prop: 'checkNo', label: 'common.inventory.detail.fields.check_no', span: 24, component: { name: 'el-input', props: { readonly: true } } },
      { prop: 'materialCode', label: 'common.inventory.detail.fields.material_code', span: 24, component: { name: 'el-input', props: { readonly: true, maxlength: 120 } } },
      { prop: 'position', label: 'common.inventory.detail.fields.position', span: 24, component: { name: 'el-input', props: { readonly: true, maxlength: 120 } } },
      { prop: 'diffQty', label: 'common.inventory.detail.fields.diff_qty', span: 24, component: { name: 'el-input-number', props: { readonly: true, controlsPosition: 'right' } } },
      { prop: 'diffReason', label: 'common.inventory.detail.fields.diff_reason', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 2, maxlength: 255, readonly: true } } },
      { prop: 'processPerson', label: 'common.inventory.detail.fields.process_person', span: 24, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'processTime', label: 'common.inventory.detail.fields.process_time', span: 24, component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } } },
      { prop: 'processRemark', label: 'common.inventory.detail.fields.process_remark', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 2, maxlength: 255 } } },
    ] as FormItem[],

    'logistics.inventory.result': [
      { prop: 'baseId', label: 'common.inventory.check.fields.base_id', span: 24, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'materialCode', label: 'common.inventory.check.fields.material_code', span: 24, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'materialName', label: 'common.inventory.check.fields.material_name', span: 24, component: { name: 'el-input', props: { maxlength: 200 } } },
      { prop: 'specification', label: 'common.inventory.check.fields.specification', span: 24, component: { name: 'el-input', props: { maxlength: 200 } } },
      { prop: 'unit', label: 'common.inventory.check.fields.unit', span: 24, component: { name: 'el-input', props: { maxlength: 20 } } },
      { prop: 'batchNo', label: 'common.inventory.check.fields.batch_no', span: 24, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'bookQty', label: 'common.inventory.check.fields.book_qty', span: 24, component: { name: 'el-input', props: { maxlength: 50 } } },
      { prop: 'actualQty', label: 'common.inventory.check.fields.actual_qty', span: 24, component: { name: 'el-input', props: { maxlength: 50 } } },
      { prop: 'storageLocation', label: 'common.inventory.check.fields.storage_location', span: 24, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'diffQty', label: 'common.inventory.check.fields.diff_qty', span: 24, component: { name: 'el-input', props: { maxlength: 50 } } },
      { prop: 'diffRate', label: 'common.inventory.check.fields.diff_rate', span: 24, component: { name: 'el-input', props: { maxlength: 50 } } },
      { prop: 'checkerId', label: 'common.inventory.check.fields.checker_id', span: 24, component: { name: 'el-input', props: { maxlength: 120 } } },
      {
        prop: 'isDiff',
        label: 'common.inventory.check.fields.is_diff',
        span: 24,
        component: {
          name: 'el-select',
          props: {
            clearable: true,
          },
          options: [
            { label: 'common.enabled', value: 1 },
            { label: 'common.disabled', value: 0 },
          ],
        },
      },
      { prop: 'remark', label: 'common.inventory.check.fields.remark', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3, maxlength: 500 } } },
    ] as FormItem[],

    'logistics.inventory.info.subProcess': [
      { prop: 'subProcessNo', label: 'common.inventory.sub_process.fields.sub_process_no', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'parentProcessNo', label: 'common.inventory.sub_process.fields.parent_process_no', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'checkStatus', label: 'common.inventory.sub_process.fields.check_status', span: 12, component: { name: 'el-select', props: { clearable: true, placeholder: 'common.pleaseSelect' } } },
      { prop: 'startTime', label: 'common.inventory.sub_process.fields.start_time', span: 12, component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } } },
      { prop: 'endTime', label: 'common.inventory.sub_process.fields.end_time', span: 12, component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } } },
      { prop: 'remainingSeconds', label: 'common.inventory.sub_process.fields.remaining_seconds', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 0, controlsPosition: 'right' } } },
    ] as FormItem[],

    'logistics.inventory.storage-location': [
      { prop: 'name', label: 'common.inventory.storage_location.fields.name', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'position', label: 'common.inventory.storage_location.fields.position', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'description', label: 'common.inventory.storage_location.fields.description', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3, maxlength: 500 } } },
      { prop: 'domainId', label: 'common.inventory.storage_location.fields.domain_id', span: 24, component: { name: 'el-select', props: { clearable: true, placeholder: 'common.pleaseSelect' } } },
    ] as FormItem[],
  },

  service: {
    get info() {
      return createCrudServiceFromEps(['logistics', 'warehouse', 'check'], getService());
    },
    get detail() {
      return createCrudServiceFromEps(['logistics', 'warehouse', 'diff'], getService());
    },
    get result() {
      return createCrudServiceFromEps(['logistics', 'base', 'check'], getService());
    },
    get checkList() {
      return getService()?.logistics?.warehouse?.check;
    },
    get storageLocation() {
      return createCrudServiceFromEps(['logistics', 'base', 'position'], getService());
    },
  },
} satisfies ModuleConfig;

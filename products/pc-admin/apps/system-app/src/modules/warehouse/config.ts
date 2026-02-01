/**
 * 仓储模块配置
 * 包含 material、inventory 等页面的配置
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

  // PageConfig 字段（保留）
  locale: {
    'zh-CN': {
      // 物料
      'warehouse.material.fields.material_code': '物料编码',
      'warehouse.material.fields.material_name': '物料名称',
      'warehouse.material.fields.material_type': '物料类型',
      'warehouse.material.fields.specification': '规格型号',
      'warehouse.material.fields.material_texture': '材质',
      'warehouse.material.fields.unit': '单位',
      'warehouse.material.fields.supplier_code': '供应商编码',
      'warehouse.material.fields.supplier_name': '供应商名称',
      'warehouse.material.fields.unit_price': '单价',
      'warehouse.material.fields.tax_rate': '税率',
      'warehouse.material.fields.total_price': '含税总价',
      'warehouse.material.fields.bar_code': '条形码',
      'warehouse.material.fields.safety_stock': '安全库存',
      'warehouse.material.fields.storage_requirement': '储存要求',
      'warehouse.material.fields.expire_cycle': '保质周期',
      'warehouse.material.fields.remark': '备注',
      'warehouse.material.fields.created_at': '创建时间',
      'warehouse.material.fields.updated_at': '更新时间',
      // 盘点信息
      'warehouse.inventory.info.fields.check_no': '盘点单号',
      'warehouse.inventory.info.fields.domain_id': '域ID',
      'warehouse.inventory.info.fields.check_type': '盘点类型',
      'warehouse.inventory.info.fields.check_status': '盘点状态',
      'warehouse.inventory.info.fields.start_time': '开始时间',
      'warehouse.inventory.info.fields.end_time': '结束时间',
      'warehouse.inventory.info.fields.checker_id': '负责人',
      'warehouse.inventory.info.fields.remark': '备注',
      'warehouse.inventory.info.fields.created_at': '创建时间',
      'warehouse.inventory.info.fields.update_at': '更新时间',
      // 盘点详情
      'warehouse.inventory.detail.fields.material_code': '物料编码',
      'warehouse.inventory.detail.fields.diff_reason': '差异原因',
      'warehouse.inventory.detail.fields.process_person': '处理人',
      'warehouse.inventory.detail.fields.process_time': '处理时间',
      'warehouse.inventory.detail.fields.process_remark': '处理备注',
      'warehouse.inventory.detail.fields.inventory_check_id': '盘点单ID',
    },
    'en-US': {
      // 物料
      'warehouse.material.fields.material_code': 'Material Code',
      'warehouse.material.fields.material_name': 'Material Name',
      'warehouse.material.fields.material_type': 'Material Type',
      'warehouse.material.fields.specification': 'Specification',
      'warehouse.material.fields.material_texture': 'Material Texture',
      'warehouse.material.fields.unit': 'Unit',
      'warehouse.material.fields.supplier_code': 'Supplier Code',
      'warehouse.material.fields.supplier_name': 'Supplier Name',
      'warehouse.material.fields.unit_price': 'Unit Price',
      'warehouse.material.fields.tax_rate': 'Tax Rate',
      'warehouse.material.fields.total_price': 'Total Price (Including Tax)',
      'warehouse.material.fields.bar_code': 'Bar Code',
      'warehouse.material.fields.safety_stock': 'Safety Stock',
      'warehouse.material.fields.storage_requirement': 'Storage Requirement',
      'warehouse.material.fields.expire_cycle': 'Expire Cycle',
      'warehouse.material.fields.remark': 'Remark',
      'warehouse.material.fields.created_at': 'Created At',
      'warehouse.material.fields.updated_at': 'Updated At',
      // 盘点信息
      'warehouse.inventory.info.fields.check_no': 'Check No',
      'warehouse.inventory.info.fields.domain_id': 'Domain ID',
      'warehouse.inventory.info.fields.check_type': 'Check Type',
      'warehouse.inventory.info.fields.check_status': 'Check Status',
      'warehouse.inventory.info.fields.start_time': 'Start Time',
      'warehouse.inventory.info.fields.end_time': 'End Time',
      'warehouse.inventory.info.fields.checker_id': 'Checker',
      'warehouse.inventory.info.fields.remark': 'Remark',
      'warehouse.inventory.info.fields.created_at': 'Created At',
      'warehouse.inventory.info.fields.update_at': 'Updated At',
      // 盘点详情
      'warehouse.inventory.detail.fields.material_code': 'Material Code',
      'warehouse.inventory.detail.fields.diff_reason': 'Difference Reason',
      'warehouse.inventory.detail.fields.process_person': 'Process Person',
      'warehouse.inventory.detail.fields.process_time': 'Process Time',
      'warehouse.inventory.detail.fields.process_remark': 'Process Remark',
      'warehouse.inventory.detail.fields.inventory_check_id': 'Inventory Check ID',
    },
  },

  columns: {
    'warehouse.material.list': [
      { type: 'selection', width: 48 },
      { prop: 'materialCode', label: 'warehouse.material.fields.material_code', showOverflowTooltip: true },
      { prop: 'materialName', label: 'warehouse.material.fields.material_name', showOverflowTooltip: true },
      { prop: 'materialType', label: 'warehouse.material.fields.material_type', showOverflowTooltip: true },
      { prop: 'specification', label: 'warehouse.material.fields.specification', showOverflowTooltip: true },
      { prop: 'materialTexture', label: 'warehouse.material.fields.material_texture', showOverflowTooltip: true },
      { prop: 'unit', label: 'warehouse.material.fields.unit', width: 100 },
      { prop: 'supplierName', label: 'warehouse.material.fields.supplier_name', showOverflowTooltip: true },
      { prop: 'unitPrice', label: 'warehouse.material.fields.unit_price' },
      { prop: 'taxRate', label: 'warehouse.material.fields.tax_rate' },
      { prop: 'totalPrice', label: 'warehouse.material.fields.total_price' },
      { prop: 'createdAt', label: 'warehouse.material.fields.created_at', width: 180 },
      { prop: 'updatedAt', label: 'warehouse.material.fields.updated_at', width: 180 },
    ] as TableColumn[],

    'warehouse.inventory.info': [
      { type: 'selection', width: 48 },
      { prop: 'checkNo', label: 'warehouse.inventory.info.fields.check_no', showOverflowTooltip: true },
      { prop: 'domainId', label: 'warehouse.inventory.info.fields.domain_id', showOverflowTooltip: true },
      { prop: 'checkType', label: 'warehouse.inventory.info.fields.check_type', showOverflowTooltip: true },
      { prop: 'checkStatus', label: 'warehouse.inventory.info.fields.check_status', showOverflowTooltip: true },
      { prop: 'startTime', label: 'warehouse.inventory.info.fields.start_time', width: 180 },
      { prop: 'endTime', label: 'warehouse.inventory.info.fields.end_time', width: 180 },
      { prop: 'checkerId', label: 'warehouse.inventory.info.fields.checker_id', showOverflowTooltip: true },
      { prop: 'remark', label: 'warehouse.inventory.info.fields.remark', showOverflowTooltip: true },
      { prop: 'createdAt', label: 'warehouse.inventory.info.fields.created_at', width: 180 },
      { prop: 'updateAt', label: 'warehouse.inventory.info.fields.update_at', width: 180 },
    ] as TableColumn[],

    'warehouse.inventory.detail': [
      { type: 'selection', width: 48 },
      { prop: 'id', label: 'ID', width: 100 },
      { prop: 'materialCode', label: 'warehouse.inventory.detail.fields.material_code', showOverflowTooltip: true },
      { prop: 'diffReason', label: 'warehouse.inventory.detail.fields.diff_reason', showOverflowTooltip: true },
      { prop: 'processPerson', label: 'warehouse.inventory.detail.fields.process_person' },
      { prop: 'processTime', label: 'warehouse.inventory.detail.fields.process_time', width: 180 },
      { prop: 'processRemark', label: 'warehouse.inventory.detail.fields.process_remark', showOverflowTooltip: true },
    ] as TableColumn[],
  },

  forms: {
    'warehouse.material.list': [
      { prop: 'materialCode', label: 'warehouse.material.fields.material_code', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'materialName', label: 'warehouse.material.fields.material_name', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'materialType', label: 'warehouse.material.fields.material_type', span: 12, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'specification', label: 'warehouse.material.fields.specification', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'materialTexture', label: 'warehouse.material.fields.material_texture', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'unit', label: 'warehouse.material.fields.unit', span: 12, component: { name: 'el-input', props: { maxlength: 20 } } },
      { prop: 'supplierCode', label: 'warehouse.material.fields.supplier_code', span: 12, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'supplierName', label: 'warehouse.material.fields.supplier_name', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'unitPrice', label: 'warehouse.material.fields.unit_price', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 2, controlsPosition: 'right' } } },
      { prop: 'taxRate', label: 'warehouse.material.fields.tax_rate', span: 12, component: { name: 'el-input-number', props: { min: 0, max: 1, step: 0.01, controlsPosition: 'right' } } },
      { prop: 'totalPrice', label: 'warehouse.material.fields.total_price', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 2, controlsPosition: 'right' } } },
      { prop: 'barCode', label: 'warehouse.material.fields.bar_code', span: 12, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'safetyStock', label: 'warehouse.material.fields.safety_stock', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 0, controlsPosition: 'right' } } },
      { prop: 'storageRequirement', label: 'warehouse.material.fields.storage_requirement', span: 24, component: { name: 'el-input', props: { maxlength: 255, type: 'textarea', rows: 2 } } },
      { prop: 'expireCycle', label: 'warehouse.material.fields.expire_cycle', span: 12, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'remark', label: 'warehouse.material.fields.remark', span: 24, component: { name: 'el-input', props: { maxlength: 255, type: 'textarea', rows: 2 } } },
    ] as FormItem[],

    'warehouse.inventory.info': [
      { prop: 'checkNo', label: 'warehouse.inventory.info.fields.check_no', span: 24, required: true, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'domainId', label: 'warehouse.inventory.info.fields.domain_id', span: 24, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'checkType', label: 'warehouse.inventory.info.fields.check_type', span: 24, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'checkStatus', label: 'warehouse.inventory.info.fields.check_status', span: 24, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'startTime', label: 'warehouse.inventory.info.fields.start_time', span: 12, component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } } },
      { prop: 'endTime', label: 'warehouse.inventory.info.fields.end_time', span: 12, component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } } },
      { prop: 'checkerId', label: 'warehouse.inventory.info.fields.checker_id', span: 24, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'remark', label: 'warehouse.inventory.info.fields.remark', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 2, maxlength: 255 } } },
    ] as FormItem[],

    'warehouse.inventory.detail': [
      { prop: 'inventoryCheckId', label: 'warehouse.inventory.detail.fields.inventory_check_id', span: 24, required: true, component: { name: 'el-input-number', props: { min: 0, step: 1, controlsPosition: 'right' } } },
      { prop: 'materialCode', label: 'warehouse.inventory.detail.fields.material_code', span: 24, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'diffReason', label: 'warehouse.inventory.detail.fields.diff_reason', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 2, maxlength: 255 } } },
      { prop: 'processPerson', label: 'warehouse.inventory.detail.fields.process_person', span: 24, component: { name: 'el-input', props: { maxlength: 60 } } },
      { prop: 'processTime', label: 'warehouse.inventory.detail.fields.process_time', span: 24, component: { name: 'el-date-picker', props: { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', clearable: true } } },
      { prop: 'processRemark', label: 'warehouse.inventory.detail.fields.process_remark', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 2, maxlength: 255 } } },
    ] as FormItem[],
  },

  service: {
    get material() {
      return createCrudServiceFromEps(['logistics', 'warehouse', 'material'], getService());
    },
    get inventoryInfo() {
      return createCrudServiceFromEps(['logistics', 'warehouse', 'check'], getService());
    },
    get inventoryDetail() {
      return createCrudServiceFromEps(['logistics', 'warehouse', 'diff'], getService());
    },
  },
} satisfies ModuleConfig;

/**
 * 数据管理模块配置
 * 包含 inventory、files、dictionary 等页面的配置
 */
;

import type { ModuleConfig } from '@btc/shared-core/types/module';
import type { TableColumn, FormItem } from '@btc/shared-components';

// 延迟获取 service，避免在 EPS 服务初始化前访问导致循环依赖
function getService() {
  // 使用动态导入或从全局获取，避免循环依赖
  if (typeof window !== 'undefined') {
    return (window as any).__APP_EPS_SERVICE__ || (window as any).service || (window as any).__BTC_SERVICE__;
  }
  // 如果没有全局对象，尝试动态导入
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
  name: 'data',
  label: 'common.module.data.label',
  order: 20,

  // 路由配置
  views: [
    {
      path: 'data/files/list',
      name: 'DataFilesList',
      component: () => import('./views/files/list/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.data.files.list',
      },
    },
    {
      path: 'data/files/template',
      name: 'DataFilesTemplate',
      component: () => import('./views/files/template/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.data.files.template',
      },
    },
    {
      path: 'data/files/preview',
      name: 'DataFilesPreview',
      component: () => import('./views/files/preview/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.data.files.preview',
      },
    },
    {
      path: 'inventory/dataSource/bom',
      name: 'InventoryDataSourceBom',
      component: () => import('./views/inventory/bom/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.inventory.dataSource.bom',
      },
    },
    {
      path: 'inventory/dataSource/list',
      name: 'InventoryDataSourceList',
      component: () => import('./views/inventory/list/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.inventory.dataSource.list',
      },
    },
    {
      path: 'inventory/dataSource/ticket',
      name: 'InventoryDataSourceTicket',
      component: () => import('./views/inventory/ticket/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.inventory.dataSource.ticket',
      },
    },
    {
      path: 'inventory/process',
      name: 'InventoryProcess',
      component: () => import('./views/inventory/process/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.inventory.process',
      },
    },
    {
      path: 'inventory/check',
      name: 'InventoryCheck',
      component: () => import('./views/inventory/check/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.inventory.result',
      },
    },
    {
      path: 'inventory/confirm',
      name: 'InventoryConfirm',
      component: () => import('./views/inventory/confirm/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.inventory.confirm',
      },
    },
    {
      path: 'data/dictionary',
      redirect: 'data/dictionary/file-categories',
    },
    {
      path: 'data/dictionary/file-categories',
      name: 'DataDictionaryFileCategories',
      component: () => import('./views/dictionary/file-categories/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.data.dictionary.file_categories',
      },
    },
    {
      path: 'data/recycle',
      name: 'DataRecycle',
      component: () => import('./views/recycle/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.data.recycle',
      },
    },
  ],

  // PageConfig 字段（保留）
  locale: {
    'zh-CN': {
      // 菜单配置
      'menu.data': '数据管理',
      'menu.data.files': '文件管理',
      'menu.data.files.list': '文件列表',
      'menu.data.files.template': '文件模板',
      'menu.data.files.templates': '文件模板',
      'menu.data.files.preview': '文件预览',
      'menu.data.dictionary': '字典管理',
      'menu.data.dictionary.fields': '字段管理',
      'menu.data.dictionary.values': '字典值管理',
      'menu.data.dictionary.file_categories': '文件分类',
      'menu.data.recycle': '数据回收站',
      'menu.inventory': '盘点管理',
      'menu.inventory.data_source': '盘点数据源',
      'menu.inventory.dataSource': '盘点数据源',
      'menu.inventory.data_source.bom': '非SysPro BOM表',
      'menu.inventory.dataSource.bom': '非SysPro BOM表',
      'menu.inventory.data_source.list': '清单上传',
      'menu.inventory.dataSource.list': '清单上传',
      'menu.inventory.data_source.ticket': '盘点票导入',
      'menu.inventory.dataSource.ticket': '盘点票导入',
      'menu.inventory.process': '流程管理',
      'menu.inventory.result': '实盘数据',
      'menu.inventory.confirm': '流程确认',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title 和 right-title）
      'title.inventory.domains': '域列表',
      'title.inventory.domainsSelectRequired': '请先选择左侧域',
      'title.inventory.check.list': '盘点列表',
      'title.data.files.template.categories': '模板分类',
      'title.data.files.template.templateList': '模板列表',
      'title.data.files.preview.categories': '文件分类',
      'title.data.files.preview.fileList': '文件列表',
      // 盘点列表
      'data.inventory.list.fields.material_code': '物料编码',
      'data.inventory.list.fields.material_name': '物料名称',
      'data.inventory.list.fields.actual_qty': '实际数量',
      'data.inventory.list.fields.storage_location': '仓位',
      'data.inventory.list.fields.category': '分类',
      'data.inventory.list.fields.status': '状态',
      'data.inventory.list.fields.status_placeholder': '请选择状态',
      'data.inventory.list.fields.remark': '备注',
      // 流程确认
      'data.inventory.confirm.fields.name': '名称',
      'data.inventory.confirm.fields.status': '状态',
      'data.inventory.confirm.fields.confirmer': '确认人',
      'data.inventory.confirm.fields.created_at': '确认时间',
      'data.inventory.confirm.status.confirmed': '已确认',
      'data.inventory.confirm.status.unconfirmed': '未确认',
      // 盘点票
      'data.inventory.ticket.fields.check_no': '盘点单号',
      'data.inventory.ticket.fields.material_code': '物料编码',
      'data.inventory.ticket.fields.position': '仓位',
      // BOM
      'data.inventory.bom.fields.component_name': '组件名称',
      'data.inventory.bom.fields.material_code_name': '物料编码名称',
      'data.inventory.bom.fields.component_total_qty': '组件总数量',
      'data.inventory.bom.fields.parent_node': '父节点',
      'data.inventory.bom.fields.child_node': '子节点',
      // 盘点
      'data.inventory.check.fields.material_code': '物料编码',
      'data.inventory.check.fields.actual_qty': '实际数量',
      'data.inventory.check.fields.checker_id': '负责人',
      'data.inventory.check.fields.storage_location': '仓位',
      // 字典
      'data.dictionary.file_categories.fields.code': '编码',
      'data.dictionary.file_categories.fields.label': '标签',
      'data.dictionary.file_categories.fields.mime': 'MIME类型',
      'data.dictionary.file_categories.fields.created_at': '创建时间',
      'data.dictionary.file_categories.fields.updated_at': '更新时间',
      // 文件
      'data.files.list.fields.file_url': '文件URL',
      'data.files.list.fields.original_name': '文件名',
      'data.files.list.fields.mime': '文件类型',
      'data.files.list.fields.size_bytes': '文件大小',
      'data.files.list.fields.created_at': '上传时间',
      // 回收站
      'data.recycle.fields.name': '名称',
      'data.recycle.fields.type': '类型',
      'data.recycle.fields.deleted_at': '删除时间',
      // 系统通用字段（用于 columns）
      'system.inventory.base.fields.created_at': '创建时间',
      'system.inventory.base.fields.check_no': '盘点单号',
      'system.inventory.base.fields.check_type': '盘点类型',
      'system.inventory.base.fields.remark': '备注',
      'system.material.fields.material_code': '物料编码',
      'system.material.fields.specification': '规格型号',
      'system.material.fields.unit': '单位',
      // 盘点结果通用字段
      'inventory.result.fields.storage_location': '仓位',
      'inventory.result.fields.actual_qty': '实际数量',
    },
    'en-US': {
      // 菜单配置
      'menu.data': 'Data Management',
      'menu.data.files': 'File Management',
      'menu.data.files.list': 'File List',
      'menu.data.files.template': 'File Template',
      'menu.data.files.templates': 'File Template',
      'menu.data.files.preview': 'File Preview',
      'menu.data.dictionary': 'Dictionary Management',
      'menu.data.dictionary.fields': 'Field Management',
      'menu.data.dictionary.values': 'Dictionary Value Management',
      'menu.data.dictionary.file_categories': 'File Categories',
      'menu.data.recycle': 'Data Recycle Bin',
      'menu.inventory': 'Inventory Management',
      'menu.inventory.data_source': 'Inventory Data Source',
      'menu.inventory.dataSource': 'Inventory Data Source',
      'menu.inventory.data_source.bom': 'Non-SysPro BOM Table',
      'menu.inventory.dataSource.bom': 'Non-SysPro BOM Table',
      'menu.inventory.data_source.list': 'Checklist Upload',
      'menu.inventory.dataSource.list': 'Checklist Upload',
      'menu.inventory.data_source.ticket': 'Check Ticket Import',
      'menu.inventory.dataSource.ticket': 'Check Ticket Import',
      'menu.inventory.process': 'Process Management',
      'menu.inventory.result': 'Live Inventory Data',
      'menu.inventory.confirm': 'Process Confirmation',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title  and right-title）
      'title.inventory.domains': 'Domain List',
      'title.inventory.domainsSelectRequired': 'Please select a domain on the left first',
      'title.inventory.check.list': 'Check List',
      'title.data.files.template.categories': 'Template Categories',
      'title.data.files.template.templateList': 'Template List',
      'title.data.files.preview.categories': 'File Categories',
      'title.data.files.preview.fileList': 'File List',
      // 盘点列表
      'data.inventory.list.fields.material_code': 'Material Code',
      'data.inventory.list.fields.material_name': 'Material Name',
      'data.inventory.list.fields.actual_qty': 'Actual Quantity',
      'data.inventory.list.fields.storage_location': 'Storage Location',
      'data.inventory.list.fields.category': 'Category',
      'data.inventory.list.fields.status': 'Status',
      'data.inventory.list.fields.status_placeholder': 'Please select status',
      'data.inventory.list.fields.remark': 'Remark',
      // 流程确认
      'data.inventory.confirm.fields.name': 'Name',
      'data.inventory.confirm.fields.status': 'Status',
      'data.inventory.confirm.fields.confirmer': 'Confirmer',
      'data.inventory.confirm.fields.created_at': 'Confirm Time',
      'data.inventory.confirm.status.confirmed': 'Confirmed',
      'data.inventory.confirm.status.unconfirmed': 'Unconfirmed',
      // 盘点票
      'data.inventory.ticket.fields.check_no': 'Check No',
      'data.inventory.ticket.fields.material_code': 'Material Code',
      'data.inventory.ticket.fields.position': 'Position',
      // BOM
      'data.inventory.bom.fields.component_name': 'Component Name',
      'data.inventory.bom.fields.material_code_name': 'Material Code Name',
      'data.inventory.bom.fields.component_total_qty': 'Component Total Quantity',
      'data.inventory.bom.fields.parent_node': 'Parent Node',
      'data.inventory.bom.fields.child_node': 'Child Node',
      // 盘点
      'data.inventory.check.fields.material_code': 'Material Code',
      'data.inventory.check.fields.actual_qty': 'Actual Quantity',
      'data.inventory.check.fields.checker_id': 'Checker',
      'data.inventory.check.fields.storage_location': 'Storage Location',
      // 字典
      'data.dictionary.file_categories.fields.code': 'Code',
      'data.dictionary.file_categories.fields.label': 'Label',
      'data.dictionary.file_categories.fields.mime': 'MIME Type',
      'data.dictionary.file_categories.fields.created_at': 'Created At',
      'data.dictionary.file_categories.fields.updated_at': 'Updated At',
      // 文件
      'data.files.list.fields.file_url': 'File URL',
      'data.files.list.fields.original_name': 'File Name',
      'data.files.list.fields.mime': 'File Type',
      'data.files.list.fields.size_bytes': 'File Size',
      'data.files.list.fields.created_at': 'Upload Time',
      // 回收站
      'data.recycle.fields.name': 'Name',
      'data.recycle.fields.type': 'Type',
      'data.recycle.fields.deleted_at': 'Deleted At',
      // 系统通用字段（用于 columns）
      'system.inventory.base.fields.created_at': 'Created At',
      'system.inventory.base.fields.check_no': 'Check No',
      'system.inventory.base.fields.check_type': 'Check Type',
      'system.inventory.base.fields.remark': 'Remark',
      'system.material.fields.material_code': 'Material Code',
      'system.material.fields.specification': 'Specification',
      'system.material.fields.unit': 'Unit',
      // 盘点结果通用字段
      'inventory.result.fields.storage_location': 'Storage Location',
      'inventory.result.fields.actual_qty': 'Actual Quantity',
    },
  },

  columns: {
    'data.inventory.list': [
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'partName', label: 'data.inventory.list.fields.material_code' },
      { prop: 'partQty', label: 'data.inventory.list.fields.actual_qty' },
      { prop: 'position', label: 'data.inventory.list.fields.storage_location' },
      { prop: 'createdAt', label: 'system.inventory.base.fields.created_at', width: 180 },
    ] as TableColumn[],

    'data.inventory.list.export': [
      { prop: 'partName', label: 'system.material.fields.material_code' },
      { prop: 'partQty', label: 'inventory.result.fields.actual_qty' },
      { prop: 'position', label: 'inventory.result.fields.storage_location' },
    ] as TableColumn[],

    'data.inventory.confirm': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'name', label: 'data.inventory.confirm.fields.name' },
      {
        prop: 'status',
        label: 'data.inventory.confirm.fields.status',
        width: 120,
        dictColor: true,
        dict: [
          { label: 'data.inventory.confirm.status.confirmed', value: '已确认', type: 'success' },
          { label: 'data.inventory.confirm.status.unconfirmed', value: '未确认', type: 'info' },
          { label: 'data.inventory.confirm.status.confirmed', value: 'confirmed', type: 'success' },
          { label: 'data.inventory.confirm.status.unconfirmed', value: 'unconfirmed', type: 'info' },
          { label: 'data.inventory.confirm.status.confirmed', value: 'CONFIRMED', type: 'success' },
          { label: 'data.inventory.confirm.status.unconfirmed', value: 'UNCONFIRMED', type: 'info' },
        ],
      },
      { prop: 'confirmer', label: 'data.inventory.confirm.fields.confirmer', width: 120 },
      { prop: 'createdAt', label: 'data.inventory.confirm.fields.created_at', width: 180 },
    ] as TableColumn[],

    'data.inventory.ticket': [
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'partName', label: 'system.material.fields.material_code' },
      { prop: 'position', label: 'inventory.result.fields.storage_location' },
      { prop: 'createdAt', label: 'system.inventory.base.fields.created_at', width: 180 },
    ] as TableColumn[],

    'data.inventory.ticket.export': [
      { prop: 'partName', label: 'system.material.fields.material_code' },
      { prop: 'position', label: 'inventory.result.fields.storage_location' },
    ] as TableColumn[],

    'data.inventory.bom': [
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'childNode', label: 'data.inventory.bom.fields.component_name', showOverflowTooltip: true },
      { prop: 'parentNode', label: 'data.inventory.bom.fields.material_code_name', showOverflowTooltip: true },
      { prop: 'childQty', label: 'data.inventory.bom.fields.component_total_qty', width: 120 },
    ] as TableColumn[],

    'data.inventory.bom.export': [
      { prop: 'childNode', label: 'data.inventory.bom.fields.component_name' },
      { prop: 'parentNode', label: 'data.inventory.bom.fields.material_code_name' },
      { prop: 'childQty', label: 'data.inventory.bom.fields.component_total_qty' },
    ] as TableColumn[],

    'data.inventory.check': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'partName', label: 'system.material.fields.material_code' },
      { prop: 'partQty', label: 'data.inventory.check.fields.actual_qty' },
      { prop: 'checker', label: 'data.inventory.check.fields.checker_id' },
      { prop: 'position', label: 'data.inventory.check.fields.storage_location' },
    ] as TableColumn[],

    'data.inventory.check.export': [
      { prop: 'checkNo', label: 'system.inventory.base.fields.check_no' },
      { prop: 'partName', label: 'system.material.fields.material_code' },
      { prop: 'partQty', label: 'data.inventory.check.fields.actual_qty' },
      { prop: 'checker', label: 'data.inventory.check.fields.checker_id' },
      { prop: 'position', label: 'data.inventory.check.fields.storage_location' },
      { prop: 'createdAt', label: 'system.inventory.base.fields.created_at' },
    ] as TableColumn[],

    'data.dictionary.file-categories': [
      { type: 'selection' },
      { prop: 'category', label: 'data.dictionary.file_categories.fields.code', showOverflowTooltip: true },
      { prop: 'categoryLabel', label: 'data.dictionary.file_categories.fields.label', showOverflowTooltip: true },
      { prop: 'mime', label: 'data.dictionary.file_categories.fields.mime', showOverflowTooltip: true },
      { prop: 'createdAt', label: 'data.dictionary.file_categories.fields.created_at', width: 170 },
      { prop: 'updatedAt', label: 'data.dictionary.file_categories.fields.updated_at', width: 170 },
    ] as TableColumn[],

    'data.files.list': [
      { type: 'selection' },
      { type: 'index' },
      { prop: 'fileUrl', label: 'data.files.list.fields.file_url', width: 88, align: 'center', headerAlign: 'center' },
      { prop: 'originalName', label: 'data.files.list.fields.original_name' },
      { prop: 'mime', label: 'data.files.list.fields.mime', width: 120 },
      { prop: 'sizeBytes', label: 'data.files.list.fields.size_bytes', width: 120 },
      { prop: 'createdAt', label: 'data.files.list.fields.created_at', width: 180 },
    ] as TableColumn[],

    'data.recycle': [
      { type: 'selection' },
      { prop: 'name', label: 'data.recycle.fields.name' },
      { prop: 'type', label: 'data.recycle.fields.type' },
      { prop: 'deletedAt', label: 'data.recycle.fields.deleted_at', width: 180 },
    ] as TableColumn[],
  },

  forms: {
    'data.inventory.list': [
      { prop: 'materialCode', label: 'data.inventory.list.fields.material_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'materialName', label: 'data.inventory.list.fields.material_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'specification', label: 'system.material.fields.specification', span: 12, component: { name: 'el-input' } },
      { prop: 'unit', label: 'system.material.fields.unit', span: 12, component: { name: 'el-input' } },
      { prop: 'category', label: 'data.inventory.list.fields.category', span: 12, component: { name: 'el-input' } },
      {
        prop: 'status',
        label: 'data.inventory.list.fields.status',
        span: 12,
        component: {
          name: 'el-select',
          props: {
            placeholder: 'data.inventory.list.fields.status_placeholder',
          },
        },
        options: [
          { label: 'common.enabled', value: 1 },
          { label: 'common.disabled', value: 0 },
        ],
      },
      { prop: 'remark', label: 'system.inventory.base.fields.remark', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
    ] as FormItem[],

    'data.inventory.confirm': [] as FormItem[],

    'data.inventory.ticket': [
      { prop: 'checkNo', label: 'system.inventory.base.fields.check_no', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'partName', label: 'system.material.fields.material_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'position', label: 'inventory.result.fields.storage_location', span: 12, component: { name: 'el-input' } },
      { prop: 'checkType', label: 'system.inventory.base.fields.check_type', span: 12, component: { name: 'el-input' } },
    ] as FormItem[],

    'data.inventory.bom': [
      { prop: 'parentNode', label: 'data.inventory.bom.fields.parent_node', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'childNode', label: 'data.inventory.bom.fields.child_node', span: 12, required: true, component: { name: 'el-input', props: { maxlength: 120 } } },
      { prop: 'childQty', label: 'data.inventory.bom.fields.component_total_qty', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 2, controlsPosition: 'right' } } },
    ] as FormItem[],

    'data.inventory.check': [
      { prop: 'partName', label: 'system.material.fields.material_code', span: 12, component: { name: 'el-input', props: { readonly: true } }, required: true },
      { prop: 'partQty', label: 'data.inventory.check.fields.actual_qty', span: 12, component: { name: 'el-input-number', props: { min: 0, precision: 2, controlsPosition: 'right' } } },
      { prop: 'checker', label: 'data.inventory.check.fields.checker_id', span: 12, component: { name: 'el-input' } },
      { prop: 'position', label: 'data.inventory.check.fields.storage_location', span: 12, component: { name: 'el-input' } },
    ] as FormItem[],

    'data.dictionary.file-categories': [
      { prop: 'category', label: 'data.dictionary.file_categories.fields.code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'categoryLabel', label: 'data.dictionary.file_categories.fields.label', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'mime', label: 'data.dictionary.file_categories.fields.mime', span: 24, component: { name: 'el-input' } },
    ] as FormItem[],

    'data.files.list': [] as FormItem[],

    'data.recycle': [] as FormItem[],
  },

  service: {
    get inventoryList() {
      return getService()?.system?.base?.data;
    },
    get inventoryConfirm() {
      return getService()?.system?.base?.approval;
    },
    get inventoryTicket() {
      return getService()?.logistics?.warehouse?.ticket;
    },
    get inventoryBom() {
      return getService()?.system?.base?.bom;
    },
    get inventoryCheck() {
      return getService()?.system?.base?.data;
    },
    get checkList() {
      return getService()?.logistics?.warehouse?.check;
    },
    domainService: {
      list: async () => {
        try {
          const service = getService();
          const response = await service?.logistics?.base?.position?.me?.();
          let list: any[] = [];
          if (Array.isArray(response)) {
            list = response;
          } else if (response && typeof response === 'object') {
            if ('data' in response) {
              const data = response.data;
              if (Array.isArray(data)) {
                list = data;
              } else if (data && typeof data === 'object') {
                list = Array.isArray(data.data) ? data.data : (Array.isArray(data.list) ? data.list : []);
              }
            } else if ('list' in response) {
              list = Array.isArray(response.list) ? response.list : [];
            }
          }
          const domainMap = new Map<string, any>();
          list.forEach((item: any) => {
            if (!item || typeof item !== 'object') return;
            const domainId = item.domianId || item.domainId;
            if (domainId && !domainMap.has(domainId)) {
              domainMap.set(domainId, {
                id: domainId,
                domainId: domainId,
                name: item.domainName || item.name || domainId,
              });
            }
          });
          return Array.from(domainMap.values());
        } catch (error) {
          console.warn('[DataInventoryList] Failed to load domain list:', error);
          return [];
        }
      },
    },
  },
} satisfies ModuleConfig;

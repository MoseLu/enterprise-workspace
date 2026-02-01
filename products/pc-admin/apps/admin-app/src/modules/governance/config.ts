/**
 * 治理模块配置
 * 包含字典管理、文件管理等页面的配置
 */

import type { ModuleConfig } from '@btc/shared-core/types/module';
import type { TableColumn, FormItem } from '@btc/shared-components';

// 参考 cool-admin-vue-7.x 的方式：延迟导入 service，避免初始化顺序问题
// 使用函数延迟获取，确保在访问时才执行导入
let _serviceCache: any = null;

// 延迟获取 service 的函数，优先从全局获取
function getService() {
  // 如果已经缓存，直接返回
  if (_serviceCache) {
    return _serviceCache;
  }

  if (typeof window === 'undefined') {
    _serviceCache = {} as any;
    return _serviceCache;
  }

  // 优先从全局获取（由应用初始化时设置）
  const win = window as any;
  const globalService = win.__APP_EPS_SERVICE__ || win.__BTC_SERVICE__;

  if (globalService && typeof globalService === 'object' && Object.keys(globalService).length > 0) {
    _serviceCache = globalService;
    return _serviceCache;
  }

  // 如果全局服务不存在，尝试同步导入（仅在模块已加载时）
  // 注意：这里不能使用 await，所以只能尝试同步访问
  // 如果失败，返回空对象作为默认值（参考 cool-admin-vue-7.x 的 hmr.getData 方式）
  if (!_serviceCache) {
    try {
      // 检查是否有缓存的模块引用
      const cachedModule = (win as any).__EPS_MODULE_CACHE__;
      if (cachedModule) {
        _serviceCache = cachedModule.service || cachedModule.default || {};
        return _serviceCache;
      }
    } catch (error) {
      // 忽略错误
    }
  }

  // 兜底：返回空对象作为默认值
  _serviceCache = _serviceCache || {} as any;
  return _serviceCache;
}

export default {
  // ModuleConfig 字段
  name: 'governance',
  label: 'common.module.governance.label',
  order: 25,

  // 路由配置
  views: [
    {
      path: '/governance/files/templates',
      name: 'AdminGovernanceFilesTemplates',
      component: () => import('./views/files/templates/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.governance.files.templates',
      },
    },
    {
      path: '/governance/dictionary/fields',
      name: 'AdminDictionaryFields',
      component: () => import('./views/dictionary/fields/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.governance.dictionary.fields',
      },
    },
    {
      path: '/governance/dictionary/values',
      name: 'AdminDictionaryValues',
      component: () => import('./views/dictionary/values/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.governance.dictionary.values',
      },
    },
  ],

  // PageConfig 字段（保留）
  // 国际化配置（扁平结构）
  locale: {
    'zh-CN': {
      // 菜单配置
      'menu.governance': '数据治理',
      'menu.governance.files': '文件管理',
      'menu.governance.files.templates': '模板管理',
      'menu.governance.dictionary': '字典管理',
      'menu.governance.dictionary.fields': '字段管理',
      'menu.governance.dictionary.values': '字典值管理',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title 和 right-title）
      'title.governance.files.templates.domains': '域列表',
      'title.governance.dictionary.fields.resources': '资源列表',
      // 字典相关
      'governance.dictionary.fields.field_name': '字段名称',
      'governance.dictionary.fields.field_code': '字典编码',
      'governance.dictionary.fields.entity_class': '实体类名',
      'governance.dictionary.fields.domain_id': '域ID',
      'governance.dictionary.fields.remark': '备注',
      'governance.dictionary.values.type_code': '字典类型编码',
      'governance.dictionary.values.value': '字典值',
      'governance.dictionary.values.label': '字典标签',
      'governance.dictionary.values.sort': '排序',
      // 文件相关
      'governance.files.templates.fields.template_name': '模板名称',
      'governance.files.templates.fields.template_code': '模板编码',
      'governance.files.templates.fields.category': '模板分类',
      'governance.files.templates.fields.version': '版本号',
      'governance.files.templates.fields.status': '状态',
      'governance.files.templates.fields.description': '模板描述',
      'governance.files.templates.categories.approval': '审批流程',
      'governance.files.templates.categories.purchase': '采购流程',
      'governance.files.templates.categories.other': '其他',
    },
    'en-US': {
      // 菜单配置
      'menu.governance': 'Data Governance',
      'menu.governance.files': 'File Management',
      'menu.governance.files.templates': 'Template Management',
      'menu.governance.dictionary': 'Dictionary Management',
      'menu.governance.dictionary.fields': 'Field Management',
      'menu.governance.dictionary.values': 'Dictionary Value Management',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title 和 right-title）
      'title.governance.files.templates.domains': 'Domain List',
      'title.governance.dictionary.fields.resources': 'Resource List',
      // 字典相关
      'governance.dictionary.fields.field_name': 'Field Name',
      'governance.dictionary.fields.field_code': 'Dictionary Code',
      'governance.dictionary.fields.entity_class': 'Entity Class',
      'governance.dictionary.fields.domain_id': 'Domain ID',
      'governance.dictionary.fields.remark': 'Remark',
      'governance.dictionary.values.type_code': 'Dictionary Type Code',
      'governance.dictionary.values.value': 'Dictionary Value',
      'governance.dictionary.values.label': 'Dictionary Label',
      'governance.dictionary.values.sort': 'Sort',
      // 文件相关
      'governance.files.templates.fields.template_name': 'Template Name',
      'governance.files.templates.fields.template_code': 'Template Code',
      'governance.files.templates.fields.category': 'Template Category',
      'governance.files.templates.fields.version': 'Version',
      'governance.files.templates.fields.status': 'Status',
      'governance.files.templates.fields.description': 'Template Description',
      'governance.files.templates.categories.approval': 'Approval Process',
      'governance.files.templates.categories.purchase': 'Purchase Process',
      'governance.files.templates.categories.other': 'Other',
    },
  },

  columns: {
    'governance.dictionary.fields': [
      { type: 'selection' },
      { type: 'index', label: 'common.index' },
      { prop: 'fieldName', label: 'governance.dictionary.fields.field_name' },
      { prop: 'fieldCode', label: 'governance.dictionary.fields.field_code' },
      { prop: 'entityClass', label: 'governance.dictionary.fields.entity_class' },
      { prop: 'domainId', label: 'governance.dictionary.fields.domain_id' },
      { prop: 'remark', label: 'governance.dictionary.fields.remark' },
    ] as TableColumn[],

    'governance.dictionary.values': [
      { type: 'selection' },
      { type: 'index', label: 'common.index' },
      { prop: 'dictTypeCode', label: 'governance.dictionary.values.type_code' },
      { prop: 'dictValue', label: 'governance.dictionary.values.value' },
      { prop: 'dictLabel', label: 'governance.dictionary.values.label' },
    ] as TableColumn[],

    'governance.files.templates': [
      { type: 'selection' },
      { type: 'index', label: 'common.index' },
      { prop: 'templateName', label: 'governance.files.templates.fields.template_name' },
      { prop: 'templateCode', label: 'governance.files.templates.fields.template_code' },
      { prop: 'category', label: 'governance.files.templates.fields.category' },
      { prop: 'version', label: 'governance.files.templates.fields.version' },
      { prop: 'status', label: 'governance.files.templates.fields.status' },
      { prop: 'description', label: 'governance.files.templates.fields.description' },
    ] as TableColumn[],
  },

  forms: {
    'governance.dictionary.fields': [
      { prop: 'fieldName', label: 'governance.dictionary.fields.field_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'fieldCode', label: 'governance.dictionary.fields.field_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'entityClass', label: 'governance.dictionary.fields.entity_class', span: 12, component: { name: 'el-input' } },
      { prop: 'domainId', label: 'governance.dictionary.fields.domain_id', span: 12, component: { name: 'el-input' } },
      { prop: 'remark', label: 'governance.dictionary.fields.remark', span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
    ] as FormItem[],

    'governance.dictionary.values': [
      { prop: 'dictTypeCode', label: 'governance.dictionary.values.type_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'dictValue', label: 'governance.dictionary.values.value', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'dictLabel', label: 'governance.dictionary.values.label', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'sort', label: 'governance.dictionary.values.sort', span: 12, component: { name: 'el-input-number', props: { min: 0 } } },
    ] as FormItem[],

    'governance.files.templates': [
      { prop: 'templateName', label: 'governance.files.templates.fields.template_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'templateCode', label: 'governance.files.templates.fields.template_code', span: 12, required: true, component: { name: 'el-input' } },
      {
        prop: 'category',
        label: 'governance.files.templates.fields.category',
        span: 12,
        component: {
          name: 'el-select',
          options: [
            { label: 'governance.files.templates.categories.approval', value: 'APPROVAL' },
            { label: 'governance.files.templates.categories.purchase', value: 'PURCHASE' },
            { label: 'governance.files.templates.categories.other', value: 'OTHER' },
          ],
        },
      },
      { prop: 'version', label: 'governance.files.templates.fields.version', span: 12, component: { name: 'el-input' } },
      { prop: 'status', label: 'governance.files.templates.fields.status', span: 12, component: { name: 'el-input' } },
      { prop: 'description', label: 'governance.files.templates.fields.description', span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
    ] as FormItem[],
  },

  // 服务配置（使用 getter 延迟访问，避免初始化顺序问题）
  get service() {
    const epsService = getService();
    return {
      dictInfo: epsService.admin?.dict?.dictInfo,
      dictData: epsService.admin?.dict?.dictData,
      resource: epsService.admin?.iam?.resource,
      domain: epsService.admin?.iam?.domain,
      processTemplate: epsService.admin?.iam?.processTemplate,
      // BtcMasterTableGroup 需要的域服务（左侧服务）
      domainService: {
        list: (params?: any) => {
          const finalParams = params || {};
          return epsService.admin?.iam?.domain?.list(finalParams);
        }
      },
      // BtcMasterTableGroup 需要的资源服务（左侧服务，用于 dictionary.fields）
      resourceService: {
        list: (params?: any) => {
          const finalParams = params || {};
          return epsService.admin?.iam?.resource?.list(finalParams);
        }
      },
    };
  },
} satisfies ModuleConfig;

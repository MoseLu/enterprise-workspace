/**
 * 平台治理模块配置
 * 包含 domains、modules、plugins 等页面的配置
 */

import type { ModuleConfig } from '@btc/shared-core/types/module';
import type { TableColumn, FormItem } from '@btc/shared-components';

// 参考 cool-admin-vue-7.x 的方式：延迟导入 service，避免初始化顺序问题
let _serviceCache: any = null;

function getService() {
  if (_serviceCache) return _serviceCache;
  if (typeof window === 'undefined') {
    _serviceCache = {} as any;
    return _serviceCache;
  }
  const win = window as any;
  const globalService = win.__APP_EPS_SERVICE__ || win.__BTC_SERVICE__;
  if (globalService && typeof globalService === 'object' && Object.keys(globalService).length > 0) {
    _serviceCache = globalService;
    return _serviceCache;
  }
  if (!_serviceCache) {
    try {
      const cachedModule = (win as any).__EPS_MODULE_CACHE__;
      if (cachedModule) {
        _serviceCache = cachedModule.service || cachedModule.default || {};
        return _serviceCache;
      }
    } catch (error) {}
  }
  _serviceCache = _serviceCache || {} as any;
  return _serviceCache;
}

export default {
  // ModuleConfig 字段
  name: 'platform',
  label: 'platform.label',
  description: 'platform.description',
  order: 1,

  // 路由配置
  views: [
    {
      path: '/platform/domains',
      name: 'AdminDomains',
      component: () => import('./views/domains/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.platform.domains',
      },
    },
    {
      path: '/platform/modules',
      name: 'AdminModules',
      component: () => import('./views/modules/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.platform.modules',
      },
    },
    {
      path: '/platform/plugins',
      name: 'AdminPlugins',
      component: () => import('./views/plugins/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.platform.plugins',
      },
    },
  ],

  // PageConfig 字段（保留）
  // 国际化配置（扁平结构）
  locale: {
    'zh-CN': {
      // 菜单配置
      'menu.platform': '平台管理',
      'menu.platform.domains': '域列表',
      'menu.platform.modules': '模块列表',
      'menu.platform.plugins': '插件列表',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title 和 right-title）
      'title.platform.domains': '域列表',
      // 模块元数据
      'platform.label': '平台治理',
      'platform.description': '域、租户、模块、插件管理',
      // 字段配置
      'platform.domains.fields.domain_name': '域名称',
      'platform.domains.fields.domain_code': '域编码',
      'platform.domains.fields.domain_type': '域类型',
      'platform.domains.fields.tenant_id': '租户编码',
      'platform.domains.fields.description': '描述',
      'platform.domains.search_placeholder': '搜索域名称或编码',
      'platform.domains.list': '域列表',
      'platform.modules.fields.module_name': '模块名称',
      'platform.modules.fields.module_code': '模块编码',
      'platform.modules.fields.module_type': '模块类型',
      'platform.modules.fields.description': '描述',
      'platform.plugins.fields.plugin_name': '插件名称',
      'platform.plugins.fields.plugin_code': '插件编码',
      'platform.plugins.fields.version': '版本',
      'platform.plugins.fields.status': '状态',
      'platform.plugins.fields.description': '描述',
      'platform.plugins.enabled': '启用',
      'platform.plugins.disabled': '禁用',
      'platform.module.name': '模块名称',
      'platform.plugin.name': '插件名称',
    },
    'en-US': {
      // 菜单配置
      'menu.platform': 'Platform',
      'menu.platform.domains': 'Domain List',
      'menu.platform.modules': 'Module List',
      'menu.platform.plugins': 'Plugin List',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title 和 right-title）
      'title.platform.domains': 'Domain List',
      // 模块元数据
      'platform.label': 'Platform Governance',
      'platform.description': 'Domain, tenant, module, and plugin management',
      // 字段配置
      'platform.domains.fields.domain_name': 'Domain Name',
      'platform.domains.fields.domain_code': 'Domain Code',
      'platform.domains.fields.domain_type': 'Domain Type',
      'platform.domains.fields.tenant_id': 'Tenant Code',
      'platform.domains.fields.description': 'Description',
      'platform.domains.search_placeholder': 'Search domain name or code',
      'platform.domains.list': 'Domain List',
      'platform.modules.fields.module_name': 'Module Name',
      'platform.modules.fields.module_code': 'Module Code',
      'platform.modules.fields.module_type': 'Module Type',
      'platform.modules.fields.description': 'Description',
      'platform.plugins.fields.plugin_name': 'Plugin Name',
      'platform.plugins.fields.plugin_code': 'Plugin Code',
      'platform.plugins.fields.version': 'Version',
      'platform.plugins.fields.status': 'Status',
      'platform.plugins.fields.description': 'Description',
      'platform.plugins.enabled': 'Enabled',
      'platform.plugins.disabled': 'Disabled',
      'platform.module.name': 'Module Name',
      'platform.plugin.name': 'Plugin Name',
    },
  },

  columns: {
    'platform.domains': [
      { type: 'selection' },
      { type: 'index', label: 'common.index' },
      { prop: 'name', label: 'platform.domains.fields.domain_name' },
      { prop: 'domainCode', label: 'platform.domains.fields.domain_code' },
      { prop: 'domainType', label: 'platform.domains.fields.domain_type' },
      {
        prop: 'tenantCode',
        label: 'platform.domains.fields.tenant_id',
      },
      { prop: 'description', label: 'platform.domains.fields.description' },
    ] as TableColumn[],

    'platform.modules': [
      { type: 'selection' },
      { type: 'index', label: 'common.index' },
      { prop: 'moduleName', label: 'platform.modules.fields.module_name' },
      { prop: 'moduleCode', label: 'platform.modules.fields.module_code' },
      { prop: 'moduleType', label: 'platform.modules.fields.module_type' },
      { prop: 'description', label: 'platform.modules.fields.description' },
    ] as TableColumn[],

    'platform.plugins': [
      { type: 'selection' },
      { type: 'index', label: 'common.index' },
      { prop: 'pluginName', label: 'platform.plugins.fields.plugin_name' },
      { prop: 'pluginCode', label: 'platform.plugins.fields.plugin_code' },
      { prop: 'version', label: 'platform.plugins.fields.version' },
      { prop: 'status', label: 'platform.plugins.fields.status' },
      { prop: 'description', label: 'platform.plugins.fields.description' },
    ] as TableColumn[],
  },

  forms: {
    'platform.domains': [
      { prop: 'name', label: 'platform.domains.fields.domain_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'domainCode', label: 'platform.domains.fields.domain_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'domainType', label: 'platform.domains.fields.domain_type', span: 12, component: { name: 'el-input' } },
      {
        prop: 'tenantCode',
        label: 'platform.domains.fields.tenant_id',
        span: 12,
        required: true,
        component: {
          name: 'el-select',
          props: {
            filterable: true,
            clearable: true,
            // loading 和 options 需要在页面中动态传入
          },
        },
      },
      { prop: 'description', label: 'common.description', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
    ] as FormItem[],

    'platform.modules': [
      { prop: 'moduleName', label: 'platform.modules.fields.module_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'moduleCode', label: 'platform.modules.fields.module_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'moduleType', label: 'platform.modules.fields.module_type', span: 12, component: { name: 'el-input' } },
      { prop: 'description', label: 'platform.modules.fields.description', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
    ] as FormItem[],

    'platform.plugins': [
      { prop: 'pluginName', label: 'platform.plugins.fields.plugin_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'pluginCode', label: 'platform.plugins.fields.plugin_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'version', label: 'platform.plugins.fields.version', span: 12, component: { name: 'el-input' } },
      {
        prop: 'status',
        label: 'platform.plugins.fields.status',
        span: 12,
        value: 'ENABLED',
        component: {
          name: 'el-radio-group',
          options: [
            { label: 'platform.plugins.enabled', value: 'ENABLED' },
            { label: 'platform.plugins.disabled', value: 'DISABLED' },
          ],
        },
      },
      { prop: 'description', label: 'platform.plugins.fields.description', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
    ] as FormItem[],
  },

  get service() {
    const epsService = getService();
    return {
      domain: epsService.admin?.iam?.domain,
      tenant: epsService.admin?.iam?.tenant,
      module: epsService.admin?.iam?.module,
      plugin: epsService.admin?.iam?.plugin,
      // BtcMasterTableGroup 需要的域服务（左侧服务）
      domainService: {
        _serviceName: 'domain', // 标识服务名，用于推断 code 字段名
        list: (params?: any) => {
          const finalParams = params || {};
          return epsService.admin?.iam?.domain?.list(finalParams);
        }
      },
    };
  },
} satisfies ModuleConfig;

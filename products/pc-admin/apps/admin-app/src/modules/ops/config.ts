/**
 * 运维模块配置
 * 包含日志管理、API列表、基线配置等页面的配置
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
  name: 'ops',
  label: 'common.module.ops.label',
  order: 35,

  // 路由配置
  views: [
    {
      path: '/ops/logs/operation',
      name: 'AdminOperationLog',
      component: () => import('./views/logs/operation/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.ops.operation_log',
      },
    },
    {
      path: '/ops/logs/request',
      name: 'AdminRequestLog',
      component: () => import('./views/logs/request/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.ops.request_log',
      },
    },
    {
      path: '/ops/api-list',
      name: 'AdminApiList',
      component: () => import('./views/api-list/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.ops.api_list',
      },
    },
    {
      path: '/ops/baseline',
      name: 'AdminBaseline',
      component: () => import('./views/baseline/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.ops.baseline',
      },
    },
    {
      path: '/ops/simulator',
      name: 'AdminSimulator',
      component: () => import('./views/simulator/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.ops.simulator',
      },
    },
  ],

  // PageConfig 字段（保留）
  // 国际化配置（扁平结构）
  locale: {
    'zh-CN': {
      // 菜单配置
      'menu.ops': '运维管理',
      'menu.ops.logs': '日志中心',
      'menu.ops.operation_log': '操作日志',
      'menu.ops.request_log': '请求日志',
      'menu.ops.api_list': '接口列表',
      'menu.ops.baseline': '基线配置',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title 和 right-title）
      'title.ops.apiList.controller': '控制器列表',
      'menu.ops.simulator': '模拟器',
      // 基线相关
      'ops.baseline.search_placeholder': '搜索基线...',
      'ops.baseline.fields.baseline_name': '基线名称',
      'ops.baseline.fields.baseline_code': '基线编码',
      'ops.baseline.fields.version': '版本',
      'ops.baseline.fields.status': '状态',
      'ops.baseline.fields.description': '描述',
      'ops.baseline.status.enabled': '启用',
      'ops.baseline.status.disabled': '禁用',
      // API列表相关
      'ops.api_list.description': '接口列表展示系统内注册的所有 API 信息，用于便捷查询和排查接口情况。',
      'ops.api_list.fields.controller': '所属控制器',
      'ops.api_list.fields.method': 'HTTP 方法',
      'ops.api_list.fields.name': '方法名',
      'ops.api_list.fields.path': '请求路径',
      'ops.api_list.fields.description': '接口说明',
      'ops.api_list.fields.tags': '标签',
      'ops.api_list.fields.parameters': '参数信息',
      'ops.api_list.fields.request_type': '请求类型',
      'ops.api_list.fields.notes': '备注',
      'ops.api_list.search_placeholder': '按控制器、方法名、路径搜索...',
      // 日志相关
      'ops.logs.operation.fields.operator': '操作人',
      'ops.logs.operation.fields.operation_desc': '操作描述',
      'ops.logs.operation.fields.operation_type': '操作类型',
      'ops.logs.operation.fields.table_name': '表名',
      'ops.logs.operation.fields.before_data': '修改前数据',
      'ops.logs.operation.fields.request_url': '请求的接口',
      'ops.logs.operation.fields.request_params': '请求参数',
      'ops.logs.operation.fields.ip_address': 'IP地址',
      'ops.logs.operation.fields.create_time': '创建时间',
      'ops.logs.operation.types.select': '查询',
      'ops.logs.operation.types.insert': '新增',
      'ops.logs.operation.types.update': '更新',
      'ops.logs.operation.types.delete': '删除',
      'ops.logs.request.fields.user_id': '用户ID',
      'ops.logs.request.fields.username': '用户名',
      'ops.logs.request.fields.user': '用户',
      'ops.logs.request.fields.ip': 'IP地址',
      'ops.logs.request.fields.url': '请求地址',
      'ops.logs.request.fields.method': '请求方法',
      'ops.logs.request.fields.status': '状态码',
      'ops.logs.request.fields.duration': '耗时(ms)',
      'ops.logs.request.fields.create_time': '创建时间',
      'ops.logs.request.detail': '操作日志详情',
      'ops.logs.request.search_placeholder': '搜索操作日志...',
      'ops.logs.request.service_unavailable': '操作日志服务暂时不可用',
      // 模拟器相关
      'ops.simulator.select_user': '请选择用户',
      'ops.simulator.select_resource': '请选择资源',
      'ops.simulator.select_action': '请选择操作',
      'ops.simulator.admin': '管理员',
      'ops.simulator.manager': '经理',
      'ops.simulator.employee': '员工',
      'ops.simulator.user_resource': '用户',
      'ops.simulator.role_resource': '角色',
      'ops.simulator.system_resource': '系统',
      'ops.simulator.order_resource': '订单',
      'ops.simulator.view': '查看',
      'ops.simulator.edit': '编辑',
      'ops.simulator.delete': '删除',
      'ops.simulator.create': '创建',
      'ops.simulator.start': '开始模拟',
      'ops.simulator.allow_access': '允许访问',
      'ops.simulator.deny_access': '拒绝访问',
      'ops.simulator.matched_policies': '匹配的策略',
      'ops.simulator.policy_name': '策略名称',
      'ops.simulator.policy_type': '策略类型',
      'ops.simulator.effect': '效果',
      'ops.simulator.allow': '允许',
      'ops.simulator.deny': '拒绝',
      'ops.simulator.priority': '优先级',
      'ops.simulator.execution_steps': '执行步骤',
      'ops.simulator.admin_policy': '管理员策略',
      'ops.simulator.default_deny_policy': '默认拒绝策略',
      'ops.simulator.check_user_permission': '检查用户 {user} 权限',
      'ops.simulator.verify_resource_access': '验证资源 {resource} 访问权限',
      'ops.simulator.execute_action_check': '执行操作 {action} 权限检查',
      'ops.simulator.permission_verify_passed': '权限验证通过',
      'ops.simulator.permission_verify_failed': '权限验证失败',
      'ops.simulator.user_has_permission': '用户 "{user}" 对 "{resource}" 资源拥有 "{action}" 权限',
      'ops.simulator.user_no_permission': '用户 "{user}" 对 "{resource}" 资源没有 "{action}" 权限',
      'ops.simulator.simulation_complete': '模拟完成',
      'ops.simulator.form_validation_failed': '表单验证失败，请检查输入',
      // 平台运维相关
      'platform.ops.label': '运维监控',
      'platform.ops.description': '审计日志、基线配置、模拟器管理',
    },
    'en-US': {
      // 菜单配置
      'menu.ops': 'Operations',
      'menu.ops.logs': 'Log Center',
      'menu.ops.operation_log': 'Operation Log',
      'menu.ops.request_log': 'Request Log',
      'menu.ops.api_list': 'API List',
      'menu.ops.baseline': 'Baseline Configuration',
      'menu.ops.simulator': 'Simulator',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title 和 right-title）
      'title.ops.apiList.controller': 'Controller List',
      // 基线相关
      'ops.baseline.search_placeholder': 'Search baseline...',
      'ops.baseline.fields.baseline_name': 'Baseline Name',
      'ops.baseline.fields.baseline_code': 'Baseline Code',
      'ops.baseline.fields.version': 'Version',
      'ops.baseline.fields.status': 'Status',
      'ops.baseline.fields.description': 'Description',
      'ops.baseline.status.enabled': 'Enabled',
      'ops.baseline.status.disabled': 'Disabled',
      // API列表相关
      'ops.api_list.description': 'API list displays all registered API information in the system for convenient query and troubleshooting.',
      'ops.api_list.fields.controller': 'Controller',
      'ops.api_list.fields.method': 'HTTP Method',
      'ops.api_list.fields.name': 'Method Name',
      'ops.api_list.fields.path': 'Request Path',
      'ops.api_list.fields.description': 'API Description',
      'ops.api_list.fields.tags': 'Tags',
      'ops.api_list.fields.parameters': 'Parameters',
      'ops.api_list.fields.request_type': 'Request Type',
      'ops.api_list.fields.notes': 'Notes',
      'ops.api_list.search_placeholder': 'Search by controller, method name, or path...',
      'ops.api_list.controller': 'Controller',
      'ops.api_list.api_list': 'API List',
      'ops.api_list.add_not_supported': 'API list does not support add operation',
      'ops.api_list.update_not_supported': 'API list does not support update operation',
      'ops.api_list.delete_not_supported': 'API list does not support delete operation',
      // 日志相关
      'ops.logs.operation.fields.operator': 'Operator',
      'ops.logs.operation.fields.operation_desc': 'Operation Description',
      'ops.logs.operation.fields.operation_type': 'Operation Type',
      'ops.logs.operation.fields.table_name': 'Table Name',
      'ops.logs.operation.fields.before_data': 'Before Data',
      'ops.logs.operation.fields.request_url': 'Request URL',
      'ops.logs.operation.fields.request_params': 'Request Parameters',
      'ops.logs.operation.fields.ip_address': 'IP Address',
      'ops.logs.operation.fields.create_time': 'Create Time',
      'ops.logs.operation.types.select': 'Query',
      'ops.logs.operation.types.insert': 'Insert',
      'ops.logs.operation.types.update': 'Update',
      'ops.logs.operation.types.delete': 'Delete',
      'ops.logs.request.fields.user_id': 'User ID',
      'ops.logs.request.fields.username': 'Username',
      'ops.logs.request.fields.user': 'User',
      'ops.logs.request.fields.ip': 'IP Address',
      'ops.logs.request.fields.url': 'Request URL',
      'ops.logs.request.fields.method': 'Request Method',
      'ops.logs.request.fields.status': 'Status Code',
      'ops.logs.request.fields.duration': 'Duration (ms)',
      'ops.logs.request.fields.create_time': 'Create Time',
      'ops.logs.request.detail': 'Operation Log Detail',
      'ops.logs.request.search_placeholder': 'Search operation logs...',
      'ops.logs.request.service_unavailable': 'Operation log service is temporarily unavailable',
      // 模拟器相关
      'ops.simulator.select_user': 'Please select user',
      'ops.simulator.select_resource': 'Please select resource',
      'ops.simulator.select_action': 'Please select action',
      'ops.simulator.admin': 'Administrator',
      'ops.simulator.manager': 'Manager',
      'ops.simulator.employee': 'Employee',
      'ops.simulator.user_resource': 'User',
      'ops.simulator.role_resource': 'Role',
      'ops.simulator.system_resource': 'System',
      'ops.simulator.order_resource': 'Order',
      'ops.simulator.view': 'View',
      'ops.simulator.edit': 'Edit',
      'ops.simulator.delete': 'Delete',
      'ops.simulator.create': 'Create',
      'ops.simulator.start': 'Start Simulation',
      'ops.simulator.allow_access': 'Allow Access',
      'ops.simulator.deny_access': 'Deny Access',
      'ops.simulator.matched_policies': 'Matched Policies',
      'ops.simulator.policy_name': 'Policy Name',
      'ops.simulator.policy_type': 'Policy Type',
      'ops.simulator.effect': 'Effect',
      'ops.simulator.allow': 'Allow',
      'ops.simulator.deny': 'Deny',
      'ops.simulator.priority': 'Priority',
      'ops.simulator.execution_steps': 'Execution Steps',
      'ops.simulator.admin_policy': 'Admin Policy',
      'ops.simulator.default_deny_policy': 'Default Deny Policy',
      'ops.simulator.check_user_permission': 'Check user {user} permissions',
      'ops.simulator.verify_resource_access': 'Verify resource {resource} access permissions',
      'ops.simulator.execute_action_check': 'Execute action {action} permission check',
      'ops.simulator.permission_verify_passed': 'Permission verification passed',
      'ops.simulator.permission_verify_failed': 'Permission verification failed',
      'ops.simulator.user_has_permission': 'User "{user}" has "{action}" permission on "{resource}" resource',
      'ops.simulator.user_no_permission': 'User "{user}" does not have "{action}" permission on "{resource}" resource',
      'ops.simulator.simulation_complete': 'Simulation complete',
      'ops.simulator.form_validation_failed': 'Form validation failed, please check input',
      // 平台运维相关
      'platform.ops.label': 'Operations Monitoring',
      'platform.ops.description': 'Audit logs, baseline configuration, and simulator management',
    },
  },

  columns: {
    'ops.baseline': [
      { type: 'selection' },
      { type: 'index', label: 'common.index' },
      { prop: 'baselineName', label: 'ops.baseline.fields.baseline_name' },
      { prop: 'baselineCode', label: 'ops.baseline.fields.baseline_code' },
      { prop: 'version', label: 'ops.baseline.fields.version' },
      { prop: 'status', label: 'ops.baseline.fields.status' },
      { prop: 'description', label: 'ops.baseline.fields.description' },
    ] as TableColumn[],

    'ops.api_list': [
      { type: 'index', label: 'common.index' },
      { prop: 'tagsText', label: 'ops.api_list.fields.tags' },
      { prop: 'controller', label: 'ops.api_list.fields.controller' },
      { prop: 'methodName', label: 'ops.api_list.fields.name' },
      { prop: 'httpMethods', label: 'ops.api_list.fields.method' },
      { prop: 'paths', label: 'ops.api_list.fields.path' },
      { prop: 'description', label: 'ops.api_list.fields.description' },
      { prop: 'parameters', label: 'ops.api_list.fields.parameters' },
      { prop: 'notes', label: 'ops.api_list.fields.notes' },
    ] as TableColumn[],

    'ops.logs.operation': [
      { prop: 'username', label: 'ops.logs.operation.fields.operator' },
      {
        prop: 'operationType',
        label: 'ops.logs.operation.fields.operation_type',
        dict: [
          { label: 'ops.logs.operation.types.select', value: 'SELECT', type: 'info' },
          { label: 'ops.logs.operation.types.insert', value: 'INSERT', type: 'success' },
          { label: 'ops.logs.operation.types.update', value: 'UPDATE', type: 'warning' },
          { label: 'ops.logs.operation.types.delete', value: 'DELETE', type: 'danger' }
        ],
        dictColor: true
      },
      { prop: 'tableName', label: 'ops.logs.operation.fields.table_name', showOverflowTooltip: true },
      { prop: 'ipAddress', label: 'ops.logs.operation.fields.ip_address' },
      { prop: 'operationDesc', label: 'ops.logs.operation.fields.operation_desc', showOverflowTooltip: true },
      {
        prop: 'beforeData',
        label: 'ops.logs.operation.fields.before_data',
        showOverflowTooltip: false,
        // component 需要在页面中动态添加
      },
      { prop: 'createdAt', label: 'ops.logs.operation.fields.create_time', sortable: true, fixed: 'right' }
    ] as TableColumn[],

    'ops.logs.request': [
      { type: 'index', label: 'common.index' },
      { prop: 'userId', label: 'ops.logs.request.fields.user_id' },
      { prop: 'username', label: 'ops.logs.request.fields.username' },
      { prop: 'requestUrl', label: 'ops.logs.request.fields.url', showOverflowTooltip: true },
      { prop: 'params', label: 'ops.logs.request.fields.params', showOverflowTooltip: false },
      { prop: 'method', label: 'ops.logs.request.fields.method' },
      { prop: 'status', label: 'ops.logs.request.fields.status' },
      { prop: 'ip', label: 'ops.logs.request.fields.ip' },
      { prop: 'duration', label: 'ops.logs.request.fields.duration' },
      { prop: 'createTime', label: 'ops.logs.request.fields.create_time', sortable: true, fixed: 'right' }
    ] as TableColumn[],
  },

  forms: {
    'ops.baseline': [
      { prop: 'baselineName', label: 'ops.baseline.fields.baseline_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'baselineCode', label: 'ops.baseline.fields.baseline_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'version', label: 'ops.baseline.fields.version', span: 12, component: { name: 'el-input' } },
      {
        prop: 'status',
        label: 'ops.baseline.fields.status',
        span: 12,
        component: {
          name: 'el-select',
          options: [
            { label: 'ops.baseline.status.enabled', value: 'enabled' },
            { label: 'ops.baseline.status.disabled', value: 'disabled' },
          ],
        },
      },
      { prop: 'description', label: 'ops.baseline.fields.description', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
    ] as FormItem[],
  },

  get service() {
    const epsService = getService();
    return {
      baseline: null, // 使用 Mock 服务
      apiDocs: epsService.admin?.log?.apiDocs,
      operation: epsService.admin?.log?.operation,
      request: epsService.admin?.log?.request,
    };
  },
} satisfies ModuleConfig;

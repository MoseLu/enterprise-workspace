/**
 * 访问控制模块配置
 * 包含国际化配置、表格列配置和表单配置
 */

import type { ModuleConfig } from '@btc/shared-core/types/module';
import type { TableColumn, FormItem } from '@btc/shared-components';

// 参考 cool-admin-vue-7.x 的方式：使用默认值避免初始化顺序问题
// cool-admin-vue-7.x 使用: service = hmr.getData('service', { request: ... })
// 这里我们使用类似的策略：提供一个默认值，然后延迟导入实际的服务
// 延迟导入 service，避免初始化顺序问题
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

  // 如果全局服务不存在，尝试动态导入（延迟导入避免循环依赖）
  // 注意：这里不能使用 await，所以只能尝试同步访问已加载的模块
  // 如果失败，返回空对象作为默认值（参考 cool-admin-vue-7.x 的 hmr.getData 方式）
  if (!_serviceCache) {
    try {
      // 检查是否有缓存的模块引用
      const cachedModule = win.__EPS_MODULE_CACHE__;
      if (cachedModule) {
        _serviceCache = cachedModule.service || cachedModule.default || {};
        return _serviceCache;
      }
    } catch (error) {
      // 忽略错误
    }
  }

  // 兜底：返回空对象作为默认值（类似 cool-admin-vue-7.x 的默认值策略）
  _serviceCache = _serviceCache || {} as any;
  return _serviceCache;
}

export default {
  // ModuleConfig 字段
  name: 'access',
  label: 'common.module.access.label',
  order: 15,

  // 路由配置
  views: [
    {
      path: '/access/resources',
      name: 'AdminResources',
      component: () => import('./views/resources/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.access.resources',
      },
    },
    {
      path: '/access/actions',
      name: 'AdminActions',
      component: () => import('./views/actions/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.access.actions',
      },
    },
    {
      path: '/access/permissions',
      name: 'AdminPermissions',
      component: () => import('./views/permissions/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.access.permissions',
      },
    },
    {
      path: '/access/roles',
      name: 'AdminRoles',
      component: () => import('./views/roles/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.access.roles',
      },
    },
    {
      path: '/access/roles/:id/permissions',
      name: 'AdminRolePermBind',
      component: () => import('./views/role-perm-bind/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.access.role_perm_bind',
      },
    },
    {
      path: '/access/perm-compose',
      name: 'AdminPermCompose',
      component: () => import('./views/perm-compose/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.access.perm_compose',
      },
    },
    {
      path: '/access/role-permission-bind',
      name: 'AdminRolePermissionBind',
      component: () => import('./views/role-permission-bind/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.access.role_permission_bind',
      },
    },
  ],

  // PageConfig 字段（保留）
  // 国际化配置（扁平结构）
  locale: {
    'zh-CN': {
      // 菜单配置
      'menu.access': '权限管理',
      'menu.access.config': '基础配置',
      'menu.access.resources': '资源列表',
      'menu.access.actions': '行为列表',
      'menu.access.permissions': '权限列表',
      'menu.access.roles': '角色列表',
      'menu.access.role_perm_bind': '角色权限绑定',
      'menu.access.relations': '资源分配',
      'menu.access.perm_compose': '权限组合',
      'menu.access.user_assign': '用户分配',
      'menu.access.user_role_bind': '角色绑定',
      'menu.access.role_assign': '角色分配',
      'menu.access.role_permission_bind': '权限绑定',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title 和 right-title）
      'title.access.roles.domains': '域列表',
      // 字段配置
      'access.actions.fields.action_name_cn': '行为名称',
      'access.actions.fields.action_code': '行为编码',
      'access.actions.fields.action_type': '类型',
      'access.actions.fields.http_method': 'HTTP方法',
      'access.actions.fields.description': '描述',
      'access.permissions.fields.perm_name': '权限名称',
      'access.permissions.fields.perm_code': '权限编码',
      'access.permissions.fields.perm_type': '权限类型',
      'access.permissions.fields.perm_category': '权限分类',
      'access.permissions.fields.module_id': '模块ID',
      'access.permissions.fields.plugin_id': '插件ID',
      'access.permissions.fields.description': '描述',
      'access.resources.sync': '数据同步',
      'access.resources.sync_success': '数据同步成功',
      'access.resources.sync_failed': '数据同步失败',
      'access.resources.fields.resource_name_cn': '资源名称',
      'access.resources.fields.resource_code': '资源编码',
      'access.resources.fields.resource_type': '类型',
      'access.resources.fields.description': '描述',
      'access.resources.types.file': '文件',
      'access.resources.types.api': 'API',
      'access.resources.types.table': '数据表',
      'access.roles.fields.role_name': '角色名称',
      'access.roles.fields.role_code': '角色编码',
      'access.roles.fields.role_type': '角色类型',
      'access.roles.fields.parent_id': '父级角色',
      'access.roles.fields.domain_id': '所属域',
      'access.roles.fields.description': '描述',
      'access.roles.types.admin': '管理员',
      'access.roles.types.business': '业务员',
      'access.roles.types.guest': '访客',
      // 操作提示
      'access.action_name': '行为名称',
      'access.action_code': '行为编码',
      'access.type': '类型',
      'access.http_method': 'HTTP方法',
      'access.description': '描述',
      'access.permission_name': '权限名称',
      'access.permission_code': '权限编码',
      'access.permission_type': '权限类型',
      'access.permission_category': '权限分类',
      'access.module_id': '模块ID',
      'access.plugin_id': '插件ID',
      'access.data_sync': '数据同步',
      'access.data_sync_success': '数据同步成功',
      'access.data_sync_failed': '数据同步失败',
      'access.resource_name': '资源名称',
      'access.resource_code': '资源编码',
      'access.role_name': '角色名称',
      'access.role_code': '角色编码',
      'access.role_type': '角色类型',
      'access.parent_role': '父级角色',
      'access.domain': '所属域',
      'access.file': '文件',
      'access.data_table': '数据表',
      'access.admin': '管理员',
      'access.staff': '业务员',
      'access.guest': '访客',
      'access.none': '无',
      'access.unassigned': '未分配',
      'access.enter_role_name': '请输入角色名称',
      'access.enter_role_code': '请输入角色编码',
      'access.select_role_type': '请选择角色类型',
      'access.select_parent_role': '请选择父级角色',
      'access.select_domain': '请选择所属域',
      'access.enter_role_description': '请输入角色描述',
      // common.access 模块级提示信息
      'common.access.none': '无',
      'common.access.unassigned': '未分配',
      'common.access.no_common_actions': '当前选中的资源没有任何共同支持的操作',
      'common.access.select_resource_and_action': '请至少选择一个资源和操作',
      'common.access.permission_of': '的权限',
      'common.access.no_permissions_to_add': '没有可添加的权限',
      'common.access.added': '已添加',
      'common.access.removed': '已移除',
      'common.access.matrix_mode': '矩阵模式',
      'common.access.compose_mode': '组合模式',
      'common.access.switched_to': '已切换到',
      'common.access.matrix': '矩阵',
      'common.access.compose': '组合',
      'common.access.mode': '模式',
      'common.access.deselected_all': '已取消全选',
      'common.access.selected_all': '已选择全部',
      'common.access.selected_readonly': '已选择只读权限',
      'common.access.selected_edit': '已选择编辑权限',
      'common.access.selected_full_crud': '已选择完整CRUD',
      'common.access.cleared_all': '已清空全部',
      'common.access.saved': '已保存',
      'common.access.clear_all': '清空全部',
      'common.access.save_permissions': '保存权限',
      'common.access.permission_matrix': '权限矩阵',
      'common.access.action_list': '操作列表',
      'common.access.select_all': '全选',
      'common.access.quick_select': '快速选择',
      'common.access.readonly_permission': '只读权限',
      'common.access.edit_permission': '编辑权限',
      'common.access.full_crud': '完整CRUD',
      'common.access.selected_permissions': '已选权限',
      'common.access.permission_preview': '权限预览',
      'common.access.count_unit': '个',
      'common.access.generate_permissions': '生成权限',
      'common.access.save_failed': '保存失败',
      'common.access.removed_permission': '已移除',
      'common.access.permissions': '个权限',
    },
    'en-US': {
      // 菜单配置
      'menu.access': 'Access Control',
      'menu.access.config': 'Configuration',
      'menu.access.resources': 'Resource List',
      'menu.access.actions': 'Action List',
      'menu.access.permissions': 'Permission List',
      'menu.access.roles': 'Role List',
      'menu.access.role_perm_bind': 'Role Permission Binding',
      'menu.access.relations': 'Resource Assignment',
      'menu.access.perm_compose': 'Permission Composition',
      'menu.access.user_assign': 'User Assignment',
      'menu.access.user_role_bind': 'Role Binding',
      'menu.access.role_assign': 'Role Assignment',
      'menu.access.role_permission_bind': 'Permission Binding',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title 和 right-title）
      'title.access.roles.domains': 'Domain List',
      // 字段配置
      'access.actions.fields.action_name_cn': 'Action Name',
      'access.actions.fields.action_code': 'Action Code',
      'access.actions.fields.action_type': 'Type',
      'access.actions.fields.http_method': 'HTTP Method',
      'access.actions.fields.description': 'Description',
      'access.permissions.fields.perm_name': 'Permission Name',
      'access.permissions.fields.perm_code': 'Permission Code',
      'access.permissions.fields.perm_type': 'Permission Type',
      'access.permissions.fields.perm_category': 'Permission Category',
      'access.permissions.fields.module_id': 'Module ID',
      'access.permissions.fields.plugin_id': 'Plugin ID',
      'access.permissions.fields.description': 'Description',
      'access.resources.sync': 'Data Sync',
      'access.resources.sync_success': 'Data sync successful',
      'access.resources.sync_failed': 'Data sync failed',
      'access.resources.fields.resource_name_cn': 'Resource Name',
      'access.resources.fields.resource_code': 'Resource Code',
      'access.resources.fields.resource_type': 'Type',
      'access.resources.fields.description': 'Description',
      'access.resources.types.file': 'File',
      'access.resources.types.api': 'API',
      'access.resources.types.table': 'Data Table',
      'access.roles.fields.role_name': 'Role Name',
      'access.roles.fields.role_code': 'Role Code',
      'access.roles.fields.role_type': 'Role Type',
      'access.roles.fields.parent_id': 'Parent Role',
      'access.roles.fields.domain_id': 'Domain',
      'access.roles.fields.description': 'Description',
      'access.roles.types.admin': 'Administrator',
      'access.roles.types.business': 'Staff',
      'access.roles.types.guest': 'Guest',
      // 操作提示
      'access.action_name': 'Action Name',
      'access.action_code': 'Action Code',
      'access.type': 'Type',
      'access.http_method': 'HTTP Method',
      'access.description': 'Description',
      'access.permission_name': 'Permission Name',
      'access.permission_code': 'Permission Code',
      'access.permission_type': 'Permission Type',
      'access.permission_category': 'Permission Category',
      'access.module_id': 'Module ID',
      'access.plugin_id': 'Plugin ID',
      'access.data_sync': 'Data Sync',
      'access.data_sync_success': 'Data sync successful',
      'access.data_sync_failed': 'Data sync failed',
      'access.resource_name': 'Resource Name',
      'access.resource_code': 'Resource Code',
      'access.role_name': 'Role Name',
      'access.role_code': 'Role Code',
      'access.role_type': 'Role Type',
      'access.parent_role': 'Parent Role',
      'access.domain': 'Domain',
      'access.file': 'File',
      'access.data_table': 'Data Table',
      'access.admin': 'Administrator',
      'access.staff': 'Staff',
      'access.guest': 'Guest',
      'access.none': 'None',
      'access.unassigned': 'Unassigned',
      'access.enter_role_name': 'Please enter role name',
      'access.enter_role_code': 'Please enter role code',
      'access.select_role_type': 'Please select role type',
      'access.select_parent_role': 'Please select parent role',
      'access.select_domain': 'Please select domain',
      'access.enter_role_description': 'Please enter role description',
      // common.access 模块级提示信息
      'common.access.none': 'None',
      'common.access.unassigned': 'Unassigned',
      'common.access.no_common_actions': 'Currently selected resources have no common supported actions',
      'common.access.select_resource_and_action': 'Please select at least one resource and action',
      'common.access.permission_of': 'permission of',
      'common.access.no_permissions_to_add': 'No permissions to add',
      'common.access.added': 'Added',
      'common.access.removed': 'Removed',
      'common.access.matrix_mode': 'Matrix Mode',
      'common.access.compose_mode': 'Compose Mode',
      'common.access.switched_to': 'Switched to',
      'common.access.matrix': 'Matrix',
      'common.access.compose': 'Compose',
      'common.access.mode': 'Mode',
      'common.access.deselected_all': 'Deselected all',
      'common.access.selected_all': 'Selected all',
      'common.access.selected_readonly': 'Selected readonly permissions',
      'common.access.selected_edit': 'Selected edit permissions',
      'common.access.selected_full_crud': 'Selected full CRUD',
      'common.access.cleared_all': 'Cleared all',
      'common.access.saved': 'Saved',
      'common.access.clear_all': 'Clear All',
      'common.access.save_permissions': 'Save Permissions',
      'common.access.permission_matrix': 'Permission Matrix',
      'common.access.action_list': 'Action List',
      'common.access.select_all': 'Select All',
      'common.access.quick_select': 'Quick Select',
      'common.access.readonly_permission': 'Readonly Permission',
      'common.access.edit_permission': 'Edit Permission',
      'common.access.full_crud': 'Full CRUD',
      'common.access.selected_permissions': 'Selected Permissions',
      'common.access.permission_preview': 'Permission Preview',
      'common.access.count_unit': '',
      'common.access.generate_permissions': 'Generate Permissions',
      'common.access.save_failed': 'Save Failed',
      'common.access.removed_permission': 'Removed',
      'common.access.permissions': 'permissions',
    },
  },

  // 表格列配置
  columns: {
    'access.actions': [
      { type: 'selection' },
      { type: 'index', label: 'common.index' },
      { prop: 'actionNameCn', label: 'access.actions.fields.action_name_cn' },
      { prop: 'actionCode', label: 'access.actions.fields.action_code' },
      { prop: 'actionType', label: 'access.actions.fields.action_type' },
      { prop: 'httpMethod', label: 'access.actions.fields.http_method' },
      { prop: 'description', label: 'common.description' },
    ] as TableColumn[],

    'access.permissions': [
      { type: 'selection' },
      { type: 'index', label: 'common.index' },
      { prop: 'permName', label: 'access.permissions.fields.perm_name', showOverflowTooltip: true },
      { prop: 'permCode', label: 'access.permissions.fields.perm_code', showOverflowTooltip: true },
      { prop: 'permType', label: 'access.permissions.fields.perm_type' },
      { prop: 'permCategory', label: 'access.permissions.fields.perm_category' },
      { prop: 'moduleId', label: 'platform.module.name' },
      { prop: 'pluginId', label: 'platform.plugin.name' },
      { prop: 'description', label: 'common.description', showOverflowTooltip: true },
      { prop: 'createdAt', label: 'common.create_time', formatter: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : '-' },
    ] as TableColumn[],

    'access.resources': [
      { type: 'index', label: 'common.index' },
      { prop: 'resourceNameCn', label: 'access.resources.fields.resource_name_cn' },
      { prop: 'resourceCode', label: 'access.resources.fields.resource_code' },
      {
        prop: 'resourceType',
        label: 'access.resources.fields.resource_type',
        dict: [
          { label: 'access.resources.types.file', value: 'FILE', type: 'info' },
          { label: 'access.resources.types.api', value: 'API', type: 'warning' },
          { label: 'access.resources.types.table', value: 'TABLE', type: 'primary' },
        ],
        dictColor: true,
      },
      { prop: 'description', label: 'common.description' },
    ] as TableColumn[],

    'access.roles': [
      { type: 'selection' },
      { type: 'index', label: 'common.index' },
      { prop: 'roleName', label: 'access.roles.fields.role_name' },
      { prop: 'roleCode', label: 'access.roles.fields.role_code' },
      {
        prop: 'roleType',
        label: 'access.roles.fields.role_type',
        // 字典数据通过 useDictData Hook 动态获取，不再硬编码
        dictColor: true,
      },
      {
        prop: 'parentId',
        label: 'access.roles.fields.parent_id',
        formatter: (row: any) => {
          // formatter 需要在页面中动态处理
          return row.parentId === '0' ? 'access.none' : row.parentId;
        },
      },
      {
        prop: 'domainId',
        label: 'access.roles.fields.domain_id',
        formatter: (row: any) => {
          // formatter 需要在页面中动态处理
          return row.domainId || 'access.unassigned';
        },
      },
      { prop: 'description', label: 'common.description', showOverflowTooltip: true },
      { prop: 'createdAt', label: 'common.create_time', sortable: true },
    ] as TableColumn[],
  },

  // 表单配置
  forms: {
    'access.actions': [
      { prop: 'actionNameCn', label: 'access.actions.fields.action_name_cn', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'actionCode', label: 'access.actions.fields.action_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'actionType', label: 'access.actions.fields.action_type', span: 12, component: { name: 'el-input' } },
      { prop: 'httpMethod', label: 'access.actions.fields.http_method', span: 12, component: { name: 'el-input' } },
      { prop: 'description', label: 'common.description', span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
    ] as FormItem[],

    'access.permissions': [
      { prop: 'permName', label: 'access.permissions.fields.perm_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'permCode', label: 'access.permissions.fields.perm_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'permType', label: 'access.permissions.fields.perm_type', span: 12, component: { name: 'el-input' } },
      { prop: 'permCategory', label: 'access.permissions.fields.perm_category', span: 12, component: { name: 'el-input' } },
      { prop: 'moduleId', label: 'platform.module.name', span: 12, component: { name: 'el-input' } },
      { prop: 'pluginId', label: 'platform.plugin.name', span: 12, component: { name: 'el-input' } },
      { prop: 'description', label: 'common.description', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
    ] as FormItem[],

    'access.resources': [
      { prop: 'resourceNameCn', label: 'access.resources.fields.resource_name_cn', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'resourceCode', label: 'access.resources.fields.resource_code', span: 12, required: true, component: { name: 'el-input' } },
      {
        prop: 'resourceType',
        label: 'access.resources.fields.resource_type',
        span: 12,
        component: {
          name: 'el-select',
          options: [
            { label: 'access.resources.types.file', value: 'FILE' },
            { label: 'access.resources.types.api', value: 'API' },
            { label: 'access.resources.types.table', value: 'TABLE' },
          ],
        },
      },
      { prop: 'description', label: 'common.description', span: 24, component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } },
    ] as FormItem[],

    'access.roles': [
      {
        prop: 'roleName',
        label: 'access.roles.fields.role_name',
        span: 12,
        required: true,
        component: {
          name: 'el-input',
          props: {
            placeholder: 'access.enter_role_name',
          },
        },
      },
      {
        prop: 'roleCode',
        label: 'access.roles.fields.role_code',
        span: 12,
        required: true,
        component: {
          name: 'el-input',
          props: {
            placeholder: 'access.enter_role_code',
          },
        },
      },
      {
        prop: 'roleType',
        label: 'access.roles.fields.role_type',
        span: 12,
        required: true,
        component: {
          name: 'el-select',
          props: {
            placeholder: 'access.select_role_type',
            clearable: true,
          },
          // 字典选项通过 useDictData Hook 动态获取，不再硬编码
        },
      },
      {
        prop: 'parentId',
        label: 'access.roles.fields.parent_id',
        span: 12,
        component: {
          name: 'btc-cascader',
          props: {
            placeholder: 'access.select_parent_role',
            clearable: true,
            filterable: true,
            // options 需要在页面中动态传入
          },
        },
      },
      {
        prop: 'domainId',
        label: 'access.roles.fields.domain_id',
        span: 12,
        component: {
          name: 'btc-cascader',
          props: {
            placeholder: 'access.select_domain',
            clearable: true,
            filterable: true,
            // options 需要在页面中动态传入
          },
        },
      },
      {
        prop: 'description',
        label: 'common.description',
        span: 24,
        component: {
          name: 'el-input',
          props: {
            type: 'textarea',
            rows: 3,
            placeholder: 'access.enter_role_description',
          },
        },
      },
    ] as FormItem[],
  },

  // 服务配置（使用 getter 延迟访问，避免初始化顺序问题）
  get service() {
    const epsService = getService();
    return {
      action: epsService.admin?.iam?.action,
      permission: epsService.admin?.iam?.permission,
      resource: epsService.admin?.iam?.resource,
      role: epsService.admin?.iam?.role,
      domain: epsService.admin?.iam?.domain,
      // BtcMasterTableGroup 需要的左右服务
      sysdomain: epsService.admin?.iam?.domain,
      sysrole: epsService.admin?.iam?.role,
    };
  },
} satisfies ModuleConfig;

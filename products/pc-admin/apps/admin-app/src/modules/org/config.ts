/**
 * 组织与账号模块配置
 * 包含国际化配置、表格列配置和表单配置
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
  name: 'org',
  label: 'common.module.org.label',
  order: 5,

  // 路由配置
  views: [
    {
      path: '/org/tenants',
      name: 'AdminTenants',
      component: () => import('./views/tenants/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.org.tenants',
      },
    },
    {
      path: '/org/departments',
      name: 'AdminDepartments',
      component: () => import('./views/departments/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.org.departments',
      },
    },
    {
      path: '/org/users',
      name: 'AdminUsers',
      component: () => import('./views/users/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.org.users',
      },
    },
    {
      path: '/org/departments/:id/roles',
      name: 'AdminDeptRoleBind',
      component: () => import('./views/dept-role-bind/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.org.dept_role_bind',
      },
    },
    {
      path: '/org/users/users-roles',
      name: 'AdminUserRoleAssign',
      component: () => import('./views/user-role-assign/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.access.user_role_bind',
      },
    },
  ],

  // PageConfig 字段（保留）
  // 国际化配置（扁平结构）
  locale: {
    'zh-CN': {
      // 菜单配置
      'menu.org': '组织架构',
      'menu.org.tenants': '租户列表',
      'menu.org.departments': '部门列表',
      'menu.org.users': '用户列表',
      'menu.org.dept_role_bind': '部门角色绑定',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title 和 right-title）
      'title.org.dept.list': '部门列表',
      'title.org.userRoleAssign.domains': '域列表',
      // 租户相关
      'org.tenants.title': '租户列表',
      'org.tenants.tenant_name': '租户名称',
      'org.tenants.tenant_code': '租户编码',
      'org.tenants.tenant_type': '租户类型',
      'org.tenants.description': '描述',
      // 部门相关
      'org.departments.title': '部门列表',
      'org.departments.department_name': '部门名称',
      'org.departments.dept_code': '部门编码',
      'org.departments.parent_id': '上级部门',
      'org.departments.sort': '排序',
      'org.departments.import_tips': '请下载模板并填入部门信息后导入',
      'org.departments.import_empty': '导入数据为空，请检查模板内容',
      'org.departments.import_unsupported': '当前环境未配置部门导入接口',
      'org.departments.import_success': '导入成功',
      'org.departments.import_failed': '导入失败，请检查文件格式或内容',
      'org.departments.select_parent': '请选择上级部门',
      // 用户相关
      'org.users.title': '用户列表',
      'org.users.username': '用户名',
      'org.users.real_name': '中文名',
      'org.users.position': '职位',
      'org.users.dept_id': '部门',
      'org.users.status': '状态',
      'org.users.search_placeholder': '请输入用户名或姓名',
      'org.users.auto_generated': '系统自动生成',
      'org.users.no_data': '暂无数据',
      'org.users.load_user_info_failed': '加载用户信息失败',
      // 部门/角色相关
      'org.dept.list': '部门列表',
      'org.dept.unassigned': '未分配部门',
      'org.role.list': '角色列表',
      'org.role.unassigned': '未分配角色',
      // 用户角色分配
      'org.user_role_assign.left_title': '业务域',
      'org.user_role_assign.right_title': '角色绑定列表',
      'org.user_role_assign.actions.assign': '新增绑定',
      'org.user_role_assign.actions.modify_bind': '改绑',
      'org.user_role_assign.actions.multi_unbind': '批量解绑',
      'org.user_role_assign.actions.unbind': '解绑',
      'org.user_role_assign.columns.username': '用户名',
      'org.user_role_assign.columns.role_name': '角色名称',
      'org.user_role_assign.columns.role_code': '角色编码',
      'org.user_role_assign.columns.rid': '角色ID',
      'org.user_role_assign.columns.domain_id': '域ID',
      'org.user_role_assign.columns.description': '描述',
      'org.user_role_assign.columns.status': '状态',
      'org.user_role_assign.drawer.title': '批量角色绑定',
      'org.user_role_assign.drawer.subtitle': '选择授权主体与角色',
      'org.user_role_assign.drawer.role_section_title': '选择角色',
      'org.user_role_assign.drawer.role_selected_title': '已选择角色',
      'org.user_role_assign.drawer.role_keyword_placeholder': '搜索角色名称或编码',
      'org.user_role_assign.drawer.role_pagination': '角色列表分页',
      'org.user_role_assign.drawer.roleEmpty': '请先选择角色',
      'org.user_role_assign.drawer.subject_section_title': '选择授权主体',
      'org.user_role_assign.drawer.subject_selected_title': '已选择主体',
      'org.user_role_assign.drawer.subject_keyword_placeholder': '搜索姓名或账号',
      'org.user_role_assign.drawer.subject_pagination': '主体列表分页',
      'org.user_role_assign.drawer.subject_empty': '请先选择主体',
      'org.user_role_assign.drawer.search_user': '搜索用户',
      'org.user_role_assign.drawer.select_user_first': '请先选择用户',
      'org.user_role_assign.messages.bindSuccess': '绑定成功',
      'org.user_role_assign.messages.unbindSuccess': '解绑成功',
      'org.user_role_assign.messages.modifyBindSuccess': '改绑成功',
      'org.user_role_assign.messages.unbindConfirm': '确定要解绑用户 {username} 的角色 {roleName} 吗？',
      'org.user_role_assign.messages.unbindBatchConfirm': '确定要解绑选中的 {count} 条记录吗？',
      'org.user_role_assign.messages.selectRows': '请至少选择一条记录',
      'org.user_role_assign.messages.selectUsers': '请至少选择一个用户',
      'org.user_role_assign.messages.selectRoles': '请至少选择一个角色',
      'org.user_role_assign.messages.submitSuccess': '角色分配请求已提交',
      'org.user_role_assign.messages.loadRolesFailed': '加载可分配角色失败',
      'org.user_role_assign.messages.sameRole': '新角色与当前角色相同，无需修改',
      'org.user_role_assign.messages.userCodeNotFound': '用户 {identifier} 没有 userCode 字段',
      'org.user_role_assign.messages.userNotFound': '找不到用户 {identifier}',
      'org.user_role_assign.messages.roleCodeNotFound': '角色 {identifier} 没有 roleCode 字段',
      'org.user_role_assign.messages.roleNotFound': '找不到角色 {identifier}',
      'org.user_role_assign.messages.codeNotFound': '缺少 userCode 或 roleCode 字段',
      'org.user_role_assign.search_placeholder': '请输入用户名、角色ID或域ID',
      'org.user_role_assign.user.username': '账号',
      'org.user_role_assign.user.real_name': '姓名',
      'org.user_role_assign.user.status': '状态',
      // 状态相关
      'org.status.active': '激活',
      'org.status.inactive': '禁用',
      'org.status.enabled': '启用',
      'org.status.disabled': '禁用',
      'org.load_roles_failed': '加载角色列表失败',
      // common.button 应用专有按钮
      'common.button.authorize': '授权',
      'common.button.batch_unbind': '批量解绑',
    },
    'en-US': {
      // 菜单配置
      'menu.org': 'Organization',
      'menu.org.tenants': 'Tenant List',
      'menu.org.departments': 'Department List',
      'menu.org.users': 'User List',
      'menu.org.dept_role_bind': 'Department Role Binding',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title 和 right-title）
      'title.org.dept.list': 'Department List',
      'title.org.userRoleAssign.domains': 'Domain List',
      // 租户相关
      'org.tenants.title': 'Tenant List',
      'org.tenants.tenant_name': 'Tenant Name',
      'org.tenants.tenant_code': 'Tenant Code',
      'org.tenants.tenant_type': 'Tenant Type',
      'org.tenants.description': 'Description',
      // 部门相关
      'org.departments.title': 'Department List',
      'org.departments.department_name': 'Department Name',
      'org.departments.dept_code': 'Department Code',
      'org.departments.parent_id': 'Parent Department',
      'org.departments.sort': 'Sort',
      'org.departments.import_tips': 'Please download the template and fill in department information before importing',
      'org.departments.import_empty': 'Import data is empty, please check template content',
      'org.departments.import_unsupported': 'Department import interface is not configured in current environment',
      'org.departments.import_success': 'Import successful',
      'org.departments.import_failed': 'Import failed, please check file format or content',
      'org.departments.select_parent': 'Please select parent department',
      // 用户相关
      'org.users.title': 'User List',
      'org.users.username': 'Username',
      'org.users.real_name': 'Chinese Name',
      'org.users.position': 'Position',
      'org.users.dept_id': 'Department',
      'org.users.status': 'Status',
      'org.users.search_placeholder': 'Please enter username or name',
      'org.users.auto_generated': 'Auto-generated by system',
      'org.users.no_data': 'No data',
      'org.users.load_user_info_failed': 'Failed to load user info',
      // 部门/角色相关
      'org.dept.list': 'Department List',
      'org.dept.unassigned': 'Unassigned Department',
      'org.role.list': 'Role List',
      'org.role.unassigned': 'Unassigned Role',
      // 用户角色分配
      'org.user_role_assign.left_title': 'Business Domain',
      'org.user_role_assign.right_title': 'Role Binding List',
      'org.user_role_assign.actions.assign': 'Add Binding',
      'org.user_role_assign.actions.modify_bind': 'Modify Binding',
      'org.user_role_assign.actions.multi_unbind': 'Batch Unbind',
      'org.user_role_assign.actions.unbind': 'Unbind',
      'org.user_role_assign.columns.username': 'Username',
      'org.user_role_assign.columns.role_name': 'Role Name',
      'org.user_role_assign.columns.role_code': 'Role Code',
      'org.user_role_assign.columns.rid': 'Role ID',
      'org.user_role_assign.columns.domain_id': 'Domain ID',
      'org.user_role_assign.columns.description': 'Description',
      'org.user_role_assign.columns.status': 'Status',
      'org.user_role_assign.drawer.title': 'Batch Role Binding',
      'org.user_role_assign.drawer.subtitle': 'Select authorization subject and role',
      'org.user_role_assign.drawer.role_section_title': 'Select Role',
      'org.user_role_assign.drawer.role_selected_title': 'Selected Roles',
      'org.user_role_assign.drawer.role_keyword_placeholder': 'Search role name or code',
      'org.user_role_assign.drawer.role_pagination': 'Role List Pagination',
      'org.user_role_assign.drawer.roleEmpty': 'Please select a role first',
      'org.user_role_assign.drawer.subject_section_title': 'Select Authorization Subject',
      'org.user_role_assign.drawer.subject_selected_title': 'Selected Subjects',
      'org.user_role_assign.drawer.subject_keyword_placeholder': 'Search name or account',
      'org.user_role_assign.drawer.subject_pagination': 'Subject List Pagination',
      'org.user_role_assign.drawer.subject_empty': 'Please select a subject first',
      'org.user_role_assign.drawer.search_user': 'Search User',
      'org.user_role_assign.drawer.select_user_first': 'Please select a user first',
      'org.user_role_assign.messages.bindSuccess': 'Binding successful',
      'org.user_role_assign.messages.unbindSuccess': 'Unbind successful',
      'org.user_role_assign.messages.modifyBindSuccess': 'Modify binding successful',
      'org.user_role_assign.messages.unbindConfirm': 'Are you sure to unbind role {roleName} from user {username}?',
      'org.user_role_assign.messages.unbindBatchConfirm': 'Are you sure to unbind {count} selected records?',
      'org.user_role_assign.messages.selectRows': 'Please select at least one record',
      'org.user_role_assign.messages.selectUsers': 'Please select at least one user',
      'org.user_role_assign.messages.selectRoles': 'Please select at least one role',
      'org.user_role_assign.messages.submitSuccess': 'Role assignment request submitted',
      'org.user_role_assign.messages.loadRolesFailed': 'Failed to load assignable roles',
      'org.user_role_assign.messages.sameRole': 'New role is the same as current role, no modification needed',
      'org.user_role_assign.messages.userCodeNotFound': 'User {identifier} does not have userCode field',
      'org.user_role_assign.messages.userNotFound': 'User {identifier} not found',
      'org.user_role_assign.messages.roleCodeNotFound': 'Role {identifier} does not have roleCode field',
      'org.user_role_assign.messages.roleNotFound': 'Role {identifier} not found',
      'org.user_role_assign.messages.codeNotFound': 'Missing userCode or roleCode field',
      'org.user_role_assign.search_placeholder': 'Please enter username, role ID or domain ID',
      'org.user_role_assign.user.username': 'Account',
      'org.user_role_assign.user.real_name': 'Name',
      'org.user_role_assign.user.status': 'Status',
      // 状态相关
      'org.status.active': 'Active',
      'org.status.inactive': 'Inactive',
      'org.status.enabled': 'Enabled',
      'org.status.disabled': 'Disabled',
      'org.load_roles_failed': 'Failed to load roles list',
      // common.button 应用专有按钮
      'common.button.authorize': 'Authorize',
      'common.button.batch_unbind': 'Batch Unbind',
    },
  },

  // 表格列配置
  columns: {
    'org.tenants': [
      { type: 'selection' },
      { type: 'index', label: 'common.index' },
      { prop: 'tenantName', label: 'org.tenants.tenant_name' },
      { prop: 'tenantCode', label: 'org.tenants.tenant_code' },
      { prop: 'tenantType', label: 'org.tenants.tenant_type' },
      {
        prop: 'status',
        label: 'org.users.status',
        dict: [
          { label: 'org.status.enabled', value: 'ACTIVE', type: 'success' },
          { label: 'org.status.disabled', value: 'INACTIVE', type: 'danger' },
        ],
        dictColor: true,
      },
    ] as TableColumn[],

    'org.departments': [
      { type: 'selection' },
      { type: 'index', label: 'common.index' },
      { prop: 'name', label: 'org.departments.department_name' },
      { prop: 'deptCode', label: 'org.departments.dept_code' },
      {
        prop: 'parentId',
        label: 'org.departments.parent_id',
        formatter: (row: any) => {
          // formatter 需要在页面中动态处理，这里只定义结构
          return row.parentId;
        },
      },
    ] as TableColumn[],

    'org.users': [
      { type: 'selection' },
      { prop: 'username', label: 'org.users.username' },
      { prop: 'realName', label: 'org.users.real_name' },
      { prop: 'position', label: 'org.users.position' },
      {
        prop: 'name',
        label: 'org.users.dept_id',
      },
      {
        prop: 'status',
        label: 'org.users.status',
        dict: [
          { label: 'org.status.active', value: 'ACTIVE', type: 'success' },
          { label: 'org.status.inactive', value: 'INACTIVE', type: 'danger' },
        ],
        dictColor: true,
      },
    ] as TableColumn[],

    'org.user_role_assign': [
      { type: 'selection' },
      { type: 'index', label: 'common.index' },
      { prop: 'name', label: 'org.user_role_assign.columns.username', showOverflowTooltip: true },
      { prop: 'realName', label: 'org.user_role_assign.user.real_name', showOverflowTooltip: true },
      { prop: 'roleName', label: 'org.user_role_assign.columns.role_name', showOverflowTooltip: true },
      {
        type: 'op',
        label: 'crud.table.operation',
        align: 'center',
        fixed: 'right' as const,
        buttons: [
          {
            label: 'org.user_role_assign.actions.unbind',
            type: 'danger',
            icon: 'unbind',
            onClick: 'handleUnbind', // 使用字符串标识符，在页面中通过 onClickHandlers 传入
          },
        ],
      },
    ] as TableColumn[],
  },

  // 表单配置
  forms: {
    'org.tenants': [
      { prop: 'tenantName', label: 'org.tenants.tenant_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'tenantCode', label: 'org.tenants.tenant_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'tenantType', label: 'org.tenants.tenant_type', span: 12, component: { name: 'el-input' } },
      { prop: 'description', label: 'org.tenants.description', span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
    ] as FormItem[],

    'org.departments': [
      { prop: 'name', label: 'org.departments.department_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'deptCode', label: 'org.departments.dept_code', span: 12, required: true, component: { name: 'el-input' } },
      {
        prop: 'parentId',
        label: 'org.departments.parent_id',
        span: 12,
        component: {
          name: 'el-select',
          props: {
            placeholder: 'org.departments.select_parent',
            clearable: true,
            filterable: true,
          },
          // options 需要在页面中动态传入
        },
      },
      {
        prop: 'sort',
        label: 'org.departments.sort',
        span: 12,
        value: 0,
        component: {
          name: 'el-input-number',
          props: { min: 0, style: { width: '100%' } },
        },
      },
    ] as FormItem[],

    'org.users': [
      {
        prop: 'username',
        label: 'org.users.username',
        span: 12,
        component: {
          name: 'el-input',
          props: {
            readonly: true,
            placeholder: 'org.users.auto_generated',
          },
        },
      },
      {
        prop: 'realName',
        label: 'org.users.real_name',
        span: 12,
        component: {
          name: 'el-input',
          props: {
            readonly: true,
            placeholder: '暂无数据',
          },
        },
      },
      {
        prop: 'position',
        label: 'org.users.position',
        span: 12,
        component: {
          name: 'el-input',
          props: {
            readonly: true,
            placeholder: '暂无数据',
          },
        },
      },
      {
        prop: 'deptId',
        label: 'org.users.dept_id',
        span: 12,
        required: true,
        component: {
          name: 'btc-cascader',
          props: {
            placeholder: 'org.departments.select_parent',
            showCount: true,
            clearable: true,
            filterable: true,
            // options 需要在页面中动态传入
          },
        },
      },
      {
        prop: 'status',
        label: 'org.users.status',
        span: 12,
        value: 'ACTIVE',
        component: {
          name: 'el-radio-group',
          options: [
            { label: 'org.status.active', value: 'ACTIVE' },
            { label: 'org.status.inactive', value: 'INACTIVE' },
          ],
        },
      },
    ] as FormItem[],
  },

  // 服务配置（使用 getter 延迟访问，避免初始化顺序问题）
  get service() {
    const epsService = getService();
    return {
      tenant: epsService.admin?.iam?.tenant,
      dept: epsService.admin?.iam?.dept,
      user: epsService.admin?.iam?.user,
      // BtcMasterTableGroup 需要的左右服务
      sysdept: epsService.admin?.iam?.dept,
      sysuser: epsService.admin?.iam?.user,
    };
  },
} satisfies ModuleConfig;

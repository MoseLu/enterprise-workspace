/**
 * 导航模块配置
 * 包含菜单管理相关页面的配置
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
  name: 'navigation',
  label: 'common.module.navigation.label',
  order: 40,

  // 路由配置
  views: [
    {
      path: '/navigation/menus',
      name: 'AdminMenus',
      component: () => import('./views/menus/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.navigation.menus',
      },
    },
    {
      path: '/navigation/menus/:id/permissions',
      name: 'AdminMenuPermBind',
      component: () => import('./views/menu-perm-bind/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.navigation.menu_perm_bind',
      },
    },
    {
      path: '/navigation/menus/preview',
      name: 'AdminMenuPreview',
      component: () => import('./views/menu-preview/index.vue'),
      meta: {
        isPage: true,
        titleKey: 'menu.navigation.menu_preview',
      },
    },
  ],

  // PageConfig 字段（保留）
  // 国际化配置（扁平结构）
  locale: {
    'zh-CN': {
      // 菜单配置
      'menu.navigation': '导航管理',
      'menu.navigation.menus': '菜单列表',
      'menu.navigation.menu_perm_bind': '菜单权限绑定',
      'menu.navigation.menu_preview': '菜单预览',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title 和 right-title）
      'title.navigation.menus.domains': '域列表',
      // 导航相关配置
      'navigation.menu.name': '菜单名称',
      'navigation.menu.is_show': '是否显示',
      'navigation.menu.icon': '图标',
      'navigation.menu.type': '类型',
      'navigation.menu.type.directory': '目录',
      'navigation.menu.type.menu': '菜单',
      'navigation.menu.type.permission': '权限',
      'navigation.menu.router': '路由',
      'navigation.menu.keep_alive': '缓存',
      'navigation.menu.keep_alive.enable': '启用',
      'navigation.menu.keep_alive.disable': '禁用',
      'navigation.menu.view_path': '视图路径',
      'navigation.menu.perms': '权限标识',
      'navigation.menu.order_num': '排序',
      'navigation.menu.node_type': '节点类型',
      'navigation.menu.node_name': '节点名称',
      'navigation.menu.parent_node': '父节点',
      'navigation.menu.select_parent': '请选择父节点',
      'navigation.menu.router_placeholder': '请输入路由地址',
      'navigation.menu.view_path_placeholder': '请输入视图路径',
      'navigation.menu.icon_placeholder': '请输入图标名称',
      'navigation.menu.order_num_placeholder': '请输入排序号',
      'navigation.menu.perms_placeholder': '请输入权限标识，多个用逗号分隔',
      'platform.navigation.label': '导航管理',
      'platform.navigation.description': '菜单、权限绑定、预览管理',
      'platform.navigation.menu.load_menu_info_failed': '加载菜单信息失败',
      'platform.navigation.menu.load_permissions_failed': '加载权限列表失败',
      // 菜单预览
      'navigation.preview.select_role': '选择角色',
      'navigation.preview.refresh': '刷新',
    },
    'en-US': {
      // 菜单配置
      'menu.navigation': 'Navigation',
      'menu.navigation.menus': 'Menu List',
      'menu.navigation.menu_perm_bind': 'Menu Permission Binding',
      'menu.navigation.menu_preview': 'Menu Preview',
      // 标题配置（用于 BtcViewGroup/BtcMasterTableGroup 的 left-title 和 right-title）
      'title.navigation.menus.domains': 'Domain List',
      // 导航相关配置
      'navigation.menu.name': 'Menu Name',
      'navigation.menu.is_show': 'Is Show',
      'navigation.menu.icon': 'Icon',
      'navigation.menu.type': 'Type',
      'navigation.menu.type.directory': 'Directory',
      'navigation.menu.type.menu': 'Menu',
      'navigation.menu.type.permission': 'Permission',
      'navigation.menu.router': 'Router',
      'navigation.menu.keep_alive': 'Keep Alive',
      'navigation.menu.keep_alive.enable': 'Enable',
      'navigation.menu.keep_alive.disable': 'Disable',
      'navigation.menu.view_path': 'View Path',
      'navigation.menu.perms': 'Permissions',
      'navigation.menu.order_num': 'Order',
      'navigation.menu.node_type': 'Node Type',
      'navigation.menu.node_name': 'Node Name',
      'navigation.menu.parent_node': 'Parent Node',
      'navigation.menu.select_parent': 'Please select parent node',
      'navigation.menu.router_placeholder': 'Please enter router address',
      'navigation.menu.view_path_placeholder': 'Please enter view path',
      'navigation.menu.icon_placeholder': 'Please enter icon name',
      'navigation.menu.order_num_placeholder': 'Please enter order number',
      'navigation.menu.perms_placeholder': 'Please enter permissions, separated by commas',
      'platform.navigation.label': 'Navigation Management',
      'platform.navigation.description': 'Menu, permission binding, and preview management',
      'platform.navigation.menu.load_menu_info_failed': 'Failed to load menu info',
      'platform.navigation.menu.load_permissions_failed': 'Failed to load permissions list',
      // Menu Preview
      'navigation.preview.select_role': 'Select Role',
      'navigation.preview.refresh': 'Refresh',
    },
  },

  columns: {
    'navigation.menus': [
      { type: 'selection' },
      {
        prop: 'name',
        label: 'navigation.menu.name',
        align: 'left',
        fixed: 'left',
      },
      {
        prop: 'isShow',
        label: 'navigation.menu.is_show',
      },
      {
        prop: 'icon',
        label: 'navigation.menu.icon',
      },
      {
        prop: 'type',
        label: 'navigation.menu.type',
        dict: [
          { label: 'navigation.menu.type.directory', value: 0, type: 'warning' },
          { label: 'navigation.menu.type.menu', value: 1, type: 'success' },
          { label: 'navigation.menu.type.permission', value: 2, type: 'danger' },
        ],
      },
      {
        prop: 'router',
        label: 'navigation.menu.router',
      },
      {
        prop: 'keepAlive',
        label: 'navigation.menu.keep_alive',
      },
      {
        prop: 'viewPath',
        label: 'navigation.menu.view_path',
        showOverflowTooltip: true,
      },
      {
        prop: 'perms',
        label: 'navigation.menu.perms',
        headerAlign: 'center',
        showOverflowTooltip: true,
      },
      {
        prop: 'orderNum',
        label: 'navigation.menu.order_num',
        fixed: 'right',
        sortable: 'custom',
      },
    ] as TableColumn[],
  },

  forms: {
    'navigation.menus': [
      {
        prop: 'type',
        value: 0,
        label: 'navigation.menu.node_type',
        required: true,
        component: {
          name: 'el-radio-group',
          options: [
            { label: 'navigation.menu.type.directory', value: 0, type: 'warning' },
            { label: 'navigation.menu.type.menu', value: 1, type: 'success' },
            { label: 'navigation.menu.type.permission', value: 2, type: 'danger' },
          ],
        },
      },
      {
        prop: 'name',
        label: 'navigation.menu.node_name',
        component: {
          name: 'el-input',
        },
        required: true,
      },
      {
        prop: 'parentId',
        label: 'navigation.menu.parent_node',
        component: {
          name: 'el-select',
          props: {
            clearable: true,
            placeholder: 'navigation.menu.select_parent',
          },
        },
      },
      {
        prop: 'router',
        label: 'navigation.menu.router',
        hidden: ({ scope }: any) => scope.type != 1,
        component: {
          name: 'el-input',
          props: {
            placeholder: 'navigation.menu.router_placeholder',
          },
        },
      },
      {
        prop: 'keepAlive',
        value: true,
        label: 'navigation.menu.keep_alive',
        hidden: ({ scope }: any) => scope.type != 1,
        component: {
          name: 'el-radio-group',
          options: [
            { label: 'navigation.menu.keep_alive.enable', value: true },
            { label: 'navigation.menu.keep_alive.disable', value: false },
          ],
        },
      },
      {
        prop: 'isShow',
        label: 'navigation.menu.is_show',
        value: true,
        hidden: ({ scope }: any) => scope.type == 2,
        component: {
          name: 'el-switch',
        },
      },
      {
        prop: 'viewPath',
        label: 'navigation.menu.view_path',
        hidden: ({ scope }: any) => scope.type != 1,
        component: {
          name: 'el-input',
          props: {
            placeholder: 'navigation.menu.view_path_placeholder',
          },
        },
      },
      {
        prop: 'icon',
        label: 'navigation.menu.icon',
        hidden: ({ scope }: any) => scope.type == 2,
        component: {
          name: 'el-input',
          props: {
            placeholder: 'navigation.menu.icon_placeholder',
          },
        },
      },
      {
        prop: 'orderNum',
        label: 'navigation.menu.order_num',
        component: {
          name: 'el-input-number',
          props: {
            placeholder: 'navigation.menu.order_num_placeholder',
            min: 0,
            max: 99,
            'controls-position': 'right',
          },
        },
      },
      {
        prop: 'perms',
        label: 'navigation.menu.perms',
        hidden: ({ scope }: any) => scope.type != 2,
        component: {
          name: 'el-input',
          props: {
            type: 'textarea',
            rows: 3,
            placeholder: 'navigation.menu.perms_placeholder',
          },
        },
      },
    ] as FormItem[],
  },

  get service() {
    const epsService = getService();
    return {
      menu: epsService.admin?.iam?.menu,
      domain: epsService.admin?.iam?.domain,
      // BtcMasterTableGroup 需要的域服务（左侧服务）
      domainService: {
        list: (params?: any) => {
          const finalParams = params || {};
          return epsService.admin?.iam?.domain?.list(finalParams);
        }
      },
    };
  },
} satisfies ModuleConfig;

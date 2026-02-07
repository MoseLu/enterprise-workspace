/**
 * Tab 元数据注册表（主应用主导，命名空间化）
 */

// 使用动态导入避免循环依赖（micro/index.ts 导入 store/tabRegistry，而 store/tabRegistry 导入 micro/manifests）
// import { getManifestRoute, getManifest } from '@/micro/manifests';

export interface TabMeta {
  key: string;
  title: string;
  path: string;
  i18nKey?: string;
}

// 两级映射：app 级 + 路由级
const registry: Record<string, Record<string, TabMeta>> = {
  // 管理域自己的 tabs
  admin: {
    '': { key: '', title: '首页', path: '/admin', i18nKey: 'menu.home' },

    // 测试功能
    'test-components': { key: 'test-components', title: '组件测试中心', path: '/admin/test/components', i18nKey: 'menu.test_features.components' },
    'test-api-test-center': { key: 'test-api-test-center', title: 'API测试中心', path: '/admin/test/api-test-center', i18nKey: 'menu.test_features.api_test_center' },
    'test-inventory-ticket-print': { key: 'test-inventory-ticket-print', title: '盘点票打印', path: '/admin/test/inventory-ticket-print', i18nKey: 'menu.test_features.inventory_ticket_print' },

    // 平台治理
    'platform-domains': { key: 'platform-domains', title: 'Domains', path: '/admin/platform/domains', i18nKey: 'menu.platform.domains' },
    'platform-modules': { key: 'platform-modules', title: 'Modules', path: '/admin/platform/modules', i18nKey: 'menu.platform.modules' },
    'platform-plugins': { key: 'platform-plugins', title: 'Plugins', path: '/admin/platform/plugins', i18nKey: 'menu.platform.plugins' },

    // 组织与账号
    'org-tenants': { key: 'org-tenants', title: 'Tenants', path: '/admin/org/tenants', i18nKey: 'menu.org.tenants' },
    'org-departments': { key: 'org-departments', title: 'Departments', path: '/admin/org/departments', i18nKey: 'menu.org.departments' },
    'org-users': { key: 'org-users', title: 'Users', path: '/admin/org/users', i18nKey: 'menu.org.users' },
    'org-dept-role-bind': { key: 'org-dept-role-bind', title: 'Dept Role Bind', path: '/admin/org/departments/:id/roles', i18nKey: 'menu.org.dept_role_bind' },
    'org-users-users-roles': { key: 'org-users-users-roles', title: 'User Role Assign', path: '/admin/org/users/users-roles', i18nKey: 'menu.access.user_role_bind' },

    // 访问控制
    'access-resources': { key: 'access-resources', title: 'Resources', path: '/admin/access/resources', i18nKey: 'menu.access.resources' },
    'access-actions': { key: 'access-actions', title: 'Actions', path: '/admin/access/actions', i18nKey: 'menu.access.actions' },
    'access-permissions': { key: 'access-permissions', title: 'Permissions', path: '/admin/access/permissions', i18nKey: 'menu.access.permissions' },
    'access-roles': { key: 'access-roles', title: 'Roles', path: '/admin/access/roles', i18nKey: 'menu.access.roles' },
    'access-role-perm-bind': { key: 'access-role-perm-bind', title: 'Role Perm Bind', path: '/admin/access/roles/:id/permissions', i18nKey: 'menu.access.role_perm_bind' },
    'access-perm-compose': { key: 'access-perm-compose', title: 'Perm Compose', path: '/admin/access/perm-compose', i18nKey: 'menu.access.perm_compose' },

    // 导航与可见性
    'navigation-menus': { key: 'navigation-menus', title: 'Menus', path: '/admin/navigation/menus', i18nKey: 'menu.navigation.menus' },
    'navigation-menu-perm-bind': { key: 'navigation-menu-perm-bind', title: 'Menu Perm Bind', path: '/admin/navigation/menus/:id/permissions', i18nKey: 'menu.navigation.menu_perm_bind' },
    'navigation-menu-preview': { key: 'navigation-menu-preview', title: 'Menu Preview', path: '/admin/navigation/menus/preview', i18nKey: 'menu.navigation.menu_preview' },

    // 策略相关
    'strategy-management': { key: 'strategy-management', title: 'Strategy Management', path: '/admin/strategy/management', i18nKey: 'menu.strategy.management' },
    'strategy-designer': { key: 'strategy-designer', title: 'Strategy Designer', path: '/admin/strategy/designer', i18nKey: 'menu.strategy.designer' },
    'strategy-monitor': { key: 'strategy-monitor', title: 'Strategy Monitor', path: '/admin/strategy/monitor', i18nKey: 'menu.strategy.monitor' },

    // 数据治理
    'governance-files-templates': { key: 'governance-files-templates', title: 'Controlled Files', path: '/admin/governance/files/templates', i18nKey: 'menu.data.files.templates' },

    // 运维与审计
    'ops-logs-operation': { key: 'ops-logs-operation', title: 'Operation Log', path: '/admin/ops/logs/operation', i18nKey: 'menu.ops.operation_log' },
    'ops-logs-request': { key: 'ops-logs-request', title: 'Request Log', path: '/admin/ops/logs/request', i18nKey: 'menu.ops.request_log' },
    'ops-api-list': { key: 'ops-api-list', title: 'API List', path: '/admin/ops/api-list', i18nKey: 'menu.ops.api_list' },
    'ops-baseline': { key: 'ops-baseline', title: 'Baseline', path: '/admin/ops/baseline', i18nKey: 'menu.ops.baseline' },
    'ops-simulator': { key: 'ops-simulator', title: 'Simulator', path: '/admin/ops/simulator', i18nKey: 'menu.ops.simulator' },
  },
  // 子应用的表在进入时注册
  system: {},
  logistics: {},
  engineering: {},
  quality: {},
  production: {},
  finance: {},
  monitor: {},
  docs: {},
};

/**
 * 子域名到应用名称的映射
 */
const subdomainToAppMap: Record<string, string> = {
  'admin.bellis.com.cn': 'admin',
  'logistics.bellis.com.cn': 'logistics',
  'quality.bellis.com.cn': 'quality',
  'production.bellis.com.cn': 'production',
  'engineering.bellis.com.cn': 'engineering',
  'finance.bellis.com.cn': 'finance',
  'dashboard.bellis.com.cn': 'dashboard',
  'personnel.bellis.com.cn': 'personnel',
};

/**
 * 根据子域名获取应用名称
 */
function getAppFromSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname;
  return subdomainToAppMap[hostname] || null;
}

/**
 * 当前激活应用（根据路径前缀和子域名判断）
 */
export function getActiveApp(pathname: string): string {
  // 首先检查子域名
  const subdomainApp = getAppFromSubdomain();
  if (subdomainApp) {
    return subdomainApp;
  }

  // 然后检查路径前缀
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/logistics')) return 'logistics';
  if (pathname.startsWith('/engineering')) return 'engineering';
  if (pathname.startsWith('/quality')) return 'quality';
  if (pathname.startsWith('/production')) return 'production';
  if (pathname.startsWith('/finance')) return 'finance';
  if (pathname.startsWith('/docs')) return 'docs';
  if (pathname.startsWith('/operations')) return 'operations';
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/personnel')) return 'personnel';
  // 系统域是默认域，包括 /、/data/* 以及其他所有未匹配的路径
  return 'system';
}

/**
 * 从路径提取 key
 */
function extractKey(pathname: string, app: string): string {
  if (app === 'admin') {
    // 管理域：/admin/platform/domains -> 'platform-domains'
    const prefix = '/admin';
    const suffix = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
    const path = suffix.replace(/^\//, '').replace(/\//g, '-');
    return path || '';
  } else if (app === 'system') {
    // 系统域：/data/files/list -> 'data-files-list', / -> ''
    const path = pathname.replace(/^\//, '').replace(/\//g, '-');
    return path || '';
  } else {
    // 其他子应用：/logistics/procurement -> 'procurement'
    const prefix = `/${app}`;
    const suffix = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
    const path = suffix.replace(/^\//, '').replace(/\//g, '-');
    return path || '';
  }
}

/**
 * 解析 Tab 元数据
 */
export function resolveTabMeta(pathname: string): TabMeta | null {
  // 个人信息页面和认证页面不在菜单中，不需要 TabMeta
  if (pathname === '/profile' ||
      pathname === '/login' ||
      pathname === '/register' ||
      pathname === '/forget-password') {
    return null;
  }

  const app = getActiveApp(pathname);

  // 管理域：从 registry 查找（静态配置）
  if (app === 'admin') {
    const key = extractKey(pathname, app);
    const appDict = registry[app];
    if (appDict && appDict[key]) {
      return appDict[key];
    }

    // 如果精确匹配失败，尝试匹配动态路由
    // 例如：/admin/org/departments/123/roles -> org-departments-123-roles
    // 应该匹配：org-dept-role-bind（对应路径 /admin/org/departments/:id/roles）
    if (appDict) {
      // 移除路径中的数字参数，然后尝试匹配
      const pathWithoutNumbers = key.replace(/-\d+-/g, '-').replace(/-\d+$/g, '').replace(/^\d+-/g, '');

      // 尝试匹配所有 registry key，查找路径模式匹配的
      for (const [, tabMeta] of Object.entries(appDict)) {
        // 如果 registry key 对应的路径模式与当前路径匹配
        // 例如：org-dept-role-bind 的路径是 /admin/org/departments/:id/roles
        // 提取路径模式：org-departments-:id-roles -> org-departments-roles（移除 :id）
        const registryPath = tabMeta.path.replace(/\/admin/, '').replace(/^\//, '').replace(/\/:id\//g, '/').replace(/\/:id$/g, '').replace(/\//g, '-');
        const currentPathPattern = pathWithoutNumbers;

        // 如果路径模式匹配（忽略参数位置）
        if (registryPath === currentPathPattern ||
            (registryPath.includes('dept') && currentPathPattern.includes('departments')) ||
            (registryPath.includes('role') && currentPathPattern.includes('roles'))) {
          // 进一步验证：检查关键路径段是否匹配
          const registrySegments = registryPath.split('-').filter(s => s.length > 2);
          const currentSegments = currentPathPattern.split('-').filter(s => s.length > 2);

          // 如果关键段匹配度足够高，返回该 tabMeta
          const matchCount = registrySegments.filter(regSeg =>
            currentSegments.some(curSeg => regSeg.includes(curSeg) || curSeg.includes(regSeg))
          ).length;

          if (matchCount >= Math.min(registrySegments.length, currentSegments.length) * 0.6) {
            return tabMeta;
          }
        }
      }
    }

    return null;
  }

  // 对于非 admin 和非 main 的应用，先检查 registry（可能已经通过 registerManifestTabsForApp 注册）
  if (app !== 'main' && app !== 'system') {
    // 先检查 registry 中是否已经注册了 tabs
    const appDict = registry[app];
    if (appDict) {
      const key = extractKey(pathname, app);
      if (appDict[key]) {
        return appDict[key];
      }
    }

    // 如果 registry 中没有，返回 null（manifest 解析在 process.add 的异步逻辑中处理）
    // 注意：由于循环依赖，manifest 函数是延迟加载的，这里只能返回 null
    // 实际的 manifest 解析应该在异步上下文中进行（如 process.ts 中的动态导入）
    return null;
  }

  // system 应用从 registry 查找
  if (app === 'system') {
    const key = extractKey(pathname, app);
    const appDict = registry[app];
    if (appDict && appDict[key]) {
      return appDict[key];
    }
    return null;
  }

  // main 命名空间可以兜底（兼容旧逻辑）
  const key = extractKey(pathname, app);
  const mainDict = registry.main;
  if (mainDict && mainDict[key]) {
    return mainDict[key];
  }

  // main 命名空间也查不到，返回 null（不要创建脏 Tab）
  return null;
}

/**
 * 注册子应用的 Tab 定义
 */
export function registerTabs(app: string, tabs: TabMeta[]) {
  if (!registry[app]) {
    registry[app] = {};
  }

  const appRegistry = registry[app];
  if (appRegistry) {
    tabs.forEach(tab => {
      appRegistry[tab.key] = tab;
    });
  }
}

/**
 * 清理子应用的 Tab 定义
 */
export function clearTabs(app: string) {
  if (app !== 'main' && registry[app]) {
    registry[app] = {};
  }
}

/**
 * 清理除指定应用外的所有 Tab 定义
 */
export function clearTabsExcept(app: string) {
  Object.keys(registry).forEach(key => {
    if (key !== 'main' && key !== app) {
      registry[key] = {};
    }
  });
}

/**
 * 获取指定命名空间的所有 Tab 元数据
 */
export function getTabsForNamespace(app: string): TabMeta[] {
  return Object.values(registry[app] || {});
}


/**
 * Tab 元数据注册表（主应用主导，命名空间化）
 */

import { getManifestRoute, getManifest } from '@btc/shared-core/manifest';
import { getAppFromSubdomain } from '@/micro/apps';

export interface TabMeta {
  key: string;
  title: string;
  path: string;
  i18nKey?: string;
}

// 两级映射：app 级 + 路由级
const registry: Record<string, Record<string, TabMeta>> = {
  // 子应用的表在进入时注册
  admin: {},
  system: {},
  logistics: {},
  engineering: {},
  quality: {},
  production: {},
  finance: {},
};

/**
 * 当前激活应用（根据路径前缀或子域名判断）
 */
export function getActiveApp(pathname: string): string {
  const hostname = window.location.hostname;
  const subdomainApp = getAppFromSubdomain(hostname);

  if (subdomainApp) {
    return subdomainApp;
  }

  // 如果没有子域名匹配，则回退到路径匹配
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
    // 其他子应用：/quality/procurement -> 'procurement'
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
  // 个人信息页面不在菜单中，不需要 TabMeta
  if (pathname === '/profile') {
    return null;
  }

  const app = getActiveApp(pathname);

  // 所有子应用都从 manifest 查找
  if (app !== 'system' && app !== 'admin') {
    const manifestRoute = getManifestRoute(app, pathname);

    if (manifestRoute && manifestRoute.tab?.enabled !== false) {
      // 从 manifest 构建 TabMeta
      const manifest = getManifest(app);
      if (manifest) {
        const basePath = manifest.app.basePath ?? `/${app}`;
        const routePath = manifestRoute.path;
        const fullPath = `${basePath}${routePath === "/" ? "" : routePath}`;
        const manifestKey = routePath.replace(/^\//, "") || "home";

        const i18nKey = manifestRoute.tab?.labelKey ?? manifestRoute.labelKey;
        const result: TabMeta = {
          key: manifestKey,
          title: manifestRoute.tab?.labelKey ?? manifestRoute.labelKey ?? manifestRoute.label ?? fullPath,
          path: fullPath,
        };
        // 明确处理可选属性的 undefined（exactOptionalPropertyTypes）
        if (i18nKey !== undefined) {
          result.i18nKey = i18nKey;
        }
        return result;
      }
    }

    // 如果从 manifest 查不到，返回 null
    return null;
  }

  // admin 和 system 从 registry 查找
  const key = extractKey(pathname, app);
  const appDict = registry[app];
  if (appDict && appDict[key]) {
    return appDict[key];
  }

  return null;
}

/**
 * 注册子应用的 Tab 定义
 */
export function registerTabs(app: string, tabs: TabMeta[]) {
  if (!registry[app]) {
    registry[app] = {};
  }

  tabs.forEach(tab => {
    if (registry[app]) {
      registry[app][tab.key] = tab;
    }
  });
}

/**
 * 清理子应用的 Tab 定义
 */
export function clearTabs(app: string) {
  if (registry[app]) {
    registry[app] = {};
  }
}

/**
 * 清理除指定应用外的所有 Tab 定义
 */
export function clearTabsExcept(app: string) {
  Object.keys(registry).forEach(key => {
    if (key !== app) {
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


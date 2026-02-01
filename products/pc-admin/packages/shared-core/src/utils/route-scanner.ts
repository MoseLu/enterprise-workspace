/**
 * 路由扫描器
 * 从模块配置中自动提取并注册路由
 */
import type { RouteRecordRaw, Router } from '../types/vue-router';
import type { ModuleConfig } from '../types/module';
import { logger } from './logger/index';
;

/**
 * 扫描模块配置，提取路由
 */
export function scanRoutesFromModules(
  moduleConfigs: Array<{ name: string; config: ModuleConfig }>,
  options?: {
    /**
     * 是否启用自动路由发现
     * @default true
     */
    enableAutoDiscovery?: boolean;
    /**
     * 是否优先使用手动配置的路由（如果路径冲突）
     * @default true
     */
    preferManualRoutes?: boolean;
    /**
     * 是否合并 views 路由到 children（用于嵌套路由）
     * @default false
     */
    mergeViewsToChildren?: boolean;
  }
): {
  views: RouteRecordRaw[];
  pages: RouteRecordRaw[];
  conflicts: Array<{ path: string; module: string; type: 'views' | 'pages' }>;
} {
  const {
    enableAutoDiscovery = true,
    preferManualRoutes = true,
    mergeViewsToChildren = false,
  } = options || {};

  if (!enableAutoDiscovery) {
    return {
      views: [],
      pages: [],
      conflicts: [],
    };
  }

  const views: RouteRecordRaw[] = [];
  const pages: RouteRecordRaw[] = [];
  const pathMap = new Map<string, { module: string; type: 'views' | 'pages' }>();
  const conflicts: Array<{ path: string; module: string; type: 'views' | 'pages' }> = [];

  // 按 order 排序模块（order 越小越先加载）
  const sortedModules = [...moduleConfigs].sort((a, b) => {
    const orderA = a.config.order ?? 999;
    const orderB = b.config.order ?? 999;
    return orderA - orderB;
  });

  // 扫描所有模块的 views 和 pages
  for (const { name: moduleName, config } of sortedModules) {
    // 提取 views 路由
    if (config.views && Array.isArray(config.views) && config.views.length > 0) {
      for (const route of config.views) {
        // 允许空字符串作为首页路径（'' 表示首页）
        if (route.path === undefined || route.path === null) {
          console.warn(`[RouteScanner] Module "${moduleName}" has view route without path, skipping`);
          continue;
        }

        // 检查路径冲突
        const existing = pathMap.get(route.path);
        if (existing) {
          if (preferManualRoutes) {
            console.warn(
              `[RouteScanner] Route path "${route.path}" already exists in module "${existing.module}", skipping from module "${moduleName}"`
            );
            conflicts.push({ path: route.path, module: moduleName, type: 'views' });
            continue;
          } else {
            console.warn(
              `[RouteScanner] Route path "${route.path}" conflict: "${existing.module}" vs "${moduleName}", using "${moduleName}"`
            );
          }
        }

        // 确保 meta 存在
        const routeWithMeta: RouteRecordRaw = {
          ...route,
          meta: {
            ...route.meta,
            // 添加模块信息到 meta
            module: moduleName,
          },
        };

        views.push(routeWithMeta);
        pathMap.set(route.path, { module: moduleName, type: 'views' });
      }
    }

    // 提取 pages 路由
    if (config.pages && Array.isArray(config.pages) && config.pages.length > 0) {
      for (const route of config.pages) {
        // 允许空字符串作为首页路径（'' 表示首页）
        if (route.path === undefined || route.path === null) {
          console.warn(`[RouteScanner] Module "${moduleName}" has page route without path, skipping`);
          continue;
        }

        // 检查路径冲突
        const existing = pathMap.get(route.path);
        if (existing) {
          if (preferManualRoutes) {
            console.warn(
              `[RouteScanner] Route path "${route.path}" already exists in module "${existing.module}", skipping from module "${moduleName}"`
            );
            conflicts.push({ path: route.path, module: moduleName, type: 'pages' });
            continue;
          } else {
            console.warn(
              `[RouteScanner] Route path "${route.path}" conflict: "${existing.module}" vs "${moduleName}", using "${moduleName}"`
            );
          }
        }

        // 确保 meta 存在，并设置 isPage 标志
        const routeWithMeta: RouteRecordRaw = {
          ...route,
          meta: {
            ...route.meta,
            isPage: route.isPage ?? true,
            // 添加模块信息到 meta
            module: moduleName,
          },
        };

        pages.push(routeWithMeta);
        pathMap.set(route.path, { module: moduleName, type: 'pages' });
      }
    }
  }

  // 构建路由到模块的映射，存储到全局，供日志上报使用
  if (typeof window !== 'undefined') {
    const routeModuleMap: Record<string, string> = {};
    pathMap.forEach((value, path) => {
      routeModuleMap[path] = value.module;
    });
    (window as any).__BTC_ROUTE_MODULE_MAP__ = routeModuleMap;
  }

  return {
    views,
    pages,
    conflicts,
  };
}

/**
 * 从模块配置文件中扫描路由
 * 使用 import.meta.glob 扫描所有模块的 config.ts 文件
 */
export function scanRoutesFromConfigFiles(
  pattern: string = '/src/modules/*/config.ts',
  options?: {
    enableAutoDiscovery?: boolean;
    preferManualRoutes?: boolean;
    mergeViewsToChildren?: boolean;
  }
): {
  views: RouteRecordRaw[];
  pages: RouteRecordRaw[];
  conflicts: Array<{ path: string; module: string; type: 'views' | 'pages' }>;
} {
  const {
    enableAutoDiscovery = true,
    preferManualRoutes = true,
    mergeViewsToChildren = false,
  } = options || {};

  if (!enableAutoDiscovery) {
    return {
      views: [],
      pages: [],
      conflicts: [],
    };
  }

  // 扫描所有模块配置文件
  const moduleFiles = import.meta.glob('/src/modules/*/config.ts', {
    eager: true,
    import: 'default',
  });

  const moduleConfigs: Array<{ name: string; config: ModuleConfig }> = [];

  // 解析模块配置
  for (const [filePath, moduleConfig] of Object.entries(moduleFiles)) {
    try {
      // 从文件路径提取模块名
      const pathParts = filePath.split('/');
      const moduleName = pathParts[pathParts.length - 2]; // modules/{module-name}/config.ts

      if (!moduleConfig || typeof moduleConfig !== 'object') {
        console.warn(`[RouteScanner] Module "${moduleName}" config is not an object, skipping`);
        continue;
      }

      // 如果是函数，调用它（cool-admin 风格）
      const config: ModuleConfig =
        typeof moduleConfig === 'function' ? (moduleConfig as any)() : moduleConfig;

      if (!config || typeof config !== 'object') {
        console.warn(`[RouteScanner] Module "${moduleName}" config is invalid, skipping`);
        continue;
      }

      moduleConfigs.push({
        name: moduleName,
        config,
      });
    } catch (error) {
      logger.error(`[RouteScanner] Failed to parse module config from "${filePath}":`, error);
    }
  }

  return scanRoutesFromModules(moduleConfigs, {
    enableAutoDiscovery,
    preferManualRoutes,
    mergeViewsToChildren,
  });
}

/**
 * 合并手动路由和自动发现的路由
 */
export function mergeRoutes(
  manualRoutes: RouteRecordRaw[],
  autoRoutes: {
    views: RouteRecordRaw[];
    pages: RouteRecordRaw[];
  },
  options?: {
    /**
     * 是否将自动发现的 views 合并到手动路由的 children 中
     * @default false
     */
    mergeViewsToChildren?: boolean;
    /**
     * 手动路由的父路由路径（用于合并 views）
     * @default '/'
     */
    parentPath?: string;
  }
): RouteRecordRaw[] {
  const { mergeViewsToChildren = false, parentPath = '/' } = options || {};

  // 收集手动路由的所有路径
  const manualPaths = new Set<string>();
  const collectPaths = (routes: RouteRecordRaw[], prefix = '') => {
    for (const route of routes) {
      const fullPath = prefix + route.path;
      manualPaths.add(fullPath);
      if (route.children) {
        collectPaths(route.children, fullPath);
      }
    }
  };
  collectPaths(manualRoutes);

  // 过滤掉与手动路由冲突的自动路由
  const filteredViews = autoRoutes.views.filter((route) => {
    if (manualPaths.has(route.path || '')) {
      console.debug(`[RouteScanner] Filtering auto-discovered route "${route.path}" (conflicts with manual route)`);
      return false;
    }
    return true;
  });

  const filteredPages = autoRoutes.pages.filter((route) => {
    if (manualPaths.has(route.path || '')) {
      console.debug(`[RouteScanner] Filtering auto-discovered route "${route.path}" (conflicts with manual route)`);
      return false;
    }
    return true;
  });

  // 如果启用合并到 children，将 views 合并到指定父路由的 children 中
  if (mergeViewsToChildren && filteredViews.length > 0) {
    const parentRoute = manualRoutes.find((r) => r.path === parentPath);
    if (parentRoute) {
      if (!parentRoute.children) {
        parentRoute.children = [];
      }
      parentRoute.children.push(...filteredViews);
      return [...manualRoutes, ...filteredPages];
    }
  }

  // 否则，将所有路由合并
  return [...manualRoutes, ...filteredViews, ...filteredPages];
}

/**
 * 注册路由到路由器
 */
export function registerRoutes(
  router: Router,
  routes: RouteRecordRaw[],
  options?: {
    /**
     * 是否显示调试信息
     * @default false
     */
    debug?: boolean;
  }
): void {
  const { debug = false } = options || {};

  for (const route of routes) {
    try {
      router.addRoute(route);
      if (debug) {
        console.info(`[RouteScanner] Registered route: ${route.path} (${route.name || 'unnamed'})`);
      }
    } catch (error) {
      logger.error(`[RouteScanner] Failed to register route "${route.path}":`, error);
    }
  }
}

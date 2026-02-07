import type { RouteRecordRaw } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { BtcAppLayout as AppLayout } from '@btc/shared-components';
import { scanRoutesFromConfigFiles } from '@btc/shared-core/utils/route-scanner';
;

/**
 * 将相对路径转换为绝对路径（用于 system-app 的特殊路径处理）
 */
function normalizeRoutePath(route: RouteRecordRaw, isStandalone: boolean): RouteRecordRaw {
  const normalized = { ...route };

  // 独立运行时：保持相对路径（会被父路由自动拼接）
  if (isStandalone) {
    return normalized;
  }

  // qiankun 模式或 layout-app 模式：需要将相对路径转换为绝对路径
  // 关键：空字符串路径表示首页，在 qiankun 模式下应该转换为 "/"
  // 因为当访问 /system 时，qiankun 会将 "/" 传递给子应用
  if (normalized.path === undefined || normalized.path === null) {
    // 如果路径未定义，跳过处理
    return normalized;
  } else if (normalized.path === '') {
    // 空字符串表示首页，在 qiankun 模式下转换为 "/"
    // 这样当访问 /system 时，qiankun 传递的 "/" 可以匹配到首页路由
    normalized.path = '/';
  } else if (!normalized.path.startsWith('/')) {
    // 相对路径转换为绝对路径
    normalized.path = `/${normalized.path}`;
  }

  // 处理 redirect
  if (normalized.redirect) {
    if (typeof normalized.redirect === 'string') {
      if (!normalized.redirect.startsWith('/')) {
        normalized.redirect = `/${normalized.redirect}`;
      }
    } else if (typeof normalized.redirect === 'object' && normalized.redirect.path) {
      if (!normalized.redirect.path.startsWith('/')) {
        normalized.redirect = {
          ...normalized.redirect,
          path: `/${normalized.redirect.path}`,
        };
      }
    }
  }

  // 递归处理子路由
  if (normalized.children && Array.isArray(normalized.children)) {
    normalized.children = normalized.children.map(child => normalizeRoutePath(child, isStandalone));
  }

  return normalized;
}

/**
 * 获取路由配置
 * - qiankun 模式：返回页面路由（登录页等由主应用提供）
 * - layout-app 模式：返回页面路由（由 layout-app 提供 Layout）
 * - 独立运行时：使用 BtcAppLayout 包裹所有路由
 * 
 * 自动路由发现：
 * - 从所有模块的 config.ts 中自动提取 views 和 pages 路由
 * - 完全按照 cool-admin 的方案，所有路由都从模块配置中自动发现
 */
export const getSystemRoutes = (): RouteRecordRaw[] => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 自动扫描模块配置中的路由
  let pageRoutes: RouteRecordRaw[] = [];
  
  try {
    // 扫描所有模块的 config.ts，提取路由
    const autoRoutes = scanRoutesFromConfigFiles('/src/modules/*/config.ts', {
      enableAutoDiscovery: true,
      preferManualRoutes: false,
      mergeViewsToChildren: false,
    });

    // 合并 views 和 pages 路由
    pageRoutes = [...autoRoutes.views, ...autoRoutes.pages];

    // 仅在存在冲突时输出警告
    if (autoRoutes.conflicts.length > 0) {
      console.warn(`[systemRouter] Route conflicts:`, autoRoutes.conflicts);
    }
  } catch (error) {
    console.error(`[systemRouter] Failed to scan routes from modules:`, error);
    pageRoutes = [];
  }

  // qiankun 模式或 layout-app 模式：需要将相对路径转换为绝对路径
  if (!isStandalone || isUsingLayoutApp) {
    return pageRoutes.map(route => normalizeRoutePath(route, false));
  }

  // 独立运行：使用 AppLayout 包裹所有路由
  // 关键：系统应用应该使用 /system 前缀，子路由使用相对路径（会被自动拼接）
  return [
    {
      path: '/system',
      component: AppLayout,
      children: pageRoutes,
    },
    // 兼容生产环境子域名：如果没有 /system 前缀，重定向到 /system
    {
      path: '/',
      redirect: '/system',
    },
  ];
};

// 为了向后兼容，保留导出（使用函数动态获取）
export const systemRoutes = getSystemRoutes();

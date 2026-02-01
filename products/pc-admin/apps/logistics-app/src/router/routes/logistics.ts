import type { RouteRecordRaw } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { BtcAppLayout } from '@btc/shared-components';
import { scanRoutesFromConfigFiles } from '@btc/shared-core/utils/route-scanner';
import { logger } from '@btc/shared-core/utils/logger';
;

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
export const getLogisticsRoutes = (): RouteRecordRaw[] => {
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
      console.warn(`[logisticsRouter] Route conflicts:`, autoRoutes.conflicts);
    }
  } catch (error) {
    logger.error(`[logisticsRouter] Failed to scan routes from modules:`, error);
    pageRoutes = [];
  }

  // 不再添加重定向路由，首页应该是独立的首页组件

  // 如果使用 layout-app，直接返回页面路由（layout-app 会提供布局）
  if (isUsingLayoutApp) {
    return pageRoutes;
  }

  // 独立运行且不使用 layout-app：使用 BtcAppLayout 包裹所有路由
  const routes = isStandalone
    ? [
        {
          path: '/',
          component: BtcAppLayout,
          children: pageRoutes,
        },
      ]
    : [
        ...pageRoutes, // 业务路由（qiankun 模式，由主应用提供 Layout）
      ];
  return routes;
};

/**
 * 获取页面路由列表（不含布局包裹）
 * 用于生成菜单和标签页
 */
export const getLogisticsPageRoutes = (): RouteRecordRaw[] => {
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
      console.warn(`[logisticsRouter] Route conflicts:`, autoRoutes.conflicts);
    }
  } catch (error) {
    logger.error(`[logisticsRouter] Failed to scan routes from modules:`, error);
    pageRoutes = [];
  }

  // 不再添加重定向路由，首页应该是独立的首页组件

  return pageRoutes;
};

// 为了向后兼容，保留导出（使用函数动态获取）
export const logisticsRoutes = getLogisticsRoutes();

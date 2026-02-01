;
import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import type { Router } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { BtcAppLayout as AppLayout } from '@btc/shared-components';
import { getMainAppLoginUrl, logger } from '@btc/shared-core';
import { scanRoutesFromConfigFiles } from '@btc/shared-core/utils/route-scanner';

/**
 * 动态导入 @btc/shared-core
 * 所有应用都打包 @btc/shared-core，所以可以直接使用动态导入
 */
async function importSharedCore() {
  return await import('@btc/shared-core');
}

/**
 * 获取路由配置
 * 自动路由发现：从所有模块的 config.ts 中自动提取 views 和 pages 路由
 */
function getOperationsRoutes() {
  let pageRoutes: any[] = [];

  try {
    const autoRoutes = scanRoutesFromConfigFiles('/src/modules/*/config.ts', {
      enableAutoDiscovery: true,
      preferManualRoutes: false,
      mergeViewsToChildren: false,
    });

    pageRoutes = [...autoRoutes.views, ...autoRoutes.pages];
  } catch (error) {
    logger.error('[OperationsRouter] Failed to scan routes from modules:', error);
    pageRoutes = [];
  }

  return pageRoutes;
}

// 路由级别loading的延迟定时器
let routeLoadingTimer: ReturnType<typeof setTimeout> | null = null;
// 路由级别loading的延迟时间（毫秒）
const ROUTE_LOADING_DELAY = 300;

export const createOperationsRouter = (isStandalone: boolean = false): Router => {
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 自动扫描路由
  const pageRoutes = getOperationsRoutes();

  // 根据运行模式返回不同的路由配置
  // 独立运行且未使用 layout-app 时：使用 AppLayout 包裹所有路由
  // qiankun 模式或 layout-app 模式：直接返回页面路由（由主应用或 layout-app 提供 Layout）
  const routes = isStandalone && !isUsingLayoutApp
    ? [
        {
          path: '/',
          component: AppLayout,
          children: pageRoutes,
        },
      ]
    : pageRoutes;

  const router = createRouter({
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory('/'),
    strict: true,
    routes,
  });

  // 路由守卫：在生产环境子域名下规范化路径
  router.beforeEach((to: import('vue-router').RouteLocationNormalized, _from: import('vue-router').RouteLocationNormalized, next: import('vue-router').NavigationGuardNext) => {
    // 只在独立运行（非 qiankun）且是生产环境子域名时处理
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      const hostname = window.location.hostname;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      if (isProductionSubdomain && hostname === 'operations.bellis.com.cn' && to.path.startsWith('/operations/')) {
        const normalized = to.path.substring('/operations'.length) || '/';
        console.info(`[Router Path Normalize] ${to.path} -> ${normalized} (subdomain: ${hostname})`);
        next({
          path: normalized,
          query: to.query,
          hash: to.hash,
          replace: true,
        });
        return;
      }
    }

    // 清除之前的延迟定时器
    if (routeLoadingTimer) {
      clearTimeout(routeLoadingTimer);
      routeLoadingTimer = null;
    }

    // 检查是否有应用级别loading正在显示
    const isAppLoadingVisible = ((): boolean => {
      try {
        const appLoadingEl = document.querySelector('.app-loading') as HTMLElement;
        if (!appLoadingEl) {
          return false;
        }
        const style = window.getComputedStyle(appLoadingEl);
        return style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               style.opacity !== '0' &&
               parseFloat(style.opacity) > 0;
      } catch (e) {
        return false;
      }
    })();

    // 延迟显示路由loading（如果应用loading未显示）
    if (!isAppLoadingVisible) {
      routeLoadingTimer = setTimeout(async () => {
        try {
          const sharedCore = await importSharedCore();
          if (sharedCore?.routeLoadingService) {
            sharedCore.routeLoadingService.show();
          }
        } catch (error) {
          // 静默失败
        }
      }, ROUTE_LOADING_DELAY);
    }

    next();
  });

  // 路由后置守卫：清除路由loading的延迟定时器并隐藏路由loading
  router.afterEach(async () => {
    // 清除延迟定时器
    if (routeLoadingTimer) {
      clearTimeout(routeLoadingTimer);
      routeLoadingTimer = null;
    }

    // 隐藏路由loading
    try {
      const sharedCore = await importSharedCore();
      if (sharedCore?.routeLoadingService) {
        sharedCore.routeLoadingService.hide();
      }
    } catch (error) {
      // 静默失败
    }

    // 关键：清理 ECharts 实例，防止内存泄漏
    try {
      const { cleanupAllECharts } = await import('@btc/shared-components');
      if (cleanupAllECharts) {
        cleanupAllECharts();
      }
    } catch (error) {
      // 静默失败
    }
  });

  // 关键：参考 cool-admin，在路由解析完成后立即关闭 Loading（beforeResolve）
  // 这样可以在路由解析完成后、组件渲染前就关闭 loading，比等待应用挂载更快
  // 关键优化：立即关闭 loading，确保与 cool-admin 一致的性能
  let loadingClosed = false;
  router.beforeResolve(async () => {
    // 清除路由loading的延迟定时器（路由即将解析完成，不需要再显示路由loading）
    if (routeLoadingTimer) {
      clearTimeout(routeLoadingTimer);
      routeLoadingTimer = null;
    }

    // 隐藏路由loading（如果正在显示）
    try {
      const sharedCore = await importSharedCore();
      if (sharedCore?.routeLoadingService) {
        sharedCore.routeLoadingService.hide();
      }
    } catch (error) {
      // 静默失败
    }

    if (!loadingClosed) {
      const loadingEl = document.getElementById('Loading');
      if (loadingEl) {
        // 关键：立即隐藏并移除 loading，确保与 cool-admin 一致的性能
        // 使用内联样式确保优先级，立即隐藏
        loadingEl.style.setProperty('display', 'none', 'important');
        loadingEl.style.setProperty('visibility', 'hidden', 'important');
        loadingEl.style.setProperty('opacity', '0', 'important');
        loadingEl.style.setProperty('pointer-events', 'none', 'important');
        loadingEl.classList.add('is-hide');

        // 延迟移除 DOM 元素（不影响显示，只是清理）
        setTimeout(() => {
          try {
            loadingEl.remove();
          } catch {
            // 忽略移除错误
          }
        }, 350);

        loadingClosed = true;
      }
    }
  });

  router.onError((error: Error) => {
    console.warn('[operations-app] Router error:', error);
  });

  return router;
};


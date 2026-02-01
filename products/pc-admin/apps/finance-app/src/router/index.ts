;
import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import type { Router } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { getMainAppLoginUrl } from '@btc/shared-core';
import { getFinanceRoutes } from './routes/finance';

/**
 * 动态导入 @btc/shared-core
 * 所有应用都打包 @btc/shared-core，所以可以直接使用动态导入
 */
async function importSharedCore() {
  return await import('@btc/shared-core');
}

/**
 * 规范化路径：在生产环境子域名下，移除应用前缀
 */
function normalizePath(path: string): string {
  // 只在独立运行（非 qiankun）且是生产环境子域名时处理
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    return path; // qiankun 模式保持原路径
  }

  const hostname = window.location.hostname;
  const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

  if (!isProductionSubdomain) {
    return path; // 非生产环境子域名，保持原路径
  }

  // 检测是否是 finance 子域名
  if (hostname === 'finance.bellis.com.cn' && path.startsWith('/finance/')) {
    const normalized = path.substring('/finance'.length) || '/';
    console.info(`[Router Path Normalize] ${path} -> ${normalized} (subdomain: ${hostname})`);
    return normalized;
  }

  return path;
}

// 路由级别loading的延迟定时器
let routeLoadingTimer: ReturnType<typeof setTimeout> | null = null;
// 路由级别loading的延迟时间（毫秒）
const ROUTE_LOADING_DELAY = 300;

export const createFinanceRouter = (): Router => {
  // 动态获取路由配置，确保在运行时正确检测是否使用 layout-app
  const routes = getFinanceRoutes();

  const router = createRouter({
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory(),
    strict: true,
    routes,
  });

  // 路由守卫：在生产环境子域名下规范化路径
  router.beforeEach((to: any, _from: any, next: any) => {
    const normalizedPath = normalizePath(to.path);

    if (normalizedPath !== to.path) {
      // 路径需要规范化，重定向到规范化后的路径
      next({
        path: normalizedPath,
        query: to.query,
        hash: to.hash,
        replace: true,
      });
      return;
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

  router.onError((error: any) => {
    console.warn('[finance-app] Router error:', error);
  });

  return router;
};

// 导出路由配置获取函数和路由常量
export { getFinanceRoutes, financeRoutes } from './routes/finance';


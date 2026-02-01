;
import type { App } from 'vue';
import type { Router } from 'vue-router';
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { BtcAppLayout as AppLayout } from '@btc/shared-components';
import { getMainAppLoginUrl, logger } from '@btc/shared-core';
import { scanRoutesFromConfigFiles } from '@btc/shared-core/utils/route-scanner';

/**
 * 获取路由配置
 * 自动路由发现：从所有模块的 config.ts 中自动提取 views 和 pages 路由
 */
function getPersonnelRoutes() {
  let pageRoutes: any[] = [];
  
  try {
    const autoRoutes = scanRoutesFromConfigFiles('/src/modules/*/config.ts', {
      enableAutoDiscovery: true,
      preferManualRoutes: false,
      mergeViewsToChildren: false,
    });

    pageRoutes = [...autoRoutes.views, ...autoRoutes.pages];

    // 仅在存在冲突时输出警告
    if (autoRoutes.conflicts.length > 0) {
      console.warn(`[PersonnelRouter] Route conflicts:`, autoRoutes.conflicts);
    }
  } catch (error) {
    logger.error('[PersonnelRouter] Failed to scan routes from modules:', error);
    pageRoutes = [];
  }

  return pageRoutes;
}

/**
 * 创建人事应用路由
 */
export const createPersonnelRouter = (): Router => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 自动扫描路由
  const pageRoutes = getPersonnelRoutes();

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
    // 在 qiankun 环境下使用 MemoryHistory，避免路由冲突
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory('/'),
    strict: true,
    routes,
  });

  // 路由守卫：在生产环境子域名下规范化路径
  router.beforeEach((to: any, _from: any, next: any) => {
    // 只在独立运行（非 qiankun）且是生产环境子域名时处理
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      const hostname = window.location.hostname;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      if (isProductionSubdomain && hostname === 'personnel.bellis.com.cn' && to.path.startsWith('/personnel/')) {
        const normalized = to.path.substring('/personnel'.length) || '/';
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

    next();
  });

  // 关键：参考 cool-admin，在路由解析完成后立即关闭 Loading（beforeResolve）
  // 这样可以在路由解析完成后、组件渲染前就关闭 loading，比等待应用挂载更快
  // 关键优化：立即关闭 loading，确保与 cool-admin 一致的性能
  let loadingClosed = false;
  router.beforeResolve(() => {
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
    console.warn('[personnel-app] Router error:', error);
  });

  return router;
};

export const setupRouter = (app: App, router?: Router) => {
  const instance = router ?? createPersonnelRouter();
  app.use(instance);
  return instance;
};

export type { Router };

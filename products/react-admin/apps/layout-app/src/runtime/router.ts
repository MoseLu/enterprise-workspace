/**
 * layout-app 路由配置
 *
 * 特点：
 * 1. 不包含任何业务路由
 * 2. 包含全局404处理（当qiankun子应用加载失败或路由未匹配时显示）
 * 3. 其他路由交给 qiankun 子应用处理
 */
;

import { createRouter, createWebHistory } from 'vue-router';
import { getManifestRoute, getManifest } from '@btc/shared-core/manifest';
import { getCurrentAppFromPath } from '@btc/shared-components';
import { isMainApp } from '@btc/shared-core/configs/unified-env-config';
import { tSync } from './i18n/getters';

// 路由配置：包含404页面和catchAll路由
const routes = [
  {
    path: '/404',
    name: 'NotFound404',
    component: () => import('@btc/shared-components').then(m => m.BtcError404),
    meta: {
      titleKey: 'common.page_not_found',
      isPage: true,
      pageType: 'error'
    },
  },
  {
    path: '/',
    name: 'root',
    // 空组件，实际内容由 qiankun 子应用提供
    component: { template: '<div></div>' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'subapp',
    // 空组件，实际内容由 qiankun 子应用提供
    // 如果qiankun未匹配到子应用，路由守卫会重定向到404
    component: { template: '<div></div>' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 根据路径获取应用前缀
const getAppPrefix = (pathname: string): string => {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/logistics')) return 'logistics';
  if (pathname.startsWith('/engineering')) return 'engineering';
  if (pathname.startsWith('/quality')) return 'quality';
  if (pathname.startsWith('/production')) return 'production';
  if (pathname.startsWith('/finance')) return 'finance';
  if (pathname.startsWith('/monitor')) return 'monitor';
  if (pathname.startsWith('/operations')) return 'operations';
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/personnel')) return 'personnel';
  return 'system';
};

// 初始化：获取当前路径的应用前缀
let previousAppPrefix = getAppPrefix(window.location.pathname);

// 设置全局状态，供路由守卫和qiankun错误处理使用
if (typeof window !== 'undefined') {
  (window as any).__LAYOUT_APP_QIANKUN_LOADING__ = false;
  (window as any).__LAYOUT_APP_QIANKUN_LOAD_FAILED__ = false;
}

// 路由守卫：处理未匹配的路由，在qiankun加载失败时显示404
router.beforeEach((to: import('vue-router').RouteLocationNormalized, _from: import('vue-router').RouteLocationNormalized, next: import('vue-router').NavigationGuardNext) => {
  // 404页面直接放行
  if (to.path === '/404') {
    next();
    return;
  }

  // 最优先：检查是否是静态 HTML 文件（duty 下的页面）
  // 这些页面应该由服务器直接提供，完全绕过 Vue Router
  if (to.path.startsWith('/duty/')) {
    // 使用 next(false) 取消 Vue Router 的导航，让浏览器直接请求静态文件
    next(false);
    return;
  }

  // 检查是否是公开页面（登录、注册、忘记密码），这些页面不应该重定向到404
  const publicPages = ['/login', '/register', '/forget-password'];
  const isPublicPage = publicPages.includes(to.path);

  if (isPublicPage) {
    // 公开页面，直接放行
    next();
    return;
  }

  // 检查是否是已知的子应用路径前缀
  const knownSubAppPrefixes = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance', '/monitor', '/docs', '/operations', '/dashboard', '/personnel'];
  const isSubAppRoute = knownSubAppPrefixes.some(prefix => to.path.startsWith(prefix));

  if (isSubAppRoute) {
    // 子应用路由：放行让qiankun处理
    // 如果qiankun加载失败，onError会处理并重定向到404
    next();
    return;
  }

  // 关键：检查是否是主应用路由（使用统一的 isMainApp 函数判断）
  // 主应用路由应该由 main-app 自己处理，layout-app 不应该拦截
  // 注意：在路由守卫中，应该优先使用 to.path（目标路径），而不是 window.location.pathname（当前路径）
  // 因为菜单点击时，window.location.pathname 可能还没有更新
  const isStandalone = typeof window !== 'undefined' && !(window as any).__POWERED_BY_QIANKUN__;
  // 关键：优先使用 to.path，因为这是目标路径，在路由守卫中更准确
  // 如果 to.path 和 window.location.pathname 不同，说明是路由跳转，应该使用 to.path
  const locationPath = typeof window !== 'undefined' ? window.location.pathname : to.path;
  // 如果目标路径和当前路径不同，优先使用目标路径
  const pathToCheck = to.path !== locationPath ? to.path : (locationPath || to.path);
  const isMainAppRoute = isMainApp(pathToCheck, pathToCheck, isStandalone);

  if (import.meta.env.DEV) {
    console.info('[layout-app router] beforeEach:', {
      path: to.path,
      locationPath,
      pathToCheck,
      isStandalone,
      isMainAppRoute,
      isSubAppRoute,
    });
  }

  if (isMainAppRoute) {
    // 关键修复：layout-app 只服务于子应用的独立访问，不应该处理主应用路由
    // 主应用路由应该由 main-app 处理，但 layout-app 没有注册 main-app
    // 所以应该重定向到404，提示用户主应用路由在 layout-app 环境下不可用
    if (import.meta.env.DEV) {
      console.warn(`[layout-app router] ${tSync('common.error.router_unavailable')}:`, to.path);
    }
    next('/404');
    return;
  }

  // system-app 是基座应用，它的路由应该由 system-app 自己处理
  // layout-app 只作为模板应用，不处理 system-app 的路由
  // 如果访问的是 system-app 的路由，应该重定向到 system-app 或者显示提示
  // 这里我们允许通过，让 system-app 自己处理（如果 system-app 已经加载）
  // 或者重定向到默认子应用
  if (to.path === '/') {
    // 根路径：重定向到默认子应用
    next('/logistics');
    return;
  }

  // 其他路由（可能是 system-app 的路由）：放行，让 system-app 自己处理
  // 如果 system-app 没有加载，会显示空白或由 system-app 的 404 处理
  next();
});

// 关键：参考 cool-admin，在路由解析完成后立即关闭 Loading（beforeResolve）
// 这样可以在路由解析完成后、组件渲染前就关闭 loading，比等待应用挂载更快
router.beforeResolve(() => {
  // 使用简化版的 rootLoadingService 来关闭 loading
  import('@btc/shared-core').then(({ rootLoadingService }) => {
    rootLoadingService.hide();
  }).catch(() => {
    // 如果导入失败，使用兜底方案
    const loadingEl = document.getElementById('Loading');
    if (loadingEl) {
      setTimeout(() => {
        loadingEl.classList.add('is-hide');
      }, 0);
    }
  });
});

router.afterEach((to: import('vue-router').RouteLocationNormalized) => {
  // 跳过404页面
  if (to.path === '/404') {
    return;
  }

  const currentAppPrefix = getAppPrefix(to.path);

  // 关键：如果 layout-app 被子应用嵌入（__BTC_LAYOUT_APP_EMBEDDED_BY_SUBAPP__ 为 true），
  // 或者在使用 layout-app 环境下（__USE_LAYOUT_APP__ 为 true，生产环境子域名模式），
  // 每次路由变化都触发 popstate，让子应用能够同步路由并立即渲染内容
  const isEmbeddedBySubApp = typeof window !== 'undefined' && !!(window as any).__BTC_LAYOUT_APP_EMBEDDED_BY_SUBAPP__;
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  if (isEmbeddedBySubApp || isUsingLayoutApp) {
    // 关键修复：在 layout-app 模式下，立即触发 subapp:route-change 事件，让 tabbar 和菜单立即更新
    // 这样用户点击菜单后，tabbar 和菜单激活状态能立即更新，而不需要等待子应用路由同步
    const app = getCurrentAppFromPath(to.path);

    // 如果是子应用路由，立即触发 subapp:route-change 事件
    if (app && app !== 'main' && app !== 'docs') {
      const manifest = getManifest(app);
      if (!manifest) {
        // 如果找不到 manifest，跳过
        return;
      }

      const basePath = manifest.app.basePath ?? `/${app}`;

      // 构建路由路径（在生产环境子域名模式下，路径直接是子应用路由）
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

      // 提取子应用内部路径
      let subAppPath = to.path;
      if (!isProductionSubdomain && subAppPath.startsWith(basePath)) {
        // 开发环境：去掉应用前缀
        subAppPath = subAppPath.slice(basePath.length) || '/';
      }

      // 确保路径以 / 开头
      if (!subAppPath.startsWith('/')) {
        subAppPath = `/${subAppPath}`;
      }

      // 从 manifest 中查找路由信息
      const manifestRoute = manifest.routes.find((route) => route.path === subAppPath);

      if (manifestRoute) {
        // 构建 fullPath（完整路径）
        // 在生产环境子域名模式下，fullPath 就是当前路径（已经是子域名）
        // 在开发环境下，fullPath 需要包含应用前缀
        const fullPath = isProductionSubdomain ? to.path : (to.path.startsWith(basePath) ? to.path : `${basePath}${subAppPath}`);

        // 获取 labelKey
        const labelKey = manifestRoute.tab?.labelKey ?? manifestRoute.labelKey;

        // 立即触发 subapp:route-change 事件
        window.dispatchEvent(
          new CustomEvent('subapp:route-change', {
            detail: {
              path: fullPath,
              fullPath,
              name: undefined,
              meta: {
                labelKey,
                titleKey: labelKey,
                isHome: manifestRoute.path === '/',
                process: manifestRoute.tab?.enabled !== false,
                breadcrumbs: manifestRoute.breadcrumbs,
              },
            },
          })
        );
      }
    }

    // 嵌入模式或 layout-app 模式：每次路由变化都触发 popstate，确保子应用能收到路由同步信号
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        // 触发 popstate 事件，让子应用的 setupHostLocationBridge 能够同步路由
        window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
      });
    });
  } else {
    // 独立运行模式（qiankun 模式）
    // 关键修复：即使是在同一应用内切换路由，也需要触发 popstate 事件
    // 让子应用的 setupHostLocationBridge 能够同步路由并更新内容
    const isAppSwitch = previousAppPrefix && previousAppPrefix !== currentAppPrefix;
    const isSameAppRouteChange = previousAppPrefix && previousAppPrefix === currentAppPrefix && currentAppPrefix !== 'system';

    // 触发 popstate 事件的情况：
    // 1. 跨应用切换：让 qiankun 重新匹配路由（qiankun 内部使用 single-spa，会监听 popstate 事件）
    // 2. 同一应用内路由切换：让子应用的 setupHostLocationBridge 能够同步路由并更新内容
    if (isAppSwitch || isSameAppRouteChange) {
      // 使用 nextTick 确保路由切换完成后再触发
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          // 触发 popstate 事件
          // 注意：qiankun 的 activeRule 会判断应用是否应该激活，不会因为 popstate 就重新挂载
          // 所以即使在同一应用内切换路由时触发 popstate，也不会导致应用重新挂载
          window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
        });
      });
    }

    // 关键：检查子应用是否成功加载（延迟检查，给 qiankun 一些时间加载）
    // 如果子应用路由没有内容，可能是 qiankun 没有匹配到应用，应该重定向到404
    if (currentAppPrefix !== 'system') {
      setTimeout(() => {
        const viewport = document.querySelector('#subapp-viewport');
        const hasContent = viewport && viewport.children.length > 0;
        const loadFailed = (window as any).__LAYOUT_APP_QIANKUN_LOAD_FAILED__;

        // 如果加载失败或没有内容，且当前路径不是404，则重定向到404
        if ((loadFailed || !hasContent) && to.path !== '/404' && to.path !== '/') {
          router.push('/404');
        }
      }, 2000); // 延迟2秒检查，给 qiankun 足够的时间加载
    }
  }

  previousAppPrefix = currentAppPrefix;
});

export default router;


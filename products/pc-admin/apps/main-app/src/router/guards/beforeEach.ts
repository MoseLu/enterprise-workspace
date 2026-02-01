import type { Router, RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { getAppBySubdomain } from '@btc/shared-core/configs/app-scanner';
import { getMainAppHomeRoute, getMainAppRoutes } from '@btc/shared-core';
import { sessionStorage } from '@btc/shared-core/utils/storage/session';
import { createLogoutGuard, createLoginRedirectGuard, createAuthGuard } from '@btc/shared-router';
import { KNOWN_SUB_APP_PREFIXES, APP_NAME_MAP, PUBLIC_PAGES } from '../constants';
import { isAuthenticated } from '../utils/auth';
import { normalizeRoutePath } from '../utils/path';

/**
 * 动态导入 @btc/shared-core
 */
async function importSharedCore() {
  return await import('@btc/shared-core');
}

/**
 * 初始化 qiankun 事件监听器
 */
function setupQiankunEventListener() {
  if (typeof window === 'undefined') return;

  // 监听 qiankun:after-mount 事件，立即关闭应用级 loading
  window.addEventListener('qiankun:after-mount', (event: any) => {
    const appName = event.detail?.appName;
    if (!appName) return;

    const appDisplayName = APP_NAME_MAP[appName] || appName;

    // 立即同步关闭应用级 loading（不等待异步导入）
    const loadingEls = document.querySelectorAll('.app-loading');
    loadingEls.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        // 立即移除 DOM 元素
        try {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        } catch (e) {
          // 忽略移除错误
        }
      }
    });

    // 异步调用 appLoadingService.hide() 进行清理
    importSharedCore().then((sharedCore) => {
      if (sharedCore?.appLoadingService) {
        sharedCore.appLoadingService.hide(appDisplayName);
      }
    }).catch(() => {
      // 静默失败
    });
  });
}

/**
 * 处理子应用路由
 */
function handleSubAppRoute(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  router: Router
) {
  // 先检查是否是主应用路由（需要排除，因为主应用路由也以 /dashboard 开头）
  const mainAppRoutes = getMainAppRoutes();
  const isMainAppRoute = mainAppRoutes.mainAppRoutes.some(route => to.path === route || to.path.startsWith(route + '/'));

  if (isMainAppRoute) {
    // 主应用路由，不在这里处理
    return false;
  }

  const isSubAppRoute = KNOWN_SUB_APP_PREFIXES.some(prefix => to.path.startsWith(prefix));

  if (!isSubAppRoute) {
    return false;
  }

  // 立即隐藏"拜里斯科技"loading，使用同步方式，确保优先级
  const systemLoadingEl = document.getElementById('Loading');
  if (systemLoadingEl) {
    systemLoadingEl.style.setProperty('display', 'none', 'important');
    systemLoadingEl.style.setProperty('visibility', 'hidden', 'important');
    systemLoadingEl.style.setProperty('opacity', '0', 'important');
    systemLoadingEl.style.setProperty('pointer-events', 'none', 'important');
    systemLoadingEl.style.setProperty('z-index', '-1', 'important');
    systemLoadingEl.classList.add('is-hide');
  }

  // 立即隐藏rootLoadingService（如果正在显示）
  try {
    if ((window as any).__BTC_ROOT_LOADING_SERVICE__) {
      const rootLoadingService = (window as any).__BTC_ROOT_LOADING_SERVICE__;
      if (rootLoadingService && typeof rootLoadingService.hide === 'function') {
        rootLoadingService.hide();
      }
    }
  } catch (error) {
    // 静默失败
  }

  // 立即隐藏路由loading（如果正在显示）
  try {
    const routeLoadingEl = document.querySelector('.route-loading') as HTMLElement;
    if (routeLoadingEl) {
      routeLoadingEl.style.setProperty('display', 'none', 'important');
      routeLoadingEl.style.setProperty('visibility', 'hidden', 'important');
      routeLoadingEl.style.setProperty('opacity', '0', 'important');
    }
    importSharedCore().then((sharedCore) => {
      if (sharedCore?.routeLoadingService) {
        sharedCore.routeLoadingService.hide();
      }
    }).catch(() => {
      // 静默失败
    });
  } catch (error) {
    // 静默失败
  }

  // 判断是否是真正的应用切换
  const getAppNameFromPath = (path: string): string | null => {
    const pathParts = path.split('/').filter(Boolean);
    const firstPart = pathParts[0] || '';
    return KNOWN_SUB_APP_PREFIXES.some(prefix => prefix === `/${firstPart}`) ? firstPart : null;
  };

  const fromAppName = _from.path ? getAppNameFromPath(_from.path) : null;
  const toAppName = getAppNameFromPath(to.path);

  const isRealAppSwitch =
    (fromAppName === null && toAppName !== null) ||
    (fromAppName !== null && toAppName !== null && fromAppName !== toAppName);

  // 只有真正的应用切换时才显示应用级别loading
  if (isRealAppSwitch && toAppName) {
    const container = document.querySelector('#subapp-viewport') as HTMLElement;
    if (container) {
      container.style.setProperty('display', 'none', 'important');
      container.style.setProperty('visibility', 'hidden', 'important');
      container.style.setProperty('opacity', '0', 'important');
    }

    const appDisplayName = APP_NAME_MAP[toAppName] || toAppName;

    if (appDisplayName && appDisplayName !== '应用' && appDisplayName !== toAppName) {
      importSharedCore().then((sharedCore) => {
        if (sharedCore?.appLoadingService) {
          sharedCore.appLoadingService.show(appDisplayName, container || undefined);
        }
      }).catch(() => {
        // 静默失败
      });
    }
  }

  return true;
}

/**
 * 处理路径规范化
 */
function handlePathNormalization(
  to: RouteLocationNormalized,
  next: NavigationGuardNext
): boolean {
  const isNormalizing = sessionStorage.get<string>('__BTC_ROUTE_NORMALIZING__') === '1';
  const normalizedPath = normalizeRoutePath(to.path);

  if (normalizedPath) {
    sessionStorage.set('__BTC_ROUTE_NORMALIZING__', '1');
    
    const appName = Object.keys(APP_NAME_MAP).find(key => normalizedPath.startsWith(`/${key}`));
    if (appName) {
      const appDisplayName = APP_NAME_MAP[appName];
      if (appDisplayName) {
        sessionStorage.set('__BTC_NAV_APP_NAME__', appDisplayName);
      }
    }

    // 再次确保"拜里斯科技"loading被隐藏
    const systemLoadingEl = document.getElementById('Loading');
    if (systemLoadingEl) {
      systemLoadingEl.style.setProperty('display', 'none', 'important');
      systemLoadingEl.style.setProperty('visibility', 'hidden', 'important');
      systemLoadingEl.style.setProperty('opacity', '0', 'important');
      systemLoadingEl.style.setProperty('pointer-events', 'none', 'important');
      systemLoadingEl.style.setProperty('z-index', '-1', 'important');
      systemLoadingEl.classList.add('is-hide');
    }

    next({
      path: normalizedPath,
      query: to.query,
      hash: to.hash,
      replace: true,
    });
    return true;
  }

  // 如果路径规范化完成，清除标记
  if (isNormalizing) {
    setTimeout(function() {
      sessionStorage.remove('__BTC_ROUTE_NORMALIZING__');
    }, 100);
  }

  return false;
}

/**
 * 检查是否为公开页面
 */
function isPublicPage(to: RouteLocationNormalized): boolean {
  return (
    to.meta?.public === true ||
    to.path === '/login' ||
    to.path === '/forget-password' ||
    to.path === '/register' ||
    to.path.startsWith('/duty/')
  );
}

// 创建共享路由守卫实例
const logoutGuard = createLogoutGuard({
  appName: 'main',
});

const authGuard = createAuthGuard({
  appName: 'main',
  publicPages: PUBLIC_PAGES,
  loginPath: '/login',
  isAuthenticated,
});

/**
 * 处理认证检查
 */
function handleAuthentication(
  to: RouteLocationNormalized,
  next: NavigationGuardNext,
  router: Router
): boolean {
  const publicPage = isPublicPage(to);
  
  if (publicPage) {
    return false;
  }

  const isAuthenticatedUser = isAuthenticated();

  if (import.meta.env.DEV) {
    console.log('[handleAuthentication] 认证检查:', {
      path: to.path,
      isPublic: publicPage,
      isAuthenticated: isAuthenticatedUser,
    });
  }

  if (!isAuthenticatedUser) {
    if (import.meta.env.DEV) {
      console.log('[handleAuthentication] ❌ 未认证，但已禁用重定向到登录页:', {
        targetPath: to.fullPath,
      });
    }
    // 不再重定向，允许继续导航
    return false;
  }

  return false;
}

/**
 * 处理未匹配路由
 */
function handleUnmatchedRoute(
  to: RouteLocationNormalized,
  next: NavigationGuardNext
): boolean {
  if (to.matched.length > 0) {
    return false;
  }

  // 对于根路径，应该允许它继续，让路由配置中的 redirect 处理
  if (to.path === '/') {
    next();
    return true;
  }

  // 对于首页，应该总是匹配
  const homeRoute = getMainAppHomeRoute();
  if (to.path === homeRoute) {
    next();
    return true;
  }

  // 检查是否是主应用路由（优先检查，避免被误判为未匹配）
  const mainAppRoutes = getMainAppRoutes();
  const isMainAppRoute = mainAppRoutes.mainAppRoutes.some(route => {
    const normalizedRoute = route.replace(/\/+$/, '') || '/';
    const normalizedPath = to.path.replace(/\/+$/, '') || '/';
    const matches = normalizedPath === normalizedRoute || normalizedPath.startsWith(normalizedRoute + '/');
    if (import.meta.env.DEV && to.path.includes('/workbench/todo')) {
      console.info('[beforeEach] 检查主应用路由匹配:', {
        route,
        normalizedRoute,
        normalizedPath,
        toPath: to.path,
        matches,
      });
    }
    return matches;
  });

  if (isMainAppRoute) {
    // 主应用路由，允许继续
    if (import.meta.env.DEV && to.path.includes('/workbench/todo')) {
      console.info('[beforeEach] 主应用路由匹配成功，允许继续:', to.path);
    }
    next();
    return true;
  }
  
  if (import.meta.env.DEV && to.path.includes('/workbench/todo')) {
    console.warn('[beforeEach] 主应用路由未匹配，将重定向到404:', {
      toPath: to.path,
      mainAppRoutes: mainAppRoutes.mainAppRoutes,
      matchedLength: to.matched.length,
    });
  }

  const isPublicPageCheck = PUBLIC_PAGES.includes(to.path);
  const isDutyPage = to.path.startsWith('/duty/');
  const isHomePage = to.path.startsWith('/home');

  if (isHomePage) {
    next(false);
    return true;
  }

  if (isPublicPageCheck || isDutyPage) {
    next();
    return true;
  }

  const isAuthenticatedUser = isAuthenticated();

  if (!isAuthenticatedUser) {
    // 未认证，不再重定向到登录页（已禁用）
    if (import.meta.env.DEV) {
      console.log('[handleUnmatchedRoute] ❌ 未认证，但已禁用重定向到登录页:', {
        targetPath: to.fullPath,
      });
    }
    // 继续处理，不重定向
    // 不返回 true，让后续逻辑继续处理（可能会重定向到 404）
  }

  // 检查是否是子应用路由
  const isSubAppRoute = KNOWN_SUB_APP_PREFIXES.some(prefix => to.path.startsWith(prefix));

  if (isSubAppRoute) {
    next();
    return true;
  }

  // 主应用路由未匹配，重定向到 404 页面
  next('/404');
  return true;
}

/**
 * 设置路由前置守卫
 */
export function setupBeforeEachGuard(router: Router) {
  // 初始化 qiankun 事件监听器
  setupQiankunEventListener();

  // 创建登录页重定向守卫（需要 router 实例，所以在这里创建）
  const loginRedirectGuard = createLoginRedirectGuard({
    appName: 'main',
    homeRoute: '/workbench/overview',
    getMainAppHomeRoute: () => getMainAppHomeRoute(),
    isAuthenticated,
    router, // 传递 router 实例，用于同应用内跳转
  });

  router.beforeEach(async (to, _from, next) => {
    // 监控系统：路由导航开始
    const { trackRouteNavigationStart } = await import('@btc/shared-core/utils/monitor');
    trackRouteNavigationStart(_from.path, to.path);

    // 处理子应用路由
    if (handleSubAppRoute(to, _from, router)) {
      // 继续处理其他逻辑
    }

    // 检查是否是静态 HTML 文件
    if (to.path.startsWith('/duty/')) {
      next(false);
      return;
    }

    // 检查是否是 home-app 的页面
    if (to.path.startsWith('/home')) {
      next(false);
      return;
    }

    // 处理路径规范化
    if (handlePathNormalization(to, next)) {
      if (import.meta.env.DEV && to.path.includes('/workbench/todo')) {
        console.info('[beforeEach] 路径规范化处理，已调用 next');
      }
      return;
    }

    // 处理子域名环境
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';
    const appBySubdomain = getAppBySubdomain(hostname);
    const currentSubdomainApp = appBySubdomain?.id;

    if (isProductionSubdomain && currentSubdomainApp) {
      const publicPage = isPublicPage(to);
      if (publicPage) {
        next();
        return;
      }
      next();
      return;
    }

    // 执行共享路由守卫（按优先级顺序）
    // 使用一个标志来跟踪是否已经调用了 next()
    let nextCalled = false;
    const wrappedNext: NavigationGuardNext = ((result?: any) => {
      if (!nextCalled) {
        nextCalled = true;
        next(result);
      }
    }) as NavigationGuardNext;

    // 1. 退出登录守卫（最高优先级）
    await logoutGuard(to, _from, wrappedNext);
    if (nextCalled) {
      return;
    }

    // 2. 登录页重定向守卫
    await loginRedirectGuard(to, _from, wrappedNext);
    if (nextCalled) {
      return;
    }

    // 3. 认证守卫
    await authGuard(to, _from, wrappedNext, router);
    if (nextCalled) {
      return;
    }

    // 处理应用特定的认证检查（保留原有逻辑作为兜底）
    // 关键：如果访问的是登录页，且已经通过了 loginRedirectGuard，不应该再执行认证检查
    // 因为 loginRedirectGuard 已经处理了登录页的重定向逻辑
    if (to.path !== '/login' && handleAuthentication(to, wrappedNext, router)) {
      // handleAuthentication 返回 true 表示已经处理了（调用了 next）
      if (nextCalled) {
        return;
      }
    }

    // 处理未匹配路由
    if (handleUnmatchedRoute(to, next)) {
      return;
    }

    // 继续路由导航
    next();
  });
}


;
import { storage } from '@btc/shared-utils';
import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import type { Router, RouteLocationNormalized } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { getAdminRoutes } from './routes/admin';
import { getCookie } from '@btc/shared-core/utils/cookie';
import { createTitleGuard } from '@btc/shared-router';
import { tSync } from '../i18n/getters';
import { getEnvironment, getCurrentSubApp } from '@btc/shared-core/configs/unified-env-config';
import { getAppIdFromPath, getMainAppLoginUrl } from '@btc/shared-core';

/**
 * 动态导入 @btc/shared-core
 * 所有应用都打包 @btc/shared-core，所以可以直接使用动态导入
 */
async function importSharedCore() {
  return await import('@btc/shared-core');
}

// 使用共享的 getMainAppLoginUrl 函数，不再需要本地实现

/**
 * 规范化路径：在生产环境子域名下，移除应用前缀
 */
function normalizePath(path: string): string {
  // 只在独立运行（非 qiankun）且是生产环境子域名时处理
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    return path; // qiankun 模式保持原路径
  }

  const env = getEnvironment();
  const currentSubdomainApp = getCurrentSubApp();

  if (env !== 'production' && env !== 'test') {
    return path; // 非生产/测试环境，保持原路径
  }

  // 检测是否是 admin 子域名
  if (currentSubdomainApp === 'admin' && path.startsWith('/admin/')) {
    const normalized = path.substring('/admin'.length) || '/';
    return normalized;
  }

  return path;
}

// 路由级别loading的延迟定时器
let routeLoadingTimer: ReturnType<typeof setTimeout> | null = null;
// 路由级别loading的延迟时间（毫秒）
const ROUTE_LOADING_DELAY = 300;

export const createAdminRouter = (): Router => {
  // 在创建路由时动态获取路由配置，确保 isStandalone 检测正确
  const routes = getAdminRoutes();
  const router = createRouter({
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory(),
    strict: true,
    routes,
  });

  // 检查用户是否已认证（独立运行时使用）
  const isAuthenticated = (): boolean => {
    // 关键：如果正在使用 layout-app（通过 qiankun 加载），由 layout-app 处理认证
    // 此时 admin-app 是在 qiankun 环境下运行的，应该由 layout-app 或主应用处理认证
    if (qiankunWindow.__POWERED_BY_QIANKUN__ || (window as any).__USE_LAYOUT_APP__) {
      // qiankun 模式下由主应用或 layout-app 处理认证
      // 在 layout-app 环境下，layout-app 会从主应用获取认证状态
      // 如果认证失败，layout-app 会处理重定向，这里直接返回 true 避免重复检查
      return true;
    }

    // 独立运行时：检查本地认证状态
    // 关键：cookie 是后端设置的，是认证的权威来源。如果 cookie 不存在，说明后端已经认为用户未认证。
    // 因此，如果 cookie 不存在，应该立即返回 false，不再检查其他本地存储。
    const cookieToken = getCookie('access_token');

    // 如果 cookie 不存在，立即返回 false
    // 这是安全的关键：cookie 是后端设置的，如果后端移除了 cookie，说明用户未认证
    if (!cookieToken) {
      return false;
    }

    // cookie 存在时，可以进一步检查其他本地存储作为补充（可选）
    // 但即使其他本地存储没有数据，只要 cookie 存在，也应该返回 true
    // 因为 cookie 是后端设置的，是认证的权威来源

    return true;
  };

  // 关键：先注册 titleGuard，确保它的 beforeEach 能够被触发
  // 注册标题守卫（使用国际化翻译函数）
  // 优先使用主应用的 i18n 实例（包含已合并的子应用国际化消息），否则使用子应用的 tSync
  // 关键：使用同步导入，确保 titleGuard 在路由变化前已注册完成
  try {
    // 创建翻译函数：优先使用主应用的 i18n 实例
    const translate = (key: string): string => {
      // 优先使用主应用的 i18n 实例（包含已合并的子应用国际化消息）
      if (typeof window !== 'undefined' && (window as any).__MAIN_APP_I18N__) {
        const mainI18n = (window as any).__MAIN_APP_I18N__;
        if (mainI18n && mainI18n.global) {
          try {
            // 获取当前语言
            const localeValue = mainI18n.global.locale;
            const currentLocale = (typeof localeValue === 'string' ? localeValue : localeValue.value) as 'zh-CN' | 'en-US';

            // 更新语言（如果需要）
            if (typeof mainI18n.global.locale === 'object' && 'value' in mainI18n.global.locale) {
              const stored = storage.get<string>('locale');
              if (stored === 'zh-CN' || stored === 'en-US') {
                mainI18n.global.locale.value = stored;
              }
            }

            // 尝试翻译
            const g = mainI18n.global as any;
            if (g && g.te && g.t) {
              // 优先直接访问消息对象
              const localeMessages = g.getLocaleMessage(currentLocale) || {};
              if (key in localeMessages) {
                const value = localeMessages[key];
                if (typeof value === 'string') {
                  return value;
                } else if (typeof value === 'function') {
                  try {
                    return value({ normalize: (arr: any[]) => arr[0] });
                  } catch {
                    // 如果函数调用失败，继续使用 g.t
                  }
                }
              }

              // 使用 g.te 和 g.t
              if (g.te(key, currentLocale)) {
                const translated = g.t(key, currentLocale);
                if (translated && typeof translated === 'string' && translated !== key) {
                  return translated;
                }
              }
            }
          } catch (error) {
            // 如果主应用 i18n 翻译失败，继续使用子应用的 tSync
          }
        }
      }

      // 后备：使用子应用的 tSync 函数
      return tSync(key);
    };

    // 创建自定义的 getAppId 函数，确保在 qiankun 环境下使用 'admin' 作为应用 ID
    const getAppId = (to: RouteLocationNormalized): string => {
      // 在 qiankun 环境下，子应用的路由路径不包含应用前缀
      // 但是我们需要确保应用 ID 是 'admin'
      return 'admin';
    };

    createTitleGuard(router, {
      getAppId,
      translate,
      preloadConfig: true,
    });
  } catch (error) {
    // 如果导入失败，不影响路由功能
    if (import.meta.env.DEV) {
      console.warn('[admin-app router] Failed to setup title guard:', error);
    }
  }

  // 路由守卫：在生产环境子域名下规范化路径，并在独立运行时检查认证
  router.beforeEach(async (to, from, next) => {
    // 关键修复：在 qiankun 或 layout-app 环境下，如果当前路由是首页但 URL 不是首页，
    // 说明路由初始化时匹配到了默认路由，需要立即重定向到正确的路由
    const isQiankun = qiankunWindow.__POWERED_BY_QIANKUN__;
    const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

    if ((isQiankun || isUsingLayoutApp) && to.path === '/' && from.path === '/') {
      // 检查当前 URL 是否真的是首页
      const { pathname } = window.location;
      const basePath = '/admin';

      // 检查是否在子域名环境下（生产/测试环境）
      const env = getEnvironment();
      const currentSubdomainApp = getCurrentSubApp();
      const isProductionOrTestSubdomain = (env === 'production' || env === 'test') && currentSubdomainApp === 'admin';

      let expectedPath = '/';
      if (isProductionOrTestSubdomain) {
        // 子域名环境下，路径直接是子应用路由
        expectedPath = pathname === '/' ? '/' : pathname;
      } else {
        // 路径前缀环境下（如 /admin/xxx）
        if (pathname.startsWith(basePath)) {
          const suffix = pathname.slice(basePath.length) || '/';
          expectedPath = suffix.startsWith('/') ? suffix : `/${suffix}`;
        }
      }

      // 如果期望的路由不是首页，立即重定向
      if (expectedPath !== '/') {
        next({
          path: expectedPath,
          query: to.query,
          hash: to.hash,
          replace: true,
        });
        return;
      }
    }

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

    // 关键：只在应用切换时调用 checkUser（同一应用内的路由切换不调用）
    // 使用全局环境检测工具判断是否是应用切换
    const isAppSwitch = (() => {
      // 如果是首次加载（from.name 为 undefined 或 from.path === '/'），不算应用切换
      if (!from.name || from.path === '/') {
        return false;
      }

      // 在 qiankun 或 layout-app 环境下，通过全局环境检测工具判断是否是应用切换
      if (isQiankun || isUsingLayoutApp) {
        try {
          // 使用 getAppIdFromPath 获取 from 和 to 对应的应用 ID
          const fromAppId = getAppIdFromPath(from.path);
          const toAppId = getAppIdFromPath(to.path);
          // 如果应用 ID 不同，说明是应用切换
          return fromAppId !== toAppId;
        } catch (error) {
          // 如果获取失败，静默失败，不调用 checkUser
          if (import.meta.env.DEV) {
            console.warn('[router] Failed to get app ID from path:', error);
          }
          return false;
        }
      }

      // 默认情况下（独立运行模式），不算应用切换
      return false;
    })();

    // 只在应用切换时调用 checkUser
    if (isAppSwitch) {
      try {
        // 动态导入 checkUser 函数，避免循环依赖
        const { checkUser } = await import('../utils/domain-cache');
        // 异步调用 checkUser，但不阻塞路由跳转
        // 如果检查失败，会在后续的认证检查中处理
        checkUser().catch((error) => {
          if (import.meta.env.DEV) {
            console.warn('[router] User check failed:', error);
          }
        });
      } catch (error) {
        // 静默失败，不影响路由跳转
        if (import.meta.env.DEV) {
          console.warn('[router] Failed to import checkUser:', error);
        }
      }
    }

    // 清除之前的延迟定时器
    if (routeLoadingTimer) {
      clearTimeout(routeLoadingTimer);
      routeLoadingTimer = null;
    }

    // 关键：在独立运行模式下，不显示路由 loading
    // 因为独立运行模式下，应用级 loading 已经处理了，不需要路由级 loading
    // 注意：isUsingLayoutApp 已在上面声明，这里直接使用
    const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp;

    // 检查是否有应用级别loading正在显示
    // 注意：使用DOM查询作为同步检查（因为beforeEach需要同步判断）
    // 应用级别loading使用fixed定位，添加到body，所以直接在body中查找
    const isAppLoadingVisible = ((): boolean => {
      try {
        // 检查body中是否有.app-loading元素（因为应用级别loading使用fixed定位，添加到body）
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

    // 关键：在独立运行模式下，不显示路由 loading，避免黑屏问题
    // 延迟显示路由loading（如果应用loading未显示且不是独立运行模式）
    if (!isAppLoadingVisible && !isStandalone) {
      // 延迟300ms显示路由loading，避免快速切换时的闪烁
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

    // 独立运行时：检查认证
    // 关键：如果正在使用 layout-app（通过 qiankun 加载），由 layout-app 处理认证
    // 此时不应该进行认证检查，避免在 layout-app 加载完成前误判为未认证
    // 注意：isUsingLayoutApp 已在上面声明，这里直接使用

    if (!isUsingLayoutApp) {
      const isAuth = isAuthenticated();

      // 关键：如果已经在登录页且用户已认证，重定向到目标页面
      // 但是，如果查询参数中有 logout=1，说明是退出登录，应该允许访问登录页
      if (to.path === '/login' || to.path.startsWith('/login?')) {
        if (isAuth && !to.query.logout && !to.query.from) {
          // 已认证且不是退出登录，重定向到目标页面
          const redirect = (to.query.oauth_callback as string) || '/admin';
          // 只取路径部分，忽略查询参数，避免循环重定向
          const redirectPath = redirect.split('?')[0] || '/admin';
          // 确保路径包含 /admin 前缀
          const finalPath = redirectPath.startsWith('/admin') ? redirectPath : `/admin${redirectPath}`;
          next(finalPath);
          return;
        }
        // 如果是退出登录或未认证，允许访问登录页
        next();
        return;
      }

      // 非登录页：如果未认证，重定向到主应用的登录页面
      if (!isAuth) {
        // 构建重定向路径：确保包含应用前缀，以便登录后能够正确返回
        let redirectPath = to.fullPath;

        // 判断是否在生产/测试环境子域名下
        const env = getEnvironment();
        const currentSubdomainApp = getCurrentSubApp();
        const isProductionOrTestSubdomain = (env === 'production' || env === 'test') && currentSubdomainApp === 'admin';

        // 在生产/测试环境子域名下，路径已经规范化（没有 /admin 前缀），需要添加前缀
        // 在开发环境或其他环境下，路径可能已经包含 /admin 前缀，需要检查
        if (isProductionOrTestSubdomain) {
          // 生产环境子域名下，路径是规范化后的（如 /user/list），需要添加 /admin 前缀
          if (!redirectPath.startsWith('/admin') && redirectPath !== '/') {
            redirectPath = `/admin${redirectPath}`;
          }
        } else {
          // 开发环境或其他环境，路径可能不包含 /admin 前缀，需要添加
          if (!redirectPath.startsWith('/admin') && redirectPath !== '/') {
            redirectPath = `/admin${redirectPath}`;
          }
        }

        const mainAppLoginUrl = getMainAppLoginUrl(redirectPath);
        // 使用 window.location 进行跨域重定向（如果需要）
        window.location.href = mainAppLoginUrl;
        return;
      }
    } else {
      // 在 layout-app 环境下，认证由 layout-app 处理
      // 这里不进行认证检查
    }

    next();
  });

  // 路由后置守卫：清除路由loading的延迟定时器并隐藏路由loading，同时添加tabbar
  router.afterEach(async (to) => {
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

    // 关键：在独立运行模式下，添加 tabbar 逻辑
    // 检查是否是独立运行模式（非 qiankun 且非 layout-app）
    const isUsingLayoutApp = qiankunWindow.__POWERED_BY_QIANKUN__ || (window as any).__USE_LAYOUT_APP__;

    if (!isUsingLayoutApp) {
      // 独立运行模式，需要自己添加 tabbar
      // 跳过首页和登录页
      if (to.meta?.isHome === true || to.path === '/' || to.path === '/login' || to.path.startsWith('/login')) {
        // 如果是首页，将所有标签设为未激活
        if (to.meta?.isHome === true || to.path === '/') {
          try {
            const { useProcessStore } = await import('../store/process');
            const process = useProcessStore();
            process.list.forEach((tab) => {
              tab.active = false;
            });
          } catch (error) {
            // 静默失败
          }
        }
        return;
      }

      // 跳过个人信息页面
      if (to.path === '/profile') {
        return;
      }

      // 只添加有效的路由（必须有 name）
      if (!to.name) {
        return;
      }

      // 构建完整路径（在生产/测试环境子域名下，需要添加 /admin 前缀）
      const env = getEnvironment();
      const currentSubdomainApp = getCurrentSubApp();
      const isProductionOrTestSubdomain = (env === 'production' || env === 'test') && currentSubdomainApp === 'admin';

      let fullPath = to.fullPath;
      let path = to.path;

      // 在生产/测试环境子域名下，路径已经规范化（没有 /admin 前缀），需要添加前缀用于 tabbar
      if (isProductionOrTestSubdomain) {
        if (!path.startsWith('/admin') && path !== '/') {
          path = `/admin${path}`;
          // 构建 fullPath，包含查询参数和 hash
          const queryString = to.fullPath.includes('?') ? to.fullPath.substring(to.fullPath.indexOf('?')) : '';
          fullPath = `${path}${queryString}`;
        }
      }

      // 使用 store 添加路由到标签页
      try {
        const { useProcessStore } = await import('../store/process');
        const process = useProcessStore();

        // 关键优化：检查当前路由的标签是否已经是激活状态，避免重复更新导致闪烁
        const existingTab = process.list.find((tab) =>
          tab.fullPath === fullPath || tab.path === path
        );
        if (existingTab && existingTab.active) {
          // 标签已经是激活状态，不需要更新
          return;
        }

        // 将路由的 titleKey 转换为 labelKey，以便 tabbar 正确显示
        const meta = { ...to.meta } as any;
        if (meta.titleKey && !meta.labelKey) {
          meta.labelKey = meta.titleKey;
        }

        process.add({
          path,
          fullPath,
          name: to.name as string,
          meta,
        });
      } catch (error) {
        // 静默失败
        if (import.meta.env.DEV) {
          console.warn('[admin-app router] Failed to add tab:', error);
        }
      }
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

      try {
        // 关闭 NProgress（如果正在运行）
        const NProgress = (window as any).NProgress;
        if (NProgress && typeof NProgress.done === 'function') {
          NProgress.done();
        }

        // 隐藏 AppSkeleton（如果存在）
        const skeleton = document.getElementById('app-skeleton');
        if (skeleton) {
          skeleton.style.setProperty('display', 'none', 'important');
          skeleton.style.setProperty('visibility', 'hidden', 'important');
          skeleton.style.setProperty('opacity', '0', 'important');
        }
      } catch (e) {
        // 静默失败
      }
    }
  });

  router.onError(() => {
    // 路由错误已处理
  });

  // 注意：titleGuard 已经在上面注册了，这里不需要重复注册

  return router;
};

// 导出路由配置获取函数和路由常量
export { getAdminRoutes, adminRoutes } from './routes/admin';

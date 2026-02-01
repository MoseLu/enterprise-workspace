;
import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
  type RouteRecordRaw,
  type RouteLocationNormalized,
  type Router,
  type NavigationGuardNext,
} from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { BtcAppLayout as Layout } from '@btc/shared-components';
import { sessionStorage } from '@btc/shared-core/utils/storage/session';
import { createAuthGuard, createTitleGuard } from '@btc/shared-router';
import { config } from '../config';
import { tSync } from '../i18n/getters';
// 使用动态导入避免循环依赖
// import { useProcessStore, getCurrentAppFromPath } from '../store/process';
import { registerManifestTabsForApp, registerManifestMenusForApp } from '../micro/index';
import { getSystemRoutes } from './routes/system-routes';
import { getCookie } from '@btc/shared-core/utils/cookie';
import { storage } from '@btc/shared-utils';
import { getTabsForNamespace } from '../store/tabRegistry';
import { getAppBySubdomain } from '@btc/shared-core/configs/app-scanner';
import { getEnvironment, getCurrentSubApp } from '@btc/shared-core/configs/unified-env-config';
import { getMainAppLoginUrl } from '@btc/shared-core';

/**
 * 动态导入 @btc/shared-core
 * 所有应用都打包 @btc/shared-core，所以可以直接使用动态导入
 */
async function importSharedCore() {
  return await import('@btc/shared-core');
}

// 使用共享的 getMainAppLoginUrl 函数，不再需要本地实现

// 关键：系统应用应该使用 getSystemRoutes() 返回的路由配置
// 这个函数会根据运行模式（qiankun 或独立运行）返回正确的路由配置
// 在 qiankun 模式下，路由使用相对路径（由主应用处理 basePath）
// 在独立运行时，路由使用 /system 前缀
const routes: RouteRecordRaw[] = [
  // 使用 getSystemRoutes() 获取正确的路由配置
  ...getSystemRoutes(),
  // 子应用路由占位（qiankun会接管，这里只需要Layout）
  {
    path: '/admin',
    component: Layout,
    meta: { title: 'Admin App', isHome: true, isSubApp: true },
  },
  {
    path: '/admin/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Admin App', isSubApp: true },
  },
  {
    path: '/logistics',
    component: Layout,
    meta: { title: 'Logistics App', isHome: true, isSubApp: true },
  },
  {
    path: '/logistics/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Logistics App', isSubApp: true },
  },
  {
    path: '/engineering',
    component: Layout,
    meta: { title: 'Engineering App', isHome: true, isSubApp: true },
  },
  {
    path: '/engineering/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Engineering App', isSubApp: true },
  },
  {
    path: '/quality',
    component: Layout,
    meta: { title: 'Quality App', isHome: true, isSubApp: true },
  },
  {
    path: '/quality/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Quality App', isSubApp: true },
  },
  {
    path: '/production',
    component: Layout,
    meta: { title: 'Production App', isHome: true, isSubApp: true },
  },
  {
    path: '/production/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Production App', isSubApp: true },
  },
  {
    path: '/finance',
    component: Layout,
    meta: { title: 'Finance App', isHome: true, isSubApp: true },
  },
  {
    path: '/finance/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Finance App', isSubApp: true },
  },
  {
    path: '/operations',
    component: Layout,
    meta: { title: 'Operations App', isHome: true, isSubApp: true },
  },
  {
    path: '/operations/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Operations App', isSubApp: true },
  },
  {
    path: '/docs',
    component: Layout,
    meta: { title: 'Docs App', isHome: true, isSubApp: true },
  },
  {
    path: '/docs/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Docs App', isSubApp: true },
  },
  {
    path: '/dashboard',
    component: Layout,
    meta: { title: 'Dashboard App', isHome: true, isSubApp: true },
  },
  {
    path: '/dashboard/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Dashboard App', isSubApp: true },
  },
  {
    path: '/personnel',
    component: Layout,
    meta: { title: 'Personnel App', isHome: true, isSubApp: true },
  },
  {
    path: '/personnel/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Personnel App', isSubApp: true },
  },
  {
    path: '/mobile',
    component: Layout,
    meta: { title: 'Mobile App', isHome: true, isSubApp: true },
  },
  {
    path: '/mobile/:pathMatch(.*)+',
    component: Layout,
    meta: { title: 'Mobile App', isSubApp: true },
  },
  // 注意：/home 路径不在这里配置路由，由代理处理（proxy.ts）
  // 404 页面（必须在最后，作为 catchAll 路由）
  {
    path: '/404',
    name: 'NotFound404',
    component: Layout,
    meta: {
      titleKey: 'common.page_not_found',
      public: true, // 404 页面是公开的，不需要认证
      breadcrumbs: [
        { labelKey: 'common.page_not_found', icon: 'svg:404' },
      ],
    },
    children: [
      {
        path: '',
        name: 'NotFound404Page',
        component: () => import('@btc/shared-components').then(m => m.BtcError404),
        meta: {
          titleKey: 'common.page_not_found',
          isPage: true,
          pageType: 'error',
          breadcrumbs: [
            { labelKey: 'common.page_not_found', icon: 'svg:404' },
          ],
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: Layout, // 需要 component 以满足类型要求，但 beforeEnter 会处理重定向
    beforeEnter: (to, _from, next) => {
      // 最优先：检查是否是静态 HTML 文件（duty 下的页面）
      // 这些页面应该由服务器直接提供，完全绕过 Vue Router
      if (to.path.startsWith('/duty/')) {
        // 使用 next(false) 取消 Vue Router 的导航，让浏览器直接请求静态文件
        next(false);
        return;
      }

      // 检查是否是 home-app 的页面（由代理处理，完全绕过 Vue Router）
      // 在 beforeEnter 中，直接取消导航，让代理处理
      if (to.path.startsWith('/home')) {
        // 使用 next(false) 取消 Vue Router 的导航，让代理处理请求
        next(false);
        return;
      }

      // 检查是否已登录
      const isAuthenticatedUser = isAuthenticated();

      // 如果未登录，重定向到主应用登录页
      if (!isAuthenticatedUser) {
        const loginUrl = getMainAppLoginUrl(to.fullPath);
        window.location.href = loginUrl;
        return;
      }

      // 已登录但路由未匹配，重定向到 404 页面
      next('/404');
    },
  },
];

// 创建 router 实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  strict: true,
});

// 路由错误处理
router.onError((error: Error) => {
  // Router error 日志已移除

  // 如果是组件加载失败，尝试重新加载或重定向到登录页
  if (error.message && error.message.includes('Failed to fetch dynamically imported module')) {
    // Component load failed 日志已移除
    // 记录失败的组件路径
    const currentRoute = router.currentRoute.value;
    if (currentRoute && currentRoute.matched.length > 0) {
      const route = currentRoute.matched[currentRoute.matched.length - 1];
      // Failed component route 日志已移除

      // 关键：system-app 不再有登录页，组件加载失败时不需要特殊处理
      // 移除 Loading 元素并返回
      setTimeout(() => {
        const loadingEl = document.getElementById('Loading');
        if (loadingEl) {
          loadingEl.classList.add('is-hide');
        }
      }, 100);
      return;
    }

    // 组件加载失败，重定向到主应用登录页
    if (currentRoute) {
      // 组件加载失败 日志已移除
      setTimeout(() => {
        const loginUrl = getMainAppLoginUrl(currentRoute.fullPath);
        window.location.href = loginUrl;

        // 移除 Loading 元素
        const loadingEl = document.getElementById('Loading');
        if (loadingEl) {
          loadingEl.style.setProperty('display', 'none', 'important');
        }
      }, 100);
    }
    return;
  }

  // 处理 __vccOpts 错误（Vue 组件未正确加载）
  if (error.message && (error.message.includes('__vccOpts') || error.message.includes('Cannot read properties of undefined') || error.message.includes("Cannot use 'in' operator"))) {
    // Component definition error 日志已移除
    // 记录当前路由信息
    const currentRoute = router.currentRoute.value;

    // 关键：如果路由未匹配，说明是路由配置问题，不应该尝试重新加载组件
    // 这种情况下，Vue Router 尝试提取 undefined 组件的守卫，导致错误
    if (currentRoute && currentRoute.matched.length === 0) {
      // 路由未匹配，可能是子应用路由或无效路由
      // 不要尝试重新加载，让应用正常显示（可能显示 Layout 或子应用挂载点）
      // 移除 Loading 元素
      const loadingEl = document.getElementById('Loading');
      if (loadingEl) {
        loadingEl.style.setProperty('display', 'none', 'important');
      }
      return;
    }

    if (currentRoute && currentRoute.matched.length > 0) {
      // const route = currentRoute.matched[currentRoute.matched.length - 1];
      // Component error route info 日志已移除
    }

    // 如果是登录页组件错误，尝试重定向到登录页
    if (currentRoute && (currentRoute.path === '/login' || currentRoute.matched.some((m: import('vue-router').RouteRecordNormalized) => m.path === '/login'))) {
      // 登录页组件错误 日志已移除
      setTimeout(() => {
        try {
          // 先检查登录页路由是否存在
          const loginRoute = router.resolve('/login');
          if (loginRoute && loginRoute.matched.length > 0) {
            router.replace('/login').catch(() => {
              // 如果 router.replace 失败，使用 window.location
              window.location.href = '/login';
            });
          } else {
            // 如果登录页路由不存在，直接使用 window.location
            window.location.href = '/login';
          }
        } catch (error) {
          // 如果路由解析失败，使用 window.location 作为回退
          // 登录页路由解析失败，使用 window.location
          window.location.href = '/login';
        } finally {
          // 无论成功与否，都移除 Loading 元素
          const loadingEl = document.getElementById('Loading');
          if (loadingEl) {
            loadingEl.style.setProperty('display', 'none', 'important');
          }
        }
      }, 100);
      return;
    }

    // 对于根路径 `/`，检查是否是 Layout 或子路由组件加载问题
    if (currentRoute && currentRoute.path === '/') {
      // 根路径组件错误（日志已移除）
      // 尝试重新加载，但延迟更长时间，确保组件有时间加载
      setTimeout(() => {
        router.replace('/').catch(() => {
          const loadingEl = document.getElementById('Loading');
          if (loadingEl) {
            loadingEl.style.setProperty('display', 'none', 'important');
          }
        });
      }, 500);
      return;
    }

    // 尝试重新加载当前路由
    if (currentRoute && currentRoute.path) {
      // Attempting to reload route 日志已移除
      // 延迟重新加载，避免循环
      setTimeout(() => {
        router.replace(currentRoute.fullPath).catch(() => {
          // 如果重新加载失败，重定向到登录页
          if (currentRoute.path !== '/login') {
            router.replace({
              path: '/login',
              query: { oauth_callback: currentRoute.fullPath },
            }).catch(() => {
              const loadingEl = document.getElementById('Loading');
              if (loadingEl) {
                loadingEl.style.setProperty('display', 'none', 'important');
              }
            });
          }
        });
      }, 100);
    }
    return;
  }

  // 处理 single-spa 相关错误
  if (error.message && error.message.includes('single-spa')) {
    // Single-spa related error 日志已移除
    return;
  }
});

// 保存当前路由，用于语言切换时更新标题
let currentRoute: RouteLocationNormalized | null = null;

/**
 * 根据路径获取当前应用名称
 */
function getCurrentAppFromPath(path: string): string {
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/logistics')) return 'logistics';
  if (path.startsWith('/engineering')) return 'engineering';
  if (path.startsWith('/quality')) return 'quality';
  if (path.startsWith('/production')) return 'production';
  if (path.startsWith('/finance')) return 'finance';
  if (path.startsWith('/operations')) return 'operations';
  if (path.startsWith('/dashboard')) return 'dashboard';
  if (path.startsWith('/personnel')) return 'personnel';
  if (path.startsWith('/docs')) return 'docs';
  // 系统域是默认域，包括 /、/data/* 以及其他所有未匹配的路径
  return 'system';
}

/**
 * 应用名称映射（用于显示友好的中文名称，兜底方案）
 */
const appNameMap: Record<string, string> = {
  system: '主模块',
  admin: '管理模块',
  logistics: '物流模块',
  engineering: '工程模块',
  quality: '品质模块',
  production: '生产模块',
  finance: '财务模块',
  operations: '运维模块',
  dashboard: '图表模块',
  personnel: '人事模块',
  docs: '文档模块',
};

/**
 * 生成完整的浏览器标题
 * 根据当前应用路径动态生成标题：{应用名称}
 */
function formatDocumentTitle(path: string): string {
  const appName = getCurrentAppFromPath(path);

  // 尝试使用国际化键获取应用名称
  const i18nKey = `domain.type.${appName}`;
  let moduleName = tSync(i18nKey);

  // 如果国际化加载失败或返回的是 key 本身，使用兜底映射
  if (moduleName === i18nKey || !moduleName) {
    moduleName = appNameMap[appName] || appName;
  }

  return moduleName;
}

/**
 * 判断是否为首页
 */
function isHomePage(to: RouteLocationNormalized): boolean {
  // 检查 meta.isHome
  if (to.meta?.isHome === true) {
    return true;
  }

  // 检查路径是否为根路径
  if (to.path === '/' || to.path === '') {
    return true;
  }

  return false;
}

/**
 * 获取页面标题
 * 优先使用 meta.titleKey（如果提供了翻译函数），否则使用 meta.title
 */
function getPageTitle(to: RouteLocationNormalized): string | null {
  const meta = to.meta || {};

  // 1. 如果有 titleKey，尝试翻译
  if (meta.titleKey && typeof meta.titleKey === 'string') {
    const translated = tSync(meta.titleKey);
    // 如果翻译成功（返回值不等于 key），使用翻译结果
    if (translated !== meta.titleKey) {
      return translated;
    }
  }

  // 2. 如果有 title，直接使用
  if (meta.title && typeof meta.title === 'string') {
    return meta.title;
  }

  // 3. 如果 titleKey 存在但没有翻译函数，返回 null（让 buildTitle 使用兜底逻辑）
  if (meta.titleKey && typeof meta.titleKey === 'string') {
    return null;
  }

  return null;
}

/**
 * 更新浏览器标题（用于语言切换时）
 * 使用新的标题工具函数
 */
async function updateDocumentTitle(to: RouteLocationNormalized) {
  currentRoute = to;

  try {
    // 获取应用 ID
    const { getAppIdFromPath, setPageTitle } = await import('@btc/shared-core');
    const appId = getAppIdFromPath(to.path);

    // 判断是否为首页
    const isHome = isHomePage(to);

    // 获取页面标题
    const pageTitle = getPageTitle(to);

    // 设置标题（传递翻译函数以支持应用名称国际化）
    await setPageTitle(appId, pageTitle, { isHome, sync: false, translate: tSync });
  } catch (error) {
    // 标题设置失败不影响功能
    console.warn('[title] 更新标题失败:', error);
  }
}

/**
 * 监听语言切换，更新浏览器标题（同步方式）
 */
export function setupI18nTitleWatcher() {
  // 监听 localStorage 中的语言变化（跨标签页）
  window.addEventListener('storage', (e) => {
    if (e.key === 'locale' && currentRoute) {
      // 语言切换时，同步更新当前页面的标题
      updateDocumentTitle(currentRoute);
    }
  });

  // 监听自定义事件（同一标签页的语言切换）
  window.addEventListener('language-change', () => {
    if (currentRoute) {
      // 延迟一点时间，确保 i18n 已经更新
      setTimeout(() => {
        updateDocumentTitle(currentRoute!);
      }, 50);
    }
  });
}

/**
 * 检查用户是否已认证
 * 注意：cookie 是后端设置的，是认证的权威来源。如果 cookie 不存在，说明后端已经认为用户未认证。
 * 支持通过 btc_user cookie 中的 credentialExpireTime 来判断是否过期。
 * 同时支持检查 is_logged_in 标记，用于解决登录成功后立即跳转时 cookie 可能还没准备好的问题。
 */
export function isAuthenticated(): boolean {
  // 首先检查 is_logged_in 标记（登录成功后立即设置，用于解决 cookie 同步时序问题）
  // 关键：直接读取 settings 存储，不通过 appStorage.settings.get()，避免触发存储有效性检查导致反复重定向
  try {
    const settingsKey = 'settings';
    const currentSettings = (storage.get(settingsKey) as Record<string, any>) || {};
    if (currentSettings.is_logged_in === true) {
      // 如果标记存在，说明刚登录成功，即使 cookie 还没准备好，也认为已认证
      // 这样可以避免登录成功后立即跳转时被路由守卫重定向回登录页
      return true;
    }
  } catch (error) {
    // 如果检查失败，继续检查其他方式
    if (import.meta.env.DEV) {
      console.warn('[isAuthenticated] Failed to check is_logged_in flag:', error);
    }
  }

  // 然后尝试检查 access_token cookie（如果后端没有设置 HttpOnly，可以读取）
  const cookieToken = getCookie('access_token');

  // 如果 access_token cookie 存在，说明已认证（后端会管理 cookie 的生命周期）
  if (cookieToken) {
    return true;
  }

  // 如果 access_token 读不到（可能是 HttpOnly），则检查 btc_user cookie 中的过期时间
  // user-check 会将 credentialExpireTime 存储到 btc_user cookie 中
  try {
    const btcUserCookie = getCookie('btc_user');
    if (!btcUserCookie) {
      // 如果 btc_user cookie 也不存在，说明未登录
      return false;
    }

    // 解析 btc_user cookie（getCookie 已经处理了 URL 解码）
    const btcUser = JSON.parse(btcUserCookie);
    const credentialExpireTime = btcUser?.credentialExpireTime;

    if (!credentialExpireTime) {
      // 如果没有过期时间，无法判断，保守返回 false
      return false;
    }

    // 比较当前时间与过期时间
    const expireTime = new Date(credentialExpireTime).getTime();
    const now = Date.now();

    // 如果当前时间小于过期时间，说明还在有效期内
    if (now < expireTime) {
      return true;
    }

    // 已过期
    return false;
  } catch (error) {
    // 解析失败，保守返回 false
    console.warn('[isAuthenticated] Failed to check credential expire time:', error);
    return false;
  }
}

/**
 * 规范化路径：如果路径缺少应用前缀，尝试从 tabRegistry 中查找并添加前缀
 * 例如：/test/api-test-center -> /admin/test/api-test-center
 */
function normalizeRoutePath(path: string): string | null {
  // 如果路径已经有应用前缀，不需要规范化
  const subAppPrefixes = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance'];
  if (subAppPrefixes.some(prefix => path.startsWith(prefix))) {
    return null;
  }

  // 如果是系统域路径，不需要规范化
  if (path === '/' || path === '/profile' || path.startsWith('/data')) {
    return null;
  }

  // 遍历所有应用的 tabRegistry，查找匹配的路径
  // 子应用列表
  const subApps = ['admin', 'logistics', 'engineering', 'quality', 'production', 'finance'];

  for (const appName of subApps) {
    try {
      const tabs = getTabsForNamespace(appName);
      for (const tab of tabs) {
        // 移除应用前缀后比较
        const appPrefix = `/${appName}`;
        const pathWithoutPrefix = tab.path.startsWith(appPrefix)
          ? tab.path.substring(appPrefix.length) || '/'
          : tab.path;

        // 如果路径匹配（去掉应用前缀后），返回完整路径
        if (pathWithoutPrefix === path || pathWithoutPrefix === `${path}/`) {
          // 规范化路径日志已移除
          return tab.path;
        }
      }
    } catch (error) {
      // 如果某个应用的 tabRegistry 未加载，继续查找下一个
      continue;
    }
  }

  return null;
}

// 关键：参考 cool-admin，在路由解析完成后立即关闭全局根级 Loading（beforeResolve）
// 这样可以在路由解析完成后、组件渲染前就关闭 loading，比等待应用挂载更快
// 关键优化：立即关闭 loading，确保与 cool-admin 一致的性能
// 关键：子应用路由不应该关闭"拜里斯科技"loading（因为它应该已经被隐藏了）
let loadingClosed = false;

// 监听 qiankun:after-mount 事件，立即关闭应用级 loading
// 这样可以避免等待 10 秒超时，在应用挂载后立即关闭 loading
if (typeof window !== 'undefined') {
  window.addEventListener('qiankun:after-mount', (event: any) => {
    const appName = event.detail?.appName;
    if (!appName) return;

    // 获取应用显示名称
    const appNameMap: Record<string, string> = {
      'admin': '管理模块',
      'logistics': '物流模块',
      'engineering': '工程模块',
      'quality': '品质模块',
      'production': '生产模块',
      'finance': '财务模块',
      'operations': '运维模块',
      'dashboard': '图表模块',
      'personnel': '人事模块',
      'docs': '文档模块',
    };
    const appDisplayName = appNameMap[appName] || appName;

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

router.beforeResolve(async (to) => {
  // 关键：如果是子应用路由，不应该关闭"拜里斯科技"loading（因为它应该已经被隐藏了）
  const knownSubAppPrefixes = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance', '/operations', '/docs', '/dashboard', '/personnel'];
  const isSubAppRoute = knownSubAppPrefixes.some(prefix => to.path.startsWith(prefix));

  // 子应用路由的loading由各自管理，不应该在这里处理
  if (isSubAppRoute) {
    return;
  }

  if (!loadingClosed) {
    try {
      const loadingModule = await importSharedCore();
      const rootLoadingService = loadingModule?.rootLoadingService;
      if (rootLoadingService && typeof rootLoadingService.hide === 'function') {
        rootLoadingService.hide();
        loadingClosed = true;
      } else {
        throw new Error('rootLoadingService 未定义或方法不存在');
      }
    } catch (error) {
      console.warn('[system-app router] 无法加载 RootLoadingService，使用备用方案', error);
      // 备用方案：直接操作 DOM（向后兼容）
      const loadingEl = document.getElementById('Loading');
      if (loadingEl) {
        loadingEl.style.setProperty('display', 'none', 'important');
        loadingEl.style.setProperty('visibility', 'hidden', 'important');
        loadingEl.style.setProperty('opacity', '0', 'important');
        loadingEl.style.setProperty('pointer-events', 'none', 'important');
        loadingEl.classList.add('is-hide');
        loadingClosed = true;
      }
    }
  }
});

// 路由前置守卫：处理认证、Loading 显示和侧边栏
router.beforeEach(async (to: import('vue-router').RouteLocationNormalized, _from: import('vue-router').RouteLocationNormalized, next: import('vue-router').NavigationGuardNext) => {
  // 关键：判断是否是子应用路由
  // system-app的#Loading（"拜里斯科技"）只应该在 system-app 路由时显示
  const knownSubAppPrefixes = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance', '/operations', '/docs', '/dashboard', '/personnel'];
  const isSubAppRoute = knownSubAppPrefixes.some(prefix => to.path.startsWith(prefix));

  // 关键：如果是子应用路由，立即隐藏system-app的#Loading（"拜里斯科技"）
  // 必须在路径规范化之前就隐藏，避免"拜里斯科技"loading被显示
  // 子应用的loading由appLoadingService统一管理
  if (isSubAppRoute) {
    // 立即隐藏"拜里斯科技"loading，使用同步方式，确保优先级
    const systemLoadingEl = document.getElementById('Loading');
    if (systemLoadingEl) {
      // 无论是否包含"拜里斯科技"，都隐藏（可能已经被更新）
      systemLoadingEl.style.setProperty('display', 'none', 'important');
      systemLoadingEl.style.setProperty('visibility', 'hidden', 'important');
      systemLoadingEl.style.setProperty('opacity', '0', 'important');
      systemLoadingEl.style.setProperty('pointer-events', 'none', 'important');
      systemLoadingEl.style.setProperty('z-index', '-1', 'important');
      systemLoadingEl.classList.add('is-hide');
    }

    // 关键：立即隐藏rootLoadingService（如果正在显示）
    // 使用同步方式，避免异步延迟导致"拜里斯科技"loading被显示
    try {
      // 尝试同步隐藏（如果rootLoadingService已经加载）
      if ((window as any).__BTC_ROOT_LOADING_SERVICE__) {
        const rootLoadingService = (window as any).__BTC_ROOT_LOADING_SERVICE__;
        if (rootLoadingService && typeof rootLoadingService.hide === 'function') {
          rootLoadingService.hide();
        }
      }
    } catch (error) {
      // 静默失败
    }

    // 关键：立即隐藏路由loading（如果正在显示），避免蓝色loading闪烁
    // 子应用路由应该使用应用级别loading，而不是路由loading
    try {
      // 同步检查并隐藏路由loading
      const routeLoadingEl = document.querySelector('.route-loading') as HTMLElement;
      if (routeLoadingEl) {
        routeLoadingEl.style.setProperty('display', 'none', 'important');
        routeLoadingEl.style.setProperty('visibility', 'hidden', 'important');
        routeLoadingEl.style.setProperty('opacity', '0', 'important');
      }
      // 异步调用routeLoadingService.hide()，确保完全隐藏
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

    // 关键：判断是否是真正的应用切换（不是同一应用内的路由切换）
    // 全局应用loading应该只在汉堡菜单切换应用时触发，不应该在应用内路由切换时触发
    const getAppNameFromPath = (path: string): string | null => {
      const pathParts = path.split('/').filter(Boolean);
      const firstPart = pathParts[0] || '';
      // 检查是否是已知的子应用前缀
      return knownSubAppPrefixes.some(prefix => prefix === `/${firstPart}`) ? firstPart : null;
    };

    const fromAppName = _from.path ? getAppNameFromPath(_from.path) : null;
    const toAppName = getAppNameFromPath(to.path);

    // 只有真正的应用切换时才显示全局应用loading：
    // 1. 从非子应用路由切换到子应用路由（首次进入子应用）
    // 2. 从一个子应用切换到另一个子应用（如从 admin 切换到 logistics）
    // 3. 从子应用路由切换到另一个子应用路由（应用名称不同）
    // 不应该触发的情况：
    // - 同一应用内的路由切换（如从 /admin/user 切换到 /admin/role）
    const isRealAppSwitch =
      (fromAppName === null && toAppName !== null) || // 从非子应用切换到子应用
      (fromAppName !== null && toAppName !== null && fromAppName !== toAppName); // 从一个子应用切换到另一个子应用

    // 关键：只有真正的应用切换时才隐藏容器并显示应用级别loading
    // 同一应用内的路由切换不应该隐藏容器，让子应用自己处理路由切换
    if (isRealAppSwitch && toAppName) {
      // 只在真正的应用切换时隐藏容器，避免布局闪烁
      const container = document.querySelector('#subapp-viewport') as HTMLElement;
      if (container) {
        container.style.setProperty('display', 'none', 'important');
        container.style.setProperty('visibility', 'hidden', 'important');
        container.style.setProperty('opacity', '0', 'important');
      }

      const appNameMap: Record<string, string> = {
        'system': '系统模块',
        'admin': '管理模块',
        'logistics': '物流模块',
        'engineering': '工程模块',
        'quality': '品质模块',
        'production': '生产模块',
        'finance': '财务模块',
        'operations': '运维模块',
        'dashboard': '图表模块', // 修复：与micro/index.ts中的定义保持一致
        'personnel': '人事模块',
        'docs': '文档模块',
      };

      const appDisplayName = appNameMap[toAppName] || toAppName;

      // 如果应用名称有效且不是"应用"，立即显示应用级别loading
      if (appDisplayName && appDisplayName !== '应用' && appDisplayName !== toAppName) {
        // 异步显示应用级别loading，不阻塞路由导航
        importSharedCore().then((sharedCore) => {
          if (sharedCore?.appLoadingService) {
            // 显示应用级别loading（仅在真正的应用切换时）
            // 容器已经在上面隐藏了，不需要再次隐藏
            sharedCore.appLoadingService.show(appDisplayName, container || undefined);
          }
        }).catch(() => {
          // 静默失败
        });
      }
    }
  }

  // 最优先：检查是否是静态 HTML 文件（duty 下的页面）
  // 这些页面应该由服务器直接提供，完全绕过 Vue Router
  if (to.path.startsWith('/duty/')) {
    // 使用 next(false) 取消 Vue Router 的导航，让浏览器直接请求静态文件
    next(false);
    return;
  }

  // 检查是否是 home-app 的页面（由代理处理，完全绕过 Vue Router）
  if (to.path.startsWith('/home')) {
    // 使用 next(false) 取消 Vue Router 的导航，让代理处理请求
    // 注意：代理应该在服务器层面处理，不应该进入 Vue Router
    next(false);
    return;
  }

  // 关键：路径规范化 - 确保子应用路径有正确的前缀
  // 注意：路径规范化会导致路由重定向，会再次触发 beforeEach
  // 使用标记避免在路径规范化重定向时重复处理loading
  const isNormalizing = sessionStorage.get<string>('__BTC_ROUTE_NORMALIZING__') === '1';
  const normalizedPath = normalizeRoutePath(to.path);
  if (normalizedPath) {
    // 设置标记，表示正在进行路径规范化
    sessionStorage.set('__BTC_ROUTE_NORMALIZING__', '1');
    // 关键：在规范化路径中提取应用名称，并保存到 sessionStorage，确保占位loading能正确显示
    const appNameMap: Record<string, string> = {
      'admin': '管理模块',
      'logistics': '物流模块',
      'engineering': '工程模块',
      'quality': '品质模块',
      'production': '生产模块',
      'finance': '财务模块',
      'operations': '运维模块',
      'docs': '文档模块',
      'dashboard': '图表模块',
      'personnel': '人事模块',
    };
    const appName = Object.keys(appNameMap).find(key => normalizedPath.startsWith(`/${key}`));
    if (appName) {
      const appDisplayName = appNameMap[appName];
      // 保存应用名称到 sessionStorage
      sessionStorage.set('__BTC_NAV_APP_NAME__', appDisplayName);
    }
    // 关键：在重定向前，再次确保"拜里斯科技"loading被隐藏
    const systemLoadingEl = document.getElementById('Loading');
    if (systemLoadingEl) {
      systemLoadingEl.style.setProperty('display', 'none', 'important');
      systemLoadingEl.style.setProperty('visibility', 'hidden', 'important');
      systemLoadingEl.style.setProperty('opacity', '0', 'important');
      systemLoadingEl.style.setProperty('pointer-events', 'none', 'important');
      systemLoadingEl.style.setProperty('z-index', '-1', 'important');
      systemLoadingEl.classList.add('is-hide');
    }
    // 关键：使用 replace: true 进行路由重定向，不会导致浏览器刷新
    next({
      path: normalizedPath,
      query: to.query,
      hash: to.hash,
      replace: true,
    });
    return;
  }
  // 如果路径规范化完成，清除标记（延迟清除，确保 index.html 中的脚本能检测到）
  if (isNormalizing) {
    // 延迟清除，确保 index.html 中的脚本能检测到规范化完成
    setTimeout(function() {
      sessionStorage.remove('__BTC_ROUTE_NORMALIZING__');
    }, 100);
  }

  // 关键：在子域名环境下，如果是子应用域名，不应该由 system-app 进行认证检查
  // 子应用的认证应该由子应用自己处理（通过 layout-app 或子应用自己的路由守卫）
  const env = getEnvironment();
  const currentSubdomainApp = getCurrentSubApp();

  // 关键：在子域名环境下，如果是子应用域名，跳过 system-app 的认证检查
  // 因为子域名访问时，应该由 layout-app 或子应用自己处理认证
  // 只有在主域名或开发环境下，system-app 才进行认证检查
  if ((env === 'production' || env === 'test') && currentSubdomainApp) {
    // 子域名环境下，跳过 system-app 的认证检查，让子应用或 layout-app 处理
    // duty 下的页面需要处理
    const isDutyPage = to.path.startsWith('/duty/');

    if (isDutyPage) {
      // duty 下的页面，直接放行
      next();
      return;
    }

    // 非公开页面，在子域名环境下，应该由子应用或 layout-app 处理认证
    // 这里直接放行，让子应用的路由守卫处理
    // 注意：不检查组件，因为组件可能还未加载，Vue Router 会在组件加载后检查
    next();
    return;
  }

  // 检查是否为公开页面（不需要认证）
  // 关键：duty下的页面是公开页面
  const isPublicPage = to.meta?.public === true ||
                       to.path.startsWith('/duty/');

  // 使用共享的认证守卫
  // 注意：系统应用没有登录页，需要重定向到主应用登录页
  const authGuard = createAuthGuard({
    appName: 'system',
    publicPages: ['/404'], // 404 页面是公开的
    loginPath: '/login', // 虽然系统应用没有登录页，但这里用于构建 URL（如果 getLoginUrl 未提供时的回退）
    isAuthenticated,
    isPublicPage: (to: RouteLocationNormalized) => {
      // 自定义公开页面检查
      return to.meta?.public === true || to.path.startsWith('/duty/');
    },
    // 使用共享的 getMainAppLoginUrl 函数，统一处理子应用独立运行时的登录重定向
    getLoginUrl: getMainAppLoginUrl,
  });

  // 执行认证守卫（使用包装的 next 函数来重定向到主应用登录页）
  let nextCalled = false;
  const wrappedNext: NavigationGuardNext = ((result?: any) => {
    if (!nextCalled) {
      nextCalled = true;
      if (result === undefined) {
        // 守卫调用了 next()，允许继续
        next();
      } else if (result === false) {
        // 守卫取消了导航
        next(false);
      } else if (typeof result === 'string' || (typeof result === 'object' && result !== null)) {
        // 守卫要求重定向，但系统应用需要重定向到主应用登录页
        // 如果重定向目标是登录页，使用主应用登录页 URL
        const redirectPath = typeof result === 'string' ? result : (result as any).path || '/login';
        if (redirectPath === '/login' || redirectPath.startsWith('/login')) {
          const loginUrl = getMainAppLoginUrl(to.fullPath);
          window.location.href = loginUrl;
        } else {
          next(result);
        }
      } else {
        next(result);
      }
    }
  }) as NavigationGuardNext;

  await authGuard(to, _from, wrappedNext, router);
  if (nextCalled) {
    return;
  }

  // 关键：在主域名（bellis.com.cn）下，必须严格检查认证状态
  // 不能假设已认证，必须通过实际的认证标记来判断
  const isAuthenticatedUser = isAuthenticated();

  // 如果不是公开页面，检查认证状态（兜底逻辑）
  if (!isPublicPage) {
    if (!isAuthenticatedUser) {
      // 未认证，不再重定向到登录页（已禁用）
      if (import.meta.env.DEV) {
        console.log('[system-app router] ❌ 未认证，但已禁用重定向到登录页:', {
          targetPath: to.fullPath,
        });
      }
      // 继续处理，不重定向
    }
  }

  // 关键：如果路由未匹配，需要特殊处理，避免 Vue Router 尝试提取 undefined 组件的守卫
  if (to.matched.length === 0) {
    // 对于根路径 `/`，应该总是匹配到 Layout 组件，如果未匹配说明路由配置有问题
    if (to.path === '/') {
      // 根路径未匹配，直接放行让 Layout 组件处理（Layout 组件应该始终存在）
      next();
      return;
    }

    // 检查是否是 duty 下的页面，或 home-app 的页面
    const isDutyPage = to.path.startsWith('/duty/');
    const isHomePage = to.path.startsWith('/home');

    if (isHomePage) {
      // home-app 的页面由代理处理，使用 next(false) 取消 Vue Router 的导航，让代理处理请求
      next(false);
      return;
    }

    if (isDutyPage) {
      // duty 下的页面，直接放行（这些是静态HTML页面，不需要路由匹配）
      next();
      return;
    }

    // 其他未匹配的路由，根据认证状态处理
    if (!isAuthenticatedUser) {
      // 未认证，不再重定向到登录页（已禁用）
      if (import.meta.env.DEV) {
        console.log('[system-app router] ❌ 未认证且路由未匹配，但已禁用重定向到登录页:', {
          targetPath: to.fullPath,
        });
      }
      // 继续处理，不重定向
    }

    // 已认证但路由未匹配，可能是子应用路由或无效路由
    // 关键：检查是否是子应用路由前缀，如果是则放行（让子应用处理）
    // 否则重定向到 404 页面
    // 注意：/home 不应该在这里处理，因为已经在前面使用 next(false) 处理了
    const knownSubAppPrefixes = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance', '/operations', '/docs', '/dashboard', '/personnel'];
    const isSubAppRoute = knownSubAppPrefixes.some(prefix => to.path.startsWith(prefix));

    if (isSubAppRoute) {
      // 子应用路由，直接放行，让子应用处理
    next();
      return;
    }

    // 主应用路由未匹配，重定向到 404 页面
    next('/404');
    return;
  }

  // 继续路由导航
  next();
});

// 路由守卫：调试路由匹配情况
router.afterEach((to: import('vue-router').RouteLocationNormalized) => {
  // 生产环境调试日志已移除
  if (import.meta.env.PROD && to.matched.length === 0) {
    // 关键：对于根路径 `/`，检查是否是 Layout 组件加载问题
    if (to.path === '/') {
      // 根路径未匹配（日志已移除）
      // 尝试重新匹配路由
      const matchedRoutes = router.resolve('/');
      if (matchedRoutes.matched.length > 0) {
        // 重新匹配成功（日志已移除）
      } else {
        // 根路径确实未匹配（日志已移除）
        // 检查路由配置
        const rootRoute = routes.find(r => r.path === '/');
        if (rootRoute) {
          // 根路由配置存在（日志已移除）
        } else {
          // 根路由配置不存在（日志已移除）
        }
      }
      // 关键：根路径 `/` 不应该重定向到登录页，这是系统应用首页
      // 如果未匹配，说明路由配置有问题，应该显示错误而不是重定向
      return;
    }

    // 关键：如果路由未匹配，尝试重定向到主应用登录页（避免一直 loading）
    // 但只对非公开页面进行重定向，避免循环
    const isPublicPage = to.meta?.public === true ||
                         to.path.startsWith('/duty/');

    if (!isPublicPage) {
      // 关键：先检查认证状态，只有未认证时才重定向到登录页
      // 如果已认证但路由未匹配，可能是路由配置问题，不应该重定向到登录页
      const isAuth = isAuthenticated();

      if (!isAuth) {
        // 未认证，重定向到主应用登录页
        const loginUrl = getMainAppLoginUrl(to.fullPath);
        window.location.href = loginUrl;

        // 移除 Loading 元素
        const loadingEl = document.getElementById('Loading');
        if (loadingEl) {
          loadingEl.style.setProperty('display', 'none', 'important');
        }
      } else {
        // 已认证但路由未匹配，可能是路由配置问题
        // 不应该重定向到登录页，而是移除 Loading 元素，让应用正常显示（可能显示 404）
        const loadingEl = document.getElementById('Loading');
        if (loadingEl) {
          loadingEl.style.setProperty('display', 'none', 'important');
        }
      }
    }
  }

  // 路由匹配信息日志已移除
});

// 路由守卫：自动添加标签到 Tabbar（仅主应用路由）
router.afterEach((to: import('vue-router').RouteLocationNormalized) => {
  // 清理所有 ECharts 实例和相关的 DOM 元素（tooltip、toolbox 等），防止页面切换时残留
  // 使用统一的清理函数，自动清理所有图表组件
  try {
    // 动态导入清理函数，从主入口导入
    import('@btc/shared-components').then(({ cleanupAllECharts }: any) => {
      cleanupAllECharts();
    }).catch(() => {
      // 如果导入失败，使用备用清理逻辑
      try {
        const tooltipElements = document.querySelectorAll('.echarts-tooltip');
        tooltipElements.forEach(el => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
        const toolboxElements = document.querySelectorAll('.echarts-toolbox, .echarts-data-view');
        toolboxElements.forEach(el => {
          if (el.parentNode && el.parentNode === document.body) {
            el.parentNode.removeChild(el);
          }
        });
      } catch (fallbackError) {
        // 忽略错误
      }
    });
  } catch (error) {
    // 忽略错误
  }
  // 标题设置已移至 shared-router 的 titleGuard（在 beforeEach 中处理）

  // 检查是否是系统域路径（包括根路径、/profile 和 /data/* 路径）
  const isSystemPath = to.path === '/' || to.path === '/profile' || to.path.startsWith('/data');

  // 如果是系统域路径，确保菜单已注册
  if (isSystemPath) {
    registerManifestTabsForApp('system');
    registerManifestMenusForApp('system');
  }

  // 如果是首页（isHome=true），将所有标签设为未激活
  if (to.meta?.isHome === true || to.path === '/') {
    // 动态导入避免循环依赖
    import('../store/process').then(({ useProcessStore }) => {
    const process = useProcessStore();
    process.list.forEach((tab) => {
      tab.active = false;
      });
    }).catch(() => {
      // 忽略错误
    });
    return;
  }

  // 直接跳过标记为子应用的路由
  if (to.meta?.isSubApp === true) {
    return;
  }

  // 规范化路径（移除末尾斜杠）
  const normalizedPath = to.path.replace(/\/$/, '');

  // 跳过子应用的根路径
  const appRoots = ['/', '/admin', '/logistics', '/engineering', '/quality', '/production', '/finance'];
  if (appRoots.includes(normalizedPath)) {
    return;
  }

  // 主应用是系统域（默认域），只处理系统域的路由
  // 子应用路由前缀列表（包括管理域和其他子应用）
  const subAppPrefixes = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance'];
  // 检查是否是系统域根路径（精确匹配 /）
  const isSystemRoot = to.path === '/';
  // 检查是否是子应用路由
  const isSubAppRoute = !isSystemRoot && subAppPrefixes.some((prefix) =>
    to.path.startsWith(prefix)
  );

  if (isSubAppRoute || isSystemRoot) {
    return;
  }

  // 只添加有效的系统域路由（必须有 name）
  if (!to.name) {
    return;
  }

  // 跳过个人信息页面（不在菜单中，不需要添加到标签页）
  if (to.path === '/profile') {
    return;
  }

  // 使用 store 添加路由到标签页（动态导入避免循环依赖）
  import('../store/process').then(({ useProcessStore, getCurrentAppFromPath }) => {
  const process = useProcessStore();
  const currentApp = getCurrentAppFromPath(to.path);

  // 再次确认：只添加系统域的路由（不是子应用）
  if (currentApp === 'system') {
    // 系统域路由，添加到标签页
    // 将路由的 titleKey 转换为 labelKey，以便 tabbar 正确显示
    const meta = { ...to.meta } as any;
    if (meta.titleKey && !meta.labelKey) {
      meta.labelKey = meta.titleKey;
    }
  process.add({
    path: to.path,
    fullPath: to.fullPath,
    name: to.name as string,
      meta,
      });
    }
    // 其他子应用路由，不添加到标签页
  }).catch(() => {
    // 忽略错误
  });
});

// 注册标题守卫（使用国际化翻译函数）
createTitleGuard(router, {
  translate: tSync,
  preloadConfig: true,
});

export default router;

/**
 * 创建系统应用路由（子应用模式）
 * 使用 getSystemRoutes() 获取路由配置，简化路由守卫
 */
export const createSystemRouter = (): Router => {
  // 使用 getSystemRoutes 获取路由配置
  const routes = getSystemRoutes();

  const systemRouter = createRouter({
    history: qiankunWindow.__POWERED_BY_QIANKUN__
      ? createMemoryHistory()
      : createWebHistory(),
    strict: true,
    routes,
  });

  // 路由级别loading的延迟定时器
  let routeLoadingTimer: ReturnType<typeof setTimeout> | null = null;
  // 路由级别loading的延迟时间（毫秒）
  const ROUTE_LOADING_DELAY = 300;

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

    // 检测是否是 system 子域名
    if (currentSubdomainApp === 'system' && path.startsWith('/system/')) {
      const normalized = path.substring('/system'.length) || '/';
      console.info(`[Router Path Normalize] ${path} -> ${normalized} (subdomain: ${hostname})`);
      return normalized;
    }

    return path;
  }

  // 路由守卫：在生产环境子域名下规范化路径
  systemRouter.beforeEach((to: any, _from: any, next: any) => {
    // 关键修复：在 qiankun 模式下，如果初始导航到根路径 `/`，但实际应该导航到其他路径
    // 则立即重定向到正确的路径，避免 URL 短暂显示为 `/system`
    if (qiankunWindow.__POWERED_BY_QIANKUN__ && to.path === '/' && _from.name === undefined) {
      // 这是初始导航，检查实际应该导航到哪个路径
      const { pathname } = window.location;
      if (pathname.startsWith('/system/') && pathname !== '/system') {
        // 提取子应用路径（去掉 /system 前缀）
        const subAppPath = pathname.slice('/system'.length) || '/';
        // 如果子应用路径不是 `/`，重定向到正确的路径
        if (subAppPath !== '/') {
          next({
            path: subAppPath,
            query: to.query,
            hash: to.hash,
            replace: true,
          });
          return;
        }
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
  systemRouter.afterEach(async () => {
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
  });

  // 关键：参考 cool-admin，在路由解析完成后立即关闭 Loading（beforeResolve）
  // 这样可以在路由解析完成后、组件渲染前就关闭 loading，比等待应用挂载更快
  let loadingClosed = false;
  systemRouter.beforeResolve(async () => {
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

  systemRouter.onError((error: any) => {
    console.warn('[system-app] Router error:', error);
  });

  return systemRouter;
};

/**
 * 应用启动引导程序
 * 负责初始化所有核心功能模块
 *
 * 参考 cool-admin 的架构设计，采用模块化目录结构
 */
;

import type { App } from 'vue';

// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';

// 资源加载器初始化（必须在应用启动前初始化）
import { initResourceLoader, initDynamicImportInterceptor, logger } from '@btc/shared-core';

// 核心模块
import { setupStore, setupUI, setupRouter, setupI18n, setupEps } from './core';
import { resolveAppLogoUrl, registerManifestMenusForApp } from '@btc/shared-core/configs/layout-bridge';

const MAIN_APP_ID = 'main';

// 处理器模块
import { createNotificationHandler, initNotificationManager } from './handlers';

// 集成模块
import { autoDiscoverPlugins, setupMicroApps, setupInterceptors } from './integrations';

// 管理器实例
import { notificationManager } from '../utils/notification-manager';
import { BtcMessage } from '@btc/shared-components';
import { appStorage } from '../utils/app-storage';
// 用户设置（现在都在 app-src chunk 中，可以使用静态导入）
import { initSettingsConfig } from '../plugins/user-setting/composables/useSettingsState';

/**
 * 应用启动引导程序
 * 负责初始化所有核心功能模块
 */
export async function bootstrap(app: App) {
  // 0. 初始化监控系统（必须在最前面，确保所有操作都被监控）
  const { initMonitor, trackBootstrapStart, trackBootstrapEnd } = await import('@btc/shared-core/utils/monitor');
  
  // 先初始化监控配置，再开始跟踪
  initMonitor({
    appName: 'main',
    enableAPM: true,
    enableErrorTracking: true,
    enableUserBehavior: true,
    enablePerformance: true,
    enableResourceMonitoring: true,
    enableBusinessTracking: true,
    enableSystemMonitoring: false, // 主应用暂不启用系统监控
    sampleRate: 1.0,
  });
  
  trackBootstrapStart();
  
  try {

    // 0. 初始化资源加载器和动态导入拦截器（必须在最前面）
    initResourceLoader();
    initDynamicImportInterceptor();
    
    // 0.1. 初始化存储管理器
    appStorage.init();

  // 1. 核心模块初始化
  setupEps(app);        // EPS 服务（必须在最前面）
  setupStore(app);      // 状态管理
  setupRouter(app);     // 路由配置
  setupUI(app);         // UI框架配置
  setupI18n(app);       // 国际化配置

  // 注意：Loading 元素的移除由 main.ts 统一处理
  // 这里不再处理，避免与 main.ts 的逻辑冲突

  // 2. 集成模块初始化
  // 初始化设置配置（现在都在 app-src chunk 中，使用静态导入）
  await initSettingsConfig();

  await autoDiscoverPlugins(app);  // 自动发现插件
  
  // 设置微前端并获取 globalState
  const globalState = await setupMicroApps(app);
  
  // 初始化插件基座（需要在微前端设置之后，因为需要 globalState）
  if (globalState) {
    // 动态导入插件初始化（避免循环依赖）
    const { initPluginHost } = await import('./plugins');
    // 导入 i18n 消息（用于初始化 i18n 插件）
    const { i18n } = await import('../i18n');
    // 获取当前语言包消息
    const i18nMessages = {
      'zh-CN': i18n.global.getLocaleMessage('zh-CN'),
      'en-US': i18n.global.getLocaleMessage('en-US'),
    };
    initPluginHost(app, globalState, i18nMessages);
  }
  
  setupInterceptors();             // 拦截器配置

  // 3. 处理器初始化
  const notificationHandler = createNotificationHandler();

  initNotificationManager(notificationHandler);

  // 4. 全局暴露
  (window as any).notificationHandler = notificationHandler;
  (window as any).notificationManager = notificationManager;
  (window as any).BtcMessage = BtcMessage;

  // 暴露 cleanupBadge 方法（生命周期管理器需要）
  (window as any).cleanupNotificationBadge = notificationHandler.cleanupBadge;

  // 暴露 authApi 到全局（已在 main.ts 中暴露，这里作为兜底确保暴露）
  // 如果 main.ts 中的暴露失败，这里会再次尝试
  if (typeof (window as any).__APP_AUTH_API__ === 'undefined') {
    import('../modules/api-services/auth').then(({ authApi }) => {
      (window as any).__APP_AUTH_API__ = authApi;
    }).catch((error) => {
      console.warn('[bootstrap] Failed to expose authApi globally:', error);
    });
  }

  // 暴露 Logo URL 获取函数，保持与其他应用的一致性
  (window as any).__APP_GET_LOGO_URL__ = () => resolveAppLogoUrl();

  // 关键：从路由配置自动生成并注册菜单（类似其他应用的做法）
  // 这样可以确保菜单从路由动态生成，而不是依赖硬编码的 manifest JSON
  try {
    const { routes } = await import('../router/routes');
    const { generateMenusFromRoutes } = await import('./utils/menu-generator');
    const { registerMenus } = await import('@btc/shared-components');
    
    // 从路由生成菜单
    const menus = generateMenusFromRoutes(routes);
    
    // 注册菜单（使用 forceUpdate=true 确保覆盖缓存）
    if (menus.length > 0) {
      registerMenus(MAIN_APP_ID, menus, true);
    }
  } catch (error) {
    console.warn('[bootstrap] 从路由生成菜单失败，将使用 manifest 菜单:', error);
  }

  // 关键：设置菜单注册函数（供 layout-app 使用）
  // 这确保登录后切换到 main 应用时，菜单组件能够正确注册菜单
  (window as any).__REGISTER_MENUS_FOR_APP__ = registerManifestMenusForApp;

  // 关键：暴露退出登录函数到全局（供 shared-components 的 user-info 组件使用）
  // 注意：不能在非 Vue 组件上下文中调用 composables（如 useUser、useProcessStore）
  // 这里直接使用 logoutCore 和 appStorage，避免依赖 Vue 上下文
  (window as any).__APP_LOGOUT__ = async () => {
    try {
      // 直接使用 logoutCore，不需要 Vue 上下文
      const { logoutCore } = await import('@btc/shared-core/auth/logoutCore');
      const { deleteCookie: deleteCookieUtil, getCookieDomain } = await import('@btc/shared-core/utils/storage/cookie');
      
      // 获取 processStore 的函数（在应用挂载后通过 Pinia 获取）
      const getProcessStore = async () => {
        try {
          // 尝试从全局获取 Pinia 实例
          const { getActivePinia } = await import('pinia');
          const pinia = getActivePinia();
          if (pinia) {
            // 如果 Pinia 已激活，可以直接使用 useProcessStore
            const { useProcessStore } = await import('@btc/shared-components');
            return useProcessStore();
          }
        } catch (e) {
          // 如果获取失败，返回 null
        }
        return null;
      };
      
      // 执行退出登录核心逻辑
      const success = await logoutCore({
        authApi: (window as any).__APP_AUTH_API__,
        clearUserInfo: () => {
          // 直接使用 appStorage，不需要调用 useUser()
          appStorage.user.remove();
        },
        getProcessStore,
        deleteCookie: (name: string) => {
          const cookieDomain = getCookieDomain();
          deleteCookieUtil(name, {
            ...(cookieDomain ? { domain: cookieDomain } : {}),
            path: '/'
          });
        },
        getAppStorage: () => appStorage,
        isRemoteLogout: false,
        onSuccess: async (message: string) => {
          // 显示退出成功提示
          try {
            const BtcMessage = (window as any).BtcMessage;
            if (BtcMessage && typeof BtcMessage.success === 'function') {
              BtcMessage.success(message);
            }
          } catch (error) {
            console.warn('[bootstrap] Failed to show logout success message:', error);
          }
        },
      });
      
      if (!success) {
        logger.error('[bootstrap] Logout core failed');
        // 即使失败，也执行兜底逻辑
        appStorage.auth?.clear();
        appStorage.user?.clear();
        window.location.href = '/login';
        return;
      }
      
      // 退出成功后重定向到登录页
      // 使用 buildLogoutUrl 构建退出登录 URL，自动包含 clearRedirectCookie=1 参数
      const { buildLogoutUrlWithFullUrl } = await import('@btc/shared-core/utils/redirect');
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';
      
      if (isProductionSubdomain) {
        // 生产环境子域名，跳转到主域名登录页
        const loginUrl = `${protocol}//bellis.com.cn/login`;
        const logoutUrl = await buildLogoutUrlWithFullUrl(loginUrl);
        window.location.href = logoutUrl;
      } else {
        // 开发环境或主域名，跳转到本地登录页
        const logoutUrl = await buildLogoutUrlWithFullUrl('/login');
        window.location.href = logoutUrl;
      }
    } catch (error) {
      logger.error('[bootstrap] Failed to execute logout:', error);
      // 简单的兜底逻辑
      try {
        const authApi = (window as any).__APP_AUTH_API__;
        if (authApi?.logout) {
          await authApi.logout();
        }
      } catch (e) {
        // 静默失败
      }
      appStorage.auth?.clear();
      appStorage.user?.clear();
      window.location.href = '/login';
    }
  };

  // 关键：启动全局用户检查轮询（使用新的全局实现）
  // 在应用启动后异步启动，不阻塞应用初始化
  if (typeof window !== 'undefined') {
    // 延迟启动，确保 EPS 服务已加载
    setTimeout(() => {
      try {
        import('@btc/shared-core/composables/user-check').then(({ startUserCheckPollingIfLoggedIn }) => {
          // 检查是否已登录，如果已登录则启动轮询
          startUserCheckPollingIfLoggedIn();
        }).catch((error) => {
          if (import.meta.env.DEV) {
            console.warn('[bootstrap] Failed to start user check polling:', error);
          }
        });
      } catch (error) {
        // 静默失败
      }
    }, 500); // 延迟 500ms，确保 EPS 服务已加载
  }

  // 注意：DevTools 不再在这里挂载
  // 改为统一在 layout-app 中挂载，避免重复挂载
  // layout-app 是主应用，所有子应用都会通过它加载，因此只需要在 layout-app 中挂载一次即可

  // 全局捕获未处理的Promise rejection，防止控制台打印错误
  window.addEventListener('unhandledrejection', (event) => {
    // 检查是否是HTTP错误
    if (event.reason && event.reason.name === 'AxiosError') {
      // 检查是否是接口测试中心的请求（通过URL路径判断）
      const url = event.reason.config?.url || '';
      const isTestCenterRequest = url.includes('/api/system/test/');

      if (!isTestCenterRequest) {
        // 静默处理非测试中心的axios错误，不打印到控制台
        event.preventDefault();

        // 显示用户友好的错误消息
        const message = event.reason.response?.status === 404
          ? '请求的资源不存在'
          : '网络请求失败';

        if ((window as any).BtcMessage) {
          (window as any).BtcMessage.error(message);
        }
      }
      // 对于测试中心的请求，不拦截，让错误正常传播
    }
  });

  // 不再过滤 console.error，允许所有错误日志正常显示
  // 保留原始方法的引用，但不重写 console.error
  // 这样所有错误日志都能正常显示，包括调试日志

  // 重写XMLHttpRequest来拦截网络请求日志
  // 注意：index.html 中已经设置了 HTTP URL 拦截，这里只需要添加日志记录功能
  const currentXHROpen = XMLHttpRequest.prototype.open;
  const currentXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
    // 记录请求信息（用于日志拦截）
    (this as any)._method = method;
    (this as any)._url = url;
    // 调用当前的 open（index.html 中设置的拦截器）
    return currentXHROpen.call(this, method, url, async ?? true, user, password);
  };

  XMLHttpRequest.prototype.send = function(data?: any) {
    // 监听状态变化（用于日志拦截）
    this.addEventListener('readystatechange', function() {
      if (this.readyState === 4) {
        // 检查是否是接口测试中心的请求
        const url = (this as any)._url || '';
        const isTestCenterRequest = url.includes('/api/system/test/');

        // 如果是404错误且不是测试中心的请求，阻止默认的错误日志显示
        if (this.status === 404 && !isTestCenterRequest) {
          // 静默处理404错误，不显示在控制台
          return;
        }
      }
    });

    // 调用当前的 send（index.html 中设置的拦截器）
    return currentXHRSend.call(this, data);
  };

  // 重写fetch来拦截网络请求日志
  // 注意：index.html 中已经设置了 HTTP URL 拦截，这里只需要添加错误处理
  const currentFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    // 关键：API 请求（包含 /api/ 路径）直接放行，不进行任何拦截处理
    // 这确保 EPS 请求和其他 API 请求不会被影响
    let url: string;
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.href;
    } else {
      url = input.url;
    }
    
    // 检查多种形式的 API URL：
    // - /api/... (相对路径)
    // - http://host/api/... (完整 URL)
    // - https://host/api/... (完整 URL)
    if (url.includes('/api/') || url.endsWith('/api') || url.match(/\/api(\?|$|#)/)) {
      // API 请求直接放行，不添加额外的错误处理
      return currentFetch.call(this, input, init);
    }
    
    // 调用当前的 fetch（index.html 中设置的拦截器）
    return currentFetch.call(this, input, init).catch((error) => {
      // 如果是网络错误，静默处理
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        // 静默处理网络错误
        return Promise.reject(error);
      }
      return Promise.reject(error);
    });
  };

  } finally {
    // 监控系统：标记启动完成
    trackBootstrapEnd();
  }
}

// 导出各个模块，供其他地方使用
export * from './core';
export * from './handlers';
export * from './integrations';

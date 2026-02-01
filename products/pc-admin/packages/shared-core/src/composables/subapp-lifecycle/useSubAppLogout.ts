import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { sessionStorage } from '../../utils/storage/session';
import type { SubAppContext } from './types';
import { logger } from '../../utils/logger/index';

/**
 * 创建退出登录函数（标准化模板）
 * @param context - 子应用上下文
 * @param _appId - 应用 ID
 * @param getAuthApi - 可选的获取 authApi 的函数，如果不提供，则使用全局 __APP_AUTH_API__
 */
export function createLogoutFunction(
  context: SubAppContext,
  _appId: string,
  getAuthApi?: () => Promise<{ logout: () => Promise<void> } | undefined>
): () => Promise<void> {
  return async () => {
    try {
      // 关键：先发送退出消息到其他标签页（通过 useCrossDomainBridge 的全局实例）
      // 这样可以确保其他标签页能够同步退出
      try {
        // 优先使用全局的 sendMessage 函数（如果 useCrossDomainBridge 已初始化）
        if (typeof window !== 'undefined' && (window as any).__APP_BRIDGE_SEND_MESSAGE__) {
          logger.info('[createLogoutFunction] Sending logout message via global bridge:', {
            currentPathname: window.location.pathname
          });
          (window as any).__APP_BRIDGE_SEND_MESSAGE__('logout', { timestamp: Date.now() });
          logger.info('[createLogoutFunction] Logout message sent successfully via global bridge');
          // 给消息发送足够的时间，确保消息已经发送到所有标签页
          await new Promise(resolve => setTimeout(resolve, 200));
        } else if (typeof BroadcastChannel !== 'undefined') {
          // 兜底方案：如果全局函数不存在，使用 BroadcastChannel（向后兼容）
          const channel = new BroadcastChannel('bellis-auth-channel');
          const message = {
            type: 'logout',
            payload: { timestamp: Date.now() },
            origin: window.location.origin,
            timestamp: Date.now()
          };
          logger.info('[createLogoutFunction] Sending logout message via BroadcastChannel (fallback):', {
            message,
            channelName: 'bellis-auth-channel',
            currentPathname: window.location.pathname
          });
          channel.postMessage(message);
          logger.info('[createLogoutFunction] Logout message sent successfully via BroadcastChannel');
          // 给消息发送足够的时间，确保消息已经发送到所有标签页
          await new Promise(resolve => setTimeout(resolve, 200));
          channel.close();
        }
      } catch (error) {
        logger.error('[createLogoutFunction] Failed to send logout message:', error);
        // 即使消息发送失败，也继续执行退出逻辑
      }

      // 调用后端 logout API（优先使用全局 authApi，如果没有则使用自定义获取函数）
      try {
        let authApi = (window as any).__APP_AUTH_API__;
        if (!authApi?.logout && getAuthApi) {
          // 如果没有全局 authApi，尝试使用自定义获取函数
          authApi = await getAuthApi();
        }
        if (authApi?.logout) {
          await authApi.logout();
        } else {
          console.warn('[useLogout] Auth API logout function not available.');
        }
      } catch (error: any) {
        // 后端 API 失败不影响前端清理
        console.warn('Logout API failed, but continue with frontend cleanup:', error);
      }

      // 关键：先清除登录状态标记，确保 isAuthenticated() 立即返回 false
      // 这样路由守卫在检查时就不会因为 cookie 清除延迟而误判
      const getAppStorage = () => {
        return (window as any).__APP_STORAGE__ || (window as any).appStorage;
      };
      const appStorage = getAppStorage();
      if (appStorage) {
        const currentSettings = (appStorage.settings?.get() as Record<string, any>) || {};
        if (currentSettings.is_logged_in) {
          delete currentSettings.is_logged_in;
          // 关键：使用 set 方法更新设置，确保同步到 btc_settings cookie
          appStorage.settings?.set(currentSettings);
        }
        // 安全调用 clear 方法，确保对象存在
        if (appStorage.auth && typeof appStorage.auth.clear === 'function') {
          appStorage.auth.clear();
        }
        if (appStorage.user && typeof appStorage.user.clear === 'function') {
          appStorage.user.clear();
        }
      }

      // 关键：直接清除 btc_settings cookie 中的 is_logged_in 标记（双重保险）
      // 因为 appStorage.settings 可能存储在 btc_settings cookie 中，需要确保清除
      try {
        const { deleteCookie, getCookie } = await import('../../utils/cookie');
        // 先读取 btc_settings cookie
        const settingsCookie = getCookie('btc_settings');
        if (settingsCookie) {
          try {
            const settings = JSON.parse(decodeURIComponent(settingsCookie));
            if (settings.is_logged_in) {
              delete settings.is_logged_in;
              // 重新设置 cookie（通过 appStorage.settings.set 确保使用正确的 domain 和 path）
              if (appStorage?.settings) {
                appStorage.settings.set(settings);
              } else {
                // 如果 appStorage 不可用，直接清除整个 cookie
                deleteCookie('btc_settings');
              }
            }
          } catch (e) {
            // 如果解析失败，直接清除整个 cookie
            deleteCookie('btc_settings');
          }
        }
      } catch (e) {
        // 静默失败
      }

      // 清除 storage 中的 is_logged_in 标记（向后兼容）
      try {
        const { storage } = await import('../../utils');
        storage.remove('is_logged_in');
      } catch (e) {
        // 静默失败
      }

      // 关键：设置退出登录标记到 sessionStorage，用于路由守卫判断
      // 退出登录后短时间内（5秒），即使 isAuthenticated() 返回 true，也允许访问登录页
      // 这样可以解决 cookie 清除延迟导致的重定向问题
      try {
        sessionStorage.set('logout_timestamp', Date.now());
        // 5 秒后自动清除标记
        setTimeout(() => {
          try {
            sessionStorage.remove('logout_timestamp');
          } catch (e) {
            // 静默失败
          }
        }, 5000);
      } catch (e) {
        // 静默失败
      }

      // 清除 cookie 中的 token
      const { deleteCookie } = await import('../../utils/cookie');
      deleteCookie('access_token');

      // 关键：清除 btc_user cookie（用于用户认证检查）
      // 注意：btc_user cookie 可能设置了 domain，需要确保清除时也使用相同的 domain
      try {
        // 尝试获取 cookie domain（如果应用提供了 getCookieDomain 函数）
        let cookieDomain: string | undefined;
        try {
          // 尝试从主应用的工具函数获取 domain
          if (typeof window !== 'undefined' && (window as any).__APP_GET_COOKIE_DOMAIN__) {
            cookieDomain = (window as any).__APP_GET_COOKIE_DOMAIN__();
          }
        } catch (e) {
          // 静默失败
        }

        // 清除 btc_user cookie
        if (cookieDomain) {
          deleteCookie('btc_user', { domain: cookieDomain, path: '/' });
        } else {
          deleteCookie('btc_user');
        }
      } catch (e) {
        // 如果清除失败，尝试使用默认方式清除
        try {
          deleteCookie('btc_user');
        } catch (e2) {
          // 静默失败
        }
      }

      // 清除用户状态
      try {
        const { storage } = await import('../../utils');
        storage.remove('user');
        storage.remove('btc_user');
      } catch (e) {
        // 静默失败
      }

      // 清除标签页（Process Store）
      try {
        const sharedComponents = await import('@btc/shared-components') as typeof import('@btc/shared-components');
        const { useProcessStore } = sharedComponents;
        const processStore = useProcessStore();
        processStore.clear();
      } catch (e) {
        // 静默失败
      }

      // 显示退出成功提示
      const sharedComponents = await import('@btc/shared-components');
      const { BtcMessage } = sharedComponents as { BtcMessage?: any };
      const t = context.i18n?.i18n?.global?.t;
      if (t) {
        BtcMessage.success(t('common.logoutSuccess'));
      }

      // 跳转到登录页，添加 logout=1 参数和 redirect 参数（当前路径），让路由守卫知道这是退出登录
      try {
        // 使用统一的环境检测
        const { getEnvironment, getCurrentSubApp } = await import('../../configs/unified-env-config');
        const { buildLogoutUrlWithFullUrl, buildLogoutUrl, getCurrentUnifiedPath } = await import('@btc/shared-core/utils/redirect');

        const env = getEnvironment();
        const currentSubApp = getCurrentSubApp();
        const protocol = window.location.protocol;

        // 判断是否需要使用完整URL（跨子域名场景）
        const needsFullUrl = (env === 'test' || env === 'production') && currentSubApp;
        const isQiankun = qiankunWindow.__POWERED_BY_QIANKUN__;

        if (needsFullUrl || isQiankun) {
          // 测试/生产环境子应用或qiankun环境：使用完整URL作为redirect参数
          let baseLoginUrl: string;

          if (env === 'test') {
            baseLoginUrl = `${protocol}//test.bellis.com.cn/login`;
          } else if (env === 'production') {
            baseLoginUrl = `${protocol}//bellis.com.cn/login`;
          } else {
            baseLoginUrl = '/login';
          }

          const logoutUrl = await buildLogoutUrlWithFullUrl(baseLoginUrl);
          window.location.href = logoutUrl;
        } else {
          // 开发/预览环境独立运行模式：使用路由跳转，添加 logout=1 参数和 redirect 参数
          const currentPath = await getCurrentUnifiedPath();
          context.router.replace({
            path: '/login',
            query: {
              logout: '1',
              ...(currentPath && currentPath !== '/login' ? { oauth_callback: currentPath } : {})
            }
          });
        }
      } catch (error) {
        // 如果导入失败，使用兜底方案
        logger.error('[useSubAppLogout] Failed to build logout URL:', error);
        context.router.replace({
          path: '/login',
          query: { logout: '1' }
        });
      }
    } catch (error: any) {
      // 即使出现错误，也执行清理操作
      logger.error('Logout error:', error);

      // 关键：先清除登录状态标记，确保 isAuthenticated() 立即返回 false
      const getAppStorage = () => {
        return (window as any).__APP_STORAGE__ || (window as any).appStorage;
      };
      const appStorage = getAppStorage();
      if (appStorage) {
        try {
          const currentSettings = (appStorage.settings?.get() as Record<string, any>) || {};
          if (currentSettings.is_logged_in) {
            delete currentSettings.is_logged_in;
            appStorage.settings?.set(currentSettings);
          }
          // 安全调用 clear 方法，确保对象存在
          if (appStorage.auth && typeof appStorage.auth.clear === 'function') {
            appStorage.auth.clear();
          }
          if (appStorage.user && typeof appStorage.user.clear === 'function') {
            appStorage.user.clear();
          }
        } catch (e) {
          // 静默失败
        }
      }

      // 关键：直接清除 btc_settings cookie 中的 is_logged_in 标记（双重保险）
      try {
        const { deleteCookie, getCookie } = await import('../../utils/cookie');
        const settingsCookie = getCookie('btc_settings');
        if (settingsCookie) {
          try {
            const settings = JSON.parse(decodeURIComponent(settingsCookie));
            if (settings.is_logged_in) {
              delete settings.is_logged_in;
              if (appStorage?.settings) {
                appStorage.settings.set(settings);
              } else {
                deleteCookie('btc_settings');
              }
            }
          } catch (e) {
            deleteCookie('btc_settings');
          }
        }
      } catch (e) {
        // 静默失败
      }

      // 清除 storage 中的 is_logged_in 标记（向后兼容）
      try {
        const { storage } = await import('../../utils');
        storage.remove('is_logged_in');
      } catch (e) {
        // 静默失败
      }

      // 关键：设置退出登录标记到 sessionStorage
      try {
        sessionStorage.set('logout_timestamp', Date.now());
        // 不创建定时器，避免内存泄漏
      } catch (e) {
        // 静默失败
      }

      // 强制清除所有 cookie
      try {
        const { deleteCookie } = await import('../../utils/cookie');
        deleteCookie('access_token');

        // 清除 btc_user cookie
        try {
          let cookieDomain: string | undefined;
          try {
            if (typeof window !== 'undefined' && (window as any).__APP_GET_COOKIE_DOMAIN__) {
              cookieDomain = (window as any).__APP_GET_COOKIE_DOMAIN__();
            }
          } catch (e) {
            // 静默失败
          }

          if (cookieDomain) {
            deleteCookie('btc_user', { domain: cookieDomain, path: '/' });
          } else {
            deleteCookie('btc_user');
          }
        } catch (e) {
          try {
            deleteCookie('btc_user');
          } catch (e2) {
            // 静默失败
          }
        }
      } catch (e) {
        // 静默失败
      }

      // 清除用户状态
      try {
        const { storage } = await import('../../utils');
        storage.remove('user');
        storage.remove('btc_user');
      } catch (e) {
        // 静默失败
      }

      // 清除标签页（Process Store）
      try {
        const sharedComponents = await import('@btc/shared-components') as typeof import('@btc/shared-components');
        const { useProcessStore } = sharedComponents;
        const processStore = useProcessStore();
        processStore.clear();
      } catch (e) {
        // 静默失败
      }

      // 跳转到登录页，添加 logout=1 参数和 redirect 参数（当前路径）
      try {
        // 使用统一的环境检测
        const { getEnvironment, getCurrentSubApp } = await import('../../configs/unified-env-config');
        const { buildLogoutUrlWithFullUrl, buildLogoutUrl, getCurrentUnifiedPath } = await import('@btc/shared-core/utils/redirect');

        const env = getEnvironment();
        const currentSubApp = getCurrentSubApp();
        const protocol = window.location.protocol;

        // 判断是否需要使用完整URL（跨子域名场景）
        const needsFullUrl = (env === 'test' || env === 'production') && currentSubApp;
        const isQiankun = qiankunWindow.__POWERED_BY_QIANKUN__;

        if (needsFullUrl || isQiankun) {
          // 测试/生产环境子应用或qiankun环境：使用完整URL作为redirect参数
          let baseLoginUrl: string;

          if (env === 'test') {
            baseLoginUrl = `${protocol}//test.bellis.com.cn/login`;
          } else if (env === 'production') {
            baseLoginUrl = `${protocol}//bellis.com.cn/login`;
          } else {
            baseLoginUrl = '/login';
          }

          const logoutUrl = await buildLogoutUrlWithFullUrl(baseLoginUrl);
          window.location.href = logoutUrl;
        } else {
          // 开发/预览环境独立运行模式：使用路由跳转，添加 logout=1 参数和 redirect 参数
          const currentPath = await getCurrentUnifiedPath();
          context.router.replace({
            path: '/login',
            query: {
              logout: '1',
              ...(currentPath && currentPath !== '/login' ? { oauth_callback: currentPath } : {})
            }
          });
        }
      } catch (error) {
        // 如果导入失败，使用兜底方案
        logger.error('[useSubAppLogout] Failed to build logout URL:', error);
        context.router.replace({
          path: '/login',
          query: { logout: '1' }
        });
      }
    }
  };
}

/**
 * 通用退出登录 composable
 * 可以在所有应用中使用，支持退出后保存当前路径以便登录后返回
 */
import { useRouter } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { onUnmounted } from 'vue';
import { useCrossDomainBridge } from './useCrossDomainBridge';
import { logoutCore, type LogoutCoreOptions } from '../auth/logoutCore';
import { logger } from '../utils/logger/index';

export interface UseLogoutOptions {
  /**
   * 自定义 authApi（可选）
   * 如果不提供，会尝试从全局 __APP_AUTH_API__ 获取
   */
  authApi?: {
    logout: () => Promise<void>;
    [key: string]: any;
  };
  /**
   * 自定义清理用户信息的函数（可选）
   */
  clearUserInfo?: () => void;
  /**
   * 自定义获取 processStore 的函数（可选）
   */
  getProcessStore?: () => Promise<any>;
  /**
   * 自定义清除 cookie 的函数（可选）
   */
  deleteCookie?: (name: string, options?: any) => void;
  /**
   * 自定义获取 appStorage 的函数（可选）
   */
  getAppStorage?: () => any;
}

/**
 * 通用退出登录 composable
 *
 * @param options - 可选配置项
 * @returns logout 函数
 */
export function useLogout(options: UseLogoutOptions = {}) {
  const router = useRouter();

  // 初始化跨域通信桥
  const bridge = useCrossDomainBridge();
  let unsubscribeLogout: (() => void) | null = null;
  let isLoggingOut = false; // 防止重复执行登出逻辑

  // 构建退出登录的URL，包含 oauth_callback 参数
  const buildLogoutUrl = async (): Promise<string> => {
    try {
      // 动态导入构建URL的工具函数
      const { buildLogoutUrl: buildUrl, buildLogoutUrlWithFullUrl } = await import('../utils/redirect');
      const { getEnvironment } = await import('../configs/unified-env-config');
      
      const env = getEnvironment();
      const baseLoginUrl = '/login';
      
      // 生产环境使用完整URL，开发环境使用相对路径
      if (env === 'production' || env === 'test') {
        return await buildLogoutUrlWithFullUrl(baseLoginUrl);
      } else {
        return await buildUrl(baseLoginUrl);
      }
    } catch (error) {
      logger.warn('[useLogout] Failed to build logout URL, using fallback:', error);
      // 回退方案：使用当前路径构建简单的 oauth_callback（开发环境不编码斜杠）
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      if (currentPath === '/login' || currentPath.startsWith('/login')) {
        return '/login?logout=1';
      }
      // 开发环境：编码查询参数值
      return `/login?logout=1&oauth_callback=${encodeURIComponent(currentPath)}&clearRedirectCookie=1`;
    }
  };

  // 统一的登出清理逻辑（重构为调用 logoutCore + 路由重定向）
  const performLogoutCleanup = async (isRemoteLogout = false) => {
    if (isLoggingOut) {
      return; // 防止重复执行
    }
    isLoggingOut = true;

    try {
      // 保存退出前的路径（本地退出和远程退出都需要保存，以便登录后返回）
      try {
        const { saveLogoutRedirectPath } = await import('../utils/redirect');
        await saveLogoutRedirectPath();
      } catch (error) {
        logger.warn('[useLogout] Failed to save logout redirect path:', error);
      }

      // 调用 logoutCore 纯函数处理核心逻辑
      const logoutCoreOptions: LogoutCoreOptions = {
        ...(options.authApi !== undefined && { authApi: options.authApi }),
        ...(options.clearUserInfo !== undefined && { clearUserInfo: options.clearUserInfo }),
        ...(options.getProcessStore !== undefined && { getProcessStore: options.getProcessStore }),
        ...(options.deleteCookie !== undefined && { deleteCookie: options.deleteCookie }),
        ...(options.getAppStorage !== undefined && { getAppStorage: options.getAppStorage }),
        isRemoteLogout,
        ...(!isRemoteLogout && {
          onSuccess: async (message: string) => {
            // 显示退出成功提示
            try {
              const { BtcMessage } = await import('@btc/shared-components');
              if (BtcMessage && typeof BtcMessage.success === 'function') {
                BtcMessage.success(message);
              } else {
                const globalBtcMessage = (window as any).BtcMessage;
                if (globalBtcMessage && typeof globalBtcMessage.success === 'function') {
                  globalBtcMessage.success(message);
                }
              }
            } catch (error) {
              // Failed to show logout success message
            }
          },
        }),
      };

      const success = await logoutCore(logoutCoreOptions);

      if (!success) {
        logger.error('[useLogout] Logout core failed');
        isLoggingOut = false;
        return;
      }

      // 构建退出登录URL（包含 oauth_callback 参数）
      const logoutUrl = await buildLogoutUrl();
      
      // 路由重定向逻辑：本地退出和远程退出都要跳转到登录页
      // 立即跳转，不创建定时器，避免内存泄漏
      window.location.href = logoutUrl;
    } catch (error: any) {
      logger.error('Logout cleanup error:', error);
      isLoggingOut = false;
      // 即使出错，也尝试跳转到登录页（包含 clearRedirectCookie=1）
      try {
        window.location.href = '/login?logout=1&clearRedirectCookie=1';
      } catch (e) {
        // 静默失败
      }
    } finally {
      // 如果页面不跳转（理论上不应该发生，因为上面已经跳转了），立即重置标志
      // 但为了安全起见，保留这个逻辑
      if (isRemoteLogout) {
        // 延迟重置，确保页面跳转完成
        setTimeout(() => {
          isLoggingOut = false;
        }, 100);
      }
      // 本地退出时，页面会跳转，标志会在跳转时失效，不需要定时器
    }
  };

  // 判断是否是同一个应用（在开发环境中，即使 origin 相同，路径不同也是不同应用）
  const isSameApp = (origin?: string): boolean => {
    // 如果没有 origin，认为是不同应用
    if (!origin) {
      return false;
    }

    // 如果 origin 不同，肯定是不同应用
    if (origin !== window.location.origin) {
      return false;
    }

    // 在开发环境中，即使 origin 相同，也需要通过路径判断是否是同一个应用
    // 例如：/admin/... 和 / 是不同的应用
    if (import.meta.env.DEV) {
      // 在开发环境中，即使 origin 相同，也认为是不同应用（因为路径不同）
      return false;
    }

    // 生产环境中，origin 相同就是同一个应用
    return true;
  };

  // 处理登录消息：当其他标签页登录时，跳转到之前保存的页面
  const handleLoginMessage = async (_payload?: any, origin?: string) => {
    if (isSameApp(origin)) {
      return;
    }
    
    try {
      // 检查当前是否在登录页
      const currentPath = window.location.pathname;
      const isOnLoginPage = currentPath === '/login' || currentPath.startsWith('/login?');
      
      // 如果在登录页，不刷新页面，让登录逻辑自己处理导航
      if (isOnLoginPage) {
        return;
      }
      
      // 获取保存的退出前路径
      const { getAndClearLogoutRedirectPath } = await import('../utils/redirect');
      const savedPath = getAndClearLogoutRedirectPath();
      
      if (savedPath) {
        // 如果有保存的路径，跳转到该路径
        const { handleCrossAppRedirect } = await import('../utils/redirect');
        const isCrossAppRedirect = await handleCrossAppRedirect(savedPath, router);
        
        if (!isCrossAppRedirect) {
          // 如果不是跨应用跳转，使用 router.push
          router.push(savedPath).catch((error) => {
            logger.warn('[useLogout] Router push failed, using window.location as fallback:', error);
            window.location.href = savedPath;
          });
        }
      } else {
        // 如果没有保存的路径，刷新页面（保持原有行为）
        window.location.reload();
      }
    } catch (error) {
      logger.warn('[useLogout] Failed to handle login message, reloading page:', error);
      // 如果出错，回退到刷新页面
      window.location.reload();
    }
  };

  // 关键：立即设置订阅，不等待组件挂载（确保消息监听器尽早设置）
  unsubscribeLogout = bridge.subscribe('logout', (payload, origin) => {
    logger.info('[useLogout] Received logout message from other tab:', {
      payload,
      origin,
      currentOrigin: window.location.origin,
      currentPathname: window.location.pathname,
      isLoggingOut
    });
    
    // 避免重复执行
    if (isLoggingOut) {
      logger.info('[useLogout] Already logging out, ignoring duplicate logout message');
      return;
    }

    // 关键修复：移除 isSameApp 判断，确保所有标签页（包括同一应用的不同标签页）都执行退出
    // 用户需求：所有标签页都应该退出，不管是不是同一个应用
    logger.info('[useLogout] Executing logout cleanup triggered by remote tab');
    // 执行统一登出逻辑（异步处理）
    performLogoutCleanup(true).catch((error) => {
      logger.error('[useLogout] Error in logout cleanup:', error);
    }); // true 表示是远程触发的登出
  });

  // 订阅登录消息
  const unsubscribeLogin = bridge.subscribe('login', handleLoginMessage);

  onUnmounted(() => {
    if (unsubscribeLogout) {
      unsubscribeLogout();
    }
    if (unsubscribeLogin) {
      unsubscribeLogin();
    }
  });

  const logout = async () => {
    // 关键：先通知其他标签页（通过通信桥），再执行本地登出清理
    // 这样可以确保消息在页面跳转前发送，避免消息丢失
    logger.info('[useLogout] logout() function called');
    try {
      const logoutPayload = { timestamp: Date.now() };
      logger.info('[useLogout] Sending logout message to other tabs:', {
        payload: logoutPayload,
        origin: window.location.origin,
        pathname: window.location.pathname
      });
      
      // 确保 bridge 已初始化
      if (!bridge) {
        logger.error('[useLogout] Bridge is not initialized!');
        throw new Error('Bridge is not initialized');
      }
      
      logger.info('[useLogout] Calling bridge.sendMessage...');
      bridge.sendMessage('logout', logoutPayload);
      logger.info('[useLogout] bridge.sendMessage called successfully');
      
      // 给消息发送足够的时间，确保消息已经发送到所有标签页
      // 使用 200ms 延迟，确保 BroadcastChannel 消息有足够时间传递
      await new Promise(resolve => setTimeout(resolve, 200));
      logger.info('[useLogout] Logout message sent, waiting completed');
    } catch (error) {
      // 记录错误，但继续执行退出流程
      logger.error('[useLogout] Failed to send logout message:', error);
      console.error('[useLogout] Failed to send logout message:', error);
    }
    
    // 执行本地登出清理（会跳转到登录页）
    logger.info('[useLogout] Calling performLogoutCleanup...');
    await performLogoutCleanup(false);
    logger.info('[useLogout] performLogoutCleanup completed');
  };

  return {
    logout
  };
}


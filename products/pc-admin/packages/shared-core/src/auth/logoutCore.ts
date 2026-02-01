/**
 * 退出登录核心逻辑（纯函数，无路由耦合）
 * 负责清理凭证、调用API、设置标记等，但不处理路由重定向
 */
import { sessionStorage } from '../utils/storage/session';
import { logger } from '../utils/logger/index';

export interface LogoutCoreOptions {
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
  /**
   * 是否远程退出（不调用API，不显示提示）
   */
  isRemoteLogout?: boolean;
  /**
   * 显示退出成功提示的回调函数（可选）
   * 如果不提供，不会显示提示
   */
  onSuccess?: (message: string) => void;
}

/**
 * 退出登录核心函数（纯逻辑，无路由耦合）
 * @param options - 退出配置项（适配不同应用的差异）
 * @returns Promise<boolean> - 退出是否成功
 */
export async function logoutCore(options: LogoutCoreOptions = {}): Promise<boolean> {
  const {
    authApi,
    clearUserInfo,
    getProcessStore,
    deleteCookie: deleteCookieFn,
    getAppStorage,
    isRemoteLogout = false,
    onSuccess,
  } = options;

  try {
    // 仅在本地的登出操作中调用后端 API
    if (!isRemoteLogout) {
      try {
        const api = authApi || (window as any).__APP_AUTH_API__;
        if (api?.logout) {
          await api.logout();
        }
      } catch (error: any) {
        // 静默失败，不影响退出流程
      }
    }

    // 清除登录状态标记
    const getAppStorageFn = getAppStorage || (() => (window as any).__APP_STORAGE__ || (window as any).appStorage);
    const appStorage = getAppStorageFn();
    if (appStorage?.settings) {
      try {
        appStorage.settings.removeItem('is_logged_in');
      } catch (e) {
        // 静默失败
      }
    }

    // 设置退出登录标记
    try {
      sessionStorage.set('logout_timestamp', Date.now());
    } catch (e) {
      // 静默失败
    }

    // 清除 cookie
    const deleteCookie = deleteCookieFn || (await import('../utils/cookie')).deleteCookie;
    try {
      deleteCookie('access_token');
      deleteCookie('btc_user');
    } catch (e) {
      // 静默失败
    }

    // 清除用户状态
    try {
      const { storage } = await import('../utils');
      storage.remove('user');
      storage.remove('btc_user');
      storage.remove('is_logged_in');
    } catch (e) {
      // 静默失败
    }

    // 关键：停止用户检查轮询（避免退出后继续检查）
    try {
      const { stopUserCheckPolling } = await import('../composables/user-check');
      stopUserCheckPolling();
    } catch (e) {
      // 静默失败（可能模块未加载）
    }

    // 清除标签页（Process Store）
    if (getProcessStore) {
      try {
        const processStore = await getProcessStore();
        processStore.clear();
      } catch (e) {
        // 静默失败
      }
    }

    // 自定义清理用户信息
    if (clearUserInfo) {
      try {
        clearUserInfo();
      } catch (e) {
        // 静默失败
      }
    }

    // 显示提示（如果提供）
    if (!isRemoteLogout && onSuccess) {
      try {
        onSuccess('退出成功');
      } catch (error) {
        // 静默失败
      }
    }

    return true;
  } catch (error: any) {
    logger.error('[logoutCore] Logout cleanup error:', error);
    return false;
  }
}


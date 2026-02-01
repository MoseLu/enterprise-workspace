/**
 * 用户检查轮询统一接口
 */
;

import { startPolling, stopPolling, isPollingActive } from './useUserCheckPolling';
import { startCountdown, stopCountdown } from './useUserCheckCountdown';
import { getUserCheckDataFromStorage, getCredentialExpireTime, clearUserCheckData } from './useUserCheckStorage';
import { sessionStorage } from '../../utils/storage/session';
import type { UserCheckData } from './useUserCheck';

/**
 * 启动用户检查轮询
 * @param forceImmediate 是否强制立即检查（登录后需要立即调用一次，获取最新的剩余时间）
 * 在登录成功后立即调用时，应传递 forceImmediate = true
 * 在应用启动时检查到已登录时调用，应传递 forceImmediate = false（使用存储的剩余时间）
 */
export function startUserCheckPolling(forceImmediate = false): void {
  // 如果已经在轮询，且不是强制立即检查，不重复启动
  if (isPollingActive() && !forceImmediate) {
    if (import.meta.env.DEV) {
      console.warn('[startUserCheckPolling] Polling is already active, skipping');
    }
    return;
  }

  // 启动轮询，每次检查后根据剩余时间决定是否启动倒计时
  startPolling(({ remainingTime }) => {
    // 如果剩余时间不足30秒，启动倒计时
    if (remainingTime < 30) {
      startCountdown();
    } else {
      // 如果剩余时间大于30秒，停止倒计时
      stopCountdown();
    }
  }, forceImmediate);
}

/**
 * 检查是否已登录，如果已登录则启动轮询
 * 在应用启动时调用
 * 注意：此函数应该只在主应用（main-app）的 bootstrap 中调用一次
 */
export function startUserCheckPollingIfLoggedIn(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // 如果已经在轮询，不重复启动
  if (isPollingActive()) {
    return;
  }

  // 直接执行启动逻辑
  doStartUserCheckPollingIfLoggedIn();
}

/**
 * 实际执行启动轮询的逻辑
 */
function doStartUserCheckPollingIfLoggedIn(): void {
  // 再次检查是否已经在轮询
  if (isPollingActive()) {
    return;
  }

  // 检查是否在登录页面，如果是则不启动
  const currentPath = window.location.pathname;
  if (currentPath === '/login' || currentPath.startsWith('/login?')) {
    return;
  }

  // 检查是否已登录
  try {
    // 优先检查是否是刚登录（通过 is_logged_in 标记）
    // 注意：这个标记应该在登录成功后立即设置，并在启动轮询后立即清除
    // 如果页面刷新时还存在，说明上次没有正确清除，需要清除并记录警告
    const appStorage = (window as any).__APP_STORAGE__ || (window as any).appStorage;
    let isJustLoggedIn = false;
    if (appStorage) {
      const settings = appStorage.settings?.get?.() as Record<string, any> | null;
      if (settings?.is_logged_in === true) {
        // 检查是否有会话存储数据，如果有说明不是刚登录，而是标记没有清除
        const hasUserCheckData = sessionStorage.get('user_check_status');
        if (hasUserCheckData) {
          // 有会话存储数据，说明不是刚登录，标记应该已经被清除但没有清除
          // 清除标记，但不强制立即检查
          delete settings.is_logged_in;
          appStorage.settings.set(settings);
          // 不设置 isJustLoggedIn，继续后续逻辑（使用存储的剩余时间）
        } else {
          // 没有会话存储数据，说明是真正的刚登录
          isJustLoggedIn = true;
          delete settings.is_logged_in;
          appStorage.settings.set(settings);
        }
      }
    }

    // 如果检测到刚登录，强制立即检查
    if (isJustLoggedIn) {
      // 更新当前应用 ID 到 sessionStorage
      updateCurrentAppId();
      startUserCheckPolling(true);
      return;
    }

    // 检测是否是应用切换
    const isAppSwitch = checkIfAppSwitch();

    // 方式1: 检查 sessionStorage 中是否有用户检查数据（说明之前已登录）
    const hasUserCheckData = sessionStorage.get('user_check_status');
    if (hasUserCheckData) {
      if (isAppSwitch) {
        // 应用切换：立即检查并更新会话存储
        startUserCheckPolling(true);
      } else {
        // 页面刷新：使用存储的剩余时间，不强制立即检查
        // 最长调用间隔为1小时
        startUserCheckPolling(false);
      }
      // 更新当前应用 ID
      updateCurrentAppId();
      return;
    }

    // 方式2: 检查 cookie 中的 access_token
    const getCookie = (name: string): string | null => {
      if (typeof document === 'undefined') return null;
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        if (!c) continue;
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
      }
      return null;
    };

    const token = getCookie('access_token');
    if (token) {
      // 有 token 但没有 sessionStorage 数据，可能是首次登录或 sessionStorage 被清除
      // 此时应该立即检查，获取最新的剩余时间
      updateCurrentAppId();
      startUserCheckPolling(true);
      return;
    }

    // 方式3: 检查全局 appStorage
    if (appStorage) {
      const user = appStorage.user?.get?.();
      if (user?.id) {
        // 有用户数据但没有 sessionStorage 数据，应该立即检查
        updateCurrentAppId();
        startUserCheckPolling(true);
        return;
      }
    }
  } catch (error) {
    // 静默失败，不影响应用启动
    if (import.meta.env.DEV) {
      console.warn('[startUserCheckPollingIfLoggedIn] Failed to check login status:', error);
    }
  }
}

/**
 * 检测是否是应用切换
 * 通过比较当前应用 ID 和 sessionStorage 中存储的上一次应用 ID
 */
function checkIfAppSwitch(): boolean {
  try {
    // 从 sessionStorage 获取上一次的应用 ID
    const lastAppId = sessionStorage.get('__last_app_id__') as string | undefined;

    // 如果是首次访问（没有存储的应用 ID），不算应用切换
    if (!lastAppId) {
      return false;
    }

    // 动态导入 getAppIdFromPath，避免循环依赖
    // 注意：这里使用同步方式获取，因为需要立即判断
    // 如果模块还未加载，使用路径解析作为兜底
    let currentAppId: string;
    try {
      // 尝试从全局获取（如果已经加载）
      const appRouteUtils = (window as any).__APP_ROUTE_UTILS__;
      if (appRouteUtils && typeof appRouteUtils.getAppIdFromPath === 'function') {
        const appId = appRouteUtils.getAppIdFromPath(window.location.pathname);
        currentAppId = appId || inferAppIdFromPath(window.location.pathname);
      } else {
        // 兜底：从路径推断应用 ID
        currentAppId = inferAppIdFromPath(window.location.pathname);
      }
    } catch {
      // 如果获取失败，使用路径推断
      currentAppId = inferAppIdFromPath(window.location.pathname);
    }

    // 如果应用 ID 不同，说明是应用切换
    return currentAppId !== lastAppId;
  } catch (error) {
    // 如果获取失败，默认不算应用切换（保守策略）
    if (import.meta.env.DEV) {
      console.warn('[checkIfAppSwitch] Failed to check app switch:', error);
    }
    return false;
  }
}

/**
 * 从路径推断应用 ID（兜底方案）
 */
function inferAppIdFromPath(path: string): string {
  // 移除开头的斜杠
  const normalizedPath = path.replace(/^\/+/, '');

  // 如果路径为空或是根路径，返回主应用
  if (!normalizedPath || normalizedPath === '/') {
    return 'main';
  }

  // 提取第一个路径段作为应用 ID
  const segments = normalizedPath.split('/');
  const firstSegment = segments[0] || '';

  // 如果第一个路径段为空，返回主应用
  if (!firstSegment) {
    return 'main';
  }

  // 常见的主应用路由
  const mainAppRoutes = ['login', 'overview', 'profile', 'settings'];
  if (mainAppRoutes.includes(firstSegment)) {
    return 'main';
  }

  return firstSegment;
}

/**
 * 更新当前应用 ID 到 sessionStorage
 */
function updateCurrentAppId(): void {
  try {
    let currentAppId: string;
    try {
      // 尝试从全局获取（如果已经加载）
      const appRouteUtils = (window as any).__APP_ROUTE_UTILS__;
      if (appRouteUtils && typeof appRouteUtils.getAppIdFromPath === 'function') {
        const appId = appRouteUtils.getAppIdFromPath(window.location.pathname);
        currentAppId = appId || inferAppIdFromPath(window.location.pathname);
      } else {
        // 兜底：从路径推断应用 ID
        currentAppId = inferAppIdFromPath(window.location.pathname);
      }
    } catch {
      // 如果获取失败，使用路径推断
      currentAppId = inferAppIdFromPath(window.location.pathname);
    }

    sessionStorage.set('__last_app_id__', currentAppId);
  } catch (error) {
    // 静默失败
    if (import.meta.env.DEV) {
      console.warn('[updateCurrentAppId] Failed to update app id:', error);
    }
  }
}

/**
 * 停止用户检查轮询
 * 在退出登录时调用
 */
export function stopUserCheckPolling(): void {
  stopPolling();
  stopCountdown();
  clearUserCheckData();
}

/**
 * 获取当前用户检查数据
 */
export function getUserCheckData(): {
  credentialExpireTime: string | null;
  sessionData: Partial<UserCheckData> | null;
} {
  return {
    credentialExpireTime: getCredentialExpireTime(),
    sessionData: getUserCheckDataFromStorage(),
  };
}

/**
 * 应用切换时重新初始化 user-check
 * 在 qiankun afterMount 或主应用切换时调用
 */
export async function reinitializeUserCheckOnAppSwitch(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  // 如果当前在登录页面，不重新初始化
  const currentPath = window.location.pathname;
  if (currentPath === '/login' || currentPath.startsWith('/login?')) {
    return;
  }

  try {
    // 停止当前轮询和倒计时
    stopUserCheckPolling();

    // 立即调用 user-check 获取最新数据
    const { checkUser } = await import('./useUserCheck');
    const { storeUserCheckData } = await import('./useUserCheckStorage');

    const result = await checkUser();

    if (!result || !result.isValid || !result.data) {
      // 检查失败，不启动轮询
      if (import.meta.env.DEV) {
        console.warn('[reinitializeUserCheckOnAppSwitch] User check failed, not starting polling');
      }
      return;
    }

    // 立即更新会话存储数据（保证数据最新，用于比对）
    storeUserCheckData(result.data);

    // 根据新的数据重新启动轮询（强制立即检查，获取最新数据）
    startUserCheckPolling(true);
  } catch (error) {
    // 静默失败，不影响应用切换
    if (import.meta.env.DEV) {
      console.warn('[reinitializeUserCheckOnAppSwitch] Failed to reinitialize user check:', error);
    }
  }
}


/**
 * 域列表缓存工具
 * 用于避免多个组件同时请求域列表接口
 */
;

import { storage } from '@btc/shared-utils';
import { sessionStorage } from '@btc/shared-core/utils/storage/session';
import { logger } from '@btc/shared-core/utils/logger';
import type { } from '@btc/shared-components';
import { deleteCookie } from '@btc/shared-core/utils/cookie';
import { appStorage } from './app-storage';
import { BtcMessage, BtcNotification } from '@btc/shared-components';

// 持久化存储键名
// 注意：不需要包含 btc_ 前缀，因为 sessionStorage 和 localStorage 工具类会自动添加
const DOMAIN_ME_STORAGE_KEY = 'domain_me_data';


/**
 * 执行退出登录逻辑（清除数据并重定向）
 */
function handleLogout() {
  try {
    // 停止全局用户检查轮询
    try {
      import('@btc/shared-core/composables/user-check').then(({ stopUserCheckPolling }) => {
        stopUserCheckPolling();
      }).catch((error) => {
        // 如果导入失败，静默处理
        if (import.meta.env.DEV) {
          console.warn('Failed to stop global user check polling on logout:', error);
        }
      });
    } catch (error) {
      // 如果导入失败，静默处理
    }

    // 清除 cookie 中的 token
    deleteCookie('access_token');

    // 清除登录状态标记（从统一的 settings 存储中移除）
    const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
    if (currentSettings.is_logged_in) {
      delete currentSettings.is_logged_in;
      appStorage.settings.set(currentSettings);
    }

    // 清除所有认证相关数据（使用统一存储管理器）
    appStorage.auth.clear();
    appStorage.user.clear();

    // 清除 localStorage 中的 is_logged_in 标记（向后兼容）
    storage.remove('is_logged_in');

    // 显示提示信息
    BtcMessage.error('身份已过期，请重新登录');

    // 判断是否在生产环境的子域名下
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

    // 使用 setTimeout 确保消息提示先显示，然后再跳转
    setTimeout(() => {
      // 在生产环境子域名下，使用 window.location 跳转，确保能正确跳转到主应用的登录页
      if (isProductionSubdomain) {
        window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
      } else {
        // 开发环境：使用 window.location 跳转，添加 logout=1 参数
        window.location.href = '/login?logout=1';
      }
    }, 100);
  } catch (error) {
    logger.error('[getDomainList] Logout error:', error);
    // 即使出错也尝试跳转到登录页
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/login?logout=1';
      }, 100);
    }
  }
}


/**
 * 从持久化存储读取域列表数据
 */
function getDomainListFromStorage(): any | null {
  try {
    // 优先从 sessionStorage 读取（会话级别）
    const sessionData = sessionStorage.get<any>(DOMAIN_ME_STORAGE_KEY);
    if (sessionData) {
      return sessionData;
    }
    // 其次从 localStorage 读取（持久化）
    const localData = storage.get<any>(DOMAIN_ME_STORAGE_KEY);
    if (localData) {
      return localData;
    }
  } catch (error) {
    // 静默失败，不影响功能
    if (import.meta.env.DEV) {
      console.warn('[getDomainList] Failed to read from storage:', error);
    }
  }
  return null;
}

/**
 * 获取域列表（只从持久化存储读取，不调用接口）
 * 关键：system-app 是子应用，不应该调用接口，只从存储读取
 * 接口由主应用（main-app）或 layout-app（生产环境）在登录时统一调用
 */
export async function getDomainList(service: any): Promise<any> {
  // 关键：只从持久化存储读取（登录时由主应用或 layout-app 已存储）
  const storedData = getDomainListFromStorage();
  if (storedData) {
    return storedData;
  }

  // 如果存储中没有数据，返回空数组（不调用接口）
  // 子应用不应该调用接口，应该等待主应用或 layout-app 加载数据
  return [];
}

/**
 * 清除缓存（用于退出登录）
 */
export function clearDomainCache(): void {
  // 清除持久化存储
  try {
    sessionStorage.remove(DOMAIN_ME_STORAGE_KEY);
    storage.remove(DOMAIN_ME_STORAGE_KEY);
  } catch (error) {
    // 静默失败
  }
}



/**
 * 域列表缓存工具
 * 用于避免多个组件同时请求域列表接口
 */
;

import { storage } from '@btc/shared-utils';
import { sessionStorage } from '@btc/shared-core/utils/storage/session';
import { logger } from '@btc/shared-core/utils/logger';
import { deleteCookie } from '@btc/shared-core/utils/cookie';
import { appStorage } from './app-storage';
import { BtcMessage } from '@btc/shared-components';
import { tSync } from '../../i18n/getters';

// 请求锁，防止并发请求
let pendingRequest: Promise<any> | null = null;

// 持久化存储键名
// 注意：不需要包含 btc_ 前缀，因为 sessionStorage 和 localStorage 工具类会自动添加
const DOMAIN_ME_STORAGE_KEY = 'domain_me_data';

/**
 * 执行退出登录逻辑（清除数据并重定向）
 */
function handleLogout() {
  try {
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

    // 清除域列表缓存（包括持久化存储）
    clearDomainCache(true);

    // 显示提示信息
    BtcMessage.error(tSync('common.error.identity_expired'));

    // 判断是否在生产环境的子域名下
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

    // 使用 setTimeout 确保消息提示先显示，然后再跳转
    setTimeout(() => {
      // 关键：只有主应用（bellis.com.cn）有登录页面，子应用没有登录页面
      // 所以在生产环境子域名下，必须重定向到主应用的登录页面
      if (isProductionSubdomain) {
        // 子域名环境，重定向到主应用的登录页面
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
 * 用户检查（检查用户登录状态）
 * @returns 如果正常返回 true，如果401返回 false，其他错误抛出异常
 */
async function checkUser(): Promise<boolean> {
  try {
    // 使用 fetch API 调用用户检查接口，避免构建时的依赖问题
    const response = await fetch('/api/system/auth/user-check', {
      method: 'GET',
      credentials: 'include', // 包含 cookie
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 解析响应数据
    // 先读取文本，避免响应体为空时 JSON 解析失败
    const responseText = await response.text();
    let responseData: any = null;
    if (responseText.trim()) {
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // JSON 解析失败，但继续处理状态码
        console.warn('[checkUser] Failed to parse JSON response:', parseError);
      }
    }
    const code = responseData?.code;
    const status = response.status;

    // 如果返回200，说明cookie正常
    if (code === 200 || status === 200) {
      return true;
    }

    // 如果返回401，说明cookie已过期
    if (code === 401 || status === 401) {
      return false;
    }

    // 其他情况，默认认为正常（避免因为其他错误导致无法加载域列表）
    return true;
  } catch (error: any) {
    // 检查错误对象本身的 code 属性
    if (error?.code === 401) {
      return false;
    }

    // 其他错误，默认认为正常（避免因为网络错误导致无法加载域列表）
    console.warn('[getDomainList] User check failed, but continue:', error);
    return true;
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
 * 保存域列表数据到持久化存储
 */
function saveDomainListToStorage(data: any): void {
  try {
    // 同时保存到 sessionStorage 和 localStorage
    sessionStorage.set(DOMAIN_ME_STORAGE_KEY, data);
    storage.set(DOMAIN_ME_STORAGE_KEY, data);
  } catch (error) {
    // 静默失败，不影响功能
    if (import.meta.env.DEV) {
      console.warn('[getDomainList] Failed to save to storage:', error);
    }
  }
}

/**
 * 获取域列表（只从持久化存储读取，不调用接口）
 * 关键：刷新时只从存储读取，接口由 layout-app 在登录时统一调用
 * @param service EPS 服务实例（保留参数以保持兼容性，但不再使用）
 * @returns 域列表数据
 */
export async function getDomainList(service: any): Promise<any> {
  // 关键：只从持久化存储读取（登录时已存储）
  // 不在刷新时调用接口，避免每次悬浮汉堡菜单都调用接口
  const storedData = getDomainListFromStorage();
  if (storedData) {
    return storedData;
  }

  // 如果缓存为空，返回空数组（不调用接口）
  // 数据会在登录时通过 loadDomainListOnLogin 加载
  return [];
}

/**
 * 在登录成功后调用，主动获取并存储域列表数据
 */
export async function loadDomainListOnLogin(service: any): Promise<any> {
  try {
    // 确保 service 存在
    if (!service) {
      console.warn('[loadDomainListOnLogin] EPS service not available');
      return null;
    }
    const response = await service.admin?.iam?.domain?.me();
    // 保存到持久化存储
    saveDomainListToStorage(response);
    return response;
  } catch (error) {
    // 静默失败，不影响登录流程
    if (import.meta.env.DEV) {
      console.warn('[loadDomainListOnLogin] Failed to load domain list:', error);
    }
    return null;
  }
}

/**
 * 清除缓存（用于强制刷新和退出登录）
 * @param clearPersistentStorage 是否清除持久化存储（默认 true，退出登录时清除）
 */
export function clearDomainCache(clearPersistentStorage: boolean = true): void {
  pendingRequest = null;
  
  // 只在明确要求时清除持久化存储（退出登录时）
  if (clearPersistentStorage) {
    try {
      sessionStorage.remove(DOMAIN_ME_STORAGE_KEY);
      storage.remove(DOMAIN_ME_STORAGE_KEY);
    } catch (error) {
      // 静默失败
    }
  }
}


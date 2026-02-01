/**
 * 域列表缓存工具
 * 用于避免多个组件同时请求域列表接口
 */
;

import { storage } from '@btc/shared-utils';
import { sessionStorage } from '@btc/shared-core/utils/storage/session';
import { appStorage } from './app-storage';

// 请求锁，防止并发请求
let pendingRequest: Promise<any> | null = null;

// 持久化存储键名
// 注意：不需要包含 btc_ 前缀，因为 sessionStorage 和 localStorage 工具类会自动添加
const DOMAIN_ME_STORAGE_KEY = 'domain_me_data';

// 用户检查缓存
let userCheckCache: { result: boolean; timestamp: number } | null = null;
let pendingUserCheck: Promise<boolean> | null = null;
const USER_CHECK_CACHE_DURATION = 2000; // 用户检查缓存2秒

/**
 * 用户检查（检查用户登录状态）
 * @returns 如果正常返回 true，如果401返回 false，其他错误抛出异常
 */
export async function checkUser(): Promise<boolean> {
  const now = Date.now();

  // 检查缓存是否有效
  if (userCheckCache && (now - userCheckCache.timestamp) < USER_CHECK_CACHE_DURATION) {
    return userCheckCache.result;
  }

  // 如果已经有请求在进行，等待该请求完成
  if (pendingUserCheck) {
    return await pendingUserCheck;
  }

  // 创建新请求
  pendingUserCheck = (async () => {
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

      let result: boolean;

      // 如果返回200，说明cookie正常
      if (code === 200 || status === 200) {
        result = true;
      } else if (code === 401 || status === 401) {
        // 如果返回401，说明cookie已过期
        result = false;
      } else {
        // 其他情况，默认认为正常（避免因为其他错误导致无法加载域列表）
        result = true;
      }

      // 更新缓存
      userCheckCache = { result, timestamp: Date.now() };
      return result;
    } catch (error: any) {
      // 检查错误对象本身的 code 属性
      if (error?.code === 401) {
        userCheckCache = { result: false, timestamp: Date.now() };
        return false;
      }

      // 其他错误，默认认为正常（避免因为网络错误导致无法加载域列表）
      console.warn('[getDomainList] User check failed, but continue:', error);
      const result = true;
      userCheckCache = { result, timestamp: Date.now() };
      return result;
    } finally {
      // 清除请求锁
      pendingUserCheck = null;
    }
  })();

  return await pendingUserCheck;
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
 * 关键：admin-app 是子应用，不应该调用接口，只从存储读取
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
  userCheckCache = null;
  pendingUserCheck = null;

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

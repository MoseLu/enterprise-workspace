/**
 * 域列表缓存工具
 * 用于避免多个组件同时请求域列表接口
 */
;

import { storage } from '@btc/shared-utils';
import { sessionStorage } from '@btc/shared-core/utils/storage/session';

// 请求锁，防止并发请求
let pendingRequest: Promise<any> | null = null;

// 持久化存储键名
// 注意：不需要包含 btc_ 前缀，因为 sessionStorage 工具类会自动添加
const DOMAIN_ME_STORAGE_KEY = 'domain_me_data';

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
 * 关键：刷新时只从存储读取，接口由主应用在登录时统一调用
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

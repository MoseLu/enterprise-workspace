/**
 * 域列表缓存工具
 * 用于避免多个组件同时请求域列表接口
 */
;

import { storage } from '@btc/shared-utils';
import { sessionStorage } from '@btc/shared-core/utils/storage/session';
import { appStorage } from './app-storage';

// 持久化存储键名
// 注意：不需要包含 btc_ 前缀，因为 sessionStorage 和 localStorage 工具类会自动添加
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
 * 获取域列表（只从持久化存储读取，不调用接口）
 * 关键：logistics-app 是子应用，不应该调用接口，只从存储读取
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

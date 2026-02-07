/**
 * 域名缓存工具
 * 用于在独立运行时缓存域名相关配置
 */

// 缓存键
const DOMAIN_CACHE_KEY = '@utils/domain-cache';

// 缓存接口
interface DomainCache {
  // 域名
  hostname: string;
  // 环境配置
  env: {
    // API 基础地址
    apiBaseUrl: string;
    // 是否为生产环境
    isProduction: boolean;
  };
  // 时间戳
  timestamp: number;
}

/**
 * 获取域名缓存
 */
export function getDomainCache(): DomainCache | null {
  try {
    const cache = localStorage.getItem(DOMAIN_CACHE_KEY);
    if (cache) {
      return JSON.parse(cache);
    }
  } catch {
    // 静默失败
  }
  return null;
}

/**
 * 设置域名缓存
 */
export function setDomainCache(cache: DomainCache): void {
  try {
    localStorage.setItem(DOMAIN_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // 静默失败
  }
}

/**
 * 清除域名缓存
 */
export function clearDomainCache(): void {
  try {
    localStorage.removeItem(DOMAIN_CACHE_KEY);
  } catch {
    // 静默失败
  }
}

/**
 * 初始化域名缓存
 */
export async function initDomainCache(): Promise<DomainCache> {
  const existingCache = getDomainCache();

  // 如果缓存存在且域名匹配，直接返回
  if (existingCache && existingCache.hostname === window.location.hostname) {
    return existingCache;
  }

  // 创建新的缓存
  const hostname = window.location.hostname;
  const isProduction = hostname.includes('bellis.com.cn');

  const newCache: DomainCache = {
    hostname,
    env: {
      apiBaseUrl: isProduction
        ? import.meta.env.VITE_API_BASE_URL_PROD
        : import.meta.env.VITE_API_BASE_URL || '',
      isProduction,
    },
    timestamp: Date.now(),
  };

  setDomainCache(newCache);
  return newCache;
}

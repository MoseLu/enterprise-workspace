/**
 * CDN 国际化配置加载器
 * 支持从 CDN 动态加载国际化配置，并提供缓存和降级机制
 */

import { deepMerge } from './locale-utils';

/**
 * CDN 国际化配置选项
 */
export interface CDNLocaleConfig {
  /** CDN 基础 URL */
  cdnBaseUrl?: string;
  /** 版本号（支持 'latest' 或具体版本号） */
  version?: string;
  /** 应用 ID */
  appId: string;
  /** CDN 加载失败时是否降级到本地配置 */
  fallbackToLocal?: boolean;
  /** 缓存有效期（毫秒），默认 24 小时 */
  cacheMaxAge?: number;
}

/**
 * 缓存项结构
 */
interface CacheItem {
  data: Record<string, any>;
  timestamp: number;
}

/**
 * 从 CDN 加载国际化配置
 * 
 * @param locale 语言代码（'zh-CN' 或 'en-US'）
 * @param config CDN 配置选项
 * @returns 返回加载的配置对象，失败时返回 null
 */
export async function loadLocaleFromCDN(
  locale: 'zh-CN' | 'en-US',
  config: CDNLocaleConfig
): Promise<Record<string, any> | null> {
  const {
    cdnBaseUrl = 'https://all.bellis.com.cn',
    version = 'latest',
    appId,
    fallbackToLocal = true,
    cacheMaxAge = 24 * 60 * 60 * 1000, // 24 小时
  } = config;

  // 只在浏览器环境中执行
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }

  // 开发环境：如果明确禁用了 CDN，直接返回 null
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_CDN_I18N === 'false') {
    return null;
  }

  const url = `${cdnBaseUrl}/locales/${appId}/${version}/${locale}.json`;
  const cacheKey = `i18n_${appId}_${locale}_${version}`;

  try {
    // 先检查缓存
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const cacheItem: CacheItem = JSON.parse(cached);
        // 检查缓存是否过期
        if (Date.now() - cacheItem.timestamp < cacheMaxAge) {
          return cacheItem.data;
        }
      } catch {
        // 缓存解析失败，继续从 CDN 加载
      }
    }

    // 尝试使用资源加载器（如果可用），它可以处理 CORS 和降级
    let response: Response;
    try {
      const resourceLoader = (window as any).__BTC_RESOURCE_LOADER__;
      if (resourceLoader && typeof resourceLoader.loadResource === 'function') {
        // 使用资源加载器加载（支持降级：CDN -> OSS -> 本地）
        response = await resourceLoader.loadResource(url, {
          timeout: 5000,
        });
      } else {
        // 回退到直接 fetch
        response = await fetch(url, {
          cache: import.meta.env.DEV ? 'no-cache' : 'default', // 开发环境不缓存
          headers: {
            'Accept': 'application/json',
          },
          // 添加 mode: 'cors' 明确请求 CORS（如果服务器支持）
          mode: 'cors',
        });
      }
    } catch (fetchError: any) {
      // 捕获 CORS 错误和其他网络错误
      if (fetchError?.name === 'TypeError' && fetchError?.message?.includes('Failed to fetch')) {
        // 这可能是 CORS 错误或网络错误
        throw new Error('CORS or network error');
      }
      throw fetchError;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // 验证数据格式
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON format');
    }

    // 保存到缓存
    try {
      const cacheItem: CacheItem = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      // localStorage 可能已满或不可用，忽略缓存错误
      console.warn(`[i18n] Failed to cache locale data:`, error);
    }

    return data;
  } catch (error: any) {
    // 检查是否是 CORS 错误
    const isCorsError = error?.message?.includes('CORS') || 
                       error?.message?.includes('Failed to fetch') ||
                       (error?.name === 'TypeError' && error?.message?.includes('fetch'));

    if (isCorsError) {
      console.warn(`[i18n] CORS error when loading locale from CDN (${url}). This is expected if CDN doesn't support CORS.`);
    } else {
      console.warn(`[i18n] Failed to load locale from CDN (${url}):`, error);
    }

    // 尝试使用过期的缓存（如果存在）
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const cacheItem: CacheItem = JSON.parse(cached);
        console.info(`[i18n] Using expired cache for ${appId}/${locale}`);
        return cacheItem.data;
      } catch {
        // 忽略缓存解析错误
      }
    }

    // 降级到本地配置
    if (fallbackToLocal) {
      if (isCorsError) {
        // CORS 错误时，静默降级（不输出额外日志，因为这是预期的）
        console.debug(`[i18n] CDN CORS not available, using local config for ${appId}/${locale}`);
      } else {
        console.info(`[i18n] Falling back to local config for ${appId}/${locale}`);
      }
      return null; // 返回 null，让调用方使用本地配置
    }

    throw error;
  }
}

/**
 * 混合加载：CDN + 本地配置
 * CDN 配置会覆盖本地配置中相同的键
 * 
 * @param locale 语言代码
 * @param config CDN 配置选项
 * @param localConfig 本地配置（作为默认值）
 * @returns 返回合并后的配置对象
 */
export async function loadHybridLocale(
  locale: 'zh-CN' | 'en-US',
  config: CDNLocaleConfig,
  localConfig: Record<string, any>
): Promise<Record<string, any>> {
  // 先尝试从 CDN 加载
  const cdnConfig = await loadLocaleFromCDN(locale, config);

  if (cdnConfig) {
    // CDN 配置覆盖本地配置
    return deepMerge(localConfig, cdnConfig);
  }

  // 降级到本地配置
  return localConfig;
}

/**
 * 清除指定应用的 CDN 缓存
 * 
 * @param appId 应用 ID
 * @param locale 语言代码（可选，不提供则清除所有语言）
 * @param version 版本号（可选，不提供则清除所有版本）
 */
export function clearCDNCache(
  appId: string,
  locale?: 'zh-CN' | 'en-US',
  version?: string
): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  const locales = locale ? [locale] : ['zh-CN', 'en-US'];
  const versions = version ? [version] : ['latest'];

  // 尝试清除所有可能的版本号（包括从环境变量读取的版本）
  if (!version) {
    versions.push(import.meta.env.VITE_APP_VERSION || '');
  }

  for (const loc of locales) {
    for (const ver of versions) {
      if (ver) {
        const cacheKey = `i18n_${appId}_${loc}_${ver}`;
        try {
          localStorage.removeItem(cacheKey);
        } catch {
          // 忽略错误
        }
      }
    }
  }
}

/**
 * 预加载所有语言的 CDN 配置
 * 
 * @param config CDN 配置选项
 * @param localConfigs 本地配置对象 { 'zh-CN': {...}, 'en-US': {...} }
 * @returns 返回预加载的配置对象
 */
export async function preloadCDNLocales(
  config: CDNLocaleConfig,
  localConfigs: { 'zh-CN': Record<string, any>; 'en-US': Record<string, any> }
): Promise<{ 'zh-CN': Record<string, any>; 'en-US': Record<string, any> }> {
  const [zhCN, enUS] = await Promise.all([
    loadHybridLocale('zh-CN', config, localConfigs['zh-CN']),
    loadHybridLocale('en-US', config, localConfigs['en-US']),
  ]);

  return {
    'zh-CN': zhCN,
    'en-US': enUS,
  };
}

import { logger } from '../../utils/logger/index';
;
/**
 * 资源加载器
 * 实现 CDN -> OSS -> 本地的三级降级策略
 * 支持当前应用资源 (/assets/) 和布局应用资源 (/assets/layout/)
 */

/**
 * 判断是否是开发环境或预览环境（本地环境）
 * 本地环境不应该使用 CDN，应该使用本地资源
 */
function isDevelopment(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // 检查配置中是否明确禁用了 CDN
  const config = (window as any).__BTC_CDN_CONFIG__;
  if (config?.enabled === false) {
    return true;
  }

  const hostname = window.location.hostname;
  const port = window.location.port;

  // 开发环境特征：
  // 1. localhost 或 127.0.0.1
  // 2. 内网 IP（10.x.x.x, 192.168.x.x, 172.16-31.x.x）
  // 3. 开发服务器端口（5173, 3000, 8080, 9000 等）
  // 4. 预览服务器端口（41xx 系列，如 4180, 4181, 4173 等）
  // 5. 包含 dev、test 等关键词的域名
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isInternalIP = /^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname);
  const isDevPort = Boolean(port && ['5173', '3000', '8080', '9000', '8081', '5174', '8088', '4188'].includes(port));
  // 预览环境端口：41xx 系列（4180, 4181, 4173 等）
  const isPreviewPort = Boolean(port && port.startsWith('41'));
  // 开发环境端口：80xx 系列（8080, 8081, 8088 等）
  const isDevPortRange = Boolean(port && port.startsWith('80'));
  const isDevDomain = hostname.includes('dev') || hostname.includes('test') || hostname.includes('local');
  
  // 关键：优先检查 import.meta.env.DEV（如果可用）
  // 注意：不能使用 typeof import，因为 import 是关键字，会导致 esbuild 解析错误
  // 直接访问 import.meta.env.DEV，如果不存在会抛出异常，我们捕获即可
  try {
    // 直接访问 import.meta（在模块上下文中可用）
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - import.meta 在运行时可能不可用
    if (import.meta && import.meta.env && (import.meta.env as any).DEV === true) {
      return true;
    }
  } catch (e) {
    // import.meta 不可用（非模块上下文），继续使用其他判断
  }

  return isLocalhost || isInternalIP || isDevPort || isDevPortRange || isPreviewPort || isDevDomain;
}

export interface ResourceLoaderOptions {
  /**
   * 应用名称，如 'admin-app'
   */
  appName: string;
  /**
   * 超时时间（毫秒），默认 5000ms
   */
  timeout?: number;
  /**
   * CDN 域名，默认从 window.__BTC_CDN_CONFIG__ 读取
   */
  cdnDomain?: string;
  /**
   * OSS 域名，默认从 window.__BTC_CDN_CONFIG__ 读取
   */
  ossDomain?: string;
}

interface ResourceSource {
  url: string;
  type: 'cdn' | 'oss' | 'local';
}

interface CacheEntry {
  source: ResourceSource;
  timestamp: number;
  failed: boolean;
}

/**
 * 资源加载器缓存
 * key: 原始 URL
 * value: 缓存条目
 */
const resourceCache = new Map<string, CacheEntry>();

/**
 * 缓存有效期（毫秒），默认 5 分钟
 */
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * 失败源标记有效期（毫秒），默认 1 分钟
 */
const FAILED_SOURCE_DURATION = 60 * 1000;

/**
 * 规范化 URL，提取路径部分（用于缓存键）
 * 如果 URL 是 CDN/OSS URL，会去掉应用名称前缀，只保留资源路径
 */
function normalizeResourceUrl(url: string): string {
  try {
    let pathname: string;

    // 如果是完整 URL，提取路径部分
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      pathname = urlObj.pathname;

      // 如果是 CDN/OSS URL，去掉应用名称前缀
      // 例如：/logistics-app/assets/xxx.js -> /assets/xxx.js
      // 例如：/layout-app/assets/layout/xxx.js -> /assets/layout/xxx.js
      const pathParts = pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2 && pathParts[1] === 'assets') {
        // 去掉第一个部分（应用名称），保留剩余部分
        pathname = '/' + pathParts.slice(1).join('/');
      }

      return pathname + urlObj.search + urlObj.hash;
    }

    // 如果是绝对路径，直接返回
    if (url.startsWith('/')) {
      return url;
    }

    // 相对路径，转换为绝对路径
    if (typeof window !== 'undefined') {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname + urlObj.search + urlObj.hash;
    }

    return url;
  } catch {
    // 解析失败，返回原 URL
    return url;
  }
}

/**
 * 识别资源类型和应用归属
 * 如果 URL 是 CDN/OSS URL，会从路径中提取应用名称
 */
function identifyResource(url: string, currentAppName: string): {
  appName: string;
  resourcePath: string;
  isLayoutResource: boolean;
} {
  // 规范化 URL，提取路径部分
  const normalizedPath = normalizeResourceUrl(url);

  // 如果 URL 是 CDN/OSS URL，尝试从路径中提取应用名称
  let resourceAppName = currentAppName;
  let resourcePath = normalizedPath;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);

      // 检查是否是 CDN/OSS URL 格式：/{appName}/assets/...
      if (pathParts.length >= 2 && pathParts[1] === 'assets') {
        const extractedAppName = pathParts[0];
        // 验证是否是有效的应用名称（以 -app 结尾）
        if (extractedAppName && (extractedAppName.endsWith('-app') || extractedAppName === 'layout-app')) {
          resourceAppName = extractedAppName;
          // 资源路径去掉应用名称前缀
          resourcePath = '/' + pathParts.slice(1).join('/');
        }
      }
    } catch {
      // URL 解析失败，使用默认值
    }
  }

  // 布局应用资源：/assets/layout/xxx.js
  if (resourcePath.includes('/assets/layout/')) {
    return {
      appName: 'layout-app',
      resourcePath: resourcePath,
      isLayoutResource: true,
    };
  }

  // 当前应用资源：/assets/xxx.js
  if (resourcePath.includes('/assets/')) {
    return {
      appName: resourceAppName,
      resourcePath: resourcePath,
      isLayoutResource: false,
    };
  }

  // 默认作为当前应用资源
  return {
    appName: resourceAppName,
    resourcePath: resourcePath,
    isLayoutResource: false,
  };
}

/**
 * 生成资源源 URL
 */
function generateSourceUrls(
  originalUrl: string,
  appName: string,
  isLayoutResource: boolean,
  cdnDomain: string,
  ossDomain: string,
): ResourceSource[] {
  const sources: ResourceSource[] = [];

  // 1. CDN 源
  if (isLayoutResource) {
    sources.push({
      url: `${cdnDomain}/layout-app${originalUrl}`,
      type: 'cdn',
    });
  } else {
    sources.push({
      url: `${cdnDomain}/${appName}${originalUrl}`,
      type: 'cdn',
    });
  }

  // 2. OSS 源
  if (isLayoutResource) {
    sources.push({
      url: `${ossDomain}/layout-app${originalUrl}`,
      type: 'oss',
    });
  } else {
    sources.push({
      url: `${ossDomain}/${appName}${originalUrl}`,
      type: 'oss',
    });
  }

  // 3. 本地源（原始 URL）
  sources.push({
    url: originalUrl,
    type: 'local',
  });

  return sources;
}

/**
 * 使用 fetch 加载资源，带超时控制
 * 注意：此函数仅用于加载静态资源（/assets/ 路径），不应用于 API 请求
 */
async function fetchWithTimeout(
  url: string,
  timeout: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      mode: 'cors',
      credentials: 'same-origin',
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * 检查响应是否成功
 */
function isSuccessfulResponse(response: Response): boolean {
  return response.ok && response.status >= 200 && response.status < 300;
}

/**
 * 加载资源（带降级策略）
 */
export async function loadResource(
  url: string,
  options: ResourceLoaderOptions,
): Promise<Response> {
  // 开发环境直接使用本地资源，不进行 CDN/OSS 降级
  if (isDevelopment()) {
    // 关键修复：如果 URL 是 CDN/OSS URL，转换为本地路径
    let localUrl = url;
    
    // 关键：在预览/开发环境中，如果是布局应用的资源（/assets/layout/），需要从 layout-app 服务器加载
    if (url.includes('/assets/layout/')) {
      const port = typeof window !== 'undefined' ? window.location.port || '' : '';
      const isPreview = port.startsWith('41');
      const isDev = port.startsWith('80');
      
      // 如果 URL 已经是完整 URL，检查是否是 layout-app 的 URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
          const urlObj = new URL(url);
          // 如果已经是 layout-app 的 URL，直接使用
          if (urlObj.hostname.includes('layout.bellis.com.cn') ||
              urlObj.hostname.includes('localhost:4192') ||
              urlObj.hostname.includes('localhost:4188')) {
            const response = await fetchWithTimeout(url, options.timeout || 5000);
            if (isSuccessfulResponse(response)) {
              return response;
            }
          }
        } catch (e) {
          // URL 解析失败，继续处理
        }
      }
      
      // 提取路径部分
      let path = url;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
          const urlObj = new URL(url);
          // 检查是否是 CDN/OSS URL，如果是则提取路径
          if (urlObj.hostname.includes('all.bellis.com.cn') || 
              urlObj.hostname.includes('bellis1.oss-cn-shenzhen.aliyuncs.com')) {
            path = urlObj.pathname;
            // 去掉应用前缀（如 /layout-app/assets/layout/xxx.js -> /assets/layout/xxx.js）
            if (path.includes('/assets/layout/')) {
              path = path.substring(path.indexOf('/assets/layout/'));
            }
          } else {
            path = urlObj.pathname + (urlObj.search || '') + (urlObj.hash || '');
          }
        } catch (e) {
          // URL 解析失败，使用原始 URL
        }
      }
      
      // 确保路径以 / 开头
      if (!path.startsWith('/')) {
        path = '/' + path;
      }
      
      // 构建 layout-app 的完整 URL
      let layoutAppBase: string;
      if (isPreview) {
        layoutAppBase = 'http://localhost:4192';
      } else if (isDev) {
        layoutAppBase = 'http://localhost:4188';
      } else {
        // 默认使用预览端口
        layoutAppBase = 'http://localhost:4192';
      }
      
      localUrl = layoutAppBase + path;
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      // 处理 CDN/OSS URL（非布局资源）
      try {
        const urlObj = new URL(url);
        // 检查是否是 CDN/OSS URL
        if (urlObj.hostname.includes('all.bellis.com.cn') || 
            urlObj.hostname.includes('bellis1.oss-cn-shenzhen.aliyuncs.com')) {
          // 提取路径部分，去掉应用前缀（如 /system-app/assets/xxx.js -> /assets/xxx.js）
          let path = urlObj.pathname;
          if (path.includes('/assets/')) {
            path = path.substring(path.indexOf('/assets/'));
          }
          // 保留查询参数和哈希
          localUrl = path + (urlObj.search || '') + (urlObj.hash || '');
        }
      } catch (e) {
        // URL 解析失败，使用原始 URL
      }
    }
    
    const response = await fetchWithTimeout(localUrl, options.timeout || 5000);
    if (isSuccessfulResponse(response)) {
      return response;
    }
    throw new Error(`Failed to load resource: ${localUrl}`);
  }

  const {
    appName,
    timeout = 5000,
    cdnDomain = (window as any).__BTC_CDN_CONFIG__?.cdnDomain || 'https://all.bellis.com.cn',
    ossDomain = (window as any).__BTC_CDN_CONFIG__?.ossDomain || 'https://bellis1.oss-cn-shenzhen.aliyuncs.com',
  } = options;

  // 检查 CDN 是否启用（如果未启用，直接使用本地资源）
  const config = (window as any).__BTC_CDN_CONFIG__;
  const cdnEnabled = config?.enabled !== false;

  // 规范化 URL，使用路径部分作为缓存键（避免同一资源因不同域名被重复加载）
  const normalizedUrl = normalizeResourceUrl(url);

  // 如果 CDN 未启用，直接使用本地资源（跳过 CDN/OSS 尝试）
  if (!cdnEnabled) {
    try {
      const response = await fetchWithTimeout(normalizedUrl, timeout);
      if (isSuccessfulResponse(response)) {
        return response;
      }
      throw new Error(`Failed to load resource: ${normalizedUrl} (${response.status})`);
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  // 检查缓存（使用规范化后的 URL）
  const cacheEntry = resourceCache.get(normalizedUrl);
  const now = Date.now();

  if (cacheEntry) {
    // 如果缓存未过期且源未失败，直接使用缓存的源
    if (now - cacheEntry.timestamp < CACHE_DURATION && !cacheEntry.failed) {
      try {
        const response = await fetchWithTimeout(cacheEntry.source.url, timeout);
        if (isSuccessfulResponse(response)) {
          return response;
        }
      } catch (error) {
        // 缓存源失败，继续降级
      }
    }

    // 如果缓存的源已失败且失败标记未过期，跳过该源
    if (cacheEntry.failed && now - cacheEntry.timestamp < FAILED_SOURCE_DURATION) {
      // 跳过失败的源，继续尝试其他源
    }
  }

  // 识别资源类型（使用规范化后的 URL）
  const { appName: resourceAppName, resourcePath, isLayoutResource } = identifyResource(normalizedUrl, appName);

  // 生成所有可能的源 URL（总是返回至少 3 个源：CDN、OSS、本地）
  const sources = generateSourceUrls(resourcePath, resourceAppName, isLayoutResource, cdnDomain, ossDomain);

  // 确保 sources 不为空（正常情况下不会为空，但为了类型安全）
  if (sources.length === 0) {
    throw new Error(`Failed to generate source URLs for resource: ${normalizedUrl}`);
  }

  // 如果有缓存，跳过已失败的源
  let sourcesToTry = sources;
  if (cacheEntry?.failed && cacheEntry.source) {
    sourcesToTry = sources.filter(
      (source) => source.type !== cacheEntry.source.type || source.url !== cacheEntry.source.url,
    );
  }

  // 按顺序尝试各个源
  let lastError: Error | null = null;

  for (const source of sourcesToTry) {
    try {
      const response = await fetchWithTimeout(source.url, timeout);

      if (isSuccessfulResponse(response)) {
        // 成功：更新缓存（使用规范化后的 URL 作为键）
        resourceCache.set(normalizedUrl, {
          source,
          timestamp: now,
          failed: false,
        });

        return response;
      } else {
        // 非成功响应（如 404），继续尝试下一个源
        lastError = new Error(`Failed to load resource: ${source.url} (${response.status})`);
      }
    } catch (error) {
      // 网络错误或超时，继续尝试下一个源
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  // 所有源都失败：更新缓存标记为失败（使用规范化后的 URL 作为键）
  // generateSourceUrls 总是返回至少 3 个源，所以 sources[0] 一定存在
  if (sources.length > 0) {
    resourceCache.set(normalizedUrl, {
      source: sources[0]!, // 标记第一个源为失败（使用非空断言，因为 generateSourceUrls 总是返回非空数组）
      timestamp: now,
      failed: true,
    });
  }

  // 抛出最后一个错误
  throw lastError || new Error(`Failed to load resource: ${normalizedUrl}`);
}

/**
 * 获取资源加载器配置
 */
export function getResourceLoaderConfig() {
  return {
    cacheSize: resourceCache.size,
    cacheEntries: Array.from(resourceCache.entries()).map(([url, entry]) => ({
      url,
      source: entry.source,
      timestamp: entry.timestamp,
      failed: entry.failed,
    })),
  };
}

/**
 * 清除资源加载器缓存
 */
export function clearResourceLoaderCache() {
  resourceCache.clear();
}

/**
 * 为图片元素设置降级策略
 */
export function setupImageFallback(img: HTMLImageElement, originalSrc: string, options: ResourceLoaderOptions) {
  if (!img || typeof window === 'undefined') {
    return;
  }

  // 识别资源类型
  const { appName: resourceAppName, resourcePath, isLayoutResource } = identifyResource(originalSrc, options.appName);
  const cdnDomain = options.cdnDomain || (window as any).__BTC_CDN_CONFIG__?.cdnDomain || 'https://all.bellis.com.cn';
  const ossDomain = options.ossDomain || (window as any).__BTC_CDN_CONFIG__?.ossDomain || 'https://bellis1.oss-cn-shenzhen.aliyuncs.com';

  // 生成源 URL
  const sources = generateSourceUrls(resourcePath, resourceAppName, isLayoutResource, cdnDomain, ossDomain);

  // 设置图片源，按顺序尝试
  let currentSourceIndex = 0;

  const tryNextSource = () => {
    if (currentSourceIndex >= sources.length) {
      // 所有源都失败，触发 onerror
      img.onerror = null; // 清除自定义错误处理，触发原生错误
      return;
    }

    const source = sources[currentSourceIndex];
    if (!source) {
      // 源不存在（理论上不会发生，因为 generateSourceUrls 总是返回非空数组）
      currentSourceIndex++;
      tryNextSource();
      return;
    }

    img.src = source.url;
    currentSourceIndex++;
  };

  // 设置错误处理
  img.onerror = () => {
    tryNextSource();
  };

  // 开始尝试第一个源
  tryNextSource();
}

/**
 * 为 CSS 中的 url() 资源设置降级策略
 * 注意：这个方法需要在构建时或运行时通过 CSS 变量或内联样式实现
 * 这里提供一个工具函数，供应用代码使用
 */
export function getCssUrlFallback(originalUrl: string, options: ResourceLoaderOptions): string {
  // 识别资源类型
  const { appName: resourceAppName, resourcePath, isLayoutResource } = identifyResource(originalUrl, options.appName);
  const cdnDomain = options.cdnDomain || (typeof window !== 'undefined' ? (window as any).__BTC_CDN_CONFIG__?.cdnDomain : 'https://all.bellis.com.cn') || 'https://all.bellis.com.cn';
  const ossDomain = options.ossDomain || (typeof window !== 'undefined' ? (window as any).__BTC_CDN_CONFIG__?.ossDomain : 'https://bellis1.oss-cn-shenzhen.aliyuncs.com') || 'https://bellis1.oss-cn-shenzhen.aliyuncs.com';

  // 生成源 URL
  const sources = generateSourceUrls(resourcePath, resourceAppName, isLayoutResource, cdnDomain, ossDomain);

  // 返回 CSS url() 列表，浏览器会自动尝试
  return sources.map(source => `url("${source.url}")`).join(', ');
}

/**
 * 拦截动态创建的 script 标签，自动转换为 CDN URL
 */
function setupScriptInterceptor() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const originalCreateElement = document.createElement.bind(document);
  const isDev = isDevelopment();

  document.createElement = function(tagName: string, options?: ElementCreationOptions) {
    const element = originalCreateElement(tagName, options);

    if (tagName.toLowerCase() === 'script') {
      const script = element as HTMLScriptElement;

      // 拦截 src 属性的设置
      let originalSrc: string | null = null;

      Object.defineProperty(script, 'src', {
        get() {
          return originalSrc || script.getAttribute('src') || '';
        },
        set(value: string) {
          originalSrc = value;

          // 开发环境：如果 URL 是 CDN/OSS URL，转换为本地路径
          if (isDev) {
            if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
              try {
                const urlObj = new URL(value);
                // 检查是否是 CDN/OSS URL
                if (urlObj.hostname.includes('all.bellis.com.cn') || 
                    urlObj.hostname.includes('bellis1.oss-cn-shenzhen.aliyuncs.com')) {
                  // 提取路径部分，去掉应用前缀（如 /system-app/assets/xxx.js -> /assets/xxx.js）
                  let path = urlObj.pathname;
                  if (path.includes('/assets/layout/')) {
                    // 布局应用资源：需要从 layout-app 服务器加载
                    path = path.substring(path.indexOf('/assets/layout/'));
                    const port = typeof window !== 'undefined' ? window.location.port || '' : '';
                    const isPreview = port.startsWith('41');
                    const layoutAppBase = isPreview ? 'http://localhost:4192' : 'http://localhost:4188';
                    const localPath = layoutAppBase + path + (urlObj.search || '') + (urlObj.hash || '');
                    script.setAttribute('src', localPath);
                    return;
                  } else if (path.includes('/assets/')) {
                    path = path.substring(path.indexOf('/assets/'));
                  }
                  // 保留查询参数和哈希
                  const localPath = path + (urlObj.search || '') + (urlObj.hash || '');
                  script.setAttribute('src', localPath);
                  return;
                }
              } catch (e) {
                // URL 解析失败，使用原始值
              }
            }
            
            // 处理本地路径中的布局应用资源
            if (value && value.includes('/assets/layout/') && !value.startsWith('http://') && !value.startsWith('https://')) {
              const port = typeof window !== 'undefined' ? window.location.port || '' : '';
              const isPreview = port.startsWith('41');
              const layoutAppBase = isPreview ? 'http://localhost:4192' : 'http://localhost:4188';
              const localPath = layoutAppBase + (value.startsWith('/') ? value : '/' + value);
              script.setAttribute('src', localPath);
              return;
            }
            
            // 非 CDN URL，直接设置
            script.setAttribute('src', value);
            return;
          }

          // 生产环境：原有的 CDN 加速逻辑
          // 检查是否是静态资源路径
          if (value && (value.includes('/assets/') || value.includes('/assets/layout/'))) {
            // 规范化 URL 用于去重检查
            const normalizedPath = normalizeResourceUrl(value);

            // 检查是否已经加载过（使用规范化后的路径检查）
            const existingScripts = document.querySelectorAll('script[src]');
            for (const existingScript of existingScripts) {
              const src = existingScript.getAttribute('src');
              if (src && normalizeResourceUrl(src) === normalizedPath) {
                // 如果已经加载，直接触发 load 事件并返回
                if (script.onload) {
                  script.onload(new Event('load') as any);
                }
                script.dispatchEvent(new Event('load'));
                return;
              }
            }

            const config = (window as any).__BTC_CDN_CONFIG__;
            const resourceLoader = (window as any).__BTC_RESOURCE_LOADER__;

            if (config?.enabled && resourceLoader) {
              const appName = config.appName;
              if (!appName) {
                console.warn('[resource-loader] 未找到应用名称配置，跳过 CDN 加速');
                script.setAttribute('src', value);
                return;
              }

              // 检查是否是模块脚本
              const scriptType = script.getAttribute('type') || '';
              const isModuleScript = scriptType === 'module';

              if (isModuleScript) {
                // 关键：对于模块脚本，必须使用 src 属性而不是 textContent
                // 因为 ES 模块的相对路径解析基于模块的 URL，而不是页面 URL
                // 如果使用 textContent，模块没有明确的 URL，相对路径会被错误解析为基于当前页面 URL

                // 规范化 URL，提取路径部分
                const path = normalizeResourceUrl(value);

                // 生成 CDN URL（浏览器会自动通过资源加载器降级，因为脚本拦截器会拦截）
                const cdnDomain = config.cdnDomain || 'https://all.bellis.com.cn';
                let cdnUrl = value;
                if (path.includes('/assets/layout/')) {
                  cdnUrl = `${cdnDomain}/layout-app${path}`;
                } else if (path.includes('/assets/')) {
                  cdnUrl = `${cdnDomain}/${appName}${path}`;
                }

                // 直接设置 src 属性，让浏览器加载（脚本拦截器会处理降级）
                script.setAttribute('src', cdnUrl);
              } else {
                // 非模块脚本：使用资源加载器加载内容
                loadResource(value, { appName })
                  .then(response => response.text())
                  .then(code => {
                    script.textContent = code;
                    if (script.onload) {
                      script.onload(new Event('load') as any);
                    }
                    script.dispatchEvent(new Event('load'));
                  })
                  .catch(error => {
                    logger.error(`[resource-loader] 加载脚本失败: ${value}`, error);
                    if (script.onerror) {
                      script.onerror(new ErrorEvent('error', { error }) as any);
                    }
                    script.dispatchEvent(new ErrorEvent('error', { error }));
                  });
              }

              return; // 不设置 src，使用 textContent 或 CDN URL
            }
          }

          // 非静态资源或 CDN 未启用，使用原来的方式
          script.setAttribute('src', value);
        },
        configurable: true,
      });
    }

    return element;
  };
}

/**
 * 拦截 link 标签（样式表）的错误，自动回退到本地路径
 * 关键：监听 link 标签的 onerror 事件，如果 CDN 加载失败，回退到本地路径
 */
function setupStylesheetInterceptor() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const isDev = isDevelopment();

  // 开发环境：拦截所有 link 标签，将 CDN URL 转换为本地路径
  if (isDev) {
    const handleLinkInsert = (link: HTMLLinkElement) => {
      const href = link.href || link.getAttribute('href');
      if (!href) {
        return;
      }

      // 检查是否是 CDN/OSS URL
      if (href.startsWith('http://') || href.startsWith('https://')) {
        try {
          const urlObj = new URL(href);
          if (urlObj.hostname.includes('all.bellis.com.cn') || 
              urlObj.hostname.includes('bellis1.oss-cn-shenzhen.aliyuncs.com')) {
            // 提取路径部分，去掉应用前缀
            let path = urlObj.pathname;
            if (path.includes('/assets/layout/')) {
              // 布局应用资源：需要从 layout-app 服务器加载
              path = path.substring(path.indexOf('/assets/layout/'));
              const port = typeof window !== 'undefined' ? window.location.port || '' : '';
              const isPreview = port.startsWith('41');
              const layoutAppBase = isPreview ? 'http://localhost:4192' : 'http://localhost:4188';
              const localPath = layoutAppBase + path + (urlObj.search || '') + (urlObj.hash || '');
              link.href = localPath;
              return;
            } else if (path.includes('/assets/')) {
              path = path.substring(path.indexOf('/assets/'));
            }
            // 保留查询参数和哈希
            const localPath = path + (urlObj.search || '') + (urlObj.hash || '');
            link.href = localPath;
          }
        } catch (e) {
          // URL 解析失败，忽略
        }
      }
      
      // 处理本地路径中的布局应用资源
      if (href.includes('/assets/layout/') && !href.startsWith('http://') && !href.startsWith('https://')) {
        const port = typeof window !== 'undefined' ? window.location.port || '' : '';
        const isPreview = port.startsWith('41');
        const layoutAppBase = isPreview ? 'http://localhost:4192' : 'http://localhost:4188';
        const localPath = layoutAppBase + (href.startsWith('/') ? href : '/' + href);
        link.href = localPath;
      }
    };

    // 处理现有的 link 标签
    document.querySelectorAll('link[rel="stylesheet"]').forEach(handleLinkInsert);

    // 监听新添加的 link 标签
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.tagName.toLowerCase() === 'link') {
              const link = element as HTMLLinkElement;
              if (link.rel === 'stylesheet' || link.getAttribute('rel') === 'stylesheet') {
                handleLinkInsert(link);
              }
            }
          }
        });
      });
    });

    observer.observe(document.head || document.documentElement, {
      childList: true,
      subtree: true,
    });

    return;
  }

  // 生产环境：原有的错误回退逻辑

  // 监听所有 link 标签的错误事件
  const handleLinkError = (event: Event) => {
    const link = event.target as HTMLLinkElement;
    if (!link || link.tagName.toLowerCase() !== 'link') {
      return;
    }

    const href = link.href || link.getAttribute('href');
    if (!href) {
      return;
    }

    // 检查是否是静态资源路径
    if (!href.includes('/assets/') && !href.includes('/assets/layout/')) {
      return;
    }

    // 检查是否是 CDN URL
    if (!href.includes('all.bellis.com.cn') && !href.includes('bellis1.oss-cn-shenzhen.aliyuncs.com')) {
      return;
    }

    // 提取本地路径
    let localPath = href;
    if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
      try {
        const url = new URL(localPath);
        let path = url.pathname;
        // 去掉应用前缀（如 /logistics-app/assets/xxx.css -> /assets/xxx.css）
        if (path.includes('/assets/')) {
          path = path.substring(path.indexOf('/assets/'));
        } else if (path.includes('/assets/layout/')) {
          path = path.substring(path.indexOf('/assets/layout/'));
        }
        localPath = path;

        // 保留查询参数
        if (url.search) {
          localPath += url.search;
        }
      } catch (e) {
        // URL 解析失败，使用原始值
        return;
      }
    }

    // 回退到本地路径
    console.warn(`[resource-loader] CSS 加载失败，回退到本地: ${href} -> ${localPath}`);
    link.href = localPath;
  };

  // 为现有的 link 标签添加错误监听
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    link.addEventListener('error', handleLinkError);
  });

  // 监听新添加的 link 标签
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          if (element.tagName.toLowerCase() === 'link') {
            const link = element as HTMLLinkElement;
            if (link.rel === 'stylesheet' || link.getAttribute('rel') === 'stylesheet') {
              link.addEventListener('error', handleLinkError);
            }
          }
        }
      });
    });
  });

  observer.observe(document.head || document.documentElement, {
    childList: true,
    subtree: true,
  });
}

/**
 * 初始化资源加载器（在浏览器环境中）
 * 注意：资源加载器只负责降级（CDN -> OSS -> 本地），不负责 URL 转换
 * URL 转换在构建时完成（通过 cdnAssetsPlugin 和 renderChunk 插件）
 */
export function initResourceLoader(_options?: Partial<ResourceLoaderOptions>) {
  if (typeof window === 'undefined') {
    return;
  }

  // 开发/预览环境：需要拦截器将 CDN URL 转换为本地路径
  // 因为预览环境使用构建产物，可能包含硬编码的 CDN URL
  if (isDevelopment()) {
    // 挂载资源加载器到全局对象
    (window as any).__BTC_RESOURCE_LOADER__ = {
      loadResource,
      getConfig: getResourceLoaderConfig,
      clearCache: clearResourceLoaderCache,
      setupImageFallback,
      getCssUrlFallback,
    };
    
    // 关键：在开发/预览环境中也启用拦截器，用于将 CDN URL 转换为本地路径
    // 因为预览环境使用构建产物，可能包含硬编码的 CDN URL
    setupScriptInterceptor();
    setupStylesheetInterceptor();
    
    // 关键：立即处理所有已存在的 script 和 link 标签，在它们被浏览器请求之前就修改 URL
    // 这必须在拦截器设置后立即执行，确保 HTML 中已存在的标签也被处理
    const processExistingScripts = () => {
      document.querySelectorAll('script[src]').forEach((script) => {
        const htmlScript = script as HTMLScriptElement;
        const src = htmlScript.src || htmlScript.getAttribute('src');
        if (!src) return;
        
        // 处理 CDN/OSS URL
        if (src.startsWith('http://') || src.startsWith('https://')) {
          try {
            const urlObj = new URL(src);
            if (urlObj.hostname.includes('all.bellis.com.cn') || 
                urlObj.hostname.includes('bellis1.oss-cn-shenzhen.aliyuncs.com')) {
              // 提取路径部分，去掉应用前缀
              let path = urlObj.pathname;
              if (path.includes('/assets/layout/')) {
                // 布局应用资源：需要从 layout-app 服务器加载
                path = path.substring(path.indexOf('/assets/layout/'));
                const port = typeof window !== 'undefined' ? window.location.port || '' : '';
                const isPreview = port.startsWith('41');
                const layoutAppBase = isPreview ? 'http://localhost:4192' : 'http://localhost:4188';
                const localPath = layoutAppBase + path + (urlObj.search || '') + (urlObj.hash || '');
                if (htmlScript.src === src || htmlScript.getAttribute('src') === src) {
                  htmlScript.src = localPath;
                  htmlScript.setAttribute('src', localPath);
                }
                return;
              } else if (path.includes('/assets/')) {
                path = path.substring(path.indexOf('/assets/'));
              }
              // 保留查询参数和哈希
              const localPath = path + (urlObj.search || '') + (urlObj.hash || '');
              if (htmlScript.src === src || htmlScript.getAttribute('src') === src) {
                htmlScript.src = localPath;
                htmlScript.setAttribute('src', localPath);
              }
            }
          } catch (e) {
            // URL 解析失败，忽略
          }
        } else if (src.includes('/assets/layout/')) {
          // 处理本地路径中的布局应用资源
          const port = typeof window !== 'undefined' ? window.location.port || '' : '';
          const isPreview = port.startsWith('41');
          const layoutAppBase = isPreview ? 'http://localhost:4192' : 'http://localhost:4188';
          const localPath = layoutAppBase + (src.startsWith('/') ? src : '/' + src);
          if (htmlScript.src === src || htmlScript.getAttribute('src') === src) {
            htmlScript.src = localPath;
            htmlScript.setAttribute('src', localPath);
          }
        }
      });
    };
    
    const processExistingLinks = () => {
      document.querySelectorAll('link[rel="stylesheet"], link[href]').forEach((link) => {
        const htmlLink = link as HTMLLinkElement;
        const href = htmlLink.href || htmlLink.getAttribute('href');
        if (!href) return;
        
        // 处理 CDN/OSS URL
        if (href.startsWith('http://') || href.startsWith('https://')) {
          try {
            const urlObj = new URL(href);
            if (urlObj.hostname.includes('all.bellis.com.cn') || 
                urlObj.hostname.includes('bellis1.oss-cn-shenzhen.aliyuncs.com')) {
              // 提取路径部分，去掉应用前缀
              let path = urlObj.pathname;
              if (path.includes('/assets/layout/')) {
                // 布局应用资源：需要从 layout-app 服务器加载
                path = path.substring(path.indexOf('/assets/layout/'));
                const port = typeof window !== 'undefined' ? window.location.port || '' : '';
                const isPreview = port.startsWith('41');
                const layoutAppBase = isPreview ? 'http://localhost:4192' : 'http://localhost:4188';
                const localPath = layoutAppBase + path + (urlObj.search || '') + (urlObj.hash || '');
                htmlLink.href = localPath;
                htmlLink.setAttribute('href', localPath);
                return;
              } else if (path.includes('/assets/')) {
                path = path.substring(path.indexOf('/assets/'));
              }
              // 保留查询参数和哈希
              const localPath = path + (urlObj.search || '') + (urlObj.hash || '');
              htmlLink.href = localPath;
              htmlLink.setAttribute('href', localPath);
            }
          } catch (e) {
            // URL 解析失败，忽略
          }
        } else if (href.includes('/assets/layout/')) {
          // 处理本地路径中的布局应用资源
          const port = typeof window !== 'undefined' ? window.location.port || '' : '';
          const isPreview = port.startsWith('41');
          const layoutAppBase = isPreview ? 'http://localhost:4192' : 'http://localhost:4188';
          const localPath = layoutAppBase + (href.startsWith('/') ? href : '/' + href);
          htmlLink.href = localPath;
          htmlLink.setAttribute('href', localPath);
        }
      });
    };
    
    // 立即处理已存在的标签
    if (document.readyState === 'loading') {
      // 如果文档还在加载，等待 DOMContentLoaded
      document.addEventListener('DOMContentLoaded', () => {
        processExistingScripts();
        processExistingLinks();
      });
    } else {
      // 如果文档已经加载，立即处理
      processExistingScripts();
      processExistingLinks();
    }
    
    return;
  }

  // 将资源加载器挂载到全局对象
  (window as any).__BTC_RESOURCE_LOADER__ = {
    loadResource,
    getConfig: getResourceLoaderConfig,
    clearCache: clearResourceLoaderCache,
    setupImageFallback,
    getCssUrlFallback,
  };

  // 设置脚本拦截器（拦截动态创建的 script 标签，应用降级策略）
  setupScriptInterceptor();

  // 设置样式表拦截器（拦截动态创建的 link 标签，应用降级策略）
  setupStylesheetInterceptor();

  // 拦截图片加载，自动应用降级策略
  // 注意：这需要在 DOM 加载后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupImageElementsFallback();
    });
  } else {
    setupImageElementsFallback();
  }

}

/**
 * 从 URL 推断应用名称（备用方案）
 */
function inferAppNameFromUrl(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  // 从子域名推断
  if (hostname.includes('admin.')) {
    return 'admin-app';
  } else if (hostname.includes('system.')) {
    return 'system-app';
  } else if (hostname.includes('layout.')) {
    return 'layout-app';
  } else if (hostname.includes('logistics.')) {
    return 'logistics-app';
  } else if (hostname.includes('finance.')) {
    return 'finance-app';
  } else if (hostname.includes('engineering.')) {
    return 'engineering-app';
  } else if (hostname.includes('quality.')) {
    return 'quality-app';
  } else if (hostname.includes('production.')) {
    return 'production-app';
  } else if (hostname.includes('operations.')) {
    return 'operations-app';
  } else if (hostname.includes('dashboard.')) {
    return 'dashboard-app';
  } else if (hostname.includes('personnel.')) {
    return 'personnel-app';
  }

  // 从路径推断（开发环境）
  if (pathname.startsWith('/admin')) {
    return 'admin-app';
  } else if (pathname.startsWith('/logistics')) {
    return 'logistics-app';
  } else if (pathname.startsWith('/finance')) {
    return 'finance-app';
  } else if (pathname.startsWith('/engineering')) {
    return 'engineering-app';
  } else if (pathname.startsWith('/quality')) {
    return 'quality-app';
  } else if (pathname.startsWith('/production')) {
    return 'production-app';
  } else if (pathname.startsWith('/operations')) {
    return 'operations-app';
  } else if (pathname.startsWith('/dashboard')) {
    return 'dashboard-app';
  } else if (pathname.startsWith('/personnel')) {
    return 'personnel-app';
  }

  return null;
}

/**
 * 为页面中所有图片元素设置降级策略
 */
function setupImageElementsFallback() {
  if (typeof window === 'undefined') {
    return;
  }

  // 开发环境不需要降级策略
  if (isDevelopment()) {
    return;
  }

  const images = document.querySelectorAll('img[src^="/assets/"], img[src^="./assets/"]');
  if (images.length === 0) {
    return; // 没有图片，直接返回
  }

  const config = (window as any).__BTC_CDN_CONFIG__;
  let appName = config?.appName;

  // 如果配置中没有应用名称，尝试从 URL 推断
  if (!appName) {
    appName = inferAppNameFromUrl();
    if (!appName) {
      // 如果仍然无法推断，静默跳过（不显示警告，因为可能只是暂时没有配置）
      return;
    }
  }

  images.forEach((img) => {
    const htmlImg = img as HTMLImageElement;
    const originalSrc = htmlImg.src || htmlImg.getAttribute('src') || '';
    if (originalSrc) {
      setupImageFallback(htmlImg, originalSrc, {
        appName,
        cdnDomain: config?.cdnDomain,
        ossDomain: config?.ossDomain,
      });
    }
  });
}

/**
 * Qiankun 资源拦截器 Composable
 * 用于修复从错误端口加载的资源文件
 */
;

import { microApps } from '../apps';
import { getAppConfig } from '@btc/shared-core/configs/app-env.config';

// 获取主应用配置（用于判断当前是否在主应用预览端口）
const MAIN_APP_CONFIG = getAppConfig('main-app');
const MAIN_APP_PREVIEW_PORT = MAIN_APP_CONFIG?.prePort || '4180';

// 创建 entry 映射，用于在拦截器中查找应用的入口地址
// 注意：这个映射需要在 setupQiankun 外部定义，以便拦截器可以访问
// 使用懒加载模式，避免构建时的循环依赖问题
let globalEntryMap: Map<string, string> | null = null;

/**
 * 获取或初始化全局 entry 映射
 * 延迟初始化，避免构建时的循环依赖问题
 */
export function getGlobalEntryMap(): Map<string, string> {
  if (!globalEntryMap) {
    globalEntryMap = new Map<string, string>();
    // 延迟访问 microApps，确保在运行时才执行
    const apps = microApps;
    apps.forEach(app => {
      globalEntryMap!.set(app.name, app.entry);
    });
  }
  return globalEntryMap;
}

/**
 * 根据路径获取应用名称
 */
function getAppNameFromPath(path: string): string | null {
  if (path.startsWith('/admin')) {
    return 'admin';
  } else if (path.startsWith('/logistics')) {
    return 'logistics';
  } else if (path.startsWith('/engineering')) {
    return 'engineering';
  } else if (path.startsWith('/quality')) {
    return 'quality';
  } else if (path.startsWith('/production')) {
    return 'production';
  } else if (path.startsWith('/finance')) {
    return 'finance';
  }
  return null;
}

/**
 * 修复资源 URL
 */
function fixResourceUrl(
  url: string,
  targetAppName: string,
  targetPort: string,
  currentHost: string,
  protocol: string,
  currentPort: string
): string | null {
  let needsFix = false;
  let fixedUrl = url;

  // 情况1：URL 包含错误的端口（主应用预览端口）- 这是最常见的情况
  const portRegex = new RegExp(`:${currentPort}(?=/|$|\\s)`, 'g');
  const mainPortRegex = new RegExp(`:${MAIN_APP_PREVIEW_PORT}(?=/|$|\\s)`, 'g');
  if (portRegex.test(url) || mainPortRegex.test(url)) {
    fixedUrl = url.replace(portRegex, `:${targetPort}`).replace(mainPortRegex, `:${targetPort}`);
    needsFix = true;
  }
  // 情况2：相对路径的资源文件（以 / 开头）
  else if (url.startsWith('/') && !url.startsWith('//')) {
    fixedUrl = `${protocol}//${currentHost}:${targetPort}${url}`;
    needsFix = true;
  }
  // 情况3：协议相对路径（//host/），但没有端口或端口错误
  else if (url.startsWith('//')) {
    const hostMatch = url.match(/^\/\/([^:/]+)(?::(\d+))?/);
    if (hostMatch) {
      const urlHost = hostMatch[1];
      const urlPort = hostMatch[2];
      if ((urlHost === currentHost || urlHost === 'localhost') && (!urlPort || urlPort === MAIN_APP_PREVIEW_PORT)) {
        fixedUrl = url.replace(/^\/\/[^/]+/, `//${currentHost}:${targetPort}`);
        needsFix = true;
      }
    }
  }
  // 情况4：相对路径但包含 /assets/（可能以 ./ 或 ../ 开头）
  else if (url.includes('/assets/') && !url.includes('://') && !url.startsWith('/') && !url.startsWith('data:') && !url.startsWith('blob:')) {
    fixedUrl = `${protocol}//${currentHost}:${targetPort}/${url.replace(/^\.\/?/, '')}`;
    needsFix = true;
  }

  return needsFix && fixedUrl !== url ? fixedUrl : null;
}

/**
 * 初始化全局资源拦截器
 * 必须在页面加载时尽早设置，确保能拦截所有资源请求
 */
export function setupGlobalResourceInterceptor(): void {
  // 确保 globalEntryMap 已初始化
  getGlobalEntryMap();

  // 全局拦截 fetch 请求，修复从错误端口加载的资源
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let url: string;
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.href;
    } else {
      url = input.url;
    }

    // 关键：API 请求（包含 /api/ 路径）直接放行
    if (url.includes('/api/') || url.endsWith('/api') || url.match(/\/api(\?|$|#)/)) {
      return originalFetch.call(this, input as any, init);
    }

    // 判断是否是资源文件
    const isAssetFile = url.includes('/assets/') || url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.mjs');
    const currentPort = window.location.port;

    // 如果当前在主应用预览端口且是资源文件，检查是否需要修复
    if (currentPort === MAIN_APP_PREVIEW_PORT && isAssetFile) {
      const currentPath = window.location.pathname;
      const targetAppName = getAppNameFromPath(currentPath);

      if (targetAppName) {
        const appEntry = getGlobalEntryMap().get(targetAppName);
        if (appEntry && !appEntry.startsWith('/')) {
          const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
          if (entryMatch) {
            const targetPort = entryMatch[4] || '';
            if (targetPort && targetPort !== MAIN_APP_PREVIEW_PORT) {
              const currentHost = window.location.hostname;
              const protocol = window.location.protocol;
              const fixedUrl = fixResourceUrl(url, targetAppName, targetPort, currentHost, protocol, currentPort);

              if (fixedUrl) {
                console.info(`[Resource Interceptor] 修复资源路径: ${url} -> ${fixedUrl}`);
                if (typeof input === 'string') {
                  return originalFetch.call(this, fixedUrl, init);
                } else if (input instanceof URL) {
                  return originalFetch.call(this, new URL(fixedUrl), init);
                } else {
                  return originalFetch.call(this, new Request(fixedUrl, input), init);
                }
              }
            }
          }
        }
      }
    }

    // 默认行为：先执行原始请求
    return originalFetch.call(this, input as any, init).then(async (response) => {
      // 如果响应是 HTML（说明可能是 404 页面），且请求的是 JavaScript 文件，尝试修复并重试
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html') && isAssetFile && url.includes('/assets/')) {
        const currentPath = window.location.pathname;
        const targetAppName = getAppNameFromPath(currentPath);

        if (targetAppName && currentPort === MAIN_APP_PREVIEW_PORT) {
          try {
            const entryMap = getGlobalEntryMap();
            const appEntry = entryMap.get(targetAppName);
            if (appEntry && !appEntry.startsWith('/')) {
              const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
              if (entryMatch) {
                const targetPort = entryMatch[4] || '';
                if (targetPort && targetPort !== MAIN_APP_PREVIEW_PORT) {
                  const currentHost = window.location.hostname;
                  const protocol = window.location.protocol;
                  const fileName = url.split('/').pop() || '';
                  const fixedUrl = `${protocol}//${currentHost}:${targetPort}/assets/${fileName}`;

                  console.info(`[Resource Interceptor] 检测到 404，尝试修复路径: ${url} -> ${fixedUrl}`);
                  const retryResponse = await originalFetch.call(this, fixedUrl, init);
                  const retryContentType = retryResponse.headers.get('content-type');

                  if (retryContentType && (
                    retryContentType.includes('application/javascript') ||
                    retryContentType.includes('text/javascript') ||
                    retryContentType.includes('application/x-javascript')
                  )) {
                    return retryResponse;
                  }
                }
              }
            }
          } catch (error) {
            console.error('[资源拦截器] 重试失败:', error);
          }
        }
      }

      return response;
    });
  };

  // 同时拦截 XMLHttpRequest（qiankun 可能使用它）
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
    let urlStr = typeof url === 'string' ? url : url.href;

    // 强制验证：在 HTTPS 页面下，绝对不允许 HTTP URL
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      if (urlStr.startsWith('http://')) {
        console.error('[HTTP] Micro 拦截：检测到 HTTPS 页面，阻止 HTTP 请求:', urlStr);
        try {
          const urlObj = new URL(urlStr);
          urlStr = urlObj.pathname + urlObj.search;
        } catch (e) {
          urlStr = urlStr.replace(/^https?:\/\/[^/]+/, '');
        }
      }
    }

    // 检查是否是资源请求且从错误的端口加载
    if ((urlStr.includes('/assets/') || urlStr.endsWith('.js') || urlStr.endsWith('.css')) && urlStr.includes(`:${window.location.port}`) && window.location.port === MAIN_APP_PREVIEW_PORT) {
      const currentPath = window.location.pathname;
      const targetAppName = getAppNameFromPath(currentPath);

      if (targetAppName) {
        const appEntry = getGlobalEntryMap().get(targetAppName);
        if (appEntry && !appEntry.startsWith('/')) {
          const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
          if (entryMatch) {
            const port = entryMatch[4] || '';
            if (port && port !== MAIN_APP_PREVIEW_PORT) {
              urlStr = urlStr.replace(`:${window.location.port}`, `:${port}`);
            }
          }
        }
      }
    }

    return originalXHROpen.call(this, method, urlStr, async ?? true, username ?? null, password ?? null);
  };
}

/**
 * 设置资源拦截器（模块级别，立即执行）
 * 关键：在模块级别尽早设置全局资源拦截器
 * 这确保拦截器在页面加载时就能拦截所有资源请求，包括动态 import
 */
export function setupResourceInterceptor(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // 标记拦截器已设置，防止被覆盖
  if ((window as any).__btc_resource_interceptor_set__) {
    return;
  }
  (window as any).__btc_resource_interceptor_set__ = true;

  // 立即设置拦截器
  setupGlobalResourceInterceptor();
}


/**
 * Qiankun Fetch 处理 Composable
 * 用于处理 qiankun 的 fetch 请求，修复资源路径
 */

import { getAppBySubdomain, getAppByPathPrefix } from '@btc/shared-core/configs/app-scanner';
;
import { getAppConfig } from '@btc/shared-core/configs/app-env.config';
import { getGlobalEntryMap } from './useResourceInterceptor';

// 获取主应用配置
const MAIN_APP_CONFIG = getAppConfig('main-app');
const MAIN_APP_PREVIEW_PORT = MAIN_APP_CONFIG?.prePort || '4180';

/**
 * 创建 fetch 处理器
 */
export function createFetchHandler(entryMap: Map<string, string>) {
  return async (url: string, options?: RequestInit, ..._args: any[]): Promise<Response> => {
    // 在发送请求前，先检查 URL 是否需要修复
    const currentPath = window.location.pathname;
    let targetAppName: string | null = null;

    const hostname = window.location.hostname;
    const appBySubdomain = getAppBySubdomain(hostname);
    if (appBySubdomain) {
      targetAppName = appBySubdomain.id;
    } else {
      const pathPrefix = currentPath.split('/')[1] ? `/${currentPath.split('/')[1]}` : '/';
      const appByPath = getAppByPathPrefix(pathPrefix);
      if (appByPath) {
        targetAppName = appByPath.id;
      }
    }

    // 如果当前在子应用路径下，且请求的 URL 包含错误的端口（主应用预览端口），需要修复
    if (targetAppName && window.location.port === MAIN_APP_PREVIEW_PORT) {
      const appEntry = entryMap.get(targetAppName);
      if (appEntry && !appEntry.startsWith('/')) {
        const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
        if (entryMatch) {
          const port = entryMatch[4] || '';
          const currentHost = window.location.hostname;
          const protocol = window.location.protocol;
          const currentPort = window.location.port;
          const isAssetFile = url.includes('/assets/') || url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.mjs');

          if (!url.includes('/api/')) {
            let needsFix = false;
            let fixedUrl = url;

            if (isAssetFile && url.includes(`:${currentPort}`)) {
              fixedUrl = url.replace(new RegExp(`:${currentPort}(?=/|$)`, 'g'), port ? `:${port}` : '');
              needsFix = true;
            } else if (isAssetFile && url.startsWith('/')) {
              fixedUrl = `${protocol}//${currentHost}:${port}${url}`;
              needsFix = true;
            } else if (isAssetFile && url.startsWith(`//${currentHost}/`) && !url.includes(':')) {
              fixedUrl = `${protocol}//${currentHost}:${port}${url.slice(`//${currentHost}`.length)}`;
              needsFix = true;
            }

            if (needsFix && fixedUrl !== url) {
              url = fixedUrl;
            }
          }
        }
      }
    }

    // 执行请求（可能已经修复了 URL）
    const timeout = import.meta.env.DEV ? 10000 : 8000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError' && !options?.signal?.aborted) {
        console.warn(`[qiankun] 资源加载超时，尝试重试: ${url}`);
        const retryController = new AbortController();
        const retryTimeoutId = setTimeout(() => retryController.abort(), timeout);
        try {
          response = await fetch(url, {
            ...options,
            signal: retryController.signal,
          });
          clearTimeout(retryTimeoutId);
        } catch (retryError: any) {
          clearTimeout(retryTimeoutId);
          console.error(`[qiankun] 资源加载重试失败: ${url}`, retryError);
          throw retryError;
        }
      } else {
        throw error;
      }
    }

    // 如果是 HTML 请求，需要修复其中的资源路径
    const contentType = response.headers.get('content-type');

    // 如果请求的是 JavaScript 文件，但返回的是 HTML（404 页面），说明路径错误
    if (targetAppName && contentType && contentType.includes('text/html') &&
        (url.endsWith('.js') || url.endsWith('.mjs') || url.includes('/assets/'))) {
      const appEntry = entryMap.get(targetAppName);
      if (appEntry && !appEntry.startsWith('/')) {
        const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
        if (entryMatch) {
          const port = entryMatch[4] || '';
          const currentHost = window.location.hostname;
          const protocol = window.location.protocol;
          const currentPort = window.location.port;

          if (port && port !== currentPort) {
            let fixedUrl = url;
            if (url.includes(`:${currentPort}`)) {
              fixedUrl = url.replace(new RegExp(`:${currentPort}(?=/|$)`, 'g'), `:${port}`);
            } else if (url.startsWith('/')) {
              fixedUrl = `${protocol}//${currentHost}:${port}${url}`;
            } else if (!url.includes('://') && !url.includes('/')) {
              fixedUrl = `${protocol}//${currentHost}:${port}/assets/${url}`;
            }

            if (fixedUrl !== url) {
              const retryResponse = await fetch(fixedUrl, options);
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
      }
    }

    // 如果请求的是 JavaScript 文件（.js），但返回的是 HTML，说明路径错误
    if (contentType && contentType.includes('text/html') && url.endsWith('.js')) {
      if (targetAppName) {
        const appEntry = entryMap.get(targetAppName);
        if (appEntry && !appEntry.startsWith('/')) {
          const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
          if (entryMatch) {
            const port = entryMatch[4] || '';
            const currentHost = window.location.hostname;
            const protocol = window.location.protocol;
            const fileName = url.split('/').pop() || '';
            const fixedUrl = `${protocol}//${currentHost}:${port}/assets/${fileName}`;
            const retryResponse = await fetch(fixedUrl, options);
            const retryContentType = retryResponse.headers.get('content-type');
            if (retryContentType && retryContentType.includes('application/javascript')) {
              return retryResponse;
            }
          }
        }
      }
    }

    // 如果是 HTML 响应，修复其中的资源路径
    if (contentType && contentType.includes('text/html')) {
      const clonedResponse = response.clone();
      const html = await clonedResponse.text();
      let fixedHtml = html;

      // 从 URL 推断应用的入口地址
      let matchedAppEntry: string | null = null;
      let matchedAppName: string | null = null;

      for (const [appName, appEntry] of entryMap.entries()) {
        if (appEntry && !appEntry.startsWith('/')) {
          const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
          if (entryMatch) {
            const entryHost = entryMatch[2];
            const entryPort = entryMatch[4] || '';
            const urlMatch = url.match(/^(https?:\/\/|\/\/)([^:]+)(:(\d+))?/);
            if (urlMatch) {
              const urlHost = urlMatch[2];
              const urlPort = urlMatch[4] || '';
              if (urlHost === entryHost && urlPort === entryPort) {
                matchedAppEntry = appEntry;
                matchedAppName = appName;
                break;
              }
            }
          }
        }
      }

      // 如果找到了匹配的应用，修复 HTML 中的资源路径
      if (matchedAppEntry && matchedAppName) {
        const entryMatch = matchedAppEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
        if (entryMatch) {
          const protocol = window.location.protocol;
          const host = entryMatch[2];
          const port = entryMatch[4] || '';
          const baseUrl = `${protocol}//${host}${port ? `:${port}` : ''}`;

          // 修复 script src
          fixedHtml = fixedHtml.replace(
            /<script([^>]*?)\s+src\s*=\s*["']([^"']+)["']([^>]*)>/gi,
            (match, before, src, after) => {
              if (src.startsWith('/')) {
                return `<script${before} src="${baseUrl}${src}"${after}>`;
              }
              if ((src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//'))
                  && window.location.port === MAIN_APP_PREVIEW_PORT && src.includes(`:${window.location.port}`)) {
                const fixedUrl = src.replace(`:${window.location.port}`, `:${port}`);
                return `<script${before} src="${fixedUrl}"${after}>`;
              }
              return match;
            }
          );

          // 修复 link href
          fixedHtml = fixedHtml.replace(
            /<link([^>]*?)\s+href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
            (match, before, href, after) => {
              if (href.startsWith('/')) {
                return `<link${before} href="${baseUrl}${href}"${after}>`;
              }
              if ((href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'))
                  && window.location.port === MAIN_APP_PREVIEW_PORT && href.includes(`:${window.location.port}`)) {
                const fixedUrl = href.replace(new RegExp(`:${window.location.port}(?=/|$)`, 'g'), `:${port}`);
                return `<link${before} href="${fixedUrl}"${after}>`;
              }
              return match;
            }
          );

          // 添加 base 标签
          fixedHtml = fixedHtml.replace(/<base[^>]*>/gi, '');
          if (fixedHtml.includes('<head')) {
            fixedHtml = fixedHtml.replace(/(<head[^>]*>)/i, `$1<base href="${baseUrl}/">`);
          } else {
            fixedHtml = fixedHtml.replace(/(<html[^>]*>)/i, `$1<base href="${baseUrl}/">`);
          }
        }
      }

      return new Response(fixedHtml, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    // 如果是资源文件请求且包含错误的端口，修复它
    const isAssetFile = url.includes('/assets/') || url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.mjs');
    if (isAssetFile && window.location.port === MAIN_APP_PREVIEW_PORT) {
      const currentPath = window.location.pathname;
      let targetAppName: string | null = null;

      if (currentPath.startsWith('/admin')) {
        targetAppName = 'admin';
      } else if (currentPath.startsWith('/logistics')) {
        targetAppName = 'logistics';
      } else if (currentPath.startsWith('/engineering')) {
        targetAppName = 'engineering';
      } else if (currentPath.startsWith('/quality')) {
        targetAppName = 'quality';
      } else if (currentPath.startsWith('/production')) {
        targetAppName = 'production';
      } else if (currentPath.startsWith('/finance')) {
        targetAppName = 'finance';
      }

      if (targetAppName) {
        const appEntry = entryMap.get(targetAppName);
        if (appEntry && !appEntry.startsWith('/')) {
          const entryMatch = appEntry.match(/^(\/\/)([^:]+)(:(\d+))?/);
          if (entryMatch) {
            const port = entryMatch[4] || '';
            const protocol = window.location.protocol;
            const host = window.location.hostname;

            if (port && port !== MAIN_APP_PREVIEW_PORT) {
              let fixedUrl = url;
              if (url.includes(`:${window.location.port}`)) {
                fixedUrl = url.replace(new RegExp(`:${window.location.port}(?=/|$)`, 'g'), `:${port}`);
              } else if (url.startsWith('/')) {
                fixedUrl = `${protocol}//${host}:${port}${url}`;
              } else if (url.startsWith(`${protocol}//${host}:`) || url.startsWith(`//${host}:`)) {
                fixedUrl = url.replace(new RegExp(`:${window.location.port}(?=/|$)`, 'g'), `:${port}`);
              } else if (url.startsWith('//')) {
                const urlHostMatch = url.match(/^\/\/([^:]+)(:(\d+))?(.+)$/);
                if (urlHostMatch && urlHostMatch[1] === host) {
                  fixedUrl = `${protocol}//${host}:${port}${urlHostMatch[4] || ''}`;
                }
              }

              if (fixedUrl !== url) {
                return fetch(fixedUrl, options);
              }
            }
          }
        }
      }
    }

    return response;
  };
}


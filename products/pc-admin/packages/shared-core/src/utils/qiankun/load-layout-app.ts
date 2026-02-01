;
/**
 * 加载 layout-app 的共享工具函数
 *
 * 使用说明：
 * 1. 在应用的 package.json 中添加 qiankun 依赖：`"qiankun": "^2.10.16"`
 * 2. 在 index.html 中先导入 qiankun，然后调用此函数
 *
 * @example
 * ```html
 * <script type="module">
 *   import { registerMicroApps, start } from 'qiankun';
 *   import { loadLayoutApp } from '@btc/shared-utils/qiankun/load-layout-app';
 *   loadLayoutApp({ registerMicroApps, start });
 * </script>
 * ```
 */

/**
 * 获取 layout-app 入口地址
 */
function getLayoutEntry(): string {
  if (typeof window === 'undefined') {
    return 'https://layout.bellis.com.cn/';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port || '';

  // 生产环境：使用子域名
  if (hostname.includes('bellis.com.cn')) {
    return `${protocol}//layout.bellis.com.cn/`;
  }

  // 开发/预览环境：根据当前端口判断环境类型
  // 预览端口通常是 41xx，开发端口通常是 80xx
  const isPreview = port.startsWith('41');
  const isDev = port.startsWith('80');

  if (isPreview) {
    // 预览环境：使用 layout-app 的预览端口 4192
    return 'http://localhost:4192/';
  } else if (isDev) {
    // 开发环境：使用 layout-app 的开发端口 4188
    return 'http://localhost:4188/';
  } else {
    // 默认使用预览端口（预览模式通常使用构建产物）
    return 'http://localhost:4192/';
  }
}

/**
 * 加载 layout-app
 * @param qiankunAPI - qiankun 的 API 对象，包含 registerMicroApps 和 start 方法
 * @returns Promise，在 layout-app 挂载完成后 resolve
 */
export function loadLayoutApp(_qiankunAPI: { registerMicroApps: any; start: any }): Promise<void> {
  // const { registerMicroApps, start } = qiankunAPI; // 未使用

  // 获取当前环境

  // 布局微应用入口
  // 关键：根据环境类型使用正确的端口
  const layoutEntry = getLayoutEntry();

  // 关键：layout-app 应该直接挂载到 #app，而不是通过 qiankun
  // 先获取 layout-app 的 HTML，然后从中提取入口文件路径，再直接加载入口文件

  // 创建 Promise，等待 layout-app 挂载完成
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<void>(async (resolve, reject) => {
    let layoutAppMounted = false;

    // 提前声明 setupDynamicImportFallback，以便在获取 manifest.json 后立即调用
    let setupDynamicImportFallback: (() => void) | undefined = undefined;
    let mountTimeout: ReturnType<typeof setTimeout> | null = null;
    let checkInterval: ReturnType<typeof setInterval> | null = null;
    // 缓存 manifest.json 内容，用于运行时兜底
    let cachedManifest: Record<string, { file: string; src?: string; isEntry?: boolean; imports?: string[] }> | null = null;

    // 清理函数（定义在 Promise 回调中，可以访问所有变量）
    const cleanup = () => {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
      if (mountTimeout) {
        clearTimeout(mountTimeout);
        mountTimeout = null;
      }
    };

    // 清理可能残留的 DOM 元素（如果加载失败）
    const cleanupDom = () => {
      // 清理可能添加的 script 标签
      const scripts = document.querySelectorAll('script[src*="layout.bellis.com.cn"], script[src*="localhost:4188"]');
      scripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
      // 清理可能添加的 base 标签（仅清理我们添加的）
      const base = document.querySelector('base[data-layout-app-base]');
      if (base && base.parentNode) {
        base.parentNode.removeChild(base);
      }
      // 清理 #app 容器中可能残留的 layout-app 内容
      const appContainer = document.querySelector('#app');
      if (appContainer) {
        // 只清理 layout-app 相关的内容，保留其他内容
        const layoutElements = appContainer.querySelectorAll('[data-layout-app]');
        layoutElements.forEach(el => el.remove());
      }
    };

    // 设置标志，告诉 layout-app 它应该挂载到 #app
    (window as any).__LAYOUT_APP_MOUNT_TARGET__ = '#app';
    // 关键：设置 __IS_LAYOUT_APP__ 标志，让 AppLayout 知道这是 layout-app 自己运行
    // 这样 AppLayout 就会显示 sidebar 和 topbar（而不是隐藏它们）
    (window as any).__IS_LAYOUT_APP__ = true;
    // 关键：设置 __USE_LAYOUT_APP__ 标志，让子应用知道正在使用 layout-app
    // 这样子应用就不会渲染自己的 AppLayout，而是直接渲染页面内容
    (window as any).__USE_LAYOUT_APP__ = true;

    // 从 HTML 中获取所有 script 标签（包括 vendor、echarts-vendor 等依赖）
    // 这样可以确保所有依赖的 chunk 都在入口文件之前加载完成，避免模块初始化顺序问题
    const entryUrl = new URL(layoutEntry);
    const htmlUrl = `${entryUrl.origin}/index.html`;

    const fetchTimeout = 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), fetchTimeout);

    let scriptUrls: string[] = [];

    try {
      const htmlResponse = await fetch(htmlUrl, {
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!htmlResponse.ok) {
        throw new Error(`获取 layout-app HTML 失败: HTTP ${htmlResponse.status} ${htmlResponse.statusText}`);
      }

      const htmlText = await htmlResponse.text();

      // 使用 DOM 解析器提取所有 script 标签（更可靠）
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const allScripts = Array.from(doc.querySelectorAll('script'));
      const scriptsWithSrc = Array.from(doc.querySelectorAll('script[src]'));

      // 同时提取 modulepreload 标签中的资源（这些是预加载的依赖）
      const modulepreloadLinks = Array.from(doc.querySelectorAll('link[rel="modulepreload"][href]'));

      // 从 script 标签提取
      const scriptUrlSet = new Set<string>();

      // 1. 从有 src 属性的 script 标签提取
      scriptsWithSrc.forEach((script) => {
        const src = script.getAttribute('src');
        if (!src) {
          return;
        }

        // 移除版本号查询参数
        let cleanSrc = src.replace(/[?&]v=[^&'"]*/g, '');

        // 转换为绝对路径
        if (cleanSrc.startsWith('http://') || cleanSrc.startsWith('https://')) {
          // 已经是完整 URL，检查路径是否正确
          const urlObj = new URL(cleanSrc);
          const pathname = urlObj.pathname;
          // 如果路径是 /assets/xxx 但不是 /assets/layout/xxx，需要修复
          if (pathname.startsWith('/assets/') && !pathname.startsWith('/assets/layout/')) {
            const newPathname = pathname.replace('/assets/', '/assets/layout/');
            cleanSrc = `${urlObj.origin}${newPathname}${urlObj.search}${urlObj.hash}`;
          } else if (pathname.startsWith('/assets/layout/assets/layout/')) {
            // 检测到重复的路径，修复它
            const newPathname = pathname.replace('/assets/layout/assets/layout/', '/assets/layout/');
            cleanSrc = `${urlObj.origin}${newPathname}${urlObj.search}${urlObj.hash}`;
          }
        } else if (cleanSrc.startsWith('/')) {
          // 绝对路径，检查路径是否正确
          if (cleanSrc.startsWith('/assets/') && !cleanSrc.startsWith('/assets/layout/')) {
            // 将 /assets/xxx.js 转换为 /assets/layout/xxx.js
            cleanSrc = cleanSrc.replace('/assets/', '/assets/layout/');
          } else if (cleanSrc.startsWith('/assets/layout/assets/layout/')) {
            // 检测到重复的路径，修复它
            cleanSrc = cleanSrc.replace('/assets/layout/assets/layout/', '/assets/layout/');
          }
          cleanSrc = `${entryUrl.origin}${cleanSrc}`;
        } else {
          // 相对路径，检查路径是否正确
          if (cleanSrc.startsWith('assets/') && !cleanSrc.startsWith('assets/layout/')) {
            // 将 assets/xxx.js 转换为 assets/layout/xxx.js
            cleanSrc = cleanSrc.replace(/^assets\//, 'assets/layout/');
          } else if (cleanSrc.includes('assets/layout/assets/layout/')) {
            // 检测到重复的路径，修复它
            cleanSrc = cleanSrc.replace(/assets\/layout\/assets\/layout\//g, 'assets/layout/');
          }
          cleanSrc = `${entryUrl.origin}/${cleanSrc}`;
        }

        scriptUrlSet.add(cleanSrc);
      });

      // 2. 从 script 标签内容中提取 import() 语句（Vite 生成的 HTML 使用这种方式）
      allScripts.forEach((script) => {
        const scriptContent = script.textContent || script.innerHTML;
        if (!scriptContent) return;

        // 匹配 import('path') 或 import("path")
        const importMatches = scriptContent.matchAll(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
        for (const match of importMatches) {
          const importPath = match[1];
          if (!importPath || (!importPath.endsWith('.js') && !importPath.endsWith('.mjs'))) {
            continue;
          }

          // 移除版本号查询参数
          let cleanPath = importPath.replace(/[?&]v=[^&'"]*/g, '');

          // 转换为绝对路径
          if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
            // 已经是完整 URL，检查路径是否正确
            const urlObj = new URL(cleanPath);
            const pathname = urlObj.pathname;
            // 如果路径是 /assets/xxx 但不是 /assets/layout/xxx，需要修复
            if (pathname.startsWith('/assets/') && !pathname.startsWith('/assets/layout/')) {
              const newPathname = pathname.replace('/assets/', '/assets/layout/');
              cleanPath = `${urlObj.origin}${newPathname}${urlObj.search}${urlObj.hash}`;
            } else if (pathname.startsWith('/assets/layout/assets/layout/')) {
              // 检测到重复的路径，修复它
              const newPathname = pathname.replace('/assets/layout/assets/layout/', '/assets/layout/');
              cleanPath = `${urlObj.origin}${newPathname}${urlObj.search}${urlObj.hash}`;
            }
          } else if (cleanPath.startsWith('/')) {
            // 绝对路径，检查路径是否正确
            if (cleanPath.startsWith('/assets/') && !cleanPath.startsWith('/assets/layout/')) {
              // 将 /assets/xxx.js 转换为 /assets/layout/xxx.js
              cleanPath = cleanPath.replace('/assets/', '/assets/layout/');
            } else if (cleanPath.startsWith('/assets/layout/assets/layout/')) {
              // 检测到重复的路径，修复它
              cleanPath = cleanPath.replace('/assets/layout/assets/layout/', '/assets/layout/');
            }
            cleanPath = `${entryUrl.origin}${cleanPath}`;
          } else {
            // 相对路径，检查路径是否正确
            if (cleanPath.startsWith('assets/') && !cleanPath.startsWith('assets/layout/')) {
              // 将 assets/xxx.js 转换为 assets/layout/xxx.js
              cleanPath = cleanPath.replace(/^assets\//, 'assets/layout/');
            } else if (cleanPath.includes('assets/layout/assets/layout/')) {
              // 检测到重复的路径，修复它
              cleanPath = cleanPath.replace(/assets\/layout\/assets\/layout\//g, 'assets/layout/');
            }
            cleanPath = `${entryUrl.origin}/${cleanPath}`;
          }

          scriptUrlSet.add(cleanPath);
        }
      });

      // 3. 从 modulepreload 标签提取（这些通常是依赖 chunk）
      modulepreloadLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) {
          return;
        }

        // 只处理 JS 文件
        if (!href.endsWith('.js') && !href.endsWith('.mjs')) {
          return;
        }

        // 移除版本号查询参数
        let cleanHref = href.replace(/[?&]v=[^&'"]*/g, '');

        // 转换为绝对路径
        if (cleanHref.startsWith('http://') || cleanHref.startsWith('https://')) {
          // 已经是完整 URL，检查路径是否正确
          const urlObj = new URL(cleanHref);
          const pathname = urlObj.pathname;
          // 如果路径是 /assets/xxx 但不是 /assets/layout/xxx，需要修复
          if (pathname.startsWith('/assets/') && !pathname.startsWith('/assets/layout/')) {
            const newPathname = pathname.replace('/assets/', '/assets/layout/');
            cleanHref = `${urlObj.origin}${newPathname}${urlObj.search}${urlObj.hash}`;
          } else if (pathname.startsWith('/assets/layout/assets/layout/')) {
            // 检测到重复的路径，修复它
            const newPathname = pathname.replace('/assets/layout/assets/layout/', '/assets/layout/');
            cleanHref = `${urlObj.origin}${newPathname}${urlObj.search}${urlObj.hash}`;
          }
        } else if (cleanHref.startsWith('/')) {
          // 绝对路径，检查路径是否正确
          if (cleanHref.startsWith('/assets/') && !cleanHref.startsWith('/assets/layout/')) {
            // 将 /assets/xxx.js 转换为 /assets/layout/xxx.js
            cleanHref = cleanHref.replace('/assets/', '/assets/layout/');
          } else if (cleanHref.startsWith('/assets/layout/assets/layout/')) {
            // 检测到重复的路径，修复它
            cleanHref = cleanHref.replace('/assets/layout/assets/layout/', '/assets/layout/');
          }
          cleanHref = `${entryUrl.origin}${cleanHref}`;
        } else {
          // 相对路径，检查路径是否正确
          if (cleanHref.startsWith('assets/') && !cleanHref.startsWith('assets/layout/')) {
            // 将 assets/xxx.js 转换为 assets/layout/xxx.js
            cleanHref = cleanHref.replace(/^assets\//, 'assets/layout/');
          } else if (cleanHref.includes('assets/layout/assets/layout/')) {
            // 检测到重复的路径，修复它
            cleanHref = cleanHref.replace(/assets\/layout\/assets\/layout\//g, 'assets/layout/');
          }
          cleanHref = `${entryUrl.origin}/${cleanHref}`;
        }

        scriptUrlSet.add(cleanHref);
      });

      scriptUrls = Array.from(scriptUrlSet);

      // 如果 DOM 解析失败或没有找到任何脚本，尝试正则表达式作为回退
      if (scriptUrls.length === 0) {

        // 1. 尝试匹配 script 标签中的 import() 语句
        const importPattern = /import\s*\(\s*['"]([^'"]+\.(js|mjs)[^'"]*)['"]\s*\)/gi;
        const importMatches = Array.from(htmlText.matchAll(importPattern));
        const importUrls = importMatches.map(match => {
          let path = match[1];
          if (!path) return null;
          path = path.replace(/[?&]v=[^&'"]*/g, '');

          // 转换为绝对路径并修复路径
          if (path.startsWith('http://') || path.startsWith('https://')) {
            // 已经是完整 URL，检查路径是否正确
            const urlObj = new URL(path);
            const pathname = urlObj.pathname;
            // 如果路径是 /assets/xxx 但不是 /assets/layout/xxx，需要修复
            if (pathname.startsWith('/assets/') && !pathname.startsWith('/assets/layout/')) {
              const newPathname = pathname.replace('/assets/', '/assets/layout/');
              path = `${urlObj.origin}${newPathname}${urlObj.search}${urlObj.hash}`;
            } else if (pathname.startsWith('/assets/layout/assets/layout/')) {
              // 检测到重复的路径，修复它
              const newPathname = pathname.replace('/assets/layout/assets/layout/', '/assets/layout/');
              path = `${urlObj.origin}${newPathname}${urlObj.search}${urlObj.hash}`;
            }
          } else if (path.startsWith('/')) {
            // 绝对路径，检查路径是否正确
            if (path.startsWith('/assets/') && !path.startsWith('/assets/layout/')) {
              // 将 /assets/xxx.js 转换为 /assets/layout/xxx.js
              path = path.replace('/assets/', '/assets/layout/');
            } else if (path.startsWith('/assets/layout/assets/layout/')) {
              // 检测到重复的路径，修复它
              path = path.replace('/assets/layout/assets/layout/', '/assets/layout/');
            }
            path = `${entryUrl.origin}${path}`;
          } else {
            // 相对路径，检查路径是否正确
            if (path.startsWith('assets/') && !path.startsWith('assets/layout/')) {
              // 将 assets/xxx.js 转换为 assets/layout/xxx.js
              path = path.replace(/^assets\//, 'assets/layout/');
            } else if (path.includes('assets/layout/assets/layout/')) {
              // 检测到重复的路径，修复它
              path = path.replace(/assets\/layout\/assets\/layout\//g, 'assets/layout/');
            }
            path = `${entryUrl.origin}/${path}`;
          }
          return path;
        }).filter((url): url is string => url !== null);

        scriptUrls = [...importUrls];

        // 2. 如果仍然失败，尝试匹配 script[src]
        if (scriptUrls.length === 0) {
          const scriptRegex = /<script[^>]+src=["']([^"']+\.(js|mjs)[^"']*)["'][^>]*>/gi;
          const scriptMatches = Array.from(htmlText.matchAll(scriptRegex));
          scriptUrls = scriptMatches.map(match => {
            let src = match[1];
            if (!src) return null;
            src = src.replace(/[?&]v=[^&'"]*/g, '');

            // 转换为绝对路径并修复路径
            if (src.startsWith('http://') || src.startsWith('https://')) {
              // 已经是完整 URL，检查路径是否正确
              const urlObj = new URL(src);
              const pathname = urlObj.pathname;
              // 如果路径是 /assets/xxx 但不是 /assets/layout/xxx，需要修复
              if (pathname.startsWith('/assets/') && !pathname.startsWith('/assets/layout/')) {
                const newPathname = pathname.replace('/assets/', '/assets/layout/');
                src = `${urlObj.origin}${newPathname}${urlObj.search}${urlObj.hash}`;
              } else if (pathname.startsWith('/assets/layout/assets/layout/')) {
                // 检测到重复的路径，修复它
                const newPathname = pathname.replace('/assets/layout/assets/layout/', '/assets/layout/');
                src = `${urlObj.origin}${newPathname}${urlObj.search}${urlObj.hash}`;
              }
            } else if (src.startsWith('/')) {
              // 绝对路径，检查路径是否正确
              if (src.startsWith('/assets/') && !src.startsWith('/assets/layout/')) {
                // 将 /assets/xxx.js 转换为 /assets/layout/xxx.js
                src = src.replace('/assets/', '/assets/layout/');
              } else if (src.startsWith('/assets/layout/assets/layout/')) {
                // 检测到重复的路径，修复它
                src = src.replace('/assets/layout/assets/layout/', '/assets/layout/');
              }
              src = `${entryUrl.origin}${src}`;
            } else {
              // 相对路径，检查路径是否正确
              if (src.startsWith('assets/') && !src.startsWith('assets/layout/')) {
                // 将 assets/xxx.js 转换为 assets/layout/xxx.js
                src = src.replace(/^assets\//, 'assets/layout/');
              } else if (src.includes('assets/layout/assets/layout/')) {
                // 检测到重复的路径，修复它
                src = src.replace(/assets\/layout\/assets\/layout\//g, 'assets/layout/');
              }
              src = `${entryUrl.origin}/${src}`;
            }
            return src;
          }).filter((url): url is string => url !== null);
        }

        // 3. 也尝试匹配 modulepreload
        const modulepreloadRegex = /<link[^>]+rel=["']modulepreload["'][^>]+href=["']([^"']+\.(js|mjs)[^"']*)["'][^>]*>/gi;
        const preloadMatches = Array.from(htmlText.matchAll(modulepreloadRegex));
        const preloadUrls = preloadMatches.map(match => {
          let href = match[1];
          if (!href) return null;
          href = href.replace(/[?&]v=[^&'"]*/g, '');

          // 转换为绝对路径并修复路径
          if (href.startsWith('http://') || href.startsWith('https://')) {
            // 已经是完整 URL，检查路径是否正确
            const urlObj = new URL(href);
            const pathname = urlObj.pathname;
            // 如果路径是 /assets/xxx 但不是 /assets/layout/xxx，需要修复
            if (pathname.startsWith('/assets/') && !pathname.startsWith('/assets/layout/')) {
              const newPathname = pathname.replace('/assets/', '/assets/layout/');
              href = `${urlObj.origin}${newPathname}${urlObj.search}${urlObj.hash}`;
            } else if (pathname.startsWith('/assets/layout/assets/layout/')) {
              // 检测到重复的路径，修复它
              const newPathname = pathname.replace('/assets/layout/assets/layout/', '/assets/layout/');
              href = `${urlObj.origin}${newPathname}${urlObj.search}${urlObj.hash}`;
            }
          } else if (href.startsWith('/')) {
            // 绝对路径，检查路径是否正确
            if (href.startsWith('/assets/') && !href.startsWith('/assets/layout/')) {
              // 将 /assets/xxx.js 转换为 /assets/layout/xxx.js
              href = href.replace('/assets/', '/assets/layout/');
            } else if (href.startsWith('/assets/layout/assets/layout/')) {
              // 检测到重复的路径，修复它
              href = href.replace('/assets/layout/assets/layout/', '/assets/layout/');
            }
            href = `${entryUrl.origin}${href}`;
          } else {
            // 相对路径，检查路径是否正确
            if (href.startsWith('assets/') && !href.startsWith('assets/layout/')) {
              // 将 assets/xxx.js 转换为 assets/layout/xxx.js
              href = href.replace(/^assets\//, 'assets/layout/');
            } else if (href.includes('assets/layout/assets/layout/')) {
              // 检测到重复的路径，修复它
              href = href.replace(/assets\/layout\/assets\/layout\//g, 'assets/layout/');
            }
            href = `${entryUrl.origin}/${href}`;
          }
          return href;
        }).filter((url): url is string => url !== null);

        scriptUrls = [...scriptUrls, ...preloadUrls];
        // 去重
        scriptUrls = Array.from(new Set(scriptUrls));
      }


      // 如果从 HTML 解析成功，立即获取 manifest.json 以：
      // 1. 补充 imports 依赖
      // 2. 缓存 manifest 以便设置运行时兜底机制
      // 3. 添加缓存版本控制，避免使用旧的 manifest
      if (scriptUrls.length > 0) {
        try {
          // 添加时间戳参数避免缓存旧版本
          const manifestUrl = `${entryUrl.origin}/manifest.json?t=${Date.now()}`;
          const manifestResponse = await fetch(manifestUrl, {
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-store', // 禁用缓存，确保获取最新版本
          });
          if (manifestResponse.ok) {
            cachedManifest = await manifestResponse.json();
            if (cachedManifest) {
              // 关键：在获取 manifest.json 后立即设置运行时兜底机制
              // 这样可以在脚本加载和执行时拦截并修复旧的动态导入引用
              if (typeof setupDynamicImportFallback === 'function') {
                (setupDynamicImportFallback as () => void)();
              }

              // 从 manifest 中提取 imports 依赖
              const importUrls = new Set<string>();
              for (const entry of Object.values(cachedManifest)) {
                if (entry.imports && Array.isArray(entry.imports)) {
                  for (const importKey of entry.imports) {
                    const importEntry = cachedManifest[importKey];
                    if (importEntry && importEntry.file) {
                    let importUrl = importEntry.file;
                    // 检查是否有重复的路径
                    if (importUrl.includes('/assets/layout/assets/layout/')) {
                      importUrl = importUrl.replace(/\/assets\/layout\/assets\/layout\//g, '/assets/layout/');
                    } else if (importUrl.includes('assets/layout/assets/layout/')) {
                      importUrl = importUrl.replace(/assets\/layout\/assets\/layout\//g, 'assets/layout/');
                    }
                    if (importUrl.startsWith('/')) {
                      importUrl = `${entryUrl.origin}${importUrl}`;
                    } else if (!importUrl.startsWith('http://') && !importUrl.startsWith('https://')) {
                      importUrl = `${entryUrl.origin}/${importUrl}`;
                    }
                      if (importUrl.endsWith('.js') && !scriptUrls.includes(importUrl)) {
                        importUrls.add(importUrl);
                      }
                    }
                  }
                }
              }
              // 将 imports 依赖添加到加载列表（在入口文件之前）
              if (importUrls.size > 0) {
                const importUrlsArray = Array.from(importUrls);
                scriptUrls = [...scriptUrls.filter(url => {
                  const fileName = url.substring(url.lastIndexOf('/') + 1);
                  return !fileName.includes('index-') && !fileName.includes('main-');
                }), ...importUrlsArray, ...scriptUrls.filter(url => {
                  const fileName = url.substring(url.lastIndexOf('/') + 1);
                  return fileName.includes('index-') || fileName.includes('main-');
                })];
              }
            }
          }
        } catch (manifestError) {
          // 静默失败
        }
      }

      // 关键：确保正确的加载顺序，避免模块初始化顺序问题
      // 1. vendor 应该在 echarts-vendor 之前（vendor 包含 Vue 核心函数）
      // 2. 其他依赖（如 menu-registry、eps-service、auth-api）应该在入口文件之前
      // 3. 入口文件（index/main）应该最后加载
      scriptUrls.sort((a, b) => {
        const aFileName = a.substring(a.lastIndexOf('/') + 1);
        const bFileName = b.substring(b.lastIndexOf('/') + 1);

        // 确定文件类型优先级（数字越小，优先级越高）
        const getPriority = (fileName: string): number => {
          // 1. vendor（不包含 echarts）- 最高优先级
          if (fileName.includes('vendor-') && !fileName.includes('echarts-vendor')) return 1;
          // 2. echarts-vendor - 第二优先级
          if (fileName.includes('echarts-vendor')) return 2;
          // 3. 其他依赖（menu-registry、eps-service、auth-api 等）
          if (fileName.includes('menu-registry') ||
              fileName.includes('eps-service') ||
              fileName.includes('auth-api')) return 3;
          // 4. 入口文件（index、main）- 最后加载
          if (fileName.includes('index-') || fileName.includes('main-')) return 4;
          // 5. 其他未知文件（如 getters、code、message-icon 等）- 在入口文件之前
          return 3;
        };

        const aPriority = getPriority(aFileName);
        const bPriority = getPriority(bFileName);

        // 如果优先级相同，保持原有顺序
        if (aPriority === bPriority) {
          return 0;
        }

        return aPriority - bPriority;
      });

        // 如果没有找到任何 script 标签，使用 manifest 作为回退
      if (scriptUrls.length === 0) {
        // 添加时间戳参数避免缓存旧版本
        const manifestUrl = `${entryUrl.origin}/manifest.json?t=${Date.now()}`;
        // #region agent log H-LAYOUT-MANIFEST
        fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-LAYOUT-MANIFEST',location:'packages/shared-utils/src/qiankun/load-layout-app.ts:manifest-fallback',message:'fetch manifest.json (fallback)',data:{manifestUrl,entryOrigin:entryUrl.origin},timestamp:Date.now()})}).catch(()=>{});
        // #endregion agent log H-LAYOUT-MANIFEST
        try {
          const manifestResponse = await fetch(manifestUrl, {
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-store', // 禁用缓存，确保获取最新版本
            }).catch(() => {
              // manifest.json 不存在时静默失败，不影响应用加载
              return { ok: false } as Response;
          });

          if (manifestResponse.ok) {
            cachedManifest = await manifestResponse.json();
            // #region agent log H-LAYOUT-MANIFEST
            fetch('http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H-LAYOUT-MANIFEST',location:'packages/shared-utils/src/qiankun/load-layout-app.ts:manifest-fallback',message:'manifest parsed (fallback)',data:{manifestUrl,manifestKeysCount:Object.keys(cachedManifest||{}).length},timestamp:Date.now()})}).catch(()=>{});
            // #endregion agent log H-LAYOUT-MANIFEST
            // 关键：在获取 manifest.json 后立即设置运行时兜底机制
            // 这样可以在脚本加载和执行时拦截并修复旧的动态导入引用
            if (typeof setupDynamicImportFallback === 'function') {
              setupDynamicImportFallback();
            }

            // 从 manifest 中提取所有 chunk 文件（包括依赖和 imports）
            const manifestUrls: Array<{ url: string; priority: number }> = [];
            const processedKeys = new Set<string>();

            // 递归提取文件及其 imports
            const extractFiles = (key: string) => {
              if (processedKeys.has(key)) return;
              processedKeys.add(key);

              const entry = cachedManifest![key];
              if (!entry || typeof entry !== 'object' || !entry.file || !entry.file.endsWith('.js')) {
                return;
              }

              let fileUrl = entry.file;
              // 检查是否有重复的路径
              if (fileUrl.includes('/assets/layout/assets/layout/')) {
                fileUrl = fileUrl.replace(/\/assets\/layout\/assets\/layout\//g, '/assets/layout/');
              } else if (fileUrl.includes('assets/layout/assets/layout/')) {
                fileUrl = fileUrl.replace(/assets\/layout\/assets\/layout\//g, 'assets/layout/');
              }
              // const adjustedForDup = fileUrl !== originalFileUrl; // 未使用
              if (fileUrl.startsWith('/')) {
                fileUrl = `${entryUrl.origin}${fileUrl}`;
              } else if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
                fileUrl = `${entryUrl.origin}/${fileUrl}`;
              }

              const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
              let priority = 999;
              if (fileName.includes('vendor-') && !fileName.includes('echarts-vendor')) {
                priority = 1;
              } else if (fileName.includes('echarts-vendor')) {
                priority = 2;
              } else if (fileName.includes('menu-registry') ||
                         fileName.includes('eps-service') ||
                         fileName.includes('auth-api')) {
                priority = 3;
              } else if (entry.isEntry || fileName.includes('index-') || fileName.includes('main-')) {
                priority = 4;
              }

              manifestUrls.push({ url: fileUrl, priority });

              // 递归处理 imports
              if (entry.imports && Array.isArray(entry.imports)) {
                for (const importKey of entry.imports) {
                  extractFiles(importKey);
                }
              }
            };

            // 遍历所有 manifest 条目
            if (cachedManifest) {
              for (const key of Object.keys(cachedManifest)) {
                extractFiles(key);
              }
            }

            // 按优先级排序
            manifestUrls.sort((a, b) => a.priority - b.priority);
            scriptUrls = manifestUrls.map(item => item.url);

            // 静默处理
          } else {
            // 静默处理
          }
        } catch (manifestError) {
          // 静默处理
        }
      }

      // 如果仍然没有找到，使用常见路径作为回退（layout-app 使用 assets/layout/ 目录）
      if (scriptUrls.length === 0) {
        scriptUrls = [`${entryUrl.origin}/assets/layout/index.js`];
      }
    } catch (error) {
      clearTimeout(timeoutId);
      // 如果获取 HTML 失败，尝试从 manifest.json 获取
      // 添加时间戳参数避免缓存旧版本
      const manifestUrl = `${entryUrl.origin}/manifest.json?t=${Date.now()}`;
      try {
        const manifestResponse = await fetch(manifestUrl, {
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-store', // 禁用缓存，确保获取最新版本
        }).catch(() => {
          // manifest.json 不存在时静默失败，不影响应用加载
          return { ok: false } as Response;
        });

        if (manifestResponse.ok) {
          cachedManifest = await manifestResponse.json();
          // 关键：在获取 manifest.json 后立即设置运行时兜底机制
          // 这样可以在脚本加载和执行时拦截并修复旧的动态导入引用
          if (typeof setupDynamicImportFallback === 'function') {
            (setupDynamicImportFallback as () => void)();
          }

          // 从 manifest 中提取所有 chunk 文件（包括依赖和 imports）
          const manifestUrls: Array<{ url: string; priority: number }> = [];
          const processedKeys = new Set<string>();

          // 递归提取文件及其 imports
          const extractFiles = (key: string) => {
            if (processedKeys.has(key)) return;
            processedKeys.add(key);

            const entry = cachedManifest![key];
            if (!entry || typeof entry !== 'object' || !entry.file || !entry.file.endsWith('.js')) {
              return;
            }

            let fileUrl = entry.file;
            // 检查是否有重复的路径
            if (fileUrl.includes('/assets/layout/assets/layout/')) {
              fileUrl = fileUrl.replace(/\/assets\/layout\/assets\/layout\//g, '/assets/layout/');
            } else if (fileUrl.includes('assets/layout/assets/layout/')) {
              fileUrl = fileUrl.replace(/assets\/layout\/assets\/layout\//g, 'assets/layout/');
            }
            // 关键：layout-app 的所有 JS 产物都在 /assets/layout/ 下（避免与子应用 /assets/ 冲突）
            // 不依赖 Nginx rewrite：这里直接把 manifest 中的 /assets/*.js 规范化为 /assets/layout/*.js
            if (fileUrl.includes('/assets/') && !fileUrl.includes('/assets/layout/')) {
              fileUrl = fileUrl.replace(/\/assets\/([^/]+\.js)$/, '/assets/layout/$1');
            }
            if (fileUrl.startsWith('assets/') && !fileUrl.startsWith('assets/layout/')) {
              fileUrl = fileUrl.replace(/^assets\/([^/]+\.js)$/, 'assets/layout/$1');
            }
            if (fileUrl.startsWith('/')) {
              fileUrl = `${entryUrl.origin}${fileUrl}`;
            } else if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
              fileUrl = `${entryUrl.origin}/${fileUrl}`;
            }

            const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            let priority = 999;
            if (fileName.includes('vendor-') && !fileName.includes('echarts-vendor')) {
              priority = 1;
            } else if (fileName.includes('echarts-vendor')) {
              priority = 2;
            } else if (fileName.includes('menu-registry') ||
                       fileName.includes('eps-service') ||
                       fileName.includes('auth-api')) {
              priority = 3;
            } else if (entry.isEntry || fileName.includes('index-') || fileName.includes('main-')) {
              priority = 4;
            }

              manifestUrls.push({ url: fileUrl, priority });

              // 递归处理 imports
            if (entry.imports && Array.isArray(entry.imports)) {
              for (const importKey of entry.imports) {
                extractFiles(importKey);
              }
            }
          };

          // 遍历所有 manifest 条目
          if (cachedManifest) {
            for (const key of Object.keys(cachedManifest)) {
              extractFiles(key);
            }
          }

          // 按优先级排序
          manifestUrls.sort((a, b) => a.priority - b.priority);
          scriptUrls = manifestUrls.map(item => item.url);

          if (scriptUrls.length === 0) {
            // 最后回退到常见路径（layout-app 使用 assets/layout/ 目录）
            scriptUrls = [`${entryUrl.origin}/assets/layout/index.js`];
          }
        } else {
          // 最后回退到常见路径（layout-app 使用 assets/layout/ 目录）
          scriptUrls = [`${entryUrl.origin}/assets/layout/index.js`];
        }
      } catch (manifestError) {
        // 最后回退到常见路径（layout-app 使用 assets/layout/ 目录）
        scriptUrls = [`${entryUrl.origin}/assets/layout/index.js`];
      }
    }

    // 关键：在子应用域下，不设置 base 标签指向 layout-app，因为这会影响子应用的相对路径解析
    // 相反，我们在加载 layout-app 的 script 时，直接使用绝对路径
    // 只在 layout-app 自己的域名下才设置 base 标签
    const currentHostname = window.location.hostname;
    const isSubAppDomain = currentHostname !== 'layout.bellis.com.cn' &&
                           currentHostname !== 'localhost' &&
                           !currentHostname.includes('localhost');

    // 只有在 layout-app 自己的域名下才设置 base 标签
    if (!isSubAppDomain) {
      const baseHref = entryUrl.origin + '/';
      // 检查是否已经存在 <base> 标签
      const existingBase = document.querySelector('base[data-layout-app-base]') as HTMLBaseElement | null;
      if (existingBase) {
        // 如果已存在我们添加的 base 标签，更新它的 href
        existingBase.href = baseHref;
      } else {
        // 如果不存在，创建一个新的
        const base = document.createElement('base');
        base.href = baseHref;
        base.setAttribute('data-layout-app-base', 'true'); // 标记为我们添加的
        // 插入到 <head> 的最前面，确保在其他资源标签之前
        const head = document.head || document.getElementsByTagName('head')[0];
        if (head.firstChild) {
          head.insertBefore(base, head.firstChild);
        } else {
          head.appendChild(base);
        }
      }
    }

    // 使用 script 标签按顺序加载所有脚本（包括 vendor、echarts-vendor 等依赖）
    // 这样可以确保所有依赖的 chunk 都在入口文件之前加载完成，避免模块初始化顺序问题
    let loadedCount = 0;
    // let hasError = false; // 未使用

    const loadScript = (url: string, index: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = url;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-layout-app', 'true');
        script.setAttribute('data-script-index', index.toString());

        script.onload = () => {
          loadedCount++;
          resolve();
        };

        script.onerror = (error) => {
          const errorDetails = {
            url,
            error: error instanceof Error ? error.message : String(error),
            scriptIndex: index,
            totalScripts: scriptUrls.length,
          };
          reject(new Error(`加载 layout-app 脚本失败: ${url} (${errorDetails.error})`));
        };

        document.head.appendChild(script);
      });
    };

    // 设置全局动态导入错误处理（运行时兜底机制）
    // 关键：使用标志位确保拦截器只设置一次，避免被多次覆盖
    let fetchInterceptorSet = false;
    setupDynamicImportFallback = () => {
      if (!cachedManifest) {
        return;
      }

      // 如果拦截器已经设置，不再重复设置
      if (fetchInterceptorSet) {
        return;
      }

      // 拦截 window.fetch 来捕获 layout-app 的动态导入失败（包括 404）
      // 注意：import() 在浏览器中会通过 fetch 触发网络请求
      const originalFetch = window.fetch.bind(window) as typeof window.fetch;
      window.fetch = async function(...args): Promise<Response> {
        const url = args[0]?.toString() || '';

        // 关键：对于相对路径的模块导入（如 ./index-xxx.js），不要进行修复
        // 这些是模块内部的相对导入，应该由模块系统自己处理
        // 只有当 URL 是绝对路径或完整的 URL 时，才进行修复
        if (url.startsWith('./') || (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/') && !url.startsWith('assets/'))) {
          // 相对路径的模块导入，直接使用原始 fetch，不进行拦截
          return originalFetch.apply(this, args);
        }

        // 关键：在请求前检查是否是子应用的主入口文件（index-xxx.js 或 main-xxx.js）
        // 这些文件应该从子应用自己的域名加载，不应该被拦截或修复
        // 如果 URL 包含 /assets/ 且文件名是 index- 或 main- 开头，且域名不是 layout-app，直接放行
        if (url.includes('/assets/') && (url.endsWith('.js') || url.endsWith('.mjs'))) {
          const fileName = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
          const isSubAppEntryFile = fileName ? (fileName.startsWith('index-') || fileName.startsWith('main-')) : false;
          const isLayoutDomain = url.includes('layout.bellis.com.cn') ||
                                 url.includes('localhost:4192') ||
                                 url.includes('localhost:4188');

          // 如果是子应用的主入口文件，且不是 layout-app 的域名，直接放行
          // 这些文件应该从子应用自己的域名加载，不应该被拦截
          if (isSubAppEntryFile && !isLayoutDomain) {
            return originalFetch.apply(this, args);
          }
        }

        // 检查是否是 layout-app 的资源：
        // 关键：layout-app 的资源在 /assets/layout/ 目录下，子应用的资源在 /assets/ 目录下
        // 1. 生产环境：包含 layout.bellis.com.cn，且路径是 /assets/layout/
        // 2. 预览环境：包含 localhost:4192，且路径是 /assets/layout/
        // 3. 开发环境：包含 localhost:4188，且路径是 /assets/layout/
        // 4. 或者是绝对路径 /assets/layout/xxx.js（layout-app 的资源）
        // 5. 特殊情况：如果是 /assets/xxx.js（缺少 /layout/）但指向 layout-app 域名，可能是需要修复的路径

        const isLayoutDomain = url.includes('layout.bellis.com.cn') ||
                               url.includes('localhost:4192') ||
                               url.includes('localhost:4188');

        // 匹配 /assets/ 路径
        const baseTag = document.querySelector('base[data-layout-app-base]');

        // 关键：基于路径特征判断是否是 layout-app 的资源
        // layout-app 的资源特征：路径包含 /assets/layout/ 或 assets/layout/
        // 子应用的资源特征：路径是 /assets/xxx.js（没有 /layout/）
        let isLayoutAsset = false;

        if (url.startsWith('http://') || url.startsWith('https://')) {
          // 完整 URL
          if (isLayoutDomain) {
            // 如果域名是 layout-app，检查路径
            // 关键：如果路径是 /assets/xxx.js（没有 /layout/），也需要修复为 /assets/layout/xxx.js
            // 因为 layout-app 的所有资源都在 /assets/layout/ 目录下
            if (url.includes('/assets/layout/')) {
              // 路径是 /assets/layout/，肯定是 layout-app 的资源
              isLayoutAsset = true;
            } else if (url.includes('/assets/') && (url.endsWith('.js') || url.endsWith('.mjs'))) {
              // 路径是 /assets/xxx.js（没有 /layout/），但域名是 layout-app，需要修复
              // 这通常是 layout-app 的资源，但路径被错误地写成了 /assets/ 而不是 /assets/layout/
              isLayoutAsset = true;
            }
            // 如果路径不是 /assets/，不是 layout-app 的资源
          } else {
            // 如果域名不是 layout-app，但路径是 /assets/xxx.js，可能是 layout-app 的资源被错误请求
            // 这种情况通常发生在子应用尝试加载 layout-app 的资源时
            // 关键：只有当 base 标签存在且 manifest 中有这个文件时，才认为是 layout-app 的资源（需要修复）
            // 注意：如果域名不是 layout-app，且 manifest 中没有这个文件，这应该是子应用的资源，不应该拦截
            if (url.includes('/assets/') && (url.endsWith('.js') || url.endsWith('.mjs')) && baseTag !== null && cachedManifest) {
              // 检查是否可能是 layout-app 的资源（通过 manifest 验证）
              // 如果 manifest 中有这个文件，说明是 layout-app 的资源
              const fileName = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
              const existsInManifest = Object.values(cachedManifest).some(entry => {
                if (entry.file) {
                  const entryFileName = entry.file.substring(entry.file.lastIndexOf('/') + 1);
                  return entryFileName === fileName;
                }
                return false;
              });
              if (existsInManifest) {
                isLayoutAsset = true;
              }
            }
          }
        } else if (url.startsWith('/assets/layout/')) {
          // 绝对路径 /assets/layout/xxx.js，肯定是 layout-app 的资源
          isLayoutAsset = true;
        } else if (url.startsWith('/assets/') && !url.startsWith('/assets/layout/')) {
          // 绝对路径 /assets/xxx.js（没有 /layout/）
          // 关键：这可能是子应用的资源，不应该被拦截
          // 只有当通过 manifest 验证确认是 layout-app 的资源时，才认为是 layout-app 的资源
          // 注意：子应用的资源在 /assets/ 目录下，layout-app 的资源在 /assets/layout/ 目录下
          // 如果 URL 是相对路径 /assets/xxx.js，且不是 layout-app 的域名，这应该是子应用的资源
          if (baseTag !== null && cachedManifest) {
            // 只有当 base 标签存在且 manifest 中有这个文件时，才认为是 layout-app 的资源
            const fileName = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
            const existsInManifest = Object.values(cachedManifest).some(entry => {
              if (entry.file) {
                const entryFileName = entry.file.substring(entry.file.lastIndexOf('/') + 1);
                return entryFileName === fileName;
              }
              return false;
            });
            isLayoutAsset = existsInManifest;
          } else {
            // 如果没有 base 标签或 manifest，这应该是子应用的资源，不应该拦截
            isLayoutAsset = false;
          }
        } else if (url.startsWith('assets/layout/') || url.startsWith('./assets/layout/')) {
          // 相对路径 assets/layout/xxx.js，肯定是 layout-app 的资源
          isLayoutAsset = true;
        } else if ((url.startsWith('assets/') || url.startsWith('./assets/')) && !url.includes('layout/')) {
          // 相对路径 assets/xxx.js（没有 layout/）
          // 关键：这可能是子应用的资源，不应该被拦截
          // 只有当通过 manifest 验证确认是 layout-app 的资源时，才认为是 layout-app 的资源
          if (baseTag !== null && cachedManifest) {
            // 只有当 base 标签存在且 manifest 中有这个文件时，才认为是 layout-app 的资源
            const fileName = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
            const existsInManifest = Object.values(cachedManifest).some(entry => {
              if (entry.file) {
                const entryFileName = entry.file.substring(entry.file.lastIndexOf('/') + 1);
                return entryFileName === fileName;
              }
              return false;
            });
            isLayoutAsset = existsInManifest;
          } else {
            // 如果没有 base 标签或 manifest，这应该是子应用的资源，不应该拦截
            isLayoutAsset = false;
          }
        }


        // 关键：只有在确认是 layout-app 的资源时，才修复 URL
        // 如果不是 layout-app 的资源，直接使用原始 URL，避免错误地修复子应用的资源
        let fixedUrl = url;
        if (isLayoutAsset) {
          // 只有在确认是 layout-app 的资源时，才修复 URL
          // 处理完整 URL（如 https://layout.bellis.com.cn/assets/layout/xxx.js）
          if (url.startsWith('http://') || url.startsWith('https://')) {
            // 已经是完整 URL，检查路径是否正确
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            // 关键：如果路径是 /assets/xxx 但不是 /assets/layout/xxx，需要修复
            // 这是 layout-app 的资源，应该修复为 /assets/layout/xxx
            if (pathname.startsWith('/assets/') && !pathname.startsWith('/assets/layout/')) {
              const newPathname = pathname.replace('/assets/', '/assets/layout/');
              fixedUrl = `${urlObj.origin}${newPathname}${urlObj.search}${urlObj.hash}`;
            } else if (pathname.startsWith('/assets/layout/assets/layout/')) {
              // 检测到重复的路径，修复它
              const newPathname = pathname.replace('/assets/layout/assets/layout/', '/assets/layout/');
              fixedUrl = `${urlObj.origin}${newPathname}${urlObj.search}${urlObj.hash}`;
            } else {
              // 路径已经是正确的，直接使用
              fixedUrl = url;
            }
          } else if (url.startsWith('/assets/layout/')) {
            // 关键：/assets/layout/ 路径是 layout-app 专用的，无论 base 标签是否存在，都应该转换为 layout-app 的 origin
            // 因为子应用的资源在 /assets/ 目录下，不在 /assets/layout/ 目录下
            fixedUrl = `${entryUrl.origin}${url}`;
          } else if (url.startsWith('/assets/') && !url.startsWith('/assets/layout/')) {
            // /assets/ 路径（不是 /assets/layout/）可能是子应用的资源
            // 只有当 base 标签存在时，才认为是 layout-app 的资源（需要修复）
            // 如果 base 标签不存在，这可能是子应用的资源，不应该修复
            if (baseTag !== null) {
              // 将 /assets/xxx.js 转换为 /assets/layout/xxx.js
              fixedUrl = url.replace('/assets/', '/assets/layout/');
              fixedUrl = `${entryUrl.origin}${fixedUrl}`;
            } else {
              // base 标签不存在，这可能是子应用的资源，不应该修复
              // 直接使用原始 URL，不进行修复
              fixedUrl = url;
            }
          } else if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
            // 相对路径（如 assets/layout/xxx.js 或 ./assets/layout/xxx.js）
            // 如果已经是 assets/layout/，直接拼接 origin
            if (url.startsWith('assets/layout/') || url.startsWith('./assets/layout/')) {
              const cleanPath = url.replace(/^\.\//, '');
              fixedUrl = `${entryUrl.origin}/${cleanPath}`;
            } else if (url.startsWith('assets/') || url.startsWith('./assets/')) {
              // 相对路径 assets/xxx，转换为 assets/layout/xxx
              const cleanPath = url.replace(/^\.\//, '').replace(/^assets\//, 'assets/layout/');
              fixedUrl = `${entryUrl.origin}/${cleanPath}`;
            }
          }
        }

        // 如果是 layout-app 的资源，先检查 manifest.json 中是否有这个文件
        // 关键：在请求前就检查并修复旧哈希引用，避免 404 错误
        if (isLayoutAsset && cachedManifest) {
          // 关键：使用修复后的 URL 来提取文件名，而不是原始 URL
          // 因为 fixedUrl 可能已经被修复为 /assets/layout/xxx.js
          const fileName = fixedUrl.substring(fixedUrl.lastIndexOf('/') + 1).split('?')[0] ?? '';


          // 检查这个文件名是否在 manifest.json 中
          let fileExistsInManifest = false;
          let matchedEntry: { file: string; src?: string; isEntry?: boolean; imports?: string[] } | null = null;

          for (const entry of Object.values(cachedManifest)) {
            if (entry.file) {
              const entryFileName = entry.file.substring(entry.file.lastIndexOf('/') + 1);
              if (entryFileName === fileName) {
                fileExistsInManifest = true;
                matchedEntry = entry;
                break;
              }
            }
          }

          // 关键优化：如果文件不在 manifest 中，立即尝试通过基础名称匹配修复
          // 这样可以在请求前就修复旧哈希引用，避免 404 错误
          if (!fileExistsInManifest) {
            // 匹配多种文件名格式，提取基础名称
            let baseName: string | null = null;

            // 优先尝试匹配特殊格式（如 menu-registry-B-483hvG.js），支持下划线
            const specialHashMatch = fileName.match(/^([^-]+(?:-[^-]+)*?)-([A-Za-z0-9_])-([a-zA-Z0-9_]{4,})\.(js|mjs)$/);
            if (specialHashMatch && specialHashMatch[1]) {
              baseName = specialHashMatch[1] ?? null;
            } else {
              // 尝试匹配标准格式（多个 hash 段），支持下划线
              const multiHashMatch = fileName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9_]{8,})+(?:-[a-zA-Z0-9_]+)?\.(js|mjs)$/);
              if (multiHashMatch && multiHashMatch[1]) {
                baseName = multiHashMatch[1] ?? null;
              } else {
                // 尝试匹配单个 hash 段（至少 8 个字符），支持下划线
                const singleHashMatch = fileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9_]{8,})\.(js|mjs)$/);
                if (singleHashMatch && singleHashMatch[1]) {
                  baseName = singleHashMatch[1] ?? null;
                } else {
                  // 尝试匹配简单格式（提取基础名称，去掉最后一个 hash 段），支持下划线
                  const simpleMatch = fileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9_]+)\.(js|mjs)$/);
                  if (simpleMatch && simpleMatch[1]) {
                    baseName = simpleMatch[1] ?? null;
                  }
                }
              }
            }

            if (baseName) {

              // 在 manifest 中查找匹配的文件（通过基础名称匹配）
              let matchedEntry: { file: string } | null = null;
              for (const [, entry] of Object.entries(cachedManifest)) {
                if (entry.file) {
                  const entryFileName = entry.file.substring(entry.file.lastIndexOf('/') + 1);
                  let entryBaseName: string | null = null;

                  // 匹配 manifest 中的文件名格式（支持多种格式），支持下划线
                  const entrySpecialHashMatch = entryFileName.match(/^([^-]+(?:-[^-]+)*?)-([A-Za-z0-9_])-([a-zA-Z0-9_]{4,})(?:-[a-zA-Z0-9_]+)?\.(js|mjs)$/);
                  if (entrySpecialHashMatch && entrySpecialHashMatch[1]) {
                    entryBaseName = entrySpecialHashMatch[1] ?? null;
                  } else {
                    const entryMultiHashMatch = entryFileName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9_]{8,})+(?:-[a-zA-Z0-9_]+)?\.(js|mjs)$/);
                    if (entryMultiHashMatch && entryMultiHashMatch[1]) {
                      entryBaseName = entryMultiHashMatch[1] ?? null;
                    } else {
                      const entrySingleHashMatch = entryFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9_]{8,})\.(js|mjs)$/);
                      if (entrySingleHashMatch && entrySingleHashMatch[1]) {
                        entryBaseName = entrySingleHashMatch[1] ?? null;
                      } else {
                        const entrySimpleMatch = entryFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9_]+)(?:-[a-zA-Z0-9_]+)?\.(js|mjs)$/);
                        if (entrySimpleMatch && entrySimpleMatch[1]) {
                          entryBaseName = entrySimpleMatch[1] ?? null;
                        }
                      }
                    }
                  }

                  if (entryBaseName && entryBaseName === baseName) {
                    matchedEntry = entry;
                    break;
                  }
                }
              }

              // 如果通过基础名称匹配找到了文件，使用它
              if (matchedEntry && matchedEntry.file) {
                let correctUrl = matchedEntry.file;
                // 确保路径格式正确：manifest 中的路径可能是 assets/layout/xxx.js 或 /assets/layout/xxx.js
                // 需要统一转换为完整的 URL
                if (correctUrl.startsWith('http://') || correctUrl.startsWith('https://')) {
                  // 已经是完整 URL，直接使用
                  // 不做任何处理
                } else if (correctUrl.startsWith('/')) {
                  // 以 / 开头的绝对路径，直接拼接 origin
                  correctUrl = `${entryUrl.origin}${correctUrl}`;
                } else {
                  // 相对路径，需要添加 / 前缀
                  // 确保路径格式正确：如果已经是 assets/layout/xxx.js，直接拼接
                  // 注意：manifest 中的路径应该是 assets/layout/xxx.js 格式（不带前导 /）
                  correctUrl = `${entryUrl.origin}/${correctUrl}`;
                }

                // 额外检查：如果 URL 中出现了重复的 assets/layout/，修复它
                if (correctUrl.includes('/assets/layout/assets/layout/')) {
                  correctUrl = correctUrl.replace('/assets/layout/assets/layout/', '/assets/layout/');
                }

                if (correctUrl !== fixedUrl && correctUrl !== url) {
                  // 直接使用正确的 URL，避免先请求错误的 URL
                  return originalFetch.apply(this, [correctUrl, args[1] as RequestInit | undefined]);
                }
              } else {
                // 如果基础名称匹配失败，尝试通过文件名前缀匹配（更宽松的匹配）
                // 例如：menu-registry-fu7YjIYj-mj2mtu46.js 应该匹配 menu-registry-BJY75kSf-mj2mtu46.js
                const extractPrefixName = (name: string): string | null => {
                  // 去掉扩展名
                  const nameWithoutExt = name.replace(/\.(js|mjs)$/, '');

                  // 已知的基础名称模式（按长度从长到短排序，优先匹配更长的模式）
                  const knownPatterns = [
                    'menu-registry',
                    'echarts-vendor',
                    'eps-service',
                    'auth-api',
                    'notification-icon',
                    'message-icon',
                    'getters',
                    'vendor',
                    'index',
                    'code'
                  ];

                  // 尝试匹配已知模式
                  for (const pattern of knownPatterns) {
                    if (nameWithoutExt.startsWith(pattern + '-')) {
                      return pattern;
                    }
                  }

                  // 如果没有匹配到已知模式，尝试通过分隔符提取
                  const parts = nameWithoutExt.split('-');
                  if (parts.length >= 2) {
                    // 从后往前查找，找到第一个看起来像 hash 的部分
                    for (let i = parts.length - 1; i >= 0; i--) {
                      const part = parts[i];
                      // 如果这个部分看起来像 hash（长度 >= 4 且全是字母数字）
                      if (part && part.length >= 4 && /^[A-Za-z0-9_]+$/.test(part)) {
                        if (i > 0) {
                          const baseParts = parts.slice(0, i);
                          if (baseParts.length > 0) {
                            return baseParts.join('-');
                          }
                        }
                      }
                    }
                  }

                  return null;
                };

                const fileNameBase = extractPrefixName(fileName);
                if (fileNameBase) {
                  for (const [, entry] of Object.entries(cachedManifest)) {
                    if (entry.file) {
                      const entryFileName = entry.file.substring(entry.file.lastIndexOf('/') + 1);
                      const entryFileNameBase = extractPrefixName(entryFileName);

                      if (entryFileNameBase && entryFileNameBase === fileNameBase) {
                        let correctUrl = entry.file;
                        if (correctUrl.startsWith('/')) {
                          correctUrl = `${entryUrl.origin}${correctUrl}`;
                        } else if (!correctUrl.startsWith('http://') && !correctUrl.startsWith('https://')) {
                          correctUrl = `${entryUrl.origin}/${correctUrl}`;
                        }

                        if (correctUrl !== fixedUrl && correctUrl !== url) {
                          // 关键：验证修复后的文件是否确实在 manifest 中
                          const correctFileName = correctUrl.substring(correctUrl.lastIndexOf('/') + 1).split('?')[0];
                          const existsInManifest = Object.values(cachedManifest).some(entry => {
                            if (entry.file) {
                              const entryFileName = entry.file.substring(entry.file.lastIndexOf('/') + 1);
                              return entryFileName === correctFileName;
                            }
                            return false;
                          });

                          if (existsInManifest) {
                            // 文件确实在 manifest 中，使用修复后的 URL
                            return originalFetch.apply(this, [correctUrl, args[1] as RequestInit | undefined]);
                          } else {
                            // 文件不在 manifest 中，可能是匹配错误，继续使用原始逻辑
                            // 静默处理，避免在生产环境产生过多日志
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          } else {
            // 文件在 manifest 中，使用 manifest 中的完整路径（确保使用正确的 origin）
            if (matchedEntry && matchedEntry.file) {
              let manifestUrl = matchedEntry.file;
              if (manifestUrl.startsWith('/')) {
                manifestUrl = `${entryUrl.origin}${manifestUrl}`;
              } else if (!manifestUrl.startsWith('http://') && !manifestUrl.startsWith('https://')) {
                manifestUrl = `${entryUrl.origin}/${manifestUrl}`;
              }

              // 如果 manifest 中的 URL 与当前 URL 不同，使用 manifest 中的 URL
              // 这样可以确保使用正确的 origin（layout.bellis.com.cn 而不是子应用的域名）
              if (manifestUrl !== fixedUrl && manifestUrl !== url) {
                return originalFetch.apply(this, [manifestUrl, args[1] as RequestInit | undefined]);
              }
            }
          }
        }

        // 关键：只有在确认是 layout-app 的资源时，才使用修复后的 URL
        // 如果不是 layout-app 的资源，直接使用原始 URL，避免错误地请求 layout-app 的资源
        const requestUrl = (isLayoutAsset && fixedUrl !== url) ? fixedUrl : url;

        const fetchArgs: [RequestInfo | URL, RequestInit?] = (isLayoutAsset && requestUrl !== url)
          ? (args[1] !== undefined ? [requestUrl, args[1] as RequestInit] : [requestUrl])
          : args as [RequestInfo | URL, RequestInit?];
        const response = await originalFetch.apply(this, fetchArgs);

        // 如果是 layout-app 的资源且返回 404，尝试从 manifest.json 查找正确的文件名
        // 关键：即使之前没有被识别为 layout-app 的资源，如果返回 404 且路径是 /assets/xxx.js，
        // 也应该尝试修复为 /assets/layout/xxx.js，并修复域名
        // 但是，子应用的主入口文件（index-xxx.js）不应该被修复，因为它们应该从子应用自己的域名加载
        if ((isLayoutAsset || (url.includes('/assets/') && (url.endsWith('.js') || url.endsWith('.mjs')))) && !response.ok && response.status === 404) {
          // 关键：检查是否是子应用的主入口文件（index-xxx.js 或 main-xxx.js）
          // 这些文件应该从子应用自己的域名加载，不应该被修复为 layout-app 的资源
          const fileName = url.substring(url.lastIndexOf('/') + 1).split('?')[0] ?? '';
          const isSubAppEntryFile = fileName.startsWith('index-') || fileName.startsWith('main-');

          // 如果是子应用的主入口文件，且不在 layout-app 的 manifest 中，不应该修复
          // 这些文件应该从子应用自己的域名加载
          // 关键：如果当前请求的域名是 layout-app 的域名，但文件是子应用的主入口文件，
          // 说明路径被错误地指向了 layout-app，应该尝试从子应用自己的域名加载
          if (isSubAppEntryFile && !isLayoutAsset) {
            // 如果当前请求的域名是 layout-app 的域名，尝试从子应用自己的域名加载
            if (isLayoutDomain && (url.startsWith('http://') || url.startsWith('https://'))) {
              const urlObj = new URL(url);
              // 获取当前页面的域名（应该是子应用的域名）
              const currentOrigin = window.location.origin;
              // 如果当前域名不是 layout-app 的域名，尝试从当前域名加载
              if (currentOrigin !== urlObj.origin && currentOrigin.includes('bellis.com.cn') && !currentOrigin.includes('layout.bellis.com.cn')) {
                const subAppUrl = `${currentOrigin}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
                const subAppResponse = await originalFetch.apply(this, [subAppUrl, args[1] as RequestInit | undefined]);
                if (subAppResponse.ok) {
                  return subAppResponse;
                }
              }
            }
            // 子应用的主入口文件，不应该被修复为 layout-app 的资源，直接返回 404 响应
            return response;
          }

          // 关键：如果当前请求的域名是 layout-app 的域名，但文件是子应用的主入口文件（即使之前被识别为 layout-app 的资源），
          // 说明路径被错误地指向了 layout-app，应该尝试从子应用自己的域名加载
          if (isSubAppEntryFile && isLayoutAsset && isLayoutDomain && (url.startsWith('http://') || url.startsWith('https://'))) {
            const urlObj = new URL(url);
            // 获取当前页面的域名（应该是子应用的域名）
            const currentOrigin = window.location.origin;
            // 如果当前域名不是 layout-app 的域名，尝试从当前域名加载
            if (currentOrigin !== urlObj.origin && currentOrigin.includes('bellis.com.cn') && !currentOrigin.includes('layout.bellis.com.cn')) {
              // 修复路径：如果是 /assets/layout/xxx.js，改为 /assets/xxx.js
              let fixedPathname = urlObj.pathname;
              if (fixedPathname.startsWith('/assets/layout/')) {
                fixedPathname = fixedPathname.replace('/assets/layout/', '/assets/');
              }
              const subAppUrl = `${currentOrigin}${fixedPathname}${urlObj.search}${urlObj.hash}`;
              const subAppResponse = await originalFetch.apply(this, [subAppUrl, args[1] as RequestInit | undefined]);
              if (subAppResponse.ok) {
                return subAppResponse;
              }
            }
          }

          // 如果之前没有被识别为 layout-app 的资源，但现在返回 404，尝试修复路径和域名
          if (!isLayoutAsset && url.includes('/assets/') && (url.endsWith('.js') || url.endsWith('.mjs'))) {
            // 子应用入口文件：绝对不能被重写到 layout 域名（否则会出现 layout 请求子应用 chunk 的 404）
            const isSubAppEntryFile = fileName.startsWith('index-') || fileName.startsWith('main-');

            // 关键：只有共享资源才允许从 layout-app 加载
            const isSharedResource = fileName.includes('vendor-') ||
                                    fileName.includes('echarts-vendor') ||
                                    fileName.includes('menu-registry') ||
                                    fileName.includes('eps-service') ||
                                    fileName.includes('auth-api');

            // 关键：不要仅凭“manifest 中存在同名文件”就把请求重写到 layout
            // 因为 layout-app 的 manifest 里也可能存在 index-*.js 等同名 chunk，会误伤子应用入口 chunk。
            // 这里只允许对 layout-app 的 /assets/layout/ 下的文件做 manifest 兜底，且排除子应用入口文件。
            let shouldFix = false;
            if (cachedManifest && !isSubAppEntryFile) {
              for (const entry of Object.values(cachedManifest)) {
                if (entry.file) {
                  const entryFileName = entry.file.substring(entry.file.lastIndexOf('/') + 1);
                  if (entryFileName === fileName) {
                    // 只接受 layout-app 自己的 assets/layout/ 资源作为修复目标
                    if (entry.file.includes('assets/layout/')) {
                      shouldFix = true;
                    }
                    break;
                  }
                }
              }
            }

            // 只有共享资源（或明确在 layout manifest 的 assets/layout 下）才尝试修复到 layout
            // 且必须排除子应用入口文件（index-xxx.js、main-xxx.js）
            if (!isSubAppEntryFile && (shouldFix || isSharedResource) && (!url.includes('/assets/layout/') && url.includes('/assets/'))) {
              // 尝试修复路径：/assets/xxx.js -> /assets/layout/xxx.js
              // 同时修复域名：子应用域名 -> layout-app 域名
              let retryUrl = url;
              if (url.startsWith('http://') || url.startsWith('https://')) {
                const urlObj = new URL(url);
                // 修复域名：如果是子应用域名，改为 layout-app 域名
                let newOrigin = urlObj.origin;
                if (!isLayoutDomain && urlObj.hostname.includes('bellis.com.cn')) {
                  newOrigin = `${urlObj.protocol}//layout.bellis.com.cn`;
                }
                // 修复路径：/assets/xxx.js -> /assets/layout/xxx.js
                let newPathname = urlObj.pathname;
                if (newPathname.startsWith('/assets/') && !newPathname.startsWith('/assets/layout/')) {
                  newPathname = newPathname.replace('/assets/', '/assets/layout/');
                }
                retryUrl = `${newOrigin}${newPathname}${urlObj.search}${urlObj.hash}`;
              } else if (url.startsWith('/assets/')) {
                retryUrl = url.replace('/assets/', '/assets/layout/');
                retryUrl = `${entryUrl.origin}${retryUrl}`;
              }

              // 先尝试修复后的路径
              if (retryUrl !== url) {
                const retryResponse = await originalFetch.apply(this, [retryUrl, args[1] as RequestInit | undefined]);
                if (retryResponse.ok) {
                  return retryResponse;
                }
              }
            }
          }

          // 从失败 URL 中提取基础文件名（去掉 hash 和 buildId）
          // 注意：fileName 已经在上面声明过了，这里使用 requestUrl 重新提取（因为 requestUrl 可能是修复后的 URL）
          const failedFileName = requestUrl.substring(requestUrl.lastIndexOf('/') + 1).split('?')[0] ?? '';
          // 匹配多种格式，提取基础名称
          let baseName: string | null = null;

          // 优先尝试匹配特殊格式（如 menu-registry-B-483hvG.js），支持下划线
          const specialHashMatch = failedFileName.match(/^([^-]+(?:-[^-]+)*?)-([A-Za-z0-9_])-([a-zA-Z0-9_]{4,})\.(js|mjs)$/);
          if (specialHashMatch && specialHashMatch[1]) {
            baseName = specialHashMatch[1] ?? null;
          } else {
            // 尝试匹配标准格式（多个 hash 段），支持下划线
            const multiHashMatch = failedFileName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9_]{8,})+(?:-[a-zA-Z0-9_]+)?\.(js|mjs)$/);
            if (multiHashMatch && multiHashMatch[1]) {
              baseName = multiHashMatch[1] ?? null;
            } else {
              // 尝试匹配单个 hash 段（至少 8 个字符），支持下划线
              const singleHashMatch = failedFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9_]{8,})\.(js|mjs)$/);
              if (singleHashMatch && singleHashMatch[1]) {
                baseName = singleHashMatch[1] ?? null;
              } else {
                // 尝试匹配简单格式（提取基础名称，去掉最后一个 hash 段），支持下划线
                const simpleMatch = failedFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9_]+)\.(js|mjs)$/);
                if (simpleMatch && simpleMatch[1]) {
                  baseName = simpleMatch[1] ?? null;
                }
              }
            }
          }

          if (baseName && cachedManifest) {

            // 在 manifest 中查找匹配的文件（通过基础名称匹配）
            for (const [, entry] of Object.entries(cachedManifest)) {
              if (entry.file) {
                const entryFileName = entry.file.substring(entry.file.lastIndexOf('/') + 1);
                let entryBaseName: string | null = null;

                // 匹配 manifest 中的文件名格式（支持多种格式），支持下划线
                const entrySpecialHashMatch = entryFileName.match(/^([^-]+(?:-[^-]+)*?)-([A-Za-z0-9_])-([a-zA-Z0-9_]{4,})(?:-[a-zA-Z0-9_]+)?\.(js|mjs)$/);
                if (entrySpecialHashMatch && entrySpecialHashMatch[1]) {
                  entryBaseName = entrySpecialHashMatch[1] ?? null;
                } else {
                  const entryMultiHashMatch = entryFileName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9_]{8,})+(?:-[a-zA-Z0-9_]+)?\.(js|mjs)$/);
                  if (entryMultiHashMatch && entryMultiHashMatch[1]) {
                    entryBaseName = entryMultiHashMatch[1] ?? null;
                  } else {
                    const entrySingleHashMatch = entryFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9_]{8,})\.(js|mjs)$/);
                    if (entrySingleHashMatch && entrySingleHashMatch[1]) {
                      entryBaseName = entrySingleHashMatch[1] ?? null;
                    } else {
                      const entrySimpleMatch = entryFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9_]+)(?:-[a-zA-Z0-9_]+)?\.(js|mjs)$/);
                      if (entrySimpleMatch && entrySimpleMatch[1]) {
                        entryBaseName = entrySimpleMatch[1] ?? null;
                      }
                    }
                  }
                }

                if (entryBaseName && entryBaseName === baseName) {
                  let correctUrl = entry.file;
                  if (correctUrl.startsWith('/')) {
                    correctUrl = `${entryUrl.origin}${correctUrl}`;
                  } else if (!correctUrl.startsWith('http://') && !correctUrl.startsWith('https://')) {
                    correctUrl = `${entryUrl.origin}/${correctUrl}`;
                  }

                  if (correctUrl !== requestUrl && correctUrl !== url) {
                    // 重试加载正确的文件
                    const retryFetchArgs: [RequestInfo | URL, RequestInit?] = (args[1] !== undefined ? [correctUrl, args[1] as RequestInit] : [correctUrl]);
                    const retryResponse = await originalFetch.apply(this, retryFetchArgs);
                    if (retryResponse.ok) {
                      return retryResponse;
                    }
                  }
                }
              }
            }

          }
        }
        return response;
      };

      fetchInterceptorSet = true;
    };

    // 按顺序加载所有脚本
    // 注意：运行时兜底机制应该已经在获取 manifest.json 时设置
    // 在加载脚本之前，确保拦截器已设置
    if (typeof setupDynamicImportFallback === 'function' && cachedManifest) {
      (setupDynamicImportFallback as () => void)();
    }

    try {
      for (let i = 0; i < scriptUrls.length; i++) {
        const scriptUrl = scriptUrls[i];
        if (scriptUrl) {
          await loadScript(scriptUrl, i);
        }
      }

      // 如果之前没有设置兜底机制（因为 manifest.json 还未加载），现在设置
      if (!cachedManifest) {
        // 尝试再次获取 manifest.json
        try {
          // 添加时间戳参数避免缓存旧版本
          const manifestUrl = `${entryUrl.origin}/manifest.json?t=${Date.now()}`;
          const manifestResponse = await fetch(manifestUrl, {
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-store', // 禁用缓存，确保获取最新版本
          });
          if (manifestResponse.ok) {
            cachedManifest = await manifestResponse.json();
            if (typeof setupDynamicImportFallback === 'function') {
              setupDynamicImportFallback();
            }
          }
        } catch (error) {
          // 静默处理
        }
      }

      // 所有脚本加载完成后，开始检查挂载状态
      const startCheck = () => {
        // layout-app 的所有脚本已加载，等待它挂载完成
        let checkCount = 0;
        // 等待挂载完成：
        // 关键：必须等到 #subapp-viewport 出现才算“可用”，否则子应用会因为找不到容器而挂载失败，
        // 表现为：子应用先独立渲染，几秒后 layout-app 覆盖标题/壳子，但内容区空白。
        const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1'));
        // 生产环境网络/缓存抖动更明显，等待更久一些更稳
        const maxChecks = isDev ? 300 : 300; // 50ms * 300 = 15s

      const checkLayoutApp = () => {
        checkCount++;

        // 关键：以 #subapp-viewport 作为"layout-app 已可用"的硬条件
        // 仅仅检测到 #app 有内容/有 #layout-app 容器是不够的（此时 viewport 可能尚未创建）
        const viewport = document.querySelector('#subapp-viewport') as HTMLElement | null;
        const hasLayoutContent = !!viewport;

        if (hasLayoutContent) {
          // 关键：不仅检查容器是否存在，还要确保容器可见且 layout-app 的 Vue 应用已渲染完成
          const isVisible = viewport && viewport.isConnected;
          let isReady = false;
          
          if (isVisible) {
            // 检查容器的可见性
            const computedStyle = window.getComputedStyle(viewport);
            const isDisplayed = computedStyle.display !== 'none' && 
                               computedStyle.visibility !== 'hidden' && 
                               computedStyle.opacity !== '0';
            
            // 如果容器不可见，强制显示（确保 layout-app 渲染完成后容器是可见的）
            if (!isDisplayed) {
              viewport.style.setProperty('display', 'flex', 'important');
              viewport.style.setProperty('flex-direction', 'column', 'important');
              viewport.style.setProperty('visibility', 'visible', 'important');
              viewport.style.setProperty('opacity', '1', 'important');
            }
            
            // 关键：等待 Vue 应用完成渲染
            // 通过检查容器是否真的准备好（至少等待几个渲染周期）
            // 如果是第一次检测到容器存在，再等待几个周期确保 Vue 完全渲染
            if (checkCount >= 3) {
              // 至少检查 3 次（150ms）后才认为容器就绪，确保 Vue 应用已完全渲染
              isReady = true;
            }
          }

          if (isReady && !layoutAppMounted) {
            layoutAppMounted = true;
            cleanup();

            // 关键：使用 requestAnimationFrame 等待 Vue 完成最终渲染
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  // 最终确认容器可见性
                  if (viewport) {
                    const finalStyle = window.getComputedStyle(viewport);
                    if (finalStyle.display === 'none' || finalStyle.visibility === 'hidden' || finalStyle.opacity === '0') {
                      viewport.style.setProperty('display', 'flex', 'important');
                      viewport.style.setProperty('flex-direction', 'column', 'important');
                      viewport.style.setProperty('visibility', 'visible', 'important');
                      viewport.style.setProperty('opacity', '1', 'important');
                    }
                    
                  }
                  
                  resolve();
                });
              });
            });
          }
        } else if (checkCount >= maxChecks) {
          // 超时，挂载失败
          cleanup();
          cleanupDom(); // 清理残留的 DOM

          const errorMsg = `layout-app 挂载超时（已等待 ${maxChecks * 50}ms），未检测到 #subapp-viewport`;
          // 生产环境下输出诊断信息
          if (!isDev && typeof window !== 'undefined') {
            console.warn('[loadLayoutApp] layout-app 挂载超时', {
              checkCount,
              maxChecks,
              viewportExists: !!document.querySelector('#subapp-viewport'),
              appElement: !!document.querySelector('#app'),
              isUsingLayoutApp: !!(window as any).__USE_LAYOUT_APP__,
              isLayoutApp: !!(window as any).__IS_LAYOUT_APP__,
            });
          }
          reject(new Error(errorMsg));
        }
        // 否则继续检查（通过 setInterval）
      };

      // 每 50ms 检查一次
      checkInterval = setInterval(checkLayoutApp, 50);

      // 设置超时，避免无限等待
      // 关键：超时应该 reject，而不是 resolve
      // 生产环境等待更久一些，避免脚本加载/首屏渲染稍慢时误判失败（导致空白壳子）
      const totalTimeout = isDev ? 20000 : 20000;
      mountTimeout = setTimeout(() => {
        if (!layoutAppMounted) {
          layoutAppMounted = true;
          cleanup();
          cleanupDom(); // 清理残留的 DOM

          const errorMsg = `加载 layout-app 超时（${totalTimeout}ms），已加载 ${scriptUrls.length} 个脚本，但仍未检测到 #subapp-viewport`;
          // 加载 layout-app 超时（日志已移除）
          reject(new Error(errorMsg));
        }
      }, totalTimeout);
      };

      // 开始检查挂载状态
      startCheck();
    } catch (error) {
      cleanup();
      cleanupDom();
      const errorMsg = error instanceof Error
        ? `加载 layout-app 脚本失败: ${error.message}`
        : `加载 layout-app 脚本失败: 未知错误`;
      reject(new Error(errorMsg));
      return;
    }
  });
}


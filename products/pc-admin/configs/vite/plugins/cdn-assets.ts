/**
 * CDN 资源加速插件
 * 在构建时修改 HTML 中的资源 URL，将静态资源路径转换为 CDN URL
 * 支持当前应用资源 (/assets/) 和布局应用资源 (/assets/layout/)
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 使用 console 替代 logger
const logger = {
  warn: (...args: any[]) => console.warn('[cdn-assets]', ...args),
  error: (...args: any[]) => console.error('[cdn-assets]', ...args),
  info: (...args: any[]) => console.info('[cdn-assets]', ...args),
  debug: (...args: any[]) => console.debug('[cdn-assets]', ...args),
};

import type { Plugin } from 'vite';

export interface CdnAssetsPluginOptions {
  /**
   * 应用名称（如 'admin-app'）
   */
  appName: string;
  /**
   * 是否启用 CDN 加速（默认：生产环境启用）
   */
  enabled?: boolean;
  /**
   * CDN 域名（默认：all.bellis.com.cn）
   */
  cdnDomain?: string;
}

/**
 * CDN 资源加速插件
 */
export function cdnAssetsPlugin(options: CdnAssetsPluginOptions): Plugin {
  const {
    appName,
    // 关键：默认启用条件必须明确检查 ENABLE_CDN_ACCELERATION 环境变量
    // 如果 ENABLE_CDN_ACCELERATION 被设置为 'false'，则禁用 CDN
    // 只有在明确启用（ENABLE_CDN_ACCELERATION=true）或未设置且是生产构建时，才启用 CDN
    enabled = process.env.ENABLE_CDN_ACCELERATION === 'true' || 
              (process.env.ENABLE_CDN_ACCELERATION !== 'false' && 
               process.env.NODE_ENV === 'production' && 
               process.env.VITE_PREVIEW !== 'true'),
    cdnDomain = 'https://all.bellis.com.cn',
  } = options;

  return {
    name: 'cdn-assets',
    apply: 'build',
    buildStart() {
      if (enabled) {
        console.info(`[cdn-assets] CDN 加速已启用，应用: ${appName}, CDN 域名: ${cdnDomain}`);
      } else {
        console.info(`[cdn-assets] CDN 加速已禁用`);
      }
    },
    transformIndexHtml: {
      order: 'post', // 在 addVersionPlugin 之后执行
      handler(html) {
        // 关键：即使 CDN 插件被禁用，如果是预览构建，也需要注入早期 URL 转换脚本
        // 因为预览环境可能使用之前构建的包含 CDN URL 的产物
        const isPreviewBuild = process.env.VITE_PREVIEW === 'true';
        const needsEarlyConverter = isPreviewBuild && !enabled;
        
        if (!enabled && !needsEarlyConverter) {
          return html;
        }

        let newHtml = html;
        let modified = false;

        // 1) 处理 <script src> 标签（仅在 CDN 启用时转换）
        if (enabled) {
          newHtml = newHtml.replace(
            /(<script[^>]*\s+src=["'])([^"']+)(["'][^>]*>)/g,
            (match: string, prefix: string, src: string, suffix: string) => {
              
              // 处理当前应用资源：/assets/xxx.js
              if (src.startsWith('/assets/') && !src.startsWith('/assets/layout/')) {
                const cdnUrl = `${cdnDomain}/${appName}${src}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              
              // 处理布局应用资源：/assets/layout/xxx.js
              if (src.startsWith('/assets/layout/')) {
                const cdnUrl = `${cdnDomain}/layout-app${src}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              
              // 处理相对路径：./assets/xxx.js 或 assets/xxx.js
              if (src.startsWith('./assets/') || src.startsWith('assets/')) {
                const normalizedPath = src.startsWith('./') ? src.substring(2) : src;
                if (normalizedPath.startsWith('assets/layout/')) {
                  const cdnUrl = `${cdnDomain}/layout-app/${normalizedPath}`;
                  modified = true;
                  return `${prefix}${cdnUrl}${suffix}`;
                } else if (normalizedPath.startsWith('assets/')) {
                  const cdnUrl = `${cdnDomain}/${appName}/${normalizedPath}`;
                  modified = true;
                  return `${prefix}${cdnUrl}${suffix}`;
                }
              }
              
              return match;
            },
          );
        }

        // 2) 处理 <link href> 标签（CSS、modulepreload 等）（仅在 CDN 启用时转换）
        if (enabled) {
          newHtml = newHtml.replace(
            /(<link[^>]*\s+href=["'])([^"']+)(["'][^>]*>)/g,
            (match: string, prefix: string, href: string, suffix: string) => {
              // 处理当前应用资源：/assets/xxx.css
              if (href.startsWith('/assets/') && !href.startsWith('/assets/layout/')) {
                const cdnUrl = `${cdnDomain}/${appName}${href}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              
              // 处理布局应用资源：/assets/layout/xxx.css
              if (href.startsWith('/assets/layout/')) {
                const cdnUrl = `${cdnDomain}/layout-app${href}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              
              // 处理相对路径
              if (href.startsWith('./assets/') || href.startsWith('assets/')) {
                const normalizedPath = href.startsWith('./') ? href.substring(2) : href;
                if (normalizedPath.startsWith('assets/layout/')) {
                  const cdnUrl = `${cdnDomain}/layout-app/${normalizedPath}`;
                  modified = true;
                  return `${prefix}${cdnUrl}${suffix}`;
                } else if (normalizedPath.startsWith('assets/')) {
                  const cdnUrl = `${cdnDomain}/${appName}/${normalizedPath}`;
                  modified = true;
                  return `${prefix}${cdnUrl}${suffix}`;
                }
              }
              
              return match;
            },
          );
        }

        // 3) 处理 <img src> 标签（仅在 CDN 启用时转换）
        if (enabled) {
          newHtml = newHtml.replace(
            /(<img[^>]*\s+src=["'])([^"']+)(["'][^>]*>)/g,
            (match: string, prefix: string, src: string, suffix: string) => {
              // 处理当前应用资源：/assets/xxx.png
              if (src.startsWith('/assets/') && !src.startsWith('/assets/layout/')) {
                const cdnUrl = `${cdnDomain}/${appName}${src}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              
              // 处理布局应用资源：/assets/layout/xxx.png
              if (src.startsWith('/assets/layout/')) {
                const cdnUrl = `${cdnDomain}/layout-app${src}`;
                modified = true;
                return `${prefix}${cdnUrl}${suffix}`;
              }
              
              return match;
            },
          );
        }

        // 4) 处理内联的 import() 调用（在 HTML 模板中）
        // 修复 qiankun 注入的内联 import('/assets/index-xxx.js')
        const originExpr =
          `((typeof __INJECTED_PUBLIC_PATH_BY_QIANKUN__!=='undefined'&&__INJECTED_PUBLIC_PATH_BY_QIANKUN__)` +
          `?new URL(__INJECTED_PUBLIC_PATH_BY_QIANKUN__,(typeof location!=='undefined'&&location.origin)||'').origin` +
          `:((typeof location!=='undefined'&&location.origin)||''))`;
        
        newHtml = newHtml.replace(
          /import\(\s*(['"])(\/assets\/(index|main)-[^'"]+)\1\s*\)/g,
          (_m: string, _q: string, absPath: string) => {
            modified = true;
            // 保持原有逻辑，但确保路径正确
            return `import(/* @vite-ignore */ (${originExpr} + '${absPath}'))`;
          },
        );

        // 5) 注入资源加载器初始化脚本和早期 URL 转换脚本
        // 关键：即使 CDN 插件被禁用，预览构建时也需要注入早期 URL 转换脚本
        if (!newHtml.includes('__BTC_RESOURCE_LOADER__') || needsEarlyConverter) {
          // 根据 ENABLE_CDN_ACCELERATION 环境变量决定是否启用 CDN
          const cdnEnabled = process.env.ENABLE_CDN_ACCELERATION !== 'false';
          const isPreviewBuild = process.env.VITE_PREVIEW === 'true';
          
          // 早期 URL 转换脚本（在预览构建时注入，用于在 HTML 解析前转换 CDN URL）
          // 即使 CDN 插件被禁用，预览环境也可能使用包含 CDN URL 的旧构建产物
          const earlyUrlConverterScript = isPreviewBuild ? `
<script>
  (function() {
    // 关键：在 HTML 解析之前就处理 CDN URL，避免浏览器请求 CDN 资源
    // 这个脚本必须在所有其他 script 和 link 标签之前执行
    if (typeof document !== 'undefined') {
      const convertCdnUrl = (url) => {
        if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
          return url;
        }
        try {
          const urlObj = new URL(url);
          if (urlObj.hostname.includes('all.bellis.com.cn') || 
              urlObj.hostname.includes('bellis1.oss-cn-shenzhen.aliyuncs.com')) {
            // 提取路径部分，去掉应用前缀
            let path = urlObj.pathname;
            if (path.includes('/assets/')) {
              path = path.substring(path.indexOf('/assets/'));
            } else if (path.includes('/assets/layout/')) {
              path = path.substring(path.indexOf('/assets/layout/'));
            }
            // 保留查询参数和哈希
            return path + (urlObj.search || '') + (urlObj.hash || '');
          }
        } catch (e) {
          // URL 解析失败，返回原 URL
        }
        return url;
      };
      
      // 拦截 document.createElement，在创建 script 和 link 标签时转换 URL
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = function(tagName, options) {
        const element = originalCreateElement(tagName, options);
        if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'link') {
          const originalSetAttribute = element.setAttribute.bind(element);
          element.setAttribute = function(name, value) {
            if ((name === 'src' || name === 'href') && typeof value === 'string') {
              const convertedUrl = convertCdnUrl(value);
              return originalSetAttribute(name, convertedUrl);
            }
            return originalSetAttribute(name, value);
          };
        }
        return element;
      };
      
      // 处理已存在的 script 和 link 标签（如果 DOM 已经部分解析）
      const processExistingTags = () => {
        if (document.querySelectorAll) {
          document.querySelectorAll('script[src]').forEach((script) => {
            const src = script.getAttribute('src');
            if (src) {
              const convertedUrl = convertCdnUrl(src);
              if (convertedUrl !== src) {
                script.setAttribute('src', convertedUrl);
              }
            }
          });
          document.querySelectorAll('link[href]').forEach((link) => {
            const href = link.getAttribute('href');
            if (href) {
              const convertedUrl = convertCdnUrl(href);
              if (convertedUrl !== href) {
                link.setAttribute('href', convertedUrl);
              }
            }
          });
        }
      };
      
      // 立即处理（如果 DOM 已经部分解析）
      if (document.readyState === 'loading' || document.readyState === 'interactive') {
        processExistingTags();
        // 监听 DOM 变化，处理后续添加的标签
        if (document.addEventListener) {
          document.addEventListener('DOMContentLoaded', processExistingTags);
        }
      } else {
        processExistingTags();
      }
    }
  })();
</script>` : '';
          
          const loaderScript = `
<script>
  (function() {
    // 资源加载器将在运行时模块中初始化
    // 这里只设置基础配置
    if (typeof window !== 'undefined') {
      window.__BTC_CDN_CONFIG__ = {
        appName: '${appName}',
        cdnDomain: '${cdnDomain}',
        ossDomain: 'https://bellis1.oss-cn-shenzhen.aliyuncs.com',
        enabled: ${cdnEnabled}
      };
    }
  })();
</script>`;
          
          // 在 </head> 之前注入（早期 URL 转换脚本必须在最前面，在所有其他 script 和 link 标签之前）
          if (newHtml.includes('</head>')) {
            // 关键：早期 URL 转换脚本必须在 <head> 的最前面，在所有其他标签之前
            // 如果已经有其他 script 标签，在第一个 script 标签之前插入
            if (earlyUrlConverterScript && newHtml.includes('<script')) {
              // 在第一个 <script> 或 <link> 标签之前插入早期转换脚本
              const firstTagMatch = newHtml.match(/<(script|link)[^>]*>/i);
              if (firstTagMatch && firstTagMatch.index !== undefined) {
                newHtml = newHtml.slice(0, firstTagMatch.index) + earlyUrlConverterScript + newHtml.slice(firstTagMatch.index);
                modified = true;
              } else {
                // 如果没有找到 script 或 link 标签，在 </head> 之前插入
                newHtml = newHtml.replace('</head>', `${earlyUrlConverterScript}\n</head>`);
                modified = true;
              }
            }
            // 注入资源加载器配置脚本
            if (!newHtml.includes('__BTC_RESOURCE_LOADER__')) {
              newHtml = newHtml.replace('</head>', `${loaderScript}\n</head>`);
              modified = true;
            }
          } else if (newHtml.includes('</body>')) {
            // 如果没有 </head>，在 </body> 之前注入
            if (earlyUrlConverterScript) {
              newHtml = newHtml.replace('</body>', `${earlyUrlConverterScript}\n</body>`);
              modified = true;
            }
            if (!newHtml.includes('__BTC_RESOURCE_LOADER__')) {
              newHtml = newHtml.replace('</body>', `${loaderScript}\n</body>`);
              modified = true;
            }
          }
        }

        if (modified) {
          console.info(`[cdn-assets] 已为 index.html 中的资源引用转换为 CDN URL`);
        }
        
        return newHtml;
      },
    },
  } as Plugin;
}


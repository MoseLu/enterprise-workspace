/**
 * 动态导入 CDN 转换插件
 * 在构建时拦截代码中的 import() 调用，将 /assets/ 路径的资源转换为使用 CDN 资源加载器
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 使用 console 替代 logger
const logger = {
  warn: (...args: any[]) => console.warn('[dynamic-import-cdn]', ...args),
  error: (...args: any[]) => console.error('[dynamic-import-cdn]', ...args),
  info: (...args: any[]) => console.info('[dynamic-import-cdn]', ...args),
  debug: (...args: any[]) => console.debug('[dynamic-import-cdn]', ...args),
};

import type { Plugin } from 'vite';

export interface DynamicImportCdnOptions {
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
 * 动态导入 CDN 转换插件
 */
export function dynamicImportCdnPlugin(options: DynamicImportCdnOptions): Plugin {
  const {
    appName,
    enabled = process.env.NODE_ENV === 'production' && process.env.ENABLE_CDN_ACCELERATION !== 'false',
    cdnDomain = 'https://all.bellis.com.cn',
  } = options;

  return {
    name: 'dynamic-import-cdn',
    apply: 'build',
    buildStart(){
      if (enabled) {
        console.info(`[dynamic-import-cdn] CDN 动态导入转换已启用，应用: ${appName}, CDN 域名: ${cdnDomain}`);
      } else {
        console.info(`[dynamic-import-cdn] CDN 动态导入转换已禁用`);
      }
    },
    renderChunk(code: string, chunk: any) {
      // 在 renderChunk 阶段处理构建后的代码
      // 此时 import() 调用已经被 Vite 转换为相对路径的 chunk 文件（如 ./index-xxx.js）
      if (!enabled) {
        return null;
      }

      // 只处理 JS chunk 文件
      if (!chunk.fileName.endsWith('.js')) {
        return null;
      }

      // 跳过入口文件（index-xxx.js），因为入口文件是通过 script 标签直接加载的
      // 如果转换入口文件中的 import()，会导致 Blob URL 上下文中的相对路径无法解析
      // 入口文件应该保持原样，让浏览器直接加载，这样相对路径可以正确解析
      if (chunk.isEntry || chunk.fileName.match(/^index-[a-zA-Z0-9]+\.js$/)) {
        return null;
      }

      let modified = false;
      let newCode = code;

      // 匹配 import() 调用，识别 /assets/ 路径的资源
      // 匹配模式：import('...') 或 import("...")
      const importPattern = /import\s*\(\s*(['"])([^'"]+)\1\s*\)/g;

      // 先检查是否有匹配的 import() 调用
      const matches = Array.from(newCode.matchAll(importPattern));
      if (matches.length > 0) {
        console.info(`[dynamic-import-cdn] 在 chunk ${chunk.fileName} 中找到 ${matches.length} 个 import() 调用`);
      }

      newCode = newCode.replace(importPattern, (match: string, quote: string, specifier: string) => {
        // 检查是否是静态资源路径
        // 1. 绝对路径：/assets/xxx.js 或 /assets/layout/xxx.js
        // 2. 相对路径：./assets/xxx.js 或 assets/xxx.js
        // 3. Vite chunk 文件：./index-xxx.js（这些文件在 /assets/ 目录下）
        const isStaticAsset =
          specifier.includes('/assets/') ||
          specifier.includes('/assets/layout/') ||
          specifier.startsWith('./assets/') ||
          specifier.startsWith('assets/') ||
          // Vite 生成的 chunk 文件（相对路径，如 ./index-xxx.js）
          (specifier.startsWith('./') && /\.(js|mjs)$/.test(specifier));

        if (!isStaticAsset) {
          return match; // 非静态资源，保持原样
        }

        modified = true;

        // 规范化路径
        let normalizedPath = specifier;
        if (specifier.startsWith('./')) {
          // 相对路径：./index-xxx.js -> /assets/index-xxx.js
          // 或者：./assets/xxx.js -> /assets/xxx.js
          if (specifier.startsWith('./assets/')) {
            normalizedPath = '/' + specifier.substring(2);
          } else {
            // Vite chunk 文件：./index-xxx.js -> /assets/index-xxx.js
            normalizedPath = '/assets/' + specifier.substring(2);
          }
        } else if (!specifier.startsWith('/')) {
          // 非相对路径且非绝对路径：assets/xxx.js -> /assets/xxx.js
          normalizedPath = '/' + specifier;
        } else {
          // 已经是绝对路径
          normalizedPath = specifier;
        }

        // 转换为使用资源加载器的代码
        // 使用 window.__BTC_RESOURCE_LOADER__ 加载资源，支持三级降级
        // 注意：使用规范化后的路径（normalizedPath）作为资源路径
        return `(async () => {
          const loader = window.__BTC_RESOURCE_LOADER__;
          const config = window.__BTC_CDN_CONFIG__;
          if (loader && config?.enabled) {
            try {
              // 使用资源加载器加载（自动降级：CDN -> OSS -> 本地）
              // 使用规范化后的路径：相对路径 ./index-xxx.js 会被转换为 /assets/index-xxx.js
              const response = await loader.loadResource(${quote}${normalizedPath}${quote}, {
                appName: ${quote}${appName}${quote},
                cdnDomain: config.cdnDomain || ${quote}${cdnDomain}${quote},
                ossDomain: config.ossDomain || 'https://bellis1.oss-cn-shenzhen.aliyuncs.com'
              });
              let code = await response.text();

              // 处理模块代码中的相对路径导入，转换为绝对路径
              // 因为 Blob URL 不是分层 URL，无法解析相对路径
              // 匹配所有类型的相对路径导入（动态导入和静态导入）
              const backslash = String.fromCharCode(92);
              const singleQuote = String.fromCharCode(39);
              const doubleQuote = '"';
              const quoteClass = '([' + doubleQuote + singleQuote + '])';

              // 匹配动态导入：import('./path') 或 import("./path")，包括带选项的情况
              // 例如：import('./auth-api-dsKkQMdu.js') 或 import("./auth-api-dsKkQMdu.js", { assert: { type: 'json' } })
              const dynamicPatternParts = [
                'import', backslash, 's*', backslash, '(', backslash, 's*',
                quoteClass,
                '(', backslash, '.', backslash, '/',
                '[^', doubleQuote, singleQuote, ']+',
                ')', backslash, '1'
              ];
              const dynamicImportPattern = new RegExp(dynamicPatternParts.join(''), 'g');
              let dynamicReplaceCount = 0;
              code = code.replace(dynamicImportPattern, (match, quote, relPath) => {
                // 将相对路径转换为绝对路径
                // 例如：./auth-api-dsKkQMdu.js -> /assets/auth-api-dsKkQMdu.js
                if (relPath.startsWith('./')) {
                  const fileName = relPath.substring(2);
                  const absPath = '/assets/' + fileName;
                  dynamicReplaceCount++;
                  return match.replace(relPath, absPath);
                }
                return match;
              });
              if (dynamicReplaceCount > 0) {
                console.info('[dynamic-import-cdn] 已转换', dynamicReplaceCount, '个动态导入相对路径');
              }

              // 匹配静态导入：import ... from './path' 或 import ... from "./path"
              // 包括：import x from './path', import { x } from './path', import * as x from './path' 等
              const staticPatternParts = [
                '(import', backslash, 's+',
                '(?:[^', doubleQuote, singleQuote, ']*from', backslash, 's+', ')?)',
                quoteClass,
                '(', backslash, '.', backslash, '/',
                '[^', doubleQuote, singleQuote, ']+',
                ')', backslash, '2'
              ];
              const staticImportPattern = new RegExp(staticPatternParts.join(''), 'g');
              let staticReplaceCount = 0;
              code = code.replace(staticImportPattern, (match, prefix, quote, relPath) => {
                // 将相对路径转换为绝对路径
                if (relPath.startsWith('./')) {
                  const fileName = relPath.substring(2);
                  const absPath = '/assets/' + fileName;
                  staticReplaceCount++;
                  return prefix + quote + absPath + quote;
                }
                return match;
              });
              if (staticReplaceCount > 0) {
                console.info('[dynamic-import-cdn] 已转换', staticReplaceCount, '个静态导入相对路径');
              }

              // 创建 Blob URL 用于动态 import（保持 ES 模块语义和相对路径解析）
              const blob = new Blob([code], { type: 'application/javascript' });
              const blobUrl = URL.createObjectURL(blob);

              try {
                // 使用动态 import 执行代码（保持 ES 模块语义）
                return await import(/* @vite-ignore */ blobUrl);
              } finally {
                URL.revokeObjectURL(blobUrl);
              }
            } catch (error) {
              console.warn('[dynamic-import-cdn] 资源加载器失败，回退到本地路径:', ${quote}${specifier}${quote}, error);
              // 关键：回退时必须使用本地路径（而不是 CDN URL），确保能够从 nginx 服务器加载
              // 如果 specifier 已经是完整 URL（CDN URL），需要提取路径部分
              let localPath = ${quote}${specifier}${quote};
              if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
                // 是完整 URL，提取路径部分（去掉域名和应用前缀）
                try {
                  const url = new URL(localPath);
                  let path = url.pathname;
                  // 去掉应用前缀（如 /logistics-app/assets/xxx.js -> /assets/xxx.js）
                  if (path.includes('/assets/')) {
                    path = path.substring(path.indexOf('/assets/'));
                  } else if (path.includes('/assets/layout/')) {
                    path = path.substring(path.indexOf('/assets/layout/'));
                  }
                  // 保留查询参数和哈希
                  localPath = path + (url.search || '') + (url.hash || '');
                } catch (e) {
                  // URL 解析失败，使用原始 specifier
                }
              } else if (!localPath.startsWith('/')) {
                // 相对路径，转换为绝对路径
                localPath = '/assets/' + localPath.replace(/^\\.\\//, '');
              }
              // 使用完整 URL（包括域名）而不是绝对路径
              // 因为 Blob URL 不是分层 URL，无法解析绝对路径（如 /assets/xxx.js）
              // 必须使用完整的 URL（如 https://domain.com/assets/xxx.js）
              const fallbackUrl = new URL(localPath, window.location.origin).href;
              return import(fallbackUrl);
            }
          } else {
            // CDN 未启用，使用原始路径
            return import(${quote}${specifier}${quote});
          }
        })()`;
      });

      if (modified) {
        console.info(`[dynamic-import-cdn] 已转换 chunk 文件中的动态导入: ${chunk.fileName}`);
      }

      return modified ? { code: newCode, map: null } : null;
    },
    transform(code: string, id: string) {
      // transform 阶段：处理源代码中的 import() 调用（可选，主要用于调试）
      if (!enabled) {
        return null;
      }

      // 只处理 JS/TS 文件
      if (!id.match(/\.(js|ts|vue|jsx|tsx)$/)) {
        return null;
      }

      // 跳过 node_modules
      if (id.includes('node_modules')) {
        return null;
      }

      // 检查是否有 import() 调用（仅用于日志，实际转换在 renderChunk 阶段）
      const importPattern = /import\s*\(\s*(['"])([^'"]+)\1\s*\)/g;
      const matches = Array.from(code.matchAll(importPattern));
      if (matches.length > 0) {
        // 只记录，不转换（转换在 renderChunk 阶段进行）
      }

      return null;
    },
  } as Plugin;
}


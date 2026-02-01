/**
 * URL 相关插件
 * 确保 base URL 正确
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 使用 console 替代 logger
const logger = {
  warn: (...args: any[]) => console.warn('[url]', ...args),
  error: (...args: any[]) => console.error('[url]', ...args),
  info: (...args: any[]) => console.info('[url]', ...args),
  debug: (...args: any[]) => console.debug('[url]', ...args),
};

import type { Plugin } from 'vite';
import type { ChunkInfo, OutputOptions, OutputBundle } from 'rollup';
import { existsSync, readFileSync } from 'node:fs';
import { resolve as resolvePath, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getBuildTimestampForQuery(): string {
  // 优先使用全量构建脚本注入的时间戳（与 addVersionPlugin 保持一致）
  if (process.env.BTC_BUILD_TIMESTAMP) {
    return process.env.BTC_BUILD_TIMESTAMP;
  }
  // 其次读取 .build-timestamp（与 addVersionPlugin 的实现一致）
  const timestampFile = resolvePath(__dirname, '../../../.build-timestamp');
  if (existsSync(timestampFile)) {
    try {
      const ts = readFileSync(timestampFile, 'utf-8').trim();
      if (ts) return ts;
    } catch {
      // ignore
    }
  }
  // 最后兜底：生成一个（不写回文件，避免副作用）
  return Date.now().toString(36);
}

/**
 * 确保 base URL 插件
 */
export function ensureBaseUrlPlugin(baseUrl: string, appHost: string, appPort: number, mainAppPort: string): Plugin {
  const isPreviewBuild = baseUrl.startsWith('http');
  const qiankunIndexImportRegex = /import\((['"])\/assets\/(index|main)-([^'"]+)\1\)/g;
  const buildTimestamp = getBuildTimestampForQuery();
  const qiankunIndexImportInHtmlRegex = /import\(\s*(['"])(\/assets\/(index|main)-[^'"]+)\1\s*\)/g;

  /**
   * 修复 vite-plugin-qiankun 生成的包装器里使用绝对路径 import('/assets/index-xxx.js') 的问题：
   * - 在 qiankun 沙箱里，这会按“宿主 origin”解析，导致子应用入口 chunk 被错误请求到 layout 域名
   * - 这里改为：优先使用 qiankun 注入的 __INJECTED_PUBLIC_PATH_BY_QIANKUN__（通常为子应用 origin），否则回退到 window.location.origin
   */
  function patchQiankunIndexImports(code: string): { code: string; modified: boolean } {
    if (!qiankunIndexImportRegex.test(code)) {
      return { code, modified: false };
    }
    qiankunIndexImportRegex.lastIndex = 0;

    const helperName = '__btcQiankunAssetOrigin';
    const tsName = '__btcBuildV';
    const helperDecl =
      `const ${helperName}=(()=>{try{const p=window&&window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;` +
      `if(p&&typeof p==='string'){const s=p.replace(/\\/$/,'');` +
      `if(s.startsWith('http')||s.startsWith('//'))return s;` +
      `return (window.location&&window.location.origin?window.location.origin:'')+s;}` +
      `}catch{}return (window.location&&window.location.origin)?window.location.origin:'';})();`;
    const tsDecl = `const ${tsName}='${buildTimestamp}';`;

    let newCode = code.replace(qiankunIndexImportRegex, (_m, _q, _kind, rest) => {
      // rest: "xxxx.js" 里的余下部分（hash + .js）
      // 关键：追加 ?v= 构建时间戳，避免宿主/浏览器/CDN 复用旧入口脚本导致持续请求旧 chunk
      return `import(/* @vite-ignore */ (${helperName} + '/assets/${_kind}-${rest}' + '?v=' + ${tsName}))`;
    });

    if (!newCode.includes(helperDecl)) {
      // 尽量少侵入：只在需要时插入 helper，一次即可
      newCode = `${tsDecl}\n${helperDecl}\n${newCode}`;
    }
    return { code: newCode, modified: true };
  }

  return {
    name: 'ensure-base-url',
    renderChunk(code: string, chunk: ChunkInfo, _options: any) {
      // 不再跳过 vendor 等第三方库，确保所有资源路径都正确
      // 因为 vendor 等库中也可能包含动态导入的资源路径

      let newCode = code;
      let modified = false;

      // 关键：修复 qiankun 包装器的绝对 /assets/index-xxx.js 动态导入（跨域宿主会 404）
      {
        const patched = patchQiankunIndexImports(newCode);
        if (patched.modified) {
          newCode = patched.code;
          modified = true;
        }
      }

      if (isPreviewBuild) {
        const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)(\?[^"'`\s]*)?/g;
        if (relativePathRegex.test(newCode)) {
          newCode = newCode.replace(relativePathRegex, (_match, quote, path, query = '') => {
            return `${quote}${baseUrl.replace(/\/$/, '')}${path}${query}`;
          });
          modified = true;
        }
      }

      // 关键：修复错误的端口（主应用端口 -> 当前应用端口）
      // 匹配 http://localhost:4180/assets/xxx 或 http://10.80.8.107:4180/assets/xxx
      const wrongPortHttpRegex = new RegExp(`http://(${appHost}|localhost):${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
      if (wrongPortHttpRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortHttpRegex, (_match, host, path, query = '') => {
          // 预览构建：使用 baseUrl（包含完整 URL）
          if (isPreviewBuild) {
            return `${baseUrl.replace(/\/$/, '')}${path}${query}`;
          }
          // 开发构建：使用当前应用端口
          return `http://${host}:${appPort}${path}${query}`;
        });
        modified = true;
      }

          // 匹配 //localhost:4180/assets/xxx 或 //{devHost}:4180/assets/xxx
      const wrongPortProtocolRegex = new RegExp(`//(${appHost}|localhost):${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
      if (wrongPortProtocolRegex.test(newCode)) {
        newCode = newCode.replace(wrongPortProtocolRegex, (_match, host, path, query = '') => {
          // 预览构建：使用 baseUrl（包含完整 URL）
          if (isPreviewBuild) {
            return `${baseUrl.replace(/\/$/, '')}${path}${query}`;
          }
          // 开发构建：使用当前应用端口
          return `//${host}:${appPort}${path}${query}`;
        });
        modified = true;
      }

      const patterns = [
        {
          regex: new RegExp(`(http://)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (_match: string, protocol: string, _host: string, path: string, query: string = '') => {
            return `${protocol}${appHost}:${appPort}${path}${query}`;
          },
        },
        {
          regex: new RegExp(`(//)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (_match: string, protocol: string, _host: string, path: string, query: string = '') => {
            return `${protocol}${appHost}:${appPort}${path}${query}`;
          },
        },
        {
          regex: new RegExp(`(["'\`])(http://)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (_match: string, quote: string, protocol: string, _host: string, path: string, query: string = '') => {
            return `${quote}${protocol}${appHost}:${appPort}${path}${query}`;
          },
        },
        {
          regex: new RegExp(`(["'\`])(//)(localhost|${appHost}):${mainAppPort}(/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g'),
          replacement: (_match: string, quote: string, protocol: string, _host: string, path: string, query: string = '') => {
            return `${quote}${protocol}${appHost}:${appPort}${path}${query}`;
          },
        },
      ];

      for (const pattern of patterns) {
        if (pattern.regex.test(newCode)) {
          newCode = newCode.replace(pattern.regex, pattern.replacement as any);
          modified = true;
        }
      }

      if (modified) {
        console.info(`[ensure-base-url] 修复了 ${chunk.fileName} 中的资源路径 (${mainAppPort} -> ${appPort})`);
        return {
          code: newCode,
          map: null,
        };
      }

      return null;
    },
    generateBundle(_options: OutputOptions, bundle: OutputBundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const c: any = chunk;
        if (c.type === 'chunk' && c.code) {
          // 不再跳过 vendor 等第三方库，确保所有资源路径都正确
          let newCode = c.code;
          let modified = false;

          // 关键：修复 qiankun 包装器的绝对 /assets/index-xxx.js 动态导入（跨域宿主会 404）
          {
            const patched = patchQiankunIndexImports(newCode);
            if (patched.modified) {
              newCode = patched.code;
              modified = true;
            }
          }

          if (isPreviewBuild) {
            const relativePathRegex = /(["'`])(\/assets\/[^"'`\s]+)(\?[^"'`\s]*)?/g;
            if (relativePathRegex.test(newCode)) {
              newCode = newCode.replace(relativePathRegex, (_match: string, quote: string, path: string, query: string = '') => {
                return `${quote}${baseUrl.replace(/\/$/, '')}${path}${query}`;
              });
              modified = true;
            }
          }

          // 关键：修复错误的端口（主应用端口 -> 当前应用端口）
          // 匹配 http://localhost:4180/assets/xxx 或 http://{devHost}:4180/assets/xxx
          const wrongPortHttpRegex = new RegExp(`http://(${appHost}|localhost):${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
          if (wrongPortHttpRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortHttpRegex, (_match: string, host: string, path: string, query: string = '') => {
              // 预览构建：使用 baseUrl（包含完整 URL）
              if (isPreviewBuild) {
                return `${baseUrl.replace(/\/$/, '')}${path}${query}`;
              }
              // 开发构建：使用当前应用端口
              return `http://${host}:${appPort}${path}${query}`;
            });
            modified = true;
          }

          // 匹配 //localhost:4180/assets/xxx 或 //{devHost}:4180/assets/xxx
          const wrongPortProtocolRegex = new RegExp(`//(${appHost}|localhost):${mainAppPort}(/assets/[^"'\`\\s]+)(\\?[^"'\`\\s]*)?`, 'g');
          if (wrongPortProtocolRegex.test(newCode)) {
            newCode = newCode.replace(wrongPortProtocolRegex, (_match: string, host: string, path: string, query: string = '') => {
              // 预览构建：使用 baseUrl（包含完整 URL）
              if (isPreviewBuild) {
                return `${baseUrl.replace(/\/$/, '')}${path}${query}`;
              }
              // 开发构建：使用当前应用端口
              return `//${host}:${appPort}${path}${query}`;
            });
            modified = true;
          }

          if (modified) {
            (chunk as any).code = newCode;
            console.info(`[ensure-base-url] 在 generateBundle 中修复了 ${fileName} 中的资源路径`);
          }
        } else if (c.type === 'asset' && fileName === 'index.html') {
          // 处理 HTML 文件中的资源引用
          // 注意：如果 Vite 配置正确（base: '/', assetsDir: 'assets', rollupOptions.output.chunkFileNames: 'assets/[name]-[hash].js'），
          // Vite 应该自动生成正确的路径，不需要修复。
          // 这里只处理预览构建时的端口修复，以及修复相对路径。
          let htmlContent = ((c as any).source) as string;
          let htmlModified = false;

          // 修复相对路径 ./assets/ 为绝对路径 /assets/（如果出现）
          const relativeAssetRegex = /(href|src)=["'](\.\/assets\/[^"']+)(\?[^"']*)?["']/g;
          if (relativeAssetRegex.test(htmlContent)) {
            htmlContent = htmlContent.replace(relativeAssetRegex, (_match, attr, path, query = '') => {
              // 将相对路径转换为绝对路径
              const absolutePath = path.replace(/^\./, '');
              htmlModified = true;
              console.info(`[ensure-base-url] 修复相对路径: ${path} -> ${absolutePath}`);
              return `${attr}="${absolutePath}${query}"`;
            });
          }

          // 关键：修复 vite-plugin-qiankun 注入到 index.html 内联脚本中的 import('/assets/index-xxx.js')
          // 说明：qiankun 会把该内联脚本 eval 成 VM 执行；如果仍是 /assets/ 绝对路径，就会按宿主域名解析（导致 layout 域名 404）。
          // 这里改为：优先用 __INJECTED_PUBLIC_PATH_BY_QIANKUN__（子应用 publicPath/origin），并追加 ?v= 构建时间戳，避免缓存旧入口。
          if (qiankunIndexImportInHtmlRegex.test(htmlContent)) {
            qiankunIndexImportInHtmlRegex.lastIndex = 0;
            const originExpr =
              `((typeof __INJECTED_PUBLIC_PATH_BY_QIANKUN__!=='undefined'&&__INJECTED_PUBLIC_PATH_BY_QIANKUN__)` +
              `?new URL(__INJECTED_PUBLIC_PATH_BY_QIANKUN__,(typeof location!=='undefined'&&location.origin)||'').origin` +
              `:((typeof location!=='undefined'&&location.origin)||''))`;
            htmlContent = htmlContent.replace(qiankunIndexImportInHtmlRegex, (_m, _q, absPath) => {
              htmlModified = true;
              return `import(/* @vite-ignore */ (${originExpr} + '${absPath}' + '?v=${buildTimestamp}'))`;
            });
            console.info(`[ensure-base-url] 修复 index.html 内联 import(/assets/index-*.js) 并追加 v=${buildTimestamp}`);
          }

          // 如果出现根目录的资源路径（如 /index.js），说明配置有问题，记录警告
          // 正常情况下，Vite 应该生成 /assets/[name]-[hash].js 这样的路径
          const rootJsRegex = /(href|src)=["'](\/([^/]+\.(js|mjs)))(\?[^"']*)?["']/g;
          if (rootJsRegex.test(htmlContent)) {
            const matches = htmlContent.match(rootJsRegex);
            if (matches) {
              console.warn(`[ensure-base-url] ⚠️  检测到根目录资源路径，这通常不应该出现。请检查 Vite 配置（base, assetsDir, rollupOptions.output.chunkFileNames）:`, matches);
              // 修复这些路径（作为兜底方案）
              htmlContent = htmlContent.replace(rootJsRegex, (_match, attr, path, fileName, _ext, query = '') => {
                if (!path.startsWith('/assets/') && !path.startsWith('/favicon') && !path.startsWith('/logo') && !path.match(/\.(png|jpg|jpeg|gif|svg|ico|json)$/)) {
                  const newPath = `/assets/${fileName}`;
                  htmlModified = true;
                  console.info(`[ensure-base-url] 修复根目录资源路径（兜底）: ${path} -> ${newPath}`);
                  return `${attr}="${newPath}${query}"`;
                }
                return _match;
              });
            }
          }

          const rootCssRegex = /(href|src)=["'](\/([^/]+\.css))(\?[^"']*)?["']/g;
          if (rootCssRegex.test(htmlContent)) {
            const matches = htmlContent.match(rootCssRegex);
            if (matches) {
              console.warn(`[ensure-base-url] ⚠️  检测到根目录 CSS 路径，这通常不应该出现。请检查 Vite 配置:`, matches);
              // 修复这些路径（作为兜底方案）
              htmlContent = htmlContent.replace(rootCssRegex, (_match, attr, path, fileName, query = '') => {
                if (!path.startsWith('/assets/')) {
                  const newPath = `/assets/${fileName}`;
                  htmlModified = true;
                  console.info(`[ensure-base-url] 修复根目录 CSS 路径（兜底）: ${path} -> ${newPath}`);
                  return `${attr}="${newPath}${query}"`;
                }
                return _match;
              });
            }
          }

          if (htmlModified) {
            (chunk as any).source = htmlContent;
            console.info(`[ensure-base-url] 修复了 index.html 中的资源路径`);
          }
        }
      }
    },
  } as Plugin;
}


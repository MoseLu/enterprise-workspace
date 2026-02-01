/**
 * 版本号插件
 * 为 HTML 文件中的资源引用添加全局统一的构建时间戳版本号
 * 用于浏览器缓存控制，每次构建都会生成新的时间戳
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 使用 console 替代 logger
const logger = {
  warn: (...args: any[]) => console.warn('[version]', ...args),
  error: (...args: any[]) => console.error('[version]', ...args),
  info: (...args: any[]) => console.info('[version]', ...args),
  debug: (...args: any[]) => console.debug('[version]', ...args),
};

import type { Plugin } from 'vite';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取或生成全局构建时间戳版本号
 * 优先从环境变量读取，如果没有则从构建时间戳文件读取，都没有则生成新的
 */
function getBuildTimestamp(): string {
  // 1. 优先从环境变量读取（由构建脚本设置）
  if (process.env.BTC_BUILD_TIMESTAMP) {
    return process.env.BTC_BUILD_TIMESTAMP;
  }

  // 2. 从构建时间戳文件读取（如果存在）
  const timestampFile = resolve(__dirname, '../../../.build-timestamp');
  if (existsSync(timestampFile)) {
    try {
      const timestamp = readFileSync(timestampFile, 'utf-8').trim();
      if (timestamp) {
        return timestamp;
      }
    } catch (error) {
      // 忽略读取错误
    }
  }

  // 3. 生成新的时间戳并保存到文件（确保所有应用使用同一个）
  // 使用36进制编码，生成更短的版本号（包含字母和数字，如 l3k2j1h）
  const timestamp = Date.now().toString(36);
  try {
    writeFileSync(timestampFile, timestamp, 'utf-8');
  } catch (error) {
    // 忽略写入错误
  }
  return timestamp;
}

/**
 * 为 HTML 资源引用添加版本号插件
 */
export function addVersionPlugin(): Plugin {
  const buildTimestamp = getBuildTimestamp();

  return {
    name: 'add-version',
    apply: 'build',
    buildStart() {
      console.info(`[add-version] 构建时间戳版本号: ${buildTimestamp}`);
    },
    // 关键：使用 transformIndexHtml（Vite 内部是在后置阶段生成/写入 index.html，generateBundle 很容易拿不到最终 HTML）
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        let newHtml = html;
        let modified = false;

        // 0) 移除空的 <style></style> 标签
        // 说明：在微前端架构下，子应用在生产环境被 qiankun 加载时，主应用已经提供了 loading，
        // 子应用的 style 标签可能被处理成空的。移除空标签可以简化 HTML 结构。
        // 开发环境下，子应用独立运行，style 标签有内容（loading 样式），不会被移除。
        const emptyStyleRegex = /<style>\s*<\/style>/gi;
        if (emptyStyleRegex.test(newHtml)) {
          newHtml = newHtml.replace(emptyStyleRegex, '');
          modified = true;
        }

        // 1) 为 <script src> 添加/更新 v
        //
        // 关键：不要给 ESM module script（type="module"）追加 ?v
        // 否则同一个模块会同时以「带 v」和「不带 v」（静态 import 生成的 URL）两套 URL 被加载，
        // 在微前端/重复加载入口脚本场景下会导致模块执行两次，从而触发类似 ECharts 的重复注册断言。
        newHtml = newHtml.replace(
          /(<script[^>]*\s+src=["'])([^"']+)(["'][^>]*>)/g,
          (match: string, prefix: string, src: string, suffix: string) => {
            const isModuleScript = /type\s*=\s*["']module["']/i.test(match);
            const isAssets = src.startsWith('/assets/') || src.startsWith('./assets/');

            // 对 module script：强制移除 v，保证 URL 与打包产物内部 import 保持一致
            if (isModuleScript && isAssets) {
              const cleaned = src.replace(/[?&]v=[^&'"]*/g, '').replace(/\?&/, '?').replace(/[?&]$/, '');
              if (cleaned !== src) {
                modified = true;
                return `${prefix}${cleaned}${suffix}`;
              }
              return match;
            }

            if (src.includes('?v=') || src.includes('&v=')) {
              const updated = src.replace(/[?&]v=[^&'"]*/g, `?v=${buildTimestamp}`);
              if (updated !== src) {
                modified = true;
                return `${prefix}${updated}${suffix}`;
              }
              return match;
            }
            if (isAssets) {
              modified = true;
              const sep = src.includes('?') ? '&' : '?';
              return `${prefix}${src}${sep}v=${buildTimestamp}${suffix}`;
            }
            return match;
          },
        );

        // 2) 为 <link href> 添加/更新 v
        //
        // 同上：modulepreload 属于 ESM 依赖图的一部分，追加 ?v 会让预加载 URL 与 import URL 不一致，
        // 造成重复请求甚至重复执行（在某些 loader 场景下）。
        newHtml = newHtml.replace(
          /(<link[^>]*\s+href=["'])([^"']+)(["'][^>]*>)/g,
          (match: string, prefix: string, href: string, suffix: string) => {
            const isModulePreload = /\srel\s*=\s*["']modulepreload["']/i.test(match);
            const isAssets = href.startsWith('/assets/') || href.startsWith('./assets/');

            if (isModulePreload && isAssets) {
              const cleaned = href.replace(/[?&]v=[^&'"]*/g, '').replace(/\?&/, '?').replace(/[?&]$/, '');
              if (cleaned !== href) {
                modified = true;
                return `${prefix}${cleaned}${suffix}`;
              }
              return match;
            }

            if (href.includes('?v=') || href.includes('&v=')) {
              const updated = href.replace(/[?&]v=[^&'"]*/g, `?v=${buildTimestamp}`);
              if (updated !== href) {
                modified = true;
                return `${prefix}${updated}${suffix}`;
              }
              return match;
            }
            if (isAssets) {
              modified = true;
              const sep = href.includes('?') ? '&' : '?';
              return `${prefix}${href}${sep}v=${buildTimestamp}${suffix}`;
            }
            return match;
          },
        );

        // 3) 关键：修复 qiankun 注入的内联 import('/assets/index-xxx.js')，避免被宿主域名解析
        // 注意：这里也不要追加 ?v，避免形成「带 v / 不带 v」两套入口 URL，导致入口模块被重复执行。
        // 关键：在 qiankun sandbox 中更可靠的写法是直接读全局变量 __INJECTED_PUBLIC_PATH_BY_QIANKUN__
        // 而不是 window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__（window 可能被 proxy 重写/不包含 location）。
        const originExpr =
          `((typeof __INJECTED_PUBLIC_PATH_BY_QIANKUN__!=='undefined'&&__INJECTED_PUBLIC_PATH_BY_QIANKUN__)` +
          `?new URL(__INJECTED_PUBLIC_PATH_BY_QIANKUN__,(typeof location!=='undefined'&&location.origin)||'').origin` +
          `:((typeof location!=='undefined'&&location.origin)||''))`;
        newHtml = newHtml.replace(
          /import\(\s*(['"])(\/assets\/(index|main)-[^'"]+)\1\s*\)/g,
          (_m: string, _q: string, absPath: string) => {
            modified = true;
            return `import(/* @vite-ignore */ (${originExpr} + '${absPath}'))`;
          },
        );

        if (modified) {
          console.info(`[add-version] 已为 index.html 中的资源引用添加版本号: v=${buildTimestamp}`);
          return newHtml;
        }
        return html;
      },
    },
  } as Plugin;
}


/**
 * CSS 相关插件
 * 确保 CSS 文件被正确打包
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 使用 console 替代 logger
const logger = {
  warn: (...args: any[]) => console.warn('[ensure-css]', ...args),
  error: (...args: any[]) => console.error('[ensure-css]', ...args),
  info: (...args: any[]) => console.info('[ensure-css]', ...args),
  debug: (...args: any[]) => console.debug('[ensure-css]', ...args),
};

import type { Plugin } from 'vite';
import type { OutputOptions, OutputBundle } from 'rollup';

/**
 * 确保 CSS 文件被正确打包的插件
 */
export function ensureCssPlugin(): Plugin {
  return {
    name: 'ensure-css-plugin',
    generateBundle(_options: OutputOptions, bundle: OutputBundle) {
      const jsFiles = Object.keys(bundle).filter(file => file.endsWith('.js'));
      let hasInlineCss = false;
      const suspiciousFiles: string[] = [];

      jsFiles.forEach(file => {
        const chunk = bundle[file] as any;
        if (chunk && chunk.code && typeof chunk.code === 'string') {
          const code = chunk.code;

          const isModulePreload = code.includes('modulepreload') || code.includes('relList');
          if (isModulePreload) return;

          const isKnownLibrary = file.includes('vue-core') ||
                                 file.includes('element-plus') ||
                                 file.includes('vendor') ||
                                 file.includes('vue-i18n') ||
                                 file.includes('vue-router') ||
                                 file.includes('lib-echarts') ||
                                 file.includes('module-') ||
                                 file.includes('app-composables') ||
                                 file.includes('app-pages');
          if (isKnownLibrary) return;

          const hasStyleElementCreation = /document\.createElement\(['"]style['"]\)/.test(code) &&
            /\.(textContent|innerHTML)\s*=/.test(code) &&
            /\{[^}]{10,}\}/.test(code);

          const hasInsertStyleWithCss = /insertStyle\s*\(/.test(code) &&
            /text\/css/.test(code) &&
            /\{[^}]{20,}\}/.test(code);

          const styleTagMatch = code.match(/<style[^>]*>/);
          const hasStyleTagWithContent = styleTagMatch &&
            !styleTagMatch[0].includes("'") &&
            !styleTagMatch[0].includes('"') &&
            /\{[^}]{20,}\}/.test(code);

          const hasInlineCssString = /['"`][^'"`]{50,}:\s*[^'"`]{10,};\s*[^'"`]{10,}['"`]/.test(code) &&
            /(color|background|width|height|margin|padding|border|display|position|flex|grid)/.test(code);

          if (hasStyleElementCreation || hasInsertStyleWithCss || hasStyleTagWithContent || hasInlineCssString) {
            hasInlineCss = true;
            suspiciousFiles.push(file);
            const patterns: string[] = [];
            if (hasStyleElementCreation) patterns.push('动态创建 style 元素');
            if (hasInsertStyleWithCss) patterns.push('insertStyle 函数');
            if (hasStyleTagWithContent) patterns.push('<style> 标签');
            if (hasInlineCssString) patterns.push('内联 CSS 字符串');
            console.warn(`[ensure-css-plugin] ⚠️ 警告：在 ${file} 中检测到可能的内联 CSS（模式：${patterns.join(', ')}）`);
          }
        }
      });

      if (hasInlineCss) {
        console.warn('[ensure-css-plugin] ⚠️ 警告：检测到 CSS 可能被内联到 JS 中，这会导致 qiankun 无法正确加载样式');
        console.warn(`[ensure-css-plugin] 可疑文件：${suspiciousFiles.join(', ')}`);
        console.warn('[ensure-css-plugin] 请检查 vite-plugin-qiankun 配置和 build.assetsInlineLimit 设置');
      }
    },
    writeBundle(_options: OutputOptions, bundle: OutputBundle) {
      const cssFiles = Object.keys(bundle).filter(file => file.endsWith('.css'));
      if (cssFiles.length === 0) {
        console.error('[ensure-css-plugin] ❌ 错误：构建产物中无 CSS 文件！');
        console.error('[ensure-css-plugin] 请检查：');
        console.error('1. 入口文件是否静态导入全局样式（index.css/uno.css/element-plus.css）');
        console.error('2. 是否有 Vue 组件中使用 <style> 标签');
        console.error('3. UnoCSS 配置是否正确，是否导入 @unocss all');
        console.error('4. vite-plugin-qiankun 的 useDevMode 是否在生产环境正确关闭');
        console.error('5. build.assetsInlineLimit 是否设置为 0（禁止内联）');
      } else {
        console.info(`[ensure-css-plugin] ✅ 成功打包 ${cssFiles.length} 个 CSS 文件：`, cssFiles);
        cssFiles.forEach(file => {
          const asset = bundle[file] as any;
          if (asset && asset.source) {
            const sizeKB = (asset.source.length / 1024).toFixed(2);
            console.info(`  - ${file}: ${sizeKB}KB`);
          } else if (asset && asset.fileName) {
            console.info(`  - ${asset.fileName || file}`);
          }
        });
      }
    },
  } as Plugin;
}


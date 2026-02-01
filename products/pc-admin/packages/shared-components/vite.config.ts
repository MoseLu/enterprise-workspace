import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import dts from 'vite-plugin-dts';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';
import type { Plugin } from 'vite';

// 构建日志插件
function buildLogPlugin(): Plugin {
  return {
    name: 'build-log',
    buildStart() {
      console.log('\n📦 开始构建 @btc/shared-components...');
      console.log('   - 输入文件: src/index.ts');
      console.log('   - 输出格式: ESM + CJS');
      console.log('   - 类型声明: dist/*.d.ts\n');
    },
    buildEnd(error) {
      if (error) {
        console.error('\n❌ @btc/shared-components 构建失败！');
        console.error('   错误:', error.message);
      } else {
        console.log('\n✅ @btc/shared-components 构建成功！');
        console.log('   - 输出文件: dist/index.mjs (ESM)');
        console.log('   - 输出文件: dist/index.js (CJS)');
        console.log('   - 样式文件: dist/style.css');
        console.log('   - 类型声明: dist/*.d.ts\n');
      }
    },
  };
}

// 复制 dark-theme.css 到 dist 目录的插件
function copyDarkThemePlugin(): Plugin {
  return {
    name: 'copy-dark-theme',
    writeBundle() {
      const srcFile = resolve(__dirname, 'src/styles/dark-theme.css');
      const distDir = resolve(__dirname, 'dist/styles');
      const distFile = resolve(distDir, 'dark-theme.css');

      try {
        mkdirSync(distDir, { recursive: true });
        copyFileSync(srcFile, distFile);
        console.log('[copy-dark-theme] ✓ 已复制 dark-theme.css 到 dist/styles/');
      } catch (error) {
        console.error('[copy-dark-theme] ✗ 复制失败:', error);
      }
    },
  } as Plugin;
}

export default defineConfig({
  resolve: {
    alias: {
      '@btc-common': resolve(__dirname, 'src/common'),
      '@btc-components': resolve(__dirname, 'src/components'),
      '@btc-crud': resolve(__dirname, 'src/crud'),
      '@btc-styles': resolve(__dirname, 'src/styles'),
      '@btc-locales': resolve(__dirname, 'src/locales'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@btc-assets': resolve(__dirname, 'src/assets'), // 添加 @btc-assets 别名，用于图片资源导入
      '@plugins': resolve(__dirname, 'src/plugins'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@btc/shared-components': resolve(__dirname, 'src'),
      // 添加 @configs 别名，指向 shared-core 的 configs 目录（用于开发环境）
      // 在构建时，这些模块会被标记为 external，不会被打包
      '@configs': resolve(__dirname, '../shared-core/src/configs'),
      // 图表相关别名（具体文件路径放在前面，确保优先匹配，去掉 .ts 扩展名让 Vite 自动处理）
      '@charts-utils/css-var': resolve(__dirname, 'src/charts/utils/css-var'),
      '@charts-utils/color': resolve(__dirname, 'src/charts/utils/color'),
      '@charts-utils/gradient': resolve(__dirname, 'src/charts/utils/gradient'),
      '@charts-composables/useChartComponent': resolve(__dirname, 'src/charts/composables/useChartComponent'),
      '@charts': resolve(__dirname, 'src/charts'),
      '@charts-types': resolve(__dirname, 'src/charts/types'),
      '@charts-utils': resolve(__dirname, 'src/charts/utils'),
      '@charts-composables': resolve(__dirname, 'src/charts/composables'),
      '@btc/shared-core/utils': resolve(__dirname, '../shared-core/src/utils'),
      '@btc/shared-core/utils/form': resolve(__dirname, '../shared-core/src/utils/form'),
      '@btc/shared-core/utils/format': resolve(__dirname, '../shared-core/src/utils/format'),
      '@btc/i18n': resolve(__dirname, 'src/i18n'),
    },
    // 关键：确保 Vite 能够正确解析 .tsx 和 .jsx 文件
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    // 确保只有一个 Vue 实例和插件实例，避免依赖解析问题和循环引用
    dedupe: ['vue', '@vitejs/plugin-vue'],
    // 关键：添加 'development' 条件，确保在开发环境中使用源码
    // 这样在构建时，如果 NODE_ENV=development，会使用源码路径而不是构建产物路径
    conditions: ['development', 'import', 'module', 'browser', 'default'],
  },
  plugins: [
    buildLogPlugin(), // 添加构建日志插件
    vue(),
    vueJsx(),
    copyDarkThemePlugin(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
      exclude: ['src/**/*.d.ts', 'node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts'],
      outDir: resolve(__dirname, 'dist'),
      root: __dirname,
      copyDtsFiles: false, // 不复制 .d.ts 文件，只从 .ts 文件生成
      insertTypesEntry: true,
      skipDiagnostics: true,
      logLevel: 'silent',
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
      rollupTypes: false, // 禁用 rollupTypes，保留目录结构
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import']
      }
    }
  },
  // 关键：确保 esbuild 正确处理 JSX，使用 Vue 的 h 函数而不是 React.createElement
  // 这样即使 esbuild 处理某些 JSX 文件，也会使用正确的转换方式
  esbuild: {
    jsx: 'preserve', // 保留 JSX，让 vueJsx 插件处理
    jsxFactory: 'h', // 使用 Vue 的 h 函数作为 JSX 工厂函数
    jsxFragment: 'Fragment', // 使用 Vue 的 Fragment
  },
  logLevel: 'error', // 鍙樉绀洪敊璇紝鎶戝埗璀﹀憡
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BTCSharedComponents',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      onwarn(warning, warn) {
        // 抑制空 chunk 警告
        if (warning.message?.includes('Generated an empty chunk')) {
          return;
        }
        // 抑制 named 和 default exports 一起使用的警告
        if (warning.message?.includes('named and default exports together')) {
          return;
        }
        // 其他警告正常显示
        warn(warning);
      },
      external: ['vue', 'vue-router', 'pinia', 'element-plus', '@element-plus/icons-vue', '@btc/shared-core', /^@btc\/shared-core\/.*/, '@btc/i18n', /^@btc\/i18n\/.*/, '@octokit/rest', '@btc/subapp-manifests', '@btc/shared-core/configs/unified-env-config', '@btc/shared-core/configs/app-scanner', '@btc/shared-core/configs/layout-bridge', 'zod'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          'pinia': 'Pinia',
          'element-plus': 'ElementPlus',
          '@element-plus/icons-vue': 'ElementPlusIconsVue',
          '@btc/shared-core': 'BTCSharedCore',
          '@btc/subapp-manifests': 'BTCSubappManifests',
        },
        assetFileNames: (assetInfo: { name?: string }) => {
          if (assetInfo.name === 'style.css') {
            return 'style.css';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    cssCodeSplit: false, // 灏嗘墍鏈?CSS 鍚堝苟鍒颁竴涓枃浠朵腑
  },
});


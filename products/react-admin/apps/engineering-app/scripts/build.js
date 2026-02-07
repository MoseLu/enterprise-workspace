/**
 * 构建脚本
 */
import { build, defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { compression } from 'vite-plugin-compression2';
import { VitePWA } from 'vite-plugin-pwa';

// 读取 package.json 获取版本号
import { readFileSync } from 'fs';
const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8'));
const version = packageJson.version || '1.0.0';

/**
 * Vite 配置
 */
const config = defineConfig({
  plugins: [
    vue(),
    // Gzip 压缩
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    // Brotli 压缩
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    // PWA 支持
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: '工程应用',
        short_name: '工程',
        description: '企业工程管理应用',
        theme_color: '#409eff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@btc': resolve(__dirname, 'node_modules/@btc'),
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'echarts': ['echarts', 'vue-echarts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
});

// 构建
async function buildApp() {
  try {
    console.log(`[engineering-app] 开始构建版本 ${version}`);

    await build({
      ...config,
      build: {
        ...config.build,
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      },
    });

    console.log('[engineering-app] 构建成功');
  } catch (error) {
    console.error('[engineering-app] 构建失败:', error);
    process.exit(1);
  }
}

// 预览
async function preview() {
  const { preview: previewServer } = await import('vite');
  try {
    await previewServer({
      port: 4173,
      strictPort: true,
    });
    console.log('[engineering-app] 预览服务器已启动 http://localhost:4173');
  } catch (error) {
    console.error('[engineering-app] 预览失败:', error);
    process.exit(1);
  }
}

// 执行
const command = process.argv[2];
if (command === 'preview') {
  preview();
} else {
  buildApp();
}

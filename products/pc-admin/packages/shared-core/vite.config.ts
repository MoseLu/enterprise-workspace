import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import type { Plugin } from 'vite';

// 构建日志插件
function buildLogPlugin(): Plugin {
  return {
    name: 'build-log',
    buildStart() {
      console.log('\n📦 开始构建 @btc/shared-core...');
      console.log('   - 输入文件: src/index.ts');
      console.log('   - 输出格式: ESM + CJS');
      console.log('   - 类型声明: dist/*.d.ts\n');
    },
    buildEnd(error) {
      if (error) {
        console.error('\n❌ @btc/shared-core 构建失败！');
        console.error('   错误:', error.message);
      } else {
        console.log('\n✅ @btc/shared-core 构建成功！');
        console.log('   - 输出文件: dist/index.mjs (ESM)');
        console.log('   - 输出文件: dist/index.js (CJS)');
        console.log('   - 类型声明: dist/*.d.ts\n');
      }
    },
  };
}

export default defineConfig({
  logLevel: 'error', // 只显示错误，抑制警告
  resolve: {
    alias: {
      '@btc/shared-components': resolve(__dirname, '../shared-components/src'),
      '@btc/auth-shared': resolve(__dirname, '../../auth/shared'),
      '@btc/shared-core': resolve(__dirname, 'src'),
      '@btc/shared-core/utils': resolve(__dirname, 'src/utils'),
      '@btc/shared-core/utils/array': resolve(__dirname, 'src/utils/array'),
      '@btc/shared-core/configs': resolve(__dirname, 'src/configs'),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  plugins: [
    buildLogPlugin(), // 添加构建日志插件
    dts({
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts', 'src/configs/app-configs-collected.ts'],
      outDir: 'dist',
      // 保留目录结构
      copyDtsFiles: false, // 不复制 .d.ts 文件，只从 .ts 文件生成
      // 生成类型声明文件后，插入类型引用路径
      insertTypesEntry: true,
      // 跳过类型检查，避免 rootDir 限制问题
      // @ts-expect-error - skipDiagnostics 在较新版本的 vite-plugin-dts 中可用
      skipDiagnostics: true,
      // 静默模式，不显示诊断信息
      logLevel: 'silent',
      // 使用单独的 tsconfig 文件
      tsconfigPath: './tsconfig.build.json',
      // 禁用 rollupTypes，避免 API Extractor 错误
      rollupTypes: false,
      // 生成统一的类型声明文件到 dist 根目录
      bundledPackages: [],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BTCSharedCore',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      onwarn(warning, warn) {
        // 抑制空 chunk 警告（如 configs/app-identity.types 只包含类型）
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
      input: {
        index: resolve(__dirname, 'src/index.ts'),
        'utils/index': resolve(__dirname, 'src/utils/index.ts'),
        'utils/form/index': resolve(__dirname, 'src/utils/form/index.ts'),
        'utils/form/zod-validator': resolve(__dirname, 'src/utils/form/zod-validator.ts'),
        'utils/format/index': resolve(__dirname, 'src/utils/format/index.ts'),
        'utils/profile-info-cache': resolve(__dirname, 'src/utils/profile-info-cache.ts'),
        'utils/storage/index': resolve(__dirname, 'src/utils/storage/index.ts'),
        'utils/storage/session/index': resolve(__dirname, 'src/utils/storage/session/index.ts'),
        'utils/storage/cookie/index': resolve(__dirname, 'src/utils/storage/cookie/index.ts'),
        'utils/i18n/locale-utils': resolve(__dirname, 'src/utils/i18n/locale-utils.ts'),
        'configs/layout-bridge': resolve(__dirname, 'src/configs/layout-bridge.ts'),
        'configs/app-env.config': resolve(__dirname, 'src/configs/app-env.config.ts'),
        'configs/app-scanner': resolve(__dirname, 'src/configs/app-scanner.ts'),
        'configs/unified-env-config': resolve(__dirname, 'src/configs/unified-env-config.ts'),
        'configs/qiankun-config-center': resolve(__dirname, 'src/configs/qiankun-config-center.ts'),
        'configs/app-identity.types': resolve(__dirname, 'src/configs/app-identity.types.ts'),
        'manifest/index': resolve(__dirname, 'src/manifest/index.ts'),
      },
      external: [
        'vue',
        'axios',
        'vue-i18n',
        'pinia',
        'dayjs',
        'file-type',
        'zod',
        'winston',
        'winston-transport',
        'util',
        '@vueuse/core',
        '@btc/shared-components',
        /^@btc\/shared-components\/.*/,
        '@btc/auth-shared',
        /^@btc\/auth-shared\/.*/,
        '@btc/shared-utils',
        /^@btc\/shared-utils\/.*/,
        // 排除 apps 目录的导入，这些文件在运行时可用，但构建时无法解析
        /^\.\.\/\.\.\/\.\.\/apps\/.*/,
      ],
      output: [
        {
          format: 'es',
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'index') {
              return 'index.mjs';
            }
            if (chunkInfo.name === 'utils/index') {
              return 'utils/index.mjs';
            }
            if (chunkInfo.name === 'utils/form/index') {
              return 'utils/form/index.mjs';
            }
            if (chunkInfo.name === 'utils/form/zod-validator') {
              return 'utils/form/zod-validator.mjs';
            }
            if (chunkInfo.name === 'utils/format/index') {
              return 'utils/format/index.mjs';
            }
            if (chunkInfo.name === 'utils/profile-info-cache') {
              return 'utils/profile-info-cache.mjs';
            }
            if (chunkInfo.name === 'utils/storage/index') {
              return 'utils/storage/index.mjs';
            }
            if (chunkInfo.name === 'utils/storage/session/index') {
              return 'utils/storage/session/index.mjs';
            }
            if (chunkInfo.name === 'utils/storage/cookie/index') {
              return 'utils/storage/cookie/index.mjs';
            }
            if (chunkInfo.name === 'utils/i18n/locale-utils') {
              return 'utils/i18n/locale-utils.mjs';
            }
            if (chunkInfo.name.startsWith('configs/')) {
              return `configs/${chunkInfo.name.replace('configs/', '')}.mjs`;
            }
            if (chunkInfo.name === 'manifest/index') {
              return 'manifest/index.mjs';
            }
            return `${chunkInfo.name}.mjs`;
          },
          chunkFileNames: (chunkInfo) => {
            // 对于共享的 chunk，使用固定的文件名而不是 hash
            // 这样可以确保导入路径稳定
            // 注意：get-main-app-login-url 应该被内联，不应该作为单独的 chunk
            // 如果它被分离为 chunk，使用相对路径引用
            if (chunkInfo.name && chunkInfo.name.includes('get-main-app-login-url')) {
              return 'utils/get-main-app-login-url.mjs';
            }
            // 其他 chunk 使用默认命名（带 hash）
            return '[name]-[hash].mjs';
          },
          globals: {
            vue: 'Vue',
            axios: 'axios',
            'vue-i18n': 'VueI18n',
            pinia: 'Pinia',
            '@vueuse/core': 'VueUse',
          },
        },
        {
          format: 'cjs',
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'index') {
              return 'index.js';
            }
            if (chunkInfo.name === 'utils/index') {
              return 'utils/index.js';
            }
            if (chunkInfo.name === 'utils/form/index') {
              return 'utils/form/index.js';
            }
            if (chunkInfo.name === 'utils/form/zod-validator') {
              return 'utils/form/zod-validator.js';
            }
            if (chunkInfo.name === 'utils/format/index') {
              return 'utils/format/index.js';
            }
            if (chunkInfo.name === 'utils/profile-info-cache') {
              return 'utils/profile-info-cache.js';
            }
            if (chunkInfo.name === 'utils/i18n/locale-utils') {
              return 'utils/i18n/locale-utils.js';
            }
            if (chunkInfo.name.startsWith('configs/')) {
              return `configs/${chunkInfo.name.replace('configs/', '')}.js`;
            }
            if (chunkInfo.name === 'manifest/index') {
              return 'manifest/index.js';
            }
            return `${chunkInfo.name}.js`;
          },
          chunkFileNames: (chunkInfo) => {
            // 对于共享的 chunk，使用固定的文件名而不是 hash
            // 注意：get-main-app-login-url 应该被内联，不应该作为单独的 chunk
            // 如果它被分离为 chunk，使用相对路径引用
            if (chunkInfo.name && chunkInfo.name.includes('get-main-app-login-url')) {
              return 'utils/get-main-app-login-url.js';
            }
            // 其他 chunk 使用默认命名（带 hash）
            return '[name]-[hash].js';
          },
          globals: {
            vue: 'Vue',
            axios: 'axios',
            'vue-i18n': 'VueI18n',
            pinia: 'Pinia',
            '@vueuse/core': 'VueUse',
          },
        },
      ],
    },
  },
});

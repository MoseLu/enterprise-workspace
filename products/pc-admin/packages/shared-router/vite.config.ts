import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import type { Plugin } from 'vite';

// 构建日志插件
function buildLogPlugin(): Plugin {
  return {
    name: 'build-log',
    buildStart() {
      console.log('\n📦 开始构建 @btc/shared-router...');
      console.log('   - 输入文件: src/index.ts');
      console.log('   - 输出格式: ESM + CJS');
      console.log('   - 类型声明: dist/*.d.ts\n');
    },
    buildEnd(error) {
      if (error) {
        console.error('\n❌ @btc/shared-router 构建失败！');
        console.error('   错误:', error.message);
      } else {
        console.log('\n✅ @btc/shared-router 构建成功！');
        console.log('   - 输出文件: dist/index.mjs (ESM)');
        console.log('   - 输出文件: dist/index.js (CJS)');
        console.log('   - 类型声明: dist/*.d.ts\n');
      }
    },
  };
}

export default defineConfig({
  logLevel: 'error',
  resolve: {
    alias: {
      '@btc/shared-core': resolve(__dirname, '../shared-core/src'),
    },
  },
  plugins: [
    buildLogPlugin(), // 添加构建日志插件
    dts({
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts'],
      outDir: 'dist',
      copyDtsFiles: false,
      insertTypesEntry: true,
      skipDiagnostics: true,
      logLevel: 'silent',
      tsconfigPath: './tsconfig.build.json',
      rollupTypes: true,
      bundledPackages: [],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BTCSharedRouter',
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
      external: [
        'vue',
        'vue-router',
        '@btc/shared-core',
        /^@btc\/shared-core\/.*/,
        '@btc/auth-shared',
        /^@btc\/auth-shared\/.*/,
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
        },
      },
    },
  },
});


/**
 * 主应用 Vite 配置工厂
 * 生成主应用的完整 Vite 配置（main-app）
 */

import type { UserConfig, Plugin } from 'vite';
import { resolve } from 'path';
import { createRequire } from 'module';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import UnoCSS from 'unocss/vite';
import { existsSync, readFileSync } from 'node:fs';
import { createPathHelpers } from '../utils/path-helpers';

// 使用 ESM 导入 VueI18nPlugin（Vite 配置文件支持 ESM）
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { createAutoImportConfig, createComponentsConfig } from '../../auto-import.config';
import { btc, fixChunkReferencesPlugin } from '@btc/vite-plugin';
import { getViteAppConfig, getPublicDir } from '../../vite-app-config';
import { createBaseResolve } from '../base.config';
import { createRollupConfig } from '../plugins/rollup-config';
import {
  cleanDistPlugin,
  chunkVerifyPlugin,
  optimizeChunksPlugin,
  ensureBaseUrlPlugin,
  corsPlugin,
  ensureCssPlugin,
  addVersionPlugin,
  replaceIconsWithCdnPlugin,
  publicImagesToAssetsPlugin,
  resourcePreloadPlugin,
  uploadCdnPlugin,
  cdnAssetsPlugin,
  cdnImportPlugin,
  resolveBtcImportsPlugin,
  resolveAuthAliasesPlugin,
} from '../plugins';

export interface MainAppViteConfigOptions {
  /**
   * 应用名称（如 'system-app'）
   */
  appName: string;
  /**
   * 应用根目录路径
   */
  appDir: string;
  /**
   * 自定义插件列表
   */
  customPlugins?: Plugin[];
  /**
   * 自定义构建配置
   */
  customBuild?: Partial<UserConfig['build']>;
  /**
   * 自定义服务器配置
   */
  customServer?: Partial<UserConfig['server']>;
  /**
   * 自定义预览服务器配置
   */
  customPreview?: Partial<UserConfig['preview']>;
  /**
   * 自定义优化依赖配置
   */
  customOptimizeDeps?: Partial<UserConfig['optimizeDeps']>;
  /**
   * 自定义 CSS 配置
   */
  customCss?: Partial<UserConfig['css']>;
  /**
   * 代理配置
   */
  proxy?: Record<string, any>;
  /**
   * BTC 插件配置
   */
  btcOptions?: {
    type?: 'admin';
    proxy?: Record<string, any>;
    eps?: {
      enable?: boolean;
      dict?: boolean;
      dictApi?: string;
      dist?: string;
    };
    svg?: {
      skipNames?: string[];
    };
  };
  /**
   * VueI18n 插件配置
   */
  vueI18nOptions?: {
    include?: string[];
    runtimeOnly?: boolean;
  };
  /**
   * publicImagesToAssetsPlugin 配置（主应用特有）
   */
  publicImagesToAssets?: boolean;
  /**
   * 是否启用资源预加载插件
   */
  enableResourcePreload?: boolean;
}

/**
 * 创建主应用 Vite 配置
 */
export function createMainAppViteConfig(options: MainAppViteConfigOptions): UserConfig {
  const {
    appName,
    appDir,
    customPlugins = [],
    customBuild,
    customServer,
    customPreview,
    customOptimizeDeps,
    customCss,
    proxy = {},
    btcOptions = {},
    vueI18nOptions,
    publicImagesToAssets = true,
    enableResourcePreload = true,
  } = options;

  // 获取应用配置
  const appConfig = getViteAppConfig(appName);
  // 使用导入的 createPathHelpers
  const { withRoot } = createPathHelpers(appDir);

  // 判断是否为预览构建
  const isPreviewBuild = process.env.VITE_PREVIEW === 'true';
  const baseUrl = '/'; // 主应用固定使用根路径
  const publicDir = getPublicDir(appName, appDir);

  // 获取主应用配置（用于 ensureBaseUrlPlugin）
  const mainAppConfig = getViteAppConfig('main-app');
  const mainAppPort = mainAppConfig.prePort.toString();

  // 关键：EPS 的 outputDir 必须使用绝对路径，基于 appDir 解析
  // 主应用使用 src/build/eps 目录，确保 EPS 数据在源码目录中，便于版本控制和开发
  const epsOutputDir = resolve(appDir, 'src', 'build', 'eps');

  // 构建插件列表
  const plugins: (Plugin | Plugin[])[] = [
    // 1. 清理插件
    cleanDistPlugin(appDir),
    // 2. CORS 插件
    corsPlugin(),
    // 3. 解析 auth 目录下的 @ 别名插件（必须在 resolveBtcImportsPlugin 之前）
    resolveAuthAliasesPlugin({ appDir }),
    // 4. 解析 @btc/* 包导入插件（确保能够解析从已构建包中导入的 @btc/* 模块）
    resolveBtcImportsPlugin({ appDir }),
    // 4. Public 图片资源处理插件（如果启用）
    ...(publicImagesToAssets && !isPreviewBuild ? [publicImagesToAssetsPlugin(appDir)] : []),
    // 5. 资源预加载插件（如果启用）
    ...(enableResourcePreload !== false ? [resourcePreloadPlugin()] : []),
    // 6. 自定义插件（在核心插件之前）
    ...customPlugins,
    // 6. Vue 插件
    vue({
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file: string) => readFileSync(file, 'utf-8'),
        },
      },
    }),
    // 6.5. Vue JSX 插件（支持 TSX 文件中的 JSX 语法）
    // 关键：与 cool-admin 保持一致，使用默认配置，让插件自动处理所有 JSX/TSX 文件
    vueJsx(),
    // 7. 自动导入插件
    createAutoImportConfig(),
    // 8. 组件自动注册插件
    createComponentsConfig({ includeShared: true }),
    // 9. UnoCSS 插件
    UnoCSS({
      configFile: withRoot('uno.config.ts'),
    }),
    // 10. BTC 业务插件
    btc({
      type: 'admin' as any,
      proxy,
      eps: {
        enable: true,
        dict: btcOptions.eps?.dict ?? true, // 默认启用字典功能
        dictApi: btcOptions.eps?.dictApi || '/api/system/auth/dict', // 默认字典接口
        dist: epsOutputDir,
        ...btcOptions.eps,
      },
      svg: {
        skipNames: ['base', 'icons'],
        ...btcOptions.svg,
      },
      ...btcOptions,
    }),
    // 11. VueI18n 插件
    VueI18nPlugin({
      include: vueI18nOptions?.include || [
        resolve(appDir, 'src/locales/**'),
        resolve(appDir, 'src/{modules,plugins}/**/locales/**'),
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true,
    }),
    // 12. CSS 验证插件
    ensureCssPlugin(),
    // 13. 修复 chunk 引用插件
    fixChunkReferencesPlugin(),
    // 16. 确保 base URL 插件（主应用也需要，因为可能有子应用资源引用）
    ensureBaseUrlPlugin(baseUrl, appConfig.devHost, appConfig.prePort, mainAppPort),
    // 17. 添加版本号插件（为 HTML 资源引用添加时间戳版本号）
    addVersionPlugin(),
    // 17.5. CDN 资源加速插件（在版本号插件之后，确保版本号参数被保留）
    // 处理 HTML 中的资源 URL（<script>、<link>、<img> 等）
    cdnAssetsPlugin({
      appName,
      enabled: !isPreviewBuild && process.env.ENABLE_CDN_ACCELERATION !== 'false',
    }),
    // 17.6. CDN 动态导入转换插件（转换代码中的 import() 调用）
    // 将相对路径转换为 CDN URL，与 cdnAssetsPlugin 配合实现完整的 CDN 加速
    cdnImportPlugin({
      appName,
      enabled: !isPreviewBuild && process.env.ENABLE_CDN_ACCELERATION !== 'false',
    }),
    // 17.7. 替换图标路径为 CDN URL（生产环境）
    replaceIconsWithCdnPlugin(),
    // 18. 优化 chunks 插件
    optimizeChunksPlugin(),
    // 19. Chunk 验证插件
    chunkVerifyPlugin(),
    // 20. CDN 上传插件（仅在生产构建且启用时）
    ...(process.env.ENABLE_CDN_UPLOAD === 'true' && !isPreviewBuild
      ? [uploadCdnPlugin(appName, appDir)]
      : []),
  ];

  // 构建配置
  const buildConfig: UserConfig['build'] = {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: false,
    cssMinify: true,
    // 关键：禁用代码压缩，避免 Terser 压缩导致的对象属性分隔符丢失问题
    minify: false,
    // 关键：禁止资源内联，确保 CSS 被提取到独立文件中（qiankun 要求）
    // 与 layout-app 和 subapp 保持一致，避免内联 CSS 导致样式丢失
    assetsInlineLimit: 0,
    // terserOptions 已禁用，保留配置以备将来使用
    /* terserOptions: {
      compress: {
        // 只移除 console.log，保留 console.error 和 console.warn，便于生产环境调试
        drop_console: ['log'],
        drop_debugger: true,
        reduce_vars: false,
        reduce_funcs: false,
        passes: 1,
        collapse_vars: false,
        dead_code: false,
        // 关键：禁用可能导致对象属性分隔符丢失的优化
        sequences: false, // 禁用序列优化，避免语句被错误合并
        join_vars: false, // 禁用变量连接，避免变量声明被错误合并
        // 关键：禁用不安全的优化，避免数字字面量和字符串被错误处理
        unsafe: false,
        unsafe_comps: false,
        unsafe_math: false,
        unsafe_methods: false,
        unsafe_proto: false,
        unsafe_regexp: false,
        unsafe_undefined: false,
        // 关键：禁用可能导致对象属性分隔符丢失的优化
        keep_infinity: true, // 保留 Infinity，避免数字被错误处理
        // 关键：禁用对象属性优化，确保对象属性之间有正确的逗号分隔符
        properties: false, // 禁用对象属性优化，防止属性被错误合并
        // 关键：禁用表达式优化，确保字符串和数字不会被错误连接
        evaluate: false, // 禁用表达式求值，防止字符串和数字被错误处理
        // 关键：禁用纯函数优化，防止对象字面量被错误处理
        pure_funcs: [], // 不将任何函数视为纯函数，防止对象字面量被错误优化
        // 关键：禁用副作用优化，确保对象字面量格式正确
        side_effects: false, // 不禁用副作用，确保对象字面量格式正确
      },
      // 关键：保留函数名和类名，但禁用变量名混淆
      // 这样可以防止导出名称被混淆，同时允许基本的压缩优化
      mangle: {
        keep_fnames: true,
        keep_classnames: true,
      },

      format: {
        comments: false,
        // 关键：确保代码格式正确，避免数字字面量被错误处理
        preserve_annotations: false,
        // 确保数字字面量格式正确
        ascii_only: false, // 允许非 ASCII 字符，避免数字被错误编码
        beautify: false, // 不美化代码，保持压缩后的格式
        // 关键：确保对象属性之间有正确的分隔符
        semicolons: true, // 使用分号，确保语句正确分隔
        // 关键：确保对象字面量格式正确
        wrap_iife: false, // 不包装立即执行函数
        wrap_func_args: false, // 不包装函数参数
      },
    }, */
    outDir: process.env.BUILD_OUT_DIR || 'dist',
    assetsDir: 'assets',
    emptyOutDir: false,
    // 关键：main-app 作为主应用，也需要打包 single-spa 和 qiankun
    // 不将它们标记为 external，确保它们被打包到构建产物中
    // 关键：主应用也需要打包 @btc 包，避免浏览器无法解析路径别名
    // 关键：主应用也需要打包 @configs 包，避免浏览器无法解析路径别名
    rollupOptions: {
      ...createRollupConfig(appName, {
        externalSingleSpa: false, // 主应用需要打包 single-spa 和 qiankun
        externalBtcPackages: false, // 主应用需要打包 @btc 包，避免浏览器无法解析路径别名
        externalConfigsPackages: false, // 主应用需要打包 @configs 包，避免浏览器无法解析路径别名
      }),
    },
    chunkSizeWarningLimit: 1000,
    ...customBuild,
  };

  // 服务器配置
  // 关键：优先使用 customServer.proxy，如果不存在则使用 proxy 参数
  // 注意：customServer 会在最后展开，如果包含 proxy 会覆盖这里的设置
  const finalProxy = customServer?.proxy !== undefined ? customServer.proxy : proxy;
  const { proxy: _customProxy, ...restCustomServer } = customServer || {};
  
  // 添加监控服务代理，避免私有网络请求警告
  // 将 /__monitor__ 代理到监控服务（http://localhost:3001）
  const monitorProxy = {
    '/__monitor__': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/__monitor__/, ''),
      ws: true, // 支持 WebSocket（SSE 使用）
    },
  };
  
  // 合并代理配置：监控服务代理优先，然后是业务代理
  const mergedProxy = {
    ...monitorProxy,
    ...finalProxy,
  };
  
  const serverConfig: UserConfig['server'] = {
    port: appConfig.devPort,
    host: '0.0.0.0',
    strictPort: true,
    cors: true,
    origin: `http://${appConfig.devHost}:${appConfig.devPort}`,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
    hmr: {
      host: appConfig.devHost,
      port: appConfig.devPort,
      overlay: false,
    },
    proxy: mergedProxy,
    fs: {
      strict: false,
      allow: [
        withRoot('.'),
      ],
      cachedChecks: true,
    },
    // 禁用 page reload 日志输出
    watch: {
      ignored: ['**/locales/**/*.json'],
    },
    ...restCustomServer,
  };

  // 预览服务器配置
  // 关键：预览服务器从根目录的 dist/{prodHost} 读取构建产物，而不是从 apps/{appName}/dist 读取
  const rootDistDir = resolve(appDir, '../../dist');
  const previewRoot = resolve(rootDistDir, appConfig.prodHost);
  
  const previewConfig: UserConfig['preview'] = {
    port: appConfig.prePort,
    strictPort: true,
    open: false,
    host: '0.0.0.0',
    // 关键：设置预览服务器的根目录为 dist/{prodHost}
    root: previewRoot,
    proxy,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    ...customPreview,
  };

  // 优化依赖配置
  // 关键：预先包含所有子应用可能用到的依赖，避免切换应用时触发重新加载
  // 关键：每个应用使用独立的缓存目录，避免不同应用的配置差异导致缓存冲突
  const appCacheDir = resolve(appDir, 'node_modules/.vite');

  const optimizeDepsConfig: UserConfig['optimizeDeps'] = {
    include: [
      // 核心依赖：所有应用都安装的依赖
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      // Winston 需要的 Node.js 模块 polyfill
      'util',
      'element-plus/es',
      'element-plus/es/locale/lang/zh-cn',
      'element-plus/es/locale/lang/en',
      'element-plus/es/components/cascader/style/css',
      '@element-plus/icons-vue',
      '@btc/shared-core',
      // 注意：@btc/shared-components 已从 include 中移除，因为它包含 TSX 文件
      // 在开发环境中，应该直接从源码导入，而不是预构建
      // '@btc/shared-components',
      '@btc/shared-utils',
      'vite-plugin-qiankun/dist/helper',
      'qiankun',
      '@vueuse/core',
      // 关键：这些依赖现在已经在所有应用的 package.json 中声明
      // 通过 @btc/shared-components 间接使用，但需要在应用中显式声明以便 Vite 正确解析
      'lodash-es',
      'chardet',
      'xlsx',
      'vue-i18n',
      // 关键：echarts 相关依赖需要被预构建
      // system-app 和部分子应用使用了 echarts
      'echarts/core',
      'echarts',
      'vue-echarts',
      // 注意：lunr 和 file-saver 不是所有应用都安装，不应该在 include 中强制声明
      // 如果应用安装了这些依赖，Vite 会在扫描 entries 时自动发现并优化
      // 'lunr', // 只在 shared-components 中使用，不是所有应用都安装
      // 'file-saver', // 只在部分应用中使用，不是所有应用都安装
    ],
    exclude: [
      // 关键：@btc/shared-core/configs/layout-bridge 是本地别名路径，不是 npm 包，不应该被优化
      // 注意：exclude 只支持字符串模式，不支持正则表达式
      '@btc/shared-core/configs/layout-bridge',
      // 关键：排除 @btc/shared-components，因为它是本地包，包含 TSX 文件
      // 在开发环境中，应该直接从源码导入，而不是预构建
      // 这样可以避免 JSX 解析问题
      '@btc/shared-components',
    ],
    force: false,
    // 关键：指定需要扫描的入口文件，确保扫描到 @btc/shared-components 内部的依赖
    // 注意：不再包含 shared-components/src/index.ts，因为它包含 TSX 文件，应该在运行时直接处理
    entries: [
      resolve(appDir, 'src/main.ts'),
      // 注意：不再直接引用 shared-core/src/index.ts，避免在配置加载时解析 @configs/layout-bridge
      // shared-core 的依赖会在运行时通过应用的入口文件自动发现和优化
    ],
    esbuildOptions: {
      plugins: [],
      // 关键：确保依赖预构建时也使用 Vue 的 JSX 转换方式
      jsx: 'preserve', // 保留 JSX，让 vueJsx 插件处理
      jsxFactory: 'h', // 使用 Vue 的 h 函数作为 JSX 工厂函数
      jsxFragment: 'Fragment', // 使用 Vue 的 Fragment
    },
    ...customOptimizeDeps,
  };

  // CSS 配置
  const cssConfig: UserConfig['css'] = {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
    devSourcemap: false,
    ...customCss,
  };

  // 返回完整配置
  // 注意：publicDir 的配置需要在 vite.config.ts 中根据 command 动态设置
  // 这里始终启用 publicDir，开发环境直接使用，构建环境会在 vite.config.ts 中被覆盖
  const finalPublicDir = publicDir;

  const config: any = {
    base: baseUrl,
    publicDir: finalPublicDir,
    // 关键：每个应用使用独立的缓存目录，避免不同应用的配置差异导致缓存冲突
    cacheDir: appCacheDir,
    define: {
      // 为浏览器环境提供 process 对象，Winston 需要它
      'process.env': '{}',
      'process.platform': JSON.stringify('browser'),
      'process.version': JSON.stringify(''),
    },
    plugins,
    esbuild: {
      charset: 'utf8',
      // 关键：确保 esbuild 正确处理 JSX，使用 Vue 的 h 函数而不是 React.createElement
      // 这样即使 esbuild 处理某些 JSX 文件，也会使用正确的转换方式
      jsx: 'preserve', // 保留 JSX，让 vueJsx 插件处理
      jsxFactory: 'h', // 使用 Vue 的 h 函数作为 JSX 工厂函数
      jsxFragment: 'Fragment', // 使用 Vue 的 Fragment
    },
    server: serverConfig,
    preview: previewConfig,
    optimizeDeps: optimizeDepsConfig,
    css: cssConfig,
    build: buildConfig,
    // 开发环境日志配置：减少冗余输出
    clearScreen: false, // 不清理屏幕，保留之前的输出
    logLevel: process.env.VITE_LOG_LEVEL || 'warn', // 只显示警告和错误，隐藏 info 和 debug
  };

  // 明确处理可选属性的 undefined（exactOptionalPropertyTypes）
  // 所有应用都使用别名指向源码（因为都打包 @btc/* 包）
  const resolveValue = createBaseResolve(appDir, appName);
  if (resolveValue !== undefined) {
    config.resolve = resolveValue;
  }

  return config;
}


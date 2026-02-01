/**
 * 子应用 Vite 配置工厂
 * 生成子应用的完整 Vite 配置
 */

import type { UserConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'module';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import qiankun from 'vite-plugin-qiankun';
import UnoCSS from 'unocss/vite';
import { existsSync, readFileSync } from 'node:fs';
import { createPathHelpers } from '../utils/path-helpers';

// 获取当前文件的目录路径（ESM 方式）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 延迟加载 VueI18nPlugin，从应用目录解析
// 使用函数内动态导入，确保从调用者的 node_modules 解析
import { pathToFileURL } from 'node:url';
function getVueI18nPlugin(appDir: string) {
  // 使用 createRequire 从应用目录解析包
  // 通过 file:// URL 创建正确的 require 上下文
  const appDirUrl = pathToFileURL(resolve(appDir, 'package.json')).href;
  const require = createRequire(appDirUrl);
  const plugin = require('@intlify/unplugin-vue-i18n/vite');
  return plugin.default || plugin;
}
import { createAutoImportConfig, createComponentsConfig } from '../../auto-import.config';
import { btc, fixChunkReferencesPlugin } from '@btc/vite-plugin';
import { getViteAppConfig, getBaseUrl, getPublicDir } from '../../vite-app-config';
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
  resolveLogoPlugin,
  uploadCdnPlugin,
  cdnAssetsPlugin,
  cdnImportPlugin,
  resolveBtcImportsPlugin,
  localesStaticPlugin,
} from '../plugins';
import type { Plugin } from 'vite';

export interface SubAppViteConfigOptions {
  /**
   * 应用名称（如 'admin-app'）
   */
  appName: string;
  /**
   * 应用根目录路径
   */
  appDir: string;
  /**
   * Qiankun 应用名称（如 'admin'）
   */
  qiankunName: string;
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
    type?: 'subapp';
    proxy?: Record<string, any>;
    eps?: {
      enable?: boolean;
      dict?: boolean;
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
   * Qiankun 插件配置
   */
  qiankunOptions?: {
    useDevMode?: boolean;
  };
}

/**
 * 创建子应用 Vite 配置
 */
export function createSubAppViteConfig(options: SubAppViteConfigOptions): UserConfig {
  const {
    appName,
    appDir,
    qiankunName,
    customPlugins = [],
    customBuild,
    customServer,
    customPreview,
    customOptimizeDeps,
    customCss,
    proxy = {},
    btcOptions = {},
    vueI18nOptions,
    qiankunOptions = { useDevMode: true },
  } = options;

  // 获取应用配置
  const appConfig = getViteAppConfig(appName);
  // 使用导入的 createPathHelpers
  const { withRoot } = createPathHelpers(appDir);

  // 判断是否为预览构建
  const isPreviewBuild = process.env.VITE_PREVIEW === 'true';
  const baseUrl = getBaseUrl(appName, isPreviewBuild);
  // 关键：子应用在构建时禁用 publicDir，避免打包图标等静态资源
  // 图标等静态资源应该由 layout-app 统一管理
  // 开发环境仍然需要 publicDir 来服务静态文件
  const publicDir = isPreviewBuild ? getPublicDir(appName, appDir) : false;

  // 获取主应用配置
  const mainAppConfig = getViteAppConfig('main-app');
  const mainAppPort = mainAppConfig.prePort.toString();

  // 关键：EPS 的 outputDir 必须使用绝对路径，基于 appDir 解析
  // 避免在构建时因为工作目录变化而在 dist 目录下创建 build 目录
  const epsOutputDir = resolve(appDir, 'build', 'eps');

  // 共享的 EPS 数据源目录（从 main-app 读取）
  // 子应用优先从 main-app 的 build/eps 读取 EPS 数据，实现真正的共享
  const sharedEpsDir = resolve(appDir, '../../apps/main-app/build/eps');

  // 确保 eps enable 始终为 boolean 类型
  const epsEnable: boolean = btcOptions.eps?.enable ?? true;

  // 构建 eps 配置，确保 enable 始终为 boolean
  const epsConfig: {
    enable: boolean;
    dict: boolean;
    dictApi?: string;
    dist: string;
    sharedEpsDir: string;
  } = {
    enable: epsEnable,
    dict: btcOptions.eps?.dict ?? true, // 默认启用字典功能
    dictApi: btcOptions.eps?.dictApi || '/api/system/auth/dict', // 默认字典接口
    dist: epsOutputDir,
    sharedEpsDir: sharedEpsDir,
  };

  // 构建插件列表
  const plugins: Plugin[] = [
    // 1. 清理插件
    cleanDistPlugin(appDir),
    // 2. CORS 插件
    corsPlugin(),
    // 3. 解析 @btc/* 包导入插件（在 Logo 插件之前，确保能够解析从已构建包中导入的 @btc/* 模块）
    resolveBtcImportsPlugin({ appDir }),
    // 4. Logo 路径解析插件（在自定义插件之前，确保 /logo.png 能被正确解析）
    resolveLogoPlugin(appDir),
    // 4.5. Locales 静态文件插件（提供 src/locales/*.json 文件，供主应用通过 fetch 加载）
    localesStaticPlugin(appDir),
    // 5. 自定义插件（在核心插件之前）
    ...customPlugins,
    // 4. Vue 插件
    vue({
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file: string) => readFileSync(file, 'utf-8'),
        },
      },
    }),
    // 4.5. Vue JSX 插件（支持 TSX 文件中的 JSX 语法）
    vueJsx(),
    // 5. 自动导入插件
    createAutoImportConfig(),
    // 6. 组件自动注册插件
    createComponentsConfig({ includeShared: true }),
    // 7. UnoCSS 插件
    UnoCSS({
      configFile: withRoot('uno.config.ts'),
    }),
    // 8. BTC 业务插件
    btc({
      type: 'subapp' as any,
      proxy,
      eps: epsConfig as any, // 类型断言：确保 enable 始终为 boolean
      svg: {
        skipNames: ['base', 'icons'],
        ...btcOptions.svg,
      },
      ...btcOptions,
    }),
    // 9. VueI18n 插件
    getVueI18nPlugin(appDir)({
      include: vueI18nOptions?.include || [
        resolve(appDir, 'src/locales/**')
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true,
    }),
    // 10. CSS 验证插件
    ensureCssPlugin(),
    // 11. Qiankun 插件
    qiankun(qiankunName, qiankunOptions),
    // 12. 修复 chunk 引用插件
    fixChunkReferencesPlugin(),
    // 15. 确保 base URL 插件
    ensureBaseUrlPlugin(baseUrl, appConfig.devHost, appConfig.prePort, mainAppPort),
    // 16. 添加版本号插件（为 HTML 资源引用添加时间戳版本号）
    addVersionPlugin(),
    // 16.5. CDN 资源加速插件（在版本号插件之后，确保版本号参数被保留）
    // 处理 HTML 中的资源 URL（<script>、<link>、<img> 等）
    cdnAssetsPlugin({
      appName,
      enabled: !isPreviewBuild && process.env.ENABLE_CDN_ACCELERATION !== 'false',
    }),
    // 16.6. CDN 动态导入转换插件（转换代码中的 import() 调用）
    // 将相对路径转换为 CDN URL，与 cdnAssetsPlugin 配合实现完整的 CDN 加速
    cdnImportPlugin({
      appName,
      enabled: !isPreviewBuild && process.env.ENABLE_CDN_ACCELERATION !== 'false',
    }),
    // 16.7. 替换图标路径为 CDN URL（生产环境）
    replaceIconsWithCdnPlugin(),
    // 注意：不再需要 resolveExternalImportsPlugin，因为所有应用都打包 @btc/* 包
    // 17. 优化 chunks 插件
    optimizeChunksPlugin(),
    // 18. Chunk 验证插件
    chunkVerifyPlugin(),
    // 19. CDN 上传插件（仅在生产构建且启用时）
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
    // 与 layout-app 保持一致，避免内联 CSS 导致样式丢失
    assetsInlineLimit: 0,
    outDir: process.env.BUILD_OUT_DIR || 'dist',
    assetsDir: 'assets',
    // 关键：禁用 Vite 的自动清理，因为我们已经有 cleanDistPlugin 在构建前清理
    // 这样可以避免 Windows 上的文件锁定问题（EBUSY）
    // cleanDistPlugin 已经有重试机制（5次，递增等待时间），如果清理失败会继续构建
    // 注意：如果清理失败，旧的构建产物不会被删除，可能导致重复文件
    emptyOutDir: false,
    // 所有应用都打包 @btc/* 包和 @configs 包，避免运行时模块解析问题
    rollupOptions: createRollupConfig(appName, {
      externalBtcPackages: false, // 显式设置为 false，打包 @btc/* 包
      externalConfigsPackages: false, // 显式设置为 false，打包 @configs 包
    }),
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
    proxy,
    headers: {
      'Access-Control-Allow-Origin': appConfig.mainAppOrigin,
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    ...customPreview,
  } as any;

  // 关键：设置预览服务器的根目录为 dist/{prodHost}
  // 注意：root 属性在新版本的 Vite 类型中可能未定义，但运行时仍支持
  (previewConfig as any).root = previewRoot;

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
      '@btc/subapp-manifests',
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
      // 虽然只在部分应用中使用，但添加到 include 中可以避免运行时优化
      // 如果应用未安装这些依赖，Vite 会忽略它们（不会报错）
      'echarts/core',
      'echarts',
      'vue-echarts',
    ],
    // 排除不应该被优化的依赖
    // 注意：exclude 使用包名或文件路径模式
    exclude: [
      // 关键：@btc/shared-core/configs/layout-bridge 是本地别名路径，不是 npm 包，不应该被优化
      // 注意：exclude 只支持字符串模式，不支持正则表达式
      '@btc/shared-core/configs/layout-bridge',
      // 关键：排除 @btc/shared-components，因为它是本地包，包含 TSX 文件
      // 在开发环境中，应该直接从源码导入，而不是预构建
      // 这样可以避免 JSX 解析问题
      '@btc/shared-components',
    ],
    // 关键：设置为 true，强制重新构建所有依赖，确保所有依赖都被预构建
    // 这会在首次启动时构建所有依赖，之后就不会再触发了
    force: false,
    // 关键：参考 cool-admin 的做法
    // 注意：不再包含 shared-components/src/index.ts，因为它包含 TSX 文件，应该在运行时直接处理
    // shared-components 中的依赖（如 lunr, chardet 等）会在运行时被自动发现和优化
    entries: [
      // 应用的入口文件
      resolve(appDir, 'src/main.ts'),
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
  // 所有应用都使用别名指向源码（因为都打包 @btc/* 包）
  const baseResolve = createBaseResolve(appDir, appName);
  // 关键：生产/预览构建时，子应用不再使用本地 virtual:eps（由 layout-app 提供共享 EPS 服务）
  // 这样可以避免子应用入口产生对自身 eps-service-xxx.js 的引用，导致共享不生效或 404。
  const shouldUseSharedEps = (process.env.NODE_ENV === 'production') || isPreviewBuild;
  const sharedEpsStub = resolve(appDir, '../../configs/vite/stubs/virtual-eps-empty.ts');
  const finalResolve = shouldUseSharedEps
    ? {
        ...baseResolve,
        // 关键：保持别名数组形式，添加 virtual:eps 别名
        alias: Array.isArray(baseResolve?.alias)
          ? [
              ...baseResolve.alias,
              {
                find: 'virtual:eps',
                replacement: sharedEpsStub,
              },
            ]
          : {
              ...(baseResolve?.alias as Record<string, string> || {}),
              'virtual:eps': sharedEpsStub,
            },
      }
    : baseResolve;

  const config: any = {
    base: baseUrl,
    publicDir,
    // 关键：每个应用使用独立的缓存目录，避免不同应用的配置差异导致缓存冲突
    // 虽然这会增加一些存储空间，但可以确保每个应用的缓存状态一致，避免频繁重新构建
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
  };

  // 明确处理可选属性的 undefined（exactOptionalPropertyTypes）
  if (finalResolve !== undefined) {
    config.resolve = finalResolve;
  }

  return config;
}


/**
 * 布局应用 Vite 配置工厂
 * 生成布局应用的完整 Vite 配置（layout-app）
 */
;

import type { UserConfig, Plugin } from 'vite';
import { resolve } from 'path';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import qiankun from 'vite-plugin-qiankun';
import UnoCSS from 'unocss/vite';
import { createPathHelpers } from '../utils/path-helpers';

// 使用 ESM 导入 VueI18nPlugin（Vite 配置文件支持 ESM）
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { createAutoImportConfig, createComponentsConfig } from '../../auto-import.config';
import { btc } from '@btc/vite-plugin';
import { getViteAppConfig, getPublicDir } from '../../vite-app-config';
import { createBaseResolve } from '../base.config';
import { cleanDistPlugin, corsPlugin, addVersionPlugin, uploadCdnPlugin, cdnAssetsPlugin } from '../plugins';

export interface LayoutAppViteConfigOptions {
  /**
   * 应用名称（如 'layout-app'）
   */
  appName: string;
  /**
   * 应用根目录路径
   */
  appDir: string;
  /**
   * Qiankun 应用名称（如 'layout'）
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
   * 自定义 CSS 配置
   */
  customCss?: Partial<UserConfig['css']>;
  /**
   * BTC 插件配置
   */
  btcOptions?: {
    type?: 'admin';
    svg?: {
      skipNames?: string[];
    };
    eps?: {
      enable?: boolean;
      dist?: string;
      api?: string;
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
 * 创建布局应用 Vite 配置
 */
export function createLayoutAppViteConfig(options: LayoutAppViteConfigOptions): UserConfig {
  const {
    appName,
    appDir,
    qiankunName,
    customPlugins = [],
    customBuild,
    customServer,
    customPreview,
    customCss,
    btcOptions = {},
    vueI18nOptions,
    qiankunOptions = { useDevMode: true },
  } = options;

  // 获取应用配置
  const appConfig = getViteAppConfig(appName);
  // 使用导入的 createPathHelpers
  const { withRoot } = createPathHelpers(appDir);

  // 布局应用固定使用根路径
  const baseUrl = '/';
  const publicDir = getPublicDir(appName, appDir);

  // 扩展别名配置（布局应用特有）
  // 注意：baseResolve 在后面根据 mode 创建，这里只定义 layout 特有的别名
  const layoutAliases = {
    '@layout': resolve(appDir, 'src'),
    '@system': resolve(appDir, '../system-app/src'),
    '@': resolve(appDir, '../system-app/src'),
    '@services': resolve(appDir, '../system-app/src/services'),
  };

  // 构建插件列表
  // 关键：开发环境和预览环境必须禁用 CDN
  const isPreviewBuild = process.env.VITE_PREVIEW === 'true';
  const plugins: any[] = [
    // 1. 清理插件（在构建前清理 dist 目录，包括旧的 assets 和 assets/layout 目录）
    cleanDistPlugin(appDir),
    // 2. CORS 插件
    corsPlugin(),
    // 3. 自定义插件
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
    // 关键：与 cool-admin 保持一致，使用默认配置，让插件自动处理所有 JSX/TSX 文件
    vueJsx(),
    // 5. UnoCSS 插件
    UnoCSS({
      configFile: withRoot('uno.config.ts'),
    }),
    // 6. BTC 业务插件
    btc({
      type: 'admin' as any,
      svg: {
        skipNames: ['base', 'icons'],
        ...btcOptions.svg,
      },
      eps: {
        enable: true,
        // 关键：EPS 的 outputDir 必须使用绝对路径，基于 appDir 解析
        // 避免在构建时因为工作目录变化而在 dist 目录下创建 build 目录
        dist: resolve(appDir, 'build', 'eps'),
        // 共享的 EPS 数据源目录（从 main-app 读取）
        // layout-app 优先从 main-app 的 build/eps 读取 EPS 数据，实现真正的共享
        sharedEpsDir: resolve(appDir, '../main-app/build/eps'),
        api: '/api/login/eps/contract',
        ...btcOptions.eps,
      },
      ...btcOptions,
    }),
    // 7. VueI18n 插件
    VueI18nPlugin({
      include: vueI18nOptions?.include || [
        resolve(appDir, '../system-app/src/locales/**'),
        resolve(appDir, '../system-app/src/{modules,plugins}/**/locales/**'),
      ],
      runtimeOnly: vueI18nOptions?.runtimeOnly ?? true,
    }),
    // 8. 自动导入插件
    createAutoImportConfig(),
    // 9. 组件自动注册插件
    createComponentsConfig({ includeShared: true }),
    // 10. Qiankun 插件
    qiankun(qiankunName, qiankunOptions),
    // 11. 确保 script 标签有 type="module"
    {
      name: 'ensure-module-scripts',
      transformIndexHtml(html) {
        return html.replace(
          /<script(\s+[^>]*)?>/gi,
          (match: string, attrs: string = '') => {
            if (!match.includes('src=')) {
              return match;
            }
            if (attrs && attrs.includes('type=')) {
              return match.replace(/type=["']?[^"'\s>]+["']?/i, 'type="module"');
            }
            return `<script type="module"${attrs}>`;
          }
        );
      },
    } as Plugin,
    // 12. 添加版本号插件（为 HTML 资源引用添加时间戳版本号）
    addVersionPlugin(),
    // 12.5. CDN 资源加速插件（在版本号插件之后，确保版本号参数被保留）
    // 关键：开发环境和预览环境必须禁用 CDN
    cdnAssetsPlugin({
      appName,
      enabled: !isPreviewBuild && process.env.ENABLE_CDN_ACCELERATION !== 'false',
    }),
    // 15. 构建后清理插件：删除 .vite 目录（Vite 缓存目录不应出现在构建产物中）
    {
      name: 'clean-vite-dir-plugin',
      closeBundle() {
        const viteDir = resolve(appDir, 'dist', '.vite');
        if (existsSync(viteDir)) {
          try {
            rmSync(viteDir, { recursive: true, force: true });
            console.info('[clean-vite-dir-plugin] ✅ 已删除 dist/.vite 目录');
          } catch (error: any) {
            console.warn('[clean-vite-dir-plugin] ⚠️  无法删除 dist/.vite 目录:', error.message);
          }
        }
      },
    } as Plugin,
    // 16. 确保 manifest.json 生成插件（包含所有 chunk，不仅仅是入口文件）
    {
      name: 'ensure-manifest-plugin',
      writeBundle(_options: any, bundle: Record<string, any>) {
        // 从 bundle 中提取所有 chunk 信息
        const manifest: Record<string, { file: string; src?: string; isEntry?: boolean; imports?: string[] }> = {};
        const allChunks: Array<{ key: string; file: string; isEntry: boolean; priority: number; imports?: string[] }> = [];
        // 创建文件名到 key 的映射，用于查找 imports
        const fileNameToKeyMap = new Map<string, string>();

        // 第一遍遍历：收集所有 chunk 信息
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if ((chunk as any).type === 'chunk' && fileName.endsWith('.js')) {
            // 查找对应的源文件路径
            const sourceFile = (chunk as any).facadeModuleId || (chunk as any).moduleIds?.[0] || fileName;
            // 支持 assets/ 和 assets/layout/ 路径
            let relativeSource = fileName.replace(/^assets\/(layout\/)?/, ''); // 使用文件名作为默认 key（去掉 assets/ 或 assets/layout/ 前缀）

            if (sourceFile && typeof sourceFile === 'string') {
              // 尝试从源文件路径中提取相对路径
              const srcPath = sourceFile.replace(resolve(appDir, 'src'), 'src').replace(/\\/g, '/');
              if (srcPath.startsWith('src/')) {
                relativeSource = srcPath;
              } else {
                // 如果无法提取相对路径，使用文件名作为 key（去掉 assets/ 或 assets/layout/ 前缀）
                relativeSource = fileName.replace(/^assets\/(layout\/)?/, '').replace(/\.js$/, '');
              }
            }

            // 确定是否为入口文件
            const isEntry = (chunk as any).isEntry === true ||
                           fileName.includes('index-') ||
                           fileName.includes('main-');

            // 确定加载优先级（用于排序）
            let priority = 999;
            if (fileName.includes('vendor-') && !fileName.includes('echarts-vendor')) {
              priority = 1; // vendor 最先加载
            } else if (fileName.includes('echarts-vendor')) {
              priority = 2; // echarts-vendor 其次
            } else if (fileName.includes('menu-registry') ||
                       fileName.includes('eps-service') ||
                       fileName.includes('auth-api')) {
              priority = 3; // 其他依赖
            } else if (isEntry) {
              priority = 4; // 入口文件最后加载
            }

            // 提取 imports（依赖的 chunk 文件名）
            const imports: string[] = [];
            const chunkImports = (chunk as any).imports;
            if (chunkImports && Array.isArray(chunkImports)) {
              for (const importFileName of chunkImports) {
                if (importFileName && typeof importFileName === 'string' && importFileName.endsWith('.js')) {
                  imports.push(importFileName);
                }
              }
            }
            // 调试：输出 imports 信息
            if (imports.length > 0) {
              console.info(`[ensure-manifest-plugin] ${fileName} 的 imports:`, imports);
            }

            fileNameToKeyMap.set(fileName, relativeSource);
            allChunks.push({
              key: relativeSource,
              file: fileName,
              isEntry,
              priority,
              imports,
            });
          }
        }

        // 按优先级排序
        allChunks.sort((a, b) => a.priority - b.priority);

        // 构建最终的 manifest 对象，将 imports 中的文件名转换为对应的 key
        // 注意：imports 中的文件名可能是旧的（在 generateBundle 阶段生成的），
        // 需要通过基础名称匹配来找到新的文件名
        allChunks.forEach(chunk => {
          const importKeys: string[] = [];
          if (chunk.imports && chunk.imports.length > 0) {
            for (const importFileName of chunk.imports) {
              // 先尝试直接匹配（如果文件名已经是新的）
              let importKey = fileNameToKeyMap.get(importFileName);

              // 如果直接匹配失败，尝试通过基础名称匹配（去掉 hash 和 buildId）
              if (!importKey) {
                // 匹配多种文件名格式：
                // 1. name-X-xxx.js (特殊格式，如 menu-registry-B-483hvG.js，优先匹配)
                // 2. name-hash-buildId.js (多个 hash 段，hash 至少 8 个字符)
                // 3. name-hash.js (单个 hash 段，hash 至少 8 个字符)
                // 4. name-xxx.js (简单格式，xxx 可能是短 hash)
                let baseName: string | null = null;

                // 优先尝试匹配特殊格式（如 menu-registry-B-483hvG.js）
                // 格式：基础名称-单个字符-多个字符.js
                // 注意：483hvG 只有 6 个字符，所以不能要求至少 8 个字符
                const specialHashMatch = importFileName.match(/^([^-]+(?:-[^-]+)*?)-([A-Za-z0-9])-([a-zA-Z0-9]{4,})\.js$/);
                if (specialHashMatch && specialHashMatch[1]) {
                  baseName = specialHashMatch[1] ?? null;
                } else {
                  // 尝试匹配标准格式（多个 hash 段）
                  const multiHashMatch = importFileName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.js$/);
                  if (multiHashMatch && multiHashMatch[1]) {
                    baseName = multiHashMatch[1] ?? null;
                  } else {
                    // 尝试匹配单个 hash 段（至少 8 个字符）
                    const singleHashMatch = importFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9]{8,})\.js$/);
                    if (singleHashMatch && singleHashMatch[1]) {
                      baseName = singleHashMatch[1] ?? null;
                    } else {
                      // 尝试匹配简单格式（提取基础名称，去掉最后一个 hash 段）
                      const simpleMatch = importFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9]+)\.js$/);
                      if (simpleMatch && simpleMatch[1]) {
                        baseName = simpleMatch[1] ?? null;
                      }
                    }
                  }
                }

                if (baseName) {
                  // 在所有 chunk 中查找匹配的基础名称
                  for (const [actualFileName, actualKey] of fileNameToKeyMap.entries()) {
                    // 匹配实际文件名格式（可能包含时间戳）
                    let actualBaseName: string | null = null;

                    // 先尝试匹配特殊格式（如 menu-registry-B-483hvG-mj2mtu46.js）
                    // 格式：基础名称-单个字符-多个字符-时间戳.js
                    const actualSpecialHashMatch = actualFileName.match(/^([^-]+(?:-[^-]+)*?)-([A-Za-z0-9])-([a-zA-Z0-9]{4,})(?:-[a-zA-Z0-9]+)?\.js$/);
                    if (actualSpecialHashMatch && actualSpecialHashMatch[1]) {
                      actualBaseName = actualSpecialHashMatch[1] ?? null;
                    } else {
                      const actualMultiHashMatch = actualFileName.match(/^([^-]+(?:-[^-]+)*?)(?:-[a-zA-Z0-9]{8,})+(?:-[a-zA-Z0-9]+)?\.js$/);
                      if (actualMultiHashMatch && actualMultiHashMatch[1]) {
                        actualBaseName = actualMultiHashMatch[1] ?? null;
                      } else {
                        const actualSingleHashMatch = actualFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9]{8,})\.js$/);
                        if (actualSingleHashMatch && actualSingleHashMatch[1]) {
                          actualBaseName = actualSingleHashMatch[1] ?? null;
                        } else {
                          const actualSimpleMatch = actualFileName.match(/^([^-]+(?:-[^-]+)*?)-([a-zA-Z0-9]+)(?:-[a-zA-Z0-9]+)?\.js$/);
                          if (actualSimpleMatch && actualSimpleMatch[1]) {
                            actualBaseName = actualSimpleMatch[1] ?? null;
                          }
                        }
                      }
                    }

                    if (actualBaseName && actualBaseName === baseName) {
                      importKey = actualKey;
                      console.info(`[ensure-manifest-plugin] 通过基础名称匹配找到 imports: ${importFileName} -> ${actualFileName} (key: ${actualKey})`);
                      break;
                    }
                  }

                  // 如果仍然没有找到，输出调试信息
                  if (!importKey) {
                    console.warn(`[ensure-manifest-plugin] ⚠️  无法找到 imports 对应的文件: ${importFileName} (基础名称: ${baseName})`);
                  }
                } else {
                  console.warn(`[ensure-manifest-plugin] ⚠️  无法解析文件名格式: ${importFileName}`);
                }
              }

              if (importKey) {
                importKeys.push(importKey);
              } else {
                console.warn(`[ensure-manifest-plugin] ⚠️  无法找到 imports 对应的文件: ${importFileName}`);
              }
            }
          }

          manifest[chunk.key] = {
            file: chunk.file,
            src: chunk.key,
            isEntry: chunk.isEntry,
            ...(importKeys.length > 0 ? { imports: importKeys } : {}),
          };
        });

        // 如果没有找到任何 chunk，使用回退逻辑
        if (Object.keys(manifest).length === 0) {
          const firstChunk = Object.entries(bundle).find(([_, chunk]) => (chunk as any).type === 'chunk');
          if (firstChunk) {
            manifest['src/main.ts'] = {
              file: firstChunk[0],
              src: 'src/main.ts',
              isEntry: true,
            };
          }
        }

        // 写入 manifest.json 文件
        const manifestPath = resolve(appDir, 'dist', 'manifest.json');
        try {
          writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
          console.info(`[ensure-manifest-plugin] ✅ 已生成 manifest.json，包含 ${Object.keys(manifest).length} 个 chunk`);
        } catch (error: any) {
          console.warn('[ensure-manifest-plugin] ⚠️  无法写入 manifest.json:', error.message);
        }
      },
    } as Plugin,
    // 17. CDN 上传插件（仅在生产构建且启用时）
    ...(process.env.ENABLE_CDN_UPLOAD === 'true' && process.env.VITE_PREVIEW !== 'true'
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
    assetsInlineLimit: 0,
    outDir: process.env.BUILD_OUT_DIR || 'dist',
    assetsDir: 'assets',
    // 关键：启用 manifest 文件生成，用于动态加载入口文件
    manifest: true,
    // 关键：禁用 Vite 的自动清理，因为我们已经有 cleanDistPlugin 在构建前清理
    // 这样可以避免 Windows 上的文件锁定问题（EBUSY）
    // cleanDistPlugin 已经有重试机制（5次，递增等待时间），如果清理失败会继续构建
    // 注意：如果清理失败，旧的构建产物不会被删除，可能导致重复文件
    emptyOutDir: false,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      onwarn(warning: any, warn: (warning: any) => void) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
            (warning.message && typeof warning.message === 'string' &&
             warning.message.includes('dynamically imported') &&
             warning.message.includes('statically imported'))) {
          return;
        }
        if (warning.message && typeof warning.message === 'string' && warning.message.includes('Generated an empty chunk')) {
          return;
        }
        // 过滤循环依赖警告（已知的安全警告）
        // 当 shared-components 通过 reexport 导出组件，且组件和业务代码在不同 chunk 时会产生此警告
        // 这是预期的拆分策略，不会影响功能，因为 chunk 加载顺序已经正确配置
        if (warning.code === 'CIRCULAR_DEPENDENCY' ||
            (warning.message && typeof warning.message === 'string' &&
             (warning.message.includes('was reexported through module') ||
              warning.message.includes('will end up in different chunks') ||
              warning.message.includes('circular dependency')))) {
          return;
        }
        warn(warning);
      },
      // 关键：layout-app 作为主应用，需要打包 single-spa 和 qiankun
      // 不将它们标记为 external，确保它们被打包到构建产物中
      external: [
        // vite-plugin 是构建时插件，不应该被打包到运行时代码中
        '@btc/vite-plugin',
        /^@btc\/vite-plugin/,
        // 注意：single-spa 和 qiankun 不在这里，它们会被打包
      ],
      output: {
        format: 'esm',
        inlineDynamicImports: false,
        manualChunks(id: string) {
          // 关键：先处理 Vue 核心依赖，确保 vendor chunk 在 echarts-vendor 之前加载
          // 这样可以避免 echarts-vendor 在 vendor 之前加载导致的模块初始化顺序问题
          if (id.includes('node_modules/vue') ||
              id.includes('node_modules/vue-router') ||
              id.includes('node_modules/element-plus') ||
              id.includes('node_modules/pinia') ||
              id.includes('node_modules/@vueuse') ||
              id.includes('node_modules/@element-plus') ||
              id.includes('node_modules/dayjs') ||
              id.includes('node_modules/lodash') ||
              id.includes('node_modules/@vue') ||
              id.includes('packages/shared-components') ||
              id.includes('packages/shared-core') ||
              id.includes('packages/shared-utils')) {
            return 'vendor';
          }
          // 关键：vue-echarts 依赖于 Vue，所以应该放在 vendor 之后处理
          // 但为了保持分离，我们仍然将其放在 echarts-vendor 中
          // 注意：这要求 vendor 在 echarts-vendor 之前加载（通过 HTML 中的顺序保证）
          if (id.includes('node_modules/echarts') ||
              id.includes('node_modules/zrender') ||
              id.includes('node_modules/vue-echarts')) {
            return 'echarts-vendor';
          }
          if (id.includes('virtual:eps') ||
              id.includes('\\0virtual:eps') ||
              id.includes('services/eps') ||
              id.includes('services\\eps')) {
            return 'eps-service';
          }
          if (id.includes('packages/subapp-manifests') ||
              id.includes('packages/shared-components/src/store/menuRegistry') ||
              id.includes('configs/layout-bridge') ||
              id.includes('@btc/subapp-manifests') ||
              id.includes('@btc/shared-core/configs/layout-bridge')) {
            return 'menu-registry';
          }
          if (id.includes('node_modules/monaco-editor')) {
            return 'lib-monaco';
          }
          if (id.includes('node_modules/three')) {
            return 'lib-three';
          }
          return undefined;
        },
        preserveModules: false,
        generatedCode: {
          constBindings: false,
        },
        // 布局应用使用 assets/layout/ 目录，与子应用的 assets/ 目录区分开
        chunkFileNames: 'assets/layout/[name]-[hash].js',
        // 关键：layout-app 入口文件使用稳定文件名，避免旧 index.html/旧引用导致的 index-xxx.js 404
        // 配合 Nginx：assets/layout/index.js 设置 no-cache；其余 hash 文件 immutable
        entryFileNames: 'assets/layout/[name].js',
        assetFileNames: (assetInfo: any) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/layout/[name]-[hash].css';
          }
          return 'assets/layout/[name]-[hash].[ext]';
        },
      },
    },
    ...customBuild,
  };

  // 服务器配置
  const serverConfig: UserConfig['server'] = {
    port: appConfig.devPort,
    host: appConfig.devHost,
    strictPort: true,
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    fs: {
      allow: [
        resolve(appDir, '..'),
        resolve(appDir, '../system-app'),
        resolve(appDir, '../../'),
      ],
    },
    ...customServer,
  };

  // 预览服务器配置
  // 关键：预览服务器从根目录的 dist/{prodHost} 读取构建产物，而不是从 apps/{appName}/dist 读取
  const rootDistDir = resolve(appDir, '../../dist');
  const previewRoot = resolve(rootDistDir, appConfig.prodHost);

  const previewConfig: UserConfig['preview'] = {
    port: appConfig.prePort,
    host: appConfig.preHost,
    strictPort: true,
    open: false,
    // 关键：设置预览服务器的根目录为 dist/{prodHost}
    root: previewRoot,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    ...customPreview,
  };

  // CSS 配置
  const cssConfig: UserConfig['css'] = {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
    ...customCss,
  };

  // 优化依赖配置
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
      // layout-app 实际安装的依赖
      'vue-i18n',
      'axios',
      'echarts',
      'vue-echarts',
      'mitt',
      'nprogress',
      // 注意：lunr 和 file-saver 不是所有应用都安装，不应该在 include 中强制声明
      // 如果应用安装了这些依赖，Vite 会在扫描 entries 时自动发现并优化
      // 'lunr', // 只在 shared-components 中使用，不是所有应用都安装
      // 'file-saver', // 只在部分应用中使用，不是所有应用都安装
      // 注意：以下依赖不是所有应用都直接安装，它们通过 @btc/shared-components 间接使用
      // Vite 会在运行时自动发现并优化这些依赖，不需要在 include 中显式声明
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
    // 注意：不再包含 shared-components/src/index.ts，因为它包含 TSX 文件，应该在运行时直接处理
    entries: [
      resolve(appDir, 'src/main.ts'),
    ],
    esbuildOptions: {
      plugins: [],
      // 关键：确保依赖预构建时也使用 Vue 的 JSX 转换方式
      jsx: 'preserve', // 保留 JSX，让 vueJsx 插件处理
      jsxFactory: 'h', // 使用 Vue 的 h 函数作为 JSX 工厂函数
      jsxFragment: 'Fragment', // 使用 Vue 的 Fragment
    },
  };

  // 返回完整配置
  // 所有应用都使用别名指向源码（因为都打包 @btc/* 包）
  const baseResolve = createBaseResolve(appDir, appName);

  return {
    base: baseUrl,
    publicDir,
    // 关键：每个应用使用独立的缓存目录，避免不同应用的配置差异导致缓存冲突
    cacheDir: appCacheDir,
    define: {
      // 为浏览器环境提供 process 对象，Winston 需要它
      'process.env': '{}',
      'process.platform': JSON.stringify('browser'),
      'process.version': JSON.stringify(''),
    },
    resolve: {
      ...baseResolve,
      // 合并别名：baseResolve.alias 是数组形式，layoutAliases 是对象形式
      // 关键：layoutAliases 中的别名必须放在数组前面，确保优先匹配（特别是 @ 别名）
      alias: Array.isArray(baseResolve?.alias)
        ? [
            // layout-app 特有的别名放在前面，优先匹配
            ...Object.entries(layoutAliases).map(([find, replacement]) => ({
              find,
              replacement,
            })),
            // 过滤掉 baseResolve.alias 中与 layoutAliases 冲突的别名（如 @）
            ...baseResolve.alias.filter((alias) => {
              if (typeof alias.find === 'string') {
                return !(alias.find in layoutAliases);
              }
              return true;
            }),
          ]
        : {
            ...(baseResolve?.alias as Record<string, string> || {}),
            ...layoutAliases,
          },
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
    css: cssConfig,
    build: buildConfig,
    optimizeDeps: optimizeDepsConfig,
  };
}


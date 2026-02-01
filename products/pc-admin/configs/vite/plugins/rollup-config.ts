/**
 * Rollup 配置模块
 * 提供公共的 Rollup 配置
 */

import type { RollupOptions, WarningHandlerWithDefault, OutputAsset, Warning } from 'rollup';
import { createManualChunksStrategy } from './manual-chunks';

export interface RollupConfigOptions {
  /**
   * 资源文件目录（默认: 'assets'）
   */
  assetDir?: string;
  /**
   * chunk 文件目录（默认: 与 assetDir 相同）
   */
  chunkDir?: string;
  /**
   * 是否将 single-spa 和 qiankun 标记为外部库（默认: true）
   * 主应用（layout-app）应该设置为 false，以便打包这些库
   * 子应用应该设置为 true，避免重复打包
   */
  externalSingleSpa?: boolean;
  /**
   * 是否将 @btc 包标记为外部库（默认: false）
   * 所有应用都打包这些库，避免运行时模块解析问题
   */
  externalBtcPackages?: boolean;
  /**
   * 是否将 @configs 包标记为外部库（默认: true）
   * 主应用（main-app）应该设置为 false，以便打包这些库
   * 子应用应该设置为 true，从 layout-app 加载共享资源
   */
  externalConfigsPackages?: boolean;
}

/**
 * 创建 Rollup 配置
 * @param appName 应用名称
 * @param options 配置选项
 * @returns Rollup 配置对象
 */
export function createRollupConfig(appName: string, options?: RollupConfigOptions): RollupOptions {
  const manualChunks = createManualChunksStrategy(appName);
  const assetDir = options?.assetDir || 'assets';
  const chunkDir = options?.chunkDir || assetDir;
  // 默认将 single-spa 和 qiankun 标记为 external（子应用）
  // 主应用（layout-app）需要显式设置 externalSingleSpa: false
  // @ts-ignore: 可能在未来使用
  const _externalSingleSpa = options?.externalSingleSpa !== false;
  // 默认将 @btc 包打包到应用中（所有应用都打包，避免运行时模块解析问题）
  // 如果设置为 true，则标记为 external（不推荐）
  const externalBtcPackages = options?.externalBtcPackages === true;
  // 默认将 @configs 包标记为 external（子应用从 layout-app 加载）
  // 主应用（main-app）需要显式设置 externalConfigsPackages: false，以便打包这些库
  const externalConfigsPackages = options?.externalConfigsPackages !== false;

  // 构建 external 数组
  // Rollup 的 external 支持字符串、正则表达式或函数
  const external: (string | RegExp | ((id: string) => boolean))[] = [
    // vite-plugin 是构建时插件，不应该被打包到运行时代码中
    '@btc/vite-plugin',
    /^@btc\/vite-plugin/,
    // @btc 包：根据配置决定是否标记为 external
    // 默认所有应用都打包这些库，避免运行时模块解析问题
    // 注意：CSS 文件不应该被标记为 external，应该被 Vite 处理并打包
    ...(externalBtcPackages ? [
      '@btc/shared-components',
      // 匹配 JavaScript/TypeScript 模块，但不匹配 CSS 文件
      (id: string) => {
        if (id.startsWith('@btc/shared-components/')) {
          // 排除 CSS 文件（.css, .scss, .sass, .less 等）
          return !/\.(css|scss|sass|less|styl)$/i.test(id);
        }
        return false;
      },
      '@btc/shared-core',
      // 匹配 JavaScript/TypeScript 模块，但不匹配 CSS 文件
      (id: string) => {
        if (id.startsWith('@btc/shared-core/')) {
          return !/\.(css|scss|sass|less|styl)$/i.test(id);
        }
        return false;
      },
      '@btc/shared-utils',
      // 匹配 JavaScript/TypeScript 模块，但不匹配 CSS 文件
      (id: string) => {
        if (id.startsWith('@btc/shared-utils/')) {
          return !/\.(css|scss|sass|less|styl)$/i.test(id);
        }
        return false;
      },
    ] : []),
    // @btc/shared-core/configs 包：根据配置决定是否标记为 external
    // 主应用（main-app）应该打包这些库，子应用从 layout-app 加载
    ...(externalConfigsPackages ? [
      '@btc/shared-core/configs/layout-bridge',
      '@btc/shared-core/configs/unified-env-config',
      '@btc/shared-core/configs/app-scanner',
      '@btc/shared-core/configs/app-env.config',
      /^@btc\/shared-core\/configs\/.*/,
    ] : []),
  ];

  return {
    preserveEntrySignatures: 'strict',
    onwarn(warning: Warning, warn: WarningHandlerWithDefault) {
      // 过滤已知警告
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
      // 注意：不再过滤 @btc 包的警告，因为所有应用都打包这些包，不应该有 unresolved import 警告
      warn(warning);
    },
    output: {
      format: 'esm',
      inlineDynamicImports: false,
      manualChunks,
      preserveModules: false,
      generatedCode: {
        constBindings: false, // 不使用 const，避免 TDZ 问题
        // 关键：保留导出名称，避免被压缩成单字母
        // 这可以防止 "does not provide an export named 'c'" 错误
        preserveModulesRoot: undefined,
        // 关键：确保对象属性之间有正确的分隔符，避免字符串和数字连接
        objectShorthand: false, // 禁用对象简写，确保属性名和值都完整
        arrowFunctions: false, // 禁用箭头函数，使用普通函数，更安全
      },
      // 关键：确保导出名称不被压缩
      // 虽然 terser 的 mangle 已禁用，但 Rollup 的代码生成也可能压缩导出名称
      chunkFileNames: `${chunkDir}/[name]-[hash].js`,
      // 关键：入口文件使用稳定文件名（不带 hash），降低部署/缓存导致的 index-xxx.js 404 风险
      // Nginx 对该文件应配置 no-cache；其他 chunk 仍保持 hash + immutable
      entryFileNames: `${chunkDir}/[name].js`,
      assetFileNames: (assetInfo: OutputAsset) => {
        // 关键：favicon.ico 和 icons 目录的文件不应该添加 hash，应该保持在原位置
        // 这些文件会被 publicDir 或 copyIconsPlugin 复制到正确的位置
        if (assetInfo.name?.includes('favicon') || assetInfo.name?.includes('icons/')) {
          // 如果文件名包含 favicon 或 icons，保持原文件名（不含 hash）
          // 但这种情况应该很少，因为 publicDir 会直接复制这些文件
          return assetInfo.name || `${assetDir}/[name].[ext]`;
        }
        if (assetInfo.name?.endsWith('.css')) {
          return `${assetDir}/[name]-[hash].css`;
        }
        return `${assetDir}/[name]-[hash].[ext]`;
      },
    },
    external,
  };
}


/**
 * 基础配置模块
 * 提供公共的别名和 resolve 配置
 */

import type { UserConfig } from 'vite';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { createPathHelpers } from './utils/path-helpers';

/**
 * 创建基础别名配置
 * @param appDir 应用根目录路径
 * @param appName 应用名称
 * @returns 别名配置对象
 */
export function createBaseAliases(
  appDir: string, 
  _appName: string
): Record<string, string> {
  const { withSrc, withRoot, withConfigs, withPackages } = createPathHelpers(appDir);

  const aliases: Record<string, string> = {
    '@': withSrc('src'),
    '@modules': withSrc('src/modules'),
    '@services': withSrc('src/services'),
    '@components': withSrc('src/components'),
    '@utils': withSrc('src/utils'),
    '@auth': withRoot('auth'),
    '@configs': withPackages('shared-core/src/configs'),
    '@btc/auth-shared': withRoot('auth/shared'),
    // @btc/* 包别名：所有应用都打包这些包，所以始终使用别名指向源码
    '@btc/shared-core': withPackages('shared-core/src'),
    '@btc/shared-components': withPackages('shared-components/src'),
    '@btc/shared-router': withPackages('shared-router/src'),
    // 向后兼容：废弃包的别名指向归并后的位置
    '@btc/shared-utils': withPackages('shared-core/src/utils'),
    '@btc/shared-plugins': withPackages('shared-components/src/plugins'),
    '@btc/i18n': withPackages('shared-components/src/i18n'),
    '@btc/subapp-manifests': withPackages('shared-core/src/manifest'),
    '@btc/env': withPackages('shared-core/src/env'),
    
    // shared-components 内部使用的别名（用于解析 shared-components 内部的导入）
    '@btc-common': withPackages('shared-components/src/common'),
    '@btc-components': withPackages('shared-components/src/components'),
    '@btc-crud': withPackages('shared-components/src/crud'),
    '@btc-styles': withPackages('shared-components/src/styles'),
    '@btc-locales': withPackages('shared-components/src/locales'),
    '@btc-assets': withPackages('shared-components/src/assets'),
    '@assets': withPackages('shared-components/src/assets'), // @assets 别名，用于图片资源导入
    '@btc-utils': withPackages('shared-components/src/utils'),
    '@plugins': withPackages('shared-components/src/plugins'),
    
    // 图表相关别名
    '@charts-utils/css-var': withPackages('shared-components/src/charts/utils/css-var'),
    '@charts-utils/color': withPackages('shared-components/src/charts/utils/color'),
    '@charts-utils/gradient': withPackages('shared-components/src/charts/utils/gradient'),
    '@charts-composables/useChartComponent': withPackages('shared-components/src/charts/composables/useChartComponent'),
    '@charts-types': withPackages('shared-components/src/charts/types'),
    '@charts-utils': withPackages('shared-components/src/charts/utils'),
    '@charts-composables': withPackages('shared-components/src/charts/composables'),

    // Element Plus 别名（始终使用）
    'element-plus/es': 'element-plus/es',
    'element-plus/dist': 'element-plus/dist',
  };

  return aliases;
}

/**
 * 创建基础 resolve 配置
 * @param appDir 应用根目录路径
 * @param appName 应用名称
 * @returns resolve 配置对象
 */
export function createBaseResolve(
  appDir: string, 
  appName: string
): UserConfig['resolve'] {
  const { withPackages } = createPathHelpers(appDir);
  const aliases = createBaseAliases(appDir, appName);
  
  // 使用数组形式的别名，确保更具体的别名优先匹配
  // Vite 会按数组顺序匹配，第一个匹配的别名会被使用
  const aliasArray: Array<{ find: string | RegExp; replacement: string }> = [
    // 关键：将 util 映射到 npm 包，防止 Vite 将其视为 Node.js 内置模块并外部化
    // 需要查找 node_modules/util 的实际路径（可能在根目录或应用目录）
    {
      find: /^util$/,
      replacement: (() => {
        // 尝试从应用目录查找
        const appUtilPath = resolve(appDir, 'node_modules/util');
        if (existsSync(appUtilPath)) {
          return appUtilPath;
        }
        // 尝试从根目录查找
        const rootUtilPath = resolve(appDir, '../../node_modules/util');
        if (existsSync(rootUtilPath)) {
          return rootUtilPath;
        }
        // 如果找不到，返回包名让 Vite 自动解析（应该在 optimizeDeps.include 中）
        return 'util';
      })(),
    },
    // locales 子路径别名（所有应用都使用别名指向源码）
    {
      find: '@btc/shared-core/locales/zh-CN',
      replacement: withPackages('shared-core/src/btc/plugins/i18n/locales/zh-CN'),
    },
    {
      find: '@btc/shared-core/locales/en-US',
      replacement: withPackages('shared-core/src/btc/plugins/i18n/locales/en-US'),
    },
    {
      find: '@btc/shared-components/locales/zh-CN.json',
      replacement: withPackages('shared-components/src/locales/zh-CN.json'),
    },
    {
      find: '@btc/shared-components/locales/en-US.json',
      replacement: withPackages('shared-components/src/locales/en-US.json'),
    },
    // 其他别名（从对象转换为数组形式）
    ...Object.entries(aliases).map(([find, replacement]) => ({
      find,
      replacement,
    })),
  ];
  
  return {
    alias: aliasArray,
    dedupe: ['vue', 'vue-router', 'pinia', 'element-plus', '@element-plus/icons-vue'],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    // 确保 Vite 优先使用 package.json 的 exports 配置
    // 关键：添加 'development' 条件，确保在开发环境中使用源码
    conditions: ['development', 'import', 'module', 'browser', 'default'],
  };
}


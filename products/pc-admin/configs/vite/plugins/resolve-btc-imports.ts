/**
 * 解析 @btc/* 包导入插件
 * 处理从已构建的包（如 shared-core/dist/index.mjs）中导入的 @btc/* 模块
 * 同时处理 shared-components 内部使用的别名（如 @btc-components, @btc-common 等）
 * 确保 Rollup 能够正确解析这些导入，即使它们来自已构建的包
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 因为 esbuild 无法正确解析 workspace 包
// 使用 console 替代 logger，避免配置加载时的解析问题
const logger = {
  warn: (...args: any[]) => console.warn('[resolve-btc-imports]', ...args),
  error: (...args: any[]) => console.error('[resolve-btc-imports]', ...args),
  info: (...args: any[]) => console.info('[resolve-btc-imports]', ...args),
  debug: (...args: any[]) => console.debug('[resolve-btc-imports]', ...args),
};

import type { Plugin } from 'vite';
import { resolve } from 'path';
import { existsSync } from 'node:fs';
import { createPathHelpers } from '../utils/path-helpers';

export interface ResolveBtcImportsOptions {
  /**
   * 应用根目录路径
   */
  appDir: string;
  /**
   * 是否启用（默认：true）
   */
  enabled?: boolean;
}

/**
 * 解析 @btc/* 包导入插件
 */
export function resolveBtcImportsPlugin(options: ResolveBtcImportsOptions): Plugin {
  const { appDir, enabled = true } = options;

  if (!enabled) {
    return {
      name: 'resolve-btc-imports',
      apply: 'build',
    };
  }

  const { withPackages, withRoot, withConfigs } = createPathHelpers(appDir);

  /**
   * 检查导入是否来自已构建的包或 shared-components 源码
   */
  function isFromBuiltPackageOrSharedComponents(importer?: string): boolean {
    if (!importer) return false;
    
    // 来自已构建的包（如 shared-core/dist/index.mjs）
    const isFromBuiltPackage = (
      importer.includes('/dist/') ||
      importer.includes('\\dist\\') ||
      (importer.endsWith('.mjs') && !importer.includes('/src/')) ||
      (importer.endsWith('.js') && !importer.includes('/src/') && !importer.includes('node_modules'))
    );
    
    // 来自 shared-components 源码（需要解析内部别名）
    const isFromSharedComponents = importer.includes('shared-components/src');
    
    return isFromBuiltPackage || isFromSharedComponents;
  }

  /**
   * 确保路径有正确的扩展名
   * 如果路径没有扩展名，尝试添加常见的扩展名
   */
  function ensureFileExtension(filePath: string): string {
    // 如果路径已经有扩展名，直接返回
    if (/\.(ts|tsx|js|jsx|vue|json|css|scss|sass|less)$/i.test(filePath)) {
      return filePath;
    }
    
    // 按优先级尝试添加扩展名：.tsx, .ts, .jsx, .js
    const extensions = ['.tsx', '.ts', '.jsx', '.js'];
    for (const ext of extensions) {
      const pathWithExt = `${filePath}${ext}`;
      if (existsSync(pathWithExt)) {
        return pathWithExt;
      }
    }
    
    // 如果所有扩展名都不存在，返回原路径，让 Vite 的扩展名解析机制处理
    return filePath;
  }

  /**
   * 解析 shared-components 内部别名
   */
  function resolveSharedComponentsAlias(id: string): string | null {
    const { withPackages } = createPathHelpers(appDir);
    
    // 处理 @btc-components
    if (id === '@btc-components' || id.startsWith('@btc-components/')) {
      const subPath = id.replace('@btc-components/', '');
      const basePath = withPackages(`shared-components/src/components/${subPath}`);
      return ensureFileExtension(basePath);
    }
    
    // 处理 @btc-common
    if (id === '@btc-common' || id.startsWith('@btc-common/')) {
      const subPath = id.replace('@btc-common/', '');
      const basePath = withPackages(`shared-components/src/common/${subPath}`);
      return ensureFileExtension(basePath);
    }
    
    // 处理 @btc-crud
    if (id === '@btc-crud' || id.startsWith('@btc-crud/')) {
      const subPath = id.replace('@btc-crud/', '');
      const basePath = withPackages(`shared-components/src/crud/${subPath}`);
      return ensureFileExtension(basePath);
    }
    
    // 处理 @btc-styles
    if (id === '@btc-styles' || id.startsWith('@btc-styles/')) {
      const subPath = id.replace('@btc-styles/', '');
      const basePath = withPackages(`shared-components/src/styles/${subPath}`);
      return ensureFileExtension(basePath);
    }
    
    // 处理 @btc-locales
    if (id === '@btc-locales' || id.startsWith('@btc-locales/')) {
      const subPath = id.replace('@btc-locales/', '');
      const basePath = withPackages(`shared-components/src/locales/${subPath}`);
      return ensureFileExtension(basePath);
    }
    
    // 处理 @btc-assets 和 @assets
    if (id === '@btc-assets' || id.startsWith('@btc-assets/')) {
      const subPath = id.replace('@btc-assets/', '');
      const basePath = withPackages(`shared-components/src/assets/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === '@assets' || id.startsWith('@assets/')) {
      const subPath = id.replace('@assets/', '');
      const basePath = withPackages(`shared-components/src/assets/${subPath}`);
      return ensureFileExtension(basePath);
    }
    
    // 处理 @btc-utils
    if (id === '@btc-utils' || id.startsWith('@btc-utils/')) {
      const subPath = id.replace('@btc-utils/', '');
      const basePath = withPackages(`shared-components/src/utils/${subPath}`);
      return ensureFileExtension(basePath);
    }
    
    // 处理 @plugins
    if (id === '@plugins' || id.startsWith('@plugins/')) {
      const subPath = id.replace('@plugins/', '');
      const basePath = withPackages(`shared-components/src/plugins/${subPath}`);
      return ensureFileExtension(basePath);
    }
    
    // 处理图表相关别名（按从具体到一般的顺序）
    // 注意：具体的路径别名必须在通用别名之前检查
    if (id === '@charts-utils/css-var' || id.startsWith('@charts-utils/css-var/')) {
      const subPath = id.replace('@charts-utils/css-var', '').replace(/^\//, '');
      const basePath = withPackages(`shared-components/src/charts/utils/css-var${subPath ? '/' + subPath : ''}`);
      return ensureFileExtension(basePath);
    }
    if (id === '@charts-utils/color' || id.startsWith('@charts-utils/color/')) {
      const subPath = id.replace('@charts-utils/color', '').replace(/^\//, '');
      const basePath = withPackages(`shared-components/src/charts/utils/color${subPath ? '/' + subPath : ''}`);
      return ensureFileExtension(basePath);
    }
    if (id === '@charts-utils/gradient' || id.startsWith('@charts-utils/gradient/')) {
      const subPath = id.replace('@charts-utils/gradient', '').replace(/^\//, '');
      const basePath = withPackages(`shared-components/src/charts/utils/gradient${subPath ? '/' + subPath : ''}`);
      return ensureFileExtension(basePath);
    }
    if (id === '@charts-composables/useChartComponent' || id.startsWith('@charts-composables/useChartComponent/')) {
      const subPath = id.replace('@charts-composables/useChartComponent', '').replace(/^\//, '');
      const basePath = withPackages(`shared-components/src/charts/composables/useChartComponent${subPath ? '/' + subPath : ''}`);
      return ensureFileExtension(basePath);
    }
    if (id === '@charts-types' || id.startsWith('@charts-types/')) {
      const subPath = id.replace('@charts-types/', '');
      const basePath = withPackages(`shared-components/src/charts/types/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === '@charts-utils' || id.startsWith('@charts-utils/')) {
      const subPath = id.replace('@charts-utils/', '');
      const basePath = withPackages(`shared-components/src/charts/utils/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === '@charts-composables' || id.startsWith('@charts-composables/')) {
      const subPath = id.replace('@charts-composables/', '');
      const basePath = withPackages(`shared-components/src/charts/composables/${subPath}`);
      return ensureFileExtension(basePath);
    }
    if (id === '@charts' || id.startsWith('@charts/')) {
      const subPath = id.replace('@charts/', '');
      const basePath = withPackages(`shared-components/src/charts/${subPath}`);
      return ensureFileExtension(basePath);
    }
    
    return null;
  }

  return {
    name: 'resolve-btc-imports',
    apply: 'build',
    buildStart() {
      console.info('[resolve-btc-imports] 已启用，将解析从已构建包中导入的 @btc/* 模块和 shared-components 内部别名');
    },
    resolveId(id: string, importer?: string) {
      // 检查导入是否来自已构建的包或 shared-components 源码
      const shouldResolve = isFromBuiltPackageOrSharedComponents(importer);
      
      if (!shouldResolve) {
        // 如果导入不是来自已构建的包或 shared-components 源码，让其他插件（如别名配置）处理
        return null;
      }

      // 首先处理 shared-components 内部别名（这些别名可能在任何地方使用）
      const sharedComponentsAlias = resolveSharedComponentsAlias(id);
      if (sharedComponentsAlias) {
        console.info(`[resolve-btc-imports] 解析 shared-components 内部别名 ${id} (来自 ${importer?.split('/').slice(-2).join('/') || 'unknown'}) -> ${sharedComponentsAlias.split('/').slice(-3).join('/')}`);
        return sharedComponentsAlias;
      }

      // 处理 @configs 包的导入（从已构建包中导入时，现在指向 shared-core/src/configs）
      if (id.startsWith('@configs/')) {
        const subPath = id.replace('@configs/', '');
        const sourcePath = withConfigs(subPath);
        const finalPath = ensureFileExtension(sourcePath);
        
        console.info(`[resolve-btc-imports] 解析 @configs 包 ${id} (来自已构建包 ${importer?.split('/').slice(-2).join('/') || 'unknown'}) -> ${finalPath.split('/').slice(-3).join('/')}`);
        return finalPath;
      }

      // 处理 @btc/* 包的导入
      if (!id.startsWith('@btc/')) {
        return null;
      }

      // 处理 @btc/shared-components
      if (id === '@btc/shared-components' || id.startsWith('@btc/shared-components/')) {
        const sourcePath = id === '@btc/shared-components'
          ? withPackages('shared-components/src/index.ts')
          : withPackages(`shared-components/src/${id.replace('@btc/shared-components/', '')}`);
        
        console.info(`[resolve-btc-imports] 解析 ${id} (来自已构建包 ${importer?.split('/').slice(-2).join('/') || 'unknown'}) -> ${sourcePath.split('/').slice(-3).join('/')}`);
        return sourcePath;
      }

      // 处理 @btc/shared-core
      if (id === '@btc/shared-core' || id.startsWith('@btc/shared-core/')) {
        const sourcePath = id === '@btc/shared-core'
          ? withPackages('shared-core/src/index.ts')
          : withPackages(`shared-core/src/${id.replace('@btc/shared-core/', '')}`);
        
        console.info(`[resolve-btc-imports] 解析 ${id} (来自已构建包 ${importer?.split('/').slice(-2).join('/') || 'unknown'}) -> ${sourcePath.split('/').slice(-3).join('/')}`);
        return sourcePath;
      }

      // 处理 @btc/shared-utils
      if (id === '@btc/shared-utils' || id.startsWith('@btc/shared-utils/')) {
        const sourcePath = id === '@btc/shared-utils'
          ? withPackages('shared-utils/src/index.ts')
          : withPackages(`shared-utils/src/${id.replace('@btc/shared-utils/', '')}`);
        
        console.info(`[resolve-btc-imports] 解析 ${id} (来自已构建包 ${importer?.split('/').slice(-2).join('/') || 'unknown'}) -> ${sourcePath.split('/').slice(-3).join('/')}`);
        return sourcePath;
      }

      // 处理 @btc/shared-plugins
      if (id === '@btc/shared-plugins' || id.startsWith('@btc/shared-plugins/')) {
        const sourcePath = id === '@btc/shared-plugins'
          ? withPackages('shared-plugins/src/index.ts')
          : withPackages(`shared-plugins/src/${id.replace('@btc/shared-plugins/', '')}`);
        
        console.info(`[resolve-btc-imports] 解析 ${id} (来自已构建包 ${importer?.split('/').slice(-2).join('/') || 'unknown'}) -> ${sourcePath.split('/').slice(-3).join('/')}`);
        return ensureFileExtension(sourcePath);
      }

      // 处理 @btc/i18n
      if (id === '@btc/i18n' || id.startsWith('@btc/i18n/')) {
        const sourcePath = id === '@btc/i18n'
          ? withPackages('i18n/src/index.ts')
          : withPackages(`i18n/src/${id.replace('@btc/i18n/', '')}`);
        
        console.info(`[resolve-btc-imports] 解析 ${id} (来自已构建包 ${importer?.split('/').slice(-2).join('/') || 'unknown'}) -> ${sourcePath.split('/').slice(-3).join('/')}`);
        return ensureFileExtension(sourcePath);
      }

      // 处理 @btc/auth-shared
      if (id === '@btc/auth-shared' || id.startsWith('@btc/auth-shared/')) {
        let sourcePath: string;
        if (id === '@btc/auth-shared') {
          // @btc/auth-shared 没有根 index.ts，使用 composables/index.ts 作为入口
          sourcePath = withRoot('auth/shared/composables/index.ts');
        } else {
          const subPath = id.replace('@btc/auth-shared/', '');
          // 如果路径没有扩展名，添加 .ts 扩展名
          sourcePath = withRoot(`auth/shared/${subPath}${subPath.includes('.') ? '' : '.ts'}`);
        }
        
        console.info(`[resolve-btc-imports] 解析 ${id} (来自已构建包 ${importer?.split('/').slice(-2).join('/') || 'unknown'}) -> ${sourcePath.split('/').slice(-3).join('/')}`);
        return sourcePath;
      }

      // 其他 @btc/* 包，返回 null 让其他插件处理
      return null;
    },
  } as Plugin;
}


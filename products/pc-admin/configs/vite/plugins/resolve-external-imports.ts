/**
 * 解析外部模块动态导入插件
 * 在构建时处理动态导入中的 external 模块别名（如 @btc/shared-core）
 * 由于子应用将这些模块标记为 external，Rollup 不会解析它们，导致运行时浏览器无法解析别名
 * 这个插件会在构建时将这些别名转换为运行时解析逻辑
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 使用 console 替代 logger
const logger = {
  warn: (...args: any[]) => console.warn('[resolve-external-imports]', ...args),
  error: (...args: any[]) => console.error('[resolve-external-imports]', ...args),
  info: (...args: any[]) => console.info('[resolve-external-imports]', ...args),
  debug: (...args: any[]) => console.debug('[resolve-external-imports]', ...args),
};

import type { Plugin } from 'vite';

export interface ResolveExternalImportsOptions {
  /**
   * 需要解析的外部模块别名列表
   * 例如：['@btc/shared-core', '@btc/shared-components']
   */
  externals?: string[];
  /**
   * 是否启用（默认：仅在子应用构建时启用）
   */
  enabled?: boolean;
}

/**
 * 创建运行时模块解析函数代码
 * @param moduleSpecifier 模块说明符（如 '@btc/shared-core'）
 */
function createRuntimeResolveCode(moduleSpecifier: string): string {
  // 根据模块名称确定全局变量名
  let globalVarName = '__BTC_SHARED_CORE__';
  if (moduleSpecifier === '@btc/shared-components') {
    globalVarName = '__BTC_SHARED_COMPONENTS__';
  } else if (moduleSpecifier === '@btc/shared-utils') {
    globalVarName = '__BTC_SHARED_UTILS__';
  } else if (moduleSpecifier.startsWith('@btc/shared-core/')) {
    // 子路径访问（如 @btc/shared-core/composables/user-check）
    // 需要从主模块获取子模块
    const subPath = moduleSpecifier.replace('@btc/shared-core/', '');
    const escapedSubPath = JSON.stringify(subPath);
    const escapedSpecifier = JSON.stringify(moduleSpecifier);
    
    return `(async function() {
      const win = window;
      // 1. 尝试从全局变量访问主模块
      if (win.__BTC_SHARED_CORE__) {
        try {
          const mainModule = win.__BTC_SHARED_CORE__;
          const pathParts = ${escapedSubPath}.split('/');
          let subModule = mainModule;
          for (const part of pathParts) {
            if (subModule && typeof subModule === 'object' && part in subModule) {
              subModule = subModule[part];
            } else {
              throw new Error('Cannot access path part: ' + part);
            }
          }
          return subModule;
        } catch (e) {
          // 如果访问失败，抛出错误
          throw new Error('Failed to access sub-module from __BTC_SHARED_CORE__: ' + e.message);
        }
      }
      // 2. 尝试从 qiankun 全局对象访问
      if (win.__POWERED_BY_QIANKUN__ && win.__QIANKUN_DEVELOPMENT__) {
        const parentWindow = win.__QIANKUN_DEVELOPMENT__;
        if (parentWindow && parentWindow.__BTC_SHARED_CORE__) {
          const mainModule = parentWindow.__BTC_SHARED_CORE__;
          const pathParts = ${escapedSubPath}.split('/');
          let subModule = mainModule;
          for (const part of pathParts) {
            if (subModule && typeof subModule === 'object' && part in subModule) {
              subModule = subModule[part];
            } else {
              throw new Error('Cannot access path part: ' + part);
            }
          }
          return subModule;
        }
      }
      // 3. 抛出错误，说明模块不可用
      throw new Error('Module ${escapedSpecifier} is not available. It should be provided by layout-app.');
    })()`;
  }

  const escapedSpecifier = JSON.stringify(moduleSpecifier);
  
  return `(async function() {
    const win = window;
    // 1. 尝试从全局变量访问
    if (win.${globalVarName}) {
      return win.${globalVarName};
    }
    // 2. 尝试从 qiankun 全局对象访问
    if (win.__POWERED_BY_QIANKUN__ && win.__QIANKUN_DEVELOPMENT__) {
      const parentWindow = win.__QIANKUN_DEVELOPMENT__;
      if (parentWindow && parentWindow.${globalVarName}) {
        return parentWindow.${globalVarName};
      }
    }
    // 3. 抛出错误，说明模块不可用（不应该尝试动态导入，因为浏览器无法解析别名）
    throw new Error('Module ${escapedSpecifier} is not available. It should be provided by layout-app as window.${globalVarName}');
  })()`;
}

/**
 * 解析外部模块动态导入插件
 */
export function resolveExternalImportsPlugin(options?: ResolveExternalImportsOptions): Plugin {
  const {
    externals = ['@btc/shared-core', '@btc/shared-components', '@btc/shared-utils'],
    enabled = true,
  } = options || {};

  return {
    name: 'resolve-external-imports',
    apply: 'build',
    buildStart() {
      if (enabled) {
        console.info(`[resolve-external-imports] 已启用，将解析外部模块: ${externals.join(', ')}`);
      }
    },
    // 在 transform 阶段处理源码，确保在 Vite 的预加载机制之前处理
    transform(code: string, id: string) {
      if (!enabled) {
        return null;
      }

      // 只处理 TypeScript/JavaScript/Vue 文件
      if (!id.match(/\.(ts|js|tsx|jsx|vue)$/)) {
        return null;
      }

      // 跳过 node_modules 中的文件
      if (id.includes('node_modules')) {
        return null;
      }

      let modified = false;
      let newCode = code;

      // 匹配动态导入：import('@btc/shared-core') 或 import("@btc/shared-core")
      // 包括带选项的情况：import('@btc/shared-core', { assert: { type: 'json' } })
      // 以及 await import('@btc/shared-core')
      // 注意：使用非贪婪匹配，避免匹配到其他内容
      const dynamicImportPattern = /(?:await\s+)?import\s*\(\s*(['"])([^'"]+)\1(?:\s*,\s*[^)]+)?\s*\)/g;

      newCode = newCode.replace(dynamicImportPattern, (match: string, quote: string, specifier: string) => {
        // 检查是否是需要处理的外部模块
        const isExternal = externals.some(external => {
          // 精确匹配或子路径匹配（如 @btc/shared-core/composables/user-check）
          return specifier === external || specifier.startsWith(external + '/');
        });

        if (!isExternal) {
          return match; // 不是外部模块，保持原样
        }

        modified = true;

        // 生成运行时解析代码
        const replacement = createRuntimeResolveCode(specifier);
        
        // 如果原匹配包含 await，保留它
        if (match.startsWith('await')) {
          return `await ${replacement}`;
        }
        
        return replacement;
      });

      if (modified) {
        console.info(`[resolve-external-imports] 已转换文件 ${id.split('/').slice(-2).join('/')} 中的外部模块动态导入`);
      }

      return modified ? { code: newCode, map: null } : null;
    },
    // 同时在 renderChunk 阶段处理，作为兜底（处理 transform 阶段可能遗漏的情况）
    renderChunk(code: string, chunk: any) {
      if (!enabled) {
        return null;
      }

      // 只处理 JS chunk 文件
      if (!chunk.fileName.endsWith('.js')) {
        return null;
      }

      let modified = false;
      let newCode = code;

      // 匹配 __vitePreload 包装的动态导入
      // 例如：__vitePreload(async () => { const { routeLoadingService } = await import("@btc/shared-core"); return { routeLoadingService }; }, true ? [] : void 0)
      const vitePreloadPattern = /__vitePreload\s*\(\s*async\s*\(\)\s*=>\s*\{[^}]*await\s+import\s*\(\s*(['"])([^'"]+)\1\s*\)[^}]*\}\s*,\s*[^)]+\)/g;
      
      // 先处理 __vitePreload 包装的情况
      newCode = newCode.replace(vitePreloadPattern, (match: string) => {
        // 从匹配中提取 import 的模块说明符
        const importMatch = match.match(/import\s*\(\s*(['"])([^'"]+)\1/);
        if (!importMatch) {
          return match;
        }
        
        const specifier = importMatch[2];
        const isExternal = externals.some(external => {
          return specifier === external || specifier.startsWith(external + '/');
        });

        if (!isExternal) {
          return match;
        }

        modified = true;
        const replacement = createRuntimeResolveCode(specifier);
        
        // 提取原匹配中的解构赋值部分
        // 例如：const { routeLoadingService: routeLoadingService2 } = await import("@btc/shared-core");
        // 替换为：const sharedCoreModule = await ...; const routeLoadingService = sharedCoreModule.routeLoadingService;
        // 但这样比较复杂，直接替换整个 __vitePreload 调用为 await 调用
        return `await ${replacement}`;
      });

      // 匹配普通的动态导入：import('@btc/shared-core') 或 await import("@btc/shared-core")
      const dynamicImportPattern = /(?:await\s+)?import\s*\(\s*(['"])([^'"]+)\1(?:\s*,\s*[^)]+)?\s*\)/g;

      // 再处理普通的动态导入（不包括已经被 __vitePreload 包装的）
      newCode = newCode.replace(dynamicImportPattern, (match: string, quote: string, specifier: string) => {
        // 检查是否在 __vitePreload 中（已经被上面的处理过了）
        // 这里简单的检查：如果前面有 __vitePreload，跳过（但实际上应该已经被替换了）
        
        const isExternal = externals.some(external => {
          return specifier === external || specifier.startsWith(external + '/');
        });

        if (!isExternal) {
          return match;
        }

        modified = true;
        const replacement = createRuntimeResolveCode(specifier);
        
        if (match.startsWith('await')) {
          return `await ${replacement}`;
        }
        
        return replacement;
      });

      if (modified) {
        console.info(`[resolve-external-imports] 已转换 chunk ${chunk.fileName} 中的外部模块动态导入`);
      }

      return modified ? { code: newCode, map: null } : null;
    },
  } as Plugin;
}

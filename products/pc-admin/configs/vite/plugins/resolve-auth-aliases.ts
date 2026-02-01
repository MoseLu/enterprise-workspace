/**
 * 解析 auth 目录下的 @ 别名插件
 * 处理 auth 目录下文件使用的 @ 别名，将其解析为指向应用目录的路径
 */

import type { Plugin } from 'vite';
import { resolve } from 'path';
import { existsSync } from 'node:fs';
import { createPathHelpers } from '../utils/path-helpers';

export interface ResolveAuthAliasesOptions {
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
 * 确保路径有正确的扩展名
 */
function ensureFileExtension(filePath: string): string {
  // 如果路径已经有扩展名，直接返回
  if (/\.(ts|tsx|js|jsx|vue|json|css|scss|sass|less|png|jpg|jpeg|gif|svg|webp)$/i.test(filePath)) {
    return filePath;
  }
  
  // 按优先级尝试添加扩展名：.ts, .tsx, .js, .jsx, .vue
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.vue'];
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
 * 解析 auth 目录下的 @ 别名插件
 */
export function resolveAuthAliasesPlugin(options: ResolveAuthAliasesOptions): Plugin {
  const { appDir, enabled = true } = options;

  if (!enabled) {
    return {
      name: 'resolve-auth-aliases',
    };
  }

  const { withSrc } = createPathHelpers(appDir);

  return {
    name: 'resolve-auth-aliases',
    enforce: 'pre', // 在其他解析插件之前执行
    resolveId(id: string, importer?: string) {
      // 检查导入是否来自 auth 目录
      if (!importer || !id.startsWith('@/')) {
        return null;
      }

      const isFromAuth = importer.includes('/auth/') || importer.includes('\\auth\\');
      if (!isFromAuth) {
        return null;
      }

      // 将 @/xxx 解析为 apps/{app}/src/xxx
      const pathWithoutAlias = id.replace(/^@\//, '');
      const resolvedPath = withSrc(`src/${pathWithoutAlias}`);
      const finalPath = ensureFileExtension(resolvedPath);

      return finalPath;
    },
  } as Plugin;
}


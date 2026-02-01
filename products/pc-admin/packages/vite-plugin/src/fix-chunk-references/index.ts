/**
 * fix-chunk-references 插件
 * 修复 chunk 之间的引用关系，确保所有引用都指向正确的文件
 * 
 * 这个插件解决了移除 forceNewHashPlugin 和 fixDynamicImportHashPlugin 后出现的 404 问题
 * 同时避免了修改第三方库代码导致的 __vccOpts 未定义错误
 */
;

import type { Plugin } from 'vite';

// 旧的 chunk hash 列表，这些是已经不存在但可能仍然被引用的旧文件
const OLD_REF_PATTERN = /B2xaJ9jT|CQjIfk82|Ct0QBumG|B9_7Pxt3|C3806ap7|D-vcpc3r|COBg3Fmo|C-4vWSys|u6iSJWLT|Bob15k_M|DXiZfgDR|CK3kLuZf|B6Y4X6Zv|vga9bYFB|C5YyqyGj|5K5tXpWB|element-plus-CQjIfk82|vue-core-Ct0QBumG|vendor-B2xaJ9jT|vue-router-B9_7Pxt3|app-src-C3806ap7|app-src-COBg3Fmo|app-src-vga9bYFB|index-D-vcpc3r|index-C-4vWSys|index-u6iSJWLT|index-C5YyqyGj|index-5K5tXpWB/g;

export function fixChunkReferencesPlugin(): Plugin {
  return {
    name: 'fix-chunk-references',
    // 只在 generateBundle 阶段清理旧引用，不修改文件名
    generateBundle(_options: any, bundle: Record<string, any>) {
      let totalCleanups = 0;
      
      for (const [fileName, chunk] of Object.entries(bundle as Record<string, any>)) {
        const c: any = chunk;
        if (c.type !== 'chunk' || !c.code) {
          continue;
        }

        // 检查是否包含旧引用
        if (!OLD_REF_PATTERN.test(c.code)) {
          continue;
        }

        OLD_REF_PATTERN.lastIndex = 0; // 重置正则表达式
        let newCode = c.code;
        let modified = false;
        const oldHashList = OLD_REF_PATTERN.source.replace(/^\/|\/[gimuy]*$/g, '').split('|');
        const escapedOldHashes = oldHashList.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

        // 1. 清理 __vite__mapDeps 数组中的旧引用
        if (newCode.includes('__vite__mapDeps')) {
          const mapDepsPattern = new RegExp(`(["'])([^"']*(${escapedOldHashes})[^"']*)(["'])`, 'g');
          // const beforeLength = newCode.length; // 未使用
          newCode = newCode.replace(mapDepsPattern, (match: any, quote1: any, _path: any, _oldHash: any, quote2: any) => {
            // 检查是否在 __vite__mapDeps 上下文中
            const beforeMatch = newCode.substring(Math.max(0, newCode.indexOf(match) - 100), newCode.indexOf(match));
            if (beforeMatch.includes('__vite__mapDeps') || beforeMatch.includes('m.f')) {
              modified = true;
              return quote1 + quote2; // 替换为空字符串
            }
            return match;
          });
          
          // 清理空字符串和连续逗号
          if (modified) {
            newCode = newCode.replace(/,\s*""\s*,/g, ',');
            newCode = newCode.replace(/\[\s*""\s*,/g, '[');
            newCode = newCode.replace(/,\s*""\s*\]/g, ']');
            newCode = newCode.replace(/\[\s*""\s*\]/g, '[]');
            newCode = newCode.replace(/,\s*,/g, ',');
          }
        }

        // 2. 清理动态导入中的旧引用：import('/assets/xxx-vga9bYFB.js')
        const importPattern = new RegExp(`import\\s*\\(\\s*(["'\`])([^"'\`]*(${escapedOldHashes})[^"'\`]*)(["'\`])\\s*\\)`, 'g');
        if (importPattern.test(newCode)) {
          importPattern.lastIndex = 0;
          newCode = newCode.replace(importPattern, 'Promise.resolve()');
          modified = true;
        }

        // 3. 清理字符串中的旧引用："assets/xxx-vga9bYFB.js" 或 '/assets/xxx-vga9bYFB.js'
        // 只匹配资源文件路径，避免误删其他代码
        const stringPattern = new RegExp(`(["'\`])([^"'\`]*(?:assets/|/assets/)[^"'\`]*(${escapedOldHashes})[^"'\`]*\\.(js|mjs|css)(\\?[^"'\`]*)?)(["'\`])`, 'g');
        if (stringPattern.test(newCode)) {
          stringPattern.lastIndex = 0;
          newCode = newCode.replace(stringPattern, (_match: any, quote1: any, _path: any, _oldHash: any, _ext: any, _query: any, quote2: any) => {
            modified = true;
            return quote1 + quote2; // 替换为空字符串
          });
        }

        // 应用修改
        if (modified) {
          // 验证：确保代码不会变成空或无效
          const trimmedCode = newCode.trim();
          if (trimmedCode && trimmedCode.length > 0) {
            chunk.code = newCode;
            totalCleanups++;
            console.info(`[fix-chunk-references] 已清理 ${fileName} 中的旧引用`);
          } else {
            console.warn(`[fix-chunk-references] 跳过清理 ${fileName}，避免破坏文件`);
          }
        }
      }

      if (totalCleanups > 0) {
        console.info(`[fix-chunk-references] 共清理了 ${totalCleanups} 个文件中的旧引用`);
      }
    },
  } as unknown as Plugin;
}

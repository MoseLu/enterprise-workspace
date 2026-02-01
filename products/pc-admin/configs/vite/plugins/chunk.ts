/**
 * Chunk 相关插件
 * 包括 chunk 验证和优化
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 使用 console 替代 logger
const logger = {
  warn: (...args: any[]) => console.warn('[chunk]', ...args),
  error: (...args: any[]) => console.error('[chunk]', ...args),
  info: (...args: any[]) => console.info('[chunk]', ...args),
  debug: (...args: any[]) => console.debug('[chunk]', ...args),
};

import type { Plugin } from 'vite';
import type { OutputOptions, OutputBundle } from 'rollup';

/**
 * 验证所有 chunk 生成插件
 */
export function chunkVerifyPlugin(): Plugin {
  return {
    name: 'chunk-verify-plugin',
    writeBundle(_options: OutputOptions, bundle: OutputBundle) {
      console.info('\n[chunk-verify-plugin] ✅ 生成的所有 chunk 文件：');
      const jsChunks = Object.keys(bundle).filter(file => file.endsWith('.js'));
      const cssChunks = Object.keys(bundle).filter(file => file.endsWith('.css'));

      console.info(`\nJS chunk（共 ${jsChunks.length} 个）：`);
      jsChunks.forEach(chunk => console.info(`  - ${chunk}`));

      console.info(`\nCSS chunk（共 ${cssChunks.length} 个）：`);
      cssChunks.forEach(chunk => console.info(`  - ${chunk}`));

      const indexChunk = jsChunks.find(jsChunk => jsChunk.includes('index-'));
      const indexSize = indexChunk ? (bundle[indexChunk] as any)?.code?.length || 0 : 0;
      const indexSizeKB = indexSize / 1024;
      const indexSizeMB = indexSizeKB / 1024;

      const missingRequiredChunks: string[] = [];
      if (!indexChunk) {
        missingRequiredChunks.push('index');
      }

      const hasEpsService = jsChunks.some(jsChunk => jsChunk.includes('eps-service'));
      const hasAuthApi = jsChunks.some(jsChunk => jsChunk.includes('auth-api'));
      const hasEchartsVendor = jsChunks.some(jsChunk => jsChunk.includes('echarts-vendor'));
      const hasLibMonaco = jsChunks.some(jsChunk => jsChunk.includes('lib-monaco'));
      const hasLibThree = jsChunks.some(jsChunk => jsChunk.includes('lib-three'));

      console.info(`\n[chunk-verify-plugin] 📦 构建情况（平衡拆分策略）：`);
      if (indexChunk) {
        console.info(`  ✅ index: 主文件（Vue生态 + Element Plus + 业务代码，体积~${indexSizeMB.toFixed(2)}MB 未压缩，gzip后~${(indexSizeMB * 0.3).toFixed(2)}MB）`);
      } else {
        console.info(`  ❌ 入口文件不存在`);
      }
      if (hasEpsService) console.info(`  ✅ eps-service: EPS 服务（所有应用共享，单独打包）`);
      if (hasAuthApi) console.info(`  ✅ auth-api: Auth API（所有应用共享，单独打包，由 system-app 提供）`);
      if (hasEchartsVendor) console.info(`  ✅ echarts-vendor: ECharts + zrender（独立大库，无依赖问题）`);
      if (hasLibMonaco) console.info(`  ✅ lib-monaco: Monaco Editor（独立大库）`);
      if (hasLibThree) console.info(`  ✅ lib-three: Three.js（独立大库）`);
      console.info(`  ℹ️  业务代码和 Vue 生态合并到主文件，避免初始化顺序问题`);

      if (missingRequiredChunks.length > 0) {
        console.error(`\n[chunk-verify-plugin] ❌ 缺失核心 chunk：`, missingRequiredChunks);
        throw new Error(`核心 chunk 缺失，构建失败！`);
      } else {
        console.info(`\n[chunk-verify-plugin] ✅ 核心 chunk 全部存在`);
      }

      // 验证资源引用一致性
      console.info('\n[chunk-verify-plugin] 🔍 验证资源引用一致性...');
      const allChunkFiles = new Set([...jsChunks, ...cssChunks]);
      const referencedFiles = new Map<string, string[]>();
      const missingFiles: Array<{ file: string; referencedBy: string[]; possibleMatches: string[] }> = [];

      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkAny = chunk as any;
        if (chunkAny.type === 'chunk' && chunkAny.code) {
          const codeWithoutComments = chunkAny.code
            .replace(/\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '');

          const importPattern = /import\s*\(\s*["'](\/?assets\/[^"'`\s]+\.(js|mjs|css))["']\s*\)/g;
          let match;
          while ((match = importPattern.exec(codeWithoutComments)) !== null) {
            const resourcePath = match[1];
            if (!resourcePath) continue;
            const resourceFile = resourcePath.replace(/^\/?assets\//, 'assets/');
            if (!referencedFiles.has(resourceFile)) {
              referencedFiles.set(resourceFile, []);
            }
            referencedFiles.get(resourceFile)!.push(fileName);
          }

          const urlPattern = /new\s+URL\s*\(\s*["'](\/?assets\/[^"'`\s]+\.(js|mjs|css))["']/g;
          while ((match = urlPattern.exec(codeWithoutComments)) !== null) {
            const resourcePath = match[1];
            if (!resourcePath) continue;
            const resourceFile = resourcePath.replace(/^\/?assets\//, 'assets/');
            if (!referencedFiles.has(resourceFile)) {
              referencedFiles.set(resourceFile, []);
            }
            referencedFiles.get(resourceFile)!.push(fileName);
          }
        }
      }

      for (const [referencedFile, referencedBy] of referencedFiles.entries()) {
        const fileName = referencedFile.replace(/^assets\//, '');
        let exists = allChunkFiles.has(fileName);
        let possibleMatches: string[] = [];

        if (!exists) {
          const match = fileName.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
          if (match) {
            const [, namePrefix, , ext] = match;
            possibleMatches = Array.from(allChunkFiles).filter(chunkFile => {
              const chunkMatch = chunkFile.match(/^([^-]+(?:-[^-]+)*?)(?:-([a-zA-Z0-9]{8,}))?\.(js|mjs|css)$/);
              if (chunkMatch) {
                const [, chunkNamePrefix, , chunkExt] = chunkMatch;
                return chunkNamePrefix === namePrefix && chunkExt === ext;
              }
              return false;
            });
            exists = possibleMatches.length > 0;
          }
        }

        if (!exists) {
          missingFiles.push({ file: referencedFile, referencedBy, possibleMatches });
        }
      }

      if (missingFiles.length > 0) {
        console.error(`\n[chunk-verify-plugin] ❌ 发现 ${missingFiles.length} 个引用的资源文件不存在：`);
        if (missingFiles.length <= 5) {
          console.warn(`\n[chunk-verify-plugin] ⚠️  警告：发现 ${missingFiles.length} 个引用的资源文件不存在，但继续构建`);
        } else {
          throw new Error(`资源引用不一致，构建失败！有 ${missingFiles.length} 个引用的文件不存在`);
        }
      } else {
        console.info(`\n[chunk-verify-plugin] ✅ 所有资源引用都正确（共验证 ${referencedFiles.size} 个引用）`);
      }
    },
  } as Plugin;
}

/**
 * 优化代码分割插件：处理空 chunk
 */
export function optimizeChunksPlugin(): Plugin {
  return {
    name: 'optimize-chunks',
    generateBundle(_options: OutputOptions, bundle: OutputBundle) {
      const emptyChunks: string[] = [];
      const chunkReferences = new Map<string, string[]>();

      for (const [fileName, chunk] of Object.entries(bundle)) {
        const chunkAny = chunk as any;
        if (chunkAny.type === 'chunk' && chunkAny.code && chunkAny.code.trim().length === 0) {
          emptyChunks.push(fileName);
        }
        if (chunkAny.type === 'chunk' && chunkAny.imports) {
          for (const imported of chunkAny.imports) {
            if (!chunkReferences.has(imported)) {
              chunkReferences.set(imported, []);
            }
            chunkReferences.get(imported)!.push(fileName);
          }
        }
      }

      if (emptyChunks.length === 0) {
        return;
      }

      const chunksToRemove: string[] = [];
      const chunksToKeep: string[] = [];

      for (const emptyChunk of emptyChunks) {
        const referencedBy = chunkReferences.get(emptyChunk) || [];
        if (referencedBy.length > 0) {
          const chunk = bundle[emptyChunk];
          if (chunk && (chunk as any).type === 'chunk') {
            (chunk as any).code = 'export {}';
            chunksToKeep.push(emptyChunk);
            console.info(`[optimize-chunks] 保留被引用的空 chunk: ${emptyChunk} (被 ${referencedBy.length} 个 chunk 引用，已添加占位符)`);
          }
        } else {
          chunksToRemove.push(emptyChunk);
          delete bundle[emptyChunk];
        }
      }

      if (chunksToRemove.length > 0) {
        console.info(`[optimize-chunks] 移除了 ${chunksToRemove.length} 个未被引用的空 chunk:`, chunksToRemove);
      }
      if (chunksToKeep.length > 0) {
        console.info(`[optimize-chunks] 保留了 ${chunksToKeep.length} 个被引用的空 chunk（已添加占位符）:`, chunksToKeep);
      }
    },
  } as Plugin;
}


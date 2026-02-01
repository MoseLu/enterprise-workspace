;
import type { Plugin, ResolvedConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, copyFileSync, mkdirSync } from 'fs';
// logger 已移除，使用 console 替代

const __filename = fileURLToPath(import.meta.url);
// @ts-expect-error: __dirname 未使用，保留用于未来功能
const __dirname = dirname(__filename);

/**
 * 复制 logo.png 到构建输出目录的插件
 * 从共享组件库的 public 目录复制 logo.png 到应用的 dist 目录
 */
export function copyLogoPlugin(): Plugin {
  let viteConfig: ResolvedConfig | null = null;

  return {
    name: 'vite-plugin-copy-logo',
    apply: 'build', // 只在构建时执行
    
    configResolved(config: ResolvedConfig) {
      viteConfig = config;
    },

    closeBundle() {
      try {
        if (!viteConfig) {
          console.warn('[copy-logo] Vite 配置未找到，跳过复制 logo.png');
          return;
        }

        // 获取应用根目录
        const root = viteConfig.root || process.cwd();
        
        // 共享组件库的 logo.png 路径
        // 从应用根目录（如 apps/logistics-app）到 packages/shared-components/public/logo.png
        const logoSourcePath = resolve(
          root,
          '../../packages/shared-components/public/logo.png'
        );
        
        // 检查源文件是否存在
        if (!existsSync(logoSourcePath)) {
          console.warn('[copy-logo] logo.png 源文件不存在，跳过复制:', logoSourcePath);
          return;
        }

        // 获取构建输出目录（从 Vite 配置）
        const outDir = viteConfig.build.outDir || 'dist';
        const distDir = resolve(root, outDir);

        if (!existsSync(distDir)) {
          console.warn('[copy-logo] 构建输出目录不存在，跳过复制 logo.png:', distDir);
          return;
        }

        const logoDestPath = resolve(distDir, 'logo.png');
        
        // 确保目标目录存在
        const destDir = dirname(logoDestPath);
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }

        // 复制文件
        copyFileSync(logoSourcePath, logoDestPath);
        console.info(`[copy-logo] 已复制 logo.png 到: ${logoDestPath}`);
      } catch (error) {
        console.error('[copy-logo] 复制 logo.png 失败:', error);
      }
    },
  } as unknown as Plugin;
}

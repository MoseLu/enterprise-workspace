/**
 * Logo 路径解析插件
 * 用于在子应用构建时解析 /logo.png 路径
 * 当 publicDir 被禁用时，需要手动解析 logo.png 的路径并复制文件
 */

import type { Plugin, ResolvedConfig } from 'vite';
import { resolve, dirname } from 'path';
import { existsSync, copyFileSync, mkdirSync } from 'node:fs';

export function resolveLogoPlugin(appDir: string): Plugin {
  let viteConfig: ResolvedConfig | null = null;

  return {
    name: 'resolve-logo',
    apply: 'build', // 只在构建时执行

    configResolved(config: ResolvedConfig) {
      viteConfig = config;
    },

    resolveId(id: string) {
      // 处理 /logo.png 或 logo.png 的解析
      if (id === '/logo.png' || id === 'logo.png') {
        // 尝试从共享组件库获取 logo.png
        const sharedLogoPath = resolve(appDir, '../../packages/shared-components/public/logo.png');
        if (existsSync(sharedLogoPath)) {
          return sharedLogoPath;
        }

        // 尝试从应用自己的 public 目录获取（开发环境可能还有）
        const appLogoPath = resolve(appDir, 'public/logo.png');
        if (existsSync(appLogoPath)) {
          return appLogoPath;
        }

        // 如果都不存在，返回虚拟模块 ID
        return `\0logo.png`;
      }
      return null;
    },

    load(id: string) {
      // 如果是虚拟模块，返回空内容（实际文件会在 closeBundle 时复制）
      if (id === '\0logo.png') {
        return '';
      }
      return null;
    },

    closeBundle() {
      // 在构建完成后复制 logo.png 到 dist 目录
      try {
        if (!viteConfig) {
          return;
        }

        const root = viteConfig.root || appDir;

        // 优先从共享组件库获取 logo.png
        const sharedLogoPath = resolve(root, '../../packages/shared-components/public/logo.png');
        let logoSourcePath: string | null = null;

        if (existsSync(sharedLogoPath)) {
          logoSourcePath = sharedLogoPath;
        } else {
          // 尝试从应用自己的 public 目录获取
          const appLogoPath = resolve(root, 'public/logo.png');
          if (existsSync(appLogoPath)) {
            logoSourcePath = appLogoPath;
          }
        }

        if (!logoSourcePath) {
          return; // 如果源文件不存在，静默跳过
        }

        // 获取构建输出目录
        const outDir = viteConfig.build.outDir || 'dist';
        const distDir = resolve(root, outDir);

        if (!existsSync(distDir)) {
          return; // 如果输出目录不存在，跳过
        }

        const logoDestPath = resolve(distDir, 'logo.png');

        // 确保目标目录存在
        const destDir = dirname(logoDestPath);
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }

        // 复制文件
        copyFileSync(logoSourcePath, logoDestPath);
      } catch (error) {
        // 静默失败，避免阻塞构建
      }
    },
  } as Plugin;
}


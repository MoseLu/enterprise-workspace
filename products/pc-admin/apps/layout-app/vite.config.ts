import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { createLayoutAppViteConfig } from '../../configs/vite/factories/layout.config';
import { copyIconsPlugin, uploadIconsToOssPlugin } from '../../configs/vite/plugins';

export default defineConfig(
  createLayoutAppViteConfig({
    appName: 'layout-app',
    appDir: fileURLToPath(new URL('.', import.meta.url)),
    qiankunName: 'layout',
    customPlugins: [
      // 关键：layout-app 需要复制 icons 目录，因为它是统一管理图标的应用
      copyIconsPlugin(fileURLToPath(new URL('.', import.meta.url))),
      // 生产构建完成后，自动上传图标文件到 OSS
      uploadIconsToOssPlugin(),
    ],
  })
);

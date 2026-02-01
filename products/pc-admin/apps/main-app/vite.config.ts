import { defineConfig, type ConfigEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { createMainAppViteConfig } from '../../configs/vite/factories/mainapp.config';
import { dutyStaticPlugin } from '../../configs/vite/plugins';
import { injectFallbackTitle } from '@btc/vite-plugin';
import { proxy } from './src/config/proxy';

const appDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ command, mode }: ConfigEnv) => {
  const baseConfig = createMainAppViteConfig({
    appName: 'main-app',
    appDir,
    // 启用 public 图片资源处理插件（构建时自动启用）
    publicImagesToAssets: true,
    // 启用资源预加载插件（默认启用）
    enableResourcePreload: true,
    customPlugins: [
      // 添加 duty 静态文件插件，在开发服务器层面处理 /duty/ 路径
      dutyStaticPlugin(appDir),
      // 注入静态兜底标题
      injectFallbackTitle({ packageName: 'main-app' }),
    ],
    customServer: { proxy },
    proxy,
  });

  // 关键：根据 command 动态配置 publicDir
  // - 开发环境（serve）：启用 publicDir，让 Vite 正常服务 public 目录的文件
  // - 构建环境（build）：禁用 publicDir，由 publicImagesToAssetsPlugin 插件处理文件
  if (command === 'serve') {
    // 开发环境：启用 publicDir
    return baseConfig;
  } else {
    // 构建环境：如果启用了 publicImagesToAssets 插件，禁用 publicDir
    const isPreviewBuild = process.env.VITE_PREVIEW === 'true';
    if (!isPreviewBuild) {
      return {
        ...baseConfig,
        publicDir: false, // 构建时禁用 publicDir，由插件处理
      };
    }
    return baseConfig;
  }
});


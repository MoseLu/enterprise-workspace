import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { createSubAppViteConfig } from '../../configs/vite/factories/subapp.config';
import { dutyStaticPlugin } from '../../configs/vite/plugins';
import { injectFallbackTitle } from '@btc/vite-plugin';
import { getProxyConfig } from './src/config/proxy';
import { svgHmrPlugin } from './vite-plugins/svg-hmr';

const appDir = fileURLToPath(new URL('.', import.meta.url));

// 获取 proxy 配置（使用函数，避免在模块加载时解析 @btc/shared-core）
const proxy = getProxyConfig();

export default defineConfig(
  createSubAppViteConfig({
    appName: 'system-app',
    appDir,
    qiankunName: 'system',
    customPlugins: [
      // 添加 duty 静态文件插件，在开发服务器层面处理 /duty/ 路径
      dutyStaticPlugin(appDir),
      // 注入静态兜底标题
      injectFallbackTitle({ packageName: 'system-app' }),
      // 应用级别的 SVG HMR 插件（支持热更新，无需重新构建共享包）
      svgHmrPlugin(appDir),
    ],
    customServer: { proxy },
    proxy,
    btcOptions: {
      svg: {
        allowAppIcons: true, // 启用应用内图标（src/assets/icons）
      },
    },
  })
);

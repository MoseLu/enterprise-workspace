/**
 * layout-app 通用插件配置
 * 
 * 提供所有子应用都需要的通用插件UI：
 * - GitHub
 * - 主题切换
 * - 通知
 * - 消息
 * - 国际化
 * - 偏好设置
 * 
 * 注意：layout-app 不包含具体的业务插件
 */
;

import type { App } from 'vue';
import { usePluginManager, logger } from '@btc/shared-core';
import router from '../router';
import { discoverSystemPlugins } from './auto-discover';
import { tSync } from '../i18n/getters';

/**
 * 注册 layout-app 的通用插件
 */
export async function registerLayoutPlugins(app: App) {
  const pluginManager = usePluginManager({ debug: false });
  pluginManager.setApp(app);
  pluginManager.setRouter(router);
  
  // 暴露 pluginManager 到全局，供组件使用
  (window as any).__PLUGIN_MANAGER__ = pluginManager;
  
  // 自动发现 system-app 定义的插件（包括主题、国际化、偏好设置等）
  const plugins = await discoverSystemPlugins();
  
  for (const plugin of plugins) {
    try {
      pluginManager.register(plugin);
      if (plugin.enable !== false) {
        await pluginManager.install(plugin.name);
      }
    } catch (error) {
      logger.error(`[layout-app] ${tSync('common.error.plugin_register_failed')}: ${plugin.name}`, error);
    }
  }
  
  return pluginManager;
}


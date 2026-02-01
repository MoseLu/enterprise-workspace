/**
 * 插件系统集成模块
 * 负责自动发现和注册插件
 */
;

import type { App } from 'vue';
import { usePluginManager, resetPluginManager, logger } from '@btc/shared-core';
import { scanAndRegisterPlugins } from './module-scanner';
import router from '../../router';

// 导出插件管理器实例，供其他组件使用
export let globalPluginManager: ReturnType<typeof usePluginManager>;

/**
 * 自动发现并注册插件
 * 类似 Cool-Admin 的模块发现机制
 */
export async function autoDiscoverPlugins(app: App) {
  // 重置插件管理器单例
  resetPluginManager();

  // 初始化插件管理器
  const pluginManager = usePluginManager({ debug: false });
  pluginManager.setApp(app);
  pluginManager.setRouter(router);

  // 设置全局插件管理器实例
  globalPluginManager = pluginManager;

  // 自动扫描并注册所有插件
  const plugins = await scanAndRegisterPlugins(app);

  // 注册所有扫描到的插件
  for (const plugin of plugins) {
    try {
      // 检查插件是否已注册，避免重复注册
      if (pluginManager.has(plugin.name)) {
        console.warn(`[PluginManager] 插件 "${plugin.name}" 已注册，跳过重复注册`);
        continue;
      }
      pluginManager.register(plugin);
    } catch (error) {
      // 如果是重复注册错误，只警告不报错
      if (error instanceof Error && error.message.includes('already registered')) {
        console.warn(`[PluginManager] 插件 "${plugin.name}" 已注册，跳过重复注册`);
      } else {
        logger.error(`[PluginManager] 注册插件失败: ${plugin.name}`, error);
      }
    }
  }

  // 安装所有插件
  for (const plugin of plugins) {
    if (plugin.enable !== false) {
      try {
        await pluginManager.install(plugin.name);
      } catch (error) {
        logger.error(`[PluginManager] 安装插件失败: ${plugin.name}`, error);
      }
    }
  }

  return pluginManager;
}

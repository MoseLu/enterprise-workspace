/**
 * 子应用插件消费模块
 * 子应用通过此模块消费主应用提供的全局插件状态和能力
 */
;

import type { App } from 'vue';
import {
  consumeI18nPluginHost,
  consumeThemePluginHost,
  consumePreferencePluginHost,
} from '@btc/shared-plugins';

/**
 * 初始化插件消费（子应用）
 * @param app Vue应用实例
 */
export function initPluginConsumer(app: App) {
  // 获取全局状态
  const globalState = (window as any).globalState;

  if (!globalState) {
    console.warn('[plugin-consumer] globalState is not available');
    return;
  }

  // 1. 消费全局强管控型插件（所有子应用都需要）
  // 国际化插件消费
  consumeI18nPluginHost({
    globalState,
    app,
  });

  // 主题插件消费
  consumeThemePluginHost({
    globalState,
  });

  // 偏好设置插件消费
  consumePreferencePluginHost({
    globalState,
  });

  // 2. 如果有消息/通知需求，可以在 mount 生命周期中注册
  // 示例：
  // if (window.__PLUGIN_API__?.messageCenter) {
  //   window.__PLUGIN_API__.messageCenter.registerSource('system-app', []);
  // }

  // 3. 如果有GitHub功能需求，可以调用GitHub API
  // 示例：
  // if (window.__PLUGIN_API__?.github) {
  //   const isAuthed = await window.__PLUGIN_API__.github.checkAuth();
  // }
}

/**
 * 卸载插件消费（子应用卸载时调用）
 * @param appName 应用名称
 */
export function unloadPluginConsumer(appName: string) {
  // 注销消息源（如果有）
  if ((window as any).__PLUGIN_API__?.messageCenter) {
    (window as any).__PLUGIN_API__.messageCenter.unregisterSource(appName);
  }

  // 注销通知源（如果有）
  if ((window as any).__PLUGIN_API__?.notificationCenter) {
    (window as any).__PLUGIN_API__.notificationCenter.unregisterSource(appName);
  }
}


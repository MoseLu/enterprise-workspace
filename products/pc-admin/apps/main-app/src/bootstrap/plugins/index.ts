/**
 * 插件基座初始化模块
 * 统一加载所有插件核心逻辑，提供全局API
 */

import type { App } from 'vue';
import type { QiankunActions } from '@btc/shared-plugins';
import {
  initI18nPluginHost,
  initThemePluginHost,
  initPreferencePluginHost,
  createMessagePluginHost,
  createNotificationPluginHost,
  initGitHubPluginHost,
  type PluginAPI,
} from '@btc/shared-plugins';

let pluginAPI: PluginAPI | null = null;

/**
 * 初始化插件基座
 * @param app Vue应用实例
 * @param globalState qiankun全局状态
 * @param i18nMessages 国际化消息（可选）
 */
export function initPluginHost(
  app: App,
  globalState: QiankunActions,
  i18nMessages?: Record<string, any>
) {
  if (pluginAPI) {
    return pluginAPI;
  }

  // 1. 初始化全局强管控型插件（主应用独占）
  const i18nPlugin = initI18nPluginHost({
    globalState,
    app,
    messages: i18nMessages,
  });

  const themePlugin = initThemePluginHost({
    globalState,
    app,
  });

  const preferencePlugin = initPreferencePluginHost({
    globalState,
  });

  // 2. 初始化全局能力扩展型插件（主应用基座）
  const messagePlugin = createMessagePluginHost({
    globalState,
  });

  const notificationPlugin = createNotificationPluginHost({
    globalState,
  });

  // 3. 初始化工具集成管控型插件（主应用鉴权）
  const githubPlugin = initGitHubPluginHost({
    globalState,
  });

  // 构建插件API
  pluginAPI = {
    i18n: {
      changeLocale: i18nPlugin.changeLocale,
      getCurrentLocale: i18nPlugin.getCurrentLocale,
    },
    theme: {
      changeTheme: themePlugin.changeTheme,
      getCurrentTheme: themePlugin.getCurrentTheme,
    },
    preference: {
      update: preferencePlugin.update,
      get: preferencePlugin.get,
      getAll: preferencePlugin.getAll,
    },
    messageCenter: {
      registerSource: messagePlugin.registerSource,
      unregisterSource: messagePlugin.unregisterSource,
      push: messagePlugin.push,
      markAsRead: messagePlugin.markAsRead,
      getMessages: messagePlugin.getMessages,
    },
    notificationCenter: {
      registerSource: notificationPlugin.registerSource,
      unregisterSource: notificationPlugin.unregisterSource,
      push: notificationPlugin.push,
      getNotifications: notificationPlugin.getNotifications,
    },
    github: {
      checkAuth: githubPlugin.checkAuth,
      login: githubPlugin.login,
      logout: githubPlugin.logout,
      getRepos: githubPlugin.getRepos,
      getCommits: githubPlugin.getCommits,
      createIssue: githubPlugin.createIssue,
    },
  };

  // 挂载到全局
  if (typeof window !== 'undefined') {
    (window as any).__PLUGIN_API__ = pluginAPI;
  }

  return pluginAPI;
}

/**
 * 获取插件API（供其他模块使用）
 */
export function getPluginAPI(): PluginAPI | null {
  return pluginAPI || (typeof window !== 'undefined' ? (window as any).__PLUGIN_API__ : null);
}


/**
 * 主应用菜单注册 Composable
 * 用于注册主应用的菜单
 * 使用 manifest 文件而不是硬编码，与其他子应用保持一致
 */

import { isMainAppRoute, logger } from '@btc/shared-core';
import { registerManifestTabsForApp, registerManifestMenusForApp } from './useQiankunMenuRegistry';
import { getAppsUsingDynamicI18n } from '../apps';

/**
 * 根据路径获取应用ID（通用方法）
 */
function getAppIdFromPath(path: string): string {
  // 使用统一的工具函数获取应用标识
  try {
    if (typeof (window as any).__BTC_GET_APP_ID_FROM_PATH__ === 'function') {
      const getAppIdFromPath = (window as any).__BTC_GET_APP_ID_FROM_PATH__;
      return getAppIdFromPath(path);
    }
  } catch (e) {
    // 忽略错误，继续使用兜底逻辑
  }

  // 兜底逻辑：如果无法使用统一工具函数，使用路径匹配
  if (path.startsWith('/system')) return 'system';
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/logistics')) return 'logistics';
  if (path.startsWith('/engineering')) return 'engineering';
  if (path.startsWith('/quality')) return 'quality';
  if (path.startsWith('/production')) return 'production';
  if (path.startsWith('/finance')) return 'finance';
  if (path.startsWith('/docs')) return 'docs';
  if (path.startsWith('/operations')) return 'operations';
  // 默认返回 main（主应用）
  return 'main';
}

/**
 * 注册主应用菜单
 * 使用 manifest 文件注册，与其他子应用保持一致
 * 对于所有子应用，都先加载国际化消息，再注册菜单（支持动态生成的国际化消息）
 */
export async function registerMainAppMenus(): Promise<void> {
  const currentPath = window.location.pathname;
  const isMainAppRouteCheck = isMainAppRoute(currentPath);

  // 关键：预加载所有子应用的 i18n 消息，确保菜单、tabbar、面包屑都能正确翻译
  // 因为菜单需要显示所有子应用的菜单项，而不仅仅是当前激活的应用
  // 注意：preloadAllSubAppsI18n 内部会等待子应用的 i18n 获取器注册完成（最多等待 2000ms）
  const { preloadAllSubAppsI18n } = await import('../../i18n/subapp-i18n-manager');
  const { i18n } = await import('../../i18n');
  
  await preloadAllSubAppsI18n(i18n).catch(() => {
    // 静默忽略错误
  });

  if (isMainAppRouteCheck) {
    // 如果是主应用路由，使用 manifest 注册菜单（与其他子应用保持一致）
    registerManifestTabsForApp('main').catch((err) => logger.error('注册主应用标签页失败', err));
    registerManifestMenusForApp('main').catch((err) => logger.error('注册主应用菜单失败', err));
  } else {
    // 对于子应用路由，先加载国际化消息，再注册菜单
    // 这样支持使用动态生成的国际化消息（从 config.ts）的子应用
    const appId = getAppIdFromPath(currentPath);

    // 跳过 main 应用，它的国际化消息已经在初始化时加载了
    if (appId === 'main') {
      registerManifestTabsForApp('main').catch((err) => logger.error('注册主应用标签页失败', err));
      registerManifestMenusForApp('main').catch((err) => logger.error('注册主应用菜单失败', err));
      return;
    }

    // 跳过 docs-app，它的国际化方式和普通业务应用不一样（VitePress）
    if (appId === 'docs') {
      registerManifestTabsForApp('docs').catch((err) => logger.error('注册docs应用标签页失败', err));
      registerManifestMenusForApp('docs').catch((err) => logger.error('注册docs应用菜单失败', err));
      return;
    }

    const { loadAndMergeSubAppI18n } = await import('../../i18n/subapp-i18n-manager');
    const { i18n } = await import('../../i18n');

    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 100;

    while (retryCount < maxRetries) {
      // 检查是否已经注册
      if (typeof window !== 'undefined') {
        const subAppI18nGetters = (window as any).__SUBAPP_I18N_GETTERS__;
        if (subAppI18nGetters && subAppI18nGetters instanceof Map && subAppI18nGetters.has(appId)) {
          // 已经注册，直接加载
          await loadAndMergeSubAppI18n(i18n, appId).catch((err) => logger.error(`加载子应用${appId}国际化消息失败`, err));
          break;
        }
      }

      // 尝试加载（可能从 JSON 文件加载，或者如果已经注册则从动态获取器加载）
      await loadAndMergeSubAppI18n(i18n, appId).catch((err) => logger.error(`加载子应用${appId}国际化消息失败`, err));

      // 再次检查是否已经注册（可能在加载过程中注册了）
      if (typeof window !== 'undefined') {
        const subAppI18nGetters = (window as any).__SUBAPP_I18N_GETTERS__;
        if (subAppI18nGetters && subAppI18nGetters instanceof Map && subAppI18nGetters.has(appId)) {
          // 已经注册，重新加载以使用动态生成的消息
          await loadAndMergeSubAppI18n(i18n, appId).catch((err) => logger.error(`加载子应用${appId}国际化消息失败`, err));
          break;
        }
      }

      // 如果还没有注册，等待一段时间后重试
      if (retryCount < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      retryCount++;
    }

    // 关键：对于使用动态国际化的应用，如果 globalState 消息还没有到达，直接跳过注册
    // 等待 globalState 监听器处理（它会合并消息后重新注册菜单）
    // 这样可以避免在注册菜单时出现 "Translation key not found" 警告，以及菜单先显示 key 再刷新的问题
    const appsUsingDynamicI18n = getAppsUsingDynamicI18n();
    if (appsUsingDynamicI18n.includes(appId)) {
      try {
        const { getGlobalState } = await import('@btc/shared-core');
        const globalState = getGlobalState();
        if (globalState) {
          const currentState = globalState.getGlobalState();
          // 检查消息是否已经到达，并且消息不为空
          if (currentState?.subAppI18nMessages?.[appId]) {
            const messages = currentState.subAppI18nMessages[appId];
            // 确保消息不为空（至少有一个语言的消息）
            if (messages && (messages['zh-CN'] || messages['en-US'])) {
              // 消息已到达，可以注册菜单了
              registerManifestTabsForApp(appId).catch((err) => logger.error(`注册应用${appId}标签页失败`, err));
              registerManifestMenusForApp(appId).catch((err) => logger.error(`注册应用${appId}菜单失败`, err));
              return; // 消息已到达，注册菜单后返回
            }
          }
        }
      } catch (error) {
        // 忽略错误
      }

      // 消息还没有到达，直接返回，等待 globalState 监听器处理
      // globalState 监听器会在收到消息后合并并重新注册菜单
      return;
    }

    // 对于不使用动态国际化的应用，直接注册菜单
    registerManifestTabsForApp(appId).catch((err) => logger.error(`注册应用${appId}标签页失败`, err));
    registerManifestMenusForApp(appId).catch((err) => logger.error(`注册应用${appId}菜单失败`, err));
  }
}


/**
 * 子应用国际化管理器
 * 负责从子应用加载国际化数据并合并到主应用i18n实例
 */

import type { I18n } from 'vue-i18n';
import { getAppsUsingDynamicI18n } from '../micro/apps';

// 内存缓存
const i18nCache = new Map<string, Record<string, any>>();

/**
 * 判断是否为开发环境
 */
function isDev(): boolean {
  return import.meta.env.DEV;
}


/**
 * 深合并对象
 */
export function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        target[key] !== null &&
        !Array.isArray(target[key])
      ) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

/**
 * 加载并合并子应用的国际化数据到主应用i18n实例
 */
export async function loadAndMergeSubAppI18n(
  i18n: I18n,
  appId: string
): Promise<void> {
  try {
    // 跳过 main 应用，它的国际化消息已经在初始化时加载了，不需要通过这个函数加载
    if (appId === 'main') {
      return;
    }
    
    // 跳过 docs-app，它的国际化方式和普通业务应用不一样（VitePress）
    if (appId === 'docs') {
      return;
    }

    // 获取当前语言
    const localeValue = i18n.global.locale;
    const currentLocale = (typeof localeValue === 'string' ? localeValue : localeValue.value) as 'zh-CN' | 'en-US';

    // 方案2：优先从全局获取动态生成的国际化消息（从 config.ts）
    // 检查子应用是否暴露了国际化消息获取函数
    if (typeof window !== 'undefined') {
      const subAppI18nGetters = (window as any).__SUBAPP_I18N_GETTERS__;

      if (subAppI18nGetters && subAppI18nGetters instanceof Map && subAppI18nGetters.has(appId)) {
        const getLocaleMessages = subAppI18nGetters.get(appId);
        if (typeof getLocaleMessages === 'function') {
          try {
            const messages = getLocaleMessages();
            

            if (messages && messages[currentLocale]) {
              const localeMessages = messages[currentLocale];

              // 合并到主应用i18n实例
              const currentMessages = i18n.global.getLocaleMessage(currentLocale);
              const mergedMessages = deepMerge(currentMessages, localeMessages);
              
              // 关键：对于子应用的 subapp 对象，确保所有属性都被保留（包括 name）
              // 因为主应用可能没有 subapp 对象，需要确保子应用的 subapp 对象被正确合并
              // 注意：直接复制 subapp 对象，确保所有属性都被保留
              if (localeMessages.subapp && typeof localeMessages.subapp === 'object') {
                mergedMessages.subapp = { ...localeMessages.subapp }; // 直接复制，确保所有属性都被保留
              }
              
              i18n.global.setLocaleMessage(currentLocale, mergedMessages);

              return;
            }
          } catch (error) {
            // 静默忽略错误，继续执行
          }
        }
      }
    }

    // 关键：检查是否已经通过 globalState 发送了国际化消息
    // 如果已经发送，说明该应用使用动态国际化架构，不应该回退到 JSON 文件加载
    try {
      const { getGlobalState } = await import('@btc/shared-core');
      const globalState = getGlobalState();
      if (globalState) {
        const currentState = globalState.getGlobalState();
        if (currentState?.subAppI18nMessages?.[appId]) {
          // 已经通过 globalState 发送了国际化消息，不需要从 JSON 文件加载
          // 等待 globalState 监听器处理即可
          return;
        }
      }
    } catch (error) {
      // 忽略错误，继续执行
    }

    // 关键：对于使用动态国际化架构的应用（如 admin-app），不应该回退到 JSON 文件加载
    // 这些应用会通过 globalState 发送国际化消息，即使 getter 还没有注册，也应该等待
    // 判断方法：检查应用是否会在挂载时通过 globalState 发送国际化消息
    const appsUsingDynamicI18n = getAppsUsingDynamicI18n();
    if (appsUsingDynamicI18n.includes(appId)) {
      // 使用动态国际化的应用，不加载 JSON 文件，等待 globalState 消息
      // 如果 globalState 中还没有消息，说明子应用还没有挂载，等待即可
      return;
    }

    // 注意：已移除基于 manifest 的 JSON 文件加载方式，现在统一使用扫描方案（从 config.ts 提取）
    // 如果 getter 不存在，说明子应用还没有注册国际化消息，等待即可

  } catch (error) {
    // 不抛出错误，避免阻塞应用挂载
  }
}

/**
 * 预加载所有子应用的国际化数据（用于概览页面等需要显示所有应用信息的场景）
 */
export async function preloadAllSubAppsI18n(i18n: I18n): Promise<void> {
  try {
    const localeValue = i18n.global.locale;
    const currentLocale = (typeof localeValue === 'string' ? localeValue : localeValue.value) as 'zh-CN' | 'en-US';

    // 从全局获取所有已注册的国际化消息获取器
    if (typeof window === 'undefined') {
      return;
    }

    const subAppI18nGetters = (window as any).__SUBAPP_I18N_GETTERS__;
    if (!subAppI18nGetters || !(subAppI18nGetters instanceof Map)) {
      // 等待一段时间后重试（最多等待 10000ms，每次 100ms，共 100 次）
      // 因为子应用的模块可能在菜单渲染之后才加载（特别是财务和物流应用）
      // 概览页面需要显示所有应用信息，所以需要等待更长时间
      let retryCount = 0;
      const maxRetries = 100;
      const retryDelay = 100;
      
      while (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        const retryGetters = (window as any).__SUBAPP_I18N_GETTERS__;
        if (retryGetters && retryGetters instanceof Map && retryGetters.size > 0) {
          // 使用找到的获取器继续处理
          const loadPromises = Array.from(retryGetters.entries()).map(async ([appId, getLocaleMessages]) => {
            if (appId === 'docs') {
              return {};
            }
            if (typeof getLocaleMessages === 'function') {
              try {
                const messages = getLocaleMessages();
                if (messages && messages[currentLocale]) {
                  return messages[currentLocale];
                }
              } catch (error) {
                return {};
              }
            }
            return {};
          });
          const allMessages = await Promise.all(loadPromises);
          const currentMessages = i18n.global.getLocaleMessage(currentLocale);
          let mergedMessages = { ...currentMessages };
          for (const messages of allMessages) {
            if (Object.keys(messages).length > 0) {
              mergedMessages = deepMerge(mergedMessages, messages);
            }
          }
          i18n.global.setLocaleMessage(currentLocale, mergedMessages);
          
          return;
        }
        
        retryCount++;
      }
      
      return;
    }

    // 并行加载所有子应用的国际化数据
    const loadPromises = Array.from(subAppI18nGetters.entries()).map(async ([appId, getLocaleMessages]) => {
      // 跳过 docs-app，它的国际化方式和普通业务应用不一样（VitePress）
      if (appId === 'docs') {
        return {};
      }

      if (typeof getLocaleMessages === 'function') {
        try {
          const messages = getLocaleMessages();
          if (messages && messages[currentLocale]) {
            return messages[currentLocale];
          }
        } catch (error) {
          return {};
        }
      }

      return {};
    });

    const allMessages = await Promise.all(loadPromises);

    // 一次性合并所有消息
    const currentMessages = i18n.global.getLocaleMessage(currentLocale);
    let mergedMessages = { ...currentMessages };

    for (const messages of allMessages) {
      if (Object.keys(messages).length > 0) {
        mergedMessages = deepMerge(mergedMessages, messages);
      }
    }

    i18n.global.setLocaleMessage(currentLocale, mergedMessages);
  } catch (error) {
    // 静默忽略错误
  }
}

/**
 * 清除缓存（用于开发环境热更新）
 */
export function clearI18nCache(appId?: string): void {
  if (appId) {
    i18nCache.delete(`${appId}-zh-CN`);
    i18nCache.delete(`${appId}-en-US`);
  } else {
    i18nCache.clear();
  }
}

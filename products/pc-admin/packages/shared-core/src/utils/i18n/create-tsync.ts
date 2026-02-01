/**
 * 创建同步翻译函数 tSync 的工具函数
 * 统一封装各应用 getters.ts 中的 tSync 重复逻辑
 */

import { storage } from '../storage/local';
import { createI18n } from 'vue-i18n';
import type { I18n } from 'vue-i18n';
import type { LocaleMessages } from './create-locale-getters';

export interface CreateTSyncOptions {
  /**
   * 获取国际化消息的函数
   */
  getLocaleMessages: () => LocaleMessages;
  /**
   * 可选的 i18n 实例获取函数（用于复用已有的 i18n 实例，如 system-app 的 getI18nInstance）
   * 如果提供，优先使用此函数获取 i18n 实例；否则自动创建
   */
  getI18nInstance?: () => I18n;
  /**
   * 主应用的 i18n 实例的全局 key（用于 main-app 优先使用主应用 i18n）
   * 例如：'__MAIN_APP_I18N__'
   */
  mainAppI18nKey?: string;
}

/**
 * 创建同步翻译函数 tSync
 * 
 * @param options 配置选项
 * @returns tSync 函数
 * 
 * @example
 * ```typescript
 * import { createTSync } from '@btc/shared-core';
 * 
 * const tSync = createTSync({
 *   getLocaleMessages,
 * });
 * 
 * // 或者，使用已有的 i18n 实例（如 system-app）
 * const tSync = createTSync({
 *   getLocaleMessages,
 *   getI18nInstance: () => existingI18nInstance,
 * });
 * 
 * // 或者，优先使用主应用的 i18n（如 main-app）
 * const tSync = createTSync({
 *   getLocaleMessages,
 *   mainAppI18nKey: '__MAIN_APP_I18N__',
 * });
 * ```
 */
export function createTSync(options: CreateTSyncOptions): (key: string) => string {
  const { getLocaleMessages, getI18nInstance: providedGetI18nInstance, mainAppI18nKey } = options;

  // 缓存 i18n 实例
  let i18nInstance: I18n | null = null;

  /**
   * 获取 i18n 实例（统一逻辑）
   */
  const getI18nInstance = (): I18n => {
    // 如果提供了自定义的 getI18nInstance 函数，优先使用（如 system-app）
    if (providedGetI18nInstance) {
      return providedGetI18nInstance();
    }

    // 如果指定了主应用的 i18n key，优先使用主应用的 i18n 实例（如 main-app）
    if (mainAppI18nKey && typeof window !== 'undefined') {
      const mainI18n = (window as any)[mainAppI18nKey];
      if (mainI18n && mainI18n.global) {
        return mainI18n;
      }
    }

    // 后备：创建独立的 i18n 实例
    if (!i18nInstance) {
      const messages = getLocaleMessages();
      i18nInstance = createI18n({
        legacy: false,
        globalInjection: false,
        locale: 'zh-CN',
        fallbackLocale: ['zh-CN', 'en-US'],
        messages,
      }) as any;
    }
    return i18nInstance;
  };

  /**
   * 同步翻译函数
   * @param key 翻译键
   * @returns 翻译后的文本，如果未找到则返回 key
   */
  return function tSync(key: string): string {
    try {
      const i18n = getI18nInstance();

      // 获取当前语言设置（从 storage 读取，与 getLocaleFromStorage 保持一致）
      let currentLocale = 'zh-CN';
      try {
        const stored = (storage.get('locale') as string);
        if (stored === 'zh-CN' || stored === 'en-US') {
          currentLocale = stored;
        }
      } catch {
        // 如果 storage 读取失败，使用默认值
      }

      // 更新 i18n 实例的语言
      const g = i18n.global as any;
      if (typeof g.locale === 'object' && 'value' in g.locale) {
        g.locale.value = currentLocale;
      } else {
        g.locale = currentLocale;
      }

      // 检查 i18n 是否已初始化
      if (!g || !g.te || !g.t) {
        return key;
      }

      // 优先直接访问消息对象，确保能访问到已合并的子应用语言包
      const localeMessages = g.getLocaleMessage(currentLocale) || {};
      if (key in localeMessages) {
        const value = localeMessages[key];
        if (typeof value === 'string') {
          return value;
        } else if (typeof value === 'function') {
          // Vue I18n 编译时优化，返回函数需要调用
          try {
            return value({ normalize: (arr: any[]) => arr[0] });
          } catch {
            // 如果函数调用失败，继续使用 g.t
          }
        } else if (value !== null && value !== undefined) {
          // 其他类型的值，尝试转换为字符串
          return String(value);
        }
      }

      // 如果直接访问消息对象失败，使用 g.te 和 g.t
      if (g.te(key, currentLocale)) {
        const translated = g.t(key, currentLocale);
        if (translated && typeof translated === 'string' && translated !== key) {
          return translated;
        }
      }

      // 如果当前语言没有找到，尝试回退语言
      const fallbackLocale = currentLocale === 'zh-CN' ? 'en-US' : 'zh-CN';
      const fallbackMessages = g.getLocaleMessage(fallbackLocale) || {};
      if (fallbackMessages[key]) {
        const value = fallbackMessages[key];
        if (typeof value === 'string') {
          return value;
        } else if (typeof value === 'function') {
          try {
            return value({ normalize: (arr: any[]) => arr[0] });
          } catch {
            // 如果函数调用失败，继续使用 g.t
          }
        }
      }
      
      if (g.te(key, fallbackLocale)) {
        const translated = g.t(key, fallbackLocale);
        if (translated && typeof translated === 'string' && translated !== key) {
          return translated;
        }
      }

      return key;
    } catch (_error) {
      return key;
    }
  };
}

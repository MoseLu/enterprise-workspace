/**
 * 国际化插件 - 主应用初始化（Host）
 * 主应用独占加载，负责初始化i18n并同步到qiankun全局状态
 */
import type { App } from 'vue';
import { watch } from 'vue';
import type { QiankunActions } from '../types';
import type { AppLocale } from '@btc/shared-components/i18n';
import { setLocaleToStorage } from '@btc/shared-components/i18n';
import { createI18nPluginBase, type I18nPluginBaseOptions } from './index.base';
import { setGlobalState } from '@btc/shared-core';

export interface I18nPluginHostOptions extends I18nPluginBaseOptions {
  globalState?: QiankunActions;
  app?: App;
}

let i18nInstance: ReturnType<typeof createI18nPluginBase> | null = null;
let changeLocaleFn: ((locale: AppLocale) => void) | null = null;

/**
 * 初始化国际化插件（主应用）
 * @param options 插件选项
 */
export function initI18nPluginHost(options: I18nPluginHostOptions = {}) {
  if (i18nInstance) {
    return i18nInstance;
  }

  // 创建 i18n 实例
  i18nInstance = createI18nPluginBase({
    ...(options.locale !== undefined ? { locale: options.locale } : {}),
    ...(options.messages ? { messages: options.messages } : {}),
  });

  // 安装到 Vue 应用
  if (options.app) {
    i18nInstance.install(options.app);
  }

  const { i18n } = i18nInstance;
  const { globalState } = options;

  // 监听语言切换并同步到 qiankun 全局状态
  if (i18n.global.locale && typeof i18n.global.locale === 'object' && 'value' in i18n.global.locale) {
    watch(
      () => (i18n.global.locale as { value: AppLocale }).value,
      (newLocale: AppLocale) => {
        // 1. 存储到 localStorage
        setLocaleToStorage(newLocale);

        // 2. 同步到 qiankun 全局状态（通过统一中间层）
        setGlobalState({ locale: newLocale }, false).catch(() => {
          // 忽略错误（可能在初始化中）
        });

        // 3. 触发自定义事件（向后兼容）
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('language-change', { detail: { locale: newLocale } }));
          window.dispatchEvent(new CustomEvent('locale-change', { detail: { locale: newLocale } }));
        }

        // 4. 设置 cookie（供服务端读取）
        if (typeof document !== 'undefined') {
          (async () => {
            const { setCookie } = await import('@btc/shared-core/utils/cookie');
            setCookie('locale', newLocale, 365, { path: '/', sameSite: 'Lax' });
          })();
        }
      },
      { immediate: false }
    );
  }

  // 创建切换语言的函数
  changeLocaleFn = (locale: AppLocale) => {
    if (i18n.global.locale && typeof i18n.global.locale === 'object' && 'value' in i18n.global.locale) {
      (i18n.global.locale as { value: AppLocale }).value = locale;
    }
  };

  // 初始化时同步到全局状态（通过统一中间层）
  const currentLocale = (i18n.global.locale as { value: AppLocale }).value || 'zh-CN';
  setGlobalState({ locale: currentLocale }, false).catch(() => {
    // 忽略错误（可能在初始化中）
  });

  return {
    ...i18nInstance,
    changeLocale: changeLocaleFn,
    getCurrentLocale: () => {
      if (i18n.global.locale && typeof i18n.global.locale === 'object' && 'value' in i18n.global.locale) {
        return (i18n.global.locale as { value: AppLocale }).value;
      }
      return 'zh-CN';
    },
  };
}

/**
 * 获取当前 i18n 实例（主应用）
 */
export function getI18nPluginHost() {
  return i18nInstance;
}


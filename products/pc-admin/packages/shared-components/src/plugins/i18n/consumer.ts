/**
 * 国际化插件 - 子应用消费（Consumer）
 * 子应用仅监听全局状态，不修改语言设置
 */
;
import type { QiankunActions } from '../types';
import type { AppLocale } from '@btc/shared-components/i18n';
import { createAppI18n } from '@btc/shared-components/i18n';
import { onGlobalStateChange } from '@btc/shared-core';

export interface I18nPluginConsumerOptions {
  globalState?: QiankunActions;
  app?: any;
  messages?: Record<AppLocale, any>;
}

/**
 * 消费国际化插件（子应用）
 * 子应用监听主应用的语言切换，自动同步本地 i18n 实例
 */
export function consumeI18nPluginHost(options: I18nPluginConsumerOptions = {}) {
  const { globalState, app, messages } = options;

  if (!globalState) {
    console.warn('[i18n-consumer] globalState is not provided');
    return null;
  }

  // 创建子应用的 i18n 实例（仅用于消费，不主动修改）
  const defaultLocale: AppLocale = 'zh-CN';
  const i18n = createAppI18n(defaultLocale, messages as any);

  // 安装到 Vue 应用（如果提供）
  if (app && i18n) {
    app.use(i18n);
  }

  // 监听全局状态变化，同步语言（通过统一中间层）
  onGlobalStateChange(
    (state) => {
      if (state.locale && i18n.global.locale && typeof i18n.global.locale === 'object' && 'value' in i18n.global.locale) {
        const currentLocale = (i18n.global.locale as { value: AppLocale }).value;
        if (currentLocale !== state.locale) {
          (i18n.global.locale as { value: AppLocale }).value = state.locale as AppLocale;
          
          // 设置 cookie（供服务端读取）
          if (typeof document !== 'undefined') {
            (async () => {
              const { setCookie } = await import('@btc/shared-core/utils/cookie');
              setCookie('locale', state.locale, 365, { path: '/', sameSite: 'Lax' });
            })();
          }
        }
      }
    },
    true, // 立即执行一次，确保初始语言同步
    'i18n-consumer-listener' // 固定监听器 key
  );

  return {
    i18n,
  };
}


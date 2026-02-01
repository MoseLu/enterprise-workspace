/**
 * 国际化插件核心逻辑
 */
import { createI18n } from 'vue-i18n';
import type { App } from 'vue';
import { getLocaleFromStorage, type AppLocale, type AppLocaleMessages } from '@btc/shared-components/i18n';
import { globalMessages } from '@btc/shared-components/i18n/locales';
// 从 shared-core 引用国际化，确保单一数据源
import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';

export interface I18nPluginBaseOptions {
  locale?: AppLocale;
  messages?: Record<AppLocale, AppLocaleMessages<any>>;
}

/**
 * 创建 i18n 插件基础实例
 */
export function createI18nPluginBase(options: I18nPluginBaseOptions = {}) {
  const defaultLocale = options.locale || getLocaleFromStorage() || 'zh-CN';
  
  // 处理 shared-core 的默认导出（TypeScript 文件使用 export default）
  const sharedCoreZhMessages = (sharedCoreZh as any)?.default ?? sharedCoreZh;
  const sharedCoreEnMessages = (sharedCoreEn as any)?.default ?? sharedCoreEn;
  
  // 合并顺序：shared-core -> globalMessages -> appMessages
  // 确保 shared-core 作为最底层的数据源，优先级最高
  const messages: Record<AppLocale, AppLocaleMessages<any>> = {
    'zh-CN': { 
      ...(sharedCoreZhMessages as Record<string, any> || {}),
      ...globalMessages['zh-CN'], 
      ...options.messages?.['zh-CN'] 
    },
    'en-US': { 
      ...(sharedCoreEnMessages as Record<string, any> || {}),
      ...globalMessages['en-US'], 
      ...options.messages?.['en-US'] 
    },
  };

  const i18n = createI18n({
    locale: defaultLocale,
    fallbackLocale: 'zh-CN',
    messages,
    legacy: false,
    globalInjection: true,
    fallbackWarn: false,
    missingWarn: false,
  });

  return {
    i18n,
    install(app: App) {
      app.use(i18n);
    },
  };
}


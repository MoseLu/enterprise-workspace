import { setupAppI18n, SUPPORTED_LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE, mergeMessages, createTSync, type CDNLocaleConfig } from '@btc/shared-core';
import type { SupportedLocale, LocaleMessages } from '@btc/shared-core';
import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';
import sharedLocalesZhCN from '@btc/shared-components/locales/zh-CN.json';
import sharedLocalesEnUS from '@btc/shared-components/locales/en-US.json';
import messages from '@intlify/unplugin-vue-i18n/messages';

const configFiles = import.meta.glob<{ default: any }>(['../modules/**/config.ts'], { eager: true });

// CDN 配置（仅在浏览器环境且启用时使用）
// 开发环境默认禁用（避免 CORS 问题），生产环境默认启用
const enableCDN = typeof window !== 'undefined' && (
  import.meta.env.PROD 
    ? import.meta.env.VITE_ENABLE_CDN_I18N !== 'false'  // 生产环境：默认启用
    : import.meta.env.VITE_ENABLE_CDN_I18N === 'true'   // 开发环境：默认禁用，需明确启用
);

const cdnConfig: CDNLocaleConfig | undefined = enableCDN ? {
  appId: 'main',
  version: import.meta.env.VITE_APP_VERSION || 'latest',
  cdnBaseUrl: import.meta.env.VITE_CDN_BASE_URL || 'https://all.bellis.com.cn',
  fallbackToLocal: true,
} : undefined;

const { getLocaleMessages: getLocaleMessagesBase, normalizeLocale, clearLocaleMessagesCache } = setupAppI18n({
  configFiles,
  sharedCoreZh,
  sharedCoreEn,
  sharedComponentsZh: sharedLocalesZhCN,
  sharedComponentsEn: sharedLocalesEnUS,
  autoRegisterConfigs: true,
  autoRegisterSubAppI18n: false,
  cdnConfig,
});

export const getLocaleMessages = (): LocaleMessages => {
  const baseMessages = getLocaleMessagesBase();
  const unpluginMessages = messages as Record<string, any>;
  if (unpluginMessages && typeof unpluginMessages === 'object') {
    return {
      'zh-CN': mergeMessages(baseMessages['zh-CN'], unpluginMessages['zh-CN'] || {}),
      'en-US': mergeMessages(baseMessages['en-US'], unpluginMessages['en-US'] || {}),
    };
  }
  return baseMessages;
};

export { normalizeLocale, clearLocaleMessagesCache };
export type { SupportedLocale, LocaleMessages };
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE };

export const tSync = createTSync({ getLocaleMessages, mainAppI18nKey: '__MAIN_APP_I18N__' });

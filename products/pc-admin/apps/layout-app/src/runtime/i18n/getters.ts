import { setupAppI18n, SUPPORTED_LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE, type CDNLocaleConfig } from '@btc/shared-core';
import type { SupportedLocale, LocaleMessages } from '@btc/shared-core';
import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';
import sharedComponentsZh from '@btc/shared-components/locales/zh-CN.json';
import sharedComponentsEn from '@btc/shared-components/locales/en-US.json';

const configFiles = import.meta.glob<{ default: any }>(['../../locales/config.ts'], { eager: true });

// CDN 配置（仅在浏览器环境且启用时使用）
// 开发环境默认禁用（避免 CORS 问题），生产环境默认启用
const enableCDN = typeof window !== 'undefined' && (
  import.meta.env.PROD 
    ? import.meta.env.VITE_ENABLE_CDN_I18N !== 'false'  // 生产环境：默认启用
    : import.meta.env.VITE_ENABLE_CDN_I18N === 'true'   // 开发环境：默认禁用，需明确启用
);

const cdnConfig: CDNLocaleConfig | undefined = enableCDN ? {
  appId: 'layout',
  version: import.meta.env.VITE_APP_VERSION || 'latest',
  cdnBaseUrl: import.meta.env.VITE_CDN_BASE_URL || 'https://all.bellis.com.cn',
  fallbackToLocal: true,
} : undefined;

export const { getLocaleMessages, normalizeLocale, clearLocaleMessagesCache, tSync } = setupAppI18n({
  configFiles,
  sharedCoreZh,
  sharedCoreEn,
  sharedComponentsZh,
  sharedComponentsEn,
  needsTSync: true,
  autoRegisterSubAppI18n: false,
  cdnConfig,
});

export type { SupportedLocale, LocaleMessages };
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE };

import { setupAppI18n, SUPPORTED_LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE, loadFlatI18nMessages, type CDNLocaleConfig } from '@btc/shared-core';
import type { SupportedLocale, LocaleMessages } from '@btc/shared-core';
import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';
import sharedComponentsZh from '@btc/shared-components/locales/zh-CN.json';
import sharedComponentsEn from '@btc/shared-components/locales/en-US.json';
// 导入新的共享和领域翻译
import { common, crud, theme, auth, app } from '../../../../locales/shared';
import { dashboard } from '../../../../locales/apps';

const configFiles = import.meta.glob<{ default: any }>(['../locales/config.ts', '../modules/**/config.ts'], { eager: true });

// 使用新的扁平加载器加载共享翻译
const sharedMessages = loadFlatI18nMessages([
  common,
  crud,
  theme,
  auth,
  app,
  dashboard,
]);

// 直接使用共享翻译（不再合并 JSON 文件，所有翻译都在 config.ts 中）
const mergedAppZhCN = sharedMessages['zh-CN'];
const mergedAppEnUS = sharedMessages['en-US'];

// CDN 配置（仅在浏览器环境且启用时使用）
// 开发环境默认禁用（避免 CORS 问题），生产环境默认启用
const enableCDN = typeof window !== 'undefined' && (
  import.meta.env.PROD 
    ? import.meta.env.VITE_ENABLE_CDN_I18N !== 'false'  // 生产环境：默认启用
    : import.meta.env.VITE_ENABLE_CDN_I18N === 'true'   // 开发环境：默认禁用，需明确启用
);

const cdnConfig: CDNLocaleConfig | undefined = enableCDN ? {
  appId: 'dashboard',
  version: import.meta.env.VITE_APP_VERSION || 'latest',
  cdnBaseUrl: import.meta.env.VITE_CDN_BASE_URL || 'https://all.bellis.com.cn',
  fallbackToLocal: true,
} : undefined;

export const { getLocaleMessages, normalizeLocale, clearLocaleMessagesCache } = setupAppI18n({
  appId: 'dashboard',
  configFiles,
  sharedCoreZh,
  sharedCoreEn,
  sharedComponentsZh,
  sharedComponentsEn,
  appZhCN: mergedAppZhCN,
  appEnUS: mergedAppEnUS,
  cdnConfig,
});

export type { SupportedLocale, LocaleMessages };
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE };

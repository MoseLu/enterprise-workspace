import { setupAppI18n, SUPPORTED_LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE } from '@btc/shared-core';
import type { SupportedLocale, LocaleMessages } from '@btc/shared-core';
import sharedCoreZh from '@btc/shared-core/locales/zh-CN';
import sharedCoreEn from '@btc/shared-core/locales/en-US';
import sharedComponentsZh from '@btc/shared-components/locales/zh-CN.json';
import sharedComponentsEn from '@btc/shared-components/locales/en-US.json';

const configFiles = import.meta.glob<{ default: any }>(['../../locales/config.ts'], { eager: true });

export const { getLocaleMessages, normalizeLocale, clearLocaleMessagesCache, tSync } = setupAppI18n({
  configFiles,
  sharedCoreZh,
  sharedCoreEn,
  sharedComponentsZh,
  sharedComponentsEn,
  needsTSync: true,
  autoRegisterConfigs: false,
  autoRegisterSubAppI18n: false,
});

export type { SupportedLocale, LocaleMessages };
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE };

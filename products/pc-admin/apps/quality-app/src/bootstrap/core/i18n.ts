import type { App } from 'vue';
import { createI18nPlugin } from '@btc/shared-core';
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  getLocaleMessages,
  normalizeLocale,
} from '../../i18n/getters';

export type QualityI18nPlugin = ReturnType<typeof createI18nPlugin>;

export const setupI18n = (app: App, locale: string = DEFAULT_LOCALE, fallbackLocale: string = FALLBACK_LOCALE) => {
  const i18n = createI18nPlugin({
    locale: normalizeLocale(locale),
    fallbackLocale: normalizeLocale(fallbackLocale),
    messages: getLocaleMessages(),
    scope: 'quality',
  });

  app.use(i18n);
  return i18n;
};

import type { App } from 'vue';
import type { QiankunProps } from '@btc/shared-core';
import { createI18nPlugin } from '@btc/shared-core';
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  getLocaleMessages,
  normalizeLocale,
} from '../../i18n/getters';

// 用于存储 props 供 getters.ts 使用
let appProps: QiankunProps = {};

export function setEngineeringAppProps(props: QiankunProps) {
  appProps = props;
}

export type EngineeringI18nPlugin = ReturnType<typeof createI18nPlugin>;

export const setupI18n = (app: App, locale: string = DEFAULT_LOCALE, fallbackLocale: string = FALLBACK_LOCALE) => {
  const i18n = createI18nPlugin({
    locale: normalizeLocale(locale),
    fallbackLocale: normalizeLocale(fallbackLocale),
    messages: getLocaleMessages(),
    scope: 'engineering',
  });

  app.use(i18n);
  return i18n;
};

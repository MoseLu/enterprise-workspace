/**
 * 国际化工具函数
 */

import { storage } from '@btc/shared-core/utils/storage';
import type { AppLocale } from './types';

const STORAGE_KEY = 'app-locale';

/**
 * 存储当前语言到 storage
 */
export function setLocaleToStorage(locale: AppLocale): void {
  storage.set(STORAGE_KEY, locale);
}

/**
 * 从 storage 获取当前语言
 */
export function getLocaleFromStorage(): AppLocale {
  const stored = storage.get<string>(STORAGE_KEY);
  return isValidLocale(stored) ? stored : 'zh-CN';
}

/**
 * 校验语言是否合法
 */
export function isValidLocale(locale: string | null): locale is AppLocale {
  return locale === 'zh-CN' || locale === 'en-US';
}


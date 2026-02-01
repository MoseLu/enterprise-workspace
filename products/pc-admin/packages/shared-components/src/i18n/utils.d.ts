/**
 * 国际化工具函数
 */
import type { AppLocale } from './types';
/**
 * 存储当前语言到 localStorage
 */
export declare function setLocaleToStorage(locale: AppLocale): void;
/**
 * 从 localStorage 获取当前语言
 */
export declare function getLocaleFromStorage(): AppLocale;
/**
 * 校验语言是否合法
 */
export declare function isValidLocale(locale: string | null): locale is AppLocale;
//# sourceMappingURL=utils.d.ts.map
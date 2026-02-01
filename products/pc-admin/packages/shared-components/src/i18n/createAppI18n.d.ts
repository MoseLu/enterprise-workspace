/**
 * i18n 初始化函数
 */
import { createI18n } from 'vue-i18n';
import type { AppLocale, AppLocaleMessages } from './types';
/**
 * 通用 i18n 初始化函数（基座/子应用均可调用）
 * @param locale 默认语言
 * @param appMessages 子应用扩展的业务词条（可选）
 */
export declare function createAppI18n<T extends Record<string, any> = Record<string, never>>(locale?: AppLocale, appMessages?: Record<AppLocale, AppLocaleMessages<T>>): ReturnType<typeof createI18n>;
//# sourceMappingURL=createAppI18n.d.ts.map
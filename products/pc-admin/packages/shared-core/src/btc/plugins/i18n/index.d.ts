import type { App } from 'vue';
import type { Composer } from 'vue-i18n';
export interface I18nPluginOptions {
    locale?: string;
    fallbackLocale?: string;
    messages?: Record<string, any>;
    /**
     * 是否从后端加载语言包
     */
    loadFromApi?: boolean;
    /**
     * API 地址
     */
    apiUrl?: string;
    /**
     * 语言包范围（用于域级隔离）
     * common - 通用翻译
     * logistics - 物流域
     * production - 生产域
     */
    scope?: string;
}
/**
 * 创建 i18n 插件（混合架构）
 * @param options 配置选项
 * @returns i18n 插件
 */
export declare function createI18nPlugin(options?: I18nPluginOptions): {
    name: string;
    install(app: App): void;
    i18n: import("vue-i18n").I18n<Record<string, any>, {}, {}, string, false>;
};
export declare function useI18n(): Composer;
export declare function td(_key: string, def: string, _params?: any): string;
export { default as zhCN } from './locales/zh-CN';
export { default as enUS } from './locales/en-US';
export type { TypeSafeT } from './type-safe';
//# sourceMappingURL=index.d.ts.map
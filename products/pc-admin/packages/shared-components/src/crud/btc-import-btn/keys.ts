import { type InjectionKey, type Ref, type ComputedRef } from 'vue';

/**
 * 导入文件名匹配的 provide/inject keys
 * 用于在父组件和 BtcImportBtn 之间传递导出文件名和禁止关键词
 */
export const IMPORT_FILENAME_KEY: InjectionKey<Ref<string> | ComputedRef<string> | string> = Symbol('btc-import-filename');
export const IMPORT_FORBIDDEN_KEYWORDS_KEY: InjectionKey<Ref<string[]> | ComputedRef<string[]> | string[]> = Symbol('btc-import-forbidden-keywords');


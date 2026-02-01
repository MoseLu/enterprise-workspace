/**
 * 简化的扁平格式国际化加载器
 * 
 * 因为所有源都是扁平格式，只需要简单合并，无需复杂的 flatten/unflatten 转换
 */

export interface FlatLocaleSource {
  'zh-CN'?: Record<string, string>;
  'en-US'?: Record<string, string>;
}

export interface FlatLocaleMessages {
  'zh-CN': Record<string, string>;
  'en-US': Record<string, string>;
}

/**
 * 加载扁平格式的国际化消息
 * 简单合并所有源的翻译，无需复杂转换
 * 
 * @param sources 翻译源数组，每个源包含 'zh-CN' 和 'en-US' 两个键
 * @returns 合并后的扁平格式消息对象
 * 
 * @example
 * ```typescript
 * import { common, crud } from '@workspace/locales/shared';
 * import { warehouse } from '@workspace/locales/domains';
 * 
 * const messages = loadFlatI18nMessages([common, crud, warehouse]);
 * // 返回: { 'zh-CN': {...}, 'en-US': {...} }
 * ```
 */
export function loadFlatI18nMessages(
  sources: FlatLocaleSource[]
): FlatLocaleMessages {
  const messages: FlatLocaleMessages = {
    'zh-CN': {},
    'en-US': {},
  };

  // 简单的对象合并，无需复杂转换
  for (const source of sources) {
    if (source['zh-CN']) {
      Object.assign(messages['zh-CN'], source['zh-CN']);
    }
    if (source['en-US']) {
      Object.assign(messages['en-US'], source['en-US']);
    }
  }

  return messages;
}

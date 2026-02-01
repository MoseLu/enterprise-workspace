/**
 * 基座应用 i18n 初始化
 * 初始化全局 i18n 实例，通过 qiankun globalState 管控语言切换
 */

import { createAppI18n, getLocaleFromStorage, setLocaleToStorage, type AppLocale } from '@btc/i18n';
import { setGlobalState } from '@btc/shared-core';
import { sharedLocalesZhCN, sharedLocalesEnUS } from '@btc/shared-components';
// 导入 system 应用的翻译（包含 domain.type 等通用翻译）
import { system } from '../../../../locales/apps/system';
// 从 getters 获取 overview 模块的翻译（现在通过 config.ts 自动加载）
import { getLocaleMessages } from './getters';

// 从 localStorage 读取默认语言
const defaultLocale = getLocaleFromStorage();

// 获取 overview 模块的翻译（从 config.ts 中提取）
const overviewMessages = getLocaleMessages();

// 初始化全局 i18n 实例（全局通用词条 + shared-components 语言包 + overview 模块词条 + system 应用词条）
// 注意：子应用的国际化数据会在 beforeMount 阶段动态加载并合并
export const i18n = createAppI18n(defaultLocale, {
  'zh-CN': { 
    ...(sharedLocalesZhCN as Record<string, any>),
    ...(overviewMessages['zh-CN'] || {}),
    ...(system['zh-CN'] || {})
  } as any,
  'en-US': { 
    ...(sharedLocalesEnUS as Record<string, any>),
    ...(overviewMessages['en-US'] || {}),
    ...(system['en-US'] || {})
  } as any,
});


// 暴露到全局，供 tSync 使用（包含预加载的子应用国际化数据）
if (typeof window !== 'undefined') {
  (window as any).__MAIN_APP_I18N__ = i18n;
}

/**
 * 全局切换语言（同步所有子应用）
 * @param locale 目标语言
 * @param globalState qiankun 全局状态对象（可选，已废弃，保留用于向后兼容）
 * @deprecated 优先使用 window.__PLUGIN_API__.i18n.changeLocale
 */
export function changeGlobalLocale(locale: AppLocale, globalState?: any) {
  // 优先使用插件API
  if (typeof window !== 'undefined' && (window as any).__PLUGIN_API__?.i18n?.changeLocale) {
    (window as any).__PLUGIN_API__.i18n.changeLocale(locale);
    return;
  }

  // 向后兼容：直接操作（如果插件API未初始化）
  // 1. 更新基座自身语言
  i18n.global.locale.value = locale;
  
  // 2. 存储到 localStorage（子应用可读取）
  setLocaleToStorage(locale);
  
  // 3. 通过 qiankun globalState 通知所有子应用切换语言（通过统一中间层）
  setGlobalState({ locale }, false).catch(() => {
    // 忽略错误（可能在初始化中）
  });
  
  // 4. 触发 language-change 事件（向后兼容，如果某些地方还在使用事件）
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('language-change', { detail: { locale } }));
  }
}


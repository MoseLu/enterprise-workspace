/**
 * admin-app i18n 初始化
 * 支持微前端模式（复用基座 i18n）和独立运行模式
 */

import { createAppI18n, getLocaleFromStorage, isValidLocale, type AppLocale } from '@btc/i18n';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import type { createI18nPlugin } from '@btc/shared-core';
import { deepMerge } from '@btc/shared-core';
import { sharedLocalesZhCN, sharedLocalesEnUS } from '@btc/shared-components';
import { getLocaleMessages } from './getters';

/**
 * 子应用 i18n 初始化（兼容两种模式）
 * - 微前端模式：复用基座的 i18n 实例，仅扩展词条
 * - 独立运行模式：自己初始化 i18n（复用共享包逻辑），保证子应用可独立调试
 */
export function initAdminI18n(props?: {
  i18n?: ReturnType<typeof createAppI18n>;
  locale?: AppLocale;
  globalState?: any;
}): ReturnType<typeof createI18nPlugin> {
  // 微前端模式：复用基座 i18n，扩展业务词条
  if (props?.i18n && qiankunWindow.__POWERED_BY_QIANKUN__) {
    const { i18n, locale, globalState } = props;
    
    // 获取管理应用的语言包
    const adminMessages = getLocaleMessages();
    
    // 深度合并全局+业务词条（包括 shared-components 的语言包）
    // 使用深度合并确保嵌套结构（如 title.platform.domains）正确合并
    const mergedZhCN = deepMerge(
      deepMerge(
        i18n.global.getLocaleMessage('zh-CN') || {},
        sharedLocalesZhCN as Record<string, any>
      ),
      adminMessages['zh-CN'] || {}
    );
    const mergedEnUS = deepMerge(
      deepMerge(
        i18n.global.getLocaleMessage('en-US') || {},
        sharedLocalesEnUS as Record<string, any>
      ),
      adminMessages['en-US'] || {}
    );
    
    i18n.global.setLocaleMessage('zh-CN', mergedZhCN);
    i18n.global.setLocaleMessage('en-US', mergedEnUS);
    
    // 设置当前语言
    if (locale && isValidLocale(locale)) {
      i18n.global.locale.value = locale;
    }
    
    // 监听基座的语言切换事件
    if (globalState) {
      globalState.onGlobalStateChange((state: { locale?: AppLocale }) => {
        if (state.locale && isValidLocale(state.locale)) {
          i18n.global.locale.value = state.locale;
        }
      }, true); // 立即执行回调，确保初始语言同步
    }
    
    // 包装为插件格式（与 createI18nPlugin 的返回格式兼容）
    return {
      name: 'i18n',
      install: (app: any) => {
        app.use(i18n);
      },
      i18n,
    } as ReturnType<typeof createI18nPlugin>;
  }

  // 独立运行模式：自己初始化 i18n
  const defaultLocale = getLocaleFromStorage();
  const adminMessages = getLocaleMessages();
  
  // 深度合并 shared-components 和 admin-app 的语言包
  const mergedZhCN = deepMerge(
    sharedLocalesZhCN as Record<string, any>,
    adminMessages['zh-CN'] || {}
  );
  const mergedEnUS = deepMerge(
    sharedLocalesEnUS as Record<string, any>,
    adminMessages['en-US'] || {}
  );
  
  const i18nInstance = createAppI18n(defaultLocale, {
    'zh-CN': mergedZhCN,
    'en-US': mergedEnUS,
  });
  
  // 包装为插件格式（与 createI18nPlugin 的返回格式兼容）
  return {
    name: 'i18n',
    install: (app: any) => {
      app.use(i18nInstance);
    },
    i18n: i18nInstance,
  } as ReturnType<typeof createI18nPlugin>;
}

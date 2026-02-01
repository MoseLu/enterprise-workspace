/**
 * Element Plus 全局统一初始化模块
 * 确保整个项目中只创建一个 Element Plus 实例，所有子应用共享该实例
 */

import type { App } from 'vue';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import type { Language } from 'element-plus/es/locale';

// 全局缓存 Element Plus 配置和实例状态
let elementPlusInstalled = false;
let globalApp: App | null = null;

const elementLocale: Record<string, Language> = {
  'zh-CN': zhCn,
  'en-US': en,
};

/**
 * 全局统一初始化 Element Plus（仅执行一次）
 * @param app Vue 根实例
 * @param currentLocale 当前语言（可选，默认中文）
 */
export const initGlobalElementPlus = (app: App, currentLocale: string = 'zh-CN'): void => {
  if (elementPlusInstalled) {
    // 已安装则仅更新语言，不重复创建实例
    updateElementPlusLocale(currentLocale);
    return;
  }

  const locale = elementLocale[currentLocale] || zhCn;
  app.use(ElementPlus, {
    locale,
  } as any);

  elementPlusInstalled = true;
  globalApp = app;
};

/**
 * 全局更新 Element Plus 语言（无需重新实例化）
 * @param currentLocale 当前语言
 */
export const updateElementPlusLocale = (currentLocale: string): void => {
  const locale = elementLocale[currentLocale] || zhCn;

  // Element Plus 挂载的全局配置
  const globalConfig = (window as any).ELEMENT;
  if (globalConfig) {
    globalConfig.locale = locale;
  }

  // 如果全局应用实例存在，尝试更新
  if (globalApp) {
    const appConfig = globalApp.config.globalProperties;
    if (appConfig && appConfig.$ELEMENT) {
      appConfig.$ELEMENT.locale = locale;
    }
  }
};

/**
 * 子应用获取全局 Element Plus 配置（避免重复安装）
 */
export const getGlobalElementPlus = () => {
  return {
    ElementPlus,
    isInstalled: elementPlusInstalled,
    updateLocale: updateElementPlusLocale,
  };
};

/**
 * 检查 Element Plus 是否已安装
 */
export const isElementPlusInstalled = (): boolean => {
  return elementPlusInstalled;
};

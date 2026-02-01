import { storage } from '@btc/shared-utils';
import type { App } from 'vue';
import { createThemePlugin, initGlobalElementPlus, updateElementPlusLocale } from '@btc/shared-core';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import '../../styles/theme.scss';

// ECharts 插件
import EChartsPlugin from '../../plugins/echarts';

/**
 * Element Plus 语言配置
 */
export const elementLocale = {
  'zh-CN': zhCn,
  'en-US': en,
};

export type LogisticsThemePlugin = ReturnType<typeof createThemePlugin>;

/**
 * 获取当前语言设置
 */
export const getCurrentLocale = (): string => {
  return storage.get<string>('locale') || 'zh-CN';
};

// 缓存 themePlugin 实例，避免重复创建
let themePluginInstance: LogisticsThemePlugin | null = null;

export const setupUI = (app: App) => {
  // 复用 themePlugin 实例，避免重复创建
  if (!themePluginInstance) {
    themePluginInstance = createThemePlugin();
  }

  // 使用全局 Element Plus 初始化，避免重复安装
  const currentLocale = getCurrentLocale();
  initGlobalElementPlus(app, currentLocale);

  // 配置 themePlugin
  app.use(themePluginInstance);

  // 配置ECharts
  app.use(EChartsPlugin);

  return themePluginInstance;
};


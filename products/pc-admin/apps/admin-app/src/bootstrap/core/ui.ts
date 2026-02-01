import { storage } from '@btc/shared-utils';
import type { App } from 'vue';
import { createThemePlugin, initGlobalElementPlus } from '@btc/shared-core';
import '../../styles/theme.scss';

// ECharts 插件
import EChartsPlugin from '../../plugins/echarts';

export type AdminThemePlugin = ReturnType<typeof createThemePlugin>;

/**
 * 获取当前语言设置
 */
export const getCurrentLocale = (): string => {
  return storage.get<string>('locale') || 'zh-CN';
};

/**
 * 配置Element Plus（使用全局实例，避免重复安装）
 */
export const setupElementPlus = (app: App) => {
  const currentLocale = getCurrentLocale();
  // 使用全局 Element Plus 初始化，仅首次调用会执行 app.use，后续仅更新语言
  initGlobalElementPlus(app, currentLocale);
};

// 缓存 themePlugin 实例，避免重复创建
let themePluginInstance: AdminThemePlugin | null = null;

export const setupUI = (app: App) => {
  // 复用 themePlugin 实例，避免重复创建
  if (!themePluginInstance) {
    themePluginInstance = createThemePlugin();
  }

  // 配置Element Plus（包含国际化）
  setupElementPlus(app);

  // 配置 themePlugin
  app.use(themePluginInstance);

  // 配置ECharts
  app.use(EChartsPlugin);

  return themePluginInstance;
};

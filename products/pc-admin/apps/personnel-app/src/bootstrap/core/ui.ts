import type { App } from 'vue';
import { createThemePlugin, initGlobalElementPlus } from '@btc/shared-core';
import { storage } from '@btc/shared-utils';
import '../../styles/theme.scss';

// ECharts 插件
import EChartsPlugin from '../../plugins/echarts';

export type PersonnelThemePlugin = ReturnType<typeof createThemePlugin>;

/**
 * 获取当前语言设置
 */
const getCurrentLocale = (): string => {
  return storage.get<string>('locale') || 'zh-CN';
};

export const setupUI = (app: App) => {
  const themePlugin = createThemePlugin();

  // 使用全局 Element Plus 初始化，避免重复安装
  const currentLocale = getCurrentLocale();
  initGlobalElementPlus(app, currentLocale);

  app.use(themePlugin);

  // 配置ECharts
  app.use(EChartsPlugin);

  return themePlugin;
};

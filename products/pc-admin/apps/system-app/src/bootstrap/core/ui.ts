/**
 * UI框架配置模块
 * 负责配置Element Plus、主题、样式等UI相关设置
 */

import { storage } from '@btc/shared-utils';
import type { App } from 'vue';
import { createThemePlugin, initGlobalElementPlus, updateElementPlusLocale } from '@btc/shared-core';
import 'virtual:uno.css';
// 关键：在关闭样式隔离的情况下，需要直接 import 样式文件，确保样式被正确加载
// 虽然 global.scss 中也通过 @import 引入了，但直接 import 可以确保样式在模块加载时就被处理
import '@btc/shared-components/styles/index.scss';
import '../../styles/global.scss';
import '../../styles/theme.scss';
import '../../styles/menu-themes.scss';
import '../../styles/nprogress.scss';

// ECharts 插件
import EChartsPlugin from '../../plugins/echarts';

// 注意：BtcSvg 组件已在 main.ts 中注册，这里不再重复注册

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

/**
 * 配置全局样式
 */
export const setupGlobalStyles = () => {
  // 样式文件已经在顶部导入，这里可以添加额外的样式配置
  // 例如：动态主题切换、自定义CSS变量等
};

// 缓存 themePlugin 实例，避免重复创建
let themePluginInstance: ReturnType<typeof createThemePlugin> | null = null;

/**
 * 配置UI框架
 */
export const setupUI = (app: App) => {
  // 复用 themePlugin 实例，避免重复创建
  if (!themePluginInstance) {
    themePluginInstance = createThemePlugin();
  }

  // 配置Element Plus
  setupElementPlus(app);

  // 配置 themePlugin
  app.use(themePluginInstance);

  // 配置ECharts
  app.use(EChartsPlugin);

  // 注意：BtcSvg 组件已在 main.ts 中注册，这里不再重复注册

  // 配置全局样式
  setupGlobalStyles();

  return themePluginInstance;
};

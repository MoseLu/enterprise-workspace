/**
 * ECharts 插件
 * 负责注册和配置 ECharts 主题
 */

import type { App } from 'vue';
import { registerEChartsThemes } from '@btc/shared-components';

/**
 * ECharts 插件
 */
const EChartsPlugin = {
  install(app: App) {
    // 注册 ECharts 主题
    registerEChartsThemes();
  },
};

export default EChartsPlugin;


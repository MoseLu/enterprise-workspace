import type { Plugin } from '@btc/shared-core';
import { exportJsonToExcel } from '@btc/shared-core';
import { githubPlugin } from './github';
import { i18nPlugin as i18nToolbarPlugin } from './i18n';
import { themePlugin as themeToolbarPlugin } from './theme';
import { userSettingPlugin } from './user-setting';
import { notificationPlugin } from './notification';
import { messagePlugin } from './message';

/**
 * Excel 插件
 */
export const excelPlugin: Plugin = {
  name: 'excel',
  version: '1.0.0',
  description: 'Excel export plugin based on xlsx',

  api: {
    export: exportJsonToExcel,
  },

  install(app, _options) {
    // 可以在这里注入全局属性
    app.config.globalProperties.$excel = {
      export: exportJsonToExcel,
    };
  },

  uninstall() {
    // Plugin uninstalled
  },
};

/**
 * 导出所有插件
 */
export { 
  githubPlugin, 
  i18nToolbarPlugin, 
  themeToolbarPlugin, 
  userSettingPlugin,
  notificationPlugin,
  messagePlugin
};


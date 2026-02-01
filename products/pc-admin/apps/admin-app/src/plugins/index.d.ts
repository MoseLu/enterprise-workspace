import type { Plugin } from '@btc/shared-core';
import { githubPlugin } from './github';
import { i18nPlugin as i18nToolbarPlugin } from './i18n';
import { themePlugin as themeToolbarPlugin } from './theme';
import { userSettingPlugin } from './user-setting';
import { notificationPlugin } from './notification';
import { messagePlugin } from './message';
/**
 * Excel 插件
 */
export declare const excelPlugin: Plugin;
/**
 * 导出所有插件
 */
export { githubPlugin, i18nToolbarPlugin, themeToolbarPlugin, userSettingPlugin, notificationPlugin, messagePlugin };

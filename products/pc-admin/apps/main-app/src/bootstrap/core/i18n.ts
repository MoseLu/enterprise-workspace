/**
 * 国际化配置模块
 * 负责配置Vue I18n国际化
 * 
 * 注意：i18n 的注册已由插件系统统一管理（在 bootstrap/plugins/index.ts 中）
 * 这里只负责主题插件的注册
 */

import type { App } from 'vue';
import { createThemePlugin } from '@btc/shared-core';

/**
 * 配置国际化
 * 
 * 注意：i18n 实例的注册已移至插件系统（initPluginHost），
 * 这里不再注册 i18n，避免重复注册导致组件冲突
 */
export const setupI18n = (app: App) => {
  // 主题插件（i18n 由插件系统统一管理，不在这里注册）
  app.use(createThemePlugin());
};

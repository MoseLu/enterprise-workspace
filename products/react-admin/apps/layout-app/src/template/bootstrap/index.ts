// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
;
import 'virtual:svg-register';
// 样式文件在模块加载时同步导入
import '@btc/shared-components/styles/index.scss';
import '../styles/global.scss';
import '../styles/theme.scss';

import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import type { QiankunProps } from '@btc/shared-core';
import {
  setupSubAppGlobals,
  createSubApp,
  mountSubApp,
  unmountSubApp,
  updateSubApp,
  setupRouteSync,
  setupHostLocationBridge,
  setupEventBridge,
  ensureCleanUrl,
  setupStandalonePlugins,
  createLogoutFunction,
  type SubAppContext,
  type SubAppOptions,
} from '@btc/shared-core';

import App from '../App.vue';
import { create{{APP_NAME_PASCAL}}Router, setupRouter, setupStore, setupI18n, setupUI } from './core';

// 导出类型（保持向后兼容）
export type {{APP_NAME_PASCAL}}AppContext = SubAppContext;

const {{APP_NAME_PASCAL}}_APP_ID = '{{APP_ID}}';
const {{APP_NAME_PASCAL}}_BASE_PATH = '{{APP_BASE_PATH}}';
const {{APP_NAME_PASCAL}}_DOMAIN_CACHE_PATH = '@utils/domain-cache';

// 子应用配置（标准化模板）
const subAppOptions: SubAppOptions = {
  appId: {{APP_NAME_PASCAL}}_APP_ID,
  basePath: {{APP_NAME_PASCAL}}_BASE_PATH,
  domainCachePath: {{APP_NAME_PASCAL}}_DOMAIN_CACHE_PATH,
  AppComponent: App,
  createRouter: create{{APP_NAME_PASCAL}}Router,
  setupRouter,
  setupStore,
  setupI18n,
  setupUI,
  setupPlugins: setupStandalonePlugins,
};

export const create{{APP_NAME_PASCAL}}App = async (props: QiankunProps = {}): Promise<{{APP_NAME_PASCAL}}AppContext> => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 独立运行或 layout-app 环境下都需要设置全局函数
  if (isStandalone || isUsingLayoutApp) {
    // 关键：静态导入 domain-cache 模块，确保在生产构建时被正确打包
    let domainCacheModule: any = null;
    try {
      domainCacheModule = await import('../utils/domain-cache');
    } catch (error) {
      console.warn('[{{APP_NAME}}-app] Failed to import domain-cache module:', error);
    }

    await setupSubAppGlobals({
      appId: {{APP_NAME_PASCAL}}_APP_ID,
      basePath: {{APP_NAME_PASCAL}}_BASE_PATH,
      domainCachePath: {{APP_NAME_PASCAL}}_DOMAIN_CACHE_PATH,
      domainCacheModule,
    });
  } else {
    // qiankun 环境下也需要注册菜单和 Tabs
    const { registerManifestMenusForApp, registerManifestTabsForApp } = await import('@btc/shared-core/configs/layout-bridge');
    registerManifestMenusForApp({{APP_NAME_PASCAL}}_APP_ID);
    registerManifestTabsForApp({{APP_NAME_PASCAL}}_APP_ID);
  }

  // 使用标准化的 createSubApp
  return await createSubApp(subAppOptions, props);
};

export const mount{{APP_NAME_PASCAL}}App = async (context: {{APP_NAME_PASCAL}}AppContext, props: QiankunProps = {}) => {
  // 使用标准化的 mountSubApp
  await mountSubApp(context, subAppOptions, props);

  // 设置路由同步、事件桥接等
  setupRouteSync(context, {{APP_NAME_PASCAL}}_APP_ID, {{APP_NAME_PASCAL}}_BASE_PATH);
  setupHostLocationBridge(context, {{APP_NAME_PASCAL}}_APP_ID, {{APP_NAME_PASCAL}}_BASE_PATH);
  setupEventBridge(context);
  ensureCleanUrl(context);

  // 设置退出登录函数（在应用挂载后设置，确保 router 和 i18n 已初始化）
  (window as any).__APP_LOGOUT__ = createLogoutFunction(context, {{APP_NAME_PASCAL}}_APP_ID);
};

export const update{{APP_NAME_PASCAL}}App = (context: {{APP_NAME_PASCAL}}AppContext, props: QiankunProps) => {
  updateSubApp(context, props);
};

export const unmount{{APP_NAME_PASCAL}}App = async (context: {{APP_NAME_PASCAL}}AppContext, props: QiankunProps = {}) => {
  await unmountSubApp(context, props);
};


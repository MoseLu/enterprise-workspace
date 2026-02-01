// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';
// 样式文件在模块加载时同步导入
import '@btc/shared-components/styles/index.scss';
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
import { createDashboardRouter, setupRouter, setupStore, setupI18n, setupUI } from './core';

// 导出类型（保持向后兼容）
export type DashboardAppContext = SubAppContext;

const DASHBOARD_APP_ID = 'dashboard';
const DASHBOARD_BASE_PATH = '/dashboard';
const DASHBOARD_DOMAIN_CACHE_PATH = '@utils/domain-cache';

// 子应用配置（标准化模板）
const subAppOptions: SubAppOptions = {
  appId: DASHBOARD_APP_ID,
  basePath: DASHBOARD_BASE_PATH,
  domainCachePath: DASHBOARD_DOMAIN_CACHE_PATH,
  AppComponent: App,
  createRouter: createDashboardRouter,
  setupRouter,
  setupStore,
  setupI18n,
  setupUI,
  setupPlugins: setupStandalonePlugins,
};

export const createDashboardApp = async (props: QiankunProps = {}): Promise<DashboardAppContext> => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 独立运行或 layout-app 环境下都需要设置全局函数
  if (isStandalone || isUsingLayoutApp) {
    // 关键：静态导入 domain-cache 模块，确保在生产构建时被正确打包
    let domainCacheModule: any = null;
    try {
      domainCacheModule = await import('../utils/domain-cache');
    } catch (error) {
      // Failed to import domain-cache module
    }

    await setupSubAppGlobals({
      appId: DASHBOARD_APP_ID,
      basePath: DASHBOARD_BASE_PATH,
      domainCachePath: DASHBOARD_DOMAIN_CACHE_PATH,
      domainCacheModule,
    });
  } else {
    // qiankun 环境下也需要注册菜单和 Tabs
    const layoutBridgeModule = await import('@btc/shared-core/configs/layout-bridge');
    const layoutBridge = layoutBridgeModule as unknown as {
      registerManifestMenusForApp: (appId: string) => void;
      registerManifestTabsForApp: (appId: string) => void;
    };
    layoutBridge.registerManifestMenusForApp(DASHBOARD_APP_ID);
    layoutBridge.registerManifestTabsForApp(DASHBOARD_APP_ID);
  }

  // 使用标准化的 createSubApp
  return await createSubApp(subAppOptions, props);
};

export const mountDashboardApp = async (context: DashboardAppContext, props: QiankunProps = {}) => {
  // 使用标准化的 mountSubApp
  await mountSubApp(context, subAppOptions, props);

  // 设置路由同步、事件桥接等
  setupRouteSync(context, DASHBOARD_APP_ID, DASHBOARD_BASE_PATH);
  setupHostLocationBridge(context, DASHBOARD_APP_ID, DASHBOARD_BASE_PATH);
  setupEventBridge(context);
  ensureCleanUrl(context);

  // 设置退出登录函数（在应用挂载后设置，确保 router 和 i18n 已初始化）
  (window as any).__APP_LOGOUT__ = createLogoutFunction(context, DASHBOARD_APP_ID);
};

export const updateDashboardApp = (context: DashboardAppContext, props: QiankunProps) => {
  updateSubApp(context, props);
};

export const unmountDashboardApp = async (context: DashboardAppContext, props: QiankunProps = {}) => {
  // 清理全局资源（避免内存泄漏）
  if (typeof window !== 'undefined') {
    // 清理退出登录函数
    if ((window as any).__APP_LOGOUT__) {
      delete (window as any).__APP_LOGOUT__;
    }
  }

  // 清理 ECharts 实例
  try {
    const { cleanupAllECharts } = await import('@btc/shared-components');
    if (cleanupAllECharts) {
      cleanupAllECharts();
    }
  } catch (error) {
    // 静默失败
  }

  await unmountSubApp(context, props);
};

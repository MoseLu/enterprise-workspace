// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
;
import 'virtual:svg-register';
// 样式文件在模块加载时同步导入
import '@btc/shared-components/styles/index.scss';
import '../styles/global.scss';
import '../styles/theme.scss';
import '../styles/nprogress.scss';
import '../styles/menu-themes.scss';

import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import type { QiankunProps } from '@btc/shared-core';
import type { App as VueApp } from 'vue';
import type { Router } from 'vue-router';
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
import { setupSubAppErrorCapture, updateErrorList, listenForErrorReports, type ErrorInfo } from '@btc/shared-utils/error-monitor';

import App from '../App.vue';
import { createOperationsRouter, setupRouter, setupStore, setupI18n, setupUI } from './core';

// 导出类型（保持向后兼容）
export type MonitorAppContext = SubAppContext;

const OPERATIONS_APP_ID = 'operations';
const OPERATIONS_BASE_PATH = '/operations';
const OPERATIONS_DOMAIN_CACHE_PATH = '@utils/domain-cache';

// 自定义 setupPlugins（operations-app 需要设置错误捕获）
const setupMonitorPlugins = async (app: VueApp, router: Router, isStandalone: boolean): Promise<void> => {
  // 设置错误捕获（运维应用自己的错误，不使用跨域上报）
  setupSubAppErrorCapture({
    updateErrorList,
    appName: OPERATIONS_APP_ID,
    useCrossDomainReport: false, // 运维应用自己不需要跨域上报
  });

  // 监听来自其他子应用的跨域错误上报
  // 注意：取消订阅函数存储但不返回，因为 setupPlugins 的返回类型是 Promise<void>
  listenForErrorReports((errorInfo: ErrorInfo) => {
    // 接收到跨域上报的错误，存储到本地
    updateErrorList(errorInfo);
  });

  // 独立运行时注册插件
  if (isStandalone) {
    await setupStandalonePlugins(app, router);
  }
};

// 子应用配置（标准化模板，但使用自定义的 setupPlugins）
const subAppOptions: SubAppOptions = {
  appId: OPERATIONS_APP_ID,
  basePath: OPERATIONS_BASE_PATH,
  domainCachePath: OPERATIONS_DOMAIN_CACHE_PATH,
  AppComponent: App,
  createRouter: () => createOperationsRouter(false), // 默认非独立运行，mountSubApp 中会根据实际情况调整
  // setupRouter 类型定义只接受 2 个参数，但实际实现需要 isStandalone
  // 在 createMonitorApp 中会覆盖这个设置
  setupRouter: (app: VueApp, router?: Router) => setupRouter(app, router, false),
  setupStore,
  setupI18n,
  setupUI,
  setupPlugins: async (app: VueApp, router: Router): Promise<void> => {
    const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__ && !(window as any).__USE_LAYOUT_APP__;
    await setupMonitorPlugins(app, router, isStandalone);
  },
};

export const createMonitorApp = async (props: QiankunProps = {}): Promise<MonitorAppContext> => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 独立运行或 layout-app 环境下都需要设置全局函数
  if (isStandalone || isUsingLayoutApp) {
    // 关键：静态导入 domain-cache 模块，确保在生产构建时被正确打包
    let domainCacheModule: { getDomainList?: any; clearDomainCache?: any } | null = null;
    try {
      domainCacheModule = await import('../utils/domain-cache') as { getDomainList?: any; clearDomainCache?: any };
    } catch (error) {
      console.warn('[operations-app] Failed to import domain-cache module:', error);
    }

    await setupSubAppGlobals({
      appId: OPERATIONS_APP_ID,
      basePath: OPERATIONS_BASE_PATH,
      domainCachePath: OPERATIONS_DOMAIN_CACHE_PATH,
      domainCacheModule: domainCacheModule || undefined,
    });
    // 关键：在独立运行模式下，确保菜单注册表已初始化
    try {
      const { getMenuRegistry } = await import('@btc/shared-components');
      const registry = getMenuRegistry();
      if (typeof window !== 'undefined' && !(window as any).__BTC_MENU_REGISTRY__) {
        (window as any).__BTC_MENU_REGISTRY__ = registry;
      }
    } catch (error) {
      // 静默失败
    }
    const { registerManifestMenusForApp, registerManifestTabsForApp } = await import('@btc/shared-core/configs/layout-bridge');
    registerManifestMenusForApp(OPERATIONS_APP_ID);
    registerManifestTabsForApp(OPERATIONS_APP_ID);
  } else {
    // qiankun 环境下也需要注册菜单和 Tabs
    try {
      const { getMenuRegistry } = await import('@btc/shared-components');
      const registry = getMenuRegistry();
      if (typeof window !== 'undefined' && !(window as any).__BTC_MENU_REGISTRY__) {
        (window as any).__BTC_MENU_REGISTRY__ = registry;
      }
    } catch (error) {
      // 静默失败
    }
    const { registerManifestMenusForApp, registerManifestTabsForApp } = await import('@btc/shared-core/configs/layout-bridge');
    registerManifestMenusForApp(OPERATIONS_APP_ID);
    registerManifestTabsForApp(OPERATIONS_APP_ID);
  }

  // 使用标准化的 createSubApp，但需要传入 isStandalone 给 setupRouter
  const context = await createSubApp({
    ...subAppOptions,
    setupRouter: (app: VueApp, router?: Router) => setupRouter(app, router, isStandalone),
  }, props);

  return context;
};

export const mountMonitorApp = async (context: MonitorAppContext, props: QiankunProps = {}) => {
  // 使用标准化的 mountSubApp
  await mountSubApp(context, subAppOptions, props);

  // 设置路由同步、事件桥接等
  setupRouteSync(context, OPERATIONS_APP_ID, OPERATIONS_BASE_PATH);
  setupHostLocationBridge(context, OPERATIONS_APP_ID, OPERATIONS_BASE_PATH);
  setupEventBridge(context);
  ensureCleanUrl(context);

  // 设置退出登录函数（在应用挂载后设置，确保 router 和 i18n 已初始化）
  (window as any).__APP_LOGOUT__ = createLogoutFunction(context, OPERATIONS_APP_ID);
};

export const updateMonitorApp = (context: MonitorAppContext, props: QiankunProps) => {
  updateSubApp(context, props);
};

export const unmountMonitorApp = async (context: MonitorAppContext, props: QiankunProps = {}) => {
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

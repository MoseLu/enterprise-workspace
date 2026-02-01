// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
;
import 'virtual:svg-register';
// 样式文件在模块加载时同步导入
import '@btc/shared-components/styles/index.scss';
import './styles/global.scss';
import './styles/theme.scss';

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

import App from './App.vue';
import { createSystemRouter, setupRouter, setupStore, setupI18n, setupUI } from './bootstrap/core';

// 导出类型（保持向后兼容）
export type SystemAppContext = SubAppContext;

const SYSTEM_APP_ID = 'system';
const SYSTEM_BASE_PATH = '/system';
const SYSTEM_DOMAIN_CACHE_PATH = '@utils/domain-cache';

// 子应用配置（标准化模板）
const subAppOptions: SubAppOptions = {
  appId: SYSTEM_APP_ID,
  basePath: SYSTEM_BASE_PATH,
  domainCachePath: SYSTEM_DOMAIN_CACHE_PATH,
  AppComponent: App,
  createRouter: createSystemRouter,
  setupRouter,
  setupStore,
  setupI18n,
  setupUI,
  setupPlugins: setupStandalonePlugins,
};

export const createSystemApp = async (props: QiankunProps = {}): Promise<SystemAppContext> => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 关键：在创建子应用之前，设置props（用于i18n初始化）
  const { setSystemAppProps } = await import('./bootstrap/core/i18n');
  setSystemAppProps(props);

  // 注意：国际化消息获取器已在 getters.ts 模块加载时注册，这里不需要重复注册

  // 独立运行或 layout-app 环境下都需要设置全局函数
  if (isStandalone || isUsingLayoutApp) {
    // 关键：静态导入 domain-cache 模块，确保在生产构建时被正确打包
    let domainCacheModule: any = null;
    try {
      domainCacheModule = await import('./utils/domain-cache');
    } catch (error) {
      console.warn('[system-app] Failed to import domain-cache module:', error);
    }

    await setupSubAppGlobals({
      appId: SYSTEM_APP_ID,
      basePath: SYSTEM_BASE_PATH,
      domainCachePath: SYSTEM_DOMAIN_CACHE_PATH,
      domainCacheModule,
    });
  } else {
    // qiankun 环境下也需要注册菜单和 Tabs
    const { registerManifestMenusForApp, registerManifestTabsForApp } = await import('@btc/shared-core/configs/layout-bridge');
    registerManifestMenusForApp(SYSTEM_APP_ID);
    registerManifestTabsForApp(SYSTEM_APP_ID);
  }

  // 使用标准化的 createSubApp
  return await createSubApp(subAppOptions, props);
};

export const mountSystemApp = async (context: SystemAppContext, props: QiankunProps = {}) => {
  // 关键优化：在 mountSubApp 之前就发送国际化消息
  // 因为 getLocaleMessages() 不需要等待路由或应用挂载，可以立即获取
  // 这样可以减少主应用 afterMount 钩子的等待时间
  if (props.setGlobalState && typeof props.setGlobalState === 'function') {
    try {
      // 获取动态生成的国际化消息（不依赖路由或应用挂载状态）
      const { getLocaleMessages } = await import('./i18n/getters');
      const messages = getLocaleMessages();

      if (messages && (messages['zh-CN'] || messages['en-US'])) {
        // 通过 globalState 发送国际化消息（在 mountSubApp 之前）
        props.setGlobalState({
          subAppI18nMessages: {
            [SYSTEM_APP_ID]: messages,
          },
        });
      }
    } catch (error) {
      // 注意：不能在非 setup 函数中调用 useI18n()，使用 tSync 或直接使用字符串
      console.warn('[system-app] 发送国际化消息失败:', error);
    }
  }

  // 使用标准化的 mountSubApp
  await mountSubApp(context, subAppOptions, props);

  // 设置路由同步、事件桥接等
  setupRouteSync(context, SYSTEM_APP_ID, SYSTEM_BASE_PATH);
  setupHostLocationBridge(context, SYSTEM_APP_ID, SYSTEM_BASE_PATH);
  setupEventBridge(context);
  ensureCleanUrl(context);

  // 设置退出登录函数（在应用挂载后设置，确保 router 和 i18n 已初始化）
  (window as any).__APP_LOGOUT__ = createLogoutFunction(context, SYSTEM_APP_ID);
};

export const updateSystemApp = (context: SystemAppContext, props: QiankunProps) => {
  updateSubApp(context, props);
};

export const unmountSystemApp = async (context: SystemAppContext, props: QiankunProps = {}) => {
  await unmountSubApp(context, props);
};

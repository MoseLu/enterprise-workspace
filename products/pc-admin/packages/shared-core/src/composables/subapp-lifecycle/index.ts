/**
 * 子应用生命周期管理 Composables
 * 标准化模板，以财务应用为标准
 */

// 类型定义
export * from './types';
export type { SubAppContext, SubAppOptions } from './types';

// 工具函数
export * from './utils';

// Composables - 显式导出以确保 TypeScript 正确识别
export { setupSubAppGlobals } from './useSubAppGlobals';
export { createSubApp, mountSubApp, unmountSubApp, updateSubApp, setupStandalonePlugins } from './useSubAppLifecycle';
export { setupRouteSync, setupHostLocationBridge, ensureCleanUrl } from './useSubAppRouteSync';
export { setupEventBridge } from './useSubAppEventBridge';
export * from './useSubAppTabbar';
export * from './useSubAppMenu';
export * from './useSubAppBreadcrumb';
export { createLogoutFunction } from './useSubAppLogout';

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>;
  export default component;
}

declare module 'virtual:eps' {
  export const service: Record<string, any>;
  export const list: any[];
  interface EpsModule {
    service: typeof service;
    list: typeof list;
    isUpdate?: boolean;
  }
  const eps: EpsModule;
  export default eps;
}

// 类型声明：支持子路径导入
declare module '@btc/shared-core/composables/subapp-lifecycle' {
  export * from '@btc/shared-core';
}

// 类型声明：@btc/shared-utils
declare module '@btc/shared-utils' {
  // 明确导出需要的成员
  export const storage: any;
  export function loadSharedResourcesFromLayoutApp(...args: any[]): any;
  export function syncSettingsToCookie(...args: any[]): any;
  export function formatDate(...args: any[]): any;
  export function formatDateTime(...args: any[]): any;
  export function formatDateTimeFriendly(...args: any[]): any;
  export function getDateRange(...args: any[]): any;
  export function usePageTransition(...args: any[]): any;
  // 注意：其他导出会从实际的包类型定义中获取，不需要在这里重新导出
}

declare module '@btc/shared-utils/cdn/load-shared-resources' {
  export function loadSharedResourcesFromLayoutApp(options?: {
    resources?: string[];
    onProgress?: (loaded: number, total: number) => void;
  }): Promise<void>;
  export function areSharedResourcesLoaded(): boolean;
}

// 类型声明：@btc/shared-core
declare module '@btc/shared-core' {
  export type QiankunProps = any;
  export type SubAppContext = any;
  export type SubAppOptions = any;
  export type UseCrudReturn<T = any> = any;
  export type CrudService<T = any> = any;
  export type ThemeConfig = any;
  export type ButtonStyle = any;

  export function setupSubAppGlobals(...args: any[]): any;
  export function createSubApp(...args: any[]): any;
  export function mountSubApp(...args: any[]): any;
  export function unmountSubApp(...args: any[]): any;
  export function updateSubApp(...args: any[]): any;
  export function setupRouteSync(...args: any[]): any;
  export function setupHostLocationBridge(...args: any[]): any;
  export function setupEventBridge(...args: any[]): any;
  export function ensureCleanUrl(...args: any[]): any;
  export function setupStandalonePlugins(...args: any[]): any;
  export function createLogoutFunction(...args: any[]): any;
  export const removeLoadingElement: any;
  export const clearNavigationFlag: any;

  export function useThemeStore(...args: any[]): any;
  export function useI18n(...args: any[]): any;
  export function createI18nPlugin(...args: any[]): any;
  export function createThemePlugin(...args: any[]): any;
  export function useSmsCode(...args: any[]): any;
  export function useBtcForm(...args: any[]): any;
  export function useTabs(...args: any[]): any;
  export function useAction(...args: any[]): any;
  export function useElApi(...args: any[]): any;
  export function usePlugins(...args: any[]): any;
}

// 类型声明：@btc/shared-components（参考 layout-app 的方式）
declare module '@btc/shared-components' {
  // 重新导出所有命名导出
  export { getMenuRegistry, registerMenus, clearMenus, clearMenusExcept, getMenusForApp } from '../../../packages/shared-components/src/store/menuRegistry';
  export { useCurrentApp } from '../../../packages/shared-components/src/composables/useCurrentApp';
  export { useProcessStore, getCurrentAppFromPath } from '../../../packages/shared-components/src/store/process';
  export { useBrowser } from '../../../packages/shared-components/src/composables/useBrowser';
  export { useUser } from '../../../packages/shared-components/src/composables/useUser';
  export { provideContentHeight, useContentHeight } from '../../../packages/shared-components/src/composables/content-height';
  export { mountDevTools, unmountDevTools } from '../../../packages/shared-components/src/utils/mount-dev-tools';
  export { autoMountDevTools } from '../../../packages/shared-components/src/utils/auto-mount-dev-tools';
  export { default as mitt, globalMitt, Mitt } from '../../../packages/shared-components/src/utils/mitt';

  // 导出类型
  export type { MenuItem } from '../../../packages/shared-components/src/store/menuRegistry';
  export type { ProcessItem } from '../../../packages/shared-components/src/store/process';
  export type { UserInfo } from '../../../packages/shared-components/src/composables/useUser';

  // 导出组件（如果需要）
  export { default as AppLayout } from '../../../packages/shared-components/src/components/layout/app-layout/index.vue';
  export { default as AppSkeleton } from '../../../packages/shared-components/src/components/basic/app-skeleton/index.vue';

  // 显式导出常用组件和函数
  export { BtcMessage } from '../../../packages/shared-components/src/components/feedback/btc-message';
  export { BtcMessageBox, BtcConfirm, BtcAlert, BtcPrompt } from '../../../packages/shared-components/src/components/feedback/btc-message-box';
  export { useFormRenderer } from '../../../packages/shared-components/src/common/form/composables/useFormRenderer';
  export { registerEChartsThemes } from '../../../packages/shared-components/src/charts/utils/theme';
  
  // 导出其他可能需要的导出
  export * from '../../../packages/shared-components/src/index';
}


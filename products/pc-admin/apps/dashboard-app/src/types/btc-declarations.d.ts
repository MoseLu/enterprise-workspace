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
  export function useSmsCode(...args: any[]): any;
  export function useBtcForm(...args: any[]): any;
  export function useTabs(...args: any[]): any;
  export function useAction(...args: any[]): any;
  export function useElApi(...args: any[]): any;
  export function usePlugins(...args: any[]): any;
}

declare module '@btc/shared-components' {
  import type { Component } from 'vue';
  export const AppLayout: Component;
  export const BtcMessage: any;
  export const BtcMessageBox: any;
  export const BtcConfirm: any;
  export const getCurrentAppFromPath: any;
  export type ProcessItem = any;
  export function useProcessStore(...args: any[]): any;
  export function registerMenus(...args: any[]): any;
  export function getMenuRegistry(...args: any[]): any;
  export function getMenusForApp(...args: any[]): any;
  export function registerEChartsThemes(...args: any[]): any;
  export function useFormRenderer(...args: any[]): any;
  export const globalMitt: any;
  export const MenuThemeEnum: any;
  export const SystemThemeEnum: any;
}

declare module '@btc/shared-utils' {
  export const storage: any;
  export function loadSharedResourcesFromLayoutApp(...args: any[]): any;
  export const formHook: { submit: (...args: any[]) => any; bind: (...args: any[]) => any };
  export function formatDateTimeFriendly(...args: any[]): any;
  export function isDateTimeField(...args: any[]): any;
}

declare module '@btc-components/feedback/btc-message' {
  export const BtcMessage: any;
  export default BtcMessage;
}

declare module '@btc-components/feedback/btc-message-box' {
  export const BtcMessageBox: any;
  export const BtcConfirm: any;
  export const BtcAlert: any;
  export const BtcPrompt: any;
  export default BtcMessageBox;
}

declare module '@btc-common/form/composables/useFormRenderer' {
  export function useFormRenderer(...args: any[]): any;
  export default useFormRenderer;
}

declare module 'vue-router' {
  export type Router = any;
  export function createRouter(...args: any[]): Router;
  export function createWebHistory(...args: any[]): any;
  export function createMemoryHistory(...args: any[]): any;
  export function createWebHashHistory(...args: any[]): any;
  export function useRoute(): any;
  export function useRouter(): Router;
  export interface RouteLocationNormalizedLoaded { [key: string]: any }
}

declare module '@btc/shared-core/configs/layout-bridge' {
  export function injectDomainListResolver(appId: string, moduleOrPath: any): Promise<any>;
}

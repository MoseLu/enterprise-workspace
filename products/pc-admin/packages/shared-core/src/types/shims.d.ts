declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, any>, any, any>;
  export default component;
}

declare module 'vue-router' {
  export type Router = any;
  export function createRouter(...args: any[]): Router;
  export function createWebHistory(...args: any[]): any;
  export function createMemoryHistory(...args: any[]): any;
  export function useRoute(): any;
  export function useRouter(): Router;
}

declare module '@btc-components/*' {
  export const BtcMessage: any;
  export const BtcMessageBox: any;
  export const BtcConfirm: any;
  export const BtcAlert: any;
  export const BtcPrompt: any;
  const _default: any;
  export default _default;
}

declare module '@btc-common/*' {
  const anyExport: any;
  export default anyExport;
}

declare module '@btc/subapp-manifests' {
  export function getManifest(appId: string): any;
  export function getManifestMenus(appId: string): any;
  export function getManifestTabs(appId: string): any;
  const _default: any;
  export default _default;
}

declare module '@btc/shared-core' {
  export type Plugin = any;
  export type ThemeConfig = any;
  export type ButtonStyle = any;
  export type UseCrudReturn<T = any> = any;
  export const assignIconsToMenuTree: any;
  export const useI18n: any;
  export const useThemePlugin: any;
  export function useSmsCode(...args: any[]): any;
  export function createRequest(...args: any[]): any;
  export const removeLoadingElement: any;
  export const clearNavigationFlag: any;
  const _default: any;
  export default _default;
}

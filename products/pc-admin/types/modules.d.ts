declare module '@intlify/unplugin-vue-i18n/vite' {
  const plugin: any;
  export default plugin;
}

declare module '@vitejs/plugin-basic-ssl' {
  const mod: any;
  export default mod;
}

declare module 'rollup' {
  export type RollupOptions = any;
  export type WarningHandlerWithDefault = any;
  export type OutputAsset = any;
  export type Warning = any;
  export type OutputOptions = any;
  export type OutputBundle = any;
  export type OutputOptions = any;
  export type ChunkInfo = any;
  export type OutputBundle = any;
}

declare module '@btc/vite-plugin' {
  export const btc: any;
  export function fixChunkReferencesPlugin(...args: any[]): any;
  export default btc;
}

declare module '@btc/subapp-manifests' {
  export function getManifestMenus(...args: any[]): any;
  export function getManifestTabs(...args: any[]): any;
  export function getManifest(...args: any[]): any;
  export function getManifestRoute(...args: any[]): any;
}

declare module '@btc/shared-components' {
  export const sharedLocalesZhCN: any;
  export const sharedLocalesEnUS: any;
  export const BtcMessage: any;
  export function BtcMessageBox(...args: any[]): any;
}

declare module '@btc/shared-utils' {
  export function syncSettingsToCookie(...args: any[]): any;
  export function syncSettingsFromCookie(...args: any[]): any;
  export function syncUserToCookie(...args: any[]): any;
}

declare module '@btc/shared-core' {
  export type Plugin = any;
  export function assignIconsToMenuTree(...args: any[]): any;
  export const getIsMainAppFn: any;
  export const setIsMainAppFn: any;

  // common exports used across apps
  export function usePluginManager(...args: any[]): any;
  export function loadEpsService(...args: any[]): any;
  export function exportEpsServiceToGlobal(...args: any[]): any;
  export function createI18nPlugin(...args: any[]): any;
  export function createThemePlugin(...args: any[]): any;
  export const zhCN: any;
  export const enUS: any;
  export function useThemePlugin(...args: any[]): any;
  export type ButtonStyle = any;
  
  // Loading services
  export const appLoadingService: any;
  export const rootLoadingService: any;
}



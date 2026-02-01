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

declare module '@btc/shared-utils/cdn/load-shared-resources' {
  export * from '@btc/shared-utils';
}

// 类型声明：vue-router
declare module 'vue-router' {
  export type Router = any;
  export type RouteRecordRaw = any;
  export function createRouter(...args: any[]): Router;
  export function createWebHistory(...args: any[]): any;
  export function createMemoryHistory(...args: any[]): any;
  export function createWebHashHistory(...args: any[]): any;
  export function useRoute(): any;
  export function useRouter(): Router;
  export interface RouteLocationNormalizedLoaded { [key: string]: any }
}

// 类型声明：@btc/shared-components
declare module '@btc/shared-components' {
  export * from '../../../packages/shared-components/src/index';
  // 显式声明枚举类型（export * 可能无法正确转发枚举）
  export { MenuThemeEnum, SystemThemeEnum, MenuTypeEnum, ContainerWidthEnum, BoxStyleType } from '../../../packages/shared-components/src/components/others/btc-user-setting/config/enums';
  // 显式声明函数（export * 可能无法正确转发函数）
  export { registerMenus, clearMenus, clearMenusExcept, getMenusForApp, getMenuRegistry } from '../../../packages/shared-components/src/store/menuRegistry';
  // 显式声明 process store 相关导出
  export { useProcessStore, getCurrentAppFromPath, type ProcessItem } from '../../../packages/shared-components/src/store/process';
  // 显式声明 ECharts 主题注册函数
  export { registerEChartsThemes } from '../../../packages/shared-components/src/charts/utils/theme';
  // 显式声明反馈组件
  export { BtcMessage } from '../../../packages/shared-components/src/components/feedback/btc-message';
  // 显式声明 Vue 组件（export * 可能无法正确转发 Vue 组件的 default export）
  export { default as AppLayout } from '../../../packages/shared-components/src/components/layout/app-layout/index.vue';
  export { default as AppSkeleton } from '../../../packages/shared-components/src/components/basic/app-skeleton/index.vue';
}


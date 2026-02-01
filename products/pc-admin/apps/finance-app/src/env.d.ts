/// <reference types="vite/client" />

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
  export type { TableColumn } from '../../../packages/shared-components/src/components/data/btc-table-group/types';
  export type { FormItem } from '../../../packages/shared-components/src/components/form/btc-form/types';

  // 导出组件（如果需要）
  export { default as AppLayout } from '../../../packages/shared-components/src/components/layout/app-layout/index.vue';
  export { default as AppSkeleton } from '../../../packages/shared-components/src/components/basic/app-skeleton/index.vue';
  export { default as BtcChartDemo } from '../../../packages/shared-components/src/components/data/btc-chart-demo/index.vue';
  export { default as BtcMessage } from '../../../packages/shared-components/src/components/feedback/btc-message/index.vue';
  export { default as BtcSvg } from '../../../packages/shared-components/src/components/others/btc-svg/index.vue';

  // 导出枚举
  export { MenuThemeEnum, SystemThemeEnum } from '../../../packages/shared-components/src/composables/useTheme';

  // 导出其他可能需要的导出
  export * from '../../../packages/shared-components/src/index';
}


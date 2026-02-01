/**
 * 类型声明文件
 * 用于解决 @btc/shared-components 模块的类型声明问题
 */

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
  
  // 导出其他可能需要的导出
  export * from '../../../packages/shared-components/src/index';
  
  // 显式导出 setIsMainAppFn 以确保类型正确
  export { setIsMainAppFn, getIsMainAppFn } from '../../../packages/shared-components/src/components/layout/app-layout/utils';
  export { registerEChartsThemes } from '../../../packages/shared-components/src/charts/utils/theme';
}


import type { Plugin } from '@btc/shared-core';
/**
 * 用户设置插件
 */
export declare const userSettingPlugin: Plugin;
// BtcUserSettingDrawer 现在从 @btc/shared-components 导入
// 移除立即导出 composables，避免在模块加载时触发循环依赖
// composables 应该通过动态导入使用
// export * from './composables';

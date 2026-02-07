import type { App } from 'vue';
import { setupUI as setupSharedUI, setupDarkMode } from '@btc/shared-core';

/**
 * 设置 UI 相关插件
 */
export const setupUI = (app: App) => {
  // 设置 Element Plus 和共享组件 UI
  setupSharedUI(app);

  // 设置暗色模式（如果在独立运行时）
  if (!import.meta.env.PROD || !(window as any).__POWERED_BY_QIANKUN__) {
    setupDarkMode();
  }
};

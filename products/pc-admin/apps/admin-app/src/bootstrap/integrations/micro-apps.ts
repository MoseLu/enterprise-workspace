/**
 * 微应用集成模块
 * 负责配置qiankun微前端相关设置
 */

import type { App } from 'vue';
import { setupQiankun, listenSubAppReady, listenSubAppRouteChange } from '../../micro';

/**
 * 设置微前端应用
 */
export const setupMicroApps = async (app: App) => {
  // 设置qiankun
  setupQiankun();

  // 监听子应用准备就绪
  listenSubAppReady();

  // 监听子应用路由变化
  listenSubAppRouteChange();
};

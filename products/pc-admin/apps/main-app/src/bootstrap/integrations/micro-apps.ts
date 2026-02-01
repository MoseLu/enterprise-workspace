/**
 * 微应用集成模块
 * 负责配置qiankun微前端相关设置
 */

import type { App } from 'vue';
import { setupQiankun, listenSubAppReady, listenSubAppRouteChange } from '../../micro';

/**
 * 设置微前端应用
 * @returns globalState qiankun全局状态
 */
export const setupMicroApps = async (_app: App) => {
  // 设置qiankun（返回 globalState）
  const globalState = setupQiankun();

  // 监听子应用准备就绪
  listenSubAppReady();

  // 监听子应用路由变化
  listenSubAppRouteChange();

  // 返回 globalState，供插件系统使用
  return globalState;
};

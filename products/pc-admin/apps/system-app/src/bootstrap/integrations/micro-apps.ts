/**
 * 微应用集成模块
 * system-app 作为子应用，不再需要设置 qiankun 主应用
 */

import type { App } from 'vue';

/**
 * 设置微前端应用（system-app 作为子应用，不再需要设置 qiankun）
 */
export const setupMicroApps = async (_app: App) => {
  // system-app 作为子应用，不再需要设置 qiankun 主应用配置
  // qiankun 配置现在由 main-app 负责
};

/**
 * 路由配置模块
 * 负责配置Vue Router
 */

import type { App } from 'vue';
import router from '../../router';

/**
 * 配置路由
 */
export const setupRouter = (app: App) => {
  // 安装路由
  app.use(router);
};

/**
 * 导出路由实例
 */
export { router };

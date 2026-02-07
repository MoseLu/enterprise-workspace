/**
 * 路由配置模块
 * 负责配置Vue Router
 */

import type { App } from 'vue';
import type { Router } from 'vue-router';
import router from '../../router';
import { createSystemRouter } from '../../router';

/**
 * 导出 createSystemRouter 函数
 */
export { createSystemRouter } from '../../router';

/**
 * 配置路由
 */
export const setupRouter = (app: App, routerInstance?: Router) => {
  const instance = routerInstance ?? createSystemRouter();
  app.use(instance);
  return instance;
};

/**
 * 导出路由实例（向后兼容）
 */
export { router };

import type { App } from 'vue';
import type { Router } from 'vue-router';
import { createAdminRouter } from '../../router';

export { createAdminRouter } from '../../router';

// 创建一个全局 router 实例（用于拦截器和插件）
let routerInstance: Router | null = null;

export const setupRouter = (app: App, router?: Router) => {
  const instance = router ?? createAdminRouter();
  routerInstance = instance;
  app.use(instance);
  return instance;
};

// 导出 router 实例（用于拦截器和插件）
export const router = new Proxy({} as Router, {
  get(_target, prop) {
    if (!routerInstance) {
      throw new Error('Router has not been initialized. Call setupRouter first.');
    }
    return (routerInstance as any)[prop];
  },
});

export type { Router };

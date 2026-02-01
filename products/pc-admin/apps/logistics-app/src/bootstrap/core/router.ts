import type { App } from 'vue';
import type { Router } from 'vue-router';
import { createLogisticsRouter } from '../../router';

export { createLogisticsRouter } from '../../router';

export const setupRouter = (app: App, router?: Router) => {
  const instance = router ?? createLogisticsRouter();
  app.use(instance);
  return instance;
};

export type { Router };

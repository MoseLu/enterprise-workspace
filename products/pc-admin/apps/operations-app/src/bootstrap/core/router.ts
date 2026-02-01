import type { App } from 'vue';
import type { Router } from 'vue-router';
import { createOperationsRouter } from '../../router';

export { createOperationsRouter } from '../../router';

export const setupRouter = (app: App, router?: Router, isStandalone?: boolean) => {
  const instance = router ?? createOperationsRouter(isStandalone ?? false);
  app.use(instance);
  return instance;
};

export type { Router };

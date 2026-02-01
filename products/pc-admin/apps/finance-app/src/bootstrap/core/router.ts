import type { App } from 'vue';
import type { Router } from 'vue-router';
import { createFinanceRouter } from '../../router';

export { createFinanceRouter } from '../../router';

export const setupRouter = (app: App, router?: Router) => {
  const instance = router ?? createFinanceRouter();
  app.use(instance);
  return instance;
};

export type { Router };

import type { App } from 'vue';
import type { Router } from 'vue-router';
import { create{{APP_NAME_PASCAL}}Router } from '../../router';

export { create{{APP_NAME_PASCAL}}Router } from '../../router';

export const setupRouter = (app: App, router?: Router) => {
  const instance = router ?? create{{APP_NAME_PASCAL}}Router();
  app.use(instance);
  return instance;
};

export type { Router };


import type { App } from 'vue';
import type { Pinia } from 'pinia';
import { createPinia } from 'pinia';
import { persistedStatePlugin } from '@btc/shared-core/utils/storage';

export const createStore = () => {
  const pinia = createPinia();
  // 使用持久化插件（默认使用 localStorage）
  pinia.use(persistedStatePlugin);
  return pinia;
};

export const setupStore = (app: App, store?: Pinia) => {
  const pinia = store ?? createStore();
  app.use(pinia);
  return pinia;
};

export type { Pinia };

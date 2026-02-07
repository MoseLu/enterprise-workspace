/// <reference types="vite/client" />

declare module 'virtual:eps' {
  export const service: Record<string, any>;
  export const list: any[];
  interface EpsModule {
    service: typeof service;
    list: typeof list;
    isUpdate?: boolean;
  }
  const eps: EpsModule;
  export default eps;
}


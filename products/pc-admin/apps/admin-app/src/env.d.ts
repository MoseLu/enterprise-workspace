/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DOCS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module 'virtual:svg-icons' {
  const content: string;
  export default content;
}

declare module 'virtual:ctx' {
  interface CtxData {
    modules?: string[];
    serviceLang?: string;
  }
  const ctx: CtxData;
  export default ctx;
}

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

declare module 'virtual:eps-json' {
  const data: any[]; // EPS 原始数据列表
  export default data;
}

/// <reference types="vite/client" />

// Vite 环境变量类型定义
interface ImportMetaEnv extends Readonly<Record<string, any>> {
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

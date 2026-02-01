/**
 * 构建时依赖的类型声明
 * 这些模块在构建时使用，但类型检查时可能无法找到
 */

declare module 'rollup' {
  export interface RollupOptions {
    [key: string]: any;
  }
  export interface Warning {
    code?: string;
    message?: string;
    [key: string]: any;
  }
  export type WarningHandler = (warning: Warning, warn: (warning: Warning) => void) => void;
  export type WarningHandlerWithDefault = (warning: Warning) => void;
  export interface OutputAsset {
    name?: string;
    [key: string]: any;
  }
  export interface OutputOptions {
    [key: string]: any;
  }
  export interface OutputBundle {
    [key: string]: any;
  }
  export interface ChunkInfo {
    [key: string]: any;
  }
  // 导出 rollup 的所有其他类型
  export * from 'rollup';
}

declare module '@intlify/unplugin-vue-i18n/vite' {
  import type { Plugin } from 'vite';
  export default function unpluginVueI18n(options?: any): Plugin | Plugin[];
}

declare module '@btc/vite-plugin' {
  import type { Plugin } from 'vite';
  export function btc(options?: any): Plugin[];
  export function createEpsPlugin(options?: any): Plugin;
  export function createCoolAdminPlugin(options?: any): Plugin;
}

declare module 'vite-plugin-pwa' {
  import type { Plugin } from 'vite';
  export function VitePWA(options?: any): Plugin | Plugin[];
  export default VitePWA;
}

declare module '@vitejs/plugin-basic-ssl' {
  import type { Plugin } from 'vite';
  export default function basicSsl(options?: any): Plugin;
}

declare module 'axios' {
  export * from 'axios';
}

declare module '@btc/vite-plugin' {
  import type { Plugin } from 'vite';
  export function btc(options?: any): Plugin[];
  export function createEpsPlugin(options?: any): Plugin;
  export function createCoolAdminPlugin(options?: any): Plugin;
  export function fixChunkReferencesPlugin(): Plugin;
}

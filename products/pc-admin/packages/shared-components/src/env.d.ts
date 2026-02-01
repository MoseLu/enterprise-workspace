/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module 'vue-router' {
  export type Router = any;
  export type RouteLocationNormalized = any;
  export type NavigationGuardNext = any;
  export function createRouter(...args: any[]): Router;
  export function createWebHistory(...args: any[]): any;
  export function createMemoryHistory(...args: any[]): any;
  export function useRoute(): any;
  export function useRouter(): Router;
}

declare global {
  interface Window {
    __USE_LAYOUT_APP__?: boolean;
    __IS_LAYOUT_APP__?: boolean;
    __MENU_TYPE_DEBUG_LOGGED__?: boolean;
    __SIDEBAR_DEBUG_LOGGED__?: boolean;
    __LAYOUT_APP_DEBUG_LOGGED__?: boolean;
    __SIDEBAR_NOT_RENDERED_LOGGED__?: boolean;
    __APP_EMITTER__?: any;
  }
}


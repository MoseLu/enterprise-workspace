/**
 * 全局插件API类型声明
 */

import type { PluginAPI } from './types';

declare global {
  interface Window {
    /**
     * 插件系统全局API
     * 主应用作为插件基座，提供统一的插件操作接口
     */
    __PLUGIN_API__?: PluginAPI;
  }
}

/**
 * 外部配置模块的类型声明
 * 这些模块在构建时被标记为 external，不会被打包
 * 运行时由使用 shared-plugins 的应用提供
 */

declare module '@btc/shared-core/configs/unified-env-config' {
  export type Environment = 'development' | 'preview' | 'production';

  export function getEnvironment(): Environment;
  export function getCurrentSubApp(): string | null;
  export function isMainApp(
    routePath?: string,
    locationPath?: string,
    isStandalone?: boolean
  ): boolean;
}

declare module '@btc/shared-core/configs/app-scanner' {
  export interface AppIdentity {
    id: string;
    name: string;
    description?: string;
    pathPrefix: string;
    subdomain?: string;
    type: 'main' | 'sub' | 'layout' | 'docs';
    enabled: boolean;
    icon?: string;
    version?: string;
    routes?: {
      mainAppRoutes?: string[];
      nonClosableRoutes?: string[];
      homeRoute?: string;
      skipTabbarRoutes?: string[];
    };
    metadata?: Record<string, any>;
  }

  export function getAllApps(): AppIdentity[];
  export function getAppById(id: string): AppIdentity | undefined;
  export function getMainApp(): AppIdentity | undefined;
  export function getSubApps(): AppIdentity[];
  export function getAppByPathPrefix(pathPrefix: string): AppIdentity | undefined;
}

declare module '@btc/shared-core/configs/layout-bridge' {
  export function registerManifestMenusForApp(app: string): void;
  export function registerManifestTabsForApp(app: string): void;
  export function registerAppEnvAccessors(): void;
  export function createAppStorageBridge(namespace?: string): any;
  export function createDefaultDomainResolver(): void;
  export function injectDomainListResolver(
    appId: string,
    domainCachePathOrModule?: string | { getDomainList?: any; clearDomainCache?: any },
    target?: Window
  ): Promise<void>;
  export function resolveAppLogoUrl(): string;
  export function createSharedUserSettingPlugin(): any;
  export function registerMenuRegistrationFunction(fn: (app: string) => void): void;
}

declare module '@btc/shared-components' {
  export * from '@btc/shared-components';
}

declare module '@btc/i18n' {
  export * from '../i18n';
}

declare module '@btc/i18n/locales' {
  export * from '../i18n/locales';
}

declare module '@btc/auth-shared/composables/redirect' {
  export function redirectToLogin(options?: { returnUrl?: string }): void;
  export function redirectToLogout(options?: { returnUrl?: string }): void;
}

declare module '@vueuse/core' {
  export * from '@vueuse/core';
}

export {};


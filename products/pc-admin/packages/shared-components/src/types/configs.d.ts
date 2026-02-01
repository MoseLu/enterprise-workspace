/**
 * 外部配置模块的类型声明
 * 这些模块在构建时被标记为 external，不会被打包
 * 运行时由使用 shared-components 的应用提供
 */

declare module '@btc/shared-core/configs/unified-env-config' {
  export type Environment = 'development' | 'preview' | 'test' | 'production';

  export function getEnvironment(): Environment;
  export function getCurrentEnvironment(): Environment;
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
  export function getAppBySubdomain(subdomain: string): AppIdentity | undefined;
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


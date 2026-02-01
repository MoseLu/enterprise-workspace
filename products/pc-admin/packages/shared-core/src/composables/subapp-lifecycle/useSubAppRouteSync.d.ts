import type { SubAppContext } from './types';
/**
 * 同步子路由到主机（标准化模板）
 */
export declare function syncHostWithSubRoute(fullPath: string, basePath: string, context?: SubAppContext): void;
/**
 * 同步主机路由到子应用（标准化模板）
 */
export declare function syncSubRouteWithHost(context: SubAppContext, appId: string, basePath: string): void;
/**
 * 设置路由同步监听（标准化模板）
 */
export declare function setupRouteSync(context: SubAppContext, _appId: string, basePath: string): void;
/**
 * 设置主机位置桥接（标准化模板）
 */
export declare function setupHostLocationBridge(context: SubAppContext, appId: string, basePath: string): void;
/**
 * 确保 URL 干净（标准化模板）
 */
export declare function ensureCleanUrl(context: SubAppContext): void;
//# sourceMappingURL=useSubAppRouteSync.d.ts.map
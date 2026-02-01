/**
 * 应用路由工具函数库
 * 提供统一的应用标识获取和路由判断函数，消除硬编码
 */
/**
 * 获取主应用标识（从配置动态获取，不硬编码）
 */
export declare function getMainAppId(): string;
/**
 * 判断路径是否为主应用路由（从配置读取，不硬编码）
 */
export declare function isMainAppRoute(path: string): boolean;
/**
 * 判断路由是否可关闭（从配置读取）
 */
export declare function isRouteClosable(path: string): boolean;
/**
 * 判断路由是否应该跳过 Tabbar（从配置读取）
 */
export declare function shouldSkipTabbar(path: string): boolean;
/**
 * 获取主应用首页路由（从配置读取）
 */
export declare function getMainAppHomeRoute(): string;
/**
 * 根据路径获取应用标识（优先从 app-scanner，回退到路径推断）
 */
export declare function getAppIdFromPath(path: string): string;
/**
 * 获取主应用路由配置（类型安全）
 */
export declare function getMainAppRoutes(): any;
//# sourceMappingURL=app-route-utils.d.ts.map
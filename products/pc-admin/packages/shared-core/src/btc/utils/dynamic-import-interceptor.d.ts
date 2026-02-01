/**
 * 动态导入拦截器
 * 拦截 import() 调用，识别 /assets/ 和 /assets/layout/ 路径的资源
 * 使用资源加载器加载资源，然后执行模块代码
 */
import { type ResourceLoaderOptions } from './resource-loader';
/**
 * 初始化动态导入拦截器
 */
export declare function initDynamicImportInterceptor(): void;
/**
 * 加载模块（替代 import()）
 * 应用代码可以使用此函数替代 import() 来加载静态资源模块
 */
export declare function loadModule(specifier: string, options?: Partial<ResourceLoaderOptions>): Promise<any>;
/**
 * 清除模块缓存
 */
export declare function clearModuleCache(): void;
/**
 * 获取模块缓存信息
 */
export declare function getModuleCacheInfo(): {
    cachedModules: string[];
    loadingModules: string[];
};
//# sourceMappingURL=dynamic-import-interceptor.d.ts.map
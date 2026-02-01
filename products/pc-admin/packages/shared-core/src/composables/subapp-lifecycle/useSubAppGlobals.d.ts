export interface SubAppGlobalsOptions {
    appId: string;
    basePath: string;
    domainCachePath: string;
    domainCacheModule?: {
        getDomainList?: any;
        clearDomainCache?: any;
    };
}
/**
 * 设置子应用的全局函数（标准化模板）
 * 以财务应用为标准，所有子应用使用相同的逻辑
 */
export declare function setupSubAppGlobals(options: SubAppGlobalsOptions): Promise<void>;
//# sourceMappingURL=useSubAppGlobals.d.ts.map
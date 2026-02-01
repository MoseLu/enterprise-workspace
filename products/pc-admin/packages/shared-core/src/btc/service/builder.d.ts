/**
 * 鏈嶅姟鏋勫缓鍣? * 浠?EPS 鏁版嵁鍔ㄦ€佺敓鎴?service 瀵硅薄
 */
export interface ApiMethod {
    name: string;
    method: string;
    path: string;
    summary?: string;
}
export interface ServiceModule {
    api: ApiMethod[];
}
export type EpsData = Record<string, ServiceModule>;
/**
 * 鍔ㄦ€佹湇鍔＄被鍨? */
export type DynamicService = Record<string, Record<string, (data?: any) => Promise<any>>>;
export declare class ServiceBuilder {
    /**
     * 浠?EPS 鏁版嵁鏋勫缓鏈嶅姟瀵硅薄
     * @param epsData - virtual:eps 鎻愪緵鐨勬暟鎹?   */
    build(epsData: EpsData): DynamicService;
}
//# sourceMappingURL=builder.d.ts.map
/**
 * 鍩虹鏈嶅姟绫? * 鍩轰簬缁熶竴鐨?request 鍑芥暟锛屽弬鑰?cool-admin 鐨勫疄鐜? */
import { type Request } from './request';
export interface BaseServiceOptions {
    namespace?: string;
    request?: Request;
}
export declare class BaseService {
    private namespace;
    private request;
    constructor(options?: BaseServiceOptions);
    /**
     * 闈欐€佽姹傛柟娉?   */
    static request(options: any): Promise<any>;
    /**
     * 鍙戣捣 HTTP 璇锋眰
     */
    protected http<T = any>(options: {
        url: string;
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        data?: any;
        params?: any;
    }): Promise<T>;
    /**
     * 鍒楄〃鏌ヨ
     */
    list(data?: any): Promise<any[]>;
    /**
     * 鍒嗛〉鏌ヨ
     */
    page(data: any): Promise<{
        list: any[];
        pagination: {
            page: number;
            size: number;
            total: number;
        };
    }>;
    /**
     * 璇︽儏鏌ヨ
     */
    info(params: any): Promise<any>;
    /**
     * 鏂板
     */
    add(data: any): Promise<any>;
    /**
     * 鏇存柊
     */
    update(data: any): Promise<any>;
    /**
     * 鍒犻櫎
     */
    delete(data: {
        ids: (string | number)[];
    }): Promise<any>;
}
//# sourceMappingURL=base.d.ts.map
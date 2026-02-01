import { AxiosRequestConfig } from 'axios';
/**
 * HTTP 请求工具 - 基于 axios，参考 cool-admin 的实现
 */
export declare class Http {
    baseURL: string;
    private axiosInstance;
    private retryManager;
    constructor(baseURL?: string);
    /**
     * 限制对象大小，防止过大的数据导致问题
     */
    private limitObjectSize;
    /**
     * 记录请求日志
     */
    private recordRequestLog;
    get<T = any>(url: string, params?: Record<string, any>): Promise<T>;
    post<T = any>(url: string, data?: any): Promise<T>;
    put<T = any>(url: string, data?: any): Promise<T>;
    delete<T = any>(url: string, data?: any): Promise<T>;
    request<T = any>(options: AxiosRequestConfig): Promise<T>;
    checkInterceptors(): void;
    /**
     * 获取重试状态
     */
    getRetryStatus(): any;
    /**
     * 重置重试状态
     */
    resetRetry(): void;
    testResponseInterceptor(): void;
    private isRealSuccessResponse;
    recreateResponseInterceptor(): Promise<void>;
}
export declare const http: Http;
/**
 * 基础服务类 - 参考 cool-admin 的 BaseService
 */
export declare class BaseService {
    private namespace?;
    private readonly httpClient;
    constructor(namespace?: string, httpClient?: Http);
    request(options?: AxiosRequestConfig): Promise<any>;
    list(data: any): Promise<any>;
    page(data: any): Promise<any>;
    info(params: any): Promise<any>;
    update(data: any): Promise<any>;
    delete(data: any): Promise<any>;
    add(data: any): Promise<any>;
}
/**
 * 创建标准 CRUD 服务 - 参考 cool-admin 的模式
 */
export declare function createCrudService(resource: string): {
    page: (params: any) => Promise<{
        list: any;
        total: any;
        pageNumber: any;
        pageSize: any;
        totalPage: any;
    }>;
    list: (params?: any) => Promise<any>;
    info: (params: any) => Promise<any>;
    add: (data: any) => Promise<any>;
    update: (data: any) => Promise<any>;
    delete: (data: {
        ids: (string | number)[];
    }) => Promise<any>;
};
/**
 * 创建模拟 CRUD 服务 - 用于开发测试
 */
export declare function createMockCrudService(_resource: string): {
    page: (params: any) => Promise<{
        list: any[];
        total: number;
        pageNumber: any;
        pageSize: any;
        totalPage: number;
    }>;
    list: (_params?: any) => Promise<any[]>;
    info: (_params: any) => Promise<Record<string, never>>;
    add: (_data: any) => Promise<void>;
    update: (_data: any) => Promise<void>;
    delete: (_ids: (string | number)[]) => Promise<void>;
};

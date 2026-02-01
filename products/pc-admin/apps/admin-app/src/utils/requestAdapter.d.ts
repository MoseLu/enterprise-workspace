import type { AxiosRequestConfig } from 'axios';
interface BaseAdapterOptions<TData = any> {
    /**
     * 静默模式：不触发任何默认提示
     */
    silent?: boolean;
    /**
     * 成功后的自定义回调
     */
    onSuccess?: (data: TData) => void;
    /**
     * 失败后的自定义回调
     */
    onError?: (error: any) => void;
    /**
     * 是否触发默认成功提示。
     * - 默认：GET 为 false，其它方法为 true。
     */
    notifySuccess?: boolean;
    /**
     * 自定义成功提示文案或生成函数。
     * - 返回 falsy（如空字符串、null、false）时跳过默认提示。
     */
    successMessage?: string | ((data: TData) => string | null | undefined | false);
    /**
     * 是否触发额外的失败提示。
     * - 默认：false（拦截器已处理通用错误提示，避免重复）
     */
    notifyError?: boolean;
    /**
     * 自定义失败提示文案或生成函数。
     * - 返回 falsy（如空字符串、null、false）时跳过默认提示。
     */
    errorMessage?: string | ((error: any) => string | null | undefined | false);
}
export interface RequestAdapter {
    get<T = any>(url: string, params?: Record<string, any>, options?: BaseAdapterOptions<T>): Promise<T>;
    post<T = any>(url: string, data?: any, options?: BaseAdapterOptions<T>): Promise<T>;
    put<T = any>(url: string, data?: any, options?: BaseAdapterOptions<T>): Promise<T>;
    delete<T = any>(url: string, data?: any, options?: BaseAdapterOptions<T>): Promise<T>;
    request<T = any>(config: AxiosRequestConfig, options?: BaseAdapterOptions<T>): Promise<T>;
}
export declare const requestAdapter: RequestAdapter;
export type { BaseAdapterOptions as RequestAdapterOptions };
export declare const httpClient: any;
export declare const getRetryStatus: () => any;
export declare const resetRetryStatus: () => any;
export declare const recreateResponseInterceptor: () => any;

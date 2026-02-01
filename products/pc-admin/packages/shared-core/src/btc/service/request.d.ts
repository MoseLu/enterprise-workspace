/**
 * 统一 HTTP 请求函数
 * 基于 axios，参考 cool-admin 的实现
 */
export interface RequestOptions {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH';
    data?: any;
    params?: any;
    headers?: Record<string, string>;
    timeout?: number;
    baseURL?: string;
    permission?: string;
    showLoading?: boolean;
    loadingTarget?: HTMLElement | string;
    loadingText?: string;
}
/**
 * 请求函数类型定义
 */
export type Request = (options: RequestOptions) => Promise<any>;
export declare function processURL(baseURL: string, url: string): {
    url: string;
    baseURL: string;
};
/**
 * 创建统一的 request 函数
 * @param baseURL 基础 URL（如果为空字符串或未提供，则使用动态 baseURL）
 * @returns Request 函数
 */
export declare function createRequest(baseURL?: string): Request;
export declare const request: Request;
/**
 * 创建带权限检查的 request 函数
 * @param permissions 权限映射
 * @param baseURL 基础 URL
 * @returns 带权限检查的 Request 函数
 */
export declare function createRequestWithPermission(permissions?: Record<string, boolean>, baseURL?: string): Request;
//# sourceMappingURL=request.d.ts.map
/**
 * BTC Shop Flow 3.0 响应拦截器工具
 * 根据项目响应状态码文档实现统一的响应处理
 */
export interface MessageHandler {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}
export interface ConfirmHandler {
    confirm: (message: string, title?: string) => Promise<boolean>;
}
export interface RouterHandler {
    push: (path: string) => void;
}
export interface ApiResponse<T = any> {
    code: number;
    msg: string;
    data: T;
    total?: number;
    token?: string;
}
/**
 * 响应拦截器类
 */
export declare class ResponseInterceptor {
    private messageHandler?;
    private confirmHandler?;
    private routerHandler?;
    constructor();
    /**
     * 设置消息处理器
     */
    setMessageHandler(handler: MessageHandler): void;
    /**
     * 设置确认对话框处理器
     */
    setConfirmHandler(handler: ConfirmHandler): void;
    /**
     * 设置路由处理器
     */
    setRouterHandler(handler: RouterHandler): void;
    /**
     * 处理成功响应
     */
    handleSuccess<T>(response: ApiResponse<T>): T | ApiResponse<T> | Promise<never>;
    /**
     * 判断是否为真正的成功响应
     */
    private isRealSuccessResponse;
    /**
     * 处理错误响应
     */
    handleError(error: {
        code: number;
        message: string;
    }): Promise<never>;
    /**
     * 处理网络错误
     */
    handleNetworkError(error: any): Promise<never>;
    /**
     * 创建 axios 响应拦截器
     */
    createResponseInterceptor(): {
        onFulfilled: (response: any) => any;
        onRejected: (error: any) => Promise<never>;
    };
}
export declare const responseInterceptor: ResponseInterceptor;
export declare function handleApiResponse<T>(response: ApiResponse<T>): T | ApiResponse<T> | Promise<never>;
export declare function handleApiError(error: {
    code: number;
    message: string;
}): Promise<never>;
export declare function handleNetworkError(error: any): void;
//# sourceMappingURL=index.d.ts.map
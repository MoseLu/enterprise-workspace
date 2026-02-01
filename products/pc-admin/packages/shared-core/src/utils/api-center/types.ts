/**
 * API 中心类型定义
 */

/**
 * API 请求选项
 */
export interface ApiRequestOptions {
  /**
   * 静默模式：不触发任何默认提示
   */
  silent?: boolean;
  /**
   * 成功后的自定义回调
   */
  onSuccess?: (data: any) => void;
  /**
   * 失败后的自定义回调
   */
  onError?: (error: any) => void;
  /**
   * 是否触发默认成功提示
   */
  notifySuccess?: boolean;
  /**
   * 自定义成功提示文案或生成函数
   */
  successMessage?: string | ((data: any) => string | null | undefined | false);
  /**
   * 是否触发额外的失败提示
   */
  notifyError?: boolean;
  /**
   * 自定义失败提示文案或生成函数
   */
  errorMessage?: string | ((error: any) => string | null | undefined | false);
}

/**
 * API 客户端接口
 */
export interface ApiClient {
  /**
   * GET 请求
   */
  get<T = any>(category: string, endpoint: string, params?: Record<string, any>, options?: ApiRequestOptions): Promise<T>;
  
  /**
   * POST 请求
   */
  post<T = any>(category: string, endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T>;
  
  /**
   * PUT 请求
   */
  put<T = any>(category: string, endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T>;
  
  /**
   * DELETE 请求
   */
  delete<T = any>(category: string, endpoint: string, params?: Record<string, any>, options?: ApiRequestOptions): Promise<T>;
}

/**
 * API 客户端
 * 提供统一的 API 调用接口
 */

import type { ApiRequestOptions, ApiClient } from './types';
import { getApiBasePath, type ApiCategory } from './config';

/**
 * 请求适配器接口
 * 用于适配不同应用的请求工具（如 requestAdapter）
 */
export interface RequestAdapter {
  get<T = any>(url: string, params?: Record<string, any>, options?: any): Promise<T>;
  post<T = any>(url: string, data?: any, options?: any): Promise<T>;
  put<T = any>(url: string, data?: any, options?: any): Promise<T>;
  delete<T = any>(url: string, data?: any, options?: any): Promise<T>;
}

/**
 * API 客户端实现类
 */
class ApiClientImpl implements ApiClient {
  private requestAdapter: RequestAdapter;

  constructor(requestAdapter: RequestAdapter) {
    this.requestAdapter = requestAdapter;
  }

  /**
   * 构建完整的 API URL
   */
  private buildUrl(category: string, endpoint: string): string {
    // 确保 endpoint 以 / 开头
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // 获取分类的基础路径
    const basePath = getApiBasePath(category as ApiCategory);
    
    // 组合完整路径
    return `${basePath}${normalizedEndpoint}`;
  }

  /**
   * GET 请求
   */
  get<T = any>(
    category: string,
    endpoint: string,
    params?: Record<string, any>,
    options?: ApiRequestOptions
  ): Promise<T> {
    const url = this.buildUrl(category, endpoint);
    return this.requestAdapter.get<T>(url, params, options);
  }

  /**
   * POST 请求
   */
  post<T = any>(
    category: string,
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    const url = this.buildUrl(category, endpoint);
    return this.requestAdapter.post<T>(url, data, options);
  }

  /**
   * PUT 请求
   */
  put<T = any>(
    category: string,
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    const url = this.buildUrl(category, endpoint);
    return this.requestAdapter.put<T>(url, data, options);
  }

  /**
   * DELETE 请求
   */
  delete<T = any>(
    category: string,
    endpoint: string,
    params?: Record<string, any>,
    options?: ApiRequestOptions
  ): Promise<T> {
    const url = this.buildUrl(category, endpoint);
    return this.requestAdapter.delete<T>(url, params, options);
  }
}

/**
 * 创建 API 客户端实例
 * @param requestAdapter 请求适配器实例
 * @returns API 客户端实例
 */
export function createApiClient(requestAdapter: RequestAdapter): ApiClient {
  return new ApiClientImpl(requestAdapter);
}

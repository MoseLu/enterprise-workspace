// @ts-expect-error - axios 类型定义可能有问题，但运行时可用
import type { AxiosRequestConfig } from 'axios';
import { BtcMessage } from '@btc/shared-components';
import { http } from './http';

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'request';

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
   */
  successMessage?: string | ((data: TData) => string | null | undefined | false);
  /**
   * 是否触发额外的失败提示。
   */
  notifyError?: boolean;
  /**
   * 自定义失败提示文案或生成函数。
   */
  errorMessage?: string | ((error: any) => string | null | undefined | false);
}

const DEFAULT_SUCCESS_MESSAGE = '操作成功';
const DEFAULT_ERROR_MESSAGE = '操作失败，请稍后重试';

function resolveShouldNotifySuccess(method: HttpMethod, options?: BaseAdapterOptions): boolean {
  if (options?.notifySuccess !== undefined) {
    return options.notifySuccess;
  }
  return method !== 'get';
}

function resolveMessage<T>(
  input: string | ((payload: T) => string | null | undefined | false) | undefined,
  payload: T,
  fallback: string
): string | null {
  if (!input) {
    return fallback;
  }

  const message = typeof input === 'function' ? input(payload) : input;

  if (!message) {
    return null;
  }

  return message;
}

async function executeRequest<TData>(
  executor: () => Promise<TData>,
  method: HttpMethod,
  options?: BaseAdapterOptions<TData>
): Promise<TData> {
  const {
    silent = false,
    onSuccess,
    onError,
    successMessage,
    notifyError = false,
    errorMessage
  } = options || {};

  const shouldNotifySuccess = !silent && resolveShouldNotifySuccess(method, options);
  const shouldNotifyError = !silent && notifyError;

  try {
    const data = await executor();

    onSuccess?.(data);

    if (shouldNotifySuccess) {
      const message = resolveMessage(successMessage, data, DEFAULT_SUCCESS_MESSAGE);
      if (message) {
        BtcMessage.success(message);
      }
    }

    return data;
  } catch (error: any) {
    onError?.(error);

    if (shouldNotifyError) {
      const message = resolveMessage(errorMessage, error, DEFAULT_ERROR_MESSAGE);
      if (message) {
        BtcMessage.error(message);
      }
    }

    throw error;
  }
}

export interface RequestAdapter {
  get<T = any>(url: string, params?: Record<string, any>, options?: BaseAdapterOptions<T>): Promise<T>;
  post<T = any>(url: string, data?: any, options?: BaseAdapterOptions<T>): Promise<T>;
  put<T = any>(url: string, data?: any, options?: BaseAdapterOptions<T>): Promise<T>;
  delete<T = any>(url: string, data?: any, options?: BaseAdapterOptions<T>): Promise<T>;
  request<T = any>(config: AxiosRequestConfig, options?: BaseAdapterOptions<T>): Promise<T>;
}

export const requestAdapter: RequestAdapter = {
  get<T = any>(url: string, params?: Record<string, any>, options?: BaseAdapterOptions<T>) {
    return executeRequest(() => http.get<T>(url, params), 'get', options);
  },
  post<T = any>(url: string, data?: any, options?: BaseAdapterOptions<T>) {
    return executeRequest(() => http.post<T>(url, data), 'post', options);
  },
  put<T = any>(url: string, data?: any, options?: BaseAdapterOptions<T>) {
    return executeRequest(() => http.put<T>(url, data), 'put', options);
  },
  delete<T = any>(url: string, data?: any, options?: BaseAdapterOptions<T>) {
    return executeRequest(() => http.delete<T>(url, data), 'delete', options);
  },
  request<T = any>(config: AxiosRequestConfig, options?: BaseAdapterOptions<T>) {
    return executeRequest(() => http.request<T>(config), 'request', options);
  }
};

export type { BaseAdapterOptions as RequestAdapterOptions };


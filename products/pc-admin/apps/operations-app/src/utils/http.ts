;
import axios from 'axios';
// @ts-expect-error - axios 类型定义可能有问题，但运行时可用
import type { AxiosRequestConfig } from 'axios';
import { responseInterceptor, storage } from '@btc/shared-utils';
import { processURL, logger } from '@btc/shared-core';
import { getCookie } from '@btc/shared-core/utils/cookie';
import { appStorage } from './app-storage';
import { envConfig } from '@btc/shared-core/configs/unified-env-config';

/**
 * HTTP 请求工具 - 简化版本
 */
export class Http {
  public baseURL: string;
  private axiosInstance: any;

  constructor(baseURL = '') {
    // 强制验证：在 HTTPS 页面下，baseURL 不能是 HTTP URL
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      if (baseURL.startsWith('http://')) {
        console.warn('[HTTP] 构造函数：检测到 HTTPS 页面，强制使用 /api 代理，忽略 HTTP baseURL:', baseURL);
        baseURL = '/api';
        storage.remove('dev_api_base_url');
      } else if (baseURL && baseURL !== '/api') {
        console.warn('[HTTP] 构造函数：检测到 HTTPS 页面，强制使用 /api 代理，忽略 baseURL:', baseURL);
        baseURL = '/api';
      }
    }

    this.baseURL = baseURL || envConfig.api.baseURL;

    // 创建 axios 实例
    // @ts-expect-error - axios.create 类型定义可能有问题，但运行时可用
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 120000,
      withCredentials: true,
    });

    this.axiosInstance.defaults.baseURL = this.baseURL;

    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
          const stored = storage.get<string>('dev_api_base_url');
          if (stored && stored !== '/api') {
            console.warn('[HTTP] HTTPS 页面：清理 storage 中的非 /api baseURL:', stored);
            storage.remove('dev_api_base_url');
          }
          config.baseURL = '/api';
          this.axiosInstance.defaults.baseURL = '/api';

          if (config.url) {
            const processed = processURL('/api', config.url);
            config.url = processed.url;
            config.baseURL = '/api';
          }

          if (config.baseURL && config.baseURL.startsWith('http://')) {
            logger.error('[HTTP] 严重错误：HTTPS 页面下 baseURL 仍然是 HTTP URL，强制修复为 /api');
            config.baseURL = '/api';
            this.axiosInstance.defaults.baseURL = '/api';
          }

          return config;
        }

        const dynamicBaseURL = envConfig.api.baseURL;
        if (config.url) {
          const processed = processURL(dynamicBaseURL, config.url);
          config.url = processed.url;
          config.baseURL = processed.baseURL;
        } else {
          config.baseURL = dynamicBaseURL;
        }

        this.axiosInstance.defaults.baseURL = config.baseURL;

        const token = getCookie('access_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        config.withCredentials = true;
        config.headers['X-Tenant-Id'] = 'INTRA_1758330466';

        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          const port = window.location.port || '';
          const isProduction = hostname.includes('bellis.com.cn') &&
                               !port.startsWith('41') &&
                               port !== '5173' &&
                               port !== '3000' &&
                               hostname !== 'localhost' &&
                               !hostname.startsWith('127.0.0.1') &&
                               !hostname.startsWith('10.') &&
                               !hostname.startsWith('192.168.');
          if (isProduction) {
            config.headers['x-forward-host'] = 'bellis.com.cn';
          }
        }

        const isFormData = config.data instanceof FormData || (config.data && config.data.constructor?.name === 'FormData');
        if (!isFormData) {
          config.headers['Content-Type'] = 'application/json';
        } else {
          delete config.headers['Content-Type'];
        }

        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    const interceptor = responseInterceptor.createResponseInterceptor();
    this.axiosInstance.interceptors.response.use(
      (response: any) => interceptor.onFulfilled(response),
      async (error: any) => interceptor.onRejected(error)
    );
  }

  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    return this.axiosInstance.get(url, { params });
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return this.axiosInstance.post(url, data);
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    return this.axiosInstance.put(url, data);
  }

  async delete<T = any>(url: string, data?: any): Promise<T> {
    return this.axiosInstance.delete(url, { data });
  }

  async request<T = any>(options: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.request(options);
  }

  getRetryStatus() {
    return { retryCount: 0, isRetrying: false };
  }

  resetRetry() {
    // 简化版本，不需要重试功能
  }

  recreateResponseInterceptor() {
    // 简化版本，不需要重新创建拦截器
  }
}

let _httpInstance: Http | null = null;

function createHttpInstance(): Http {
  if (!_httpInstance) {
    _httpInstance = new Http(envConfig.api.baseURL);
  }
  return _httpInstance;
}

export const http = new Proxy({} as Http, {
  get(_target, prop) {
    const instance = createHttpInstance();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
  set(_target, prop, value) {
    const instance = createHttpInstance();
    (instance as any)[prop] = value;
    return true;
  },
});

/**
 * 统一 HTTP 请求函数
 * 基于 axios，参考 cool-admin 的实现
 */
;

import { storage } from '../../utils';
import axios from 'axios';
// 导入 Zod 验证工具（可选）
import { createApiResponseSchema, safeValidateResponse } from '../../utils/http/schemas';
import { z } from 'zod';
import { logger } from '../../utils/logger/index';
// axios 1.x 类型导入：直接使用 any 类型作为临时解决方案
// 注意：axios 1.12.2 的类型导出在不同 TypeScript 配置下可能表现不同
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AxiosResponse = any;

// 定义 AxiosRequestConfig 类型，使用 any 作为兜底
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AxiosRequestConfig = any;

export interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH';
  data?: any;
  params?: any;
  headers?: Record<string, string>;
  timeout?: number;
  baseURL?: string;
  permission?: string; // 添加权限字段
  showLoading?: boolean; // 是否显示操作级loading（默认false，避免过多loading）
  loadingTarget?: HTMLElement | string; // loading目标元素（可选，默认不指定则使用全屏loading）
  loadingText?: string; // loading提示文字（可选）
}

/**
 * 请求函数类型定义
 */
export type Request = (options: RequestOptions) => Promise<any>;

/**
 * 判断是否在开发环境中运行
 * 未使用，保留以备将来使用
 */
/*
function isDevelopment(): boolean {
  if (typeof window === 'undefined') return false;
  // 检查是否是开发环境：localhost、127.0.0.1、IP 地址（非生产域名）
  const hostname = window.location.hostname;
  const port = window.location.port;
  // 开发环境特征：localhost、127.0.0.1、内网 IP、或者端口是开发服务器端口（如 8080, 9000 等）
  const isLocal = hostname === 'localhost' ||
                  hostname === '127.0.0.1' ||
                  /^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname);
  const isDevDomain = hostname.includes('dev') || hostname.includes('test');
  // 如果端口是常见的开发服务器端口，也认为是开发环境
  const isDevPort = Boolean(port && ['8080', '9000', '5173', '3000', '8081'].includes(port));
  return isLocal || isDevDomain || isDevPort;
}
*/

/**
 * 获取动态 baseURL：统一使用 /api，通过代理转发到后端
 * 开发环境：Vite 代理 /api 到 http://10.80.9.76:8115
 * 生产环境：Nginx 代理 /api 到 http://10.0.0.168:8115
 *
 * 注意：所有环境统一使用 /api，不再支持从 localStorage 读取 HTTP URL
 */
function getDynamicBaseURL(): string {
  // 强制验证：在 HTTPS 页面下，强制使用 /api，忽略所有其他值
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    // HTTPS 页面：强制清理 storage 并返回 /api
    const stored = storage.get<string>('dev_api_base_url');
    if (stored && stored !== '/api') {
      console.warn('[HTTP] HTTPS 页面：清理 storage 中的非 /api baseURL:', stored);
      storage.remove('dev_api_base_url');
    }
    return '/api';
  }

  // 开发环境（HTTP）：清理所有旧的 storage 数据（统一使用 /api，不再支持 HTTP URL）
  if (typeof window !== 'undefined') {
    const stored = storage.get<string>('dev_api_base_url');
    // 清理所有非 /api 的值（包括 HTTP URL、/api-prod 等）
    if (stored && stored !== '/api') {
      console.warn('[HTTP] 清理 storage 中的非 /api baseURL:', stored);
      storage.remove('dev_api_base_url');
    }
  }

  // 统一返回 /api，由代理处理
  return '/api';
}

export function processURL(baseURL: string, url: string): { url: string; baseURL: string } {
  // 强制验证：在 HTTPS 页面下，baseURL 不能是 HTTP URL
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (baseURL.startsWith('http://')) {
      console.warn('[HTTP] processURL：检测到 HTTPS 页面，强制使用 /api 代理，忽略 HTTP baseURL:', baseURL);
      baseURL = '/api';
      // 清理 storage 中的 HTTP URL
      storage.remove('dev_api_base_url');
    }
  }

  // 首先清理 baseURL 中可能存在的重复 /api
  // 如果 baseURL 是完整 URL 且以 /api/api 结尾，移除一个 /api
  let cleanedBaseURL = baseURL;
  if ((cleanedBaseURL.startsWith('http://') || cleanedBaseURL.startsWith('https://')) && cleanedBaseURL.endsWith('/api/api')) {
    cleanedBaseURL = cleanedBaseURL.replace(/\/api\/api$/, '/api');
  }

  // 再次验证：确保清理后的 baseURL 不是 HTTP（在 HTTPS 页面下）
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (cleanedBaseURL.startsWith('http://')) {
      console.warn('[HTTP] processURL：检测到 HTTPS 页面，强制使用 /api 代理，忽略 HTTP baseURL:', cleanedBaseURL);
      cleanedBaseURL = '/api';
    }
  }

  // 处理 URL：统一移除 /api 前缀（如果存在），避免重复拼接
  let processedUrl = url;

  // 如果 URL 以 /api/ 开头，移除 /api/ 前缀
  if (processedUrl.startsWith('/api/')) {
    processedUrl = processedUrl.replace(/^\/api\//, '');
  } else if (processedUrl === '/api' || processedUrl.startsWith('/api?')) {
      // URL = '/api' 或 '/api?...'
    processedUrl = processedUrl === '/api' ? '' : processedUrl.replace(/^\/api/, '');
  }

  // 如果处理后的 URL 是绝对路径（以 / 开头），移除前导斜杠，使其成为相对路径
  // 这样 axios 会将相对路径拼接到 baseURL 后面
  if (processedUrl.startsWith('/')) {
    processedUrl = processedUrl.replace(/^\//, '');
  }

      return {
        url: processedUrl,
    baseURL: cleanedBaseURL
  };
}

/**
 * 创建统一的 request 函数
 * @param baseURL 基础 URL（如果为空字符串或未提供，则使用动态 baseURL）
 * @returns Request 函数
 */
export function createRequest(baseURL: string = ''): Request {
  // 如果 baseURL 为空字符串或未提供，使用动态 baseURL
  // 这样 virtual:eps 生成的代码（传入 ''）也能使用动态 baseURL
  let finalBaseURL = baseURL || getDynamicBaseURL();

  // 强制验证：在 HTTPS 页面下，baseURL 不能是 HTTP URL
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (finalBaseURL.startsWith('http://')) {
      console.warn('[HTTP] createRequest：检测到 HTTPS 页面，强制使用 /api 代理，忽略 HTTP baseURL:', finalBaseURL);
      finalBaseURL = '/api';
      // 清理 storage 中的 HTTP URL
      storage.remove('dev_api_base_url');
    } else if (finalBaseURL && finalBaseURL !== '/api') {
      // HTTPS 页面下，如果不是 /api，也强制使用 /api
      console.warn('[HTTP] createRequest：检测到 HTTPS 页面，强制使用 /api 代理，忽略 baseURL:', finalBaseURL);
      finalBaseURL = '/api';
    }
  }

  // 创建 axios 实例
  const axiosInstance = (axios as any).create({
    baseURL: finalBaseURL,
    timeout: 120000, // 增加到 120 秒（2分钟），避免长时间请求超时
    withCredentials: true, // 始终设置为 true，发送 cookie
  });

  // 请求拦截器
  axiosInstance.interceptors.request.use(
    async (config: any) => {
      // 监控系统：API 请求开始
      try {
        const { trackAPIRequest } = await import('../../utils/monitor');
        const requestId = trackAPIRequest(
          config.url || '',
          config.method || 'GET'
        );
        // 将 requestId 保存到 config 中，供响应拦截器使用
        config.__monitorRequestId = requestId;
      } catch (error) {
        // 静默失败，不影响请求
      }

      // 强制验证：在 HTTPS 页面下，强制使用 /api，忽略所有其他值
      if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
        // HTTPS 页面：强制清理 storage 并返回 /api
        const stored = storage.get<string>('dev_api_base_url');
        if (stored && stored !== '/api') {
          console.warn('[HTTP] HTTPS 页面：清理 storage 中的非 /api baseURL:', stored);
          storage.remove('dev_api_base_url');
        }
        // 强制使用 /api，忽略任何其他值
        config.baseURL = '/api';
        axiosInstance.defaults.baseURL = '/api';

        // 处理 URL（移除 /api 前缀，避免重复拼接）
        if (config.url) {
          const processed = processURL('/api', config.url);
          config.url = processed.url;
          // 确保 baseURL 是 /api
          config.baseURL = '/api';
        }

        // 最终验证：确保 baseURL 不是 HTTP
        if (config.baseURL && config.baseURL.startsWith('http://')) {
          logger.error('[HTTP] 严重错误：HTTPS 页面下 baseURL 仍然是 HTTP URL，强制修复为 /api');
          config.baseURL = '/api';
          axiosInstance.defaults.baseURL = '/api';
        }

        return config;
      }

      // 开发环境（HTTP）：正常处理
      // 动态更新 baseURL（支持运行时切换环境）
      const dynamicBaseURL = getDynamicBaseURL();

      // 处理 URL 和 baseURL（统一在这里处理，避免重复处理）
      // 如果请求中提供了自定义 baseURL，优先使用自定义的
      const finalBaseURL = config.baseURL || dynamicBaseURL;

      if (config.url) {
        const originalUrl = config.url;
        const processed = processURL(finalBaseURL, originalUrl);
        config.url = processed.url;
        config.baseURL = processed.baseURL;
      } else {
        config.baseURL = finalBaseURL;
      }

      // 获取 token
      const token = storage.get<string>('token') || '';
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      // 生产环境：添加 x-forward-host 请求头为根域
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const port = window.location.port || '';
        // 判断是否为生产环境：hostname 包含 bellis.com.cn 且不是开发/预览端口
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

      // 检查是否是 FormData
      const isFormData = config.data instanceof FormData ||
                        (config.data && config.data.constructor?.name === 'FormData');

      // 如果是 FormData，不设置 Content-Type，让浏览器自动设置（包括 boundary）
      // 否则设置为 application/json
      if (!isFormData) {
        if (!config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json';
        }
      } else {
        // FormData 上传时，删除 Content-Type，让浏览器自动设置（包括 boundary）
        delete config.headers['Content-Type'];
      }

      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器 - 提取业务数据
  axiosInstance.interceptors.response.use(
    async (response: AxiosResponse) => {
      // 监控系统：API 响应
      try {
        const { trackAPIResponse } = await import('../../utils/monitor');
        const config = response.config || {};
        const requestId = (config as any).__monitorRequestId;
        const url = config.url || '';
        const method = config.method || 'GET';
        const statusCode = response.status || 200;
        const responseTime = response.headers?.['x-response-time'] 
          ? parseInt(response.headers['x-response-time'], 10)
          : undefined;
        const responseSize = JSON.stringify(response.data).length;
        const requestSize = config.data ? JSON.stringify(config.data).length : undefined;

        trackAPIResponse(
          url,
          method,
          statusCode,
          responseTime,
          responseSize,
          requestSize,
          requestId
        );
      } catch (error) {
        // 静默失败，不影响响应处理
      }

      const responseData = response.data;

      // 如果没有 data，返回原始响应
      if (!responseData) {
        return response;
      }

      // 检查是否是标准 API 响应格式 { code: 200, msg: '...', data: {...} }
      if (responseData && typeof responseData === 'object' && responseData.code !== undefined) {
        const { code, data, msg } = responseData;

        // 特殊处理：当 code 为 501 且消息为"系统繁忙，请稍候再试"时，显示自定义消息
        if (code === 501 && msg === '系统繁忙，请稍候再试') {
          // 立即显示错误消息（同步方式，确保消息能够立即显示）
          const errorMessage = '数据暂时无法获取，请联系管理员Jarvis';

          // 优先尝试使用全局的响应拦截器（如果已初始化）
          const responseInterceptor = (window as any).__BTC_RESPONSE_INTERCEPTOR__;
          if (responseInterceptor && responseInterceptor.handleError) {
            responseInterceptor.handleError({ code, message: msg });
          } else {
            // 如果响应拦截器不可用，尝试使用全局消息处理器
            const messageHandler = (window as any).__APP_MESSAGE_HANDLER__;
            if (messageHandler && messageHandler.error) {
              messageHandler.error(errorMessage);
            } else {
              // 尝试使用 BtcMessage（物流应用使用的消息组件）
              const BtcMessage = (window as any).BtcMessage;
              if (BtcMessage && BtcMessage.error) {
                BtcMessage.error(errorMessage);
              } else {
                // 最后的兜底：使用 console.error
                logger.error(errorMessage);
              }
            }
          }
          // 返回 rejected Promise，让调用方知道这是错误
          const error = new Error(msg || errorMessage);
          (error as any).code = code;
          (error as any).data = data;
          (error as any).response = response;
          return Promise.reject(error);
        }

        // 成功响应（code: 200, 1000, 2000）
        if (code === 1000 || code === 2000) {
          // 返回 data 字段
          return data;
        }

        // code: 200 且消息不包含错误关键词
        if (code === 200) {
          const errorKeywords = [
            '不存在', '错误', '失败', '异常', '无效', '过期', '拒绝', '禁止',
            '未找到', '无法', '不能', '缺少', '不足'
          ];

          const hasErrorKeyword = errorKeywords.some(keyword => msg?.includes(keyword));

          if (!hasErrorKeyword) {
            // 成功响应，提取 data.data（嵌套的 data）
            if (data && typeof data === 'object' && 'data' in data && !Array.isArray(data)) {
              return data.data;
            }
            // 如果没有嵌套的 data，直接返回 data
            return data;
          }
        }

        // 其他情况（业务错误），返回原始响应对象，让调用方处理
        return response;
      }

      // 如果响应格式不符合标准格式，返回原始响应
      return response;
    },
    (error: any) => {

      // 检查是否是业务错误（包含 code 字段）
      if (error && typeof error === 'object' && error.code !== undefined) {
        const { code, message, msg } = error;
        const errorMsg = message || msg || '请求失败';

        // 特殊处理：当 code 为 501 且消息为"系统繁忙，请稍候再试"时，显示自定义消息
        if (code === 501 && (msg === '系统繁忙，请稍候再试' || message === '系统繁忙，请稍候再试')) {
          const errorMessage = '数据暂时无法获取，请联系管理员Jarvis';

          // 优先尝试使用全局的响应拦截器（如果已初始化）
          const responseInterceptor = (window as any).__BTC_RESPONSE_INTERCEPTOR__;
          if (responseInterceptor && responseInterceptor.handleError) {
            responseInterceptor.handleError({ code, message: errorMsg });
          } else {
            // 如果响应拦截器不可用，尝试使用全局消息处理器
            const messageHandler = (window as any).__APP_MESSAGE_HANDLER__;
            if (messageHandler && messageHandler.error) {
              messageHandler.error(errorMessage);
            } else {
              // 尝试使用 BtcMessage（物流应用使用的消息组件）
              const BtcMessage = (window as any).BtcMessage;
              if (BtcMessage && BtcMessage.error) {
                BtcMessage.error(errorMessage);
              } else {
                logger.error('[EPS Request]', errorMessage);
              }
            }
          }
        }
      }

      // 返回 rejected Promise，让调用方能够处理错误
      return Promise.reject(error);
    }
  );

  // 返回 request 函数
  return async (options: RequestOptions): Promise<any> => {
    const { url: originalUrl, method = 'GET', data, params, headers, timeout, baseURL: customBaseURL, showLoading, loadingTarget, loadingText } = options;

    // 直接使用 axios 实例，URL 和 baseURL 的处理在拦截器中统一完成
    // 这样可以避免重复处理，确保 URL 处理的一致性
    const config: AxiosRequestConfig = {
      url: originalUrl, // 原始 URL，由拦截器处理
      method,
      data,
      params,
      headers: headers || {},
      timeout,
      // 如果提供了自定义 baseURL，传递给拦截器处理
      baseURL: customBaseURL,
      // 传递loading相关配置到拦截器（虽然目前不自动使用，但保留配置供未来扩展）
      showLoading,
      loadingTarget,
      loadingText,
    };

    // 错误已经在响应拦截器中处理，这里直接返回结果
    return await axiosInstance.request(config);
  };
}

/**
 * 默认的 request 实例（延迟初始化，避免循环依赖和初始化顺序问题）
 */
let _requestInstance: Request | null = null;

function getRequest(): Request {
  if (!_requestInstance) {
    _requestInstance = createRequest();
  }
  return _requestInstance;
}

export const request: Request = ((options: RequestOptions) => {
  return getRequest()(options);
}) as Request;

/**
 * 创建带权限检查的 request 函数
 * @param permissions 权限映射
 * @param baseURL 基础 URL
 * @returns 带权限检查的 Request 函数
 */
export function createRequestWithPermission(
  permissions: Record<string, boolean> = {},
  baseURL = '/api'
): Request {
  const baseRequest = createRequest(baseURL);

  return async (options: RequestOptions): Promise<any> => {
    // 检查权限（如果有权限标识）
    const permissionKey = options.permission;
    if (permissionKey && permissions[permissionKey] === false) {
      throw new Error('Permission denied');
    }

    return baseRequest(options);
  };
}

/**
 * HTTP 请求工具 - 简化版本
 * 主要用于 DevTools 等工具，主应用本身不直接使用 HTTP 请求
 */
;

import axios from 'axios';
// @ts-expect-error - axios 类型定义可能有问题，但运行时可用
import type { AxiosRequestConfig } from 'axios';
import { responseInterceptor, storage } from '@btc/shared-utils';
import { sessionStorage } from '@btc/shared-core/utils/storage/session';
import { processURL } from '@btc/shared-core';
import { getCookie, setCookie, getCookieDomain } from '@btc/shared-core/utils/cookie';
import { syncSettingsToCookie } from '@btc/shared-core/utils/storage/cross-domain';
import { appStorage } from './app-storage';
import { config } from '../config';

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
        // 清理 storage 中的 HTTP URL
        storage.remove('dev_api_base_url');
      } else if (baseURL && baseURL !== '/api') {
        // HTTPS 页面下，如果不是 /api，也强制使用 /api
        console.warn('[HTTP] 构造函数：检测到 HTTPS 页面，强制使用 /api 代理，忽略 baseURL:', baseURL);
        baseURL = '/api';
      }
    }

    this.baseURL = baseURL || config.api.baseURL;

    // 创建 axios 实例
    // @ts-expect-error - axios.create 类型定义可能有问题，但运行时可用
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 120000, // 增加到 120 秒（2分钟），避免长时间请求超时
      withCredentials: true, // 始终设置为 true，发送 cookie
    });

    // 强制设置 baseURL（确保是验证后的值）
    this.axiosInstance.defaults.baseURL = this.baseURL;

    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
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
          this.axiosInstance.defaults.baseURL = '/api';

          // 处理 URL（移除 /api 前缀，避免重复拼接）
          if (config.url) {
            const processed = processURL('/api', config.url);
            config.url = processed.url;
            // 确保 baseURL 是 /api
            config.baseURL = '/api';
          }

          // 最终验证：确保 baseURL 不是 HTTP
          if (config.baseURL && config.baseURL.startsWith('http://')) {
            console.error('[HTTP] 严重错误：HTTPS 页面下 baseURL 仍然是 HTTP URL，强制修复为 /api');
            config.baseURL = '/api';
            this.axiosInstance.defaults.baseURL = '/api';
          }

          return config;
        }

        // 开发环境（HTTP）：正常处理
        // 动态更新 baseURL（支持运行时切换环境）
        const dynamicBaseURL = getDynamicBaseURL();

        // 处理 URL 和 baseURL（避免重复拼接 /api）
        if (config.url) {
          const processed = processURL(dynamicBaseURL, config.url);
          config.url = processed.url;
          config.baseURL = processed.baseURL;
        } else {
          config.baseURL = dynamicBaseURL;
        }

        this.axiosInstance.defaults.baseURL = config.baseURL;

        // 直接从 cookie 获取 token（字段名：access_token）
        // 注意：HttpOnly cookie 无法通过 JavaScript 读取，但浏览器会自动在请求中发送
        const token = getCookie('access_token');

        // 如果有 token，设置 Authorization header
        // 即使 cookie 是 HttpOnly 的，浏览器也会自动发送 cookie，但设置 Authorization header 可以确保兼容性
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        // 始终设置 withCredentials 为 true，发送 cookie
        config.withCredentials = true;

        // 统一使用 /api 代理，始终是同源请求，可以发送 X-Tenant-Id
        config.headers['X-Tenant-Id'] = 'INTRA_1758330466';

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
    // 注意：如果出现 "Cannot access 'responseInterceptor' before initialization" 错误，
    // 这是因为模块加载顺序问题。确保 @btc/shared-utils 在使用前已完全加载。
    const interceptor = responseInterceptor.createResponseInterceptor();

    const onFulfilled = (response: any) => {
      // 检查是否是登录接口的响应（必须是 /base/open/login，避免误判其他接口）
      const url = response.config?.url || '';
      const isLoginResponse = url.includes('/base/open/login') || url.endsWith('/login');

      const result = interceptor.onFulfilled(response);

      // 如果是登录响应，尝试从响应中提取 token 并保存
      if (isLoginResponse) {
        // 保存原始响应数据，因为拦截器可能会修改
        const originalResponseData = response.data;

        // 检查响应是否成功（code: 200）
        // 后端返回格式：{"code":200,"msg":"成功","total":0}
        const isLoginSuccess = originalResponseData &&
                               typeof originalResponseData === 'object' &&
                               originalResponseData.code === 200;

        if (isLoginSuccess) {
          // 登录成功，设置登录状态标记到统一的 settings 存储中
          // 关键：直接使用 storage.get 和 syncSettingsToCookie，避免触发存储有效性检查
          // 因为登录成功后，profile 信息是异步加载的（延迟 500ms），需要给足够的时间
          try {
            // 直接读取 settings，不通过 appStorage.settings.get()，避免触发存储有效性检查
            const currentSettings = (storage.get('settings') as Record<string, any>) || {};
            // 设置 is_logged_in 标记
            const updatedSettings = { ...currentSettings, is_logged_in: true };
            // 直接同步到 Cookie，不触发存储有效性检查
            syncSettingsToCookie(updatedSettings);
          } catch (error) {
            // 如果设置失败，使用 appStorage（回退方案）
            const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
            appStorage.settings.set({ ...currentSettings, is_logged_in: true });
          }
          
          // 记录登录时间，用于存储有效性检查的宽限期
          try {
            import('@btc/shared-core/utils/storage-validity-check').then(({ recordLoginTime }) => {
              recordLoginTime();
            }).catch(() => {
              // 静默失败，不影响登录流程
            });
          } catch (error) {
            // 静默失败，不影响登录流程
          }

          // 关键：登录成功后，清除 sessionStorage 中的旧轮询状态
          // 这样启动轮询时会立即调用一次 user-check，获取最新的剩余时间
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.remove('__btc_user_check_polling_state');
            } catch (error) {
              // 静默失败，不影响登录流程
            }
          }

          // 启动全局用户检查轮询（登录后强制立即检查，获取最新的剩余时间）
          try {
            import('@btc/shared-core/composables/user-check').then(({ startUserCheckPolling }) => {
              startUserCheckPolling(true);
            }).catch((error) => {
              // 如果导入失败，静默处理
              if (import.meta.env.DEV) {
                console.warn('[http] Failed to start user check polling after login:', error);
              }
            });
          } catch (error) {
            // 静默失败
          }

          // 关键：登录成功后，加载域列表数据并存储
          try {
            // 等待 EPS 服务就绪后再调用
            setTimeout(async () => {
              try {
                const { service } = await import('@services/eps');
                const { loadDomainListOnLogin } = await import('../utils/domain-cache');
                if (service && loadDomainListOnLogin) {
                  await loadDomainListOnLogin(service);
                }
              } catch (error) {
                // 静默失败，不影响登录流程
                if (import.meta.env.DEV) {
                  console.warn('[http] Failed to load domain list after login:', error);
                }
              }
            }, 500); // 延迟 500ms 确保 EPS 服务已初始化
          } catch (error) {
            // 静默失败
          }

          // 关键：登录成功后，加载个人信息数据并存储
          try {
            // 等待 EPS 服务就绪后再调用
            setTimeout(async () => {
              try {
                const { service } = await import('@services/eps');
                const { loadProfileInfoOnLogin } = await import('@btc/shared-core');
                if (service && loadProfileInfoOnLogin) {
                  await loadProfileInfoOnLogin(service);
                }
              } catch (error) {
                // 静默失败，不影响登录流程
              }
            }, 500); // 延迟 500ms 确保 EPS 服务已初始化
          } catch (error) {
            // 静默失败
          }

          // 关键：登录成功后，广播登录消息到所有标签页
          try {
            import('@btc/shared-core/composables/useCrossDomainBridge').then(({ broadcastLoginMessage }) => {
              broadcastLoginMessage();
            }).catch((error) => {
              // 如果导入失败，静默处理
              if (import.meta.env.DEV) {
                console.warn('[http] Failed to broadcast login message:', error);
              }
            });
          } catch (error) {
            // 静默失败
          }

          // 从响应体中提取 token（代理已经添加到响应体中）
          // 注意：originalResponseData 是 response.data，包含完整的响应结构
          // result 是经过 responseInterceptor 处理后的数据，可能只包含 data 字段
          let tokenFromBody: string | null = null;

          // 优先检查原始响应数据（代理添加的 token 在这里）
          if (originalResponseData) {
            tokenFromBody = originalResponseData.token ||
                          originalResponseData.accessToken;
          }

          // 如果原始响应数据中没有，检查拦截器处理后的结果
          if (!tokenFromBody && result) {
            // result 可能是处理后的数据，也可能还是完整的响应对象
            if (typeof result === 'object' && result !== null) {
              tokenFromBody = result.token ||
                            result.accessToken;
            }
          }

          // 如果从响应体中找到了 token，设置到 cookie（不再保存到 localStorage）
          if (tokenFromBody) {
            // 清理旧的 localStorage 键（迁移）
            appStorage.auth.setToken(tokenFromBody);

            // 关键：手动设置 cookie（因为后端需要从 cookie 中读取 token）
            const isHttps = window.location.protocol === 'https:';

            // 在 IP 地址环境下，不设置 SameSite（让浏览器使用默认值）
            // 在 HTTPS 环境下，使用 SameSite=None
            const domain = getCookieDomain();
            setCookie('access_token', tokenFromBody, 7, {
              ...(isHttps && { sameSite: 'None' as const }), // IP 地址 + HTTP：不设置 SameSite
              secure: isHttps, // 仅在 HTTPS 时设置 Secure
              path: '/',
              ...(domain !== undefined && { domain }), // 生产环境支持跨子域名共享
            });
          }
        }
      }

      return result;
    };

    const onRejected = async (error: any) => {
      return interceptor.onRejected(error);
    };

    this.axiosInstance.interceptors.response.use(
      onFulfilled,
      onRejected
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

  /**
   * 动态修改 baseURL（用于开发环境切换 API 服务器）
   * 注意：在开发环境中，可以直接使用完整 URL 或 /api 路径
   * 但在 HTTPS 页面下，强制使用 /api，不允许 HTTP URL
   */
  setBaseURL(baseURL: string) {
    // 强制验证：在 HTTPS 页面下，baseURL 不能是 HTTP URL
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      if (baseURL.startsWith('http://')) {
        console.warn('[HTTP] 检测到 HTTPS 页面，强制使用 /api 代理，忽略 HTTP baseURL:', baseURL);
        baseURL = '/api';
        // 清理 storage 中的 HTTP URL
        storage.remove('dev_api_base_url');
      } else if (baseURL !== '/api') {
        // HTTPS 页面下，如果不是 /api，也强制使用 /api
        console.warn('[HTTP] 检测到 HTTPS 页面，强制使用 /api 代理，忽略 baseURL:', baseURL);
        baseURL = '/api';
      }
    }

    this.baseURL = baseURL;
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  /**
   * 获取当前的 baseURL
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}

/**
 * 获取 baseURL：统一使用 /api，通过代理转发到后端
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
  return config.api.baseURL;
}

// 获取初始 baseURL
function getInitialBaseURL(): string {
  const baseURL = getDynamicBaseURL();

  // 最终验证：在 HTTPS 页面下，绝对不允许 HTTP URL
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (baseURL.startsWith('http://')) {
      console.error('[HTTP] 初始化：检测到 HTTPS 页面，强制修复 HTTP baseURL:', baseURL);
      return '/api';
    }
    if (baseURL && baseURL !== '/api') {
      console.warn('[HTTP] 初始化：检测到 HTTPS 页面，强制使用 /api，忽略 baseURL:', baseURL);
      return '/api';
    }
  }

  return baseURL;
}

// 延迟初始化 http 实例，确保 responseInterceptor 已初始化
// 使用 getter 函数延迟实例化，避免模块加载时的初始化顺序问题
let _httpInstance: Http | null = null;

function createHttpInstance(): Http {
  if (!_httpInstance) {
    _httpInstance = new Http(getInitialBaseURL());
  }
  return _httpInstance;
}

// 使用 getter 延迟初始化，确保 responseInterceptor 在使用前已初始化
// 这可以解决打包工具代码分割导致的初始化顺序问题
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


;
import axios from 'axios';
// @ts-expect-error - axios 类型定义可能有问题，但运行时可用
import type { AxiosRequestConfig } from 'axios';
import { responseInterceptor } from '@btc/shared-utils';
import { requestLogger } from './request-logger';
import { createHttpRetry, RETRY_CONFIGS } from '@/composables/useRetry';
import { getCookie, logger } from '@btc/shared-core/utils/cookie';
import { appStorage } from './app-storage';
import { config } from '../config';

/**
 * HTTP 请求工具 - 基于 axios，参考 cool-admin 的实现
 */
export class Http {
  public baseURL: string;
  private axiosInstance: any;
  private retryManager: ReturnType<typeof createHttpRetry>;

  constructor(baseURL = config.api.baseURL) {
    this.baseURL = baseURL || config.api.baseURL;

    // 创建重试管理器
    this.retryManager = createHttpRetry(RETRY_CONFIGS.standard);

    // 创建 axios 实例
    // @ts-expect-error - axios.create 类型定义可能有问题，但运行时可用
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 120000, // 增加到 120 秒（2分钟），避免长时间请求超时
      withCredentials: true, // 启用 cookie 支持
    });


    // 强制设置 baseURL（防止 axios 实例创建时丢失）
    this.axiosInstance.defaults.baseURL = this.baseURL;

    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        // 优先从 cookie 获取 token（字段名：access_token），如果没有则从统一存储获取
        // 注意：HttpOnly cookie 无法通过 JavaScript 读取，但浏览器会自动在请求中发送
        const cookieToken = getCookie('access_token');
        const storageToken = appStorage.auth.getToken();
        const token = cookieToken || storageToken || '';
        
        // 调试日志（仅在开发/预览环境）
        if (import.meta.env.DEV || window.location.port.startsWith('41')) {
          if (!token && config.url?.includes('/api/')) {
            console.warn(`[HTTP] 请求 ${config.url} 没有 token:`, {
              hasCookieToken: !!cookieToken,
              hasStorageToken: !!storageToken,
              cookies: document.cookie.split(';').map(c => c.trim()),
            });
          }
        }
        
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        // 确保 withCredentials 设置为 true（覆盖任何可能的配置覆盖）
        config.withCredentials = true;

        // 添加租户ID请求头
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

        // 如果是 FormData，不设置 Content-Type，让浏览器自动设置
        // 否则设置为 application/json
        const isFormData = config.data instanceof FormData || (config.data && config.data.constructor?.name === 'FormData');
        if (!isFormData) {
        config.headers['Content-Type'] = 'application/json';
        } else {
          // FormData 上传时，删除 Content-Type，让浏览器自动设置（包括 boundary）
          delete config.headers['Content-Type'];
        }

        // 记录请求开始时间，用于计算耗时
        config.metadata = { startTime: Date.now() };

        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器会自动使用 messageManager，不需要设置 messageHandler

    // 响应拦截器 - 使用新的响应拦截工具
    const interceptor = responseInterceptor.createResponseInterceptor();

    // 包装响应拦截器，添加请求日志记录和 token 刷新逻辑
    const onFulfilled = (response: any) => {
      // 检查是否是登录接口的响应
      const isLoginResponse = response.config?.url?.includes('/login');
      
      this.recordRequestLog(response, 'success');
      const result = interceptor.onFulfilled(response);
      
      // 如果是登录响应，尝试从响应中提取 token 并保存
      if (isLoginResponse) {
        // 保存原始响应数据，因为拦截器可能会修改
        const originalResponseData = response.data;

        // 检查响应是否成功（code: 200）
        const isLoginSuccess = originalResponseData &&
                               typeof originalResponseData === 'object' &&
                               originalResponseData.code === 200;

        if (isLoginSuccess) {
          // 登录成功，设置登录状态标记到统一的 settings 存储中
          const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
          appStorage.settings.set({ ...currentSettings, is_logged_in: true });
          
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

          // 启动全局用户检查轮询（登录后强制立即检查，获取最新的剩余时间）
          try {
            import('@btc/shared-core/composables/user-check').then(({ startUserCheckPolling }) => {
              startUserCheckPolling(true);
            }).catch((error) => {
              if (import.meta.env.DEV) {
                console.warn('[http] Failed to start user check polling after login:', error);
              }
            });
          } catch (error) {
            // 静默失败
          }

          // 关键：登录成功后，广播登录消息到所有标签页
          try {
            import('@btc/shared-core/composables/useCrossDomainBridge').then(({ useCrossDomainBridge }) => {
              const bridge = useCrossDomainBridge();
              bridge.sendMessage('login', { timestamp: Date.now() });
            }).catch((error) => {
              if (import.meta.env.DEV) {
                console.warn('[http] Failed to broadcast login message:', error);
              }
            });
          } catch (error) {
            // 静默失败
          }
        }
        
        // 检查 Set-Cookie headers，尝试从 cookie 字符串中提取 token 值
        const setCookieHeaders = response.headers?.getSetCookie?.() || [];
        if (setCookieHeaders.length > 0) {
          // 查找包含 access_token 的 cookie
          const accessTokenCookie = setCookieHeaders.find((cookie: string) => 
            cookie.includes('access_token')
          );
          if (accessTokenCookie) {
            // 尝试从 cookie 字符串中提取 token 值（仅用于调试，实际可能是 HttpOnly）
            const tokenMatch = accessTokenCookie.match(/access_token=([^;]+)/);
            if (tokenMatch && tokenMatch[1]) {
              const extractedToken = tokenMatch[1];
              // 保存到统一存储作为备份（即使 cookie 无法发送，也能用 Authorization header）
              appStorage.auth.setToken(extractedToken);
            }
          }
        }
        
        // 延迟检查 cookie（等待浏览器设置完成）
        setTimeout(() => {
          const token = getCookie('access_token') || appStorage.auth.getToken();
          if (!token) {
            // 尝试从原始响应数据中提取 token（可能在不同层级）
            let tokenValue: string | null = null;
            
            // 检查原始响应数据
            if (originalResponseData) {
              tokenValue = originalResponseData.token || 
                          originalResponseData.accessToken ||
                          originalResponseData.data?.token ||
                          originalResponseData.data?.accessToken ||
                          originalResponseData.data?.data?.token;
            }
            
            // 检查拦截器处理后的结果
            if (!tokenValue && result) {
              tokenValue = result.token || 
                          result.accessToken ||
                          result.data?.token ||
                          result.data?.accessToken;
            }
            
            if (tokenValue) {
              appStorage.auth.setToken(tokenValue);
            }
          }
        }, 100);
      }
      
      return result;
    };

    const onRejected = async (error: any) => {
      // 所有错误统一处理，由响应拦截器处理错误（包括401会跳转登录页）
      this.recordRequestLog(error.response || { config: error.config }, 'failed');
      return interceptor.onRejected(error);
    };

    this.axiosInstance.interceptors.response.use(
      onFulfilled,
      onRejected
    );
  }

  /**
   * 限制对象大小，防止过大的数据导致问题
   */
  private limitObjectSize(obj: any, maxDepth: number, maxSize: number): any {
    if (maxDepth <= 0 || maxSize <= 0) {
      return '[数据过大，已截断]';
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return obj.length > maxSize ? obj.substring(0, maxSize) + '...' : obj;
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (Array.isArray(obj)) {
      const limitedArray: any[] = [];
      let currentSize = 0;
      for (let i = 0; i < obj.length && currentSize < maxSize; i++) {
        const limitedItem = this.limitObjectSize(obj[i], maxDepth - 1, maxSize - currentSize);
        limitedArray.push(limitedItem);
        currentSize += JSON.stringify(limitedItem).length;
      }
      return limitedArray;
    }

    if (typeof obj === 'object') {
      const limitedObj: any = {};
      let currentSize = 0;
      for (const key in obj) {
        if (currentSize >= maxSize) {
          limitedObj['...'] = '[更多数据已截断]';
          break;
        }
        const limitedValue = this.limitObjectSize(obj[key], maxDepth - 1, maxSize - currentSize);
        limitedObj[key] = limitedValue;
        currentSize += JSON.stringify(limitedValue).length;
      }
      return limitedObj;
    }

    return obj;
  }

  /**
   * 记录请求日志
   */
  private recordRequestLog(response: any, status: 'success' | 'failed') {
    try {
      const config = response?.config || {};
      
      // 检查用户是否已登录，未登录时不记录日志
      const token = getCookie('access_token') || appStorage.auth.getToken() || '';
      if (!token) {
        return; // 未登录用户不记录请求日志
      }

      // 获取用户信息
      let userId: number | undefined;
      let userName: string | undefined;
      try {
        const user = appStorage.user.get();
        if (user) {
          userId = user?.id;
          userName = user?.name || user?.username;
        }
      } catch (err) {
        // 获取用户信息失败，仍然记录日志但不包含用户信息
        console.warn('获取用户信息失败:', err);
      }

      // 如果没有用户ID，说明未登录或用户信息不完整，不记录日志
      if (!userId) {
        return;
      }

      // 过滤不需要记录的接口（登录、验证码等公开接口）
      const url = config.url || '';
      const filteredPaths = [
        '/login',
        '/register',
        '/captcha',
        '/code/sms/send',
        '/code/email/send',
        '/refresh/access-token',
        '/logout',
        '/api/system/log/sys/request/update',
        '/api/system/log/sys/operation/update'
      ];
      
      if (filteredPaths.some(path => url.includes(path))) {
        return; // 跳过这些接口的日志记录
      }

      const startTime = config.metadata?.startTime || Date.now();
      const duration = Date.now() - startTime;

      // 处理请求参数，确保是对象格式而不是字符串
      let params = {};
      if (config.method === 'GET') {
        // GET请求的参数
        params = config.params || {};
      } else {
        // POST/PUT/DELETE请求的数据
        if (typeof config.data === 'string') {
          try {
            // 限制字符串长度，避免过长的数据
            const dataStr = config.data.length > 10000 ? config.data.substring(0, 10000) + '...' : config.data;
            // 如果是JSON字符串，尝试解析
            params = JSON.parse(dataStr);
          } catch {
            // 解析失败，使用原始字符串（截断）
            const dataStr = config.data.length > 1000 ? config.data.substring(0, 1000) + '...' : config.data;
            params = { raw: dataStr };
          }
        } else {
          // 已经是对象格式，限制深度和大小
          params = this.limitObjectSize(config.data || {}, 5, 10000);
        }
      }

      // 记录请求日志
      requestLogger.add({
        userId,
        username: userName || '',
        requestUrl: config.url || '',
        params, // 传入对象格式，在 add 方法中会被转换为 JSON 字符串
        ip: '', // 由后端从请求头中获取真实IP
        duration,
        status,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any); // 使用 as any 避免类型检查，因为 params 在 add 方法中会被处理
    } catch (error) {
      // 日志记录失败不应影响主业务流程
      logger.error('记录请求日志失败:', error);
    }
  }

  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    return this.retryManager.retryRequest(
      () => this.axiosInstance.get(url, { params }),
      RETRY_CONFIGS.fast
    );
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return this.retryManager.retryRequest(
      () => this.axiosInstance.post(url, data),
      RETRY_CONFIGS.standard
    );
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    return this.retryManager.retryRequest(
      () => this.axiosInstance.put(url, data),
      RETRY_CONFIGS.standard
    );
  }

  async delete<T = any>(url: string, data?: any): Promise<T> {
    return this.retryManager.retryRequest(
      () => this.axiosInstance.delete(url, { data }),
      RETRY_CONFIGS.standard
    );
  }

  async request<T = any>(options: AxiosRequestConfig): Promise<T> {
    return this.retryManager.retryRequest(
      () => this.axiosInstance.request(options),
      RETRY_CONFIGS.standard
    );
  }

  // 检查拦截器状态的方法
  checkInterceptors() {
  }

  /**
   * 获取重试状态
   */
  getRetryStatus() {
    return this.retryManager.getStatus();
  }

  /**
   * 重置重试状态
   */
  resetRetry() {
    this.retryManager.reset();
  }

  // 测试响应拦截器的方法
  testResponseInterceptor() {
    // @ts-expect-error: 测试方法，未使用变量
    const interceptor = responseInterceptor.createResponseInterceptor();


    // 模拟一个成功的响应
    // @ts-expect-error: 测试方法，未使用变量
    const mockResponse = {
      data: { code: 200, msg: '测试消息', data: null },
      status: 200,
      config: { url: '/test' }
    };


    try {
      // const result = interceptor.onFulfilled(mockResponse); // 未使用
    } catch (_error) {
      // Interceptor error
    }
  }

  // 检查是否为真正的成功响应
  private isRealSuccessResponse(code: number, msg?: string): boolean {
    // 明确的成功状态码
    if (code === 2000 || code === 1000) {
      return true;
    }

    // 对于 code: 200，需要检查消息内容
    if (code === 200) {
      // 如果没有消息，认为是成功
      if (!msg) {
        return true;
      }

      // 检查消息是否包含错误关键词
      const errorKeywords = [
        '不存在',
        '错误',
        '失败',
        '异常',
        '无效',
        '过期',
        '拒绝',
        '禁止',
        '未找到',
        '无法',
        '不能',
        '缺少',
        '不足'
      ];

      // 如果消息包含错误关键词，认为是错误响应
      const hasErrorKeyword = errorKeywords.some(keyword =>
        msg.includes(keyword)
      );

      return !hasErrorKeyword;
    }

    // 其他状态码都不是成功
    return false;
  }

  // 重新创建响应拦截器的方法
  async recreateResponseInterceptor() {
    // 清除现有的响应拦截器
    this.axiosInstance.interceptors.response.clear();

    // 直接创建新的响应拦截器（绕过模块缓存）
    const interceptor = {
      onFulfilled: (response: any) => {
        const { data, status } = response;

        // 如果响应数据为空，检查HTTP状态码
        if (!data) {
          // 对于404等错误状态码，即使没有响应体也要按错误处理
          if (status === 404) {
            const error = new Error('请求的资源不存在');
            (error as any).code = 404;
            (error as any).response = response;
            return Promise.reject(error);
          }
          // 其他空响应按成功处理
          return response;
        }

        // 检查是否为真正的成功响应
        const { code, msg } = data;
        if (code === undefined || code === null) {
          return data;
        }

        // 检查是否为真正的成功响应
        const isRealSuccess = this.isRealSuccessResponse(code, msg);
        if (isRealSuccess) {
          return data.data;
        }

        // 业务错误，抛出错误
        const error = new Error(msg || '未知错误');
        (error as any).code = code;
        (error as any).response = response;
        return Promise.reject(error);
      },

      onRejected: (error: any) => {
        // 检查是否是业务错误
        if (error.code && typeof error.code === 'number') {
          return Promise.reject(error);
        } else {
          return Promise.reject(error);
        }
      }
    };

    this.axiosInstance.interceptors.response.use(
      interceptor.onFulfilled,
      interceptor.onRejected
    );
  }
}

export const http = new Http(config.api.baseURL);


/**
 * 基础服务类 - 参考 cool-admin 的 BaseService
 */
export class BaseService {
  private namespace: string | undefined;
  private readonly httpClient: Http;

  constructor(namespace?: string, httpClient: Http = http) {
    this.httpClient = httpClient;
    this.namespace = namespace;
  }

  // 发送请求
  async request(options: AxiosRequestConfig = {}) {
    let url = options.url;

    if (url && url.indexOf('http') < 0) {
      if (this.namespace) {
        url = this.namespace + url;
      }
    }

    return this.httpClient.request({
      ...options,
      url
    });
  }

  // 获取列表
  async list(data: any) {
    return this.request({
      url: '/list',
      method: 'POST',
      data
    });
  }

  // 分页查询 - 使用 POST 请求
  async page(data: any) {
    return this.request({
      url: '/page',
      method: 'POST',
      data
    });
  }

  // 获取信息
  async info(params: any) {
    return this.request({
      url: '/info',
      method: 'GET',
      params
    });
  }

  // 更新数据
  async update(data: any) {
    return this.request({
      url: '/update',
      method: 'POST',
      data
    });
  }

  // 删除数据
  async delete(data: any) {
    return this.request({
      url: '/delete',
      method: 'POST',
      data
    });
  }

  // 添加数据
  async add(data: any) {
    return this.request({
      url: '/add',
      method: 'POST',
      data
    });
  }
}

/**
 * 创建标准 CRUD 服务 - 参考 cool-admin 的模式
 */
export function createCrudService(resource: string) {
  const service = new BaseService(`/${resource}`);

  return {
    // 分页查询 - 使用 POST 请求，参数在请求体中
    page: async (params: any) => {
      // 转换参数格式，适配后端 API
      const requestData = {
        pageNumber: params.page || params.pageNumber || 1,
        pageSize: params.size || params.pageSize || 20,
        keyword: params.keyword || params.keyWord,
        ...params // 包含其他参数如 departmentIds 等
      };

      const response = await service.page(requestData);

      // 转换响应格式，适配前端 CRUD 组件
      return {
        list: response.records || response.list || [],
        total: response.totalRow || response.total || 0,
        pageNumber: response.pageNumber || requestData.pageNumber,
        pageSize: response.pageSize || requestData.pageSize,
        totalPage: response.totalPage || Math.ceil((response.totalRow || response.total || 0) / requestData.pageSize)
      };
    },

    // 获取列表
    list: async (params?: any) => {
      return service.list(params || {});
    },

    // 获取详情
    info: async (params: any) => {
      return service.info(params);
    },

    // 添加数据
    add: async (data: any) => {
      return service.add(data);
    },

    // 更新数据
    update: async (data: any) => {
      return service.update(data);
    },

    // 删除数据
    delete: async (data: { ids: (string | number)[] }) => {
      return service.delete(data);
    }
  };
}

/**
 * 创建模拟 CRUD 服务 - 用于开发测试
 */
export function createMockCrudService(_resource: string) {
  return {
    // 分页查询
    page: async (params: any) => {
      return {
        list: [],
        total: 0,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 20,
        totalPage: 0
      };
    },

    // 获取列表
    list: async (_params?: any) => {
      return [];
    },

    // 获取详情
    info: async (_params: any) => {
      return {};
    },

    // 添加数据
    add: async (_data: any) => {
      // 不返回任何值，符合 CrudService 的 void 返回类型
    },

    // 更新数据
    update: async (_data: any) => {
      // 不返回任何值，符合 CrudService 的 void 返回类型
    },

    // 删除数据
    delete: async (_ids: (string | number)[]) => {
      // 不返回任何值，符合 CrudService 的 void 返回类型
    }
  };
}


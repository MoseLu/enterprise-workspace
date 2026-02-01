/**
 * BTC Shop Flow 3.0 响应拦截器工具
 * 根据项目响应状态码文档实现统一的响应处理
 */

// messageManager 现在由外部提供，不再从本地导入

// 导入 Zod 验证工具（可选）
import { createApiResponseSchema, safeValidateResponse } from './schemas';
import { z } from 'zod';
import { logger } from '../logger/index';
;

// 消息显示接口，由外部实现
export interface MessageHandler {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

// 确认对话框接口，由外部实现
export interface ConfirmHandler {
  confirm: (message: string, title?: string) => Promise<boolean>;
}

// 路由跳转接口，由外部实现
export interface RouterHandler {
  push: (path: string) => void;
}

// 响应数据结构
// 注意：类型定义保留以保持向后兼容，实际类型可以从 Zod schema 推断
// @see packages/shared-core/src/utils/http/schemas.ts
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
  total?: number;
  token?: string;
}

// 状态码处理配置
interface StatusCodeConfig {
  code: number;
  message: string;
  action: 'show' | 'redirect' | 'silent' | 'confirm';
  redirectPath?: string;
  showType?: 'error' | 'warning' | 'success' | 'info';
}

// 状态码配置映射
const STATUS_CODE_CONFIG: Record<number, StatusCodeConfig> = {
  // 成功状态码
  200: {
    code: 200,
    message: '操作成功',
    action: 'silent',
    showType: 'success',
  },

  // 通用错误状态码
  400: {
    code: 400,
    message: '操作失败',
    action: 'show',
    showType: 'error',
  },
  500: {
    code: 500,
    message: '操作失败',
    action: 'show',
    showType: 'error',
  },
  501: {
    code: 501,
    message: '系统繁忙，请稍候再试',
    action: 'show',
    showType: 'error',
  },

  // 认证相关状态码
  401: {
    code: 401,
    message: '身份已过期，请重新登录',
    action: 'redirect',
    redirectPath: '/login',
    showType: 'warning',
  },
  410: {
    code: 410,
    message: '该用户不存在,请先注册',
    action: 'show',
    showType: 'error',
  },
  511: {
    code: 511,
    message: '登录失败，未获取到令牌',
    action: 'show',
    showType: 'error',
  },
  517: {
    code: 517,
    message: '身份令牌已过期',
    action: 'redirect',
    redirectPath: '/login',
    showType: 'warning',
  },
  518: {
    code: 518,
    message: '获取到的身份令牌为空',
    action: 'redirect',
    redirectPath: '/login',
    showType: 'warning',
  },

  // 数据相关状态码
  510: {
    code: 510,
    message: '数据为空',
    action: 'show',
    showType: 'warning',
  },
  522: {
    code: 522,
    message: '参数不能为空',
    action: 'show',
    showType: 'error',
  },
  523: {
    code: 523,
    message: '数据错误',
    action: 'show',
    showType: 'error',
  },

  // 用户管理相关状态码
  520: {
    code: 520,
    message: '没有该工号',
    action: 'show',
    showType: 'error',
  },
  521: {
    code: 521,
    message: '初始密码错误',
    action: 'show',
    showType: 'error',
  },
  524: {
    code: 524,
    message: '账号已存在',
    action: 'show',
    showType: 'error',
  },
  526: {
    code: 526,
    message: '表单id过期',
    action: 'show',
    showType: 'error',
  },
  527: {
    code: 527,
    message: '手机号不存在',
    action: 'show',
    showType: 'error',
  },
  529: {
    code: 529,
    message: '邮箱不存在',
    action: 'show',
    showType: 'error',
  },

  // 验证码相关状态码
  528: {
    code: 528,
    message: '验证码已过期',
    action: 'show',
    showType: 'error',
  },
  532: {
    code: 532,
    message: '验证码校验失败',
    action: 'show',
    showType: 'error',
  },

  // Keycloak相关状态码
  512: {
    code: 512,
    message: 'keycloak客户端地址错误',
    action: 'show',
    showType: 'error',
  },
  513: {
    code: 513,
    message: '获取领域失败',
    action: 'show',
    showType: 'error',
  },
  514: {
    code: 514,
    message: '获取客户端id失败',
    action: 'show',
    showType: 'error',
  },
  515: {
    code: 515,
    message: '获取客户端密钥失败',
    action: 'show',
    showType: 'error',
  },
  516: {
    code: 516,
    message: '连接keycloak失败',
    action: 'show',
    showType: 'error',
  },
};

/**
 * 响应拦截器类
 */
export class ResponseInterceptor {
  private messageHandler?: MessageHandler;
  private confirmHandler?: ConfirmHandler;
  private routerHandler?: RouterHandler;
  // 防重复显示：记录最近显示的错误消息和时间戳
  private lastErrorMessage: string | null = null;
  private lastErrorTime: number = 0;
  private readonly ERROR_DEBOUNCE_TIME = 2000; // 2秒内相同错误只显示一次

  constructor() {
    // 延迟设置处理器，避免循环依赖
    // 使用 delete 而不是赋值 undefined，以符合 exactOptionalPropertyTypes
  }


  /**
   * 设置消息处理器
   */
  setMessageHandler(handler: MessageHandler) {
    this.messageHandler = handler;
  }

  /**
   * 设置确认对话框处理器
   */
  setConfirmHandler(handler: ConfirmHandler) {
    this.confirmHandler = handler;
  }

  /**
   * 设置路由处理器
   */
  setRouterHandler(handler: RouterHandler) {
    this.routerHandler = handler;
  }

  /**
   * 处理成功响应
   * @param response API 响应数据
   * @param responseSchema 可选的 Zod schema，用于验证响应结构
   */
  handleSuccess<T>(
    response: ApiResponse<T>,
    responseSchema?: z.ZodType<ApiResponse<T>>
  ): T | ApiResponse<T> | Promise<never> {
    const { code, data, msg } = response;

    // 开发和生产环境：如果提供了 schema，进行验证
    if (responseSchema) {
      const validation = safeValidateResponse(responseSchema, response);
      if (!validation.success) {
        // TypeScript 类型守卫：在 !validation.success 分支中，validation 一定是 { success: false; error: ... }
        const error = (validation as { success: false; error: z.ZodError }).error;
        const errorMessage = `[HTTP响应验证] 响应数据不符合预期格式: ${error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
        
        if (import.meta.env.DEV) {
          console.warn(errorMessage, {
            errors: error.errors,
            response,
          });
        } else {
          // 生产环境：记录警告并上报
          console.warn(errorMessage);
          // 上报验证失败（异步，不阻塞）
          import('../zod/reporting').then(({ reportValidationError }) => {
            // 构建上下文对象，只在属性存在时才添加（避免 undefined，符合 exactOptionalPropertyTypes）
            const errorContext: {
              url?: string;
            } = {};
            if (typeof window !== 'undefined' && window.location.href) {
              errorContext.url = window.location.href;
            }
            
            reportValidationError(
              'api-response',
              'ApiResponse',
              error,
              errorContext
            );
          }).catch(() => {
            // 如果导入失败，静默跳过
          });
        }
        // 验证失败不中断流程，继续处理
      }
    }

    // 如果没有 code 字段，直接返回原始数据
    if (code === undefined || code === null) {
      return response;
    }

    // 检查是否为真正的成功响应
    // 即使 code 是 200，如果消息包含错误信息，也应该按错误处理
    const isRealSuccess = this.isRealSuccessResponse(code, msg);

    if (isRealSuccess) {
      // 返回 data 字段（实际业务数据）
      // 如果 data 本身是对象且包含 data 字段，进一步提取
      if (data && typeof data === 'object' && 'data' in data && !Array.isArray(data)) {
        const nestedData = (data as any).data;
        return nestedData;
      }
      return data;
    }

    // 其他情况按错误处理
    return this.handleError({ code, message: msg || '未知错误' });
  }

  /**
   * 判断是否为真正的成功响应
   */
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

  /**
   * 检查是否在登录页
   */
  private isLoginPage(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    const pathname = window.location.pathname;
    return pathname === '/login' || pathname.startsWith('/login?');
  }

  /**
   * 处理错误响应
   */
  handleError(error: { code: number; message: string }): Promise<never> {
    const { code, message } = error;

    // 特殊处理：当 code 为 501 且消息为"系统繁忙，请稍候再试"时，显示自定义消息
    if (code === 501 && message === '系统繁忙，请稍候再试') {
      if (this.messageHandler) {
        this.messageHandler.error('数据暂时无法获取，请联系管理员Jarvis');
      } else {
        // 如果 messageHandler 未设置，尝试使用全局消息处理器
        const globalMessageHandler = (window as any).__APP_MESSAGE_HANDLER__;
        if (globalMessageHandler && globalMessageHandler.error) {
          globalMessageHandler.error('数据暂时无法获取，请联系管理员Jarvis');
        } else {
          // 最后的兜底：使用 logger.error
          logger.error('数据暂时无法获取，请联系管理员Jarvis');
        }
      }
      return Promise.reject(error);
    }

    // 获取状态码配置
    const config = STATUS_CODE_CONFIG[code];

    if (!config) {
      // 未知状态码，显示原始错误信息
      if (this.messageHandler) {
        this.messageHandler.error(message || '未知错误');
      }
      return Promise.reject(error);
    }

    // 使用配置中的消息或原始消息
    const errorMessage = config.message || message;

    // 特殊处理：如果在登录页，401错误不显示消息（用户已经在登录页，不需要再次提醒）
    const isOnLoginPage = this.isLoginPage();
    if (code === 401 && isOnLoginPage) {
      // 在登录页，静默处理401错误，不显示消息
      return Promise.reject(error);
    }

    // 防重复显示：检查是否是相同的错误消息且在防抖时间内
    const now = Date.now();
    const isDuplicateError = this.lastErrorMessage === errorMessage && 
                            (now - this.lastErrorTime) < this.ERROR_DEBOUNCE_TIME;
    
    if (isDuplicateError) {
      // 相同的错误在短时间内重复出现，不重复显示
      return Promise.reject(error);
    }

    // 记录错误消息和时间戳
    this.lastErrorMessage = errorMessage;
    this.lastErrorTime = now;

    // 根据配置执行相应操作
    switch (config.action) {
      case 'show': {
        // 使用消息处理器
        const showType = config.showType || 'error';
        if (this.messageHandler) {
          switch (showType) {
            case 'success':
              this.messageHandler.success(errorMessage);
              break;
            case 'warning':
              this.messageHandler.warning(errorMessage);
              break;
            case 'info':
              this.messageHandler.info(errorMessage);
              break;
            default:
              this.messageHandler.error(errorMessage);
          }
        }
        break;
      }

      case 'redirect': {
        // 已删除：禁用所有自动重定向逻辑，不再跳转到登录页
        // 使用消息处理器显示错误信息
        const redirectShowType = config.showType || 'warning';
        if (this.messageHandler) {
          switch (redirectShowType) {
            case 'success':
              this.messageHandler.success(errorMessage);
              break;
            case 'warning':
              this.messageHandler.warning(errorMessage);
              break;
            case 'info':
              this.messageHandler.info(errorMessage);
              break;
            default:
              this.messageHandler.error(errorMessage);
          }
        }

        // 已删除：不再执行自动重定向
        break;
      }

      case 'confirm':
        if (this.confirmHandler) {
          this.confirmHandler.confirm(errorMessage, '确认').then(() => {
            if (config.redirectPath && this.routerHandler) {
              this.routerHandler.push(config.redirectPath);
            }
          });
        }
        break;

      case 'silent':
        // 静默处理，不显示消息
        break;
    }

    return Promise.reject(error);
  }

  /**
   * 处理网络错误
   */
  handleNetworkError(error: any): Promise<never> {
    let message = '网络错误';
    let errorCode = 500;

    if (error.response) {
      const { status, data } = error.response;
      errorCode = status;

      // HTTP 状态码处理
      switch (status) {
        case 404:
          message = '请求的资源不存在';
          break;
        case 429:
          message = '请求过于频繁，请稍后重试';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = data?.msg || data?.message || `请求失败 (${status})`;
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络设置';
    } else {
      message = error.message || '请求配置错误';
    }

    // 使用消息处理器处理网络错误
    if (this.messageHandler) {
      this.messageHandler.error(message);
    }

    // 创建一个包含完整错误信息的错误对象
    const enhancedError = new Error(message);
    (enhancedError as any).code = errorCode;
    (enhancedError as any).response = error.response;
    (enhancedError as any).originalError = error;

    // 对于404等错误，返回rejected Promise让调用方能够处理
    return Promise.reject(enhancedError);
  }

  /**
   * 创建 axios 响应拦截器
   */
  createResponseInterceptor() {
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
          // 其他空响应按成功处理，返回 response.data（即 undefined 或 null）
          return data;
        }

        // 调用 handleSuccess 处理 response.data（业务响应数据）
        // handleSuccess 会提取出 data.data（实际业务数据）
        // 注意：handleSuccess 可能返回 Promise.reject，这会被 axios 正确处理
        // 开发环境：可选验证响应结构
        const result = this.handleSuccess(data);

        // 确保返回处理后的数据（response.data 经过 handleSuccess 处理后的结果）
        // 而不是原始响应对象（response）
        return result;
      },

      onRejected: (error: any) => {
        // 检查是否是业务错误
        if (error.code && typeof error.code === 'number') {
          return this.handleError(error);
        } else {
          // 网络错误
          return this.handleNetworkError(error);
        }
      },
    };

    return interceptor;
  }
}

// 创建全局实例
// 注意：必须在所有便捷方法之前声明，确保在使用前已完全初始化
export const responseInterceptor = new ResponseInterceptor();

// 便捷方法 - 使用函数内部访问，确保 responseInterceptor 已初始化
export function handleApiResponse<T>(
  response: ApiResponse<T>
): T | ApiResponse<T> | Promise<never> {
  return responseInterceptor.handleSuccess(response);
}

export function handleApiError(error: { code: number; message: string }): Promise<never> {
  return responseInterceptor.handleError(error);
}

export function handleNetworkError(error: any): void {
  responseInterceptor.handleNetworkError(error);
}

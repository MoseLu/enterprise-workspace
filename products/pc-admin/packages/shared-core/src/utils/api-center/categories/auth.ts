/**
 * 认证相关 API
 * 提供登录、注册、密码重置等认证相关的 API 调用方法
 */

import type { ApiClient } from '../types';
import type {
  LoginResponse,
  CaptchaResponse,
  UserCheckResponse,
  VerifyCodeRequest,
  LoginRequest,
  SmsLoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  LogoutBatchRequest,
  QrCodeResponse
} from '../types/auth';

/**
 * 创建认证 API 服务
 * @param apiClient API 客户端实例
 * @returns 认证 API 服务对象
 */
export function createAuthApi(apiClient: ApiClient) {
  return {
    /**
     * 获取验证码
     * @param params 验证码参数（高度、宽度、颜色等）
     * @returns 验证码信息（包含 captchaId 和图片数据）
     */
    getCaptcha(params?: { height?: number; width?: number; color?: string }): Promise<CaptchaResponse> {
      return apiClient.get<CaptchaResponse>('auth', '/captcha', params);
    },

    /**
     * 发送邮箱验证码
     * @param data 邮箱和验证码类型
     * @returns Promise<void>
     */
    sendEmailCode(data: { email: string; type?: string }): Promise<void> {
      return apiClient.post<void>('auth', '/code/email/send', data, { notifySuccess: false });
    },

    /**
     * 发送手机号验证码
     * @param data 手机号和验证码类型
     * @returns Promise<void>
     */
    sendSmsCode(data: { phone: string; smsType?: string }): Promise<void> {
      return apiClient.post<void>('auth', '/code/sms/send', data, { notifySuccess: false });
    },

    /**
     * 用户检查（检查用户登录状态，不属于 EPS 请求）
     * @returns 用户状态信息
     */
    userCheck(): Promise<UserCheckResponse> {
      return apiClient.get<UserCheckResponse>('auth', '/user-check');
    },

    /**
     * 登录（账号密码）
     * @param data 登录信息（用户名、密码、验证码等）
     * @returns 登录响应（包含 token 和用户信息）
     */
    login(data: LoginRequest): Promise<LoginResponse> {
      return apiClient.post<LoginResponse>('auth', '/login', data, { notifySuccess: false });
    },

    /**
     * 手机号登录
     * @param data 手机号和短信验证码
     * @returns 登录响应（包含 token 和用户信息）
     */
    loginBySms(data: SmsLoginRequest): Promise<LoginResponse> {
      return apiClient.post<LoginResponse>('auth', '/login/sms', data, { notifySuccess: false });
    },

    /**
     * 退出登录
     * @returns Promise<void>
     */
    logout(): Promise<void> {
      return apiClient.get<void>('auth', '/logout');
    },

    /**
     * 批量退出登录
     * @param data 用户ID列表
     * @returns Promise<void>
     */
    logoutBatch(data: LogoutBatchRequest): Promise<void> {
      return apiClient.post<void>('auth', '/logout/batch', data, { notifySuccess: false });
    },

    /**
     * 用户注册
     * @param data 注册信息（用户名、手机号、密码、验证码等）
     * @returns Promise<void>
     */
    register(data: RegisterRequest): Promise<void> {
      return apiClient.post<void>('auth', '/register', data, { notifySuccess: false });
    },

    /**
     * 重置密码
     * @param data 重置密码信息（手机号、验证码、新密码）
     * @returns Promise<void>
     */
    resetPassword(data: ResetPasswordRequest): Promise<void> {
      return apiClient.post<void>('auth', '/reset/password', data, { notifySuccess: false });
    },

    /**
     * 验证码校验
     * @param data 验证码ID和验证码值
     * @returns Promise<void>
     */
    verifyCode(data: VerifyCodeRequest): Promise<void> {
      return apiClient.post<void>('auth', '/verify/code', data, { notifySuccess: false });
    },

    /**
     * 验证短信验证码（用于身份验证，不登录）
     * @param data 手机号和短信验证码
     * @returns Promise<void>
     */
    verifySmsCode(data: { phone: string; smsCode: string; smsType?: string }): Promise<void> {
      return apiClient.post<void>('auth', '/verify/sms', data, { notifySuccess: false });
    },

    /**
     * 验证邮箱验证码（用于身份验证）
     * @param data 邮箱和验证码
     * @returns Promise<void>
     */
    verifyEmailCode(data: { email: string; emailCode: string; type?: string }): Promise<void> {
      return apiClient.post<void>('auth', '/verify/email', data, { notifySuccess: false });
    },

    /**
     * 生成二维码（用于扫码登录）
     * @returns 二维码信息（包含二维码图片和ID）
     */
    generateQrCode(): Promise<QrCodeResponse> {
      return apiClient.get<QrCodeResponse>('system', '/qrcode/generate', {}, { notifySuccess: false });
    },
  };
}

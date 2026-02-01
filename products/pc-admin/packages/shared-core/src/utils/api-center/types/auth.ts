/**
 * 认证相关 API 类型定义
 */

/**
 * 登录响应类型
 * 注意：token 实际存储在 cookie 中（字段名：access_token），不在响应体中
 */
export interface LoginResponse {
  user?: {
    id: string;
    username: string;
    phone?: string;
    email?: string;
    [key: string]: any;
  };
  [key: string]: any; // 允许其他字段，但 token 在 cookie 中
}

/**
 * 验证码响应类型
 */
export interface CaptchaResponse {
  captchaId: string;
  data: string; // base64 或 svg 格式的验证码图片数据
}

/**
 * 二维码登录响应类型
 */
export interface QrCodeResponse {
  qrCode: string; // 二维码图片数据（base64 或 URL）
  qrCodeId?: string; // 二维码ID（用于轮询扫码状态）
  expireTime?: number; // 过期时间（秒）
  [key: string]: any;
}

/**
 * 用户检查响应类型
 */
export interface UserCheckResponse {
  /**
   * 用户状态：valid（凭证有效）、expired（已过期）、soon_expire（即将过期）、unauthorized（未授权）
   */
  status: 'valid' | 'expired' | 'soon_expire' | 'unauthorized';
  /**
   * 服务端UTC当前时间（ISO 8601格式，如：2025-12-19T14:20:00Z）
   */
  serverCurrentTime: string;
  /**
   * 当前用户凭证的过期时间（ISO 8601格式，如：2025-12-19T14:30:00Z）
   */
  credentialExpireTime: string;
  /**
   * 剩余过期时间（秒）
   */
  remainingTime: number;
  /**
   * 详细信息描述
   */
  details: string;
  [key: string]: any;
}

/**
 * 验证码校验请求参数
 */
export interface VerifyCodeRequest {
  captchaId: string;
  captcha: string;
  smsType?: string; // 'login' | 'reset' 等，用于区分验证码类型
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  username: string;
  password: string;
  captchaId?: string;
  captcha?: string;
}

/**
 * 短信登录请求参数
 */
export interface SmsLoginRequest {
  phone: string;
  smsCode: string;
  smsType?: string; // 'login' | 'reset' 等，用于区分验证码类型
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  username: string;
  phone: string;
  password: string;
  emailCode?: string;
  smsCode?: string;
}

/**
 * 重置密码请求参数
 */
export interface ResetPasswordRequest {
  phone: string;
  smsCode: string;
  newPassword: string;
}

/**
 * 批量退出登录请求参数
 */
export interface LogoutBatchRequest {
  userIds: string[];
}

/**
 * 认证相关 API 服务
 * 提供登录、注册、密码重置等认证相关的 API 调用方法
 * 
 * 使用统一的 API 中心管理所有 API 端点
 */

import { requestAdapter } from '@/utils/requestAdapter';
import { createApiClient, createAuthApi } from '@btc/shared-core/utils/api-center';

// 重新导出类型，保持向后兼容
export type {
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
} from '@btc/shared-core/utils/api-center';

// 使用统一的 API 中心创建认证 API 服务
const apiClient = createApiClient(requestAdapter);
export const authApi = createAuthApi(apiClient);

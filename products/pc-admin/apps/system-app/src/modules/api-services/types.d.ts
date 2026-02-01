/**
 * API 服务类型定义
 * 定义通用的请求和响应类型接口
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
    [key: string]: any;
}
/**
 * 验证码响应类型
 */
export interface CaptchaResponse {
    captchaId: string;
    data: string;
}
/**
 * 用户检查响应类型
 */
export interface UserCheckResponse {
    status: string;
    timestamp?: number;
    [key: string]: any;
}
/**
 * 验证码校验请求参数
 */
export interface VerifyCodeRequest {
    captchaId: string;
    captcha: string;
    smsType?: string;
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
    smsType?: string;
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
 * 发送验证码请求参数
 */
export interface SendCodeRequest {
    phone?: string;
    email?: string;
    type?: string;
}
/**
 * 批量退出登录请求参数
 */
export interface LogoutBatchRequest {
    userIds: string[];
}
/**
 * 接口文档数据结构
 */
export interface ApiDoc {
    id?: string;
    name: string;
    method: string;
    path: string;
    domain?: string;
    owner?: string;
    description?: string;
    updatedAt?: string;
    [key: string]: any;
}

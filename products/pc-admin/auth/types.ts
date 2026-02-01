/**
 * Auth 能力包统一类型定义
 * 集中管理所有认证相关的类型
 */

// ==================== 基础数据类型 ====================

/**
 * 用户信息
 */
export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
  tenantId?: string;
  tenantType?: string;
  realName?: string;
  department?: string;
  position?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

/**
 * Token 信息
 */
export interface TokenInfo {
  token: string;
  refreshToken: string;
  expire: number;
  refreshExpire: number;
}

/**
 * 认证响应
 */
export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

// ==================== 表单数据类型 ====================

/**
 * 登录表单（账号密码）
 */
export interface LoginForm {
  username: string;
  password: string;
  captchaId?: string;
  verifyCode?: string;
  rememberMe?: boolean;
}

/**
 * 短信登录表单
 */
export interface SmsLoginForm {
  phone: string;
  smsCode: string;
}

/**
 * 二维码登录状态
 */
export interface QrLoginState {
  qrCodeUrl: string;
  qrCodeId: string;
  status: 'pending' | 'scanned' | 'confirmed' | 'expired';
}

/**
 * 注册表单（基础）
 */
export interface RegisterForm {
  tenantType: 'INERT' | 'SUPPLIER' | 'UK-HEAD';
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  smsCode?: string;
  agreeTerms?: boolean;
  [key: string]: any;
}

/**
 * 员工注册表单
 */
export interface InertRegisterForm extends RegisterForm {
  employeeId: string;
  name: string;
  department?: string;
  position?: string;
}

/**
 * 供应商注册表单
 */
export interface SupplierRegisterForm extends RegisterForm {
  companyName: string;
  creditCode: string;
  legalRepresentative: string;
  contactPhone: string;
  contactEmail: string;
  businessLicense?: string;
  address?: string;
}

/**
 * ITL注册表单
 */
export interface UkHeadRegisterForm extends RegisterForm {
  companyName: string;
  legalRepresentative: string;
  contactPhone: string;
  adminUsername: string;
  adminPassword: string;
  adminEmail: string;
}

/**
 * 忘记密码表单
 */
export interface ForgotPasswordForm {
  phone: string;
  smsCode: string;
  newPassword: string;
  confirmPassword: string;
}

// ==================== 状态类型 ====================

/**
 * 认证状态
 */
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * 登录模式
 */
export type LoginMode = 'password' | 'sms' | 'qr';

/**
 * 租户类型
 */
export type TenantType = 'INERT' | 'SUPPLIER' | 'UK-HEAD';

/**
 * 注册步骤
 */
export interface RegistrationStep {
  index: number;
  label: string;
  description?: string;
  completed: boolean;
}

// ==================== 组件 Props 类型 ====================

/**
 * 登录表单组件 Props
 */
export interface LoginFormProps {
  form: LoginForm;
  rules: any;
  loading: boolean;
  submit: () => void;
  t: (key: string) => string;
}

/**
 * 短信登录表单组件 Props
 */
export interface SmsFormProps {
  form: SmsLoginForm;
  saving: boolean;
  smsCountdown: number;
  hasSentSms: boolean;
  sendSmsCode: () => void;
  handlePhoneEnter: () => void;
  onCodeComplete: () => void;
  onLogin: () => void;
  t: (key: string) => string;
}

/**
 * 租户选择器组件 Props
 */
export interface TenantSelectorProps {
  modelValue?: TenantType;
}

/**
 * 租户选项
 */
export interface TenantOption {
  value: TenantType;
  title: string;
  description: string;
  icon: any;
}

// ==================== API 请求/响应类型 ====================

/**
 * 登录请求
 */
export interface LoginRequest {
  username: string;
  password: string;
  captchaId?: string;
  verifyCode?: string;
}

/**
 * 短信登录请求
 */
export interface SmsLoginRequest {
  phone: string;
  smsCode: string;
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  tenantType: string;
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
  companyName?: string;
  [key: string]: any;
}

/**
 * 忘记密码请求
 */
export interface ForgotPasswordRequest {
  phone: string;
  smsCode: string;
  newPassword: string;
}

/**
 * 发送短信请求
 */
export interface SendSmsRequest {
  phone: string;
  type: 'login' | 'register' | 'forgot';
}

/**
 * 验证身份请求
 */
export interface VerifyIdentityRequest {
  employeeId: string;
  name: string;
}

// ==================== 验证规则类型 ====================

/**
 * 表单验证规则
 */
export interface FormRule {
  required?: boolean;
  message: string;
  trigger?: 'blur' | 'change';
  type?: 'email' | 'number' | 'integer' | 'float';
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (rule: any, value: any, callback: any) => void;
}

/**
 * 表单验证规则集合
 */
export type FormRules = Record<string, FormRule[]>;

// ==================== 事件类型 ====================

/**
 * 认证事件
 */
export type AuthEvent = 
  | 'auth:login:success'
  | 'auth:login:failed'
  | 'auth:register:success'
  | 'auth:register:failed'
  | 'auth:logout'
  | 'auth:token:expired'
  | 'auth:token:refreshed';

/**
 * 事件处理器
 */
export type AuthEventHandler = (data?: any) => void | Promise<void>;

// ==================== 工具类型 ====================

/**
 * 可选字段
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 必需字段
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * 深度只读
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 深度部分
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

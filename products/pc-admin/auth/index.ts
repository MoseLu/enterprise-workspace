/**
 * Auth 能力包统一导出
 * 提供登录、注册、忘记密码等认证功能
 */

// ==================== Composables ====================
// 登录相关
export { useLogin } from './login/composables/useLogin';
export { usePasswordLogin } from './login/composables/usePasswordLogin';
export { useSmsLogin } from './login/composables/useSmsLogin';
export { useQrLogin } from './login/composables/useQrLogin';

// 注册相关
export { useRegister } from './register/composables/useRegister';
export { useInertRegistration } from './register/composables/useInertRegistration';

// 忘记密码
export { useForgetPassword } from './forget-password/composables/useForgetPassword';

// 共享逻辑
export { useAuth } from './shared/composables/useAuth';
export * from './shared/composables/validation';
export * from './shared/composables/api';

// ==================== Components ====================
// 登录组件
export { default as PasswordForm } from './login/password-form/index.vue';
export { default as SmsForm } from './login/sms-form/index.vue';
export { default as QrForm } from './login/qr-form/index.vue';
export { default as LoginTabs } from './login/tabs/index.vue';
export { default as LoginHeader } from './login/header/index.vue';
export { default as LoginFooter } from './login/footer/index.vue';

// 注册组件
export { default as TenantSelector } from './register/tenant-selector/index.vue';
export { default as SupplierRegistration } from './register/components/supplier-registration/index.vue';
export { default as InertRegistration } from './register/components/inert-registration/index.vue';
export { default as UkHeadRegistration } from './register/components/uk-head-registration/index.vue';

// 忘记密码组件
export { default as ForgetPasswordForm } from './forget-password/components/index.vue';

// 共享组件
export { default as LoginContainer } from './shared/components/login-container/index.vue';
export { default as AuthDivider } from './shared/components/auth/divider/index.vue';
export { default as LoginOptions } from './shared/components/auth/login-options/index.vue';

// ==================== Types ====================
// 导出统一类型定义
export type * from './types';

// 导出组件特定类型（向后兼容）
export type { LoginForm as PasswordLoginForm, SmsLoginForm } from './types';
export type { RegisterForm, InertRegisterForm, SupplierRegisterForm, UkHeadRegisterForm } from './types';
export type { ForgotPasswordForm } from './types';

// ==================== Utils ====================
// 导出工具函数
export * from './login/composables/utils';
export * from './register/composables/utils';

// ==================== Services ====================
export { authService, AuthService } from './services/authService';
export type {
  LoginRequest,
  SmsLoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  AuthUser,
  AuthResponse,
  TokenInfo
} from './services/authService';

// ==================== Config ====================
export {
  getAuthConfig,
  updateAuthConfig,
  resetAuthConfig,
  defaultAuthConfig
} from './config';
export type { AuthConfig } from './config';

// ==================== 能力包信息 ====================
export const authCapability = {
  name: 'auth',
  label: '用户认证',
  description: '提供登录、注册、忘记密码等认证功能',
  version: '1.0.0',
  author: 'BTC-SaaS Team',
  category: 'security',
  tags: ['authentication', 'user', 'security']
};

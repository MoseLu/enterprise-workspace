/**
 * 认证页面共享组件导出
 *
 * 从 Vue3 认证组件迁移而来
 */

// 认证头部组件
export { AuthHeader, AuthHeader as default, type AuthHeaderProps } from './auth-header';

// 认证底部组件
export { AuthFooter, AuthFooter as default, type AuthFooterProps } from './auth-footer';

// 认证分隔线组件
export { AuthDivider, AuthDivider as default } from './auth-divider';

// 登录表单布局组件
export { LoginFormLayout, LoginFormLayout as default } from './login-form-layout';

// 登录选项组件
export { LoginOptions, LoginOptions as default, type LoginOptionsProps } from './login-options';

// 二维码切换按钮组件
export { QrToggleBtn, QrToggleBtn as default, type QrToggleBtnProps, type QrToggleBtnIcon } from './qr-toggle-btn';

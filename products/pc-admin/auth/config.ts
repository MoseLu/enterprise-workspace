/**
 * Auth 能力包配置
 * 定义认证功能的配置选项、路由、权限等
 */

export interface AuthConfig {
  // 基本信息
  name: string;
  label: string;
  description: string;
  version: string;
  author: string;

  // 能力包元数据
  category: string;
  tags: string[];

  // 功能开关
  features: {
    enableRememberMe: boolean;
    enableCaptcha: boolean;
    enableSmsLogin: boolean;
    enableQrLogin: boolean;
    enableWechatLogin: boolean;
    enableAppLogin: boolean;
  };

  // 安全配置
  security: {
    passwordMinLength: number;
    passwordMaxLength: number;
    sessionTimeout: number; // 毫秒
    maxLoginAttempts: number;
    lockoutDuration: number; // 毫秒
  };

  // 验证配置
  validation: {
    phoneRegex: RegExp;
    emailRegex: RegExp;
    usernameMinLength: number;
    usernameMaxLength: number;
  };

  // 短信配置
  sms: {
    codeLength: number;
    cooldownSeconds: number;
    resendLimit: number;
  };

  // 二维码配置
  qrCode: {
    refreshInterval: number; // 毫秒
    expirationTime: number; // 毫秒
  };

  // 路由配置
  routes: {
    login: string;
    register: string;
    forgotPassword: string;
    afterLogin: string;
    afterLogout: string;
  };
}

// 默认配置
export const defaultAuthConfig: AuthConfig = {
  // 基本信息
  name: 'auth',
  label: '用户认证',
  description: '提供登录、注册、忘记密码等认证功能',
  version: '1.0.0',
  author: 'BTC-SaaS Team',

  // 能力包元数据
  category: 'security',
  tags: ['authentication', 'user', 'security', 'login', 'register'],

  // 功能开关
  features: {
    enableRememberMe: true,
    enableCaptcha: false, // 暂时禁用验证码
    enableSmsLogin: true,
    enableQrLogin: true,
    enableWechatLogin: false, // 微信登录待开发
    enableAppLogin: false // APP登录待开发
  },

  // 安全配置
  security: {
    passwordMinLength: 6,
    passwordMaxLength: 20,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24小时
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15分钟
  },

  // 验证配置
  validation: {
    phoneRegex: /^1[3-9]\d{9}$/,
    emailRegex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    usernameMinLength: 3,
    usernameMaxLength: 20
  },

  // 短信配置
  sms: {
    codeLength: 6,
    cooldownSeconds: 60,
    resendLimit: 3
  },

  // 二维码配置
  qrCode: {
    refreshInterval: 60 * 1000, // 1分钟
    expirationTime: 5 * 60 * 1000 // 5分钟
  },

  // 路由配置
  routes: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forget-password',
    afterLogin: '/',
    afterLogout: '/login'
  }
};

// 当前激活的配置
let activeConfig: AuthConfig = { ...defaultAuthConfig };

/**
 * 获取当前配置
 */
export function getAuthConfig(): AuthConfig {
  return activeConfig;
}

/**
 * 更新配置（部分更新）
 */
export function updateAuthConfig(config: Partial<AuthConfig>): void {
  activeConfig = {
    ...activeConfig,
    ...config,
    features: { ...activeConfig.features, ...config.features },
    security: { ...activeConfig.security, ...config.security },
    validation: { ...activeConfig.validation, ...config.validation },
    sms: { ...activeConfig.sms, ...config.sms },
    qrCode: { ...activeConfig.qrCode, ...config.qrCode },
    routes: { ...activeConfig.routes, ...config.routes }
  };
}

/**
 * 重置配置为默认值
 */
export function resetAuthConfig(): void {
  activeConfig = { ...defaultAuthConfig };
}

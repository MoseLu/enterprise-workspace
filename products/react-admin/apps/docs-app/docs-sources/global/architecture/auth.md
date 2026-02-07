# Auth 认证能力包

## 📋 概述

Auth 认证能力包提供完整的用户认证功能，包括登录、注册、忘记密码等核心功能。

## ✨ 功能特性

### 登录功能
- ✅ **账号密码登录** - 支持用户名/邮箱登录
- ✅ **手机号登录** - 短信验证码登录
- ✅ **二维码登录** - 扫码快速登录
- 🔜 **微信登录** - 微信快捷登录（待开发）
- 🔜 **APP登录** - 移动端APP登录（待开发）

### 注册功能
- ✅ **多租户注册** - 支持员工、供应商、ITL三种类型
- ✅ **分步骤注册** - 引导式注册流程
- ✅ **身份验证** - 员工注册需验证身份
- ✅ **表单验证** - 完整的表单验证规则

### 密码管理
- ✅ **忘记密码** - 手机号验证重置密码
- ✅ **密码强度检查** - 确保密码安全
- ✅ **双重确认** - 密码二次确认

### 安全特性
- ✅ **Token 管理** - JWT Token + Refresh Token
- ✅ **自动刷新** - Token 过期自动刷新
- ✅ **会话超时** - 自动检测会话过期
- ✅ **登录限制** - 防止暴力破解

## 📁 目录结构

```
auth/
├── index.ts                        # 统一导出
├── config.ts                       # 能力配置
├── README.md                       # 使用文档
├── services/                       # 服务层
│   └── authService.ts             # 认证服务
├── login/                          # 登录功能
│   ├── index.vue                  # 登录主页
│   ├── composables/               # 业务逻辑
│   │   ├── useLogin.ts           # 登录状态管理
│   │   ├── usePasswordLogin.ts   # 密码登录
│   │   ├── useSmsLogin.ts        # 短信登录
│   │   └── useQrLogin.ts         # 二维码登录
│   ├── password-form/             # 密码登录表单
│   ├── sms-form/                  # 短信登录表单
│   ├── qr-form/                   # 二维码登录表单
│   ├── tabs/                      # 登录标签页
│   ├── header/                    # 登录头部
│   └── footer/                    # 登录底部
├── register/                       # 注册功能
│   ├── index.vue                  # 注册主页
│   ├── composables/               # 业务逻辑
│   │   ├── useRegister.ts        # 注册状态管理
│   │   └── useInertRegistration.ts # 员工注册逻辑
│   ├── tenant-selector/           # 租户选择器
│   └── components/                # 注册表单组件
│       ├── supplier-registration/ # 供应商注册
│       ├── inert-registration/    # 员工注册
│       └── uk-head-registration/  # ITL注册
├── forget-password/                # 忘记密码功能
│   ├── index.vue                  # 忘记密码主页
│   ├── composables/               # 业务逻辑
│   │   └── useForgetPassword.ts  # 忘记密码逻辑
│   └── components/                # 忘记密码组件
└── shared/                         # 共享资源
    ├── composables/               # 共享逻辑
    │   ├── api.ts                # API 调用
    │   ├── useAuth.ts            # 认证状态
    │   └── validation.ts         # 验证工具
    ├── components/                # 共享组件
    │   ├── auth/                 # 认证相关组件
    │   ├── inputs/               # 输入组件
    │   └── login-container/      # 登录容器
    └── styles/                    # 共享样式
        ├── auth.scss             # 主样式
        ├── _base.scss            # 基础样式
        ├── _variables.scss       # 变量
        └── ...
```

## 🔧 使用方法

### 基本使用

#### 1. 登录功能

```typescript
import { useLogin } from '/@/modules/base/pages/auth';

// 在组件中使用
const {
  currentLoginMode,
  handleSwitchLoginMode,
  passwordForm,
  passwordSubmit,
  smsForm,
  sendSmsCode,
  qrCodeUrl,
  refreshQrCode
} = useLogin();
```

#### 2. 注册功能

```typescript
import { useRegister } from '/@/modules/base/pages/auth';

const {
  formData,
  currentStep,
  handleNextStep,
  handlePrevStep,
  handleFinish
} = useRegister();
```

#### 3. 忘记密码

```typescript
import { useForgetPassword } from '/@/modules/base/pages/auth';

const {
  phoneForm,
  passwordForm,
  currentStep,
  sendSmsCode,
  handleFinish
} = useForgetPassword();
```

### 使用服务层

```typescript
import { authService } from '/@/modules/base/pages/auth/services/authService';

// 登录
const response = await authService.login({
  username: 'admin',
  password: '123456'
});

// 发送短信验证码
await authService.sendSmsCode('13800138000', 'login');

// 刷新 Token
const newToken = await authService.refreshToken();
```

### 配置管理

```typescript
import { getAuthConfig, updateAuthConfig } from '/@/modules/base/pages/auth/config';

// 获取当前配置
const config = getAuthConfig();

// 更新配置
updateAuthConfig({
  security: {
    passwordMinLength: 8,
    maxLoginAttempts: 3
  },
  features: {
    enableCaptcha: true
  }
});
```

## 📖 API 参考

### Composables

#### `useLogin()`
登录状态和逻辑管理

**返回值**:
- `currentLoginMode` - 当前登录模式 ('password' | 'sms' | 'qr')
- `handleSwitchLoginMode` - 切换登录模式
- `passwordForm` - 密码登录表单数据
- `passwordSubmit` - 密码登录提交方法
- `smsForm` - 短信登录表单数据
- `sendSmsCode` - 发送短信验证码
- `qrCodeUrl` - 二维码URL
- `refreshQrCode` - 刷新二维码

#### `useRegister()`
注册状态和逻辑管理

**返回值**:
- `formData` - 注册表单数据
- `currentStep` - 当前步骤
- `handleNextStep` - 下一步
- `handlePrevStep` - 上一步
- `handleFinish` - 完成注册

#### `useForgetPassword()`
忘记密码逻辑管理

**返回值**:
- `phoneForm` - 手机验证表单
- `passwordForm` - 密码重置表单
- `currentStep` - 当前步骤
- `sendSmsCode` - 发送验证码
- `handleFinish` - 完成重置

### Services

#### `authService`
认证服务实例

**方法**:
- `login(data)` - 账号密码登录
- `smsLogin(data)` - 短信登录
- `register(data)` - 用户注册
- `forgotPassword(data)` - 忘记密码
- `sendSmsCode(phone, type)` - 发送短信
- `refreshQrCode()` - 刷新二维码
- `checkQrCodeStatus(id)` - 检查二维码状态
- `logout()` - 登出
- `refreshToken()` - 刷新令牌
- `getUserInfo()` - 获取用户信息

### Components

#### 登录组件
- `PasswordForm` - 密码登录表单
- `SmsForm` - 短信登录表单
- `QrForm` - 二维码登录表单
- `LoginTabs` - 登录标签页
- `LoginContainer` - 登录容器

#### 注册组件
- `TenantSelector` - 租户选择器
- `SupplierRegistration` - 供应商注册表单
- `InertRegistration` - 员工注册表单
- `UkHeadRegistration` - ITL注册表单

#### 共享组件
- `AuthDivider` - 分割线
- `LoginOptions` - 第三方登录选项

## ⚙️ 配置选项

### 功能开关
```typescript
features: {
  enableRememberMe: true,        // 记住我
  enableCaptcha: false,          // 验证码
  enableSmsLogin: true,          // 短信登录
  enableQrLogin: true,           // 二维码登录
  enableWechatLogin: false,      // 微信登录
  enableAppLogin: false          // APP登录
}
```

### 安全配置
```typescript
security: {
  passwordMinLength: 6,          // 密码最小长度
  passwordMaxLength: 20,         // 密码最大长度
  sessionTimeout: 86400000,      // 会话超时（24小时）
  maxLoginAttempts: 5,           // 最大登录尝试次数
  lockoutDuration: 900000        // 锁定时长（15分钟）
}
```

### 短信配置
```typescript
sms: {
  codeLength: 6,                 // 验证码长度
  cooldownSeconds: 60,           // 冷却时间（秒）
  resendLimit: 3                 // 重发次数限制
}
```

## 🌐 国际化

支持中英文双语：
- `zh-cn.json` - 简体中文
- `en.json` - English

**使用示例**:
```vue
<template>
  <div>{{ t('登录') }}</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
```

## 🎨 样式定制

### 主题变量

在 `shared/styles/_variables.scss` 中定义了所有样式变量：

```scss
// 尺寸
$auth-input-height: 45px;
$auth-card-width: 450px;

// 颜色
$auth-light-bg: #fff;
$auth-dark-bg: var(--el-bg-color);

// 间距
$auth-card-padding: 24px;
```

### 自定义样式

```scss
// 在您的组件中
@use '/@/modules/base/pages/auth/shared/styles/variables' as *;

.my-custom-auth {
  height: $auth-input-height;
  background: $auth-light-bg;
}
```

## 🔐 安全最佳实践

1. **密码安全**
   - 最小长度 6 位
   - 建议包含字母、数字、特殊字符
   - 前端不存储明文密码

2. **Token 管理**
   - 使用 JWT Token
   - 自动刷新机制
   - 安全存储在 localStorage

3. **防暴力破解**
   - 最大尝试次数限制
   - 登录失败锁定
   - 验证码保护（可选）

4. **会话管理**
   - 24小时自动过期
   - 页面刷新保持登录
   - 登出清除所有凭证

## 🐛 常见问题

### 1. 登录后跳转到 404？
**原因**: 路由配置问题或权限不足
**解决**: 检查路由守卫和菜单权限配置

### 2. Token 频繁过期？
**原因**: `sessionTimeout` 配置太短
**解决**: 调整 `config.ts` 中的 `security.sessionTimeout`

### 3. 短信验证码收不到？
**原因**: 后端短信服务未配置
**解决**: 检查后端短信服务配置

### 4. 二维码不刷新？
**原因**: 轮询未启动或接口错误
**解决**: 检查 `useQrLogin.ts` 中的轮询逻辑

## 📦 依赖

- `vue` ^3.3.0
- `vue-router` ^4.2.0
- `vue-i18n` ^9.8.0
- `element-plus` ^2.4.0
- `axios` ^1.6.0
- `lodash-es` ^4.17.21
- `@btc-vue/crud` workspace:*

## 🔗 相关文档

- [能力包开发规范](../../../../docs/development/capability-development.md)
- [组件开发指南](../../../../docs/development/workflow.md)
- [目录结构规范](../../../../docs/architecture/directory-structure.md)

## 📝 更新日志

### v1.0.0 (2025-09-30)
- ✅ 初始版本发布
- ✅ 实现账号密码登录
- ✅ 实现短信登录
- ✅ 实现二维码登录
- ✅ 实现多租户注册
- ✅ 实现忘记密码
- ✅ 添加国际化支持
- ✅ 添加深色模式支持

## 👥 贡献者

- BTC-SaaS Team

## 📄 许可证

Copyright © 2025 BTC-SaaS. All rights reserved.

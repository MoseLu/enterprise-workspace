# BtcIdentityVerify 身份验证组件

身份验证弹窗组件，支持手机号和邮箱两种验证方式。

## 功能特性

- ✅ 支持手机号验证和邮箱验证两种方式
- ✅ 支持切换验证方式
- ✅ 支持发送验证码和验证
- ✅ 支持绑定新手机号/邮箱的场景
- ✅ 自动根据绑定状态和编辑字段智能选择验证方式
- ✅ 响应式设计，支持移动端和桌面端
- ✅ 支持暗色模式

## 组件结构

```
btc-identity-verify/
├── components/              # 子组件
│   ├── VerifyHeader.vue     # 头部组件
│   ├── VerifyTabs.vue        # 验证方式切换标签
│   ├── PhoneVerifyForm.vue  # 手机号验证表单
│   ├── EmailVerifyForm.vue  # 邮箱验证表单
│   └── VerifyFormFooter.vue # 表单底部提示
├── composables/             # 组合式函数
│   └── useIdentityVerify.ts # 验证逻辑
├── styles/                  # 样式文件
│   ├── index.scss           # 主样式文件
│   ├── base.scss            # 基础样式
│   ├── header.scss          # 头部样式
│   ├── tabs.scss            # 标签页样式
│   ├── form.scss            # 表单样式
│   ├── footer.scss          # 底部样式
│   ├── responsive.scss      # 响应式样式
│   └── dialog.scss          # Dialog 样式
├── index.vue                # 主组件
├── index.ts                 # 导出文件
└── README.md               # 文档
```

## 使用方法

```vue
<template>
  <BtcIdentityVerify
    v-model="visible"
    :user-info="userInfo"
    :account-name="accountName"
    :send-sms-code="sendSmsCode"
    :send-email-code="sendEmailCode"
    :verify-sms-code="verifySmsCode"
    :verify-email-code="verifyEmailCode"
    :check-phone-binding="checkPhoneBinding"
    :check-email-binding="checkEmailBinding"
    :sms-code-input-component="smsCodeInputComponent"
    :editing-field="editingField"
    @success="handleSuccess"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import { BtcIdentityVerify } from '@btc/shared-components';

const visible = ref(false);
const userInfo = {
  id: 1,
  phone: '138****8888',
  email: 'user@example.com'
};

const sendSmsCode = async (phone: string, smsType?: string) => {
  // 发送短信验证码
};

const sendEmailCode = async (email: string, smsType?: string) => {
  // 发送邮箱验证码
};

const verifySmsCode = async (phone: string, smsCode: string, smsType?: string) => {
  // 验证短信验证码
};

const verifyEmailCode = async (email: string, emailCode: string, smsType?: string) => {
  // 验证邮箱验证码
};

const checkPhoneBinding = async ({ type }: { type: 'phone' }) => {
  // 检查手机号绑定状态，返回脱敏手机号或空字符串
  return '138****8888';
};

const checkEmailBinding = async ({ type }: { type: 'email' }) => {
  // 检查邮箱绑定状态，返回脱敏邮箱或空字符串
  return 'use***@example.com';
};

const handleSuccess = () => {
  // 验证成功回调
};

const handleCancel = () => {
  // 取消回调
};
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 | 必填 |
|------|------|------|--------|------|
| modelValue | 显示/隐藏 | `boolean` | - | ✅ |
| userInfo | 用户信息 | `{ id?: number \| string; phone?: string; email?: string }` | - | ✅ |
| accountName | 账号名称 | `string` | `'您'` | ❌ |
| sendSmsCode | 发送短信验证码函数 | `(phone: string, smsType?: string) => Promise<void>` | - | ✅ |
| sendEmailCode | 发送邮箱验证码函数 | `(email: string, smsType?: string) => Promise<void>` | - | ✅ |
| verifySmsCode | 验证短信验证码函数 | `(phone: string, smsCode: string, smsType?: string) => Promise<void>` | - | ✅ |
| verifyEmailCode | 验证邮箱验证码函数 | `(email: string, emailCode: string, smsType?: string) => Promise<void>` | - | ✅ |
| checkPhoneBinding | 检查手机号绑定状态 | `(params: { type: 'phone' }) => Promise<string \| { data: string; phone?: string }>` | - | ✅ |
| checkEmailBinding | 检查邮箱绑定状态 | `(params: { type: 'email' }) => Promise<string \| { data: string; email?: string }>` | - | ✅ |
| smsCodeInputComponent | 验证码输入组件 | `Component` | - | ❌ |
| editingField | 当前正在编辑的字段 | `'phone' \| 'email' \| null` | `null` | ❌ |

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 更新显示状态 | `(value: boolean)` |
| success | 验证成功 | - |
| cancel | 取消验证 | - |

## 验证逻辑说明

### 验证方式选择规则

1. **无编辑字段（如密码编辑）**：只能使用已绑定的验证方式
   - 只有手机号绑定 → 只能使用手机号验证
   - 只有邮箱绑定 → 只能使用邮箱验证
   - 两者都有 → 可以选择任一方式

2. **编辑手机号**：必须使用其他已绑定的联系方式验证
   - 有邮箱绑定 → 优先使用邮箱验证
   - 只有手机号绑定 → 使用手机号验证（但无法验证自己）

3. **编辑邮箱**：必须使用其他已绑定的联系方式验证
   - 有手机号绑定 → 优先使用手机号验证
   - 只有邮箱绑定 → 使用邮箱验证（但无法验证自己）

## 样式定制

组件样式使用 SCSS 编写，支持通过 CSS 变量进行定制。主要变量：

- `--el-color-primary`: 主题色
- `--el-text-color-primary`: 主文本颜色
- `--el-text-color-regular`: 常规文本颜色
- `--el-border-color-lighter`: 边框颜色
- `--el-fill-color-light`: 填充颜色

## 注意事项

1. 验证码输入组件需要支持 `v-model`、`id-prefix`、`size`、`disabled` 属性和 `complete` 事件
2. 所有 API 函数都需要返回 Promise
3. 绑定状态检查函数应返回脱敏的联系方式或空字符串
4. 组件会自动处理验证码倒计时和发送状态


<template>
  <!-- 绑定流程：使用独立的绑定组件 -->
  <BtcBindingDialog
    v-if="skipVerification && bindField && (bindField === 'phone' || bindField === 'email')"
    v-model="visible"
    :user-info="userInfo"
    :account-name="accountName"
    :send-sms-code="sendSmsCode"
    :send-email-code="sendEmailCode"
    :verify-sms-code="verifySmsCode"
    :verify-email-code="verifyEmailCode"
    :save-binding="saveBinding"
    :sms-code-input-component="smsCodeInputComponent"
    :bind-field="bindField as 'phone' | 'email'"
    @success="handleSuccess"
    @cancel="handleCancel"
  />
  <!-- 验证流程：使用身份验证组件 -->
  <BtcIdentityVerify
    v-else
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
import { computed } from 'vue';
import BtcIdentityVerify from '@btc-components/feedback/btc-identity-verify/index.vue';
import BtcBindingDialog from '@btc-components/feedback/btc-binding-dialog/index.vue';
import { useMessage } from '@/utils/use-message';
import { service } from '@services/eps';
import { appStorage } from '@/utils/app-storage';
import BtcSmsCodeInput from '@/pages/auth/shared/components/sms-code-input/index.vue';

interface Props {
  modelValue: boolean;
  userInfo: {
    id?: number | string;
    phone?: string;
    email?: string;
  };
  skipVerification?: boolean;
  bindField?: string | null;
  editingField?: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'success': [isBinding: boolean];
  'cancel': [];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 账号名称
const accountName = computed(() => appStorage.user.getName() || '您');

// 验证码输入组件
const smsCodeInputComponent = BtcSmsCodeInput;
const message = useMessage();

// 绑定流程：发送手机号验证码
// EPS 服务：POST /api/system/base/phone/bind
// 参数：phone（必填），smsType（默认 'bind'）
const sendSmsCodeForBind = async (phone: string) => {
  const phoneService = service.admin?.base?.phone;
  if (!phoneService?.bind) {
    throw new Error('手机号服务不可用');
  }
  await phoneService.bind({
    phone,
    smsType: 'bind'
  });
};

// 绑定流程：发送邮箱验证码
// EPS 服务：POST /api/system/base/email/bind
// 邮箱接口需要传递 email（必填）和 smsType（默认 'bind'）
const sendEmailCodeForBind = async (email: string, smsType?: string) => {
  const emailService = service.admin?.base?.email;
  if (!emailService?.bind) {
    throw new Error('邮箱服务不可用');
  }
  await emailService.bind({
    email,
    scene: smsType || 'bind',
    smsType: smsType || 'bind',
    type: smsType || 'bind'
  });
};

// 验证流程：发送手机号验证码
// EPS 服务：POST /api/system/base/phone/send
// 参数：type（默认 'auth'，后端兼容 smsType）
const sendSmsCodeForVerify = async () => {
  const phoneService = service.admin?.base?.phone;
  if (!phoneService?.send) {
    throw new Error('手机号服务不可用');
  }
  await phoneService.send({
    type: 'auth',
    smsType: 'auth'
  });
};

// 验证流程：发送邮箱验证码
// EPS 服务：POST /api/system/base/email/send
// 参数：type（默认 'auth'，后端兼容 scene / smsType）
const sendEmailCodeForVerify = async () => {
  const emailService = service.admin?.base?.email;
  if (!emailService?.send) {
    throw new Error('邮箱服务不可用');
  }
  await emailService.send({
    type: 'auth',
    scene: 'auth',
    smsType: 'auth'
  });
};

// 统一的发送短信验证码函数（根据流程选择不同的 API）
const sendSmsCode = async (phone: string, smsType?: string) => {
  // 如果是绑定流程，使用绑定接口
  if (props.skipVerification && props.bindField === 'phone') {
    await sendSmsCodeForBind(phone);
  } else {
    // 验证流程，使用验证接口
    await sendSmsCodeForVerify();
  }
};

// 统一的发送邮箱验证码函数（根据流程选择不同的 API）
// 邮箱接口需要传递 email（必填）和 smsType（必填）
const sendEmailCode = async (email: string, smsType?: string) => {
  // 如果是绑定流程，使用绑定接口，传递 smsType: 'bind'
  if (props.skipVerification && props.bindField === 'email') {
    await sendEmailCodeForBind(email, smsType || 'bind');
  } else {
    // 验证流程，使用验证接口（无参数，后端会使用当前用户邮箱）
    await sendEmailCodeForVerify();
  }
};

const extractResponse = (result: any) => {
  if (!result || typeof result !== 'object') {
    return { code: undefined, msg: undefined };
  }
  if ('data' in result && result.data && typeof result.data === 'object') {
    const dataObj = result.data as any;
    return { code: dataObj.code, msg: dataObj.msg };
  }
  return { code: (result as any).code, msg: (result as any).msg };
};

// 验证短信验证码
// 验证流程：POST /api/system/base/phone/verify
// 绑定流程：PUT /api/system/base/phone/update（saveBinding 中处理）
const verifySmsCode = async (_phone: string, smsCode: string, smsType?: string) => {
  const phoneService = service.admin?.base?.phone;
  if (!phoneService?.verify) {
    throw new Error('手机号服务不可用');
  }

  if (smsType === 'auth' || !smsType) {
    const response = await phoneService.verify({
      code: smsCode,
      smsType: smsType || 'auth'
    });
    const { code, msg } = extractResponse(response);
    const isSuccess = code === undefined || code === null || code === 200 || code === 1000 || code === 2000;
    if (!isSuccess) {
      message.error(msg || '验证码校验失败');
      return false;
    }
  }
  return true;
};

// 验证邮箱验证码
// 验证流程：POST /api/system/base/email/verify
// 绑定流程：PUT /api/system/base/email/update
// 邮箱接口需要传递 code（验证码，必填）和 smsType（默认 'auth' 或 'bind'）
const verifyEmailCode = async (_email: string, emailCode: string, smsType?: string) => {
  const emailService = service.admin?.base?.email;
  if (!emailService?.verify) {
    throw new Error('邮箱服务不可用');
  }

  if (smsType === 'auth' || !smsType) {
    const response = await emailService.verify({
      code: emailCode,
      scene: smsType || 'auth',
      smsType: smsType || 'auth'
    });
    const { code, msg } = extractResponse(response);
    const isSuccess = code === undefined || code === null || code === 200 || code === 1000 || code === 2000;
    if (!isSuccess) {
      message.error(msg || '验证码校验失败');
      return false;
    }
  }
  return true;
};

// 检查手机号绑定状态
const checkPhoneBinding = async ({ type }: { type: 'phone' }) => {
  const profileService = service.admin?.base?.profile;
  if (!profileService) {
    throw new Error('用户信息服务不可用');
  }
  return await profileService.verify({ type });
};

// 检查邮箱绑定状态
const checkEmailBinding = async ({ type }: { type: 'email' }) => {
  const profileService = service.admin?.base?.profile;
  if (!profileService) {
    throw new Error('用户信息服务不可用');
  }
  return await profileService.verify({ type });
};

// 保存绑定信息
const saveBinding = async (params: {
  id?: number | string;
  phone?: string;
  email?: string;
  smsCode?: string;
  smsType?: string;
  scene?: string;
  emailCode?: string;
}) => {
  const profileService = service.admin?.base?.profile;
  const phoneService = service.admin?.base?.phone;
  const emailService = service.admin?.base?.email;

  if (params.phone && params.smsCode) {
    if (!phoneService?.update) {
      throw new Error('手机号服务不可用');
    }
    await phoneService.update({
      phone: params.phone,
      smsCode: params.smsCode,
      smsType: params.smsType || 'bind'
    });
    return;
  }

  if (params.email && params.emailCode) {
    if (!emailService?.update) {
      throw new Error('邮箱服务不可用');
    }
    const response = await emailService.update({
      email: params.email,
      code: params.emailCode,
      scene: params.scene || params.smsType || 'bind',
      smsType: params.smsType || 'bind'
    });
    const { code, msg } = extractResponse(response);
    if (code && code !== 200 && code !== 1000 && code !== 2000) {
      message.error(msg || '换绑失败');
      return;
    }
    return;
  }

  if (!profileService?.update) {
    throw new Error('用户信息服务不可用');
  }
  await profileService.update(params);
};

const handleSuccess = () => {
  // 如果是绑定流程，传递 isBinding=true
  if (props.skipVerification) {
    emit('success', true);
  } else {
    // 验证流程，传递 isBinding=false
    emit('success', false);
  }
};

const handleCancel = () => {
  emit('cancel');
};
</script>


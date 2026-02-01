<template>
  <BtcDialog
    v-model="visible"
    :width="dialogWidth"
    padding="0"
    :hide-header="true"
    :scrollbar="false"
    class="identity-verify-dialog"
  >
    <div class="identity-verify">
      <!-- 关闭按钮 -->
      <el-icon class="identity-verify__close-icon" @click="handleClose">
        <Close />
      </el-icon>

      <!-- 头部 -->
      <VerifyHeader :account-name="accountName" />

      <!-- 内容区域 -->
      <div class="identity-verify__content">
        <!-- 左侧：验证方式切换 -->
        <VerifyTabs
          :current-verify-type="currentVerifyType"
          :can-use-phone-verify="canUsePhoneVerify"
          :can-use-email-verify="canUseEmailVerify"
          @switch="switchVerifyType"
        />

        <!-- 右侧：验证表单 -->
        <div class="identity-verify__content-right">
          <div class="verify-form">
            <!-- 手机号验证表单 -->
            <PhoneVerifyForm
              v-if="currentVerifyType === 'phone'"
              :phone="phoneForm.phone"
              :sms-code="phoneForm.smsCode"
              :loading="loadingPhone"
              :verifying="verifying"
              :sms-countdown="smsCountdown"
              :sms-sending="smsSending"
              :sms-has-sent="smsHasSent"
              :sms-can-send="smsCanSend"
              :has-phone="hasPhone"
              v-bind="{
                ...(verifyError !== undefined ? { verifyError } : {}),
                ...(smsCodeInputComponent !== undefined ? { smsCodeInputComponent } : {})
              }"
              @update:phone="phoneForm.phone = $event"
              @update:sms-code="phoneForm.smsCode = $event"
              @send-sms-code="handleSendSmsCode"
              @verify="handleVerify"
              @sms-code-complete="handleSmsCodeComplete"
            />

            <!-- 邮箱验证表单 -->
            <EmailVerifyForm
              v-else
              :email="emailForm.email"
              :email-code="emailForm.emailCode"
              :loading="loadingEmail"
              :verifying="verifying"
              :email-countdown="emailCountdown"
              :email-sending="emailSending"
              :email-has-sent="emailHasSent"
              v-bind="{
                ...(verifyError !== undefined ? { verifyError } : {}),
                ...(smsCodeInputComponent !== undefined ? { smsCodeInputComponent } : {})
              }"
              @update:email="emailForm.email = $event"
              @update:email-code="emailForm.emailCode = $event"
              @send-email-code="handleSendEmailCode"
              @verify="handleVerify"
              @email-code-complete="handleEmailCodeComplete"
            />

            <!-- 底部提示 -->
            <VerifyFormFooter
              :current-verify-type="currentVerifyType"
              :has-phone="hasPhone"
              :has-email="hasEmail"
            />
          </div>
        </div>
      </div>
    </div>
  </BtcDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import { Close } from '@element-plus/icons-vue';
import {
  useIdentityVerify,
  type VerifyType,
  type SendSmsCodeFn,
  type SendEmailCodeFn,
  type VerifySmsCodeFn,
  type VerifyEmailCodeFn
} from './composables/useIdentityVerify';
import type { VerifyPhoneApi, VerifyEmailApi } from './types';
import BtcDialog from '../btc-dialog/index';
import type { Component } from 'vue';
import VerifyHeader from './components/VerifyHeader.vue';
import VerifyTabs from './components/VerifyTabs.vue';
import PhoneVerifyForm from './components/PhoneVerifyForm.vue';
import EmailVerifyForm from './components/EmailVerifyForm.vue';
import VerifyFormFooter from './components/VerifyFormFooter.vue';
import { BtcMessage } from '@btc/shared-components';
import { logger } from '@btc/shared-core';
;


defineOptions({
  name: 'BtcIdentityVerify'
});

interface Props {
  modelValue: boolean;
  userInfo: {
    id?: number | string;
    phone?: string;
    email?: string;
  };
  /** 账号名称（用于显示） */
  accountName?: string;
  /** 发送短信验证码函数 */
  sendSmsCode: SendSmsCodeFn;
  /** 发送邮箱验证码函数 */
  sendEmailCode: SendEmailCodeFn;
  /** 验证短信验证码函数 */
  verifySmsCode: VerifySmsCodeFn;
  /** 验证邮箱验证码函数 */
  verifyEmailCode: VerifyEmailCodeFn;
  /** 检查手机号绑定状态 */
  checkPhoneBinding: VerifyPhoneApi;
  /** 检查邮箱绑定状态 */
  checkEmailBinding: VerifyEmailApi;
  /** 验证码输入组件 */
  smsCodeInputComponent?: Component;
  /** 当前正在编辑的字段（'phone' | 'email' | null），用于限制可用验证方式 */
  editingField?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  accountName: '您',
  editingField: null as string | null
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'success': [];
  'cancel': [];
}>();

// 显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 账号显示
const accountName = computed(() => props.accountName || '您');

// 手机号和邮箱绑定状态
const phoneBound = ref<boolean>(false);
const emailBound = ref<boolean>(false);
const checkingStatus = ref<boolean>(false);

// 检查是否有手机号和邮箱
const hasPhone = computed(() => phoneBound.value);
const hasEmail = computed(() => emailBound.value);
const hasPhoneOnly = computed(() => hasPhone.value && !hasEmail.value);
const hasEmailOnly = computed(() => hasEmail.value && !hasPhone.value);
const hasBoth = computed(() => hasPhone.value && hasEmail.value);

// 根据绑定状态，决定可用哪些验证方式
// 身份验证不受 editingField 影响，只要绑定了就可以使用
const canUsePhoneVerify = computed(() => {
  return hasPhone.value;
});

const canUseEmailVerify = computed(() => {
  return hasEmail.value;
});

// 响应式宽度
const dialogWidth = computed(() => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth <= 480) {
      return 'calc(100% - 24px)';
    } else if (window.innerWidth <= 768) {
      return 'calc(100% - 32px)';
    }
  }
  return '40%';
});

// 加载状态
const loadingPhone = ref(false);
const loadingEmail = ref(false);

// 使用身份验证 Composable
const {
  currentVerifyType,
  phoneForm,
  emailForm,
  verifying,
  verifyError,
  smsCountdown,
  smsSending,
  smsHasSent,
  smsCanSend,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sendSmsCode: _sendSmsCode,
  emailCountdown,
  emailSending,
  emailHasSent,
  sendEmailCode,
  verify,
  reset,
  switchVerifyType: switchType
} = useIdentityVerify({
  userInfo: props.userInfo,
  sendSmsCode: props.sendSmsCode,
  sendEmailCode: props.sendEmailCode,
  verifySmsCode: props.verifySmsCode,
  verifyEmailCode: props.verifyEmailCode,
  onSuccess: () => {
    emit('success');
  },
  onError: (error) => {
    logger.error('验证失败:', error);
  }
});

// 切换验证方式
const switchVerifyType = (type: VerifyType) => {
  switchType(type);
};

// 发送手机验证码
const handleSendSmsCode = async () => {
  // 检查是否可以发送（复用 useSmsCode 的状态检查）
  if (!smsCanSend.value) {
    return;
  }

  // 设置发送状态
  smsSending.value = true;

  try {
    // 对于验证流程，phoneForm.phone 可能是脱敏的手机号（如 135****3080）
    // 不能使用 useSmsCode 的 send 方法（会验证格式），应该直接调用 props.sendSmsCode
    // 验证流程会调用 sendSmsCodeForVerify()，不需要传递手机号，后端会使用当前用户的手机号
    // 绑定流程会调用 sendSmsCodeForBind(phone)，需要传递手机号
    // 这里传递 phoneForm.phone，即使它是脱敏的，对于验证流程也不影响（因为不会使用这个参数）
    await props.sendSmsCode(phoneForm.phone || '', 'auth');

    // 手动更新状态（因为绕过了 useSmsCode 的 send 方法）
    smsHasSent.value = true;
    BtcMessage.success('验证码已发送');

    // 开始倒计时
    smsCountdown.value = 60;
    const timer = setInterval(() => {
      smsCountdown.value--;
      if (smsCountdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error: any) {
    logger.error('发送手机验证码失败:', error);
    BtcMessage.error(error?.message || '发送验证码失败');
  } finally {
    smsSending.value = false;
  }
};

// 发送邮箱验证码
const handleSendEmailCode = async () => {
  try {
    // 对于验证流程，emailForm.email 可能是脱敏的邮箱（如 ml***@bellis-technology.cn）
    // useIdentityVerify 中的 sendEmailCode 会处理脱敏邮箱的情况
    // 验证流程会调用 sendEmailCodeForVerify()，不需要传递邮箱，后端会使用当前用户的邮箱
    await sendEmailCode();
  } catch (error: any) {
    logger.error('发送邮箱验证码失败:', error);
    BtcMessage.error(error?.message || '发送验证码失败');
  }
};

// 验证码输入完成
const handleSmsCodeComplete = () => {
  // 可以自动触发验证
};

const handleEmailCodeComplete = () => {
  // 可以自动触发验证
};

// 执行验证
const handleVerify = async () => {
  const result = await verify();

  // 只有验证成功时才继续，验证失败时 verify 会返回 false 并显示错误信息
  if (!result) {
    return;
  }
};

// 关闭弹窗
const handleClose = () => {
  if (verifying.value) {
    return;
  }
  reset();
  emit('cancel');
  visible.value = false;
};

// 检查手机号和邮箱绑定状态
// initialPhoneBound 和 initialEmailBound 用于在检查失败时保留初始状态
const checkBindingStatus = async (initialPhoneBound: boolean = false, initialEmailBound: boolean = false) => {
  if (checkingStatus.value) {
    return;
  }

  checkingStatus.value = true;
  try {
    // 检查手机号状态
    try {
      const phoneResponse = await props.checkPhoneBinding({ type: 'phone' });
      // 检查是否是错误响应对象
      if (phoneResponse && typeof phoneResponse === 'object' && 'code' in phoneResponse) {
        const errorObj = phoneResponse as any;
        if (errorObj.code && errorObj.code !== 200) {
          // 这是错误响应，抛出错误以便被 catch 捕获
          throw new Error(errorObj.msg || '检查手机号绑定状态失败');
        }
      }

      let phoneData = '';
      if (typeof phoneResponse === 'string') {
        phoneData = phoneResponse;
      } else if (phoneResponse && typeof phoneResponse === 'object') {
        const responseObj = phoneResponse as any;
        phoneData = responseObj.data || responseObj.phone || responseObj.phoneNumber || responseObj.value || '';
        // 确保 phoneData 是字符串类型
        if (typeof phoneData !== 'string') {
          if (phoneData && typeof phoneData === 'object') {
            const phoneDataObj = phoneData as any;
            phoneData = phoneDataObj.phone || phoneDataObj.value || phoneDataObj.data || '';
          } else {
            phoneData = '';
          }
        }
      }

      const isValidPhone = !!(
        phoneData &&
        typeof phoneData === 'string' &&
        phoneData.trim() !== '' &&
        phoneData !== 'null' &&
        phoneData !== 'undefined' &&
        phoneData !== '-' &&
        phoneData.length > 0
      );

      // 如果 API 返回有效数据，更新绑定状态；否则保留初始状态
      if (isValidPhone) {
        phoneBound.value = true;
      } else if (!initialPhoneBound) {
        // 只有在没有初始状态时才设置为 false
        phoneBound.value = false;
      }

      if (phoneBound.value && phoneData) {
        phoneForm.phone = phoneData.trim();
      } else {
        phoneForm.phone = '';
      }
    } catch (error: any) {
      console.warn('检查手机号绑定状态失败:', error);
      // 如果检查失败，保留初始状态（如果之前从 props.userInfo 中设置了）
      if (!initialPhoneBound) {
        phoneBound.value = false;
        phoneForm.phone = '';
      }
    }

    // 检查邮箱状态
    try {
      const emailResponse = await props.checkEmailBinding({ type: 'email' });
      // 检查是否是错误响应对象
      if (emailResponse && typeof emailResponse === 'object' && 'code' in emailResponse) {
        const errorObj = emailResponse as any;
        if (errorObj.code && errorObj.code !== 200) {
          // 这是错误响应，抛出错误以便被 catch 捕获
          throw new Error(errorObj.msg || '检查邮箱绑定状态失败');
        }
      }

      let emailData = '';
      if (typeof emailResponse === 'string') {
        emailData = emailResponse;
      } else if (emailResponse && typeof emailResponse === 'object') {
        const responseObj = emailResponse as any;
        emailData = responseObj.data || responseObj.email || responseObj.emailAddress || responseObj.value || '';
        // 确保 emailData 是字符串类型
        if (typeof emailData !== 'string') {
          if (emailData && typeof emailData === 'object') {
            const emailDataObj = emailData as any;
            emailData = emailDataObj.email || emailDataObj.value || emailDataObj.data || '';
          } else {
            emailData = '';
          }
        }
      }

      const isValidEmail = !!(
        emailData &&
        typeof emailData === 'string' &&
        emailData.trim() !== '' &&
        emailData !== 'null' &&
        emailData !== 'undefined' &&
        emailData !== '-' &&
        emailData.length > 0
      );

      // 如果 API 返回有效数据，更新绑定状态；否则保留初始状态
      if (isValidEmail) {
        emailBound.value = true;
      } else if (!initialEmailBound) {
        // 只有在没有初始状态时才设置为 false
        emailBound.value = false;
      }

      if (emailBound.value && emailData) {
        emailForm.email = emailData.trim();
      } else {
        emailForm.email = '';
      }
    } catch (error: any) {
      console.warn('检查邮箱绑定状态失败:', error);
      // 如果检查失败，保留初始状态（如果之前从 props.userInfo 中设置了）
      if (!initialEmailBound) {
        emailBound.value = false;
        emailForm.email = '';
      }
    }
  } catch (error: any) {
    logger.error('检查绑定状态失败:', error);
  } finally {
    checkingStatus.value = false;
  }
};

// 获取安全手机号
const fetchSecurePhone = async () => {
  if (loadingPhone.value || phoneForm.phone || !phoneBound.value) {
    return;
  }

  loadingPhone.value = true;
  try {
    const response = await props.checkPhoneBinding({ type: 'phone' });

    // 检查是否是错误响应对象
    if (response && typeof response === 'object' && 'code' in response) {
      const errorObj = response as any;
      if (errorObj.code && errorObj.code !== 200) {
        throw new Error(errorObj.msg || '获取安全手机号失败');
      }
    }

    let maskedPhone = '';
    if (typeof response === 'string') {
      maskedPhone = response;
    } else if (response && typeof response === 'object') {
      const responseObj = response as any;
      maskedPhone = responseObj.data || responseObj.phone || responseObj.phoneNumber || responseObj.value || '';
      // 确保 maskedPhone 是字符串类型
      if (typeof maskedPhone !== 'string') {
        maskedPhone = '';
      }
    }

    if (maskedPhone && typeof maskedPhone === 'string') {
      phoneForm.phone = maskedPhone.trim();
    }
  } catch (error: any) {
    logger.error('获取安全手机号失败:', error);
    BtcMessage.error(error?.message || '获取安全手机号失败');
    // 确保 phoneForm.phone 是字符串类型
    phoneForm.phone = '';
  } finally {
    loadingPhone.value = false;
  }
};

// 获取安全邮箱
const fetchSecureEmail = async () => {
  if (loadingEmail.value || emailForm.email || !emailBound.value) {
    return;
  }

  loadingEmail.value = true;
  try {
    const response = await props.checkEmailBinding({ type: 'email' });

    // 检查是否是错误响应对象
    if (response && typeof response === 'object' && 'code' in response) {
      const errorObj = response as any;
      if (errorObj.code && errorObj.code !== 200) {
        throw new Error(errorObj.msg || '获取安全邮箱失败');
      }
    }

    let maskedEmail = '';
    if (typeof response === 'string') {
      maskedEmail = response;
    } else if (response && typeof response === 'object') {
      const responseObj = response as any;
      maskedEmail = responseObj.data || responseObj.email || responseObj.emailAddress || responseObj.value || '';
      // 确保 maskedEmail 是字符串类型
      if (typeof maskedEmail !== 'string') {
        maskedEmail = '';
      }
    }

    if (maskedEmail && typeof maskedEmail === 'string') {
      emailForm.email = maskedEmail.trim();
    }
  } catch (error: any) {
    logger.error('获取安全邮箱失败:', error);
    BtcMessage.error(error?.message || '获取安全邮箱失败');
    // 确保 emailForm.email 是字符串类型
    emailForm.email = '';
  } finally {
    loadingEmail.value = false;
  }
};

// 监听弹窗打开，检查绑定状态
watch(visible, async (isVisible) => {
  if (!isVisible) {
    reset();
    return;
  }

  // 打开弹窗时，先根据传入的 userInfo 设置初始绑定状态和脱敏信息
  let initialPhoneBound = false;
  let initialEmailBound = false;
  if (props.userInfo) {
    const hasPhoneFromProps = !!(props.userInfo.phone && props.userInfo.phone !== '-' && props.userInfo.phone.trim() !== '');
    const hasEmailFromProps = !!(props.userInfo.email && props.userInfo.email !== '-' && props.userInfo.email.trim() !== '');

    if (hasPhoneFromProps && props.userInfo.phone) {
      phoneBound.value = true;
      initialPhoneBound = true;
      // 直接使用 props.userInfo 中的脱敏手机号，避免再次调用 API
      phoneForm.phone = props.userInfo.phone.trim();
    }
    if (hasEmailFromProps && props.userInfo.email) {
      emailBound.value = true;
      initialEmailBound = true;
      // 直接使用 props.userInfo 中的脱敏邮箱，避免再次调用 API
      emailForm.email = props.userInfo.email.trim();
    }
  }

  // 只有在 props.userInfo 中没有脱敏信息时，才调用 API 检查绑定状态
  // 如果已经有脱敏信息，说明已经绑定了，不需要再次检查
  if (!initialPhoneBound || !initialEmailBound) {
    await checkBindingStatus(initialPhoneBound, initialEmailBound);
  }

  // 根据绑定状态自动选择验证方式
  // 身份验证不受 editingField 影响，只要绑定了就可以使用
  if (hasEmailOnly.value) {
    if (currentVerifyType.value !== 'email') {
      switchVerifyType('email');
    }
  } else if (hasPhoneOnly.value) {
    if (currentVerifyType.value !== 'phone') {
      switchVerifyType('phone');
    }
  } else if (hasBoth.value) {
    // 同时支持两种验证方式时，默认选择第一个tab（手机号验证）
    if (currentVerifyType.value !== 'phone') {
      switchVerifyType('phone');
    }
    // 如果已经有脱敏信息（从 props.userInfo 中获取），就不需要再次调用 API
    if (currentVerifyType.value === 'phone' && !phoneForm.phone) {
      fetchSecurePhone();
    } else if (currentVerifyType.value === 'email' && !emailForm.email) {
      fetchSecureEmail();
    }
  }
}, { immediate: true });

// 监听验证方式切换，加载对应的安全信息
watch(currentVerifyType, (verifyType) => {
  if (!visible.value) {
    return;
  }

  // 只有在没有脱敏信息时才调用 API 获取
  // 如果已经有脱敏信息（从 props.userInfo 中获取），就不需要再次调用
  if (verifyType === 'phone' && hasPhone.value && !phoneForm.phone) {
    fetchSecurePhone();
  } else if (verifyType === 'email' && hasEmail.value && !emailForm.email) {
    fetchSecureEmail();
  }
});

// 监听弹窗关闭，重置状态
watch(visible, (val) => {
  if (!val) {
    reset();
  }
});
</script>

<style lang="scss">
@use './styles/dialog.scss' as *;
</style>

<style lang="scss" scoped>
@use './styles/index.scss' as *;
</style>
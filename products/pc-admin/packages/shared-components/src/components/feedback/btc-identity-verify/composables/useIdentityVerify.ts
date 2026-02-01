/**
 * 身份验证 Composable
 * 封装验证码发送和校验逻辑
 */

import { ref, reactive } from 'vue';
import { useSmsCode } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';

export type VerifyType = 'phone' | 'email';

export interface SendSmsCodeFn {
  (phone: string, smsType?: string): Promise<void>;
}

export interface SendEmailCodeFn {
  (email: string, smsType?: string): Promise<void>;
}

export interface VerifySmsCodeFn {
  (phone: string, smsCode: string, smsType?: string): Promise<void | boolean>;
}

export interface VerifyEmailCodeFn {
  (email: string, emailCode: string, smsType?: string): Promise<void | boolean>;
}

export interface IdentityVerifyOptions {
  /** 用户信息（包含手机号和邮箱） */
  userInfo: {
    phone?: string;
    email?: string;
  };
  /** 发送短信验证码函数 */
  sendSmsCode: SendSmsCodeFn;
  /** 发送邮箱验证码函数 */
  sendEmailCode: SendEmailCodeFn;
  /** 验证短信验证码函数 */
  verifySmsCode: VerifySmsCodeFn;
  /** 验证邮箱验证码函数 */
  verifyEmailCode: VerifyEmailCodeFn;
  /** 验证成功回调 */
  onSuccess?: () => void;
  /** 验证失败回调 */
  onError?: (error: Error) => void;
}

/**
 * 身份验证 Composable
 */
export function useIdentityVerify(options: IdentityVerifyOptions) {
  const { 
    userInfo, 
    sendSmsCode: sendSmsCodeApi,
    sendEmailCode: sendEmailCodeApi,
    verifySmsCode: verifySmsCodeApi,
    verifyEmailCode: verifyEmailCodeApi,
    onSuccess, 
    onError 
  } = options;

  // 当前验证方式
  const currentVerifyType = ref<VerifyType>('phone');

  // 手机号验证表单
  const phoneForm = reactive({
    phone: userInfo.phone || '',
    smsCode: ''
  });

  // 邮箱验证表单
  const emailForm = reactive({
    email: userInfo.email || '',
    emailCode: ''
  });

  // 验证状态
  const verifying = ref(false);
  const verifyError = ref('');

  // 手机号验证码 Composable
  const {
    countdown: smsCountdown,
    sending: smsSending,
    hasSent: smsHasSent,
    canSend: smsCanSend,
    send: sendSmsCode,
    reset: resetSmsCode
  } = useSmsCode({
    sendSmsCode: (data: { phone: string; smsType?: string }) => {
      return sendSmsCodeApi(data.phone, data.smsType);
    },
    countdown: 60,
    minInterval: 60,
    onSuccess: () => {
      BtcMessage.success('验证码已发送');
    },
    onError: (error: any) => {
      BtcMessage.error(error.message || '发送验证码失败');
    }
  });

  // 邮箱验证码状态
  const emailCountdown = ref(0);
  const emailSending = ref(false);
  const emailHasSent = ref(false);
  let emailCountdownTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * 发送邮箱验证码
   */
  const sendEmailCode = async () => {
    if (emailCountdown.value > 0 || emailSending.value) {
      return;
    }

    // 对于验证流程，emailForm.email 可能是脱敏的邮箱（如 ml***@bellis-technology.cn）
    // 不需要验证邮箱格式，因为验证流程会调用 sendEmailCodeForVerify()，不需要传递邮箱
    // 对于绑定流程，需要验证邮箱格式
    // 这里只检查是否有邮箱值，不验证格式（因为脱敏邮箱也符合格式）
    if (!emailForm.email) {
      BtcMessage.warning('请输入邮箱地址');
      return;
    }

    emailSending.value = true;

    try {
      // 调用 sendEmailCodeApi，对于验证流程会调用 sendEmailCodeForVerify()（不需要邮箱参数）
      // 对于绑定流程会调用 sendEmailCodeForBind(email, smsType)（需要邮箱参数）
      // 即使传递脱敏邮箱，对于验证流程也不影响（因为不会使用这个参数）
      // 注意：smsType 参数由外部传入的 sendEmailCodeApi 函数决定（绑定流程为 'bind'，验证流程为 'auth'）
      // 这里传递 'auth' 作为默认值，但实际值由 sendEmailCodeApi 函数内部决定
      await sendEmailCodeApi(emailForm.email, 'auth');

      emailHasSent.value = true;
      BtcMessage.success('验证码已发送');

      // 开始倒计时
      emailCountdown.value = 60;
      emailCountdownTimer = setInterval(() => {
        emailCountdown.value--;
        if (emailCountdown.value <= 0) {
          if (emailCountdownTimer) {
            clearInterval(emailCountdownTimer);
            emailCountdownTimer = null;
          }
        }
      }, 1000);
    } catch (error: any) {
      BtcMessage.error(error.message || '发送验证码失败');
      throw error;
    } finally {
      emailSending.value = false;
    }
  };

  /**
   * 验证身份
   */
  const verify = async (): Promise<boolean> => {
    verifying.value = true;
    verifyError.value = '';

    const handleFailure = (message: string, showToast = true) => {
      const finalMessage = message || '验证失败';
      verifyError.value = finalMessage;
      if (showToast && finalMessage) {
        BtcMessage.error(finalMessage);
      }
      onError?.(new Error(finalMessage));
      return false;
    };

    try {
      if (currentVerifyType.value === 'phone') {
        if (!phoneForm.phone) {
          return handleFailure('请输入手机号');
        }
        if (!phoneForm.smsCode || phoneForm.smsCode.length !== 6) {
          return handleFailure('请输入6位验证码');
        }

        const result = await verifySmsCodeApi(phoneForm.phone, phoneForm.smsCode, 'auth');
        if (result === false) {
          return handleFailure('验证码校验失败', false);
        }

        onSuccess?.();
        return true;
      } else {
        if (!emailForm.email) {
          return handleFailure('请输入邮箱地址');
        }
        if (!emailForm.emailCode || emailForm.emailCode.length !== 6) {
          return handleFailure('请输入6位验证码');
        }

        const result = await verifyEmailCodeApi(emailForm.email, emailForm.emailCode, 'auth');
        if (result === false) {
          return handleFailure('验证码校验失败', false);
        }

        onSuccess?.();
        return true;
      }
    } catch (error: any) {
      const err = error instanceof Error ? error : new Error(error?.message || error?.msg || '验证失败');
      const message = err.message || '验证失败';
      // 避免重复 toast：若 verifyError 已设置则说明前面已提示
      if (!verifyError.value) {
        verifyError.value = message;
        BtcMessage.error(message);
      }
      onError?.(err);
      return false;
    } finally {
      verifying.value = false;
    }
  };

  /**
   * 重置状态
   */
  const reset = () => {
    phoneForm.smsCode = '';
    emailForm.emailCode = '';
    verifyError.value = '';
    resetSmsCode();
    
    if (emailCountdownTimer) {
      clearInterval(emailCountdownTimer);
      emailCountdownTimer = null;
    }
    emailCountdown.value = 0;
    emailSending.value = false;
    emailHasSent.value = false;
  };

  /**
   * 切换验证方式
   */
  const switchVerifyType = (type: VerifyType) => {
    currentVerifyType.value = type;
    reset();
  };

  return {
    // 状态
    currentVerifyType,
    phoneForm,
    emailForm,
    verifying,
    verifyError,
    
    // 手机号验证码
    smsCountdown,
    smsSending,
    smsHasSent,
    smsCanSend,
    sendSmsCode,
    
    // 邮箱验证码
    emailCountdown,
    emailSending,
    emailHasSent,
    sendEmailCode,
    
    // 方法
    verify,
    reset,
    switchVerifyType
  };
}


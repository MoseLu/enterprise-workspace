/**
 * 短信登录相关工具函数
 */

import { ref, reactive, computed } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { validatePhone, validateSmsCode } from '../../../auth/shared/composables/validation';
import { sendSmsCode, smsLogin } from '../../../auth/shared/composables/api';
import { createCountState } from '../../../auth/shared/composables/state';

/**
 * 短信登录表单数据
 */
export interface SmsLoginForm {
  phone: string;
  smsCode: string;
}

/**
 * 创建短信登录表单
 * @param initialData 初始数据
 * @returns 短信登录表单对象
 */
export function createSmsLoginForm(initialData: Partial<SmsLoginForm> = {}) {
  const form = reactive<SmsLoginForm>({
    phone: '',
    smsCode: '',
    ...initialData
  });

  return {
    form
  };
}

/**
 * 短信登录验证规则
 */
export function createSmsLoginRules() {
  return {
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      {
        validator: (rule: any, value: string, callback: Function) => {
          if (!validatePhone(value)) {
            callback(new Error('请输入正确的手机号'));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ],
    smsCode: [
      { required: true, message: '请输入短信验证码', trigger: 'blur' },
      {
        validator: (rule: any, value: string, callback: Function) => {
          if (!validateSmsCode(value)) {
            callback(new Error('请输入6位数字验证码'));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ]
  };
}

/**
 * 创建短信发送处理函数
 * @param form 登录表单
 * @returns 短信发送处理对象
 */
export function createSmsSender(form: SmsLoginForm) {
  const { count: smsCountdown, setCount: setSmsCountdown, reset: resetSmsCountdown } = createCountState(0, 60);
  const sendingSms = ref(false);
  const hasSentSms = ref(false);

  const handleSendSms = async () => {
    if (!form.phone) {
      BtcMessage.warning('请先输入手机号');
      return;
    }

    if (!validatePhone(form.phone)) {
      BtcMessage.warning('请输入正确的手机号');
      return;
    }

    try {
      sendingSms.value = true;
      const response = await sendSmsCode(form.phone, 'login');

      if (response.code === 2000) {
        BtcMessage.success('验证码已发送');
        hasSentSms.value = true;
        
        // 开始倒计时
        setSmsCountdown(60);
        const timer = setInterval(() => {
          setSmsCountdown(smsCountdown.value - 1);
          if (smsCountdown.value <= 0) {
            clearInterval(timer);
          }
        }, 1000);
      } else {
        BtcMessage.error(response.msg || '发送失败，请重试');
      }
    } catch (error: any) {
      BtcMessage.error(error.message || '发送失败，请重试');
    } finally {
      sendingSms.value = false;
    }
  };

  const canSendSms = computed(() => {
    return validatePhone(form.phone) && smsCountdown.value === 0 && !sendingSms.value;
  });

  return {
    smsCountdown,
    sendingSms,
    hasSentSms,
    canSendSms,
    handleSendSms,
    resetSmsCountdown
  };
}

/**
 * 创建短信登录处理函数
 * @param form 登录表单
 * @param onSuccess 成功回调
 * @param onError 错误回调
 * @returns 短信登录处理函数
 */
export function createSmsLoginHandler(
  form: SmsLoginForm,
  onSuccess?: (data: any) => void,
  onError?: (error: any) => void
) {
  const loading = ref(false);

  const handleLogin = async () => {
    if (!form.phone || !form.smsCode) {
      BtcMessage.warning('请填写完整的登录信息');
      return;
    }

    if (!validatePhone(form.phone)) {
      BtcMessage.warning('请输入正确的手机号');
      return;
    }

    if (!validateSmsCode(form.smsCode)) {
      BtcMessage.warning('请输入6位数字验证码');
      return;
    }

    try {
      loading.value = true;
      const response = await smsLogin({
        phone: form.phone,
        smsCode: form.smsCode
      });

      if (response.code === 2000) {
        BtcMessage.success('登录成功');
        onSuccess?.(response.data);
      } else {
        BtcMessage.error(response.msg || '登录失败');
        onError?.(response);
      }
    } catch (error: any) {
      BtcMessage.error(error.message || '登录失败，请重试');
      onError?.(error);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    handleLogin
  };
}

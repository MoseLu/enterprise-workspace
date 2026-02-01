import { ref, reactive } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useSmsCode } from '@btc/shared-core';
import { authApi, codeApi } from '@/modules/api-services';

export function useForgetPassword() {
  const router = useRouter();
  const { t } = useI18n();

  // 表单数据
  const form = reactive({
    phone: '',
    smsCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 状态
  const loading = ref(false);

  // 使用验证码 Composable
  const {
    countdown: smsCountdown,
    sending,
    hasSent: hasSentSms,
    send: sendSmsCodeInternal
  } = useSmsCode({
    sendSmsCode: codeApi.sendSmsCode,
    countdown: 60,
    minInterval: 60,
    onSuccess: () => {
      BtcMessage.success(t('auth.message.sms_code_sent'));
    },
    onError: (error) => {
      BtcMessage.error(error.message || t('auth.message.sms_code_send_failed'));
    }
  });

  // 表单验证规则
  const rules = reactive({
    phone: [
      { required: true, message: t('auth.validation.phone_required'), trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: t('auth.validation.phone_format'), trigger: 'blur' }
    ],
    smsCode: [
      { required: true, message: t('auth.validation.sms_code_required'), trigger: 'blur' },
      { len: 6, message: t('auth.validation.sms_code_length'), trigger: 'blur' }
    ],
    newPassword: [
      { required: true, message: t('auth.validation.new_password_required'), trigger: 'blur' },
      { min: 6, max: 20, message: t('auth.validation.password_length'), trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: t('auth.validation.confirm_new_password_required'), trigger: 'blur' },
      {
        validator: (rule: any, value: string, callback: Function) => {
          if (value !== form.newPassword) {
            callback(new Error(t('auth.validation.confirm_password_mismatch')));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ]
  });

  // 发送验证码
  const sendSmsCode = async () => {
    if (!form.phone) {
      BtcMessage.warning(t('auth.message.phone_required_for_sms'));
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      BtcMessage.warning(t('auth.message.phone_format_error'));
      return;
    }

    try {
      // 使用验证码 Composable 发送
      await sendSmsCodeInternal(form.phone, 'reset');
    } catch (error) {
      // 错误已通过 onError 回调处理
    }
  };

  // 重置密码
  const resetPassword = async (formRef: any) => {
    if (!formRef) return;

    try {
      await formRef.validate();
      loading.value = true;

      await authApi.resetPassword({
        phone: form.phone,
        smsCode: form.smsCode,
        newPassword: form.newPassword
      });

      BtcMessage.success(t('auth.message.reset_password_success'));
      
      // 跳转到登录页
      setTimeout(() => {
        router.push('/login?from=forget-password');
      }, 1500);
    } catch (error: any) {
      if (error.message) {
        BtcMessage.error(error.message);
      }
      throw error;
    } finally {
      loading.value = false;
    }
  };


  return {
    form,
    rules,
    loading,
    sending,
    smsCountdown,
    hasSentSms,
    sendSmsCode,
    resetPassword
  };
}


import { onBeforeUnmount, ref } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { service } from '@services/eps';

export function useEmailVerification() {
  const emailUpdateCountdown = ref(0);
  const emailUpdateSending = ref(false);
  let emailUpdateTimer: ReturnType<typeof setInterval> | null = null;

  const clearEmailUpdateTimer = () => {
    if (emailUpdateTimer) {
      clearInterval(emailUpdateTimer);
      emailUpdateTimer = null;
    }
  };

  const resetEmailUpdateCountdown = () => {
    clearEmailUpdateTimer();
    emailUpdateCountdown.value = 0;
    emailUpdateSending.value = false;
  };

  const sendUpdateEmailCode = async (email: string) => {
    if (emailUpdateCountdown.value > 0 || emailUpdateSending.value) {
      return;
    }

    if (!email || !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(email)) {
      BtcMessage.warning('请输入正确的邮箱地址');
      return;
    }

    const emailService = service.admin?.base?.email;
    if (!emailService?.bind) {
      BtcMessage.warning('邮箱服务不可用');
      return;
    }

    emailUpdateSending.value = true;
    try {
      await emailService.bind({
        email,
        type: 'bind'
      });
      BtcMessage.success('验证码已发送');

      emailUpdateCountdown.value = 60;
      clearEmailUpdateTimer();
      emailUpdateTimer = setInterval(() => {
        emailUpdateCountdown.value--;
        if (emailUpdateCountdown.value <= 0) {
          resetEmailUpdateCountdown();
        }
      }, 1000);
    } catch (error: any) {
      BtcMessage.error(error?.message || '发送验证码失败');
    } finally {
      emailUpdateSending.value = false;
    }
  };

  onBeforeUnmount(() => {
    resetEmailUpdateCountdown();
  });

  return {
    emailUpdateCountdown,
    emailUpdateSending,
    sendUpdateEmailCode,
    resetEmailUpdateCountdown
  };
}


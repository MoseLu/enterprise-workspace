<template>
  <div class="card-content">
    <LoginContainer
      :current-login-mode="currentLoginMode"
      :handle-switch-login-mode="handleSwitchLoginMode"
      :show-forgot-password="currentLoginMode === 'password'"
      :t="t"
    >
      <!-- 密码登录 -->
      <PasswordForm
        v-show="currentLoginMode === 'password'"
      />

      <!-- 短信登录 -->
      <SmsForm
        v-show="currentLoginMode === 'sms'"
        :form="smsForm"
        :saving="smsSaving"
        :sms-countdown="smsCountdown"
        :has-sent-sms="hasSentSms"
        :send-sms-code="sendSmsCode"
        :handle-phone-enter="handlePhoneEnter"
        :on-code-complete="onCodeComplete"
        :on-login="onLogin"
        :t="t"
      />

      <!-- 二维码登录 -->
      <QrForm
        v-show="currentLoginMode === 'qr'"
        :qr-code-url="qrCodeUrl"
        :refresh-qr-code="refreshQrCode"
        :t="t"
      />
    </LoginContainer>
  </div>
</template>

<script setup lang="ts">
import PasswordForm from '../password-form/index.vue';
import SmsForm from '../sms-form/index.vue';
import QrForm from '../qr-form/index.vue';
import LoginContainer from '../../auth/shared/components/login-container/index.vue';

defineOptions({
  name: 'LoginContent'
});

interface Props {
  currentLoginMode: string;
  isSaving: boolean;
  handleSwitchLoginMode: (mode: string) => void;
  toggleQrLogin: () => void;
  t: (key: string) => string;
  passwordForm: any;
  passwordLoading: boolean;
  passwordRules: any;
  passwordSubmit: () => void;
  smsForm: any;
  smsSaving: boolean;
  smsCountdown: number;
  hasSentSms: boolean;
  sendSmsCode: () => void;
  handlePhoneEnter: () => void;
  onCodeComplete: (code: string) => void;
  onLogin: () => void;
  qrCodeUrl: string;
  refreshQrCode: () => void;
}

const props = defineProps<Props>();
</script>

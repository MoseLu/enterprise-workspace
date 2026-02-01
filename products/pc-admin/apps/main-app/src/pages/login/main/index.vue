<template>
  <LoginMain
    :current-login-mode="props.currentLoginMode"
    :is-saving="props.isSaving"
    :toggle-icon="props.toggleIcon"
    :toggle-label="props.toggleLabel"
    :handle-switch-login-mode="props.handleSwitchLoginMode"
    :toggle-qr-login="props.toggleQrLogin"
    :t="props.t"
    :app="props.app"
    :password-form="props.passwordForm"
    :password-loading="props.passwordLoading"
    :password-rules="props.passwordRules"
    :password-submit="props.passwordSubmit"
    :sms-form="props.smsForm"
    :sms-saving="props.smsSaving"
    :sms-countdown="props.smsCountdown"
    :has-sent-sms="props.hasSentSms"
    :send-sms-code="props.sendSmsCode"
    :handle-phone-enter="props.handlePhoneEnter"
    :on-code-complete="props.onCodeComplete"
    :on-login="props.onLogin"
    :qr-code-url="props.qrCodeUrl"
    :refresh-qr-code="props.refreshQrCode"
  />
</template>

<script setup lang="ts">
import LoginMain from './login-main.vue';

defineOptions({
  name: 'LoginMain'
});

interface Props {
  currentLoginMode: string;
  isSaving: boolean;
  toggleIcon: string;
  toggleLabel: string;
  handleSwitchLoginMode: (mode: string) => void;
  toggleQrLogin: () => void;
  t: (key: string) => string;
  app: any;
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

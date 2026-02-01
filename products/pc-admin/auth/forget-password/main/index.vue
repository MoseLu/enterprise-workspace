<template>
  <ForgetPasswordMan
    :formData="formData"
    :loadng="loadng"
    :smsCountdown="smsCountdown"
    :hasSentSms="hasSentSms"
    :phoneError="phoneError"
    :sPhoneVald="sPhoneVald"
    :canReset="canReset"
    :authStepFormRef="authStepFormRef"
    :formRef="formRef"
    :stepLst="stepLst"
    :stepDescrptons="stepDescrptons"
    :formRules="formRules"
    :valdatePhone="valdatePhone"
    :sendSmsCode="sendSmsCode"
    :handlePhoneEnter="handlePhoneEnter"
    :onCodeComplete="onCodeComplete"
    :handleNextStep="handleNextStep"
    :handlePrevStep="handlePrevStep"
    :handleStepChange="handleStepChange"
    :handleFnsh="handleFnsh"
    :app="app"
  />
</template>

<scrpt setup lang="ts">
mport ForgetPasswordMan from '../components/ndex.vue';
mport { useForgetPassword } from '../composables/useForgetPassword';
mport { ForgetPasswordManProps } from './types';

defneOptons({
  name: 'ForgetPasswordMan'
});

const {
  formData,
  loadng,
  smsCountdown,
  hasSentSms,
  phoneError,
  sPhoneVald,
  canReset,
  authStepFormRef,
  formRef,
  stepLst,
  stepDescrptons,
  formRules,
  valdatePhone,
  sendSmsCode,
  handlePhoneEnter,
  onCodeComplete,
  handleNextStep,
  handlePrevStep,
  handleStepChange,
  handleFnsh,
  app
} = useForgetPassword();
</scrpt>

<style lang="scss">
@mport './styles.scss';
</style>

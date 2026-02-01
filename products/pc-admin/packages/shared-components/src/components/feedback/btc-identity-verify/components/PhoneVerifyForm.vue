<template>
  <div class="verify-form__content">
    <div class="verify-form__item">
      <span class="verify-form__item-label">手机号</span>
      <div class="verify-form__item-text">
        <span v-if="loading" class="verify-form__item-loading">
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
          加载中...
        </span>
        <span v-else-if="phone" class="verify-form__item-value">
          {{ maskedPhone }}
        </span>
        <el-input
          v-else
          v-model="phoneValue"
          placeholder="请输入手机号（用于验证和绑定）"
          size="large"
          :disabled="verifying"
          @update:model-value="handlePhoneChange"
        />
      </div>
    </div>

    <div class="verify-form__item verify-form__item-code">
      <label :for="`phone-sms-code-0`" class="verify-form__item-label">验证码</label>
      <div class="verify-form__item-code-wrapper">
        <component
          v-if="smsCodeInputComponent"
          :is="smsCodeInputComponent"
          id-prefix="phone-sms-code"
          :model-value="smsCode"
          size="small"
          :disabled="!smsHasSent || verifying"
          @update:model-value="handleSmsCodeChange"
          @complete="handleSmsCodeComplete"
        />
        <el-button
          class="send-code-btn"
          type="primary"
          plain
          size="large"
          :disabled="!smsCanSend || !phone || verifying"
          :loading="smsSending"
          @click="handleSendSmsCode"
        >
          {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
        </el-button>
        <div v-if="!hasPhone && phone" class="verify-form__item-hint">
          验证成功后，该手机号将自动绑定
        </div>
      </div>
    </div>

    <div class="verify-form__item">
      <el-button
        class="verify-form__item-button"
        type="primary"
        size="large"
        :loading="verifying"
        :disabled="!smsCode || smsCode.length !== 6"
        @click="handleVerify"
      >
        立即验证
      </el-button>
    </div>

    <div v-if="verifyError" class="verify-form__item-error">
      {{ verifyError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import { hidePhone } from '@btc/shared-core/utils/format';
import type { Component } from 'vue';

defineOptions({
  name: 'BtcPhoneVerifyForm'
});

interface Props {
  phone: string;
  smsCode: string;
  loading: boolean;
  verifying: boolean;
  verifyError?: string;
  smsCountdown: number;
  smsSending: boolean;
  smsHasSent: boolean;
  smsCanSend: boolean;
  hasPhone: boolean;
  smsCodeInputComponent?: Component;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:phone': [value: string];
  'update:smsCode': [value: string];
  'send-sms-code': [];
  'verify': [];
  'sms-code-complete': [];
}>();

const phoneValue = computed({
  get: () => props.phone,
  set: (val) => emit('update:phone', val)
});

const maskedPhone = computed(() => {
  if (!props.phone) {
    return '';
  }
  return hidePhone(props.phone);
});

const handlePhoneChange = (value: string) => {
  emit('update:phone', value);
};

const handleSmsCodeChange = (value: string) => {
  emit('update:smsCode', value);
};

const handleSendSmsCode = () => {
  emit('send-sms-code');
};

const handleVerify = () => {
  emit('verify');
};

const handleSmsCodeComplete = () => {
  emit('sms-code-complete');
};
</script>

<style lang="scss" scoped>
@use '../styles/form.scss' as *;
</style>


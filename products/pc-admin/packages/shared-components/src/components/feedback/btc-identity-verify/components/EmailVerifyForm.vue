<template>
  <div class="verify-form__content">
    <div class="verify-form__item">
      <span class="verify-form__item-label">邮箱</span>
      <div class="verify-form__item-text">
        <span v-if="loading" class="verify-form__item-loading">
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
          加载中...
        </span>
        <span v-else-if="email" class="verify-form__item-value">
          {{ maskedEmail }}
        </span>
        <el-input
          v-else
          v-model="emailValue"
          placeholder="请输入邮箱（用于验证和绑定）"
          size="large"
          :disabled="verifying"
          @update:model-value="handleEmailChange"
        />
      </div>
    </div>

    <div class="verify-form__item verify-form__item-code">
      <label :for="`email-sms-code-0`" class="verify-form__item-label">验证码</label>
      <div class="verify-form__item-code-wrapper">
        <component
          v-if="smsCodeInputComponent"
          :is="smsCodeInputComponent"
          id-prefix="email-sms-code"
          :model-value="emailCode"
          size="small"
          :disabled="!emailHasSent || verifying"
          @update:model-value="handleEmailCodeChange"
          @complete="handleEmailCodeComplete"
        />
        <el-button
          class="send-code-btn"
          type="primary"
          plain
          size="large"
          :disabled="emailCountdown > 0 || emailSending || !email || verifying"
          :loading="emailSending"
          @click="handleSendEmailCode"
        >
          {{ emailCountdown > 0 ? `${emailCountdown}s` : '获取验证码' }}
        </el-button>
      </div>
    </div>

    <div class="verify-form__item">
      <el-button
        class="verify-form__item-button"
        type="primary"
        size="large"
        :loading="verifying"
        :disabled="!emailCode || emailCode.length !== 6"
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
import type { Component } from 'vue';

defineOptions({
  name: 'BtcEmailVerifyForm'
});

interface Props {
  email: string;
  emailCode: string;
  loading: boolean;
  verifying: boolean;
  verifyError?: string;
  emailCountdown: number;
  emailSending: boolean;
  emailHasSent: boolean;
  smsCodeInputComponent?: Component;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:email': [value: string];
  'update:emailCode': [value: string];
  'send-email-code': [];
  'verify': [];
  'email-code-complete': [];
}>();

const emailValue = computed({
  get: () => props.email,
  set: (val) => emit('update:email', val)
});

// 脱敏邮箱显示
const maskedEmail = computed(() => {
  if (!props.email) {
    return '';
  }
  // 邮箱脱敏：显示前3位和@后的域名，中间用***代替
  const email = props.email;
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) {
    return email;
  }
  const prefix = email.substring(0, Math.min(3, atIndex));
  const suffix = email.substring(atIndex);
  return `${prefix}***${suffix}`;
});

const handleEmailChange = (value: string) => {
  emit('update:email', value);
};

const handleEmailCodeChange = (value: string) => {
  emit('update:emailCode', value);
};

const handleSendEmailCode = () => {
  emit('send-email-code');
};

const handleVerify = () => {
  emit('verify');
};

const handleEmailCodeComplete = () => {
  emit('email-code-complete');
};
</script>

<style lang="scss" scoped>
@use '../styles/form.scss' as *;
</style>


<template>
  <div class="forget-password-form">
    <el-form ref="formRef" :model="form" :rules="rules" :label-width="0" class="form" autocomplete="off">
      <!-- 手机号 -->
      <el-form-item prop="phone">
        <el-input
          id="forget-password-phone"
          v-model="form.phone"
          name="phone"
          autocomplete="off"
          :placeholder="t('auth.phone_placeholder')"
          size="large"
          maxlength="11"
          @keyup.enter="handlePhoneEnter"
        >
          <template #suffix>
            <el-button
              :disabled="smsCountdown > 0 || !form.phone || sending"
              @click="handleSendSmsCode"
              class="sms-btn"
            >
              {{ smsCountdown > 0 ? `${smsCountdown}s` : t('auth.get_sms_code') }}
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <!-- 验证码 -->
      <el-form-item prop="smsCode">
        <BtcSmsCodeInput
          v-model="form.smsCode"
          :disabled="!hasSentSms"
          @complete="handleCodeComplete"
        />
      </el-form-item>

      <!-- 新密码 -->
      <el-form-item prop="newPassword">
        <el-input
          id="forget-password-new-password"
          v-model="form.newPassword"
          name="newPassword"
          type="password"
          autocomplete="new-password"
          :placeholder="t('auth.new_password_placeholder')"
          size="large"
          show-password
          maxlength="20"
          @keyup.enter="(e) => handleEnterKey(e, e.target as HTMLElement)"
        />
      </el-form-item>

      <!-- 确认密码 -->
      <el-form-item prop="confirmPassword">
        <el-input
          id="forget-password-confirm-password"
          v-model="form.confirmPassword"
          name="confirmPassword"
          type="password"
          autocomplete="new-password"
          :placeholder="t('auth.confirm_new_password_placeholder')"
          size="large"
          show-password
          maxlength="20"
          @keyup.enter="(e) => handleEnterKey(e, e.target as HTMLElement)"
        />
      </el-form-item>
    </el-form>

    <!-- 提交按钮 -->
    <div class="op">
      <el-button type="primary" size="large" :loading="loading" @click="handleSubmit">
        {{ t('auth.reset_password') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import type { FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import BtcSmsCodeInput from '../../auth/shared/components/sms-code-input/index.vue';
import { useFormEnterKey } from '../../auth/shared/composables/useFormEnterKey';

defineOptions({
  name: 'BtcForgetPasswordForm'
});

interface Props {
  form: {
    phone: string;
    smsCode: string;
    newPassword: string;
    confirmPassword: string;
  };
  rules: any;
  loading?: boolean;
  sending?: boolean;
  smsCountdown?: number;
  hasSentSms?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'send-sms': [];
  'code-complete': [];
  'submit': [];
}>();

const { t } = useI18n();
const formRef = ref<FormInstance>();

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  emit('submit');
};

// 使用 Enter 键处理 Composable
const { handleEnterKey } = useFormEnterKey({
  formRef,
  onSubmit: handleSubmit
});

// 发送验证码
const handleSendSmsCode = () => {
  emit('send-sms');
};

// 手机号输入框回车事件
const handlePhoneEnter = async (event: KeyboardEvent) => {
  if (!props.hasSentSms) {
    // 如果还没发送验证码，发送验证码
    event.preventDefault();
    handleSendSmsCode();
    // 发送成功后，自动聚焦验证码输入框
    await nextTick();
    setTimeout(() => {
      if (props.hasSentSms) {
        handleEnterKey(event, event.target as HTMLElement);
      }
    }, 100);
  } else {
    // 如果已发送验证码，聚焦验证码输入框
    handleEnterKey(event, event.target as HTMLElement);
  }
};

// 验证码输入完成
const handleCodeComplete = () => {
  emit('code-complete');
};

// 暴露表单引用供父组件使用
defineExpose({
  formRef,
  validate: () => formRef.value?.validate()
});
</script>

<style lang="scss" scoped>
.forget-password-form {
  display: flex;
  flex-direction: column;
  width: 100%;

  .form {
    .el-form-item {
      margin-bottom: 24px;
    }

    .el-input {
      width: 100%;
    }
  }

  .op {
    width: 100%;
    margin-top: 4px;

    .el-button {
      width: 100%;
    }
  }
}
</style>


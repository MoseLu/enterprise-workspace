<template>
  <BtcLoginFormLayout>
    <template #form>
      <el-form ref="formRef" :model="form" :rules="rules" :label-width="0" class="form" name="sms-login-form" action="javascript:void(0)" method="post" @submit.prevent.stop="handleSubmit">
        <el-form-item prop="phone">
          <el-input
            id="sms-phone"
            v-model="form.phone"
            name="phone"
            autocomplete="tel"
            :placeholder="t('请输入手机号')"
            size="large"
            maxlength="11"
            class="phone-input"
            @keyup.enter="handlePhoneEnter"
          >
            <template #suffix>
              <el-button
                :disabled="!canSend || !form.phone"
                :loading="sending"
                @click="handleSendSmsCode"
                class="sms-btn"
                native-type="button"
              >
                {{ countdown > 0 ? `${countdown}s` : t('获取验证码') }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="smsCode">
          <BtcSmsCodeInput
            v-model="form.smsCode"
            :disabled="!hasSent"
            @complete="handleCodeComplete"
          />
        </el-form-item>
        
        <!-- 提交按钮放在表单内部 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            :disabled="!form.smsCode || form.smsCode.length !== 6"
            native-type="submit"
          >
            {{ t('auth.login.immediately') }}
          </el-button>
        </el-form-item>
      </el-form>
    </template>

    <!-- 按钮已移到表单内部，不再需要单独的 button 插槽 -->
  </BtcLoginFormLayout>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue';
import type { FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { BtcMessage } from '@btc/shared-components';
import { useSmsCode } from '@btc/shared-core';
import { codeApi } from '@/modules/api-services';
import BtcLoginFormLayout from '../../shared/components/login-form-layout/index.vue';
import BtcSmsCodeInput from '../../shared/components/sms-code-input/index.vue';
import { useFormEnterKey } from '../../shared/composables/useFormEnterKey';

defineOptions({
  name: 'BtcSmsForm'
});

interface Props {
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<{
  submit: [form: { phone: string; smsCode: string }];
  'send-sms': [];
  'code-complete': [];
}>();

const { t } = useI18n();

// 表单数据
const form = reactive({
  phone: '',
  smsCode: ''
});

// 表单验证规则
const rules = reactive({
  phone: [
    { required: true, message: t('请输入手机号'), trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: t('请输入正确的手机号'), trigger: 'blur' }
  ],
  smsCode: [
    { required: true, message: t('请输入验证码'), trigger: 'blur' },
    { len: 6, message: t('验证码长度为6位'), trigger: 'blur' }
  ]
});

const formRef = ref<FormInstance>();

// 使用验证码 Composable
const {
  countdown,
  sending,
  hasSent,
  canSend,
  send: sendCode
} = useSmsCode({
  sendSmsCode: codeApi.sendSmsCode,
  countdown: 60,
  minInterval: 60,
  onSuccess: () => {
    BtcMessage.success(t('验证码已发送'));
    emit('send-sms');
  },
  onError: (error) => {
    BtcMessage.error(error.message || t('发送验证码失败'));
  }
});

// 防止重复提交的标记
let isSubmitting = false;

// 提交函数
const handleSubmit = async (event?: Event) => {
  // 关键：确保阻止默认表单提交行为
  if (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }
  
  if (!formRef.value) return;
  
  // 防止重复提交
  if (isSubmitting) {
    return;
  }
  
  try {
    isSubmitting = true;
    await formRef.value.validate();
    emit('submit', { ...form });
  } catch {
    // 验证失败
  } finally {
    // 延迟重置标记，确保异步操作完成
    setTimeout(() => {
      isSubmitting = false;
    }, 100);
  }
};

// 使用 Enter 键处理 Composable（用于验证码输入框和其他输入框）
const { handleEnterKey: handleFormEnterKey } = useFormEnterKey({
  formRef,
  onSubmit: handleSubmit
});

// 发送验证码
const handleSendSmsCode = async () => {
  if (!formRef.value) return;

  try {
    // 验证手机号
    await formRef.value.validateField('phone');
    
    // 使用验证码 Composable 发送
    await sendCode(form.phone, 'login');
  } catch {
    // 验证失败或发送失败，错误已通过 onError 回调处理
  }
};

// 手机号输入框回车事件
const handlePhoneEnter = async (event: KeyboardEvent) => {
  if (!hasSent.value) {
    // 如果还没发送验证码，发送验证码
    event.preventDefault();
    await handleSendSmsCode();
    // 发送成功后，自动聚焦验证码输入框
    if (hasSent.value) {
      await nextTick();
      // 聚焦下一个输入框（验证码输入框）
      handleFormEnterKey(event, event.target as HTMLElement);
    }
  } else {
    // 如果已发送验证码，聚焦验证码输入框
    handleFormEnterKey(event, event.target as HTMLElement);
  }
};

// 验证码输入完成
const handleCodeComplete = () => {
  emit('code-complete');
};

// 在组件挂载时，直接拦截原生表单的 submit 事件
let nativeSubmitHandler: ((e: Event) => void) | null = null;
onMounted(async () => {
  await nextTick();
  // 等待 DOM 更新
  await nextTick();
  const formElement = formRef.value?.$el as HTMLFormElement | undefined;
  if (formElement) {
    // 关键：确保表单没有 action 和 method 属性（防止默认提交）
    // 如果 action 是当前页面 URL，会导致页面刷新
    formElement.removeAttribute('action');
    formElement.setAttribute('action', 'javascript:void(0)');
    formElement.setAttribute('method', 'post');
    formElement.setAttribute('onsubmit', 'return false;');
    
    // 直接拦截原生表单的 submit 事件（使用捕获阶段，确保最先执行）
    nativeSubmitHandler = (e: Event) => {
      // 关键：必须在这里调用 preventDefault，否则表单会提交
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      // 调用我们的处理函数
      handleSubmit(e);
      // 返回 false 作为额外保护
      return false;
    };
    formElement.addEventListener('submit', nativeSubmitHandler, { capture: true, passive: false });
    
    // 额外保护：直接覆盖表单的 submit 方法（如果存在）
    if (formElement.submit) {
      const originalSubmit = formElement.submit;
      formElement.submit = function() {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        if (nativeSubmitHandler) {
          nativeSubmitHandler(event);
        }
        return false;
      };
    }
  }
});

onBeforeUnmount(() => {
  if (nativeSubmitHandler) {
    const formElement = formRef.value?.$el as HTMLFormElement | undefined;
    if (formElement) {
      formElement.removeEventListener('submit', nativeSubmitHandler, { capture: true });
    }
    nativeSubmitHandler = null;
  }
});

// 暴露表单数据和方法供父组件使用
defineExpose({
  form,
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  countdown,
  hasSent,
  handleSendSmsCode
});
</script>

<style lang="scss" scoped>
.form {
  .el-form-item {
    margin-bottom: 0; // 使用 gap 控制间距，不需要 margin-bottom
  }

  .el-input {
    width: 100%;
  }
  
  // 确保按钮在表单内部时样式正确
  .el-form-item:last-child {
    margin-bottom: 0;
    
    .el-button {
      width: 100%;
    }
  }

  // 强制覆盖手机号输入框的自动填充背景，保持 Element Plus 默认样式
  :deep(.phone-input .el-input__wrapper),
  :deep(.el-form-item .el-input__wrapper) {
    // 移除任何可能的半透明蓝色背景（#465A7E66），使用 Element Plus 默认背景色
    &[style*="#465A7E"],
    &[style*="465A7E66"],
    &[style*="rgba(70, 90, 126"] {
      background: var(--el-fill-color-blank) !important;
      background-color: var(--el-fill-color-blank) !important;
    }
    
    // 当包含自动填充的输入框时，使用 Element Plus 默认背景色
    &:has(input:-webkit-autofill),
    &:has(.el-input__inner:-webkit-autofill) {
      background-color: var(--el-fill-color-blank) !important;
      background: var(--el-fill-color-blank) !important;
    }
  }

  :deep(.sms-btn) {
    font-size: 14px;
    padding: 8px 12px;
    height: auto;
    min-width: 80px;
    border: none;
    background: none;
    color: var(--el-text-color-regular);
    transition: all 0.3s ease;

    &:hover:not(.is-disabled) {
      color: var(--el-color-primary);
      background-color: rgba(64, 158, 255, 0.1);
    }

    &:active:not(.is-disabled) {
      transform: translateY(1px);
      background-color: rgba(64, 158, 255, 0.2);
    }

    &.is-disabled {
      color: var(--el-text-color-disabled) !important;
      background: none !important;
      border: none !important;
      cursor: not-allowed !important;
    }
  }
}
</style>

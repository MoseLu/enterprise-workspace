<template>
  <BtcLoginFormLayout>
    <template #form>
      <el-form ref="formRef" :model="form" :rules="rules" :label-width="0" class="form" autocomplete="off" name="password-login-form" @submit.prevent.stop="handleSubmit">
        <!-- 隐藏的假输入框，用于欺骗浏览器自动填充 -->
        <input 
          id="fake-username" 
          name="fake-username" 
          type="text" 
          style="position: absolute; left: -9999px; opacity: 0; pointer-events: none;" 
          tabindex="-1" 
        />
        <input 
          id="fake-password" 
          name="fake-password" 
          type="password" 
          style="position: absolute; left: -9999px; opacity: 0; pointer-events: none;" 
          tabindex="-1" 
        />
        
        <el-form-item prop="username">
          <el-input
            id="login-username"
            v-model="form.username"
            :name="`username_${Math.random().toString(36).substr(2, 9)}`"
            autocomplete="off"
            :placeholder="t('请输入用户名或邮箱')"
            size="large"
            maxlength="50"
            @keyup.enter="(e) => handleEnterKey(e, e.target as HTMLElement)"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            id="login-password"
            v-model="form.password"
            :name="`password_${Math.random().toString(36).substr(2, 9)}`"
            type="password"
            autocomplete="off"
            :placeholder="t('请输入密码')"
            size="large"
            show-password
            maxlength="20"
            @keyup.enter="(e) => handleEnterKey(e, e.target as HTMLElement)"
          />
        </el-form-item>
        
        <!-- 提交按钮放在表单内部 -->
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" native-type="submit">
            {{ t('auth.login.immediately') }}
          </el-button>
        </el-form-item>
      </el-form>
    </template>

    <!-- 按钮已移到表单内部，不再需要单独的 button 插槽 -->

    <template #extra>
      <div class="forgot-password-link">
        <router-link to="/forget-password" class="link">
          {{ t('auth.login.password.forgot') }}
          <el-icon class="arrow-right">
            <ArrowRight />
          </el-icon>
        </router-link>
      </div>
    </template>
  </BtcLoginFormLayout>
</template>

<script setup lang="ts">
import { storage } from '@btc/shared-utils';
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';
import type { FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { ArrowRight } from '@element-plus/icons-vue';
import BtcLoginFormLayout from '../../shared/components/login-form-layout/index.vue';
import { useFormEnterKey } from '../../shared/composables/useFormEnterKey';
import { useDisableAutofill } from '../../shared/composables/useDisableAutofill';

defineOptions({
  name: 'BtcPasswordForm'
});

interface Props {
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<{
  submit: [form: { username: string; password: string }];
}>();

const { t } = useI18n();

// 表单数据
const form = reactive({
  username: storage.get<string>('username') || '',
  password: ''
});

// 表单验证规则
const rules = reactive({
  username: [
    { required: true, message: t('请输入用户名或邮箱'), trigger: 'blur' },
    { min: 2, max: 50, message: t('用户名长度在 2 到 50 个字符'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('请输入密码'), trigger: 'blur' },
    { min: 6, max: 20, message: t('密码长度在 6 到 20 个字符'), trigger: 'blur' }
  ]
});

const formRef = ref<FormInstance>();

// 防止重复提交的标记
let isSubmitting = false;

// 提交函数
const handleSubmit = async (event?: Event) => {
  if (import.meta.env.DEV) {
    console.log('[PasswordForm] handleSubmit 被调用', { hasEvent: !!event });
  }
  
  // 关键：确保阻止默认表单提交行为
  if (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    if (import.meta.env.DEV) {
      console.log('[PasswordForm] 已阻止默认表单提交行为');
    }
  }
  
  if (!formRef.value) {
    if (import.meta.env.DEV) {
      console.warn('[PasswordForm] formRef 不存在，无法提交');
    }
    return;
  }
  
  // 防止重复提交
  if (isSubmitting) {
    if (import.meta.env.DEV) {
      console.warn('[PasswordForm] 正在提交中，忽略重复提交');
    }
    return;
  }
  
  try {
    isSubmitting = true;
    if (import.meta.env.DEV) {
      console.log('[PasswordForm] 开始验证表单');
    }
    
    await formRef.value.validate();
    
    if (import.meta.env.DEV) {
      console.log('[PasswordForm] 表单验证通过，emit submit 事件', { username: form.username, hasPassword: !!form.password });
    }
    
    emit('submit', { ...form });
  } catch (error) {
    // 验证失败，不继续执行
    if (import.meta.env.DEV) {
      console.warn('[PasswordForm] 表单验证失败:', error);
    }
  } finally {
    // 延迟重置标记，确保异步操作完成
    setTimeout(() => {
      isSubmitting = false;
      if (import.meta.env.DEV) {
        console.log('[PasswordForm] 重置 isSubmitting 标记');
      }
    }, 100);
  }
};

// 使用 Enter 键处理 Composable
const { handleEnterKey } = useFormEnterKey({
  formRef,
  onSubmit: handleSubmit
});

// 使用禁用自动填充 Composable
useDisableAutofill();

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
  resetFields: () => formRef.value?.resetFields()
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
}

.forgot-password-link {
  margin-top: 16px;
}
</style>

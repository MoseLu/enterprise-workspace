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
import { ref, reactive } from 'vue';
import type { FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { ArrowRight } from '@element-plus/icons-vue';
import BtcLoginFormLayout from '../../auth/shared/components/login-form-layout/index.vue';
import { useFormEnterKey } from '../../auth/shared/composables/useFormEnterKey';
import { useDisableAutofill } from '../../auth/shared/composables/useDisableAutofill';

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
const handleSubmit = async () => {
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
    // 验证失败，不继续执行
  } finally {
    // 延迟重置标记，确保异步操作完成
    setTimeout(() => {
      isSubmitting = false;
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

<template>
  <div class="auth-page">
    <!-- 背景装饰 -->
    <div class="bg">
      <btc-svg name="bg"></btc-svg>
    </div>

    <!-- 注册卡片 -->
    <div class="auth-card login-card register-card">
      <!-- 卡片头部 -->
      <div class="card-header">
        <div class="title">
          <div class="logo">
            <img src="/icons/android-chrome-192x192.png" alt="BTC Admin Logo" />
          </div>
          <h1>{{ viewModel.app.info.name }}</h1>
        </div>

        <!-- 右上角登录链接 -->
        <router-link to="/login?from=register" class="login-link">
          {{ viewModel.t('已有账号？立即登录') }}
          <el-icon class="arrow-right">
            <ArrowRight />
          </el-icon>
        </router-link>
      </div>

      <!-- 注册主要内容 -->
      <div class="card-content register-content">
        <!-- 第一步：租户类型选择 -->
        <tenant-selector
          v-if="currentStep === 0"
          v-model="formData.tenantType"
          @next="handleNextStep"
        />

        <!-- 第二步：具体注册表单 -->
        <div v-else-if="currentStep === 1" class="registration-form">
          <component
            :is="getRegistrationComponent()"
            v-model="formData"
            @prev="handlePrevStep"
            @next="handleNextStep"
            @finish="handleFinish"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import { useRegister } from '../composables/useRegister';
import TenantSelector from '../tenant-selector/index.vue';
import SupplierRegistration from '../components/supplier-registration/index.vue';
import UkHeadRegistration from '../components/uk-head-registration/index.vue';
import InertRegistration from '../components/inert-registration/index.vue';
;


defineOptions({
  name: 'RegisterMain'
});

// 使用 useRegister 获取必要的功能
const viewModel = useRegister();

// 响应式数据
const currentStep = ref(0);
const formData = ref({
  tenantType: '',
  // 其他表单字段
});

// 计算属性
const getRegistrationComponent = () => {
  // 转换为小写以进行匹配
  const tenantType = formData.value.tenantType?.toLowerCase();
  switch (tenantType) {
    case 'supplier':
      return SupplierRegistration;
    case 'uk-head':
      return UkHeadRegistration;
    case 'inert':
      return InertRegistration;
    default:
      return null;
  }
};

// 方法
const handleNextStep = () => {
  currentStep.value++;
};

const handlePrevStep = () => {
  currentStep.value--;
};

const handleFinish = () => {
  // 完成注册逻辑
  console.info('注册完成', formData.value);
};
</script>


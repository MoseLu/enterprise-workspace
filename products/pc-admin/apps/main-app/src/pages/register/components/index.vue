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
        <a href="/login" class="login-link">
          {{ viewModel.t('已有账号？立即登录') }}
          <el-icon class="arrow-right">
            <ArrowRight />
          </el-icon>
        </a>
      </div>

      <!-- 注册主要内容 -->
      <div class="card-content register-content">
        <!-- 租户选择页面 - 使用现有布局 -->
        <div v-if="viewModel.currentStep.value === 'tenant-select'" class="register-main">
          <!-- 第一部分：注册标题 -->
          <div class="register-header">
            <h2>选择租户类型</h2>
            <p>请选择您要注册的租户类型</p>
          </div>

          <!-- 第二部分：租户选择组件 -->
          <div class="register-selector">
            <TenantSelector
              ref="tenantSelectorRef"
              @tenant-selected="handleTenantSelected"
            />
          </div>

          <!-- 第三部分：操作按钮组 -->
          <div class="register-actions">
            <!-- 退出注册按钮 - 始终显示 -->
            <el-button
              type="default"
              @click="handleCancelRegistration"
            >
              {{ viewModel.t('退出注册') }}
            </el-button>

            <!-- 租户选择页面的下一步按钮 -->
            <el-button
              type="primary"
              :disabled="!selectedTenant"
              @click="handleNextStep"
            >
              {{ viewModel.t('下一步') }}
            </el-button>
          </div>
        </div>

        <!-- 注册表单页面 - 直接显示对应表单 -->
        <div v-else-if="viewModel.currentStep.value === 'registration-form'" class="registration-form-container">
          <!-- INERT 供应商注册 -->
          <InertRegistration
            v-if="selectedTenant === 'inert'"
            ref="inertRegistrationRef"
            @registration-complete="handleRegistrationComplete"
            @back-to-tenant-select="handleBackToTenantSelect"
          />

          <!-- UK-HEAD 英国总部注册 -->
          <UkHeadRegistration
            v-else-if="selectedTenant === 'uk-head'"
            ref="ukHeadRegistrationRef"
            @registration-complete="handleRegistrationComplete"
            @back-to-tenant-select="handleBackToTenantSelect"
          />

          <!-- SUPPLIER 供应商注册 -->
          <SupplierRegistration
            v-else-if="selectedTenant === 'supplier'"
            ref="supplierRegistrationRef"
            @registration-complete="handleRegistrationComplete"
            @back-to-tenant-select="handleBackToTenantSelect"
          />
        </div>
      </div>

      <!-- 版权信息 -->
      <div class="card-footer">
        <p>
          {{
            viewModel.t('Copyright © {year} {appName}', {
              year: dayjs().year(),
              appName: viewModel.app.info.name,
            })
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { useRegister } from '../composables/useRegister';
import TenantSelector from '../../tenant-selector/index.vue';
import SupplierRegistration from './supplier-registration/index.vue';
import UkHeadRegistration from './uk-head-registration/index.vue';
import InertRegistration from './inert-registration/index.vue';
;


defineOptions({
  name: 'RegisterComponents'
});

// 使用 useRegister 获取必要的功能
const viewModel = useRegister();

// 响应式数据
const selectedTenant = ref('');
const tenantSelectorRef = ref();
const inertRegistrationRef = ref();
const ukHeadRegistrationRef = ref();
const supplierRegistrationRef = ref();

// 处理租户选择
const handleTenantSelected = (tenant: string) => {
  selectedTenant.value = tenant;
  console.info('选择的租户类型:', tenant);
};

// 处理下一步
const handleNextStep = () => {
  if (selectedTenant.value) {
    viewModel.currentStep.value = 'registration-form';
  }
};

// 处理取消注册
const handleCancelRegistration = () => {
  // 重置状态
  selectedTenant.value = '';
  viewModel.currentStep.value = 'tenant-select';

  // 可以添加路由跳转到登录页
  console.info('取消注册');
};

// 处理返回租户选择
const handleBackToTenantSelect = () => {
  selectedTenant.value = '';
  viewModel.currentStep.value = 'tenant-select';
};

// 处理注册完成
const handleRegistrationComplete = (data: any) => {
  console.info('注册完成:', data);

  // 可以添加成功提示和跳转逻辑
  viewModel.app.message.success('注册成功！');

  // 跳转到登录页或仪表板
  setTimeout(() => {
    // 关键：使用 Vue Router 的 push 方法，避免页面刷新
    const router = viewModel.app.router;
    if (router) {
      router.push('/login').catch((err) => {
        if (import.meta.env.DEV) {
          console.error('[register] router.push 失败，但不使用 window.location.href 避免页面刷新:', err);
        }
      });
    } else {
      if (import.meta.env.DEV) {
        console.warn('[register] router 不可用，无法跳转到登录页');
      }
    }
  }, 2000);
};

// 组件挂载后的初始化
onMounted(() => {
  console.info('注册组件已挂载');
});
</script>

<style lang="scss" scoped>
@use '/@/modules/base/pages/auth/shared/styles/auth.scss';

.auth-page {
  .register-card {
    .register-main {
      .register-header {
        text-align: center;
        margin-bottom: 30px;

        h2 {
          font-size: 24px;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
        }

        p {
          font-size: 14px;
          color: var(--el-text-color-regular);
        }
      }

      .register-selector {
        margin-bottom: 30px;
      }

      .register-actions {
        display: flex;
        justify-content: space-between;
        gap: 12px;

        .el-button {
          flex: 1;
          max-width: 150px;
        }
      }
    }

    .registration-form-container {
      width: 100%;
    }
  }
}
</style>

<template>
  <BtcAuthLayout class="glassmorphism">
    <div class="login-card">
      <BtcAuthHeader>
        <template #toggle>
          <BtcQrToggleBtn
            :icon="toggleInfo.icon"
            :label="toggleInfo.label"
            @click="handleToggleQrLogin"
          />
        </template>
      </BtcAuthHeader>

      <!-- 注册表单（非二维码模式）使用 el-scrollbar 包裹 -->
      <el-scrollbar v-if="currentLoginMode !== 'qr'" class="card-content-scrollbar">
        <div class="card-content">
          <!-- 返回登录链接 - 与登录页面的"前往注册"链接位置一致 -->
          <div class="back-to-login-wrapper">
            <div class="back-to-login">
              <router-link to="/login?from=register" class="back-to-login-link">
                {{ t('auth.back_to_login') }}
                <el-icon class="arrow-right">
                  <ArrowRight />
                </el-icon>
              </router-link>
            </div>
          </div>

          <BtcRegisterForm
            :form="form"
            :rules="rules"
            :loading="loading"
            @submit="handleSubmit"
            ref="formRef"
          />

          <!-- 协议文本 -->
          <BtcAgreementText 
            ref="agreementRef"
            @agreement-change="handleAgreementChange" 
          />
        </div>
      </el-scrollbar>

      <!-- 二维码登录不使用 el-scrollbar，直接使用 card-content -->
      <div v-else class="card-content qr-only">
        <BtcQrForm
          :qr-code-url="qrCodeUrl"
          @refresh="handleRefreshQrCode"
        />
      </div>
    </div>
  </BtcAuthLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ArrowRight } from '@element-plus/icons-vue';
import BtcAuthLayout from '../auth/shared/components/auth-layout/index.vue';
import BtcAuthHeader from '../auth/shared/components/auth-header/index.vue';
import BtcQrToggleBtn from '../auth/shared/components/qr-toggle-btn/index.vue';
import BtcRegisterForm from './register-form/index.vue';
import BtcQrForm from '../login/qr-form/index.vue';
import BtcAgreementText from '../auth/shared/components/agreement-text/index.vue';
import { BtcMessage } from '@btc/shared-components';
import { useRegister } from './composables/useRegister';
import { useAuthTabs } from '../auth/shared/composables/useAuthTabs';
import { useQrLogin } from '../login/composables/useQrLogin';
;

import '../auth/shared/styles/index.scss';

defineOptions({
  name: 'Register'
});

const { t } = useI18n();
const router = useRouter();
const formRef = ref();
const agreementRef = ref();
// 协议同意状态
const isAgreed = ref(false);

// 登录模式管理（初始模式为 password，表示注册模式）
const { currentLoginMode, isQrMode, toggleQrLogin, getToggleInfo } = useAuthTabs('password');

// 二维码登录
const { qrCodeUrl, refreshQrCode } = useQrLogin();

// 切换二维码登录
const handleToggleQrLogin = () => {
  // 如果当前是二维码模式，切换到账号登录时应该跳转到登录页面
  if (isQrMode.value) {
    router.push('/login?from=register');
  } else {
    // 从注册模式切换到二维码登录
    toggleQrLogin();
  }
};

// 获取切换按钮信息
const toggleInfo = computed(() => {
  return getToggleInfo();
});

// 刷新二维码
const handleRefreshQrCode = () => {
  refreshQrCode();
};

const {
  form,
  rules,
  loading,
  register
} = useRegister();

// 协议状态变化处理
const handleAgreementChange = (agreed: boolean) => {
  isAgreed.value = agreed;
};

// 检查协议同意状态
const checkAgreement = (): boolean => {
  if (!isAgreed.value) {
    BtcMessage.warning(t('auth.message.agreement_required'));
    return false;
  }
  return true;
};

// 提交表单
const handleSubmit = async () => {
  try {
  if (!formRef.value) return;
    if (!checkAgreement()) {
      return;
    }
  await register(formRef.value.formRef);
  } catch (error) {
    console.error('注册错误:', error);
    // 错误已在 useRegister 中处理，这里只是防止未捕获的错误
  }
};
</script>

<style lang="scss">
// 注册页面样式已经在共享样式中定义
</style>


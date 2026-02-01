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

      <!-- 账户登录（账号登录和手机号登录）使用 el-scrollbar 包裹 -->
      <el-scrollbar v-if="currentLoginMode !== 'qr'" class="card-content-scrollbar">
        <div class="card-content">
          <!-- 登录模式切换Tabs -->
          <BtcLoginTabs
            :current-mode="currentLoginMode"
            @tab-change="handleSwitchLoginMode"
          />

          <!-- 账密登录表单 -->
          <BtcPasswordForm
            v-if="currentLoginMode === 'password'"
            key="password-form"
            :loading="passwordLoading"
            @submit="handlePasswordSubmit"
          />

          <!-- 短信验证码登录表单 -->
          <BtcSmsForm
            v-if="currentLoginMode === 'sms'"
            key="sms-form"
            :loading="smsLoading"
            @submit="handleSmsSubmit"
            @send-sms="handleSendSms"
            @code-complete="handleCodeComplete"
          />

          <!-- 第三方登录 -->
          <BtcThirdPartyLogin />

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
import { computed, ref, nextTick } from 'vue';
import { useI18n } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';
import BtcAuthLayout from '../shared/components/auth-layout/index.vue';
import BtcAuthHeader from '../shared/components/auth-header/index.vue';
import BtcQrToggleBtn from '../shared/components/qr-toggle-btn/index.vue';
import BtcLoginTabs from '../shared/components/login-tabs/index.vue';
import BtcPasswordForm from './password-form/index.vue';
import BtcSmsForm from './sms-form/index.vue';
import BtcQrForm from './qr-form/index.vue';
import BtcThirdPartyLogin from '../shared/components/third-party-login/index.vue';
import BtcAgreementText from '../shared/components/agreement-text/index.vue';
import { useAuthTabs, type LoginMode } from '../shared/composables/useAuthTabs';
import { usePasswordLogin } from './composables/usePasswordLogin';
import { useSmsLogin } from './composables/useSmsLogin';
import { useQrLogin } from './composables/useQrLogin';
import '../shared/styles/index.scss';

defineOptions({
  name: 'Login'
});

const { t } = useI18n();

// 协议组件引用
const agreementRef = ref();
// 协议同意状态
const isAgreed = ref(false);
// 防止重复提交的标记
let isSubmitting = false;

// 登录模式管理
const { currentLoginMode, switchLoginMode, toggleQrLogin, getToggleInfo } = useAuthTabs('password');

// 账密登录
const { loading: passwordLoading, submit: passwordSubmit } = usePasswordLogin();

// 短信登录
const { loading: smsLoading, submit: smsSubmit } = useSmsLogin();

// 二维码登录
const { qrCodeUrl, refreshQrCode } = useQrLogin();

// 切换登录模式
const handleSwitchLoginMode = (mode: LoginMode) => {
  switchLoginMode(mode);
};

// 切换二维码登录
const handleToggleQrLogin = () => {
  toggleQrLogin();
};

// 获取切换按钮信息
const toggleInfo = computed(() => {
  return getToggleInfo();
});

// 协议状态变化处理
const handleAgreementChange = (agreed: boolean) => {
  isAgreed.value = agreed;
};

// 检查协议同意状态
const checkAgreement = async (): Promise<boolean> => {
  if (!isAgreed.value) {
    // 自动勾选协议，提升用户体验
    if (agreementRef.value) {
      agreementRef.value.checkAgreement();
      // 等待 Vue 响应式更新完成（使用 nextTick 确保状态已同步）
      // 需要等待多个 nextTick，确保 watch 和事件处理完成
      await nextTick();
      await nextTick();
      // 再次检查状态，如果已经勾选，显示提示并返回 false，需要用户再次点击登录
      if (isAgreed.value) {
        // 显示提示，告知用户已自动勾选，需要再次点击登录
        BtcMessage.success(t('auth.message.agreement_auto_checked'));
        // 返回 false，需要用户再次点击登录
        return false;
      }
    }
    // 如果自动勾选失败，显示提示
    BtcMessage.success(t('auth.message.agreement_auto_checked'));
    // 返回 false，需要用户再次点击登录
    return false;
  }
  return true;
};

// 账密登录提交
const handlePasswordSubmit = async (form: { username: string; password: string }) => {
  // 防止重复提交
  if (isSubmitting) {
    return;
  }

  try {
    isSubmitting = true;
    if (!(await checkAgreement())) {
      // 协议检查失败，重置提交标记，允许用户再次提交
      isSubmitting = false;
      return;
    }
    await passwordSubmit(form);
  } catch (error) {
    console.error('密码登录错误:', error);
    // 错误已在 usePasswordLogin 中处理，这里只是防止未捕获的错误
  } finally {
    // 延迟重置标记，确保异步操作完成
    setTimeout(() => {
      isSubmitting = false;
    }, 100);
  }
};

// 短信登录提交
const handleSmsSubmit = async (form: { phone: string; smsCode: string }) => {
  // 防止重复提交
  if (isSubmitting) {
    return;
  }

  try {
    isSubmitting = true;
    if (!(await checkAgreement())) {
      // 协议检查失败，重置提交标记，允许用户再次提交
      isSubmitting = false;
      return;
    }
    await smsSubmit(form);
  } catch (error) {
    // 错误已在 useSmsLogin 中处理，这里只是防止未捕获的错误
    console.error('短信登录错误:', error);
  } finally {
    // 延迟重置标记，确保异步操作完成
    setTimeout(() => {
      isSubmitting = false;
    }, 100);
  }
};

// 发送短信验证码（已由SmsForm内部处理，这里只是占位）
const handleSendSms = () => {
  // 可以在这里添加额外的逻辑
};

// 验证码输入完成（已由SmsForm内部处理，这里只是占位）
const handleCodeComplete = () => {
  // 可以在这里添加自动登录逻辑
};

// 刷新二维码
const handleRefreshQrCode = () => {
  refreshQrCode();
};
</script>

<style lang="scss">
// 登录页面特定样式（如果需要）可以在共享样式基础上扩展
</style>

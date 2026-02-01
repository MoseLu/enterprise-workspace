<template>
  <div class="login-container">
    <!-- Tab Bar -->
    <div class="login-tabs">
      <LoginTabs
        :current-login-mode="currentLoginMode"
        :t="t"
        @tab-change="handleSwitchLoginMode"
        @go-to-register="() => {}"
      />
    </div>

    <!-- 动态表单内容 -->
    <div class="form-content">
      <slot />
    </div>

    <!-- 第三方登录 - 只在非二维码登录模式下显示 -->
    <div v-if="currentLoginMode !== 'qr'" class="third-party-login">
      <third-party-login :show-forgot-password="showForgotPassword" />
    </div>

    <!-- 协议文本 - 只在非二维码登录模式下显示 -->
    <div v-if="currentLoginMode !== 'qr'" class="agreement-text">
      <agreement-text />
    </div>
  </div>
</template>

<script lang="ts" setup>
import LoginTabs from '../../../login/tabs/index.vue';
import ThirdPartyLogin from '../auth/index.vue';
import AgreementText from '../ui/index.vue';

defineOptions({
  name: 'LoginContainer'
});

interface Props {
  currentLoginMode: 'password' | 'sms' | 'qr';
  handleSwitchLoginMode: (mode: 'password' | 'sms' | 'qr') => void;
  showForgotPassword?: boolean;
  t: (key: string, params?: any) => string;
}

const props = withDefaults(defineProps<Props>(), {
  showForgotPassword: false
});
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 24px; // 上下左右都是 24px
  box-sizing: border-box;

  // 统一的间距管理 - 为各个子容器添加顶部和底部边距
  .login-tabs {
    box-sizing: border-box;
    padding-top: 0; // Tab Bar 不需要顶部边距
    padding-bottom: 8px; // Tab Bar 底部边距
  }

  .form-content {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding-top: 8px; // 表单内容顶部边距
    padding-bottom: 8px; // 表单内容底部边距
  }

  .third-party-login {
    box-sizing: border-box;
    padding-top: 8px; // 第三方登录顶部边距
    padding-bottom: 8px; // 第三方登录底部边距
  }

  .agreement-text {
    box-sizing: border-box;
    padding-top: 8px; // 协议文本顶部边距
    padding-bottom: 0; // 协议文本不需要底部边距
  }

  // 响应式设计 - 移动端调整统一边距
  @media (max-width: 768px) {
    padding: 20px; // 移动端：上下左右都是 20px
  }
}
</style>

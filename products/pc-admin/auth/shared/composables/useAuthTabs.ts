import { ref } from 'vue';

export type LoginMode = 'password' | 'sms' | 'qr';

export function useAuthTabs(initialMode: LoginMode = 'password') {
  const currentLoginMode = ref<LoginMode>(initialMode);
  const isQrMode = ref(false);

  // 切换登录模式
  const switchLoginMode = (mode: LoginMode) => {
    if (mode === 'qr') {
      isQrMode.value = true;
      currentLoginMode.value = 'qr';
    } else {
      isQrMode.value = false;
      currentLoginMode.value = mode;
    }
  };

  // 切换二维码登录
  const toggleQrLogin = () => {
    if (isQrMode.value) {
      // 从二维码模式切换回普通登录模式（默认账密登录）
      isQrMode.value = false;
      currentLoginMode.value = 'password';
    } else {
      // 切换到二维码登录模式
      isQrMode.value = true;
      currentLoginMode.value = 'qr';
    }
  };

  // 获取切换按钮的图标和标签
  const getToggleInfo = () => {
    if (isQrMode.value) {
      return {
        icon: 'pc' as const,
        label: 'auth.login.toggle.account'
      };
    } else {
      return {
        icon: 'qr' as const,
        label: 'auth.login.toggle.qr'
      };
    }
  };

  return {
    currentLoginMode,
    isQrMode,
    switchLoginMode,
    toggleQrLogin,
    getToggleInfo
  };
}

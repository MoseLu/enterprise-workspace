import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export type LoginMode = 'password' | 'sms' | 'qr';

/**
 * 从 URL 查询参数解析登录模式
 */
function parseModeFromQuery(query: Record<string, any>): LoginMode {
  const mode = query.mode as string | undefined;
  if (mode === 'qr' || mode === 'password' || mode === 'sms') {
    return mode;
  }
  return 'password'; // 默认账密登录
}

export function useAuthTabs(initialMode?: LoginMode) {
  const route = useRoute();
  const router = useRouter();
  
  // 从 URL 查询参数读取初始模式，如果没有则使用传入的 initialMode，最后默认为 'password'
  const urlMode = parseModeFromQuery(route.query);
  const resolvedInitialMode = initialMode ?? urlMode;
  
  const currentLoginMode = ref<LoginMode>(resolvedInitialMode);
  const isQrMode = computed(() => currentLoginMode.value === 'qr');

  /**
   * 更新 URL 查询参数中的 mode
   */
  const updateUrlMode = (mode: LoginMode) => {
    const currentMode = route.query.mode as string | undefined;
    
    // 如果 URL 中的模式已经是目标模式，则不需要更新
    if (currentMode === mode) {
      return;
    }
    
    const query = { ...route.query };
    if (mode === 'password') {
      // 默认模式可以不显示在 URL 中，或者显示为 password
      // 为了明确性，我们保留 password 参数
      query.mode = 'password';
    } else {
      query.mode = mode;
    }
    
    // 使用 replace 避免在历史记录中留下过多记录
    router.replace({
      path: route.path,
      query
    });
  };

  // 切换登录模式
  const switchLoginMode = (mode: LoginMode) => {
    currentLoginMode.value = mode;
    updateUrlMode(mode);
  };

  // 切换二维码登录
  const toggleQrLogin = () => {
    if (isQrMode.value) {
      // 从二维码模式切换回普通登录模式（默认账密登录）
      currentLoginMode.value = 'password';
    } else {
      // 切换到二维码登录模式
      currentLoginMode.value = 'qr';
    }
    updateUrlMode(currentLoginMode.value);
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

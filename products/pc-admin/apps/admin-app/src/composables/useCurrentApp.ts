import { getCurrentSubApp } from '@btc/shared-core/configs/unified-env-config';

/**
 * 获取当前应用名称
 * 使用统一的环境检测方案
 */
export function useCurrentApp() {
  const route = useRoute();
  const currentApp = ref('system');

  const detectCurrentApp = () => {
    // 使用统一的环境检测函数
    const detectedApp = getCurrentSubApp();
    if (detectedApp) {
      currentApp.value = detectedApp;
      return;
    }
    
    // 如果没有检测到子应用，尝试通过路径前缀判断（开发环境的兜底逻辑）
    const path = route.path;
    if (path.startsWith('/admin')) {
      // 管理域
      currentApp.value = 'admin';
    } else if (path.startsWith('/logistics')) {
      currentApp.value = 'logistics';
    } else if (path.startsWith('/engineering')) {
      currentApp.value = 'engineering';
    } else if (path.startsWith('/quality')) {
      currentApp.value = 'quality';
    } else if (path.startsWith('/production')) {
      currentApp.value = 'production';
    } else if (path.startsWith('/finance')) {
      currentApp.value = 'finance';
    } else if (path.startsWith('/docs')) {
      currentApp.value = 'docs';
    } else {
      // 系统域是默认域，包括 /、/data/* 以及其他所有未匹配的路径
      currentApp.value = 'system';
    }
  };

  watch(
    () => route.path,
    () => {
      detectCurrentApp();
    },
    { immediate: true }
  );

  return {
    currentApp,
    detectCurrentApp,
  };
}


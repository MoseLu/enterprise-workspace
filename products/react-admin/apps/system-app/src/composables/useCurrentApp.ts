import { getActiveApp } from '@/store/tabRegistry';

/**
 * 子域名到应用名称的映射
 */
const subdomainToAppMap: Record<string, string> = {
  'admin.bellis.com.cn': 'admin',
  'logistics.bellis.com.cn': 'logistics',
  'quality.bellis.com.cn': 'quality',
  'production.bellis.com.cn': 'production',
  'engineering.bellis.com.cn': 'engineering',
  'finance.bellis.com.cn': 'finance',
  'dashboard.bellis.com.cn': 'dashboard',
  'personnel.bellis.com.cn': 'personnel',
};

/**
 * 根据子域名获取应用名称
 */
function getAppFromSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname;
  return subdomainToAppMap[hostname] || null;
}

/**
 * 获取当前应用名称
 */
export function useCurrentApp() {
  const route = useRoute();
  const currentApp = ref('system');

  const detectCurrentApp = () => {
    // 首先检查子域名
    const subdomainApp = getAppFromSubdomain();
    if (subdomainApp) {
      currentApp.value = subdomainApp;
      return;
    }
    
    // 然后使用统一的 getActiveApp 函数
    currentApp.value = getActiveApp(route.path);
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


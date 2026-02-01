/**
 * 退出登录 composable
 * 使用共享的 useLogout，传递应用特定的配置
 */
import { useLogout as useSharedLogout } from '@btc/shared-core/composables/useLogout';
import { useUser } from './useUser';
import { useProcessStore } from '@/store/process';
import { deleteCookie } from '@btc/shared-core/utils/cookie';
import { appStorage } from '@/utils/app-storage';

/**
 * 获取 authApi（从全局获取）
 */
const getAuthApi = () => {
  return (window as any).__APP_AUTH_API__;
};

/**
 * 退出登录 composable
 */
export function useLogout() {
  const { clearUserInfo } = useUser();
  const processStore = useProcessStore();

  // 使用共享的 useLogout，传递应用特定的配置
  return useSharedLogout({
    authApi: getAuthApi(),
    clearUserInfo,
    getProcessStore: async () => processStore,
    deleteCookie,
    getAppStorage: () => appStorage,
  });
}
/**
 * 退出登录 composable
 * 使用共享的 useLogout，传递应用特定的配置
 */
import { useLogout as useSharedLogout } from '@btc/shared-core/composables/useLogout';
import { useUser, useProcessStore } from '@btc/shared-components';
import { deleteCookie } from '@btc/shared-core/utils/cookie';

/**
 * 获取 authApi（从全局获取）
 */
const getAuthApi = () => {
  return (window as any).__APP_AUTH_API__;
};

/**
 * 获取 appStorage（从全局获取）
 */
const getAppStorage = () => {
  return (window as any).__APP_STORAGE__ || (window as any).appStorage;
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
    getAppStorage,
  });
}
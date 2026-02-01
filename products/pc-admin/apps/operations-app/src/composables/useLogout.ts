/**
 * 退出登录 composable
 * 使用共享的 useLogout，传递应用特定的配置
 */
import { useLogout as useSharedLogout } from '@btc/shared-core/composables/useLogout';
import { useProcessStore } from '@btc/shared-components';
import { deleteCookie } from '@btc/shared-core/utils/cookie';
import { appStorage } from '@/utils/app-storage';
import { storage } from '@btc/shared-utils';

/**
 * 获取 authApi（从全局获取）
 */
const getAuthApi = () => {
  return (window as any).__APP_AUTH_API__;
};

/**
 * 清除用户信息（不使用 useUser，直接使用 appStorage）
 */
const clearUserInfo = () => {
  try {
    // 使用 appStorage.user.remove 清除 Cookie
    appStorage.user?.remove();
    // 清理旧的 storage 数据（向后兼容）
    storage.remove('btc_user');
    storage.remove('user');
  } catch (err) {
    // 静默失败
  }
};

/**
 * 退出登录 composable
 */
export function useLogout() {
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

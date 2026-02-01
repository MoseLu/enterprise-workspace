;
import { ref, computed } from 'vue';
import { storage, logger } from '@btc/shared-core/utils';

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string | number;
  name?: string;
  username: string;
  email?: string;
  avatar?: string;
  position?: string;
  [key: string]: any;
}

/**
 * 用户状态管理
 */
const userInfo = ref<UserInfo | null>(null);

/**
 * 用户相关的composable
 */
export function useUser() {
  /**
   * 获取用户信息（从 Cookie 中读取，不再使用 localStorage）
   */
  const getUserInfo = (): UserInfo | null => {
    try {
      // 从 Cookie 读取（通过 storage.get('user')）
      const user = storage.get('user') as UserInfo | null;
      if (user) {
        userInfo.value = user;
        return user;
      }
    } catch (err) {
      logger.error('获取用户信息失败:', err);
    }
    return null;
  };

  /**
   * 设置用户信息（存储到 Cookie，不再使用 localStorage）
   */
  const setUserInfo = (user: UserInfo) => {
    try {
      // 使用 storage.set('user', ...) 存储到 Cookie
      storage.set('user', user);
      userInfo.value = user;
    } catch (err) {
      logger.error('设置用户信息失败:', err);
    }
  };

  /**
   * 清除用户信息（清除 Cookie 和 localStorage 中的旧数据）
   */
  const clearUserInfo = () => {
    // 使用 storage.remove('user') 清除 Cookie
    storage.remove('user');
    // 清理旧的 storage 数据（向后兼容）
    try {
      storage.remove('btc_user');
      storage.remove('user');
    } catch {
      // 忽略错误
    }
    userInfo.value = null;
  };

  /**
   * 获取用户ID
   */
  const getUserId = (): string | number | undefined => {
    const user = getUserInfo();
    return user?.id;
  };

  /**
   * 获取用户昵称
   */
  const getUserName = (): string | undefined => {
    const user = getUserInfo();
    return user?.name || user?.username;
  };

  /**
   * 检查是否已登录
   */
  const isLoggedIn = computed(() => {
    return !!userInfo.value?.id;
  });

  // 初始化时获取用户信息
  if (!userInfo.value) {
    getUserInfo();
  }

  return {
    userInfo: computed(() => userInfo.value),
    getUserInfo,
    setUserInfo,
    clearUserInfo,
    getUserId,
    getUserName,
    isLoggedIn,
  };
}


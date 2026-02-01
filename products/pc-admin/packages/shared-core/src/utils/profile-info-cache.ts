/**
 * 个人信息缓存工具
 * 用于避免多个组件同时请求个人信息接口
 */
;

import { storage } from './storage/local';
import { sessionStorage } from './storage/session';

// 持久化存储键名
const PROFILE_INFO_STORAGE_KEY = 'btc_profile_info_data';

/**
 * 从持久化存储读取个人信息数据
 */
function getProfileInfoFromStorage(): any | null {
  try {
    // 优先从 sessionStorage 读取（会话级别）
    const sessionData = sessionStorage.get<any>(PROFILE_INFO_STORAGE_KEY);
    if (sessionData) {
      return sessionData;
    }
    // 其次从 localStorage 读取（持久化）
    const localData = storage.get<any>(PROFILE_INFO_STORAGE_KEY);
    if (localData) {
      return localData;
    }
  } catch (error) {
    // 静默失败，不影响功能
    if (import.meta.env.DEV) {
      console.warn('[getProfileInfo] Failed to read from storage:', error);
    }
  }
  return null;
}

/**
 * 保存个人信息数据到持久化存储
 */
function saveProfileInfoToStorage(data: any): void {
  try {
    if (!data) {
      return;
    }

    // 同时保存到 sessionStorage 和 localStorage
    sessionStorage.set(PROFILE_INFO_STORAGE_KEY, data);
    storage.set(PROFILE_INFO_STORAGE_KEY, data);
  } catch (error) {
    // 静默失败，不影响功能
  }
}

/**
 * 获取个人信息（只从持久化存储读取，不调用接口）
 * 关键：刷新时只从存储读取，接口由主应用在登录时统一调用
 * 注意：此函数只从缓存读取，永远不会调用接口
 */
export function getProfileInfoFromCache(): any | null {
  return getProfileInfoFromStorage();
}

/**
 * 在登录成功后调用，主动获取并存储个人信息数据
 * 关键：保存数据后立即触发事件通知顶栏更新，确保登录后立即显示头像和用户名
 */
export async function loadProfileInfoOnLogin(service: any): Promise<any> {
  try {
    // 确保 service 存在
    if (!service) {
      return null;
    }
    const profileService = service.admin?.base?.profile;
    if (!profileService || !profileService.info) {
      return null;
    }
    
    const response = await profileService.info();

    // 保存到持久化存储
    saveProfileInfoToStorage(response);

    // 关键：立即更新统一存储（头像和用户名），确保顶栏能立即显示
    // 先更新存储，再触发事件，确保顶栏组件能获取到最新数据
    if (typeof window !== 'undefined' && response) {
      try {
        // 从全局获取 appStorage（避免循环依赖）
        const appStorage = (window as any).__APP_STORAGE__ || (window as any).appStorage;

        if (appStorage?.user) {
          if (response.avatar) {
            appStorage.user.setAvatar(response.avatar);
          }
          if (response.name) {
            appStorage.user.setName(response.name);
          }
        }
      } catch (error) {
        // 静默失败，不影响登录流程
      }

      // 触发 userInfoUpdated 事件，通知顶栏组件立即更新
      // 关键：在更新存储后触发事件，确保顶栏组件能获取到最新数据
      try {
        window.dispatchEvent(new CustomEvent('userInfoUpdated', {
          detail: {
            avatar: response.avatar,
            name: response.name,
            ...response // 传递完整的用户信息，方便组件使用
          }
        }));
      } catch (error) {
        // 静默失败
      }
    }

    return response;
  } catch (error) {
    // 静默失败，不影响登录流程
    return null;
  }
}

/**
 * 清除缓存（用于退出登录）
 */
export function clearProfileInfoCache(): void {
  // 清除持久化存储
  try {
    sessionStorage.remove(PROFILE_INFO_STORAGE_KEY);
    storage.remove(PROFILE_INFO_STORAGE_KEY);
  } catch (error) {
    // 静默失败
  }
}

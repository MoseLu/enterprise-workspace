/**
 * 统一的存储管理工具
 */

import { getCookie, getCookieDomain, deleteCookie } from '@btc/shared-core/utils/cookie';
import { syncSettingsToCookie, storage } from '@btc/shared-utils';
import { checkStorageValidity, triggerAutoLogout } from '@btc/shared-core/utils/storage-validity-check';

// 从 Cookie 读取设置（当前未使用）
// 从 Cookie 读取设置（当前未使用）
// const getSettingsFromCookie = (): Record<string, any> => {
//   const settingsCookie = getCookie('btc_settings');
//   if (settingsCookie) {
//     try {
//       return JSON.parse(decodeURIComponent(settingsCookie));
//     } catch {
//       return {};
//     }
//   }
//   return {};
// };

// 从 Cookie 读取用户信息
const getUserFromCookie = (): Record<string, any> | null => {
  const userCookie = getCookie('btc_user');
  if (userCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(userCookie));
      // 如果解析后的数据有 value 字段（说明是 localStorage 格式），提取 value
      // 这可能是旧数据格式，需要兼容处理
      if (parsed && typeof parsed === 'object' && 'value' in parsed && !('name' in parsed)) {
        return parsed.value;
      }
      return parsed;
    } catch {
      return null;
    }
  }
  return null;
};

// localStorage 辅助函数（用于向后兼容和清理旧数据）
const getItem = (key: string): string | null => {
  try {
    const value = storage.get(key);
    // storage.get 返回的是反序列化后的值，需要转换为字符串以保持向后兼容
    return value !== null ? (typeof value === 'string' ? value : JSON.stringify(value)) : null;
  } catch {
    return null;
  }
};

// const setItem = (key: string, value: string): void => { // 未使用
//   try {
//     localStorage.setItem(key, value);
//   } catch {
//     // 忽略存储错误
//   }
// };

const removeItem = (key: string): void => {
  try {
    storage.remove(key);
  } catch {
    // 忽略删除错误
  }
};

// 获取所有设置（优先从 Cookie 读取，如果 Cookie 丢失则从 localStorage 恢复）
const getAllSettings = (): Record<string, any> => {
  // 使用 storage.get('settings')，它会自动处理：
  // 1. 优先从 Cookie 读取
  // 2. 如果 Cookie 中没有，从 localStorage 恢复并重新设置到 Cookie
  const settings = storage.get('settings') as Record<string, any> | null;
  return settings || {};
};

// 保存所有设置（只写入 Cookie，不写入 localStorage）
const setAllSettings = (settings: Record<string, any>): void => {
  // 直接同步到 Cookie
  syncSettingsToCookie(settings);
};

// 先定义 user 对象，以便在 auth 中引用
const userStorage = {
    get: () => {
    // 关键：在读取之前先检查存储有效性
    // 如果关键 cookie 不存在，说明存储被清除，需要退出
    if (!checkStorageValidity()) {
      // 异步触发退出，不阻塞当前读取操作
      triggerAutoLogout().catch(() => {
        // 静默失败
      });
      return null;
    }

    // 优先从 Cookie 读取
    const cookieUser = getUserFromCookie();
    if (cookieUser) {
      return cookieUser;
    }
    
    // 如果 Cookie 中没有，尝试从 storage.get('user') 读取（它会从 Cookie 同步）
    const storageUser = storage.get('user') as Record<string, any> | null;
    if (storageUser) {
      return storageUser;
    }
    
    // 向后兼容：如果 Cookie 和 storage 都没有，尝试从 storage 读取旧的 user key（但不创建新key）
    try {
      const oldUserValue = storage.get('user');
      if (oldUserValue) {
        try {
          const oldUser = typeof oldUserValue === 'object' ? oldUserValue : JSON.parse(String(oldUserValue));
          // 迁移到 Cookie（通过 storage.set）
          storage.set('user', oldUser);
          return oldUser;
        } catch {
          return null;
        }
      }
    } catch {
      // 忽略 storage 错误
    }
    
      return null;
    },
    set: (user: any) => {
    // 处理用户信息：删除 name 字段，将 name 的值赋给 username（使用后端权威值）
    const processedUser = { ...user };
    if (processedUser.name) {
      processedUser.username = processedUser.name; // 使用后端返回的 name 作为 username
      delete processedUser.name; // 删除 name 字段
    }
    // 使用 storage.set('user', ...) 确保同步到 Cookie
    storage.set('user', processedUser);
    },
    remove: () => {
    // 删除 Cookie 中的用户信息
    try {
      const domain = getCookieDomain();
      if (domain !== undefined) {
        deleteCookie('btc_user', {
          domain: domain,
          path: '/',
        });
      } else {
        deleteCookie('btc_user', {
          path: '/',
        });
      }
    } catch {
      // 忽略错误
    }
    
    // 同时清理 localStorage（向后兼容）
      removeItem('btc_user');
    },
    clear: () => {
    // 删除 Cookie 中的用户信息
    userStorage.remove();
    },
    /**
     * 获取头像（从统一的 btc_user 存储中获取）
     */
    getAvatar() {
      const user = this.get();
      // 优先从统一的 btc_user 中获取
      if (user?.avatar) {
        return user.avatar;
      }
      // 兼容旧的独立存储（向后兼容，读取后迁移）
      const oldAvatar = getItem('user_avatar');
      if (oldAvatar) {
        // 迁移到统一存储（不创建新key）
        const currentUser = user || {};
        this.set({ ...currentUser, avatar: oldAvatar });
        return oldAvatar;
      }
      return null;
    },
    /**
     * 设置头像（存储到统一的 btc_user 中，不创建独立的 user_avatar key）
     */
    setAvatar(avatar: string) {
      const user = this.get() || {};
      this.set({ ...user, avatar });
      // 只存储在 btc_user 中，不创建独立的 user_avatar key
    },
    /**
     * 获取用户名（从统一的 btc_user 存储中获取）
     * 注意：从 username 字段读取，不再使用 name 字段
     */
    getName() {
      const user = this.get();
      // 优先从统一的 btc_user 中获取 username
      if (user?.username) {
        return user.username;
      }
      // 向后兼容：如果只有 name 字段（旧数据），迁移到 username
      if (user?.name) {
        const currentUser = { ...user };
        currentUser.username = currentUser.name;
        delete currentUser.name;
        this.set(currentUser);
        return currentUser.username;
      }
      // 兼容旧的独立存储（向后兼容，读取后迁移）
      const oldName = getItem('user_name');
      if (oldName) {
        // 迁移到统一存储（不创建新key），存储为 username
        const currentUser = user || {};
        this.set({ ...currentUser, username: oldName });
        return oldName;
      }
      return null;
    },
    /**
     * 设置用户名（存储到统一的 btc_user 中，不创建独立的 user_name key）
     * 注意：实际存储为 username 字段，不存储 name 字段
     */
    setName(name: string) {
      const user = this.get() || {};
      // 存储为 username，不存储 name
      this.set({ ...user, username: name });
      // 只存储在 btc_user 中，不创建独立的 user_name key
    },
    /**
     * 获取用户名（登录用）
     */
    getUsername() {
      const user = this.get();
      // 优先从统一的 btc_user 中获取
      if (user?.username) {
        return user.username;
      }
      // 兼容旧的独立存储（向后兼容，读取后迁移）
      const oldUsername = getItem('username');
      if (oldUsername) {
        // 迁移到统一存储（不创建新key）
        const currentUser = user || {};
        this.set({ ...currentUser, username: oldUsername });
        return oldUsername;
      }
      return null;
    },
    /**
     * 设置用户名（登录用，存储到统一的 btc_user 中，不创建独立的 username key）
     */
    setUsername(username: string) {
      const user = this.get() || {};
      this.set({ ...user, username });
      // 只存储在 btc_user 中，不创建独立的 username key
    },
};

export const appStorage = {
  /**
   * 初始化存储管理器
   */
  init(_version?: string): void {
    // 初始化逻辑（如果需要）
  },
  auth: {
    getToken: () => {
      // 关键：在读取之前先检查存储有效性
      // 如果关键 cookie 不存在，说明存储被清除，需要退出
      if (!checkStorageValidity()) {
        // 异步触发退出，不阻塞当前读取操作
        triggerAutoLogout().catch(() => {
          // 静默失败
        });
        return null;
      }

      // 直接从 cookie 获取 access_token（不再从 localStorage 读取）
      const cookieToken = getCookie('access_token');
      if (cookieToken) {
        return cookieToken;
      }
      // 向后兼容：如果 cookie 中没有，尝试从旧的 localStorage 键读取（用于迁移）
      return getItem('token') || getItem('access_token');
    },
    setToken: (_token: string) => {
      // 不再保存到 localStorage，token 应该由后端通过 Set-Cookie 设置
      // 这里只做向后兼容处理，清理旧的 localStorage 键
      removeItem('token');
      removeItem('access_token');
      // 从 btc_user 中移除 token（不再存储）
      const user = userStorage.get() || {};
      if (user.token) {
        delete user.token;
        userStorage.set(user);
      }
    },
    removeToken: () => {
      // 清理旧的 localStorage 键
      removeItem('token');
      removeItem('access_token');
      // 从 btc_user 中移除 token
      const user = userStorage.get() || {};
      if (user.token) {
        delete user.token;
        userStorage.set(user);
      }
    },
    clear: () => {
      // 清理旧的 localStorage 键
      removeItem('token');
      removeItem('access_token');
      removeItem('refreshToken');
      // 从 btc_user 中移除 token
      const user = userStorage.get() || {};
      if (user.token) {
        delete user.token;
        userStorage.set(user);
      }
    },
  },
  user: userStorage,
  settings: {
    get: (): Record<string, any> => {
      // 关键：在读取 is_logged_in 标记时，先检查存储有效性
      const settings = getAllSettings();
      // 如果存在 is_logged_in 标记，说明用户已登录，需要检查存储有效性
      if (settings.is_logged_in === true && !checkStorageValidity()) {
        // 存储无效，清除标记并触发退出
        delete settings.is_logged_in;
        setAllSettings(settings);
        // 异步触发退出，不阻塞当前读取操作
        triggerAutoLogout().catch(() => {
          // 静默失败
        });
      }
      return settings;
    },
    set: (data: Record<string, any>): void => {
      const current = getAllSettings();
      setAllSettings({ ...current, ...data });
    },
    getItem: (key: string): any => {
      // 关键：在读取 is_logged_in 标记时，先检查存储有效性
      const settings = getAllSettings();
      // 如果读取的是 is_logged_in 且为 true，需要检查存储有效性
      if (key === 'is_logged_in' && settings[key] === true && !checkStorageValidity()) {
        // 存储无效，清除标记并触发退出
        delete settings.is_logged_in;
        setAllSettings(settings);
        // 异步触发退出，不阻塞当前读取操作
        triggerAutoLogout().catch(() => {
          // 静默失败
        });
        return null;
      }
      return settings[key] ?? null;
    },
    setItem: (key: string, value: any): void => {
      const settings = getAllSettings();
      settings[key] = value;
      setAllSettings(settings);
    },
    removeItem: (key: string): void => {
      const settings = getAllSettings();
      delete settings[key];
      setAllSettings(settings);
    },
  },
};


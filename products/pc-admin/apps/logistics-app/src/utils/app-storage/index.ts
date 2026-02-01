/**
 * 主应用专用存储管理工具
 * 提供统一的存储管理接口，支持类型安全、版本管理、数据迁移等功能
 */
;

import { storage } from '@btc/shared-utils';
import type { UserStorage, AppSettingsStorage } from '../storage-manager';
import { checkStorageValidity, triggerAutoLogout } from '@btc/shared-core/utils/storage-validity-check';
import { logger } from '@btc/shared-core/utils/logger';

/**
 * 存储键名常量
 */
export const APP_STORAGE_KEYS = {
  // 用户相关
  USER: 'user',
  USERNAME: 'username', // 向后兼容，已迁移到 user

  // 应用设置
  SETTINGS: 'settings',

  // 认证相关
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',

  // 其他
  LOCALE: 'locale',
  RECENT_SEARCHES: 'recent-searches',
  THEME: 'theme',
} as const;

/**
 * 存储版本信息
 */
export interface StorageVersion {
  version: string;
  timestamp: number;
}

/**
 * 存储统计信息
 */
export interface StorageStats {
  totalKeys: number;
  totalSize: number;
  keys: Array<{
    key: string;
    size: number;
    type: string;
  }>;
}

/**
 * 存储监听器
 */
export type StorageListener = (key: string, newValue: any, oldValue: any) => void;

/**
 * 主应用存储管理器
 */
class AppStorageManager {
  private listeners: Map<string, Set<StorageListener>> = new Map();
  private version: string = '1.0.0';

  /**
   * 初始化存储管理器
   */
  init(version?: string) {
    if (version) {
      this.version = version;
    }
    // 不再执行迁移逻辑，从源头禁止创建独立键
  }

  /**
   * 获取存储版本
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * 用户信息存储
   */
  get user() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return {
      /**
       * 获取用户信息
       */
      get(): UserStorage | null {
        // 关键：在读取之前先检查存储有效性
        // 如果关键存储不存在，说明存储被清除，需要退出
        if (!checkStorageValidity()) {
          // 异步触发退出，不阻塞当前读取操作
          triggerAutoLogout().catch(() => {
            // 静默失败
          });
          return null;
        }
        return (storage.get as <T>(key: string) => T | null)<UserStorage>(APP_STORAGE_KEYS.USER) || null;
      },

      /**
       * 设置用户信息
       */
      set(data: Partial<UserStorage>): void {
        const current = this.get() || {};
        const newData = { ...current, ...data };
        storage.set(APP_STORAGE_KEYS.USER, newData);
        self.notifyListeners(APP_STORAGE_KEYS.USER, newData, current);
      },

    /**
     * 获取头像
     */
    getAvatar(): string | null {
      const user = this.get();
      return user?.avatar || null;
    },

    /**
     * 设置头像
     */
    setAvatar(avatar: string): void {
      this.set({ avatar });

      // 预加载头像图片到浏览器缓存
      if (avatar && avatar !== '/logo.png' && typeof window !== 'undefined') {
        const img = new Image();
        img.src = avatar;
      }
    },

    /**
     * 获取用户名
     */
    getName(): string | null {
      const user = this.get();
      return user?.name || null;
    },

    /**
     * 设置用户名
     */
    setName(name: string): void {
      this.set({ name });
    },

    /**
     * 获取用户名（登录用）
     */
    getUsername(): string | null {
      const user = this.get();
      return user?.username || null;
    },

    /**
     * 设置用户名（登录用）
     */
    setUsername(username: string): void {
      this.set({ username });
      // 清理旧的 storage 中的 username
      storage.remove(APP_STORAGE_KEYS.USERNAME);
    },

    /**
     * 清除用户信息
     */
    clear(): void {
      const oldValue = this.get();
      storage.remove(APP_STORAGE_KEYS.USER);
      self.notifyListeners(APP_STORAGE_KEYS.USER, null, oldValue);
    },
    };
  }

  /**
   * 应用设置存储
   */
  get settings() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return {
      /**
       * 获取所有设置
       */
      get(): AppSettingsStorage {
        // 关键：在读取 is_logged_in 标记时，先检查存储有效性
        const settings = (storage.get as <T>(key: string) => T | null)<AppSettingsStorage>(APP_STORAGE_KEYS.SETTINGS) || {};
        // 如果存在 is_logged_in 标记，说明用户已登录，需要检查存储有效性
        if ((settings as any).is_logged_in === true && !checkStorageValidity()) {
          // 存储无效，清除标记并触发退出
          delete (settings as any).is_logged_in;
          storage.set(APP_STORAGE_KEYS.SETTINGS, settings);
          // 异步触发退出，不阻塞当前读取操作
          triggerAutoLogout().catch(() => {
            // 静默失败
          });
        }
        return settings;
      },

      /**
       * 设置单个或多个设置项
       */
      set(data: Partial<AppSettingsStorage>): void {
        const current = this.get();
        const newData = { ...current, ...data };
        storage.set(APP_STORAGE_KEYS.SETTINGS, newData);
        self.notifyListeners(APP_STORAGE_KEYS.SETTINGS, newData, current);
      },

    /**
     * 获取单个设置项
     */
    getItem<K extends keyof AppSettingsStorage>(key: K): AppSettingsStorage[K] | null {
      // 关键：在读取 is_logged_in 标记时，先检查存储有效性
      const settings = this.get();
      // 如果读取的是 is_logged_in 且为 true，需要检查存储有效性
      if (key === 'is_logged_in' && (settings as any)[key] === true && !checkStorageValidity()) {
        // 存储无效，清除标记并触发退出
        delete (settings as any).is_logged_in;
        storage.set(APP_STORAGE_KEYS.SETTINGS, settings);
        // 异步触发退出，不阻塞当前读取操作
        triggerAutoLogout().catch(() => {
          // 静默失败
        });
        return null;
      }
      return settings[key] ?? null;
    },

    /**
     * 设置单个设置项
     */
    setItem<K extends keyof AppSettingsStorage>(key: K, value: AppSettingsStorage[K]): void {
      this.set({ [key]: value } as Partial<AppSettingsStorage>);
    },

    /**
     * 移除单个设置项
     */
    removeItem(key: keyof AppSettingsStorage): void {
      const current = this.get();
      const oldValue = current[key];
      delete current[key];
      storage.set(APP_STORAGE_KEYS.SETTINGS, current);
      self.notifyListeners(APP_STORAGE_KEYS.SETTINGS, current, { ...current, [key]: oldValue });
    },

    /**
     * 清除所有设置
     */
    clear(): void {
      const oldValue = this.get();
      storage.remove(APP_STORAGE_KEYS.SETTINGS);
      self.notifyListeners(APP_STORAGE_KEYS.SETTINGS, null, oldValue);
    },
    };
  }

  /**
   * 认证信息存储
   */
  get auth() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return {
      /**
       * 获取 token
       */
      getToken(): string | null {
        // 关键：在读取之前先检查存储有效性
        // 如果关键存储不存在，说明存储被清除，需要退出
        if (!checkStorageValidity()) {
          // 异步触发退出，不阻塞当前读取操作
          triggerAutoLogout().catch(() => {
            // 静默失败
          });
          return null;
        }
        const token = storage.get<string>(APP_STORAGE_KEYS.TOKEN);
        return token || null;
      },

      /**
       * 设置 token
       */
      setToken(token: string): void {
        const oldToken = this.getToken();
        storage.set(APP_STORAGE_KEYS.TOKEN, token);
        self.notifyListeners(APP_STORAGE_KEYS.TOKEN, token, oldToken);
      },

      /**
       * 获取 refresh token
       */
      getRefreshToken(): string | null {
        const refreshToken = storage.get<string>(APP_STORAGE_KEYS.REFRESH_TOKEN);
        return refreshToken || null;
      },

      /**
       * 设置 refresh token
       */
      setRefreshToken(token: string): void {
        const oldRefreshToken = this.getRefreshToken();
        storage.set(APP_STORAGE_KEYS.REFRESH_TOKEN, token);
        self.notifyListeners(APP_STORAGE_KEYS.REFRESH_TOKEN, token, oldRefreshToken);
      },

      /**
       * 清除所有认证信息
       */
      clear(): void {
        const oldToken = this.getToken();
        const oldRefreshToken = this.getRefreshToken();
        storage.remove(APP_STORAGE_KEYS.TOKEN);
        storage.remove(APP_STORAGE_KEYS.REFRESH_TOKEN);
        self.notifyListeners(APP_STORAGE_KEYS.TOKEN, null, oldToken);
        self.notifyListeners(APP_STORAGE_KEYS.REFRESH_TOKEN, null, oldRefreshToken);
      },
    };
  }

  /**
   * 添加存储监听器
   */
  addListener(key: string, listener: StorageListener): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    // 返回取消监听的函数
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  /**
   * 移除存储监听器
   */
  removeListener(key: string, listener: StorageListener): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(key);
      }
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(key: string, newValue: any, oldValue: any): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(key, newValue, oldValue);
        } catch (error) {
          logger.error('[AppStorage]', 'common.other.listener_error', { key }, error);
        }
      });
    }
  }

  /**
   * 获取存储统计信息
   */
  getStats(): StorageStats {
    const keys: StorageStats['keys'] = [];
    let totalSize = 0;

    // 使用 storage.info() 获取所有存储数据
    const allStorage = storage.info();
    Object.keys(allStorage).forEach(key => {
      if (key.startsWith('btc_')) {
        const value = allStorage[key];
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        const size = new Blob([valueStr]).size;
        totalSize += size;
        keys.push({
          key,
          size,
          type: this.getStorageType(key),
        });
      }
    });

    // 统计其他重要 key
    const otherKeys = [
      APP_STORAGE_KEYS.TOKEN,
      APP_STORAGE_KEYS.REFRESH_TOKEN,
      APP_STORAGE_KEYS.USERNAME,
      APP_STORAGE_KEYS.LOCALE,
    ];

    otherKeys.forEach(key => {
      const value = storage.get(key);
      if (value !== null) {
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        const size = new Blob([valueStr]).size;
        totalSize += size;
        keys.push({
          key,
          size,
          type: this.getStorageType(key),
        });
      }
    });

    return {
      totalKeys: keys.length,
      totalSize,
      keys: keys.sort((a, b) => b.size - a.size), // 按大小排序
    };
  }

  /**
   * 获取存储类型
   */
  private getStorageType(key: string): string {
    if (key.includes('user')) return 'user';
    if (key.includes('settings')) return 'settings';
    if (key.includes('token')) return 'auth';
    if (key.includes('theme')) return 'theme';
    return 'other';
  }

  /**
   * 清理过期或无效的存储
   */
  cleanup(): {
    removed: string[];
    freed: number;
  } {
    const removed: string[] = [];
    let freed = 0;

    // 清理旧的独立存储 key
    const oldKeys = [
      'btc_systemThemeType',
      'btc_systemThemeMode',
      'btc_systemThemeColor',
      APP_STORAGE_KEYS.USERNAME,
    ];

    oldKeys.forEach(key => {
      const value = storage.get(key);
      if (value !== null) {
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        const size = new Blob([valueStr]).size;
        storage.remove(key);
        removed.push(key);
        freed += size;
      }
    });

    return { removed, freed };
  }


  /**
   * 导出所有存储数据（用于备份或调试）
   */
  export(): Record<string, any> {
    const data: Record<string, any> = {};

    // 使用 storage.info() 获取所有存储数据
    const allStorage = storage.info();
    Object.keys(allStorage).forEach(key => {
      if (key.startsWith('btc_')) {
        data[key] = allStorage[key];
      }
    });

    // 导出其他重要 key
    const otherKeys = [
      APP_STORAGE_KEYS.TOKEN,
      APP_STORAGE_KEYS.REFRESH_TOKEN,
      APP_STORAGE_KEYS.USERNAME,
      APP_STORAGE_KEYS.LOCALE,
    ];

    otherKeys.forEach(key => {
      const value = storage.get(key);
      if (value !== null) {
        data[key] = value;
      }
    });

    return data;
  }

  /**
   * 清除所有应用存储（危险操作）
   */
  clearAll(): void {
    // 使用 storage.info() 获取所有存储数据，然后清除所有 btc_ 前缀的 key
    const allStorage = storage.info();
    Object.keys(allStorage).forEach(key => {
      if (key.startsWith('btc_')) {
        const oldValue = storage.get(key);
        storage.remove(key);
        this.notifyListeners(key, null, oldValue);
      }
    });

    // 清除其他重要 key
    const otherKeys = [
      APP_STORAGE_KEYS.TOKEN,
      APP_STORAGE_KEYS.REFRESH_TOKEN,
      APP_STORAGE_KEYS.USERNAME,
    ];

    otherKeys.forEach(key => {
      const oldValue = storage.get(key);
      storage.remove(key);
      this.notifyListeners(key, null, oldValue);
    });
  }
}

// 导出单例实例
export const appStorage = new AppStorageManager();

// 导出类型
export type { UserStorage, AppSettingsStorage } from '../storage-manager';


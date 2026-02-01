/**
 * LocalStorage 工具类
 * 提供统一的 localStorage 操作接口，支持过期时间、前缀等
 */
;
import { syncSettingsToCookie, syncUserToCookie, getCookieDomain } from '../cross-domain';
import { logger } from '../../logger/index';

class LocalStorageUtil {
  private prefix: string;

  constructor(prefix = 'btc_') {
    this.prefix = prefix;
  }

  /**
   * 设置存储
   * @param key 键
   * @param value 值
   * @param expire 过期时间（秒）
   */
  set(key: string, value: unknown, expire?: number): void {
    // 禁止创建独立的键，统一使用 settings 和 user 存储
    // 允许的键：settings, user, locale, i18n 相关的缓存键
    const allowedKeys = ['settings', 'user', 'locale'];
    const isI18nKey = key.startsWith('i18n-') || key.startsWith('locale-');

    if (!allowedKeys.includes(key) && !isI18nKey) {
      // 检查是否是应该统一存储的键
      const unifiedStorageKeys = [
        'button-style',
        'systemThemeType',
        'systemThemeMode',
        'systemThemeColor',
        'menuType',
        'menuThemeType',
        'containerWidth',
        'boxBorderMode',
        'showMenuButton',
        'showFastEnter',
        'showRefreshButton',
        'showCrumbs',
        'showWorkTab',
        'showGlobalSearch',
        'showLanguage',
        'showNprogress',
        'watermarkVisible',
        'uniqueOpened',
        'tabStyle',
        'pageTransition',
        'customRadius',
        'menuOpenWidth',
        'menuOpen',
        'colorWeak',
        'theme',
        'isDark',
        'username', // 用户名应该存储在 user.username 中
        'user_avatar', // 头像应该存储在 user.avatar 中
        'user_name', // 用户名应该存储在 user.name 中
      ];

      if (unifiedStorageKeys.includes(key)) {
        logger.error(`[Storage] 禁止创建独立的 ${key} 键！请使用统一的 settings 存储`);
        console.trace('调用堆栈：');
        return;
      }
    }

    // settings 和 user：只写入 Cookie，不再写入 localStorage
    if (key === 'settings' || key === 'user') {
      // 写入 Cookie（唯一存储）
      try {
        if (key === 'settings' && typeof value === 'object' && value !== null) {
          syncSettingsToCookie(value as Record<string, any>);
        } else if (key === 'user' && typeof value === 'object' && value !== null) {
          syncUserToCookie(value as Record<string, any>);
        }
      } catch (error) {
        logger.error('[Storage] 同步到 Cookie 失败:', error);
      }

      // 清理旧的 localStorage 备份（如果存在）
      try {
        localStorage.removeItem(this.prefix + key);
      } catch (error) {
        // 忽略清理错误
      }

      return;
    }

    // 其他键（如 locale、i18n 缓存）仍然写入 localStorage
    const data = {
      value,
      expire: expire ? Date.now() + expire * 1000 : null,
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(data));
  }

  /**
   * 获取存储
   * @param key 键
   * @returns 值
   */
  get<T = unknown>(key: string): T | null {
    // settings 和 user：优先从 Cookie 读取，如果 Cookie 丢失则从 localStorage 恢复
    if (key === 'settings' || key === 'user') {
      if (typeof document === 'undefined') {
        return (key === 'settings' ? {} : null) as T;
      }

      try {
        const cookieName = key === 'settings' ? 'btc_settings' : 'btc_user';
        const nameEQ = cookieName + '=';
        const ca = document.cookie.split(';');

        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          if (!c) continue;
          while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
          }
          if (c.indexOf(nameEQ) === 0) {
            const cookieValue = c.substring(nameEQ.length, c.length);
            try {
              const parsed = JSON.parse(decodeURIComponent(cookieValue));
              // 对于 settings，确保返回的是对象而不是 null
              if (key === 'settings' && (parsed === null || typeof parsed !== 'object')) {
                return {} as T;
              }
              return parsed as T;
            } catch {
              return (key === 'settings' ? {} : null) as T;
            }
          }
        }
      } catch (error) {
        // 忽略错误
      }

      // Cookie 中没有数据，尝试从 localStorage 恢复（备份机制）
      try {
        const backupKey = this.prefix + key;
        const backupStr = localStorage.getItem(backupKey);
        if (backupStr) {
          try {
            const backupData = JSON.parse(backupStr);
            // 检查是否过期
            if (backupData.expire && backupData.expire < Date.now()) {
              // 备份已过期，删除
              localStorage.removeItem(backupKey);
              return (key === 'settings' ? {} : null) as T;
            }

            // 从备份恢复：将数据重新设置到 Cookie
            const backupValue = backupData.value;
            if (backupValue && typeof backupValue === 'object') {
              if (key === 'settings') {
                syncSettingsToCookie(backupValue as Record<string, any>);
                return backupValue as T;
              } else if (key === 'user') {
                syncUserToCookie(backupValue as Record<string, any>);
                return backupValue as T;
              }
            }
          } catch {
            // 备份数据解析失败，删除
            localStorage.removeItem(backupKey);
          }
        }
      } catch (error) {
        // 忽略 localStorage 读取错误
      }

      // 如果 Cookie 和备份都没有，对于 settings 返回空对象（而不是 null），这样后续代码可以正常工作
      if (key === 'settings') {
        return {} as T;
      }

      return null;
    }

    // 其他键从 localStorage 读取
    const str = localStorage.getItem(this.prefix + key);
    if (!str) {
      return null;
    }

    try {
      const data = JSON.parse(str);
      if (data.expire && data.expire < Date.now()) {
        this.remove(key);
        return null;
      }
      return data.value;
    } catch {
      return null;
    }
  }

  /**
   * 移除存储
   * @param key 键
   */
  remove(key: string): void {
    // settings 和 user：清除 Cookie，同时清理 localStorage 中的旧数据
    if (key === 'settings' || key === 'user') {
      if (typeof document === 'undefined') {
        return;
      }

      try {
        const cookieName = key === 'settings' ? 'btc_settings' : 'btc_user';
        const domain = getCookieDomain();
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const expires = '; expires=Thu, 01 Jan 1970 00:00:00 UTC';
        let cookieString = `${cookieName}=${expires}; path=/`;

        if (domain && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
          cookieString += `; Domain=${domain}`;
        }

        document.cookie = cookieString;
      } catch (error) {
        logger.error('[Storage] 清除 Cookie 失败:', error);
      }

      // 清理 localStorage 中的旧数据（向后兼容）
      try {
        localStorage.removeItem(this.prefix + key);
      } catch (error) {
        // 忽略错误
      }

      return;
    }

    // 其他键从 localStorage 删除
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * 获取所有存储数据（类似 cool-admin 的 storage.info()）
   * 用于一次性获取所有缓存数据，提高性能
   */
  info(): Record<string, any> {
    const data: Record<string, any> = {};

    try {
      // 遍历 localStorage 中所有以 prefix 开头的键
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const actualKey = key.substring(this.prefix.length);
          // 跳过 settings 和 user（它们存储在 Cookie 中）
          if (actualKey !== 'settings' && actualKey !== 'user') {
            const value = this.get(actualKey);
            if (value !== null) {
              data[actualKey] = value;
            }
          }
        }
      }

      // 从 Cookie 中读取 settings 和 user
      if (typeof document !== 'undefined') {
        try {
          const settings = this.get('settings');
          if (settings) {
            data['settings'] = settings;
          }
          const user = this.get('user');
          if (user) {
            data['user'] = user;
          }
        } catch (error) {
          // 忽略 Cookie 读取错误
        }
      }
    } catch (error) {
      console.warn('[Storage] 获取所有数据失败:', error);
    }

    return data;
  }

  /**
   * 清空存储
   */
  clear(): void {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const storage = new LocalStorageUtil();

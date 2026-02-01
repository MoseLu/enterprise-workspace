/**
 * 统一存储管理器
 * 整合所有 localStorage 键，避免冗余
 */

import { storage } from '@btc/shared-utils';

/**
 * 用户信息存储接口
 */
export interface UserStorage {
  avatar?: string;
  name?: string;
  username?: string;
  position?: string;
  [key: string]: any;
}

/**
 * 应用设置存储接口
 */
export interface AppSettingsStorage {
  // 用户界面设置
  avatarRockStyle?: boolean;
  
  // 菜单设置
  menuType?: string;
  menuOpenWidth?: number;
  menuOpen?: boolean;
  menuThemeType?: string;
  
  // 主题设置
  systemThemeType?: string;
  systemThemeMode?: string;
  systemThemeColor?: string;
  
  // 界面显示设置
  showMenuButton?: boolean;
  showFastEnter?: boolean;
  showRefreshButton?: boolean;
  showCrumbs?: boolean;
  showWorkTab?: boolean;
  showGlobalSearch?: boolean;
  showLanguage?: boolean;
  showNprogress?: boolean;
  colorWeak?: boolean;
  watermarkVisible?: boolean;
  
  // 其他设置
  containerWidth?: string;
  boxBorderMode?: boolean;
  uniqueOpened?: boolean;
  tabStyle?: string;
  pageTransition?: string;
  customRadius?: string;
  buttonStyle?: string;
  
  [key: string]: any;
}

/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  // 用户信息（统一存储）
  USER: 'btc_user',
  
  // 应用设置（统一存储）
  SETTINGS: 'btc_settings',
  
  // 其他独立键（保持向后兼容）
  TOKEN: 'token',
  LOCALE: 'locale',
  USER_FULL: 'user', // 完整的用户信息（从 useUser）
  RECENT_SEARCHES: 'recent-searches',
  VUEUSE_COLOR_SCHEME: 'vueuse-color-scheme',
  THEME: 'theme',
  THEME_MODE: 'theme-mode',
  IS_DARK: 'isDark',
} as const;

/**
 * 用户信息存储管理器
 */
export const userStorage = {
  /**
   * 获取用户信息
   */
  get(): UserStorage | null {
    return storage.get<UserStorage>('user') || null;
  },

  /**
   * 设置用户信息
   */
  set(data: Partial<UserStorage>): void {
    const current = this.get() || {};
    storage.set('user', { ...current, ...data });
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
    
    // 预加载头像图片到浏览器缓存（每次设置头像时预加载，避免刷新时重新加载）
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
   * 清除用户信息
   */
  clear(): void {
    storage.remove('user');
  },
};


/**
 * 应用设置存储管理器
 */
export const settingsStorage = {
  /**
   * 获取所有设置
   */
  get(): AppSettingsStorage {
    return storage.get<AppSettingsStorage>('settings') || {};
  },

  /**
   * 设置单个或多个设置项
   */
  set(data: Partial<AppSettingsStorage>): void {
    const current = this.get();
    storage.set('settings', { ...current, ...data });
  },

  /**
   * 获取单个设置项
   */
  getItem<K extends keyof AppSettingsStorage>(key: K): AppSettingsStorage[K] | null {
    const settings = this.get();
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
    delete current[key];
    storage.set('settings', current);
  },

  /**
   * 清除所有设置
   */
  clear(): void {
    storage.remove('settings');
  },
};



/**
 * 统一存储管理器
 * 整合所有 localStorage 键，避免冗余
 */
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
    avatarRockStyle?: boolean;
    menuType?: string;
    menuOpenWidth?: number;
    menuOpen?: boolean;
    menuThemeType?: string;
    systemThemeType?: string;
    systemThemeMode?: string;
    systemThemeColor?: string;
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
    containerWidth?: string;
    boxBorderMode?: boolean;
    uniqueOpened?: boolean;
    tabStyle?: string;
    pageTransition?: string;
    customRadius?: string;
    [key: string]: any;
}
/**
 * 存储键名常量
 */
export declare const STORAGE_KEYS: {
    readonly USER: "btc_user";
    readonly SETTINGS: "btc_settings";
    readonly TOKEN: "token";
    readonly LOCALE: "locale";
    readonly USER_FULL: "user";
    readonly RECENT_SEARCHES: "recent-searches";
    readonly VUEUSE_COLOR_SCHEME: "vueuse-color-scheme";
    readonly THEME: "theme";
    readonly THEME_MODE: "theme-mode";
    readonly IS_DARK: "isDark";
};
/**
 * 用户信息存储管理器
 */
export declare const userStorage: {
    /**
     * 获取用户信息
     */
    get(): UserStorage | null;
    /**
     * 设置用户信息
     */
    set(data: Partial<UserStorage>): void;
    /**
     * 获取头像
     */
    getAvatar(): string | null;
    /**
     * 设置头像
     */
    setAvatar(avatar: string): void;
    /**
     * 获取用户名
     */
    getName(): string | null;
    /**
     * 设置用户名
     */
    setName(name: string): void;
    /**
     * 清除用户信息
     */
    clear(): void;
};
/**
 * 应用设置存储管理器
 */
export declare const settingsStorage: {
    /**
     * 获取所有设置
     */
    get(): AppSettingsStorage;
    /**
     * 设置单个或多个设置项
     */
    set(data: Partial<AppSettingsStorage>): void;
    /**
     * 获取单个设置项
     */
    getItem<K extends keyof AppSettingsStorage>(key: K): AppSettingsStorage[K] | null;
    /**
     * 设置单个设置项
     */
    setItem<K extends keyof AppSettingsStorage>(key: K, value: AppSettingsStorage[K]): void;
    /**
     * 移除单个设置项
     */
    removeItem(key: keyof AppSettingsStorage): void;
    /**
     * 清除所有设置
     */
    clear(): void;
};

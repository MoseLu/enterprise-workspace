/**
 * 主应用专用存储管理工具
 * 提供统一的存储管理接口，支持类型安全、版本管理、数据迁移等功能
 */
import type { UserStorage, AppSettingsStorage } from '../storage-manager';
/**
 * 存储键名常量
 */
export declare const APP_STORAGE_KEYS: {
    readonly USER: "user";
    readonly USERNAME: "username";
    readonly SETTINGS: "settings";
    readonly TOKEN: "token";
    readonly REFRESH_TOKEN: "refreshToken";
    readonly LOCALE: "locale";
    readonly RECENT_SEARCHES: "recent-searches";
    readonly THEME: "theme";
};
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
declare class AppStorageManager {
    private listeners;
    private version;
    /**
     * 初始化存储管理器
     */
    init(version?: string): void;
    /**
     * 获取存储版本
     */
    getVersion(): string;
    /**
     * 用户信息存储
     */
    get user(): {
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
         * 获取用户名（登录用）
         */
        getUsername(): string | null;
        /**
         * 设置用户名（登录用）
         */
        setUsername(username: string): void;
        /**
         * 清除用户信息
         */
        clear(): void;
    };
    /**
     * 应用设置存储
     */
    get settings(): {
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
    /**
     * 认证信息存储
     */
    get auth(): {
        /**
         * 获取 token
         */
        getToken(): string | null;
        /**
         * 设置 token
         */
        setToken(token: string): void;
        /**
         * 获取 refresh token
         */
        getRefreshToken(): string | null;
        /**
         * 设置 refresh token
         */
        setRefreshToken(token: string): void;
        /**
         * 清除所有认证信息
         */
        clear(): void;
    };
    /**
     * 添加存储监听器
     */
    addListener(key: string, listener: StorageListener): () => void;
    /**
     * 移除存储监听器
     */
    removeListener(key: string, listener: StorageListener): void;
    /**
     * 通知监听器
     */
    private notifyListeners;
    /**
     * 获取存储统计信息
     */
    getStats(): StorageStats;
    /**
     * 获取存储类型
     */
    private getStorageType;
    /**
     * 清理过期或无效的存储
     */
    cleanup(): {
        removed: string[];
        freed: number;
    };
    /**
     * 导出所有存储数据（用于备份或调试）
     */
    export(): Record<string, any>;
    /**
     * 清除所有应用存储（危险操作）
     */
    clearAll(): void;
}
export declare const appStorage: AppStorageManager;
export type { UserStorage, AppSettingsStorage } from '../storage-manager';

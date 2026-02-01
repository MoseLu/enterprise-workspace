declare class StorageUtil {
    private prefix;
    constructor(prefix?: string);
    /**
     * 设置存储
     * @param key 键
     * @param value 值
     * @param expire 过期时间（秒）
     */
    set(key: string, value: unknown, expire?: number): void;
    /**
     * 获取存储
     * @param key 键
     * @returns 值
     */
    get<T = unknown>(key: string): T | null;
    /**
     * 移除存储
     * @param key 键
     */
    remove(key: string): void;
    /**
     * 获取所有存储数据（类似 cool-admin 的 storage.info()）
     * 用于一次性获取所有缓存数据，提高性能
     */
    info(): Record<string, any>;
    /**
     * 清空存储
     */
    clear(): void;
}
export declare const storage: StorageUtil;
export {};
//# sourceMappingURL=index.d.ts.map
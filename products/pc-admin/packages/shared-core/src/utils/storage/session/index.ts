;
/**
 * SessionStorage 工具类
 * 提供统一的 sessionStorage 操作接口，支持前缀、自动序列化等
 */

class SessionStorageUtil {
  private prefix: string;

  constructor(prefix = 'btc_') {
    this.prefix = prefix;
  }

  /**
   * 获取存储值
   * @param key 键名（不需要包含前缀）
   * @returns 存储的值，如果不存在则返回 null
   */
  get<T = unknown>(key: string): T | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const fullKey = this.prefix + key;
      const value = window.sessionStorage.getItem(fullKey);
      
      if (value === null) {
        return null;
      }

      try {
        return JSON.parse(value) as T;
      } catch {
        // 如果解析失败，可能是字符串值，直接返回
        return value as T;
      }
    } catch (error) {
      console.warn(`[SessionStorage] 获取键 "${key}" 失败:`, error);
      return null;
    }
  }

  /**
   * 设置存储值
   * @param key 键名（不需要包含前缀）
   * @param value 要存储的值（会自动序列化为 JSON）
   */
  set(key: string, value: unknown): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const fullKey = this.prefix + key;
      const serialized = JSON.stringify(value);
      window.sessionStorage.setItem(fullKey, serialized);
    } catch (error) {
      console.warn(`[SessionStorage] 设置键 "${key}" 失败:`, error);
      // 如果存储失败（可能是存储空间不足），尝试清理一些旧数据
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('[SessionStorage] 存储空间不足，建议清理旧数据');
      }
    }
  }

  /**
   * 移除存储值
   * @param key 键名（不需要包含前缀）
   */
  remove(key: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const fullKey = this.prefix + key;
      window.sessionStorage.removeItem(fullKey);
    } catch (error) {
      console.warn(`[SessionStorage] 移除键 "${key}" 失败:`, error);
    }
  }

  /**
   * 清空所有带前缀的存储值
   */
  clear(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const keysToRemove: string[] = [];
      
      // 收集所有带前缀的键
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      // 删除所有收集到的键
      keysToRemove.forEach(key => {
        window.sessionStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('[SessionStorage] 清空存储失败:', error);
    }
  }

  /**
   * 获取所有带前缀的存储数据
   * @returns 所有存储数据的对象
   */
  getAll(): Record<string, any> {
    const data: Record<string, any> = {};

    if (typeof window === 'undefined') {
      return data;
    }

    try {
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const actualKey = key.substring(this.prefix.length);
          const value = this.get(actualKey);
          if (value !== null) {
            data[actualKey] = value;
          }
        }
      }
    } catch (error) {
      console.warn('[SessionStorage] 获取所有数据失败:', error);
    }

    return data;
  }
}

// 导出单例实例
export const sessionStorage = new SessionStorageUtil();

// 导出类以便需要自定义前缀时使用
export { SessionStorageUtil };

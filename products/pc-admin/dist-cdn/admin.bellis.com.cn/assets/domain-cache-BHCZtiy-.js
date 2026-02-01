var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { d as deleteCookie } from "./index-CeQEKVXA.js";
import { storage } from "@btc/shared-utils";
import { BtcMessage } from "@btc/shared-components";
import "@btc/shared-core";
const APP_STORAGE_KEYS = {
  // 用户相关
  USER: "user",
  USERNAME: "username",
  // 向后兼容，已迁移到 user
  // 应用设置
  SETTINGS: "settings",
  // 认证相关
  TOKEN: "token",
  REFRESH_TOKEN: "refreshToken",
  // 其他
  LOCALE: "locale"
};
class AppStorageManager {
  constructor() {
    __publicField(this, "listeners", /* @__PURE__ */ new Map());
    __publicField(this, "version", "1.0.0");
  }
  /**
   * 初始化存储管理器
   */
  init(version) {
    if (version) {
      this.version = version;
    }
  }
  /**
   * 获取存储版本
   */
  getVersion() {
    return this.version;
  }
  /**
   * 用户信息存储
   */
  get user() {
    const self = this;
    return {
      /**
       * 获取用户信息
       */
      get() {
        return storage.get(APP_STORAGE_KEYS.USER) || null;
      },
      /**
       * 设置用户信息
       */
      set(data) {
        const current = this.get() || {};
        const newData = { ...current, ...data };
        storage.set(APP_STORAGE_KEYS.USER, newData);
        self.notifyListeners(APP_STORAGE_KEYS.USER, newData, current);
      },
      /**
       * 获取头像
       */
      getAvatar() {
        const user = this.get();
        return user?.avatar || null;
      },
      /**
       * 设置头像
       */
      setAvatar(avatar) {
        this.set({ avatar });
        if (avatar && avatar !== "/logo.png" && typeof window !== "undefined") {
          const img = new Image();
          img.src = avatar;
        }
      },
      /**
       * 获取用户名
       */
      getName() {
        const user = this.get();
        return user?.name || null;
      },
      /**
       * 设置用户名
       */
      setName(name) {
        this.set({ name });
      },
      /**
       * 获取用户名（登录用）
       */
      getUsername() {
        const user = this.get();
        return user?.username || null;
      },
      /**
       * 设置用户名（登录用）
       */
      setUsername(username) {
        this.set({ username });
        localStorage.removeItem(APP_STORAGE_KEYS.USERNAME);
      },
      /**
       * 清除用户信息
       */
      clear() {
        const oldValue = this.get();
        storage.remove(APP_STORAGE_KEYS.USER);
        self.notifyListeners(APP_STORAGE_KEYS.USER, null, oldValue);
      }
    };
  }
  /**
   * 应用设置存储
   */
  get settings() {
    const self = this;
    return {
      /**
       * 获取所有设置
       */
      get() {
        return storage.get(APP_STORAGE_KEYS.SETTINGS) || {};
      },
      /**
       * 设置单个或多个设置项
       */
      set(data) {
        const current = this.get();
        const newData = { ...current, ...data };
        storage.set(APP_STORAGE_KEYS.SETTINGS, newData);
        self.notifyListeners(APP_STORAGE_KEYS.SETTINGS, newData, current);
      },
      /**
       * 获取单个设置项
       */
      getItem(key) {
        const settings = this.get();
        return settings[key] ?? null;
      },
      /**
       * 设置单个设置项
       */
      setItem(key, value) {
        this.set({ [key]: value });
      },
      /**
       * 移除单个设置项
       */
      removeItem(key) {
        const current = this.get();
        const oldValue = current[key];
        delete current[key];
        storage.set(APP_STORAGE_KEYS.SETTINGS, current);
        self.notifyListeners(APP_STORAGE_KEYS.SETTINGS, current, { ...current, [key]: oldValue });
      },
      /**
       * 清除所有设置
       */
      clear() {
        const oldValue = this.get();
        storage.remove(APP_STORAGE_KEYS.SETTINGS);
        self.notifyListeners(APP_STORAGE_KEYS.SETTINGS, null, oldValue);
      }
    };
  }
  /**
   * 认证信息存储
   */
  get auth() {
    const self = this;
    return {
      /**
       * 获取 token
       */
      getToken() {
        return localStorage.getItem(APP_STORAGE_KEYS.TOKEN);
      },
      /**
       * 设置 token
       */
      setToken(token) {
        const oldToken = this.getToken();
        localStorage.setItem(APP_STORAGE_KEYS.TOKEN, token);
        self.notifyListeners(APP_STORAGE_KEYS.TOKEN, token, oldToken);
      },
      /**
       * 获取 refresh token
       */
      getRefreshToken() {
        return localStorage.getItem(APP_STORAGE_KEYS.REFRESH_TOKEN);
      },
      /**
       * 设置 refresh token
       */
      setRefreshToken(token) {
        const oldRefreshToken = this.getRefreshToken();
        localStorage.setItem(APP_STORAGE_KEYS.REFRESH_TOKEN, token);
        self.notifyListeners(APP_STORAGE_KEYS.REFRESH_TOKEN, token, oldRefreshToken);
      },
      /**
       * 清除所有认证信息
       */
      clear() {
        const oldToken = this.getToken();
        const oldRefreshToken = this.getRefreshToken();
        localStorage.removeItem(APP_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(APP_STORAGE_KEYS.REFRESH_TOKEN);
        self.notifyListeners(APP_STORAGE_KEYS.TOKEN, null, oldToken);
        self.notifyListeners(APP_STORAGE_KEYS.REFRESH_TOKEN, null, oldRefreshToken);
      }
    };
  }
  /**
   * 添加存储监听器
   */
  addListener(key, listener) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, /* @__PURE__ */ new Set());
    }
    this.listeners.get(key).add(listener);
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
  removeListener(key, listener) {
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
  notifyListeners(key, newValue, oldValue) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(key, newValue, oldValue);
        } catch (error) {
          console.error(`[AppStorage] 监听器执行出错 (key: ${key}):`, error);
        }
      });
    }
  }
  /**
   * 获取存储统计信息
   */
  getStats() {
    const keys = [];
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("btc_")) {
        const value = localStorage.getItem(key);
        if (value) {
          const size = new Blob([value]).size;
          totalSize += size;
          keys.push({
            key,
            size,
            type: this.getStorageType(key)
          });
        }
      }
    }
    const otherKeys = [
      APP_STORAGE_KEYS.TOKEN,
      APP_STORAGE_KEYS.REFRESH_TOKEN,
      APP_STORAGE_KEYS.USERNAME,
      APP_STORAGE_KEYS.LOCALE
    ];
    otherKeys.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value) {
        const size = new Blob([value]).size;
        totalSize += size;
        keys.push({
          key,
          size,
          type: this.getStorageType(key)
        });
      }
    });
    return {
      totalKeys: keys.length,
      totalSize,
      keys: keys.sort((a, b) => b.size - a.size)
      // 按大小排序
    };
  }
  /**
   * 获取存储类型
   */
  getStorageType(key) {
    if (key.includes("user")) return "user";
    if (key.includes("settings")) return "settings";
    if (key.includes("token")) return "auth";
    if (key.includes("theme")) return "theme";
    return "other";
  }
  /**
   * 清理过期或无效的存储
   */
  cleanup() {
    const removed = [];
    let freed = 0;
    const oldKeys = [
      "btc_systemThemeType",
      "btc_systemThemeMode",
      "btc_systemThemeColor",
      APP_STORAGE_KEYS.USERNAME
    ];
    oldKeys.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value) {
        const size = new Blob([value]).size;
        localStorage.removeItem(key);
        removed.push(key);
        freed += size;
      }
    });
    return { removed, freed };
  }
  /**
   * 导出所有存储数据（用于备份或调试）
   */
  export() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("btc_")) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            data[key] = JSON.parse(value);
          }
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    const otherKeys = [
      APP_STORAGE_KEYS.TOKEN,
      APP_STORAGE_KEYS.REFRESH_TOKEN,
      APP_STORAGE_KEYS.USERNAME,
      APP_STORAGE_KEYS.LOCALE
    ];
    otherKeys.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });
    return data;
  }
  /**
   * 清除所有应用存储（危险操作）
   */
  clearAll() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("btc_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => {
      const oldValue = localStorage.getItem(key);
      localStorage.removeItem(key);
      this.notifyListeners(key, null, oldValue);
    });
    const otherKeys = [
      APP_STORAGE_KEYS.TOKEN,
      APP_STORAGE_KEYS.REFRESH_TOKEN,
      APP_STORAGE_KEYS.USERNAME
    ];
    otherKeys.forEach((key) => {
      const oldValue = localStorage.getItem(key);
      localStorage.removeItem(key);
      this.notifyListeners(key, null, oldValue);
    });
  }
}
const appStorage = new AppStorageManager();
let domainListCache = null;
let pendingRequest = null;
const CACHE_DURATION = 5e3;
function handleLogout() {
  try {
    deleteCookie("access_token");
    const currentSettings = appStorage.settings.get() || {};
    if (currentSettings.is_logged_in) {
      delete currentSettings.is_logged_in;
      appStorage.settings.set(currentSettings);
    }
    appStorage.auth.clear();
    appStorage.user.clear();
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("is_logged_in");
    }
    BtcMessage.error("身份已过期，请重新登录");
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
    const isProductionSubdomain = hostname.includes("bellis.com.cn") && hostname !== "bellis.com.cn";
    setTimeout(() => {
      if (isProductionSubdomain) {
        window.location.href = `${protocol}//bellis.com.cn/login?logout=1`;
      } else {
        window.location.href = "/login?logout=1";
      }
    }, 100);
  } catch (error) {
    console.error("[getDomainList] Logout error:", error);
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.href = "/login?logout=1";
      }, 100);
    }
  }
}
async function checkUser() {
  try {
    const response = await fetch("/api/system/auth/user-check", {
      method: "GET",
      credentials: "include",
      // 包含 cookie
      headers: {
        "Content-Type": "application/json"
      }
    });
    const responseText = await response.text();
    let responseData = null;
    if (responseText.trim()) {
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.warn("[checkUser] Failed to parse JSON response:", parseError);
      }
    }
    const code = responseData?.code;
    const status = response.status;
    if (code === 200 || status === 200) {
      return true;
    }
    if (code === 401 || status === 401) {
      return false;
    }
    return true;
  } catch (error) {
    if (error?.code === 401) {
      return false;
    }
    console.warn("[getDomainList] User check failed, but continue:", error);
    return true;
  }
}
async function getDomainList(service) {
  const now = Date.now();
  if (domainListCache && now - domainListCache.timestamp < CACHE_DURATION) {
    return domainListCache.data;
  }
  if (pendingRequest) {
    return await pendingRequest;
  }
  pendingRequest = (async () => {
    try {
      const isHealthy = await checkUser();
      if (!isHealthy) {
        handleLogout();
        return [];
      }
      if (!service) {
        console.warn("[getDomainList] EPS service not available");
        return [];
      }
      const response = await service.admin?.iam?.domain?.me();
      domainListCache = { data: response, timestamp: Date.now() };
      return response;
    } finally {
      pendingRequest = null;
    }
  })();
  return await pendingRequest;
}
function clearDomainCache() {
  domainListCache = null;
  pendingRequest = null;
}
export {
  clearDomainCache,
  getDomainList
};

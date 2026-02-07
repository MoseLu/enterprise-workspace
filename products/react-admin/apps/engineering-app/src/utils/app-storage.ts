/**
 * 应用存储工具
 */
import { logger } from '@btc/shared-core';

/**
 * 存储键前缀
 */
const STORAGE_PREFIX = 'engineering_';

/**
 * 获取存储键
 */
function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * 设置本地存储
 */
export function setLocalStorage<T>(key: string, value: T): void {
  try {
    const storageKey = getStorageKey(key);
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (error) {
    logger.error(`[engineering-app] Failed to set localStorage: ${key}`, error);
  }
}

/**
 * 获取本地存储
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const storageKey = getStorageKey(key);
    const value = localStorage.getItem(storageKey);
    if (value) {
      return JSON.parse(value) as T;
    }
  } catch (error) {
    logger.error(`[engineering-app] Failed to get localStorage: ${key}`, error);
  }
  return defaultValue;
}

/**
 * 移除本地存储
 */
export function removeLocalStorage(key: string): void {
  try {
    const storageKey = getStorageKey(key);
    localStorage.removeItem(storageKey);
  } catch (error) {
    logger.error(`[engineering-app] Failed to remove localStorage: ${key}`, error);
  }
}

/**
 * 设置会话存储
 */
export function setSessionStorage<T>(key: string, value: T): void {
  try {
    const storageKey = getStorageKey(key);
    sessionStorage.setItem(storageKey, JSON.stringify(value));
  } catch (error) {
    logger.error(`[engineering-app] Failed to set sessionStorage: ${key}`, error);
  }
}

/**
 * 获取会话存储
 */
export function getSessionStorage<T>(key: string, defaultValue: T): T {
  try {
    const storageKey = getStorageKey(key);
    const value = sessionStorage.getItem(storageKey);
    if (value) {
      return JSON.parse(value) as T;
    }
  } catch (error) {
    logger.error(`[engineering-app] Failed to get sessionStorage: ${key}`, error);
  }
  return defaultValue;
}

/**
 * 移除会话存储
 */
export function removeSessionStorage(key: string): void {
  try {
    const storageKey = getStorageKey(key);
    sessionStorage.removeItem(storageKey);
  } catch (error) {
    logger.error(`[engineering-app] Failed to remove sessionStorage: ${key}`, error);
  }
}

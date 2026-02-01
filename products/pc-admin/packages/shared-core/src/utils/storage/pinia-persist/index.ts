/**
 * Pinia 持久化插件配置
 * 提供统一的 Pinia persistedstate 插件配置
 */

import { createPersistedState } from 'pinia-plugin-persistedstate';
import type { PiniaPluginContext } from 'pinia';

export interface PersistedStatePluginOptions {
  /**
   * 存储类型：localStorage 或 sessionStorage
   * @default 'localStorage'
   */
  storage?: 'localStorage' | 'sessionStorage';
  /**
   * 键名前缀
   * @default 'btc_'
   */
  prefix?: string;
  /**
   * 自定义键名生成函数
   */
  key?: (id: string) => string;
}

/**
 * 创建 Pinia 持久化插件
 * @param options 插件配置选项
 * @returns Pinia 插件
 */
export function createPersistedStatePlugin(
  options: PersistedStatePluginOptions = {}
): ReturnType<typeof createPersistedState> {
  const {
    storage: storageType = 'localStorage',
    prefix = 'btc_',
    key,
  } = options;

  // 获取存储对象
  const storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage;

  // 默认键名生成函数
  const defaultKey = (id: string) => {
    return `${prefix}${id}`;
  };

  return createPersistedState({
    storage,
    key: key || defaultKey,
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },
  });
}

/**
 * 默认的持久化插件（使用 localStorage）
 * 在浏览器环境中创建，SSR 环境返回空插件
 */
export const persistedStatePlugin: ReturnType<typeof createPersistedStatePlugin> =
  typeof window !== 'undefined'
    ? createPersistedStatePlugin()
    : ((_context: any) => {}) as ReturnType<typeof createPersistedStatePlugin>;

/**
 * 使用 sessionStorage 的持久化插件
 * 在浏览器环境中创建，SSR 环境返回空插件
 */
export const persistedStatePluginSession: ReturnType<typeof createPersistedStatePlugin> =
  typeof window !== 'undefined'
    ? createPersistedStatePlugin({ storage: 'sessionStorage' })
    : ((_context: any) => {}) as ReturnType<typeof createPersistedStatePlugin>;

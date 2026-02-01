/**
 * 偏好设置插件 - 子应用消费（Consumer）
 */
;
import type { QiankunActions } from '../types';
import { onGlobalStateChange } from '@btc/shared-core';

export interface PreferencePluginConsumerOptions {
  globalState?: QiankunActions;
}

/**
 * 消费偏好设置插件（子应用）
 */
export function consumePreferencePluginHost(options: PreferencePluginConsumerOptions = {}) {
  const { globalState } = options;

  if (!globalState) {
    console.warn('[preference-consumer] globalState is not provided');
    return null;
  }

  // 监听全局状态变化，子应用可以读取但不能修改（通过统一中间层）
  let prefs: Record<string, any> = {};
  onGlobalStateChange(
    (state) => {
      if (state.preferences) {
        prefs = state.preferences;
      }
    },
    true, // 立即执行一次
    'preference-consumer-listener' // 固定监听器 key
  );

  const getPreferences = () => {
    return prefs;
  };

  return {
    getPreferences,
  };
}


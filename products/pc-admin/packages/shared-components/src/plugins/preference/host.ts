/**
 * 偏好设置插件 - 主应用初始化（Host）
 */
import { storage } from '@btc/shared-core/utils';
import type { QiankunActions } from '../types';
import { setGlobalState } from '@btc/shared-core';

export interface PreferencePluginHostOptions {
  globalState?: QiankunActions;
}

let preferenceInstance: any = null;

/**
 * 初始化偏好设置插件（主应用）
 */
export function initPreferencePluginHost(options: PreferencePluginHostOptions = {}) {
  if (preferenceInstance) {
    return preferenceInstance;
  }

  const { globalState } = options;

  const update = (key: string, value: any) => {
    const currentSettings = (storage.get('settings') as Record<string, any>) || {};
    const updatedSettings = { ...currentSettings, [key]: value };
    storage.set('settings', updatedSettings);
    
    // 同步到全局状态（通过统一中间层）
    setGlobalState({ preferences: updatedSettings }, false).catch(() => {
      // 忽略错误（可能在初始化中）
    });
  };

  const get = (key: string) => {
    const settings = (storage.get('settings') as Record<string, any>) || {};
    return settings[key];
  };

  const getAll = () => {
    return (storage.get('settings') as Record<string, any>) || {};
  };

  preferenceInstance = {
    update,
    get,
    getAll,
  };

  // 初始化时同步到全局状态（通过统一中间层）
  const settings = getAll();
  setGlobalState({ preferences: settings }, false).catch(() => {
    // 忽略错误（可能在初始化中）
  });

  return preferenceInstance;
}


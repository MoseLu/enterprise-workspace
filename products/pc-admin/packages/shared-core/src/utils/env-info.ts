/**
 * 全局环境信息工具函数
 * 提供非响应式的环境信息获取函数，方便在非 Vue 代码中使用
 */

import type { Environment } from '../configs/unified-env-config';
import { getEnvironment, getCurrentSubApp } from '../configs/unified-env-config';
import { getAppConfig } from '../configs/app-env.config';

/**
 * 环境信息接口
 */
export interface EnvInfo {
  environment: Environment;
  isDev: boolean;
  isPreview: boolean;
  isPoc: boolean;
  isSit: boolean;
  isUat: boolean;
  isTest: boolean;
  isProduction: boolean;
  currentApp: string | null;
  currentAppConfig: ReturnType<typeof getAppConfig> | null;
}

/**
 * 获取当前环境信息
 * @returns 当前环境和应用信息
 */
export function getEnvInfo(): EnvInfo {
  const environment = getEnvironment();
  const currentApp = getCurrentSubApp();
  
  return {
    environment,
    isDev: environment === 'development',
    isPreview: environment === 'preview',
    isPoc: environment === 'poc',
    isSit: environment === 'sit',
    isUat: environment === 'uat',
    isTest: environment === 'test',
    isProduction: environment === 'production',
    currentApp,
    currentAppConfig: currentApp ? getAppConfig(`${currentApp}-app`) : null,
  };
}

/**
 * 获取当前环境
 * @returns 当前环境类型
 */
export function getCurrentEnvironment(): Environment {
  return getEnvironment();
}

/**
 * 获取当前应用 ID
 * @returns 当前应用 ID（如 'admin'、'system'），如果没有则为 null
 */
export function getCurrentAppId(): string | null {
  return getCurrentSubApp();
}

/**
 * 获取当前应用配置
 * @returns 当前应用的配置信息，如果没有则为 null
 */
export function getCurrentAppConfig(): ReturnType<typeof getAppConfig> | null {
  const currentApp = getCurrentSubApp();
  if (!currentApp) {
    return null;
  }
  return getAppConfig(`${currentApp}-app`);
}
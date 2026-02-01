/**
 * Vite 应用配置辅助函数
 * 用于从统一配置中获取应用的环境变量
 */

import { resolve } from 'path';
import { getAppConfig } from '../packages/shared-core/src/configs/app-env.config';

/**
 * 获取应用配置（用于 vite.config.ts）
 */
export function getViteAppConfig(appName: string): {
  devPort: number;
  devHost: string;
  prePort: number;
  preHost: string;
  prodHost: string;
  mainAppOrigin: string;
} {
  const appConfig = getAppConfig(appName);
  if (!appConfig) {
    throw new Error(`未找到 ${appName} 的环境配置`);
  }

  const mainAppConfig = getAppConfig('main-app');
  const mainAppOrigin = mainAppConfig
    ? `http://${mainAppConfig.preHost}:${mainAppConfig.prePort}`
    : 'http://localhost:4180';

  return {
    devPort: parseInt(appConfig.devPort, 10),
    devHost: appConfig.devHost,
    prePort: parseInt(appConfig.prePort, 10),
    preHost: appConfig.preHost,
    prodHost: appConfig.prodHost,
    mainAppOrigin,
  };
}

/**
 * 获取应用类型
 * @param appName 应用名称
 * @returns 应用类型
 */
export function getAppType(appName: string): 'main' | 'sub' | 'layout' {
  if (appName === 'main-app') return 'main';
  if (appName === 'layout-app') return 'layout';
  return 'sub'; // 其他都是子应用
}

/**
 * 获取 base URL
 * @param appName 应用名称
 * @param isPreviewBuild 是否为预览构建
 * @returns base URL
 */
export function getBaseUrl(appName: string, isPreviewBuild: boolean = false): string {
  const appConfig = getAppConfig(appName);
  if (!appConfig) {
    throw new Error(`未找到 ${appName} 的环境配置`);
  }
  
  // 预览构建：使用绝对路径
  if (isPreviewBuild) {
    return `http://${appConfig.preHost}:${appConfig.prePort}/`;
  }
  
  // 生产环境：使用相对路径（让浏览器根据域名自动解析）
  // 注意：子应用构建产物直接部署到子域名根目录（如 production.bellis.com.cn）
  return '/';
}

/**
 * 获取 publicDir 路径
 * @param appName 应用名称
 * @param appDir 应用根目录路径
 * @returns publicDir 路径或 false
 */
export function getPublicDir(appName: string, appDir: string): string | false {
  // main-app、admin-app 和 system-app 使用自己的 public 目录
  if (appName === 'main-app' || appName === 'admin-app' || appName === 'system-app') {
    return resolve(appDir, 'public');
  }
  
  // 其他应用使用共享的 public 目录
  return resolve(appDir, '../../packages/shared-components/public');
}


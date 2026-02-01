/**
 * qiankun 配置中心
 * 从应用扫描器和环境配置获取所有应用信息
 */

import { getSubApps } from './app-scanner';
import { getSubAppEntry, getSubAppActiveRule } from './unified-env-config';

export interface MicroAppConfig {
  name: string;
  entry: string;
  container: string;
  activeRule: string | ((location: Location) => boolean);
  timeout?: number;
}

/**
 * 生成所有子应用的 qiankun 配置
 */
export function generateQiankunConfigs(): MicroAppConfig[] {
  const subApps = getSubApps();
  
  return subApps.map(app => ({
    name: app.id,
    entry: getSubAppEntry(app.id),
    container: '#subapp-viewport',
    activeRule: getSubAppActiveRule(app.id),
    timeout: import.meta.env.DEV ? 8000 : 15000,
  }));
}

/**
 * 获取所有子应用的配置（用于系统初始化）
 */
export function getAllSubAppConfigs() {
  return getSubApps();
}

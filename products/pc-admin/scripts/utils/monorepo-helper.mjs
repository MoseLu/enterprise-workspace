/**
 * Monorepo 工具
 * 整合应用管理、包查询等功能
 * 从 apps-manager.mjs 迁移而来
 */

import { logger } from './logger.mjs';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getRootDir } from './path-helper.mjs';

let appsConfig = null;

/**
 * 加载应用配置
 */
function loadConfig() {
  if (appsConfig) return appsConfig;
  
  try {
    const configPath = join(getRootDir(), 'apps.config.json');
    const configContent = readFileSync(configPath, 'utf-8');
    appsConfig = JSON.parse(configContent);
    return appsConfig;
  } catch (error) {
    throw new Error(`无法加载应用配置: ${error.message}`);
  }
}

/**
 * 获取所有应用
 */
export function getAllApps() {
  const config = loadConfig();
  return config.apps;
}

/**
 * 根据 ID 获取应用
 */
export function getAppById(id) {
  const apps = getAllApps();
  return apps.find(app => app.id === id);
}

/**
 * 根据包名获取应用
 */
export function getAppByPackageName(packageName) {
  const apps = getAllApps();
  return apps.find(app => app.packageName === packageName || app.name === packageName);
}

/**
 * 根据分类获取应用
 */
export function getAppsByCategory(category) {
  const apps = getAllApps();
  return apps.filter(app => app.category === category);
}

/**
 * 获取默认开发应用列表
 */
export function getDefaultDevApps() {
  const config = loadConfig();
  const defaultIds = config.defaultDevApps || [];
  return defaultIds.map(id => getAppById(id)).filter(Boolean);
}

/**
 * 获取应用包名列表（用于 turbo filter）
 */
export function getAppPackageNames(appIds = null) {
  const apps = appIds 
    ? appIds.map(id => getAppById(id)).filter(Boolean)
    : getAllApps();
  return apps.map(app => app.packageName);
}

/**
 * 获取应用 ID 列表
 */
export function getAppIds(apps = null) {
  const appList = apps || getAllApps();
  return appList.map(app => app.id);
}

/**
 * 验证应用 ID 是否存在
 */
export function validateAppId(id) {
  return getAppById(id) !== undefined;
}

/**
 * 解析应用参数（支持 ID、包名、或两者混合）
 */
export function parseAppArgs(args) {
  if (!args || args.length === 0) {
    return getAllApps();
  }

  const apps = [];
  for (const arg of args) {
    let app = getAppById(arg);
    if (!app) {
      app = getAppByPackageName(arg);
    }
    if (app) {
      apps.push(app);
    } else {
      logger.warn(`警告: 未找到应用 "${arg}"`);
    }
  }

  return apps.length > 0 ? apps : getAllApps();
}

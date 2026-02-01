#!/usr/bin/env node

/**
 * 应用管理工具
 * 提供应用列表读取、过滤、查询等功能
 */
import { logger } from '../../utils/logger.mjs';

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

let appsConfig = null;

/**
 * 加载应用配置
 */
function loadConfig() {
  if (appsConfig) return appsConfig;
  
  try {
    const configPath = join(rootDir, 'apps.config.json');
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

// CLI 支持
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'list':
      const apps = getAllApps();
      logger.info(JSON.stringify(apps, null, 2));
      break;
    
    case 'ids':
      const ids = getAppIds();
      logger.info(ids.join(' '));
      break;
    
    case 'packages':
      const packages = getAppPackageNames();
      logger.info(packages.join(' '));
      break;
    
    case 'default':
      const defaultApps = getDefaultDevApps();
      logger.info(JSON.stringify(defaultApps, null, 2));
      break;
    
    case 'filter':
      const filtered = parseAppArgs(args);
      const filterPackages = getAppPackageNames(getAppIds(filtered));
      logger.info(filterPackages.join(' '));
      break;
    
    default:
      logger.info('用法:');
      logger.info('  node scripts/apps-manager.mjs list          # 列出所有应用');
      logger.info('  node scripts/apps-manager.mjs ids           # 获取所有应用 ID');
      logger.info('  node scripts/apps-manager.mjs packages      # 获取所有包名');
      logger.info('  node scripts/apps-manager.mjs default        # 获取默认开发应用');
      logger.info('  node scripts/apps-manager.mjs filter <ids>  # 过滤应用并返回包名');
      process.exit(1);
  }
}

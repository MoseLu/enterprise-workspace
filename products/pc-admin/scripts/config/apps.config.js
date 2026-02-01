/**
 * 应用配置
 * 从 apps.config.json 转换而来，支持动态配置
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { getRootDir } from '../utils/path-helper.mjs';

let config = null;

/**
 * 加载配置
 */
function loadConfig() {
  if (config) return config;
  
  try {
    const configPath = join(getRootDir(), 'apps.config.json');
    const configContent = readFileSync(configPath, 'utf-8');
    config = JSON.parse(configContent);
    return config;
  } catch (error) {
    throw new Error(`无法加载应用配置: ${error.message}`);
  }
}

/**
 * 获取所有应用
 */
export function getApps() {
  return loadConfig().apps;
}

/**
 * 获取应用分类
 */
export function getCategories() {
  return loadConfig().categories;
}

/**
 * 获取默认开发应用 ID 列表
 */
export function getDefaultDevApps() {
  return loadConfig().defaultDevApps || [];
}

/**
 * 导出完整配置
 */
export function getConfig() {
  return loadConfig();
}

/**
 * 路径处理工具
 * 提供 monorepo 路径处理相关功能
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取项目根目录
 */
export function getRootDir() {
  return join(__dirname, '../..');
}

/**
 * 获取 scripts 目录
 */
export function getScriptsDir() {
  return join(getRootDir(), 'scripts');
}

/**
 * 获取应用目录
 * @param {string} appName - 应用名称
 */
export function getAppDir(appName) {
  return join(getRootDir(), 'apps', appName);
}

/**
 * 获取包目录
 * @param {string} packageName - 包名称
 */
export function getPackageDir(packageName) {
  return join(getRootDir(), 'packages', packageName);
}

/**
 * 获取构建输出目录
 * @param {string} appName - 应用名称
 */
export function getBuildDir(appName) {
  return join(getAppDir(appName), 'dist');
}

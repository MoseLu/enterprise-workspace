/**
 * 路径辅助函数
 * 提供统一的路径解析函数，用于 Vite 配置中的别名和路径解析
 */

import { resolve } from 'path';

/**
 * 创建路径辅助函数
 * @param appDir 应用根目录路径
 * @returns 路径辅助函数对象
 */
export function createPathHelpers(appDir: string) {
  /**
   * 解析应用 src 目录下的相对路径
   */
  const withSrc = (relativePath: string) => resolve(appDir, relativePath);

  /**
   * 解析 packages 目录下的相对路径
   */
  const withPackages = (relativePath: string) => 
    resolve(appDir, '../../packages', relativePath);

  /**
   * 解析项目根目录下的相对路径
   */
  const withRoot = (relativePath: string) => 
    resolve(appDir, '../..', relativePath);

  /**
   * 解析 configs 目录下的相对路径
   */
  const withConfigs = (relativePath: string) => 
    resolve(appDir, '../../configs', relativePath);

  return { withSrc, withPackages, withRoot, withConfigs };
}


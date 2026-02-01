/**
 * 资源扫描器
 * 扫描项目中的各种资源文件
 */

import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { config } from './config.mjs';
import { logger } from '../utils/logger.mjs';

/**
 * 获取项目根目录
 */
function getProjectRoot() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return join(__dirname, '../../../../');
}

/**
 * 扫描资源文件
 */
export async function scanResources() {
  const projectRoot = getProjectRoot();
  const resources = [];

  logger.info('Scanning project resources...');

  // 扫描每种资源类型
  for (const [type, typeConfig] of Object.entries(config.resourceTypes)) {
    try {
      // 将正则表达式转换为 glob 模式
      let globPattern;
      if (typeConfig.pattern instanceof RegExp) {
        const patternStr = typeConfig.pattern.source;
        globPattern = patternStr
          .replace(/\\\./g, '.')
          .replace(/\.\*/g, '**')
          .replace(/\\\//g, '/')
          .replace(/\$\$/g, '')
          .replace(/\^/g, '');
      } else {
        globPattern = typeConfig.pattern;
      }
      
      const files = await glob(globPattern, {
        cwd: projectRoot,
        ignore: config.scanning.exclude,
        absolute: true,
      });

      logger.info(`Found ${files.length} ${type} resources`);

      for (const filePath of files) {
        const relativePath = relative(projectRoot, filePath);
        const stats = statSync(filePath);

        resources.push({
          type,
          path: filePath,
          relativePath,
          size: stats.size,
          modifiedTime: stats.mtimeMs,
        });
      }
    } catch (error) {
      logger.warn(`Failed to scan ${type} resources:`, error.message);
    }
  }

  logger.info(`Total resources found: ${resources.length}`);
  return resources;
}

/**
 * 扫描特定类型的资源
 */
export async function scanResourcesByType(type) {
  const projectRoot = getProjectRoot();
  const typeConfig = config.resourceTypes[type];

  if (!typeConfig) {
    throw new Error(`Unknown resource type: ${type}`);
  }

  // 将正则表达式转换为 glob 模式
  let globPattern;
  if (typeConfig.pattern instanceof RegExp) {
    // 将正则转换为 glob 模式
    const patternStr = typeConfig.pattern.source;
    // 简化：将 .* 转换为 **，将 \/ 转换为 /
    globPattern = patternStr
      .replace(/\\\./g, '.')
      .replace(/\.\*/g, '**')
      .replace(/\\\//g, '/')
      .replace(/\$\$/g, '')
      .replace(/\^/g, '');
  } else {
    globPattern = typeConfig.pattern;
  }
  
  const files = await glob(globPattern, {
    cwd: projectRoot,
    ignore: config.scanning.exclude,
    absolute: true,
  });

  return files.map((filePath) => {
    const relativePath = relative(projectRoot, filePath);
    const stats = statSync(filePath);

    return {
      type,
      path: filePath,
      relativePath,
      size: stats.size,
      modifiedTime: stats.mtimeMs,
    };
  });
}

/**
 * 检查资源是否需要更新
 */
export function needsUpdate(resource, lastIndexedTime) {
  if (!lastIndexedTime) {
    return true;
  }
  return resource.modifiedTime > lastIndexedTime;
}

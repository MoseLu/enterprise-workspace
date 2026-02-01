#!/usr/bin/env node

/**
 * 国际化配置合并脚本
 * 扫描应用内所有 config.ts 文件，合并配置并生成扁平化的 JSON 文件
 */
import { logger } from '../../utils/logger.mjs';

import { readdir, readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'module';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// 获取命令行参数
const args = process.argv.slice(2);
const targetApp = args.find(arg => !arg.startsWith('--')) || 'admin-app';
const isAllApps = args.includes('--all');

/**
 * 将嵌套对象转换为扁平化对象
 * @param obj 嵌套对象
 * @param prefix 前缀
 * @param result 结果对象
 * @returns 扁平化对象
 */
function flattenObject(obj, prefix = '', result = {}) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        flattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
  }
  return result;
}

/**
 * 深度合并对象
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 递归查找所有 config.ts 文件
 * @param dir 目录路径
 * @param configFiles 配置文件列表
 */
async function findConfigFiles(dir, configFiles = []) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // 跳过 node_modules、dist、build 等目录
      if (
        entry.isDirectory() &&
        !['node_modules', 'dist', 'build', '.git', '.vite'].includes(entry.name)
      ) {
        await findConfigFiles(fullPath, configFiles);
      } else if (entry.isFile() && entry.name === 'config.ts') {
        configFiles.push(fullPath);
      }
    }
  } catch (error) {
    // 忽略权限错误等
    if (error.code !== 'EACCES' && error.code !== 'ENOENT') {
      logger.warn(`[locale-merge] Error reading directory ${dir}:`, error.message);
    }
  }

  return configFiles;
}

/**
 * 检查 tsx 是否可用
 */
function isTsxAvailable() {
  try {
    execSync('tsx --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 加载 TypeScript 配置文件
 * 使用 tsx 来执行 TypeScript 文件并获取导出
 */
async function loadConfigFile(filePath) {
  try {
    // 方法1: 使用 tsx 执行文件并获取结果
    if (isTsxAvailable()) {
      try {
        // 创建一个临时脚本来加载配置并输出 JSON
        const tempScript = `
import config from '${filePath.replace(/\\/g, '/')}';
logger.info(JSON.stringify(config, null, 0));
`;
        const tempFile = join(rootDir, '.temp-config-loader.mjs');
        await writeFile(tempFile, tempScript, 'utf-8');
        
        try {
          const output = execSync(`tsx ${tempFile}`, { 
            encoding: 'utf-8',
            cwd: rootDir,
            stdio: 'pipe'
          });
          const config = JSON.parse(output.trim());
          return config;
        } finally {
          // 清理临时文件
          try {
            await unlink(tempFile);
          } catch {
            // 忽略清理错误
          }
        }
      } catch (tsxError) {
        logger.warn(`[locale-merge] Failed to load with tsx:`, tsxError.message);
      }
    }

    // 方法2: 尝试使用 require（需要 ts-node）
    try {
      const require = createRequire(import.meta.url);
      // 尝试注册 ts-node
      try {
        require('ts-node/register');
      } catch {
        // ts-node 不可用
      }
      const config = require(filePath);
      return config.default || config;
    } catch (requireError) {
      // require 失败
    }

    // 方法3: 提示安装 tsx
    logger.error(`[locale-merge] Cannot load TypeScript file ${filePath}`);
    logger.error(`[locale-merge] Please install tsx: pnpm add -D tsx`);
    return null;
  } catch (error) {
    logger.error(`[locale-merge] Failed to load config file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 判断是否为应用级 config.ts
 * @param filePath 文件路径
 * @param appDir 应用目录
 */
function isAppLevelConfig(filePath, appDir) {
  const relativePath = relative(appDir, filePath);
  return relativePath === 'src/locales/config.ts' || relativePath === 'locales/config.ts';
}

/**
 * 处理单个应用的配置合并
 */
async function processApp(appName) {
  const appDir = join(rootDir, 'apps', appName);
  
  if (!existsSync(appDir)) {
    logger.warn(`[locale-merge] App directory not found: ${appName}`);
    return;
  }

  logger.info(`[locale-merge] Processing app: ${appName}`);

  // 查找所有 config.ts 文件
  const configFiles = await findConfigFiles(appDir);
  
  if (configFiles.length === 0) {
    logger.info(`[locale-merge] No config.ts files found in ${appName}`);
    return;
  }

  logger.info(`[locale-merge] Found ${configFiles.length} config.ts file(s)`);

  // 分离应用级和页面级配置
  const appLevelConfigs = [];
  const pageLevelConfigs = [];

  for (const filePath of configFiles) {
    if (isAppLevelConfig(filePath, appDir)) {
      appLevelConfigs.push(filePath);
    } else {
      pageLevelConfigs.push(filePath);
    }
  }

  // 初始化合并结果
  let mergedConfig = {
    'zh-CN': {
      app: {},
      menu: {},
      page: {},
    },
    'en-US': {
      app: {},
      menu: {},
      page: {},
    },
  };

  // 先加载应用级配置
  for (const filePath of appLevelConfigs) {
    const config = await loadConfigFile(filePath);
    if (config) {
      // 应用级配置可能使用 LocaleConfig 格式（包含 'zh-CN' 和 'en-US'）
      // 或者直接是 LocaleConfigSingle 格式
      if (config['zh-CN'] || config['en-US']) {
        // LocaleConfig 格式
        if (config['zh-CN']) {
          mergedConfig['zh-CN'] = deepMerge(mergedConfig['zh-CN'], config['zh-CN']);
        }
        if (config['en-US']) {
          mergedConfig['en-US'] = deepMerge(mergedConfig['en-US'], config['en-US']);
        }
      } else if (config.locale) {
        // 包含 locale 字段的格式
        if (config.locale['zh-CN']) {
          mergedConfig['zh-CN'] = deepMerge(mergedConfig['zh-CN'], config.locale['zh-CN']);
        }
        if (config.locale['en-US']) {
          mergedConfig['en-US'] = deepMerge(mergedConfig['en-US'], config.locale['en-US']);
        }
      } else if (config.app || config.menu || config.page) {
        // 直接是 LocaleConfigSingle 格式（单语言，假设是 zh-CN）
        mergedConfig['zh-CN'] = deepMerge(mergedConfig['zh-CN'], config);
      }
    }
  }

  // 再加载页面级配置
  for (const filePath of pageLevelConfigs) {
    const config = await loadConfigFile(filePath);
    if (config) {
      let localeConfig = null;
      
      // 页面级配置可能使用 PageConfig 格式（包含 locale 字段）
      // 或者直接是 PageLocaleConfig 格式
      if (config.locale) {
        localeConfig = config.locale;
      } else if (config.app || config.menu || config.page) {
        // 直接是 PageLocaleConfig 格式
        localeConfig = config;
      }

      if (localeConfig) {
        // 处理单语言配置（假设是 zh-CN，如果没有指定语言）
        if (localeConfig.app) {
          mergedConfig['zh-CN'].app = deepMerge(mergedConfig['zh-CN'].app, localeConfig.app);
        }
        if (localeConfig.menu) {
          mergedConfig['zh-CN'].menu = deepMerge(mergedConfig['zh-CN'].menu, localeConfig.menu);
        }
        if (localeConfig.page) {
          mergedConfig['zh-CN'].page = deepMerge(mergedConfig['zh-CN'].page, localeConfig.page);
        }
      }
    }
  }

  // 转换为扁平化结构
  const flatZhCN = flattenObject(mergedConfig['zh-CN']);
  const flatEnUS = flattenObject(mergedConfig['en-US']);

  // 确保输出目录存在
  const outputDir = join(appDir, 'src', 'locales');
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  // 写入 JSON 文件
  const zhCNPath = join(outputDir, 'zh-CN.json');
  const enUSPath = join(outputDir, 'en-US.json');

  await writeFile(zhCNPath, JSON.stringify(flatZhCN, null, 2), 'utf-8');
  await writeFile(enUSPath, JSON.stringify(flatEnUS, null, 2), 'utf-8');

  logger.info(`[locale-merge] ✅ Generated locale files for ${appName}`);
  logger.info(`  - ${zhCNPath}`);
  logger.info(`  - ${enUSPath}`);
}

/**
 * 主函数
 */
async function main() {
  if (isAllApps) {
    // 处理所有应用
    const appsDir = join(rootDir, 'apps');
    const apps = await readdir(appsDir, { withFileTypes: true });
    
    for (const app of apps) {
      if (app.isDirectory()) {
        await processApp(app.name);
      }
    }
  } else {
    // 处理单个应用
    await processApp(targetApp);
  }
}

main().catch((error) => {
  logger.error('[locale-merge] Error:', error);
  process.exit(1);
});

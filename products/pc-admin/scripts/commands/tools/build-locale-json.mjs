#!/usr/bin/env node

/**
 * 构建脚本：将 config.ts 导出为 JSON 文件
 * 用于 CDN 模式的国际化配置
 * 
 * 使用方法：
 *   node scripts/commands/tools/build-locale-json.mjs
 *   node scripts/commands/tools/build-locale-json.mjs --app system-app
 */

import { logger } from '../../../utils/logger.mjs';
import { getRootDir, getAppDir } from '../../../utils/path-helper.mjs';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { glob } from 'glob';
import { createRequire } from 'module';

const projectRoot = getRootDir();

/**
 * 应用列表
 */
const APP_LIST = [
  'system-app',
  'admin-app',
  'logistics-app',
  'quality-app',
  'production-app',
  'engineering-app',
  'finance-app',
  'layout-app',
  'operations-app',
  'dashboard-app',
  'personnel-app',
  'main-app',
  'docs-app',
];

/**
 * 使用 tsx 或 ts-node 执行 TypeScript 文件并获取导出
 * 如果不可用，则尝试从编译后的文件读取
 */
async function loadConfigFromTS(filePath) {
  try {
    // 方法1: 尝试使用 tsx（如果已安装）
    try {
      const { register } = await import('tsx');
      register();
      const module = await import(filePath);
      return module.default || module;
    } catch {
      // tsx 不可用，继续尝试其他方法
    }

    // 方法2: 尝试使用 ts-node/esm
    try {
      const { register } = await import('ts-node/esm');
      register();
      const module = await import(filePath);
      return module.default || module;
    } catch {
      // ts-node 不可用，继续尝试其他方法
    }

    // 方法3: 尝试直接导入（如果文件已经被编译）
    try {
      const module = await import(filePath);
      return module.default || module;
    } catch {
      // 直接导入失败
    }

    // 方法4: 读取文件内容并使用 eval（不推荐，但作为最后手段）
    // 这里我们使用更安全的方法：使用 Node.js 的 require（如果可用）
    try {
      const require = createRequire(import.meta.url);
      // 将文件路径转换为 .js（假设已编译）
      const jsPath = filePath.replace(/\.ts$/, '.js');
      if (existsSync(jsPath)) {
        const module = require(jsPath);
        return module.default || module;
      }
    } catch {
      // require 方法失败
    }

    throw new Error('无法加载 TypeScript 配置文件，请确保已安装 tsx 或 ts-node');
  } catch (error) {
    logger.error(`加载配置文件失败: ${filePath}`, error);
    throw error;
  }
}

/**
 * 从文件系统读取并解析 config.ts（使用简单的方法）
 * 由于直接执行 TypeScript 可能复杂，我们使用一个变通方法：
 * 在构建时，config.ts 应该已经被 Vite 处理，我们可以从构建产物中读取
 * 或者使用一个简单的解析器来提取配置
 */
async function extractConfigFromTSFile(filePath) {
  try {
    // 首先尝试使用 tsx 直接执行
    try {
      const { register } = await import('tsx');
      register();
      const module = await import(filePath);
      const config = module.default || module;
      if (config && typeof config === 'object' && ('zh-CN' in config || 'en-US' in config)) {
        return config;
      }
    } catch (tsxError) {
      // tsx 不可用，尝试其他方法
      logger.warn(`tsx 不可用，尝试其他方法: ${tsxError.message}`);
    }

    // 如果 tsx 不可用，尝试使用 Node.js 的 vm 模块执行编译后的代码
    // 或者使用一个简单的 AST 解析器
    // 这里我们使用一个更实用的方法：假设文件已经被编译到 dist 目录
    const distPath = filePath
      .replace(/apps\/([^/]+)\/src\//, 'apps/$1/dist/')
      .replace(/\.ts$/, '.js');
    
    if (existsSync(distPath)) {
      try {
        const module = await import(`file://${distPath}`);
        const config = module.default || module;
        if (config && typeof config === 'object') {
          return config;
        }
      } catch {
        // dist 文件也不可用
      }
    }

    // 最后的方法：读取源文件并使用简单的正则表达式提取（不推荐，但作为降级方案）
    logger.warn(`无法直接执行 TypeScript，尝试从源文件解析: ${filePath}`);
    const content = readFileSync(filePath, 'utf-8');
    
    // 这是一个非常简单的解析，只适用于简单的对象字面量
    // 对于复杂的配置，建议使用 tsx
    throw new Error('需要 tsx 或 ts-node 来执行 TypeScript 文件');
  } catch (error) {
    logger.error(`提取配置失败: ${filePath}`, error);
    throw error;
  }
}

/**
 * 构建单个应用的国际化 JSON
 */
async function buildAppLocaleJson(appName) {
  const appDir = getAppDir(appName);
  const outputDir = join(projectRoot, 'dist', 'locales', appName);
  
  // 确保输出目录存在
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // 查找所有 config.ts 文件
  const configFiles = await glob([
    join(appDir, 'src/locales/config.ts'),
    join(appDir, 'src/modules/**/config.ts'),
  ], {
    cwd: projectRoot,
    absolute: true,
  });

  if (configFiles.length === 0) {
    logger.warn(`未找到 ${appName} 的 config.ts 文件`);
    return false;
  }

  // 合并所有 config.ts 的配置
  let mergedConfig = {
    'zh-CN': {},
    'en-US': {},
  };

  for (const configFile of configFiles) {
    try {
      // 尝试使用 tsx 加载
      let config;
      try {
        // 动态导入 tsx 并注册
        const tsxModule = await import('tsx');
        if (tsxModule.register) {
          tsxModule.register();
        }
        const module = await import(`file://${configFile}`);
        config = module.default || module;
      } catch (tsxError) {
        // 如果 tsx 不可用，尝试其他方法
        logger.warn(`无法使用 tsx 加载 ${configFile}，尝试其他方法...`);
        // 尝试使用 node --loader tsx/esm 的方式
        // 或者提示用户安装 tsx
        throw new Error('需要安装 tsx 来执行此脚本: pnpm add -D tsx');
      }

      if (config && typeof config === 'object') {
        // 合并配置
        if (config['zh-CN']) {
          mergedConfig['zh-CN'] = { ...mergedConfig['zh-CN'], ...config['zh-CN'] };
        }
        if (config['en-US']) {
          mergedConfig['en-US'] = { ...mergedConfig['en-US'], ...config['en-US'] };
        }
      }
    } catch (error) {
      logger.error(`处理配置文件失败: ${configFile}`, error);
      // 继续处理其他文件
    }
  }

  // 导出为 JSON 文件（UTF-8，无 BOM）
  const zhCNPath = join(outputDir, 'zh-CN.json');
  const enUSPath = join(outputDir, 'en-US.json');

  writeFileSync(zhCNPath, JSON.stringify(mergedConfig['zh-CN'], null, 2), 'utf-8');
  writeFileSync(enUSPath, JSON.stringify(mergedConfig['en-US'], null, 2), 'utf-8');

  logger.info(`✅ ${appName}: 已导出国际化 JSON 文件`);
  logger.info(`   ${zhCNPath}`);
  logger.info(`   ${enUSPath}`);

  return true;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const appName = args.find(arg => !arg.startsWith('--'));

  logger.info('🚀 开始构建国际化 JSON 文件...');

  try {
    // 检查是否安装了 tsx
    try {
      await import('tsx');
    } catch {
      logger.warn('⚠️  未检测到 tsx，尝试安装: pnpm add -D tsx');
      logger.warn('   或者使用已编译的文件（需要先构建应用）');
    }

    const appsToBuild = appName ? [appName] : APP_LIST;
    let successCount = 0;
    let failCount = 0;

    for (const app of appsToBuild) {
      try {
        const success = await buildAppLocaleJson(app);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        logger.error(`构建 ${app} 失败:`, error);
        failCount++;
      }
    }

    logger.info(`\n📊 构建完成: 成功 ${successCount} 个，失败 ${failCount} 个`);
  } catch (error) {
    logger.error('构建失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main().catch((error) => {
  logger.error('未处理的错误:', error);
  process.exit(1);
});

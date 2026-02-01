#!/usr/bin/env node

/**
 * 交互式应用创建脚手架
 * 基于 layout-app 模板创建新应用
 * 
 * 用法：
 *   pnpm create-app
 *   pnpm create-app my-app
 *   node scripts/create-app-cli.mjs
 */
import { logger } from '../../utils/logger.mjs';

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 检查已存在的应用端口
function getUsedPorts() {
  const appsDir = path.join(rootDir, 'apps');
  const usedPorts = new Set();
  
  if (fs.existsSync(appsDir)) {
    const apps = fs.readdirSync(appsDir);
    apps.forEach(app => {
      const packageJsonPath = path.join(appsDir, app, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          if (pkg.scripts?.dev) {
            const match = pkg.scripts.dev.match(/--port\s+(\d+)/);
            if (match) {
              usedPorts.add(parseInt(match[1]));
            }
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    });
  }
  
  return usedPorts;
}

// 生成可用端口
function generatePort(usedPorts) {
  const basePort = 3000;
  let port = basePort;
  while (usedPorts.has(port)) {
    port++;
  }
  return port;
}

// 转换为驼峰命名
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// 转换为帕斯卡命名
function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

// 验证应用名称
function validateAppName(name) {
  if (!name) return '应用名称不能为空';
  if (!/^[a-z0-9-]+$/.test(name)) {
    return '应用名称只能包含小写字母、数字和连字符';
  }
  if (name.startsWith('-') || name.endsWith('-')) {
    return '应用名称不能以连字符开头或结尾';
  }
  
  const targetDir = path.join(rootDir, 'apps', `${name}-app`);
  if (fs.existsSync(targetDir)) {
    return `应用目录已存在: ${targetDir}`;
  }
  
  return true;
}

// 交互式询问
async function promptUser(appNameFromArgs) {
  const usedPorts = getUsedPorts();
  const defaultPort = generatePort(usedPorts);
  
  const questions = [
    {
      type: appNameFromArgs ? null : 'text',
      name: 'appName',
      message: '应用名称 (kebab-case):',
      initial: appNameFromArgs || 'my-app',
      validate: validateAppName,
    },
    {
      type: 'text',
      name: 'appTitle',
      message: '应用标题 (显示名称):',
      initial: (prev) => {
        const name = appNameFromArgs || prev;
        return `${toPascalCase(name)} 应用`;
      },
    },
    {
      type: 'number',
      name: 'devPort',
      message: '开发服务器端口:',
      initial: defaultPort,
      validate: (value) => {
        if (value < 1024 || value > 65535) {
          return '端口号必须在 1024-65535 之间';
        }
        if (usedPorts.has(value)) {
          return `端口 ${value} 已被使用`;
        }
        return true;
      },
    },
    {
      type: 'select',
      name: 'templateType',
      message: '选择模板类型:',
      choices: [
        { title: '完整业务应用模板 (推荐)', value: 'full', description: '包含 bootstrap、composables、modules 等完整结构' },
        { title: '最小化应用模板', value: 'minimal', description: '只包含基本结构，适合简单应用' },
      ],
      initial: 0,
    },
    {
      type: 'multiselect',
      name: 'features',
      message: '选择功能特性:',
      choices: [
        { title: 'ECharts 图表支持', value: 'echarts', selected: true },
        { title: '国际化 (i18n)', value: 'i18n', selected: true },
        { title: '状态管理 (Pinia)', value: 'store', selected: true },
        { title: '路由管理', value: 'router', selected: true },
        { title: 'EPS 服务', value: 'eps', selected: true },
      ],
    },
    {
      type: 'confirm',
      name: 'useLayoutApp',
      message: '使用 layout-app 作为布局容器?',
      initial: true,
    },
  ];
  
  const answers = await prompts(questions, {
    onCancel: () => {
      logger.info('\n❌ 已取消创建应用');
      process.exit(0);
    },
  });
  
  return {
    appName: appNameFromArgs || answers.appName,
    appTitle: answers.appTitle,
    devPort: answers.devPort,
    templateType: answers.templateType,
    features: answers.features || [],
    useLayoutApp: answers.useLayoutApp,
  };
}

// 复制模板文件
async function copyTemplateFiles(templateDir, targetDir, replacements, options) {
  async function copyAndReplace(src, dest) {
    const stat = await fs.stat(src);
    
    if (stat.isDirectory()) {
      await fs.ensureDir(dest);
      const entries = await fs.readdir(src);
      
      for (const entry of entries) {
        // 跳过模板文件（.template 后缀）
        if (entry.endsWith('.template')) {
          // 复制并重命名（去掉 .template 后缀）
          const srcPath = path.join(src, entry);
          const destPath = path.join(dest, entry.replace(/\.template$/, ''));
          await copyAndReplace(srcPath, destPath);
          continue;
        }
        
        // 跳过不需要的功能目录
        if (entry === 'echarts' && !options.features.includes('echarts')) {
          continue;
        }
        if (entry === 'i18n' && !options.features.includes('i18n')) {
          continue;
        }
        if (entry === 'store' && !options.features.includes('store')) {
          continue;
        }
        
        const srcPath = path.join(src, entry);
        const destPath = path.join(dest, entry);
        await copyAndReplace(srcPath, destPath);
      }
    } else {
      let content = await fs.readFile(src, 'utf-8');
      
      // 替换占位符
      for (const [placeholder, value] of Object.entries(replacements)) {
        content = content.replace(
          new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
          value
        );
      }
      
      // 根据功能特性条件替换
      if (!options.features.includes('echarts')) {
        content = content.replace(/\/\* ECHARTS_START \*\/[\s\S]*?\/\* ECHARTS_END \*\//g, '');
      }
      if (!options.features.includes('i18n')) {
        content = content.replace(/\/\* I18N_START \*\/[\s\S]*?\/\* I18N_END \*\//g, '');
      }
      
      await fs.writeFile(dest, content, 'utf-8');
    }
  }
  
  await copyAndReplace(templateDir, targetDir);
}

// 主函数
async function main() {
  logger.info('🚀 BTC ShopFlow 应用创建脚手架\n');
  
  const appNameFromArgs = process.argv[2];
  
  // 如果提供了应用名称，先验证
  if (appNameFromArgs) {
    const validation = validateAppName(appNameFromArgs);
    if (validation !== true) {
      logger.error(`❌ ${validation}`);
      process.exit(1);
    }
  }
  
  // 交互式询问
  const options = await promptUser(appNameFromArgs);
  
  if (!options.appName) {
    logger.error('❌ 应用名称不能为空');
    process.exit(1);
  }
  
  // 模板目录（从 layout-app 的 template 目录）
  const templateDir = path.join(rootDir, 'apps', 'layout-app', 'src', 'template');
  const targetDir = path.join(rootDir, 'apps', `${options.appName}-app`);
  
  // 检查模板目录
  if (!fs.existsSync(templateDir)) {
    logger.error(`❌ 错误：模板目录不存在: ${templateDir}`);
    logger.error('   请确保 apps/layout-app/src/template 目录存在');
    process.exit(1);
  }
  
  // 生成占位符替换映射
  const replacements = {
    '{{APP_NAME}}': options.appName,
    '{{APP_NAME_CAMEL}}': toCamelCase(options.appName),
    '{{APP_NAME_PASCAL}}': toPascalCase(options.appName),
    '{{APP_NAME_PASCAL_APP}}': `${toPascalCase(options.appName)}App`,
    '{{APP_ID}}': options.appName,
    '{{APP_BASE_PATH}}': `/${options.appName}`,
    '{{APP_PORT}}': String(options.devPort),
    '{{APP_TITLE}}': options.appTitle,
  };
  
  logger.info(`\n📦 正在创建应用: ${options.appName}`);
  logger.info(`   模板目录: ${templateDir}`);
  logger.info(`   目标目录: ${targetDir}`);
  logger.info(`   端口: ${options.devPort}`);
  logger.info(`   模板类型: ${options.templateType}`);
  logger.info(`   功能特性: ${options.features.join(', ') || '无'}`);
  
  try {
    // 复制模板文件
    await copyTemplateFiles(templateDir, targetDir, replacements, options);
    
    // 更新 package.json（如果需要）
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      pkg.name = `${options.appName}-app`;
      pkg.description = options.appTitle;
      // 更新 dev 脚本中的端口
      if (pkg.scripts?.dev) {
        pkg.scripts.dev = pkg.scripts.dev.replace(/--port\s+\d+/, `--port ${options.devPort}`);
      }
      fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
    }
    
    logger.info('\n✅ 应用创建成功！');
    logger.info(`\n📖 下一步：`);
    logger.info(`   1. cd apps/${options.appName}-app`);
    logger.info(`   2. pnpm install`);
    logger.info(`   3. pnpm dev`);
    logger.info(`\n📚 参考文档:`);
    logger.info(`   - 应用开发规范: docs/APP_DEVELOPMENT_GUIDE.md`);
    logger.info(`   - layout-app 模板: apps/layout-app/README.md`);
    
  } catch (error) {
    logger.error('❌ 创建应用时出错:', error);
    
    // 清理失败的文件
    if (fs.existsSync(targetDir)) {
      await fs.remove(targetDir);
      logger.info('🧹 已清理失败创建的文件');
    }
    
    process.exit(1);
  }
}

main();


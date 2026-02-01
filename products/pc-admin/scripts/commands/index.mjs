#!/usr/bin/env node
/**
 * 交互式命令系统主入口
 * 支持交互式选择和快速模式
 * 
 * 用法:
 *   pnpm cmd                    # 交互式模式
 *   pnpm cmd dev system          # 快速模式：开发系统应用
 *   pnpm cmd lint admin fix      # 快速模式：修复管理应用代码
 */
import { logger } from '../../utils/logger.mjs';

import prompts from 'prompts';
import { COMMAND_TYPES, APP_CHOICES, getSubCommandChoices, getAppDisplayName } from './config.mjs';
import { handleDev } from './handlers/dev.mjs';
import { handleBuild } from './handlers/build.mjs';
import { handlePreview } from './handlers/preview.mjs';
import { handleLint } from './handlers/lint.mjs';
import { handleTypeCheck } from './handlers/type-check.mjs';
import { handleDeploy } from './handlers/deploy.mjs';
import { handleBuildDeploy } from './handlers/build-deploy.mjs';
import { handleBuildPreview } from './handlers/build-preview.mjs';
import { showError, showInfo } from './utils.mjs';

// 命令处理器映射
const HANDLERS = {
  dev: handleDev,
  build: handleBuild,
  preview: handlePreview,
  lint: handleLint,
  'type-check': handleTypeCheck,
  deploy: handleDeploy,
  'build-deploy': handleBuildDeploy,
  'build-preview': handleBuildPreview,
};

/**
 * 快速模式：直接从命令行参数执行
 */
async function quickMode(args) {
  const [commandType, appName, subCommand] = args;
  
  if (!commandType) {
    showError('请指定命令类型');
    process.exit(1);
  }
  
  if (!COMMAND_TYPES[commandType]) {
    showError(`未知的命令类型: ${commandType}`);
    showInfo(`可用的命令类型: ${Object.keys(COMMAND_TYPES).join(', ')}`);
    process.exit(1);
  }
  
  if (!appName) {
    showError('请指定应用名称');
    process.exit(1);
  }
  
  const cmd = COMMAND_TYPES[commandType];
  const handler = HANDLERS[commandType];
  
  if (!handler) {
    showError(`命令类型 ${commandType} 的处理器未实现`);
    process.exit(1);
  }
  
  // 检查是否需要子命令
  if (cmd.subCommands && !subCommand) {
    showError(`命令类型 ${commandType} 需要指定子命令`);
    showInfo(`可用的子命令: ${Object.keys(cmd.subCommands).join(', ')}`);
    process.exit(1);
  }
  
  // 执行命令
  // lint 命令在快速模式下也使用 continueOnError，但单个应用时仍会显示错误
  const isLintCommand = commandType === 'lint';
  if (isLintCommand) {
    await handler(appName, subCommand, { continueOnError: false });
  } else {
    await handler(appName, subCommand);
  }
}

/**
 * 交互式模式：通过提示选择
 */
async function interactiveMode() {
  logger.info('\n\x1b[36m╔══════════════════════════════════════════════════════════╗\x1b[0m');
  logger.info('\x1b[36m║\x1b[0m  \x1b[33mBTC ShopFlow 交互式命令系统\x1b[0m                          \x1b[36m║\x1b[0m');
  logger.info('\x1b[36m╚══════════════════════════════════════════════════════════╝\x1b[0m\n');
  
  // 1. 选择命令类型
  const { commandType } = await prompts({
    type: 'select',
    name: 'commandType',
    message: '请选择要执行的命令类型',
    choices: Object.values(COMMAND_TYPES).map(cmd => ({
      title: cmd.displayName,
      value: cmd.name,
      description: cmd.description,
    })),
    initial: 0,
  });
  
  if (!commandType) {
    logger.info('\n操作已取消');
    process.exit(0);
  }
  
  const cmd = COMMAND_TYPES[commandType];
  
  // 2. 选择应用（支持多选）
  const appPrompt = {
    type: cmd.supportsMultiApp ? 'multiselect' : 'select',
    name: 'appNames',
    message: cmd.supportsMultiApp ? '请选择要操作的应用（可多选）' : '请选择要操作的应用',
    choices: APP_CHOICES,
    initial: 0,
  };
  
  const { appNames } = await prompts(appPrompt);
  
  if (!appNames || (Array.isArray(appNames) && appNames.length === 0)) {
    logger.info('\n操作已取消');
    process.exit(0);
  }
  
  // 确保 appNames 是数组
  const apps = Array.isArray(appNames) ? appNames : [appNames];
  
  // 3. 选择子命令（如果需要）
  let subCommand = null;
  if (cmd.subCommands) {
    const { subCmd } = await prompts({
      type: 'select',
      name: 'subCmd',
      message: '请选择子命令',
      choices: getSubCommandChoices(commandType),
      initial: 0,
    });
    
    if (subCmd === undefined) {
      logger.info('\n操作已取消');
      process.exit(0);
    }
    
    subCommand = subCmd;
  }
  
  // 4. 确认执行
  const commandDesc = subCommand 
    ? `${cmd.displayName} - ${cmd.subCommands[subCommand].displayName}`
    : cmd.displayName;
  const appsDesc = apps.map(app => getAppDisplayName(app)).join(', ');
  
  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: `确认执行: ${commandDesc} 于 ${appsDesc}?`,
    initial: true,
  });
  
  if (!confirm) {
    logger.info('\n操作已取消');
    process.exit(0);
  }
  
  // 5. 执行命令
  const handler = HANDLERS[commandType];
  if (!handler) {
    showError(`命令类型 ${commandType} 的处理器未实现`);
    process.exit(1);
  }
  
  // 如果是 lint 命令，使用 continueOnError 模式
  const isLintCommand = commandType === 'lint';
  const handlerOptions = isLintCommand ? { continueOnError: true } : {};
  
  // 如果是多应用，依次执行
  const results = [];
  for (const appName of apps) {
    if (isLintCommand) {
      const result = await handler(appName, subCommand, handlerOptions);
      if (result) {
        results.push(result);
      }
    } else {
      await handler(appName, subCommand);
    }
  }
  
  // 如果是 lint 命令，显示统计信息
  if (isLintCommand && results.length > 0) {
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);
    const totalWarnings = results.reduce((sum, r) => sum + (r.warnings || 0), 0);
    
    logger.info('\n' + '='.repeat(60));
    logger.info('\x1b[33m代码检查统计\x1b[0m');
    logger.info('='.repeat(60));
    logger.info(`成功: \x1b[32m${successCount}\x1b[0m 个应用`);
    if (failCount > 0) {
      logger.info(`失败: \x1b[31m${failCount}\x1b[0m 个应用`);
    }
    if (totalErrors > 0) {
      logger.info(`错误: \x1b[31m${totalErrors}\x1b[0m 个`);
    }
    if (totalWarnings > 0) {
      logger.info(`警告: \x1b[33m${totalWarnings}\x1b[0m 个`);
    }
    logger.info('='.repeat(60) + '\n');
  } else {
    logger.info('\n\x1b[32m✓ 所有命令执行完成\x1b[0m\n');
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  // 快速模式：如果提供了命令行参数
  if (args.length > 0) {
    await quickMode(args);
  } else {
    // 交互式模式
    await interactiveMode();
  }
}

// 处理 Ctrl+C
process.on('SIGINT', () => {
  logger.info('\n\n操作已取消');
  process.exit(0);
});

// 运行主函数
main().catch(error => {
  showError(`执行失败: ${error.message}`);
  logger.error(error);
  process.exit(1);
});


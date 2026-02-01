/**
 * Type-check 命令处理器
 */
import { logger } from '../../utils/logger.mjs';

import { executeCommand, showCommandPreview, showSuccess, showError } from '../utils.mjs';
import { getAppPackageName, getAppDisplayName } from '../config.mjs';

export async function handleTypeCheck(appName) {
  const packageName = getAppPackageName(appName);
  const displayName = getAppDisplayName(appName);
  
  // 在类型检查之前，先构建所有共享依赖包
  logger.info('🔨 构建共享依赖包...');
  const buildCommands = [
    'pnpm --filter @btc/shared-utils run build',
    'pnpm --filter @btc/shared-core run build',
    'pnpm --filter @btc/shared-components run build'
  ];
  
  for (const buildCmd of buildCommands) {
    const buildResult = executeCommand(buildCmd);
    if (!buildResult.success) {
      logger.warn(`⚠️  构建命令失败，但继续类型检查: ${buildCmd}`);
    }
  }
  
  const command = `pnpm --filter ${packageName} type-check`;
  showCommandPreview(command, `检查 ${displayName} 类型`);
  
  const result = executeCommand(command);
  
  if (result.success) {
    showSuccess(`${displayName} 类型检查通过`);
  } else {
    showError(`检查 ${displayName} 类型失败: ${result.error}`);
    process.exit(result.exitCode);
  }
}


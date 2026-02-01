/**
 * 预览命令处理器
 */

import { executeCommand, showCommandPreview, showSuccess, showError } from '../utils.mjs';
import { getAppPackageName, getAppDisplayName } from '../config.mjs';

export async function handlePreview(appName) {
  const packageName = getAppPackageName(appName);
  const displayName = getAppDisplayName(appName);
  
  let command;
  
  // system-app 有特殊的预览脚本
  if (appName === 'system') {
    command = 'cd apps/system-app && node scripts/build.js preview';
  } else {
    command = `pnpm --filter ${packageName} preview`;
  }
  
  showCommandPreview(command, `预览 ${displayName} 构建结果`);
  
  const result = executeCommand(command);
  
  if (result.success) {
    showSuccess(`${displayName} 预览服务器已启动`);
  } else {
    showError(`启动 ${displayName} 预览服务器失败: ${result.error}`);
    process.exit(result.exitCode);
  }
}


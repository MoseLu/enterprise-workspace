/**
 * 构建并预览命令处理器
 */

import { executeCommand, showCommandPreview, showSuccess, showError } from '../utils.mjs';
import { getAppPackageName, getAppDisplayName } from '../config.mjs';

export async function handleBuildPreview(appName) {
  const packageName = getAppPackageName(appName);
  const displayName = getAppDisplayName(appName);
  
  let command;
  
  if (appName === 'system') {
    command = 'cd apps/system-app && node scripts/build.js build && node scripts/build.js preview';
  } else {
    const buildCmd = `pnpm --filter ${packageName} build`;
    const previewCmd = `pnpm --filter ${packageName} preview`;
    command = `${buildCmd} && ${previewCmd}`;
  }
  
  showCommandPreview(command, `构建并预览 ${displayName}`);
  
  const result = executeCommand(command);
  
  if (result.success) {
    showSuccess(`${displayName} 构建并预览完成`);
  } else {
    showError(`构建并预览 ${displayName} 失败: ${result.error}`);
    process.exit(result.exitCode);
  }
}


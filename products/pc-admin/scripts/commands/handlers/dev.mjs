/**
 * 开发命令处理器
 */

import { executeCommand, showCommandPreview, showSuccess, showError } from '../utils.mjs';
import { getAppPackageName, getAppDisplayName } from '../config.mjs';

export async function handleDev(appName) {
  const packageName = getAppPackageName(appName);
  const displayName = getAppDisplayName(appName);
  
  const command = `pnpm --filter ${packageName} dev`;
  showCommandPreview(command, `启动 ${displayName} 开发服务器`);
  
  const result = executeCommand(command);
  
  if (result.success) {
    showSuccess(`${displayName} 开发服务器已启动`);
  } else {
    showError(`启动 ${displayName} 开发服务器失败: ${result.error}`);
    process.exit(result.exitCode);
  }
}


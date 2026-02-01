/**
 * 构建命令处理器
 */

import { executeCommand, showCommandPreview, showSuccess, showError } from '../utils.mjs';
import { getAppPackageName, getAppDisplayName } from '../config.mjs';

export async function handleBuild(appName) {
  const packageName = getAppPackageName(appName);
  const displayName = getAppDisplayName(appName);
  
  let command;
  
  // system-app 有特殊的构建脚本
  if (appName === 'system') {
    command = 'cd apps/system-app && node scripts/build.js build';
  } else {
    command = `pnpm --filter ${packageName} build`;
    
    // logistics-app 需要额外的验证步骤
    if (appName === 'logistics') {
      command += ' && node scripts/verify-build-assets.mjs logistics-app';
    }
  }
  
  showCommandPreview(command, `构建 ${displayName}`);
  
  const result = executeCommand(command);
  
  if (result.success) {
    showSuccess(`${displayName} 构建完成`);
  } else {
    showError(`构建 ${displayName} 失败: ${result.error}`);
    process.exit(result.exitCode);
  }
}


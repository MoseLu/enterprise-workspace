/**
 * 构建并部署命令处理器
 */

import { executeCommand, showCommandPreview, showSuccess, showError } from '../utils.mjs';
import { getAppPackageName, getAppDisplayName } from '../config.mjs';

export async function handleBuildDeploy(appName, subCommand = 'full') {
  const packageName = getAppPackageName(appName);
  const displayName = getAppDisplayName(appName);
  
  let command;
  let description;
  
  switch (subCommand) {
    case 'full':
      // 完整部署：构建 + 部署应用 + 部署静态资源
      const buildCmd = appName === 'system' 
        ? 'cd apps/system-app && node scripts/build.js build'
        : `pnpm --filter ${packageName} build`;
      const deployCmd = `bash scripts/deploy-app-local.sh ${packageName}`;
      const staticCmd = `bash scripts/deploy-static.sh --app ${packageName}`;
      command = `${buildCmd} && ${deployCmd} && ${staticCmd}`;
      description = `完整部署 ${displayName}（构建 + 部署应用 + 部署静态资源）`;
      break;
    case 'k8s':
      command = `bash scripts/build-deploy-incremental-k8s.sh --apps ${packageName}`;
      description = `构建并部署 ${displayName} 到 Kubernetes`;
      break;
    default:
      showError(`未知的构建部署类型: ${subCommand}`);
      process.exit(1);
  }
  
  showCommandPreview(command, description);
  
  const result = executeCommand(command);
  
  if (result.success) {
    showSuccess(`${displayName} 构建并部署完成`);
  } else {
    showError(`构建并部署 ${displayName} 失败: ${result.error}`);
    process.exit(result.exitCode);
  }
}


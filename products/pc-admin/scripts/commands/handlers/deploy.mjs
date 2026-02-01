/**
 * 部署命令处理器
 */

import { executeCommand, showCommandPreview, showSuccess, showError } from '../utils.mjs';
import { getAppPackageName, getAppDisplayName } from '../config.mjs';

export async function handleDeploy(appName, subCommand = 'local') {
  const packageName = getAppPackageName(appName);
  const displayName = getAppDisplayName(appName);
  
  let command;
  let description;
  
  switch (subCommand) {
    case 'local':
      command = `bash scripts/deploy-app-local.sh ${packageName}`;
      description = `部署 ${displayName} 到本地服务器`;
      break;
    case 'static':
      command = `bash scripts/deploy-static.sh --app ${packageName}`;
      description = `部署 ${displayName} 静态资源`;
      break;
    case 'k8s':
      command = `bash scripts/deploy-incremental-k8s.sh --apps ${packageName}`;
      description = `部署 ${displayName} 到 Kubernetes`;
      break;
    default:
      showError(`未知的部署类型: ${subCommand}`);
      process.exit(1);
  }
  
  showCommandPreview(command, description);
  
  const result = executeCommand(command);
  
  if (result.success) {
    showSuccess(`${displayName} 部署完成`);
  } else {
    showError(`部署 ${displayName} 失败: ${result.error}`);
    process.exit(result.exitCode);
  }
}


/**
 * 端口管理工具
 * 检查并停止占用开发端口的Node.js进程
 */

import { execSync } from 'child_process';
import { logger } from '../../utils/logger.mjs';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getRootDir } from '../../utils/path-helper.mjs';

const rootDir = getRootDir();
const isWindows = process.platform === 'win32';

/**
 * 从配置文件读取端口配置
 */
function loadPortConfigs() {
  try {
    const configPath = join(rootDir, 'packages', 'shared-core', 'src', 'configs', 'app-env.config.ts');
    const content = readFileSync(configPath, 'utf-8');
    
    // 使用正则表达式提取应用配置
    const configRegex = /{\s*appName:\s*['"]([^'"]+)['"],\s*devHost:\s*['"]([^'"]+)['"],\s*devPort:\s*['"]([^'"]+)['"]/g;
    const configs = [];
    let match;
    
    while ((match = configRegex.exec(content)) !== null) {
      configs.push({
        appName: match[1],
        devHost: match[2],
        devPort: parseInt(match[3], 10),
      });
    }
    
    return configs;
  } catch (error) {
    logger.warn('无法读取端口配置，使用默认端口列表');
    // 返回默认端口列表
    return [
      { appName: 'main-app', devPort: 5100 },
      { appName: 'layout-app', devPort: 5101 },
      { appName: 'system-app', devPort: 5102 },
      { appName: 'admin-app', devPort: 5103 },
      { appName: 'logistics-app', devPort: 5104 },
      { appName: 'quality-app', devPort: 5105 },
      { appName: 'production-app', devPort: 5106 },
      { appName: 'engineering-app', devPort: 5107 },
      { appName: 'finance-app', devPort: 5108 },
      { appName: 'operations-app', devPort: 5109 },
      { appName: 'dashboard-app', devPort: 5110 },
      { appName: 'personnel-app', devPort: 5111 },
      { appName: 'docs-app', devPort: 5113 },
      { appName: 'home-app', devPort: 5114 }
    ];
  }
}

/**
 * 检查端口是否被占用（Windows）
 */
function getPortProcess(port) {
  if (!isWindows) {
    return null;
  }
  
  try {
    const netstatOutput = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    if (netstatOutput.trim().length === 0) {
      return null;
    }
    
    const lines = netstatOutput.trim().split('\n');
    if (lines.length > 0) {
      const parts = lines[0].trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      
      if (pid) {
        try {
          const taskOutput = execSync(`tasklist | findstr ${pid}`, {
            encoding: 'utf-8',
            stdio: 'pipe'
          });
          
          const taskLines = taskOutput.trim().split('\n');
          if (taskLines.length > 0) {
            const taskParts = taskLines[0].trim().split(/\s+/);
            const processName = taskParts[0];
            
            return {
              pid: parseInt(pid, 10),
              processName,
              isNode: processName.toLowerCase() === 'node.exe'
            };
          }
        } catch (e) {
          // 进程可能已结束
          return null;
        }
      }
    }
  } catch (error) {
    // 端口未被占用
    return null;
  }
  
  return null;
}

/**
 * 停止进程（Windows）
 */
function killProcess(pid) {
  if (!isWindows) {
    logger.warn('非Windows系统，无法自动停止进程');
    return false;
  }
  
  try {
    execSync(`taskkill /F /PID ${pid}`, {
      stdio: 'pipe'
    });
    return true;
  } catch (error) {
    logger.error(`停止进程失败 (PID: ${pid}):`, error.message);
    return false;
  }
}

/**
 * 检查并停止占用端口的Node.js进程
 * @param {boolean} autoKill - 是否自动停止
 * @returns {object} 检查结果
 */
export function checkAndKillPorts(autoKill = true) {
  const configs = loadPortConfigs();
  const excludedApps = []; // 已移除移动应用
  
  const occupiedPorts = [];
  const killedProcesses = [];
  
  logger.info('🔍 检查开发端口占用情况...\n');
  
  for (const config of configs) {
    if (excludedApps.includes(config.appName)) {
      continue;
    }
    
    const processInfo = getPortProcess(config.devPort);
    if (processInfo) {
      occupiedPorts.push({
        appName: config.appName,
        port: config.devPort,
        ...processInfo
      });
      
      if (processInfo.isNode) {
        logger.info(`  ❌ ${config.appName} 端口 ${config.devPort} 被 Node.js 进程占用 (PID: ${processInfo.pid})`);
        
        if (autoKill) {
          if (killProcess(processInfo.pid)) {
            killedProcesses.push({
              appName: config.appName,
              port: config.devPort,
              pid: processInfo.pid
            });
            logger.info(`  ✅ 已停止进程 ${processInfo.pid}`);
          }
        } else {
          logger.info(`  💡 可以使用以下命令停止: taskkill /F /PID ${processInfo.pid}`);
        }
      } else {
        logger.warn(`  ⚠️  ${config.appName} 端口 ${config.devPort} 被非Node.js进程占用 (${processInfo.processName}, PID: ${processInfo.pid})`);
        logger.warn(`     这是系统进程或其他进程，不会自动停止`);
      }
    }
  }
  
  if (occupiedPorts.length === 0) {
    logger.info('✅ 所有端口都可用\n');
    return {
      hasOccupied: false,
      killedCount: 0
    };
  }
  
  if (killedProcesses.length > 0) {
    logger.info(`\n✅ 已停止 ${killedProcesses.length} 个Node.js进程\n`);
  } else if (autoKill) {
    logger.warn('\n⚠️  发现占用端口的进程，但无法自动停止（可能是系统进程）\n');
  }
  
  return {
    hasOccupied: occupiedPorts.length > 0,
    occupiedPorts,
    killedCount: killedProcesses.length,
    killedProcesses
  };
}

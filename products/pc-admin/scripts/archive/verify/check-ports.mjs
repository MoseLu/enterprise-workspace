#!/usr/bin/env node

/**
 * 端口检查工具
 * 检查所有应用的开发端口是否被占用
 */
import { logger } from '../../../utils/logger.mjs';

import { createServer } from 'net';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

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
        devPort: match[3],
      });
    }
    
    return configs;
  } catch (error) {
    logger.error('❌ 无法读取端口配置:', error.message);
    process.exit(1);
  }
}

/**
 * 使用 netstat 检查端口是否被占用（Windows 系统）
 * 只检查 LISTENING 状态的端口，忽略 TIME_WAIT 等其他状态
 * @param {number} port 端口号
 * @returns {boolean} true 表示端口被占用，false 表示端口可用
 */
function isPortInUseNetstat(port) {
  try {
    // 使用 netstat 检查端口占用（Windows），只检查 LISTENING 状态
    const result = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf-8', stdio: 'pipe' });
    return result.trim().length > 0;
  } catch (error) {
    // netstat 命令失败或端口未被占用（findstr 找不到时返回非零退出码）
    return false;
  }
}

/**
 * 检查端口是否被占用（使用 netstat，更可靠）
 * @param {number} port 端口号
 * @returns {Promise<boolean>} true 表示端口被占用，false 表示端口可用
 */
function isPortInUse(port) {
  return new Promise((resolve) => {
    // 优先使用 netstat 检查（Windows 系统更可靠）
    if (process.platform === 'win32') {
      resolve(isPortInUseNetstat(port));
      return;
    }
    
    // 其他系统使用原来的方法
    const server = createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(false); // 端口可用
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(true); // 端口被占用
    });
  });
}

/**
 * 检查所有应用的端口（排除移动应用）
 * @returns {Promise<Array<{appName: string, port: string, inUse: boolean}>>}
 */
async function checkAllPorts() {
  const configs = loadPortConfigs();
  const results = [];
  
  // 排除移动应用（不在 dev:all 中启动）
  const excludedApps = ['mobile-app'];
  
  for (const config of configs) {
    // 跳过移动应用
    if (excludedApps.includes(config.appName)) {
      continue;
    }
    
    const port = parseInt(config.devPort, 10);
    const inUse = await isPortInUse(port);
    results.push({
      appName: config.appName,
      port: config.devPort,
      inUse,
    });
  }
  
  // 按端口号排序
  results.sort((a, b) => parseInt(a.port, 10) - parseInt(b.port, 10));
  
  return results;
}

/**
 * 主函数
 */
async function main() {
  logger.info('🔍 正在检查端口占用情况...\n');
  
  const results = await checkAllPorts();
  const occupiedPorts = results.filter((r) => r.inUse);
  const availablePorts = results.filter((r) => !r.inUse);
  
  // 显示所有端口状态
  logger.info('📊 端口检查结果:\n');
  for (const result of results) {
    const status = result.inUse ? '❌ 占用' : '✅ 可用';
    logger.info(`  ${status} ${result.appName.padEnd(20)} :${result.port}`);
  }
  
  logger.info('\n');
  
  if (occupiedPorts.length > 0) {
    logger.info('⚠️  以下端口已被占用:\n');
    const systemServicePorts = [];
    const devServerPorts = [];
    
    for (const result of occupiedPorts) {
      let isSystemService = false;
      let processInfo = '';
      
      // 尝试显示占用端口的进程信息
      if (process.platform === 'win32') {
        try {
          const netstatOutput = execSync(`netstat -ano | findstr :${result.port}`, { encoding: 'utf-8', stdio: 'pipe' });
          const lines = netstatOutput.trim().split('\n').filter(line => line.includes('LISTENING'));
          if (lines.length > 0) {
            const pid = lines[0].trim().split(/\s+/).pop();
            if (pid) {
              try {
                const taskOutput = execSync(`tasklist | findstr ${pid}`, { encoding: 'utf-8', stdio: 'pipe' });
                processInfo = taskOutput.trim();
                
                // 检查是否是系统服务（svchost.exe, System, 等）
                if (processInfo.includes('svchost.exe') || 
                    processInfo.includes('System') || 
                    processInfo.includes('services.exe')) {
                  isSystemService = true;
                  systemServicePorts.push({ ...result, pid, processInfo });
                } else {
                  devServerPorts.push({ ...result, pid, processInfo });
                }
                
                logger.info(`  ❌ ${result.appName} :${result.port}`);
                logger.info(`    进程信息: ${processInfo}`);
                if (isSystemService) {
                  logger.info(`    ⚠️  这是系统服务进程，无法直接结束`);
                }
              } catch (e) {
                logger.info(`  ❌ ${result.appName} :${result.port}`);
                logger.info(`    进程 ID: ${pid}`);
                devServerPorts.push({ ...result, pid });
              }
            }
          }
        } catch (e) {
          logger.info(`  ❌ ${result.appName} :${result.port}`);
          devServerPorts.push(result);
        }
      } else {
        logger.info(`  ❌ ${result.appName} :${result.port}`);
        devServerPorts.push(result);
      }
    }
    
    logger.info('\n');
    if (systemServicePorts.length > 0) {
      logger.info('⚠️  系统服务占用的端口（需要修改配置或重启系统）:');
      for (const item of systemServicePorts) {
        logger.info(`  - ${item.appName} :${item.port} (PID: ${item.pid})`);
      }
      logger.info('');
    }
    if (devServerPorts.length > 0) {
      logger.info('💡 开发服务器占用的端口，可以使用以下命令结束:');
      for (const item of devServerPorts) {
        if (item.pid) {
          logger.info(`  taskkill /F /PID ${item.pid}  # 结束 ${item.appName} (端口 ${item.port})`);
        }
      }
      logger.info('');
    }
    logger.info('💡 建议: 请先停止占用端口的进程，或使用其他端口。\n');
    process.exit(1);
  } else {
    logger.info('✅ 所有端口都可用，可以启动开发服务器。\n');
    process.exit(0);
  }
}

// 运行主函数
main().catch((error) => {
  logger.error('❌ 端口检查失败:', error);
  process.exit(1);
});

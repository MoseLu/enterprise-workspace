#!/usr/bin/env node

/**
 * dev:all 包装脚本
 * 在启动所有应用之前检查端口占用情况
 * 集成错误监听和自动上报功能
 */
import { logger } from '../../utils/logger.mjs';

// #region agent log
const DEBUG_LOG_PATH = 'c:\\Users\\mlu\\Desktop\\btc-shopflow\\.cursor\\debug.log';
const DEBUG_SERVER = 'http://127.0.0.1:7242/ingest/65fa8800-1c21-477b-9578-515737111923';
let debugLogFs = null;
const debugLog = async (data) => {
  const payload = { ...data, timestamp: Date.now(), sessionId: 'debug-session' };
  try {
    if (!debugLogFs) {
      const { appendFileSync } = await import('fs');
      debugLogFs = { appendFileSync };
    }
    debugLogFs.appendFileSync(DEBUG_LOG_PATH, JSON.stringify(payload) + '\n');
  } catch (e) {}
  try {
    if (typeof fetch !== 'undefined') {
      fetch(DEBUG_SERVER, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
    }
  } catch (e) {}
};
// #endregion

import { getRootDir } from '../../utils/path-helper.mjs';
import { runTurbo } from '../../utils/turbo-helper.mjs';
import { interceptCommand } from '../skills/command-interceptor.mjs';
import { checkAndKillPorts } from './port-manager.mjs';
import { DevErrorListener } from '../skills/dev-error-listener.mjs';
import { reportError } from '../skills/dev-error-reporter.mjs';
// 动态导入数据库初始化（避免 better-sqlite3 未安装时导致启动失败）
// import { initDatabase } from '../skills/database/init.mjs';
// 注意：不再使用监控服务器（3001端口已废弃）
// import { getMonitorServer } from '../skills/dev-error-monitor-server.mjs';
import { ensureSnapshotDir, getSnapshotDir, initSnapshotManager } from '../../utils/heap-snapshot-manager.mjs';
import { startMonitoring, stopMonitoring } from '../../utils/memory-monitor.mjs';

const rootDir = getRootDir();

// 初始化堆快照目录（静默初始化，不输出日志）
try {
  ensureSnapshotDir();
} catch (error) {
  // 静默失败，不输出日志
}

// 配置 Node.js 内存诊断参数
// 注意：很多诊断参数（如 --heap-dump-on-out-of-memory、--trace-gc）不能通过 NODE_OPTIONS 传递
// 只能在启动时直接作为 node 参数传递
// 对于通过 turbo 启动的子进程，我们只能传递 --max-old-space-size（这是唯一允许的内存相关参数）
const snapshotDir = getSnapshotDir();
// 只传递允许在 NODE_OPTIONS 中使用的参数（仅内存限制）
const nodeOptions = '--max-old-space-size=4096';

/**
 * 检查端口占用情况并自动停止Node.js进程
 */
function checkPorts() {
  try {
    const result = checkAndKillPorts(true); // 自动停止
    
    if (result.hasOccupied && result.killedCount === 0) {
      // 有占用但无法自动停止（可能是系统进程）
      logger.warn('⚠️  部分端口被占用且无法自动停止，请手动处理');
      // 不退出，让用户决定是否继续
    } else if (result.killedCount > 0) {
      // 静默清理，不输出日志
    }
  } catch (error) {
    // 静默失败，不输出日志
    // 不退出，让启动继续
  }
}

/**
 * 等待文件稳定（文件大小不再变化）
 */
async function waitForFileStable(filePath, maxWaitMs = 5000, checkIntervalMs = 200) {
  const { existsSync, statSync } = await import('fs');
  
  if (!existsSync(filePath)) {
    return false;
  }
  
  let lastSize = statSync(filePath).size;
  let stableCount = 0;
  const requiredStableChecks = 3; // 需要连续3次检查大小不变才认为稳定
  
  for (let waited = 0; waited < maxWaitMs; waited += checkIntervalMs) {
    await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
    
    if (!existsSync(filePath)) {
      return false;
    }
    
    const currentSize = statSync(filePath).size;
    if (currentSize === lastSize) {
      stableCount++;
      if (stableCount >= requiredStableChecks) {
        return true; // 文件已稳定
      }
    } else {
      stableCount = 0; // 文件还在变化，重置计数
      lastSize = currentSize;
    }
  }
  
  // 超时，但文件存在，返回 true（可能文件很大，需要更长时间）
  return existsSync(filePath);
}

/**
 * 检查并构建共享包（如果需要）
 */
async function ensureSharedPackagesBuilt() {
  const { existsSync } = await import('fs');
  const { join } = await import('path');
  const { spawn } = await import('child_process');
  
  // 需要构建的包列表（按依赖顺序）
  const packagesToBuild = [
    '@btc/vite-plugin',
    '@btc/shared-core',
    '@btc/shared-components',
    '@btc/shared-router'
  ];
  
  const packagesToCheck = [
    { 
      name: '@btc/vite-plugin', 
      dist: join(rootDir, 'packages', 'vite-plugin', 'dist', 'index.mjs'),
      // 检查主要构建产物即可
    },
    { 
      name: '@btc/shared-core', 
      dist: join(rootDir, 'packages', 'shared-core', 'dist', 'index.mjs'),
      // 额外检查 configs 目录，因为有些应用依赖这些文件
      extraFiles: [
        join(rootDir, 'packages', 'shared-core', 'dist', 'configs', 'app-env.config.mjs'),
        join(rootDir, 'packages', 'shared-core', 'dist', 'configs', 'unified-env-config.mjs'),
      ]
    },
    { 
      name: '@btc/shared-components', 
      dist: join(rootDir, 'packages', 'shared-components', 'dist', 'index.mjs') 
    },
    { 
      name: '@btc/shared-router', 
      dist: join(rootDir, 'packages', 'shared-router', 'dist', 'index.mjs') 
    }
  ];
  
  // 检查哪些包需要构建（检查主文件和额外文件）
  const packagesNeedingBuild = packagesToCheck.filter(pkg => {
    if (!existsSync(pkg.dist)) {
      return true;
    }
    // 检查额外必需的文件
    if (pkg.extraFiles && pkg.extraFiles.some(file => !existsSync(file))) {
      return true;
    }
    return false;
  });
  
  if (packagesNeedingBuild.length > 0) {
    logger.info(`📦 检测到 ${packagesNeedingBuild.length} 个共享包未构建，正在构建...`);
    logger.info(`   需要构建: ${packagesNeedingBuild.map(p => p.name).join(', ')}`);
    
    // 按顺序构建所有需要的包
    for (const pkg of packagesNeedingBuild) {
      try {
        logger.info(`   正在构建 ${pkg.name}...`);
        await new Promise(async (resolve, reject) => {
          // 使用 exec 而不是 spawn，在 Windows 上更可靠
          const { exec } = await import('child_process');
          const command = `pnpm --filter ${pkg.name} run build`;
          
          exec(command, {
            cwd: rootDir,
            shell: true, // 始终使用 shell，确保跨平台兼容
          }, async (error, stdout, stderr) => {
            if (error) {
              reject(error);
              return;
            }
            
            // 输出构建日志
            if (stdout) process.stdout.write(stdout);
            if (stderr) process.stderr.write(stderr);
            
            // 等待构建产物文件稳定（确保所有文件都已写入完成）
            const allFiles = [pkg.dist, ...(pkg.extraFiles || [])];
            let allStable = true;
            
            for (const file of allFiles) {
              if (existsSync(file)) {
                const stable = await waitForFileStable(file);
                if (!stable) {
                  allStable = false;
                  logger.warn(`   ⚠️  ${pkg.name} 构建产物 ${file} 可能未完全写入`);
                }
              }
            }
            
            if (allStable) {
              logger.info(`   ✅ ${pkg.name} 构建完成`);
            } else {
              logger.warn(`   ⚠️  ${pkg.name} 构建完成，但部分文件可能未稳定`);
            }
            resolve();
          });
        });
      } catch (error) {
        logger.warn(`   ⚠️  ${pkg.name} 构建失败: ${error.message}`);
        logger.warn(`      将继续尝试启动，如果失败请手动运行: pnpm --filter ${pkg.name} run build`);
      }
    }
    
    logger.info('✅ 共享包构建检查完成\n');
  } else {
    // 即使文件存在，也等待一下确保稳定（可能正在被其他进程写入）
    for (const pkg of packagesToCheck) {
      const allFiles = [pkg.dist, ...(pkg.extraFiles || [])];
      for (const file of allFiles) {
        if (existsSync(file)) {
          await waitForFileStable(file, 1000); // 最多等待1秒
        }
      }
    }
  }
}

/**
 * 检测是否需要清理重建共享包
 * 通过比较源码和构建产物的修改时间来判断
 * @returns {Promise<string[]>} 返回需要重建的包名列表，如果不需要重建则返回空数组
 */
async function shouldCleanAndRebuild() {
  const { existsSync, statSync, readdirSync } = await import('fs');
  const { join } = await import('path');
  
  // 需要检查的共享包
  const packagesToCheck = [
    { name: '@btc/vite-plugin', dir: 'vite-plugin' },
    { name: '@btc/shared-core', dir: 'shared-core' },
    { name: '@btc/shared-components', dir: 'shared-components' },
    { name: '@btc/shared-router', dir: 'shared-router' },
  ];
  
  /**
   * 获取目录中最新的文件修改时间（递归）
   */
  function getLatestMtime(dirPath, maxDepth = 10, currentDepth = 0) {
    if (currentDepth > maxDepth || !existsSync(dirPath)) {
      return 0;
    }
    
    try {
      const stat = statSync(dirPath);
      if (stat.isFile()) {
        return stat.mtimeMs;
      }
      
      if (!stat.isDirectory()) {
        return 0;
      }
      
      let latestMtime = stat.mtimeMs;
      const entries = readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        // 跳过 node_modules、dist、build 等目录（避免递归太深）
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build' || entry.name.startsWith('.')) {
          continue;
        }
        
        const entryPath = join(dirPath, entry.name);
        const entryMtime = getLatestMtime(entryPath, maxDepth, currentDepth + 1);
        if (entryMtime > latestMtime) {
          latestMtime = entryMtime;
        }
      }
      
      return latestMtime;
    } catch (error) {
      // 忽略权限错误等
      return 0;
    }
  }
  
  const packagesToRebuild = [];
  
  for (const pkg of packagesToCheck) {
    const srcDir = join(rootDir, 'packages', pkg.dir, 'src');
    const distDir = join(rootDir, 'packages', pkg.dir, 'dist');
    
    // 如果源码目录不存在，跳过
    if (!existsSync(srcDir)) {
      continue;
    }
    
    // 如果构建产物不存在，需要重建
    if (!existsSync(distDir)) {
      logger.info(`   📦 ${pkg.name}: 构建产物不存在，需要重建`);
      packagesToRebuild.push(pkg.name);
      continue;
    }
    
    // 获取源码和构建产物的最新修改时间
    const srcMtime = getLatestMtime(srcDir);
    const distMtime = getLatestMtime(distDir);
    
    // 如果源码比构建产物新，需要重建
    if (srcMtime > distMtime) {
      logger.info(`   📦 ${pkg.name}: 源码已更新（${new Date(srcMtime).toLocaleString()} > ${new Date(distMtime).toLocaleString()}），需要重建`);
      packagesToRebuild.push(pkg.name);
    }
  }
  
  // 返回需要重建的包列表
  return packagesToRebuild;
}

/**
 * 步骤1: 清理所有 Vite 缓存
 */
async function step1CleanViteCache() {
  logger.info('🧹 清理所有 Vite 缓存...');
  
  try {
    const { exec } = await import('child_process');
    await new Promise((resolve, reject) => {
      exec('node scripts/commands/tools/clean-vite-cache.mjs', {
        cwd: rootDir,
        shell: true,
      }, (error, stdout, stderr) => {
        if (error) {
          logger.error(`❌ 步骤 1 失败: 清理 Vite 缓存时出错`);
          logger.error(`   错误信息: ${error.message}`);
          if (stderr) {
            logger.error(`   错误输出: ${stderr}`);
          }
          reject(new Error(`清理 Vite 缓存失败: ${error.message}`));
          return;
        }
        
        // 输出清理结果
        if (stdout) {
          const lines = stdout.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            if (line.includes('✅') || line.includes('已清理')) {
              // 只显示成功信息，过滤详细日志
            }
          });
        }
        
        logger.info('✅ Vite 缓存已清理\n');
        resolve();
      });
    });
  } catch (error) {
    logger.error(`❌ 步骤 1 失败: ${error.message}`);
    throw error;
  }
}

/**
 * 步骤2: 删除所有 packages 下的构建产物
 */
async function step2CleanPackagesDist() {
  logger.info('🗑️  删除所有 packages 下的构建产物...');
  
  const { existsSync, rmSync, readdirSync } = await import('fs');
  const { join } = await import('path');
  
  const packagesDir = join(rootDir, 'packages');
  if (!existsSync(packagesDir)) {
    logger.warn('⚠️  packages 目录不存在，跳过清理');
    logger.info('✅ 无需清理\n');
    return;
  }
  
  const packages = readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  let cleanedCount = 0;
  let failedCount = 0;
  const errors = [];
  
  for (const pkgName of packages) {
    const distDir = join(packagesDir, pkgName, 'dist');
    if (existsSync(distDir)) {
      try {
        // 添加重试机制，处理 Windows 上的文件锁定问题
        let retries = 3;
        let success = false;
        
        while (retries > 0 && !success) {
          try {
            rmSync(distDir, { recursive: true, force: true });
            success = true;
            cleanedCount++;
          } catch (error) {
            retries--;
            if (error.code === 'EBUSY' || error.code === 'ENOTEMPTY') {
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 200));
              } else {
                throw error;
              }
            } else {
              throw error;
            }
          }
        }
      } catch (error) {
        failedCount++;
        errors.push({ package: pkgName, error: error.message });
        logger.error(`   ❌ 清理 ${pkgName}/dist 失败: ${error.message}`);
      }
    }
  }
  
  if (failedCount > 0) {
    logger.error(`❌ 清理失败: ${failedCount} 个包的构建产物清理失败`);
    logger.error(`   失败的包: ${errors.map(e => e.package).join(', ')}`);
    logger.error(`   请手动删除这些目录后重试`);
    throw new Error(`清理 packages 构建产物失败: ${failedCount} 个包清理失败`);
  }
  
  logger.info(`✅ 已清理 ${cleanedCount} 个包的构建产物\n`);
}

/**
 * 步骤2（选择性）: 只删除指定 packages 下的构建产物
 */
async function step2CleanPackagesDistSelective(packageNames) {
  logger.info(`🗑️  删除指定 packages 下的构建产物...`);
  
  const { existsSync, rmSync } = await import('fs');
  const { join } = await import('path');
  
  // 包名到目录名的映射
  const packageToDir = {
    '@btc/shared-core': 'shared-core',
    '@btc/shared-components': 'shared-components',
    '@btc/shared-router': 'shared-router',
    '@btc/vite-plugin': 'vite-plugin',
  };
  
  let cleanedCount = 0;
  let failedCount = 0;
  const errors = [];
  
  for (const packageName of packageNames) {
    const dirName = packageToDir[packageName];
    if (!dirName) {
      logger.warn(`   ⚠️  未知的包名: ${packageName}，跳过清理`);
      continue;
    }
    
    const distDir = join(rootDir, 'packages', dirName, 'dist');
    if (existsSync(distDir)) {
      try {
        // 添加重试机制，处理 Windows 上的文件锁定问题
        let retries = 3;
        let success = false;
        
        while (retries > 0 && !success) {
          try {
            rmSync(distDir, { recursive: true, force: true });
            success = true;
            cleanedCount++;
            logger.info(`   ✅ 已清理 ${packageName}/dist`);
          } catch (error) {
            retries--;
            if (error.code === 'EBUSY' || error.code === 'ENOTEMPTY') {
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 200));
              } else {
                throw error;
              }
            } else {
              throw error;
            }
          }
        }
      } catch (error) {
        failedCount++;
        errors.push({ package: packageName, error: error.message });
        logger.error(`   ❌ 清理 ${packageName}/dist 失败: ${error.message}`);
      }
    } else {
      logger.info(`   ℹ️  ${packageName}/dist 不存在，跳过清理`);
    }
  }
  
  if (failedCount > 0) {
    logger.error(`❌ 清理失败: ${failedCount} 个包的构建产物清理失败`);
    logger.error(`   失败的包: ${errors.map(e => e.package).join(', ')}`);
    logger.error(`   请手动删除这些目录后重试`);
    throw new Error(`清理 packages 构建产物失败: ${failedCount} 个包清理失败`);
  }
  
  logger.info(`✅ 已清理 ${cleanedCount} 个包的构建产物\n`);
}

/**
 * 步骤3: 重新构建 packages 包
 */
async function step3BuildPackages() {
  logger.info('📦 重新构建 packages 包...');
  
  try {
    const { exec } = await import('child_process');
    await new Promise((resolve, reject) => {
      const command = `pnpm turbo run build --filter=@btc/vite-plugin --filter=@btc/shared-core --filter=@btc/shared-components --filter=@btc/shared-router --force`;
      
      logger.info(`   执行命令: ${command}`);
      
      exec(command, {
        cwd: rootDir,
        shell: true,
      }, (error, stdout, stderr) => {
        if (error) {
          logger.error(`❌ 构建 packages 包失败`);
          logger.error(`   错误信息: ${error.message}`);
          if (stderr) {
            logger.error(`   错误输出: ${stderr}`);
          }
          if (stdout) {
            logger.error(`   标准输出: ${stdout}`);
          }
          reject(new Error(`构建 packages 包失败: ${error.message}`));
          return;
        }
        
        // 检查构建输出中是否有错误
        if (stderr && stderr.includes('error')) {
          logger.error(`❌ 构建过程中出现错误`);
          logger.error(`   错误输出: ${stderr}`);
          reject(new Error(`构建 packages 包失败: 构建过程中出现错误`));
          return;
        }
        
        logger.info('✅ packages 包构建完成\n');
        resolve();
      });
    });
  } catch (error) {
    logger.error(`❌ 构建失败: ${error.message}`);
    throw error;
  }
}

/**
 * 步骤3（选择性）: 只重新构建指定的 packages 包
 */
async function step3BuildPackagesSelective(packageNames) {
  logger.info(`📦 重新构建指定的 packages 包...`);
  
  try {
    const { exec } = await import('child_process');
    await new Promise((resolve, reject) => {
      // 构建 filter 参数，只构建指定的包
      const filterArgs = packageNames.map(pkg => `--filter=${pkg}`).join(' ');
      const command = `pnpm turbo run build ${filterArgs} --force`;
      
      logger.info(`   执行命令: ${command}`);
      
      exec(command, {
        cwd: rootDir,
        shell: true,
      }, (error, stdout, stderr) => {
        if (error) {
          logger.error(`❌ 构建 packages 包失败`);
          logger.error(`   错误信息: ${error.message}`);
          if (stderr) {
            logger.error(`   错误输出: ${stderr}`);
          }
          if (stdout) {
            logger.error(`   标准输出: ${stdout}`);
          }
          reject(new Error(`构建 packages 包失败: ${error.message}`));
          return;
        }
        
        // 检查构建输出中是否有错误
        if (stderr && stderr.includes('error')) {
          logger.error(`❌ 构建过程中出现错误`);
          logger.error(`   错误输出: ${stderr}`);
          reject(new Error(`构建 packages 包失败: 构建过程中出现错误`));
          return;
        }
        
        logger.info(`✅ ${packageNames.length} 个包构建完成\n`);
        
        // 等待文件稳定（确保所有文件都已写入完成）
        logger.info('   等待构建产物稳定...');
        setTimeout(() => {
          resolve();
        }, 2000); // 等待2秒，确保文件完全写入
      });
    });
  } catch (error) {
    logger.error(`❌ 构建失败: ${error.message}`);
    throw error;
  }
}

/**
 * 步骤4: 检查构建是否成功
 */
async function step4VerifyBuild() {
  logger.info('🔍 检查构建是否成功...');
  
  const { existsSync } = await import('fs');
  const { join } = await import('path');
  
  // 定义需要检查的关键文件
  const criticalFiles = [
    { path: join(rootDir, 'packages', 'shared-core', 'dist', 'index.mjs'), name: '@btc/shared-core' },
    { path: join(rootDir, 'packages', 'shared-core', 'dist', 'configs', 'app-env.config.mjs'), name: '@btc/shared-core' },
    { path: join(rootDir, 'packages', 'shared-core', 'dist', 'configs', 'unified-env-config.mjs'), name: '@btc/shared-core' },
    { path: join(rootDir, 'packages', 'shared-core', 'dist', 'configs', 'layout-bridge.mjs'), name: '@btc/shared-core' },
    { path: join(rootDir, 'packages', 'shared-core', 'dist', 'utils', 'index.mjs'), name: '@btc/shared-core' },
    { path: join(rootDir, 'packages', 'shared-components', 'dist', 'index.mjs'), name: '@btc/shared-components' },
    { path: join(rootDir, 'packages', 'vite-plugin', 'dist', 'index.mjs'), name: '@btc/vite-plugin' },
    { path: join(rootDir, 'packages', 'shared-router', 'dist', 'index.mjs'), name: '@btc/shared-router' },
  ];
  
  // 先等待文件稳定（构建完成后可能文件还在写入）
  logger.info('   等待构建产物稳定...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 检查文件是否存在，如果不存在则等待并重试
  let missingFiles = criticalFiles.filter(({ path }) => !existsSync(path));
  
  // 如果文件缺失，再等待一段时间并重试（最多重试3次）
  if (missingFiles.length > 0) {
    logger.info(`   检测到 ${missingFiles.length} 个文件缺失，等待并重试...`);
    for (let retry = 0; retry < 3; retry++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      missingFiles = criticalFiles.filter(({ path }) => !existsSync(path));
      if (missingFiles.length === 0) {
        break; // 文件已存在，退出重试循环
      }
      logger.info(`   重试 ${retry + 1}/3: 仍有 ${missingFiles.length} 个文件缺失`);
    }
  }
  
  if (missingFiles.length > 0) {
    logger.warn(`⚠️ 验证失败: 缺少 ${missingFiles.length} 个关键文件，尝试自动修复...`);
    
    // 提取缺失的包名（去重）
    const missingPackageNames = [...new Set(missingFiles.map(f => f.name))];
    logger.info(`   需要构建的包: ${missingPackageNames.join(', ')}`);
    
    try {
      await step3BuildPackagesSelective(missingPackageNames);
      
      // 再次等待文件稳定
      logger.info('   等待构建产物稳定...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 再次检查
      missingFiles = criticalFiles.filter(({ path }) => !existsSync(path));
      
      if (missingFiles.length > 0) {
        logger.error(`❌ 自动修复失败: 仍缺少 ${missingFiles.length} 个关键文件`);
        logger.error(`   缺失的文件:`);
        for (const { path, name } of missingFiles) {
          logger.error(`     - ${name}: ${path}`);
          // 检查文件是否真的不存在（使用已导入的 existsSync）
          if (existsSync(path)) {
            logger.warn(`     ⚠️  文件实际存在，可能是路径解析问题`);
          }
        }
        logger.error(`\n   请检查构建日志，确认构建是否成功`);
        throw new Error(`构建验证失败: 缺少 ${missingFiles.length} 个关键文件`);
      } else {
        logger.info(`✅ 自动修复成功，所有关键文件已就绪`);
      }
    } catch (err) {
       logger.error(`❌ 自动修复构建失败: ${err.message}`);
       throw err;
    }
  }
  
  logger.info(`✅ 所有关键文件已就绪 (${criticalFiles.length} 个文件)\n`);
}

/**
 * 运行 turbo dev:all（带错误监听）
 */
async function runDevAll() {
  // 智能检测：检查是否需要清理重建
  logger.info('🔍 检查共享包是否需要清理重建...');
  const packagesToRebuild = await shouldCleanAndRebuild();
  
  if (packagesToRebuild.length > 0) {
    logger.info('✅ 检测到源码变化，将执行清理重建流程\n');
    logger.info(`   需要重建的包: ${packagesToRebuild.join(', ')}\n`);
    
    // 执行预构建流程（只清理和重建需要的包）
    try {
      await step1CleanViteCache();
      await step2CleanPackagesDistSelective(packagesToRebuild);
      await step3BuildPackagesSelective(packagesToRebuild);
      await step4VerifyBuild();
      
      logger.info('🚀 启动开发服务器...\n');
    } catch (error) {
      logger.error(`\n❌ 预构建流程失败，终止启动`);
      logger.error(`   错误原因: ${error.message}`);
      logger.error(`\n   请修复错误后重试`);
      process.exit(1);
    }
  } else {
    logger.info('✅ 共享包构建产物是最新的，跳过清理重建步骤\n');
    
    // 只清理 Vite 缓存（不影响构建产物）
    try {
      await step1CleanViteCache();
    } catch (error) {
      logger.warn(`⚠️  清理 Vite 缓存失败: ${error.message}`);
      // 不阻止启动，继续执行
    }
    
    // 快速验证：检查关键文件是否存在
    logger.info('🔍 快速验证构建产物...');
    const { existsSync } = await import('fs');
    const { join } = await import('path');
    
    const criticalFiles = [
      { path: join(rootDir, 'packages', 'shared-core', 'dist', 'index.mjs'), name: '@btc/shared-core', package: '@btc/shared-core' },
      { path: join(rootDir, 'packages', 'shared-core', 'dist', 'utils', 'index.mjs'), name: '@btc/shared-core', package: '@btc/shared-core' },
      { path: join(rootDir, 'packages', 'shared-components', 'dist', 'index.mjs'), name: '@btc/shared-components', package: '@btc/shared-components' },
      { path: join(rootDir, 'packages', 'vite-plugin', 'dist', 'index.mjs'), name: '@btc/vite-plugin', package: '@btc/vite-plugin' },
      { path: join(rootDir, 'packages', 'shared-router', 'dist', 'index.mjs'), name: '@btc/shared-router', package: '@btc/shared-router' },
    ];
    
    const missingFiles = criticalFiles.filter(({ path }) => !existsSync(path));
    
    if (missingFiles.length > 0) {
      // 提取缺失的包（去重）
      const missingPackages = [...new Set(missingFiles.map(f => f.package))];
      logger.warn(`⚠️  检测到 ${missingFiles.length} 个关键文件缺失，将执行重建`);
      logger.warn(`   缺失的文件: ${missingFiles.map(f => f.name).join(', ')}`);
      logger.info(`   需要重建的包: ${missingPackages.join(', ')}`);
      
      // 只清理和重建缺失的包
      try {
        await step2CleanPackagesDistSelective(missingPackages);
        await step3BuildPackagesSelective(missingPackages);
        await step4VerifyBuild();
      } catch (error) {
        logger.error(`\n❌ 重建流程失败，终止启动`);
        logger.error(`   错误原因: ${error.message}`);
        logger.error(`\n   请修复错误后重试`);
        process.exit(1);
      }
    } else {
      logger.info('✅ 构建产物验证通过\n');
    }
    
    logger.info('🚀 启动开发服务器...\n');
  }
  
  // 检查共享包构建产物是否存在，如果不存在则先构建
  // 这样可以确保在启动 turbo dev 之前，所有必需的文件都已存在
  // 注意：turbo.json 中 dev 任务的 dependsOn 已移除，避免自动构建导致文件被清理
  // 因此需要在这里手动构建，确保文件在启动前就存在
  const { existsSync } = await import('fs');
  const { join } = await import('path');
  
  const criticalFiles = [
    { path: join(rootDir, 'packages', 'shared-core', 'dist', 'index.mjs'), name: '@btc/shared-core' },
    { path: join(rootDir, 'packages', 'shared-core', 'dist', 'configs', 'app-env.config.mjs'), name: '@btc/shared-core' },
    { path: join(rootDir, 'packages', 'shared-core', 'dist', 'configs', 'unified-env-config.mjs'), name: '@btc/shared-core' },
    { path: join(rootDir, 'packages', 'shared-core', 'dist', 'configs', 'layout-bridge.mjs'), name: '@btc/shared-core' },
    { path: join(rootDir, 'packages', 'shared-core', 'dist', 'utils', 'index.mjs'), name: '@btc/shared-core' },
  ];
  
  /**
   * 递归检查文件的所有依赖
   */
  async function checkFileDependencies(filePath, checked = new Set()) {
    if (checked.has(filePath) || !existsSync(filePath)) {
      return true;
    }
    checked.add(filePath);
    
    try {
      const { readFileSync } = await import('fs');
      const content = readFileSync(filePath, 'utf-8');
      const imports = content.match(/from\s+["']([^"']+)["']/g) || [];
      
      for (const importLine of imports) {
        const match = importLine.match(/["']([^"']+)["']/);
        if (match) {
          const importPath = match[1];
          // 只检查相对路径导入
          if (importPath.startsWith('./') || importPath.startsWith('../')) {
            const fileDir = join(filePath, '..');
            let resolvedPath;
            if (importPath.startsWith('./')) {
              resolvedPath = join(fileDir, importPath.substring(2));
            } else {
              // 计算相对路径
              const parts = importPath.split('/');
              let currentDir = fileDir;
              for (const part of parts) {
                if (part === '..') {
                  currentDir = join(currentDir, '..');
                } else if (part !== '.') {
                  currentDir = join(currentDir, part);
                }
              }
              resolvedPath = currentDir;
            }
            
            // 尝试添加 .mjs 扩展名
            if (!existsSync(resolvedPath)) {
              resolvedPath = resolvedPath + '.mjs';
            }
            
            // #region agent log
            debugLog({ hypothesisId: 'F', runId: 'pre-start', location: 'dev-with-check.mjs:checkFileDependencies', message: '检查文件依赖', data: { filePath, importPath, resolvedPath, exists: existsSync(resolvedPath) } });
            // #endregion
            
            if (!existsSync(resolvedPath)) {
              return false; // 依赖文件不存在
            }
            
            // 递归检查依赖的依赖（但避免循环）
            if (!await checkFileDependencies(resolvedPath, checked)) {
              return false;
            }
          }
        }
      }
      return true;
    } catch (error) {
      // #region agent log
      debugLog({ hypothesisId: 'F', runId: 'pre-start', location: 'dev-with-check.mjs:checkFileDependencies', message: '检查文件依赖失败', data: { filePath, error: error.message } });
      // #endregion
      return false;
    }
  }
  
  /**
   * 检查 chunk 文件是否存在（通过读取主文件并解析导入路径）
   * 检查所有 chunk 文件及其引用的依赖文件
   */
  async function checkChunkFiles() {
    // #region agent log
    debugLog({ hypothesisId: 'B', runId: 'pre-start', location: 'dev-with-check.mjs:checkChunkFiles', message: '开始检查 chunk 文件', data: { distDir: join(rootDir, 'packages', 'shared-core', 'dist') } });
    // #endregion
    
    const { readFileSync, readdirSync } = await import('fs');
    const distDir = join(rootDir, 'packages', 'shared-core', 'dist');
    
    if (!existsSync(distDir)) {
      // #region agent log
      debugLog({ hypothesisId: 'E', runId: 'pre-start', location: 'dev-with-check.mjs:checkChunkFiles', message: 'dist 目录不存在', data: { distDir } });
      // #endregion
      return false;
    }
    
    try {
      // 1. 检查 unified-env-config.mjs 的 chunk 文件
      const unifiedEnvConfigPath = join(distDir, 'configs', 'unified-env-config.mjs');
      if (existsSync(unifiedEnvConfigPath)) {
        const content = readFileSync(unifiedEnvConfigPath, 'utf-8');
        // 查找所有相对路径导入的 chunk 文件（如 ../unified-env-config-XXXXX.mjs）
        const chunkImports = content.match(/from\s+["']\.\.\/[^"']+-[A-Za-z0-9]+\.mjs["']/g);
        if (chunkImports) {
          for (const importLine of chunkImports) {
            const match = importLine.match(/["']\.\.\/([^"']+)["']/);
            if (match) {
              const chunkFileName = match[1];
              const chunkPath = join(distDir, chunkFileName);
              // #region agent log
              debugLog({ hypothesisId: 'B', runId: 'pre-start', location: 'dev-with-check.mjs:checkChunkFiles', message: '检查 unified-env chunk', data: { chunkFileName, chunkPath, exists: existsSync(chunkPath) } });
              // #endregion
              if (!existsSync(chunkPath)) {
                return false; // chunk 文件不存在
              }
            }
          }
        }
      }
      
      // 2. 检查所有带 hash 的 chunk 文件（如 layout-bridge-XXXXX.mjs）及其依赖
      const allFiles = readdirSync(distDir, { withFileTypes: true });
      const chunkFiles = allFiles
        .filter(f => f.isFile() && f.name.match(/^[^-]+-[A-Za-z0-9]+\.mjs$/))
        .map(f => f.name);
      
      // #region agent log
      debugLog({ hypothesisId: 'E', runId: 'pre-start', location: 'dev-with-check.mjs:checkChunkFiles', message: '找到 chunk 文件', data: { chunkFiles } });
      // #endregion
      
      for (const chunkFile of chunkFiles) {
        const chunkPath = join(distDir, chunkFile);
        try {
          const content = readFileSync(chunkPath, 'utf-8');
          // 查找所有相对路径导入（如 ./configs/app-env.config.mjs 或 ../configs/...）
          const imports = content.match(/from\s+["']([^"']+)["']/g);
          if (imports) {
            for (const importLine of imports) {
              const match = importLine.match(/["']([^"']+)["']/);
              if (match) {
                const importPath = match[1];
                // 只检查相对路径导入
                if (importPath.startsWith('./') || importPath.startsWith('../')) {
                  // 解析相对路径
                  let resolvedPath;
                  if (importPath.startsWith('./')) {
                    // 相对于 dist 目录
                    resolvedPath = join(distDir, importPath.substring(2));
                  } else if (importPath.startsWith('../')) {
                    // 相对于 dist 目录的父目录
                    resolvedPath = join(distDir, '..', importPath.substring(3));
                  } else {
                    continue;
                  }
                  
                  // #region agent log
                  debugLog({ hypothesisId: 'B', runId: 'pre-start', location: 'dev-with-check.mjs:checkChunkFiles', message: '检查 chunk 依赖', data: { chunkFile, importPath, resolvedPath, exists: existsSync(resolvedPath) } });
                  // #endregion
                  
                  // 检查文件是否存在
                  if (!existsSync(resolvedPath)) {
                    // #region agent log
                    debugLog({ hypothesisId: 'B', runId: 'pre-start', location: 'dev-with-check.mjs:checkChunkFiles', message: '依赖文件不存在', data: { chunkFile, importPath, resolvedPath } });
                    // #endregion
                    return false; // 依赖文件不存在
                  }
                }
              }
            }
          }
        } catch (error) {
          // 如果无法读取文件，继续检查其他文件
          // #region agent log
          debugLog({ hypothesisId: 'E', runId: 'pre-start', location: 'dev-with-check.mjs:checkChunkFiles', message: '读取 chunk 文件失败', data: { chunkFile, error: error.message } });
          // #endregion
          continue;
        }
      }
      
      // #region agent log
      debugLog({ hypothesisId: 'B', runId: 'pre-start', location: 'dev-with-check.mjs:checkChunkFiles', message: '所有 chunk 文件检查通过' });
      // #endregion
      return true; // 所有 chunk 文件和依赖都存在
    } catch (error) {
      // #region agent log
      debugLog({ hypothesisId: 'E', runId: 'pre-start', location: 'dev-with-check.mjs:checkChunkFiles', message: '检查 chunk 文件异常', data: { error: error.message, stack: error.stack } });
      // #endregion
      return false;
    }
  }
  
  const missingFiles = criticalFiles.filter(({ path }) => !existsSync(path));
  const chunkFilesOk = await checkChunkFiles();
  
  // 检查源码是否比构建产物新（需要重新构建）
  const { statSync } = await import('fs');
  const packagesNeedingRebuild = new Set();
  
  // 检查 shared-core 的源码是否比构建产物新
  const sharedCoreSrcPath = join(rootDir, 'packages', 'shared-core', 'src');
  const sharedCoreDistPath = join(rootDir, 'packages', 'shared-core', 'dist', 'index.mjs');
  if (existsSync(sharedCoreDistPath)) {
    try {
      const distStat = statSync(sharedCoreDistPath);
      // 检查关键源码文件的时间戳
      const keySrcFiles = [
        join(sharedCoreSrcPath, 'index.ts'),
        join(sharedCoreSrcPath, 'configs', 'unified-env-config.ts'),
        join(sharedCoreSrcPath, 'configs', 'app-env.config.ts'),
        join(sharedCoreSrcPath, 'btc', 'utils', 'color-contrast.ts'),
        join(sharedCoreSrcPath, 'btc', 'plugins', 'theme', 'composables', 'useThemeColor.ts'),
      ];
      for (const srcFile of keySrcFiles) {
        if (existsSync(srcFile)) {
          const srcStat = statSync(srcFile);
          if (srcStat.mtimeMs > distStat.mtimeMs) {
            packagesNeedingRebuild.add('@btc/shared-core');
            break;
          }
        }
      }
    } catch (error) {
      // 如果无法检查，忽略错误
    }
  }
  
  // 检查 shared-components 的源码是否比构建产物新
  const sharedComponentsSrcPath = join(rootDir, 'packages', 'shared-components', 'src');
  const sharedComponentsDistPath = join(rootDir, 'packages', 'shared-components', 'dist', 'index.mjs');
  if (existsSync(sharedComponentsDistPath)) {
    try {
      const distStat = statSync(sharedComponentsDistPath);
      const srcIndexPath = join(sharedComponentsSrcPath, 'index.ts');
      if (existsSync(srcIndexPath)) {
        const srcStat = statSync(srcIndexPath);
        if (srcStat.mtimeMs > distStat.mtimeMs) {
          packagesNeedingRebuild.add('@btc/shared-components');
        }
      }
    } catch (error) {
      // 如果无法检查，忽略错误
    }
  }
  
  if (missingFiles.length > 0 || !chunkFilesOk || packagesNeedingRebuild.size > 0) {
    // 构建缺失的包或需要重新构建的包
    const packagesToBuild = new Set(missingFiles.map(f => f.name));
    if (!chunkFilesOk) {
      packagesToBuild.add('@btc/shared-core');
    }
    // 添加需要重新构建的包
    packagesNeedingRebuild.forEach(pkg => packagesToBuild.add(pkg));
    
    if (packagesNeedingRebuild.size > 0) {
      logger.info(`📦 检测到源码更新，重新构建共享包: ${Array.from(packagesNeedingRebuild).join(', ')}`);
    } else {
      logger.info(`📦 构建共享包...`);
    }
    
    // 使用 turbo 构建，添加 --force 标志强制重新构建需要更新的包
    const { exec } = await import('child_process');
    await new Promise((resolve, reject) => {
      const forceFlag = packagesNeedingRebuild.size > 0 ? '--force' : '';
      const command = `pnpm turbo run build --filter=@btc/vite-plugin --filter=@btc/shared-core --filter=@btc/shared-components --filter=@btc/shared-router ${forceFlag}`;
      exec(command, {
        cwd: rootDir,
        shell: true,
      }, async (error, stdout, stderr) => {
        // 检查构建是否成功
        if (error) {
          logger.error(`❌ 共享包构建失败: ${error.message}`);
          if (stderr) {
            logger.error(`构建错误输出: ${stderr}`);
          }
          logger.error(`请手动运行: pnpm --filter @btc/shared-core run build`);
          // 构建失败时，检查关键文件是否存在
          const criticalMissing = criticalFiles.filter(({ path }) => !existsSync(path));
          if (criticalMissing.length > 0) {
            logger.error(`缺少关键文件: ${criticalMissing.map(f => f.path).join(', ')}`);
            logger.error(`无法继续启动，请先修复构建错误`);
            reject(new Error(`共享包构建失败，缺少关键文件`));
            return;
          }
          // 如果关键文件存在，可能是部分构建失败，继续启动
          logger.warn(`⚠️  部分构建可能失败，但关键文件存在，将继续启动`);
          resolve();
          return;
        }
        
        // 验证构建产物是否存在
        const criticalMissing = criticalFiles.filter(({ path }) => !existsSync(path));
        if (criticalMissing.length > 0) {
          logger.error(`❌ 构建完成但缺少关键文件: ${criticalMissing.map(f => f.path).join(', ')}`);
          logger.error(`请检查构建日志或手动运行: pnpm --filter @btc/shared-core run build`);
          reject(new Error(`共享包构建失败，缺少关键文件`));
          return;
        }
        
        // 等待所有关键文件稳定（确保文件完全写入）
        // 先等待一小段时间，让文件系统完成写入
        // #region agent log
        debugLog({ hypothesisId: 'A', runId: 'pre-start', location: 'dev-with-check.mjs:runDevAll', message: '构建完成，开始等待文件稳定', data: { waitMs: 1000 } });
        // #endregion
        await new Promise(resolve => setTimeout(resolve, 1000)); // 增加到1秒
        
        let allStable = true;
        let retryCount = 0;
        const maxRetries = 30; // 最多重试30次（共15秒）
        
        while (retryCount < maxRetries) {
          allStable = true;
          
          // 检查关键文件
          for (const { path, name } of criticalFiles) {
            const exists = existsSync(path);
            // #region agent log
            debugLog({ hypothesisId: 'A', runId: 'pre-start', location: 'dev-with-check.mjs:runDevAll', message: '检查关键文件', data: { path, name, exists, retryCount } });
            // #endregion
            if (!exists) {
              allStable = false;
              break;
            }
          }
          
          // 检查 chunk 文件
          if (allStable) {
            const chunkOk = await checkChunkFiles();
            // #region agent log
            debugLog({ hypothesisId: 'A', runId: 'pre-start', location: 'dev-with-check.mjs:runDevAll', message: '检查 chunk 文件结果', data: { chunkOk, retryCount } });
            // #endregion
            if (!chunkOk) {
              allStable = false;
            }
          }
          
          // 检查所有关键文件的依赖
          if (allStable) {
            for (const { path, name } of criticalFiles) {
              if (existsSync(path)) {
                const depsOk = await checkFileDependencies(path);
                // #region agent log
                debugLog({ hypothesisId: 'F', runId: 'pre-start', location: 'dev-with-check.mjs:runDevAll', message: '检查文件依赖结果', data: { path, depsOk, retryCount } });
                // #endregion
                if (!depsOk) {
                  allStable = false;
                  break;
                }
              }
            }
          }
          
          if (allStable) {
            // 文件都存在，再等待文件稳定
            for (const { path, name } of criticalFiles) {
              const stable = await waitForFileStable(path, 3000, 200); // 每个文件最多等待3秒
              // #region agent log
              debugLog({ hypothesisId: 'A', runId: 'pre-start', location: 'dev-with-check.mjs:runDevAll', message: '文件稳定性检查', data: { path, name, stable } });
              // #endregion
              if (!stable) {
                allStable = false;
                break;
              }
            }
            
            if (allStable) {
              // #region agent log
              debugLog({ hypothesisId: 'A', runId: 'pre-start', location: 'dev-with-check.mjs:runDevAll', message: '所有文件稳定，准备启动', data: { retryCount, elapsedMs: retryCount * 500 } });
              // #endregion
              break; // 所有文件都稳定了
            }
          }
          
          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, 500));
          retryCount++;
        }
        
        if (!allStable) {
          const missing = criticalFiles.filter(({ path }) => !existsSync(path));
          if (missing.length > 0) {
            // #region agent log
            debugLog({ hypothesisId: 'A', hypothesisId: 'E', runId: 'pre-start', location: 'dev-with-check.mjs:runDevAll', message: '部分文件未生成', data: { missing: missing.map(m => m.path) } });
            // #endregion
            logger.warn(`⚠️  部分文件未生成，dev 服务器可能会失败`);
          }
          const chunkOk = await checkChunkFiles();
          if (!chunkOk) {
            // #region agent log
            debugLog({ hypothesisId: 'E', runId: 'pre-start', location: 'dev-with-check.mjs:runDevAll', message: '部分 chunk 文件未生成' });
            // #endregion
            logger.warn(`⚠️  部分 chunk 文件未生成，dev 服务器可能会失败`);
          }
          // 检查文件依赖
          for (const { path, name } of criticalFiles) {
            if (existsSync(path)) {
              const depsOk = await checkFileDependencies(path);
              if (!depsOk) {
                // #region agent log
                debugLog({ hypothesisId: 'F', runId: 'pre-start', location: 'dev-with-check.mjs:runDevAll', message: '文件依赖检查失败', data: { path } });
                // #endregion
                logger.warn(`⚠️  ${path} 的依赖文件未生成，dev 服务器可能会失败`);
              }
            }
          }
        } else {
          // #region agent log
          debugLog({ hypothesisId: 'A', runId: 'pre-start', location: 'dev-with-check.mjs:runDevAll', message: '预构建检查完成，所有文件就绪' });
          // #endregion
        }
        
        // 最终验证：在启动前再次检查所有关键文件和 chunk 依赖
        // #region agent log
        const { readFileSync } = await import('fs');
        const finalCheck = {
          criticalFiles: {},
          chunkFiles: {},
        };
        for (const { path, name } of criticalFiles) {
          const exists = existsSync(path);
          finalCheck.criticalFiles[path] = exists;
          if (exists) {
            try {
              const stat = await import('fs').then(m => m.promises.stat(path));
              finalCheck.criticalFiles[path + '_size'] = stat.size;
            } catch (e) {}
          }
        }
        // 检查 layout-bridge chunk 文件及其依赖
        const layoutBridgeChunk = join(rootDir, 'packages', 'shared-core', 'dist', 'layout-bridge-BBmi0y9h.mjs');
        if (existsSync(layoutBridgeChunk)) {
          try {
            const content = readFileSync(layoutBridgeChunk, 'utf-8');
            const imports = content.match(/from\s+["']([^"']+)["']/g) || [];
            finalCheck.chunkFiles.layoutBridge = {
              exists: true,
              imports: imports.map(imp => {
                const match = imp.match(/["']([^"']+)["']/);
                return match ? match[1] : null;
              }).filter(Boolean),
            };
            // 检查每个导入的文件是否存在
            for (const imp of finalCheck.chunkFiles.layoutBridge.imports) {
              if (imp.startsWith('./') || imp.startsWith('../')) {
                let resolvedPath;
                if (imp.startsWith('./')) {
                  resolvedPath = join(rootDir, 'packages', 'shared-core', 'dist', imp.substring(2));
                } else {
                  resolvedPath = join(rootDir, 'packages', 'shared-core', 'dist', '..', imp.substring(3));
                }
                finalCheck.chunkFiles.layoutBridge[imp] = existsSync(resolvedPath);
                if (existsSync(resolvedPath)) {
                  try {
                    const stat = await import('fs').then(m => m.promises.stat(resolvedPath));
                    finalCheck.chunkFiles.layoutBridge[imp + '_size'] = stat.size;
                  } catch (e) {}
                }
              }
            }
          } catch (e) {
            finalCheck.chunkFiles.layoutBridge = { error: e.message };
          }
        } else {
          finalCheck.chunkFiles.layoutBridge = { exists: false };
        }
        debugLog({ hypothesisId: 'C', runId: 'pre-start', location: 'dev-with-check.mjs:runDevAll', message: '启动前最终验证', data: finalCheck });
        // #endregion
        
        resolve();
      });
    });
  }
  
  // 确保数据库已初始化（动态导入，避免 better-sqlite3 未安装时导致启动失败）
  try {
    const { initDatabase } = await import('../skills/database/init.mjs');
    initDatabase();
  } catch (error) {
    // 静默失败，不输出日志
  }

  // 初始化堆快照管理器
  try {
    initSnapshotManager();
  } catch (error) {
    // 静默失败，不输出日志
  }

  // 启动内存监控（静默启动，不输出日志）
  let memoryMonitor = null;
  try {
    memoryMonitor = startMonitoring({
      interval: 5000, // 每 5 秒监控一次
      maxHeapSize: 4096 * 1024 * 1024, // 4GB
      onWarning: ({ name, memUsage, threshold }) => {
        logger.warn(`[内存监控] ⚠️  ${name} 内存使用超过 ${(threshold.usagePercent * 100).toFixed(1)}%`);
      },
      onCritical: ({ name, memUsage, threshold }) => {
        logger.error(`[内存监控] 🚨 ${name} 内存使用严重超限 ${(threshold.usagePercent * 100).toFixed(1)}%，可能即将 OOM！`);
      }
    });
    // 不输出启动日志
  } catch (error) {
    // 静默失败，不输出日志
  }
  
  // 注意：不再连接监控服务器（3001端口已不再使用）
  
  // 创建错误监听器（静默启动，不输出日志）
  const errorListener = new DevErrorListener({
    minSeverity: 'warning', // 最低报告警告级别
    autoReport: true,
    reportThreshold: 1, // 出现1次就上报
    debounceMs: 3000 // 3秒防抖
  });
  
  // 监听上报事件（静默处理，不输出日志）
  errorListener.on('report', async (error, dbRecord) => {
    try {
      // 静默上报，不输出日志
      await reportError(error, dbRecord, { useCursor: false });
    } catch (reportError) {
      // 静默失败，不输出日志
    }
  });
  
  // 监听错误事件（避免未处理的错误）
  errorListener.on('error', (errorData) => {
    // 真正的错误已经被处理，这里只是确保事件被监听，避免未处理的错误
  });
  
  // 监听警告事件（可选，用于调试）
  errorListener.on('warning', (warningData) => {
    // 警告信息已经被记录到数据库，这里可以添加额外的处理逻辑
    if (process.env.DEBUG) {
      logger.debug(`[警告] ${warningData.errorMessage}`);
    }
  });
  
  // 启动监听器（静默启动）
  errorListener.start();
  
  // 使用自定义的 runTurboWithListener
  // 注意：日志过滤在 onStdoutData 和 onStderrData 中处理
  const args = ['run', 'dev', '--concurrency=30'];
  
  // #region agent log
  // 启动前最后一次验证文件状态，并等待文件稳定
  const startupCheck = {
    criticalFiles: {},
    chunkFiles: {},
  };
  
  // 启动前最后一次检查：确保所有关键文件都存在
  // 如果文件不存在，立即构建（可能被其他进程清理了）
  const finalMissingFiles = criticalFiles.filter(({ path }) => !existsSync(path));
  const finalChunkFilesOk = await checkChunkFiles();
  
  if (finalMissingFiles.length > 0 || !finalChunkFilesOk) {
    logger.warn(`⚠️  启动前检查发现文件缺失，立即构建共享包...`);
    logger.warn(`   缺失文件: ${finalMissingFiles.map(f => f.name).join(', ')}`);
    
    // 立即构建缺失的包
    const { exec } = await import('child_process');
    await new Promise((resolve, reject) => {
      const command = `pnpm turbo run build --filter=@btc/vite-plugin --filter=@btc/shared-core --filter=@btc/shared-components --filter=@btc/shared-router --force`;
      exec(command, {
        cwd: rootDir,
        shell: true,
      }, async (error, stdout, stderr) => {
        if (error) {
          logger.error(`❌ 紧急构建失败: ${error.message}`);
          if (stderr) {
            logger.error(`构建错误输出: ${stderr}`);
          }
          reject(new Error(`启动前紧急构建失败`));
          return;
        }
        
        // 等待文件生成
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 再次检查文件
        const stillMissing = criticalFiles.filter(({ path }) => !existsSync(path));
        if (stillMissing.length > 0) {
          logger.error(`❌ 紧急构建后仍缺少文件: ${stillMissing.map(f => f.path).join(', ')}`);
          reject(new Error(`启动前紧急构建后仍缺少关键文件`));
          return;
        }
        
        const chunkOk = await checkChunkFiles();
        if (!chunkOk) {
          logger.error(`❌ 紧急构建后 chunk 文件仍不完整`);
          reject(new Error(`启动前紧急构建后 chunk 文件不完整`));
          return;
        }
        
        logger.info(`✅ 紧急构建完成，文件已就绪`);
        resolve();
      });
    });
  }
  
  // 等待文件稳定（最多等待 5 秒）
  let startupRetries = 0;
  const maxStartupRetries = 50; // 50 * 100ms = 5秒
  let allFilesReady = false;
  
  while (startupRetries < maxStartupRetries && !allFilesReady) {
    allFilesReady = true;
    for (const { path, name } of criticalFiles) {
      const exists = existsSync(path);
      startupCheck.criticalFiles[path] = exists;
      if (!exists) {
        allFilesReady = false;
        break;
      }
    }
    
    if (allFilesReady) {
      // 检查 chunk 文件
      const chunkOk = await checkChunkFiles();
      startupCheck.chunkFiles.chunkOk = chunkOk;
      if (!chunkOk) {
        allFilesReady = false;
      }
    }
    
    if (!allFilesReady) {
      await new Promise(resolve => setTimeout(resolve, 100));
      startupRetries++;
    }
  }
  
  const layoutBridgeChunk = join(rootDir, 'packages', 'shared-core', 'dist', 'layout-bridge-BBmi0y9h.mjs');
  startupCheck.chunkFiles.layoutBridgeExists = existsSync(layoutBridgeChunk);
  if (startupCheck.chunkFiles.layoutBridgeExists) {
    const appEnvPath = join(rootDir, 'packages', 'shared-core', 'dist', 'configs', 'app-env.config.mjs');
    startupCheck.chunkFiles.appEnvExists = existsSync(appEnvPath);
  }
  startupCheck.allFilesReady = allFilesReady;
  startupCheck.retries = startupRetries;
  debugLog({ hypothesisId: 'C', runId: 'startup', location: 'dev-with-check.mjs:runDevAll', message: '启动 turbo 前文件状态', data: startupCheck });
  
  if (!allFilesReady) {
    logger.error(`❌ 启动前文件检查失败，部分关键文件不存在！`);
    const missing = criticalFiles.filter(({ path }) => !existsSync(path));
    if (missing.length > 0) {
      logger.error(`缺少关键文件:`);
      missing.forEach(({ path, name }) => {
        logger.error(`  - ${name}: ${path}`);
      });
    }
    logger.error(`\n请先运行: pnpm build:share`);
    logger.error(`或者手动运行: pnpm --filter @btc/shared-core run build`);
    throw new Error(`启动前文件检查失败，缺少关键文件`);
  }
  // #endregion
  
  logger.info('🚀 启动开发服务器...\n');
  
  const code = await runTurboWithListener(args, errorListener, null, {
    cwd: rootDir,
    memoryMonitor: memoryMonitor // 传递 memoryMonitor 给清理函数
  });
  
  // 停止监听器
  errorListener.stop();

  // 停止内存监控（静默停止，不输出日志）
  if (memoryMonitor) {
    memoryMonitor.stop();
  }
  
  // 返回退出码，让拦截器处理
  if (code !== 0) {
    throw new Error(`Turbo命令执行失败，退出码: ${code}`);
  }
  
  return { success: true, code };
}

/**
 * 运行 turbo 命令并监听输出
 * @param {string[]} args - turbo 参数
 * @param {DevErrorListener} errorListener - 错误监听器
 * @param {DevErrorMonitorServer | null} monitorServer - 监控服务器（已废弃，传 null）
 * @param {object} options - 选项
 */
async function runTurboWithListener(args, errorListener, monitorServer, options = {}) {
  const { memoryMonitor } = options;
  const { spawn } = await import('child_process');
  const { existsSync, readdirSync } = await import('fs');
  const { join } = await import('path');
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  
  return new Promise((resolve, reject) => {
    // 查找 turbo 路径（复制自 turbo-helper.mjs）
    const rootNodeModules = join(rootDir, 'node_modules');
    const isWindows = process.platform === 'win32';
    let turboPath = null;
    
    // 首先尝试在 pnpm 的 .pnpm 目录中查找
    const pnpmDir = join(rootNodeModules, '.pnpm');
    if (existsSync(pnpmDir)) {
      try {
        const entries = readdirSync(pnpmDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.startsWith('turbo@')) {
            const possiblePaths = [
              join(pnpmDir, entry.name, 'node_modules', 'turbo', 'bin', 'turbo.js'),
              join(pnpmDir, entry.name, 'node_modules', 'turbo', 'bin', 'turbo'),
            ];
            for (const possiblePath of possiblePaths) {
              if (existsSync(possiblePath)) {
                turboPath = possiblePath;
                break;
              }
            }
            if (turboPath) break;
          }
        }
      } catch (error) {
        // 忽略错误，继续查找
      }
    }
    
    // 尝试直接在 node_modules 中查找
    if (!turboPath) {
      const possiblePaths = [
        join(rootNodeModules, 'turbo', 'bin', 'turbo.js'),
        join(rootNodeModules, 'turbo', 'bin', 'turbo'),
      ];
      for (const possiblePath of possiblePaths) {
        if (existsSync(possiblePath)) {
          turboPath = possiblePath;
          break;
        }
      }
    }
    
    // 尝试使用 require.resolve
    if (!turboPath) {
      try {
        turboPath = require.resolve('turbo/bin/turbo.js');
      } catch (e) {
        try {
          turboPath = require.resolve('turbo/bin/turbo');
        } catch (e2) {
          // 仍然找不到
        }
      }
    }
    
    if (!turboPath) {
      reject(new Error('Cannot find turbo. Please run: pnpm install'));
      return;
    }
    
    // 在 Windows 上，清除 NODE_PATH 以避免长度限制问题
    const env = { ...process.env };
    if (isWindows) {
      delete env.NODE_PATH;
    }
    // 关键：设置 NODE_ENV=development，确保 Node.js 能识别 package.json exports 中的 development 条件
    // 这样 shared-components 等包在开发环境下会使用源码路径（./src/index.ts）而不是构建产物（./dist/index.mjs）
    if (!env.NODE_ENV) {
      env.NODE_ENV = 'development';
    }
    
    // 添加 Node.js 内存诊断参数
    env.NODE_OPTIONS = nodeOptions;
    
    const child = spawn('node', [turboPath, ...args], {
      cwd: options.cwd || rootDir,
      stdio: ['inherit', 'pipe', 'pipe'], // stdin 继承，stdout/stderr 使用 pipe
      shell: false,
      env: { ...env, ...options.env },
    });
    
    // 存储已启动的服务器信息，用于最后输出总结
    const startedServers = new Set();
    
    // 日志过滤规则：过滤掉冗余和不必要的日志，只保留总结性信息
    const shouldFilterLog = (line) => {
      const trimmed = line.trim();
      
      // 过滤掉空行（完全空白的行）
      if (!trimmed) {
        return true; // 过滤空行，减少空白
      }
      
      // 过滤掉所有构建阶段的详细日志（通过前缀匹配）
      // 匹配格式：package:build: 或 package:dev: 后面跟着详细构建信息
      if (/^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*$/.test(trimmed)) {
        return true; // 空的构建/开发行（只有前缀）
      }
      
      // 过滤掉构建命令输出行
      if (/^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*>/.test(trimmed)) {
        return true; // 构建命令（> xxx@version build...）
      }
      
      // 过滤掉 turbo 的详细构建日志
      if (trimmed.includes('cache hit, replaying logs') || 
          trimmed.includes('cache bypass, force executing') ||
          trimmed.includes('Packages in scope:') ||
          trimmed.includes('Running dev in') ||
          trimmed.includes('Remote caching')) {
        return true;
      }
      
      // 过滤掉插件的详细日志
      if (trimmed.includes('[btc:svg]') ||
          trimmed.includes('[btc:ctx]') ||
          trimmed.includes('[btc:eps]') ||
          trimmed.includes('[clean-dist-plugin]') ||
          trimmed.includes('[copy-dark-theme]') ||
          trimmed.includes('Cannot optimize dependency') ||
          trimmed.includes('Failed to resolve dependency') ||
          trimmed.includes('[btc:proxy]') ||
          trimmed.includes('[unplugin-vue-components]') ||
          trimmed.includes('The language') ||
          trimmed.includes('waiting for changes')) {
        return true;
      }
      
      // 过滤掉设计令牌的详细构建日志（带前缀或不带前缀）
      if (trimmed.includes('Token collisions detected') ||
          trimmed.includes('Use log.verbosity') ||
          trimmed.includes('Refer to:') ||
          trimmed.includes('✔︎ dist/') ||
          /^(css|scss|ts)$/.test(trimmed) || // 单独一行的 css/scss/ts
          /^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*(css|scss|ts)\s*$/.test(trimmed) || // 带前缀的 css/scss/ts
          trimmed.includes('监听设计令牌文件变化') ||
          trimmed.includes('监听目录:') ||
          trimmed.includes('配置文件:') ||
          trimmed.includes('开始构建...') ||
          trimmed.includes('构建完成') ||
          trimmed.includes('等待文件变化')) {
        return true;
      }
      
      // 过滤掉 Vite 的详细构建信息行（带前缀）
      if (/^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*📦/.test(trimmed)) {
        return true; // 📦 开始构建行
      }
      if (/^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*-/.test(trimmed)) {
        return true; // 构建详情行（以 - 开头，如 "   - 输入文件"）
      }
      if (/^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*✅/.test(trimmed)) {
        // 如果包含详细的输出文件信息，则过滤
        if (trimmed.includes('输出文件') || trimmed.includes('类型声明') || trimmed.includes('样式文件')) {
          return true;
        }
      }
      // 过滤 created dist/ 消息（可能带前缀或不带）
      if (trimmed.includes('created dist/') || /^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*created dist\//.test(trimmed)) {
        return true;
      }
      
      // 过滤掉 Rollup 构建日志（可能带前缀）
      if (trimmed.includes('bundles src/') ||
          /^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*bundles src\//.test(trimmed) ||
          trimmed.includes('rollup v') ||
          /src\/index\.ts → dist\//.test(trimmed) ||
          /^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*src\/index\.ts →/.test(trimmed)) {
        return true;
      }
      
      // 过滤掉 Docs 同步日志（可能带前缀）
      if (trimmed.includes('> node ../../scripts/sync-docs-to-vitepress.mjs') ||
          /^docs-app:dev:\s*> node/.test(trimmed)) {
        return true;
      }
      
      // 过滤掉 turbo 版本号
      if (trimmed === 'turbo 2.6.1') {
        return true;
      }
      
      // 过滤掉 "✓ Created dist/src/index.d.ts" 这样的构建产物信息
      if (/✓\s*Created/.test(trimmed) || /^(@btc\/[\w-]+|[\w-]+-app):(build|dev):\s*✓/.test(trimmed)) {
        return true;
      }
      
      // 过滤掉 dev 阶段的构建成功信息（watch 模式的正常输出，不需要显示）
      // 只保留 build 阶段的构建成功信息（首次构建）
      if (/^(@btc\/[\w-]+|[\w-]+-app):dev:\s*✅.*构建成功/.test(trimmed)) {
        return true; // 过滤 dev 阶段的构建成功
      }
      if (/^(@btc\/[\w-]+|[\w-]+-app):dev:\s*created dist\//.test(trimmed)) {
        return true; // 过滤 dev 阶段的构建产物创建信息
      }
      
      // 保留重要的日志：
      // - VITE ready（服务器启动信息）
      // - 错误信息（error、ERROR、失败、failed）
      // - 构建失败的总结信息（ELIFECYCLE、ERROR、Tasks）
      // - 关键警告
      // - 服务器地址（Local、Network、➜）
      // - build 阶段的构建成功信息（首次构建，需要显示）
      return false;
    };

    // 定义日志监听函数（便于后续移除，防止内存泄漏）
    const onStdoutData = (chunk) => {
      const chunkStr = chunk.toString();
      const lines = chunkStr.split(/\r?\n/);
      
      // 检测服务器启动信息（用于跟踪启动状态，不输出额外日志）
      lines.forEach(line => {
        if (line.includes('VITE') && line.includes('ready')) {
          // 提取应用名称（从行首的工作空间名称）
          const match = line.match(/^(\w+[-]?app|@btc\/[\w-]+):dev:/);
          if (match) {
            startedServers.add(match[1]);
          }
        }
      });
      
      // 过滤日志
      const filteredLines = lines.filter(line => {
        const trimmed = line.trim();
        return !shouldFilterLog(trimmed);
      });
      
      if (filteredLines.length > 0) {
        // 恢复原始换行格式
        const filteredChunk = filteredLines.join('\n');
        // 保持原始输出的换行风格（如果原始chunk以换行结尾，保持；否则不添加）
        if (filteredChunk) {
          process.stdout.write(filteredChunk + (chunkStr.endsWith('\n') ? '\n' : ''));
        }
      }
      
      // 始终发送给错误监听器（用于错误检测）
      errorListener.processChunk(chunk, 'stdout');
      
      // #region agent log
      // 检测 ERR_MODULE_NOT_FOUND 错误（chunkStr 已在函数开头定义）
      if (chunkStr.includes('ERR_MODULE_NOT_FOUND')) {
        (async () => {
          try {
            const { readFileSync } = await import('fs');
            const errorCheck = {
              error: 'ERR_MODULE_NOT_FOUND',
              criticalFiles: {},
              chunkFiles: {},
            };
            for (const { path, name } of criticalFiles) {
              errorCheck.criticalFiles[path] = existsSync(path);
            }
            const layoutBridgeChunk = join(rootDir, 'packages', 'shared-core', 'dist', 'layout-bridge-BBmi0y9h.mjs');
            errorCheck.chunkFiles.layoutBridgeExists = existsSync(layoutBridgeChunk);
            const appEnvPath = join(rootDir, 'packages', 'shared-core', 'dist', 'configs', 'app-env.config.mjs');
            errorCheck.chunkFiles.appEnvExists = existsSync(appEnvPath);
            if (existsSync(layoutBridgeChunk)) {
              try {
                const content = readFileSync(layoutBridgeChunk, 'utf-8');
                const appEnvImport = content.match(/from\s+["']([^"']*app-env[^"']*)["']/);
                if (appEnvImport) {
                  errorCheck.chunkFiles.appEnvImportPath = appEnvImport[1];
                  let resolvedPath;
                  if (appEnvImport[1].startsWith('./')) {
                    resolvedPath = join(rootDir, 'packages', 'shared-core', 'dist', appEnvImport[1].substring(2));
                  } else if (appEnvImport[1].startsWith('../')) {
                    resolvedPath = join(rootDir, 'packages', 'shared-core', 'dist', '..', appEnvImport[1].substring(3));
                  } else {
                    resolvedPath = join(rootDir, 'packages', 'shared-core', 'dist', appEnvImport[1]);
                  }
                  errorCheck.chunkFiles.appEnvResolvedPath = resolvedPath;
                  errorCheck.chunkFiles.appEnvResolvedExists = existsSync(resolvedPath);
                }
              } catch (e) {
                errorCheck.chunkFiles.readError = e.message;
              }
            }
            await debugLog({ hypothesisId: 'D', runId: 'runtime', location: 'dev-with-check.mjs:onStdoutData', message: '检测到 ERR_MODULE_NOT_FOUND 错误时的文件状态', data: errorCheck });
          } catch (e) {}
        })();
      }
      // #endregion
    };

    const onStderrData = (chunk) => {
      const chunkStr = chunk.toString();
      const lines = chunkStr.split(/\r?\n/);
      
      // 过滤日志
      const filteredLines = lines.filter(line => {
        const trimmed = line.trim();
        return !shouldFilterLog(trimmed);
      });
      
      if (filteredLines.length > 0) {
        // 恢复原始换行格式
        const filteredChunk = filteredLines.join('\n');
        // 保持原始输出的换行风格
        if (filteredChunk) {
          process.stderr.write(filteredChunk + (chunkStr.endsWith('\n') ? '\n' : ''));
        }
      }
      
      // 始终发送给错误监听器（用于错误检测）
      errorListener.processChunk(chunk, 'stderr');
      
      // #region agent log
      // 检测 ERR_MODULE_NOT_FOUND 错误（stderr，chunkStr 已在函数开头定义）
      if (chunkStr.includes('ERR_MODULE_NOT_FOUND')) {
        (async () => {
          try {
            const { readFileSync } = await import('fs');
            const errorCheck = {
              error: 'ERR_MODULE_NOT_FOUND',
              criticalFiles: {},
              chunkFiles: {},
            };
            for (const { path, name } of criticalFiles) {
              errorCheck.criticalFiles[path] = existsSync(path);
            }
            const layoutBridgeChunk = join(rootDir, 'packages', 'shared-core', 'dist', 'layout-bridge-BBmi0y9h.mjs');
            errorCheck.chunkFiles.layoutBridgeExists = existsSync(layoutBridgeChunk);
            const appEnvPath = join(rootDir, 'packages', 'shared-core', 'dist', 'configs', 'app-env.config.mjs');
            errorCheck.chunkFiles.appEnvExists = existsSync(appEnvPath);
            if (existsSync(layoutBridgeChunk)) {
              try {
                const content = readFileSync(layoutBridgeChunk, 'utf-8');
                const appEnvImport = content.match(/from\s+["']([^"']*app-env[^"']*)["']/);
                if (appEnvImport) {
                  errorCheck.chunkFiles.appEnvImportPath = appEnvImport[1];
                  let resolvedPath;
                  if (appEnvImport[1].startsWith('./')) {
                    resolvedPath = join(rootDir, 'packages', 'shared-core', 'dist', appEnvImport[1].substring(2));
                  } else if (appEnvImport[1].startsWith('../')) {
                    resolvedPath = join(rootDir, 'packages', 'shared-core', 'dist', '..', appEnvImport[1].substring(3));
                  } else {
                    resolvedPath = join(rootDir, 'packages', 'shared-core', 'dist', appEnvImport[1]);
                  }
                  errorCheck.chunkFiles.appEnvResolvedPath = resolvedPath;
                  errorCheck.chunkFiles.appEnvResolvedExists = existsSync(resolvedPath);
                }
              } catch (e) {
                errorCheck.chunkFiles.readError = e.message;
              }
            }
            await debugLog({ hypothesisId: 'D', runId: 'runtime', location: 'dev-with-check.mjs:onStderrData', message: '检测到 ERR_MODULE_NOT_FOUND 错误时的文件状态', data: errorCheck });
          } catch (e) {}
        })();
      }
      // #endregion
    };
    
    // 监听 stdout
    child.stdout.on('data', onStdoutData);
    
    // 监听 stderr
    child.stderr.on('data', onStderrData);
    
    child.on('close', async (code) => {
      // 关键：移除所有事件监听器，释放资源（防止内存泄漏）
      child.stdout.removeListener('data', onStdoutData);
      child.stderr.removeListener('data', onStderrData);
      child.removeAllListeners();
      
      // 注意：服务器启动总结会在服务器启动时通过日志输出，这里不需要额外处理
      
      // 刷新监听器缓冲区
      await errorListener.flush();
      resolve(code || 0);
    });
    
    child.on('error', (err) => {
      logger.error('Failed to start turbo:', err);
      
      // 关键：移除所有事件监听器，释放资源（防止内存泄漏）
      child.stdout.removeListener('data', onStdoutData);
      child.stderr.removeListener('data', onStderrData);
      child.removeAllListeners();
      
      errorListener.stop();
      // 注意：不要停止监控服务器，因为它可能被其他命令使用
      // monitorServer.stop();
      reject(err);
    });
    
  // 处理进程退出
  const cleanup = () => {
    try {
      if (child && !child.killed) {
        // 关键：移除所有事件监听器，释放资源（防止内存泄漏）
        try {
          child.stdout.removeListener('data', onStdoutData);
          child.stderr.removeListener('data', onStderrData);
          child.removeAllListeners();
        } catch (e) {
          // 忽略错误
        }
        child.kill('SIGTERM');
      }
      if (errorListener) {
        errorListener.stop();
      }
      // 停止内存监控（添加安全检查）
      if (memoryMonitor && typeof memoryMonitor.stop === 'function') {
        try {
          memoryMonitor.stop();
        } catch (e) {
          // 忽略停止时的错误
        }
      }
      // 注意：不要停止监控服务器，因为它可能被其他命令使用
      // monitorServer.stop();
    } catch (error) {
      // 清理函数中的错误不应该导致进程崩溃，静默处理
      console.error('清理函数执行错误:', error.message);
    }
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  });
}

// 主逻辑：先检查端口，再启动（自动记录dev-workflow skill执行）
(async () => {
  try {
    // 对于长期运行命令，interceptCommand 会异步执行命令，不需要再次执行
    const result = await interceptCommand('dev:all', async () => {
      checkPorts();
      return await runDevAll();
    }, {
      context: {
        description: '启动所有应用的开发服务器'
      },
      longRunning: true // 标记为长期运行命令
    });
    
    // 如果是长期运行命令，拦截器已异步执行，这里只需要等待（不退出）
    if (result && result.longRunning) {
      // 静默启动，不输出日志
      // 不退出，让服务器继续运行
      // interceptCommand 已经异步执行了命令，不需要再次执行
    } else {
      // 短期命令，等待完成
      await result;
    }
  } catch (error) {
    logger.error('❌ 启动失败:', error);
    process.exit(1);
  }
})();


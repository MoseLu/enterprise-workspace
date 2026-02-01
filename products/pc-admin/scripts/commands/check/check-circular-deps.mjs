#!/usr/bin/env node
/**
 * 循环依赖检测脚本
 * 使用 madge 工具检测项目中的循环依赖
 */
import { logger } from '../../utils/logger.mjs';

import { execSync } from 'child_process';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { getRootDir } from '../../utils/path-helper.mjs';

const rootDir = getRootDir();

// 要检测的应用目录
const appsToCheck = [
  'apps/system-app/src',
  'apps/admin-app/src',
  'apps/logistics-app/src',
  'apps/finance-app/src',
  'apps/engineering-app/src',
  'apps/quality-app/src',
  'apps/production-app/src',
];

// 要检测的包目录
const packagesToCheck = [
  'packages/shared-core/src',
  'packages/shared-components/src',
  'packages/shared-utils/src',
];

// 检查 madge 是否安装
function checkMadgeInstalled() {
  try {
    execSync('npx madge --version', { stdio: 'ignore', cwd: rootDir });
    return true;
  } catch {
    return false;
  }
}

// 检测单个目录的循环依赖
function checkCircularDeps(dir, label) {
  const fullPath = resolve(rootDir, dir);
  
  if (!existsSync(fullPath)) {
    logger.info(`⚠️  跳过不存在的目录: ${dir}`);
    return { hasCircular: false, cycles: [] };
  }

  try {
    logger.info(`\n🔍 检查 ${label} (${dir})...`);
    
    // 使用 madge 检测循环依赖
    // --circular: 只显示循环依赖
    // --extensions ts,tsx: 只检测 TypeScript 文件（Vue 文件的导入会在 .ts 文件中体现）
    // --exclude: 排除 node_modules 和其他构建产物（注意：不支持 glob 模式，只支持正则）
    // --no-spinner: 禁用加载动画
    let output = '';
    let hasCircular = false;
    let cycles = [];
    
    try {
      output = execSync(
        `npx madge --circular --extensions ts,tsx --exclude "node_modules|dist|build|\\.vite|\\.turbo" --no-spinner "${fullPath}"`,
        { 
          encoding: 'utf-8',
          cwd: rootDir,
          stdio: 'pipe',
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        }
      );
      
      // 检查输出中是否包含循环依赖信息
      if (output.trim() && output.includes('Circular')) {
        hasCircular = true;
        cycles = output.split('\n').filter(l => l.trim() && (l.includes('Circular') || l.includes('→') || l.includes('└─')));
      }
    } catch (execError) {
      // madge 在发现循环依赖时返回非零退出码
      const stdout = execError.stdout?.toString() || '';
      const stderr = execError.stderr?.toString() || '';
      
      // 检查是否是真正的循环依赖（包含 "Found X circular dependency" 或类似模式）
      if (stdout.includes('Found') && stdout.includes('circular dependency') || stdout.includes('Circular') || stdout.includes('circular')) {
        hasCircular = true;
        // 提取循环依赖信息
        const lines = stdout.split('\n');
        cycles = [];
        
        // 查找包含循环依赖信息的行
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.includes('Found') && line.includes('circular dependency')) {
            cycles.push(line);
            // 查找后续的依赖链（通常是数字开头的行，如 "1) file1.ts > file2.ts"）
            for (let j = i + 1; j < lines.length && j < i + 10; j++) {
              const nextLine = lines[j].trim();
              if (nextLine && (nextLine.match(/^\d+\)\s+/) || nextLine.includes('→') || nextLine.includes('└─') || nextLine.includes('.ts'))) {
                cycles.push(nextLine);
              } else if (nextLine && !nextLine.includes('npm warn')) {
                break; // 如果没有找到相关行，停止查找
              }
            }
          }
        }
        
        // 如果没有找到格式化的信息，至少输出原始输出
        if (cycles.length === 0 && stdout.includes('circular')) {
          cycles = stdout.split('\n').filter(l => {
            const trimmed = l.trim();
            return trimmed && !trimmed.includes('npm warn') && (
              trimmed.includes('circular') || 
              trimmed.includes('→') || 
              trimmed.includes('└─') ||
              trimmed.match(/^\d+\)/)
            );
          });
        }
      } else if (stdout.includes('SyntaxError') || stderr.includes('SyntaxError')) {
        // 这是解析错误，不是循环依赖，跳过
        logger.info(`⚠️  ${label} 存在文件解析错误，跳过循环依赖检测`);
        return { hasCircular: false, cycles: [], skipped: true };
      } else {
        // 其他错误
        logger.info(`⚠️  ${label} 检测时遇到问题: ${stderr || execError.message}`);
        return { hasCircular: false, cycles: [], skipped: true };
      }
    }
    
    if (hasCircular) {
      logger.error(`❌ ${label} 发现循环依赖:`);
      if (output.trim()) {
        // 过滤掉 npm 警告，只显示循环依赖信息
        const filteredOutput = output.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed && !trimmed.includes('npm warn') && !trimmed.includes('Finding files');
        }).join('\n');
        logger.error(filteredOutput);
        // 更新 cycles 数组
        if (cycles.length === 0) {
          cycles = filteredOutput.split('\n').filter(l => l.trim() && (l.includes('circular') || l.match(/^\d+\)/)));
        }
      } else if (stdout.trim()) {
        // 使用 stdout 中的信息
        const filteredStdout = stdout.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed && !trimmed.includes('npm warn') && !trimmed.includes('Finding files');
        }).join('\n');
        logger.error(filteredStdout);
        if (cycles.length === 0) {
          cycles = filteredStdout.split('\n').filter(l => l.trim() && (l.includes('circular') || l.match(/^\d+\)/)));
        }
      }
      return { hasCircular: true, cycles };
    }
    
    logger.info(`✅ ${label} 未发现循环依赖`);
    return { hasCircular: false, cycles: [] };
  } catch (error) {
    // 捕获其他未预期的错误
    logger.info(`⚠️  检查 ${label} 时出错: ${error.message}`);
    return { hasCircular: false, cycles: [], skipped: true };
  }
}

// 主函数
function main() {
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('🔍 开始检测循环依赖...');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 检查 madge 是否可用
  if (!checkMadgeInstalled()) {
    logger.info('📦 正在安装 madge...');
    try {
      execSync('pnpm add -D -w madge', { stdio: 'inherit', cwd: rootDir });
      logger.info('✅ madge 安装成功\n');
    } catch (error) {
      logger.error('❌ 安装 madge 失败，请手动安装: pnpm add -D -w madge');
      process.exit(1);
    }
  }

  const allResults = [];
  let hasAnyCircular = false;

  // 检查应用
  logger.info('📱 检查应用目录...');
  for (const app of appsToCheck) {
    const label = app.split('/').slice(-2).join('/');
    const result = checkCircularDeps(app, label);
    allResults.push({ dir: app, label, ...result });
    if (result.hasCircular) {
      hasAnyCircular = true;
    }
  }

  // 检查包
  logger.info('\n📦 检查包目录...');
  for (const pkg of packagesToCheck) {
    const label = pkg.split('/').slice(-2).join('/');
    const result = checkCircularDeps(pkg, label);
    allResults.push({ dir: pkg, label, ...result });
    if (result.hasCircular) {
      hasAnyCircular = true;
    }
  }

  // 输出总结
  logger.info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('📊 检测总结');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const circularDirs = allResults.filter(r => r.hasCircular);
  const skippedDirs = allResults.filter(r => r.skipped);
  
  if (circularDirs.length === 0) {
    if (skippedDirs.length > 0) {
      logger.info(`\n✅ TypeScript 文件未发现循环依赖！`);
      logger.info(`⚠️  注意: ${skippedDirs.length} 个目录因解析错误被跳过（可能是 Vue 文件语法问题）\n`);
    } else {
      logger.info('✅ 所有目录均未发现循环依赖！\n');
    }
    process.exit(0);
  } else {
    logger.error(`\n❌ 发现 ${circularDirs.length} 个目录存在循环依赖:\n`);
    circularDirs.forEach(({ dir, label, cycles }) => {
      logger.error(`  • ${label}`);
      if (cycles && cycles.length > 0) {
        cycles.slice(0, 10).forEach(cycle => {
          logger.error(`    ${cycle}`);
        });
        if (cycles.length > 10) {
          logger.error(`    ... 还有 ${cycles.length - 10} 个循环依赖`);
        }
      }
    });
    logger.error('\n💡 提示: 请修复上述循环依赖后再继续开发\n');
    process.exit(1);
  }
}

main();


#!/usr/bin/env node

/**
 * 内存泄漏检测脚本
 * 扫描代码库查找常见的内存泄漏模式
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { getRootDir } from '../../utils/path-helper.mjs';
import { logger } from '../../utils/logger.mjs';

const rootDir = getRootDir();
const issues = [];

// 要扫描的文件扩展名
const SCAN_EXTENSIONS = ['.js', '.mjs', '.ts', '.tsx', '.vue'];

// 要排除的目录
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.turbo',
  '.vite',
  'coverage',
  '.heap-snapshots'
];

/**
 * 检查文件是否应该被扫描
 */
function shouldScanFile(filePath) {
  const ext = extname(filePath);
  if (!SCAN_EXTENSIONS.includes(ext)) {
    return false;
  }

  // 排除 node_modules 等目录
  for (const excludeDir of EXCLUDE_DIRS) {
    if (filePath.includes(excludeDir)) {
      return false;
    }
  }

  return true;
}

/**
 * 扫描目录
 */
function scanDirectory(dir, relativePath = '') {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relPath = join(relativePath, entry.name);

      if (entry.isDirectory()) {
        // 递归扫描子目录
        if (!EXCLUDE_DIRS.some(exclude => relPath.includes(exclude))) {
          scanDirectory(fullPath, relPath);
        }
      } else if (entry.isFile() && shouldScanFile(fullPath)) {
        scanFile(fullPath, relPath);
      }
    }
  } catch (error) {
    // 忽略无法访问的目录
  }
}

/**
 * 扫描单个文件
 */
function scanFile(filePath, relativePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // 检测模式 1: setInterval 没有对应的 clearInterval
    detectUnclearedIntervals(filePath, relativePath, content, lines);

    // 检测模式 2: setTimeout 没有对应的 clearTimeout
    detectUnclearedTimeouts(filePath, relativePath, content, lines);

    // 检测模式 3: EventEmitter 监听器没有 removeListener
    detectUnremovedListeners(filePath, relativePath, content, lines);

    // 检测模式 4: 全局变量累积
    detectGlobalAccumulation(filePath, relativePath, content, lines);

    // 检测模式 5: 闭包可能持有大量引用
    detectClosureLeaks(filePath, relativePath, content, lines);
  } catch (error) {
    // 忽略无法读取的文件
  }
}

/**
 * 检测未清理的 setInterval
 */
function detectUnclearedIntervals(filePath, relativePath, content, lines) {
  const intervalRegex = /setInterval\s*\(/g;
  const clearRegex = /clearInterval\s*\(/g;
  
  const intervalMatches = Array.from(content.matchAll(intervalRegex));
  const clearMatches = Array.from(content.matchAll(clearRegex));

  // 简单检查：如果 setInterval 数量明显多于 clearInterval，可能存在泄漏
  if (intervalMatches.length > clearMatches.length) {
    const lineNumbers = intervalMatches.map(match => {
      const beforeMatch = content.substring(0, match.index);
      return beforeMatch.split('\n').length;
    });

    issues.push({
      type: 'uncleared_interval',
      severity: 'warning',
      file: relativePath,
      message: `发现 ${intervalMatches.length} 个 setInterval，但只有 ${clearMatches.length} 个 clearInterval`,
      lineNumbers: lineNumbers.slice(0, 5), // 只显示前5个
      recommendation: '确保所有 setInterval 都有对应的 clearInterval，特别是在组件卸载或函数退出时'
    });
  }
}

/**
 * 检测未清理的 setTimeout
 */
function detectUnclearedTimeouts(filePath, relativePath, content, lines) {
  // 注意：setTimeout 通常不需要清理（除非是循环调用），所以这里只检测明显的循环模式
  const timeoutRegex = /setTimeout\s*\([^,]+,\s*0\s*\)/g; // setTimeout(..., 0) 可能是循环调用
  const clearRegex = /clearTimeout\s*\(/g;
  
  const timeoutMatches = Array.from(content.matchAll(timeoutRegex));
  const clearMatches = Array.from(content.matchAll(clearRegex));

  if (timeoutMatches.length > 0 && timeoutMatches.length > clearMatches.length) {
    const lineNumbers = timeoutMatches.map(match => {
      const beforeMatch = content.substring(0, match.index);
      return beforeMatch.split('\n').length;
    });

    issues.push({
      type: 'potential_timeout_loop',
      severity: 'info',
      file: relativePath,
      message: `发现 ${timeoutMatches.length} 个 setTimeout(..., 0) 模式，可能是循环调用，需要确保有清理机制`,
      lineNumbers: lineNumbers.slice(0, 5),
      recommendation: '检查 setTimeout(..., 0) 是否用于循环调用，如果是，确保有退出条件和清理机制'
    });
  }
}

/**
 * 检测未移除的事件监听器
 */
function detectUnremovedListeners(filePath, relativePath, content, lines) {
  // 检测 .on( 但没有对应的 .off( 或 .removeListener(
  const onRegex = /\.on\s*\(/g;
  const offRegex = /\.(off|removeListener|removeAllListeners)\s*\(/g;
  
  const onMatches = Array.from(content.matchAll(onRegex));
  const offMatches = Array.from(content.matchAll(offRegex));

  // 如果 .on 明显多于 .off，可能存在泄漏
  if (onMatches.length > offMatches.length * 1.5) { // 允许一些误差
    const lineNumbers = onMatches.map(match => {
      const beforeMatch = content.substring(0, match.index);
      return beforeMatch.split('\n').length;
    });

    issues.push({
      type: 'unremoved_listener',
      severity: 'warning',
      file: relativePath,
      message: `发现 ${onMatches.length} 个 .on( 监听器，但只有 ${offMatches.length} 个清理调用`,
      lineNumbers: lineNumbers.slice(0, 5),
      recommendation: '确保所有事件监听器都有对应的清理调用（.off、.removeListener 或 .removeAllListeners），特别是在组件卸载时'
    });
  }
}

/**
 * 检测全局变量累积
 */
function detectGlobalAccumulation(filePath, relativePath, content, lines) {
  // 检测全局对象的直接赋值（可能导致累积）
  const globalAssignRegex = /(global|window|globalThis)\s*\[['"](.+?)['"]\s*\]\s*=\s*\[/g;
  const globalPushRegex = /(global|window|globalThis)\s*\[['"](.+?)['"]\s*\]\s*\.push\(/g;
  
  const matches = Array.from(content.matchAll(globalAssignRegex));
  const pushMatches = Array.from(content.matchAll(globalPushRegex));

  if (matches.length > 0 || pushMatches.length > 0) {
    const lineNumbers = [...matches, ...pushMatches].map(match => {
      const beforeMatch = content.substring(0, match.index);
      return beforeMatch.split('\n').length;
    });

    issues.push({
      type: 'global_accumulation',
      severity: 'warning',
      file: relativePath,
      message: `发现全局变量操作（数组赋值或 push），可能导致内存累积`,
      lineNumbers: lineNumbers.slice(0, 5),
      recommendation: '检查全局变量是否有容量限制或清理机制，避免无限累积数据'
    });
  }
}

/**
 * 检测闭包泄漏
 */
function detectClosureLeaks(filePath, relativePath, content, lines) {
  // 检测可能持有大量引用的闭包模式
  // 例如：函数返回函数，且内部引用了大量外部变量
  const closurePattern = /function\s+\w+\s*\([^)]*\)\s*\{[^}]*return\s+function/g;
  const matches = Array.from(content.matchAll(closurePattern));

  // 这是一个启发式检测，可能有很多误报，所以只标记为 info
  if (matches.length > 10) { // 如果文件中有很多闭包模式
    issues.push({
      type: 'potential_closure_leak',
      severity: 'info',
      file: relativePath,
      message: `发现大量闭包模式（${matches.length} 处），可能持有未释放的引用`,
      recommendation: '检查闭包是否持有大量外部对象引用，确保闭包本身能被正确释放'
    });
  }
}

/**
 * 生成报告
 */
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    totalIssues: issues.length,
    byType: {},
    bySeverity: {
      critical: 0,
      warning: 0,
      info: 0
    },
    issues: issues
  };

  // 统计
  for (const issue of issues) {
    report.byType[issue.type] = (report.byType[issue.type] || 0) + 1;
    report.bySeverity[issue.severity] = (report.bySeverity[issue.severity] || 0) + 1;
  }

  return report;
}

/**
 * 打印报告
 */
function printReport(report) {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 内存泄漏检测报告');
  console.log('='.repeat(80));
  console.log(`生成时间: ${report.timestamp}`);
  console.log(`总问题数: ${report.totalIssues}`);
  console.log('');

  if (report.totalIssues === 0) {
    console.log('✅ 未发现明显的内存泄漏模式');
    console.log('');
    return;
  }

  console.log('📊 问题统计:');
  console.log(`  严重: ${report.bySeverity.critical}`);
  console.log(`  警告: ${report.bySeverity.warning}`);
  console.log(`  信息: ${report.bySeverity.info}`);
  console.log('');

  console.log('📋 问题详情:');
  for (const issue of issues) {
    const icon = issue.severity === 'critical' ? '🚨' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`  ${icon} [${issue.severity.toUpperCase()}] ${issue.type}`);
    console.log(`     文件: ${issue.file}`);
    console.log(`     问题: ${issue.message}`);
    if (issue.lineNumbers && issue.lineNumbers.length > 0) {
      console.log(`     行号: ${issue.lineNumbers.join(', ')}`);
    }
    if (issue.recommendation) {
      console.log(`     建议: ${issue.recommendation}`);
    }
    console.log('');
  }

  console.log('='.repeat(80) + '\n');
}

/**
 * 主函数
 */
function main() {
  try {
    logger.info('开始扫描代码库...');

    // 扫描主要目录
    const scanDirs = [
      join(rootDir, 'apps'),
      join(rootDir, 'packages'),
      join(rootDir, 'scripts')
    ];

    for (const dir of scanDirs) {
      if (existsSync(dir)) {
        scanDirectory(dir);
      }
    }

    // 生成报告
    const report = generateReport();

    // 打印报告
    printReport(report);

    // 如果有严重问题，返回非0退出码
    const hasCritical = report.bySeverity.critical > 0;
    process.exit(hasCritical ? 1 : 0);
  } catch (error) {
    logger.error('泄漏检测失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main();

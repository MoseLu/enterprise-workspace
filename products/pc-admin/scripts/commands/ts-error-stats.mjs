#!/usr/bin/env node
/**
 * TypeScript 错误统计脚本
 * 用法: node scripts/commands/ts-error-stats.mjs
 * 
 * 统计全局 TypeScript 错误总数以及各种问题分类数量
 * 确保统计结果与 tsc:all 命令的输出一致
 */
import { logger } from '../../utils/logger.mjs';

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../..');

logger.info('正在运行 TypeScript 类型检查...\n');

// 使用 spawn 确保捕获所有输出（包括 stdout 和 stderr）
const child = spawn('node', ['scripts/commands/tools/turbo.js', 'run', 'type-check'], {
  cwd: rootDir,
  shell: true,
  stdio: ['pipe', 'pipe', 'pipe']
});

let fullOutput = '';
let outputComplete = false;

// 捕获 stdout
child.stdout.on('data', (data) => {
  const text = data.toString();
  fullOutput += text;
});

// 捕获 stderr
child.stderr.on('data', (data) => {
  const text = data.toString();
  fullOutput += text;
});

// 等待进程结束
child.on('close', (code) => {
  outputComplete = true;
  processStats(fullOutput, code || 1);
});

// 处理错误
child.on('error', (error) => {
  logger.error('执行命令时出错:', error.message);
  if (!outputComplete) {
    outputComplete = true;
    processStats(fullOutput, 1);
  }
});

function processStats(fullOutput, exitCode) {
  // 统计总错误数（匹配所有 error TS 开头的错误）
  const errorMatches = fullOutput.match(/error TS\d+/g) || [];
  const totalErrors = errorMatches.length;
  
  // 统计总警告数
  const warningMatches = fullOutput.match(/warning TS\d+/g) || [];
  const totalWarnings = warningMatches.length;
  
  // 按错误类型分类统计（使用更精确的匹配）
  const errorLines = fullOutput.split('\n').filter(line => line.includes('error TS'));
  
  const errorTypes = {
    '重复声明': 0,
    '重复函数实现': 0,
    '属性不存在': 0,
    '语法错误': 0,
    '模块未找到': 0,
    '类型不匹配': 0,
    '隐式 any 类型': 0,
    '未使用的变量': 0,
    '未使用的指令': 0,
    '缺少属性': 0,
    '类型转换错误': 0,
    '类型未知': 0,
  };
  
  // 动态错误代码统计
  const dynamicErrorTypes = {};
  
  errorLines.forEach(line => {
    // 按 TS 错误代码分类
    if (line.includes('error TS2323') || line.includes('Cannot redeclare')) {
      errorTypes['重复声明']++;
    } else if (line.includes('error TS2393') || line.includes('Duplicate function')) {
      errorTypes['重复函数实现']++;
    } else if (line.includes('error TS2339') || (line.includes('does not exist on type') || (line.includes('Property') && line.includes('does not exist')))) {
      errorTypes['属性不存在']++;
    } else if (line.includes('error TS1005') || line.includes("expected")) {
      errorTypes['语法错误']++;
    } else if (line.includes('error TS2307') || line.includes('Cannot find module')) {
      errorTypes['模块未找到']++;
    } else if (line.includes('error TS2322') || line.includes('is not assignable to type')) {
      errorTypes['类型不匹配']++;
    } else if (line.includes('error TS7006') || line.includes("implicitly has an 'any' type")) {
      errorTypes['隐式 any 类型']++;
    } else if (line.includes('error TS6133') || line.includes('is declared but its value is never read')) {
      errorTypes['未使用的变量']++;
    } else if (line.includes('error TS2578') || (line.includes('Unused') && (line.includes('@ts-expect-error') || line.includes('@ts-ignore')))) {
      errorTypes['未使用的指令']++;
    } else if (line.includes('error TS2741') || line.includes('is missing in type')) {
      errorTypes['缺少属性']++;
    } else if (line.includes('error TS2352') || (line.includes('Conversion of type') && line.includes('may be a mistake'))) {
      errorTypes['类型转换错误']++;
    } else if (line.includes('error TS18046') || line.includes("is of type 'unknown'")) {
      errorTypes['类型未知']++;
    } else if (line.includes('error TS')) {
      // 提取错误代码
      const errorCodeMatch = line.match(/error TS(\d+)/);
      if (errorCodeMatch) {
        const errorCode = `TS${errorCodeMatch[1]}`;
        dynamicErrorTypes[errorCode] = (dynamicErrorTypes[errorCode] || 0) + 1;
      }
    }
  });
  
  // 合并动态错误类型到主统计中（只显示有错误的）
  Object.entries(dynamicErrorTypes).forEach(([code, count]) => {
    if (count > 0 && !errorTypes[`${code}错误`]) {
      errorTypes[`${code}错误`] = count;
    }
  });
  
  // 按应用分类统计
  const appErrors = {};
  const lines = fullOutput.split('\n');
  let currentApp = null;
  
  // 应用名称列表
  const appNames = [
    'admin-app', 'logistics-app', 'system-app', 'finance-app',
    'engineering-app', 'quality-app', 'production-app', 'monitor-app',
    'layout-app', 'docs-app'
  ];
  
  lines.forEach(line => {
    // 匹配应用名称（从 turbo 输出中提取，支持多种格式）
    for (const appName of appNames) {
      const cleanAppName = appName.replace('@btc/', '');
      if (line.includes(`${appName}:type-check:`) || 
          line.includes(`${appName}#type-check`) ||
          line.includes(`${cleanAppName}:type-check:`) ||
          line.includes(`${cleanAppName}#type-check`) ||
          line.match(new RegExp(`\\b${appName.replace('@btc/', '')}\\b.*type-check`, 'i'))) {
        currentApp = cleanAppName;
        if (!appErrors[currentApp]) {
          appErrors[currentApp] = { errors: 0, warnings: 0 };
        }
        break;
      }
    }
    
    // 如果行中包含文件路径，尝试从路径中提取应用名称
    if (!currentApp) {
      const pathMatch = line.match(/(apps|packages)\/([^\/]+)\//);
      if (pathMatch) {
        const appFromPath = pathMatch[2];
        if (appNames.some(name => name.includes(appFromPath) || appFromPath.includes(name.replace('@btc/', '')))) {
          currentApp = appFromPath;
          if (!appErrors[currentApp]) {
            appErrors[currentApp] = { errors: 0, warnings: 0 };
          }
        }
      }
    }
    
    if (currentApp) {
      if (line.includes('error TS')) {
        appErrors[currentApp].errors++;
      }
      if (line.includes('warning TS')) {
        appErrors[currentApp].warnings++;
      }
    }
  });
  
  // 输出统计结果
  logger.info('\n' + '='.repeat(60));
  logger.info('TypeScript 错误统计报告');
  logger.info('='.repeat(60));
  logger.info(`\n总错误数: ${totalErrors}`);
  logger.info(`总警告数: ${totalWarnings}`);
  logger.info(`总问题数: ${totalErrors + totalWarnings}`);
  
  logger.info('\n按错误类型分类:');
  logger.info('-'.repeat(60));
  const sortedErrorTypes = Object.entries(errorTypes)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a);
  
  if (sortedErrorTypes.length > 0) {
    sortedErrorTypes.forEach(([type, count]) => {
      logger.info(`  ${type.padEnd(20)}: ${count}`);
    });
  } else {
    logger.info('  暂无错误');
  }
  
  logger.info('\n按应用分类:');
  logger.info('-'.repeat(60));
  const sortedApps = Object.entries(appErrors)
    .filter(([_, stats]) => stats.errors > 0 || stats.warnings > 0)
    .sort(([_, a], [__, b]) => (b.errors + b.warnings) - (a.errors + a.warnings));
  
  if (sortedApps.length > 0) {
    sortedApps.forEach(([app, stats]) => {
      const total = stats.errors + stats.warnings;
      logger.info(`  ${app.padEnd(20)}: ${stats.errors} 个错误, ${stats.warnings} 个警告 (总计: ${total})`);
    });
  } else {
    logger.info('  暂无应用错误数据');
  }
  
  logger.info('\n' + '='.repeat(60));
  
  // 验证：确保统计的错误数与实际匹配的错误数一致
  if (totalErrors !== errorMatches.length) {
    logger.info(`\n⚠ 警告: 统计的错误数 (${totalErrors}) 与匹配的错误数 (${errorMatches.length}) 不一致`);
  }
  
  // 如果有错误，返回非零退出码
  if (totalErrors > 0 || exitCode !== 0) {
    process.exit(1);
  }
}

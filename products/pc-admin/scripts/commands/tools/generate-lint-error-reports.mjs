#!/usr/bin/env node
/**
 * 为每个应用单独运行 lint 检查并生成错误报告
 * 用法: node scripts/generate-lint-error-reports.mjs
 */
import { logger } from '../../utils/logger.mjs';

import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, readdirSync, unlinkSync, statSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// 定义所有可能的应用列表
// 注意：mobile-app 不参与 lint 检查
const allApps = [
  { name: 'admin', packageName: 'admin-app', pattern: 'apps/admin-app/src/**/*.{ts,tsx,vue}' },
  { name: 'logistics', packageName: 'logistics-app', pattern: 'apps/logistics-app/src/**/*.{ts,tsx,vue}' },
  { name: 'system', packageName: 'system-app', pattern: 'apps/system-app/src/**/*.{ts,tsx,vue}' },
  { name: 'finance', packageName: 'finance-app', pattern: 'apps/finance-app/src/**/*.{ts,tsx,vue}' },
  { name: 'engineering', packageName: 'engineering-app', pattern: 'apps/engineering-app/src/**/*.{ts,tsx,vue}' },
  { name: 'quality', packageName: 'quality-app', pattern: 'apps/quality-app/src/**/*.{ts,tsx,vue}' },
  { name: 'production', packageName: 'production-app', pattern: 'apps/production-app/src/**/*.{ts,tsx,vue}' },
  { name: 'monitor', packageName: 'monitor-app', pattern: 'apps/monitor-app/src/**/*.{ts,tsx,vue}' },
  { name: 'layout', packageName: 'layout-app', pattern: 'apps/layout-app/src/**/*.{ts,tsx,vue}' },
  { name: 'docs', packageName: 'docs-app', pattern: 'apps/docs-app/src/**/*.{ts,tsx,vue}' },
  { name: 'personnel', packageName: 'personnel-app', pattern: 'apps/personnel-app/src/**/*.{ts,tsx,vue}' },
  { name: 'dashboard', packageName: 'dashboard-app', pattern: 'apps/dashboard-app/src/**/*.{ts,tsx,vue}' },
  { name: 'operations', packageName: 'operations-app', pattern: 'apps/operations-app/src/**/*.{ts,tsx,vue}' },
  { name: 'home', packageName: 'home-app', pattern: 'apps/home-app/src/**/*.{ts,tsx,vue}' },
];

// 只包含实际存在的应用目录（单独生成日志）- 使用简短的名称，对应 scripts/commands/lint.mjs 中的格式
const apps = allApps.filter(app => {
  const appPath = resolve(rootDir, `apps/${app.packageName}`);
  return existsSync(appPath);
});

// 共享包列表（合并为一个日志文件）
const packages = [
  { name: '@btc/shared-components', pattern: 'packages/shared-components/src/**/*.{ts,tsx,vue}' },
  { name: '@btc/shared-core', pattern: 'packages/shared-core/src/**/*.{ts,tsx,vue}' },
  { name: '@btc/shared-router', pattern: 'packages/shared-router/src/**/*.{ts,tsx,vue}' },
  { name: '@btc/vite-plugin', pattern: 'packages/vite-plugin/src/**/*.{ts,tsx,vue}' }
];

// 输出目录（保存到 btc-shopflow-monorepo/lint-error-reports）
const outputDir = resolve(rootDir, 'lint-error-reports');

/**
 * 清理输出目录中的旧文件
 */
function cleanOutputDirectory() {
  // 检查目录是否存在
  try {
    const stats = statSync(outputDir);
    if (!stats.isDirectory()) {
      mkdirSync(outputDir, { recursive: true });
      return;
    }
  } catch (error) {
    // 目录不存在，创建它
    mkdirSync(outputDir, { recursive: true });
    logger.info('ℹ️  输出目录不存在，已创建\n');
    return;
  }

  logger.info('🧹 正在清理旧报告文件...\n');
  
  try {
    const files = readdirSync(outputDir);
    let cleanedCount = 0;
    
    files.forEach(file => {
      const filePath = join(outputDir, file);
      try {
        const stats = statSync(filePath);
        if (stats.isFile() && (file.endsWith('.txt') || file.endsWith('.md'))) {
          unlinkSync(filePath);
          cleanedCount++;
        }
      } catch (error) {
        // 忽略删除失败的文件
      }
    });
    
    if (cleanedCount > 0) {
      logger.info(`✅ 已清理 ${cleanedCount} 个旧文件\n`);
    } else {
      logger.info('ℹ️  没有需要清理的旧文件\n');
    }
  } catch (error) {
    // 如果读取目录失败，尝试创建目录
    mkdirSync(outputDir, { recursive: true });
    logger.info('ℹ️  输出目录不存在，已创建\n');
  }
}

/**
 * 运行 lint 检查并返回输出
 */
function runLint(appOrPackage) {
  return new Promise((resolve) => {
    // 使用 pnpm exec eslint 直接检查文件模式，与 lint:all 保持一致
    const command = 'pnpm';
    const args = ['exec', 'eslint', `"${appOrPackage.pattern}"`];
    
    logger.info(`\n正在检查 ${appOrPackage.name || appOrPackage.packageName}...`);
    
    const child = spawn(command, args, {
      cwd: rootDir,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
    });

    child.on('close', (code) => {
      const fullOutput = stdout + stderr;
      resolve({
        appName: appOrPackage.name || appOrPackage.packageName || appOrPackage.name,
        exitCode: code || 0,
        output: fullOutput,
        hasErrors: code !== 0
      });
    });

    child.on('error', (error) => {
      resolve({
        appName: appOrPackage.name || appOrPackage.packageName || appOrPackage.name,
        exitCode: 1,
        output: `执行错误: ${error.message}`,
        hasErrors: true
      });
    });
  });
}

/**
 * 解析 lint 错误信息
 */
function parseErrors(output, appName) {
  const errors = [];
  const lines = output.split('\n');
  
  // ESLint 标准格式：
  // 文件路径（完整路径，单独一行）
  //   行号:列号  error/warning  消息内容  规则名（在行尾或下一行）
  
  let currentFilePath = null;
  let errorCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // 跳过空行和统计行
    if (!trimmedLine || trimmedLine.startsWith('✖') || trimmedLine.startsWith('✔')) {
      currentFilePath = null;
      continue;
    }
    
    // 匹配文件路径行（完整路径，通常包含盘符或相对路径）
    // 格式: C:\path\to\file.ts 或 /path/to/file.ts 或 apps/xxx/src/file.ts
    // 注意：不能以空格开头（错误行会以空格开头）
    if (!line.match(/^\s/) && (trimmedLine.includes('\\') || trimmedLine.includes('/') || trimmedLine.match(/^[A-Z]:/))) {
      // 检查是否是文件路径（包含文件扩展名）
      if (trimmedLine.match(/\.(ts|tsx|vue|js|jsx)$/)) {
        currentFilePath = trimmedLine;
        continue;
      }
    }
    
    // 匹配错误行（缩进的行号:列号 error/warning 消息 规则名）
    // 格式:   3:36  error  message  @rule-name
    // 或:     3:36  error  message
    //         @rule-name (规则名在下一行)
    const errorLineMatch = trimmedLine.match(/^(\d+):(\d+)\s+(error|warning)\s+(.+?)(?:\s+(@[\w-]+\/[\w-]+))?$/);
    if (errorLineMatch && currentFilePath) {
      const lineNum = parseInt(errorLineMatch[1]);
      const columnNum = parseInt(errorLineMatch[2]);
      const severity = errorLineMatch[3];
      let message = errorLineMatch[4].trim();
      let rule = errorLineMatch[5] || null;
      
      // 收集多行消息（如果消息跨多行，以 - 开头）
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j];
        const nextTrimmed = nextLine.trim();
        
        // 检查行尾是否有规则名（格式：...  @typescript-eslint/xxx）
        const ruleAtEndMatch = nextTrimmed.match(/\s+(@[\w-]+\/[\w-]+)$/);
        if (ruleAtEndMatch) {
          if (!rule) {
            rule = ruleAtEndMatch[1];
            // 从消息中移除规则名
            const messagePart = nextTrimmed.replace(/\s+@[\w-]+\/[\w-]+$/, '');
            if (messagePart) {
              message += ' ' + messagePart;
            }
            j++;
            break;
          }
        }
        
        // 如果下一行是单独的规则名，停止收集
        if (nextTrimmed.match(/^@[\w-]+\/[\w-]+$/)) {
          if (!rule) {
            rule = nextTrimmed;
            j++;
          }
          break;
        }
        // 如果下一行是新的错误行或文件路径，停止收集
        if (nextTrimmed.match(/^\d+:\d+\s+(error|warning)/) || 
            (!nextLine.match(/^\s/) && (nextTrimmed.includes('\\') || nextTrimmed.includes('/') || nextTrimmed.match(/^[A-Z]:/)))) {
          break;
        }
        // 如果下一行是空行或统计行，停止收集
        if (!nextTrimmed || nextTrimmed.startsWith('✖') || nextTrimmed.startsWith('✔')) {
          break;
        }
        // 收集消息的续行（通常以 - 开头，或者继续消息内容）
        if (nextTrimmed.startsWith('-') || nextTrimmed.length > 0) {
          message += ' ' + nextTrimmed;
          j++;
        } else {
          break;
        }
      }
      
      // 如果规则名在下一行（在消息收集之后，且之前没有找到）
      if (!rule && j < lines.length) {
        const ruleLine = lines[j].trim();
        const ruleMatch = ruleLine.match(/^(@[\w-]+\/[\w-]+)$/);
        if (ruleMatch) {
          rule = ruleMatch[1];
          j++;
        }
      }
      
      errorCount++;
      errors.push({
        path: currentFilePath,
        line: lineNum,
        column: columnNum,
        severity: severity,
        message: message.trim(),
        rule: rule || 'unknown'
      });
      
      // 更新索引（跳过已处理的行）
      if (j > i) {
        i = j - 1;
      }
      
      continue;
    }
    
    // 兼容格式：file:line:column error message (rule) - 单行格式
    const singleLineMatch = trimmedLine.match(/^(.+?):(\d+):(\d+)\s+(error|warning)\s+(.+?)(?:\s+\((.+?)\)|\s+(@[\w-]+\/[\w-]+))?$/);
    if (singleLineMatch) {
      errorCount++;
      errors.push({
        path: singleLineMatch[1].trim(),
        line: parseInt(singleLineMatch[2]),
        column: parseInt(singleLineMatch[3]),
        severity: singleLineMatch[4],
        message: singleLineMatch[5].trim(),
        rule: singleLineMatch[6] || singleLineMatch[7] || 'unknown'
      });
      currentFilePath = singleLineMatch[1].trim();
      continue;
    }
  }

  // 按文件分组
  const errorsByFile = {};
  errors.forEach(error => {
    if (!errorsByFile[error.path]) {
      errorsByFile[error.path] = [];
    }
    errorsByFile[error.path].push({
      line: error.line,
      column: error.column,
      severity: error.severity,
      message: error.message,
      rule: error.rule
    });
  });

  // 按规则统计
  const errorsByRule = {};
  errors.forEach(error => {
    errorsByRule[error.rule] = (errorsByRule[error.rule] || 0) + 1;
  });

  // 按严重程度统计
  const errorsBySeverity = {
    error: 0,
    warning: 0
  };
  errors.forEach(error => {
    errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
  });

  return {
    totalErrors: errorCount,
    errorsByFile,
    errorsByRule,
    errorsBySeverity,
    allErrors: errors
  };
}

/**
 * 生成单个应用/包的报告
 */
function generateReport(result, errors, isPackage = false) {
  const appName = result.appName;
  // 生成文件名：移除 @btc/ 前缀，将所有 - 替换为 _
  const fileName = appName.replace('@btc/', '').replace(/-/g, '_');
  const reportPath = join(outputDir, `${fileName}_errors.txt`);
  
  let report = `============================================================\n`;
  report += `${appName} - ESLint 错误报告\n`;
  report += `============================================================\n\n`;
  report += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
  report += `总错误数: ${errors.totalErrors}\n\n`;

  if (errors.totalErrors === 0) {
    report += `✅ 未发现 lint 错误\n`;
  } else {
    // 按严重程度统计
    report += `按严重程度分类:\n`;
    report += `------------------------------------------------------------\n`;
    report += `  error   : ${errors.errorsBySeverity.error} 个\n`;
    report += `  warning : ${errors.errorsBySeverity.warning} 个\n`;
    report += `\n`;

    // 按规则统计
    report += `按规则分类:\n`;
    report += `------------------------------------------------------------\n`;
    const sortedRules = Object.entries(errors.errorsByRule)
      .sort((a, b) => b[1] - a[1]);
    sortedRules.forEach(([rule, count]) => {
      report += `  ${rule.padEnd(40)}: ${count} 个\n`;
    });
    report += `\n`;

    // 按文件分类
    report += `按文件分类:\n`;
    report += `------------------------------------------------------------\n`;
    const sortedFiles = Object.entries(errors.errorsByFile)
      .sort((a, b) => b[1].length - a[1].length);
    
    sortedFiles.forEach(([file, fileErrors]) => {
      report += `\n文件: ${file}\n`;
      report += `  错误数: ${fileErrors.length}\n`;
      fileErrors.forEach(err => {
        report += `    [${err.severity.toUpperCase()}] ${err.rule} - 行 ${err.line}:${err.column} - ${err.message}\n`;
      });
    });
    report += `\n`;

    // 详细错误列表
    report += `详细错误列表:\n`;
    report += `------------------------------------------------------------\n`;
    errors.allErrors.forEach((error, index) => {
      report += `\n错误 #${index + 1}\n`;
      report += `  文件: ${error.path}\n`;
      report += `  位置: ${error.line}:${error.column}\n`;
      report += `  严重程度: ${error.severity}\n`;
      report += `  规则: ${error.rule}\n`;
      report += `  消息: ${error.message}\n`;
    });
  }

  report += `\n============================================================\n`;
  report += `完整输出:\n`;
  report += `============================================================\n\n`;
  report += result.output;

  writeFileSync(reportPath, report, 'utf-8');
  logger.info(`✅ 报告已保存: ${reportPath}`);

  return {
    appName,
    totalErrors: errors.totalErrors,
    fileCount: Object.keys(errors.errorsByFile).length,
    errorsByRule: errors.errorsByRule,
    errorsBySeverity: errors.errorsBySeverity,
    reportPath,
    isPackage,
    errors,
    output: result.output
  };
}

/**
 * 生成共享包的合并报告
 */
function generatePackagesReport(packageResults) {
  const reportPath = join(outputDir, 'packages_errors.txt');
  
  // 合并所有错误
  const allErrors = [];
  const allErrorsByRule = {};
  const allErrorsByFile = {};
  const allErrorsBySeverity = { error: 0, warning: 0 };
  let totalErrors = 0;
  
  packageResults.forEach(pkgResult => {
    totalErrors += pkgResult.totalErrors || 0;
    
    // 合并规则统计
    if (pkgResult.errorsByRule && typeof pkgResult.errorsByRule === 'object') {
      Object.entries(pkgResult.errorsByRule).forEach(([rule, count]) => {
        allErrorsByRule[rule] = (allErrorsByRule[rule] || 0) + count;
      });
    }
    
    // 合并严重程度统计
    if (pkgResult.errorsBySeverity && typeof pkgResult.errorsBySeverity === 'object') {
      allErrorsBySeverity.error += pkgResult.errorsBySeverity.error || 0;
      allErrorsBySeverity.warning += pkgResult.errorsBySeverity.warning || 0;
    }
    
    // 合并文件错误
    if (pkgResult.errorsByFile && typeof pkgResult.errorsByFile === 'object') {
      Object.entries(pkgResult.errorsByFile).forEach(([file, fileErrors]) => {
        const prefixedFile = `[${pkgResult.appName}] ${file}`;
        if (!allErrorsByFile[prefixedFile]) {
          allErrorsByFile[prefixedFile] = [];
        }
        allErrorsByFile[prefixedFile].push(...fileErrors);
      });
    }
    
    // 合并所有错误
    if (pkgResult.errors && pkgResult.errors.allErrors && Array.isArray(pkgResult.errors.allErrors)) {
      pkgResult.errors.allErrors.forEach(error => {
        allErrors.push({
          ...error,
          package: pkgResult.appName,
          path: `[${pkgResult.appName}] ${error.path}`
        });
      });
    }
  });
  
  let report = `============================================================\n`;
  report += `共享包 - ESLint 错误合并报告\n`;
  report += `============================================================\n\n`;
  report += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
  report += `涉及包数: ${packageResults.length}\n`;
  report += `总错误数: ${totalErrors}\n\n`;

  // 按包统计
  report += `按包统计:\n`;
  report += `------------------------------------------------------------\n`;
  packageResults
    .sort((a, b) => b.totalErrors - a.totalErrors)
    .forEach(pkg => {
      report += `  ${pkg.appName.padEnd(30)}: ${pkg.totalErrors} 个错误\n`;
    });
  report += `\n`;

  if (totalErrors === 0) {
    report += `✅ 所有共享包均未发现 lint 错误\n`;
  } else {
    // 按严重程度统计
    report += `按严重程度分类:\n`;
    report += `------------------------------------------------------------\n`;
    report += `  error   : ${allErrorsBySeverity.error} 个\n`;
    report += `  warning : ${allErrorsBySeverity.warning} 个\n`;
    report += `\n`;

    // 按规则统计
    report += `按规则分类:\n`;
    report += `------------------------------------------------------------\n`;
    const sortedRules = Object.entries(allErrorsByRule)
      .sort((a, b) => b[1] - a[1]);
    sortedRules.forEach(([rule, count]) => {
      report += `  ${rule.padEnd(40)}: ${count} 个\n`;
    });
    report += `\n`;

    // 按文件分类
    report += `按文件分类:\n`;
    report += `------------------------------------------------------------\n`;
    const sortedFiles = Object.entries(allErrorsByFile)
      .sort((a, b) => b[1].length - a[1].length);
    
    sortedFiles.forEach(([file, fileErrors]) => {
      report += `\n文件: ${file}\n`;
      report += `  错误数: ${fileErrors.length}\n`;
      fileErrors.forEach(err => {
        report += `    [${err.severity.toUpperCase()}] ${err.rule} - 行 ${err.line}:${err.column} - ${err.message}\n`;
      });
    });
    report += `\n`;

    // 详细错误列表
    report += `详细错误列表:\n`;
    report += `------------------------------------------------------------\n`;
    allErrors.forEach((error, index) => {
      report += `\n错误 #${index + 1}\n`;
      report += `  包: ${error.package}\n`;
      report += `  文件: ${error.path}\n`;
      report += `  位置: ${error.line}:${error.column}\n`;
      report += `  严重程度: ${error.severity}\n`;
      report += `  规则: ${error.rule}\n`;
      report += `  消息: ${error.message}\n`;
    });
  }

  // 各包的完整输出
  report += `\n============================================================\n`;
  report += `各包完整输出:\n`;
  report += `============================================================\n\n`;
  packageResults.forEach(pkg => {
    report += `\n${'='.repeat(60)}\n`;
    report += `${pkg.appName} 完整输出:\n`;
    report += `${'='.repeat(60)}\n\n`;
    report += pkg.output;
    report += `\n`;
  });

  writeFileSync(reportPath, report, 'utf-8');
  logger.info(`✅ 共享包合并报告已保存: ${reportPath}`);

  // 返回汇总信息
  return {
    appName: 'packages (合并)',
    totalErrors,
    fileCount: Object.keys(allErrorsByFile).length,
    errorsByRule: allErrorsByRule,
    errorsBySeverity: allErrorsBySeverity,
    reportPath
  };
}

/**
 * 生成汇总报告
 */
function generateSummaryReport(results) {
  const summaryPath = join(outputDir, 'SUMMARY.md');
  
  let summary = `# ESLint 错误统计汇总\n\n`;
  summary += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  summary += `## 总体统计\n\n`;
  
  const totalErrors = results.reduce((sum, r) => sum + r.totalErrors, 0);
  const appsWithErrors = results.filter(r => r.totalErrors > 0).length;
  
  summary += `- **总应用数**: ${results.length}\n`;
  summary += `- **有错误的应用数**: ${appsWithErrors}\n`;
  summary += `- **总错误数**: ${totalErrors}\n\n`;
  
  summary += `## 应用错误统计\n\n`;
  summary += `| 应用名称 | 错误数 | 涉及文件数 | 规则分布 | 报告文件 |\n`;
  summary += `|---------|--------|-----------|---------|----------|\n`;
  
  // 分离应用和包
  const appResults = results.filter(r => !r.appName.includes('packages'));
  const packageResults = results.filter(r => r.appName.includes('packages'));
  
  const sortedAppResults = appResults.sort((a, b) => b.totalErrors - a.totalErrors);
  sortedAppResults.forEach(result => {
    const ruleDist = Object.entries(result.errorsByRule || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // 只显示前5个规则
      .map(([rule, count]) => `${rule}:${count}`)
      .join(', ');
    
    const reportFileName = result.reportPath.split(/[\\/]/).pop();
    const status = result.totalErrors === 0 ? '✅' : '❌';
    
    summary += `| ${status} ${result.appName} | ${result.totalErrors} | ${result.fileCount} | ${ruleDist || '-'} | [${reportFileName}](./${reportFileName}) |\n`;
  });
  
  // 共享包统计（合并）
  if (packageResults.length > 0) {
    summary += `\n## 共享包错误统计（合并）\n\n`;
    summary += `| 包名称 | 错误数 | 涉及文件数 | 规则分布 | 报告文件 |\n`;
    summary += `|---------|--------|-----------|---------|----------|\n`;
    
    packageResults.forEach(result => {
      const ruleDist = Object.entries(result.errorsByRule || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([rule, count]) => `${rule}:${count}`)
        .join(', ');
      
      const reportFileName = result.reportPath.split(/[\\/]/).pop();
      const status = result.totalErrors === 0 ? '✅' : '❌';
      
      summary += `| ${status} ${result.appName} | ${result.totalErrors} | ${result.fileCount} | ${ruleDist || '-'} | [${reportFileName}](./${reportFileName}) |\n`;
    });
  }
  
  summary += `\n## 规则汇总\n\n`;
  
  const allRules = {};
  results.forEach(result => {
    if (result.errorsByRule) {
      Object.entries(result.errorsByRule).forEach(([rule, count]) => {
        allRules[rule] = (allRules[rule] || 0) + count;
      });
    }
  });
  
  const sortedRules = Object.entries(allRules)
    .sort((a, b) => b[1] - a[1]);
  
  summary += `| 规则名称 | 总数 |\n`;
  summary += `|---------|------|\n`;
  
  sortedRules.forEach(([rule, count]) => {
    summary += `| ${rule} | ${count} |\n`;
  });
  
  summary += `\n## 严重程度汇总\n\n`;
  
  const totalErrorsBySeverity = { error: 0, warning: 0 };
  results.forEach(result => {
    if (result.errorsBySeverity) {
      totalErrorsBySeverity.error += result.errorsBySeverity.error || 0;
      totalErrorsBySeverity.warning += result.errorsBySeverity.warning || 0;
    }
  });
  
  summary += `| 严重程度 | 总数 |\n`;
  summary += `|---------|------|\n`;
  summary += `| error | ${totalErrorsBySeverity.error} |\n`;
  summary += `| warning | ${totalErrorsBySeverity.warning} |\n`;
  
  writeFileSync(summaryPath, summary, 'utf-8');
  logger.info(`\n✅ 汇总报告已保存: ${summaryPath}`);
}

/**
 * 主函数
 */
async function main() {
  logger.info('开始生成 ESLint 错误报告...\n');
  logger.info(`输出目录: ${outputDir}\n`);

  // 清理旧日志文件
  cleanOutputDirectory();

  const results = [];
  const packageResults = [];

  // 处理应用（单独生成日志）
  logger.info('📱 正在检查应用...\n');
  for (const app of apps) {
    const result = await runLint(app);
    // 使用 packageName 作为显示名称
    result.appName = app.packageName || app.name;
    const errors = parseErrors(result.output, result.appName);
    const report = generateReport(result, errors, false);
    results.push(report);
    
    // 稍微延迟，避免过度占用资源
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 处理 configs 目录（单独生成日志）
  logger.info('\n📁 正在检查 configs 目录...\n');
  const configsResult = await runLint({ name: 'configs', pattern: 'configs/**/*.{ts,tsx}' });
  configsResult.appName = 'configs';
  const configsErrors = parseErrors(configsResult.output, 'configs');
  const configsReport = generateReport(configsResult, configsErrors, false);
  results.push(configsReport);

  // 处理共享包（收集数据，不单独生成文件，最后合并为一个文件）
  logger.info('\n📦 正在检查共享包...\n');
  for (const pkg of packages) {
    const result = await runLint(pkg);
    const errors = parseErrors(result.output, pkg.name);
    // 只收集数据，不生成单独文件
    packageResults.push({
      appName: pkg.name,
      totalErrors: errors.totalErrors,
      fileCount: Object.keys(errors.errorsByFile).length,
      errorsByRule: errors.errorsByRule,
      errorsBySeverity: errors.errorsBySeverity,
      errorsByFile: errors.errorsByFile,
      errors: errors,
      output: result.output
    });
    
    // 稍微延迟，避免过度占用资源
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 生成共享包的合并报告
  if (packageResults.length > 0) {
    const mergedPackageReport = generatePackagesReport(packageResults);
    results.push(mergedPackageReport);
  }

  generateSummaryReport(results);

  logger.info(`\n✅ 所有报告生成完成！`);
  logger.info(`📁 报告位置: ${outputDir}`);
  logger.info(`   - 应用报告: 每个应用单独一个文件`);
  logger.info(`   - 共享包报告: packages_errors.txt (合并)`);
}

main().catch(console.error);

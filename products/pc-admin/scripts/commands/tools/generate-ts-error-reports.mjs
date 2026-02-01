#!/usr/bin/env node
/**
 * 为每个应用单独运行类型检查并生成错误报告
 * 用法: node scripts/generate-ts-error-reports.mjs
 */
import { logger } from '../../utils/logger.mjs';

import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, readdirSync, unlinkSync, statSync, rmdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// 应用列表（单独生成日志）
// 注意：mobile-app 不参与类型检查
const apps = [
  'admin-app',
  'logistics-app',
  'system-app',
  'finance-app',
  'engineering-app',
  'quality-app',
  'production-app',
  'monitor-app',
  'layout-app',
  'docs-app',
  'personnel-app',  // 人事应用
  'dashboard-app',  // 看板应用
  'operations-app', // 运营应用
  'home-app',       // 首页应用
];

// 共享包列表（合并为一个日志文件）
const packages = [
  '@btc/shared-components',
  '@btc/shared-core',
  '@btc/shared-router',
  '@btc/vite-plugin'
];

// 输出目录（保存到 btc-shopflow-monorepo/ts-error-reports）
const outputDir = resolve(rootDir, 'ts-error-reports');

// TypeScript 错误代码官方含义映射表
// 参考: https://www.typescriptlang.org/docs/handbook/error-codes.html
const ERROR_CODE_DESCRIPTIONS = {
  'TS6133': '未使用的变量',
  'TS2307': '无法找到模块或其类型声明',
  'TS2353': '不能将类型 X 分配给类型 Y（类型不匹配）',
  'TS1005': '语法错误，预期标识符、字符串字面量、数字字面量或 \'}\' 来结束对象字面量（常见为缺少分号/等号）',
  'TS1128': '预期声明或语句（语句块中出现意外的标记）',
  'TS2305': '模块/命名空间中不存在指定的导出成员',
  'TS18048': '变量可能为 undefined（变量在赋值前被使用）',
  'TS2375': '异步函数中的 return 语句只能返回可分配给 \'Promise<void>\' 的值（异步函数返回类型不兼容）',
  'TS2345': '参数类型不匹配，"X"类型的参数不能赋给"Y"类型的参数',
  'TS6307': '文件未在 tsconfig.json 的项目文件列表中',
  'TS1136': '预期表达式（语句块中缺少必要的表达式）',
  'TS7006': '变量隐式具有 any 类型',
  'TS1180': '导入/导出声明中存在语法错误',
  'TS1434': '装饰器在此处无效（仅允许在类、方法、访问器、属性或参数上使用）',
  'TS2322': '类型不匹配，"X"类型不能分配给"Y"类型',
  'TS2551': '"Y"类型上不存在属性"x"，可能存在拼写错误',
  'TS2532': '对象可能为 undefined 或 null（访问可能为空的对象属性）',
  'TS6196': '导出的变量已声明但从未使用',
  'TS1109': '预期表达式（语句块中出现意外的标记，导致语句无法结束）',
  'TS1131': '预期属性赋值（应为标识符或关键字）',
  'TS2454': '变量在赋值前被使用',
  'TS1003': '预期标识符（语法错误，缺少必要的标识符）',
  'TS2304': '找不到名称/标识符（未定义的变量/类型）',
  'TS1011': '未终止的字符串文本（字符串字面量未正确闭合）',
  'TS2379': '条件类型的约束不能作用于非类型参数（条件类型约束不合法）',
  'TS2209': '命名空间中的导入声明不能引用模块（导入语句仅允许在模块顶层使用）'
};

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
 * 执行构建共享包命令
 */
function buildSharedPackages() {
  return new Promise((resolve, reject) => {
    const command = 'pnpm';
    const args = ['run', 'build:share'];
    
    logger.info('🔨 正在构建共享包（确保类型定义文件最新）...\n');
    
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
      // 实时输出构建信息
      process.stdout.write(text);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      // 实时输出错误信息
      process.stderr.write(text);
    });

    child.on('close', (code) => {
      if (code === 0) {
        logger.info('\n✅ 共享包构建完成\n');
        resolve();
      } else {
        logger.error('\n❌ 共享包构建失败，但继续执行类型检查...\n');
        // 即使构建失败也继续，因为可能已经有旧的构建产物
        resolve();
      }
    });

    child.on('error', (error) => {
      logger.error(`\n❌ 执行构建命令时出错: ${error.message}`);
      logger.error('继续执行类型检查...\n');
      // 即使出错也继续
      resolve();
    });
  });
}

/**
 * 运行类型检查并返回输出
 */
function runTypeCheck(appName) {
  return new Promise((resolve) => {
    const command = 'pnpm';
    const args = ['--filter', appName, 'type-check'];
    
    logger.info(`\n正在检查 ${appName}...`);
    
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
        appName,
        exitCode: code || 0,
        output: fullOutput,
        hasErrors: code !== 0
      });
    });

    child.on('error', (error) => {
      resolve({
        appName,
        exitCode: 1,
        output: `执行错误: ${error.message}`,
        hasErrors: true
      });
    });
  });
}

/**
 * 解析错误信息
 */
function parseErrors(output, appName) {
  const errors = [];
  const lines = output.split('\n');
  const errorRegex = /error TS(\d+)/;
  // 匹配文件路径和位置: 路径(行号,列号): error TS...
  const fileRegex = /^(.+?)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s*(.+)$/;
  // 匹配仅包含文件路径和位置的行: ../../path/to/file.ts(123,45):
  const fileLocationRegex = /^(.+?)\((\d+),(\d+)\):\s*$/;

  let errorCount = 0;
  let currentError = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 尝试完整匹配（文件路径+位置+错误）
    const fullMatch = line.match(fileRegex);
    if (fullMatch) {
      errorCount++;
      currentError = {
        path: fullMatch[1].trim(),
        line: parseInt(fullMatch[2]),
        column: parseInt(fullMatch[3]),
        errorCode: `TS${fullMatch[4]}`,
        message: fullMatch[5].trim()
      };
      errors.push(currentError);
      currentError = null;
      continue;
    }

    // 匹配文件路径和位置行（错误在下一行）
    const locationMatch = line.match(fileLocationRegex);
    if (locationMatch) {
      // 检查下一行是否有错误
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const errorMatch = nextLine.match(errorRegex);
        if (errorMatch) {
          errorCount++;
          currentError = {
            path: locationMatch[1].trim(),
            line: parseInt(locationMatch[2]),
            column: parseInt(locationMatch[3]),
            errorCode: `TS${errorMatch[1]}`,
            message: nextLine.substring(nextLine.indexOf('error')).trim()
          };
          errors.push(currentError);
          currentError = null;
          i++; // 跳过下一行，因为已经处理了
          continue;
        }
      }
    }

    // 单独的错误行（可能在某个应用的前缀之后）
    const errorMatch = line.match(errorRegex);
    if (errorMatch) {
      errorCount++;
      // 尝试从行中提取文件路径
      const pathMatch = line.match(/^([^(]+)\((\d+),(\d+)\)/);
      if (pathMatch) {
        currentError = {
          path: pathMatch[1].trim(),
          line: parseInt(pathMatch[2]),
          column: parseInt(pathMatch[3]),
          errorCode: `TS${errorMatch[1]}`,
          message: line.substring(line.indexOf('error')).trim()
        };
        errors.push(currentError);
        currentError = null;
      } else {
        // 没有文件路径，使用应用名作为路径标识
        currentError = {
          path: `${appName} - 未指定文件`,
          line: 0,
          column: 0,
          errorCode: `TS${errorMatch[1]}`,
          message: line.trim()
        };
        errors.push(currentError);
        currentError = null;
      }
    } else if (currentError && line.trim() && !line.match(/^\s*(at|Imported via|The file)/)) {
      // 继续收集错误消息的详细信息
      currentError.message += ' ' + line.trim();
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
      code: error.errorCode,
      message: error.message
    });
  });

  // 按错误代码统计
  const errorsByCode = {};
  errors.forEach(error => {
    errorsByCode[error.errorCode] = (errorsByCode[error.errorCode] || 0) + 1;
  });

  return {
    totalErrors: errorCount,
    errorsByFile,
    errorsByCode,
    allErrors: errors
  };
}

/**
 * 生成单个应用/包的报告
 */
function generateReport(result, errors, isPackage = false) {
  const appName = result.appName;
  const fileName = appName.replace('@btc/', '').replace(/-/g, '_');
  const reportPath = join(outputDir, `${fileName}_errors.txt`);
  
  let report = `============================================================\n`;
  report += `${appName} - TypeScript 类型错误报告\n`;
  report += `============================================================\n\n`;
  report += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
  report += `总错误数: ${errors.totalErrors}\n\n`;

  if (errors.totalErrors === 0) {
    report += `✅ 未发现类型错误\n`;
  } else {
    // 按错误代码统计
    report += `按错误代码分类:\n`;
    report += `------------------------------------------------------------\n`;
    const sortedCodes = Object.entries(errors.errorsByCode)
      .sort((a, b) => b[1] - a[1]);
    sortedCodes.forEach(([code, count]) => {
      const desc = ERROR_CODE_DESCRIPTIONS[code] || '查看官方文档';
      report += `  ${code.padEnd(10)}: ${count.toString().padStart(4)} 个 - ${desc}\n`;
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
        report += `    [${err.code}] 行 ${err.line}:${err.column} - ${err.message.split('\n')[0]}\n`;
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
      report += `  代码: ${error.errorCode}\n`;
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
    errorsByCode: errors.errorsByCode,
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
  const allErrorsByCode = {};
  const allErrorsByFile = {};
  let totalErrors = 0;
  
  packageResults.forEach(pkgResult => {
    totalErrors += pkgResult.totalErrors || 0;
    
    // 合并错误代码统计（检查是否存在）
    if (pkgResult.errorsByCode && typeof pkgResult.errorsByCode === 'object') {
      Object.entries(pkgResult.errorsByCode).forEach(([code, count]) => {
        allErrorsByCode[code] = (allErrorsByCode[code] || 0) + count;
      });
    }
    
    // 合并文件错误（添加包名前缀，检查是否存在）
    if (pkgResult.errorsByFile && typeof pkgResult.errorsByFile === 'object') {
      Object.entries(pkgResult.errorsByFile).forEach(([file, fileErrors]) => {
        const prefixedFile = `[${pkgResult.appName}] ${file}`;
        if (!allErrorsByFile[prefixedFile]) {
          allErrorsByFile[prefixedFile] = [];
        }
        allErrorsByFile[prefixedFile].push(...fileErrors);
      });
    }
    
    // 合并所有错误（添加包名信息，检查是否存在）
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
  report += `共享包 - TypeScript 类型错误合并报告\n`;
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
    report += `✅ 所有共享包均未发现类型错误\n`;
  } else {
    // 按错误代码统计
    report += `按错误代码分类:\n`;
    report += `------------------------------------------------------------\n`;
    const sortedCodes = Object.entries(allErrorsByCode)
      .sort((a, b) => b[1] - a[1]);
    sortedCodes.forEach(([code, count]) => {
      const desc = ERROR_CODE_DESCRIPTIONS[code] || '查看官方文档';
      report += `  ${code.padEnd(10)}: ${count.toString().padStart(4)} 个 - ${desc}\n`;
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
        report += `    [${err.code}] 行 ${err.line}:${err.column} - ${err.message.split('\n')[0]}\n`;
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
      report += `  代码: ${error.errorCode}\n`;
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
    errorsByCode: allErrorsByCode,
    reportPath
  };
}

/**
 * 生成汇总报告
 */
function generateSummaryReport(results) {
  const summaryPath = join(outputDir, 'SUMMARY.md');
  
  let summary = `# TypeScript 类型错误统计汇总\n\n`;
  summary += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  summary += `## 总体统计\n\n`;
  
  const totalErrors = results.reduce((sum, r) => sum + r.totalErrors, 0);
  const appsWithErrors = results.filter(r => r.totalErrors > 0).length;
  
  summary += `- **总应用数**: ${results.length}\n`;
  summary += `- **有错误的应用数**: ${appsWithErrors}\n`;
  summary += `- **总错误数**: ${totalErrors}\n\n`;
  
  summary += `## 应用错误统计\n\n`;
  summary += `| 应用名称 | 错误数 | 涉及文件数 | 错误代码分布 | 报告文件 |\n`;
  summary += `|---------|--------|-----------|-------------|----------|\n`;
  
  // 分离应用和包
  const appResults = results.filter(r => !r.appName.includes('packages'));
  const packageResults = results.filter(r => r.appName.includes('packages'));
  
  const sortedAppResults = appResults.sort((a, b) => b.totalErrors - a.totalErrors);
  sortedAppResults.forEach(result => {
    const codeDist = Object.entries(result.errorsByCode)
      .sort((a, b) => b[1] - a[1])
      .map(([code, count]) => `${code}:${count}`)
      .join(', ');
    
    const reportFileName = result.reportPath.split(/[\\/]/).pop();
    const status = result.totalErrors === 0 ? '✅' : '❌';
    
    summary += `| ${status} ${result.appName} | ${result.totalErrors} | ${result.fileCount} | ${codeDist || '-'} | [${reportFileName}](./${reportFileName}) |\n`;
  });
  
  // 共享包统计（合并）
  if (packageResults.length > 0) {
    summary += `\n## 共享包错误统计（合并）\n\n`;
    summary += `| 包名称 | 错误数 | 涉及文件数 | 错误代码分布 | 报告文件 |\n`;
    summary += `|---------|--------|-----------|-------------|----------|\n`;
    
    packageResults.forEach(result => {
      const codeDist = Object.entries(result.errorsByCode)
        .sort((a, b) => b[1] - a[1])
        .map(([code, count]) => `${code}:${count}`)
        .join(', ');
      
      const reportFileName = result.reportPath.split(/[\\/]/).pop();
      const status = result.totalErrors === 0 ? '✅' : '❌';
      
      summary += `| ${status} ${result.appName} | ${result.totalErrors} | ${result.fileCount} | ${codeDist || '-'} | [${reportFileName}](./${reportFileName}) |\n`;
    });
  }
  
  summary += `\n## 错误代码汇总\n\n`;
  
  const allErrorCodes = {};
  results.forEach(result => {
    Object.entries(result.errorsByCode).forEach(([code, count]) => {
      allErrorCodes[code] = (allErrorCodes[code] || 0) + count;
    });
  });
  
  const sortedCodes = Object.entries(allErrorCodes)
    .sort((a, b) => b[1] - a[1]);
  
  summary += `| 错误代码 | 总数 | 官方含义 |\n`;
  summary += `|---------|------|----------|\n`;
  
  sortedCodes.forEach(([code, count]) => {
      const desc = ERROR_CODE_DESCRIPTIONS[code];
      if (!desc) {
        // 对于未知的错误代码，提供查找链接
        summary += `| ${code} | ${count} | [查看官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html) |\n`;
      } else {
        summary += `| ${code} | ${count} | ${desc} |\n`;
      }
    });
  
  // 添加详细说明章节
  summary += `\n## 错误代码详细说明与解决方案\n\n`;
  summary += `> 参考: [TypeScript 错误代码官方文档](https://www.typescriptlang.org/docs/handbook/error-codes.html)\n\n`;
  
  // 根据用户提供的表格生成详细说明
  const errorCodeDetails = {
    'TS2305': {
      meaning: '模块/命名空间中不存在指定的导出成员（如导入了未导出的变量/类型/函数）',
      commonCauses: [
        '导入成员名称拼写/大小写错误',
        '模块导出语法错误（默认/命名导出混淆）',
        '第三方库类型声明缺失导出成员'
      ],
      solutions: [
        '核对模块实际导出的成员名（如 `export const fn` 而非 `export default fn`）',
        '为第三方库补全 `.d.ts` 声明',
        '检查导入路径是否指向正确模块'
      ]
    },
    'TS2614': {
      meaning: '模块无默认导出，或导入的命名空间对象无此导出成员（如 `import X from \'xxx\'` 但模块仅命名导出）',
      commonCauses: [
        '导入方式与导出方式不匹配（默认导入 ↔ 命名导出）',
        '类型声明未正确描述导出类型'
      ],
      solutions: [
        '修正导入语法（`import { X } from \'xxx\'` 替代 `import X from \'xxx\'`）',
        '补全模块默认导出声明（`declare module \'xxx\' { export default fn }`）'
      ]
    },
    'TS2307': {
      meaning: '无法找到模块或其类型声明',
      commonCauses: [
        '模块路径错误（相对/绝对路径写错）',
        '第三方库无 `@types/xxx` 类型包',
        '文件不在 `tsconfig.json` 的 `include` 范围内'
      ],
      solutions: [
        '校验路径（如 `./utils` 而非 `utils`）',
        '安装对应类型包（`npm i @types/lodash -D`）',
        '调整 `tsconfig.include` 为 `["src/**/*"]`'
      ]
    },
    'TS2339': {
      meaning: '对象上不存在该属性/方法',
      commonCauses: [
        '属性名拼写错误',
        '类型定义缺失该属性',
        '对象为 `null/undefined` 时访问属性'
      ],
      solutions: [
        '核对属性名（如 `user.name` 而非 `user.nam`）',
        '扩展类型接口（`interface User { newProp: string }`）',
        '非空断言（`obj!.prop`）或空值检查'
      ]
    },
    'TS7006': {
      meaning: '变量隐式具有 `any` 类型（未显式声明类型，且 TS 无法自动推断）',
      commonCauses: [
        '变量未声明类型且无初始值',
        '函数参数未标注类型',
        '`tsconfig` 关闭 `noImplicitAny` 但代码未适配'
      ],
      solutions: [
        '显式声明类型（`let num: number;`）',
        '为函数参数加类型（`function fn(x: string) {}`）',
        '临时用 `@ts-expect-error`（标注修复TODO）'
      ]
    },
    'TS2353': {
      meaning: '不能将类型 X 分配给类型 Y（重载参数不匹配/只读属性赋值/联合类型赋值错误）',
      commonCauses: [
        '重载函数调用参数类型不匹配',
        '给 `readonly` 属性赋值',
        '联合类型赋值未收窄'
      ],
      solutions: [
        '核对重载函数的参数类型',
        '移除只读属性的赋值操作',
        '类型断言临时解决（`x as Y`，优先调整类型设计）'
      ]
    },
    'TS6307': {
      meaning: '文件未在 `tsconfig.json` 的项目文件列表中',
      commonCauses: [
        '文件路径不在 `include` 范围内',
        '文件被 `exclude` 字段排除',
        '`files` 字段未显式包含该文件'
      ],
      solutions: [
        '调整 `include` 覆盖目标文件（`["src/**/*", "types/**/*"]`）',
        '检查 `exclude` 是否误排除（如排除了 `src/utils`）'
      ]
    },
    'TS2578': {
      meaning: '未使用的 `@ts-expect-error` 指令（注释标注了该指令，但当前行无类型错误）',
      commonCauses: [
        '修复代码错误后未删除注释',
        '`@ts-expect-error` 标注行本身无错误'
      ],
      solutions: [
        '立即删除无错误行的 `@ts-expect-error`',
        '核对标注行是否真的无错误（避免注释残留）'
      ]
    },
    'TS6059': {
      meaning: '文件不在项目根目录中，项目文件列表仅包含根目录文件',
      commonCauses: [
        '文件路径超出 `tsconfig.rootDir` 配置范围',
        '`rootDir` 配置错误'
      ],
      solutions: [
        '调整 `rootDir` 为源码根目录（`"rootDir": "./src"`）',
        '将文件移入 `rootDir` 范围内',
        '显式在 `files` 中添加该文件'
      ]
    }
  };
  
  // 生成详细说明（仅针对当前报告中出现的错误代码）
  const codesWithDetails = sortedCodes
    .filter(([code]) => errorCodeDetails[code])
    .map(([code]) => code);
  
  if (codesWithDetails.length > 0) {
    codesWithDetails.forEach(code => {
      const details = errorCodeDetails[code];
      summary += `### ${code}\n\n`;
      summary += `**官方含义**: ${details.meaning}\n\n`;
      summary += `**高频触发原因**:\n`;
      details.commonCauses.forEach(cause => {
        summary += `- ${cause}\n`;
      });
      summary += `\n**针对性解决方案**:\n`;
      details.solutions.forEach(solution => {
        summary += `- ${solution}\n`;
      });
      summary += `\n`;
    });
  }
  
  writeFileSync(summaryPath, summary, 'utf-8');
  logger.info(`\n✅ 汇总报告已保存: ${summaryPath}`);
}

/**
 * 主函数
 */
async function main() {
  logger.info('开始生成 TypeScript 类型错误报告...\n');
  logger.info(`输出目录: ${outputDir}\n`);

  // 清理旧日志文件
  cleanOutputDirectory();

  // 构建共享包，确保类型定义文件最新
  await buildSharedPackages();

  const results = [];
  const packageResults = [];

  // 处理应用（单独生成日志）
  logger.info('📱 正在检查应用...\n');
  for (const app of apps) {
    const result = await runTypeCheck(app);
    const errors = parseErrors(result.output, app);
    const report = generateReport(result, errors, false);
    results.push(report);
    
    // 稍微延迟，避免过度占用资源
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 处理共享包（收集数据，不单独生成文件，最后合并为一个文件）
  logger.info('\n📦 正在检查共享包...\n');
  for (const pkg of packages) {
    const result = await runTypeCheck(pkg);
    const errors = parseErrors(result.output, pkg);
    // 只收集数据，不生成单独文件
    packageResults.push({
      appName: pkg,
      totalErrors: errors.totalErrors,
      fileCount: Object.keys(errors.errorsByFile).length,
      errorsByCode: errors.errorsByCode,
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

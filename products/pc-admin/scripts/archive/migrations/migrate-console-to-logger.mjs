#!/usr/bin/env node

/**
 * 批量替换 console 调用为 logger 的自动化脚本
 * 
 * 用法:
 *   node scripts/migrate-console-to-logger.mjs              # 执行替换
 *   node scripts/migrate-console-to-logger.mjs --dry-run     # 预览模式
 *   node scripts/migrate-console-to-logger.mjs --dir apps    # 指定目录
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 配置
const CONFIG = {
  // 排除的文件模式
  excludedPatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/dist-cdn/**',
    '**/*.d.ts',
    '**/*.md',
    // 用于拦截的 console（需要保留）
    '**/subappErrorCapture.ts',
    '**/useQiankunLogFilter.ts',
    // 日志模块自身
    '**/logger/**/*.ts',
    '**/logger/**/*.vue',
    '**/logger/**/*.js',
    // 文档中的示例代码
    '**/README.md',
    '**/LOGGING_LIBRARY_ANALYSIS.md',
  ],
  // 需要处理的文件扩展名
  extensions: ['.ts', '.vue', '.js', '.mjs'],
  // 排除的目录
  excludedDirs: ['node_modules', 'dist', 'dist-cdn', '.git', '.cursor', 'scripts'],
};

// 统计信息
const stats = {
  filesScanned: 0,
  filesModified: 0,
  replacements: 0,
  skippedFiles: [],
  errors: [],
};

/**
 * 检查文件是否应该被排除
 */
function shouldExcludeFile(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  
  // 检查排除模式
  for (const pattern of CONFIG.excludedPatterns) {
    // 简单的通配符匹配
    const regex = new RegExp(
      '^' + pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\//g, '/') + '$'
    );
    if (regex.test(relativePath)) {
      return true;
    }
  }
  
  // 检查是否在排除的目录中
  const parts = relativePath.split('/');
  for (const dir of CONFIG.excludedDirs) {
    if (parts.includes(dir)) {
      return true;
    }
  }
  
  // 特殊检查：logger 目录下的文件（避免循环依赖）
  if (relativePath.includes('/logger/') || relativePath.includes('\\logger\\')) {
    return true;
  }
  
  return false;
}

/**
 * 检查文件是否包含用于拦截的 console（需要保留）
 */
function hasConsoleInterception(code) {
  // 检查是否有 console.warn = 或 console.error = 等赋值操作
  return /console\.(warn|error|log|info|debug)\s*=/.test(code);
}

/**
 * 替换 console 调用
 */
function replaceConsoleCalls(code) {
  let modified = code;
  let count = 0;
  
  // console.log -> logger.info
  const logMatches = code.match(/console\.log\s*\(/g);
  if (logMatches) {
    count += logMatches.length;
    modified = modified.replace(/console\.log\s*\(/g, 'logger.info(');
  }
  
  // console.info -> logger.info
  const infoMatches = code.match(/console\.info\s*\(/g);
  if (infoMatches) {
    count += infoMatches.length;
    modified = modified.replace(/console\.info\s*\(/g, 'logger.info(');
  }
  
  // console.debug -> logger.debug
  const debugMatches = code.match(/console\.debug\s*\(/g);
  if (debugMatches) {
    count += debugMatches.length;
    modified = modified.replace(/console\.debug\s*\(/g, 'logger.debug(');
  }
  
  // console.warn -> logger.warn
  const warnMatches = code.match(/console\.warn\s*\(/g);
  if (warnMatches) {
    count += warnMatches.length;
    modified = modified.replace(/console\.warn\s*\(/g, 'logger.warn(');
  }
  
  // console.error -> logger.error
  const errorMatches = code.match(/console\.error\s*\(/g);
  if (errorMatches) {
    count += errorMatches.length;
    modified = modified.replace(/console\.error\s*\(/g, 'logger.error(');
  }
  
  return { modified, count };
}

/**
 * 检查是否已有 logger 导入
 */
function hasLoggerImport(code) {
  // 检查各种导入模式
  const patterns = [
    /import\s+.*\b(logger)\b.*from\s+['"]@btc\/shared-core['"]/,
    /import\s+.*\b(logger)\b.*from\s+['"]@btc\/shared-core\/utils\/logger['"]/,
    /import\s+.*\b(logger)\b.*from\s+['"]@btc\/shared-core\/utils['"]/,
    /import\s+.*\b(logger)\b.*from\s+['"]\.\.\/.*logger['"]/,
    /import\s+.*\b(logger)\b.*from\s+['"]\.\/.*logger['"]/,
  ];
  
  return patterns.some(pattern => pattern.test(code));
}

/**
 * 添加 logger 导入语句
 */
function addLoggerImport(code, filePath) {
  // 如果已有导入，直接返回
  if (hasLoggerImport(code)) {
    return code;
  }
  
  const isVueFile = filePath.endsWith('.vue');
  
  if (isVueFile) {
    // Vue 文件：在 <script> 标签中添加
    const scriptMatch = code.match(/<script[^>]*>/);
    if (!scriptMatch) {
      return code; // 没有 script 标签，跳过
    }
    
    const scriptTag = scriptMatch[0];
    const scriptIndex = code.indexOf(scriptTag) + scriptTag.length;
    const scriptContent = code.substring(scriptIndex);
    
    // 查找所有 import 语句
    const importRegex = /import\s+([^'"]+)\s+from\s+['"]([^'"]+)['"];?/g;
    let lastImportEnd = scriptIndex;
    let foundSharedCoreImport = false;
    let match;
    
    while ((match = importRegex.exec(scriptContent)) !== null) {
      const importStatement = match[0];
      const importSource = match[2];
      const importEnd = scriptIndex + match.index + importStatement.length;
      
      // 检查是否是 @btc/shared-core 导入
      if (importSource === '@btc/shared-core' || importSource.includes('@btc/shared-core')) {
        foundSharedCoreImport = true;
        const imports = match[1].trim();
        
        // 检查是否已有 logger
        if (imports.includes('logger')) {
          return code; // 已有 logger，不需要添加
        }
        
        // 在现有导入中添加 logger
        if (imports.startsWith('{') && imports.endsWith('}')) {
          // 命名导入
          const importList = imports.slice(1, -1).trim();
          const newImportList = `{ ${importList}, logger }`;
          const newImport = importStatement.replace(imports, newImportList);
          return code.substring(0, scriptIndex + match.index) + newImport + code.substring(importEnd);
        } else {
          // 默认导入，需要改为命名导入
          const newImport = importStatement.replace(imports, `{ ${imports}, logger }`);
          return code.substring(0, scriptIndex + match.index) + newImport + code.substring(importEnd);
        }
      }
      
      lastImportEnd = importEnd;
    }
    
    // 没有找到 @btc/shared-core 导入，添加新的导入语句
    if (lastImportEnd > scriptIndex) {
      // 在最后一个 import 之后添加
      const newImport = "\nimport { logger } from '../../../utils/logger.mjs';\n";
      return code.substring(0, lastImportEnd) + newImport + code.substring(lastImportEnd);
    } else {
      // 没有 import，在 script 标签后添加
      const newImport = "\nimport { logger } from '../../../utils/logger.mjs';\n";
      return code.substring(0, scriptIndex) + newImport + code.substring(scriptIndex);
    }
  } else {
    // TypeScript/JavaScript 文件
    // 查找第一个 import 语句
    const importMatch = code.match(/^[\s\n]*import\s+/m);
    if (importMatch) {
      const importIndex = importMatch.index;
      const importEnd = code.indexOf(';', importIndex);
      if (importEnd > importIndex) {
        const importLine = code.substring(importIndex, importEnd + 1);
        
        // 检查是否是 @btc/shared-core 导入
        if (importLine.includes('@btc/shared-core')) {
          // 在现有导入中添加 logger
          if (!importLine.includes('logger')) {
            const updatedImport = importLine.replace(
              /\{([^}]+)\}/,
              (_, imports) => {
                return `{ ${imports.trim()}, logger }`;
              }
            );
            return code.substring(0, importIndex) + updatedImport + code.substring(importEnd + 1);
          }
        } else {
          // 添加新的导入语句
          const newImport = "import { logger } from '@build-utils/logger';\n";
          return code.substring(0, importIndex) + newImport + code.substring(importIndex);
        }
      }
    } else {
      // 没有 import，在文件开头添加
      const newImport = "import { logger } from '@build-utils/logger';\n";
      return newImport + code;
    }
  }
  
  return code;
}

/**
 * 处理单个文件
 */
function processFile(filePath, dryRun = false) {
  try {
    stats.filesScanned++;
    
    // 检查是否应该排除
    if (shouldExcludeFile(filePath)) {
      stats.skippedFiles.push({ file: filePath, reason: 'excluded pattern' });
      return;
    }
    
    // 读取文件内容
    const code = fs.readFileSync(filePath, 'utf-8');
    
    // 检查是否包含用于拦截的 console（需要保留）
    if (hasConsoleInterception(code)) {
      stats.skippedFiles.push({ file: filePath, reason: 'console interception' });
      return;
    }
    
    // 检查是否有 console 调用
    if (!/console\.(log|info|debug|warn|error)\s*\(/.test(code)) {
      return; // 没有 console 调用，跳过
    }
    
    // 替换 console 调用
    const { modified: codeAfterReplace, count } = replaceConsoleCalls(code);
    
    if (count === 0) {
      return; // 没有替换任何内容
    }
    
    // 添加 logger 导入
    const finalCode = addLoggerImport(codeAfterReplace, filePath);
    
    // 如果内容有变化，保存文件
    if (finalCode !== code) {
      if (!dryRun) {
        fs.writeFileSync(filePath, finalCode, 'utf-8');
      }
      stats.filesModified++;
      stats.replacements += count;
      console.log(`  ${dryRun ? '[DRY RUN] ' : ''}✓ ${path.relative(ROOT_DIR, filePath)} (${count} replacements)`);
    }
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`  ✗ Error processing ${path.relative(ROOT_DIR, filePath)}: ${error.message}`);
  }
}

/**
 * 递归扫描目录
 */
function scanDirectory(dir, dryRun = false) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // 跳过排除的目录
    if (entry.isDirectory() && CONFIG.excludedDirs.includes(entry.name)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      // 递归扫描子目录
      scanDirectory(fullPath, dryRun);
    } else if (entry.isFile()) {
      // 检查文件扩展名
      const ext = path.extname(entry.name);
      if (CONFIG.extensions.includes(ext)) {
        processFile(fullPath, dryRun);
      }
    }
  }
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const dirIndex = args.indexOf('--dir');
  const targetDir = dirIndex >= 0 && args[dirIndex + 1] 
    ? path.resolve(ROOT_DIR, args[dirIndex + 1])
    : ROOT_DIR;
  
  console.log('🚀 Console to Logger Migration Script');
  console.log('=====================================\n');
  
  if (dryRun) {
    console.log('📋 DRY RUN MODE - No files will be modified\n');
  }
  
  if (targetDir !== ROOT_DIR) {
    console.log(`📁 Target directory: ${path.relative(ROOT_DIR, targetDir)}\n`);
  }
  
  console.log('Scanning files...\n');
  
  // 扫描目录
  if (fs.existsSync(targetDir)) {
    if (fs.statSync(targetDir).isDirectory()) {
      scanDirectory(targetDir, dryRun);
    } else {
      // 单个文件
      processFile(targetDir, dryRun);
    }
  } else {
    console.error(`Error: Directory not found: ${targetDir}`);
    process.exit(1);
  }
  
  // 输出统计信息
  console.log('\n' + '='.repeat(50));
  console.log('📊 Statistics');
  console.log('='.repeat(50));
  console.log(`Files scanned:     ${stats.filesScanned}`);
  console.log(`Files modified:    ${stats.filesModified}`);
  console.log(`Total replacements: ${stats.replacements}`);
  console.log(`Skipped files:     ${stats.skippedFiles.length}`);
  console.log(`Errors:            ${stats.errors.length}`);
  
  if (stats.skippedFiles.length > 0) {
    console.log('\n📝 Skipped files:');
    const grouped = {};
    for (const item of stats.skippedFiles) {
      if (!grouped[item.reason]) {
        grouped[item.reason] = [];
      }
      grouped[item.reason].push(item.file);
    }
    for (const [reason, files] of Object.entries(grouped)) {
      console.log(`\n  ${reason}:`);
      files.slice(0, 10).forEach(file => {
        console.log(`    - ${path.relative(ROOT_DIR, file)}`);
      });
      if (files.length > 10) {
        console.log(`    ... and ${files.length - 10} more`);
      }
    }
  }
  
  if (stats.errors.length > 0) {
    console.log('\n❌ Errors:');
    stats.errors.forEach(({ file, error }) => {
      console.log(`  - ${path.relative(ROOT_DIR, file)}: ${error}`);
    });
  }
  
  if (dryRun) {
    console.log('\n💡 Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ Migration completed!');
    console.log('💡 Next steps:');
    console.log('   1. Run: pnpm lint');
    console.log('   2. Run: pnpm type-check');
    console.log('   3. Review changes and test');
  }
}

// 执行主函数
main();

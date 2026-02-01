#!/usr/bin/env node

/**
 * 批量替换项目中的 console.error 为 logger.error
 * 并确保所有文件都正确导入 logger
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 需要处理的文件类型
const filePatterns = [
  'apps/**/src/**/*.ts',
  'apps/**/src/**/*.tsx',
  'apps/**/src/**/*.vue',
  'packages/**/src/**/*.ts',
  'packages/**/src/**/*.tsx',
  'packages/**/src/**/*.vue',
];

// 需要排除的文件和目录
const excludePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/*.d.ts',
  '**/logger/**/*', // 排除 logger 模块本身
  '**/error-reporter/**/*', // 排除 error-reporter 模块
  '**/log-reporter/**/*', // 排除 log-reporter 模块
  '**/transports/**/*', // 排除 transports 模块
  '**/scripts/**/*', // 排除脚本文件
];

/**
 * 检查文件中是否已经有 logger 导入
 */
function hasLoggerImport(code) {
  const patterns = [
    /import\s*{\s*[^}]*\blogger\b[^}]*}\s*from\s*['"]@btc\/shared-core['"]/,
    /import\s+logger\s+from\s*['"]@btc\/shared-core['"]/,
    /import\s*{\s*logger\s*}\s*from\s*['"]@btc\/shared-core['"]/,
  ];
  return patterns.some(pattern => pattern.test(code));
}

/**
 * 添加 logger 导入语句
 */
function addLoggerImport(code, filePath) {
  if (hasLoggerImport(code)) {
    return code;
  }

  const isVueFile = filePath.endsWith('.vue');

  if (isVueFile) {
    // Vue 文件：在 <script> 标签中添加
    const scriptMatch = code.match(/<script[^>]*>/);
    if (!scriptMatch) {
      return code;
    }

    const scriptTag = scriptMatch[0];
    const scriptIndex = code.indexOf(scriptTag) + scriptTag.length;
    const scriptContent = code.substring(scriptIndex);
    const endScriptIndex = scriptContent.indexOf('</script>');
    if (endScriptIndex === -1) {
      return code;
    }

    const actualScriptContent = scriptContent.substring(0, endScriptIndex);

    // 查找所有 import 语句
    const importRegex = /import\s+([^'"]+)\s+from\s+['"]([^'"]+)['"];?/g;
    let lastImportEnd = scriptIndex;
    let foundSharedCoreImport = false;
    let match;
    const matches = [];

    while ((match = importRegex.exec(actualScriptContent)) !== null) {
      matches.push({
        statement: match[0],
        source: match[2],
        imports: match[1].trim(),
        index: match.index,
        end: match.index + match[0].length,
      });
    }

    // 查找 @btc/shared-core 的导入
    for (const m of matches) {
      if (m.source === '@btc/shared-core' || m.source.includes('@btc/shared-core')) {
        foundSharedCoreImport = true;
        lastImportEnd = scriptIndex + m.end;

        // 检查是否已有 logger
        if (m.imports.includes('logger')) {
          return code; // 已有 logger，不需要添加
        }

        // 在现有导入中添加 logger
        if (m.imports.startsWith('{') && m.imports.endsWith('}')) {
          // 命名导入
          const importList = m.imports.slice(1, -1).trim();
          const newImportList = `{ ${importList}, logger }`;
          const newImport = m.statement.replace(m.imports, newImportList);
          return (
            code.substring(0, scriptIndex + m.index) +
            newImport +
            code.substring(scriptIndex + m.end)
          );
        }
      } else {
        lastImportEnd = scriptIndex + m.end;
      }
    }

    // 如果没有找到 @btc/shared-core 导入，在最后一个 import 后添加
    if (!foundSharedCoreImport && matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      const insertPos = scriptIndex + lastMatch.end;
      return (
        code.substring(0, insertPos) +
        `\nimport { logger } from '@btc/shared-core';` +
        code.substring(insertPos)
      );
    }

    // 如果没有 import 语句，在 script 标签后添加
    if (matches.length === 0) {
      return (
        code.substring(0, scriptIndex) +
        `\nimport { logger } from '@btc/shared-core';\n` +
        code.substring(scriptIndex)
      );
    }

    return code;
  } else {
    // TS/TSX 文件：在文件开头添加
    const importRegex = /import\s+([^'"]+)\s+from\s+['"]([^'"]+)['"];?/g;
    let lastImportEnd = 0;
    let foundSharedCoreImport = false;
    let match;
    const matches = [];

    while ((match = importRegex.exec(code)) !== null) {
      matches.push({
        statement: match[0],
        source: match[2],
        imports: match[1].trim(),
        index: match.index,
        end: match.index + match[0].length,
      });
    }

    // 查找 @btc/shared-core 的导入
    for (const m of matches) {
      if (m.source === '@btc/shared-core' || m.source.includes('@btc/shared-core')) {
        foundSharedCoreImport = true;
        lastImportEnd = m.end;

        // 检查是否已有 logger
        if (m.imports.includes('logger')) {
          return code; // 已有 logger，不需要添加
        }

        // 在现有导入中添加 logger
        if (m.imports.startsWith('{') && m.imports.endsWith('}')) {
          // 命名导入
          const importList = m.imports.slice(1, -1).trim();
          const newImportList = `{ ${importList}, logger }`;
          const newImport = m.statement.replace(m.imports, newImportList);
          return code.substring(0, m.index) + newImport + code.substring(m.end);
        }
      } else {
        lastImportEnd = m.end;
      }
    }

    // 如果没有找到 @btc/shared-core 导入，在最后一个 import 后添加
    if (!foundSharedCoreImport && matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      return (
        code.substring(0, lastMatch.end) +
        `\nimport { logger } from '@btc/shared-core';` +
        code.substring(lastMatch.end)
      );
    }

    // 如果没有 import 语句，在文件开头添加
    if (matches.length === 0) {
      return `import { logger } from '@btc/shared-core';\n${code}`;
    }

    return code;
  }
}

/**
 * 替换 console.error 为 logger.error
 */
function replaceConsoleError(code) {
  let modified = false;
  let newCode = code;

  // 替换 console.error(...) 为 logger.error(...)
  // 匹配 console.error(...) 的各种形式
  const patterns = [
    // console.error('message')
    // console.error('message', error)
    // console.error('message', error, ...args)
    {
      pattern: /console\.error\(/g,
      replacement: 'logger.error(',
    },
  ];

  for (const { pattern, replacement } of patterns) {
    const matches = newCode.match(pattern);
    if (matches) {
      newCode = newCode.replace(pattern, replacement);
      modified = true;
    }
  }

  return { code: newCode, modified };
}

/**
 * 处理单个文件
 */
async function processFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');

    // 检查是否包含 console.error
    if (!/console\.error\(/.test(content)) {
      return { filePath, modified: false, reason: 'no console.error found' };
    }

    // 替换 console.error 为 logger.error
    const { code: codeAfterReplace, modified: replaced } = replaceConsoleError(content);

    if (!replaced) {
      return { filePath, modified: false, reason: 'replacement failed' };
    }

    // 添加 logger 导入（如果需要）
    const finalCode = addLoggerImport(codeAfterReplace, filePath);

    // 如果代码有变化，写入文件
    if (finalCode !== content) {
      writeFileSync(filePath, finalCode, 'utf-8');
      return { filePath, modified: true, reason: 'success' };
    }

    return { filePath, modified: false, reason: 'no changes needed' };
  } catch (error) {
    return { filePath, modified: false, reason: `error: ${error.message}` };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('开始批量替换 console.error 为 logger.error...\n');

  const allFiles = [];
  for (const pattern of filePatterns) {
    const files = await glob(pattern, {
      cwd: rootDir,
      ignore: excludePatterns,
      absolute: true,
    });
    allFiles.push(...files);
  }

  const uniqueFiles = [...new Set(allFiles)];
  console.log(`找到 ${uniqueFiles.length} 个文件\n`);

  const results = [];
  for (const file of uniqueFiles) {
    const result = await processFile(file);
    results.push(result);
    if (result.modified) {
      console.log(`✓ ${file.replace(rootDir, '')}`);
    }
  }

  const modifiedCount = results.filter(r => r.modified).length;
  console.log(`\n完成！共处理 ${uniqueFiles.length} 个文件，修改了 ${modifiedCount} 个文件`);
}

main().catch(console.error);

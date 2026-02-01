#!/usr/bin/env node

/**
 * 批量替换主应用中的 logger 为 console
 * 用于解决 Winston 导致的内存泄漏问题
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const mainAppDir = join(__dirname, '..');

// 需要处理的文件类型
const filePatterns = [
  'src/**/*.ts',
  'src/**/*.vue',
  'src/**/*.js',
];

// 需要排除的文件
const excludePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/*.d.ts',
];

async function replaceLoggerInFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;

    // 替换导入语句：移除 logger
    const importPatterns = [
      // import { logger, ... } from '@btc/shared-core'
      {
        pattern: /import\s*{\s*logger\s*,\s*([^}]+)\s*}\s*from\s*['"]@btc\/shared-core['"]/g,
        replacement: (match, rest) => {
          const cleaned = rest.split(',').filter(item => !item.trim().match(/^logger$/)).join(',');
          if (cleaned.trim()) {
            return `import { ${cleaned} } from '@btc/shared-core'`;
          } else {
            return ''; // 如果只有 logger，移除整个导入
          }
        }
      },
      // import { logger } from '@btc/shared-core'
      {
        pattern: /import\s*{\s*logger\s*}\s*from\s*['"]@btc\/shared-core['"]/g,
        replacement: ''
      },
      // import logger from '@btc/shared-core'
      {
        pattern: /import\s+logger\s+from\s*['"]@btc\/shared-core['"]/g,
        replacement: ''
      },
      // import { useI18n, logger } from '@btc/shared-core'
      {
        pattern: /import\s*{\s*useI18n\s*,\s*logger\s*}\s*from\s*['"]@btc\/shared-core['"]/g,
        replacement: "import { useI18n } from '@btc/shared-core'"
      },
    ];

    // 替换导入
    for (const { pattern, replacement } of importPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, typeof replacement === 'function' 
          ? (match) => {
              const result = replacement(match, match);
              return result;
            }
          : replacement);
        modified = true;
      }
    }

    // 替换 logger 调用
    const loggerMethods = ['info', 'warn', 'error', 'debug', 'log'];
    for (const method of loggerMethods) {
      // logger.method(...) -> console.method(...)
      const pattern = new RegExp(`logger\\.${method}\\s*\\(`, 'g');
      if (pattern.test(content)) {
        content = content.replace(pattern, `console.${method}(`);
        modified = true;
      }
    }

    if (modified) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ 已替换: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔄 开始替换主应用中的 logger...\n');

  const files = [];
  for (const pattern of filePatterns) {
    const matches = await glob(pattern, {
      cwd: mainAppDir,
      ignore: excludePatterns,
      absolute: true,
    });
    files.push(...matches);
  }

  console.log(`📁 找到 ${files.length} 个文件需要检查\n`);

  let replacedCount = 0;
  for (const file of files) {
    if (await replaceLoggerInFile(file)) {
      replacedCount++;
    }
  }

  console.log(`\n✨ 完成！共替换了 ${replacedCount} 个文件`);
}

main().catch(console.error);

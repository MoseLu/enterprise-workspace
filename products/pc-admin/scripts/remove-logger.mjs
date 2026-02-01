#!/usr/bin/env node

/**
 * 批量移除 logger 并将所有 logger 调用替换为 console
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
  'packages/**/*.ts',
  'packages/**/*.vue',
  'apps/**/*.ts',
  'apps/**/*.vue',
  'configs/**/*.ts',
  'auth/**/*.ts',
  'auth/**/*.vue',
];

// 需要排除的文件和目录
const excludePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/*.d.ts',
  '**/logger/**/*', // 排除 logger 模块本身
  '**/remove-logger.mjs',
  '**/replace-logger.mjs',
];

async function processFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;

    // 1. 移除 logger 导入
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
      // import { logger } from '../utils/logger'
      {
        pattern: /import\s*{\s*logger\s*}\s*from\s*['"](?:\.\.?\/)*utils\/logger['"]/g,
        replacement: ''
      },
      // import { logger } from '../../../utils/logger'
      {
        pattern: /import\s*{\s*logger\s*,\s*([^}]+)\s*}\s*from\s*['"](?:\.\.?\/)*utils\/logger['"]/g,
        replacement: (match, rest) => {
          const cleaned = rest.split(',').filter(item => !item.trim().match(/^logger$/)).join(',');
          if (cleaned.trim()) {
            return `import { ${cleaned} } from '../utils/logger'`;
          } else {
            return '';
          }
        }
      },
      // import logger from '../utils/logger'
      {
        pattern: /import\s+logger\s+from\s*['"](?:\.\.?\/)*utils\/logger['"]/g,
        replacement: ''
      },
    ];

    // 移除导入
    for (const { pattern, replacement } of importPatterns) {
      if (typeof replacement === 'function') {
        const newContent = content.replace(pattern, (match, ...args) => {
          const result = replacement(match, ...args);
          return result;
        });
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      } else {
        const newContent = content.replace(pattern, replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }
    }
    
    // 处理更复杂的导入情况：logger 在中间
    // import { useI18n, logger, usePageColumns } from '@btc/shared-core'
    const complexPattern = /import\s*{\s*([^}]*logger[^}]*)\s*}\s*from\s*['"]@btc\/shared-core['"]/g;
    const newContent2 = content.replace(complexPattern, (match, imports) => {
      const cleaned = imports.split(',').filter(item => !item.trim().match(/^logger$/)).join(',').trim();
      if (cleaned) {
        return `import { ${cleaned} } from '@btc/shared-core'`;
      } else {
        return '';
      }
    });
    if (newContent2 !== content) {
      content = newContent2;
      modified = true;
    }

    // 2. 替换 logger 调用为 console
    const loggerCallPatterns = [
      // logger.debug(...) -> console.debug(...)
      { pattern: /logger\.debug\(/g, replacement: 'console.debug(' },
      // logger.info(...) -> console.info(...)
      { pattern: /logger\.info\(/g, replacement: 'console.info(' },
      // logger.warn(...) -> console.warn(...)
      { pattern: /logger\.warn\(/g, replacement: 'console.warn(' },
      // logger.error(...) -> console.error(...)
      { pattern: /logger\.error\(/g, replacement: 'console.error(' },
      // logger.fatal(...) -> console.error(...) (fatal 也使用 error)
      { pattern: /logger\.fatal\(/g, replacement: 'console.error(' },
      // logger.child(...) -> console (忽略 child)
      { pattern: /logger\.child\(/g, replacement: 'console.child(' }, // 先替换，稍后会报错，需要手动处理
      // logger.setLevel(...) -> // logger.setLevel removed
      { pattern: /logger\.setLevel\([^)]*\)/g, replacement: '// logger.setLevel removed' },
      // logger.getLevel() -> 'info'
      { pattern: /logger\.getLevel\(\)/g, replacement: "'info'" },
    ];

    for (const { pattern, replacement } of loggerCallPatterns) {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }

    // 3. 清理空导入行
    content = content.replace(/^import\s*{\s*}\s*from\s*['"][^'"]+['"];?\s*\n/gm, '');

    // 4. 清理多余空行（连续3个以上空行变为2个）
    content = content.replace(/\n{4,}/g, '\n\n\n');

    if (modified) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ 已处理: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ 处理失败: ${filePath}`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 开始批量移除 logger...\n');

  let processedCount = 0;
  let totalCount = 0;

  for (const pattern of filePatterns) {
    const files = await glob(pattern, {
      cwd: rootDir,
      ignore: excludePatterns,
      absolute: true,
    });

    totalCount += files.length;

    for (const file of files) {
      if (await processFile(file)) {
        processedCount++;
      }
    }
  }

  console.log(`\n✨ 处理完成！`);
  console.log(`   - 扫描文件: ${totalCount}`);
  console.log(`   - 修改文件: ${processedCount}`);
}

main().catch(console.error);

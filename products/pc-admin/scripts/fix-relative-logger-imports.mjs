#!/usr/bin/env node

/**
 * 修复相对路径的 logger 导入
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 处理 shared-core 内部的相对路径导入
const filePatterns = [
  'packages/shared-core/src/**/*.ts',
  'packages/shared-core/src/**/*.vue',
];

const excludePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/*.d.ts',
  '**/logger/**/*', // 排除 logger 模块本身
];

async function processFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;

    // 移除相对路径的 logger 导入
    const importPatterns = [
      // import { logger } from './logger'
      {
        pattern: /import\s*{\s*logger\s*,\s*([^}]+)\s*}\s*from\s*['"]\.\.?\/(.*\/)?logger['"]/g,
        replacement: (match, rest) => {
          const cleaned = rest.split(',').filter(item => !item.trim().match(/^logger$/)).join(',');
          if (cleaned.trim()) {
            return `import { ${cleaned} } from './logger'`;
          } else {
            return '';
          }
        }
      },
      // import { logger } from './logger'
      {
        pattern: /import\s*{\s*logger\s*}\s*from\s*['"]\.\.?\/(.*\/)?logger['"]/g,
        replacement: ''
      },
      // import logger from './logger'
      {
        pattern: /import\s+logger\s+from\s*['"]\.\.?\/(.*\/)?logger['"]/g,
        replacement: ''
      },
      // import { logger } from '../logger'
      {
        pattern: /import\s*{\s*logger\s*,\s*([^}]+)\s*}\s*from\s*['"]\.\.\/logger['"]/g,
        replacement: (match, rest) => {
          const cleaned = rest.split(',').filter(item => !item.trim().match(/^logger$/)).join(',');
          if (cleaned.trim()) {
            return `import { ${cleaned} } from '../logger'`;
          } else {
            return '';
          }
        }
      },
      // import { logger } from '../logger'
      {
        pattern: /import\s*{\s*logger\s*}\s*from\s*['"]\.\.\/logger['"]/g,
        replacement: ''
      },
      // import logger from '../logger'
      {
        pattern: /import\s+logger\s+from\s*['"]\.\.\/logger['"]/g,
        replacement: ''
      },
      // import { logger } from '../../logger'
      {
        pattern: /import\s*{\s*logger\s*,\s*([^}]+)\s*}\s*from\s*['"]\.\.\/\.\.\/logger['"]/g,
        replacement: (match, rest) => {
          const cleaned = rest.split(',').filter(item => !item.trim().match(/^logger$/)).join(',');
          if (cleaned.trim()) {
            return `import { ${cleaned} } from '../../logger'`;
          } else {
            return '';
          }
        }
      },
      // import { logger } from '../../logger'
      {
        pattern: /import\s*{\s*logger\s*}\s*from\s*['"]\.\.\/\.\.\/logger['"]/g,
        replacement: ''
      },
      // import logger from '../../logger'
      {
        pattern: /import\s+logger\s+from\s*['"]\.\.\/\.\.\/logger['"]/g,
        replacement: ''
      },
    ];

    // 移除导入
    for (const { pattern, replacement } of importPatterns) {
      if (typeof replacement === 'function') {
        const newContent = content.replace(pattern, replacement);
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

    // 清理空导入行
    content = content.replace(/^import\s*{\s*}\s*from\s*['"][^'"]+['"];?\s*\n/gm, '');

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
  console.log('🚀 开始修复相对路径 logger 导入...\n');

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

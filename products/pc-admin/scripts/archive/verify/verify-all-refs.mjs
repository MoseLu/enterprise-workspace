#!/usr/bin/env node

/**
 * 完整验证管理应用构建产物中的所有引用
 */
import { logger } from '../../../utils/logger.mjs';

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const appDistDir = join(rootDir, 'apps', 'admin-app', 'dist');
const assetsDir = join(appDistDir, 'assets');

logger.info('🔍 完整验证管理应用构建产物中的所有引用\n');
logger.info('='.repeat(60));

if (!existsSync(appDistDir)) {
  logger.error('❌ 构建产物目录不存在:', appDistDir);
  process.exit(1);
}

// 收集所有实际存在的文件
const actualFiles = new Set();
const fileMap = new Map(); // baseName.ext -> actualFileName

function collectFiles(dir) {
  if (!existsSync(dir)) {
    return;
  }
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.css') || entry.name.endsWith('.mjs'))) {
      actualFiles.add(entry.name);
      
      // 建立映射
      const match = entry.name.match(/^(.+?)-([A-Za-z0-9]{8,})\.(js|css|mjs)$/);
      if (match) {
        const [, baseName, , ext] = match;
        const key = `${baseName}.${ext}`;
        if (!fileMap.has(key) || entry.name > fileMap.get(key)) {
          fileMap.set(key, entry.name);
        }
      }
    }
  }
}

collectFiles(assetsDir);

logger.info(`📁 找到 ${actualFiles.size} 个资源文件\n`);

// 检查旧 hash 引用
const oldHashes = ['B9_7Pxt3', 'CQjIfk82', 'Ct0QBumG', 'CK3kLuZf', 'B6Y4X6Zv', 'B2xaJ9jT', 'Bob15k_M', 'DXiZfgDR'];
const foundOldHashes = [];

// 验证所有 JS 文件
const errors = [];
const warnings = [];
let totalFiles = 0;
let totalReferences = 0;
let validReferences = 0;

function scanFiles(dir) {
  if (!existsSync(dir)) {
    return;
  }
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      scanFiles(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.mjs'))) {
      totalFiles++;
      try {
        const content = readFileSync(fullPath, 'utf-8');
        
        // 检查旧 hash
        for (const hash of oldHashes) {
          if (content.includes(hash)) {
            foundOldHashes.push({ file: entry.name, hash });
          }
        }
        
        // 提取所有引用
        const refs = [];
        
        // import() 动态导入
        const importMatches = content.matchAll(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
        for (const match of importMatches) {
          const ref = match[1];
          if (ref.includes('/assets/') || ref.startsWith('./') || ref.startsWith('../') || ref.startsWith('assets/')) {
            refs.push({ type: 'dynamic-import', path: ref });
          }
        }
        
        // 字符串中的 /assets/xxx.js
        const stringMatches = content.matchAll(/['"](\/assets\/[^'"]+\.(js|mjs|css))['"]/g);
        for (const match of stringMatches) {
          refs.push({ type: 'string-path', path: match[1] });
        }
        
        totalReferences += refs.length;
        
        // 验证每个引用
        for (const ref of refs) {
          const fileName = ref.path.split('/').pop();
          let fileExists = false;
          let actualFile = null;
          
          // 检查文件是否存在
          if (actualFiles.has(fileName)) {
            fileExists = true;
            actualFile = fileName;
            validReferences++;
          } else {
            // 尝试通过文件名（忽略 hash）查找
            const match = fileName.match(/^(.+?)-([A-Za-z0-9]{8,})\.(js|mjs|css)$/);
            if (match) {
              const [, baseName, , ext] = match;
              const key = `${baseName}.${ext}`;
              actualFile = fileMap.get(key);
              
              if (actualFile) {
                fileExists = true;
                validReferences++;
                if (actualFile !== fileName) {
                  warnings.push({
                    file: entry.name,
                    ref: ref.path,
                    type: ref.type,
                    expected: fileName,
                    actual: actualFile
                  });
                }
              } else {
                errors.push({
                  file: entry.name,
                  ref: ref.path,
                  type: ref.type,
                  message: `引用的文件不存在: ${ref.path}`
                });
              }
            } else {
              errors.push({
                file: entry.name,
                ref: ref.path,
                type: ref.type,
                message: `引用的文件不存在: ${ref.path}`
              });
            }
          }
        }
      } catch (error) {
        errors.push({
          file: entry.name,
          error: `读取文件失败: ${error.message}`
        });
      }
    }
  }
}

scanFiles(assetsDir);

// 验证 index.html
const indexHtmlPath = join(appDistDir, 'index.html');
if (existsSync(indexHtmlPath)) {
  totalFiles++;
  try {
    const htmlContent = readFileSync(indexHtmlPath, 'utf-8');
    
    // 检查旧 hash
    for (const hash of oldHashes) {
      if (htmlContent.includes(hash)) {
        foundOldHashes.push({ file: 'index.html', hash });
      }
    }
    
    const refRegex = /(src|href)=["'](\/assets\/[^"']+\.(js|mjs|css))["']/g;
    let match;
    while ((match = refRegex.exec(htmlContent)) !== null) {
      totalReferences++;
      const fullPath = match[2];
      const fileName = fullPath.split('/').pop();
      
      if (actualFiles.has(fileName)) {
        validReferences++;
      } else {
        const match2 = fileName.match(/^(.+?)-([A-Za-z0-9]{8,})\.(js|mjs|css)$/);
        if (match2) {
          const [, baseName, , ext] = match2;
          const key = `${baseName}.${ext}`;
          const actualFile = fileMap.get(key);
          
          if (actualFile) {
            validReferences++;
            if (actualFile !== fileName) {
              warnings.push({
                file: 'index.html',
                ref: fullPath,
                type: 'html',
                expected: fileName,
                actual: actualFile
              });
            }
          } else {
            errors.push({
              file: 'index.html',
              ref: fullPath,
              type: 'html',
              message: `引用的文件不存在: ${fullPath}`
            });
          }
        } else {
          errors.push({
            file: 'index.html',
            ref: fullPath,
            type: 'html',
            message: `引用的文件不存在: ${fullPath}`
          });
        }
      }
    }
  } catch (error) {
    errors.push({
      file: 'index.html',
      error: `读取文件失败: ${error.message}`
    });
  }
}

// 输出结果
logger.info('📊 验证结果');
logger.info('='.repeat(60));
logger.info(`📁 扫描文件数: ${totalFiles}`);
logger.info(`🔗 总引用数: ${totalReferences}`);
logger.info(`✅ 有效引用: ${validReferences}`);
logger.info(`⚠️  Hash 不匹配: ${warnings.length}`);
logger.info(`❌ 无效引用: ${errors.length}`);
logger.info(`🔍 旧 hash 引用: ${foundOldHashes.length}`);
logger.info('');

if (foundOldHashes.length > 0) {
  logger.info('❌ 发现旧 hash 引用:');
  foundOldHashes.forEach(({ file, hash }, i) => {
    logger.info(`  ${i + 1}. ${file}: 包含旧 hash ${hash}`);
  });
  logger.info('');
}

if (warnings.length > 0) {
  logger.info('⚠️  Hash 不匹配的引用（文件存在但 hash 不同）:');
  warnings.slice(0, 10).forEach((w, i) => {
    logger.info(`  ${i + 1}. ${w.file}: ${w.ref}`);
    logger.info(`     期望: ${w.expected}`);
    logger.info(`     实际: ${w.actual}`);
  });
  if (warnings.length > 10) {
    logger.info(`     ... 还有 ${warnings.length - 10} 个警告`);
  }
  logger.info('');
}

if (errors.length > 0) {
  logger.info('❌ 无效引用（文件不存在）:');
  errors.slice(0, 20).forEach((e, i) => {
    logger.info(`  ${i + 1}. ${e.file}: ${e.ref || e.error}`);
    if (e.type) {
      logger.info(`     类型: ${e.type}`);
    }
  });
  if (errors.length > 20) {
    logger.info(`     ... 还有 ${errors.length - 20} 个错误`);
  }
  logger.info('');
  process.exit(1);
} else if (foundOldHashes.length > 0) {
  logger.info('❌ 构建产物中包含旧 hash 引用，需要修复');
  process.exit(1);
} else {
  logger.info('✅ 所有引用都有效！');
  if (warnings.length > 0) {
    logger.info(`⚠️  但有 ${warnings.length} 个 hash 不匹配的引用，可能需要修复`);
    process.exit(1);
  } else {
    logger.info('✅ 所有引用的 hash 都匹配！');
    logger.info('✅ 没有发现旧 hash 引用！');
    process.exit(0);
  }
}


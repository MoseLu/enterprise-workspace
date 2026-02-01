#!/usr/bin/env node

/**
 * 验证 admin-app 构建产物，确保所有引用都正确，不会出现 404
 */
import { logger } from '../../../utils/logger.mjs';

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const appDistDir = join(rootDir, 'apps', 'admin-app', 'dist');

logger.info('🔍 开始验证 admin-app 构建产物...\n');
logger.info('   检查目录:', appDistDir);

if (!existsSync(appDistDir)) {
  logger.error('❌ 构建产物目录不存在:', appDistDir);
  logger.error('   请先运行: pnpm --filter admin-app build');
  process.exit(1);
}

logger.info('✅ 构建产物目录存在\n');

const assetsDir = join(appDistDir, 'assets');
if (!existsSync(assetsDir)) {
  logger.error('❌ assets 目录不存在:', assetsDir);
  process.exit(1);
}

// 收集所有实际存在的文件
function collectFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      collectFiles(filePath, fileList);
    } else {
      fileList.push({
        path: filePath,
        name: file,
        relative: filePath.replace(assetsDir + '/', '').replace(/\\/g, '/'),
      });
    }
  });
  return fileList;
}

const allFiles = collectFiles(assetsDir);
const existingFileNames = new Set(allFiles.map(f => f.name));
const fileMap = new Map(); // 基础名称 -> 实际文件名

// 建立文件映射（忽略 hash 和 buildId）
allFiles.forEach(({ name }) => {
  // 匹配格式：name-hash-buildId.ext 或 name-hash.ext
  const match = name.match(/^(.+?)-([A-Za-z0-9]{4,})(?:-([a-zA-Z0-9]+))?\.(js|mjs|css)$/);
  if (match) {
    const [, baseName, , , ext] = match;
    const key = `${baseName}.${ext}`;
    if (!fileMap.has(key) || name > fileMap.get(key)) {
      fileMap.set(key, name);
    }
  }
});

logger.info(`📁 找到 ${allFiles.length} 个文件`);
logger.info(`📋 建立 ${fileMap.size} 个文件映射\n`);

const errors = [];
const warnings = [];

// 1. 检查 index.html
logger.info('📄 检查 index.html...');
const indexHtmlPath = join(appDistDir, 'index.html');
if (existsSync(indexHtmlPath)) {
  const html = readFileSync(indexHtmlPath, 'utf-8');
  
  // 提取所有资源引用
  const refRegex = /(src|href)=["'](\/assets\/([^"']+\.(js|mjs|css)))["']/g;
  let match;
  const htmlRefs = [];
  while ((match = refRegex.exec(html)) !== null) {
    const fullPath = match[2];
    const fileName = match[3];
    htmlRefs.push({ fullPath, fileName, type: match[1] });
  }
  
  logger.info(`   找到 ${htmlRefs.length} 个引用`);
  
  for (const ref of htmlRefs) {
    if (!existingFileNames.has(ref.fileName)) {
      // 尝试通过文件名映射查找
      const nameMatch = ref.fileName.match(/^(.+?)-([A-Za-z0-9]{4,})(?:-([a-zA-Z0-9]+))?\.(js|mjs|css)$/);
      if (nameMatch) {
        const [, baseName, , , ext] = nameMatch;
        const key = `${baseName}.${ext}`;
        const actualFile = fileMap.get(key);
        if (actualFile && actualFile !== ref.fileName) {
          errors.push({
            file: 'index.html',
            reference: ref.fullPath,
            expected: `/assets/${actualFile}`,
            message: `引用错误: ${ref.fileName} -> 实际文件: ${actualFile}`,
          });
        } else if (!actualFile) {
          errors.push({
            file: 'index.html',
            reference: ref.fullPath,
            message: `引用的文件不存在: ${ref.fileName}`,
          });
        }
      } else {
        errors.push({
          file: 'index.html',
          reference: ref.fullPath,
          message: `引用的文件不存在且格式不匹配: ${ref.fileName}`,
        });
      }
    }
  }
} else {
  errors.push({ file: 'index.html', message: '文件不存在' });
}

// 2. 检查所有 JS 文件中的引用
logger.info('\n📦 检查 JS 文件中的引用...');
const jsFiles = allFiles.filter(f => f.name.endsWith('.js') || f.name.endsWith('.mjs'));
logger.info(`   检查 ${jsFiles.length} 个 JS 文件`);

for (const jsFile of jsFiles) {
  try {
    const content = readFileSync(jsFile.path, 'utf-8');
    const refs = [];
    
    // 匹配所有可能的引用模式
    const patterns = [
      // import() 动态导入
      /import\s*\(\s*(["'])(\.?\/?assets\/([^"'`\s]+\.(js|mjs|css)))\1\s*\)/g,
      // 字符串中的绝对路径
      /(["'`])(\/assets\/([^"'`\s]+\.(js|mjs|css)))\1/g,
      // 相对路径
      /(["'`])(\.\/)([^"'`\s]+\.(js|mjs|css))\1/g,
      // __vite__mapDeps 中的引用
      /(["'])(assets\/[^"'`\s]+\.(js|mjs|css))\1/g,
    ];
    
    for (const pattern of patterns) {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(content)) !== null) {
        const referencedFile = match[3] || match[2].split('/').pop();
        if (referencedFile && !referencedFile.includes('node_modules')) {
          refs.push(referencedFile);
        }
      }
    }
    
    // 去重
    const uniqueRefs = [...new Set(refs)];
    
    for (const ref of uniqueRefs) {
      if (!existingFileNames.has(ref)) {
        // 尝试通过文件名映射查找
        const nameMatch = ref.match(/^(.+?)-([A-Za-z0-9]{4,})(?:-([a-zA-Z0-9]+))?\.(js|mjs|css)$/);
        if (nameMatch) {
          const [, baseName, , , ext] = nameMatch;
          const key = `${baseName}.${ext}`;
          const actualFile = fileMap.get(key);
          if (actualFile && actualFile !== ref) {
            errors.push({
              file: jsFile.name,
              reference: ref,
              expected: actualFile,
              message: `引用错误: ${ref} -> 实际文件: ${actualFile}`,
            });
          } else if (!actualFile) {
            errors.push({
              file: jsFile.name,
              reference: ref,
              message: `引用的文件不存在: ${ref}`,
            });
          }
        } else {
          // 尝试前缀匹配
          const refWithoutExt = ref.replace(/\.(js|mjs|css)$/, '');
          const ext = ref.split('.').pop();
          let found = false;
          for (const existingName of existingFileNames) {
            if (existingName.startsWith(refWithoutExt.split('-')[0] + '-') && existingName.endsWith('.' + ext)) {
              found = true;
              break;
            }
          }
          if (!found) {
            errors.push({
              file: jsFile.name,
              reference: ref,
              message: `引用的文件不存在且无法匹配: ${ref}`,
            });
          }
        }
      }
    }
  } catch (error) {
    warnings.push({
      file: jsFile.name,
      message: `读取文件失败: ${error.message}`,
    });
  }
}

// 输出结果
logger.info('\n' + '='.repeat(60));
logger.info('📊 验证结果');
logger.info('='.repeat(60));
logger.info(`   检查了 ${jsFiles.length} 个 JS 文件`);
logger.info(`   发现了 ${errors.length} 个错误，${warnings.length} 个警告\n`);

if (errors.length === 0 && warnings.length === 0) {
  logger.info('✅ 所有引用验证通过！不会出现 404 错误。\n');
  process.exit(0);
} else {
  if (errors.length > 0) {
    logger.error(`\n❌ 发现 ${errors.length} 个错误：\n`);
    errors.forEach((error, index) => {
      logger.error(`  ${index + 1}. 文件: ${error.file}`);
      logger.error(`     引用: ${error.reference}`);
      if (error.expected) {
        logger.error(`     期望: ${error.expected}`);
      }
      logger.error(`     错误: ${error.message}\n`);
    });
  }
  
  if (warnings.length > 0) {
    logger.warn(`\n⚠️  发现 ${warnings.length} 个警告：\n`);
    warnings.forEach((warning, index) => {
      logger.warn(`  ${index + 1}. 文件: ${warning.file}`);
      logger.warn(`     警告: ${warning.message}\n`);
    });
  }
  
  logger.error('\n❌ 构建产物验证失败，请修复上述问题后重新构建。\n');
  process.exit(1);
}


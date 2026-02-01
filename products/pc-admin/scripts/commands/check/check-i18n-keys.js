import { logger } from '../../utils/logger.mjs';
#!/usr/bin/env node

/**
 * 检查国际化 key 格式的脚本
 * 用于补充 ESLint 规则，检查 key 是否符合 snake_case 和层级结构规范
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const config = {
  format: 'snake_case',
  minLevels: 2,
  maxLevels: 5,
  allowedPrefixes: [
    'app',
    'auth',
    'common',
    'menu',
    'btc',
    'inventory',
    'org',
    'access',
    'navigation',
    'ops',
    'strategy',
    'governance',
    'data',
    'test_features',
  ],
};

/**
 * 检查字符串是否为 snake_case 格式
 */
function isSnakeCase(str) {
  return /^[a-z][a-z0-9_]*$/.test(str);
}

/**
 * 检测命名风格
 */
function detectCase(str) {
  if (isSnakeCase(str)) return 'snake_case';
  if (/^[a-z][a-zA-Z0-9]*$/.test(str) && !str.includes('_')) return 'camelCase';
  if (/^[A-Z][a-zA-Z0-9]*$/.test(str) && !str.includes('_')) return 'PascalCase';
  return 'unknown';
}

/**
 * 检查国际化 key 格式
 */
function checkI18nKey(key, filePath, line) {
  const errors = [];

  if (typeof key !== 'string' || !key.includes('.')) {
    return errors;
  }

  const parts = key.split('.');
  const levels = parts.length;

  // 检查层级数量
  if (levels < config.minLevels || levels > config.maxLevels) {
    errors.push({
      type: 'invalidLevels',
      key,
      filePath,
      line,
      message: `国际化 key "${key}" 层级不符合要求。应为 ${config.minLevels}-${config.maxLevels} 层`,
    });
    return errors;
  }

  // 检查前缀
  const prefix = parts[0];
  if (!config.allowedPrefixes.includes(prefix)) {
    errors.push({
      type: 'invalidPrefix',
      key,
      filePath,
      line,
      message: `国际化 key "${key}" 的前缀 "${prefix}" 不在允许的前缀列表中（${config.allowedPrefixes.join(', ')}）`,
    });
    return errors;
  }

  // 检查每个部分的命名风格
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const partCase = detectCase(part);

    if (config.format === 'snake_case' && partCase !== 'snake_case') {
      errors.push({
        type: 'invalidCase',
        key,
        filePath,
        line,
        message: `国际化 key "${key}" 使用了 ${partCase} 命名风格，应使用 snake_case（全小写，下划线分隔）`,
      });
      return errors;
    }
  }

  return errors;
}

/**
 * 从文件中提取国际化 key
 */
function extractI18nKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = [];
  const lines = content.split('\n');

  // 匹配 $t('key'), t('key'), $ts('key'), ts('key') 等
  const patterns = [
    /\$t\(['"]([^'"]+)['"]\)/g,
    /t\(['"]([^'"]+)['"]\)/g,
    /\$ts\(['"]([^'"]+)['"]\)/g,
    /ts\(['"]([^'"]+)['"]\)/g,
    /\{\{\s*\$t\(['"]([^'"]+)['"]\)\s*\}\}/g,
    /\{\{\s*t\(['"]([^'"]+)['"]\)\s*\}\}/g,
  ];

  lines.forEach((line, index) => {
    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const key = match[1];
        if (key && key.includes('.')) {
          keys.push({
            key,
            line: index + 1,
            filePath,
          });
        }
      }
    });
  });

  return keys;
}

/**
 * 扫描目录中的文件
 */
function scanDirectory(dir, extensions = ['.vue', '.ts', '.js', '.tsx', '.jsx']) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // 跳过 node_modules、dist 等目录
      if (
        !entry.name.startsWith('.') &&
        entry.name !== 'node_modules' &&
        entry.name !== 'dist' &&
        entry.name !== 'build'
      ) {
        files.push(...scanDirectory(fullPath, extensions));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const targetDir = args[0] || 'apps';
  const allErrors = [];

  logger.info(`🔍 开始检查国际化 key 格式...\n`);
  logger.info(`📁 扫描目录: ${targetDir}\n`);

  const files = scanDirectory(targetDir);
  logger.info(`📄 找到 ${files.length} 个文件\n`);

  files.forEach((file) => {
    try {
      const keys = extractI18nKeys(file);
      keys.forEach(({ key, line }) => {
        const errors = checkI18nKey(key, file, line);
        allErrors.push(...errors);
      });
    } catch (error) {
      logger.warn(`⚠️  无法读取文件 ${file}: ${error.message}`);
    }
  });

  // 输出结果
  if (allErrors.length === 0) {
    logger.info('✅ 所有国际化 key 格式检查通过！\n');
    process.exit(0);
  } else {
    logger.info(`❌ 发现 ${allErrors.length} 个格式问题：\n`);
    allErrors.forEach((error) => {
      logger.info(`  ${error.filePath}:${error.line}`);
      logger.info(`    ${error.message}`);
      logger.info(`    Key: ${error.key}\n`);
    });
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkI18nKey, extractI18nKeys };

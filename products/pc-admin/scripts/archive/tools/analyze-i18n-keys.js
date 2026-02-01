import { logger } from '../../../utils/logger.mjs';
const fs = require('fs');
const path = require('path');

function findI18nKeys(dir, extensions = ['.vue', '.ts', '.js']) {
  const keys = new Set();

  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const patterns = [
        /t\(['"]([^'"]+)['"]/g,
        /\$t\(['"]([^'"]+)['"]/g,
        /i18n\.t\(['"]([^'"]+)['"]/g,
        /titleKey:\s*['"]([^'"]+)['"]/g,
        /labelKey:\s*['"]([^'"]+)['"]/g,
        /meta:\s*\{[^}]*titleKey:\s*['"]([^'"]+)['"]/g,
      ];

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const key = match[1];
          if (key && (key.includes('.') || /^[a-z]/.test(key))) {
            keys.add(key);
          }
        }
      });
    } catch(e) {
      // Ignore errors
    }
  }

  function scanDir(dirPath) {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      entries.forEach(entry => {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          if (!entry.name.includes('node_modules') &&
              !entry.name.includes('dist') &&
              !entry.name.includes('.git')) {
            scanDir(fullPath);
          }
        } else if (entry.isFile()) {
          if (extensions.some(ext => entry.name.endsWith(ext))) {
            scanFile(fullPath);
          }
        }
      });
    } catch(e) {
      // Ignore errors
    }
  }

  scanDir(dir);
  return Array.from(keys).sort();
}

// 分析指定应用
const app = process.argv[2] || 'admin-app';
const appDir = path.join(__dirname, '..', 'apps', app, 'src');

if (!fs.existsSync(appDir)) {
  logger.error(`Directory not found: ${appDir}`);
  process.exit(1);
}

const usedKeys = findI18nKeys(appDir);
const localeFile = path.join(__dirname, '..', 'apps', app, 'src', 'locales', 'zh-CN.json');

let definedKeys = [];
if (fs.existsSync(localeFile)) {
  try {
    const content = JSON.parse(fs.readFileSync(localeFile, 'utf8'));
    definedKeys = Object.keys(content).sort();
  } catch(e) {
    logger.error(`Error reading locale file: ${e.message}`);
  }
}

const unusedKeys = definedKeys.filter(k => !usedKeys.includes(k));
const missingKeys = usedKeys.filter(k => !definedKeys.includes(k));

logger.info(JSON.stringify({
  app,
  totalDefined: definedKeys.length,
  totalUsed: usedKeys.length,
  unused: unusedKeys,
  missing: missingKeys,
  usedKeys: usedKeys.slice(0, 50) // 只显示前50个
}, null, 2));

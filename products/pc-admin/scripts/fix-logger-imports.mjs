#!/usr/bin/env node

/**
 * 批量修复 logger 导入，将包内文件从 @btc/shared-core 导入改为相对路径导入
 * 避免循环依赖警告
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const sharedCoreSrc = join(rootDir, 'packages/shared-core/src');

// 需要处理的文件列表
const files = [
  'btc/plugins/theme/composables/useThemeColor.ts',
  'btc/plugins/theme/composables/useThemeToggle.ts',
  'btc/plugins/manager/index.ts',
  'btc/plugins/manager/resource-loader.ts',
  'btc/plugins/theme/index.ts',
  'utils/storage/indexeddb/database.ts',
  'utils/storage/indexeddb/index.ts',
  'utils/storage/indexeddb/useLiveQuery.ts',
  'utils/storage/local/index.ts',
  'composables/subapp-lifecycle/useSubAppLogout.ts',
  'composables/user-check/useUserCheckPolling.ts',
  'composables/user-check/useUserCheckCountdown.ts',
  'composables/user-check/useUserCheckStorage.ts',
  'btc/utils/dynamic-import-interceptor.ts',
  'btc/utils/page-title.ts',
  'btc/utils/resource-loader.ts',
  'btc/service/dict-manager.ts',
  'btc/service/request.ts',
  'btc/service/sse-manager.ts',
  'utils/cdn/load-shared-resources.ts',
  'utils/form/index.ts',
  'utils/error-monitor/errorMonitorCore.ts',
  'utils/http/index.ts',
  'utils/storage/cross-domain.ts',
  'auth/logoutCore.ts',
  'composables/useCrossDomainBridge.ts',
  'composables/useGlobalState.ts',
  'composables/useLogout.ts',
  'btc/index.ts',
  'configs/app-scanner.ts',
  'configs/layout-bridge.ts',
  'env/index.ts',
  'utils/route-scanner.ts',
  'utils/storage-validity-check.ts',
];

/**
 * 计算相对路径
 */
function getRelativePath(from, to) {
  const relativePath = relative(dirname(from), to).replace(/\\/g, '/');
  // 确保以 ./ 或 ../ 开头
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  try {
    const fullPath = join(sharedCoreSrc, filePath);
    let content = readFileSync(fullPath, 'utf-8');

    // 检查是否包含从 @btc/shared-core 导入 logger
    if (!/import.*\{[^}]*logger[^}]*\}.*from\s+['"]@btc\/shared-core['"]/.test(content)) {
      return { filePath, modified: false, reason: 'no logger import from @btc/shared-core' };
    }

    // 计算从当前文件到 utils/logger/index.ts 的相对路径
    const loggerPath = join(sharedCoreSrc, 'utils/logger/index.ts');
    const relativeLoggerPath = getRelativePath(fullPath, loggerPath).replace(/\.ts$/, '');

    // 替换导入语句
    // 匹配：import { logger } from '@btc/shared-core';
    // 或者：import { xxx, logger } from '@btc/shared-core';
    // 或者：import { logger, xxx } from '@btc/shared-core';
    content = content.replace(
      /import\s*\{([^}]*\blogger\b[^}]*)\}\s*from\s+['"]@btc\/shared-core['"];?/g,
      (match, imports) => {
        // 检查是否只有 logger
        const cleanImports = imports.trim();
        if (cleanImports === 'logger') {
          return `import { logger } from '${relativeLoggerPath}';`;
        }
        
        // 如果有其他导入，需要拆分
        const items = cleanImports.split(',').map(s => s.trim()).filter(Boolean);
        const loggerIndex = items.indexOf('logger');
        if (loggerIndex === -1) {
          return match; // 不应该发生
        }

        // 移除 logger
        items.splice(loggerIndex, 1);
        
        // 如果有其他导入，保留原导入并添加新的 logger 导入
        const otherImports = items.length > 0 ? items.join(', ') : '';
        
        if (otherImports) {
          return `import { ${otherImports} } from '@btc/shared-core';\nimport { logger } from '${relativeLoggerPath}';`;
        } else {
          // 如果没有其他导入，只导入 logger
          return `import { logger } from '${relativeLoggerPath}';`;
        }
      }
    );

    // 如果内容有变化，写入文件
    if (content !== readFileSync(fullPath, 'utf-8')) {
      writeFileSync(fullPath, content, 'utf-8');
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
  console.log('开始批量修复 logger 导入...\n');

  const results = [];
  for (const file of files) {
    const result = processFile(file);
    results.push(result);
    if (result.modified) {
      console.log(`✓ ${file}`);
    } else if (result.reason !== 'no logger import from @btc/shared-core') {
      console.log(`⚠ ${file} - ${result.reason}`);
    }
  }

  const modifiedCount = results.filter(r => r.modified).length;
  console.log(`\n完成！共处理 ${files.length} 个文件，修改了 ${modifiedCount} 个文件`);
}

main().catch(console.error);

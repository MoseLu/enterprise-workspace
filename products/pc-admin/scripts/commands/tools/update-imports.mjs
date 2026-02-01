#!/usr/bin/env node

/**
 * 批量更新脚本导入路径
 * 将旧路径更新为新路径
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const commandsDir = join(__dirname, 'commands');

// 导入路径映射
const importMappings = [
  // apps-manager.mjs 相关
  {
    from: /from\s+['"]\.\.?\/apps-manager\.mjs['"]/g,
    to: "from '../../utils/monorepo-helper.mjs'",
  },
  {
    from: /from\s+['"]\.\.?\/\.\.\/apps-manager\.mjs['"]/g,
    to: "from '../../utils/monorepo-helper.mjs'",
  },
  {
    from: /from\s+['"]\.\.?\/\.\.\/\.\.\/apps-manager\.mjs['"]/g,
    to: "from '../../../utils/monorepo-helper.mjs'",
  },
  // @build-utils/logger 保持不变，但可以统一使用 utils/logger
  {
    from: /from\s+['"]@build-utils\/logger['"]/g,
    to: "from '../../utils/logger.mjs'",
  },
  // turbo.js 相关
  {
    from: /join\(__dirname,\s*['"]turbo\.js['"]\)/g,
    to: "// 使用 runTurbo from '../../utils/turbo-helper.mjs'",
  },
  // 路径相关
  {
    from: /const\s+rootDir\s*=\s*join\(__dirname,\s*['"]\.\.['"]\)/g,
    to: "import { getRootDir } from '../../utils/path-helper.mjs';\nconst rootDir = getRootDir()",
  },
];

/**
 * 递归处理目录
 */
function processDirectory(dir, relativePath = '') {
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath, join(relativePath, entry.name));
    } else if (entry.isFile() && (entry.name.endsWith('.mjs') || entry.name.endsWith('.js'))) {
      processFile(fullPath, relativePath);
    }
  }
}

/**
 * 处理单个文件
 */
function processFile(filePath, relativePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;
    
    // 应用所有映射
    for (const mapping of importMappings) {
      const newContent = content.replace(mapping.from, mapping.to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }
    
    if (modified) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ 已更新: ${join('commands', relativePath, filePath.split(/[/\\]/).pop())}`);
    }
  } catch (error) {
    console.error(`❌ 处理失败: ${filePath} - ${error.message}`);
  }
}

// 主函数
console.log('🔄 开始更新导入路径...\n');
processDirectory(commandsDir);
console.log('\n✅ 导入路径更新完成！');

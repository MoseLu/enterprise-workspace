#!/usr/bin/env node
/**
 * 查找重复的国际化翻译
 * - 分析哪些翻译在多个文件中重复定义
 * - 识别可以提取到共享翻译中的内容
 * - 生成重复报告和建议
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 从嵌套对象中提取所有的 key-value 对
 * @param {any} obj - 嵌套对象
 * @param {string} prefix - key 前缀
 * @returns {Map<string, string>} key-value Map
 */
function extractKeyValues(obj, prefix = '') {
  const result = new Map();
  
  if (typeof obj !== 'object' || obj === null) {
    return result;
  }
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nested = extractKeyValues(value, fullKey);
      for (const [k, v] of nested) {
        result.set(k, v);
      }
    } else if (typeof value === 'string') {
      result.set(fullKey, value);
    }
  }
  
  return result;
}

/**
 * 解析文件并提取翻译
 * @param {string} filePath - 文件路径
 * @returns {Promise<Map<string, string>|null>} key-value Map
 */
async function parseFile(filePath) {
  try {
    const ext = path.extname(filePath);
    
    if (ext === '.json') {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // 检查格式
      if (content['zh-CN']) {
        // 分语言格式
        return extractKeyValues(content['zh-CN']);
      } else if (path.basename(filePath).includes('zh-CN')) {
        // 单语言中文文件
        return extractKeyValues(content);
      }
    } else if (ext === '.ts') {
      // TypeScript 文件
      const module = await import(path.resolve(filePath));
      const messages = module.default || module;
      
      if (messages['zh-CN']) {
        return extractKeyValues(messages['zh-CN']);
      } else if (path.basename(filePath).includes('zh-CN')) {
        return extractKeyValues(messages);
      }
    }
    
    return null;
  } catch (error) {
    console.error(`⚠️  解析文件失败: ${filePath} - ${error.message}`);
    return null;
  }
}

/**
 * 查找重复的翻译
 * @param {string} baseDir - 基础目录
 * @param {string[]} patterns - 文件匹配模式
 */
async function findDuplicates(baseDir, patterns) {
  console.log(`\n🔍 扫描国际化文件...\n`);
  
  const allFiles = new Set();
  
  for (const pattern of patterns) {
    const files = await glob(pattern, { cwd: baseDir });
    files.forEach(f => allFiles.add(f));
  }
  
  // 只保留中文文件
  const zhFiles = Array.from(allFiles).filter(f => 
    f.includes('zh-CN') || (!f.includes('en-US') && !f.includes('en_US'))
  );
  
  console.log(`   找到 ${zhFiles.length} 个中文翻译文件\n`);
  
  // key -> [{ file, value }]
  const keyMap = new Map();
  
  for (const file of zhFiles) {
    const filePath = path.join(baseDir, file);
    const translations = await parseFile(filePath);
    
    if (translations) {
      for (const [key, value] of translations) {
        if (!keyMap.has(key)) {
          keyMap.set(key, []);
        }
        keyMap.get(key).push({ file, value });
      }
    }
  }
  
  console.log(`\n📊 分析重复情况...\n`);
  
  // 找出重复的 key
  const duplicates = new Map();
  const duplicatesByPrefix = new Map();
  
  for (const [key, occurrences] of keyMap) {
    if (occurrences.length > 1) {
      duplicates.set(key, occurrences);
      
      // 按前缀分组 (如 common.*, crud.*, theme.*)
      const prefix = key.split('.')[0];
      if (!duplicatesByPrefix.has(prefix)) {
        duplicatesByPrefix.set(prefix, []);
      }
      duplicatesByPrefix.get(prefix).push({ key, occurrences });
    }
  }
  
  // 显示结果
  if (duplicates.size === 0) {
    console.log(`✅ 太棒了! 没有发现重复的翻译!\n`);
    return;
  }
  
  console.log(`🔴 发现 ${duplicates.size} 个重复的翻译 key\n`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  // 按前缀分组显示
  const sortedPrefixes = Array.from(duplicatesByPrefix.keys()).sort();
  
  for (const prefix of sortedPrefixes) {
    const items = duplicatesByPrefix.get(prefix);
    console.log(`\n📦 ${prefix}.* (${items.length} 个重复)`);
    console.log(`${'─'.repeat(50)}\n`);
    
    for (const { key, occurrences } of items.slice(0, 5)) {
      console.log(`   🔑 ${key}`);
      console.log(`      翻译: "${occurrences[0].value}"`);
      console.log(`      出现在 ${occurrences.length} 个文件:`);
      occurrences.forEach(({ file }) => {
        console.log(`      - ${file}`);
      });
      console.log('');
    }
    
    if (items.length > 5) {
      console.log(`   ... 还有 ${items.length - 5} 个重复的 ${prefix}.* key\n`);
    }
  }
  
  // 生成建议
  console.log(`\n\n💡 优化建议\n`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  const recommendations = [];
  
  // 分析最常见的重复前缀
  const prefixCounts = Array.from(duplicatesByPrefix.entries())
    .map(([prefix, items]) => ({ prefix, count: items.length }))
    .sort((a, b) => b.count - a.count);
  
  for (const { prefix, count } of prefixCounts.slice(0, 10)) {
    recommendations.push({
      prefix,
      count,
      suggestion: `将 ${prefix}.* 相关翻译提取到 locales/shared/${prefix}.ts`
    });
  }
  
  console.log(`推荐提取以下通用翻译到共享目录:\n`);
  
  for (let i = 0; i < recommendations.length; i++) {
    const { prefix, count, suggestion } = recommendations[i];
    console.log(`${i + 1}. ${suggestion}`);
    console.log(`   - 重复次数: ${count}`);
    console.log(`   - 预计可减少代码: ${count * 50} 行左右\n`);
  }
  
  // 统计信息
  console.log(`\n📈 统计信息\n`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  let totalDuplicateLines = 0;
  for (const occurrences of duplicates.values()) {
    // 假设每个重复多占用 2 行 (key + value)
    totalDuplicateLines += (occurrences.length - 1) * 2;
  }
  
  console.log(`总文件数:         ${zhFiles.length}`);
  console.log(`重复翻译数:       ${duplicates.size}`);
  console.log(`重复前缀数:       ${duplicatesByPrefix.size}`);
  console.log(`预计冗余代码:     ~${totalDuplicateLines} 行`);
  console.log(`优化潜力:         ${((duplicates.size / keyMap.size) * 100).toFixed(2)}%`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  // 生成详细报告文件
  const reportPath = path.join(baseDir, 'i18n-duplicates-report.json');
  const report = {
    summary: {
      totalFiles: zhFiles.length,
      totalKeys: keyMap.size,
      duplicateKeys: duplicates.size,
      duplicatePrefixes: duplicatesByPrefix.size,
      estimatedRedundantLines: totalDuplicateLines
    },
    duplicates: Array.from(duplicates.entries()).map(([key, occurrences]) => ({
      key,
      value: occurrences[0].value,
      count: occurrences.length,
      files: occurrences.map(o => o.file)
    })),
    recommendations
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`📄 详细报告已保存到: ${reportPath}\n`);
}

// 主程序
async function main() {
  const args = process.argv.slice(2);
  
  const baseDir = process.cwd();
  const defaultPatterns = [
    'apps/*/src/locales/*.{json,ts}',
    'apps/*/src/i18n/locales/*.ts',
    'apps/*/src/modules/**/config.ts',
    'packages/*/src/locales/*.{json,ts}'
  ];
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📦 国际化重复检测工具

用法:
  node find-duplicates.mjs [选项]

选项:
  --pattern <模式>    指定文件匹配模式 (可多次使用)
  --base <目录>       指定基础目录 (默认: 当前目录)
  --help, -h          显示帮助信息

示例:
  # 检查所有默认位置的文件
  node find-duplicates.mjs

  # 指定特定模式
  node find-duplicates.mjs --pattern "apps/**/*.json"

  # 指定基础目录
  node find-duplicates.mjs --base /path/to/project
    `);
    return;
  }
  
  let patterns = [];
  let customBase = baseDir;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--pattern' && args[i + 1]) {
      patterns.push(args[i + 1]);
      i++;
    } else if (args[i] === '--base' && args[i + 1]) {
      customBase = args[i + 1];
      i++;
    }
  }
  
  if (patterns.length === 0) {
    patterns = defaultPatterns;
  }
  
  await findDuplicates(customBase, patterns);
}

main().catch(error => {
  console.error('❌ 执行失败:', error);
  process.exit(1);
});

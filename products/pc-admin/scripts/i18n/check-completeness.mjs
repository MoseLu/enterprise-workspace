#!/usr/bin/env node
/**
 * 检查国际化翻译的完整性
 * - 检查所有 zh-CN 的 key 是否都有对应的 en-US 翻译
 * - 检查是否有多余的 en-US key
 * - 生成缺失翻译报告
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 从嵌套对象中提取所有的 key 路径
 * @param {any} obj - 嵌套对象
 * @param {string} prefix - key 前缀
 * @returns {string[]} key 数组
 */
function getAllKeys(obj, prefix = '') {
  let keys = [];
  
  if (typeof obj !== 'object' || obj === null) {
    return [];
  }
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * 从扁平对象中提取所有的 key
 * @param {Record<string, any>} obj - 扁平对象
 * @returns {string[]} key 数组
 */
function getFlatKeys(obj) {
  return Object.keys(obj);
}

/**
 * 检查单个文件的完整性
 * @param {string} filePath - 文件路径
 * @returns {object} 检查结果
 */
async function checkFile(filePath) {
  try {
    const ext = path.extname(filePath);
    let zhKeys = new Set();
    let enKeys = new Set();
    
    if (ext === '.json') {
      // JSON 文件 - 扁平格式
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // 判断是分语言的还是单语言的
      if (content['zh-CN'] && content['en-US']) {
        // 分语言格式: { 'zh-CN': {...}, 'en-US': {...} }
        zhKeys = new Set(
          typeof content['zh-CN'] === 'object' && Object.keys(content['zh-CN'])[0]?.includes('.')
            ? getFlatKeys(content['zh-CN'])
            : getAllKeys(content['zh-CN'])
        );
        enKeys = new Set(
          typeof content['en-US'] === 'object' && Object.keys(content['en-US'])[0]?.includes('.')
            ? getFlatKeys(content['en-US'])
            : getAllKeys(content['en-US'])
        );
      } else {
        // 单语言格式,需要配对的文件
        const fileName = path.basename(filePath);
        if (fileName.includes('zh-CN')) {
          zhKeys = new Set(
            Object.keys(content)[0]?.includes('.')
              ? getFlatKeys(content)
              : getAllKeys(content)
          );
          
          // 查找对应的 en-US 文件
          const enPath = filePath.replace('zh-CN', 'en-US');
          if (fs.existsSync(enPath)) {
            const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
            enKeys = new Set(
              Object.keys(enContent)[0]?.includes('.')
                ? getFlatKeys(enContent)
                : getAllKeys(enContent)
            );
          }
        } else if (fileName.includes('en-US')) {
          // 跳过 en-US 文件,会在处理 zh-CN 时一起检查
          return null;
        }
      }
    } else if (ext === '.ts') {
      // TypeScript 文件 - 需要动态导入
      const module = await import(path.resolve(filePath));
      const messages = module.default || module;
      
      if (messages['zh-CN'] && messages['en-US']) {
        zhKeys = new Set(getAllKeys(messages['zh-CN']));
        enKeys = new Set(getAllKeys(messages['en-US']));
      } else {
        // 单语言格式
        const fileName = path.basename(filePath);
        if (fileName.includes('zh-CN')) {
          zhKeys = new Set(getAllKeys(messages));
          
          const enPath = filePath.replace('zh-CN', 'en-US');
          if (fs.existsSync(enPath)) {
            const enModule = await import(path.resolve(enPath));
            const enMessages = enModule.default || enModule;
            enKeys = new Set(getAllKeys(enMessages));
          }
        } else if (fileName.includes('en-US')) {
          return null;
        }
      }
    }
    
    // 找出缺失和多余的翻译
    const missingInEn = [];
    const extraInEn = [];
    
    for (const key of zhKeys) {
      if (!enKeys.has(key)) {
        missingInEn.push(key);
      }
    }
    
    for (const key of enKeys) {
      if (!zhKeys.has(key)) {
        extraInEn.push(key);
      }
    }
    
    return {
      file: filePath,
      zhCount: zhKeys.size,
      enCount: enKeys.size,
      missingInEn,
      extraInEn
    };
  } catch (error) {
    console.error(`❌ 检查文件失败: ${filePath}`);
    console.error(`   错误: ${error.message}`);
    return null;
  }
}

/**
 * 检查目录下的所有国际化文件
 * @param {string} baseDir - 基础目录
 * @param {string[]} patterns - 文件匹配模式
 */
async function checkDirectory(baseDir, patterns) {
  console.log(`\n🔍 扫描国际化文件...\n`);
  
  const allFiles = new Set();
  
  for (const pattern of patterns) {
    const files = await glob(pattern, { cwd: baseDir });
    files.forEach(f => allFiles.add(f));
  }
  
  console.log(`   找到 ${allFiles.size} 个文件\n`);
  
  const results = [];
  let totalIssues = 0;
  
  for (const file of allFiles) {
    const filePath = path.join(baseDir, file);
    const result = await checkFile(filePath);
    
    if (result) {
      results.push(result);
      
      const issues = result.missingInEn.length + result.extraInEn.length;
      if (issues > 0) {
        totalIssues += issues;
        
        console.log(`\n📄 ${result.file}`);
        console.log(`   中文: ${result.zhCount} 个, 英文: ${result.enCount} 个`);
        
        if (result.missingInEn.length > 0) {
          console.log(`\n   ❌ 缺少英文翻译 (${result.missingInEn.length}):`);
          result.missingInEn.slice(0, 10).forEach(key => {
            console.log(`      - ${key}`);
          });
          if (result.missingInEn.length > 10) {
            console.log(`      ... 还有 ${result.missingInEn.length - 10} 个`);
          }
        }
        
        if (result.extraInEn.length > 0) {
          console.log(`\n   ⚠️  多余的英文翻译 (${result.extraInEn.length}):`);
          result.extraInEn.slice(0, 10).forEach(key => {
            console.log(`      - ${key}`);
          });
          if (result.extraInEn.length > 10) {
            console.log(`      ... 还有 ${result.extraInEn.length - 10} 个`);
          }
        }
      }
    }
  }
  
  // 生成报告
  console.log(`\n\n📊 检查报告\n`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  let totalZh = 0;
  let totalEn = 0;
  let totalMissing = 0;
  let totalExtra = 0;
  
  for (const result of results) {
    totalZh += result.zhCount;
    totalEn += result.enCount;
    totalMissing += result.missingInEn.length;
    totalExtra += result.extraInEn.length;
  }
  
  console.log(`检查文件数:     ${results.length}`);
  console.log(`中文翻译总数:   ${totalZh}`);
  console.log(`英文翻译总数:   ${totalEn}`);
  console.log(`缺失英文翻译:   ${totalMissing}`);
  console.log(`多余英文翻译:   ${totalExtra}`);
  console.log(`完整性:         ${((totalEn - totalExtra) / totalZh * 100).toFixed(2)}%`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  if (totalIssues === 0) {
    console.log(`✅ 太棒了! 所有翻译都是完整的!\n`);
    process.exit(0);
  } else {
    console.log(`⚠️  发现 ${totalIssues} 个问题,请修复后重新检查\n`);
    process.exit(1);
  }
}

// 主程序
async function main() {
  const args = process.argv.slice(2);
  
  // 默认配置
  const baseDir = process.cwd();
  const defaultPatterns = [
    'apps/*/src/locales/*.{json,ts}',
    'apps/*/src/i18n/locales/*.ts',
    'apps/*/src/modules/**/locales/*.json',
    'apps/*/src/plugins/**/locales/*.json',
    'packages/*/src/locales/*.{json,ts}',
    'packages/*/src/i18n/locales/*.ts',
    'locales/**/*.{json,ts}'
  ];
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📦 国际化完整性检查工具

用法:
  node check-completeness.mjs [选项]

选项:
  --pattern <模式>    指定文件匹配模式 (可多次使用)
  --base <目录>       指定基础目录 (默认: 当前目录)
  --help, -h          显示帮助信息

示例:
  # 检查所有默认位置的文件
  node check-completeness.mjs

  # 指定特定模式
  node check-completeness.mjs --pattern "apps/system-app/**/*.json"

  # 指定基础目录
  node check-completeness.mjs --base /path/to/project
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
  
  await checkDirectory(customBase, patterns);
}

main().catch(error => {
  console.error('❌ 执行失败:', error);
  process.exit(1);
});

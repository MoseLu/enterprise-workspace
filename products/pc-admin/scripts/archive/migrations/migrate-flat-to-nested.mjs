#!/usr/bin/env node
/**
 * 将扁平化的国际化配置转换为嵌套格式
 * 用于迁移 JSON 和 config.ts 中的 locale 配置
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 将扁平格式转换为嵌套格式
 * @param {Record<string, string>} flat - 扁平格式对象
 * @returns {any} 嵌套格式对象
 */
function flatToNested(flat) {
  const nested = {};
  
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current = nested;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  }
  
  return nested;
}

/**
 * 格式化 TypeScript 对象为可读的字符串
 * @param {any} obj - 要格式化的对象
 * @param {number} indent - 缩进级别
 * @returns {string} 格式化后的字符串
 */
function formatTsObject(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  const nextSpaces = '  '.repeat(indent + 1);
  
  if (typeof obj !== 'object' || obj === null) {
    return JSON.stringify(obj);
  }
  
  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return '{}';
  }
  
  const lines = entries.map(([key, value]) => {
    const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
    const formattedValue = formatTsObject(value, indent + 1);
    return `${nextSpaces}${formattedKey}: ${formattedValue}`;
  });
  
  return `{\n${lines.join(',\n')}\n${spaces}}`;
}

/**
 * 从 JSON 文件转换并生成 TypeScript 文件
 * @param {string} jsonPath - JSON 文件路径
 * @param {string} outputPath - 输出 TS 文件路径
 * @param {string} exportName - 导出变量名 (默认 'default')
 */
function migrateJsonToTs(jsonPath, outputPath, exportName = 'default') {
  try {
    console.log(`\n📖 读取: ${jsonPath}`);
    const content = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    console.log(`🔄 转换为嵌套格式...`);
    const nested = flatToNested(content);
    
    console.log(`✍️  生成 TypeScript 代码...`);
    const tsContent = exportName === 'default'
      ? `export default ${formatTsObject(nested)};\n`
      : `export const ${exportName} = ${formatTsObject(nested)};\n`;
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, tsContent, 'utf-8');
    
    console.log(`✅ 成功: ${outputPath}`);
    console.log(`   - 转换了 ${Object.keys(content).length} 个 key`);
    
    return true;
  } catch (error) {
    console.error(`❌ 失败: ${jsonPath}`);
    console.error(`   错误: ${error.message}`);
    return false;
  }
}

/**
 * 转换 config.ts 中的 locale 配置格式
 * @param {string} configPath - config.ts 文件路径
 */
function migrateConfigLocale(configPath) {
  try {
    console.log(`\n📖 读取: ${configPath}`);
    let content = fs.readFileSync(configPath, 'utf-8');
    
    // 检查是否包含 locale 配置
    if (!content.includes('locale:')) {
      console.log(`⏭️  跳过: 未找到 locale 配置`);
      return false;
    }
    
    console.log(`🔄 分析 locale 配置...`);
    
    // 这里只做简单的提示,实际转换需要手动或使用 AST 工具
    console.log(`⚠️  请手动转换此文件的 locale 配置:`);
    console.log(`   1. 将 'locale' 改为 'i18n'`);
    console.log(`   2. 确保使用嵌套格式`);
    console.log(`   3. 检查是否有重复的通用翻译可以移除`);
    
    return false;
  } catch (error) {
    console.error(`❌ 失败: ${configPath}`);
    console.error(`   错误: ${error.message}`);
    return false;
  }
}

/**
 * 批量迁移目录下的所有 JSON 文件
 * @param {string} dir - 目录路径
 * @param {string} outputDir - 输出目录
 */
function migrateDirectory(dir, outputDir) {
  console.log(`\n📂 扫描目录: ${dir}`);
  
  if (!fs.existsSync(dir)) {
    console.error(`❌ 目录不存在: ${dir}`);
    return;
  }
  
  const files = fs.readdirSync(dir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  console.log(`   找到 ${jsonFiles.length} 个 JSON 文件`);
  
  let success = 0;
  let failed = 0;
  
  for (const file of jsonFiles) {
    const jsonPath = path.join(dir, file);
    const tsFileName = file.replace('.json', '.ts');
    const outputPath = path.join(outputDir, tsFileName);
    
    const result = migrateJsonToTs(jsonPath, outputPath);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }
  
  console.log(`\n📊 统计:`);
  console.log(`   成功: ${success}`);
  console.log(`   失败: ${failed}`);
}

// 主程序
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📦 国际化配置迁移工具

用法:
  node migrate-flat-to-nested.mjs <命令> [选项]

命令:
  file <json文件> <输出文件> [导出名]
    转换单个 JSON 文件为 TypeScript 嵌套格式
    
  dir <输入目录> <输出目录>
    批量转换目录下的所有 JSON 文件
    
  config <config.ts文件>
    分析 config.ts 文件的 locale 配置 (仅提示,需手动修改)

示例:
  # 转换单个文件
  node migrate-flat-to-nested.mjs file \\
    apps/system-app/src/locales/zh-CN.json \\
    locales/apps/system-zh-CN.ts

  # 批量转换目录
  node migrate-flat-to-nested.mjs dir \\
    apps/system-app/src/locales \\
    locales/apps/system

  # 分析 config.ts
  node migrate-flat-to-nested.mjs config \\
    apps/system-app/src/modules/warehouse/config.ts
    `);
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'file':
      if (args.length < 3) {
        console.error('❌ 缺少参数: file <json文件> <输出文件> [导出名]');
        process.exit(1);
      }
      migrateJsonToTs(args[1], args[2], args[3] || 'default');
      break;
      
    case 'dir':
      if (args.length < 3) {
        console.error('❌ 缺少参数: dir <输入目录> <输出目录>');
        process.exit(1);
      }
      migrateDirectory(args[1], args[2]);
      break;
      
    case 'config':
      if (args.length < 2) {
        console.error('❌ 缺少参数: config <config.ts文件>');
        process.exit(1);
      }
      migrateConfigLocale(args[1]);
      break;
      
    default:
      console.error(`❌ 未知命令: ${command}`);
      console.error('   使用 node migrate-flat-to-nested.mjs 查看帮助');
      process.exit(1);
  }
}

main();

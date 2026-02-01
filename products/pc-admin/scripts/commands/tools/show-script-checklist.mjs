#!/usr/bin/env node

/**
 * 展示脚本确认清单（用于查看，不交互）
 * 按分类展示所有脚本的详细信息，方便用户查看和决定
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const scriptsDir = join(rootDir, 'scripts');
const checklistPath = join(scriptsDir, 'UNUSED_SCRIPTS_CHECKLIST.json');

// 读取清单
let checklist;
try {
  const content = readFileSync(checklistPath, 'utf-8');
  checklist = JSON.parse(content);
} catch (error) {
  console.error('❌ 无法读取清单文件:', error.message);
  console.error('   请先运行: node scripts/generate-script-checklist.mjs');
  process.exit(1);
}

// 展示清单
function showChecklist() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 未使用脚本分类确认清单');
  console.log('='.repeat(80));
  console.log(`\n总共 ${checklist.totalScripts} 个未使用的脚本`);
  console.log(`生成时间: ${new Date(checklist.generatedAt).toLocaleString('zh-CN')}\n`);
  
  const categories = Object.entries(checklist.categories);
  let totalCount = 0;
  
  for (const [categoryName, categoryData] of categories) {
    const scripts = categoryData.scripts;
    
    if (scripts.length === 0) continue;
    
    totalCount += scripts.length;
    
    console.log('\n' + '═'.repeat(80));
    console.log(`📁 ${categoryName} (${scripts.length} 个)`);
    console.log('═'.repeat(80));
    console.log(`   说明: ${categoryData.description}`);
    console.log(`   优先级: ${categoryData.priority}`);
    console.log('');
    
    scripts.forEach((script, index) => {
      const status = script.keep === true ? '✅ 保留' : script.keep === false ? '📦 归档' : '⏳ 待确认';
      console.log(`   [${index + 1}] ${script.name} - ${status}`);
      console.log(`       作用: ${script.description || '无描述'}`);
      if (script.reason) {
        console.log(`       分类原因: ${script.reason}`);
      }
      console.log('');
    });
  }
  
  // 统计
  const stats = {
    keep: 0,
    archive: 0,
    pending: 0,
  };
  
  for (const categoryData of Object.values(checklist.categories)) {
    for (const script of categoryData.scripts) {
      if (script.keep === true) stats.keep++;
      else if (script.keep === false) stats.archive++;
      else stats.pending++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 当前确认状态');
  console.log('='.repeat(80));
  console.log(`\n✅ 已标记保留: ${stats.keep} 个`);
  console.log(`📦 已标记归档: ${stats.archive} 个`);
  console.log(`⏳ 待确认: ${stats.pending} 个`);
  console.log(`\n总计: ${totalCount} 个脚本\n`);
  
  console.log('💡 使用说明:');
  console.log('   1. 运行交互式确认工具: node scripts/interactive-script-confirm.mjs');
  console.log('   2. 或直接编辑 JSON 文件: scripts/UNUSED_SCRIPTS_CHECKLIST.json');
  console.log('     为每个脚本设置 keep: true（保留）或 keep: false（归档）\n');
}

// 主函数
showChecklist();

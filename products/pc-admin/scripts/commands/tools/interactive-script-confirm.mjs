#!/usr/bin/env node

/**
 * 交互式脚本确认工具
 * 按分类展示脚本，让用户通过勾选的方式确认每个脚本是否需要保留
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';

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

// 按分类展示并确认
async function confirmScripts() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 脚本使用情况确认工具');
  console.log('='.repeat(80));
  console.log(`\n总共 ${checklist.totalScripts} 个未使用的脚本需要确认`);
  console.log('请为每个脚本选择：保留 (keep: true) 或 归档 (keep: false)\n');
  
  const categories = Object.entries(checklist.categories);
  let totalConfirmed = 0;
  
  for (const [categoryName, categoryData] of categories) {
    const scripts = categoryData.scripts;
    
    if (scripts.length === 0) continue;
    
    console.log('\n' + '─'.repeat(80));
    console.log(`📁 ${categoryName} (${scripts.length} 个)`);
    console.log(`   ${categoryData.description}`);
    console.log(`   优先级: ${categoryData.priority}`);
    console.log('─'.repeat(80));
    
    // 显示所有脚本的详细信息
    scripts.forEach((script, index) => {
      console.log(`\n[${index + 1}] ${script.name}`);
      console.log(`    作用: ${script.description || '无描述'}`);
      if (script.reason) {
        console.log(`    分类原因: ${script.reason}`);
      }
    });
    
    // 询问处理方式
    const { action } = await prompts({
      type: 'select',
      name: 'action',
      message: `\n如何处理 ${categoryName} 的 ${scripts.length} 个脚本？`,
      choices: [
        { title: '逐个确认（推荐）', value: 'one-by-one', description: '为每个脚本单独选择保留或归档' },
        { title: '全部保留', value: 'all-keep', description: '标记此分类下所有脚本为保留' },
        { title: '全部归档', value: 'all-archive', description: '标记此分类下所有脚本为归档' },
        { title: '跳过此分类', value: 'skip', description: '稍后处理' },
      ],
      initial: categoryData.priority === 'high' ? 0 : 1,
    });
    
    if (!action || action === 'skip') {
      console.log(`   ⏭️  跳过 ${categoryName}`);
      continue;
    }
    
    if (action === 'all-keep') {
      scripts.forEach(script => {
        script.keep = true;
      });
      console.log(`   ✅ 已标记 ${scripts.length} 个脚本为保留`);
      totalConfirmed += scripts.length;
      continue;
    }
    
    if (action === 'all-archive') {
      scripts.forEach(script => {
        script.keep = false;
      });
      console.log(`   📦 已标记 ${scripts.length} 个脚本为归档`);
      totalConfirmed += scripts.length;
      continue;
    }
    
    // 逐个确认
    for (const script of scripts) {
      const { keep } = await prompts({
        type: 'confirm',
        name: 'keep',
        message: `\n保留 "${script.name}"？\n   作用: ${script.description || '无描述'}\n   分类原因: ${script.reason || '无'}`,
        initial: categoryData.priority === 'high' ? true : false,
      });
      
      if (keep === undefined) {
        console.log('   ⏭️  跳过此脚本');
        continue;
      }
      
      script.keep = keep;
      console.log(`   ${keep ? '✅ 保留' : '📦 归档'}: ${script.name}`);
      totalConfirmed++;
    }
  }
  
  // 保存结果
  writeFileSync(checklistPath, JSON.stringify(checklist, null, 2), 'utf-8');
  
  // 统计结果
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
  console.log('📊 确认结果统计');
  console.log('='.repeat(80));
  console.log(`\n✅ 保留: ${stats.keep} 个`);
  console.log(`📦 归档: ${stats.archive} 个`);
  console.log(`⏳ 待确认: ${stats.pending} 个`);
  console.log(`\n✅ 结果已保存到: ${checklistPath}`);
  console.log('\n');
}

// 主函数
confirmScripts().catch(error => {
  console.error('❌ 确认过程失败:', error);
  process.exit(1);
});

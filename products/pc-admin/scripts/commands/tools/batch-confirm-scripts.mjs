#!/usr/bin/env node

/**
 * 批量确认脚本工具
 * 按分类展示脚本，让用户通过多选的方式确认哪些脚本需要保留
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

// 批量确认脚本
async function batchConfirmScripts() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 脚本使用情况批量确认工具');
  console.log('='.repeat(80));
  console.log(`\n总共 ${checklist.totalScripts} 个未使用的脚本需要确认`);
  console.log('请为每个分类选择需要保留的脚本\n');
  
  const categories = Object.entries(checklist.categories);
  let totalConfirmed = 0;
  
  for (const [categoryName, categoryData] of categories) {
    const scripts = categoryData.scripts;
    
    if (scripts.length === 0) continue;
    
    console.log('\n' + '═'.repeat(80));
    console.log(`📁 ${categoryName} (${scripts.length} 个)`);
    console.log('═'.repeat(80));
    console.log(`   说明: ${categoryData.description}`);
    console.log(`   优先级: ${categoryData.priority}`);
    console.log('');
    
    // 显示所有脚本的详细信息
    scripts.forEach((script, index) => {
      console.log(`   [${index + 1}] ${script.name}`);
      console.log(`       作用: ${script.description || '无描述'}`);
      if (script.reason) {
        console.log(`       分类原因: ${script.reason}`);
      }
      console.log('');
    });
    
    // 创建多选选项
    const choices = scripts.map((script, index) => ({
      title: `${script.name}`,
      description: script.description ? script.description.substring(0, 60) + '...' : '无描述',
      value: script.name,
      selected: categoryData.priority === 'high' ? true : false, // 高优先级默认选中
    }));
    
    // 添加"全选"和"全不选"选项
    choices.unshift(
      { title: '━━━ 操作 ━━━', value: '__separator__', disabled: true },
      { title: '✅ 全选此分类', value: '__select_all__' },
      { title: '❌ 全不选此分类', value: '__deselect_all__' },
      { title: '━━━ 脚本列表 ━━━', value: '__separator2__', disabled: true }
    );
    
    // 询问处理方式
    const { selectedScripts } = await prompts({
      type: 'multiselect',
      name: 'selectedScripts',
      message: `\n请选择 ${categoryName} 中需要保留的脚本（空格键选择，回车确认）:`,
      choices: choices,
      instructions: '使用 ↑↓ 键导航，空格键选择/取消，回车确认',
      min: 0,
    });
    
    if (!selectedScripts) {
      console.log(`   ⏭️  跳过 ${categoryName}`);
      continue;
    }
    
    // 处理特殊选项
    if (selectedScripts.includes('__select_all__')) {
      scripts.forEach(script => {
        script.keep = true;
      });
      console.log(`   ✅ 已标记 ${scripts.length} 个脚本为保留`);
      totalConfirmed += scripts.length;
      continue;
    }
    
    if (selectedScripts.includes('__deselect_all__')) {
      scripts.forEach(script => {
        script.keep = false;
      });
      console.log(`   📦 已标记 ${scripts.length} 个脚本为归档`);
      totalConfirmed += scripts.length;
      continue;
    }
    
    // 根据选择设置 keep 状态
    const selectedSet = new Set(selectedScripts.filter(s => !s.startsWith('__')));
    scripts.forEach(script => {
      script.keep = selectedSet.has(script.name);
      if (script.keep) {
        console.log(`   ✅ 保留: ${script.name}`);
      } else {
        console.log(`   📦 归档: ${script.name}`);
      }
    });
    
    totalConfirmed += scripts.length;
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
  console.log('\n💡 提示: 您可以随时重新运行此工具来修改选择\n');
}

// 主函数
batchConfirmScripts().catch(error => {
  if (error.name === 'ExitPromptError') {
    console.log('\n操作已取消');
    process.exit(0);
  }
  console.error('❌ 确认过程失败:', error);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * 清理 scripts 根目录下的文档文件
 * 删除无用的指导/总结文件，将有用的移动到 docs 目录
 */

import { readdirSync, renameSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const scriptsDir = __dirname;
const docsDir = join(scriptsDir, '..', 'docs');

// 需要保留的文件（只保留 README.md）
const keepFiles = ['README.md'];

// 需要移动到 docs 的有用文档（重构相关的重要文档）
const docsToMove = [
  {
    file: 'README_REFACTOR.md',
    target: 'docs/development/scripts-refactoring.md',
    reason: '重构说明文档，对理解新架构有帮助',
  },
  {
    file: 'ARCHIVE_COMPLETE.md',
    target: 'docs/development/scripts-archive-complete.md',
    reason: '归档完成报告，记录重构历史',
  },
];

// 可以删除的临时/总结性文档
const docsToDelete = [
  'MIGRATION_PROGRESS.md',        // 迁移进度（已完成，可删除）
  'REFACTORING_SUMMARY.md',        // 重构总结（已完成，可删除）
  'FINAL_CHECKLIST.md',            // 最终检查清单（已完成，可删除）
  'ROOT_SCRIPTS_STATUS.md',       // 根目录状态说明（已完成，可删除）
  'SCRIPT_CONFIRMATION_GUIDE.md',  // 脚本确认指南（一次性工具文档，可删除）
  'SCRIPT_USAGE_REPORT.md',        // 脚本使用报告（一次性分析报告，可删除）
  'UNUSED_SCRIPTS_CHECKLIST.json', // 未使用脚本清单（一次性分析数据，可删除）
  'BPS_DEPLOYMENT.md',            // BPS 部署文档（如果已有其他文档，可删除）
  'DEPLOY_CONFIG.md',             // 部署配置文档（如果已有其他文档，可删除）
];

console.log('🔍 分析 scripts 根目录下的文档文件...\n');

// 读取根目录下的所有文件
const files = readdirSync(scriptsDir, { withFileTypes: true })
  .filter(entry => entry.isFile())
  .map(entry => entry.name)
  .filter(name => !keepFiles.includes(name));

console.log(`📊 找到 ${files.length} 个文档文件需要处理\n`);

// 确保 docs 目录存在
if (!existsSync(docsDir)) {
  mkdirSync(docsDir, { recursive: true });
}

// 确保 docs/development 目录存在
const docsDevDir = join(docsDir, 'development');
if (!existsSync(docsDevDir)) {
  mkdirSync(docsDevDir, { recursive: true });
}

let moved = 0;
let deleted = 0;
let failed = 0;

// 移动有用的文档到 docs
for (const { file, target, reason } of docsToMove) {
  const src = join(scriptsDir, file);
  const dest = join(scriptsDir, '..', target);
  
  if (existsSync(src)) {
    try {
      // 确保目标目录存在
      const targetDir = dirname(dest);
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
      }
      
      renameSync(src, dest);
      console.log(`✅ 已移动: ${file} → ${target}`);
      console.log(`   原因: ${reason}`);
      moved++;
    } catch (error) {
      console.error(`❌ 移动失败: ${file} - ${error.message}`);
      failed++;
    }
  }
}

// 删除临时/总结性文档
for (const file of docsToDelete) {
  const filePath = join(scriptsDir, file);
  if (existsSync(filePath)) {
    try {
      unlinkSync(filePath);
      console.log(`🗑️  已删除: ${file}`);
      deleted++;
    } catch (error) {
      console.error(`❌ 删除失败: ${file} - ${error.message}`);
      failed++;
    }
  }
}

// 处理其他未分类的文档文件
const otherDocs = files.filter(
  file => 
    !docsToMove.some(d => d.file === file) && 
    !docsToDelete.includes(file) &&
    (file.endsWith('.md') || file.endsWith('.json'))
);

if (otherDocs.length > 0) {
  console.log(`\n⚠️  发现 ${otherDocs.length} 个未分类的文档文件:`);
  otherDocs.forEach(file => {
    console.log(`  - ${file}`);
  });
  console.log('\n💡 这些文件需要手动决定是删除还是移动到 docs');
}

console.log(`\n✅ 清理完成: ${moved} 个已移动, ${deleted} 个已删除, ${failed} 个失败`);

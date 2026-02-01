#!/usr/bin/env node

/**
 * 归档脚本工具
 * 根据 UNUSED_SCRIPTS_CHECKLIST.json 中的标记，将 keep: false 的脚本移动到对应的归档目录
 */

import { readFileSync, existsSync, renameSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const scriptsDir = join(rootDir, 'scripts');
const checklistPath = join(scriptsDir, 'UNUSED_SCRIPTS_CHECKLIST.json');
const archiveDir = join(scriptsDir, 'archive');

// 分类到归档目录的映射
const categoryToArchiveDir = {
  '一次性迁移脚本': 'migrations',
  'SSL/证书修复脚本': 'ssl',
  '诊断/调试脚本': 'diagnostics',
  '验证/检查脚本': 'verify',
  '部署相关脚本': 'deploy',
  '开发工具脚本': 'dev',
  '版本管理脚本': 'version',
  '备份/维护脚本': 'backup',
  'Verdaccio 相关脚本': 'verdaccio',
  '工具/辅助脚本': 'tools',
  '其他': 'obsolete',
};

// 读取清单
let checklist;
try {
  const content = readFileSync(checklistPath, 'utf-8');
  checklist = JSON.parse(content);
} catch (error) {
  console.error('❌ 无法读取清单文件:', error.message);
  process.exit(1);
}

// 归档脚本
function archiveScripts() {
  const archived = [];
  const notFound = [];
  const errors = [];

  console.log('📦 开始归档脚本...\n');

  // 遍历所有分类
  for (const [categoryName, categoryData] of Object.entries(checklist.categories)) {
    const scripts = categoryData.scripts || [];
    
    // 找出需要归档的脚本
    const scriptsToArchive = scripts.filter(s => s.keep === false);
    
    if (scriptsToArchive.length === 0) continue;

    // 确定归档目录
    const archiveSubDir = categoryToArchiveDir[categoryName] || 'obsolete';
    const targetDir = join(archiveDir, archiveSubDir);

    // 确保目录存在
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    console.log(`\n📁 ${categoryName} (${scriptsToArchive.length} 个)`);
    console.log(`   归档到: archive/${archiveSubDir}/`);

    // 移动每个脚本
    for (const script of scriptsToArchive) {
      const scriptPath = join(scriptsDir, script.name);
      const targetPath = join(targetDir, script.name.split('/').pop()); // 只取文件名

      try {
        if (!existsSync(scriptPath)) {
          notFound.push(script.name);
          console.log(`   ⚠️  未找到: ${script.name}`);
          continue;
        }

        // 如果目标文件已存在，添加时间戳
        let finalTargetPath = targetPath;
        if (existsSync(finalTargetPath)) {
          const ext = script.name.split('.').pop();
          const nameWithoutExt = script.name.replace(/\.[^/.]+$/, '');
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
          finalTargetPath = join(targetDir, `${nameWithoutExt}.${timestamp}.${ext}`);
        }

        renameSync(scriptPath, finalTargetPath);
        archived.push({
          name: script.name,
          category: categoryName,
          archiveDir: archiveSubDir,
          note: script.note || '',
        });
        console.log(`   ✅ ${script.name}`);
      } catch (error) {
        errors.push({ name: script.name, error: error.message });
        console.log(`   ❌ 失败: ${script.name} - ${error.message}`);
      }
    }
  }

  // 输出统计
  console.log('\n' + '='.repeat(80));
  console.log('📊 归档统计');
  console.log('='.repeat(80));
  console.log(`\n✅ 成功归档: ${archived.length} 个`);
  if (notFound.length > 0) {
    console.log(`⚠️  未找到: ${notFound.length} 个`);
  }
  if (errors.length > 0) {
    console.log(`❌ 失败: ${errors.length} 个`);
  }

  // 按分类统计
  const statsByCategory = {};
  archived.forEach(item => {
    if (!statsByCategory[item.archiveDir]) {
      statsByCategory[item.archiveDir] = 0;
    }
    statsByCategory[item.archiveDir]++;
  });

  console.log('\n按归档目录统计:');
  for (const [dir, count] of Object.entries(statsByCategory)) {
    console.log(`  archive/${dir}/: ${count} 个`);
  }

  return { archived, notFound, errors };
}

// 主函数
try {
  const result = archiveScripts();
  console.log('\n✅ 归档完成！');
} catch (error) {
  console.error('❌ 归档过程失败:', error);
  process.exit(1);
}

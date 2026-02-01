#!/usr/bin/env node

/**
 * 清理已迁移的重复脚本
 * 删除已迁移到 commands/ 目录的原始脚本文件
 */

import { unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const scriptsDir = join(__dirname);

// 已迁移的脚本映射（原始路径 -> 新路径）
const migratedScripts = [
  // 构建脚本
  { old: 'build-cdn.mjs', new: 'commands/build/cdn-build.mjs' },
  { old: 'build-to-dist.mjs', new: 'commands/build/dist-build.mjs' },
  { old: 'build-preview.mjs', new: 'commands/build/preview-build.mjs' },
  { old: 'build-dist-cdn.mjs', new: 'commands/build/dist-cdn-build.mjs' },
  
  // 开发脚本
  { old: 'dev-all.mjs', new: 'commands/dev/dev-all.mjs' },
  { old: 'dev-all-with-check.mjs', new: 'commands/dev/dev-with-check.mjs' },
  
  // 测试脚本
  { old: 'test-deployment.mjs', new: 'commands/test/deployment-test.mjs' },
  
  // 检查脚本
  { old: 'check-circular-deps.mjs', new: 'commands/check/check-circular-deps.mjs' },
  { old: 'check-i18n-keys.js', new: 'commands/check/check-i18n-keys.js' },
  
  // 工具脚本
  { old: 'clean-cache.mjs', new: 'commands/tools/clean-cache.mjs' },
  { old: 'clean-vite-cache.mjs', new: 'commands/tools/clean-vite-cache.mjs' },
  { old: 'upload-app-to-cdn.mjs', new: 'commands/tools/upload-app-to-cdn.mjs' },
  { old: 'copy-eps-from-system.mjs', new: 'commands/tools/copy-eps-from-system.mjs' },
  
  // 发布脚本
  { old: 'release-version.mjs', new: 'commands/release/version.mjs' },
  { old: 'release-push.mjs', new: 'commands/release/push.mjs' },
];

// 需要保留的核心脚本（不应删除）
const keepScripts = [
  'turbo.js',                    // 核心工具，被广泛引用
  'apps-manager.mjs',            // 虽然已迁移，但可能还有引用，需要检查
  'locale-merge.mjs',            // 仍在使用的 i18n 工具
  'create-app-cli.mjs',          // 创建应用的 CLI
  'update-changelog.mjs',        // 更新 changelog
  'generate-lint-error-reports.mjs',  // 生成报告
  'generate-ts-error-reports.mjs',    // 生成报告
  'build-deploy-static-all.js',  // 仍在使用的部署脚本
];

// 分析工具脚本（可以保留或移动到 tools/）
const analysisTools = [
  'analyze-script-usage.mjs',
  'classify-unused-scripts.mjs',
  'generate-script-checklist.mjs',
  'show-script-checklist.mjs',
  'interactive-script-confirm.mjs',
  'batch-confirm-scripts.mjs',
  'confirm-script-usage.mjs',
  'archive-scripts.mjs',
  'update-imports.mjs',
  'update-package-json-refs.mjs',
];

console.log('🔍 分析 scripts 根目录下的脚本...\n');

const toDelete = [];
const toKeep = [];
const toMove = [];

// 检查已迁移的脚本
for (const { old, new: newPath } of migratedScripts) {
  const oldPath = join(scriptsDir, old);
  const newPathFull = join(scriptsDir, newPath);
  
  if (existsSync(oldPath)) {
    if (existsSync(newPathFull)) {
      toDelete.push({ path: oldPath, reason: `已迁移到 ${newPath}` });
    } else {
      console.warn(`⚠️  警告: ${old} 存在但新路径 ${newPath} 不存在，跳过删除`);
    }
  }
}

// 检查需要保留的脚本
for (const script of keepScripts) {
  const path = join(scriptsDir, script);
  if (existsSync(path)) {
    toKeep.push({ path, reason: '核心工具，需要保留' });
  }
}

// 检查分析工具脚本
for (const script of analysisTools) {
  const path = join(scriptsDir, script);
  if (existsSync(path)) {
    toMove.push({ path, reason: '分析工具，建议移动到 commands/tools/' });
  }
}

// 输出分析结果
console.log('📊 分析结果:\n');
console.log(`✅ 需要保留的脚本 (${toKeep.length} 个):`);
toKeep.forEach(({ path, reason }) => {
  const name = path.split(/[/\\]/).pop();
  console.log(`   - ${name} (${reason})`);
});

console.log(`\n🗑️  可以删除的已迁移脚本 (${toDelete.length} 个):`);
toDelete.forEach(({ path, reason }) => {
  const name = path.split(/[/\\]/).pop();
  console.log(`   - ${name} (${reason})`);
});

console.log(`\n📦 建议移动的分析工具 (${toMove.length} 个):`);
toMove.forEach(({ path, reason }) => {
  const name = path.split(/[/\\]/).pop();
  console.log(`   - ${name} (${reason})`);
});

// 询问是否删除
if (toDelete.length > 0) {
  console.log(`\n❓ 是否删除 ${toDelete.length} 个已迁移的脚本？`);
  console.log('   这些脚本已经迁移到 commands/ 目录，package.json 引用已更新');
  console.log('   如果确认删除，请运行: node scripts/cleanup-duplicate-scripts.mjs --delete\n');
  
  if (process.argv.includes('--delete')) {
    console.log('🗑️  开始删除已迁移的脚本...\n');
    let deleted = 0;
    let failed = 0;
    
    for (const { path } of toDelete) {
      try {
        unlinkSync(path);
        const name = path.split(/[/\\]/).pop();
        console.log(`✅ 已删除: ${name}`);
        deleted++;
      } catch (error) {
        const name = path.split(/[/\\]/).pop();
        console.error(`❌ 删除失败: ${name} - ${error.message}`);
        failed++;
      }
    }
    
    console.log(`\n✅ 删除完成: ${deleted} 个成功, ${failed} 个失败`);
  }
} else {
  console.log('\n✅ 没有需要删除的已迁移脚本');
}

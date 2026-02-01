#!/usr/bin/env node

/**
 * 为所有关键架构部分批量生成 CHANGELOG.md 和 README.md 模板
 * 
 * 使用方式：
 *   node scripts/commands/tools/generate-all-docs.mjs [--dry-run]
 */

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../..');

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// 需要生成文档的路径列表
const pathsToGenerate = [
  // 应用
  { path: 'apps/main-app', type: 'app' },
  { path: 'apps/system-app', type: 'app' },
  { path: 'apps/layout-app', type: 'app' },
  { path: 'apps/admin-app', type: 'app' },
  { path: 'apps/logistics-app', type: 'app' },
  { path: 'apps/production-app', type: 'app' },
  { path: 'apps/quality-app', type: 'app' },
  { path: 'apps/engineering-app', type: 'app' },
  { path: 'apps/finance-app', type: 'app' },
  { path: 'apps/operations-app', type: 'app' },
  { path: 'apps/personnel-app', type: 'app' },
  { path: 'apps/dashboard-app', type: 'app' },
  { path: 'apps/home-app', type: 'app' },
  { path: 'apps/docs-app', type: 'app' },
  // 共享包
  { path: 'packages/shared-core', type: 'package' },
  { path: 'packages/shared-components', type: 'package' },
  { path: 'packages/shared-router', type: 'package' },
  { path: 'packages/vite-plugin', type: 'package' },
  { path: 'packages/design-tokens', type: 'package' },
  // 重要目录
  { path: 'scripts', type: 'directory' },
  { path: 'configs', type: 'directory' },
];

console.log('📝 开始为关键架构部分生成文档模板...\n');

if (isDryRun) {
  console.log('🔍 预览模式（不会实际创建文件）\n');
}

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

for (const item of pathsToGenerate) {
  const fullPath = join(rootDir, item.path);
  
  if (!existsSync(fullPath)) {
    console.log(`⏭️  ${item.path}: 目录不存在，跳过`);
    skipCount++;
    continue;
  }
  
  try {
    if (isDryRun) {
      console.log(`📋 [预览] ${item.path} (${item.type})`);
    } else {
      console.log(`📝 生成文档: ${item.path}...`);
      execSync(
        `node "${join(__dirname, 'generate-docs-template.mjs')}" "${item.path}" --type=${item.type}`,
        { cwd: rootDir, stdio: 'pipe' }
      );
      successCount++;
    }
  } catch (error) {
    console.error(`❌ ${item.path}: 生成失败 - ${error.message}`);
    errorCount++;
  }
}

console.log('\n' + '='.repeat(80));
console.log('📊 生成统计');
console.log('='.repeat(80));
if (!isDryRun) {
  console.log(`✅ 成功: ${successCount}`);
  console.log(`⏭️  跳过: ${skipCount}`);
  console.log(`❌ 失败: ${errorCount}`);
  console.log(`\n💡 提示: 请编辑生成的文档，添加具体内容。`);
} else {
  console.log(`📋 预览: ${pathsToGenerate.length} 个路径`);
  console.log(`⏭️  跳过: ${skipCount}`);
  console.log(`\n💡 提示: 运行时不加 --dry-run 参数将实际创建文档。`);
}

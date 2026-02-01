#!/usr/bin/env node

/**
 * 归档 scripts 根目录下的所有文件（除了文件夹和 README.md）
 * 将文件移动到合适的归档位置或 commands/ 目录
 */

import { readdirSync, statSync, renameSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const scriptsDir = __dirname;

// 需要保留的文件（不归档）
const keepFiles = [
  'README.md',
  'README_REFACTOR.md',
  'MIGRATION_PROGRESS.md',
  'REFACTORING_SUMMARY.md',
  'FINAL_CHECKLIST.md',
  'ROOT_SCRIPTS_STATUS.md',
  'SCRIPT_USAGE_REPORT.md',
  'SCRIPT_CONFIRMATION_GUIDE.md',
  'UNUSED_SCRIPTS_CHECKLIST.json',
  'BPS_DEPLOYMENT.md',
  'DEPLOY_CONFIG.md',
];

// 核心工具脚本（移动到 commands/tools/）
const coreTools = [
  'turbo.js',
  'apps-manager.mjs',
  'locale-merge.mjs',
  'create-app-cli.mjs',
  'update-changelog.mjs',
  'generate-lint-error-reports.mjs',
  'generate-ts-error-reports.mjs',
  'build-deploy-static-all.js',
];

// 分析工具脚本（移动到 commands/tools/）
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
  'cleanup-duplicate-scripts.mjs',
];

// Shell 脚本（移动到 shell/utils/）
const shellScripts = [
  'bps-all.sh',
  'build-all.sh',
  'build-and-push-local.sh',
  'build-deploy-all.sh',
  'build-deploy-incremental-k8s.sh',
  'build-incremental-k8s.sh',
  'clean-old-releases.sh',
  'deploy-app-local.sh',
  'deploy-incremental-k8s.sh',
  'deploy-static.sh',
  'load-env.sh',
  'publish-to-verdaccio.sh',
  'start-verdaccio.sh',
  'trigger-deploy.sh',
  'set-oss-env.bat',
  'clear-sw-cache.html',
];

// 其他文件（移动到 archive/obsolete/）
const otherFiles = [
  // 其他未分类的文件
];

console.log('🔍 分析 scripts 根目录下的文件...\n');

// 读取根目录下的所有文件
const files = readdirSync(scriptsDir, { withFileTypes: true })
  .filter(entry => entry.isFile())
  .map(entry => entry.name)
  .filter(name => !keepFiles.includes(name));

console.log(`📊 找到 ${files.length} 个需要归档的文件\n`);

const toMove = {
  coreTools: [],
  analysisTools: [],
  shellScripts: [],
  otherFiles: [],
};

// 分类文件
for (const file of files) {
  if (coreTools.includes(file)) {
    toMove.coreTools.push(file);
  } else if (analysisTools.includes(file)) {
    toMove.analysisTools.push(file);
  } else if (shellScripts.includes(file)) {
    toMove.shellScripts.push(file);
  } else {
    toMove.otherFiles.push(file);
  }
}

// 创建目标目录
const commandsToolsDir = join(scriptsDir, 'commands', 'tools');
const shellUtilsDir = join(scriptsDir, 'shell', 'utils');
const archiveObsoleteDir = join(scriptsDir, 'archive', 'obsolete');

[commandsToolsDir, shellUtilsDir, archiveObsoleteDir].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// 移动文件
let moved = 0;
let failed = 0;

// 移动核心工具
for (const file of toMove.coreTools) {
  try {
    const src = join(scriptsDir, file);
    const dest = join(commandsToolsDir, file);
    renameSync(src, dest);
    console.log(`✅ 已移动: ${file} → commands/tools/`);
    moved++;
  } catch (error) {
    console.error(`❌ 移动失败: ${file} - ${error.message}`);
    failed++;
  }
}

// 移动分析工具
for (const file of toMove.analysisTools) {
  try {
    const src = join(scriptsDir, file);
    const dest = join(commandsToolsDir, file);
    renameSync(src, dest);
    console.log(`✅ 已移动: ${file} → commands/tools/`);
    moved++;
  } catch (error) {
    console.error(`❌ 移动失败: ${file} - ${error.message}`);
    failed++;
  }
}

// 移动 Shell 脚本
for (const file of toMove.shellScripts) {
  try {
    const src = join(scriptsDir, file);
    const dest = join(shellUtilsDir, file);
    renameSync(src, dest);
    console.log(`✅ 已移动: ${file} → shell/utils/`);
    moved++;
  } catch (error) {
    console.error(`❌ 移动失败: ${file} - ${error.message}`);
    failed++;
  }
}

// 移动其他文件
for (const file of toMove.otherFiles) {
  try {
    const src = join(scriptsDir, file);
    const dest = join(archiveObsoleteDir, file);
    renameSync(src, dest);
    console.log(`✅ 已归档: ${file} → archive/obsolete/`);
    moved++;
  } catch (error) {
    console.error(`❌ 归档失败: ${file} - ${error.message}`);
    failed++;
  }
}

console.log(`\n✅ 归档完成: ${moved} 个成功, ${failed} 个失败`);

if (moved > 0) {
  console.log('\n📝 注意: 需要更新以下引用:');
  console.log('  - package.json 中的脚本路径');
  console.log('  - 脚本内部的相对路径引用');
}

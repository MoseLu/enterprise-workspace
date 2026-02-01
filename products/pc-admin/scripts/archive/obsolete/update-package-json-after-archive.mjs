#!/usr/bin/env node

/**
 * 更新 package.json 中的脚本路径
 * 将已归档的文件路径更新为新位置
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const packageJsonPath = join(rootDir, 'package.json');

// 路径映射（旧路径 -> 新路径）
const pathMappings = [
  // 核心工具脚本
  { from: /scripts\/turbo\.js/g, to: 'scripts/commands/tools/turbo.js' },
  { from: /scripts\/apps-manager\.mjs/g, to: 'scripts/commands/tools/apps-manager.mjs' },
  { from: /scripts\/locale-merge\.mjs/g, to: 'scripts/commands/tools/locale-merge.mjs' },
  { from: /scripts\/create-app-cli\.mjs/g, to: 'scripts/commands/tools/create-app-cli.mjs' },
  { from: /scripts\/update-changelog\.mjs/g, to: 'scripts/commands/tools/update-changelog.mjs' },
  { from: /scripts\/generate-lint-error-reports\.mjs/g, to: 'scripts/commands/tools/generate-lint-error-reports.mjs' },
  { from: /scripts\/generate-ts-error-reports\.mjs/g, to: 'scripts/commands/tools/generate-ts-error-reports.mjs' },
  { from: /scripts\/build-deploy-static-all\.js/g, to: 'scripts/commands/tools/build-deploy-static-all.js' },
  
  // Shell 脚本
  { from: /scripts\/bps-all\.sh/g, to: 'scripts/shell/utils/bps-all.sh' },
  { from: /scripts\/build-all\.sh/g, to: 'scripts/shell/utils/build-all.sh' },
  { from: /scripts\/build-and-push-local\.sh/g, to: 'scripts/shell/utils/build-and-push-local.sh' },
  { from: /scripts\/build-deploy-all\.sh/g, to: 'scripts/shell/utils/build-deploy-all.sh' },
  { from: /scripts\/build-deploy-incremental-k8s\.sh/g, to: 'scripts/shell/utils/build-deploy-incremental-k8s.sh' },
  { from: /scripts\/build-incremental-k8s\.sh/g, to: 'scripts/shell/utils/build-incremental-k8s.sh' },
  { from: /scripts\/clean-old-releases\.sh/g, to: 'scripts/shell/utils/clean-old-releases.sh' },
  { from: /scripts\/deploy-app-local\.sh/g, to: 'scripts/shell/utils/deploy-app-local.sh' },
  { from: /scripts\/deploy-incremental-k8s\.sh/g, to: 'scripts/shell/utils/deploy-incremental-k8s.sh' },
  { from: /scripts\/deploy-static\.sh/g, to: 'scripts/shell/utils/deploy-static.sh' },
  { from: /scripts\/load-env\.sh/g, to: 'scripts/shell/utils/load-env.sh' },
  { from: /scripts\/publish-to-verdaccio\.sh/g, to: 'scripts/shell/utils/publish-to-verdaccio.sh' },
  { from: /scripts\/start-verdaccio\.sh/g, to: 'scripts/shell/utils/start-verdaccio.sh' },
  { from: /scripts\/trigger-deploy\.sh/g, to: 'scripts/shell/utils/trigger-deploy.sh' },
  { from: /scripts\/set-oss-env\.bat/g, to: 'scripts/shell/utils/set-oss-env.bat' },
];

// 读取 package.json
let packageJson;
try {
  const content = readFileSync(packageJsonPath, 'utf-8');
  packageJson = JSON.parse(content);
} catch (error) {
  console.error('❌ 无法读取 package.json:', error.message);
  process.exit(1);
}

// 更新 scripts 字段
let updated = false;
const scripts = packageJson.scripts || {};

for (const [key, value] of Object.entries(scripts)) {
  if (typeof value === 'string') {
    let newValue = value;
    for (const mapping of pathMappings) {
      const replaced = newValue.replace(mapping.from, mapping.to);
      if (replaced !== newValue) {
        newValue = replaced;
        updated = true;
        console.log(`✅ 更新: ${key}`);
        console.log(`   旧: ${value}`);
        console.log(`   新: ${newValue}`);
      }
    }
    scripts[key] = newValue;
  }
}

// 保存更新
if (updated) {
  packageJson.scripts = scripts;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
  console.log('\n✅ package.json 已更新！');
} else {
  console.log('\nℹ️  没有需要更新的引用');
}

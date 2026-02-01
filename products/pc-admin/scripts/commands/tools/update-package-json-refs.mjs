#!/usr/bin/env node

/**
 * 批量更新 package.json 中的脚本引用
 * 将旧路径更新为新路径
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const packageJsonPath = join(rootDir, 'package.json');

// 脚本路径映射
const scriptMappings = [
  // 构建脚本
  { from: /scripts\/build-preview\.mjs/g, to: 'scripts/commands/build/preview-build.mjs' },
  { from: /scripts\/build-cdn\.mjs/g, to: 'scripts/commands/build/cdn-build.mjs' },
  { from: /scripts\/build-to-dist\.mjs/g, to: 'scripts/commands/build/dist-build.mjs' },
  { from: /scripts\/build-dist-cdn\.mjs/g, to: 'scripts/commands/build/dist-cdn-build.mjs' },
  
  // 开发脚本
  { from: /scripts\/dev-all\.mjs/g, to: 'scripts/commands/dev/dev-all.mjs' },
  { from: /scripts\/dev-all-with-check\.mjs/g, to: 'scripts/commands/dev/dev-with-check.mjs' },
  
  // 测试脚本
  { from: /scripts\/test-deployment\.mjs/g, to: 'scripts/commands/test/deployment-test.mjs' },
  { from: /scripts\/test-eps-sharing\.mjs/g, to: 'scripts/commands/test/eps-test.mjs' },
  
  // 检查脚本
  { from: /scripts\/check-circular-deps\.mjs/g, to: 'scripts/commands/check/check-circular-deps.mjs' },
  { from: /scripts\/check-i18n-keys\.js/g, to: 'scripts/commands/check/check-i18n-keys.js' },
  
  // 工具脚本
  { from: /scripts\/clean-cache\.mjs/g, to: 'scripts/commands/tools/clean-cache.mjs' },
  { from: /scripts\/clean-vite-cache\.mjs/g, to: 'scripts/commands/tools/clean-vite-cache.mjs' },
  { from: /scripts\/upload-app-to-cdn\.mjs/g, to: 'scripts/commands/tools/upload-app-to-cdn.mjs' },
  { from: /scripts\/copy-eps-from-system\.mjs/g, to: 'scripts/commands/tools/copy-eps-from-system.mjs' },
  
  // 发布脚本
  { from: /scripts\/release-version\.mjs/g, to: 'scripts/commands/release/version.mjs' },
  { from: /scripts\/release-push\.mjs/g, to: 'scripts/commands/release/push.mjs' },
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
    for (const mapping of scriptMappings) {
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

#!/usr/bin/env node

/**
 * 检查项目关键架构部分的 CHANGELOG 和 README 文档覆盖情况
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../..');

// 关键架构部分
const criticalPaths = {
  // 根目录
  root: {
    path: rootDir,
    name: '项目根目录',
    required: true,
  },
  // 应用
  apps: {
    mainApp: { path: join(rootDir, 'apps/main-app'), name: '主应用 (main-app)', required: true },
    systemApp: { path: join(rootDir, 'apps/system-app'), name: '系统应用 (system-app)', required: true },
    layoutApp: { path: join(rootDir, 'apps/layout-app'), name: '布局应用 (layout-app)', required: true },
    adminApp: { path: join(rootDir, 'apps/admin-app'), name: '管理应用 (admin-app)', required: true },
    logisticsApp: { path: join(rootDir, 'apps/logistics-app'), name: '物流应用 (logistics-app)', required: true },
    productionApp: { path: join(rootDir, 'apps/production-app'), name: '生产应用 (production-app)', required: true },
    qualityApp: { path: join(rootDir, 'apps/quality-app'), name: '品质应用 (quality-app)', required: true },
    engineeringApp: { path: join(rootDir, 'apps/engineering-app'), name: '工程应用 (engineering-app)', required: true },
    financeApp: { path: join(rootDir, 'apps/finance-app'), name: '财务应用 (finance-app)', required: true },
    operationsApp: { path: join(rootDir, 'apps/operations-app'), name: '运营应用 (operations-app)', required: true },
    personnelApp: { path: join(rootDir, 'apps/personnel-app'), name: '人事应用 (personnel-app)', required: true },
    dashboardApp: { path: join(rootDir, 'apps/dashboard-app'), name: '仪表盘应用 (dashboard-app)', required: true },
    homeApp: { path: join(rootDir, 'apps/home-app'), name: '首页应用 (home-app)', required: true },
    docsApp: { path: join(rootDir, 'apps/docs-app'), name: '文档应用 (docs-app)', required: true },
  },
  // 共享包
  packages: {
    sharedCore: { path: join(rootDir, 'packages/shared-core'), name: '共享核心包 (shared-core)', required: true },
    sharedComponents: { path: join(rootDir, 'packages/shared-components'), name: '共享组件包 (shared-components)', required: true },
    sharedUtils: { path: join(rootDir, 'packages/shared-utils'), name: '共享工具包 (shared-utils)', required: true },
    sharedRouter: { path: join(rootDir, 'packages/shared-router'), name: '共享路由包 (shared-router)', required: true },
    vitePlugin: { path: join(rootDir, 'packages/vite-plugin'), name: 'Vite插件包 (vite-plugin)', required: true },
    designTokens: { path: join(rootDir, 'packages/design-tokens'), name: '设计令牌包 (design-tokens)', required: true },
  },
  // 重要目录
  directories: {
    scripts: { path: join(rootDir, 'scripts'), name: '脚本目录 (scripts)', required: true },
    configs: { path: join(rootDir, 'configs'), name: '配置目录 (configs)', required: true },
    auth: { path: join(rootDir, 'auth'), name: '认证目录 (auth)', required: false },
  },
};

function checkDocs(path, name) {
  const changelogPath = join(path, 'CHANGELOG.md');
  const readmePath = join(path, 'README.md');
  
  const hasChangelog = existsSync(changelogPath);
  const hasReadme = existsSync(readmePath);
  
  // 检查文件内容是否为空或只有基本内容
  let changelogContent = '';
  let readmeContent = '';
  
  if (hasChangelog) {
    try {
      changelogContent = readFileSync(changelogPath, 'utf-8').trim();
    } catch (e) {
      // 忽略读取错误
    }
  }
  
  if (hasReadme) {
    try {
      readmeContent = readFileSync(readmePath, 'utf-8').trim();
    } catch (e) {
      // 忽略读取错误
    }
  }
  
  const changelogIsEmpty = hasChangelog && changelogContent.length < 100;
  const readmeIsEmpty = hasReadme && readmeContent.length < 100;
  
  return {
    hasChangelog,
    hasReadme,
    changelogIsEmpty,
    readmeIsEmpty,
    changelogPath,
    readmePath,
  };
}

function generateReport() {
  console.log('\n📋 文档覆盖情况检查报告\n');
  console.log('='.repeat(80));
  
  const results = {
    total: 0,
    hasBoth: 0,
    missingChangelog: 0,
    missingReadme: 0,
    missingBoth: 0,
    emptyChangelog: 0,
    emptyReadme: 0,
  };
  
  const missing = [];
  const empty = [];
  
  // 检查根目录
  console.log('\n📁 根目录');
  console.log('-'.repeat(80));
  const rootCheck = checkDocs(criticalPaths.root.path, criticalPaths.root.name);
  results.total++;
  if (rootCheck.hasChangelog && rootCheck.hasReadme) {
    results.hasBoth++;
    console.log(`✅ ${criticalPaths.root.name}: 有 CHANGELOG.md 和 README.md`);
  } else {
    if (!rootCheck.hasChangelog) {
      results.missingChangelog++;
      missing.push({ path: criticalPaths.root.path, name: criticalPaths.root.name, type: 'CHANGELOG.md' });
    }
    if (!rootCheck.hasReadme) {
      results.missingReadme++;
      missing.push({ path: criticalPaths.root.path, name: criticalPaths.root.name, type: 'README.md' });
    }
    console.log(`❌ ${criticalPaths.root.name}: 缺少文档`);
  }
  
  // 检查应用
  console.log('\n📱 应用目录');
  console.log('-'.repeat(80));
  for (const [key, app] of Object.entries(criticalPaths.apps)) {
    if (!existsSync(app.path)) {
      console.log(`⏭️  ${app.name}: 目录不存在，跳过`);
      continue;
    }
    
    results.total++;
    const check = checkDocs(app.path, app.name);
    
    if (check.hasChangelog && check.hasReadme) {
      if (check.changelogIsEmpty || check.readmeIsEmpty) {
        if (check.changelogIsEmpty) {
          results.emptyChangelog++;
          empty.push({ path: app.path, name: app.name, type: 'CHANGELOG.md' });
        }
        if (check.readmeIsEmpty) {
          results.emptyReadme++;
          empty.push({ path: app.path, name: app.name, type: 'README.md' });
        }
        console.log(`⚠️  ${app.name}: 有文档但内容较少`);
      } else {
        results.hasBoth++;
        console.log(`✅ ${app.name}: 有 CHANGELOG.md 和 README.md`);
      }
    } else {
      if (!check.hasChangelog) {
        results.missingChangelog++;
        missing.push({ path: app.path, name: app.name, type: 'CHANGELOG.md' });
      }
      if (!check.hasReadme) {
        results.missingReadme++;
        missing.push({ path: app.path, name: app.name, type: 'README.md' });
      }
      if (!check.hasChangelog && !check.hasReadme) {
        results.missingBoth++;
      }
      console.log(`❌ ${app.name}: 缺少文档`);
    }
  }
  
  // 检查共享包
  console.log('\n📦 共享包目录');
  console.log('-'.repeat(80));
  for (const [key, pkg] of Object.entries(criticalPaths.packages)) {
    if (!existsSync(pkg.path)) {
      console.log(`⏭️  ${pkg.name}: 目录不存在，跳过`);
      continue;
    }
    
    results.total++;
    const check = checkDocs(pkg.path, pkg.name);
    
    if (check.hasChangelog && check.hasReadme) {
      if (check.changelogIsEmpty || check.readmeIsEmpty) {
        if (check.changelogIsEmpty) {
          results.emptyChangelog++;
          empty.push({ path: pkg.path, name: pkg.name, type: 'CHANGELOG.md' });
        }
        if (check.readmeIsEmpty) {
          results.emptyReadme++;
          empty.push({ path: pkg.path, name: pkg.name, type: 'README.md' });
        }
        console.log(`⚠️  ${pkg.name}: 有文档但内容较少`);
      } else {
        results.hasBoth++;
        console.log(`✅ ${pkg.name}: 有 CHANGELOG.md 和 README.md`);
      }
    } else {
      if (!check.hasChangelog) {
        results.missingChangelog++;
        missing.push({ path: pkg.path, name: pkg.name, type: 'CHANGELOG.md' });
      }
      if (!check.hasReadme) {
        results.missingReadme++;
        missing.push({ path: pkg.path, name: pkg.name, type: 'README.md' });
      }
      if (!check.hasChangelog && !check.hasReadme) {
        results.missingBoth++;
      }
      console.log(`❌ ${pkg.name}: 缺少文档`);
    }
  }
  
  // 检查重要目录
  console.log('\n📂 重要目录');
  console.log('-'.repeat(80));
  for (const [key, dir] of Object.entries(criticalPaths.directories)) {
    if (!existsSync(dir.path)) {
      console.log(`⏭️  ${dir.name}: 目录不存在，跳过`);
      continue;
    }
    
    if (dir.required) {
      results.total++;
      const check = checkDocs(dir.path, dir.name);
      
      if (check.hasChangelog && check.hasReadme) {
        if (check.changelogIsEmpty || check.readmeIsEmpty) {
          if (check.changelogIsEmpty) {
            results.emptyChangelog++;
            empty.push({ path: dir.path, name: dir.name, type: 'CHANGELOG.md' });
          }
          if (check.readmeIsEmpty) {
            results.emptyReadme++;
            empty.push({ path: dir.path, name: dir.name, type: 'README.md' });
          }
          console.log(`⚠️  ${dir.name}: 有文档但内容较少`);
        } else {
          results.hasBoth++;
          console.log(`✅ ${dir.name}: 有 CHANGELOG.md 和 README.md`);
        }
      } else {
        if (!check.hasChangelog) {
          results.missingChangelog++;
          missing.push({ path: dir.path, name: dir.name, type: 'CHANGELOG.md' });
        }
        if (!check.hasReadme) {
          results.missingReadme++;
          missing.push({ path: dir.path, name: dir.name, type: 'README.md' });
        }
        if (!check.hasChangelog && !check.hasReadme) {
          results.missingBoth++;
        }
        console.log(`❌ ${dir.name}: 缺少文档`);
      }
    }
  }
  
  // 统计报告
  console.log('\n📊 统计报告');
  console.log('='.repeat(80));
  console.log(`总检查项: ${results.total}`);
  console.log(`✅ 完整文档: ${results.hasBoth} (${((results.hasBoth / results.total) * 100).toFixed(1)}%)`);
  console.log(`❌ 缺少 CHANGELOG: ${results.missingChangelog}`);
  console.log(`❌ 缺少 README: ${results.missingReadme}`);
  console.log(`❌ 两者都缺少: ${results.missingBoth}`);
  console.log(`⚠️  内容较少的 CHANGELOG: ${results.emptyChangelog}`);
  console.log(`⚠️  内容较少的 README: ${results.emptyReadme}`);
  
  // 缺失文档列表
  if (missing.length > 0) {
    console.log('\n❌ 缺失文档列表');
    console.log('-'.repeat(80));
    const missingByType = { 'CHANGELOG.md': [], 'README.md': [] };
    missing.forEach(item => {
      missingByType[item.type].push(item);
    });
    
    if (missingByType['CHANGELOG.md'].length > 0) {
      console.log('\n缺少 CHANGELOG.md:');
      missingByType['CHANGELOG.md'].forEach(item => {
        console.log(`  - ${item.name} (${item.path})`);
      });
    }
    
    if (missingByType['README.md'].length > 0) {
      console.log('\n缺少 README.md:');
      missingByType['README.md'].forEach(item => {
        console.log(`  - ${item.name} (${item.path})`);
      });
    }
  }
  
  // 内容较少的文档列表
  if (empty.length > 0) {
    console.log('\n⚠️  内容较少的文档列表');
    console.log('-'.repeat(80));
    const emptyByType = { 'CHANGELOG.md': [], 'README.md': [] };
    empty.forEach(item => {
      emptyByType[item.type].push(item);
    });
    
    if (emptyByType['CHANGELOG.md'].length > 0) {
      console.log('\n内容较少的 CHANGELOG.md:');
      emptyByType['CHANGELOG.md'].forEach(item => {
        console.log(`  - ${item.name} (${item.path})`);
      });
    }
    
    if (emptyByType['README.md'].length > 0) {
      console.log('\n内容较少的 README.md:');
      emptyByType['README.md'].forEach(item => {
        console.log(`  - ${item.name} (${item.path})`);
      });
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 建议:');
  console.log('1. 为所有关键架构部分创建 CHANGELOG.md 和 README.md');
  console.log('2. CHANGELOG.md 应记录架构变更、API 变更、破坏性变更等');
  console.log('3. README.md 应包含架构说明、使用指南、API 文档等');
  console.log('4. 使用脚本自动生成文档模板: node scripts/commands/tools/generate-docs-template.mjs <path>\n');
  
  return results;
}

// 执行检查
generateReport();

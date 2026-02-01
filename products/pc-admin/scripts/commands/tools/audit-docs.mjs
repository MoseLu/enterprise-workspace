#!/usr/bin/env node

/**
 * 文档审计脚本
 * 确保项目文档不多也不少：
 * 1. 检查关键架构部分是否有必要的 CHANGELOG.md 和 README.md
 * 2. 检查是否有冗余或重复的文档
 * 3. 检查是否有过时或应该归档的文档
 */

import { existsSync, readFileSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../..');

// 关键架构部分（必须有的文档）
const criticalPaths = {
  root: { path: rootDir, name: '项目根目录', required: true },
  apps: {
    mainApp: { path: join(rootDir, 'apps/main-app'), name: '主应用', required: true },
    systemApp: { path: join(rootDir, 'apps/system-app'), name: '系统应用', required: true },
    layoutApp: { path: join(rootDir, 'apps/layout-app'), name: '布局应用', required: true },
    adminApp: { path: join(rootDir, 'apps/admin-app'), name: '管理应用', required: true },
    logisticsApp: { path: join(rootDir, 'apps/logistics-app'), name: '物流应用', required: true },
    productionApp: { path: join(rootDir, 'apps/production-app'), name: '生产应用', required: true },
    qualityApp: { path: join(rootDir, 'apps/quality-app'), name: '品质应用', required: true },
    engineeringApp: { path: join(rootDir, 'apps/engineering-app'), name: '工程应用', required: true },
    financeApp: { path: join(rootDir, 'apps/finance-app'), name: '财务应用', required: true },
    operationsApp: { path: join(rootDir, 'apps/operations-app'), name: '运营应用', required: true },
    personnelApp: { path: join(rootDir, 'apps/personnel-app'), name: '人事应用', required: true },
    dashboardApp: { path: join(rootDir, 'apps/dashboard-app'), name: '仪表盘应用', required: true },
    homeApp: { path: join(rootDir, 'apps/home-app'), name: '首页应用', required: true },
    docsApp: { path: join(rootDir, 'apps/docs-app'), name: '文档应用', required: true },
  },
  packages: {
    sharedCore: { path: join(rootDir, 'packages/shared-core'), name: '共享核心包', required: true },
    sharedComponents: { path: join(rootDir, 'packages/shared-components'), name: '共享组件包', required: true },
    sharedRouter: { path: join(rootDir, 'packages/shared-router'), name: '共享路由包', required: true },
    vitePlugin: { path: join(rootDir, 'packages/vite-plugin'), name: 'Vite插件包', required: true },
    designTokens: { path: join(rootDir, 'packages/design-tokens'), name: '设计令牌包', required: true },
  },
  directories: {
    scripts: { path: join(rootDir, 'scripts'), name: '脚本目录', required: true },
    configs: { path: join(rootDir, 'configs'), name: '配置目录', required: true },
  },
};

// 已知的冗余或应该归档的文档模式
const redundantPatterns = [
  // 迁移完成文档（应该归档）
  { pattern: /MIGRATION_(COMPLETE|SUMMARY|MILESTONES|CURRENT_STATE|PROGRESS|EXECUTION_GUIDE|INDEX|ATOMIC_STEPS)\.md$/i, reason: '迁移完成文档，应归档' },
  { pattern: /IMPLEMENTATION_(COMPLETE|STATUS)\.md$/i, reason: '实施完成文档，应归档' },
  { pattern: /PLAN_EXECUTION_SUMMARY\.md$/i, reason: '计划执行总结，应归档' },
  { pattern: /FINAL_VERIFICATION\.md$/i, reason: '最终验证文档，应归档' },
  // 错误报告（临时文件）
  { pattern: /ts-error-reports|lint-error-reports/i, reason: '错误报告，临时文件不应纳入版本控制' },
  // 重复的文档（docs 和 docs-app/docs-sources 中的重复）
  { pattern: /docs-sources\/global\/(development|architecture|guides)\//, reason: '文档源文件，已同步到 docs-app' },
];

// 检查文档是否存在且有内容
function checkDoc(path, name, docType) {
  const docPath = join(path, docType);
  if (!existsSync(docPath)) {
    return { exists: false, isEmpty: false, path: docPath };
  }
  
  try {
    const content = readFileSync(docPath, 'utf-8').trim();
    // 检查是否只有模板内容或非常少的内容
    const isEmpty = content.length < 200 || 
                    content.includes('待添加') || 
                    content.includes('简要描述') ||
                    content.includes('TODO');
    return { exists: true, isEmpty, path: docPath, size: content.length };
  } catch (error) {
    return { exists: true, isEmpty: true, path: docPath, error: error.message };
  }
}

// 检查冗余文档
function findRedundantDocs() {
  const redundant = [];
  
  // 检查根目录下的临时文档
  const rootFiles = [
    'CONSOLE_TO_LOGGER_MIGRATION_REPORT.md',
    'MIGRATION_COMPLETE_SUMMARY.md',
    'LOGGING_LIBRARY_ANALYSIS.md',
  ];
  
  rootFiles.forEach(file => {
    const filePath = join(rootDir, file);
    if (existsSync(filePath)) {
      redundant.push({
        path: filePath,
        reason: '迁移完成文档，应移至 docs/archive/migrations/',
        type: 'migration',
      });
    }
  });
  
  // 检查 design-tokens 中的迁移文档
  const designTokensPath = join(rootDir, 'packages/design-tokens');
  if (existsSync(designTokensPath)) {
    try {
      const files = execSync(`dir /b "${designTokensPath}"`, { encoding: 'utf-8', shell: true }).split('\n');
      files.forEach(file => {
        const fileName = file.trim();
        for (const pattern of redundantPatterns) {
          if (pattern.pattern.test(fileName)) {
            redundant.push({
              path: join(designTokensPath, fileName),
              reason: pattern.reason,
              type: 'migration',
            });
          }
        }
      });
    } catch (error) {
      // 忽略错误
    }
  }
  
  return redundant;
}

// 生成审计报告
function generateAuditReport() {
  console.log('\n📋 文档审计报告\n');
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
  const rootCheck = {
    changelog: checkDoc(criticalPaths.root.path, criticalPaths.root.name, 'CHANGELOG.md'),
    readme: checkDoc(criticalPaths.root.path, criticalPaths.root.name, 'README.md'),
  };
  results.total++;
  if (rootCheck.changelog.exists && rootCheck.readme.exists && !rootCheck.changelog.isEmpty && !rootCheck.readme.isEmpty) {
    results.hasBoth++;
    console.log(`✅ ${criticalPaths.root.name}: 有完整的 CHANGELOG.md 和 README.md`);
  } else {
    if (!rootCheck.changelog.exists || rootCheck.changelog.isEmpty) {
      if (!rootCheck.changelog.exists) {
        results.missingChangelog++;
        missing.push({ path: criticalPaths.root.path, name: criticalPaths.root.name, type: 'CHANGELOG.md' });
      } else {
        results.emptyChangelog++;
        empty.push({ path: criticalPaths.root.path, name: criticalPaths.root.name, type: 'CHANGELOG.md' });
      }
    }
    if (!rootCheck.readme.exists || rootCheck.readme.isEmpty) {
      if (!rootCheck.readme.exists) {
        results.missingReadme++;
        missing.push({ path: criticalPaths.root.path, name: criticalPaths.root.name, type: 'README.md' });
      } else {
        results.emptyReadme++;
        empty.push({ path: criticalPaths.root.path, name: criticalPaths.root.name, type: 'README.md' });
      }
    }
    console.log(`❌ ${criticalPaths.root.name}: 文档不完整`);
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
    const check = {
      changelog: checkDoc(app.path, app.name, 'CHANGELOG.md'),
      readme: checkDoc(app.path, app.name, 'README.md'),
    };
    
    if (check.changelog.exists && check.readme.exists && !check.changelog.isEmpty && !check.readme.isEmpty) {
      results.hasBoth++;
      console.log(`✅ ${app.name}: 有完整的文档`);
    } else {
      if (!check.changelog.exists) {
        results.missingChangelog++;
        missing.push({ path: app.path, name: app.name, type: 'CHANGELOG.md' });
      } else if (check.changelog.isEmpty) {
        results.emptyChangelog++;
        empty.push({ path: app.path, name: app.name, type: 'CHANGELOG.md' });
      }
      if (!check.readme.exists) {
        results.missingReadme++;
        missing.push({ path: app.path, name: app.name, type: 'README.md' });
      } else if (check.readme.isEmpty) {
        results.emptyReadme++;
        empty.push({ path: app.path, name: app.name, type: 'README.md' });
      }
      if (!check.changelog.exists && !check.readme.exists) {
        results.missingBoth++;
      }
      console.log(`❌ ${app.name}: 文档不完整`);
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
    const check = {
      changelog: checkDoc(pkg.path, pkg.name, 'CHANGELOG.md'),
      readme: checkDoc(pkg.path, pkg.name, 'README.md'),
    };
    
    if (check.changelog.exists && check.readme.exists && !check.changelog.isEmpty && !check.readme.isEmpty) {
      results.hasBoth++;
      console.log(`✅ ${pkg.name}: 有完整的文档`);
    } else {
      if (!check.changelog.exists) {
        results.missingChangelog++;
        missing.push({ path: pkg.path, name: pkg.name, type: 'CHANGELOG.md' });
      } else if (check.changelog.isEmpty) {
        results.emptyChangelog++;
        empty.push({ path: pkg.path, name: pkg.name, type: 'CHANGELOG.md' });
      }
      if (!check.readme.exists) {
        results.missingReadme++;
        missing.push({ path: pkg.path, name: pkg.name, type: 'README.md' });
      } else if (check.readme.isEmpty) {
        results.emptyReadme++;
        empty.push({ path: pkg.path, name: pkg.name, type: 'README.md' });
      }
      if (!check.changelog.exists && !check.readme.exists) {
        results.missingBoth++;
      }
      console.log(`❌ ${pkg.name}: 文档不完整`);
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
      const check = {
        changelog: checkDoc(dir.path, dir.name, 'CHANGELOG.md'),
        readme: checkDoc(dir.path, dir.name, 'README.md'),
      };
      
      if (check.changelog.exists && check.readme.exists && !check.changelog.isEmpty && !check.readme.isEmpty) {
        results.hasBoth++;
        console.log(`✅ ${dir.name}: 有完整的文档`);
      } else {
        if (!check.changelog.exists) {
          results.missingChangelog++;
          missing.push({ path: dir.path, name: dir.name, type: 'CHANGELOG.md' });
        } else if (check.changelog.isEmpty) {
          results.emptyChangelog++;
          empty.push({ path: dir.path, name: dir.name, type: 'CHANGELOG.md' });
        }
        if (!check.readme.exists) {
          results.missingReadme++;
          missing.push({ path: dir.path, name: dir.name, type: 'README.md' });
        } else if (check.readme.isEmpty) {
          results.emptyReadme++;
          empty.push({ path: dir.path, name: dir.name, type: 'README.md' });
        }
        if (!check.changelog.exists && !check.readme.exists) {
          results.missingBoth++;
        }
        console.log(`❌ ${dir.name}: 文档不完整`);
      }
    }
  }
  
  // 检查冗余文档
  console.log('\n🔍 冗余文档检查');
  console.log('-'.repeat(80));
  const redundant = findRedundantDocs();
  
  if (redundant.length > 0) {
    console.log(`⚠️  发现 ${redundant.length} 个可能冗余的文档：`);
    redundant.forEach(item => {
      const relPath = relative(rootDir, item.path);
      console.log(`  - ${relPath}`);
      console.log(`    原因: ${item.reason}`);
    });
  } else {
    console.log('✅ 未发现明显的冗余文档');
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
  console.log(`⚠️  冗余文档: ${redundant.length}`);
  
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
        const relPath = relative(rootDir, item.path);
        console.log(`  - ${item.name} (${relPath})`);
      });
    }
    
    if (missingByType['README.md'].length > 0) {
      console.log('\n缺少 README.md:');
      missingByType['README.md'].forEach(item => {
        const relPath = relative(rootDir, item.path);
        console.log(`  - ${item.name} (${relPath})`);
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
        const relPath = relative(rootDir, item.path);
        console.log(`  - ${item.name} (${relPath})`);
      });
    }
    
    if (emptyByType['README.md'].length > 0) {
      console.log('\n内容较少的 README.md:');
      emptyByType['README.md'].forEach(item => {
        const relPath = relative(rootDir, item.path);
        console.log(`  - ${item.name} (${relPath})`);
      });
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 建议:');
  console.log('1. 为所有关键架构部分创建完整的 CHANGELOG.md 和 README.md');
  console.log('2. 使用 pnpm docs:generate:all 批量生成文档模板');
  console.log('3. 编辑生成的文档，添加具体内容');
  console.log('4. 考虑归档或清理冗余文档\n');
  
  // 返回结果
  return {
    results,
    missing,
    empty,
    redundant,
    isComplete: results.hasBoth === results.total && redundant.length === 0,
  };
}

// 执行审计
const auditResult = generateAuditReport();

// 如果文档不完整，退出码为 1
if (!auditResult.isComplete) {
  process.exit(1);
}

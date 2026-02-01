#!/usr/bin/env node

/**
 * 分类未使用的脚本并生成确认清单
 * 帮助用户决定哪些脚本需要保留，哪些可以归档
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const scriptsDir = join(rootDir, 'scripts');

// 未使用的脚本列表（从分析结果获取）
const unusedScripts = [
  'analyze-i18n-keys.js',
  'analyze-script-usage.mjs',
  'apps-manager.mjs',
  'backup.sh',
  'btc-backup.sh',
  'btc-maintenance.sh',
  'build-and-verify-admin.mjs',
  'build-preview-all.js',
  'check-admin-refs.mjs',
  'check-and-fix-cert.sh',
  'check-baota-nginx.sh',
  'check-deployed-files.sh',
  'check-dynamic-import-cdn.mjs',
  'check-layout-load-order.mjs',
  'check-ports.mjs',
  'check-src-artifacts.mjs',
  'check-src-directory-structure.mjs',
  'check-ssl-bundle.sh',
  'check-verdaccio-status.ps1',
  'check-verdaccio-status.sh',
  'cleanup-docs.ps1',
  'commands/config.mjs',
  'commands/utils.mjs',
  'copy-eps-from-system.sh',
  'debug-releases.sh',
  'debug-token.sh',
  'deploy-config.example.sh',
  'deploy-local.sh',
  'deploy-manual.sh',
  'deploy-safari-cert.sh',
  'deploy.sh',
  'diagnose-404.sh',
  'diagnose-admin-404-server.sh',
  'diagnose-admin-404.sh',
  'diagnose-container.sh',
  'diagnose-mobile-domain.sh',
  'diagnose-nginx.sh',
  'diagnose-ssl-connection.sh',
  'find-nginx-config.sh',
  'fix-cert-chain.sh',
  'fix-ssl-bundle.sh',
  'fix-ssl-issues.sh',
  'force-rebuild-mobile.js',
  'force-redeploy.sh',
  'generate-test-report.mjs',
  'i18n/migrate-flat-to-nested.mjs',
  'icon-diff.mjs',
  'icon-usage.mjs',
  'kill-dev-ports.ps1',
  'merge-certs-for-safari.ps1',
  'merge-certs-for-safari.sh',
  'migrate-console-to-logger.mjs',
  'migrate-routes-to-modules.mjs',
  'migrate-to-releases-on-server.sh',
  'migrate-to-releases.sh',
  'optimize-ssl-bundle.sh',
  'prepare-publish.ps1',
  'publish-to-verdaccio.ps1',
  'quick-commit.ps1',
  'quick-commit.sh',
  'refactor-page-components.mjs',
  'reorganize-all-locales.js',
  'reorganize-locale.js',
  'run-without-env.js',
  'set-oss-env.ps1',
  'setup-private-registry.sh',
  'start-verdaccio.ps1',
  'subdomain-redirect.js',
  'sync-docs-to-vitepress.mjs',
  'test-eps-sharing.mjs',
  'trigger-deployment-test.sh',
  'upload-icons-to-oss.mjs',
  'validate-commit-msg.js',
  'validate-docs.mjs',
  'verify-admin-build.mjs',
  'verify-admin-refs.mjs',
  'verify-all-refs.mjs',
  'verify-build-assets.mjs',
  'verify-mobile-build.js',
  'verify-safari-cert.sh',
  'version-packages.ps1',
  'version-packages.sh',
];

// 脚本分类定义
const categories = {
  '一次性迁移脚本': {
    description: '已完成的一次性代码迁移脚本，通常不再需要',
    scripts: [],
  },
  'SSL/证书修复脚本': {
    description: '用于修复SSL证书问题的脚本，如果问题已解决可归档',
    scripts: [],
  },
  '诊断/调试脚本': {
    description: '用于诊断和调试问题的脚本，可能在手动排查时使用',
    scripts: [],
  },
  '验证/检查脚本': {
    description: '用于验证构建、引用等的脚本，可能在某些场景下使用',
    scripts: [],
  },
  '工具/辅助脚本': {
    description: '各种工具和辅助脚本，可能偶尔使用',
    scripts: [],
  },
  '备份/维护脚本': {
    description: '备份和维护相关的脚本',
    scripts: [],
  },
  '部署相关脚本': {
    description: '部署相关的脚本（未被引用的）',
    scripts: [],
  },
  '开发工具脚本': {
    description: '开发时使用的工具脚本',
    scripts: [],
  },
  '需要保留的工具': {
    description: '被其他脚本导入使用的工具脚本，需要保留',
    scripts: [],
  },
  '其他': {
    description: '其他未分类的脚本',
    scripts: [],
  },
};

// 分析脚本并分类
function analyzeAndClassify() {
  for (const script of unusedScripts) {
    const fullPath = join(scriptsDir, script);
    let content = '';
    let firstLines = '';
    
    try {
      if (existsSync(fullPath)) {
        content = readFileSync(fullPath, 'utf-8');
        firstLines = content.split('\n').slice(0, 20).join('\n');
      }
    } catch (error) {
      // 忽略读取错误
    }
    
    const name = script.toLowerCase();
    const basename = script.split('/').pop().toLowerCase();
    
    // 分类逻辑
    if (name.includes('migrate') || name.includes('reorganize') || name.includes('refactor')) {
      if (name.includes('console-to-logger') || name.includes('routes-to-modules') || 
          name.includes('reorganize') || name.includes('refactor')) {
        categories['一次性迁移脚本'].scripts.push({
          name: script,
          description: getScriptDescription(script, firstLines),
          reason: '已完成的一次性迁移/重构脚本',
        });
        continue;
      }
    }
    
    if (name.includes('ssl') || name.includes('cert') || name.includes('certificate')) {
      categories['SSL/证书修复脚本'].scripts.push({
        name: script,
        description: getScriptDescription(script, firstLines),
        reason: 'SSL/证书相关脚本',
      });
      continue;
    }
    
    if (name.includes('diagnose') || name.includes('debug') || name.includes('find-nginx')) {
      categories['诊断/调试脚本'].scripts.push({
        name: script,
        description: getScriptDescription(script, firstLines),
        reason: '诊断/调试工具',
      });
      continue;
    }
    
    if (name.includes('verify') || name.includes('check-') && !name.includes('check-circular') && !name.includes('check-i18n')) {
      categories['验证/检查脚本'].scripts.push({
        name: script,
        description: getScriptDescription(script, firstLines),
        reason: '验证/检查工具',
      });
      continue;
    }
    
    if (name.includes('backup') || name.includes('maintenance')) {
      categories['备份/维护脚本'].scripts.push({
        name: script,
        description: getScriptDescription(script, firstLines),
        reason: '备份/维护相关',
      });
      continue;
    }
    
    if (name.includes('deploy') && !name.includes('deploy-static') && !name.includes('deploy-app-local') && !name.includes('deploy-incremental')) {
      categories['部署相关脚本'].scripts.push({
        name: script,
        description: getScriptDescription(script, firstLines),
        reason: '部署相关（未被引用）',
      });
      continue;
    }
    
    if (name.includes('icon') || name.includes('analyze') || name.includes('generate-test') || 
        name.includes('validate-commit') || name.includes('validate-docs') || 
        name.includes('sync-docs') || name.includes('subdomain')) {
      categories['工具/辅助脚本'].scripts.push({
        name: script,
        description: getScriptDescription(script, firstLines),
        reason: '工具/辅助功能',
      });
      continue;
    }
    
    if (name.includes('dev') || name.includes('kill-dev') || name.includes('run-without-env')) {
      categories['开发工具脚本'].scripts.push({
        name: script,
        description: getScriptDescription(script, firstLines),
        reason: '开发工具',
      });
      continue;
    }
    
    if (name === 'apps-manager.mjs' || name.includes('commands/config') || name.includes('commands/utils')) {
      categories['需要保留的工具'].scripts.push({
        name: script,
        description: getScriptDescription(script, firstLines),
        reason: '被其他脚本导入使用',
      });
      continue;
    }
    
    // 其他
    categories['其他'].scripts.push({
      name: script,
      description: getScriptDescription(script, firstLines),
      reason: '未分类',
    });
  }
}

// 获取脚本描述
function getScriptDescription(script, content) {
  // 尝试从注释中提取描述
  const commentMatch = content.match(/\*\s*(.+?)(?:\n|$)/);
  if (commentMatch) {
    return commentMatch[1].trim();
  }
  
  // 根据文件名推断
  const name = script.toLowerCase();
  if (name.includes('migrate-console-to-logger')) return '将 console 迁移到 logger';
  if (name.includes('migrate-routes-to-modules')) return '将路由迁移到模块结构';
  if (name.includes('reorganize-locale')) return '重新组织国际化文件';
  if (name.includes('refactor-page-components')) return '重构页面组件';
  if (name.includes('diagnose-404')) return '诊断 404 错误';
  if (name.includes('diagnose-nginx')) return '诊断 Nginx 配置';
  if (name.includes('fix-ssl')) return '修复 SSL 证书问题';
  if (name.includes('verify-admin')) return '验证 admin 应用构建';
  if (name.includes('icon-usage')) return '分析图标使用情况';
  if (name.includes('apps-manager')) return '应用管理工具（被其他脚本导入）';
  
  return '查看脚本内容了解详情';
}

// 生成确认清单
function generateChecklist() {
  analyzeAndClassify();
  
  console.log('='.repeat(80));
  console.log('📋 未使用脚本分类确认清单');
  console.log('='.repeat(80));
  console.log(`\n总共 ${unusedScripts.length} 个未使用的脚本，已按类别分类。`);
  console.log('请确认每个脚本是否需要保留。\n');
  
  let totalCount = 0;
  for (const [category, data] of Object.entries(categories)) {
    if (data.scripts.length === 0) continue;
    
    totalCount += data.scripts.length;
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📁 ${category} (${data.scripts.length} 个)`);
    console.log(`   ${data.description}`);
    console.log('='.repeat(80));
    
    data.scripts.forEach((script, index) => {
      console.log(`\n[${index + 1}] ${script.name}`);
      console.log(`    作用: ${script.description}`);
      console.log(`    分类原因: ${script.reason}`);
    });
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`总计: ${totalCount} 个脚本`);
  console.log('='.repeat(80));
  
  // 生成 JSON 格式的清单文件
  const checklist = {
    generatedAt: new Date().toISOString(),
    totalScripts: unusedScripts.length,
    categories: {},
  };
  
  for (const [category, data] of Object.entries(categories)) {
    if (data.scripts.length > 0) {
      checklist.categories[category] = {
        description: data.description,
        scripts: data.scripts.map(s => ({
          name: s.name,
          description: s.description,
          reason: s.reason,
          keep: null, // 待用户确认
        })),
      };
    }
  }
  
  const checklistPath = join(scriptsDir, 'UNUSED_SCRIPTS_CHECKLIST.json');
  writeFileSync(checklistPath, JSON.stringify(checklist, null, 2), 'utf-8');
  
  console.log(`\n✅ 已生成确认清单文件: scripts/UNUSED_SCRIPTS_CHECKLIST.json`);
  console.log('   您可以在该文件中标记每个脚本是否需要保留（keep: true/false）\n');
}

// 主函数
try {
  generateChecklist();
} catch (error) {
  console.error('❌ 生成清单失败:', error);
  process.exit(1);
}

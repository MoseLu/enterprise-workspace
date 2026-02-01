#!/usr/bin/env node

/**
 * 生成详细的脚本确认清单
 * 读取每个脚本的内容，提取准确的描述和作用
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const scriptsDir = join(rootDir, 'scripts');

// 未使用的脚本列表
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

// 提取脚本描述
function extractDescription(scriptPath, content) {
  // 尝试从注释中提取（改进的正则）
  const commentPatterns = [
    /\/\*\*\s*\n\s*\*\s*(.+?)(?:\n\s*\*|$)/s,
    /\/\*\*\s*(.+?)(?:\*\/|$)/s,
    /\/\/\s*(.+?)(?:\n|$)/m,
    /#\s*(.+?)(?:\n|$)/m,
    /^\s*\*\s*(.+?)(?:\n|$)/m,
  ];
  
  for (const pattern of commentPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      let desc = match[1].trim();
      // 清理常见的注释标记
      desc = desc.replace(/^\*\s*/, '').replace(/^#\s*/, '').replace(/^\/\/\s*/, '');
      if (desc && desc.length > 10 && desc.length < 300 && !desc.includes('@') && !desc.includes('import')) {
        return desc;
      }
    }
  }
  
  // 从文件名推断
  const name = scriptPath.toLowerCase();
  const descriptions = {
    'analyze-i18n-keys': '分析 i18n 键的使用情况，查找代码中的翻译键',
    'analyze-script-usage': '分析脚本使用情况（本工具）',
    'apps-manager': '应用管理工具，提供应用列表、过滤等功能（被 dev-all.mjs, build-preview.mjs 导入使用）',
    'build-and-verify-admin': '构建并验证 admin 应用',
    'build-preview-all': '构建所有应用的预览版本',
    'check-admin-refs': '检查 admin 应用构建产物中的引用',
    'check-ports': '检查所有应用的开发端口是否被占用',
    'check-dynamic-import-cdn': '检查构建产物中的动态导入是否按照三级降级策略进行资源引入',
    'check-layout-load-order': '检查 layout-app 的加载顺序和依赖关系',
    'check-src-artifacts': '检查并清理 src 目录下的构建产物（.js, .map 文件）',
    'check-src-directory-structure': '检查所有应用的 src 目录结构，确保不会同时存在 pages、views 和 modules 目录',
    'check-baota-nginx': '检查宝塔面板的 Nginx 配置',
    'check-deployed-files': '检查服务器上部署的文件是否正确',
    'check-verdaccio-status': '检查 Verdaccio 状态',
    'commands/config': '命令系统配置，定义所有命令类型、应用列表和命令映射（被 commands/index.mjs 导入）',
    'commands/utils': '命令系统工具函数，提供命令执行、错误处理等功能（被 commands/index.mjs 导入）',
    'copy-eps-from-system': '从 system-app 复制 EPS 文件',
    'debug-releases': '在服务器上运行此脚本，检查 releases 结构状态',
    'debug-token': '模拟构建脚本的环境和逻辑，调试 GITHUB_TOKEN 检测',
    'deploy-config.example': '部署配置示例文件（模板）',
    'deploy-local': '本地构建并部署脚本，通过 SCP 上传到服务器',
    'deploy-manual': '手动部署脚本，用于将 build-dist:all 生成的构建产物部署到服务器',
    'deploy-safari-cert': 'Safari 证书部署脚本，将优化后的证书部署到服务器',
    'deploy.sh': 'BTC ShopFlow 生产环境部署脚本，使用 Docker Compose 进行部署',
    'diagnose-404': '诊断 404 错误',
    'diagnose-admin-404': '诊断 admin.bellis.com.cn 的 404 问题，检查服务器上的实际文件和 vendor 文件中的引用',
    'diagnose-admin-404-server': '诊断 admin 应用 404 问题（服务器端运行版本）',
    'diagnose-container': '诊断 Docker 容器状态和 serve 服务，用于排查生产环境 500 错误',
    'diagnose-mobile-domain': '诊断 mobile.bellis.com.cn 域名配置问题',
    'diagnose-nginx': '诊断 Nginx 配置',
    'diagnose-ssl-connection': '诊断 SSL 连接问题',
    'find-nginx-config': '查找 Nginx 配置文件位置',
    'fix-cert-chain': '证书链修复脚本，保留所有中间证书，排除根证书',
    'fix-ssl-bundle': '修复 SSL bundle，用于修复 Safari 无法建立安全连接的问题',
    'fix-ssl-issues': '修复 SSL 问题',
    'force-rebuild-mobile': '强制重建 mobile 应用',
    'force-redeploy': '强制重新部署',
    'generate-test-report': '生成测试报告',
    'icon-diff': '图标差异对比',
    'icon-usage': '分析图标使用情况',
    'kill-dev-ports': '杀死开发端口进程',
    'migrate-console-to-logger': '将 console 迁移到 logger（一次性迁移）',
    'migrate-routes-to-modules': '将路由迁移到模块结构（一次性迁移）',
    'migrate-flat-to-nested': '将扁平化 i18n 转换为嵌套格式（一次性迁移）',
    'migrate-to-releases': '迁移到 releases 目录结构',
    'optimize-ssl-bundle': '优化 SSL bundle',
    'quick-commit': '快速提交到 develop 分支',
    'refactor-page-components': '重构页面组件（一次性重构）',
    'reorganize-locale': '重新组织国际化文件（一次性迁移）',
    'reorganize-all-locales': '重新组织所有国际化文件（一次性迁移）',
    'run-without-env': '无环境变量运行',
    'subdomain-redirect': '子域名重定向',
    'sync-docs-to-vitepress': '同步文档到 VitePress',
    'test-eps-sharing': '测试 EPS 数据共享功能',
    'trigger-deployment-test': '触发部署测试',
    'upload-icons-to-oss': '上传图标到 OSS',
    'validate-commit-msg': '验证提交信息格式（Conventional Commits）',
    'validate-docs': '验证文档格式',
    'verify-admin-build': '验证 admin 应用构建',
    'verify-admin-refs': '验证 admin 应用引用',
    'verify-all-refs': '验证所有应用引用',
    'verify-build-assets': '验证构建资源',
    'verify-mobile-build': '验证 mobile 应用构建',
    'verify-safari-cert': '验证 Safari 证书',
    'version-packages': '批量更新共享组件库版本号',
  };
  
  for (const [key, desc] of Object.entries(descriptions)) {
    if (name.includes(key)) {
      return desc;
    }
  }
  
  return '需要查看脚本内容确认';
}

// 分类脚本
function classifyScript(script) {
  const name = script.toLowerCase();
  
  // 需要保留的工具（被其他脚本导入）
  if (script === 'apps-manager.mjs' || script.includes('commands/config') || script.includes('commands/utils')) {
    return {
      category: '需要保留的工具',
      description: '被其他脚本导入使用的工具脚本，必须保留',
      priority: 'high',
    };
  }
  
  // 一次性迁移脚本
  if (name.includes('migrate-console') || name.includes('migrate-routes') || 
      name.includes('migrate-flat-to-nested') || name.includes('reorganize-locale') || 
      name.includes('reorganize-all-locales') || name.includes('refactor-page')) {
    return {
      category: '一次性迁移脚本',
      description: '已完成的一次性代码迁移/重构脚本，通常不再需要',
      priority: 'low',
    };
  }
  
  // SSL/证书修复脚本
  if (name.includes('ssl') || name.includes('cert') || name.includes('certificate') || 
      name.includes('safari-cert')) {
    return {
      category: 'SSL/证书修复脚本',
      description: '用于修复SSL证书问题的脚本，如果问题已解决可归档',
      priority: 'medium',
    };
  }
  
  // 诊断/调试脚本
  if (name.includes('diagnose') || name.includes('debug') || name.includes('find-nginx')) {
    return {
      category: '诊断/调试脚本',
      description: '用于诊断和调试问题的脚本，可能在手动排查时使用',
      priority: 'medium',
    };
  }
  
  // 验证/检查脚本
  if (name.includes('verify') || (name.includes('check-') && !name.includes('check-circular') && !name.includes('check-i18n'))) {
    return {
      category: '验证/检查脚本',
      description: '用于验证构建、引用等的脚本，可能在某些场景下使用',
      priority: 'medium',
    };
  }
  
  // 备份/维护脚本
  if (name.includes('backup') || name.includes('maintenance')) {
    return {
      category: '备份/维护脚本',
      description: '备份和维护相关的脚本',
      priority: 'low',
    };
  }
  
  // 部署相关脚本
  if (name.includes('deploy') && !name.includes('deploy-static') && !name.includes('deploy-app-local') && !name.includes('deploy-incremental')) {
    return {
      category: '部署相关脚本',
      description: '部署相关的脚本（未被引用的旧版本）',
      priority: 'low',
    };
  }
  
  // 开发工具脚本
  if (name.includes('dev') || name.includes('kill-dev') || name.includes('run-without-env') || name.includes('check-ports')) {
    return {
      category: '开发工具脚本',
      description: '开发时使用的工具脚本',
      priority: 'medium',
    };
  }
  
  // Verdaccio 相关
  if (name.includes('verdaccio') || name.includes('publish-to-verdaccio') || name.includes('start-verdaccio')) {
    return {
      category: 'Verdaccio 相关脚本',
      description: 'Verdaccio 私有仓库相关脚本',
      priority: 'medium',
    };
  }
  
  // 版本管理
  if (name.includes('version-packages') || name.includes('prepare-publish')) {
    return {
      category: '版本管理脚本',
      description: '版本号和发布相关脚本',
      priority: 'medium',
    };
  }
  
  // 工具/辅助脚本
  if (name.includes('analyze') || name.includes('icon') || name.includes('generate-test') || 
      name.includes('validate') || name.includes('sync-docs') || name.includes('subdomain') ||
      name.includes('upload-icons') || name.includes('test-eps')) {
    return {
      category: '工具/辅助脚本',
      description: '各种工具和辅助脚本，可能偶尔使用',
      priority: 'medium',
    };
  }
  
  // 其他
  return {
    category: '其他',
    description: '其他未分类的脚本',
    priority: 'low',
  };
}

// 生成详细清单
function generateDetailedChecklist() {
  const checklist = {
    generatedAt: new Date().toISOString(),
    totalScripts: unusedScripts.length,
    note: '请为每个脚本设置 keep: true（保留）或 keep: false（归档）',
    categories: {},
  };
  
  const categorized = {};
  
  // 分析每个脚本
  for (const script of unusedScripts) {
    const fullPath = join(scriptsDir, script);
    let content = '';
    
    try {
      if (existsSync(fullPath)) {
        content = readFileSync(fullPath, 'utf-8');
      }
    } catch (error) {
      // 忽略读取错误
    }
    
    const classification = classifyScript(script);
    const description = extractDescription(script, content);
    
    if (!categorized[classification.category]) {
      categorized[classification.category] = {
        description: classification.description,
        priority: classification.priority,
        scripts: [],
      };
    }
    
    categorized[classification.category].scripts.push({
      name: script,
      description: description,
      category: classification.category,
      priority: classification.priority,
      keep: null, // 待用户确认
      note: '',
    });
  }
  
  // 按优先级排序分类
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedCategories = Object.entries(categorized).sort((a, b) => {
    return priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
  });
  
  for (const [category, data] of sortedCategories) {
    checklist.categories[category] = {
      description: data.description,
      priority: data.priority,
      scripts: data.scripts.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }
  
  // 写入文件
  const checklistPath = join(scriptsDir, 'UNUSED_SCRIPTS_CHECKLIST.json');
  writeFileSync(checklistPath, JSON.stringify(checklist, null, 2), 'utf-8');
  
  // 输出摘要
  console.log('='.repeat(80));
  console.log('📋 未使用脚本详细分类清单');
  console.log('='.repeat(80));
  console.log(`\n总共 ${unusedScripts.length} 个未使用的脚本\n`);
  
  for (const [category, data] of sortedCategories) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📁 ${category} (${data.scripts.length} 个) - 优先级: ${data.priority}`);
    console.log(`   ${data.description}`);
    console.log('─'.repeat(80));
    
    data.scripts.forEach((script, index) => {
      console.log(`\n[${index + 1}] ${script.name}`);
      console.log(`    作用: ${script.description}`);
    });
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`✅ 已生成详细确认清单: scripts/UNUSED_SCRIPTS_CHECKLIST.json`);
  console.log('   请在 JSON 文件中为每个脚本设置 keep: true/false\n');
}

// 主函数
try {
  generateDetailedChecklist();
} catch (error) {
  console.error('❌ 生成清单失败:', error);
  process.exit(1);
}

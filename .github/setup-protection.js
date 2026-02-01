/**
 * GitHub Branch Protection Setup Script
 * 
 * 为 Enterprise Workspace 设置分支保护规则
 * 
 * 使用方法:
 * 1. 在 GitHub 设置中手动配置（推荐）
 * 2. 或使用此脚本通过 GitHub API 配置
 * 
 * 前提条件:
 * - 安装 gh CLI: https://cli.github.com/
 * - 或使用 curl 直接调用 GitHub API
 */

const { execSync } = require('child_process');
const https = require('https');

// 配置
const CONFIG = {
  repo: 'BellisGit/enterprise-workspace',
  owner: 'BellisGit',
  mainBranch: 'main',
  developBranch: 'develop',
  requiredChecks: [
    'CI',
    'PR Validation'
  ],
  minReviewers: 1,
  adminCanPush: false,
  allowForcePush: false
};

// 分支保护规则
const PROTECTION_RULES = {
  main: {
    required_status_checks: {
      strict: true,
      contexts: ['CI']
    },
    required_pull_request_reviews: {
      required_approving_review_count: 1,
      dismiss_stale_reviews: true,
      require_code_owner_reviews: false
    },
    restrictions: null,
    allow_force_pushes: false,
    allow_deletions: false,
    enforce_admins: true
  },
  develop: {
    required_status_checks: {
      strict: true,
      contexts: ['CI']
    },
    required_pull_request_reviews: {
      required_approving_review_count: 1,
      dismiss_stale_reviews: true,
      require_code_owner_reviews: false
    },
    restrictions: null,
    allow_force_pushes: false,
    allow_deletions: false,
    enforce_admins: true
  }
};

function log(message) {
  console.log(`[Branch Protection] ${message}`);
}

function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8' }).trim();
  } catch (error) {
    return null;
  }
}

function checkGHCLI() {
  log('检查 GitHub CLI...');
  const version = runCommand('gh --version');
  if (version) {
    log(`✓ GitHub CLI 已安装: ${version.split('\n')[0]}`);
    return true;
  } else {
    log('✗ GitHub CLI 未安装');
    log('请访问 https://cli.github.com/ 安装');
    return false;
  }
}

function checkAuth() {
  log('检查认证状态...');
  const status = runCommand('gh auth status');
  if (status && status.includes('logged in')) {
    log('✓ 已登录 GitHub');
    return true;
  } else {
    log('✗ 未登录 GitHub');
    log('请运行: gh auth login');
    return false;
  }
}

function setupBranchProtection(branch) {
  log(`设置分支保护: ${branch}`);
  
  const rule = PROTECTION_RULES[branch];
  if (!rule) {
    log(`⚠ 未找到 ${branch} 的保护规则`);
    return false;
  }
  
  try {
    // 使用 gh api 设置分支保护
    const cmd = `
      gh api repos/{owner}/{repo}/branches/${branch}/protection \\
        -X PUT \\
        --field required_status_checks='${JSON.stringify(rule.required_status_checks)}' \\
        --field required_pull_request_reviews='${JSON.stringify(rule.required_pull_request_reviews)}' \\
        --field restrictions=null \\
        --field allow_force_pushes=${rule.allow_force_pushes} \\
        --field allow_deletions=${rule.allow_deletions} \\
        --field enforce_admins=${rule.enforce_admins}
    `;
    
    log(`执行: ${cmd}`);
    const result = runCommand(cmd);
    
    if (result) {
      log(`✓ 分支保护已设置: ${branch}`);
      return true;
    }
  } catch (error) {
    log(`✗ 设置失败: ${error.message}`);
  }
  
  // 如果 API 调用失败，输出手动设置指南
  log('');
  log(`========================================`);
  log(`手动设置分支保护: ${branch}`);
  log(`========================================`);
  log('');
  log('1. 访问仓库设置:');
  log(`   https://github.com/${CONFIG.repo}/settings/branches`);
  log('');
  log('2. 点击 "Add branch protection rule"');
  log('');
  log('3. 配置以下设置:');
  log('');
  log('   Branch name pattern:');
  log(`   ${branch}`);
  log('');
  log('   ✅ Protect against these rules:');
  log('      ✅ Require a pull request before merging');
  log(`         - Required number of approvals before merging: ${CONFIG.minReviewers}`);
  log('      ✅ Require status checks to pass before merging');
  log(`         - Status checks: ${CONFIG.requiredChecks.join(', ')}`);
  log('      ✅ Do not allow bypassing the above settings');
  log('');
  log('4. 点击 "Save changes"');
  log('');
  
  return false;
}

function createProtectionRulesFile() {
  log('创建分支保护规则文档...');
  
  const content = `---
title: Branch Protection Rules
nav_order: 1
parent: GitHub Configuration
---

# 分支保护规则

## 概述

Enterprise Workspace 的分支保护规则，确保代码质量和团队协作规范。

## 受保护分支

| 分支 | 直接推送 | 强制推送 | 必须 PR | 必须审批 | 必须检查 |
|------|---------|---------|---------|---------|----------|
| main | ❌ | ❌ | ✅ | ✅ 1人 | ✅ |
| develop | ❌ | ❌ | ✅ | ✅ 1人 | ✅ |

## 手动配置

### 设置 main 分支保护

1. 访问: https://github.com/${CONFIG.repo}/settings/branches
2. 点击 "Add branch protection rule"
3. Branch name pattern: \`main\`
4. 勾选:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1
   - ✅ Require status checks to pass
     - CI
     - PR Validation
   - ✅ Do not allow bypassing the above settings
5. 保存

### 设置 develop 分支保护

同上，Branch name pattern 改为 \`develop\`

## 相关资源

- [GitHub 分支保护文档](https://docs.github.com/en/repositories/configuring-branches-and-tags-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Branch Strategy](./BRANCH_STRATEGY.md)

`;

  try {
    require('fs').writeFileSync(
      '.github/PROTECTION_RULES.md',
      content
    );
    log('✓ 保护规则文档已创建');
  } catch (error) {
    log(`✗ 创建失败: ${error.message}`);
  }
}

function main() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      Enterprise Workspace - Branch Protection Setup       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // 检查前提条件
  const hasGHCLI = checkGHCLI();
  const hasAuth = hasGHCLI && checkAuth();
  
  if (!hasAuth) {
    log('将创建本地配置文件，请手动设置');
  }
  
  // 创建保护规则文档
  createProtectionRulesFile();
  
  // 提示用户手动设置
  console.log('');
  log('========================================');
  log('设置分支保护');
  log('========================================');
  
  // 设置 main 分支
  setupBranchProtection(CONFIG.mainBranch);
  
  // 设置 develop 分支
  setupBranchProtection(CONFIG.developBranch);
  
  console.log('');
  log('========================================');
  log('设置完成！');
  log('========================================');
  log('');
  log('请访问 GitHub 手动验证分支保护设置:');
  log(`https://github.com/${CONFIG.repo}/settings/branches`);
  log('');
  log('参考文档: .github/BRANCH_STRATEGY.md');
  log('');
}

main();

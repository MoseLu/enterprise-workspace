#!/usr/bin/env node

/**
 * 版本发布脚本 - 自动化 Git Flow 流程
 * 
 * 使用方式：
 *   node scripts/release-version.mjs <version>
 *   例如：node scripts/release-version.mjs 1.0.0
 * 
 * 流程：
 *   1. 从 develop 创建 release/v<version> 分支
 *   2. 提示用户进行发布准备（修复bug、更新版本号等）
 *   3. 合并 release 到 main（打tag）
 *   4. 合并 release 回 develop
 *   5. 删除 release 分支
 *   6. 推送所有更改
 */
import { logger } from '../../utils/logger.mjs';

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { getRootDir } from '../../utils/path-helper.mjs';
const rootDir = getRootDir();

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  logger.info(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: 'pipe',
      ...options,
    });
    return result.trim();
  } catch (error) {
    throw new Error(`执行命令失败: ${command}\n${error.message}`);
  }
}

function execInteractive(command, options = {}) {
  try {
    execSync(command, {
      cwd: rootDir,
      stdio: 'inherit',
      ...options,
    });
  } catch (error) {
    throw new Error(`执行命令失败: ${command}\n${error.message}`);
  }
}

function getCurrentBranch() {
  return exec('git branch --show-current');
}

function getCurrentVersion() {
  try {
    const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
    return packageJson.version;
  } catch (error) {
    return '1.0.0';
  }
}

function updateVersionInPackageJson(version) {
  try {
    const packageJsonPath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    packageJson.version = version;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    log(`✅ 已更新 package.json 版本号为 ${version}`, 'green');
  } catch (error) {
    log(`⚠️  无法更新 package.json 版本号: ${error.message}`, 'yellow');
  }
}

function checkWorkingTreeClean() {
  const status = exec('git status --porcelain');
  if (status) {
    throw new Error('工作区有未提交的更改，请先提交或暂存更改');
  }
}

function checkBranch(branch) {
  const currentBranch = getCurrentBranch();
  if (currentBranch !== branch) {
    throw new Error(`当前分支是 ${currentBranch}，需要切换到 ${branch} 分支`);
  }
}

async function prompt(question) {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function confirm(message) {
  const answer = await prompt(`${message} (y/n): `);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

async function main() {
  const args = process.argv.slice(2);
  const version = args[0];

  if (!version) {
    log('❌ 请提供版本号', 'red');
    log('使用方式: node scripts/release-version.mjs <version>', 'yellow');
    log('例如: node scripts/release-version.mjs 1.0.0', 'yellow');
    process.exit(1);
  }

  // 验证版本号格式
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    log('❌ 版本号格式不正确，应为 x.y.z 格式（如 1.0.0）', 'red');
    process.exit(1);
  }

  const tagName = `v${version}`;
  const releaseBranch = `release/${tagName}`;

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🚀 开始版本发布流程', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log(`版本号: ${version}`, 'blue');
  log(`标签名: ${tagName}`, 'blue');
  log(`发布分支: ${releaseBranch}`, 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  try {
    // 步骤 1: 检查工作区状态
    log('📋 步骤 1: 检查工作区状态...', 'cyan');
    checkWorkingTreeClean();
    log('✅ 工作区干净', 'green');

    // 步骤 2: 检查当前分支
    log('\n📋 步骤 2: 检查当前分支...', 'cyan');
    const currentBranch = getCurrentBranch();
    log(`当前分支: ${currentBranch}`, 'blue');

    if (currentBranch !== 'develop') {
      const shouldContinue = await confirm(`当前不在 develop 分支，是否切换到 develop 分支？`);
      if (shouldContinue) {
        log('切换到 develop 分支...', 'yellow');
        execInteractive('git checkout develop');
      } else {
        log('❌ 已取消操作', 'red');
        process.exit(1);
      }
    }

    // 步骤 3: 拉取最新代码
    log('\n📋 步骤 3: 拉取最新代码...', 'cyan');
    const shouldPull = await confirm('是否拉取远程 develop 分支的最新代码？');
    if (shouldPull) {
      log('拉取远程代码...', 'yellow');
      execInteractive('git pull origin develop');
    }

    // 步骤 4: 创建 release 分支
    log('\n📋 步骤 4: 创建发布分支...', 'cyan');
    const branchExists = exec(`git branch -a | grep -E "release/${tagName}$|remotes/origin/release/${tagName}$" || true`);
    if (branchExists) {
      log(`⚠️  发布分支 ${releaseBranch} 已存在`, 'yellow');
      const shouldDelete = await confirm('是否删除现有分支并重新创建？');
      if (shouldDelete) {
        try {
          exec(`git branch -D ${releaseBranch}`);
        } catch (e) {
          // 本地分支可能不存在，忽略
        }
        try {
          exec(`git push origin --delete ${releaseBranch}`);
        } catch (e) {
          // 远程分支可能不存在，忽略
        }
      } else {
        log('❌ 已取消操作', 'red');
        process.exit(1);
      }
    }

    log(`创建并切换到 ${releaseBranch} 分支...`, 'yellow');
    execInteractive(`git checkout -b ${releaseBranch}`);
    execInteractive(`git push -u origin ${releaseBranch}`);
    log(`✅ 已创建并推送 ${releaseBranch} 分支`, 'green');

    // 步骤 5: 提示用户进行发布准备
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('📝 步骤 5: 发布准备阶段', 'bright');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('请在 release 分支上进行以下操作：', 'yellow');
    log('  1. 修复发布前的 bug', 'blue');
    log('  2. 更新版本号（package.json 等）', 'blue');
    log('  3. 更新 CHANGELOG.md', 'blue');
    log('  4. 完善发布文档', 'blue');
    log('\n⚠️  注意：只做小修复，不要新增大功能！', 'yellow');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    const shouldUpdateVersion = await confirm('是否自动更新 package.json 中的版本号？');
    if (shouldUpdateVersion) {
      updateVersionInPackageJson(version);
      execInteractive('git add package.json');
      execInteractive(`git commit -m "chore: bump version to ${version}"`);
    }

    const continueRelease = await confirm('发布准备完成后，是否继续发布流程？');
    if (!continueRelease) {
      log('⏸️  发布流程已暂停，请在完成发布准备后手动继续', 'yellow');
      log(`当前在 ${releaseBranch} 分支，完成后可以运行：`, 'blue');
      log(`  git checkout main`, 'blue');
      log(`  git merge --no-ff ${releaseBranch}`, 'blue');
      log(`  git tag -a ${tagName} -m "Release ${tagName}"`, 'blue');
      log(`  git push origin main ${tagName}`, 'blue');
      process.exit(0);
    }

    // 步骤 6: 合并 release 到 main
    log('\n📋 步骤 6: 合并到 main 分支...', 'cyan');
    log('切换到 main 分支...', 'yellow');
    execInteractive('git checkout main');
    log('拉取最新 main 分支...', 'yellow');
    execInteractive('git pull origin main');
    log(`合并 ${releaseBranch} 到 main...`, 'yellow');
    execInteractive(`git merge --no-ff ${releaseBranch} -m "chore: merge ${releaseBranch} to main for ${tagName} release"`);
    log('✅ 已合并到 main 分支', 'green');

    // 步骤 7: 打 tag
    log('\n📋 步骤 7: 创建版本标签...', 'cyan');
    const tagMessage = await prompt(`请输入标签附注信息（留空使用默认）: `);
    const finalTagMessage = tagMessage.trim() || `Release ${tagName}`;

    // 检查 tag 是否已存在
    const tagExists = exec(`git tag -l ${tagName} || true`);
    if (tagExists) {
      log(`⚠️  标签 ${tagName} 已存在`, 'yellow');
      const shouldDelete = await confirm('是否删除现有标签并重新创建？');
      if (shouldDelete) {
        exec(`git tag -d ${tagName}`);
        try {
          exec(`git push origin --delete ${tagName}`);
        } catch (e) {
          // 远程标签可能不存在，忽略
        }
      }
    }

    log(`创建标签 ${tagName}...`, 'yellow');
    // 使用临时文件传递 tag message，避免 Windows PowerShell 编码问题
    const tempFile = join(tmpdir(), `git-tag-message-${randomBytes(8).toString('hex')}.txt`);
    try {
      // 将 tag message 写入临时文件（UTF-8 编码，无 BOM）
      writeFileSync(tempFile, finalTagMessage, { encoding: 'utf-8' });
      // 使用 -F 参数从文件读取 message，避免 shell 编码问题
      execInteractive(`git tag -a ${tagName} -F "${tempFile}"`);
      log(`✅ 已创建标签 ${tagName}`, 'green');
    } finally {
      // 清理临时文件
      try {
        unlinkSync(tempFile);
      } catch (e) {
        // 忽略删除失败
      }
    }

    // 步骤 7.5: 自动更新 CHANGELOG.md
    log('\n📋 步骤 7.5: 自动更新 CHANGELOG.md...', 'cyan');
    try {
      // 使用子进程执行更新脚本，避免 ES 模块导入问题
      exec(`node scripts/update-changelog.mjs ${version}`, { stdio: 'inherit' });
      log('✅ CHANGELOG.md 已自动更新', 'green');
      log('请检查并确认内容，如有需要可以手动调整', 'yellow');
    } catch (error) {
      log(`⚠️  自动更新 CHANGELOG.md 失败: ${error.message}`, 'yellow');
      log('请手动更新 CHANGELOG.md', 'yellow');
      log(`可以运行: node scripts/update-changelog.mjs ${version}`, 'blue');
    }

    // 步骤 8: 合并 release 回 develop
    log('\n📋 步骤 8: 合并回 develop 分支...', 'cyan');
    log('切换到 develop 分支...', 'yellow');
    execInteractive('git checkout develop');
    log('拉取最新 develop 分支...', 'yellow');
    execInteractive('git pull origin develop');
    log(`合并 ${releaseBranch} 到 develop...`, 'yellow');
    execInteractive(`git merge --no-ff ${releaseBranch} -m "chore: merge ${releaseBranch} back to develop"`);
    log('✅ 已合并回 develop 分支', 'green');

    // 步骤 9: 删除 release 分支
    log('\n📋 步骤 9: 清理临时分支...', 'cyan');
    const shouldDelete = await confirm(`是否删除临时分支 ${releaseBranch}？`);
    if (shouldDelete) {
      log('删除本地分支...', 'yellow');
      execInteractive(`git branch -d ${releaseBranch}`);
      log('删除远程分支...', 'yellow');
      execInteractive(`git push origin --delete ${releaseBranch}`);
      log(`✅ 已删除 ${releaseBranch} 分支`, 'green');
    }

    // 步骤 10: 推送所有更改
    log('\n📋 步骤 10: 推送所有更改到远程...', 'cyan');
    const shouldPush = await confirm('是否推送 main、develop 分支和标签到远程？');
    if (shouldPush) {
      log('推送 main 分支...', 'yellow');
      execInteractive('git push origin main');
      log('推送 develop 分支...', 'yellow');
      execInteractive('git push origin develop');
      log('推送标签...', 'yellow');
      execInteractive(`git push origin ${tagName}`);
      log('✅ 已推送所有更改', 'green');
    }

    // 完成
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
    log('🎉 版本发布流程完成！', 'bright');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
    log(`版本: ${version}`, 'blue');
    log(`标签: ${tagName}`, 'blue');
    log(`main 分支: 已更新`, 'blue');
    log(`develop 分支: 已同步`, 'blue');
    log('\n💡 下一步建议：', 'yellow');
    log('  1. 在 GitHub 上创建 Releases（基于标签）', 'blue');
    log('  2. 填写更新日志和发布说明', 'blue');
    log('  3. 上传安装包或构建产物（如需要）', 'blue');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'green');

  } catch (error) {
    log(`\n❌ 错误: ${error.message}`, 'red');
    log('\n💡 提示：', 'yellow');
    log('  如果发布流程中断，可以手动继续：', 'blue');
    log('  1. 检查当前分支状态', 'blue');
    log('  2. 根据错误信息修复问题', 'blue');
    log('  3. 重新运行脚本或手动执行剩余步骤', 'blue');
    process.exit(1);
  }
}

main();

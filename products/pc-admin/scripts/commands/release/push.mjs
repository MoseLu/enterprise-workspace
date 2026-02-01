#!/usr/bin/env node

/**
 * 发布推送脚本 - 简化版本发布流程
 * 
 * 使用方式：
 *   交互式模式：
 *     pnpm release:push
 *     或
 *     node scripts/commands/release/push.mjs
 * 
 *   全自动模式：
 *     node scripts/commands/release/push.mjs --auto --version=1.0.10
 *     或
 *     node scripts/commands/release/push.mjs --auto --version=1.0.10 --tag-message="版本描述"
 * 
 * 功能：
 *   1. 检查当前分支（应在 develop）
 *   2. 交互式或自动输入版本号和标签消息
 *   3. 自动创建 release 分支
 *   4. 自动创建标签
 *   5. 自动更新 CHANGELOG.md
 *   6. 推送到远程
 * 
 * 与常规 push 的区别：
 *   - 常规 push: git push (正常推送当前分支)
 *   - 发布 push: pnpm release:push (自动完成发布流程)
 */
import { logger } from '../../utils/logger.mjs';

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    auto: true, // 默认自动模式
    manualCommit: false, // 默认自动提交
    version: null,
    tagMessage: null,
    skipPull: false,
    skipMergeToMain: false,
    skipMergeBack: false,
    skipCleanup: false,
  };

  for (const arg of args) {
    if (arg === '--auto') {
      config.auto = true;
    } else if (arg === '--manual') {
      config.auto = false; // 手动模式
    } else if (arg === '--manual-commit') {
      config.manualCommit = true; // 手动提交模式（不自动提交）
    } else if (arg.startsWith('--version=')) {
      config.version = arg.split('=')[1];
    } else if (arg.startsWith('--tag-message=')) {
      config.tagMessage = arg.split('=')[1];
    } else if (arg === '--skip-pull') {
      config.skipPull = true;
    } else if (arg === '--skip-merge-to-main') {
      config.skipMergeToMain = true;
    } else if (arg === '--skip-merge-back') {
      config.skipMergeBack = true;
    } else if (arg === '--skip-cleanup') {
      config.skipCleanup = true;
    }
  }

  return config;
}

/**
 * 自动计算下一个版本号（patch 版本）
 */
function getNextVersion(currentVersion) {
  const parts = currentVersion.split('.');
  const major = parseInt(parts[0], 10);
  const minor = parseInt(parts[1], 10);
  const patch = parseInt(parts[2], 10) + 1;
  return `${major}.${minor}.${patch}`;
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    }).trim();
  } catch (error) {
    if (!options.silent) {
      log(`执行命令失败: ${command}`, 'red');
      log(error.message, 'red');
    }
    throw error;
  }
}

function execInteractive(command) {
  try {
    execSync(command, {
      cwd: rootDir,
      stdio: 'inherit',
    });
  } catch (error) {
    log(`执行命令失败: ${command}`, 'red');
    throw error;
  }
}

/**
 * 简单的输入提示
 */
async function prompt(question) {
  const { createInterface } = await import('readline');
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * 确认提示
 */
async function confirm(question, defaultValue = false) {
  const defaultText = defaultValue ? 'Y/n' : 'y/N';
  const answer = await prompt(`${question} (${defaultText}): `);
  if (!answer.trim()) {
    return defaultValue;
  }
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

/**
 * 获取当前分支
 */
function getCurrentBranch() {
  try {
    return exec('git branch --show-current', { silent: true });
  } catch (error) {
    return null;
  }
}

/**
 * 检查工作区状态
 */
function checkWorkingDirectory() {
  try {
    const status = exec('git status --porcelain', { silent: true });
    if (status) {
      return false; // 有未提交的更改
    }
    return true; // 工作区干净
  } catch (error) {
    return false;
  }
}

/**
 * 更新 package.json 版本号
 * @returns {boolean} 是否实际更新了版本号
 */
function updateVersionInPackageJson(version) {
  const packageJsonPath = join(rootDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const oldVersion = packageJson.version;
  
  if (oldVersion === version) {
    log(`ℹ️  package.json 版本号已经是 ${version}，无需更新`, 'blue');
    return false;
  }
  
  packageJson.version = version;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
  log(`✅ 已更新 package.json: ${oldVersion} -> ${version}`, 'green');
  return true;
}

// 主函数
async function main() {
  // 解析命令行参数
  const config = parseArgs();
  const isAuto = config.auto;

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log(isAuto ? '🚀 发布推送流程（全自动模式）' : '🚀 发布推送流程', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  // 步骤 1: 检查当前分支
  log('\n📋 步骤 1: 检查当前分支...', 'cyan');
  const currentBranch = getCurrentBranch();
  if (!currentBranch) {
    log('❌ 无法获取当前分支', 'red');
    process.exit(1);
  }

  log(`当前分支: ${currentBranch}`, 'blue');

  // 建议在 develop 分支，但不强制
  if (currentBranch !== 'develop') {
    if (isAuto) {
      log('⚠️  当前不在 develop 分支，但自动模式继续执行', 'yellow');
    } else {
      const shouldContinue = await confirm(
        `当前不在 develop 分支，是否继续？`,
        false
      );
      if (!shouldContinue) {
        log('已取消', 'yellow');
        process.exit(0);
      }
    }
  }

  // 步骤 2: 检查工作区状态
  log('\n📋 步骤 2: 检查工作区状态...', 'cyan');
  const isClean = checkWorkingDirectory();
  if (!isClean) {
    if (isAuto) {
      // 自动模式：自动提交所有更改
      log('⚠️  工作区有未提交的更改，自动模式下将自动提交', 'yellow');
      try {
        execInteractive('git add -A');
        execInteractive('git commit -m "chore: prepare for release"');
        log('✅ 已自动提交所有更改', 'green');
      } catch (error) {
        log('⚠️  自动提交失败，继续执行', 'yellow');
      }
    } else {
      log('⚠️  工作区有未提交的更改', 'yellow');
      const shouldContinue = await confirm('是否先提交这些更改？', true);
      if (shouldContinue) {
        log('请先提交更改，然后重新运行此脚本', 'yellow');
        process.exit(0);
      } else {
        const forceContinue = await confirm('是否忽略未提交的更改继续？', false);
        if (!forceContinue) {
          process.exit(0);
        }
      }
    }
  } else {
    log('✅ 工作区干净', 'green');
  }

  // 步骤 3: 拉取最新代码
  log('\n📋 步骤 3: 拉取最新代码...', 'cyan');
  const shouldPull = isAuto ? !config.skipPull : await confirm('是否拉取最新代码？', true);
  if (shouldPull) {
    try {
      execInteractive(`git pull origin ${currentBranch}`);
      log('✅ 已拉取最新代码', 'green');
    } catch (error) {
      log('⚠️  拉取代码失败，继续执行', 'yellow');
    }
  }

  // 步骤 4: 输入版本信息
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('📝 步骤 4: 输入版本信息', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  let version = config.version;
  
  if (!version) {
    if (isAuto) {
      // 自动模式：从 package.json 读取当前版本并自动递增
      // 但如果在 release 分支上，应该报错，因为不应该在 release 分支上发布新版本
      if (currentBranch.startsWith('release/')) {
        log('❌ 错误：当前在 release 分支上，无法自动计算版本号', 'red');
        log('请在 develop 分支上运行发布脚本，或使用 --version 参数指定版本号', 'yellow');
        process.exit(1);
      }
      
      const packageJsonPath = join(rootDir, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const currentVersion = packageJson.version;
      version = getNextVersion(currentVersion);
      log(`自动计算版本号: ${currentVersion} -> ${version}`, 'blue');
    } else {
      version = await prompt('请输入版本号（如 1.0.8）: ');
      version = version.trim();
    }
  }

  if (!version) {
    log('❌ 版本号不能为空', 'red');
    process.exit(1);
  }

  // 去掉可能的 v 前缀
  version = version.replace(/^v/, '');

  // 验证版本号格式
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    log('❌ 版本号格式不正确，应为 x.y.z 格式（如 1.0.0）', 'red');
    process.exit(1);
  }

  const tagName = `v${version}`;
  const releaseBranch = `release/${tagName}`;

  log(`\n版本号: ${version}`, 'blue');
  log(`标签名: ${tagName}`, 'blue');
  log(`发布分支: ${releaseBranch}`, 'blue');

  // 步骤 5: 输入标签消息
  log('\n📋 步骤 5: 输入标签消息（版本描述）...', 'cyan');
  
  let finalTagMessage;
  if (isAuto) {
    finalTagMessage = config.tagMessage || `版本 ${tagName}`;
    log(`使用标签消息: ${finalTagMessage}`, 'blue');
  } else {
    log('提示：可以输入多行，输入空行结束', 'yellow');
    const tagMessageLines = [];
    let line = await prompt('标签消息（第一行，或直接回车使用默认）: ');
    if (line.trim()) {
      tagMessageLines.push(line.trim());
      
      // 允许输入多行
      while (true) {
        line = await prompt('继续输入（直接回车结束）: ');
        if (!line.trim()) {
          break;
        }
        tagMessageLines.push(line.trim());
      }
    }

    const defaultTagMessage = `版本 ${tagName}`;
    finalTagMessage = tagMessageLines.length > 0
      ? `版本 ${tagName}\n\n${tagMessageLines.join('\n')}`
      : defaultTagMessage;
  }

  log(`\n标签消息预览:`, 'blue');
  log(finalTagMessage, 'yellow');

  // 步骤 6: 确认信息
  if (!isAuto) {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    const shouldContinue = await confirm('确认开始发布流程？', true);
    if (!shouldContinue) {
      log('已取消', 'yellow');
      process.exit(0);
    }
  } else {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('✅ 自动模式：开始发布流程', 'green');
  }

  // 步骤 7: 更新版本号（可选）
  log('\n📋 步骤 7: 更新版本号...', 'cyan');
  const shouldUpdateVersion = isAuto ? true : await confirm('是否自动更新 package.json 中的版本号？', true);
  if (shouldUpdateVersion) {
    const hasChanges = updateVersionInPackageJson(version);
    if (hasChanges) {
      execInteractive('git add package.json');
      execInteractive(`git commit -m "chore: bump version to ${version}"`);
    }
  }

  // 步骤 8: 创建 release 分支
  log('\n📋 步骤 8: 创建 release 分支...', 'cyan');
  
  // 检查分支是否已存在
  try {
    exec(`git rev-parse --verify ${releaseBranch}`, { silent: true });
    log(`⚠️  分支 ${releaseBranch} 已存在`, 'yellow');
    const shouldDelete = isAuto ? true : await confirm('是否删除现有分支并重新创建？', false);
    if (shouldDelete) {
      execInteractive(`git branch -D ${releaseBranch}`);
      try {
        execInteractive(`git push origin --delete ${releaseBranch}`);
      } catch (e) {
        // 远程分支可能不存在，忽略
      }
    } else {
      log('❌ 已取消', 'red');
      process.exit(1);
    }
  } catch (e) {
    // 分支不存在，继续
  }

  log(`创建并切换到 ${releaseBranch} 分支...`, 'yellow');
  execInteractive(`git checkout -b ${releaseBranch}`);
  log(`✅ 已创建 ${releaseBranch} 分支`, 'green');

  // 步骤 9: 推送到远程
  log('\n📋 步骤 9: 推送到远程...', 'cyan');
  const shouldPush = isAuto ? true : await confirm(`是否推送 ${releaseBranch} 分支到远程？`, true);
  if (shouldPush) {
    execInteractive(`git push -u origin ${releaseBranch}`);
    log(`✅ 已推送 ${releaseBranch} 分支`, 'green');
  }

  // 步骤 10: 切换到 main 分支并合并
  log('\n📋 步骤 10: 合并到 main 分支...', 'cyan');
  const shouldMergeToMain = isAuto ? !config.skipMergeToMain : await confirm('是否合并到 main 分支并创建标签？', true);
  
  if (shouldMergeToMain) {
    log('切换到 main 分支...', 'yellow');
    execInteractive('git checkout main');
    
    log('拉取最新 main 分支...', 'yellow');
    try {
      execInteractive('git pull origin main');
    } catch (e) {
      log('⚠️  拉取 main 分支失败，继续执行', 'yellow');
    }

    log(`合并 ${releaseBranch} 到 main...`, 'yellow');
    execInteractive(`git merge --no-ff ${releaseBranch} -m "chore: merge ${releaseBranch} to main for ${tagName} release"`);
    log('✅ 已合并到 main 分支', 'green');

    // 步骤 11: 创建标签
    log('\n📋 步骤 11: 创建标签...', 'cyan');
    
    // 检查标签是否已存在
    try {
      exec(`git rev-parse ${tagName}`, { silent: true });
      log(`⚠️  标签 ${tagName} 已存在`, 'yellow');
      const shouldDeleteTag = isAuto ? true : await confirm('是否删除现有标签并重新创建？', false);
      if (shouldDeleteTag) {
        execInteractive(`git tag -d ${tagName}`);
        try {
          execInteractive(`git push origin --delete ${tagName}`);
        } catch (e) {
          // 远程标签可能不存在，忽略
        }
      }
    } catch (e) {
      // 标签不存在，继续
    }

    log(`创建标签 ${tagName}...`, 'yellow');
    // 使用临时文件传递 tag message，避免 Windows PowerShell 编码问题
    const { tmpdir } = await import('os');
    const { randomBytes } = await import('crypto');
    const { unlinkSync } = await import('fs');
    const tempFile = join(tmpdir(), `git-tag-message-${randomBytes(8).toString('hex')}.txt`);
    try {
      writeFileSync(tempFile, finalTagMessage, { encoding: 'utf-8' });
      execInteractive(`git tag -a ${tagName} -F "${tempFile}"`);
      log(`✅ 已创建标签 ${tagName}`, 'green');
    } finally {
      try {
        unlinkSync(tempFile);
      } catch (e) {
        // 忽略删除失败
      }
    }

    // 步骤 12: 自动更新 CHANGELOG
    log('\n📋 步骤 12: 自动更新 CHANGELOG.md...', 'cyan');
    try {
      exec(`node scripts/commands/tools/update-changelog.mjs ${version}`, { stdio: 'inherit' });
      log('✅ CHANGELOG.md 已自动更新', 'green');
      
      // 提交 CHANGELOG 更改
      const shouldCommitChangelog = isAuto ? true : await confirm('是否提交 CHANGELOG.md 的更改？', true);
      if (shouldCommitChangelog) {
        execInteractive('git add CHANGELOG.md');
        execInteractive(`git commit -m "docs: update CHANGELOG for ${tagName}"`);
      }
    } catch (error) {
      log(`⚠️  自动更新 CHANGELOG.md 失败: ${error.message}`, 'yellow');
      log('可以稍后手动运行: node scripts/update-changelog.mjs ' + version, 'blue');
    }

    // 步骤 13: 合并回 develop
    log('\n📋 步骤 13: 合并回 develop 分支...', 'cyan');
    const shouldMergeBack = isAuto ? !config.skipMergeBack : await confirm('是否合并回 develop 分支？', true);
    if (shouldMergeBack) {
      log('切换到 develop 分支...', 'yellow');
      execInteractive('git checkout develop');
      
      log('拉取最新 develop 分支...', 'yellow');
      try {
        execInteractive('git pull origin develop');
      } catch (e) {
        // 忽略
      }

      log(`合并 ${releaseBranch} 到 develop...`, 'yellow');
      execInteractive(`git merge --no-ff ${releaseBranch} -m "chore: merge ${releaseBranch} back to develop"`);
      log('✅ 已合并回 develop 分支', 'green');
    }

    // 步骤 14: 推送所有更改
    log('\n📋 步骤 14: 推送所有更改...', 'cyan');
    const shouldPushAll = isAuto ? true : await confirm('是否推送 main、develop 分支和标签到远程？', true);
    if (shouldPushAll) {
      log('推送 main 分支...', 'yellow');
      execInteractive('git push origin main');
      
      if (shouldMergeBack) {
        log('推送 develop 分支...', 'yellow');
        execInteractive('git push origin develop');
      }
      
      log(`推送标签 ${tagName}...`, 'yellow');
      execInteractive(`git push origin ${tagName}`);
      
      log('✅ 已推送所有更改', 'green');
    }

    // 步骤 15: 清理 release 分支
    log('\n📋 步骤 15: 清理 release 分支...', 'cyan');
    const shouldCleanup = isAuto ? !config.skipCleanup : await confirm('是否删除本地和远程的 release 分支？', true);
    if (shouldCleanup) {
      log(`删除本地分支 ${releaseBranch}...`, 'yellow');
      execInteractive(`git branch -d ${releaseBranch}`);
      
      log(`删除远程分支 ${releaseBranch}...`, 'yellow');
      try {
        execInteractive(`git push origin --delete ${releaseBranch}`);
      } catch (e) {
        // 可能已经删除，忽略
      }
      
      log('✅ 已清理 release 分支', 'green');
    }

    // 切换回 develop 分支
    log('\n切换到 develop 分支...', 'yellow');
    execInteractive('git checkout develop');
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🎉 发布流程完成！', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log(`\n版本 ${tagName} 已成功发布`, 'green');
  log('建议在 GitHub 上创建 Release 并填写详细说明', 'yellow');
}

main().catch(error => {
  log(`\n❌ 错误: ${error.message}`, 'red');
  if (error.stack) {
    log(error.stack, 'red');
  }
  process.exit(1);
});

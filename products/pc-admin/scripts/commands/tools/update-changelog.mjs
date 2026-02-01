#!/usr/bin/env node

/**
 * 自动更新 CHANGELOG.md
 * 
 * 从 Git 标签和提交信息自动生成或更新 CHANGELOG.md
 * 
 * 使用方式：
 *   node scripts/update-changelog.mjs [version]
 *   例如：node scripts/update-changelog.mjs 1.0.8
 * 
 * 如果不提供版本号，会检查最新的标签并更新
 */
import { logger } from '../../utils/logger.mjs';

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getRootDir } from '../../utils/path-helper.mjs';

const rootDir = getRootDir();
const changelogPath = join(rootDir, 'CHANGELOG.md');

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

/**
 * 获取标签的日期
 */
function getTagDate(tag) {
  try {
    const dateStr = exec(`git log -1 --format=%ci ${tag}`, { silent: true });
    // 格式: 2026-01-07 13:33:54 +0800
    // 提取日期部分: 2026-01-07
    return dateStr.split(' ')[0];
  } catch (error) {
    return null;
  }
}

/**
 * 获取标签的消息
 */
function getTagMessage(tag) {
  try {
    const message = exec(`git tag -l -n1 ${tag}`, { silent: true });
    // 格式: v1.0.7          版本 v1.0.7
    // 提取消息部分（去掉标签名）
    const parts = message.split(/\s{2,}/);
    return parts.length > 1 ? parts.slice(1).join(' ').trim() : '';
  } catch (error) {
    return '';
  }
}

/**
 * 获取两个标签之间的提交信息（包含完整的 commit hash 和 body）
 */
function getCommitsBetweenTags(fromTag, toTag) {
  try {
    const range = fromTag ? `${fromTag}..${toTag}` : toTag;
    const commits = exec(
      `git log ${range} --format=%s --no-merges`,
      { silent: true }
    );
    return commits.split('\n').filter(line => line.trim());
  } catch (error) {
    return [];
  }
}

/**
 * 获取提交的完整信息（包含 body，用于检测 BREAKING CHANGE）
 */
function getCommitFullInfo(commitHash) {
  try {
    const fullCommit = exec(`git log --format=%B -n 1 ${commitHash}`, { silent: true });
    return fullCommit;
  } catch (error) {
    return '';
  }
}

/**
 * 获取提交的 hash（从 commit message 获取）
 */
function getCommitHashesBetweenTags(fromTag, toTag) {
  try {
    const range = fromTag ? `${fromTag}..${toTag}` : toTag;
    const hashes = exec(
      `git log ${range} --format=%H --no-merges`,
      { silent: true }
    );
    return hashes.split('\n').filter(line => line.trim());
  } catch (error) {
    return [];
  }
}

/**
 * 解析提交信息，分类为不同类型（增强版：支持包标签识别）
 */
function categorizeCommits(commits, commitHashes = []) {
  const categories = {
    feat: [],
    fix: [],
    docs: [],
    style: [],
    refactor: [],
    perf: [],
    test: [],
    chore: [],
    other: [],
  };

  commits.forEach((commit, index) => {
    const match = commit.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/);
    if (match) {
      const type = match[1];
      const scope = match[2]; // 提取 scope（包名）
      const message = match[3];
      
      // 如果有 scope，添加包标签
      const entry = scope ? `**[${scope}]** ${message}` : message;
      
      if (categories[type]) {
        categories[type].push(entry);
      } else {
        categories.other.push(scope ? `**[${scope}]** ${commit}` : commit);
      }
    } else {
      categories.other.push(commit);
    }
  });

  return categories;
}

/**
 * 获取 Breaking Changes（从 commit body 中检测）
 */
function getBreakingChanges(commits, commitHashes, fromTag, toTag) {
  const breaking = [];
  
  if (commitHashes.length === 0) {
    // 如果没有提供 hashes，尝试获取
    try {
      const range = fromTag ? `${fromTag}..${toTag}` : toTag;
      commitHashes = exec(
        `git log ${range} --format=%H --no-merges`,
        { silent: true }
      ).split('\n').filter(line => line.trim());
    } catch (error) {
      return breaking;
    }
  }
  
  commitHashes.forEach((hash, index) => {
    try {
      const fullCommit = exec(`git log --format=%B -n 1 ${hash}`, { silent: true });
      if (fullCommit.includes('BREAKING CHANGE:')) {
        // 提取 BREAKING CHANGE 后的内容
        const breakingMatch = fullCommit.match(/BREAKING CHANGE:\s*(.+?)(?:\n\n|\n$|$)/s);
        if (breakingMatch) {
          const breakingMessage = breakingMatch[1].trim();
          // 尝试从对应的 commit message 获取 scope
          const commitMsg = commits[index] || '';
          const scopeMatch = commitMsg.match(/^(\w+)\(([^)]+)\)/);
          const scope = scopeMatch ? scopeMatch[2] : null;
          const entry = scope ? `**[${scope}]** ${breakingMessage}` : breakingMessage;
          breaking.push(entry);
        }
      }
    } catch (error) {
      // 忽略单个 commit 的错误
    }
  });
  
  return breaking;
}

/**
 * 生成版本条目（增强版：支持包标签和 breaking changes）
 */
function generateVersionEntry(version, date, tagMessage, commits, commitHashes = [], fromTag = null, toTag = null) {
  const categories = categorizeCommits(commits, commitHashes);
  const breakingChanges = getBreakingChanges(commits, commitHashes, fromTag, toTag);
  const lines = [`## [${version}] - ${date}`, ''];

  // 如果有 breaking changes，优先显示
  if (breakingChanges.length > 0) {
    lines.push('### 破坏性变更');
    breakingChanges.forEach(breaking => {
      lines.push(`- ${breaking}`);
    });
    lines.push('');
  }

  // 如果有标签消息，优先使用标签消息
  if (tagMessage && tagMessage.trim()) {
    // 解析标签消息，支持多行格式
    const messageLines = tagMessage.split('\n').filter(line => line.trim());
    if (messageLines.length > 0) {
      // 如果消息包含"主要更新"等关键词，直接使用
      if (tagMessage.includes('主要更新') || tagMessage.includes('变更') || tagMessage.includes('新增') || tagMessage.includes('修复')) {
        const sections = tagMessage.split(/\n(?=###?|主要|变更|新增|修复)/);
        sections.forEach(section => {
          if (section.trim()) {
            lines.push(section.trim());
            lines.push('');
          }
        });
      } else {
        // 否则作为变更项添加
        lines.push('### 变更');
        messageLines.forEach(line => {
          if (line.trim() && !line.match(/^版本\s+v?\d+\.\d+\.\d+/)) {
            lines.push(`- ${line.trim()}`);
          }
        });
        lines.push('');
      }
    }
  }

  // 如果没有标签消息或消息为空，从提交信息生成
  if (!tagMessage || tagMessage.trim() === '' || tagMessage.match(/^Release\s+v?\d+\.\d+\.\d+/i)) {
    let hasContent = false;

    if (categories.feat.length > 0) {
      lines.push('### 新增');
      categories.feat.forEach(msg => {
        lines.push(`- ${msg}`);
      });
      lines.push('');
      hasContent = true;
    }

    if (categories.fix.length > 0) {
      lines.push('### 修复');
      categories.fix.forEach(msg => {
        lines.push(`- ${msg}`);
      });
      lines.push('');
      hasContent = true;
    }

    if (categories.refactor.length > 0) {
      lines.push('### 重构');
      categories.refactor.forEach(msg => {
        lines.push(`- ${msg}`);
      });
      lines.push('');
      hasContent = true;
    }

    if (categories.docs.length > 0) {
      lines.push('### 文档');
      categories.docs.forEach(msg => {
        lines.push(`- ${msg}`);
      });
      lines.push('');
      hasContent = true;
    }

    if (categories.chore.length > 0 && !hasContent) {
      lines.push('### 其他');
      categories.chore.forEach(msg => {
        lines.push(`- ${msg}`);
      });
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');

  return lines.join('\n');
}

/**
 * 更新 CHANGELOG.md（支持预览模式）
 */
async function updateChangelog(version, preview = false) {
  const tagName = version.startsWith('v') ? version : `v${version}`;
  
  if (preview) {
    log(`\n📋 预览 CHANGELOG.md for ${tagName}...`, 'cyan');
  } else {
    log(`\n📝 更新 CHANGELOG.md for ${tagName}...`, 'cyan');
  }

  // 检查标签是否存在（预览模式也需要标签）
  try {
    exec(`git rev-parse ${tagName}`, { silent: true });
  } catch (error) {
    log(`❌ 标签 ${tagName} 不存在`, 'red');
    log('请先创建标签，或提供正确的版本号', 'yellow');
    process.exit(1);
  }

  // 获取标签信息
  const date = getTagDate(tagName);
  const tagMessage = getTagMessage(tagName);
  
  // 获取上一个标签
  let previousTag = null;
  try {
    const allTags = exec('git tag --list --sort=-version:refname', { silent: true }).split('\n');
    const currentIndex = allTags.indexOf(tagName);
    if (currentIndex > 0) {
      previousTag = allTags[currentIndex - 1];
    }
  } catch (error) {
    // 忽略错误
  }

  // 获取提交信息
  const commits = getCommitsBetweenTags(previousTag, tagName);
  const commitHashes = getCommitHashesBetweenTags(previousTag, tagName);

  // 生成版本条目（增强版：支持包标签和 breaking changes）
  const versionEntry = generateVersionEntry(version, date, tagMessage, commits, commitHashes, previousTag, tagName);

  // 读取现有的 CHANGELOG.md
  let changelogContent = '';
  if (existsSync(changelogPath)) {
    changelogContent = readFileSync(changelogPath, 'utf-8');
  } else {
    // 如果文件不存在，创建基本结构
    changelogContent = `# 更新日志

本文档记录项目的所有重要变更。版本号遵循[语义化版本规范](https://semver.org/lang/zh-CN/)。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

## [未发布]

---

`;
  }

  // 如果是预览模式，直接输出，不处理文件内容
  if (preview) {
    log('\n📋 预览模式 - CHANGELOG 条目内容：\n', 'cyan');
    console.log(versionEntry);
    log('\n💡 提示：这只是预览，实际文件未修改。要更新文件，请去掉 --preview 参数。', 'yellow');
    return versionEntry;
  }

  // 检查版本是否已存在
  const versionPattern = new RegExp(`## \\[${version.replace(/\./g, '\\.')}\\]`, 'g');
  if (versionPattern.test(changelogContent)) {
    log(`⚠️  版本 ${version} 已存在于 CHANGELOG.md 中`, 'yellow');
    // 自动更新现有条目（不询问，因为这是自动化脚本）
    const entryPattern = new RegExp(
      `## \\[${version.replace(/\./g, '\\.')}\\][\\s\\S]*?---`,
      'g'
    );
    changelogContent = changelogContent.replace(entryPattern, versionEntry);
    log(`✅ 已更新现有版本条目`, 'green');
  } else {
    // 插入到 [未发布] 之后
    const unreleasedPattern = /## \[未发布\]\s*\n\s*---/;
    if (unreleasedPattern.test(changelogContent)) {
      changelogContent = changelogContent.replace(
        unreleasedPattern,
        `## [未发布]\n\n---\n\n${versionEntry}`
      );
    } else {
      // 如果找不到 [未发布]，插入到文件开头（在标题和说明之后）
      const headerPattern = /(## \[未发布\]\s*\n)/;
      if (headerPattern.test(changelogContent)) {
        changelogContent = changelogContent.replace(headerPattern, `$1\n${versionEntry}`);
      } else {
        // 插入到第一个版本条目之前
        const firstVersionPattern = /(## \[\d+\.\d+\.\d+\])/;
        if (firstVersionPattern.test(changelogContent)) {
          changelogContent = changelogContent.replace(firstVersionPattern, `${versionEntry}$1`);
        } else {
          // 追加到文件末尾
          changelogContent += `\n${versionEntry}`;
        }
      }
    }
  }

  // 写入文件
  writeFileSync(changelogPath, changelogContent, 'utf-8');
  log(`✅ 已更新 CHANGELOG.md`, 'green');
  return versionEntry;
}

/**
 * 简单的输入提示（简化版，用于脚本）
 */
function prompt(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
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

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  // 检查是否有 --preview 参数
  const isPreview = args.includes('--preview');
  // 从参数中移除 --preview
  const versionArgs = args.filter(arg => arg !== '--preview');
  let version = versionArgs[0];

  if (!version && !isPreview) {
    // 如果没有提供版本号，获取最新的标签
    try {
      // 使用跨平台的命令获取最新标签
      const allTags = exec('git tag --list --sort=-version:refname', { silent: true }).split('\n').filter(t => t.trim());
      if (allTags.length > 0) {
        const latestTag = allTags[0];
        version = latestTag.replace(/^v/, ''); // 去掉 v 前缀
        log(`未提供版本号，使用最新标签: v${version}`, 'yellow');
      } else {
        log('❌ 未找到任何标签', 'red');
        log('请提供版本号: node scripts/update-changelog.mjs <version>', 'yellow');
        process.exit(1);
      }
    } catch (error) {
      log('❌ 无法获取最新标签', 'red');
      log('请提供版本号: node scripts/update-changelog.mjs <version>', 'yellow');
      process.exit(1);
    }
  }

  // 如果预览模式但没有版本号，尝试使用最新标签
  if (isPreview && !version) {
    try {
      const allTags = exec('git tag --list --sort=-version:refname', { silent: true }).split('\n').filter(t => t.trim());
      if (allTags.length > 0) {
        const latestTag = allTags[0];
        version = latestTag.replace(/^v/, '');
        log(`预览模式：使用最新标签 v${version}`, 'yellow');
      } else {
        log('❌ 预览模式需要提供版本号或存在 git 标签', 'red');
        log('使用方式: node scripts/update-changelog.mjs <version> --preview', 'yellow');
        process.exit(1);
      }
    } catch (error) {
      log('❌ 预览模式需要提供版本号', 'red');
      log('使用方式: node scripts/update-changelog.mjs <version> --preview', 'yellow');
      process.exit(1);
    }
  }

  // 验证版本号格式（如果有版本号）
  if (version) {
    // 去掉可能的 v 前缀
    version = version.replace(/^v/, '');
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      log('❌ 版本号格式不正确，应为 x.y.z 格式（如 1.0.0）', 'red');
      process.exit(1);
    }
  } else {
    log('❌ 需要提供版本号', 'red');
    log('使用方式: node scripts/update-changelog.mjs <version> [--preview]', 'yellow');
    process.exit(1);
  }

  await updateChangelog(version, isPreview);
}

// 如果直接运行此脚本（不是被导入），执行主函数
// 简单检查：如果 process.argv[1] 包含脚本名称，说明是直接运行的
if (process.argv[1] && process.argv[1].includes('update-changelog.mjs')) {
  main().catch(error => {
    log(`❌ 错误: ${error.message}`, 'red');
    process.exit(1);
  });
}

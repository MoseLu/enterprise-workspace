/**
 * 文档编码修复工具
 * 扫描所有 Markdown 文件，检测并报告乱码问题
 */
;

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, '../');

interface EncodingIssue {
  file: string;
  line: number;
  content: string;
  issue: string;
}

// 乱码模式
const patterns = {
  // UTF-8 替换字符
  replacementChar: /�/g,
  // 常见中文乱码
  garbledChinese: /[缁勪欢灞炴绫诲瀷榛樿鍊璇存槑浜嬩欢鍚鍙傛暟浣跨敤绀轰緥娉ㄦ剰浜嬮」鍔熻兘鎻忚堪寰呰ˉ鍏]/g,
};

/**
 * 扫描单个文件
 */
function scanFile(filePath: string): EncodingIssue[] {
  const issues: EncodingIssue[] = [];
  const relativePath = path.relative(docsRoot, filePath);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // 检查 UTF-8 替换字符
      if (patterns.replacementChar.test(line)) {
        const matches = line.match(patterns.replacementChar);
        issues.push({
          file: relativePath,
          line: lineNum,
          content: line.trim(),
          issue: `发现 ${matches?.length} 个替换字符 (�)`
        });
      }

      // 检查中文乱码
      if (patterns.garbledChinese.test(line)) {
        const matches = line.match(patterns.garbledChinese);
        issues.push({
          file: relativePath,
          line: lineNum,
          content: line.trim(),
          issue: `发现中文乱码 (${matches?.join('')})`
        });
      }
    });
  } catch (error) {
    console.error(`Failed to scan ${relativePath}:`, error);
  }

  return issues;
}

/**
 * 主函数
 */
async function main() {
  console.info('📝 开始扫描文档系统...\n');

  // 扫描所有 .md 文件
  const files = await glob('**/*.md', {
    cwd: docsRoot,
    ignore: ['node_modules/**', '.vitepress/**', 'dist/**'],
  });

  console.info(`找到 ${files.length} 个文档文件\n`);

  const allIssues: EncodingIssue[] = [];
  const affectedFiles = new Set<string>();

  for (const file of files) {
    const fullPath = path.join(docsRoot, file);
    const issues = scanFile(fullPath);

    if (issues.length > 0) {
      allIssues.push(...issues);
      affectedFiles.add(file);
    }
  }

  // 生成报告
  console.info('═══════════════════════════════════════════════════════');
  console.info('                    乱码扫描报告');
  console.info('═══════════════════════════════════════════════════════\n');

  console.info(`📊 统计信息：`);
  console.info(`   - 扫描文件数：${files.length}`);
  console.info(`   - 受影响文件：${affectedFiles.size}`);
  console.info(`   - 问题总数：${allIssues.length}\n`);

  if (allIssues.length === 0) {
    console.info('✅ 未发现编码问题！');
    return;
  }

  // 按文件分组显示
  console.info('🔍 问题详情：\n');

  const issuesByFile = new Map<string, EncodingIssue[]>();
  allIssues.forEach(issue => {
    if (!issuesByFile.has(issue.file)) {
      issuesByFile.set(issue.file, []);
    }
    issuesByFile.get(issue.file)!.push(issue);
  });

  // 按文件显示
  for (const [file, issues] of issuesByFile) {
    console.info(`\n📄 ${file} (${issues.length} 个问题)`);
    console.info('   ' + '─'.repeat(60));

    issues.forEach(issue => {
      console.info(`   行 ${issue.line}: ${issue.issue}`);
      console.info(`   内容: ${issue.content.substring(0, 80)}${issue.content.length > 80 ? '...' : ''}`);
    });
  }

  console.info('\n═══════════════════════════════════════════════════════\n');

  // 生成 JSON 报告
  const reportPath = path.join(docsRoot, 'encoding-issues-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: files.length,
      affectedFiles: affectedFiles.size,
      totalIssues: allIssues.length
    },
    issues: Array.from(issuesByFile.entries()).map(([file, issues]) => ({
      file,
      issueCount: issues.length,
      issues: issues.map(i => ({
        line: i.line,
        issue: i.issue,
        content: i.content
      }))
    }))
  }, null, 2));

  console.info(`📋 详细报告已保存到: ${path.relative(docsRoot, reportPath)}\n`);
}

main().catch(console.error);


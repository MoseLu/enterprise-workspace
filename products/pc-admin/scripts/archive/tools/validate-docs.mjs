/**
 * 文档验证脚本
 * 检查文档格式、链接有效性等
 */
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

/**
 * 检查 Markdown 文件格式
 */
function validateMarkdownFormat(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const errors = [];

  // 检查是否有标题
  if (!content.match(/^#\s+/m)) {
    errors.push('缺少一级标题');
  }

  // 检查链接格式（相对路径应该存在）
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const linkPath = match[2];
    // 跳过外部链接和锚点链接
    if (linkPath.startsWith('http') || linkPath.startsWith('#') || linkPath.startsWith('mailto:')) {
      continue;
    }
    
    // 检查相对路径文件是否存在
    const resolvedPath = path.resolve(path.dirname(filePath), linkPath);
    if (!fs.existsSync(resolvedPath) && !resolvedPath.endsWith('.md')) {
      // 尝试添加 .md 后缀
      const mdPath = resolvedPath + '.md';
      if (!fs.existsSync(mdPath)) {
        errors.push(`链接指向的文件不存在: ${linkPath}`);
      }
    }
  }

  return errors;
}

/**
 * 扫描并验证所有 Markdown 文件
 */
function validateAllDocs() {
  const docsDir = path.resolve(rootDir, 'docs');
  const errors = [];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const fileErrors = validateMarkdownFormat(fullPath);
        if (fileErrors.length > 0) {
          errors.push({
            file: path.relative(rootDir, fullPath),
            errors: fileErrors
          });
        }
      }
    }
  }

  if (fs.existsSync(docsDir)) {
    scanDir(docsDir);
  }

  return errors;
}

/**
 * 主函数
 */
function main() {
  console.log('开始验证文档...\n');

  const errors = validateAllDocs();

  if (errors.length === 0) {
    console.log('✅ 所有文档验证通过！');
    process.exit(0);
  } else {
    console.error('❌ 发现以下文档问题：\n');
    errors.forEach(({ file, errors: fileErrors }) => {
      console.error(`文件: ${file}`);
      fileErrors.forEach(err => console.error(`  - ${err}`));
      console.error('');
    });
    console.error(`总共发现 ${errors.length} 个文件有问题`);
    process.exit(1);
  }
}

main();

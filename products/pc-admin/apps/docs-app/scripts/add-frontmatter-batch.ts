/**
 * 批量为文档添加 frontmatter
 * 扫描所有没有 frontmatter 的 .md 文件并自动添加
 */
;

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, '../');

interface FrontmatterConfig {
  title: string;
  type: string;
  project: string;
  package?: string;
  owner: string;
  created: string;
  updated: string;
  publish: boolean;
  tags: string[];
  sidebar_label?: string;
  sidebar_order?: number;
  sidebar_group?: string;
  sidebar_collapsed?: boolean;
}

// 从文件路径推断 frontmatter
function inferFrontmatter(filePath: string, content: string): FrontmatterConfig {
  const relativePath = path.relative(docsRoot, filePath);
  const fileName = path.basename(filePath, '.md');

  // 提取标题（第一个 # 标题）
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : fileName;

  // 根据路径推断类型和项目
  let type = 'guide';
  let project = 'btc-shopflow';
  const owner = 'dev-team';
  const tags: string[] = [];
  let sidebarGroup = '';
  let sidebarOrder = 999;

  if (relativePath.includes('adr')) {
    type = 'decision';
    tags.push('adr');
    sidebarGroup = '架构决策记录';
  } else if (relativePath.includes('rfc')) {
    type = 'rfc';
    tags.push('rfc');
    sidebarGroup = '方案设计';
  } else if (relativePath.includes('sop')) {
    type = 'howto';
    tags.push('sop');
    sidebarGroup = '操作手册';
  } else if (relativePath.includes('packages')) {
    type = 'api';
    tags.push('api', 'packages');
    sidebarGroup = '包文档';
  } else if (relativePath.includes('components')) {
    type = 'guide';
    tags.push('components');
    sidebarGroup = '组件文档';
    project = 'components';
  } else if (relativePath.includes('guides/integration')) {
    type = 'summary';
    tags.push('integration', 'vitepress');
    sidebarGroup = '集成指南';
    project = 'integration';
  } else if (relativePath.includes('guides/system')) {
    type = 'guide';
    tags.push('system');
    sidebarGroup = '系统指南';
    project = 'system';
  } else if (relativePath.includes('guides/forms')) {
    type = 'guide';
    tags.push('forms');
    sidebarGroup = '表单指南';
    project = 'forms';
  } else if (relativePath.includes('guides/layout')) {
    type = 'api';
    tags.push('layout');
    sidebarGroup = 'Layout 组件';
    project = 'layout';
  }

  // 根据文件名推断排序
  if (fileName.includes('complete') || fileName.includes('summary')) {
    sidebarOrder = 1;
  } else if (fileName.includes('index')) {
    sidebarOrder = 0;
  }

  // 获取文件修改时间
  const stats = fs.statSync(filePath);
  const created = stats.mtime.toISOString().split('T')[0];

  const frontmatter: any = {
    title,
    type,
    project,
    owner: owner.startsWith('@') ? owner.substring(1) : owner, // 移除 @ 符号
    created,
    updated: created,
    publish: true,
    tags,
    sidebar_label: title,
    sidebar_order: sidebarOrder,
    sidebar_collapsed: false,
  };

  // 只有在有值时才添加
  if (sidebarGroup) {
    frontmatter.sidebar_group = sidebarGroup;
  }

  return frontmatter as FrontmatterConfig;
}

// 检查是否已有 frontmatter
function hasFrontmatter(content: string): boolean {
  return content.trim().startsWith('---');
}

// 添加 frontmatter
function addFrontmatter(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');

  if (hasFrontmatter(content)) {
    console.info(`⏭️  跳过（已有 frontmatter）: ${path.relative(docsRoot, filePath)}`);
    return;
  }

  const frontmatter = inferFrontmatter(filePath, content);

  // 构建 YAML
  const yaml = matter.stringify(content, frontmatter);

  fs.writeFileSync(filePath, yaml);
  console.info(`✅ 已添加 frontmatter: ${path.relative(docsRoot, filePath)}`);
}

// 主函数
async function main() {
  console.info('📝 批量添加 frontmatter...\n');

  // 扫描所有 .md 文件（排除特殊目录）
  const files = await glob('**/*.md', {
    cwd: docsRoot,
    ignore: [
      'node_modules/**',
      '.vitepress/**',
      'dist/**',
      'README.md',
    ],
  });

  console.info(`找到 ${files.length} 个文档文件\n`);

  for (const file of files) {
    const fullPath = path.join(docsRoot, file);
    addFrontmatter(fullPath);
  }

  console.info('\n🎉 Frontmatter 添加完成！');
}

main().catch(console.error);


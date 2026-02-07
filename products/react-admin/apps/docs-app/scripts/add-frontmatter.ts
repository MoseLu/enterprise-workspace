;
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';

interface FrontmatterTemplate {
  title: string;
  type: 'summary' | 'rca' | 'howto' | 'decision' | 'guide' | 'api' | 'retro' | 'checklist';
  project: string;
  author: string;
  created: string;
  publish: boolean;
  tags?: string[];
  status?: string;
}

// 从文件内容提取标题
function extractTitle(content: string, fileName: string): string {
  // 尝试从第一行提取 markdown 标题
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^#\s+(.+)$/);
    if (match) {
      return match[1].trim();
    }
  }

  // 如果没有找到，使用文件名
  return fileName.replace(/\.md$/, '').replace(/-/g, ' ');
}

// 根据文件路径推断元数据
function inferMetadata(filePath: string, content: string): FrontmatterTemplate {
  const fileName = path.basename(filePath);
  const relativePath = filePath.replace(/\\/g, '/');

  let type: FrontmatterTemplate['type'] = 'guide';
  let project = 'general';
  const author = 'ai:cursor-agent';

  // 推断 type
  if (relativePath.includes('/adr/')) {
    type = 'decision';
  } else if (relativePath.includes('/sop/')) {
    type = 'howto';
  } else if (relativePath.includes('/guides/')) {
    type = 'guide';
  } else if (fileName === 'README.md') {
    type = 'api';
  } else if (fileName.includes('COMPLETE') || fileName.includes('REPORT')) {
    type = 'summary';
  }

  // 推断 project
  if (relativePath.includes('guides/components')) {
    project = 'components';
  } else if (relativePath.includes('guides/forms')) {
    project = 'forms';
  } else if (relativePath.includes('guides/system')) {
    project = 'system';
  } else if (relativePath.includes('packages/shared-components')) {
    project = 'shared-components';
  } else if (relativePath.includes('packages/shared-core')) {
    project = 'shared-core';
  } else if (relativePath.includes('packages/shared-utils')) {
    project = 'shared-utils';
  } else if (relativePath.includes('packages/vite-plugin')) {
    project = 'vite-plugin';
  } else if (relativePath.includes('apps/admin-app/src/layout')) {
    project = 'layout';
  } else if (relativePath.includes('apps/admin-app/src/config')) {
    project = 'config';
  } else if (relativePath.includes('apps/admin-app/src/plugins')) {
    project = 'plugins';
  } else if (relativePath.includes('/configs')) {
    project = 'configs';
  }

  const title = extractTitle(content, fileName);
  const created = new Date().toISOString().split('T')[0];

  return {
    title,
    type,
    project,
    author,
    created,
    publish: true,
    status: 'active'
  };
}

// 添加 frontmatter 到文档
async function addFrontmatter(filePath: string, dryRun: boolean = false): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(content);

    // 如果已有 frontmatter 且包含必要字段，跳过
    if (parsed.data && parsed.data.title && parsed.data.type && parsed.data.project) {
      console.info(`  ⏭️  跳过 (已有 frontmatter): ${path.basename(filePath)}`);
      return false;
    }

    // 推断元数据
    const metadata = inferMetadata(filePath, parsed.content);

    // 合并现有 frontmatter（如果有）
    const newFrontmatter = {
      ...metadata,
      ...parsed.data // 保留原有的字段
    };

    // 生成新文档
    const newContent = matter.stringify(parsed.content, newFrontmatter);

    if (dryRun) {
      console.info(`  🔍 [DRY RUN] ${path.basename(filePath)}`);
      console.info(`     推断: ${metadata.title} | ${metadata.type} | ${metadata.project}`);
    } else {
      await fs.writeFile(filePath, newContent);
      console.info(`  ✅ ${path.basename(filePath)}`);
    }

    return true;
  } catch (error) {
    console.error(`  ❌ 错误: ${filePath}`, error);
    return false;
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const pattern = args.find(arg => !arg.startsWith('--')) || '**/*.md';

  console.info('=== 批量添加 Frontmatter ===\n');
  console.info(`模式: ${dryRun ? 'DRY RUN（预览）' : '正式执行'}`);
  console.info(`匹配: ${pattern}\n`);

  const rootDir = path.join(process.cwd(), '../..');
  const files = await glob(path.join(rootDir, pattern).replace(/\\/g, '/'), {
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.vitepress/**',
      '**/archive/**',
      '**/apps/docs-site/**'
    ]
  });

  console.info(`找到 ${files.length} 个文档\n`);

  let processed = 0;
  let skipped = 0;

  for (const file of files) {
    const result = await addFrontmatter(file, dryRun);
    if (result) {
      processed++;
    } else {
      skipped++;
    }
  }

  console.info('\n=== 完成 ===');
  console.info(`处理: ${processed} 个`);
  console.info(`跳过: ${skipped} 个`);

  if (dryRun) {
    console.info('\n💡 这是预览模式，没有实际修改文件');
    console.info('   运行 `pnpm add-frontmatter` 执行实际操作');
  }
}

main().catch(console.error);


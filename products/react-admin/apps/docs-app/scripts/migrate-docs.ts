/**
 * 文档迁移脚本
 * 将分散的 Markdown 文档迁移到 docs-site，并添加 frontmatter
 */
;

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');
const docsiteDir = path.resolve(__dirname, '../');

interface DocMeta {
  title: string;
  type: 'guide' | 'decision' | 'rfc' | 'howto' | 'api' | 'summary';
  project: string;
  package?: string;
  owner: string;
  created: string;
  updated: string;
  publish: boolean;
  tags: string[];
}

// 从文件名和内容推断元数据
function inferMeta(filePath: string, content: string): DocMeta {
  const fileName = path.basename(filePath, '.md');
  const relativePath = path.relative(rootDir, filePath);

  // 提取标题（第一个 # 标题）
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : fileName;

  // 根据路径推断类型
  let type: DocMeta['type'] = 'guide';
  let project = 'btc-shopflow';
  const owner = 'dev-team';
  const tags: string[] = [];

  if (relativePath.includes('\\adr\\') || relativePath.includes('/adr/')) {
    type = 'decision';
    tags.push('adr');
  } else if (relativePath.includes('\\rfc\\') || relativePath.includes('/rfc/')) {
    type = 'rfc';
    tags.push('rfc');
  } else if (relativePath.includes('\\sop\\') || relativePath.includes('/sop/')) {
    type = 'howto';
    tags.push('sop');
  } else if (relativePath.includes('README.md')) {
    type = 'api';
  } else if (fileName.includes('VITEPRESS') || fileName.includes('DOCS-')) {
    type = 'summary';
    tags.push('integration');
  }

  // 根据路径推断项目
  if (relativePath.includes('components')) {
    project = 'components';
    tags.push('components');
  } else if (relativePath.includes('forms')) {
    project = 'forms';
    tags.push('forms');
  } else if (relativePath.includes('system')) {
    project = 'system';
    tags.push('system');
  } else if (relativePath.includes('layout')) {
    project = 'layout';
    tags.push('layout');
  } else if (relativePath.includes('i18n')) {
    project = 'i18n';
    tags.push('i18n');
  }

  // 根据路径推断包名
  const packageMatch = relativePath.match(/packages[\\/]([^\\/]+)/);
  const packageName = packageMatch ? packageMatch[1] : undefined;

  // 获取文件修改时间作为创建日期
  const stats = fs.statSync(filePath);
  const created = stats.mtime.toISOString().split('T')[0];
  const updated = created;

  return {
    title,
    type,
    project,
    package: packageName,
    owner,
    created,
    updated,
    publish: true,
    tags: [...new Set(tags)] // 去重
  };
}

// 生成 frontmatter
function generateFrontmatter(meta: DocMeta): string {
  const lines: string[] = ['---'];

  lines.push(`title: "${meta.title}"`);
  lines.push(`type: ${meta.type}`);
  lines.push(`project: ${meta.project}`);

  if (meta.package) {
    lines.push(`package: ${meta.package}`);
  }

  lines.push(`owner: ${meta.owner}`);
  lines.push(`created: ${meta.created}`);
  lines.push(`updated: ${meta.updated}`);
  lines.push(`publish: ${meta.publish}`);

  if (meta.tags.length > 0) {
    lines.push(`tags: [${meta.tags.map(t => `"${t}"`).join(', ')}]`);
  }

  lines.push('---');
  lines.push('');

  return lines.join('\n');
}

// 检查文档是否已有 frontmatter
function hasFrontmatter(content: string): boolean {
  return content.trim().startsWith('---');
}

// 迁移单个文档
function migrateDoc(sourcePath: string, targetPath: string) {
  const content = fs.readFileSync(sourcePath, 'utf-8');

  // 如果已有 frontmatter，直接复制
  if (hasFrontmatter(content)) {
    fs.writeFileSync(targetPath, content);
    console.info(`✅ 已复制（已有 frontmatter）: ${path.basename(sourcePath)}`);
    return;
  }

  // 否则添加 frontmatter
  const meta = inferMeta(sourcePath, content);
  const frontmatter = generateFrontmatter(meta);
  const newContent = frontmatter + content;

  fs.writeFileSync(targetPath, newContent);
  console.info(`✅ 已迁移: ${path.basename(sourcePath)} → ${path.relative(docsiteDir, targetPath)}`);
}

// 主函数
async function main() {
  console.info('📦 开始文档迁移...\n');

  // 1. 迁移根目录的技术文档
  console.info('1️⃣ 迁移根目录技术文档...');
  const rootDocs = [
    'VITEPRESS-INTEGRATION-COMPLETE.md',
    'VITEPRESS-SEARCH-INTEGRATION.md',
    'DOCS-LAYOUT-HIDE-STRATEGY.md',
    'DOCS-INTEGRATION-SUMMARY.md',
    'DOCS-INSTANT-SWITCH.md',
    'DOCS-CACHE-DEBUG.md',
    'DOCS-IFRAME-CACHE-OPTIMIZATION.md',
    'LAYOUT-REFACTOR-COMPLETE.md',
  ];

  const integrationDir = path.join(docsiteDir, 'guides', 'integration');
  fs.mkdirSync(integrationDir, { recursive: true });

  for (const doc of rootDocs) {
    const sourcePath = path.join(rootDir, doc);
    if (fs.existsSync(sourcePath)) {
      // 转换为 kebab-case 文件名
      const newName = doc
        .replace(/\.md$/, '')
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '')
        + '.md';

      const targetPath = path.join(integrationDir, newName);
      migrateDoc(sourcePath, targetPath);
    }
  }

  console.info('\n✅ 根目录文档迁移完成！\n');

  // 2. docs/ 目录已通过文件复制完成，这里只需确认
  console.info('2️⃣ docs/ 目录内容已复制');

  // 3. 迁移包级 README
  console.info('\n3️⃣ 迁移包级 README...');
  const packages = [
    'shared-core',
    'shared-components',
    'shared-utils',
    'vite-plugin',
  ];

  const packagesDir = path.join(docsiteDir, 'packages');
  fs.mkdirSync(packagesDir, { recursive: true });

  for (const pkg of packages) {
    const sourcePath = path.join(rootDir, 'packages', pkg, 'README.md');
    if (fs.existsSync(sourcePath)) {
      const targetPath = path.join(packagesDir, `${pkg}.md`);
      migrateDoc(sourcePath, targetPath);
    }
  }

  // 特殊包（嵌套 README）
  const nestedReadmes = [
    { source: 'packages/shared-components/src/crud/README.md', target: 'packages/btc-crud.md' },
    { source: 'packages/shared-components/src/common/form/README.md', target: 'packages/btc-form.md' },
    { source: 'packages/shared-components/src/common/dialog/README.md', target: 'packages/btc-dialog.md' },
    { source: 'packages/shared-components/src/crud/upsert/README.md', target: 'packages/btc-upsert.md' },
    { source: 'packages/shared-components/src/common/view-group/README.md', target: 'packages/btc-view-group.md' },
    { source: 'packages/shared-components/src/common/svg/README.md', target: 'packages/btc-svg.md' },
    { source: 'packages/shared-core/src/btc/crud/README.md', target: 'packages/use-crud.md' },
    { source: 'packages/shared-core/src/btc/plugins/i18n/README.md', target: 'packages/i18n-plugin.md' },
    { source: 'packages/shared-core/src/btc/plugins/manager/README.md', target: 'packages/plugin-manager.md' },
    { source: 'packages/shared-core/src/btc/plugins/excel/README.md', target: 'packages/excel-plugin.md' },
  ];

  for (const { source, target } of nestedReadmes) {
    const sourcePath = path.join(rootDir, source);
    const targetPath = path.join(docsiteDir, target);

    if (fs.existsSync(sourcePath)) {
      migrateDoc(sourcePath, targetPath);
    }
  }

  console.info('\n✅ 包级 README 迁移完成！\n');

  // 4. 迁移 Layout 组件 README
  console.info('4️⃣ 迁移 Layout 组件 README...');
  const layoutComponents = [
    'breadcrumb',
    'dynamic-menu',
    'global-search',
    'locale-switcher',
    'menu-drawer',
    'process',
    'sidebar',
    'theme-switcher',
    'topbar',
  ];

  const layoutDir = path.join(docsiteDir, 'guides', 'layout');
  fs.mkdirSync(layoutDir, { recursive: true });

  for (const component of layoutComponents) {
    const sourcePath = path.join(rootDir, 'apps/admin-app/src/layout', component, 'README.md');
    if (fs.existsSync(sourcePath)) {
      const targetPath = path.join(layoutDir, `${component}.md`);
      migrateDoc(sourcePath, targetPath);
    }
  }

  // Layout 总 README
  const layoutReadmePath = path.join(rootDir, 'apps/admin-app/src/layout/README.md');
  if (fs.existsSync(layoutReadmePath)) {
    const targetPath = path.join(layoutDir, 'index.md');
    migrateDoc(layoutReadmePath, targetPath);
  }

  console.info('\n✅ Layout 组件 README 迁移完成！\n');

  console.info('\n🎉 所有文档迁移完成！');
  console.info('📊 下一步：运行 pnpm --filter docs-site-app dev 验证文档');
}

main().catch(console.error);


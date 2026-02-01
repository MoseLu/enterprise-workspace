;
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { glob } from 'glob';
import { execa } from 'execa';

// 类型定义
interface Frontmatter {
  title: string;
  type: 'summary' | 'rca' | 'howto' | 'decision' | 'guide' | 'api' | 'retro' | 'checklist';
  project: string;
  package?: string;
  owner?: string;
  author: string;
  created: string;
  updated?: string;
  publish: boolean;
  status?: 'active' | 'draft' | 'deprecated' | 'archived';
  tags?: string[];
  confidentiality?: 'internal' | 'restricted' | 'public';
  source?: {
    repo?: string;
    path?: string;
    commit?: string;
  };
  links?: {
    pr?: string[];
    issues?: string[];
  };
  [key: string]: any;
}

interface DocInfo {
  sourcePath: string;
  frontmatter: Frontmatter;
  content: string;
  targetPath: string;
}

// 加载配置
async function loadConfig() {
  const configPath = path.join(process.cwd(), '.sources.json');
  return await fs.readJSON(configPath);
}

// 加载 schema
async function loadSchema() {
  const schemaPath = path.join(process.cwd(), '.vitepress/schemas/frontmatter.schema.json');
  return await fs.readJSON(schemaPath);
}

// 创建验证器
function createValidator(schema: any) {
  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);
  return ajv.compile(schema);
}

// 提取 Git 元数据
async function getGitInfo(filePath: string): Promise<{
  commit: string;
  author: string;
  date: string;
}> {
  try {
    const { stdout: commit } = await execa('git', ['log', '-1', '--format=%H', filePath]);
    const { stdout: author } = await execa('git', ['log', '-1', '--format=%an', filePath]);
    const { stdout: date } = await execa('git', ['log', '-1', '--format=%ci', filePath]);

    return {
      commit: commit.trim(),
      author: author.trim(),
      date: date.split(' ')[0] // 只取日期部分
    };
  } catch (error) {
    console.warn(`[Git] Failed to get info for ${filePath}:`, error);
    return {
      commit: 'unknown',
      author: 'unknown',
      date: new Date().toISOString().split('T')[0]
    };
  }
}

// 从文件路径推断 project
function inferProject(filePath: string, projectMapping: Record<string, string>): string {
  for (const [pattern, project] of Object.entries(projectMapping)) {
    if (filePath.includes(pattern.replace(/\\/g, '/'))) {
      return project;
    }
  }

  // 默认推断
  if (filePath.includes('/packages/')) {
    const match = filePath.match(/packages\/([^/]+)/);
    return match ? match[1] : 'unknown';
  }

  if (filePath.includes('/apps/')) {
    const match = filePath.match(/apps\/([^/]+)/);
    return match ? match[1] : 'unknown';
  }

  return 'general';
}

// 从文件路径推断 type
function inferType(filePath: string): Frontmatter['type'] {
  if (filePath.includes('/adr/')) return 'decision';
  if (filePath.includes('/sop/')) return 'howto';
  if (filePath.includes('/guides/')) return 'guide';
  if (filePath.includes('README.md')) return 'api';
  if (filePath.includes('COMPLETE') || filePath.includes('REPORT')) return 'summary';
  return 'guide';
}

// 计算目标路径
function computeTargetPath(frontmatter: Frontmatter, sourcePath: string): string {
  const { type, project, created } = frontmatter;
  const date = new Date(created);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  // 从源路径提取文件名
  const fileName = path.basename(sourcePath);
  const slug = fileName.replace(/\.md$/, '').toLowerCase();

  // 目标路径：_ingested/{type}/{project}/{year}/{month}/{slug}.md
  return path.join('_ingested', type, project, String(year), month, `${slug}.md`);
}

// 处理单个文档
async function processDocument(
  filePath: string,
  config: any,
  validate: any
): Promise<DocInfo | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);

    // 如果没有 frontmatter，跳过
    if (!frontmatter || Object.keys(frontmatter).length === 0) {
      console.warn(`[Skip] No frontmatter: ${filePath}`);
      return null;
    }

    // 验证 frontmatter
    if (!validate(frontmatter)) {
      console.error(`[Invalid] ${filePath}:`, validate.errors);
      return null;
    }

    // 只处理 publish: true 的文档
    if (frontmatter.publish !== true) {
      console.info(`[Skip] Not published: ${filePath}`);
      return null;
    }

    // 提取 Git 元数据
    const gitInfo = await getGitInfo(filePath);

    // 补充元数据
    if (!frontmatter.source) {
      frontmatter.source = {};
    }
    frontmatter.source.commit = gitInfo.commit;
    frontmatter.source.path = path.relative(path.join(process.cwd(), '../..'), filePath);
    frontmatter.source.repo = 'btc-shopflow-monorepo';

    // 如果没有 updated，使用 created
    if (!frontmatter.updated) {
      frontmatter.updated = frontmatter.created;
    }

    // 计算目标路径
    const targetPath = computeTargetPath(frontmatter as Frontmatter, filePath);

    return {
      sourcePath: filePath,
      frontmatter: frontmatter as Frontmatter,
      content: body,
      targetPath
    };
  } catch (error) {
    console.error(`[Error] Failed to process ${filePath}:`, error);
    return null;
  }
}

// 生成索引页
async function generateIndexes(docs: DocInfo[]) {
  const outputDir = path.join(process.cwd());

  // 1. 生成首页
  const indexContent = generateIndexPage(docs);
  await fs.writeFile(path.join(outputDir, 'index.md'), indexContent);

  // 2. 生成时间线
  const timelineContent = generateTimelinePage(docs);
  await fs.ensureDir(path.join(outputDir, 'timeline'));
  await fs.writeFile(path.join(outputDir, 'timeline/index.md'), timelineContent);

  // 3. 生成项目索引
  const projectsContent = generateProjectsPage(docs);
  await fs.ensureDir(path.join(outputDir, 'projects'));
  await fs.writeFile(path.join(outputDir, 'projects/index.md'), projectsContent);

  // 4. 生成类型索引
  const typesContent = generateTypesPage(docs);
  await fs.ensureDir(path.join(outputDir, 'types'));
  await fs.writeFile(path.join(outputDir, 'types/index.md'), typesContent);

  // 5. 生成标签云
  const tagsContent = generateTagsPage(docs);
  await fs.ensureDir(path.join(outputDir, 'tags'));
  await fs.writeFile(path.join(outputDir, 'tags/index.md'), tagsContent);
}

// 生成首页内容
function generateIndexPage(docs: DocInfo[]): string {
  const recent = docs
    .sort((a, b) => b.frontmatter.created.localeCompare(a.frontmatter.created))
    .slice(0, 10);

  const stats = {
    total: docs.length,
    byType: {} as Record<string, number>,
    byProject: {} as Record<string, number>
  };

  docs.forEach(doc => {
    stats.byType[doc.frontmatter.type] = (stats.byType[doc.frontmatter.type] || 0) + 1;
    stats.byProject[doc.frontmatter.project] = (stats.byProject[doc.frontmatter.project] || 0) + 1;
  });

  return `---
layout: home

hero:
  name: BTC 车间流程管理系统
  text: 内部开发者档案库
  tagline: Engineering Knowledge Archive - ${stats.total} 篇文档
  actions:
    - theme: brand
      text: 时间线
      link: /timeline/
    - theme: alt
      text: 按项目浏览
      link: /projects/

features:
  - icon: 📚
    title: ${stats.total} 篇文档
    details: 覆盖组件、系统、架构等多个领域

  - icon: 🏷️
    title: ${Object.keys(stats.byType).length} 种类型
    details: ${Object.keys(stats.byType).join('、')}

  - icon: 📁
    title: ${Object.keys(stats.byProject).length} 个项目
    details: ${Object.keys(stats.byProject).slice(0, 5).join('、')}...
---

## 📊 文档统计

### 按类型分布

${Object.entries(stats.byType)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => `- **${type}**: ${count} 篇`)
  .join('\n')}

### 按项目分布

${Object.entries(stats.byProject)
  .sort((a, b) => b[1] - a[1])
  .map(([project, count]) => `- **${project}**: ${count} 篇`)
  .join('\n')}

---

## 📝 最新文档

${recent.map(doc => {
  const link = `/${doc.targetPath.replace(/\\/g, '/')}`;
  return `- [${doc.frontmatter.title}](${link}) - ${doc.frontmatter.created} - ${doc.frontmatter.project}`;
}).join('\n')}

---

## 🔍 快速导航

- [📅 时间线](/timeline/) - 按时间浏览
- [📁 项目](/projects/) - 按项目浏览
- [🏷️ 类型](/types/) - 按类型浏览
- [🔖 标签](/tags/) - 按标签浏览
- [🧩 组件](/components/) - 组件文档和演示
`;
}

// 生成时间线页面
function generateTimelinePage(docs: DocInfo[]): string {
  const sorted = docs.sort((a, b) =>
    b.frontmatter.created.localeCompare(a.frontmatter.created)
  );

  const recent = sorted.filter(doc => {
    const created = new Date(doc.frontmatter.created);
    const now = new Date();
    const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 90; // 最近 90 天
  });

  // 按月分组
  const byMonth = recent.reduce((acc, doc) => {
    const month = doc.frontmatter.created.substring(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = [];
    acc[month].push(doc);
    return acc;
  }, {} as Record<string, DocInfo[]>);

  return `# 📅 时间线

> 最近 90 天的文档更新（共 ${recent.length} 篇）

${Object.entries(byMonth)
  .sort((a, b) => b[0].localeCompare(a[0]))
  .map(([month, docs]) => {
    return `## ${month}\n\n${docs.map(doc => {
      const link = `/${doc.targetPath.replace(/\\/g, '/')}`;
      return `- **[${doc.frontmatter.title}](${link})** - ${doc.frontmatter.author} - \`${doc.frontmatter.type}\` - ${doc.frontmatter.project}`;
    }).join('\n')}`;
  }).join('\n\n')}
`;
}

// 生成项目索引页面
function generateProjectsPage(docs: DocInfo[]): string {
  const byProject = docs.reduce((acc, doc) => {
    const project = doc.frontmatter.project;
    if (!acc[project]) acc[project] = [];
    acc[project].push(doc);
    return acc;
  }, {} as Record<string, DocInfo[]>);

  return `# 📁 项目索引

> 按项目分类的所有文档

${Object.entries(byProject)
  .sort((a, b) => b[1].length - a[1].length)
  .map(([project, docs]) => {
    return `## ${project} (${docs.length}篇)\n\n${docs
      .sort((a, b) => b.frontmatter.created.localeCompare(a.frontmatter.created))
      .map(doc => {
        const link = `/${doc.targetPath.replace(/\\/g, '/')}`;
        return `- [${doc.frontmatter.title}](${link}) - ${doc.frontmatter.created} - \`${doc.frontmatter.type}\``;
      }).join('\n')}`;
  }).join('\n\n')}
`;
}

// 生成类型索引页面
function generateTypesPage(docs: DocInfo[]): string {
  const byType = docs.reduce((acc, doc) => {
    const type = doc.frontmatter.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {} as Record<string, DocInfo[]>);

  const typeLabels: Record<string, string> = {
    summary: '总结归纳',
    rca: '问题根因分析',
    howto: '操作手册',
    decision: '架构决策',
    guide: '功能指南',
    api: 'API 文档',
    retro: '复盘回顾',
    checklist: '检查清单'
  };

  return `# 🏷️ 类型索引

> 按文档类型分类

${Object.entries(byType)
  .sort((a, b) => b[1].length - a[1].length)
  .map(([type, docs]) => {
    const label = typeLabels[type] || type;
    return `## ${label} (${docs.length}篇)\n\n${docs
      .sort((a, b) => b.frontmatter.created.localeCompare(a.frontmatter.created))
      .map(doc => {
        const link = `/${doc.targetPath.replace(/\\/g, '/')}`;
        return `- [${doc.frontmatter.title}](${link}) - ${doc.frontmatter.created} - ${doc.frontmatter.project}`;
      }).join('\n')}`;
  }).join('\n\n')}
`;
}

// 生成标签页面
function generateTagsPage(docs: DocInfo[]): string {
  const allTags: Record<string, DocInfo[]> = {};

  docs.forEach(doc => {
    if (doc.frontmatter.tags) {
      doc.frontmatter.tags.forEach(tag => {
        if (!allTags[tag]) allTags[tag] = [];
        allTags[tag].push(doc);
      });
    }
  });

  return `# 🔖 标签云

> 按标签聚合的文档

${Object.entries(allTags)
  .sort((a, b) => b[1].length - a[1].length)
  .map(([tag, docs]) => {
    return `## #${tag} (${docs.length})\n\n${docs
      .sort((a, b) => b.frontmatter.created.localeCompare(a.frontmatter.created))
      .map(doc => {
        const link = `/${doc.targetPath.replace(/\\/g, '/')}`;
        return `- [${doc.frontmatter.title}](${link}) - ${doc.frontmatter.created}`;
      }).join('\n')}`;
  }).join('\n\n')}
`;
}

// 主函数
async function ingest() {
  console.info('=== 开始文档采集 ===\n');

  // 1. 加载配置和 schema
  const config = await loadConfig();
  const schema = await loadSchema();
  const validate = createValidator(schema);

  console.info('✅ 配置和 schema 加载完成');

  // 2. 扫描源文档
  console.info('\n📂 扫描源文档...');
  const rootDir = path.join(process.cwd(), '../..');
  const files: string[] = [];

  for (const pattern of config.include) {
    const absolutePattern = path.join(rootDir, pattern);
    const matched = await glob(absolutePattern.replace(/\\/g, '/'), {
      ignore: config.exclude.map((p: string) => path.join(rootDir, p).replace(/\\/g, '/'))
    });
    files.push(...matched);
  }

  console.info(`  找到 ${files.length} 个文档文件`);

  // 3. 处理每个文档
  console.info('\n📝 处理文档...');
  const processedDocs: DocInfo[] = [];
  let skipped = 0;
  const invalid = 0;

  for (const file of files) {
    const doc = await processDocument(file, config, validate);
    if (doc) {
      processedDocs.push(doc);
      console.info(`  ✅ ${path.basename(file)}`);
    } else {
      if (files.length > 0) skipped++;
    }
  }

  console.info(`\n处理完成: ${processedDocs.length} 成功, ${skipped} 跳过, ${invalid} 无效`);

  // 4. 写入文档到目标位置
  console.info('\n📦 写入文档...');
  const outputDir = process.cwd();

  for (const doc of processedDocs) {
    const targetFullPath = path.join(outputDir, doc.targetPath);
    await fs.ensureDir(path.dirname(targetFullPath));

    // 重新组装文档（frontmatter + content）
    const newContent = matter.stringify(doc.content, doc.frontmatter);
    await fs.writeFile(targetFullPath, newContent);
  }

  console.info(`  写入 ${processedDocs.length} 个文档`);

  // 5. 生成索引页
  console.info('\n📑 生成索引页...');
  await generateIndexes(processedDocs);
  console.info('  ✅ 索引页生成完成');

  // 6. 统计报告
  console.info('\n=== 采集完成 ===');
  console.info(`总计: ${processedDocs.length} 篇文档`);
  console.info('\n按类型:');
  const byType = processedDocs.reduce((acc, doc) => {
    acc[doc.frontmatter.type] = (acc[doc.frontmatter.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  Object.entries(byType).forEach(([type, count]) => {
    console.info(`  ${type}: ${count} 篇`);
  });

  console.info('\n按项目:');
  const byProject = processedDocs.reduce((acc, doc) => {
    acc[doc.frontmatter.project] = (acc[doc.frontmatter.project] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  Object.entries(byProject)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([project, count]) => {
      console.info(`  ${project}: ${count} 篇`);
    });
}

// 执行
ingest().catch(console.error);


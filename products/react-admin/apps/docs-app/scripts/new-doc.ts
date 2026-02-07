;
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.info('=== 创建新文档 ===\n');

  // 1. 选择文档类型
  console.info('文档类型:');
  console.info('  1. guide - 功能指南');
  console.info('  2. api - API 文档');
  console.info('  3. decision - 架构决策');
  console.info('  4. howto - 操作手册');
  console.info('  5. summary - 总结归纳');
  console.info('  6. rca - 问题根因分析');
  console.info('  7. retro - 复盘回顾');
  console.info('  8. checklist - 检查清单\n');

  const typeChoice = await question('选择类型 (1-8): ');
  const types = ['guide', 'api', 'decision', 'howto', 'summary', 'rca', 'retro', 'checklist'];
  const type = types[parseInt(typeChoice) - 1] || 'guide';

  // 2. 输入标题
  const title = await question('\n文档标题: ');

  // 3. 输入项目
  const project = await question('所属项目 (如 components, system, shared-core): ');

  // 4. 输入作者
  const defaultAuthor = 'ai:cursor-agent';
  const author = await question(`作者 (默认 ${defaultAuthor}): `) || defaultAuthor;

  // 5. 输入标签
  const tagsInput = await question('标签 (逗号分隔): ');
  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];

  // 6. 确认是否发布
  const publishInput = await question('是否发布到档案库? (Y/n): ');
  const publish = publishInput.toLowerCase() !== 'n';

  rl.close();

  // 生成文件名
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '');

  const fileName = `${slug}.md`;
  const created = new Date().toISOString().split('T')[0];

  // 根据类型生成模板内容
  let templateContent = '';

  switch (type) {
    case 'decision':
      templateContent = `# ${title}

## 背景（Context）

描述需要做决策的背景和问题。

## 备选方案（Options）

### 方案 A

- 优点:
- 缺点:

### 方案 B

- 优点:
- 缺点:

## 决策（Decision）

我们选择了方案 X，理由是...

## 后果（Consequences）

- 正向影响:
  -
- 负向影响:
  -
`;
      break;

    case 'howto':
      templateContent = `# ${title}

## 前提条件

- 权限:
- 环境:

## 操作步骤

### 1. 步骤一

\`\`\`bash
# 命令示例
\`\`\`

### 2. 步骤二

### 3. 步骤三

## 验证

如何确认操作成功：

## 故障回滚

如果失败，如何回滚：
`;
      break;

    case 'api':
      templateContent = `# ${title}

## 概述

简要描述这个模块/组件的用途。

## 安装

\`\`\`bash
pnpm add @btc/${project}
\`\`\`

## 使用示例

\`\`\`typescript
import { Something } from '@btc/${project}';

// 使用示例
\`\`\`

## API

### 函数/组件名称

**参数:**

- \`param1\` (\`string\`) - 参数说明
- \`param2\` (\`number\`, 可选) - 参数说明

**返回值:**

返回值说明

**示例:**

\`\`\`typescript
example();
\`\`\`
`;
      break;

    default:
      templateContent = `# ${title}

## 概述

简要说明...

## 详细内容

...

## 相关资源

- [链接1](#)
- [链接2](#)
`;
  }

  // 创建 frontmatter
  const frontmatter = {
    title,
    type,
    project,
    author,
    created,
    updated: created,
    publish,
    status: 'active',
    tags
  };

  // 生成完整文档
  const docContent = matter.stringify(templateContent, frontmatter);

  // 确定保存位置
  const targetDir = path.join(process.cwd(), '..', '..', 'docs', 'guides', project);
  await fs.ensureDir(targetDir);

  const targetPath = path.join(targetDir, fileName);

  // 检查文件是否已存在
  if (await fs.pathExists(targetPath)) {
    console.info(`\n❌ 文件已存在: ${targetPath}`);
    process.exit(1);
  }

  // 写入文件
  await fs.writeFile(targetPath, docContent);

  console.info('\n✅ 文档创建成功!');
  console.info(`   位置: ${path.relative(process.cwd(), targetPath)}`);
  console.info(`   类型: ${type}`);
  console.info(`   项目: ${project}`);
  console.info(`   发布: ${publish ? '是' : '否'}`);
  console.info('\n💡 提示: 编辑完成后运行 `pnpm --filter docs-site-app ingest` 来收录文档');
}

main().catch(error => {
  console.error('创建失败:', error);
  rl.close();
  process.exit(1);
});


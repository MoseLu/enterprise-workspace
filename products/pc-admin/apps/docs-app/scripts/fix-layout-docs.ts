/**
 * 批量修复 Layout 组件文档的标准模板部分
 */
;

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, '../');

const files = [
  'guides/layout/topbar.md',
  'guides/layout/sidebar.md',
  'guides/layout/theme-switcher.md',
  'guides/layout/menu-drawer.md',
  'guides/layout/locale-switcher.md',
  'guides/layout/dynamic-menu.md',
];

const standardTemplate = `
## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| - | - | - | - |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| - | - | - |

## 使用示例

\`\`\`vue
<template>
  <ComponentName />
</template>

<script setup lang="ts">
import ComponentName from '@/layout/component-name'
</script>
\`\`\`

## 注意事项

待补充
`;

files.forEach(file => {
  const filePath = path.join(docsRoot, file);
  console.info(`\n修复: ${file}`);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // 分离 frontmatter 和内容
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (!frontmatterMatch) {
      console.info('  ⚠️  未找到 frontmatter');
      return;
    }

    const frontmatter = frontmatterMatch[0];
    const restContent = content.substring(frontmatter.length);

    // 提取标题
    const titleMatch = restContent.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1] : '';

    // 提取功能描述（在第一个 ## 之前的内容）
    const descMatch = restContent.match(/^#\s+.+?\n\n## 功能描述\n\n(.+?)\n\n##/s);
    const description = descMatch ? descMatch[1] : '';

    // 重建文档
    const newContent = `${frontmatter}# ${title}

## 功能描述

${description}
${standardTemplate}`;

    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.info('  ✅ 修复完成');

  } catch (error) {
    console.error(`  ❌ 修复失败:`, error);
  }
});

console.info('\n\n🎉 Layout 组件文档修复完成！');


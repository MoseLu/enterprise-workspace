/**
 * 重命名文件 - 修复多余的短横线
 */
;

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, '../');

// 文件重命名映射
const renameMap: Record<string, string> = {
  'guides/integration/d-o-c-s--c-a-c-h-e--d-e-b-u-g.md': 'guides/integration/docs-cache-debug.md',
  'guides/integration/d-o-c-s--i-f-r-a-m-e--c-a-c-h-e--o-p-t-i-m-i-z-a-t-i-o-n.md': 'guides/integration/docs-iframe-cache-optimization.md',
  'guides/integration/d-o-c-s--i-n-s-t-a-n-t--s-w-i-t-c-h.md': 'guides/integration/docs-instant-switch.md',
  'guides/integration/d-o-c-s--i-n-t-e-g-r-a-t-i-o-n--s-u-m-m-a-r-y.md': 'guides/integration/docs-integration-summary.md',
  'guides/integration/d-o-c-s--l-a-y-o-u-t--h-i-d-e--s-t-r-a-t-e-g-y.md': 'guides/integration/docs-layout-hide-strategy.md',
  'guides/integration/l-a-y-o-u-t--r-e-f-a-c-t-o-r--c-o-m-p-l-e-t-e.md': 'guides/integration/layout-refactor-complete.md',
  'guides/integration/v-i-t-e-p-r-e-s-s--i-n-t-e-g-r-a-t-i-o-n--c-o-m-p-l-e-t-e.md': 'guides/integration/vitepress-integration-complete.md',
  'guides/integration/v-i-t-e-p-r-e-s-s--s-e-a-r-c-h--i-n-t-e-g-r-a-t-i-o-n.md': 'guides/integration/vitepress-search-integration.md',
};

async function main() {
  console.info('开始重命名文件...\n');

  let renamed = 0;
  let failed = 0;

  for (const [oldPath, newPath] of Object.entries(renameMap)) {
    const oldFullPath = path.join(docsRoot, oldPath);
    const newFullPath = path.join(docsRoot, newPath);

    try {
      if (!fs.existsSync(oldFullPath)) {
        console.info(`⏭️  跳过 ${oldPath} - 文件不存在`);
        continue;
      }

      if (fs.existsSync(newFullPath)) {
        console.info(`⚠️  跳过 ${oldPath} - 目标文件已存在`);
        continue;
      }

      fs.renameSync(oldFullPath, newFullPath);
      console.info(`✅ ${oldPath}\n   -> ${newPath}`);
      renamed++;
    } catch (error) {
      console.error(`❌ 重命名失败 ${oldPath}:`, error);
      failed++;
    }
  }

  console.info(`\n完成！`);
  console.info(`- 成功重命名：${renamed} 个文件`);
  console.info(`- 失败：${failed} 个文件`);

  if (renamed > 0) {
    console.info(`\n💡 建议：重启 VitePress 服务器以更新文件索引`);
  }
}

main().catch(console.error);


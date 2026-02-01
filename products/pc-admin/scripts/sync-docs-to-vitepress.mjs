/**
 * 文档同步脚本
 * 将各模块的源文档同步到 VitePress docs-app 的工作目录
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { execSync } from 'child_process';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);
const access = promisify(fs.access);

// 简单的目录操作函数
async function ensureDir(dirPath) {
  try {
    await access(dirPath);
  } catch {
    await mkdir(dirPath, { recursive: true });
  }
}

async function emptyDir(dirPath) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        await emptyDir(fullPath);
        await fs.promises.rmdir(fullPath);
      } else {
        await fs.promises.unlink(fullPath);
      }
    }
  } catch (error) {
    // 目录不存在，忽略
  }
}

async function copyRecursive(src, dest, filter) {
  const stat = await fs.promises.stat(src);
  
  if (stat.isDirectory()) {
    await ensureDir(dest);
    const entries = await readdir(src);
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      if (filter(srcPath)) {
        await copyRecursive(srcPath, destPath, filter);
      }
    }
  } else if (stat.isFile() && filter(src)) {
    await ensureDir(path.dirname(dest));
    await copyFile(src, dest);
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 定义源文档到 docs-app 的映射
const docMappings = [
  {
    name: '全局文档',
    source: path.resolve(rootDir, 'docs'),
    target: path.resolve(rootDir, 'apps/docs-app/docs-sources/global'),
    optional: false
  },
  {
    name: 'Main App',
    source: path.resolve(rootDir, 'apps/main-app/docs'),
    target: path.resolve(rootDir, 'apps/docs-app/docs-sources/apps/main-app'),
    optional: true
  },
  {
    name: 'Admin App',
    source: path.resolve(rootDir, 'apps/admin-app/docs'),
    target: path.resolve(rootDir, 'apps/docs-app/docs-sources/apps/admin-app'),
    optional: true
  },
  {
    name: 'System App',
    source: path.resolve(rootDir, 'apps/system-app/docs'),
    target: path.resolve(rootDir, 'apps/docs-app/docs-sources/apps/system-app'),
    optional: true
  },
  {
    name: 'Logistics App',
    source: path.resolve(rootDir, 'apps/logistics-app/docs'),
    target: path.resolve(rootDir, 'apps/docs-app/docs-sources/apps/logistics-app'),
    optional: true
  },
  {
    name: 'Finance App',
    source: path.resolve(rootDir, 'apps/finance-app/docs'),
    target: path.resolve(rootDir, 'apps/docs-app/docs-sources/apps/finance-app'),
    optional: true
  },
  {
    name: 'Shared Components',
    source: path.resolve(rootDir, 'packages/shared-components/docs'),
    target: path.resolve(rootDir, 'apps/docs-app/docs-sources/packages/shared-components'),
    optional: true
  },
  {
    name: 'Shared Core',
    source: path.resolve(rootDir, 'packages/shared-core/docs'),
    target: path.resolve(rootDir, 'apps/docs-app/docs-sources/packages/shared-core'),
    optional: true
  },
  {
    name: 'Design Tokens',
    source: path.resolve(rootDir, 'packages/design-tokens/docs'),
    target: path.resolve(rootDir, 'apps/docs-app/docs-sources/packages/design-tokens'),
    optional: true
  }
];

/**
 * 同步 CHANGELOG.md
 */
async function syncChangelog() {
  const changelogSourcePath = path.resolve(rootDir, 'CHANGELOG.md');
  const changelogTargetPath = path.resolve(rootDir, 'apps/docs-app/zh/changelog/content.md');
  const mergeScriptPath = path.resolve(rootDir, 'apps/docs-app/scripts/merge-changelog.mjs');
  
  try {
    // 检查源文件是否存在
    await access(changelogSourcePath);
    
    // 确保目标目录存在
    await ensureDir(path.dirname(changelogTargetPath));
    
    // 复制 CHANGELOG.md
    await copyFile(changelogSourcePath, changelogTargetPath);
    
    // 合并到 index.md
    execSync(`node "${mergeScriptPath}"`, { cwd: rootDir, stdio: 'pipe' });
  } catch (error) {
    // CHANGELOG 是可选的，如果不存在或复制失败，只记录警告
    if (error.code !== 'ENOENT') {
      console.warn(`⚠️  同步 CHANGELOG.md 失败: ${error.message}`);
    }
  }
}

/**
 * 同步文档
 */
async function syncDocs() {
  // 静默模式：只在有错误或通过环境变量启用详细输出时显示信息
  const verbose = process.env.DOCS_SYNC_VERBOSE === 'true';
  
  if (verbose) {
    console.log('开始同步文档到 VitePress...\n');
  }
  
  // 首先同步 CHANGELOG
  await syncChangelog();
  
  // 生成文档索引
  try {
    const generateDocsIndexPath = path.resolve(rootDir, 'scripts/commands/tools/generate-docs-index.mjs');
    const { execSync } = await import('child_process');
    execSync(`node "${generateDocsIndexPath}"`, { cwd: rootDir, stdio: 'pipe' });
  } catch (error) {
    // 文档索引生成是可选的，失败不影响主流程
    if (verbose) {
      console.warn(`⚠️  生成文档索引失败: ${error.message}`);
    }
  }
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (const mapping of docMappings) {
    // 检查源目录是否存在
    try {
      await access(mapping.source);
    } catch {
      if (mapping.optional) {
        if (verbose) {
          console.log(`⏭️  ${mapping.name}: 源目录不存在，跳过`);
        }
        skipCount++;
        continue;
      } else {
        const errorMsg = `${mapping.name}: 必需的源目录不存在 - ${mapping.source}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
        errorCount++;
        continue;
      }
    }
    
    try {
      // 确保目标目录存在
      await ensureDir(mapping.target);
      
      // 清空目标目录（避免残留旧文档）
      await emptyDir(mapping.target);
      
      // 复制源目录下的所有 Markdown 文件
      await copyRecursive(mapping.source, mapping.target, (src) => {
        try {
          const stat = fs.statSync(src);
          // 保留目录和 .md 文件
          if (stat.isDirectory()) {
            return true;
          }
          // 只复制 .md 文件
          if (stat.isFile() && path.extname(src) === '.md') {
            return true;
          }
          return false;
        } catch {
          return false;
        }
      });
      
      if (verbose) {
        console.log(`✅ ${mapping.name}: 同步完成`);
      }
      successCount++;
    } catch (error) {
      const errorMsg = `${mapping.name}: 同步失败 - ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      errors.push(errorMsg);
      errorCount++;
    }
  }
  
  // 只在有错误或启用详细输出时显示统计信息
  if (errorCount > 0 || verbose) {
    if (verbose) {
      console.log('\n📊 同步统计:');
      console.log(`  ✅ 成功: ${successCount}`);
      console.log(`  ⏭️  跳过: ${skipCount}`);
      console.log(`  ❌ 失败: ${errorCount}`);
    }
    
    if (errorCount > 0) {
      console.log('\n⚠️  部分文档同步失败，请检查错误信息');
      if (errors.length > 0) {
        errors.forEach(err => console.error(`  - ${err}`));
      }
      process.exit(1);
    } else if (verbose) {
      console.log('\n🎉 所有文档同步完成！');
    }
  }
}

// 执行同步
syncDocs().catch((error) => {
  console.error('同步过程出错:', error);
  process.exit(1);
});

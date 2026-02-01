/**
 * 扫描现有页面实现
 * 将项目中的页面添加到页面数据库作为参考
 */

import { addPageImplementation } from './page-database.mjs';
import { glob } from 'glob';
import { readFileSync, existsSync } from 'fs';
import { relative, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取项目根目录
 */
function getProjectRoot() {
  return join(__dirname, '../../../../');
}

/**
 * 检测页面类型
 */
function detectPageType(filePath, content) {
  const pathLower = filePath.toLowerCase();
  const contentLower = content.toLowerCase();

  // CRUD 页面
  if (pathLower.includes('crud') || 
      pathLower.includes('list') ||
      contentLower.includes('master-table') ||
      contentLower.includes('btc-master-table-group')) {
    return 'crud';
  }

  // 表单页面
  if (pathLower.includes('form') ||
      contentLower.includes('btc-form') ||
      contentLower.includes('defineForm')) {
    return 'form';
  }

  // 详情页面
  if (pathLower.includes('detail') ||
      pathLower.includes('view') ||
      contentLower.includes('详情')) {
    return 'detail';
  }

  // 仪表盘
  if (pathLower.includes('dashboard') ||
      pathLower.includes('statistics') ||
      contentLower.includes('chart')) {
    return 'dashboard';
  }

  return 'other';
}

/**
 * 检测布局类型
 */
function detectLayoutType(content) {
  const contentLower = content.toLowerCase();

  if (contentLower.includes('btc-splitter') ||
      contentLower.includes('splitter')) {
    return 'splitter';
  }

  if (contentLower.includes('dual-menu')) {
    return 'dual-menu';
  }

  if (contentLower.includes('top-left-sidebar')) {
    return 'top-left-sidebar';
  }

  if (contentLower.includes('top-menu')) {
    return 'top-menu';
  }

  return 'single';
}

/**
 * 提取页面使用的资源
 */
function extractPageResources(filePath, content) {
  const resources = {
    components: [],
    composables: [],
    icons: [],
    locales: [],
    services: [],
    configs: [],
  };

  // 提取组件
  const componentMatches = content.matchAll(/import\s+(\w+)\s+from\s+['"]@btc\/shared-components['"]/g);
  for (const match of componentMatches) {
    resources.components.push({
      name: match[1],
      path: `@btc/shared-components/${match[1]}`,
    });
  }

  // 提取 Composables
  const composableMatches = content.matchAll(/import\s+(\w+)\s+from\s+['"]@btc\/shared-core['"]/g);
  for (const match of composableMatches) {
    resources.composables.push({
      name: match[1],
      path: `@btc/shared-core/${match[1]}`,
    });
  }

  // 提取图标（从路径推断）
  const iconMatches = content.matchAll(/['"]([^'"]*\/icons\/[^'"]+)['"]/g);
  for (const match of iconMatches) {
    if (match[1].includes('icons')) {
      resources.icons.push({ path: match[1] });
    }
  }

  // 提取国际化配置
  if (content.includes('config.ts') || content.includes('locales')) {
    const configPath = filePath.replace(/\.vue$/, '/config.ts');
    if (existsSync(configPath)) {
      resources.configs.push({ path: configPath });
    }
  }

  // 提取服务（从 import 推断）
  const serviceMatches = content.matchAll(/import\s+.*\s+from\s+['"]([^'"]*\/service[^'"]*)['"]/g);
  for (const match of serviceMatches) {
    resources.services.push({ path: match[1] });
  }

  return resources;
}

/**
 * 扫描页面文件
 */
async function scanPages() {
  const projectRoot = getProjectRoot();
  
  // 扫描应用中的页面文件
  const pagePatterns = [
    'apps/*/src/views/**/*.vue',
    'apps/*/src/pages/**/*.vue',
  ];

  const pages = [];
  for (const pattern of pagePatterns) {
    const files = await glob(pattern, {
      cwd: projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**'],
      absolute: true,
    });

    for (const filePath of files) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const relativePath = relative(projectRoot, filePath);
        
        // 提取应用名和模块名
        const pathParts = relativePath.split(/[/\\]/);
        const appIndex = pathParts.findIndex(p => p === 'apps');
        const appName = appIndex >= 0 && appIndex < pathParts.length - 1 
          ? pathParts[appIndex + 1] 
          : 'unknown';
        
        const pageName = pathParts[pathParts.length - 1].replace('.vue', '');
        const moduleName = pathParts.length > 3 ? pathParts[pathParts.length - 2] : null;

        // 检测页面类型和布局
        const pageType = detectPageType(relativePath, content);
        const layoutType = detectLayoutType(content);

        // 提取资源
        const resources = extractPageResources(filePath, content);

        pages.push({
          id: randomUUID(),
          appName,
          moduleName,
          pageName,
          pageType,
          layoutType,
          description: `页面: ${pageName}`,
          resources,
          filePath: relativePath,
        });
      } catch (error) {
        console.warn(`⚠️  跳过文件 ${filePath}:`, error.message);
      }
    }
  }

  return pages;
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始扫描现有页面实现...\n');

  try {
    const pages = await scanPages();
    console.log(`找到 ${pages.length} 个页面文件\n`);

    if (pages.length === 0) {
      console.log('⚠️  未找到页面文件\n');
      return;
    }

    // 添加到数据库
    let added = 0;
    for (const page of pages) {
      try {
        addPageImplementation(page);
        added++;
        if (added % 10 === 0) {
          console.log(`已添加 ${added}/${pages.length} 个页面...`);
        }
      } catch (error) {
        console.warn(`❌ 添加失败 ${page.filePath}:`, error.message);
      }
    }

    console.log(`\n✅ 页面扫描完成！共添加 ${added} 个页面到数据库\n`);

    // 显示统计
    const byType = {};
    pages.forEach(p => {
      byType[p.pageType] = (byType[p.pageType] || 0) + 1;
    });

    console.log('📊 页面类型统计:');
    for (const [type, count] of Object.entries(byType)) {
      console.log(`  - ${type}: ${count} 个`);
    }
    console.log('');

  } catch (error) {
    console.error('❌ 扫描失败:', error);
    process.exit(1);
  }
}

main().catch(console.error);

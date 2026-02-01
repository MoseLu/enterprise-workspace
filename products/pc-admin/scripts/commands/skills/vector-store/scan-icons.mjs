/**
 * 扫描并分析项目中的 SVG 图标
 * 不使用向量数据库，直接分析图标文件
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取项目根目录
 */
function getProjectRoot() {
  return join(__dirname, '../../../../');
}

/**
 * 扫描图标文件
 */
function scanIcons() {
  const projectRoot = getProjectRoot();
  const iconsDir = join(projectRoot, 'packages/shared-components/src/assets/icons');
  const systemIconsDir = join(projectRoot, 'apps/system-app/src/assets/icons');
  
  const icons = [];

  // 扫描共享组件图标
  try {
    if (readdirSync(iconsDir, { withFileTypes: true })) {
      scanIconsInDir(iconsDir, icons, 'shared-components');
    }
  } catch (e) {
    console.warn('Failed to scan shared-components icons:', e.message);
  }

  // 扫描系统应用图标
  try {
    if (readdirSync(systemIconsDir, { withFileTypes: true })) {
      scanIconsInDir(systemIconsDir, icons, 'system-app');
    }
  } catch (e) {
    // 忽略错误
  }

  return icons;
}

/**
 * 递归扫描目录中的图标
 */
function scanIconsInDir(dir, icons, source) {
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      scanIconsInDir(fullPath, icons, source);
    } else if (entry.isFile() && entry.name.endsWith('.svg')) {
      const relativePath = relative(getProjectRoot(), fullPath);
      // 从路径中提取分类：packages/shared-components/src/assets/icons/actions/export.svg
      const pathParts = relativePath.split(/[/\\]/);
      const iconsIndex = pathParts.findIndex(part => part === 'icons');
      let category = 'root';
      if (iconsIndex >= 0 && iconsIndex < pathParts.length - 1) {
        category = pathParts[iconsIndex + 1];
        // 如果分类是文件名（如 star.svg），说明在 icons 根目录，归类为 misc
        if (category.endsWith('.svg') || category === 'icons') {
          category = 'misc';
        }
      }
      const name = entry.name.replace('.svg', '');
      
      try {
        const content = readFileSync(fullPath, 'utf-8');
        const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
        const hasPaths = /<path[^>]+>/i.test(content);
        const hasCircles = /<circle[^>]+>/i.test(content);
        const hasRects = /<rect[^>]+>/i.test(content);
        
        icons.push({
          name,
          category,
          source,
          path: relativePath,
          viewBox: viewBoxMatch ? viewBoxMatch[1] : '',
          elements: {
            paths: hasPaths,
            circles: hasCircles,
            rects: hasRects,
          },
        });
      } catch (error) {
        // 忽略读取错误
      }
    }
  }
}

/**
 * 按分类组织图标
 */
function organizeByCategory(icons) {
  const organized = {};
  
  for (const icon of icons) {
    if (!organized[icon.category]) {
      organized[icon.category] = [];
    }
    organized[icon.category].push(icon);
  }
  
  // 排序
  for (const category in organized) {
    organized[category].sort((a, b) => a.name.localeCompare(b.name));
  }
  
  return organized;
}

/**
 * 获取分类用途说明
 */
function getCategoryDescription(category) {
  const descriptions = {
    'actions': '操作类图标 - 用于按钮、工具栏等操作场景',
    'analytics': '数据分析类图标 - 用于统计、报表、监控等场景',
    'commerce': '商业类图标 - 用于订单、商品、购物等场景',
    'communication': '通信类图标 - 用于消息、通知、社交等场景',
    'iot': '物联网类图标 - 用于设备、IoT相关场景',
    'location': '位置类图标 - 用于地图、定位等场景',
    'media': '媒体类图标 - 用于文件、图片、视频等场景',
    'micro': '微应用类图标 - 用于各个子应用的标识',
    'misc': '杂项图标 - 通用、设计、组件等',
    'navigation': '导航类图标 - 用于菜单、导航、方向指示',
    'people': '人员类图标 - 用于用户、团队、部门等场景',
    'status': '状态类图标 - 用于成功、失败、警告等状态提示',
    'system': '系统类图标 - 用于系统设置、主题、语言等',
  };
  
  return descriptions[category] || '其他图标';
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 扫描项目中的 SVG 图标...\n');
  
  const icons = scanIcons();
  const organized = organizeByCategory(icons);
  
  console.log(`📊 共找到 ${icons.length} 个 SVG 图标\n`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  
  // 按分类展示
  const categories = Object.keys(organized).sort();
  
  for (const category of categories) {
    const categoryIcons = organized[category];
    const description = getCategoryDescription(category);
    
    console.log(`📁 ${category.toUpperCase()} (${categoryIcons.length} 个)`);
    console.log(`   用途: ${description}\n`);
    
    // 每行显示3个图标
    for (let i = 0; i < categoryIcons.length; i += 3) {
      const row = categoryIcons.slice(i, i + 3);
      const names = row.map(icon => {
        const source = icon.source === 'system-app' ? '[系统]' : '';
        return `  • ${icon.name}${source}`;
      });
      console.log(names.join('  '));
    }
    
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  console.log('💡 提示：');
  console.log('   - 使用向量数据库可以基于语义搜索图标，例如："导出相关的图标"');
  console.log('   - 运行索引命令：node scripts/commands/skills/vector-store/index-resources.mjs --type=icon');
  console.log('   - 然后可以使用语义搜索：searchResources("导出图标", { resourceTypes: ["icon"] })');
}

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('scan-icons.mjs')) {
  main();
}

export { scanIcons, organizeByCategory, getCategoryDescription };

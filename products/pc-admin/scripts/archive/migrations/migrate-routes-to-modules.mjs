/**
 * 批量迁移路由到模块配置
 * 从路由文件中提取路由配置，添加到对应模块的 config.ts 中
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * 解析路由文件，提取路由配置
 */
function parseRoutesFromFile(filePath, appName) {
  const content = readFileSync(filePath, 'utf-8');
  const routes = [];
  
  // 匹配路由对象
  const routeRegex = /\{\s*path:\s*['"`]([^'"`]+)['"`],\s*name:\s*['"`]([^'"`]+)['"`],\s*component:\s*\(\)\s*=>\s*import\(['"`]([^'"`]+)['"`]\),\s*meta:\s*\{([^}]+)\}\s*\}/gs;
  
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    const [, path, name, componentPath, metaStr] = match;
    
    // 解析 meta
    const meta = {};
    const metaMatches = metaStr.matchAll(/(\w+):\s*([^,}]+)/g);
    for (const metaMatch of metaMatches) {
      const [, key, value] = metaMatch;
      meta[key.trim()] = value.trim().replace(/['"`]/g, '');
    }
    
    // 确定模块名（从 component 路径提取）
    const moduleMatch = componentPath.match(/modules\/([^/]+)\//);
    if (moduleMatch) {
      const moduleName = moduleMatch[1];
      routes.push({
        moduleName,
        path,
        name,
        component: componentPath,
        meta,
      });
    }
  }
  
  return routes;
}

/**
 * 为模块添加 views 配置
 */
function addViewsToModuleConfig(modulePath, routes) {
  const configPath = join(modulePath, 'config.ts');
  
  if (!existsSync(configPath)) {
    console.log(`⚠️  模块 ${modulePath} 没有 config.ts，跳过`);
    return;
  }
  
  let content = readFileSync(configPath, 'utf-8');
  
  // 检查是否已有 views 配置
  if (content.includes('views:') && content.includes('[')) {
    console.log(`⚠️  模块 ${modulePath} 已有 views 配置，跳过`);
    return;
  }
  
  // 找到 export default 的位置
  const exportMatch = content.match(/export\s+default\s+\{/);
  if (!exportMatch) {
    console.log(`⚠️  模块 ${modulePath} config.ts 格式不符合预期，跳过`);
    return;
  }
  
  // 构建 views 配置
  const viewsConfig = routes
    .map(route => {
      const metaStr = Object.entries(route.meta)
        .map(([k, v]) => {
          // 处理布尔值和字符串
          if (v === 'true' || v === 'false') {
            return `        ${k}: ${v}`;
          }
          if (v.match(/^['"`].*['"`]$/)) {
            return `        ${k}: ${v}`;
          }
          return `        ${k}: '${v}'`;
        })
        .join(',\n');
      
      return `    {
      path: '${route.path}',
      name: '${route.name}',
      component: () => import('${route.component}'),
      meta: {
${metaStr}
      },
    }`;
    })
    .join(',\n');
  
  // 插入 views 配置（在 order 字段之后）
  const orderMatch = content.match(/(\s+order:\s*\d+,)/);
  if (orderMatch) {
    const insertPos = orderMatch.index + orderMatch[0].length;
    const before = content.substring(0, insertPos);
    const after = content.substring(insertPos);
    
    // 检查是否已有 views 字段
    if (!content.includes('views:')) {
      content = before + `\n\n  // 路由配置\n  views: [\n${viewsConfig}\n  ],` + after;
      writeFileSync(configPath, content, 'utf-8');
      console.log(`✅ 已为模块 ${modulePath} 添加 ${routes.length} 个路由`);
    }
  } else {
    console.log(`⚠️  模块 ${modulePath} config.ts 没有找到 order 字段，跳过`);
  }
}

/**
 * 更新路由文件，使用自动扫描
 */
function updateRouterFile(routerFilePath, appName) {
  let content = readFileSync(routerFilePath, 'utf-8');
  
  // 检查是否已经使用自动扫描
  if (content.includes('scanRoutesFromConfigFiles')) {
    console.log(`⚠️  路由文件 ${routerFilePath} 已使用自动扫描，跳过`);
    return;
  }
  
  // 替换路由获取逻辑
  const newContent = `import type { RouteRecordRaw } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { BtcAppLayout } from '@btc/shared-components';
import { scanRoutesFromConfigFiles } from '@btc/shared-core/utils/route-scanner';
// logger removed, use console instead

/**
 * 获取路由配置
 * - qiankun 模式：返回页面路由（登录页等由主应用提供）
 * - layout-app 模式：返回页面路由（由 layout-app 提供 Layout）
 * - 独立运行时：使用 BtcAppLayout 包裹所有路由
 * 
 * 自动路由发现：
 * - 从所有模块的 config.ts 中自动提取 views 和 pages 路由
 * - 完全按照 cool-admin 的方案，所有路由都从模块配置中自动发现
 */
export const get${appName.charAt(0).toUpperCase() + appName.slice(1)}Routes = (): RouteRecordRaw[] => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 自动扫描模块配置中的路由
  let pageRoutes: RouteRecordRaw[] = [];
  
  try {
    // 扫描所有模块的 config.ts，提取路由
    const autoRoutes = scanRoutesFromConfigFiles('/src/modules/*/config.ts', {
      enableAutoDiscovery: true,
      preferManualRoutes: false,
      mergeViewsToChildren: false,
    });

    // 合并 views 和 pages 路由
    pageRoutes = [...autoRoutes.views, ...autoRoutes.pages];

    // 输出扫描结果（开发环境）
    if (import.meta.env.DEV) {
      console.info(
        \`[${appName}Router] Route discovery: \${autoRoutes.views.length} views, \${autoRoutes.pages.length} pages, \${autoRoutes.conflicts.length} conflicts\`
      );
      if (autoRoutes.conflicts.length > 0) {
        console.warn(\`[${appName}Router] Route conflicts:\`, autoRoutes.conflicts);
      }
    }
  } catch (error) {
    console.error(\`[${appName}Router] Failed to scan routes from modules:\`, error);
    pageRoutes = [];
  }

  // 如果使用 layout-app，直接返回页面路由（layout-app 会提供布局）
  if (isUsingLayoutApp) {
    return pageRoutes;
  }

  // 独立运行且不使用 layout-app：使用 BtcAppLayout 包裹所有路由
  const routes = isStandalone
    ? [
        {
          path: '/',
          component: BtcAppLayout,
          children: pageRoutes,
        },
      ]
    : [
        ...pageRoutes, // 业务路由（qiankun 模式，由主应用提供 Layout）
      ];
  return routes;
};

// 为了向后兼容，保留导出（使用函数动态获取）
export const ${appName}Routes = get${appName.charAt(0).toUpperCase() + appName.slice(1)}Routes();
`;
  
  writeFileSync(routerFilePath, newContent, 'utf-8');
  console.log(`✅ 已更新路由文件 ${routerFilePath}`);
}

// 主函数
function main() {
  const apps = [
    { name: 'system', routeFile: 'apps/system-app/src/router/routes/system-routes.ts' },
    { name: 'logistics', routeFile: 'apps/logistics-app/src/router/routes/logistics.ts' },
    { name: 'finance', routeFile: 'apps/finance-app/src/router/routes/finance.ts' },
  ];
  
  for (const app of apps) {
    const routeFilePath = join(rootDir, app.routeFile);
    if (existsSync(routeFilePath)) {
      console.log(`\n处理应用: ${app.name}`);
      updateRouterFile(routeFilePath, app.name);
    }
  }
  
  console.log('\n✅ 路由迁移完成！');
  console.log('⚠️  注意：请手动检查并添加模块的 views 配置到 config.ts 中');
}

main();

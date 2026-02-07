/**
 * VitePress 插件：导出搜索索引给主应用使用
 *
 * 该插件会在构建时将 VitePress 的搜索索引导出为独立的 JSON 文件，
 * 供主应用的全局搜索功能使用。
 */
// 注意：在 VitePress 配置加载时，不能直接导入 @btc/shared-core
// 因为 esbuild 无法正确解析 workspace 包
// 使用 console 替代 logger，避免配置加载时的解析问题
const logger = {
  warn: (...args: any[]) => console.warn('[exportSearchIndex]', ...args),
  error: (...args: any[]) => console.error('[exportSearchIndex]', ...args),
  info: (...args: any[]) => console.info('[exportSearchIndex]', ...args),
  debug: (...args: any[]) => console.debug('[exportSearchIndex]', ...args),
};

import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

interface SearchIndexItem {
  id: string;
  title: string;
  url: string;
  breadcrumb?: string;
  excerpt?: string;
  content?: string;
}

export function exportSearchIndexPlugin(): Plugin {
  return {
    name: 'vitepress-export-search-index',
    enforce: 'post',

    // 在开发服务器配置时添加端点
    configureServer(server) {
      server.middlewares.use('/api/search-index.json', (_req, res) => {
        // 开发环境：返回简化的搜索索引
        const devIndex = generateDevSearchIndex();
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify(devIndex));
      });
    },

    // 在构建完成后生成搜索索引文件
    closeBundle() {
      // 生产环境：从构建产物中提取搜索索引
      try {
        const outDir = path.resolve(__dirname, '../../dist');
        if (fs.existsSync(outDir)) {
          const searchIndex = extractSearchIndexFromBuild(outDir);
          const indexPath = path.join(outDir, 'search-index.json');
          fs.writeFileSync(indexPath, JSON.stringify(searchIndex, null, 2));
          logger.info('[exportSearchIndex] Search index exported to:', indexPath);
        }
      } catch (error) {
        logger.warn('[exportSearchIndex] Failed to export search index:', error);
      }
    }
  };
}

/**
 * 生成开发环境的搜索索引（简化版）
 */
function generateDevSearchIndex(): SearchIndexItem[] {
  return [
    {
      id: 'timeline',
      title: '项目时间线',
      url: '/timeline/',
      breadcrumb: '文档中心',
      excerpt: '按时间顺序查看项目的主要里程碑和变更历史'
    },
    {
      id: 'projects',
      title: '项目索引',
      url: '/projects/',
      breadcrumb: '文档中心',
      excerpt: '按项目分类浏览技术文档'
    },
    {
      id: 'types',
      title: '文档类型分类',
      url: '/types/',
      breadcrumb: '文档中心',
      excerpt: '按文档类型（ADR, RFC, SOP 等）浏览'
    },
    {
      id: 'tags',
      title: '标签索引',
      url: '/tags/',
      breadcrumb: '文档中心',
      excerpt: '按标签浏览相关文档'
    },
    {
      id: 'components',
      title: '组件文档',
      url: '/components/',
      breadcrumb: '文档中心',
      excerpt: 'BTC 业务组件使用文档和最佳实践'
    },
    {
      id: 'components-crud',
      title: 'BtcCrud 组件',
      url: '/components/crud',
      breadcrumb: '文档中心 > 组件',
      excerpt: 'CRUD 操作的核心组件，提供增删改查、分页、搜索等功能'
    },
    {
      id: 'components-form',
      title: 'BtcForm 组件',
      url: '/components/form',
      breadcrumb: '文档中心 > 组件',
      excerpt: '表单组件，支持动态表单、验证、tabs、插件等功能'
    },
    {
      id: 'components-upsert',
      title: 'BtcUpsert 组件',
      url: '/components/upsert',
      breadcrumb: '文档中心 > 组件',
      excerpt: '新增和编辑的弹窗组件，基于 BtcDialog 和 BtcForm'
    },
    {
      id: 'components-table',
      title: 'BtcTable 组件',
      url: '/components/table',
      breadcrumb: '文档中心 > 组件',
      excerpt: '表格组件，支持排序、固定列、自定义列、操作列等'
    },
    {
      id: 'components-dialog',
      title: 'BtcDialog 组件',
      url: '/components/dialog',
      breadcrumb: '文档中心 > 组件',
      excerpt: '弹窗组件，支持全屏、拖拽、自定义尺寸等功能'
    },
    {
      id: 'components-view-group',
      title: 'BtcViewGroup 组件',
      url: '/components/view-group',
      breadcrumb: '文档中心 > 组件',
      excerpt: '左树右表布局组件，支持树形菜单、列表切换、拖拽排序等'
    },
    {
      id: 'api',
      title: 'API 文档',
      url: '/api/',
      breadcrumb: '文档中心',
      excerpt: '系统 API 接口文档'
    },
  ];
}

/**
 * 从构建产物中提取搜索索引
 * 扫描 dist 目录下的 HTML 文件，解析页面内容生成搜索索引
 */
function extractSearchIndexFromBuild(outDir: string): SearchIndexItem[] {
  const searchIndex: SearchIndexItem[] = [];

  if (!fs.existsSync(outDir)) {
    logger.warn('[exportSearchIndex] Output directory does not exist:', outDir);
    return generateDevSearchIndex();
  }

  /**
   * 递归扫描目录中的所有 HTML 文件
   */
  function scanHtmlFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // 跳过隐藏目录和特定目录
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...scanHtmlFiles(fullPath));
        }
      } else if (entry.isFile() && (entry.name.endsWith('.html') || entry.name === 'index.html')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * 从 HTML 文件中提取搜索索引项
   */
  function parseHtmlFile(filePath: string): SearchIndexItem | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      // 提取标题
      const titleMatch = content.match(/<title[^>]*>([^<|]+)(?:\|[^<]*)?<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '未命名页面';

      // 提取 meta description
      const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
        content.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
      const excerpt = descMatch ? descMatch[1].trim() : '';

      // 提取页面路径（从文件路径推导 URL）
      const relativePath = path.relative(outDir, filePath);
      let url = '/' + relativePath
        .replace(/\\/g, '/')
        .replace(/\.html$/, '')
        .replace(/index$/, '');

      // 移除尾部的斜杠（除了根路径）
      if (url.endsWith('/') && url.length > 1) {
        url = url.slice(0, -1);
      }

      // 跳过非内容页面
      if (url.startsWith('/assets/') || url.startsWith('/.vitepress/')) {
        return null;
      }

      // 生成唯一 ID
      const id = path.basename(filePath, '.html').replace(/index$/, '') || 'root';

      // 提取面包屑（从主题配置或根据路径生成）
      const pathParts = url.split('/').filter(Boolean);
      const breadcrumb = pathParts.length > 0 ? '文档中心' : '';

      // 提取主要内容用于搜索（简化版：移除 HTML 标签）
      let mainContent = content
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // 限制内容长度
      mainContent = mainContent.slice(0, 500);

      return {
        id,
        title,
        url,
        breadcrumb,
        excerpt: excerpt || `查看 ${title} 的详细内容`,
        content: mainContent
      };
    } catch (error) {
      logger.warn('[exportSearchIndex] Failed to parse HTML file:', filePath, error);
      return null;
    }
  }

  // 扫描并解析所有 HTML 文件
  const htmlFiles = scanHtmlFiles(outDir);

  for (const filePath of htmlFiles) {
    const item = parseHtmlFile(filePath);
    if (item && item.url !== '/') {
      searchIndex.push(item);
    }
  }

  // 如果没有找到有效的索引，回退到开发索引
  if (searchIndex.length === 0) {
    logger.warn('[exportSearchIndex] No valid HTML files found, using dev index');
    return generateDevSearchIndex();
  }

  logger.info(`[exportSearchIndex] Extracted ${searchIndex.length} items from build output`);
  return searchIndex;
}


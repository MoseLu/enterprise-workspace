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
 * TODO: 实现从 VitePress 构建的 hashmap.json 或其他索引文件中提取
 */
function extractSearchIndexFromBuild(outDir: string): SearchIndexItem[] {
  // 目前返回开发索引，未来可以解析 VitePress 生成的实际索引文件
  return generateDevSearchIndex();
}


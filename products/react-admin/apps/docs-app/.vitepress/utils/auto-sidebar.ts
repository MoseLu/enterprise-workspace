/**
 * 自动生成侧边栏配置
 * 根据 frontmatter 的元数据生成 sidebar
 */
// 使用 console 而不是 logger，避免在 VitePress 配置加载时解析 @btc/shared-core

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, '../../');

interface SidebarItem {
  text: string;
  link?: string;
  order?: number;
  collapsed?: boolean;
  items?: SidebarItem[];
}

interface FrontmatterData {
  title?: string;
  order?: number;
  sidebar_label?: string;
  sidebar_order?: number;
  sidebar_group?: string;
  sidebar_collapsed?: boolean;
}

/**
 * 将英文组名转换为中文显示名
 */
function getGroupDisplayName(groupName: string): string {
  const groupNameMap: Record<string, string> = {
    'quick-start': '快速开始',
    'guides': '开发指南',
    'components': '组件开发',
    'forms': '表单处理',
    'system': '系统配置',
    'integration': '集成部署',
    'adr': '架构决策',
    'rfc': '技术提案',
    'sop': '标准操作',
    'packages': '共享包',
    'layout': '布局组件',
    'overview': '项目概览',
    'changelog': '开发日志',
    'guides-backend': '后端服务',
    // Packages 子分组
    'packages-components': '组件包',
    'packages-plugins': '插件包',
    'packages-utils': '工具包',
    // ADR 子分组
    'adr-system': '系统架构',
    'adr-technical': '技术实现',
    'adr-project': '项目管理',
    // SOP 子分组
    'sop-development': '开发环境',
    'sop-components': '组件开发',
    'sop-system': '系统配置',
    // Templates 子分组
    'templates': '文档模板',
  };

  return groupNameMap[groupName] || groupName;
}

/**
 * 扫描文件夹下的所有 .md 文件
 */
function scanMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('_')) {
        // 递归扫描子目录
        files.push(...scanMarkdownFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`[auto-sidebar] Failed to scan directory ${dir}:`, error);
  }

  return files;
}

/**
 * 从文件路径解析 frontmatter
 */
function parseFrontmatter(filePath: string, locale: string = 'zh'): { data: FrontmatterData; relativePath: string; fileName: string; displayPath: string } | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);

    // 计算相对于 docsRoot 的路径
    let relativePath = path.relative(docsRoot, filePath)
      .replace(/\\/g, '/')
      .replace(/\.md$/, '');

    // 移除语言前缀（zh/ 或 en/）
    relativePath = relativePath.replace(/^(zh|en)\//, '');

    const fileName = path.basename(filePath, '.md');

    // 生成显示路径：移除子目录前缀，保持简洁的 URL
    // 例如：integration/vitepress-search-integration -> vitepress-search-integration
    const displayPath = relativePath.replace(/^(integration|backend|development)\//, '');

    return {
      data: data as FrontmatterData,
      relativePath,
      fileName,
      displayPath
    };
  } catch (error) {
    console.warn(`[auto-sidebar] Failed to parse frontmatter for ${filePath}:`, error);
    return null;
  }
}

/**
 * 生成侧边栏配置（按文件夹）
 * @param locale 语言代码，如 'zh' 或 'en'，默认为 'zh'
 */
export function generateSidebar(locale: string = 'zh'): Record<string, SidebarItem[]> {
  const sidebar: Record<string, SidebarItem[]> = {};
  const localePrefix = locale === 'zh' ? '/zh' : locale === 'en' ? '/en' : '';

  // 主要文件夹列表（顺序即为侧边栏显示顺序）
  const mainFolders = [
    'quick-start',
    'guides',
    'adr',
    'rfc',
    'sop',
    'packages',
    'components',
    'changelog',
  ];

  for (const folder of mainFolders) {
    // 根据 locale 查找文件夹路径
    const folderPath = locale === 'zh'
      ? path.join(docsRoot, 'zh', folder)
      : locale === 'en'
      ? path.join(docsRoot, 'en', folder)
      : path.join(docsRoot, folder);

    if (!fs.existsSync(folderPath)) {
      continue;
    }

    // 扫描文件夹下的所有 .md 文件
    const markdownFiles = scanMarkdownFiles(folderPath);

    if (markdownFiles.length === 0) {
      continue;
    }

    // 解析所有文件的 frontmatter
    const fileData = markdownFiles
      .map(file => parseFrontmatter(file, locale))
      .filter((data): data is NonNullable<typeof data> => data !== null);

    // 按 sidebar_group 分组
    const groups: Record<string, SidebarItem[]> = {};
    const ungrouped: SidebarItem[] = [];

    for (const { data, relativePath, fileName, displayPath } of fileData) {
      // 跳过 index.md 文件，因为它们通常是概览页面，不需要在侧边栏显示
      if (fileName === 'index' && !data.sidebar_group) {
        continue;
      }

      // 生成带语言前缀的链接
      const linkPath = displayPath.startsWith(localePrefix)
        ? `/${displayPath}`
        : `${localePrefix}/${displayPath}`;

      const item: SidebarItem = {
        text: data.sidebar_label || data.title || fileName,
        link: linkPath, // 使用带语言前缀的路径
        order: data.sidebar_order || data.order || 999,
      };

      const group = data.sidebar_group;
      if (group) {
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(item);
      } else {
        ungrouped.push(item);
      }
    }

    // 构建侧边栏结构
    const sidebarItems: SidebarItem[] = [];

    // 先添加未分组的项（通常是概览类文档，order 最小）
    if (ungrouped.length > 0) {
      ungrouped.sort((a, b) => (a.order || 999) - (b.order || 999));
      sidebarItems.push(...ungrouped.map(({ order, ...rest }) => rest));
    }

    // 再添加分组
    for (const [groupName, items] of Object.entries(groups)) {
      // 按 order 排序
      items.sort((a, b) => (a.order || 999) - (b.order || 999));

      // 找到第一个文件的 sidebar_collapsed 配置（作为组的默认值）
      const firstFile = fileData.find(f => f.data.sidebar_group === groupName);
      const collapsed = firstFile?.data.sidebar_collapsed === true; // 默认展开，只有明确设置为true时才折叠

      // 将英文组名转换为中文
      const groupDisplayName = getGroupDisplayName(groupName);

      sidebarItems.push({
        text: groupDisplayName,
        collapsed,
        items: items.map(({ order, ...rest }) => rest), // 移除 order 字段
      });
    }

    sidebar[`${localePrefix}/${folder}/`] = sidebarItems;
  }

  return sidebar;
}


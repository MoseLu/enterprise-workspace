/**
 * 自动生成导航栏配置
 * 根据一级文件夹名称自动生成 nav
 */
// 使用 console 而不是 logger，避免在 VitePress 配置加载时解析 @btc/shared-core

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, '../../');

interface NavItem {
  text: string;
  link: string;
  activeMatch?: string;
}

// 文件夹到导航文本的映射
const folderToNav: Record<string, string> = {
  'quick-start': '快速开始',
  'guides': '指南',
  'adr': 'ADR',
  'sop': 'SOP',
  'packages': '包',
  'components': '组件',
  'changelog': '更新日志',
  'api': 'API',
  'timeline': '时间线',
  'projects': '项目',
  'types': '类型',
  'tags': '标签',
};

// 导航顺序（数组顺序即为显示顺序）
const navOrder = [
  'quick-start',
  'guides',
  'adr',
  'sop',
  'packages',
  'components',
  'changelog',
];

/**
 * 查找文件夹下的第一个 .md 文件（作为默认链接）
 * @param dir 目录路径
 * @param localePrefix 语言前缀，如 '/zh' 或 '/en'
 */
function findFirstMarkdown(dir: string, localePrefix: string = ''): string | null {
  try {
    // 先查找 index.md
    const indexPath = path.join(dir, 'index.md');
    if (fs.existsSync(indexPath)) {
      return `${localePrefix}/index`;
    }

    // 查找子目录
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDir = path.join(dir, entry.name);
        const indexPath = path.join(subDir, 'index.md');
        if (fs.existsSync(indexPath)) {
          return `${localePrefix}/${entry.name}/index`;
        }

        // 查找第一个 .md 文件
        const subEntries = fs.readdirSync(subDir);
        const firstMd = subEntries.find(f => f.endsWith('.md'));
        if (firstMd) {
          return `${localePrefix}/${entry.name}/${firstMd.replace('.md', '')}`;
        }
      } else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
        return `${localePrefix}/${entry.name.replace('.md', '')}`;
      }
    }
  } catch (error) {
    console.warn(`[auto-nav] Failed to find markdown in ${dir}:`, error);
  }

  return null;
}

/**
 * 生成导航配置
 * @param locale 语言代码，如 'zh' 或 'en'，默认为 'zh'
 */
export function generateNav(locale: string = 'zh'): NavItem[] {
  const localePrefix = locale === 'zh' ? '/zh' : locale === 'en' ? '/en' : '';
  const homeLink = localePrefix || '/';
  
  const nav: NavItem[] = [
    { text: '首页', link: homeLink, activeMatch: `^${homeLink}/?$` }
  ];

  for (const folder of navOrder) {
    // 根据 locale 查找文件夹路径
    const folderPath = locale === 'zh' 
      ? path.join(docsRoot, 'zh', folder)
      : locale === 'en'
      ? path.join(docsRoot, 'en', folder)
      : path.join(docsRoot, folder);

    // 检查文件夹是否存在
    if (!fs.existsSync(folderPath)) {
      continue;
    }

    // 查找第一个 markdown 文件
    const firstMd = findFirstMarkdown(folderPath, localePrefix);
    if (!firstMd) {
      continue;
    }

    const text = folderToNav[folder] || folder;
    const link = firstMd.startsWith(localePrefix) ? firstMd : `${localePrefix}${firstMd}`;

    // 添加 activeMatch 规则：只要路径以 /locale/folder/ 开头就激活
    nav.push({
      text,
      link,
      activeMatch: `^${localePrefix}/${folder}/`
    });
  }

  return nav;
}


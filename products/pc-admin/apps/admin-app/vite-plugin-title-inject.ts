/**
 * Vite 插件：服务端注入页面标题
 *
 * 目的：在 Vite dev server 返回 HTML 时，根据请求路径和语言替换 __PAGE_TITLE__ 占位符
 * 效果：刷新时浏览器标签从第一帧就显示正确标题，无闪烁
 */
;
import type { Plugin } from 'vite';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'path';

// 模块名称（硬编码，因为构建时无法访问运行时 i18n）
// 格式：管理模块（不使用页面标题）
const moduleName = '管理模块';

// 应用配置类型
interface AppConfig {
  id: string;
  name: string;
  displayName: string;
  category?: string;
  packageName?: string;
}

interface AppsConfig {
  apps: AppConfig[];
}

/**
 * 加载应用配置（从项目根目录的 apps.config.json）
 */
function loadAppsConfig(root: string): AppsConfig | null {
  try {
    // 从项目根目录读取 apps.config.json
    // root 通常是应用目录（如 apps/admin-app），需要向上两级到项目根目录
    const configPath = resolve(root, '../../apps.config.json');
    
    if (!existsSync(configPath)) {
      console.warn('[title-inject] apps.config.json 不存在:', configPath);
      return null;
    }

    const configContent = readFileSync(configPath, 'utf-8');
    return JSON.parse(configContent) as AppsConfig;
  } catch (error) {
    console.error('[title-inject] 加载 apps.config.json 失败:', error);
    return null;
  }
}

// 标题映射表（从 i18n 同步）
const titles: Record<string, Record<string, string>> = {
  'zh-CN': {
    '/': '首页',
    '/test/crud': 'CRUD测试',
    '/test/svg-plugin': 'SVG插件测试',
    '/test/i18n': '国际化测试',
    '/test/select-button': '状态切换按钮',
    '/platform/domains': '域列表',
    '/platform/modules': '模块列表',
    '/platform/plugins': '插件列表',
    '/org/tenants': '租户列表',
    '/org/departments': '部门列表',
    '/org/users': '用户列表',
    '/access/resources': '资源列表',
    '/access/actions': '行为列表',
    '/access/permissions': '权限列表',
    '/access/roles': '角色列表',
    '/access/policies': '策略列表',
    '/access/perm-compose': '权限组合',
    '/navigation/menus': '菜单列表',
    '/navigation/menus/preview': '菜单预览',
    '/ops/audit': '操作日志',
    '/ops/baseline': '权限基线',
    '/ops/simulator': '策略模拟器',
    '/test/inventory-ticket-print': '盘点票打印',
    '/admin/test/inventory-ticket-print': '盘点票打印',
  },
  'en-US': {
    '/': 'Home',
    '/test/crud': 'CRUD Test',
    '/test/svg-plugin': 'SVG Plugin Test',
    '/test/i18n': 'i18n Test',
    '/test/select-button': 'Select Button',
    '/platform/domains': 'Domain List',
    '/platform/modules': 'Module List',
    '/platform/plugins': 'Plugin List',
    '/org/tenants': 'Tenant List',
    '/org/departments': 'Department List',
    '/org/users': 'User List',
    '/access/resources': 'Resource List',
    '/access/actions': 'Action List',
    '/access/permissions': 'Permission List',
    '/access/roles': 'Role List',
    '/access/policies': 'Policy List',
    '/access/perm-compose': 'Permission Composition',
    '/navigation/menus': 'Menu List',
    '/navigation/menus/preview': 'Menu Preview',
    '/ops/audit': 'Audit Logs',
    '/ops/baseline': 'Permission Baseline',
    '/ops/simulator': 'Policy Simulator',
    '/test/inventory-ticket-print': 'Inventory Ticket Print',
    '/admin/test/inventory-ticket-print': 'Inventory Ticket Print',
  },
};

/**
 * 从 cookie 中提取语言
 */
function getLocaleFromCookie(cookieHeader?: string): string {
  if (!cookieHeader) return 'zh-CN';

  const match = cookieHeader.match(/(?:^|;\s*)locale=([^;]+)/);
  if (match) {
    try {
      return decodeURIComponent(match[1]).replace(/"/g, '');
    } catch {
      return 'zh-CN';
    }
  }

  return 'zh-CN';
}

/**
 * 创建标题注入插件
 */
export function titleInjectPlugin(): Plugin {
  let requestPath = '/';
  let requestCookie = '';
  let viteConfig: any = null;

  return {
    name: 'vite-plugin-title-inject',

    configResolved(config) {
      viteConfig = config;
    },

    configureServer(server) {
      // 在 Vite 内部中间件之前拦截请求，保存路径和 cookie
      server.middlewares.use((req, res, next) => {
        requestPath = req.url || '/';
        requestCookie = req.headers.cookie || '';
        next();
      });
    },

    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        // 统一使用"管理模块"格式（不使用页面标题）
        const finalTitle = moduleName;

        // 替换占位符
        let updatedHtml = html.replace('__PAGE_TITLE__', finalTitle);

        // 关键：注入 apps.config.json 到 window 全局变量（如果配置存在）
        // 这样子应用在运行时可以通过 window.__BTC_APPS_CONFIG__ 访问配置
        if (viteConfig) {
          try {
            const root = viteConfig.root || process.cwd();
            const config = loadAppsConfig(root);
            
            if (config) {
              const configScript = `<script>window.__BTC_APPS_CONFIG__ = ${JSON.stringify(config)};</script>`;
              // 在 </head> 前注入配置脚本
              updatedHtml = updatedHtml.replace('</head>', `${configScript}</head>`);
            }
          } catch (error) {
            console.error('[title-inject] 注入配置失败:', error);
          }
        }

        return updatedHtml;
      },
    },
  };
}


/**
 * Vite 插件：注入静态兜底 title 到 index.html
 * 职责：构建时统一设置初始 title，避免子应用重复写
 */
;

import type { Plugin, ResolvedConfig } from 'vite';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
// logger 已移除，使用 console 替代

const __filename = fileURLToPath(import.meta.url);
// @ts-expect-error: __dirname 未使用，保留用于未来功能
const __dirname = dirname(__filename);

/**
 * 应用配置类型
 */
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
    // root 通常是应用目录（如 apps/main-app），需要向上两级到项目根目录
    const configPath = resolve(root, '../../apps.config.json');
    
    if (!existsSync(configPath)) {
      console.warn('[inject-fallback-title] apps.config.json 不存在:', configPath);
      return null;
    }

    const configContent = readFileSync(configPath, 'utf-8');
    return JSON.parse(configContent) as AppsConfig;
  } catch (error) {
    console.error('[inject-fallback-title] 加载 apps.config.json 失败:', error);
    return null;
  }
}

/**
 * 从应用目录路径或 package.json 获取应用 ID
 */
function getAppIdFromContext(root: string, packageName?: string): string | null {
  // 方案1：从 package.json 的 name 字段提取（如 "main-app" -> "main"）
  if (packageName) {
    // 移除 -app 后缀
    const appId = packageName.replace(/-app$/, '');
    return appId;
  }

  // 方案2：从路径推断（如 apps/main-app -> main）
  const pathParts = root.split(/[/\\]/);
  const appDirName = pathParts[pathParts.length - 1];
  if (appDirName && appDirName.endsWith('-app')) {
    return appDirName.replace(/-app$/, '');
  }

  return null;
}

/**
 * 判断应用是否为标准应用
 */
function isStandardApp(appId: string, config: AppsConfig): boolean {
  return config.apps.some(app => app.id === appId);
}

/**
 * 获取应用显示名称
 */
function getAppDisplayName(appId: string, config: AppsConfig): string {
  const app = config.apps.find(a => a.id === appId);
  return app?.displayName || app?.name || appId;
}

/**
 * 生成兜底标题
 */
function generateFallbackTitle(
  appId: string | null,
  config: AppsConfig | null
): string {
  const brandSuffix = '拜里斯科技';

  // 如果没有应用 ID 或配置，返回品牌后缀
  if (!appId || !config) {
    return brandSuffix;
  }

  const isStandard = isStandardApp(appId, config);
  const appDisplayName = getAppDisplayName(appId, config);

  // 标准应用：返回应用名
  if (isStandard) {
    return appDisplayName;
  }

  // 非标准应用：返回 {应用名} - 拜里斯科技 或 拜里斯科技
  if (appDisplayName && appDisplayName !== appId) {
    return `${appDisplayName} - ${brandSuffix}`;
  }

  return brandSuffix;
}

/**
 * Vite 插件：注入静态兜底 title
 * @param options 配置选项
 */
export function injectFallbackTitle(options: {
  /** 应用 ID（可选，如果不提供会从上下文推断） */
  appId?: string;
  /** 应用包名（可选，用于推断应用 ID） */
  packageName?: string;
} = {}): Plugin {
  let viteConfig: ResolvedConfig | null = null;

  return {
    name: 'vite-plugin-inject-fallback-title',
    // 在开发和生产环境都执行

    configResolved(config: ResolvedConfig) {
      viteConfig = config;
    },

    transformIndexHtml: {
      order: 'pre', // 在其他插件之前执行
      handler(html: string) {
        if (!viteConfig) {
          console.warn('[inject-fallback-title] Vite 配置未找到，跳过注入标题');
          return html;
        }

        try {
          const root = viteConfig.root || process.cwd();
          
          // 获取应用 ID
          let appId: string | null = options.appId || null;
          if (!appId) {
            appId = getAppIdFromContext(root, options.packageName);
          }

          // 加载应用配置
          const config = loadAppsConfig(root);
          
          // 生成兜底标题
          const fallbackTitle = generateFallbackTitle(appId, config);

          // 替换或添加 <title> 标签
          const titleRegex = /<title[^>]*>.*?<\/title>/i;
          let updatedHtml = html;
          
          if (titleRegex.test(updatedHtml)) {
            // 如果已存在 title 标签，替换它
            updatedHtml = updatedHtml.replace(titleRegex, `<title>${fallbackTitle}</title>`);
          } else {
            // 如果不存在 title 标签，在 </head> 前添加
            updatedHtml = updatedHtml.replace('</head>', `<title>${fallbackTitle}</title></head>`);
          }

          // 注入 apps.config.json 到 window 全局变量（如果配置存在）
          if (config) {
            const configScript = `<script>window.__BTC_APPS_CONFIG__ = ${JSON.stringify(config)};</script>`;
            // 在 </head> 前注入配置脚本
            updatedHtml = updatedHtml.replace('</head>', `${configScript}</head>`);
          }

          return updatedHtml;
        } catch (error) {
          console.error('[inject-fallback-title] 注入标题失败:', error);
          return html;
        }
      },
    },
  } as unknown as Plugin;
}

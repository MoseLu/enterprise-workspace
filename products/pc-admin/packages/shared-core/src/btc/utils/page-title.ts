import { logger } from '../../utils/logger/index';
;
/**
 * 浏览器标题设置工具
 * 核心职责：封装标题拼接规则、修改 document.title
 * 
 * 标题格式规则：
 * - 标准应用（在 apps.config.json 中）：
 *   1. 默认：{页面标题}
 *   2. 首页：{页面标题} - {应用名}
 *   3. 兜底：{应用名}
 * - 非标准应用（不在 apps.config.json 中）：
 *   1. 默认：{应用名} - 拜里斯科技
 *   2. 兜底：拜里斯科技
 */

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
 * 标题配置
 */
export const PAGE_TITLE_CONFIG = {
  brandSuffix: '拜里斯科技', // 用于非标准应用
  loadingTitle: '加载中',
} as const;

/**
 * 应用配置缓存
 */
let appsConfigCache: AppsConfig | null = null;
let appsConfigPromise: Promise<AppsConfig> | null = null;

/**
 * 加载应用配置（从 apps.config.json）
 * 使用 Promise 缓存，避免重复加载
 */
async function loadAppsConfig(): Promise<AppsConfig> {
  // 如果已有缓存，直接返回
  if (appsConfigCache) {
    return appsConfigCache;
  }

  // 如果正在加载，返回同一个 Promise
  if (appsConfigPromise) {
    return appsConfigPromise;
  }

  // 开始加载
  appsConfigPromise = (async () => {
    try {
      // 在浏览器环境中，尝试通过多种方式读取配置
      
      // 方案1：尝试从 window 全局变量读取（如果构建时注入）
      if (typeof window !== 'undefined' && (window as any).__BTC_APPS_CONFIG__) {
        appsConfigCache = (window as any).__BTC_APPS_CONFIG__;
        return appsConfigCache;
      }

      // 方案2：尝试通过 fetch 读取（如果配置在 public 目录）
      if (typeof fetch !== 'undefined') {
        try {
          const response = await fetch('/apps.config.json');
          if (response.ok) {
            appsConfigCache = await response.json();
            return appsConfigCache;
          }
        } catch (e) {
          // fetch 失败，继续尝试其他方案
        }
      }

      // 方案3：如果以上都失败，使用空配置（兜底）
      // 注意：在运行时，应用信息可以通过其他方式获取（如从路由路径推断）
      console.warn('[page-title] 无法加载 apps.config.json，使用空配置');
      appsConfigCache = { apps: [] };
      return appsConfigCache;
    } catch (error) {
      logger.error('[page-title] 加载应用配置失败:', error);
      appsConfigCache = { apps: [] };
      return appsConfigCache;
    } finally {
      appsConfigPromise = null;
    }
  })();

  return appsConfigPromise;
}

/**
 * 同步加载应用配置（如果已缓存）
 */
function getAppsConfigSync(): AppsConfig | null {
  return appsConfigCache;
}

/**
 * 判断应用是否为标准应用（在 apps.config.json 中）
 */
export async function isStandardApp(appId: string): Promise<boolean> {
  const config = await loadAppsConfig();
  return config.apps.some(app => app.id === appId);
}

/**
 * 同步判断应用是否为标准应用（如果配置已加载）
 */
export function isStandardAppSync(appId: string): boolean {
  const config = getAppsConfigSync();
  if (!config) {
    // 如果配置未加载，默认返回 true（假设是标准应用）
    return true;
  }
  return config.apps.some(app => app.id === appId);
}

/**
 * 获取应用显示名称
 * @param appId 应用 ID
 * @param translate 国际化翻译函数（可选）
 */
export async function getAppDisplayName(
  appId: string,
  translate?: (key: string) => string
): Promise<string> {
  const config = await loadAppsConfig();
  const app = config.apps.find(a => a.id === appId);
  
  // 如果提供了翻译函数，尝试使用国际化 key
  if (translate) {
    const i18nKey = `micro_app.${appId}.title`;
    const translated = translate(i18nKey);
    // 如果翻译成功（返回值不等于 key），使用翻译结果
    if (translated !== i18nKey) {
      return translated;
    }
  }
  
  // 回退到配置中的 displayName
  return app?.displayName || app?.name || appId;
}

/**
 * 同步获取应用显示名称（如果配置已加载）
 * @param appId 应用 ID
 * @param translate 国际化翻译函数（可选）
 */
export function getAppDisplayNameSync(
  appId: string,
  translate?: (key: string) => string
): string {
  // 如果提供了翻译函数，优先尝试使用国际化 key（即使配置未加载）
  if (translate) {
    const i18nKey = `micro_app.${appId}.title`;
    const translated = translate(i18nKey);
    // 如果翻译成功（返回值不等于 key），使用翻译结果
    if (translated !== i18nKey) {
      return translated;
    }
  }
  
  const config = getAppsConfigSync();
  if (!config) {
    // 配置未加载时，如果翻译也失败，返回 appId（而不是硬编码的"主应用"）
    return appId;
  }
  const app = config.apps.find(a => a.id === appId);
  
  // 回退到配置中的 displayName
  return app?.displayName || app?.name || appId;
}

/**
 * 获取应用配置
 */
export async function getAppConfig(appId: string): Promise<AppConfig | undefined> {
  const config = await loadAppsConfig();
  return config.apps.find(a => a.id === appId);
}

/**
 * 同步获取应用配置（如果配置已加载）
 */
export function getAppConfigSync(appId: string): AppConfig | undefined {
  const config = getAppsConfigSync();
  if (!config) {
    return undefined;
  }
  return config.apps.find(a => a.id === appId);
}

/**
 * 构建标题（核心拼接逻辑）
 * @param appId 应用 ID
 * @param pageTitle 页面标题（可选）
 * @param isHome 是否为首页
 * @param translate 国际化翻译函数（可选）
 * @returns 完整的标题字符串
 */
export async function buildTitle(
  appId: string,
  pageTitle?: string | null,
  isHome: boolean = false,
  translate?: (key: string) => string
): Promise<string> {
  const isStandard = await isStandardApp(appId);
  const appDisplayName = await getAppDisplayName(appId, translate);

  // 标准应用规则
  if (isStandard) {
    // 有页面标题
    if (pageTitle) {
      // 首页：{页面标题} - {应用名}
      if (isHome) {
        return `${pageTitle} - ${appDisplayName}`;
      }
      // 默认：{页面标题}
      return pageTitle;
    }
    // 兜底：{应用名}
    return appDisplayName;
  }

  // 非标准应用规则
  // 有页面标题时，使用页面标题（但这种情况应该很少）
  if (pageTitle) {
    return pageTitle;
  }
  // 默认：{应用名} - 拜里斯科技
  if (appDisplayName && appDisplayName !== appId) {
    return `${appDisplayName} - ${PAGE_TITLE_CONFIG.brandSuffix}`;
  }
  // 兜底：拜里斯科技
  return PAGE_TITLE_CONFIG.brandSuffix;
}

/**
 * 同步构建标题（如果配置已加载）
 * @param appId 应用 ID
 * @param pageTitle 页面标题（可选）
 * @param isHome 是否为首页
 * @param translate 国际化翻译函数（可选）
 */
export function buildTitleSync(
  appId: string,
  pageTitle?: string | null,
  isHome: boolean = false,
  translate?: (key: string) => string
): string {
  const isStandard = isStandardAppSync(appId);
  const appDisplayName = getAppDisplayNameSync(appId, translate);

  // 标准应用规则
  if (isStandard) {
    // 有页面标题
    if (pageTitle) {
      // 首页：{页面标题} - {应用名}
      if (isHome) {
        return `${pageTitle} - ${appDisplayName}`;
      }
      // 默认：{页面标题}
      return pageTitle;
    }
    // 兜底：{应用名}
    return appDisplayName;
  }

  // 非标准应用规则
  // 有页面标题时，使用页面标题（但这种情况应该很少）
  if (pageTitle) {
    return pageTitle;
  }
  // 默认：{应用名} - 拜里斯科技
  if (appDisplayName && appDisplayName !== appId) {
    return `${appDisplayName} - ${PAGE_TITLE_CONFIG.brandSuffix}`;
  }
  // 兜底：拜里斯科技
  return PAGE_TITLE_CONFIG.brandSuffix;
}

/**
 * 标题设置选项
 */
export interface PageTitleOptions {
  /** 是否为首页 */
  isHome?: boolean;
  /** 是否强制使用同步方法（如果配置已加载） */
  sync?: boolean;
  /** 国际化翻译函数（可选） */
  translate?: (key: string) => string;
}

/**
 * 设置浏览器标题
 * @param appId 应用 ID
 * @param pageTitle 页面标题（可选）
 * @param options 选项
 */
export async function setPageTitle(
  appId: string,
  pageTitle?: string | null,
  options: PageTitleOptions = {}
): Promise<string> {
  if (typeof document === 'undefined') {
    // 服务端渲染环境，不设置标题
    return '';
  }

  const { isHome = false, sync = false, translate } = options;

  let finalTitle: string;

  if (sync) {
    // 使用同步方法（如果配置已加载）
    finalTitle = buildTitleSync(appId, pageTitle, isHome, translate);
  } else {
    // 使用异步方法（确保配置已加载）
    finalTitle = await buildTitle(appId, pageTitle, isHome, translate);
  }

  document.title = finalTitle;
  return finalTitle;
}

/**
 * 预加载应用配置（可选，用于提前加载配置）
 */
export async function preloadAppsConfig(): Promise<void> {
  await loadAppsConfig();
}

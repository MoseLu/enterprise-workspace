// 注意：这里不能直接导入 logger，因为可能在应用启动早期被调用
// 在初始化阶段和早期运行时使用 console，确保不出现循环依赖问题
// console 是全局对象，在模块加载时就已经存在，不会受到循环依赖的影响
import type { Plugin } from '../btc/plugins/manager/types';
import type { AppEnvConfig } from './app-env.config';
import { getAppConfig, getAllDevPorts, getAllPrePorts } from './app-env.config';
import { registerMenus, getMenuRegistry, clearMenus } from '@btc/shared-components';
// MenuItem 类型定义（从 shared-components 复制，因为类型导出在 dist 中可能不可用）
type MenuItem = {
  index: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
};
import { getManifestMenus, getManifestTabs, getManifest } from '../manifest';
import { storage } from '../utils';
import { assignIconsToMenuTree } from '../utils/menu-icon-assigner';
import { getAppBySubdomain, getAppById } from './app-scanner';
import { getEnvConfig } from './unified-env-config';
import { logger } from '../utils/logger/index';

declare global {
  interface Window {
    __APP_GET_APP_CONFIG__?: (appName: string) => AppEnvConfig | undefined;
    __APP_GET_ALL_DEV_PORTS__?: () => string[];
    __APP_GET_ALL_PRE_PORTS__?: () => string[];
    __REGISTER_MENUS_FOR_APP__?: (appId: string) => void;
  }
}

const DEFAULT_DOMAIN_NAMES: Record<string, { code: string; name: string; host: string }> = {
  system: { code: 'SYSTEM', name: '系统域', host: 'bellis.com.cn' },
  admin: { code: 'ADMIN', name: '管理域', host: 'admin.bellis.com.cn' },
  logistics: { code: 'LOGISTICS', name: '物流域', host: 'logistics.bellis.com.cn' },
  engineering: { code: 'ENGINEERING', name: '工程域', host: 'engineering.bellis.com.cn' },
  quality: { code: 'QUALITY', name: '品质域', host: 'quality.bellis.com.cn' },
  production: { code: 'PRODUCTION', name: '生产域', host: 'production.bellis.com.cn' },
  finance: { code: 'FINANCE', name: '财务域', host: 'finance.bellis.com.cn' },
};

/**
 * 规范化菜单路径：在开发环境下自动添加应用前缀，生产子域环境下移除应用前缀
 * manifest 中的菜单路径已经移除了应用前缀，所以：
 * - 开发环境（qiankun模式）：需要添加前缀 `/${appName}/xxx`
 * - 生产子域环境：移除应用前缀，保持原路径 `/xxx`
 */
function normalizeMenuPath(path: string, appName: string): string {
  if (!path || !appName) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // 检测是否在生产环境的子域名下
  if (typeof window === 'undefined') {
    // SSR 环境，保持原路径
    return normalizedPath;
  }

  const hostname = window.location.hostname;
  const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

  if (isProductionSubdomain) {
    // 生产环境子域名：使用应用扫描器获取子域名应用
    const appBySubdomain = getAppBySubdomain(hostname);
    const currentSubdomainApp = appBySubdomain?.id;

    // 如果在子域名环境下，且路径以应用前缀开头，移除前缀
    if (currentSubdomainApp && currentSubdomainApp === appName) {
      const appPrefix = `/${appName}`;
      if (normalizedPath === appPrefix) {
        // 如果是应用根路径，返回 /
        return '/';
      } else if (normalizedPath.startsWith(`${appPrefix}/`)) {
        // 移除应用前缀
        return normalizedPath.substring(appPrefix.length);
      }
    }

    // 生产环境子域名：保持原路径（manifest 中已经没有前缀了）
    return normalizedPath;
  }

  // 开发环境（qiankun模式）：需要添加应用前缀
  // 如果路径已经是根路径，直接返回应用前缀
  if (normalizedPath === '/') {
    return `/${appName}`;
  }

  // 如果路径已经包含应用前缀，不需要重复添加
  if (normalizedPath.startsWith(`/${appName}/`) || normalizedPath === `/${appName}`) {
    return normalizedPath;
  }

  // 添加应用前缀
  return `/${appName}${normalizedPath}`;
}

// 递归转换菜单项（支持任意深度）
// 使用智能图标分配，确保同一域内图标不重复且语义匹配
function normalizeMenuItems(items: any[], appName: string, usedIcons?: Set<string>): MenuItem[] {
  // 创建已使用图标集合（用于域内去重），如果已存在则复用
  const iconSet = usedIcons || new Set<string>();

  // 将 title 字段映射到 labelKey 字段，以便图标分配工具使用
  const itemsWithLabelKey = items.map(item => ({
    ...item,
    labelKey: item.labelKey || item.title || item.label,
  }));

  // 使用智能图标分配工具（会递归处理所有子菜单）
  const itemsWithIcons = assignIconsToMenuTree(itemsWithLabelKey, iconSet);

  // 递归转换函数，将 assignIconsToMenuTree 返回的结构转换为 MenuItem 格式
  const convertToMenuItem = (item: any): MenuItem & { labelKey?: string } => {
    const normalizedIndex = normalizeMenuPath(item.index, appName);
    return {
      index: normalizedIndex,
      title: item.labelKey ?? item.label ?? item.title ?? normalizedIndex,
      icon: item.icon,
      // 保存 labelKey 用于面包屑图标查找
      labelKey: item.labelKey,
      children: item.children && item.children.length > 0
        ? item.children.map(convertToMenuItem)
        : undefined,
    };
  };

  // 转换为 MenuItem 格式（不需要再次调用 assignIconsToMenuTree，因为已经处理了所有层级）
  return itemsWithIcons.map(convertToMenuItem);
}

/**
 * 注册 AppLayout 运行时所需的环境配置访问器
 * 在独立运行的子应用中调用一次即可
 */
/**
 * 注册全局菜单注册函数，供菜单组件使用
 */
export function registerMenuRegistrationFunction(target: Window = window) {
  if (typeof target !== 'undefined') {
    target.__REGISTER_MENUS_FOR_APP__ = registerManifestMenusForApp;
  }
}

export function registerAppEnvAccessors(target: Window = window) {
  const win = target as typeof window & {
    __APP_GET_APP_CONFIG__?: (appName: string) => AppEnvConfig | undefined;
    __APP_GET_ALL_DEV_PORTS__?: () => string[];
    __APP_GET_ALL_PRE_PORTS__?: () => string[];
  };

  if (!win.__APP_GET_APP_CONFIG__) {
    win.__APP_GET_APP_CONFIG__ = (appName: string) => getAppConfig(appName);
  }

  if (!win.__APP_GET_ALL_DEV_PORTS__) {
    win.__APP_GET_ALL_DEV_PORTS__ = () => getAllDevPorts();
  }

  if (!win.__APP_GET_ALL_PRE_PORTS__) {
    win.__APP_GET_ALL_PRE_PORTS__ = () => getAllPrePorts();
  }
}

/**
 * 根据 manifest 注册当前应用的菜单
 */
export function registerManifestMenusForApp(appId: string) {
  try {
    // 关键：确保菜单注册表已初始化并挂载到全局
    // 优先使用已存在的全局注册表（由 layout-app 创建），避免创建多个实例
    // 在生产环境下，layout-app 先加载并创建注册表，子应用后加载应该使用同一个实例
    let registry: any;
    if (typeof window !== 'undefined' && (window as any).__BTC_MENU_REGISTRY__) {
      // 使用已存在的全局注册表（layout-app 创建的）
      registry = (window as any).__BTC_MENU_REGISTRY__;
    } else {
      // 如果全局不存在，创建新的并挂载到全局
      registry = getMenuRegistry();
      if (typeof window !== 'undefined') {
        (window as any).__BTC_MENU_REGISTRY__ = registry;
      }
    }

    // 开发环境下：检查并清除可能包含旧 labelKey 格式的菜单缓存
    if (import.meta.env.DEV && appId === 'logistics') {
      const existingMenus = registry.value[appId] || [];
      const hasOldFormat = existingMenus.some((menu: any) => {
        const checkMenu = (m: any): boolean => {
          if (m.labelKey && m.labelKey.includes('menu.logistics.')) {
            return true;
          }
          if (m.title && m.title.includes('menu.logistics.')) {
            return true;
          }
          if (m.children) {
            return m.children.some(checkMenu);
          }
          return false;
        };
        return checkMenu(menu);
      });

      if (hasOldFormat) {
        if (import.meta.env.DEV) {
          // 使用 console，避免在应用启动早期出现循环依赖
          console.info(`[registerManifestMenusForApp] Detected old format menu cache, clearing ${appId} menu cache`);
        }
        // 清除旧缓存
        clearMenus(appId);
      }
    }

    // 先尝试通过 getManifestMenus 获取菜单
    let manifestMenus = getManifestMenus(appId);

    // 如果 getManifestMenus 返回空，尝试直接获取 manifest
    if (!manifestMenus?.length) {
      const manifest = getManifest(appId);

      if (!manifest) {
        // 检查应用配置，如果是公开应用（如 home），静默跳过，不输出警告
        try {
          const appConfig = getAppById(appId);
          // 如果是公开应用，静默跳过菜单注册
          if (appConfig?.metadata?.public === true) {
            return;
          }
        } catch (error) {
          // 如果获取应用配置失败，继续输出警告
        }

        if (import.meta.env.DEV) {
          // 使用 console，避免在应用启动早期出现循环依赖
          console.warn(`[registerManifestMenusForApp] 应用 ${appId} 的 manifest 不存在`);
        }
        return;
      }

      if (!manifest.menus || manifest.menus.length === 0) {
        return;
      }

      // 直接使用 manifest.menus
      manifestMenus = manifest.menus;
    }

    // 使用 normalizeMenuItems 进行规范化，包含图标分配逻辑
    const normalizedMenus = normalizeMenuItems(manifestMenus, appId);

    if (!normalizedMenus || normalizedMenus.length === 0) {
      if (import.meta.env.DEV) {
        // 使用 console，避免在应用启动早期出现循环依赖
        console.warn(`[registerManifestMenusForApp] 应用 ${appId} 的菜单规范化后为空`);
      }
      return;
    }

    // 关键：从 manifest 注册菜单时，使用 forceUpdate=true 强制更新菜单
    // 这样可以确保 manifest JSON 更新后，新的菜单项能够正确显示，避免 localStorage 缓存导致的问题
    registerMenus(appId, normalizedMenus, true);

    // 验证菜单是否已正确注册
    const registeredMenus = registry?.value?.[appId];
    if (!registeredMenus || registeredMenus.length === 0) {
      // 生产环境也输出警告，帮助调试
      // 使用 console，避免在应用启动早期出现循环依赖
      console.warn(`[registerManifestMenusForApp] 应用 ${appId} 的菜单注册后验证失败，菜单为空`, {
        appId,
        normalizedMenusLength: normalizedMenus.length,
        registryExists: !!registry,
        registryValue: registry?.value,
        registryKeys: registry ? Object.keys(registry.value || {}) : [],
      });
      // 尝试再次注册
      registerMenus(appId, normalizedMenus);

      // 再次验证
      const retryMenus = registry?.value?.[appId];
      if (retryMenus && retryMenus.length > 0) {
        // 菜单注册成功，无需操作
      } else {
        // 使用 console，避免在应用启动早期出现循环依赖
        logger.error(`[registerManifestMenusForApp] 应用 ${appId} 的菜单注册失败，即使重试后仍为空`);
      }
    } else {
      // 生产环境也输出成功日志
    }
  } catch (error) {
    // 生产环境也输出错误信息，帮助调试
    // 使用 console，避免在应用启动早期出现循环依赖
    logger.error(`[registerManifestMenusForApp] 应用 ${appId} 的菜单注册失败:`, error);
  }
}

/**
 * 根据 manifest 注册当前应用的 Tabs（用于 tabbar 显示）
 * 注意：tabbar 的标签是通过路由导航时自动添加到 processStore 的，
 * 标签的文本通过 getManifestRoute 从 manifest 中获取，不需要单独的 tabRegistry
 * 这个函数主要用于确保 manifest 数据已加载，实际标签文本由 tabbar 组件从 manifest 中读取
 */
export function registerManifestTabsForApp(appId: string) {
  const manifestTabs = getManifestTabs(appId);

  if (!manifestTabs?.length) {
    return;
  }

  // tabbar 的标签文本通过 getManifestRoute 从 manifest 中获取，不需要单独的注册
  // 这里只是确保 manifest 数据已加载
}

// 未使用的函数，保留以备将来使用
/*
const normalizeBaseUrl = (candidate?: string | null, context?: string) => {
  if (!candidate) return null;
  const trimmed = candidate.trim();
  if (!trimmed) return null;

  try {
    const absolute = context ? new URL(trimmed, context) : new URL(trimmed);
    return new URL('.', absolute).href;
  } catch {
    return null;
  }
};
*/

/**
 * 解析应用 Logo 地址（始终返回根路径，不依赖当前路由）
 * 生产环境使用 CDN，开发/预览环境使用本地路径
 */
export function resolveAppLogoUrl() {
  // 始终使用根路径，不依赖 document.baseURI（避免受当前路由影响）
  // 例如：当前路由是 /governance/files/... 时，不应该解析为 /governance/files/logo.png

  // 获取环境配置
  try {
    const envConfig = getEnvConfig();

    // 生产环境且配置了 CDN URL，使用 CDN
    if (envConfig.cdn?.staticAssetsUrl) {
      const cdnUrl = envConfig.cdn.staticAssetsUrl.replace(/\/$/, '');
      return `${cdnUrl}/logo.png`;
    }
  } catch (error) {
    // 如果获取配置失败，继续使用本地路径
  }

  // 开发/预览环境或未配置 CDN：使用本地路径
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/logo.png`;
  }
  return '/logo.png';
}

/**
 * 创建一个轻量级的 AppStorage 适配器，满足 AppLayout 的最小依赖
 */
export function createAppStorageBridge(namespace: string) {
  const makeKey = (suffix: string) => `${namespace}:${suffix}`;

  const getJson = <T>(key: string): T | null => (storage.get(key) as T | null) ?? null;
  const setJson = (key: string, value: unknown) => storage.set(key, value);
  const removeKey = (key: string) => storage.remove(key);

  const userStore = {
    get: () => getJson<Record<string, any>>(makeKey('user')),
    set(data: Record<string, any>) {
      const next = { ...(userStore.get() ?? {}), ...data };
      setJson(makeKey('user'), next);
    },
    getAvatar: () => userStore.get()?.avatar ?? null,
    setAvatar(avatar: string) {
      userStore.set({ avatar });
    },
    getName: () => userStore.get()?.name ?? null,
    setName(name: string) {
      userStore.set({ name });
    },
    clear() {
      removeKey(makeKey('user'));
    },
  };

  const settingsStore = {
    get: () => getJson<Record<string, any>>(makeKey('settings')) ?? {},
    set(data: Record<string, any>) {
      const next = { ...settingsStore.get(), ...data };
      setJson(makeKey('settings'), next);
    },
    getItem(key: string) {
      return settingsStore.get()?.[key] ?? null;
    },
    setItem(key: string, value: unknown) {
      settingsStore.set({ [key]: value });
    },
  };

  return {
    user: userStore,
    settings: settingsStore,
  } as const;
}

/**
 * 返回一个默认的域名列表解析器，确保菜单抽屉不会因为缺失服务而报错
 */
export function createDefaultDomainResolver(appId: string) {
  const domains = Object.entries(DEFAULT_DOMAIN_NAMES).map(([id, info]) => ({
    domainCode: info.code,
    name: info.name,
    host: info.host,
    appId: id,
    active: id === appId,
  }));

  return async () => domains;
}

/**
 * 统一注入域列表获取函数（所有子应用必须调用）
 * 优先使用 domain-cache 模块（调用 me 接口获取真实域列表），
 * 如果加载失败则使用默认解析器作为兜底
 *
 * @param appId 应用 ID（如 'finance', 'admin'）
 * @param domainCachePathOrModule domain-cache 模块的路径字符串，或者已经导入的模块对象
 * @param target 目标 window 对象，默认为全局 window
 */
export async function injectDomainListResolver(
  appId: string,
  domainCachePathOrModule: string | { getDomainList?: any; clearDomainCache?: any } = './utils/domain-cache',
  target: Window = window
): Promise<void> {
  const win = target as any;

  // 如果已经注入过，检查是否需要替换
  if (win.__APP_GET_DOMAIN_LIST__ && typeof win.__APP_GET_DOMAIN_LIST__ === 'function') {
    const funcStr = win.__APP_GET_DOMAIN_LIST__.toString().replace(/\s+/g, ' ');
    // 检查是否是默认解析器（通过函数名或行为判断）
    const isDefaultResolver = funcStr.includes('DEFAULT_DOMAIN_NAMES');
    // 检查是否是 layout-app 设置的空函数（只返回空数组的函数）
    // layout-app 设置的是: async () => [] 或 () => []
    // 注意：函数转换后的字符串可能是 "async()=>[]" 或 "()=>[]" 或包含 "return[]" 等
    const isEmptyResolver =
      (funcStr.includes('=>[]') || funcStr.includes('=> []')) ||
      (funcStr.includes('return[]') && !funcStr.includes('service') && !funcStr.includes('getDomainList'));

    if (!isDefaultResolver && !isEmptyResolver) {
      // 已经是 domain-cache 或其他有效解析器，不需要重新注入
      return;
    }
    // 如果是默认解析器或空解析器，继续执行下面的逻辑进行替换
  }

  // 关键：优先使用 domain-cache 模块，确保汉堡菜单应用列表能够调用 me 接口
  // 而不是使用 createDefaultDomainResolver（只返回默认域列表）
  let domainModule: any = null;

  // 如果传入的是模块对象，直接使用
  if (typeof domainCachePathOrModule === 'object' && domainCachePathOrModule !== null) {
    domainModule = domainCachePathOrModule;
  } else {
    // 如果是路径字符串，尝试动态导入
    const domainCachePath = domainCachePathOrModule as string;
    try {
      // 首先尝试使用传入的路径（可能是别名路径，如 '@utils/domain-cache'）
      domainModule = await import(/* @vite-ignore */ domainCachePath);
    } catch (error) {
      // 如果别名路径失败（生产环境下常见），使用默认解析器作为兜底
      // 注意：在生产环境下，相对路径的动态导入也会失败，因为构建后的路径不存在
      // 应该在调用方静态导入 domain-cache 模块后传递模块对象，而不是路径字符串
      if (import.meta.env.DEV) {
        // 使用 console，避免在应用启动早期出现循环依赖
        console.warn(`[${appId}-app] Failed to load domain cache from path "${domainCachePath}". In production, dynamic imports of source paths will fail. Please pass the pre-imported module object instead. Using default resolver.`);
      }

      // 如果加载失败，使用默认解析器作为兜底
      if (!win.__APP_GET_DOMAIN_LIST__) {
        win.__APP_GET_DOMAIN_LIST__ = createDefaultDomainResolver(appId);
      }
      return;
    }
  }

  if (!domainModule || (!domainModule.getDomainList && !domainModule.clearDomainCache)) {
    // 使用 console，避免在应用启动早期出现循环依赖
    console.warn(`[${appId}-app] Domain cache module is invalid or missing required functions.`);
    // 如果模块无效，使用默认解析器作为兜底
    if (!win.__APP_GET_DOMAIN_LIST__) {
      win.__APP_GET_DOMAIN_LIST__ = createDefaultDomainResolver(appId);
    }
    return;
  }

  // 成功加载模块后，设置函数
  if (domainModule.getDomainList) {
    win.__APP_GET_DOMAIN_LIST__ = domainModule.getDomainList;
  }
  if (domainModule.clearDomainCache) {
    win.__APP_CLEAR_DOMAIN_CACHE__ = domainModule.clearDomainCache;
    // 注意：不再在子应用初始化时清除域列表缓存
    // 因为域列表数据现在存储在持久化存储中，只在登录时调用一次接口
    // 如果需要在退出登录时清除，应该在退出登录逻辑中调用 clearDomainCache()
  }
}

/**
 * 创建一个通用的用户设置插件，供未自定义实现的子应用复用
 */
export function createSharedUserSettingPlugin(): Plugin {
  return {
    name: 'user-setting',
    version: '1.0.0',
    description: 'Shared user setting toolbar',
    order: 20,
    toolbar: {
      order: 5,
      pc: true,
      h5: false,
      component: () => import('@btc/shared-components/components/others/btc-user-setting/index.vue'),
    },
  };
}

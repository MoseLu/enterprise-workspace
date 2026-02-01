// SVG 图标注册（必须在最前面，确保 SVG sprite 在应用启动时就被加载）
import 'virtual:svg-register';
// 样式文件在模块加载时同步导入
import '@btc/shared-components/styles/index.scss';
import '../styles/global.scss';
import '../styles/theme.scss';

import { deleteCookie } from '@btc/shared-core/utils/cookie';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import type { QiankunProps } from '@btc/shared-core';
import {
  createSubApp,
  mountSubApp,
  unmountSubApp,
  updateSubApp,
  updateElementPlusLocale,
  // setupRouteSync 未使用，已移除
  setupHostLocationBridge,
  ensureCleanUrl,
  ensureLeadingSlash,
  normalizeToHostPath,
  getCurrentHostPath,
  type SubAppContext,
  type SubAppOptions,
} from '@btc/shared-core';

import App from '../App.vue';
import { userSettingPlugin } from '../plugins/user-setting';
import { createLogisticsRouter, setupRouter, setupStore, setupI18n, setupUI } from './core';
import type { RouteRecordRaw } from 'vue-router';
import { getLogisticsPageRoutes } from '../router/routes/logistics';
import { assignIconsToMenuTree } from '@btc/shared-core';
import type { MenuItem } from '../store/menuRegistry';
import type { TabMeta } from '../store/tabRegistry';

// 扩展 SubAppContext
export interface LogisticsAppContext extends SubAppContext {
  // 显式声明继承的属性，确保 TypeScript 正确识别
  app: SubAppContext['app'];
  router: SubAppContext['router'];
  pinia: SubAppContext['pinia'];
  i18n: SubAppContext['i18n'];
  theme: SubAppContext['theme'];
  cleanup: SubAppContext['cleanup'];
  props: SubAppContext['props'];
  translate: SubAppContext['translate'];
}

const LOGISTICS_APP_ID = 'logistics';
const LOGISTICS_BASE_PATH = '/logistics';
const LOGISTICS_DOMAIN_CACHE_PATH = '@utils/domain-cache';

// 自定义 setupStandalonePlugins（使用 userSettingPlugin）
const setupLogisticsPlugins = async (app: any, router: any) => {
  const { resetPluginManager, usePluginManager } = await import('@btc/shared-core');
  resetPluginManager();
  const pluginManager = usePluginManager({ debug: false });
  pluginManager.setApp(app);
  pluginManager.setRouter(router);
  pluginManager.register(userSettingPlugin);
  await pluginManager.install(userSettingPlugin.name);
};

// 自定义 setupStandaloneGlobals（使用 appStorage 而不是 createAppStorageBridge）
const setupLogisticsGlobals = async () => {
  const { registerAppEnvAccessors, registerMenuRegistrationFunction, resolveAppLogoUrl, injectDomainListResolver } = await import('@btc/shared-core/configs/layout-bridge');

  registerAppEnvAccessors();
  registerMenuRegistrationFunction();

  // 优先使用全局共享的 EPS 服务（由 system-app 或其他应用提供）
  // 只有在没有全局服务时，才加载本地的 EPS 服务
  const getGlobalEpsService = () => {
    const globalService = (window as any).__APP_EPS_SERVICE__ || (window as any).service || (window as any).__BTC_SERVICE__;
    if (globalService && typeof globalService === 'object' && Object.keys(globalService).length > 0) {
      return globalService;
    }
    return null;
  };

  // 先检查是否有全局服务
  let globalService = getGlobalEpsService();

  if (!globalService) {
    // 等待全局服务可用（最多等待 2 秒）
    const waitForGlobalService = async (maxWait = 2000, interval = 100) => {
      const startTime = Date.now();
      while (Date.now() - startTime < maxWait) {
        const service = getGlobalEpsService();
        if (service) return service;
        await new Promise(resolve => setTimeout(resolve, interval));
      }
      return null;
    };

    globalService = await waitForGlobalService();
  }

  if (globalService) {
    // 使用全局服务
    (window as any).__APP_EPS_SERVICE__ = globalService;
  } else {
    // 没有全局服务，加载本地服务
    try {
      const { service } = await import('../services/eps');
      (window as any).__APP_EPS_SERVICE__ = service;
    } catch (error) {
      // Failed to load EPS service
      (window as any).__APP_EPS_SERVICE__ = {};
    }
  }

  // 使用 appStorage 而不是 createAppStorageBridge
  try {
    const { appStorage } = await import('../utils/app-storage');
    (window as any).__APP_STORAGE__ = appStorage;
  } catch (error) {
    // Failed to load app storage
    (window as any).__APP_STORAGE__ = {
      user: {
        getAvatar: () => null,
        setAvatar: () => {},
        getName: () => null,
        setName: () => {},
      },
    };
  }

  // 关键：使用统一的域列表注入函数，确保汉堡菜单应用列表能够调用 me 接口
  // 静态导入 domain-cache 模块，确保在生产构建时被正确打包
  let domainCacheModule: any = null;
  try {
    domainCacheModule = await import('../utils/domain-cache');
  } catch (error) {
    // Failed to import domain-cache module
  }
  await injectDomainListResolver(LOGISTICS_APP_ID, domainCacheModule || LOGISTICS_DOMAIN_CACHE_PATH);

  try {
    const { finishLoading } = await import('../utils/loadingManager');
    (window as any).__APP_FINISH_LOADING__ = finishLoading;
  } catch (error) {
    // Failed to load loading manager
    (window as any).__APP_FINISH_LOADING__ = () => {};
  }

  (window as any).__APP_GET_LOGO_URL__ = () => resolveAppLogoUrl();
  (window as any).__APP_GET_DOCS_SEARCH_SERVICE__ = async () => [];
};

/**
 * 规范化菜单路径：在开发环境下自动添加应用前缀，生产子域环境下保持原路径
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
    // 生产环境子域名：保持原路径
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

/**
 * 从路由配置自动生成菜单树（基于 labelKey 层级）
 */
function generateMenusFromRoutes(routes: RouteRecordRaw[]): MenuItem[] {
  // 1. 收集所有有 labelKey 的路由（排除 redirect 和 process: false 的路由）
  const menuRoutes: Array<{
    path: string;
    labelKey: string;
    icon?: string;
    depth: number;
  }> = [];

  const collectRoutes = (routeList: RouteRecordRaw[], basePath = '') => {
    for (const route of routeList) {
      // 跳过 redirect 路由和 process: false 的路由
      if (route.redirect || route.meta?.process === false) {
        continue;
      }

      const fullPath = basePath + route.path;
      // 支持 titleKey（管理应用格式）和 labelKey（物流应用格式）
      const labelKey = (route.meta?.titleKey || route.meta?.labelKey) as string | undefined;

      if (labelKey && labelKey.startsWith('menu.')) {
        const depth = labelKey.split('.').length - 1; // menu.xxx = 1, menu.xxx.yyy = 2
        // 从 breadcrumbs 获取图标，如果没有则从 meta.icon 获取
        const icon = (route.meta?.breadcrumbs as Array<{ icon?: string }> | undefined)?.[0]?.icon || route.meta?.icon;

        menuRoutes.push({
          path: fullPath,
          labelKey,
          icon,
          depth,
        });
      }

      // 递归处理子路由
      if (route.children && route.children.length > 0) {
        collectRoutes(route.children, fullPath);
      }
    }
  };

  collectRoutes(routes);

  // 2. 按 labelKey 层级构建菜单树
  interface MenuNode {
    labelKey: string;
    path?: string;
    icon?: string;
    children: Map<string, MenuNode>;
  }

  const menuTree = new Map<string, MenuNode>();

  // 先按深度排序，确保父节点先创建
  menuRoutes.sort((a, b) => a.depth - b.depth);

  // 创建一个映射，用于快速查找 labelKey 对应的路由信息
  const labelKeyToRoute = new Map<string, { path: string; icon?: string }>();
  for (const route of menuRoutes) {
    labelKeyToRoute.set(route.labelKey, { path: route.path, icon: route.icon });
  }


  for (const route of menuRoutes) {
    const parts = route.labelKey.split('.').slice(1); // 移除 'menu' 前缀
    let current = menuTree;

    // 构建路径到目标节点
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const currentLabelKey = `menu.${parts.slice(0, i + 1).join('.')}`;
      const isLeaf = i === parts.length - 1;

      if (!current.has(part)) {
        // 检查当前节点是否也是一个路由（即使不是叶子节点）
        const routeInfo = labelKeyToRoute.get(currentLabelKey);
        current.set(part, {
          labelKey: currentLabelKey,
          path: routeInfo?.path,
          icon: routeInfo?.icon,
          children: new Map(),
        });
      }

      const node = current.get(part)!;

      // 如果当前节点对应的路由信息存在，更新路径和图标
      const routeInfo = labelKeyToRoute.get(currentLabelKey);
      if (routeInfo) {
        // 始终使用路由的实际路径，覆盖之前可能设置的路径
        node.path = routeInfo.path;
        if (routeInfo.icon && !node.icon) {
          node.icon = routeInfo.icon;
        }
      }

      current = node.children;
    }
  }

  // 3. 将 Map 结构转换为 MenuItem 数组
  const convertToMenuItems = (nodes: Map<string, MenuNode>): MenuItem[] => {
    const items: MenuItem[] = [];

    for (const [key, node] of nodes.entries()) {
      const children = node.children.size > 0 ? convertToMenuItems(node.children) : undefined;

      // 如果节点有路径，使用路径；如果没有路径但有子节点，使用第一个子节点的路径；否则使用默认路径
      let normalizedPath = '';
      if (node.path) {
        normalizedPath = normalizeMenuPath(node.path, LOGISTICS_APP_ID);
      } else if (children && children.length > 0 && children[0].index) {
        // 使用第一个子节点的路径作为父节点的路径
        normalizedPath = children[0].index;
      } else {
        // 如果没有路径也没有子节点，使用 labelKey 生成一个默认路径
        normalizedPath = normalizeMenuPath(`/${key}`, LOGISTICS_APP_ID);
      }

      items.push({
        index: normalizedPath,
        title: node.labelKey, // title 作为显示文本，会在菜单组件中通过 labelKey 翻译
        labelKey: node.labelKey, // 明确设置 labelKey 用于翻译
        icon: node.icon,
        children,
      });
    }

    return items;
  };

  const menuItems = convertToMenuItems(menuTree);


  // 4. 使用智能图标分配工具分配图标
  const itemsWithLabelKey = menuItems.map(item => ({
    ...item,
    labelKey: item.title,
  }));

  const iconSet = new Set<string>();
  const itemsWithIcons = assignIconsToMenuTree(itemsWithLabelKey, iconSet);

  // 5. 转换回 MenuItem 格式（保留 labelKey 用于翻译）
  const finalMenuItems: MenuItem[] = itemsWithIcons.map(item => {
    const labelKey = item.labelKey || item.title;
    return {
      index: item.index,
      title: labelKey, // title 使用 labelKey，菜单组件会通过 labelKey 翻译
      labelKey, // 明确设置 labelKey 用于翻译
      icon: item.icon,
      children: item.children ? (item.children as any[]).map((child: any) => {
        const childLabelKey = child.labelKey || child.title;
        return {
          index: child.index,
          title: childLabelKey,
          labelKey: childLabelKey,
          icon: child.icon,
          children: child.children,
        };
      }) : undefined,
    };
  });

  return finalMenuItems;
}

/**
 * 从路由配置自动生成标签页列表
 */
function generateTabsFromRoutes(routes: RouteRecordRaw[]): TabMeta[] {
  const tabs: TabMeta[] = [];

  const collectTabs = (routeList: RouteRecordRaw[], basePath = '') => {
    for (const route of routeList) {
      // 跳过 redirect 路由和 process: false 的路由
      if (route.redirect || route.meta?.process === false) {
        continue;
      }

      const fullPath = basePath + route.path;
      // 支持 titleKey（管理应用格式）、tabLabelKey 和 labelKey（物流应用格式）
      const tabLabelKey = route.meta?.tabLabelKey as string | undefined;
      const labelKey = route.meta?.labelKey as string | undefined;
      const titleKey = route.meta?.titleKey as string | undefined;

      // 如果有 tabLabelKey、labelKey 或 titleKey，生成标签页
      if (tabLabelKey || labelKey || titleKey) {
        const i18nKey = tabLabelKey || labelKey || titleKey;
        const normalizedPath = normalizeMenuPath(fullPath, LOGISTICS_APP_ID);
        const key = normalizedPath.replace(/^\//, '').replace(/\//g, '-') || 'home';

        tabs.push({
          key,
          title: i18nKey || normalizedPath,
          path: normalizedPath,
          i18nKey,
        });
      }

      // 递归处理子路由
      if (route.children && route.children.length > 0) {
        collectTabs(route.children, fullPath);
      }
    }
  };

  collectTabs(routes);

  return tabs;
}

// 自定义 setupRouteSync（logistics-app 有特殊的 syncHostWithSubRoute 逻辑）
const setupLogisticsRouteSync = (context: LogisticsAppContext) => {
  // 关键：在 layout-app 环境下也需要设置路由同步
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp) {
    return;
  }

  // 自定义 syncHostWithSubRoute（layout-app 环境下不修改 URL）
  const syncHostWithSubRoute = (fullPath: string) => {
    // 关键：在 layout-app 环境下（子域名环境），不应该修改 URL
    // 因为子域名环境下路径应该直接是子应用路由（如 / 或 /xxx），不需要添加 /logistics 前缀
    if (isUsingLayoutApp) {
      // layout-app 环境下（子域名环境），不修改 URL，避免路由循环
      return;
    }

    // 只在 qiankun 环境下同步路由到主机
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      return;
    }

    // 确保 fullPath 是有效的路径，如果已经是完整路径则直接使用
    let targetUrl = fullPath || LOGISTICS_BASE_PATH;

    // 如果 fullPath 已经是完整路径（以 /logistics 开头），直接使用
    // 否则确保它以 LOGISTICS_BASE_PATH 开头
    if (!targetUrl.startsWith(LOGISTICS_BASE_PATH)) {
      // 如果 fullPath 是相对路径，拼接 base path
      if (targetUrl === '/' || targetUrl === '') {
        targetUrl = LOGISTICS_BASE_PATH;
      } else {
        targetUrl = `${LOGISTICS_BASE_PATH}${targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`}`;
      }
    }

    const currentUrl = getCurrentHostPath();

    if (currentUrl === targetUrl) {
      return;
    }

    window.history.pushState(window.history.state, '', targetUrl);
  };

  // 触发路由变化事件的辅助函数
  const triggerRouteChangeEvent = (to: any) => {
    // 如果应用已卸载，不再同步路由
    if (context.isUnmounted) {
      return;
    }

    const relativeFullPath = ensureLeadingSlash(to.fullPath || to.path || '');
    const fullPath = normalizeToHostPath(relativeFullPath, LOGISTICS_BASE_PATH);

    // 关键：如果是首页（meta.isHome === true 或路径是根路径 /），不触发路由变化事件，避免添加 tab
    if (to.meta?.isHome === true || to.path === '/') {
      return;
    }

    // 支持 titleKey（管理应用格式）、tabLabelKey 和 labelKey（物流应用格式）
    const titleKey = to.meta?.titleKey as string | undefined;
    const tabLabelKey = to.meta?.tabLabelKey as string | undefined;
    const labelKey = to.meta?.labelKey as string | undefined;

    // 优先级：titleKey > tabLabelKey > labelKey
    const i18nKey = titleKey || tabLabelKey || labelKey;

    const tabLabel =
      i18nKey ??
      (to.meta?.tabLabel as string | undefined) ??
      (to.meta?.title as string | undefined) ??
      (to.name as string | undefined) ??
      fullPath;

    const label = i18nKey ? context.translate(i18nKey) : tabLabel;

    const metaPayload = {
      ...to.meta,
      label,
    } as Record<string, any>;

    if (
      typeof metaPayload.labelKey !== 'string' ||
      metaPayload.labelKey.length === 0
    ) {
      if (typeof to.meta?.labelKey === 'string' && to.meta.labelKey.length > 0) {
        metaPayload.labelKey = to.meta.labelKey;
      } else if (i18nKey && typeof i18nKey === 'string' && i18nKey.startsWith('menu.')) {
        metaPayload.labelKey = i18nKey;
      }
    }

    if (!metaPayload.breadcrumbs && Array.isArray(to.meta?.breadcrumbs)) {
      metaPayload.breadcrumbs = to.meta.breadcrumbs;
    }

    window.dispatchEvent(
      new CustomEvent('subapp:route-change', {
        detail: {
          path: fullPath,
          fullPath,
          name: to.name,
          meta: metaPayload,
        },
      }),
    );
  };

  context.cleanup.routerAfterEach = context.router.afterEach((to: any) => {
    const relativeFullPath = ensureLeadingSlash(to.fullPath || to.path || '');
    const fullPath = normalizeToHostPath(relativeFullPath, LOGISTICS_BASE_PATH);

    syncHostWithSubRoute(fullPath);

    // 关键修复：在 layout-app 模式下，使用 nextTick 确保路由完全更新后再触发事件
    // 这样可以确保组件能够响应式更新（菜单激活状态、tabbar 激活状态、内容区域）
    if (isUsingLayoutApp) {
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          triggerRouteChangeEvent(to);
        });
      }).catch(() => {
        // 如果导入失败，直接触发事件（兜底处理）
        triggerRouteChangeEvent(to);
      });
    } else {
      triggerRouteChangeEvent(to);
    }
  });

  // 关键：页面刷新时，主动触发一次当前路由的路由变化事件，确保标签页能够恢复
  // 等待路由就绪后再触发，确保路由信息完整
  context.router.isReady().then(() => {
    // 使用 nextTick 确保路由已经完全初始化
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        const currentRoute = context.router.currentRoute.value;
        // 只有当路由已匹配时才触发事件（避免在路由未匹配时触发）
        // 跳过首页，避免在首页显示标签
        const isHomePath = currentRoute.path === '/' || currentRoute.matched.some(m => m.meta?.isHome === true);
        if (currentRoute.matched.length > 0 && !isHomePath) {
          triggerRouteChangeEvent(currentRoute);
        }
      });
    });
  }).catch(() => {
    // 如果路由就绪失败，静默处理
  });
};

// 自定义 setupEventBridge（logistics-app 有特殊逻辑：独立运行时也监听语言切换）
const setupLogisticsEventBridge = (context: LogisticsAppContext) => {
  // 语言切换监听器需要在所有环境下都运行（包括独立运行）
  const languageListener = ((event: Event) => {
    const custom = event as CustomEvent<{ locale: string }>;
    const newLocale = custom.detail?.locale as 'zh-CN' | 'en-US';
    if (newLocale && context.i18n?.i18n?.global) {
      context.i18n.i18n.global.locale.value = newLocale;

      // 更新 Element Plus 的 locale（使用 shared-core 的统一函数）
      updateElementPlusLocale(newLocale);
    }
  }) as EventListener;

  // 只在 qiankun 环境下设置主题切换监听器
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    // 独立运行时只监听语言切换事件
    window.addEventListener('language-change', languageListener);
    context.cleanup.listeners.push(['language-change', languageListener]);
    return;
  }

  // qiankun 环境下监听所有事件
  const themeListener = ((event: Event) => {
    const custom = event as CustomEvent<{ color: string; dark: boolean }>;
    const detail = custom.detail;
    if (detail && context.theme?.theme) {
      // 检查当前颜色是否已经相同，避免不必要的调用和递归
      const currentColor = context.theme.theme.currentTheme.value?.color;
      const currentDark = context.theme.theme.isDark.value;
      // 只有当颜色或暗黑模式不同时才更新
      if (currentColor !== detail.color || currentDark !== detail.dark) {
        context.theme.theme.setThemeColor(detail.color, detail.dark);
      }
    }
  }) as EventListener;

  window.addEventListener('language-change', languageListener);
  window.addEventListener('theme-change', themeListener);

  context.cleanup.listeners.push(['language-change', languageListener], ['theme-change', themeListener]);
};

// 子应用配置（标准化模板，但使用自定义的 setupPlugins 和 setupGlobals）
const subAppOptions: SubAppOptions = {
  appId: LOGISTICS_APP_ID,
  basePath: LOGISTICS_BASE_PATH,
  domainCachePath: LOGISTICS_DOMAIN_CACHE_PATH,
  AppComponent: App,
  createRouter: createLogisticsRouter,
  setupRouter,
  setupStore,
  setupI18n,
  setupUI,
  setupPlugins: setupLogisticsPlugins,
};

export const createLogisticsApp = async (props: QiankunProps = {}): Promise<LogisticsAppContext> => {
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;

  // 独立运行或 layout-app 环境下都需要设置全局函数
  if (isStandalone || isUsingLayoutApp) {
    await setupLogisticsGlobals();
    // 关键：在独立运行模式下，确保菜单注册表已初始化
    try {
      const { getMenuRegistry } = await import('@btc/shared-components');
      const registry = getMenuRegistry();
      if (typeof window !== 'undefined' && !(window as any).__BTC_MENU_REGISTRY__) {
        (window as any).__BTC_MENU_REGISTRY__ = registry;
      }
    } catch (error) {
      // 静默失败
    }
    // 菜单和标签页从路由配置自动生成，在 mountLogisticsApp 中注册
  } else {
    // qiankun 环境下也需要初始化菜单注册表
    try {
      const { getMenuRegistry } = await import('@btc/shared-components');
      const registry = getMenuRegistry();
      if (typeof window !== 'undefined' && !(window as any).__BTC_MENU_REGISTRY__) {
        (window as any).__BTC_MENU_REGISTRY__ = registry;
      }
    } catch (error) {
      // 静默失败
    }
    // 菜单和标签页从路由配置自动生成，在 mountLogisticsApp 中注册
  }

  // 使用标准化的 createSubApp
  const context = (await createSubApp(subAppOptions, props)) as unknown as LogisticsAppContext;

  // 菜单和标签页从路由配置自动生成，在 mountLogisticsApp 中注册

  return context;
};

export const mountLogisticsApp = async (context: LogisticsAppContext, props: QiankunProps = {}) => {
  // 使用标准化的 mountSubApp
  await mountSubApp(context, subAppOptions, props);

  // 关键修复：等待路由导航完成后再设置路由同步
  // 这样可以避免路由同步覆盖正在进行的初始导航，导致组件内容被清空
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (qiankunWindow.__POWERED_BY_QIANKUN__ || isUsingLayoutApp) {
    // 等待路由准备好，并确保路由已匹配
    try {
      await context.router.isReady();

      // 使用 nextTick 确保路由已经完全初始化
      await import('vue').then(({ nextTick }) => {
        return new Promise<void>((resolve) => {
          nextTick(() => {
            // 检查路由是否已匹配，如果已匹配则继续，否则等待一段时间
            const currentRoute = context.router.currentRoute.value;
            if (currentRoute.matched.length > 0) {
              resolve();
            } else {
              // 如果路由未匹配，等待一段时间后继续（兼容性处理）
              setTimeout(() => {
                resolve();
              }, 200);
            }
          });
        });
      });
    } catch (error) {
      // 如果路由就绪失败，延迟一段时间后继续（兼容性处理）
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  // 设置路由同步、事件桥接等（使用自定义版本）
  setupLogisticsRouteSync(context);
  setupHostLocationBridge(context, LOGISTICS_APP_ID, LOGISTICS_BASE_PATH);
  setupLogisticsEventBridge(context);
  ensureCleanUrl(context);

  // 从路由配置自动生成并注册菜单（标签页由路由守卫动态添加，不需要预先注册）
  const { registerMenus } = await import('../store/menuRegistry');

  const pageRoutes = getLogisticsPageRoutes();
  const menus = generateMenusFromRoutes(pageRoutes);

  registerMenus(LOGISTICS_APP_ID, menus);

  // 设置退出登录函数（使用 useLogout composable）
  import('vue').then(({ nextTick }) => {
    nextTick(() => {
      // 关键：不立即调用 useLogout()，而是创建一个包装函数，在真正需要时才调用
      (window as any).__APP_LOGOUT__ = async () => {
        try {
          // 动态导入并调用 useLogout，此时 Vue 应用已挂载，上下文可用
          const { useLogout } = await import('../composables/useLogout');
          const { logout } = useLogout();
          await logout();
        } catch (error) {
          // 如果加载失败，使用兜底逻辑
          // useLogout failed, using fallback
          try {
            const appStorage = (window as any).__APP_STORAGE__ || (window as any).appStorage;
            if (appStorage) {
              appStorage.auth?.clear();
              appStorage.user?.clear();
            }
            deleteCookie('access_token', { path: '/' });
          } catch (e) {
            // 静默失败
          }
          // 跳转到登录页
          // 关键修复：只有 main-app（主应用）有登录页面，其他子应用都没有
          // 在生产环境子域名下，统一跳转到主域名（bellis.com.cn）的登录页面
          const hostname = window.location.hostname;
          const protocol = window.location.protocol;
          const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';
          if (isProductionSubdomain) {
            // 子域名下统一跳转到主域名的登录页面（只有主应用有登录页面）
            const { buildLogoutUrl } = await import('@btc/auth-shared/composables/redirect');
            window.location.href = buildLogoutUrl(`${protocol}//bellis.com.cn/login`);
          } else {
            window.location.href = '/login?logout=1';
          }
        }
      };
    });
  });
};

export const updateLogisticsApp = (context: LogisticsAppContext, props: QiankunProps) => {
  updateSubApp(context, props);
  // 菜单和标签页从路由配置自动生成，不需要手动更新
};

export const unmountLogisticsApp = async (context: LogisticsAppContext, props: QiankunProps = {}) => {
  // 清理全局资源（避免内存泄漏）
  if (typeof window !== 'undefined') {
    // 清理退出登录函数
    if ((window as any).__APP_LOGOUT__) {
      delete (window as any).__APP_LOGOUT__;
    }
  }

  // 清理 ECharts 实例
  try {
    const { cleanupAllECharts } = await import('@btc/shared-components');
    if (cleanupAllECharts) {
      cleanupAllECharts();
    }
  } catch (error) {
    // 静默失败
  }

  await unmountSubApp(context, props);
};

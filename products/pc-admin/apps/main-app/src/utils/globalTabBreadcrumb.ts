/**
 * 全局 Tabbar 和面包屑状态管理工具
 * 基于 qiankun 全局状态统一管理主应用和微应用的 Tab/面包屑
 */

import { getMainAppId, isRouteClosable, getMainAppHomeRoute, shouldSkipTabbar, setGlobalState as setGlobalStateSafe } from '@btc/shared-core';
import { getMenusForApp } from '../store/menuRegistry';
import { tSync } from '../i18n/getters';

// 全局状态缓存（由组件监听器更新，工具函数只读取，不注册监听器）
// 这个变量由组件中的监听器更新，避免在工具函数中注册监听器
export const globalStateCache = {
  breadcrumbList: [] as BreadcrumbItem[],
  tabbarList: [] as TabbarItem[],
  activeTabKey: '',
  currentApp: getMainAppId(),
};

// 挂载到 window，供 shared-components 访问
if (typeof window !== 'undefined') {
  (window as any).__GLOBAL_TAB_BREADCRUMB_CACHE__ = globalStateCache;
}

/**
 * 面包屑项格式
 */
export interface BreadcrumbItem {
  path: string;        // 跳转路径
  i18nKey: string;     // 国际化翻译键
  label?: string;      // 兜底文本
  icon?: string;       // 可选图标
}

/**
 * Tabbar 项格式
 */
export interface TabbarItem {
  key: string;         // 唯一标识（完整路径）
  path: string;       // 跳转路径
  i18nKey: string;     // 国际化翻译键
  label?: string;      // 兜底文本
  closable: boolean;   // 是否可关闭（从配置读取）
  appName: string;     // 所属应用（main-app / system / admin 等）
}

/**
 * 从菜单注册表中查找菜单项的图标
 */
function findMenuIconByI18nKey(i18nKey: string, app: string): string | undefined {
  const menus = getMenusForApp(app);

  // 递归查找菜单项
  function findInMenuItems(items: any[]): string | undefined {
    for (const item of items) {
      // 优先通过 labelKey 匹配（菜单注册时保存的原始 i18n key）
      if (item.labelKey === i18nKey && item.icon) {
        return item.icon;
      }
      // 递归查找子菜单
      if (item.children && item.children.length > 0) {
        const found = findInMenuItems(item.children);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  return findInMenuItems(menus);
}

/**
 * 判断 Tab 是否可关闭（已废弃，使用 isRouteClosable）
 * @deprecated 使用 isRouteClosable 替代
 */
function isTabClosable(path: string): boolean {
  return isRouteClosable(path);
}

/**
 * 添加 Tab
 * 注意：此函数只负责更新状态，从全局缓存读取当前状态（避免注册监听器）
 */
export async function addTab(tabItem: TabbarItem): Promise<void> {
  // 使用 setGlobalStateSafe（内部会等待初始化）
  // 不需要手动检查 globalState 是否初始化

  // 根据路径判断是否可关闭
  const finalTab: TabbarItem = {
    ...tabItem,
    closable: isTabClosable(tabItem.path),
  };

  // 从全局缓存获取当前状态（由组件监听器更新）
  const currentTabbarList = globalStateCache.tabbarList || [];

  // 去重逻辑
  const existTab = currentTabbarList.find((tab: TabbarItem) => tab.key === finalTab.key);
  if (existTab) {
    // 已存在则仅激活
    const success = await setGlobalStateSafe({
      activeTabKey: finalTab.key,
      currentApp: finalTab.appName,
    });
    if (!success) {
      // 如果设置失败（可能是未初始化），静默失败
      return;
    }
    return;
  }

  // 添加新 Tab
  const newTabbarList = [...currentTabbarList, finalTab];
  await setGlobalStateSafe({
    tabbarList: newTabbarList,
    activeTabKey: finalTab.key,
    currentApp: finalTab.appName,
  });
}

/**
 * 更新面包屑
 */
export async function updateBreadcrumb(breadcrumbList: BreadcrumbItem[]): Promise<void> {
  await setGlobalStateSafe({ breadcrumbList });
}

/**
 * 关闭 Tab
 * 特殊处理：关闭不可关闭的 Tab 时重定向到首页
 * @param key Tab 的唯一标识
 * @param router 可选的路由实例，用于跳转（如果未提供，使用 window.location）
 */
export async function closeTab(key: string, router?: any): Promise<void> {
  // 使用 setGlobalStateSafe（内部会等待初始化）
  // 不需要手动检查 globalState 是否初始化

  // 从全局缓存获取当前状态（由组件监听器更新）
  const currentTabbarList = globalStateCache.tabbarList || [];
  const currentActiveTabKey = globalStateCache.activeTabKey || '';

  const tabToClose = currentTabbarList.find((tab: TabbarItem) => tab.key === key);

  // 如果是不可关闭的 Tab（如概览页），关闭后重定向到首页
  const homeRoute = getMainAppHomeRoute();
  if (tabToClose && tabToClose.path === homeRoute) {
    // 移除 Tab，但立即重新添加首页 Tab
    const newTabList = currentTabbarList.filter((tab: TabbarItem) => tab.key !== key);
      await setGlobalStateSafe({
        tabbarList: newTabList,
        activeTabKey: homeRoute,
        currentApp: getMainAppId(),
      });

    // 重定向到首页
    if (router) {
      router.push(homeRoute).catch(() => {});
    } else if (typeof window !== 'undefined') {
      window.location.href = homeRoute;
    }
    return;
  }

  // 其他 Tab 正常关闭
  const newTabList = currentTabbarList.filter((tab: TabbarItem) => tab.key !== key);

  // 关闭当前激活的 Tab，自动激活最后一个
  const newActiveKey = currentActiveTabKey === key
    ? (newTabList[newTabList.length - 1]?.key || '')
    : currentActiveTabKey;

  await setGlobalStateSafe({
    tabbarList: newTabList,
    activeTabKey: newActiveKey,
  });
}

/**
 * 激活指定 Tab
 * @param key Tab 的唯一标识
 */
export async function activeTab(key: string): Promise<void> {
  // 使用 setGlobalStateSafe（内部会等待初始化）
  // 不需要手动检查 globalState 是否初始化

  // 从全局缓存获取当前状态（由组件监听器更新）
  const currentTabbarList = globalStateCache.tabbarList || [];
  const tab = currentTabbarList.find((tab: TabbarItem) => tab.key === key);

  if (tab) {
    await setGlobalStateSafe({
      activeTabKey: key,
      currentApp: tab.appName,
    });
  }
}

/**
 * 清理指定应用的所有 Tab
 * @param appName 应用名称
 */
export async function clearAppTabs(appName: string): Promise<void> {
  // 使用 setGlobalStateSafe（内部会等待初始化）
  // 不需要手动检查 globalState 是否初始化

  // 从全局缓存获取当前状态（由组件监听器更新）
  const currentTabbarList = globalStateCache.tabbarList || [];
  const newTabList = currentTabbarList.filter((tab: TabbarItem) => tab.appName !== appName);

  await setGlobalStateSafe({ tabbarList: newTabList });
}

/**
 * 响应式获取全局状态
 * 注意：此函数不再注册监听器，而是使用共享的全局状态变量
 * 监听器由 useGlobalTabBreadcrumbState composable 统一管理
 *
 * @deprecated 建议直接使用 @btc/shared-components/composables/useGlobalTabBreadcrumbState
 */
export function useGlobalTabBreadcrumb() {
  // 返回本地 ref（兼容性）
  // 实际状态由 useGlobalTabBreadcrumbState composable 管理
  const breadcrumbList = ref<BreadcrumbItem[]>([]);
  const tabbarList = ref<TabbarItem[]>([]);
  const activeTabKey = ref<string>('');
  const currentApp = ref<string>(getMainAppId());

  // 尝试从全局缓存同步初始值
  if ((window as any).__GLOBAL_TAB_BREADCRUMB_CACHE__) {
    const cache = (window as any).__GLOBAL_TAB_BREADCRUMB_CACHE__;
    breadcrumbList.value = cache.breadcrumbList || [];
    tabbarList.value = cache.tabbarList || [];
    activeTabKey.value = cache.activeTabKey || '';
    currentApp.value = cache.currentApp || getMainAppId();
  }

  return {
    breadcrumbList,
    tabbarList,
    activeTabKey,
    currentApp,
    addTab,
    updateBreadcrumb,
    closeTab,
    activeTab,
    clearAppTabs,
  };
}

/**
 * 主应用自身更新 Tab/面包屑的方法
 * 注意：此函数只负责更新状态，去重逻辑由组件监听器处理
 */
export async function updateMainAppTabBreadcrumb(route: any): Promise<void> {
  // 使用 setGlobalStateSafe（内部会等待初始化）
  // 不需要手动检查 globalState 是否初始化

  // 跳过需要跳过 Tabbar 的路由（从配置读取）
  if (shouldSkipTabbar(route.path)) {
    return;
  }

  // 检查路由 meta 中的 process 字段，如果为 false，不添加到 tabbar
  if (route.meta?.process === false) {
    return;
  }

  // 主应用自身的面包屑（从路由 meta 取）
  const rawBreadcrumbList = route.meta?.breadcrumb || route.meta?.breadcrumbs || [];
  const mainAppId = getMainAppId();

  // 处理面包屑：添加图标和翻译
  const breadcrumbList: BreadcrumbItem[] = rawBreadcrumbList.map((item: any) => {
    const i18nKey = item.i18nKey || item.labelKey || '';
    // 优先从菜单注册表中查找图标（确保与左侧菜单图标一致）
    let icon: string | undefined;
    if (i18nKey) {
      const menuIcon = findMenuIconByI18nKey(i18nKey, mainAppId);
      if (menuIcon) {
        // 确保图标格式正确：如果是 SVG 图标但没有 svg: 前缀，添加前缀
        icon = menuIcon.startsWith('svg:') ? menuIcon : `svg:${menuIcon}`;
      }
    }
    // 如果菜单注册表中没有找到图标，使用 manifest/路由 meta 中指定的图标（兜底）
    if (!icon && item.icon) {
      const itemIcon = item.icon;
      icon = itemIcon;
      // 确保图标格式正确
      if (itemIcon && !itemIcon.startsWith('svg:') && !itemIcon.includes(':')) {
        icon = `svg:${itemIcon}`;
      }
    }
    // 翻译标签：优先使用 item.label（如果已翻译），否则使用 i18nKey 翻译
    let label = item.label || '';
    if (!label && i18nKey) {
      label = tSync(i18nKey);
      // 如果翻译失败（返回 key），尝试使用原始 label
      if (label === i18nKey && item.label) {
        label = item.label;
      }
    } else if (label && label.includes('.') && i18nKey) {
      // 如果 label 是 i18n key，尝试翻译
      const translated = tSync(label);
      if (translated && translated !== label) {
        label = translated;
      }
    }

    return {
      path: item.path || '',
      i18nKey,
      label,
      icon,
    };
  });

  // 如果是首页，不添加到 Tabbar，也不显示面包屑
  if (route.meta?.isHome === true) {
    // 首页不显示面包屑
    return;
  }

  // 主应用自身的 Tab 元数据（格式和微应用完全一致）
  // 优先使用 labelKey，如果没有则使用 titleKey（与 process.add 逻辑保持一致）
  const i18nKey = route.meta?.i18nKey || route.meta?.labelKey || route.meta?.titleKey || `${route.name || 'page'}.title`;

  // 确定最终的 label：优先使用翻译后的文本，如果翻译失败则使用 meta 中的 label/title，最后使用路由名称
  let finalLabel = '';

  // 优先级 1: 尝试翻译 i18nKey
  const translatedLabel = tSync(i18nKey);
  if (translatedLabel && translatedLabel !== i18nKey) {
    finalLabel = translatedLabel;
  } else {
    // 优先级 2: 使用 meta 中的 label 或 title
    finalLabel = route.meta?.label || route.meta?.title || '';
    // 如果 meta.label 或 meta.title 也是 i18n key，尝试翻译
    if (finalLabel && finalLabel.includes('.') && finalLabel !== route.name) {
      const metaTranslated = tSync(finalLabel);
      if (metaTranslated && metaTranslated !== finalLabel) {
        finalLabel = metaTranslated;
      } else if (metaTranslated === finalLabel) {
        // 如果翻译失败，尝试使用 i18nKey 再次翻译（可能语言包已更新）
        const retryTranslated = tSync(i18nKey);
        if (retryTranslated && retryTranslated !== i18nKey) {
          finalLabel = retryTranslated;
        }
      }
    }
    // 优先级 3: 如果都失败，使用路由名称
    if (!finalLabel) {
      finalLabel = route.name || '';
    }
  }

  const mainTab: TabbarItem = {
    key: route.fullPath || route.path,
    path: route.fullPath || route.path,
    i18nKey,
    // 确保 label 是翻译后的文本，而不是 i18n key
    // 如果 finalLabel 为空或等于 i18nKey，尝试再次翻译
    label: finalLabel && finalLabel !== i18nKey ? finalLabel : (tSync(i18nKey) !== i18nKey ? tSync(i18nKey) : i18nKey),
    closable: isRouteClosable(route.path),
    appName: mainAppId, // 从配置动态获取主应用标识
  };

  // 同步更新全局状态（去重由 addTab 内部的函数式更新处理）
  await addTab(mainTab);

  if (breadcrumbList.length > 0) {
    await updateBreadcrumb(breadcrumbList);
  }
}


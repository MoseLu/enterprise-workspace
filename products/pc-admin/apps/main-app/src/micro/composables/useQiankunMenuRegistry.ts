/**
 * Qiankun 菜单和标签页注册 Composable
 * 负责处理子应用的菜单和标签页注册逻辑
 */

import { getManifestTabs, getManifestMenus } from '@btc/shared-core/manifest';
;
import { assignIconsToMenuTree } from '@btc/shared-core';
import { tSync } from '../../i18n/getters';
import { getAppBySubdomain } from '@btc/shared-core/configs/app-scanner';
import { getAppsUsingDynamicI18n } from '../apps';

// 定义类型
export type TabMeta = {
  key: string;
  title: string;
  path: string;
  i18nKey?: string;
};

export type MenuItem = {
  index: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
  // 外链跳转：指向子应用的子域名完整地址（如 https://admin.bellis.com.cn）
  // 如果设置了 externalUrl，点击菜单项时会跳转到该地址，同时保留主应用的布局
  externalUrl?: string;
  // 国际化键：用于后续查找图标和翻译
  labelKey?: string;
};

/**
 * 规范化菜单路径：在开发环境下自动添加应用前缀，生产子域环境下移除应用前缀
 * manifest 中的菜单路径已经移除了应用前缀，所以：
 * - 开发环境（qiankun模式）：需要添加前缀 `/admin/xxx`
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
  // 主应用（main）是唯一的主应用，不需要添加前缀
  if (appName === 'main') {
    return normalizedPath;
  }

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
  // 在生产环境子域名下，自动移除应用前缀
  // 注意：title 字段存储原始的 i18n key 或已翻译的文本，labelKey 字段保存原始的 i18n key 用于响应式翻译
  const convertToMenuItem = (item: any): MenuItem => {
    const normalizedIndex = normalizeMenuPath(item.index, appName);

    // 保存原始的 labelKey（用于后续查找图标和响应式翻译）
    // 优先使用 item.labelKey，如果不存在则使用 item.title（可能是 i18n key）
    const labelKey = (item.labelKey && typeof item.labelKey === 'string' && item.labelKey.includes('.'))
      ? item.labelKey
      : (item.title && typeof item.title === 'string' && item.title.includes('.'))
        ? item.title
        : undefined;

    // title 字段：如果 labelKey 存在，尝试翻译；否则使用原始值
    // 注意：即使翻译失败，也保存原始的 key，这样在渲染时可以通过 labelKey 进行响应式翻译
    let title: string;
    if (labelKey) {
      // 优先使用主应用的 i18n 实例进行翻译（确保能访问到已合并的语言包）
      let translated = labelKey;
      const mainI18n = typeof window !== 'undefined' ? (window as any).__MAIN_APP_I18N__ : null;

      if (mainI18n && mainI18n.global) {
        const currentLocale = mainI18n.global.locale.value as 'zh-CN' | 'en-US';
        const messages = mainI18n.global.getLocaleMessage(currentLocale);

        // 直接访问消息对象，确保能访问到已合并的语言包
        if (labelKey in messages) {
          const value = messages[labelKey];
          if (typeof value === 'string') {
            translated = value;
          } else if (typeof value === 'function') {
            try {
              translated = value({ normalize: (arr: any[]) => arr[0] });
            } catch {
              // 如果函数调用失败，继续使用 tSync
            }
          }
        }

        // 如果直接访问失败，使用 tSync（它会使用主应用的 i18n 实例）
        if (translated === labelKey) {
          translated = tSync(labelKey);
        }
      } else {
        // 如果主应用 i18n 实例不存在，使用 tSync
        translated = tSync(labelKey);
      }

      // 如果翻译成功（返回值不是 key），使用翻译结果；否则保存原始的 key
      title = translated !== labelKey ? translated : labelKey;

      // 开发环境调试：如果翻译失败，检查主应用 i18n 实例
      // 关键：对于使用动态国际化的应用，在 globalState 消息到达前，key 可能暂时不存在
      // 这种情况下不应该打印警告，因为 key 会在 globalState 消息到达后可用
      if (import.meta.env.DEV && translated === labelKey && labelKey.includes('.')) {
        if (mainI18n) {
          const currentLocale = mainI18n.global.locale.value as 'zh-CN' | 'en-US';
          const messages = mainI18n.global.getLocaleMessage(currentLocale);
          const hasKey = labelKey in messages;

          // 检查是否正在等待 globalState 消息
          // 关键：对于使用动态国际化的应用，在消息合并到主应用 i18n 实例前，key 可能暂时不存在
          // 这种情况下不应该打印警告，因为 key 会在消息合并后可用
          let isWaitingForGlobalState = false;
          try {
            const currentAppId = (window as any).__CURRENT_REGISTERING_APP_ID__ || appName;
            const appsUsingDynamicI18n = getAppsUsingDynamicI18n();

            // 如果当前应用使用动态国际化
            if (currentAppId && appsUsingDynamicI18n.includes(currentAppId)) {
              // 关键：只要应用使用动态国际化，且 key 不在主应用 i18n 中，就认为正在等待
              // 即使 globalState 中已经有消息，也可能还没有合并到主应用 i18n 实例
              // 所以直接认为正在等待，不打印警告
              isWaitingForGlobalState = true;
            }
          } catch (error) {
            // 忽略错误
          }

          if (!hasKey && !isWaitingForGlobalState) {
            console.warn(`[MenuRegistry] ⚠️ Translation key "${labelKey}" not found in main app i18n (${currentLocale}):`, {
              labelKey,
              hasKey,
              totalKeys: Object.keys(messages).length,
              sampleKeys: Object.keys(messages).filter(k => k.startsWith(labelKey.split('.')[0])).slice(0, 5),
            });
          } else if (!hasKey && isWaitingForGlobalState) {
            // 正在等待 globalState 消息，不打印警告（key 可能会在消息到达后可用）
          } else if (hasKey) {
            console.warn(`[MenuRegistry] ⚠️ Translation key "${labelKey}" exists but translation failed:`, {
              labelKey,
              value: messages[labelKey],
              valueType: typeof messages[labelKey],
            });
          }
        }
      }
    } else {
      // 如果没有 labelKey 或不是 i18n key，直接使用 label、title 或 index
      title = item.label ?? item.title ?? normalizedIndex;
    }

    const menuItem: MenuItem = {
      index: normalizedIndex,
      title,
      icon: item.icon,
      labelKey, // 保存原始的 labelKey，用于后续查找图标和响应式翻译
      children: item.children && item.children.length > 0
        ? item.children.map(convertToMenuItem)
        : undefined,
    };

    return menuItem;
  };

  // 转换为 MenuItem 格式（不需要再次调用 assignIconsToMenuTree，因为已经处理了所有层级）
  const normalizedMenus = itemsWithIcons.map(convertToMenuItem);

  return normalizedMenus;
}

// 深度比较两个菜单数组是否相同
function menusEqual(menus1: MenuItem[], menus2: MenuItem[]): boolean {
  if (menus1.length !== menus2.length) {
    return false;
  }

  for (let i = 0; i < menus1.length; i++) {
    const item1 = menus1[i];
    const item2 = menus2[i];

    // 如果任一项目为 undefined，不相等
    if (!item1 || !item2) {
      return false;
    }

    // 比较所有字段，包括 externalUrl
    if (
      item1.index !== item2.index ||
      item1.title !== item2.title ||
      item1.icon !== item2.icon ||
      item1.externalUrl !== item2.externalUrl
    ) {
      return false;
    }

    // 递归比较子菜单
    if (item1.children && item2.children) {
      if (!menusEqual(item1.children, item2.children)) {
        return false;
      }
    } else if (item1.children || item2.children) {
      return false;
    }
  }

  return true;
}

/**
 * 注册应用的标签页
 */
export async function registerManifestTabsForApp(appName: string): Promise<void> {
  const tabs = getManifestTabs(appName);
  if (!tabs.length) {
    return Promise.resolve();
  }

  // 动态导入避免循环依赖
  const { registerTabs } = await import('../../store/tabRegistry');

  const normalizedTabs: TabMeta[] = tabs.map((tab: any) => {
    const result: TabMeta = {
      key: tab.key,
      title: tab.labelKey ?? tab.label ?? tab.path,
      path: tab.path,
    };
    // 明确处理可选属性的 undefined（exactOptionalPropertyTypes）
    if (tab.labelKey !== undefined) {
      result.i18nKey = tab.labelKey;
    }
    return result;
  });

  registerTabs(appName, normalizedTabs);
  return Promise.resolve();
}

/**
 * 注册应用的菜单
 */
export async function registerManifestMenusForApp(appName: string): Promise<void> {
  // 将当前应用ID存储到全局，供 convertToMenuItem 使用
  if (typeof window !== 'undefined') {
    (window as any).__CURRENT_REGISTERING_APP_ID__ = appName;
  }
  const menus = getManifestMenus(appName);

  // 动态导入避免循环依赖
  const { getMenusForApp, registerMenus } = await import('../../store/menuRegistry');

  if (!menus.length) {
    // 如果菜单为空，且当前应用已经有菜单，则保留现有菜单，避免清空
    // 这对于系统域特别重要，因为系统域是默认应用，不应该被清空
    const existingMenus = getMenusForApp(appName);
    if (existingMenus.length > 0) {
      // 保留现有菜单，不进行清空操作
      return Promise.resolve();
    }
    // 如果既没有新菜单，也没有现有菜单，则清空（正常情况）
    return Promise.resolve();
  }

  // 将 manifest 菜单格式转换为 MenuItem 格式（递归处理任意深度）
  // 传递 appName 用于域内图标去重
  const normalizedMenus: MenuItem[] = normalizeMenuItems(menus, appName);

  // 获取现有菜单
  const existingMenus = getMenusForApp(appName);

  // 如果菜单内容相同且不为空，则跳过更新，避免触发不必要的响应式更新
  // 这样可以避免菜单在路由切换时不必要的刷新
  if (existingMenus.length > 0 && menusEqual(existingMenus, normalizedMenus)) {
    return Promise.resolve();
  }

  // 菜单内容不同或为空，需要重新注册
  // 注意：即使菜单内容相同，如果现有菜单为空，也需要重新注册（可能被 clearMenusExcept 清空了）
  registerMenus(appName, normalizedMenus);
  return Promise.resolve();
}


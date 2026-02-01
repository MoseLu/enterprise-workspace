import { getAllManifests, getManifestMenus } from '@btc/shared-core/manifest';
import { tSync } from '@/i18n/getters';
import { useI18n } from '@btc/shared-core';

/**
 * 应用数据项
 */
export interface AppDataItem {
  appId: string;
  appName: string;
  basePath: string;
  nameKey?: string;
  appNameKey?: string; // app-name 字段
  menus: MenuItem[];
}

/**
 * 菜单项（一级菜单）
 */
export interface MenuItem {
  index: string;
  labelKey?: string;
  label?: string;
  icon?: string;
  path?: string; // 菜单对应的路径（如果有）
  children?: MenuItem[];
}

/**
 * 获取所有应用数据（排除 admin-app、operations-app 和 main-app）
 * 注意：主应用不参与概览页面显示
 */
export function getAllAppData(): AppDataItem[] {
  const manifests = getAllManifests();
  const appDataList: AppDataItem[] = [];

  // 过滤掉 admin-app（管理应用）、operations-app（运维应用）和 main-app（主应用）
  // 注意：system-app（系统应用）需要保留
  const excludedApps = ['admin', 'operations', 'main'];

  Object.entries(manifests).forEach(([appId, manifest]) => {
    if (excludedApps.includes(appId)) {
      return;
    }

    // 获取一级菜单（包含子菜单）
    const menus = getManifestMenus(appId);

    // 如果没有菜单，跳过该应用
    if (menus.length === 0) {
      return;
    }

    const topLevelMenus: MenuItem[] = menus.map((menu) => {
      // 如果 index 是路径格式（以 / 开头），则作为路径
      const path = menu.index.startsWith('/') ? menu.index : undefined;

      // 递归处理子菜单，确保 labelKey 被正确传递
      const processChildren = (children: any[]): MenuItem[] => {
        return children.map((child: any) => ({
          index: child.index,
          ...(child.labelKey && { labelKey: child.labelKey }),
          ...(child.label && { label: child.label }),
          ...(child.icon && { icon: child.icon }),
          ...(child.path && { path: child.path }),
          ...(child.children && child.children.length > 0 && { children: processChildren(child.children) }),
        }));
      };

      return {
        index: menu.index,
        ...(menu.labelKey && { labelKey: menu.labelKey }),
        ...(menu.label && { label: menu.label }),
        ...(menu.icon && { icon: menu.icon }),
        ...(path && { path }),
        // 处理子菜单，确保 labelKey 被正确传递
        ...(menu.children && menu.children.length > 0 && { children: processChildren(menu.children) }),
      };
    });

    appDataList.push({
      appId,
      appName: manifest.app.id,
      basePath: manifest.app.basePath || `/${appId}`,
      ...(manifest.app.nameKey && { nameKey: manifest.app.nameKey }),
      ...(manifest.app['app-name'] && { appNameKey: manifest.app['app-name'] }),
      menus: topLevelMenus,
    });
  });

  return appDataList;
}

/**
 * 获取菜单的显示标签（优先使用 labelKey 翻译，否则使用 label）
 * 注意：这个函数在概览页面中使用，概览页面已经预加载了所有子应用的国际化数据
 * 如果翻译失败，可能是国际化数据还未加载完成，会回退到 label 或 index
 */
export function getMenuLabel(menu: MenuItem): string {
  if (menu.labelKey) {
    // 优先尝试从主应用的 i18n 实例获取翻译（包含预加载的子应用数据）
    try {
      const mainI18n = typeof window !== 'undefined' ? (window as any).__MAIN_APP_I18N__ : null;
      if (mainI18n && mainI18n.global) {
        const currentLocale = mainI18n.global.locale.value as 'zh-CN' | 'en-US';
        const messages = mainI18n.global.getLocaleMessage(currentLocale);
        
        // 直接访问消息对象，确保能访问到已合并的语言包
        if (menu.labelKey in messages) {
          const value = messages[menu.labelKey];
          if (typeof value === 'string') {
            return value;
          } else if (typeof value === 'function') {
            try {
              return value({ normalize: (arr: any[]) => arr[0] });
            } catch {
              // 如果函数调用失败，继续使用 tSync
            }
          }
        }
        
        // 如果直接访问失败，使用 tSync（它会使用主应用的 i18n 实例）
        const translated = tSync(menu.labelKey);
        if (translated !== menu.labelKey) {
          return translated;
        }
      } else {
        // 如果主应用 i18n 实例不存在，使用 tSync
        const translated = tSync(menu.labelKey);
        if (translated !== menu.labelKey) {
          return translated;
        }
      }
    } catch (error) {
      // 如果出错，继续使用 tSync
      const translated = tSync(menu.labelKey);
      if (translated !== menu.labelKey) {
        return translated;
      }
    }
  }
  return menu.label || menu.index;
}

/**
 * 获取应用的显示名称
 * 优先级：
 * 1. 使用 app-name 字段翻译（统一的应用名称字段）
 * 2. 使用 domain.type.{appId} 翻译（后备方案）
 * 3. 使用 appId 作为后备
 */
export function getAppDisplayName(appData: AppDataItem): string {
  // 优先使用 app-name 字段翻译
  if (appData.appNameKey) {
    const translated = tSync(appData.appNameKey);
    if (translated !== appData.appNameKey) {
      return translated;
    }
  }

  // 如果 app-name 不存在或翻译失败，使用统一的 domain.type.{appId} 格式
  const domainTypeKey = `domain.type.${appData.appId}`;
  const domainTypeTranslated = tSync(domainTypeKey);
  if (domainTypeTranslated !== domainTypeKey) {
    return domainTypeTranslated;
  }

  // 最后使用 appId 作为后备
  return appData.appName;
}

/**
 * 构建菜单的完整路径
 */
export function buildMenuPath(appData: AppDataItem, menu: MenuItem): string {
  // 如果菜单有 path，直接使用
  if (menu.path) {
    // 如果 path 是绝对路径，需要加上 basePath
    if (menu.path.startsWith('/')) {
      // 如果 basePath 是 /，则直接使用 path
      if (appData.basePath === '/') {
        return menu.path;
      }
      // 否则需要判断 path 是否已经包含 basePath
      // 对于 system-app，basePath 是 /，path 应该直接使用
      // 对于其他应用，path 应该相对于 basePath
      // 但由于 manifest 中的路径可能是相对于应用根路径的，我们需要拼接
      return `${appData.basePath}${menu.path}`;
    }
    return `${appData.basePath}/${menu.path}`;
  }

  // 如果 index 是路径格式（以 / 开头），使用 index 作为路径
  if (menu.index.startsWith('/')) {
    return `${appData.basePath}${menu.index}`;
  }

  // 否则使用 index 作为路径的一部分
  return `${appData.basePath}/${menu.index}`;
}


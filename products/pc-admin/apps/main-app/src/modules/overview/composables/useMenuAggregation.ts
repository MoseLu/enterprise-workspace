/**
 * 菜单聚合服务 Composable
 * 实现阿里云控制台风格的菜单聚合逻辑：
 * - 主应用自有菜单（menuConfig.global）
 * - 子应用菜单挂载到主应用的挂载点（menuConfig.mountPoints）
 * - 权限过滤
 * - 排序处理
 */
;

import { computed, ref } from 'vue';
import { getAllManifests, getManifest, type MenuConfigItem, type MenuConfig, logger } from '@btc/shared-core/manifest';
import { tSync } from '@/i18n/getters';

/**
 * 概览菜单项（聚合后的菜单结构）
 */
export interface OverviewMenuCategory {
  id: string;
  title: string;
  labelKey?: string;
  icon?: string;
  sort: number;
  description?: string;
  showInOverview: boolean;
  children: OverviewMenuModule[];
}

export interface OverviewMenuModule {
  id: string;
  title: string;
  labelKey?: string;
  icon?: string;
  sort: number;
  hot?: boolean;
  showInOverview: boolean;
  appId?: string; // 来源应用ID（用于路由跳转）
  basePath?: string; // 应用基础路径
  children: OverviewMenuItem[];
}

export interface OverviewMenuItem {
  id: string;
  title: string;
  labelKey?: string;
  path: string;
  sort: number;
  showInOverview: boolean;
  appId?: string; // 来源应用ID
  basePath?: string; // 应用基础路径
}

/**
 * 菜单聚合服务
 */
export function useMenuAggregation() {
  const overviewMenus = ref<OverviewMenuCategory[]>([]);
  const isLoading = ref(false);
  
  // 确保 overviewMenus 始终是一个响应式数组，避免 undefined 错误
  if (!overviewMenus.value) {
    overviewMenus.value = [];
  }

  /**
   * 加载并聚合所有菜单数据
   */
  async function loadAllMenus() {
    isLoading.value = true;
    try {
      // 1. 获取主应用 manifest
      const mainManifest = getManifest('main');
      if (!mainManifest) {
        console.warn('[useMenuAggregation] 主应用 manifest 不存在');
        overviewMenus.value = [];
        return;
      }

      // 检查 menuConfig 是否存在
      if (!mainManifest.menuConfig) {
        console.warn('[useMenuAggregation] 主应用 manifest 缺少 menuConfig');
        overviewMenus.value = [];
        return;
      }

      // 2. 获取所有子应用 manifest
      const allManifests = getAllManifests();
      const subAppManifests = Object.entries(allManifests)
        .filter(([appId]) => appId !== 'main' && appId !== 'admin' && appId !== 'operations')
        .map(([, manifest]) => manifest);

      // 3. 聚合菜单
      const merged = mergeMenus(mainManifest.menuConfig, subAppManifests);
      
      if (import.meta.env.DEV) {
        console.info('[useMenuAggregation] 菜单加载完成', {
          categories: merged.length,
          menuConfig: mainManifest.menuConfig,
        });
      }

      // 4. 权限过滤（暂时跳过，后续可扩展）
      // const filtered = filterMenuByPermission(merged);

      // 5. 排序并设置
      overviewMenus.value = merged.sort((a, b) => a.sort - b.sort);
    } catch (error) {
      logger.error('[useMenuAggregation] 加载菜单失败:', error);
      overviewMenus.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 核心：按挂载规则聚合菜单
   */
  function mergeMenus(
    mainMenuConfig: MenuConfig | undefined,
    subAppManifests: Array<{ menuConfig?: MenuConfig; app: { id: string; basePath?: string } }>
  ): OverviewMenuCategory[] {
    if (!mainMenuConfig) {
      return [];
    }

    const merged: OverviewMenuCategory[] = [];

    // 1. 处理主应用自有全局菜单（menuConfig.global）
    if (mainMenuConfig.global && mainMenuConfig.global.length > 0) {
      mainMenuConfig.global.forEach((category) => {
        if (category.showInOverview !== false) {
          const categoryItem: OverviewMenuCategory = {
            id: category.id,
            title: category.title || (category.labelKey ? tSync(category.labelKey) : category.id),
            labelKey: category.labelKey,
            icon: category.icon,
            sort: category.sort ?? 999,
            description: category.description,
            showInOverview: category.showInOverview !== false,
            children: convertMenuChildren(category.children || [], 'main', '/'),
          };
          merged.push(categoryItem);
        }
      });
    }

    // 2. 处理挂载点（menuConfig.mountPoints）
    if (mainMenuConfig.mountPoints && mainMenuConfig.mountPoints.length > 0) {
      mainMenuConfig.mountPoints.forEach((mountPoint) => {
        if (mountPoint.showInOverview !== false) {
          const mountPointItem: OverviewMenuCategory = {
            id: mountPoint.id,
            title: mountPoint.title || (mountPoint.labelKey ? tSync(mountPoint.labelKey) : mountPoint.id),
            labelKey: mountPoint.labelKey,
            icon: mountPoint.icon,
            sort: mountPoint.sort ?? 999,
            description: mountPoint.description,
            showInOverview: mountPoint.showInOverview !== false,
            children: [],
          };

          // 遍历子应用菜单，挂载到对应分类下
          subAppManifests.forEach((subManifest) => {
            if (subManifest.menuConfig?.module) {
              subManifest.menuConfig.module.forEach((subMenu) => {
                // 检查是否应该挂载到此挂载点（使用 mountPoint.id 作为挂载点标识）
                if (subMenu.mountTo === mountPointItem.id && subMenu.showInOverview !== false) {
                  const moduleItem: OverviewMenuModule = {
                    id: subMenu.id,
                    title: subMenu.title || (subMenu.labelKey ? tSync(subMenu.labelKey) : subMenu.id),
                    labelKey: subMenu.labelKey,
                    icon: subMenu.icon,
                    sort: subMenu.sort ?? 999,
                    hot: subMenu.hot,
                    showInOverview: subMenu.showInOverview !== false,
                    appId: subManifest.app.id,
                    basePath: subManifest.app.basePath || `/${subManifest.app.id}`,
                    children: convertMenuChildren(subMenu.children || [], subManifest.app.id, subManifest.app.basePath || `/${subManifest.app.id}`),
                  };
                  mountPointItem.children.push(moduleItem);
                }
              });
            }
          });

          // 按 sort 排序子模块
          mountPointItem.children.sort((a, b) => a.sort - b.sort);

          merged.push(mountPointItem);
        }
      });
    }

    return merged;
  }

  /**
   * 转换菜单子项（返回模块数组）
   */
  function convertMenuChildren(
    children: MenuConfigItem[],
    appId: string,
    basePath: string
  ): OverviewMenuModule[] {
    return children
      .filter((item) => item.showInOverview !== false)
      .map((item) => {
        const title = item.title || (item.labelKey ? tSync(item.labelKey) : item.id);
        const sort = item.sort ?? 999;

        // 如果有 children，说明是模块级别
        if (item.children && item.children.length > 0) {
          return {
            id: item.id,
            title,
            labelKey: item.labelKey,
            icon: item.icon,
            sort,
            hot: item.hot,
            showInOverview: item.showInOverview !== false,
            appId,
            basePath,
            children: item.children
              .filter((child) => child.showInOverview !== false)
              .map((child) => ({
                id: child.id,
                title: child.title || (child.labelKey ? tSync(child.labelKey) : child.id),
                labelKey: child.labelKey,
                path: buildMenuItemPath(child.path || child.id, basePath),
                sort: child.sort ?? 999,
                showInOverview: child.showInOverview !== false,
                appId,
                basePath,
              }))
              .sort((a, b) => a.sort - b.sort),
          } as OverviewMenuModule;
        } else {
          // 否则是菜单项级别，包装成模块（只有一个子项）
          return {
            id: item.id,
            title,
            labelKey: item.labelKey,
            icon: item.icon,
            sort,
            hot: item.hot,
            showInOverview: item.showInOverview !== false,
            appId,
            basePath,
            children: [
              {
                id: item.id,
                title,
                labelKey: item.labelKey,
                path: buildMenuItemPath(item.path || item.id, basePath),
                sort,
                showInOverview: item.showInOverview !== false,
                appId,
                basePath,
              },
            ],
          } as OverviewMenuModule;
        }
      })
      .sort((a, b) => a.sort - b.sort);
  }

  /**
   * 构建菜单项路径
   */
  function buildMenuItemPath(path: string, basePath: string): string {
    if (!path) return basePath;
    if (path.startsWith('/')) {
      return basePath === '/' ? path : `${basePath}${path}`;
    }
    return `${basePath}/${path}`;
  }

  /**
   * 权限过滤（递归过滤无权限的菜单节点）
   * 暂时跳过，后续可扩展
   */
  function filterMenuByPermission(menus: OverviewMenuCategory[]): OverviewMenuCategory[] {
    // TODO: 实现权限过滤逻辑
    // const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
    return menus;
  }

  /**
   * 搜索菜单
   */
  function searchMenu(keyword: string): OverviewMenuCategory[] {
    if (!keyword) return overviewMenus.value;

    return overviewMenus.value
      .map((category) => {
        const filteredChildren = category.children.filter((module) => {
          // 搜索模块标题或功能项标题
          const matchModule = module.title.toLowerCase().includes(keyword.toLowerCase());
          const matchItem = module.children.some((item) =>
            item.title.toLowerCase().includes(keyword.toLowerCase())
          );

          if (matchModule || matchItem) {
            // 如果匹配，过滤子项
            if (matchItem) {
              module.children = module.children.filter((item) =>
                item.title.toLowerCase().includes(keyword.toLowerCase())
              );
            }
            return true;
          }
          return false;
        });

        return { ...category, children: filteredChildren };
      })
      .filter((category) => category.children.length > 0);
  }

  return {
    overviewMenus: computed(() => overviewMenus.value),
    isLoading: computed(() => isLoading.value),
    loadAllMenus,
    searchMenu,
  };
}


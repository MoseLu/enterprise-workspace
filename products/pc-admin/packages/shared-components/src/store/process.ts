import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAppBySubdomain, getSubApps } from '@btc/shared-core/configs/app-scanner';
import { getAppIdFromPath } from '@btc/shared-core';

export interface ProcessItem {
  path: string;
  fullPath: string;
  name?: string;
  meta: {
    label?: string;
    labelKey?: string;
    titleKey?: string;
    hostLabelKey?: string;
    title?: string;
    breadcrumbs?: any[];
    keepAlive?: boolean;
    isHome?: boolean;
    process?: boolean;
  };
  active?: boolean;
  app?: string; // 添加 app 字段，用于标识标签所属的应用
}

/**
 * 从路径获取当前应用名称
 * 注意：这个函数需要由使用共享布局的应用提供，通过 provide/inject 传递
 * 或者使用全局函数
 */
export function getCurrentAppFromPath(path: string): string {
  // 优先检查子域名（生产环境的关键识别方式，使用应用扫描器）
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // 关键：优先通过子域名识别应用（生产环境的主要方式）
    const appBySubdomain = getAppBySubdomain(hostname);
    if (appBySubdomain) {
      return appBySubdomain.id;
    }
  }

  // 使用统一的工具函数获取应用标识（优先从 app-scanner，回退到路径推断）
  // 这个函数已经处理了主应用路由优先、排除公开应用的逻辑
  return getAppIdFromPath(path);
}

/**
 * 页面标签（Process）Store
 */
// 最大标签数量限制（防止内存泄漏）
const MAX_TABS = 50;

export const useProcessStore = defineStore('process', () => {
  const list = ref<ProcessItem[]>([]);
  const pinned = ref<string[]>([]);

  const isPinned = (fullPath: string) => pinned.value.includes(fullPath);

  const reorderTabs = () => {
    if (!list.value.length || !pinned.value.length) return;
    const pinnedSet = new Set(pinned.value);

    const pinnedTabs: ProcessItem[] = [];
    pinned.value.forEach((path) => {
      const tab = list.value.find((item) => item.fullPath === path);
      if (tab) {
        pinnedTabs.push(tab);
      }
    });

    const otherTabs = list.value.filter((tab) => !pinnedSet.has(tab.fullPath));

    list.value = [...pinnedTabs, ...otherTabs];
  };

  const pin = (fullPath: string) => {
    if (!isPinned(fullPath)) {
      pinned.value.push(fullPath);
      reorderTabs();
    }
  };

  const unpin = (fullPath: string) => {
    pinned.value = pinned.value.filter((path) => path !== fullPath);
    reorderTabs();
  };

  const togglePin = (fullPath: string) => {
    if (isPinned(fullPath)) {
      unpin(fullPath);
    } else {
      pin(fullPath);
    }
  };

  const findIndex = (predicate: (tab: ProcessItem) => boolean) =>
    list.value.findIndex(predicate);

  const removeByFullPaths = (paths: Set<string>) => {
    if (!paths.size) return false;
    let changed = false;
    list.value = list.value.filter((tab) => {
      if (paths.has(tab.fullPath)) {
        changed = true;
        return false;
      }
      return true;
    });
    if (!changed) return false;
    if (paths.size) {
      pinned.value = pinned.value.filter((path) => !paths.has(path));
    }
    reorderTabs();
    return true;
  };

  const collectPaths = (tabs: ProcessItem[], app?: string, exclude?: Set<string>) => {
    const result = new Set<string>();
    tabs.forEach((tab) => {
      if (app && tab.app !== app) return;
      if (isPinned(tab.fullPath)) return;
      if (exclude && exclude.has(tab.fullPath)) return;
      result.add(tab.fullPath);
    });
    return result;
  };

  const closeLeft = (fullPath: string, app: string) => {
    const targetIndex = findIndex((tab) => tab.fullPath === fullPath);
    if (targetIndex <= 0) return false;
    const leftTabs = list.value.slice(0, targetIndex);
    const paths = collectPaths(leftTabs, app);
    return removeByFullPaths(paths);
  };

  const closeRight = (fullPath: string, app: string) => {
    const targetIndex = findIndex((tab) => tab.fullPath === fullPath);
    if (targetIndex === -1) return false;
    const rightTabs = list.value.slice(targetIndex + 1);
    const paths = collectPaths(rightTabs, app);
    return removeByFullPaths(paths);
  };

  const closeOthers = (fullPath: string, app: string) => {
    const targetIndex = findIndex((tab) => tab.fullPath === fullPath);
    if (targetIndex === -1) return false;
    const exclude = new Set<string>([fullPath]);
    const otherTabs = list.value.filter((tab) => tab.fullPath !== fullPath);
    const paths = collectPaths(otherTabs, app, exclude);
    return removeByFullPaths(paths);
  };

  const closeAll = (app: string) => {
    const appTabs = list.value.filter((tab) => tab.app === app);
    const paths = collectPaths(appTabs, app);
    return removeByFullPaths(paths);
  };

  const syncPinned = () => {
    const exists = new Set(list.value.map((tab) => tab.fullPath));
    pinned.value = pinned.value.filter((path) => exists.has(path));
    reorderTabs();
  };

  /**
   * 添加标签
   */
  function add(data: ProcessItem) {
    if (!data.meta) {
      data.meta = {};
    }

    // 关键：如果没有提供 app 字段，自动根据 path 或 fullPath 推断
    if (!data.app) {
      // 优先使用 fullPath（完整路径，如 /finance/inventory/result）
      // 如果没有 fullPath，使用 path
      const pathToCheck = data.fullPath || data.path;
      data.app = getCurrentAppFromPath(pathToCheck);
    }

    // 检查是否是首页（使用全局配置）
    let isHome = data.meta?.isHome === true;

    if (!isHome) {
      const path = data.path || data.fullPath || '';

      // 生产环境子域名判断
      if (path === '/' && typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const appBySubdomain = getAppBySubdomain(hostname);
        if (appBySubdomain && appBySubdomain.type === 'sub') {
          isHome = true;
        }
      }

      // 开发/预览环境：检查路径是否匹配任何子应用的 pathPrefix
      if (!isHome) {
        const subApps = getSubApps();
        for (const app of subApps) {
          const normalizedPathPrefix = app.pathPrefix.endsWith('/')
            ? app.pathPrefix.slice(0, -1)
            : app.pathPrefix;
          const normalizedPath = path.endsWith('/') && path !== '/'
            ? path.slice(0, -1)
            : path;

          if (normalizedPath === normalizedPathPrefix) {
            isHome = true;
            break;
          }
        }
      }

      // 检查是否是主应用首页（系统应用）
      if (!isHome && path === '/') {
        // 如果不在子域名下，且路径是 /，可能是主应用首页
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          const appBySubdomain = getAppBySubdomain(hostname);
          // 如果没有通过子域名识别到子应用，且路径是 /，则可能是主应用首页
          if (!appBySubdomain || appBySubdomain.type !== 'sub') {
            isHome = true;
          }
        } else {
          // SSR 环境，如果路径是 /，假设是主应用首页
          isHome = true;
        }
      }
    }

    // 如果不是首页且允许显示标签
    if (!isHome && data.meta?.process !== false) {
      // 关键：使用 fullPath 或 path 来查找已存在的标签
      // 在 layout-app 环境下，fullPath 可能是完整路径（如 /finance/inventory/result）
      // 而 path 可能是子应用内部路径（如 /inventory/result）
      const index = list.value.findIndex((e) =>
        e.fullPath === data.fullPath ||
        e.path === data.path ||
        (data.fullPath && e.fullPath === data.fullPath) ||
        (data.path && e.path === data.path)
      );

      // 关键优化：如果目标标签已经是激活状态且路径相同，直接返回，避免不必要的更新导致闪烁
      if (index >= 0) {
        const existingTab = list.value[index];
        if (existingTab.active &&
            (existingTab.fullPath === data.fullPath || existingTab.path === data.path)) {
          // 标签已经是激活状态且路径相同，不需要更新
          return;
        }
      }

      // 将所有标签设为非激活状态（仅在需要更新时执行）
      list.value.forEach((e) => {
        e.active = false;
      });

      if (index < 0) {
        // 添加新标签
        list.value.push({
          ...data,
          active: true,
        });

        // 关键：限制标签数量，防止内存泄漏（保留固定的标签，移除最旧的非固定标签）
        if (list.value.length > MAX_TABS) {
          const pinnedSet = new Set(pinned.value);
          // 分离固定和非固定标签
          const pinnedTabs = list.value.filter(tab => pinnedSet.has(tab.fullPath));
          const unpinnedTabs = list.value.filter(tab => !pinnedSet.has(tab.fullPath));

          // 保留所有固定标签，只限制非固定标签数量
          const maxUnpinnedTabs = MAX_TABS - pinnedTabs.length;
          if (unpinnedTabs.length > maxUnpinnedTabs) {
            // 移除最旧的非固定标签（保留最新的）
            const tabsToKeep = unpinnedTabs.slice(-maxUnpinnedTabs);
            list.value = [...pinnedTabs, ...tabsToKeep];
          }
        }
      } else {
        // 激活已存在的标签
        list.value[index] = {
          ...list.value[index],
          ...data,
          active: true,
        };
      }
    }
  }

  /**
   * 关闭当前标签
   */
  function close() {
    const index = list.value.findIndex((e) => e.active);

    if (index > -1) {
      list.value.splice(index, 1);
    }
  }

  /**
   * 移除指定标签
   */
  function remove(index: number) {
    list.value.splice(index, 1);
  }

  /**
   * 设置标签列表
   */
  function set(data: ProcessItem[]) {
    list.value = data;
  }

  /**
   * 清空所有标签
   */
  function clear() {
    list.value = [];
  }

  /**
   * 设置标题
   */
  function setTitle(title: string) {
    const item = list.value.find((e) => e.active);

    if (item) {
      item.meta.label = title;
    }
  }

  return {
    list,
    add,
    remove,
    close,
    set,
    clear,
    setTitle,
    isPinned,
    togglePin,
    closeLeft,
    closeRight,
    closeOthers,
    closeAll,
    syncPinned,
  };
});



;
import { getActiveApp, resolveTabMeta } from './tabRegistry';

export interface ProcessItem {
  path: string;
  fullPath: string;
  name?: string;
  meta: {
    label?: string;
    labelKey?: string;
    title?: string;
    titleKey?: string;
    keepAlive?: boolean;
    isHome?: boolean;
    process?: boolean;
  };
  active?: boolean;
  app?: string; // 标签所属应用
}

/**
 * 获取当前应用名称（使用统一的 tabRegistry）
 */
export function getCurrentAppFromPath(path: string): string {
  return getActiveApp(path);
}

/**
 * 页面标签（Process）Store
 */
// 最大标签数量限制（防止内存泄漏）
const MAX_TABS = 50;

export const useProcessStore = defineStore('process', () => {
  const list = ref<ProcessItem[]>([]); // 所有标签
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

  const closeByFullPath = (fullPath: string) => {
    if (!fullPath || isPinned(fullPath)) return false;
    const paths = new Set<string>([fullPath]);
    return removeByFullPaths(paths);
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
   * 添加标签（通过 tabRegistry 解析元数据）
   */
  function add(data: ProcessItem) {
    // 跳过个人信息页面（不在菜单中，不需要添加到标签页）
    if (data.path === '/profile') {
      return;
    }

    // 确定标签所属应用
    const app = getCurrentAppFromPath(data.path);

    // 解析 Tab 元数据
    let tabMeta = resolveTabMeta(data.path);

    // 如果解析失败，尝试从路由 name 和 meta 中获取信息（仅限管理域）
    if (!tabMeta && app === 'admin' && data.name && data.meta) {
      // 从路由的 meta 中获取 titleKey 或 title
      const titleKey = data.meta.titleKey as string | undefined;
      const title = data.meta.title as string | undefined;

      if (titleKey || title) {
        // 创建一个临时的 TabMeta
        tabMeta = {
          key: data.name,
          title: title || titleKey || data.name,
          path: data.path,
          i18nKey: titleKey,
        };
      }
    }

    // 如果解析失败（没有元数据），拒绝添加（防止脏 Tab）
    if (!tabMeta) {
      console.warn('[Process] Failed to resolve tab meta for:', data.path, data.name);
      return;
    }

    // 将所有标签设为非激活状态
    list.value.forEach((e) => {
      e.active = false;
    });

    if (!data.meta) {
      data.meta = {};
    }

    // 如果不是首页且允许显示标签
    if (!data.meta?.isHome && data.meta?.process !== false) {
      // 使用 fullPath 进行更精确的去重
      const index = list.value.findIndex((e) => e.fullPath === data.fullPath);

      const buildMeta = (previousMeta: Record<string, any> = {}) => {
        const mergedMeta: Record<string, any> = {
          ...previousMeta,
          ...(tabMeta.i18nKey ? { labelKey: tabMeta.i18nKey } : {}),
          ...(tabMeta.title ? { title: tabMeta.title } : {}),
          ...data.meta,
        };

        if (
          typeof mergedMeta.label !== 'string' &&
          typeof mergedMeta.title === 'string'
        ) {
          mergedMeta.label = mergedMeta.title;
        }

        if (
          typeof mergedMeta.labelKey !== 'string' &&
          typeof mergedMeta.label === 'string' &&
          mergedMeta.label.startsWith('menu.')
        ) {
          mergedMeta.labelKey = mergedMeta.label;
        }

        return mergedMeta;
      };

      if (index < 0) {
        // 添加新标签，使用 tabRegistry 的元数据
        const newTab = {
          ...data,
          active: true,
          app,
          meta: buildMeta(),
        };
        list.value.push(newTab);

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
        // 更新已存在的标签
        list.value[index].active = true;
        list.value[index].meta = buildMeta(list.value[index].meta);
      }
    }

    syncPinned();
    reorderTabs();
  }

  /**
   * 关闭当前标签
   */
  function close() {
    const index = list.value.findIndex((e) => e.active);

    if (index > -1) {
      const removed = list.value[index];
      list.value.splice(index, 1);
      if (removed) {
        unpin(removed.fullPath);
      }
    }
  }

  /**
   * 移除指定标签
   */
  function remove(index: number) {
    const removed = list.value[index];
    list.value.splice(index, 1);
    if (removed) {
      unpin(removed.fullPath);
    }
  }

  /**
   * 设置标签列表
   */
  function set(data: ProcessItem[]) {
    list.value = data;
    syncPinned();
    reorderTabs();
  }

  /**
   * 清空所有标签
   */
  function clear() {
    list.value = [];
    pinned.value = [];
  }

  /**
   * 清空当前应用的标签
   */
  function clearCurrentApp(app: string) {
    list.value = list.value.filter((tab) => tab.app !== app);
    syncPinned();
  }

  /**
   * 获取当前应用的标签
   */
  function getAppTabs(app: string) {
    return list.value.filter((tab) => tab.app === app);
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
    pinned,
    isPinned,
    pin,
    unpin,
    togglePin,
    closeByFullPath,
    closeLeft,
    closeRight,
    closeOthers,
    closeAll,
    add,
    remove,
    close,
    set,
    clear,
    clearCurrentApp,
    getAppTabs,
    setTitle,
  };
});

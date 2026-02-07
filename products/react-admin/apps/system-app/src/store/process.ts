;
// 使用动态导入避免循环依赖（tabRegistry 可能导入 micro/manifests，而 micro/index.ts 导入 process.ts）
// import { getActiveApp, resolveTabMeta } from './tabRegistry';

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
 * 获取当前应用名称（根据路径前缀判断）
 * 此函数不依赖 tabRegistry，避免循环依赖
 */
export function getCurrentAppFromPath(path: string): string {
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/logistics')) return 'logistics';
  if (path.startsWith('/engineering')) return 'engineering';
  if (path.startsWith('/quality')) return 'quality';
  if (path.startsWith('/production')) return 'production';
  if (path.startsWith('/finance')) return 'finance';
  if (path.startsWith('/docs')) return 'docs';
  if (path.startsWith('/operations')) return 'operations';
  // 系统域是默认域，包括 /、/data/* 以及其他所有未匹配的路径
  return 'system';
}

// 持久化配置已通过 pinia-plugin-persistedstate 处理

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
   * 使用动态导入避免循环依赖
   */
  function add(data: ProcessItem) {
    // 跳过个人信息页面和认证页面（不在菜单中，不需要添加到标签页）
    if (data.path === '/profile' ||
        data.path === '/login' ||
        data.path === '/register' ||
        data.path === '/forget-password') {
      return;
    }

    // 获取应用名称（不依赖 tabRegistry，避免循环依赖）
    const app = getCurrentAppFromPath(data.path);

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

      // 先使用传入的 meta 信息构建基础 meta
      const buildMeta = (previousMeta: Record<string, any> = {}) => {
        const mergedMeta: Record<string, any> = {
          ...previousMeta,
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
        // 添加新标签，先使用基础 meta，后续异步更新
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
        const existingTab = list.value[index];
        if (existingTab) {
          existingTab.active = true;
          existingTab.meta = buildMeta(existingTab.meta);
        }
      }
    }

    syncPinned();
    reorderTabs();

    // 异步解析并更新 Tab 元数据（避免循环依赖）
    (async () => {
      try {
        // 首先尝试从 registry 解析（admin 应用）
        const { resolveTabMeta } = await import('./tabRegistry');
        let tabMeta = resolveTabMeta(data.path);

        // 如果 registry 解析失败，尝试从 manifest 解析（监控应用和其他子应用）
        if (!tabMeta && app !== 'system' && app !== 'admin') {
          try {
            const { getManifestRoute, getManifest } = await import('@btc/subapp-manifests');
            const manifestRoute = getManifestRoute(app, data.fullPath || data.path);

            if (manifestRoute && manifestRoute.tab?.enabled !== false) {
              const manifest = getManifest(app);
              if (manifest) {
                const basePath = manifest.app.basePath ?? `/${app}`;
                const routePath = manifestRoute.path;
                const fullPath = `${basePath}${routePath === "/" ? "" : routePath}`;
                const manifestKey = routePath.replace(/^\//, "") || "home";

                const i18nKey = manifestRoute.tab?.labelKey ?? manifestRoute.labelKey;
                tabMeta = {
                  key: manifestKey,
                  title: manifestRoute.tab?.labelKey ?? manifestRoute.labelKey ?? manifestRoute.label ?? fullPath,
                  path: fullPath,
                  ...(i18nKey !== undefined && { i18nKey }),
                };
              }
            }
          } catch (manifestError) {
            console.warn('[Process] Failed to resolve tab meta from manifest:', manifestError);
          }
        }

        if (tabMeta) {
          // 更新标签的 meta 信息
          const index = list.value.findIndex((e) => e.fullPath === data.fullPath);
          if (index >= 0) {
            const existingTab = list.value[index];
            if (existingTab) {
              existingTab.meta = {
                ...existingTab.meta,
                ...(tabMeta.i18nKey ? { labelKey: tabMeta.i18nKey } : {}),
                ...(tabMeta.title ? { title: tabMeta.title } : {}),
              };
            }
          }
        }
      } catch (error) {
        console.warn('[Process] Failed to resolve tab meta:', error);
      }
    })();
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
    // 同时清除持久化数据
    clearPersistedData();
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

  /**
   * 从持久化数据恢复（由 pinia-plugin-persistedstate 调用）
   * 在数据恢复后验证和清理数据
   */
  function restoreFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      // 验证并过滤无效的标签页
      const validTabs: ProcessItem[] = [];
      const validPinned: string[] = [];

      // 验证标签页数据
      list.value.forEach((tab) => {
        // 基本验证：必须有 path 和 fullPath
        if (tab && typeof tab === 'object' && tab.path && tab.fullPath) {
          // 过滤掉不应该持久化的页面
          if (
            tab.path === '/profile' ||
            tab.path === '/login' ||
            tab.path === '/register' ||
            tab.path === '/forget-password'
          ) {
            return;
          }

          // 确保 meta 存在
          if (!tab.meta) {
            tab.meta = {};
          }

          // 确保 app 字段存在
          if (!tab.app) {
            tab.app = getCurrentAppFromPath(tab.path);
          }

          // 排除 active 状态（刷新后需要重新计算）
          const { active, ...tabWithoutActive } = tab;
          validTabs.push(tabWithoutActive);
        }
      });

      // 验证固定标签列表：只保留在有效标签中的固定标签
      const validFullPaths = new Set(validTabs.map((tab) => tab.fullPath));
      pinned.value.forEach((path) => {
        if (typeof path === 'string' && validFullPaths.has(path)) {
          validPinned.push(path);
        }
      });

      // 更新数据
      list.value = validTabs;
      pinned.value = validPinned;

      // 重新排序（固定标签在前）
      reorderTabs();

      // 根据当前路由设置 active 状态
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const currentFullPath = window.location.pathname + window.location.search;

        // 优先匹配 fullPath（包含 query），其次匹配 path
        const currentTab = list.value.find((tab) => {
          if (tab.fullPath === currentFullPath) return true;
          if (tab.path === currentPath) return true;
          if (tab.fullPath === currentPath) return true;
          return false;
        });

        if (currentTab) {
          list.value.forEach((tab) => {
            tab.active = tab.fullPath === currentTab.fullPath;
          });
        } else {
          list.value.forEach((tab) => {
            tab.active = false;
          });
        }
      }
    } catch (error) {
      console.warn('[Process] Failed to restore tabs from storage:', error);
      // 如果恢复失败，清空数据
      list.value = [];
      pinned.value = [];
    }
  }

  /**
   * 清除持久化数据
   */
  function clearPersistedData() {
    list.value = [];
    pinned.value = [];
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
    restoreFromStorage,
    clearPersistedData,
  };
}, {
  persist: {
    // 只持久化 list 和 pinned，排除 active 状态
    paths: ['list', 'pinned'],
    // 自定义序列化器，排除 active 状态
    serializer: {
      serialize: (value) => {
        const data = {
          list: value.list.map((tab: ProcessItem) => {
            const { active, ...tabWithoutActive } = tab;
            return tabWithoutActive;
          }),
          pinned: value.pinned,
        };
        return JSON.stringify(data);
      },
      deserialize: (value) => {
        return JSON.parse(value);
      },
    },
    // 数据恢复后的钩子
    afterRestore: (ctx) => {
      // 调用恢复函数进行数据验证和清理
      ctx.store.restoreFromStorage();
    },
  },
});

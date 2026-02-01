;

/**
 * 最近访问项数据结构
 */
export interface RecentAccessItem {
  appId: string;
  appName: string;
  path: string;
  label: string;
  labelKey?: string;
  icon?: string;
  timestamp: number;
}

// 持久化配置已通过 pinia-plugin-persistedstate 处理

/**
 * 最近访问数量限制
 */
const MAX_RECENT_ITEMS = 20;

/**
 * 最近访问 Store
 */
export const useRecentAccessStore = defineStore('recentAccess', () => {
  const items = ref<RecentAccessItem[]>([]);

  /**
   * 从持久化数据恢复（由 pinia-plugin-persistedstate 调用）
   * 在数据恢复后验证和清理数据
   */
  function restoreFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      // 验证并过滤无效的访问记录
      const validItems: RecentAccessItem[] = [];

      items.value.forEach((item) => {
        // 基本验证：必须有 appId、path、timestamp
        if (
          item &&
          typeof item === 'object' &&
          item.appId &&
          item.path &&
          typeof item.timestamp === 'number'
        ) {
          // 排除概览页面本身
          try {
            if (typeof (window as any).__BTC_GET_MAIN_APP_HOME_ROUTE__ === 'function') {
              const getMainAppHomeRoute = (window as any).__BTC_GET_MAIN_APP_HOME_ROUTE__;
              if (item.path === getMainAppHomeRoute()) {
                return;
              }
            } else {
              if (item.path === '/workbench/overview') {
                return;
              }
            }
          } catch (e) {
            if (item.path === '/workbench/overview') {
              return;
            }
          }

          validItems.push(item);
        }
      });

      // 按时间戳降序排序（最新的在前）
      validItems.sort((a, b) => b.timestamp - a.timestamp);

      // 限制数量
      items.value = validItems.slice(0, MAX_RECENT_ITEMS);
    } catch (error) {
      console.warn('[RecentAccess] Failed to restore from storage:', error);
      items.value = [];
    }
  }

  /**
   * 添加访问记录
   */
  function addAccess(item: Omit<RecentAccessItem, 'timestamp'>) {
    // 排除概览页面
    if (item.path === '/workbench/overview') {
      return;
    }

    const newItem: RecentAccessItem = {
      ...item,
      timestamp: Date.now(),
    };

    // 移除已存在的相同路径的记录（去重）
    items.value = items.value.filter(
      (existingItem) => existingItem.path !== item.path
    );

    // 添加到最前面
    items.value.unshift(newItem);

    // 限制数量
    if (items.value.length > MAX_RECENT_ITEMS) {
      items.value = items.value.slice(0, MAX_RECENT_ITEMS);
    }

    // 注意：持久化由 pinia-plugin-persistedstate 自动处理，无需手动调用 saveToStorage
  }

  /**
   * 获取最近访问列表
   */
  function getRecentItems(limit?: number): RecentAccessItem[] {
    if (limit && limit > 0) {
      return items.value.slice(0, limit);
    }
    return items.value;
  }

  /**
   * 清除所有访问记录
   */
  function clearAll() {
    items.value = [];
  }

  /**
   * 移除指定的访问记录
   */
  function removeItem(path: string) {
    items.value = items.value.filter((item) => item.path !== path);
  }

  return {
    items,
    addAccess,
    getRecentItems,
    clearAll,
    removeItem,
    restoreFromStorage,
  };
}, {
  persist: {
    // 只持久化 items
    paths: ['items'],
    // 数据恢复后的钩子
    afterRestore: (ctx) => {
      // 调用恢复函数进行数据验证和清理
      ctx.store.restoreFromStorage();
    },
  },
});


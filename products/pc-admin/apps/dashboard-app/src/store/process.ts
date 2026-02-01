
export interface ProcessItem {
  path: string;
  fullPath: string;
  name?: string;
  meta: {
    label?: string;
    keepAlive?: boolean;
    isHome?: boolean;
    process?: boolean;
  };
  active?: boolean;
}

/**
 * 页面标签（Process）Store
 */
export const useProcessStore = defineStore('process', () => {
  const list = ref<ProcessItem[]>([]);

  /**
   * 添加标签
   */
  function add(data: ProcessItem) {
    // 将所有标签设为非激活状态
    list.value.forEach((e) => {
      e.active = false;
    });

    if (!data.meta) {
      data.meta = {};
    }

    // 如果不是首页且允许显示标签
    if (!data.meta?.isHome && data.meta?.process !== false) {
      const index = list.value.findIndex((e) => e.path === data.path);

      if (index < 0) {
        // 添加新标签
        list.value.push({
          ...data,
          active: true,
        });
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
  };
});

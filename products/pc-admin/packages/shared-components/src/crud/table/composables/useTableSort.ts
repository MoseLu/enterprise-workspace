import { ref, computed } from 'vue';
import type { UseCrudReturn } from '@btc/shared-core';
import type { TableProps } from '../types';

/**
 * 表格排序处理（参考 cool-admin table/helper/sort.ts）
 */
export function useTableSort(crud: UseCrudReturn<any>, props: TableProps, emit: any) {
  // 当前排序
  const currentSort = ref<{prop: string; order: string} | null>(null);

  // 设置默认排序（参考 cool-admin 的逻辑）
  const defaultSort = computed(() => {
    let { prop, order } = props.defaultSort || {};

    // 从列配置中查找默认排序
    const item = props.columns?.find((e) =>
      ["desc", "asc", "descending", "ascending"].find((a) => a == e.sortable)
    );

    if (item) {
      prop = item.prop;
      order = ["descending", "desc"].find((a) => a == item.sortable)
        ? "descending"
        : "ascending";
    }

    if (order && prop) {
      // 设置 crud 的排序参数（通过 searchParams）
      if (crud.setParams) {
        crud.setParams({
          order: ["descending", "desc"].includes(order) ? "desc" : "asc",
          sort: prop
        });
      }

      return {
        prop,
        order
      };
    }

    return props.defaultSort || currentSort.value || undefined;
  });

  /**
   * 排序变化处理（参考 cool-admin 的逻辑）
   */
  function onSortChange({ prop, order }: { prop: string | undefined; order: string }) {
    if (props.sortRefresh !== false) {
      // 转换排序方向格式
      if (order === "descending") {
        order = "desc";
      }

      if (order === "ascending") {
        order = "asc";
      }

      if (!order) {
        prop = undefined;
      }

      // 更新 crud 的排序参数（通过 searchParams）
      if (crud.setParams) {
        crud.setParams({
          sort: prop,
          order: order,
          page: 1 // 排序后重置到第一页
        });
      }

      // 刷新数据
      crud.loadData();
    }

    // 更新当前排序状态
    currentSort.value = prop && order ? { prop, order } : null;

    // 触发排序变化事件
    emit("sort-change", { prop, order });
  }

  /**
   * 改变排序（参考 cool-admin 的逻辑）
   */
  function changeSort(_prop: string, order: string) {
    if (order === "desc") {
      order = "descending";
    }

    if (order === "asc") {
      order = "ascending";
    }

    // 触发表格排序
    // 这里需要访问表格实例来调用 sort 方法
    // 实际实现中需要通过 ref 获取表格实例
  }

  /**
   * 清除排序
   */
  function clearSort() {
    currentSort.value = null;

    // 清除 crud 的排序参数（通过 searchParams）
    if (crud.setParams) {
      crud.setParams({
        sort: undefined,
        order: undefined
      });
    }
  }

  return {
    defaultSort,
    currentSort,
    onSortChange,
    changeSort,
    clearSort,
  };
}

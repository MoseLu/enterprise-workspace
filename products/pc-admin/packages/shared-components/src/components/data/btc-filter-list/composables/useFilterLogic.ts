import { computed, type Ref } from 'vue';
import type { FilterCategory } from '../types';

/**
 * 筛选逻辑 composable
 * 处理搜索过滤、头部内容判断等逻辑
 */
export function useFilterLogic(
  searchKeyword: Ref<string>,
  categories: Ref<FilterCategory[]>,
  enableSearch: boolean,
  hasHeaderActionsSlot: Ref<boolean>,
  hasScrollingRow: Ref<boolean>,
  showTagsContainer: boolean
) {
  // 判断 __header 是否有内容（搜索框或标签容器）
  const hasHeaderContent = computed(() => {
    // 有搜索框（当启用搜索且没有提供 header-actions 插槽时）
    const hasSearch = enableSearch && !hasHeaderActionsSlot.value;
    // 有标签容器（滚动状态或非滚动状态）
    const hasTags = hasScrollingRow.value || showTagsContainer;
    return hasSearch || hasTags;
  });

  // 过滤后的分类列表
  const filteredCategories = computed(() => {
    if (!searchKeyword.value) {
      return categories.value;
    }
    const keyword = searchKeyword.value.toLowerCase();
    return categories.value.filter(category =>
      category.name.toLowerCase().includes(keyword) ||
      category.options.some(opt => opt.label.toLowerCase().includes(keyword))
    );
  });

  return {
    hasHeaderContent,
    filteredCategories,
  };
}

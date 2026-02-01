import { ref, nextTick } from 'vue';
import type { FilterCategory } from '../types';

/**
 * 展开/折叠状态管理 composable
 */
export function useCollapseState(
  categories: { value: FilterCategory[] },
  props: { defaultExpandedCount?: number }
) {
  // 展开的分类列表
  const activeCategories = ref<string[]>([]);

  // 记录用户手动操作过的面板及其状态
  // key: categoryId, value: true=用户手动展开, false=用户手动折叠
  // 这些面板的状态应该被保留，不会被自动计算覆盖
  const userManualCategories = ref<Map<string, boolean>>(new Map());

  // 标记是否正在自动更新（避免在自动更新时触发用户操作记录）
  let isAutoUpdating = false;

  // 上一次的展开状态（用于检测用户操作）
  let previousActiveState: string[] = [];

  // 初始化默认展开的分类（使用简单的默认数量，不使用自动计算）
  const initDefaultExpanded = () => {
    const categoryCount = categories.value.length;
    if (categoryCount === 0) {
      activeCategories.value = [];
      return;
    }

    // 默认展开指定数量的分类（默认3个）
    const defaultCount = Math.min(props.defaultExpandedCount || 3, categoryCount);
    const defaultIds: string[] = [];
    for (let i = 0; i < defaultCount; i++) {
      const category = categories.value[i];
      if (category && category.id) {
        defaultIds.push(String(category.id));
      }
    }

    isAutoUpdating = true;
    activeCategories.value = defaultIds;
    // 清空用户手动操作记录（初始化时）
    userManualCategories.value.clear();
    // 更新 previousActiveState
    previousActiveState = [...defaultIds];
    nextTick(() => {
      isAutoUpdating = false;
    });
  };

  // 处理 el-collapse 的 change 事件，记录用户手动操作
  const handleCollapseChange = (activeNames: string | string[], updateScrollbar?: () => void) => {
    // 如果正在自动更新，不记录为用户操作，但更新 previousActiveState
    if (isAutoUpdating) {
      const activeArray = Array.isArray(activeNames) ? activeNames : [activeNames];
      previousActiveState = activeArray.map(id => String(id));
      // 自动更新时也需要更新滚动条
      if (updateScrollbar) {
        nextTick(() => {
          updateScrollbar();
        });
      }
      return;
    }

    const activeArray = Array.isArray(activeNames) ? activeNames : [activeNames];
    const currentActive = activeArray.map(id => String(id));

    // 找出变化的面板（用户手动操作的面板）
    // 找出新增的（用户手动展开的）
    currentActive.forEach(categoryId => {
      if (!previousActiveState.includes(categoryId)) {
        // 用户手动展开了这个面板
        userManualCategories.value.set(categoryId, true);
      }
    });

    // 找出移除的（用户手动折叠的）
    previousActiveState.forEach(categoryId => {
      if (!currentActive.includes(categoryId)) {
        // 用户手动折叠了这个面板
        userManualCategories.value.set(categoryId, false);
      }
    });

    // 更新 previousActiveState
    previousActiveState = [...currentActive];

    // 折叠面板展开/收起时，更新滚动条（确保滚动条能够正确响应内容高度变化）
    if (updateScrollbar) {
      nextTick(() => {
        updateScrollbar();
      });
    }
  };

  // 自动展开分类（当选择选项时）
  const autoExpandCategory = (categoryId: string, hasSelection: boolean, updateScrollbar?: () => void) => {
    if (hasSelection && !activeCategories.value.includes(categoryId)) {
      // 清除该分类的手动折叠状态，因为用户通过点击选项表明他们想要展开这个分类
      if (userManualCategories.value.get(categoryId) === false) {
        userManualCategories.value.delete(categoryId);
      }
      // 自动展开
      isAutoUpdating = true;
      activeCategories.value.push(categoryId);
      nextTick(() => {
        isAutoUpdating = false;
        // 更新 previousActiveState，避免触发 handleCollapseChange 中的用户操作记录
        previousActiveState = [...activeCategories.value];
        // 自动展开后更新滚动条
        if (updateScrollbar) {
          nextTick(() => {
            updateScrollbar();
          });
        }
      });
    }
  };

  return {
    activeCategories,
    userManualCategories,
    initDefaultExpanded,
    handleCollapseChange,
    autoExpandCategory,
  };
}
import { nextTick, type Ref } from 'vue';
import type { FilterCategory } from '../types';

/**
 * 事件处理 composable
 * 整合所有包装函数和事件处理逻辑
 */
export function useEventHandlers(
  selectedValues: Ref<Record<string, any[]>>,
  maxTagsPerRowMap: Ref<Record<string, number>>,
  tagsContainerRef: Ref<HTMLElement | null>,
  tagsScrollbarRef: Ref<any>,
  handleSizeChangeInternal: (size: any) => void,
  handleCategorySelectAllInternal: (categoryId: string, checked: boolean, callback?: () => void) => void,
  handleSelectionChangeInternal: (categoryId: string, callback?: () => void) => void,
  handleTagCloseInternal: (categoryId: string, optionValue: any, callback?: () => void) => void,
  handleCollapseTagClickInternal: (categoryId: string, scrollbarRef: any) => void,
  handleCollapseBtnClickInternal: (categoryId: string, containerRef: HTMLElement | null) => void,
  handleCollapseChangeInternal: (activeNames: string | string[], callback?: () => void) => void,
  handleClickOutsideInternal: (event: MouseEvent, containerRef: HTMLElement | null, scrollbarRef: any) => void,
  handleWindowResizeInternal: (containerRef: HTMLElement | null) => void,
  autoExpandCategory: (categoryId: string, shouldExpand: boolean, callback?: () => void) => void,
  triggerCalculateRemainingSpace: (containerRef: HTMLElement | null) => void
) {
  // 注意：滚动现在由全局 .container 统一处理，不再需要手动刷新滚动容器

  // 处理尺寸切换（包装函数，添加额外逻辑）
  const handleSizeChangeWrapper = (size: any) => {
    handleSizeChangeInternal(size);
    // 尺寸变化时，清空 maxTagsPerRowMap，让 categoryTagRows 先使用默认估算值
    maxTagsPerRowMap.value = {};
    // 尺寸变化时，容器宽度会改变，需要重新计算标签溢出
    triggerCalculateRemainingSpace(tagsContainerRef.value);
  };

  // 处理分类全选/取消全选（包装函数）
  const handleCategorySelectAllWrapper = (categoryId: string, checked: boolean) => {
    handleCategorySelectAllInternal(categoryId, checked, () => {
      // 如果全选了选项，自动展开该分类
      if (checked) {
        const hasSelection = (selectedValues.value[categoryId] || []).length > 0;
        autoExpandCategory(categoryId, hasSelection);
      }
      // 手动触发剩余空间计算
      triggerCalculateRemainingSpace(tagsContainerRef.value || null);
    });
  };

  // 处理选择变化（包装函数）
  const handleSelectionChangeWrapper = (categoryId: string) => {
    // 如果选择了选项，自动展开该分类
    const hasSelection = (selectedValues.value[categoryId] || []).length > 0;
    autoExpandCategory(categoryId, hasSelection);

    handleSelectionChangeInternal(categoryId, () => {
      // 手动触发剩余空间计算
      triggerCalculateRemainingSpace(tagsContainerRef.value || null);
    });
  };

  // 处理标签关闭（包装函数）
  const handleTagCloseWrapper = (categoryId: string, optionValue: any) => {
    handleTagCloseInternal(categoryId, optionValue, () => {
      // 手动触发剩余空间计算
      triggerCalculateRemainingSpace(tagsContainerRef.value || null);
    });
  };

  // 处理折叠标签点击（包装函数）
  const handleCollapseTagClickWrapper = (categoryId: string) => {
    handleCollapseTagClickInternal(categoryId, tagsScrollbarRef.value || null);
  };

  // 处理收起按钮点击（包装函数）
  const handleCollapseBtnClickWrapper = (categoryId: string) => {
    handleCollapseBtnClickInternal(categoryId, tagsContainerRef.value || null);
  };

  // 处理 el-collapse 的 change 事件（包装函数）
  const handleCollapseChangeWrapper = (activeNames: string | string[]) => {
    handleCollapseChangeInternal(activeNames);
  };

  // 处理点击容器外空白区域恢复（包装函数）
  const handleClickOutsideWrapper = (event: MouseEvent) => {
    handleClickOutsideInternal(event, tagsContainerRef.value || null, tagsScrollbarRef.value || null);
  };

  // 处理窗口尺寸变化自动恢复（包装函数）
  const handleWindowResizeWrapper = () => {
    handleWindowResizeInternal(tagsContainerRef.value || null);
  };

  return {
    handleSizeChangeWrapper,
    handleCategorySelectAllWrapper,
    handleSelectionChangeWrapper,
    handleTagCloseWrapper,
    handleCollapseTagClickWrapper,
    handleCollapseBtnClickWrapper,
    handleCollapseChangeWrapper,
    handleClickOutsideWrapper,
    handleWindowResizeWrapper,
  };
}

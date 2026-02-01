import { ref, computed, nextTick } from 'vue';
import type { Ref } from 'vue';
import type { BtcFilterListSize, FilterCategory } from '../types';

/**
 * 标签布局 composable
 */
export function useTagLayout(
  categories: Ref<FilterCategory[]>,
  currentSize: Ref<BtcFilterListSize>
) {
  // 每行可以显示的标签数量（动态计算，根据容器宽度）
  // 使用 ref 存储每行的最大标签数，在 calculateRowRemainingSpace 中动态更新
  const maxTagsPerRowMap = ref<Record<string, number>>({});

  // 根据尺寸估算每行可以显示的标签数量（初始估算值）
  const estimateMaxTagsPerRow = (size: BtcFilterListSize): number => {
    // 基于尺寸估算容器宽度（需要考虑 padding、border 等）
    // small: 200px，实际可用宽度约 180px
    // default: 通常 300px，实际可用宽度约 280px
    // large: 450px，实际可用宽度约 430px
    let availableWidth: number;
    switch (size) {
      case 'small':
        availableWidth = 180; // 200px - padding(10px * 2) - border(1px * 2) - gap
        break;
      case 'large':
        availableWidth = 430; // 450px - padding(10px * 2) - border(1px * 2) - gap
        break;
      case 'default':
      default:
        availableWidth = 280; // 300px（估算） - padding(10px * 2) - border(1px * 2) - gap
        break;
    }

    // 分类标签宽度约 50px
    const categoryTagWidth = 50;
    const tagGap = 6; // gap 间距
    const avgTagWidth = 80; // 平均标签宽度（估算）

    // 计算可以显示的正常标签数量（不包括折叠标签）
    // 可用宽度 = 容器宽度 - 分类标签宽度
    // availableWidth = categoryTagWidth + visibleTags * (avgTagWidth + tagGap)
    // 所以：visibleTags = (availableWidth - categoryTagWidth) / (avgTagWidth + tagGap)
    const maxVisibleTags = Math.floor((availableWidth - categoryTagWidth) / (avgTagWidth + tagGap));

    // 至少显示 0 个标签（如果宽度很小，可能显示 0 个），最多显示 20 个
    return Math.max(0, Math.min(20, maxVisibleTags));
  };

  // 计算默认的最大标签数（基于当前尺寸）
  const defaultMaxTagsPerRow = computed(() => estimateMaxTagsPerRow(currentSize.value));

  // 记录哪些分类的行正在滚动状态（点击折叠标签后）
  const scrollingRows = ref<Set<string>>(new Set());

  // 计算是否有任何行处于滚动状态
  const hasScrollingRow = computed(() => scrollingRows.value.size > 0);

  // 记录每行的剩余空间是否明显大于一个标签（用于判断是否让最后一个标签占据剩余宽度）
  // 使用普通对象而不是 Map，避免响应式循环引用问题
  const rowRemainingSpaceMap = ref<Record<string, boolean>>({});

  // 动态计算标签容器高度（根据分类总数，不管是否选中都会预留空间）
  // 计算公式：高度 = 标签行数 * 实际行高度 + (行数 - 1) * gap + 上下内边距 + 上下边框
  // 每个分类占一行，所以行数 = 分类总数
  // 注意：由于使用了 box-sizing: border-box，高度需要包含边框和padding
  // 简化：使用固定估算值，减少 DOM 查询触发计算属性更新
  const tagsContainerHeight = computed(() => {
    const categoryCount = categories.value.length;
    if (categoryCount === 0) {
      return 0; // 没有分类时，高度为0
    }

    // 使用固定行高估算值，避免频繁查询 DOM
    const rowHeight = 30; // 固定行高，无需动态测量
    // 行间距（gap）：6px（CSS flex gap，在flex容器中，gap不会影响box-sizing的计算）
    const gap = 6;
    // 容器内边距：上5px，下0px（底部间距由标签行内容容器的padding-bottom: 5px提供）
    const paddingTop = 5; // 顶部内边距
    const paddingBottom = 0; // 底部内边距（0，因为标签行内容容器已有padding-bottom: 5px）
    const padding = paddingTop + paddingBottom; // 总内边距：5px
    // 容器上下边框：1px * 2 = 2px（由于 box-sizing: border-box，需要包含边框）
    const border = 1 * 2; // 上下各1px

    // 计算总高度：行高度 * 行数 + 行间距 * (行数 - 1) + 上下内边距 + 上下边框
    // 在 box-sizing: border-box 下，height 属性包含 content + padding + border
    // 所以总高度 = 内容高度 + padding + border
    // 注意：flex gap 是行间距，不会影响 box-sizing 的计算，它是在内容区域外部添加的间距
    const contentHeight = rowHeight * categoryCount + gap * (categoryCount - 1);
    const height = contentHeight + padding + border;

    return height;
  });

  // 存储每行的 ref，用于计算剩余空间
  // 使用普通 Map 存储 DOM 元素，避免响应式导致的循环引用问题
  // DOM 元素不需要响应式追踪，直接用普通 Map 存储
  const rowRefs = new Map<string, HTMLElement>();

  // 设置行 ref（在模板中使用，TypeScript 可能无法检测到）
  // @ts-ignore - 函数在模板中被使用，但 TypeScript 无法检测到
  const setRowRef = (categoryId: string, el: HTMLElement | null) => {
    if (el) {
      rowRefs.set(categoryId, el); // 直接操作普通 Map
    } else {
      rowRefs.delete(categoryId);
    }
  };

  // 计算每行的剩余空间和最大标签数（用于判断是否让最后一个标签占据剩余宽度，以及动态计算最大标签数）
  // 注意：此函数不访问 computed 值，避免循环引用
  // 使用浅拷贝更新，避免触发深度响应式更新
  const calculateRowRemainingSpace = (tagsContainerRef: HTMLElement | null) => {
    if (!tagsContainerRef) return;

    // 创建新的 map 对象，避免直接修改导致循环更新
    const newRemainingSpaceMap: Record<string, boolean> = { ...rowRemainingSpaceMap.value };
    const newMaxTagsMap: Record<string, number> = { ...maxTagsPerRowMap.value };

    // 直接遍历 rowRefs，不访问 categoryTagRows computed 值，避免循环引用
    rowRefs.forEach((rowElement, categoryId) => {
      // 获取内容容器
      const contentElement = rowElement.querySelector('.btc-filter-list__tag-row-content') as HTMLElement;
      if (!contentElement) return;

      // 获取分类提示标签的宽度（作为参考）
      const categoryTag = contentElement.querySelector('.btc-filter-list__category-tag') as HTMLElement;
      if (!categoryTag) return;

      const categoryTagWidth = categoryTag.offsetWidth;
      const rowWidth = rowElement.offsetWidth;

      // 动态计算该行可以显示的最大正常标签数（不包括折叠标签）
      // 先计算可以显示多少正常标签，如果还有标签没显示，才需要显示折叠标签
      // 可用宽度 = 行宽 - 分类标签宽度
      // 平均标签宽度估算：80px（包括内容 + padding + gap）
      const tagGap = 6; // 标签间距
      const avgTagWidth = 80; // 平均标签宽度

      // 计算可以显示的正常标签数量（不包括折叠标签）
      // availableWidth = rowWidth - categoryTagWidth
      // maxTags = Math.floor(availableWidth / (avgTagWidth + tagGap))
      const availableWidth = rowWidth - categoryTagWidth;
      const calculatedMaxTags = Math.max(0, Math.floor(availableWidth / (avgTagWidth + tagGap)));

      // 更新最大正常标签数（至少 0 个，最多 20 个）
      // 注意：这里是正常标签的数量，不包括折叠标签
      newMaxTagsMap[categoryId] = Math.max(0, Math.min(20, calculatedMaxTags));

      // 计算已使用的宽度（分类提示标签 + 可见标签 + gap）
      let usedWidth = categoryTagWidth;
      const visibleTags = contentElement.querySelectorAll('.el-tag:not(.btc-filter-list__category-tag):not(.btc-filter-list__collapse-tag)');
      visibleTags.forEach((tag: Element) => {
        usedWidth += (tag as HTMLElement).offsetWidth + tagGap;
      });

      // 如果有折叠标签，也要计算它的宽度
      const collapseTag = contentElement.querySelector('.btc-filter-list__collapse-tag') as HTMLElement;
      if (collapseTag) {
        usedWidth += collapseTag.offsetWidth + tagGap;
      }

      // 计算剩余空间
      const remainingSpace = rowWidth - usedWidth;

      // 如果剩余空间明显大于一个标签的宽度（大于1.5倍标签宽度），则不占据剩余宽度
      // 只有当剩余空间较小（<= 1.5倍标签宽度）时，才让最后一个标签占据剩余宽度
      const shouldOccupyRemaining = remainingSpace > 0 && remainingSpace <= categoryTagWidth * 1.5;
      newRemainingSpaceMap[categoryId] = shouldOccupyRemaining;
    });

    // 一次性更新，避免多次触发响应式更新
    rowRemainingSpaceMap.value = newRemainingSpaceMap;
    maxTagsPerRowMap.value = newMaxTagsMap;
  };

  // 防抖计算剩余空间的定时器
  let calculateTimer: ReturnType<typeof setTimeout> | null = null;

  // 触发剩余空间计算的函数（带防抖，避免频繁触发和循环引用）
  // 标记是否正在计算剩余空间（避免重复触发闭环）
  let isCalculatingRemainingSpace = false;

  const triggerCalculateRemainingSpace = (tagsContainerRef: HTMLElement | null) => {
    // 如果正在执行，直接返回，避免重复触发闭环
    if (isCalculatingRemainingSpace) {
      return;
    }

    // 清除之前的定时器
    if (calculateTimer) {
      clearTimeout(calculateTimer);
    }

    // 防抖：延迟计算，避免频繁触发（延长到 300ms，给响应式更新留足时间）
    calculateTimer = setTimeout(() => {
      nextTick(() => {
        requestAnimationFrame(() => {
          isCalculatingRemainingSpace = true;
          calculateRowRemainingSpace(tagsContainerRef);
          // 计算完成后重置标记
          isCalculatingRemainingSpace = false;
        });
      });
    }, 300);
  };

  // 统一恢复折叠状态的函数（核心恢复逻辑）
  const restoreCollapseState = (categoryId: string, tagsContainerRef: HTMLElement | null) => {
    if (!scrollingRows.value.has(categoryId)) {
      return; // 如果该分类未展开，直接返回
    }

    // 移除展开状态
    scrollingRows.value.delete(categoryId);

    // 重新计算剩余空间，确保布局正确
    nextTick(() => {
      triggerCalculateRemainingSpace(tagsContainerRef);
    });
  };

  // 处理折叠标签点击（展开）
  const handleCollapseTagClick = (categoryId: string, tagsScrollbarRef: any) => {
    scrollingRows.value.add(categoryId);

    // 等待 DOM 更新后，滚动到该行的末尾
    nextTick(() => {
      requestAnimationFrame(() => {
        // 正确获取 el-scrollbar 的 wrap DOM 元素
        if (tagsScrollbarRef?.wrapRef?.value) {
          const wrapEl = tagsScrollbarRef.wrapRef.value as HTMLElement; // 新增 .value 获取真实 DOM
          // 找到目标行的位置
          const rowElement = rowRefs.get(categoryId);
          if (rowElement && wrapEl) {
            // 计算滚动距离（滚动到行末尾）
            const rowRect = rowElement.getBoundingClientRect();
            const wrapRect = wrapEl.getBoundingClientRect();
            // 滚动到目标行右侧，避免遮挡
            wrapEl.scrollLeft = rowRect.right - wrapRect.left + wrapEl.scrollLeft - wrapRect.width;
          }
        }
      });
    });
  };

  // 处理收起按钮点击（主恢复条件）
  const handleCollapseBtnClick = (categoryId: string, tagsContainerRef: HTMLElement | null) => {
    restoreCollapseState(categoryId, tagsContainerRef);
  };

  // 处理点击容器外空白区域恢复（辅助恢复条件1）
  const handleClickOutside = (event: MouseEvent, tagsContainerRef: HTMLElement | null, tagsScrollbarRef: any) => {
    if (!tagsContainerRef && !tagsScrollbarRef) {
      return;
    }

    // 检查点击目标是否在标签容器内
    const target = event.target as HTMLElement;
    const container = tagsContainerRef || (tagsScrollbarRef?.$el as HTMLElement);

    if (!container) {
      return;
    }

    // 如果点击在容器外，恢复所有展开的分类
    if (!container.contains(target)) {
      // 获取所有展开的分类ID
      const expandedCategoryIds = Array.from(scrollingRows.value);
      // 逐个恢复
      expandedCategoryIds.forEach(categoryId => {
        restoreCollapseState(categoryId, tagsContainerRef);
      });
    }
  };

  // 处理窗口尺寸变化自动恢复（辅助恢复条件2）
  const handleWindowResize = (tagsContainerRef: HTMLElement | null) => {
    // 窗口尺寸变化时，检查所有展开的分类是否还需要展开
    const expandedCategoryIds = Array.from(scrollingRows.value);

    expandedCategoryIds.forEach(categoryId => {
      const rowElement = rowRefs.get(categoryId);
      if (!rowElement) {
        return;
      }

      // 获取内容容器
      const contentElement = rowElement.querySelector('.btc-filter-list__tag-row-content') as HTMLElement;
      if (!contentElement) {
        return;
      }

      // 检查是否还有溢出（窗口放大后可能不再溢出）
      const totalWidth = contentElement.scrollWidth;
      const visibleWidth = contentElement.clientWidth;

      // 如果不再溢出，自动恢复折叠状态
      if (totalWidth <= visibleWidth) {
        restoreCollapseState(categoryId, tagsContainerRef);
      } else {
        // 如果仍然溢出，重新计算溢出数量
        nextTick(() => {
          triggerCalculateRemainingSpace(tagsContainerRef);
        });
      }
    });
  };

  return {
    maxTagsPerRowMap,
    defaultMaxTagsPerRow,
    scrollingRows,
    hasScrollingRow,
    rowRemainingSpaceMap,
    tagsContainerHeight,
    setRowRef,
    rowRefs,
    triggerCalculateRemainingSpace,
    handleCollapseTagClick,
    handleCollapseBtnClick,
    handleClickOutside,
    handleWindowResize,
  };
}
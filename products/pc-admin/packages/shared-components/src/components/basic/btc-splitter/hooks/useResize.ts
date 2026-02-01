import { computed, ref, watch } from 'vue';
import { getPct, getPx, isPct, isPx } from './useSize';

import type { ComputedRef, Ref } from 'vue';
import type { PanelItemState } from '../types';

const NOOP = () => {};

export function useResize(
  panels: Ref<PanelItemState[]>,
  containerSize: ComputedRef<number>,
  pxSizes: ComputedRef<number[]>,
  lazy: Ref<boolean>
) {
  const ptg2px = (ptg: number) => ptg * containerSize.value || 0;

  function getLimitSize(
    str: string | number | undefined,
    defaultLimit: number
  ) {
    if (isPct(str)) {
      return ptg2px(getPct(str));
    } else if (isPx(str)) {
      return getPx(str);
    }
    return str ?? defaultLimit;
  }

  const lazyOffset = ref(0);
  const movingIndex = ref<{
    index: number;
    confirmed: boolean;
  } | null>(null);

  let cachePxSizes: number[] = [];
  let updatePanelSizes = NOOP;

  const limitSizes = computed(() =>
    panels.value.map((item) => [item.min, item.max])
  );

  watch(lazy, () => {
    if (lazyOffset.value) {
      const mouseup = new MouseEvent('mouseup', { bubbles: true });
      window.dispatchEvent(mouseup);
    }
  });

  const onMoveStart = (index: number) => {
    lazyOffset.value = 0;
    movingIndex.value = { index, confirmed: false };
    cachePxSizes = [...pxSizes.value];
  };

  const onMoving = (index: number, offset: number) => {
    let confirmedIndex: number | null = null;

    // When overlapping, find the nearest draggable index
    if ((!movingIndex.value || !movingIndex.value.confirmed) && offset !== 0) {
      if (offset > 0) {
        confirmedIndex = index;
        movingIndex.value = { index, confirmed: true };
      } else {
        for (let i = index; i >= 0; i -= 1) {
          if (cachePxSizes[i]! > 0) {
            confirmedIndex = i;
            movingIndex.value = { index: i, confirmed: true };
            break;
          }
        }
      }
    }
    const mergedIndex = confirmedIndex ?? movingIndex.value?.index ?? index;

    const numSizes = [...cachePxSizes];
    const nextIndex = mergedIndex + 1;

    // Handle the maximum and minimum edge cases
    const startMinSize = getLimitSize(limitSizes.value[mergedIndex]![0], 0);
    const endMinSize = getLimitSize(limitSizes.value[nextIndex]![0], 0);
    const startMaxSize = getLimitSize(
      limitSizes.value[mergedIndex]![1],
      containerSize.value || 0
    );
    const endMaxSize = getLimitSize(
      limitSizes.value[nextIndex]![1],
      containerSize.value || 0
    );

    let mergedOffset = offset;

    if (numSizes[mergedIndex]! + mergedOffset < startMinSize) {
      mergedOffset = startMinSize - numSizes[mergedIndex]!;
    }
    if (numSizes[nextIndex]! - mergedOffset < endMinSize) {
      mergedOffset = numSizes[nextIndex]! - endMinSize;
    }
    if (numSizes[mergedIndex]! + mergedOffset > startMaxSize) {
      mergedOffset = startMaxSize - numSizes[mergedIndex]!;
    }
    if (numSizes[nextIndex]! - mergedOffset > endMaxSize) {
      mergedOffset = numSizes[nextIndex]! - endMaxSize;
    }

    numSizes[mergedIndex]! += mergedOffset;
    numSizes[nextIndex]! -= mergedOffset;
    lazyOffset.value = mergedOffset;

    updatePanelSizes = () => {
      panels.value.forEach((panel, index) => {
        panel.size = numSizes[index];
      });
      updatePanelSizes = NOOP;
    };

    // 实时拖拽：非 lazy 模式时立即更新
    if (!lazy.value) {
      updatePanelSizes();
    }
  };

  const onMoveEnd = () => {
    if (lazy.value) {
      updatePanelSizes();
    }

    lazyOffset.value = 0;
    movingIndex.value = null;
    cachePxSizes = [];
  };

  // 保存每个按钮对应的状态快照（用于撤销/重做）
  // key: 按钮对应的面板索引（panelIndex），value: 折叠前的完整状态
  const collapseSnapshots = new Map<number, number[]>();

  const onCollapse = (index: number, type: 'start' | 'end') => {
    const currentSizes = [...pxSizes.value];

    const currentIndex = type === 'start' ? index : index + 1;
    const targetIndex = type === 'start' ? index + 1 : index;

    const currentSize = currentSizes[currentIndex];
    const targetSize = currentSizes[targetIndex];

    if (currentSize !== 0 && targetSize !== 0) {
      // 折叠：将被折叠面板的宽度分配给相邻面板
      currentSizes[currentIndex] = 0;
      currentSizes[targetIndex]! += currentSize;
    } else {
      // 展开：恢复被折叠面板的原始宽度
      const totalSize = currentSize + targetSize;
      // 使用缓存中的原始宽度（如果有）
      const cachedSize = cacheCollapsedSize[index] ?? 0;
      const currentCacheCollapsedSize = totalSize - cachedSize;

      currentSizes[targetIndex] = cachedSize;
      currentSizes[currentIndex] = currentCacheCollapsedSize;
    }

    panels.value.forEach((panel, idx) => {
      panel.size = currentSizes[idx];
    });
  };

  // 用于单个拖拽条的折叠（Element Plus 原生逻辑）
  const cacheCollapsedSize: number[] = [];

  // 层级折叠/展开：可逆操作
  // panelIndex: 按钮所在的面板索引（例如第三栏的 panelIndex=2）
  // targetIndices: 要折叠/展开的目标面板索引数组（例如 [0, 1]）
  const togglePanels = (panelIndex: number, targetIndices: number[]) => {
    const currentSizes = [...pxSizes.value];
    
    // 检查目标面板是否都已折叠
    const allCollapsed = targetIndices.every(idx => currentSizes[idx] === 0);
    
    if (allCollapsed) {
      // 展开：恢复到折叠前的状态
      const snapshot = collapseSnapshots.get(panelIndex);
      if (snapshot) {
        // 恢复到保存的状态
        snapshot.forEach((size, idx) => {
          if (idx < panels.value.length) {
            panels.value[idx].size = size;
          }
        });
        // 清除快照
        collapseSnapshots.delete(panelIndex);
      }
    } else {
      // 折叠：保存当前状态，然后执行折叠
      // 保存折叠前的完整状态
      collapseSnapshots.set(panelIndex, [...currentSizes]);
      
      // 从后往前折叠（先折叠最后一个，再折叠前面的）
      // 这样宽度会累积到最后一个未折叠的面板
      for (let i = targetIndices.length - 1; i >= 0; i--) {
        const targetIndex = targetIndices[i];
        if (currentSizes[targetIndex] !== 0) {
          // 找到接收宽度的面板（下一个未折叠的面板，通常是最后一个面板）
          let receiverIndex = targetIndex + 1;
          while (receiverIndex < currentSizes.length && currentSizes[receiverIndex] === 0) {
            receiverIndex++;
          }
          if (receiverIndex < currentSizes.length) {
            // 将当前面板的宽度分配给接收面板
            currentSizes[receiverIndex]! += currentSizes[targetIndex];
            currentSizes[targetIndex] = 0;
          }
        }
      }
      
      // 应用更新
      panels.value.forEach((panel, idx) => {
        panel.size = currentSizes[idx];
      });
    }
  };

  return {
    lazyOffset,
    onMoveStart,
    onMoving,
    onMoveEnd,
    movingIndex,
    onCollapse,
    togglePanels,
  };
}

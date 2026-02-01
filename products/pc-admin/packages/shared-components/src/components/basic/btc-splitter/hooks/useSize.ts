import { computed, ref, watch } from 'vue';

import type { ComputedRef, Ref } from 'vue';
import type { PanelItemState } from '../types';

export function getPct(str: string): number {
  return Number(str.slice(0, -1)) / 100;
}

export function getPx(str: string): number {
  return Number(str.slice(0, -2));
}

export function isPct(
  itemSize: string | number | undefined
): itemSize is string {
  return typeof itemSize === 'string' && itemSize.endsWith('%');
}

export function isPx(
  itemSize: string | number | undefined
): itemSize is string {
  return typeof itemSize === 'string' && itemSize.endsWith('px');
}

export function useSize(
  panels: Ref<PanelItemState[]>,
  containerSize: ComputedRef<number>
) {
  const propSizes = computed(() => panels.value.map((i) => i.size));

  const panelCounts = computed(() => panels.value.length);

  const percentSizes = ref<number[]>([]);

  watch([propSizes, panelCounts, containerSize], () => {
    if (!containerSize.value) {
      // 如果容器大小还未初始化，延迟更新
      return;
    }

    let ptgList: (number | undefined)[] = [];
    let emptyCount = 0;

    // Convert the passed props size to a percentage
    for (let i = 0; i < panelCounts.value; i += 1) {
      const itemSize = panels.value[i]?.size;

      if (isPct(itemSize)) {
        ptgList[i] = getPct(itemSize);
      } else if (isPx(itemSize)) {
        ptgList[i] = getPx(itemSize) / containerSize.value;
      } else if (itemSize || itemSize === 0) {
        const num = Number(itemSize);

        if (!Number.isNaN(num)) {
          ptgList[i] = num / containerSize.value;
        }
      } else {
        emptyCount += 1;
        ptgList[i] = undefined;
      }
    }

    const totalPtg = ptgList.reduce<number>((acc, ptg) => acc + (ptg || 0), 0);

    if (totalPtg > 1 || !emptyCount) {
      // If it is greater than 1, the scaling ratio
      const scale = 1 / totalPtg;
      ptgList = ptgList.map((ptg) => (ptg === undefined ? 0 : ptg * scale));
    } else {
      // If it is less than 1, the filling ratio
      const avgRest = (1 - totalPtg) / emptyCount;
      ptgList = ptgList.map((ptg) => (ptg === undefined ? avgRest : ptg));
    }

    // 立即同步更新，确保 CSS transition 能够正确检测到变化并应用过渡动画
    // Vue 的 watch 默认会在同一个 tick 中合并多次触发，所以这里不需要额外的防抖机制
    percentSizes.value = ptgList as number[];
  });

  const ptg2px = (ptg: number) => ptg * containerSize.value;
  const pxSizes = computed(() => percentSizes.value.map(ptg2px));

  return { percentSizes, pxSizes };
}

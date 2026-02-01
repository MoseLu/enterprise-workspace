<template>
  <div
    ref="containerEl"
    class="btc-splitter"
    :class="`btc-splitter--${direction}`"
    :style="splitterStyles"
  >
    <slot />
    <panels-sorter />
    <!-- Prevent iframe touch events from breaking -->
    <div
      v-if="movingIndex"
      class="btc-splitter__mask"
      :class="`btc-splitter__mask--${direction}`"
    />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  nextTick,
  provide,
  reactive,
  toRef,
  watch,
} from 'vue';
import { useOrderedChildren } from './hooks/useOrderedChildren';
import { useContainer, useResize, useSize } from './hooks';
import { splitterRootContextKey } from './types';
import type { BtcSplitterProps, BtcSplitterEmits } from './types';
import type { PanelItemState } from './types';

defineOptions({
  name: 'BtcSplitter',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<BtcSplitterProps>(), {
  direction: 'horizontal',
  lazy: false,
});

const emit = defineEmits<BtcSplitterEmits>();

const layout = toRef(props, 'direction');
const lazy = toRef(props, 'lazy');

const { containerEl, containerSize } = useContainer(layout);

const {
  removeChild: unregisterPanel,
  children: panels,
  addChild: registerPanel,
  ChildrenSorter: PanelsSorter,
} = useOrderedChildren<PanelItemState>(getCurrentInstance()!, 'BtcSplitterPanel');

watch(panels, () => {
  movingIndex.value = null;
  panels.value.forEach((instance: PanelItemState, index: number) => {
    instance.setIndex(index);
  });
});

const { percentSizes, pxSizes } = useSize(panels, containerSize);

const {
  lazyOffset,
  movingIndex,
  onMoveStart,
  onMoving,
  onMoveEnd,
  onCollapse,
  togglePanels,
} = useResize(panels, containerSize, pxSizes, lazy);

const splitterStyles = computed(() => {
  return {
    '--btc-splitter-bar-offset': lazy.value
      ? `${lazyOffset.value}px`
      : undefined,
  };
});

const onResizeStart = (index: number) => {
  onMoveStart(index);
  emit('resize-start', index, pxSizes.value);
};

const onResize = (index: number, offset: number) => {
  onMoving(index, offset);

  if (!lazy.value) {
    emit('resize', index, pxSizes.value);
  }
};

const onResizeEnd = async (index: number) => {
  onMoveEnd();
  await nextTick();
  emit('resize-end', index, pxSizes.value);
};

const onCollapsible = (index: number, type: 'start' | 'end') => {
  onCollapse(index, type);
  emit('collapse', index, type, pxSizes.value);
};

provide(
  splitterRootContextKey,
  reactive({
    panels,
    percentSizes,
    pxSizes,
    layout,
    lazy,
    movingIndex,
    containerSize,
    onMoveStart: onResizeStart,
    onMoving: onResize,
    onMoveEnd: onResizeEnd,
    onCollapse: onCollapsible,
    togglePanels,
    registerPanel,
    unregisterPanel,
  })
);
</script>

<style lang="scss" scoped>
.btc-splitter {
  height: 100%;
  width: 100%;
  display: flex;
  position: relative;
  overflow: hidden;

  &--horizontal {
    flex-direction: row;
  }

  &--vertical {
    flex-direction: column;
  }

  &__mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    pointer-events: none;

    &--horizontal {
      cursor: ew-resize;
    }

    &--vertical {
      cursor: ns-resize;
    }
  }
}
</style>

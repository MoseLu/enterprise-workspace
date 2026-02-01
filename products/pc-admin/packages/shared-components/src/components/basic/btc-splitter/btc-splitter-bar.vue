<template>
  <div class="btc-splitter-bar" :style="barWrapStyles">
    <!-- 隐藏默认折叠按钮，使用自定义按钮 -->
    <div
      v-if="startCollapsible"
      class="btc-splitter-bar__collapse-icon btc-splitter-bar__collapse-icon--hidden"
      style="display: none;"
    >
      <slot name="start-collapsible" />
    </div>

    <div
      :class="[
        'btc-splitter-bar__dragger',
        `btc-splitter-bar__dragger--${layout}`,
        {
          'btc-splitter-bar__dragger--active': !!startPos,
          'btc-splitter-bar__dragger--disabled': !resizable,
        },
      ]"
      :style="draggerStyles"
      @mousedown="onMousedown"
      @touchstart="onTouchStart"
    />

    <!-- 隐藏默认折叠按钮，使用自定义按钮 -->
    <div
      v-if="endCollapsible"
      class="btc-splitter-bar__collapse-icon btc-splitter-bar__collapse-icon--hidden"
      style="display: none;"
    >
      <slot name="end-collapsible" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

defineOptions({
  name: 'BtcSplitterBar',
});

const props = defineProps<{
  index: number;
  layout: 'horizontal' | 'vertical';
  resizable: boolean;
  lazy?: boolean;
  startCollapsible: boolean;
  endCollapsible: boolean;
}>();

const emit = defineEmits<{
  moveStart: [index: number];
  moving: [index: number, offset: number];
  moveEnd: [index: number];
  collapse: [index: number, type: 'start' | 'end'];
}>();

const isHorizontal = computed(() => props.layout === 'horizontal');

const barWrapStyles = computed(() => {
  if (isHorizontal.value) {
    return { width: 0 };
  }
  return { height: 0 };
});

const draggerStyles = computed(() => {
  return {
    width: isHorizontal.value ? '16px' : '100%',
    height: isHorizontal.value ? '100%' : '16px',
    cursor: !props.resizable
      ? 'auto'
      : isHorizontal.value
        ? 'ew-resize'
        : 'ns-resize',
    touchAction: 'none',
  };
});

const startPos = ref<[x: number, y: number] | null>(null);

// Start dragging
const onMousedown = (e: MouseEvent) => {
  if (!props.resizable) return;
  startPos.value = [e.pageX, e.pageY];
  emit('moveStart', props.index);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('mousemove', onMouseMove);
};

const onTouchStart = (e: TouchEvent) => {
  if (props.resizable && e.touches.length === 1) {
    e.preventDefault();
    const touch = e.touches[0];
    startPos.value = [touch.pageX, touch.pageY];
    emit('moveStart', props.index);
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchmove', onTouchMove);
  }
};

// During dragging
const onMouseMove = (e: MouseEvent) => {
  if (!startPos.value) return;
  const { pageX, pageY } = e;
  const offsetX = pageX - startPos.value[0];
  const offsetY = pageY - startPos.value[1];
  const offset = isHorizontal.value ? offsetX : offsetY;
  emit('moving', props.index, offset);
};

const onTouchMove = (e: TouchEvent) => {
  if (!startPos.value || e.touches.length !== 1) return;
  e.preventDefault();
  const touch = e.touches[0];
  const offsetX = touch.pageX - startPos.value[0];
  const offsetY = touch.pageY - startPos.value[1];
  const offset = isHorizontal.value ? offsetX : offsetY;
  emit('moving', props.index, offset);
};

// End dragging
const onMouseUp = () => {
  if (!startPos.value) return;
  startPos.value = null;
  window.removeEventListener('mouseup', onMouseUp);
  window.removeEventListener('mousemove', onMouseMove);
  emit('moveEnd', props.index);
};

const onTouchEnd = () => {
  if (!startPos.value) return;
  startPos.value = null;
  window.removeEventListener('touchend', onTouchEnd);
  window.removeEventListener('touchmove', onTouchMove);
  emit('moveEnd', props.index);
};
</script>

<style lang="scss" scoped>
.btc-splitter-bar {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &--horizontal {
    flex-direction: row;
  }

  &--vertical {
    flex-direction: column;
  }

  &__collapse-icon {
    &--hidden {
      display: none !important;
    }
  }

  &__dragger {
    position: absolute;
    z-index: 1;
    user-select: none;
    background: transparent;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: var(--el-border-color-light);
    }

    &--horizontal {
      cursor: ew-resize;

      &::before,
      &::after {
        height: 100%;
        width: 2px;
      }
    }

    &--vertical {
      cursor: ns-resize;

      &::before,
      &::after {
        height: 2px;
        width: 100%;
      }
    }

    &--active {
      &::before,
      &::after {
        background-color: var(--el-color-primary-light-3);
      }
    }

    &--disabled {
      cursor: auto !important;
    }

    &:hover:not(&--disabled) {
      &::before {
        background-color: var(--el-color-primary-light-5);
      }
    }
  }
}
</style>

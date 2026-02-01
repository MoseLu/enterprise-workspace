<template>
  <div class="geometric-content-container" ref="containerRef" :style="containerStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, nextTick, onMounted, onUnmounted } from 'vue';
import { rectangleToClipPath } from '@/utils/svg-utils';

defineOptions({
  name: 'GeometricContentContainer',
});

const props = defineProps<{
  geometricBackgroundRef?: { value: any } | any; // GeometricBackground 组件的引用
}>();

const containerRef = ref<HTMLElement | null>(null);
const inscribedRect = ref<{ x: number; y: number; width: number; height: number } | null>(null);

// 计算容器的样式
const containerStyle = computed(() => {
  if (!inscribedRect.value || !containerRef.value) {
    return {};
  }

  const containerRect = containerRef.value.getBoundingClientRect();
  const containerWidth = containerRect.width || window.innerWidth;
  const containerHeight = containerRect.height || window.innerHeight;

  // 将内接矩形转换为 clip-path
  const clipPath = rectangleToClipPath(inscribedRect.value, containerWidth, containerHeight);

  return {
    clipPath,
    boxSizing: 'border-box',
  };
});

// 更新内接矩形
const updateInscribedRect = () => {
  const bgRef = props.geometricBackgroundRef?.value || props.geometricBackgroundRef;
  if (bgRef?.calculateLargestInscribedRectangle) {
    nextTick(() => {
      const rect = bgRef.calculateLargestInscribedRectangle();
      if (rect) {
        inscribedRect.value = rect;
      }
    });
  }
};

// 监听并更新内接矩形
watchEffect(() => {
  updateInscribedRect();
});

let resizeObserver: ResizeObserver | null = null;
let handleResize: (() => void) | null = null;

onMounted(() => {
  // 监听容器尺寸变化
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateInscribedRect();
    });
    resizeObserver.observe(containerRef.value);
  }

  // 监听窗口大小变化
  handleResize = () => {
    updateInscribedRect();
  };
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  if (handleResize) {
    window.removeEventListener('resize', handleResize);
  }
});
</script>

<style scoped lang="scss">
.geometric-content-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10; // 在几何背景之上
  pointer-events: auto;
  overflow: hidden;
}
</style>


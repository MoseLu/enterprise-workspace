import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

/**
 * 画布尺寸管理
 */
export function useCanvasDimensions() {
  // 简化的网格尺寸 - 固定尺寸确保一致性
  const gridSize = computed(() => {
    return {
      small: 10,  // 小网格 10x10px
      large: 50   // 大网格 50x50px
    };
  });

  // 画布尺寸响应式状态
  const canvasDimensions = ref({ width: 2000, height: 1500 });

  // 动态计算画布尺寸，确保边界对齐
  // 网格尺寸应基于 .canvas-scroll 容器的实际可用空间，确保在不同屏幕尺寸下都能正确显示
  const updateCanvasDimensions = () => {
    const largeGrid = gridSize.value.large; // 50px

    // 获取画布滚动容器的实际尺寸（网格在此容器中居中显示）
    // 优先使用 .canvas-scroll，如果没有则回退到 .canvas-container
    const scrollContainer = document.querySelector('.canvas-scroll') as HTMLElement | null;
    const container = scrollContainer || (document.querySelector('.canvas-container') as HTMLElement | null);
    
    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // 计算最接近的大网格整数倍尺寸，确保不超过容器
    // 使用 Math.floor 确保画布不会超出容器边界，避免出现滚动条
    const width = Math.floor(containerWidth / largeGrid) * largeGrid;
    const height = Math.floor(containerHeight / largeGrid) * largeGrid;

    // 确保最小尺寸
    const minWidth = largeGrid;
    const minHeight = largeGrid;

    const finalWidth = Math.max(width, minWidth);
    const finalHeight = Math.max(height, minHeight);

    canvasDimensions.value = {
      width: finalWidth,
      height: finalHeight
    };

    // 验证边界对齐
    const widthGrids = finalWidth / largeGrid;
    const heightGrids = finalHeight / largeGrid;
  };

  // 监听窗口大小变化
  let resizeObserver: ResizeObserver | null = null;
  let rafId: number | null = null;

  onMounted(async () => {
    // 等待 DOM 完全渲染后再计算尺寸，确保能正确获取容器尺寸
    await nextTick();
    updateCanvasDimensions();

    // 使用 ResizeObserver 更精确地监听容器尺寸变化
    // 监听 .canvas-scroll 容器，因为它才是网格实际显示的容器
    const scrollContainer = document.querySelector('.canvas-scroll') as HTMLElement | null;
    const container = scrollContainer || (document.querySelector('.canvas-container') as HTMLElement | null);
    
    if (container) {
      resizeObserver = new ResizeObserver(() => {
        // 使用 requestAnimationFrame 延迟执行，避免在 ResizeObserver 回调中同步修改 DOM
        // 这样可以避免 ResizeObserver loop 警告
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(() => {
          updateCanvasDimensions();
          rafId = null;
        });
      });
      resizeObserver.observe(container);
    }

    // 备用：监听窗口大小变化
    window.addEventListener('resize', updateCanvasDimensions);
  });

  onUnmounted(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    window.removeEventListener('resize', updateCanvasDimensions);
  });

  return {
    canvasDimensions,
    gridSize,
    updateCanvasDimensions
  };
}


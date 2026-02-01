<template>
  <div class="geometric-background-wrapper">
    <svg
      ref="svgRef"
      class="geometric-background"
      :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
    <!-- 左上角三层三角形堆叠 -->
    <g class="top-left">
      <!-- layer-1: 浅粉色 -->
      <path
        :d="getTopLeftLayer1Path()"
        fill="#efa19b"
        class="layer-1"
      />
      <!-- layer-2: 正红色 -->
      <path
        :d="getTopLeftLayer2Path()"
        fill="#da291c"
        class="layer-2"
      />
      <!-- layer-3: 灰色 -->
      <path
        :d="getTopLeftLayer3Path()"
        fill="#404040"
        class="layer-3"
      />
    </g>

    <!-- 右上角三层三角形堆叠 -->
    <g class="top-right">
      <!-- layer-1: 浅红色 -->
      <path
        :d="getTopRightLayer1Path()"
        fill="#e15147"
        class="layer-1"
      />
      <!-- layer-2: 正红色 -->
      <path
        :d="getTopRightLayer2Path()"
        fill="#da291c"
        class="layer-2"
      />
      <!-- layer-3: 灰色 -->
      <path
        :d="getTopRightLayer3Path()"
        fill="#404040"
        class="layer-3"
      />
    </g>

    <!-- 右下角两层三角形堆叠 -->
    <g class="bottom-right">
      <!-- layer-1: 浅粉色 -->
      <path
        :d="getBottomRightLayer1Path()"
        fill="#efa19b"
        class="layer-1"
      />
      <!-- layer-2: 正红色 -->
      <path
        :d="getBottomRightLayer2Path()"
        fill="#da291c"
        class="layer-2"
      />
    </g>

      <!-- 内接矩形（可选显示） -->
      <path
        v-if="inscribedRectPath"
        :d="inscribedRectPath"
        fill="none"
        stroke="#00ff00"
        stroke-width="2"
        stroke-dasharray="5,5"
        opacity="0.8"
        class="inscribed-rectangle"
      />
    </svg>

    <!-- 内容容器：自动使用内接矩形区域 -->
    <div
      v-if="inscribedRect"
      class="geometric-content-area"
      :style="contentAreaStyle"
    >
      <slot />
    </div>

    <!-- QA标志：基于SVG背景定位 -->
    <div
      class="queen-logo"
      :style="queenLogoStyle"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, nextTick, onMounted, onUnmounted } from 'vue';
import { calculateLargestInscribedRectangle as calcRect, rectangleToPath } from '@/utils/svg-utils';

defineOptions({
  name: 'GeometricBackground',
});

const props = defineProps<{
  width?: number;
  height?: number;
  showInscribedRect?: boolean; // 是否显示内接矩形
}>();

const svgRef = ref<SVGSVGElement | null>(null);

// 使用视口单位计算尺寸
const vw = computed(() => {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth / 100;
});

const vh = computed(() => {
  if (typeof window === 'undefined') return 0;
  return window.innerHeight / 100;
});

// SVG viewBox尺寸（使用视口尺寸）
const viewBoxWidth = computed(() => {
  return props.width || (typeof window !== 'undefined' ? window.innerWidth : 1920);
});

const viewBoxHeight = computed(() => {
  return props.height || (typeof window !== 'undefined' ? window.innerHeight : 1080);
});

// 左上角 layer-1: 宽度40vw，高度20vh，三角形 (0, 20vh) -> (0, 0) -> (40vw, 0)
const getTopLeftLayer1Path = () => {
  const w = 40 * vw.value;
  const h = 20 * vh.value;
  return `M 0 ${h} L 0 0 L ${w} 0 Z`;
};

// 左上角 layer-2: 宽度40vw，高度17vh，三角形 (0, 17vh) -> (0, 0) -> (40vw, 0)
const getTopLeftLayer2Path = () => {
  const w = 40 * vw.value;
  const h = 17 * vh.value;
  return `M 0 ${h} L 0 0 L ${w} 0 Z`;
};

// 左上角 layer-3: 宽度8vw，高度75vh，三角形 (0, 0) -> (8vw, 0) -> (0, 75vh)
const getTopLeftLayer3Path = () => {
  const w = 8 * vw.value;
  const h = 75 * vh.value;
  return `M 0 0 L ${w} 0 L 0 ${h} Z`;
};

// 右上角 layer-1: 宽度16vw，高度70vh，三角形 (viewportWidth - 16vw, 0) -> (viewportWidth, 0) -> (viewportWidth, 70vh)
const getTopRightLayer1Path = () => {
  const w = 16 * vw.value;
  const h = 70 * vh.value;
  const x = viewBoxWidth.value - w;
  return `M ${x} 0 L ${viewBoxWidth.value} 0 L ${viewBoxWidth.value} ${h} Z`;
};

// 右上角 layer-2: 宽度13vw，高度70vh，三角形 (viewportWidth - 13vw, 0) -> (viewportWidth, 0) -> (viewportWidth, 70vh)
const getTopRightLayer2Path = () => {
  const w = 13 * vw.value;
  const h = 70 * vh.value;
  const x = viewBoxWidth.value - w;
  return `M ${x} 0 L ${viewBoxWidth.value} 0 L ${viewBoxWidth.value} ${h} Z`;
};

// 右上角 layer-3: 宽度7vw，高度70vh，三角形 (viewportWidth, 0) -> (viewportWidth - 7vw, 0) -> (viewportWidth, 70vh)
const getTopRightLayer3Path = () => {
  const w = 7 * vw.value;
  const h = 70 * vh.value;
  const x = viewBoxWidth.value - w;
  return `M ${viewBoxWidth.value} 0 L ${x} 0 L ${viewBoxWidth.value} ${h} Z`;
};

// 右下角 layer-1: 宽度20vw，高度30vh，三角形 (viewportWidth, viewportHeight) -> (viewportWidth, viewportHeight - 30vh) -> (viewportWidth - 20vw, viewportHeight)
const getBottomRightLayer1Path = () => {
  const w = 20 * vw.value;
  const h = 30 * vh.value;
  const x = viewBoxWidth.value - w;
  const y = viewBoxHeight.value - h;
  return `M ${viewBoxWidth.value} ${viewBoxHeight.value} L ${viewBoxWidth.value} ${y} L ${x} ${viewBoxHeight.value} Z`;
};

// 右下角 layer-2: 宽度18vw，高度30vh，三角形 (viewportWidth, viewportHeight) -> (viewportWidth, viewportHeight - 30vh) -> (viewportWidth - 18vw, viewportHeight)
const getBottomRightLayer2Path = () => {
  const w = 18 * vw.value;
  const h = 30 * vh.value;
  const x = viewBoxWidth.value - w;
  const y = viewBoxHeight.value - h;
  return `M ${viewBoxWidth.value} ${viewBoxHeight.value} L ${viewBoxWidth.value} ${y} L ${x} ${viewBoxHeight.value} Z`;
};

// 暴露方法：获取所有路径元素，用于计算最大内接矩形
const getAllPaths = () => {
  if (!svgRef.value) return [];
  return Array.from(svgRef.value.querySelectorAll('path'));
};

// 暴露方法：计算最大内接矩形
const calculateLargestInscribedRectangle = () => {
  if (!svgRef.value) return null;

  const paths = getAllPaths();
  if (paths.length === 0) return null;

  // 计算 QA logo 占据的区域（需要排除）
  const logoWidth = 160;
  const logoHeight = 160;
  const offsetX = 15;
  const bottomOffset = 60;

  // QA logo 在 viewBox 坐标系中的位置
  // right = 20vw + offsetX，所以右边缘在 viewBoxWidth - (20vw + offsetX)
  const qaLogoRight = viewBoxWidth.value - (20 * vw.value + offsetX);
  const qaLogoLeft = qaLogoRight - logoWidth;
  const qaLogoBottom = viewBoxHeight.value - bottomOffset;
  const qaLogoTop = qaLogoBottom - logoHeight;

  // QA logo 占据的矩形区域
  const excludeRect = {
    x: qaLogoLeft,
    y: qaLogoTop,
    width: logoWidth,
    height: logoHeight,
  };

  // 使用工具函数计算最大内接矩形，排除 QA logo 区域
  return calcRect(paths, viewBoxWidth.value, viewBoxHeight.value, [excludeRect]);
};

// 内接矩形数据
const inscribedRect = ref<{ x: number; y: number; width: number; height: number } | null>(null);

// 计算内接矩形的SVG path（用于显示）
const inscribedRectPath = computed(() => {
  if (!props.showInscribedRect || !inscribedRect.value) return '';
  return rectangleToPath(inscribedRect.value);
});

// 计算内容区域的样式（基于内接矩形）
const contentAreaStyle = computed(() => {
  if (!inscribedRect.value) return {};

  // QA logo 的尺寸和位置
  const logoHeight = 160;
  const bottomOffset = 60;

  // 计算 QA logo 在视口中的实际位置
  const qaLogoBottom = viewBoxHeight.value - bottomOffset;
  const qaLogoTop = qaLogoBottom - logoHeight;

  // 将内接矩形的坐标转换为百分比
  const xPercent = (inscribedRect.value.x / viewBoxWidth.value) * 100;
  const yPercent = (inscribedRect.value.y / viewBoxHeight.value) * 100;
  const widthPercent = (inscribedRect.value.width / viewBoxWidth.value) * 100;
  const heightPercent = (inscribedRect.value.height / viewBoxHeight.value) * 100;

  // 计算内容区域的底部位置（相对于视口）
  const contentBottom = (inscribedRect.value.y + inscribedRect.value.height) / viewBoxHeight.value * 100;

  // 计算 QA logo 的顶部位置（相对于视口）
  const qaLogoTopPercent = (qaLogoTop / viewBoxHeight.value) * 100;

  // 如果内容区域底部会与 QA logo 重叠，调整高度
  let adjustedHeight = heightPercent;
  if (contentBottom > qaLogoTopPercent) {
    // 内容区域底部在 QA logo 上方，需要减少高度
    // 计算需要减少的高度（百分比）
    const overlapPercent = contentBottom - qaLogoTopPercent;
    // 额外减少一些边距（比如 10px 转换为百分比）
    const marginPercent = (10 / viewBoxHeight.value) * 100;
    adjustedHeight = heightPercent - overlapPercent - marginPercent;
    adjustedHeight = Math.max(0, adjustedHeight); // 确保不为负
  }

  return {
    left: `${xPercent}%`,
    top: `${yPercent}%`,
    width: `${widthPercent}%`,
    height: `${adjustedHeight}%`,
  };
});

// 计算QA logo的样式（基于右下角layer-1的定位）
const queenLogoStyle = computed(() => {
  // 右下角layer-1: 宽度20vw，高度30vh
  // QA logo作为背景的一部分，始终固定在三角形左边缘的左侧一点点
  // 使用 CSS vw 单位确保与 SVG 中的三角形位置保持一致
  const logoWidth = 160; // logo宽度（px）
  const logoHeight = 160; // logo高度（px）
  const offsetX = 15; // 在三角形左边缘左侧15px（向左偏移）

  // 固定位置：QA logo 始终在右下角三角形左侧
  // 使用 CSS calc() 和 vw 单位，确保与 SVG 中的 20vw 保持一致
  // right = 20vw + offsetX（使用 CSS 单位，不依赖 JavaScript 计算）
  return {
    position: 'fixed' as const,
    width: `${logoWidth}px`,
    height: `${logoHeight}px`,
    right: `calc(20vw + ${offsetX}px)`, // 使用 CSS calc 和 vw 单位
    bottom: '60px', // 距离底部60px
    zIndex: 5, // 提高z-index，确保在背景之上但在内容之下
    pointerEvents: 'none' as const,
  };
});

// 更新内接矩形
// 注意：即使不显示边框（showInscribedRect=false），也需要计算内接矩形用于内容定位
const updateInscribedRect = () => {
  if (svgRef.value) {
    nextTick(() => {
      const rect = calculateLargestInscribedRectangle();
      if (rect) {
        inscribedRect.value = rect;
      }
    });
  } else {
    inscribedRect.value = null;
  }
};

// 监听并计算内接矩形
watchEffect(() => {
  updateInscribedRect();
});

let handleResize: (() => void) | null = null;

onMounted(() => {
  // 监听窗口大小变化
  handleResize = () => {
    updateInscribedRect();
  };
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (handleResize) {
    window.removeEventListener('resize', handleResize);
  }
});

defineExpose({
  getAllPaths,
  calculateLargestInscribedRectangle,
});
</script>

<style scoped lang="scss">
.geometric-background-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.geometric-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.geometric-content-area {
  position: absolute;
  z-index: 10; // 在几何背景之上
  pointer-events: auto;
  overflow: auto;
  box-sizing: border-box;
  // 不设置布局样式，让各个模块自己控制
}

.queen-logo {
  background-image: url('@/assets/logo/qa-logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: block; // 确保元素可见
}
</style>


<template>
  <!-- SVG 画布，网格背景由外部作为兄弟元素提供 -->
  <svg
    ref="svgRef"
    class="strategy-canvas"
    :class="{ dragging: isDragging }"
    :viewBox="`0 0 ${baseW} ${baseH}`"
    :style="svgSizeStyle"
    preserveAspectRatio="none"
    @drop="$emit('drop', $event)"
    @dragover="$emit('dragover', $event)"
    @dragleave="$emit('dragleave', $event)"
    @mousedown="$emit('mousedown', $event)"
    @mousemove="$emit('mousemove', $event)"
    @mouseup="$emit('mouseup', $event)"
    @click="$emit('click', $event)"
  >
      <!-- defs：箭头标记 -->
      <defs>
        <marker id="arrowhead-default" markerWidth="5" markerHeight="3.5" refX="4" refY="1.75" orient="auto" class="connection-marker">
          <polygon points="0 0, 5 1.75, 0 3.5" :fill="getConnectionColor()" />
        </marker>
        <marker id="arrowhead-true" markerWidth="5" markerHeight="3.5" refX="4" refY="1.75" orient="auto" class="connection-marker">
          <polygon points="0 0, 5 1.75, 0 3.5" :fill="getConnectionColor()" />
        </marker>
        <marker id="arrowhead-false" markerWidth="5" markerHeight="3.5" refX="4" refY="1.75" orient="auto" class="connection-marker">
          <polygon points="0 0, 5 1.75, 0 3.5" :fill="getConnectionColor()" />
        </marker>
      </defs>

    <!-- 内容层：平移 + 缩放（仅节点/连线/覆盖）
         使用非等比补偿：browserScale(Sx,Sy) * layerScale(scale/Sx, scale/Sy) = 等比 scale -->
    <g class="content-layer" :transform="`translate(${panX}, ${panY}) scale(${scaleCompX}, ${scaleCompY})`">
      <!-- 已建立的连接线（仅路径） -->
      <g
        v-for="pathData in props.connectionPaths"
        :key="pathData.id"
        :class="['connection-group', { selected: isConnectionSelected(pathData.id) } ]"
      >
        <!-- 选中时的虚线边框（在连线下方，更粗以确保可见） -->
        <path
          v-if="pathData.path && pathData.path.trim() && isConnectionSelected(pathData.id)"
          :data-connection-id="pathData.id"
          :d="pathData.path"
          stroke="#409eff"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
          fill="none"
          stroke-dasharray="6,6"
          stroke-opacity="0.8"
          class="connection-selected-outline"
          pointer-events="none"
        />
        <!-- 实际的连接线路径 -->
        <path
          v-if="pathData.path && pathData.path.trim()"
          :data-connection-id="pathData.id"
          :d="pathData.path"
          :stroke="pathData.color"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
          fill="none"
          class="connection-path"
          :class="{
            'connection-horizontal': pathData.direction === 'horizontal',
            'connection-vertical': pathData.direction === 'vertical'
          }"
          :stroke-dasharray="pathData.isOrphaned ? '5,5' : undefined"
          :style="{
            cursor: getCursorForConnection(pathData)
          }"
          :marker-end="pathData.marker"
          @click.stop="(e) => {
            $emit('select-connection', pathData.id);
          }"
          @mousemove="(e) => {
            // 实时根据鼠标位置计算光标
            const path = e.target as SVGPathElement;
            const cursor = getCursorForPathSegment(pathData, e);
            // 直接设置内联样式，内联样式优先级高于 CSS 类选择器（除非 CSS 使用了 !important）
            path.style.cursor = cursor;
          }"
          @mouseleave="(e) => {
            // 鼠标离开时，清除动态设置的光标，恢复默认
            const path = e.target as SVGPathElement;
            path.style.cursor = '';
          }"
        />
      </g>

      <!-- 插槽：节点与其它中层内容 -->
      <slot />

      <!-- 插槽：顶层覆盖（连接手柄、橡皮筋等，在 content-layer 内，受 transform 影响） -->
      <slot name="overlay-top" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps<{
  canvasDimensions: { width: number; height: number };
  panX: number;
  panY: number;
  scale: number;
  isDragging: boolean;
  connectionPaths: Array<{ id: string; path: string; color: string; marker: string; direction?: 'horizontal' | 'vertical' }>;
  isConnectionSelected: (id: string) => boolean;
  getGridColor: (isSmall: boolean) => string;
  getConnectionColor: () => string;
}>();

defineEmits(['drop','dragover','dragleave','mousedown','mousemove','mouseup','click','select-connection']);

const { canvasDimensions, panX, panY, scale, getConnectionColor } = props;

// 计算连接线的光标样式（基于预先计算的 direction）
const getCursorForConnection = (pathData: { id: string; direction?: 'horizontal' | 'vertical' }) => {
  // 双箭头光标应该与连线方向一致：
  // col-resize = 垂直双箭头（↕ 上下方向）
  // row-resize = 水平双箭头（↔ 左右方向）
  // 水平连线（←→ 左右方向）-> 水平双箭头（↔ 左右方向，与连线平行）-> row-resize
  // 垂直连线（↕ 上下方向）-> 垂直双箭头（↕ 上下方向，与连线平行）-> col-resize
  const cursor = pathData.direction === 'horizontal'
    ? 'row-resize'
    : (pathData.direction === 'vertical' ? 'col-resize' : 'default');
  return cursor;
};

// 计算点到线段的垂直距离
const pointToLineDistance = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx: number, yy: number;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

// 根据鼠标位置附近的路径线段计算光标（类似 draw.io）
const getCursorForPathSegment = (pathData: { id: string; path: string; direction?: 'horizontal' | 'vertical' }, event?: MouseEvent | Event) => {
  // 如果没有事件，使用预先计算的 direction
  if (!event || !(event.target instanceof SVGPathElement)) {
    return getCursorForConnection(pathData);
  }

  const path = event.target as SVGPathElement;
  const pathString = pathData.path;

  // 解析路径，获取所有点（起点 + 所有折角点）
  const firstMove = pathString.match(/M\s+([\d.-]+)\s+([\d.-]+)/);
  if (!firstMove) {
    return getCursorForConnection(pathData);
  }

  const points: Array<{ x: number; y: number }> = [];
  points.push({ x: parseFloat(firstMove[1]), y: parseFloat(firstMove[2]) });

  const allLines = pathString.matchAll(/L\s+([\d.-]+)\s+([\d.-]+)/g);
  for (const line of allLines) {
    points.push({ x: parseFloat(line[1]), y: parseFloat(line[2]) });
  }

  if (points.length < 2) {
    return getCursorForConnection(pathData);
  }

  // 获取鼠标在 content-layer 坐标系中的位置
  // 路径坐标是相对于 content-layer 的，需要将鼠标坐标也转换到 content-layer 坐标系
  const svg = path.ownerSVGElement;
  if (!svg) {
    return getCursorForConnection(pathData);
  }

  const mouseEvent = event as MouseEvent;

  // 使用 path 元素的 CTM 来转换坐标（这会自动考虑所有 transform，包括 content-layer）
  const pathCTM = path.getScreenCTM();
  if (!pathCTM) {
    return getCursorForConnection(pathData);
  }

  const svgPoint = svg.createSVGPoint();
  svgPoint.x = mouseEvent.clientX;
  svgPoint.y = mouseEvent.clientY;

  // 转换为 path 元素的本地坐标系（content-layer 坐标系）
  const pathPoint = svgPoint.matrixTransform(pathCTM.inverse());

  // 找到鼠标位置最近的线段（使用点到线段的垂直距离）
  let minDistance = Infinity;
  let closestSegmentDirection: 'horizontal' | 'vertical' | null = null;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    // 计算点到线段的垂直距离
    const distance = pointToLineDistance(pathPoint.x, pathPoint.y, p1.x, p1.y, p2.x, p2.y);

    if (distance < minDistance) {
      minDistance = distance;
      // 根据线段两端点的坐标判断方向
      const dx = Math.abs(p2.x - p1.x);
      const dy = Math.abs(p2.y - p1.y);

      // 判断线段方向：双箭头光标应该与连线方向一致
      // 水平线段（dx > dy）-> 使用水平双箭头（row-resize）
      // 垂直线段（dy > dx）-> 使用垂直双箭头（col-resize）
      if (dx > dy) {
        // 水平线段：使用水平双箭头（row-resize），箭头与水平连线平行
        closestSegmentDirection = 'horizontal';
      } else if (dy > dx) {
        // 垂直线段：使用垂直双箭头（col-resize），箭头与垂直连线平行
        closestSegmentDirection = 'vertical';
      } else {
        // 如果 dx 和 dy 相等或都很小，使用总体 direction 作为回退
        closestSegmentDirection = pathData.direction === 'horizontal' ? 'horizontal' : 'vertical';
      }
    }
  }

  // 如果找到最近线段，根据线段方向返回光标
  if (closestSegmentDirection !== null) {
    const result = closestSegmentDirection === 'horizontal' ? 'row-resize' : 'col-resize';
    return result;
  }

  // 回退到预先计算的 direction
  return getCursorForConnection(pathData);
};

// 等比补偿后的内容层缩放（保证节点等比、不被竖屏拉伸）
const scaleCompX = computed(() => (scale || 1) * (1 / (scaleX.value || 1)));
const scaleCompY = computed(() => (scale || 1) * (1 / (scaleY.value || 1)));

// 使网格在不同屏幕下保持恒定像素步长（小格 12.5px，大格 50px）
const svgRef = ref<SVGSVGElement | null>(null);
const clientW = ref(0);
const clientH = ref(0);
// 初次 body-middle 高度基线（.btc-grid-group__body-middle）：用于避免首屏就出现滚动条
const initialBodyMiddleH = ref<number>(0);
const currentBodyMiddleH = ref<number>(0);
let ro: ResizeObserver | null = null;
let rafId: number | null = null;

onMounted(() => {
  const el = svgRef.value as SVGSVGElement | null;
  if (!el) return;
  const update = () => {
    const rect = el.getBoundingClientRect();
    const newW = rect.width;
    const newH = rect.height;
    
    // 检查尺寸是否真的发生了变化，避免不必要的更新
    if (newW === clientW.value && newH === clientH.value) {
      return;
    }
    
    clientW.value = newW;
    clientH.value = newH;
    const bodyMiddle = el.closest('.btc-grid-group__body-middle') as HTMLElement | null;
    const bodyH = bodyMiddle ? bodyMiddle.getBoundingClientRect().height : rect.height;
    currentBodyMiddleH.value = bodyH;
    if (initialBodyMiddleH.value === 0 && bodyH > 0) {
      initialBodyMiddleH.value = bodyH;
    }
  };
  update();
  ro = new ResizeObserver(() => {
    // 使用 requestAnimationFrame 延迟执行，避免在 ResizeObserver 回调中同步修改 DOM
    // 这样可以避免 ResizeObserver loop 警告
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      update();
      rafId = null;
    });
  });
  ro.observe(el);
});

onBeforeUnmount(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (ro && svgRef.value) {
    ro.disconnect();
  }
  ro = null;
});

// viewBox单位到屏幕像素的缩放（根svg层面的缩放）
// 固定世界坐标尺寸（不扩展 viewBox），确保节点尺寸不随屏幕改变
const baseW = computed(() => canvasDimensions.width);
const baseH = computed(() => canvasDimensions.height);
// 根层像素缩放比
const scaleX = computed(() => clientW.value > 0 ? clientW.value / baseW.value : 1);
const scaleY = computed(() => clientH.value > 0 ? clientH.value / baseH.value : 1);

// SVG 尺寸样式：根据 draw.io 的结构，SVG 应该绝对定位，使用 100% 宽高填充容器
// 注意：不设置 z-index 和 min-width/min-height，依赖 DOM 顺序（在网格背景之后）来确保在上层
// SVG 的尺寸应该完全由容器控制，viewBox 定义了内部坐标系统
const svgSizeStyle = computed(() => ({
  position: 'absolute' as const,
  left: '0px',
  top: '0px',
  width: '100%',
  height: '100%',
  display: 'block' as const,
  backgroundImage: 'none'
}));
</script>

<style scoped>
.strategy-canvas {
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  /* 不设置 z-index，依赖 DOM 顺序确保在网格背景之上 */
}
</style>

<style>
/* 亮/暗主题网格颜色适配：使用自定义变量，默认跟随 EP 边框色，在暗色下提高对比 */
.strategy-canvas {
  /* 亮色主题下：更醒目的深色网格 */
  --btc-grid-small: rgba(0, 0, 0, 0.22);
  --btc-grid-big: rgba(0, 0, 0, 0.45);
}

/* 常见暗色标记：html.dark / :root.dark / [data-theme="dark"] */
html.dark .strategy-canvas,
:root.dark .strategy-canvas,
[data-theme="dark"] .strategy-canvas {
  /* 暗色下进一步提升亮度与对比度 */
  --btc-grid-small: rgba(255, 255, 255, 0.42);
  --btc-grid-big: rgba(255, 255, 255, 0.75);
}
</style>



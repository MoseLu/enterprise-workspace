<template>
  <el-scrollbar
    :class="containerClass"
    :style="containerStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    ref="scrollbarRef"
  >
    <div class="btc-container__content" :data-auto-fill="autoFill">
      <slot></slot>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { computed, useSlots, Comment, ref, onUnmounted, onMounted, nextTick } from 'vue';

export interface BtcContainerProps {
  /** 子组件之间的间距，默认 10px */
  gap?: number | string;
  /** 每行列数，不指定时根据子组件数量自动计算（不强制2列） */
  colsPerRow?: number;
  /** 每行最大列数（已废弃，使用 colsPerRow） */
  maxColsPerRow?: number;
  /** 是否使用自动填充响应式布局（repeat(auto-fill, minmax(...))），默认 false */
  autoFill?: boolean;
  /** 自动填充模式下的最小项目宽度，默认 300px */
  minItemWidth?: number | string;
}

const props = withDefaults(defineProps<BtcContainerProps>(), {
  gap: 10,
  autoFill: false,
  minItemWidth: 300
});

const slots = useSlots();
const scrollbarRef = ref<any>(null);
const isScrolling = ref(false);
const isHovering = ref(false);
let scrollTimer: ReturnType<typeof setTimeout> | null = null;

// 计算子组件数量
const childrenCount = computed(() => {
  if (!slots.default) return 0;
  return slots.default().filter(node =>
    node.type !== Comment &&
    (typeof node.type !== 'symbol' || node.children)
  ).length;
});

// 根据子组件数量智能计算每行列数
const colsPerRow = computed(() => {
  const count = childrenCount.value;
  if (count === 0) return 1;

  // 优先使用 colsPerRow，兼容旧的 maxColsPerRow
  const specifiedCols = props.colsPerRow ?? props.maxColsPerRow;
  if (specifiedCols) {
    return specifiedCols;
  }

  // 智能计算每行列数（不强制2列，根据数量灵活计算）
  if (count === 1) {
    return 1; // 1个：1列
  } else if (count === 2) {
    return 2; // 2个：2列1行
  } else if (count === 3) {
    return 3; // 3个：3列1行
  } else if (count === 4) {
    return 4; // 4个：4列1行
  } else {
    // 5个及以上：根据数量计算，尽量填满一行
    // 如果数量是偶数，使用2列；如果是奇数且大于5，使用3列
    return count <= 6 ? 3 : 4;
  }
});

// 计算需要的行数
const totalRows = computed(() => {
  const count = childrenCount.value;
  const cols = colsPerRow.value;
  return Math.ceil(count / cols);
});

// 判断是否需要滚动（当实际行数超过2行时，需要滚动）
const needsScroll = computed(() => {
  // 自动填充模式下不需要滚动限制
  if (props.autoFill) {
    return false;
  }
  const count = childrenCount.value;
  const cols = colsPerRow.value;
  const rows = Math.ceil(count / cols);
  // 当行数超过2行时，需要滚动
  return rows > 2;
});

// 计算间距值
const gapValue = computed(() => {
  return typeof props.gap === 'number' ? `${props.gap}px` : props.gap;
});

// 计算最小项目宽度值
const minItemWidthValue = computed(() => {
  return typeof props.minItemWidth === 'number' ? `${props.minItemWidth}px` : props.minItemWidth;
});

// 处理鼠标进入
const handleMouseEnter = () => {
  isHovering.value = true;
};

// 处理鼠标离开
const handleMouseLeave = () => {
  isHovering.value = false;
};

// 监听滚动事件（通过 el-scrollbar 的 wrap 元素）
const handleScroll = () => {
  if (!isScrolling.value) {
    isScrolling.value = true;
  }

  // 清除之前的定时器
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }

  // 滚动停止后延迟隐藏滚动条
  scrollTimer = setTimeout(() => {
    isScrolling.value = false;
  }, 1000);
};

// 在组件挂载后监听滚动事件
onMounted(() => {
  nextTick(() => {
    if (scrollbarRef.value?.wrapRef) {
      scrollbarRef.value.wrapRef.addEventListener('scroll', handleScroll);
    }
  });
});

// 容器样式类
const containerClass = computed(() => {
  return {
    'btc-container': true,
    'btc-container--scrollable': needsScroll.value,
    'btc-container--show-scrollbar': isScrolling.value || isHovering.value
  };
});

// 清理定时器和事件监听
onUnmounted(() => {
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }
  if (scrollbarRef.value?.wrapRef) {
    scrollbarRef.value.wrapRef.removeEventListener('scroll', handleScroll);
  }
});

// 容器样式
const containerStyle = computed(() => {
  const baseStyle: Record<string, string> = {
    '--btc-container-gap': gapValue.value,
    '--btc-container-total-items': childrenCount.value.toString(),
    '--btc-container-mobile-rows': childrenCount.value.toString()
  };

  if (props.autoFill) {
    // 自动填充模式：使用 minmax 布局
    baseStyle['--btc-container-min-width'] = minItemWidthValue.value;
  } else {
    // 固定列数模式：使用原有的列数和行数
    baseStyle['--btc-container-cols'] = colsPerRow.value.toString();
    baseStyle['--btc-container-rows'] = needsScroll.value ? '2' : totalRows.value.toString();
  }

  return baseStyle;
});
</script>

<style lang="scss" scoped>
// Element Plus 滚动条容器样式（参考 cool-admin 插件列表展示逻辑）
.btc-container {
  width: 100%;
  height: 100%;
  // 确保容器使用 flex 布局，能够自适应填充父容器
  // 如果父容器是 flex 布局，使用 flex: 1 自适应；否则使用 height: 100%
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;

  // Element Plus 滚动条内部包装器样式
  :deep(.el-scrollbar) {
    height: 100%;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
    // 预留滚动条空间，避免布局抖动
    scrollbar-gutter: stable;
    flex: 1;
    min-height: 0;
    height: 100%;
  }

  :deep(.el-scrollbar__view) {
    height: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  // 滚动条视图内容区域
  .btc-container__content {
    // 使用 Grid 布局
    display: grid;
    gap: var(--btc-container-gap);
    width: 100%;
    height: 100%;
    min-height: 100%;

    // 确保内容区域至少填充父容器
    align-content: start;

    // 自动填充模式：使用 repeat(auto-fill, minmax(...))
    &[data-auto-fill="true"] {
      grid-template-columns: repeat(auto-fill, minmax(var(--btc-container-min-width), 1fr));
      // 使用 1fr 行高，让行高填充可用空间
      grid-auto-rows: 1fr;
    }

    // 固定列数模式：使用计算出的列数和行数
    &:not([data-auto-fill="true"]) {
      grid-template-columns: repeat(var(--btc-container-cols), 1fr);
      // 使用 1fr 行高，让行高填充可用空间，确保图表能够充分利用空间
      grid-auto-rows: 1fr;

      // 响应式断点：中等屏幕及以下强制单列布局
      @media (max-width: 1200px) {
        // 中等屏幕时强制单列布局
        grid-template-columns: 1fr !important;

        // 保持 auto 行高
        grid-auto-rows: auto !important;
      }
    }

    // 平板屏幕
    @media (max-width: 768px) {
      gap: calc(var(--btc-container-gap) * 0.9); // 稍微减少间距
    }

    // 手机屏幕
    @media (max-width: 480px) {
      gap: calc(var(--btc-container-gap) * 0.8); // 进一步减少间距
    }

    // 确保子元素填满网格项
    > * {
      width: 100%;
      height: 100%; // 让子元素填充网格行的高度
      min-width: 0; // 防止内容溢出
      box-sizing: border-box; // 确保边框包含在尺寸内
    }
  }

  // Element Plus 滚动条样式定制（参考 cool-admin 插件列表展示逻辑）
  // 透明轨道，半透明滑块（默认 opacity 0），悬停或滚动时淡入
  :deep(.el-scrollbar__bar) {
    &.is-vertical {
      right: 0;
      width: 6px;

      .el-scrollbar__thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
        opacity: 0; // 默认完全透明
        transition: opacity 0.3s ease-in-out;
      }
    }
  }

  // 悬停或滚动时显示滚动条
  &.btc-container--show-scrollbar {
    :deep(.el-scrollbar__bar.is-vertical .el-scrollbar__thumb) {
      opacity: 1; // 淡入显示
    }
  }

  // 暗色模式滚动条
  @media (prefers-color-scheme: dark) {
    :deep(.el-scrollbar__bar.is-vertical .el-scrollbar__thumb) {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}
</style>

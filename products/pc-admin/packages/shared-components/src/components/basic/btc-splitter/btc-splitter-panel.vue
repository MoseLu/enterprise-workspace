<template>
  <div
    ref="panelEl"
    class="btc-splitter-panel"
    :class="{ 'is-collapsed': panelSize === 0 }"
    :style="{ flexBasis: `${panelSize}px` }"
    v-bind="$attrs"
  >
    <!-- 强制渲染标题栏 -->
    <div class="btc-splitter-panel__header" :class="{ 'has-icon': index >= 1 }">
      <!-- 折叠/展开图标（从第二栏开始显示，位于头部最左侧） -->
      <!-- 层级折叠逻辑：
           - 第二栏（index=1）的按钮控制第一栏（index=0）
           - 第三栏（index=2）的按钮控制前两栏（index=0,1）
           - 以此类推：第 index 栏的按钮控制所有前面的栏（index-1, index-2, ..., 0）
      -->
      <template v-if="index >= 1">
        <!-- 从第二栏开始，每个栏都有一个按钮，控制所有前面的栏 -->
        <CollapseButton
          :panel-index="index"
          :target-indices="getPreviousIndices(index)"
          :show="true"
        />
      </template>

      <slot name="header" :column-index="index">
        <!-- 默认空标题栏，但必须渲染 -->
        <span class="title"></span>
      </slot>
    </div>

    <!-- 强制渲染内容栏 -->
    <div class="btc-splitter-panel__content">
      <slot name="content" :column-index="index">
        <!-- 默认空内容，但必须渲染 -->
      </slot>
    </div>
  </div>

  <!-- 拖拽条（最后一个面板不渲染） -->
  <BtcSplitterBar
    v-if="isShowBar"
    :index="index"
    :layout="layout"
    :lazy="lazy"
    :resizable="isResizable"
    :start-collapsible="startCollapsible"
    :end-collapsible="endCollapsible"
    @move-start="onMoveStart"
    @moving="onMoving"
    @move-end="onMoveEnd"
    @collapse="onCollapse"
  >
    <template #start-collapsible>
      <slot name="start-collapsible" />
    </template>
    <template #end-collapsible>
      <slot name="end-collapsible" />
    </template>
  </BtcSplitterBar>
</template>

<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  inject,
  markRaw,
  nextTick,
  onBeforeUnmount,
  reactive,
  ref,
  toRefs,
  watch,
} from 'vue';
import { getCollapsible, isCollapsible } from './hooks/usePanel';
import BtcSplitterBar from './btc-splitter-bar.vue';
import CollapseButton from './CollapseButton.vue';
import { getPct, getPx, isPct, isPx } from './hooks';
import { splitterRootContextKey } from './types';
import type { BtcSplitterPanelProps, BtcSplitterPanelEmits } from './types';

defineOptions({
  name: 'BtcSplitterPanel',
});

const props = withDefaults(defineProps<BtcSplitterPanelProps>(), {
  resizable: true,
});

const emits = defineEmits<BtcSplitterPanelEmits>();

const splitterContext = inject(splitterRootContextKey);
if (!splitterContext) {
  throw new Error(
    '[BtcSplitterPanel] usage: <btc-splitter><btc-splitter-panel /></btc-splitter>'
  );
}

const { panels, layout, lazy, containerSize, pxSizes } = toRefs(splitterContext);

const {
  registerPanel,
  unregisterPanel,
  onCollapse,
  onMoveEnd,
  onMoveStart,
  onMoving,
} = splitterContext;

const panelEl = ref<HTMLDivElement>();
const instance = getCurrentInstance()!;
const uid = instance.uid;

const index = ref(0);
const panel = computed(() => panels.value[index.value]);

const setIndex = (val: number) => {
  index.value = val;
};

const panelSize = computed(() => {
  if (!panel.value) return 0;
  return pxSizes.value[index.value] ?? 0;
});

const nextSize = computed(() => {
  if (!panel.value) return 0;
  return pxSizes.value[index.value + 1] ?? 0;
});

const nextPanel = computed(() => {
  if (panel.value) {
    return panels.value[index.value + 1];
  }
  return null;
});

const isResizable = computed(() => {
  if (!nextPanel.value) return false;
  return (
    props.resizable &&
    nextPanel.value?.resizable &&
    // If it is 0, it means it is collapsed => check if the minimum value is set
    (panelSize.value !== 0 || !props.min) &&
    (nextSize.value !== 0 || !nextPanel.value.min)
  );
});

// The last panel doesn't need a drag bar
const isShowBar = computed(() => {
  if (!panel.value) return false;
  return index.value !== panels.value.length - 1;
});

const startCollapsible = computed(() =>
  isCollapsible(panel.value, panelSize.value, nextPanel.value, nextSize.value)
);

const endCollapsible = computed(() =>
  isCollapsible(nextPanel.value, nextSize.value, panel.value, panelSize.value)
);

// 获取前面所有栏的索引（用于层级折叠）
// 例如：index=2 时，返回 [1, 0]（控制第二栏和第一栏）
const getPreviousIndices = (currentIndex: number): number[] => {
  const indices: number[] = [];
  for (let i = currentIndex - 1; i >= 0; i--) {
    indices.push(i);
  }
  return indices;
};

function sizeToPx(str: string | number | undefined) {
  if (isPct(str)) {
    return getPct(str) * containerSize.value || 0;
  } else if (isPx(str)) {
    return getPx(str);
  }
  return str ?? 0;
}

// Two-way binding for size
// 注意：与 Element Plus 保持一致，panel.value.size 存储转换后的像素值（数字）
// 但是，我们需要保留原始值（字符串），以便在容器大小变化时重新计算百分比值
let isSizeUpdating = false;
// 保存原始 size 值（字符串），用于处理百分比值
const originalSizeStr = ref<string | number | undefined>(props.size);

watch(
  () => props.size,
  () => {
    if (!isSizeUpdating && panel.value) {
      // 保存原始值（如果是字符串，保留；如果是数字，也保留）
      originalSizeStr.value = props.size;
      
      if (!containerSize.value) {
        // 容器大小未初始化时，如果是数字则直接存储，如果是字符串则存储 0
        panel.value.size = typeof props.size === 'number' ? props.size : 0;
        return;
      }

      // 将 props.size 转换为像素值
      const size = sizeToPx(props.size);
      const maxSize = sizeToPx(props.max);
      const minSize = sizeToPx(props.min);

      // 确保在最大和最小值范围内
      const finalSize = Math.min(Math.max(size, minSize || 0), maxSize || size);

      if (finalSize !== size) {
        // 如果超出范围，触发 update:size 事件
        emits('update:size', finalSize);
      }

      // 存储转换后的像素值（数字），与 Element Plus 保持一致
      // 不使用 flush: 'sync'，使用默认的 flush: 'pre'，确保与 element-plus 行为一致
      // 这样可以确保 CSS transition 能够正确工作
      panel.value.size = finalSize;
    }
  },
  { immediate: true }
);

// 监听容器大小变化，如果是百分比值，需要重新计算
watch(
  containerSize,
  () => {
    if (!isSizeUpdating && panel.value && containerSize.value && originalSizeStr.value) {
      // 如果原始值是百分比字符串，需要重新计算
      if (isPct(originalSizeStr.value)) {
        const size = sizeToPx(originalSizeStr.value);
        const maxSize = sizeToPx(props.max);
        const minSize = sizeToPx(props.min);
        const finalSize = Math.min(Math.max(size, minSize || 0), maxSize || size);
        panel.value.size = finalSize;
      }
    }
  }
);

watch(
  () => panel.value?.size,
  (val) => {
    // 只有当值真正变化时才触发 update:size 事件
    // 注意：val 现在是数字（像素值），与 Element Plus 保持一致
    if (val !== undefined) {
      const currentSizePx = sizeToPx(props.size);
      if (val !== currentSizePx) {
        isSizeUpdating = true;
        // 传递像素值（数字）
        emits('update:size', val);
        nextTick(() => (isSizeUpdating = false));
      }
    }
  }
);

watch(
  () => props.resizable,
  (val) => {
    if (panel.value) {
      panel.value.resizable = val;
    }
  }
);

const _panel = reactive({
  el: panelEl.value!,
  uid,
  // 使用 markRaw 避免 VNode 的循环引用导致栈溢出
  getVnode: () => markRaw(instance.vnode),
  setIndex,
  ...props,
  collapsible: computed(() => getCollapsible(props.collapsible)),
});

registerPanel(_panel);

onBeforeUnmount(() => unregisterPanel(_panel));

// Update panel element reference
watch(panelEl, (el) => {
  if (el && _panel) {
    _panel.el = el;
  }
});

defineExpose({
  /** @description splitter-panel html element */
  splitterPanelRef: panelEl,
});
</script>

<style lang="scss" scoped>
.btc-splitter-panel {
  position: relative;
  overflow: hidden;
  background-color: var(--el-bg-color);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  // 添加推移动画，参考 btc-view-group
  transition: flex-basis 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: flex-basis;
  // 确保 flex-basis 过渡在所有场景下都能正常工作
  // 清除 min-width 和 max-width 限制，避免干扰 flex-basis 的过渡
  // 参考 Element Plus：只设置 flex-grow: 0，不设置 flex-shrink（使用默认值 1，允许收缩）
  min-width: 0;
  max-width: none;
  flex-grow: 0;

  &__header {
    height: 40px;
    min-height: 40px;
    max-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    font-size: 14px;
    border-bottom: 1px solid var(--el-border-color-extra-light);
    flex-shrink: 0;
    background-color: var(--el-bg-color);
    box-sizing: border-box;
    line-height: 40px;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;
    min-width: 0;
    // 防止折叠过程中文本宽度骤变为0
    text-overflow: ellipsis;

    .title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 15px;
      font-weight: 500;
      line-height: normal;
    }

    // 折叠/展开图标（完全参考 btc-view-group 的 .icon 样式）
    :deep(.icon) {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      height: 26px;
      width: 26px;
      font-size: 16px;
      border-radius: 50%;
      color: var(--el-text-color-regular);
      transition: transform 0.2s ease-in-out;

      .btc-svg {
        outline: none;
        font-size: 16px;
      }

      &:hover {
        background-color: var(--el-fill-color-light);
        color: var(--el-text-color-primary);
      }

      &.is-bg {
        background-color: var(--el-fill-color-lighter);
      }

      &.absolute {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
      }

      &.is-fold {
        transform: translateY(-50%) rotate(180deg);
      }

      &.left-\[10px\] {
        left: 10px;
      }
    }

    :deep(> *) {
      &:not(.icon) {
        line-height: normal;
        height: auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    background-color: var(--el-bg-color);
    min-height: 0;
    white-space: nowrap;
    height: calc(100% - 40px);
    // 防止折叠过程中文本宽度骤变为0
    text-overflow: ellipsis;
    // 确保展开时恢复正常的定位和宽度
    position: relative;
    width: 100%;

    :deep(> *) {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  // 折叠状态：参考 cl-view-group，只通过 overflow: hidden 隐藏内容，不单独处理 header 和 content
  // 这样可以让整个面板平滑折叠，内容自然被隐藏，不会出现 header 和 content 分别消失的动画
  // 注意：flex-basis 的过渡动画仍然生效，确保从展开到折叠（或从折叠到展开）的平滑过渡
  &.is-collapsed {
    flex-basis: 0 !important;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    // 不单独处理 header 和 content，让它们通过父容器的 overflow: hidden 自然隐藏
    
    // 关键：在折叠时，让内容区域保持其展开时的宽度，避免内容重新布局
    // 使用 position: absolute 脱离文档流，这样即使父容器宽度为 0，内容也不会被压缩
    .btc-splitter-panel__content {
      // 使用 position: absolute 脱离文档流，保持内容宽度不变
      position: absolute !important;
      left: 0;
      top: 40px; // header 高度
      bottom: 0;
      // 使用 CSS 变量传递的宽度（如果存在），否则使用 max-content
      // 这样可以让内容在折叠时保持展开时的宽度
      width: var(--btc-filter-list-collapsed-width, max-content) !important;
      min-width: var(--btc-filter-list-collapsed-width, max-content) !important;
      // 确保内容区域可以超出父容器，但会被父容器的 overflow: hidden 隐藏
      max-width: none !important;
    }
  }
  
  // 确保所有宽度变化（包括尺寸切换）都有平滑过渡
  // 注意：transition 已经在根元素上设置，不需要在 &:not(.is-collapsed) 中重复设置
  // 重复设置可能会导致冲突，影响动画的连续性
}
</style>

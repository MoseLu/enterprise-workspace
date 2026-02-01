<template>
  <div
    v-if="show"
    class="icon is-bg absolute left-[10px]"
    :class="{ 'is-fold': areAllCollapsed }"
    @click.stop="handleClick"
  >
    <BtcSvg name="back" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick } from 'vue';
import BtcSvg from '../btc-svg/index.vue';
import { splitterRootContextKey } from './types';
import type { SplitterRootContext } from './types';

defineOptions({
  name: 'CollapseButton',
  components: {
    BtcSvg,
  },
});

const props = defineProps<{
  panelIndex: number; // 当前面板索引
  targetIndices: number[]; // 要折叠/展开的目标面板索引数组（层级折叠：控制所有前面的栏）
  show: boolean; // 是否显示按钮
}>();

// 注入 splitter context
const splitterContext = inject<SplitterRootContext | undefined>(splitterRootContextKey);

// 判断所有目标面板是否都已折叠
const areAllCollapsed = computed(() => {
  if (!splitterContext || props.targetIndices.length === 0) return false;
  return props.targetIndices.every(targetIndex => {
    const size = splitterContext.pxSizes[targetIndex];
    return size === 0;
  });
});

// 处理点击：层级折叠/展开
// 第三栏的按钮控制前两栏，第二栏的按钮控制第一栏
// 如果前面的栏都已折叠，则全部展开；否则全部折叠
// 
// Element Plus 的 onCollapse 逻辑（根据 useResize.ts）：
// - onCollapse(dragBarIndex, 'end'): 
//   - currentIndex = dragBarIndex + 1（拖拽条右侧的面板）
//   - targetIndex = dragBarIndex（拖拽条左侧的面板）
//   - 如果两个面板都未折叠，则折叠 currentIndex（右侧面板），将大小加到 targetIndex（左侧面板）
//   - 如果其中一个已折叠，则切换状态（展开已折叠的面板）
// - onCollapse(dragBarIndex, 'start'):
//   - currentIndex = dragBarIndex（拖拽条左侧的面板）
//   - targetIndex = dragBarIndex + 1（拖拽条右侧的面板）
//   - 如果两个面板都未折叠，则折叠 currentIndex（左侧面板），将大小加到 targetIndex（右侧面板）
//   - 如果其中一个已折叠，则切换状态（展开已折叠的面板）
// 
// 对于第三栏（index=2）控制前两栏（index=0,1）：
// - 要折叠第一栏（index=0），调用 onCollapse(0, 'start') - 折叠拖拽条0左侧的面板（index=0）
// - 要折叠第二栏（index=1），调用 onCollapse(1, 'start') - 折叠拖拽条1左侧的面板（index=1）
// - 折叠顺序：从后往前（先折叠第二栏，再折叠第一栏），避免布局冲突
// - 展开顺序：从前往后（先展开第一栏，再展开第二栏）
const handleClick = () => {
  if (!splitterContext || props.targetIndices.length === 0) return;
  
  // 使用可逆的折叠/展开操作
  // 折叠时保存状态，展开时恢复状态
  splitterContext.togglePanels(props.panelIndex, props.targetIndices);
};
</script>

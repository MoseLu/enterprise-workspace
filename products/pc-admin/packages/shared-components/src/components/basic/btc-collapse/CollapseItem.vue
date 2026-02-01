<template>
  <div 
    class="btc-collapse-item" 
    :class="{ 'is-active': isActive }"
  >
    <div 
      class="btc-collapse-item__header"
      @click="handleHeaderClick"
    >
      <!-- 左侧：全选框（通过插槽传入，与选项框对齐） -->
      <div class="btc-collapse-item__checkbox">
        <slot name="checkbox" />
      </div>
      <!-- 中间：标题内容 -->
      <div class="btc-collapse-item__title">
        <slot name="title" />
      </div>
      <!-- 右侧：折叠箭头 -->
      <div class="btc-collapse-item__arrow" :class="{ 'is-active': isActive }">
        <svg viewBox="0 0 1024 1024" width="16" height="16" fill="currentColor">
          <path d="M384 192l384 320-384 320V192z" />
        </svg>
      </div>
    </div>
    <Transition name="collapse">
      <div v-if="isActive" class="btc-collapse-item__content">
        <div class="btc-collapse-item__content-inner">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue';
;


defineOptions({
  name: 'BtcCollapseItem',
});

interface Props {
  name: string | number;
}

const props = defineProps<Props>();

// 从父组件获取 collapse 上下文
const collapseContext = inject<{
  activeNames: Ref<string[]>;
  accordion: boolean;
  handleItemClick: (name: string) => void;
}>('collapse');

if (!collapseContext) {
  console.warn('[BtcCollapseItem] must be used inside BtcCollapse');
}

// 判断当前项是否展开
const isActive = computed(() => {
  if (!collapseContext) return false;
  if (!collapseContext.activeNames) return false;
  
  const name = String(props.name);
  const activeNamesValue = collapseContext.activeNames.value;
  
  // 确保 activeNamesValue 是数组
  if (!Array.isArray(activeNamesValue)) {
    console.warn('[BtcCollapseItem] activeNames.value is not an array:', activeNamesValue);
    return false;
  }
  
  return activeNamesValue.includes(name);
});

// 处理标题点击
const handleHeaderClick = () => {
  if (collapseContext) {
    collapseContext.handleItemClick(String(props.name));
  }
};
</script>

<style lang="scss" scoped>
.btc-collapse-item {
  margin-bottom: 10px;
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
  background-color: var(--el-bg-color);

  &:last-child {
    margin-bottom: 0;
  }

  &__header {
    padding: 8px 10px; // 与 content-inner 的 padding-left 保持一致，确保对齐
    font-size: 14px;
    overflow: visible;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
    height: auto;
    min-height: auto;
    line-height: 1.5;
    display: flex;
    align-items: center;
    gap: 12px; // 统一间距：全选框、文本、计数之间的间距
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--el-fill-color-lighter);
    }
  }

  &__checkbox {
    flex-shrink: 0; // 不收缩
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin: 0; // 移除 margin，使用 gap 统一控制间距
    width: auto; // 自适应宽度
    min-width: 0; // 允许收缩
  }

  &__arrow {
    flex-shrink: 0; // 不收缩
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;
    color: var(--el-text-color-secondary);
    pointer-events: auto; // 允许箭头按钮可以点击
    margin: 0; // 移除 margin，使用 gap 统一控制间距
    margin-left: auto; // 靠右对齐

    &.is-active {
      transform: rotate(90deg);
    }

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__title {
    display: flex;
    align-items: center;
    line-height: 1.5;
    height: 100%;
    flex: 1;
    min-width: 0;
    margin: 0; // 移除 margin，使用 gap 统一控制间距
  }

  &__content {
    overflow: hidden;
    background-color: var(--el-bg-color);
  }

  &__content-inner {
    padding: 4px 10px; // 与 header 的 padding-left 保持一致，确保全选框和选项框对齐
    padding-bottom: 0;
  }
}

// 折叠动画
.collapse-enter-active,
.collapse-leave-active {
  transition: height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  height: 0 !important;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
}
</style>

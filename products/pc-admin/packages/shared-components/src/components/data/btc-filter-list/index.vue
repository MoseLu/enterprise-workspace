<template>
  <div ref="rootRef" class="btc-filter-list" :class="[`is-size-${currentSize}`, { 'is-no-wrap': !props.optionWrap }]">
    <!-- 顶部区域：搜索和已选标签（只有有内容时才显示） -->
    <div v-if="hasHeaderContent" ref="headerRef" class="btc-filter-list__header">
      <!-- 搜索框和设置按钮 -->
      <SearchWrapper
        v-if="enableSearch && !hasHeaderActionsSlot"
        :enable-search="enableSearch"
        :current-size="currentSize"
        :size-options="sizeOptions"
        :search-keyword="searchKeyword"
        :instance-id="instanceId"
        @update:search-keyword="searchKeyword = $event"
        @size-change="handleSizeChangeWrapper"
      />

      <!-- 已选标签展示区 -->
      <TagsContainer
        ref="tagsContainerComponentRef"
        :show-tags-container="showTagsContainer"
        :has-scrolling-row="hasScrollingRow"
        :category-tag-rows="categoryTagRows"
        :scrolling-rows="scrollingRows"
        :row-remaining-space-map="rowRemainingSpaceMap"
        :tags-container-height="tagsContainerHeight"
        :get-tag-type="getTagType"
        :set-row-ref="setRowRef"
        @tag-close="handleTagCloseWrapper"
        @collapse-tag-click="handleCollapseTagClickWrapper"
        @collapse-btn-click="handleCollapseBtnClickWrapper"
      />
    </div>

    <!-- 内容区域：分类卡片列表 -->
    <CategoryList
      ref="categoryListRef"
      :loading="loading"
      :filtered-categories="filteredCategories"
      v-model:active-categories="activeCategories"
      :selected-values="selectedValues"
      :is-category-all-selected="isCategoryAllSelected"
      :is-category-indeterminate="isCategoryIndeterminate"
      :get-selected-count="getSelectedCount"
      :option-wrap="props.optionWrap"
      :instance-id="instanceId"
      @category-select-all="handleCategorySelectAllWrapper"
      @selection-change="handleSelectionChangeWrapper"
      @collapse-change="handleCollapseChangeWrapper"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch, useSlots, getCurrentInstance } from 'vue';
import type { BtcFilterListProps, BtcFilterListEmits } from './types';
import { useSizeManagement } from './composables/useSizeManagement';
import { useDataLoading } from './composables/useDataLoading';
import { useSelectionState } from './composables/useSelectionState';
import { useCollapseState } from './composables/useCollapseState';
import { useTagCalculation } from './composables/useTagCalculation';
import { useTagLayout } from './composables/useTagLayout';
import { useFilterLogic } from './composables/useFilterLogic';
import { useEventHandlers } from './composables/useEventHandlers';
import SearchWrapper from './components/SearchWrapper.vue';
import TagsContainer from './components/TagsContainer.vue';
import CategoryList from './components/CategoryList.vue';

defineOptions({
  name: 'BtcFilterList'
});

const props = withDefaults(defineProps<BtcFilterListProps>(), {
  title: '',
  enableSearch: true,
  defaultExpandedCount: 3,
  multiple: true,
  showTagsContainer: true,
  size: 'default',
  storageKey: '',
  optionWrap: true,
});

const emit = defineEmits<BtcFilterListEmits>();

// 生成唯一的实例 ID（用于确保表单字段 ID 唯一）
const instance = getCurrentInstance();
const instanceId = computed(() => {
  // 优先使用 storageKey（如果提供），否则使用组件实例的 uid
  return props.storageKey || `instance-${instance?.uid || Date.now()}`;
});

// 根元素引用
const rootRef = ref<HTMLElement | null>(null);
// 头部元素引用
const headerRef = ref<HTMLElement | null>(null);

// 插槽
const slots = useSlots();

// 是否提供了 header-actions 插槽
const hasHeaderActionsSlot = computed(() => !!slots['header-actions']);

// 尺寸管理
const { currentSize, sizeOptions, handleSizeChange: handleSizeChangeInternal } = useSizeManagement(
  props as BtcFilterListProps,
  emit
);

// 数据加载（需要排除 undefined，防止类型不匹配）
const { loading, categories, loadData } = useDataLoading({
  service: props.service,
  category: props.category,
});

// 搜索关键词
const searchKeyword = ref('');


// 选择状态管理（需要先定义，因为其他 composables 会用到）
const {
  selectedValues,
  getSelectedCount,
  isCategoryAllSelected,
  isCategoryIndeterminate,
  handleCategorySelectAll: handleCategorySelectAllInternal,
  handleSelectionChange: handleSelectionChangeInternal,
  handleTagClose: handleTagCloseInternal,
  clearAll,
} = useSelectionState(categories, emit as any);

// 标签布局
const {
  maxTagsPerRowMap,
  defaultMaxTagsPerRow,
  scrollingRows,
  hasScrollingRow,
  rowRemainingSpaceMap,
  tagsContainerHeight,
  setRowRef,
  triggerCalculateRemainingSpace,
  handleCollapseTagClick: handleCollapseTagClickInternal,
  handleCollapseBtnClick: handleCollapseBtnClickInternal,
  handleClickOutside: handleClickOutsideInternal,
  handleWindowResize: handleWindowResizeInternal,
} = useTagLayout(categories, currentSize);

// 标签计算
const { categoryTagRows, getTagType } = useTagCalculation(
  categories,
  selectedValues,
  maxTagsPerRowMap,
  defaultMaxTagsPerRow
);

// 展开/折叠状态管理
const {
  activeCategories,
  initDefaultExpanded,
  handleCollapseChange: handleCollapseChangeInternal,
  autoExpandCategory,
} = useCollapseState(categories, props);

// CategoryList 组件引用
const categoryListRef = ref<any>(null);
// Tag 容器组件引用（从 TagsContainer 组件获取）
const tagsContainerComponentRef = ref<any>(null);
// Tag 容器引用（从 TagsContainer 组件获取）
const tagsContainerRef = computed(() => tagsContainerComponentRef.value?.tagsContainerRef || null);
const tagsScrollbarRef = computed(() => tagsContainerComponentRef.value?.tagsScrollbarRef || null);

// 筛选逻辑
const { hasHeaderContent, filteredCategories } = useFilterLogic(
  searchKeyword,
  categories,
  props.enableSearch,
  hasHeaderActionsSlot,
  hasScrollingRow,
  props.showTagsContainer
);

// 事件处理（整合所有包装函数）
const {
  handleSizeChangeWrapper,
  handleCategorySelectAllWrapper,
  handleSelectionChangeWrapper,
  handleTagCloseWrapper,
  handleCollapseTagClickWrapper,
  handleCollapseBtnClickWrapper,
  handleCollapseChangeWrapper,
  handleClickOutsideWrapper,
  handleWindowResizeWrapper,
} = useEventHandlers(
  selectedValues,
  maxTagsPerRowMap,
  tagsContainerRef,
  tagsScrollbarRef,
  handleSizeChangeInternal,
  handleCategorySelectAllInternal,
  handleSelectionChangeInternal,
  handleTagCloseInternal,
  handleCollapseTagClickInternal,
  handleCollapseBtnClickInternal,
  handleCollapseChangeInternal,
  handleClickOutsideInternal,
  handleWindowResizeInternal,
  autoExpandCategory,
  triggerCalculateRemainingSpace
);

// 监听 props.size 的变化
watch(() => props.size, (newSize) => {
  if (newSize) {
    currentSize.value = newSize;
  }
  // 尺寸变化时，清空 maxTagsPerRowMap，让 categoryTagRows 先使用默认估算值
  maxTagsPerRowMap.value = {};
  // 尺寸变化时，容器宽度会改变，需要重新计算标签溢出
  triggerCalculateRemainingSpace(tagsContainerRef.value || null);
}, { immediate: true });

// 注意：滚动现在由全局 .container 统一处理，不需要手动计算高度

// 组件挂载
onMounted(async () => {
  await loadData();
  initDefaultExpanded();
  // 延迟计算，确保 DOM 已渲染
  nextTick(() => {
    triggerCalculateRemainingSpace(tagsContainerRef.value || null);
  });

  // 绑定全局事件：点击容器外空白区域恢复
  document.addEventListener('click', handleClickOutsideWrapper);

  // 绑定窗口尺寸变化事件
  window.addEventListener('resize', handleWindowResizeWrapper);
});

// 组件卸载
onUnmounted(() => {
  // 移除事件监听
  document.removeEventListener('click', handleClickOutsideWrapper);
  window.removeEventListener('resize', handleWindowResizeWrapper);
});

// 暴露方法和状态供父组件使用
defineExpose({
  searchKeyword,
  currentSize,
  handleSizeChange: handleSizeChangeWrapper,
  sizeOptions,
  clearAll: () => clearAll(() => {
    triggerCalculateRemainingSpace(tagsContainerRef.value || null);
  }),
});
</script>

<style lang="scss" scoped>
@import './styles/index.scss';
</style>

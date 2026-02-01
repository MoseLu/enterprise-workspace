<template>
  <div class="btc-tabs-category-container" :class="containerClass">
    <!-- 垂直布局：左侧 tabs + 右侧内容 -->
    <template v-if="isVerticalLayout">
      <div class="btc-tabs-category-container__tabs-wrapper btc-tabs-category-container__tabs-wrapper--vertical">
        <BtcTabs
          ref="tabsRef"
          type="vertical"
          :tabs="tabs"
          :model-value="activeCategory"
          :default-tab="defaultCategory"
          @update:model-value="handleTabChange"
          @tab-change="handleTabChangeEvent"
        />
      </div>
      <div 
        class="btc-tabs-category-container__content-wrapper btc-tabs-category-container__content-wrapper--vertical"
        :style="{ padding: typeof contentPadding === 'number' ? `${contentPadding}px` : contentPadding }"
      >
        <BtcContainer
          :gap="gap"
          :cols-per-row="colsPerRow"
          :auto-fill="autoFill"
          :min-item-width="minItemWidth"
        >
          <slot
            :name="getCategorySlotName(activeCategory)"
            :category="activeCategoryData"
            :index="activeCategoryIndex"
            :active-category="activeCategory"
          >
            <slot
              name="default"
              :category="activeCategoryData"
              :index="activeCategoryIndex"
              :active-category="activeCategory"
            >
              <slot name="empty" :category="activeCategoryData">
                <div class="btc-tabs-category-container__empty">暂无内容</div>
              </slot>
            </slot>
          </slot>
        </BtcContainer>
      </div>
    </template>

    <!-- 水平布局：顶部 tabs + 下方内容 -->
    <template v-else>
      <div class="btc-tabs-category-container__tabs-wrapper btc-tabs-category-container__tabs-wrapper--horizontal">
        <BtcTabs
          type="horizontal"
          :tabs="tabs"
          :model-value="activeCategory"
          :default-tab="defaultCategory"
          @update:model-value="handleTabChange"
          @tab-change="handleTabChangeEvent"
        />
      </div>
      <div class="btc-tabs-category-container__content-wrapper btc-tabs-category-container__content-wrapper--horizontal">
        <BtcContainer
          :gap="gap"
          :cols-per-row="colsPerRow"
          :auto-fill="autoFill"
          :min-item-width="minItemWidth"
        >
          <slot
            :name="getCategorySlotName(activeCategory)"
            :category="activeCategoryData"
            :index="activeCategoryIndex"
            :active-category="activeCategory"
          >
            <slot
              name="default"
              :category="activeCategoryData"
              :index="activeCategoryIndex"
              :active-category="activeCategory"
            >
              <slot name="empty" :category="activeCategoryData">
                <div class="btc-tabs-category-container__empty">暂无内容</div>
              </slot>
            </slot>
          </slot>
        </BtcContainer>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import BtcTabs from '../../navigation/btc-tabs/index.vue';
import BtcContainer from '../btc-container/index.vue';
import type { BtcTab } from '../../navigation/btc-tabs/index.vue';

export interface BtcCategory {
  /** 分类唯一标识 */
  name: string | number;
  /** 分类显示标签 */
  label: string;
  /** 分类下的元素数量（用于自动布局判断） */
  count?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义数据，可通过插槽访问 */
  data?: any;
}

const props = withDefaults(defineProps<{
  /** 分类数据数组 */
  categories: BtcCategory[];
  /** 当前激活的分类名称 */
  modelValue?: string | number;
  /** 默认激活的分类名称 */
  defaultCategory?: string | number;
  /** 布局方向，'auto' 表示自动选择 */
  layout?: 'auto' | 'horizontal' | 'vertical';
  /** 垂直布局时左侧 tabs 的宽度 */
  verticalTabsWidth?: number | string;
  /** 内容区域的内边距 */
  contentPadding?: number | string;
  /** 内容区域子元素之间的间距 */
  gap?: number | string;
  /** 内容区域每行列数（传递给 BtcContainer） */
  colsPerRow?: number;
  /** 是否使用自动填充响应式布局 */
  autoFill?: boolean;
  /** 自动填充模式下的最小项目宽度 */
  minItemWidth?: number | string;
}>(), {
  categories: () => [],
  layout: 'auto',
  verticalTabsWidth: 160,
  gap: 10,
  autoFill: false,
  minItemWidth: 300,
  contentPadding: 10
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'category-change': [category: BtcCategory, index: number];
}>();

// 当前激活的分类
const activeCategory = ref<string | number>('');

// Tabs 组件引用
const tabsRef = ref<InstanceType<typeof BtcTabs> | null>(null);

// 将 BtcCategory 转换为 BtcTab
const tabs = computed<BtcTab[]>(() => {
  return props.categories.map(category => ({
    name: category.name,
    label: category.label,
    disabled: category.disabled
  }));
});

// 判断是否使用垂直布局
const isVerticalLayout = computed(() => {
  if (props.layout === 'vertical') return true;
  if (props.layout === 'horizontal') return false;
  
  // 自动判断逻辑
  const categoryCount = props.categories.length;
  const maxCategoryCount = Math.max(...props.categories.map(c => c.count || 0));
  
  // 分类数量 >= 4 个，或单个分类的元素数量 >= 20 个，使用垂直布局
  return categoryCount >= 4 || maxCategoryCount >= 20;
});

// 当前激活的分类数据
const activeCategoryData = computed(() => {
  return props.categories.find(c => c.name === activeCategory.value) || props.categories[0];
});

// 当前激活的分类索引
const activeCategoryIndex = computed(() => {
  return props.categories.findIndex(c => c.name === activeCategory.value);
});

// 容器样式类
const containerClass = computed(() => {
  return {
    'btc-tabs-category-container--vertical': isVerticalLayout.value,
    'btc-tabs-category-container--horizontal': !isVerticalLayout.value
  };
});

// 获取分类插槽名称
const getCategorySlotName = (categoryName: string | number) => {
  return `category-${categoryName}`;
};

// 处理 tab 切换
const handleTabChange = (value: string | number) => {
  activeCategory.value = value;
  emit('update:modelValue', value);
};

// 处理 tab-change 事件
const handleTabChangeEvent = (tab: BtcTab, index: number) => {
  const category = props.categories[index];
  if (category) {
    emit('category-change', category, index);
  }
};

// 初始化激活的分类
const initActiveCategory = () => {
  if (props.modelValue !== undefined) {
    activeCategory.value = props.modelValue;
  } else if (props.defaultCategory !== undefined) {
    activeCategory.value = props.defaultCategory;
  } else if (props.categories.length > 0) {
    const firstCategory = props.categories[0];
    if (firstCategory) {
      activeCategory.value = firstCategory.name;
    }
  }
};

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined && newValue !== activeCategory.value) {
    activeCategory.value = newValue;
  }
}, { immediate: true });

// 监听 categories 变化，重新初始化
watch(() => props.categories, () => {
  initActiveCategory();
}, { immediate: true });


// 初始化
initActiveCategory();
</script>

<style lang="scss" scoped>
.btc-tabs-category-container {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;

  // 垂直布局
  &--vertical {
    flex-direction: row;

    .btc-tabs-category-container__tabs-wrapper {
      flex-shrink: 0;
      width: v-bind('typeof verticalTabsWidth === "number" ? `${verticalTabsWidth}px` : verticalTabsWidth');
      border-right: 1px solid var(--el-border-color);
      overflow: hidden;
      position: relative; // 确保下划线定位正确
    }

    .btc-tabs-category-container__content-wrapper {
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }
  }

  // 水平布局
  &--horizontal {
    flex-direction: column;

    .btc-tabs-category-container__tabs-wrapper {
      flex-shrink: 0;
      border-bottom: 1px solid var(--el-border-color);
    }

    .btc-tabs-category-container__content-wrapper {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
  }

  // Tabs 包装器
  &__tabs-wrapper {
    background-color: var(--el-bg-color);
  }

  // 内容包装器
  &__content-wrapper {
    background-color: var(--el-bg-color-page);
    
    // 垂直布局时，内容区域有内边距
    &--vertical {
      box-sizing: border-box;
    }
  }

  // 空状态
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--el-text-color-placeholder);
    font-size: 14px;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .btc-tabs-category-container {
    &--vertical {
      // 小屏幕时，垂直布局的 tabs 宽度缩小
      .btc-tabs-category-container__tabs-wrapper {
        width: 160px;
      }
    }
  }
}

@media (max-width: 480px) {
  .btc-tabs-category-container {
    &--vertical {
      // 超小屏幕时，可以考虑切换为水平布局
      // 或者进一步缩小 tabs 宽度
      .btc-tabs-category-container__tabs-wrapper {
        width: 120px;
      }
    }
  }
}
</style>

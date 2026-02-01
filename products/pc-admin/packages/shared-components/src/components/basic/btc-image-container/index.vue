<template>
  <div class="btc-image-container-wrapper">
    <el-scrollbar class="btc-image-container">
      <div class="btc-image-container__flex">
        <ImageCard
          v-for="item in filteredItems"
          :key="item.id"
          :item="item"
          @click="handleCardClick"
        />
      </div>
    </el-scrollbar>

    <!-- 悬浮筛选栏 - 放在滚动容器外部，避免随内容滚动 -->
    <FilterGlassGroup
      v-if="enableFilter && filterCategories && filterCategories.length > 0"
      :categories="filterCategories"
      :sticky-top="filterStickyTop"
      @filter-change="handleFilterChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElScrollbar } from 'element-plus';
import ImageCard from './components/ImageCard.vue';
import FilterGlassGroup from './components/FilterGlassGroup.vue';
import type { ImageItem, BtcImageContainerProps } from './types';
import type { FilterResult } from '../../data/btc-filter-list/types';

defineOptions({
  name: 'BtcImageContainer',
});

const props = withDefaults(defineProps<BtcImageContainerProps>(), {
  columns: 3,
  gap: 16,
  enableFilter: true,
  filterStickyTop: 0,
});

const emit = defineEmits<{
  'card-click': [item: ImageItem];
  'filter-change': [result: FilterResult[]];
}>();

// 筛选结果
const filterResult = ref<FilterResult[]>([]);

// 处理筛选变化
const handleFilterChange = (result: FilterResult[]) => {
  filterResult.value = result;
  emit('filter-change', result);
};

// 根据筛选结果过滤图片
const filteredItems = computed(() => {
  if (!props.enableFilter || !filterResult.value || filterResult.value.length === 0) {
    return props.items;
  }

  return props.items.filter(item => {
    // 对每个筛选条件进行匹配
    return filterResult.value.every(filter => {
      const categoryId = filter.name;
      const selectedValues = filter.value;

      // 根据不同的分类 ID 进行匹配
      switch (categoryId) {
        case 'category':
          // 匹配分类
          return !selectedValues.length || selectedValues.some(value => {
            const valStr = String(value);
            if (Array.isArray(item.category)) {
              return item.category.map(String).includes(valStr);
            }
            return String(item.category) === valStr || String(item.category).includes(valStr);
          });
        case 'resolution':
          // 匹配分辨率
          return !selectedValues.length || selectedValues.some(value =>
            item.resolution?.includes(String(value)) ||
            item.resolution === value
          );
        case 'colorScheme':
          // 匹配色系
          return !selectedValues.length || selectedValues.some(value =>
            item.colorScheme?.includes(String(value)) ||
            item.colorScheme === value
          );
        case 'tags':
          // 匹配标签
          return !selectedValues.length || selectedValues.some(value =>
            item.tags?.includes(String(value))
          );
        default:
          // 默认匹配：检查 item 中是否有对应的字段
          const itemValue = item[categoryId];
          return !selectedValues.length || selectedValues.some(value => {
            if (Array.isArray(itemValue)) {
              return itemValue.includes(value);
            }
            return String(itemValue).includes(String(value)) || itemValue === value;
          });
      }
    });
  });
});

const handleCardClick = (item: ImageItem) => {
  emit('card-click', item);
};
</script>

<style lang="scss" scoped>
.btc-image-container-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.btc-image-container {
  flex: 1;
  height: 0; // 确保 flex 生效
  width: 100%;
  height: 100%;
  // 确保父容器支持3D变换
  // 参考示例：使用800px透视值，强化3D立体感
  transform-style: preserve-3d;
  perspective: 800px;

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
    // 确保滚动容器也支持3D变换
    transform-style: preserve-3d;
    // perspective 应该设置在直接包含变换元素的容器上
    // 参考示例：使用800px透视值，强化3D立体感
    perspective: 800px;
  }

  &__flex {
    display: grid;
    // 减小最小宽度以适应 padding，避免溢出
    // padding 左右各40px，3列布局时需要考虑总宽度
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 38.3906px 76.7812px;
    width: 100%;
    min-height: 100%;
    // 为3D倾斜效果预留空间，避免卡片倾斜时被裁剪
    // 右侧需要更多空间，因为卡片向右倾斜时会超出
    padding: 40px 80px 40px 40px; // 上 右 下 左，右侧更大
    margin: 0;
    justify-items: center;
    align-items: start;
    // 确保Grid容器支持3D变换，让子元素的倾斜效果生效
    transform-style: preserve-3d;
    // 使用 box-sizing 确保 padding 包含在宽度内
    box-sizing: border-box;

    // 响应式调整：根据屏幕宽度自动调整列数和卡片大小
    @media (max-width: 600px) {
      grid-template-columns: 1fr;
      gap: 19.2px;
      padding: 20px 40px 20px 20px; // 小屏幕减小 padding，但右侧仍保持较大
    }

    @media (min-width: 601px) and (max-width: 900px) {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 19.2px 38.3906px;
      padding: 30px 60px 30px 30px; // 中等屏幕适当减小 padding，右侧更大
    }

    @media (min-width: 901px) and (max-width: 1200px) {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 19.2px 57.5859px;
      padding: 35px 70px 35px 35px;
    }

    @media (min-width: 1201px) and (max-width: 1600px) {
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 19.2px 76.7812px;
      padding: 40px 80px 40px 40px;
    }

    @media (min-width: 1601px) {
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 19.2px 76.7812px;
      padding: 40px 80px 40px 40px;
    }
  }
}
</style>

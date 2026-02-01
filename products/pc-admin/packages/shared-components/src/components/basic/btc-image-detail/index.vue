<template>
  <div class="btc-image-detail" v-loading="loading">
    <div v-if="currentImage" class="btc-image-detail__container">
      <!-- 预览块：图片 + 信息 -->
      <div class="btc-image-detail__preview-block">
        <!-- 左侧：主图片区域 -->
        <div class="btc-image-detail__image-col">
          <ImageViewer :image="currentImage" />
        </div>

        <!-- 右侧：信息区域 -->
        <div class="btc-image-detail__info-col">
          <!-- 基本信息 -->
          <ImageInfo :image="currentImage" />

          <!-- 操作按钮 -->
          <ImageActions 
            :image="currentImage" 
            @download="handleDownload"
            @favorite="handleFavorite"
            @share="handleShare"
          />

          <!-- 推广卡片 -->
          <ImagePromo @click="handlePromoClick" />
        </div>
      </div>

      <!-- 底部：相似推荐 -->
      <div v-if="showRelated && relatedImages.length > 0" class="btc-image-detail__related">
        <RelatedImages :related-images="relatedImages" @related-click="handleRelatedClick" />
      </div>
    </div>

    <div v-else-if="!currentImage" class="btc-image-detail__empty">
      <el-empty description="暂无图片数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { ElEmpty } from 'element-plus';
import ImageViewer from './components/ImageViewer.vue';
import ImageInfo from './components/ImageInfo.vue';
import ImageActions from './components/ImageActions.vue';
import ImagePromo from './components/ImagePromo.vue';
import RelatedImages from './components/RelatedImages.vue';
import type { ImageDetailProps, ImageDetailEmits } from './types';
import type { ImageItem } from '../btc-image-container/types';

defineOptions({
  name: 'BtcImageDetail',
});

const props = withDefaults(defineProps<ImageDetailProps>(), {
  showRelated: true,
});

const emit = defineEmits<ImageDetailEmits>();

const loading = ref(false);
const currentImage = ref<ImageItem | null>(null);
const relatedImages = ref<ImageItem[]>([]);

// 检查是否有参数信息
const hasParams = computed(() => {
  if (!currentImage.value) return false;
  return !!(
    currentImage.value.chartType ||
    currentImage.value.chartConfig ||
    currentImage.value.dataSource ||
    currentImage.value.dataRange
  );
});

// 加载图片数据
const loadImage = async () => {
  if (props.image) {
    currentImage.value = props.image;
    return;
  }

  if (props.imageId) {
    loading.value = true;
    try {
      // TODO: 实现 API 调用
    } catch (error) {
      console.error('加载图片详情失败:', error);
    } finally {
      loading.value = false;
    }
  }
};

// 加载相关图片
const loadRelatedImages = async () => {
  if (!currentImage.value || !props.showRelated) return;
  // TODO: 实现相关图片的加载逻辑
};

// 监听 props 变化
watch(
  () => [props.image, props.imageId],
  () => {
    loadImage();
  },
  { immediate: true }
);

watch(
  () => currentImage.value,
  () => {
    if (currentImage.value) {
      loadRelatedImages();
    }
  }
);

onMounted(() => {
  loadImage();
});

const handleRelatedClick = (image: ImageItem) => {
  emit('related-click', image);
  currentImage.value = image;
  loadRelatedImages();
};

const handleDownload = (image: ImageItem) => {
  emit('download', image);
};

const handleFavorite = (image: ImageItem) => {
  emit('favorite', image);
};

const handleShare = (image: ImageItem, platform: string) => {
  emit('share', image, platform);
};

const handlePromoClick = () => {
  // TODO: 处理推广卡片点击
  console.log('推广卡片点击');
};
</script>

<style lang="scss" scoped>
.btc-image-detail {
  width: 100%;
  min-height: 100%; // 最小高度为100%，确保占据完整高度
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;

  &__container {
    width: 100%;
    min-height: 100%; // 最小高度为100%，确保占据完整高度
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    flex: 1; // 占据剩余空间
  }

  &__preview-block {
    display: flex;
    flex-direction: row;
    justify-content: center; // 居中显示
    align-items: center; // 垂直居中
    gap: 32px;
    width: 100%;
    max-width: 1200px; // 限制最大宽度，避免内容分散
    margin: 0 auto 32px; // 居中显示
    padding: 0;
    flex-wrap: nowrap;
    flex: 1; // 占据剩余空间，确保有足够高度
    min-height: 600px; // 设置最小高度，确保有足够空间
  }

  // 左侧图片区域（宽度较大，动态响应式）
  &__image-col {
    flex: 0 0 auto;
    // 左侧宽度更大：约60-65%的可用空间
    width: min(60vw, 650px);
    min-width: 8rem;
    max-width: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center; // 垂直居中
    justify-content: center;
  }

  // 右侧信息区域（宽度较小，动态响应式，高度略大于MacBook，玻璃拟态效果）
  &__info-col {
    flex: 0 0 auto;
    // 右侧宽度：参考样式是486px，使用动态响应式
    width: min(35vw, 486px);
    min-width: 8rem;
    max-width: 100%;
    margin: 0;
    padding: 16px;
    position: relative; // 确保z-index生效
    z-index: 10; // 高于MacBook的z-index（MacBook base的z-index是2），确保卡片在上层
    // 玻璃拟态效果：半透明白色背景 + 模糊背景
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); // 轻微阴影增强层次感
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto; // 内容超出时可滚动
    overflow-x: hidden;
    // 高度略大于MacBook：移除max-height限制，让高度自适应内容
    // 参考样式高度是620px，略大于MacBook屏幕高度
    height: fit-content; // 自适应内容高度
    min-height: 400px; // 最小高度
  }

  // 相似推荐区域（底部）
  &__related {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  &__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }

  // 响应式调整
  @media (max-width: 1150px) {
    &__preview-block {
      flex-direction: column;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    &__image-col {
      // 响应式宽度
      width: min(90vw, 650px);
      min-width: 8rem;
      max-width: 100%;
      order: 1;
    }

    &__info-col {
      // 响应式宽度
      width: min(90vw, 486px);
      min-width: 8rem;
      max-width: 100%;
      height: auto; // 移动端自适应高度
      min-height: 400px;
      align-self: auto; // 移动端恢复默认对齐
      order: 2;
    }
  }

  @media (max-width: 768px) {
    &__preview-block {
      gap: 16px;
    }

    &__info-col {
      padding: 12px 10px 6px;
      border-radius: 16px;
      gap: 12px;
    }
  }
}
</style>

<template>
  <div class="btc-masonry-gallery" ref="galleryRef">
    <div class="masonry-container" ref="containerRef">
      <div
        v-for="(column, colIndex) in columns"
        :key="colIndex"
        class="masonry-column"
        :style="{ width: columnWidth }"
      >
        <div
          v-for="(item, itemIndex) in column"
          :key="item.id || `${colIndex}-${itemIndex}`"
          class="masonry-item"
          @click="handleItemClick(item, getItemIndex(item))"
        >
          <div class="item-wrapper">
            <picture>
              <!-- WebP 格式（优先使用） -->
              <source
                v-if="item.src.endsWith('.webp')"
                :srcset="item.src"
                type="image/webp"
              />
              <!-- JPG/PNG 降级方案 -->
              <img
                :src="item.fallback || item.src"
                :alt="item.alt || `图片 ${itemIndex + 1}`"
                class="masonry-image"
                loading="lazy"
                decoding="async"
                @load="onImageLoad($event, item)"
                @error="(e) => onImageErrorWithFallback(e, item.fallback || item.src)"
              />
            </picture>
            <div v-if="item.title || item.description" class="item-overlay">
              <h3 v-if="item.title" class="item-title">{{ item.title }}</h3>
              <p v-if="item.description" class="item-description">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <div v-if="previewItem" class="preview-modal" @click="closePreview">
      <div class="preview-content" @click.stop>
        <button class="preview-close" @click="closePreview">&times;</button>
        <img 
          :src="previewItem.src" 
          :alt="previewItem.alt || '预览图片'" 
          class="preview-image"
          loading="eager"
          decoding="sync"
        />
        <div v-if="previewItem.title || previewItem.description" class="preview-info">
          <h3 v-if="previewItem.title" class="preview-title">{{ previewItem.title }}</h3>
          <p v-if="previewItem.description" class="preview-description">{{ previewItem.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { getOptimizedImageProps, getWebPUrl, checkWebPSupport, getCdnFallbackUrl } from '@/utils/image-optimizer';

defineOptions({
  name: 'BtcMasonryGallery',
});

export interface MasonryItem {
  id?: string | number;
  src: string;
  alt?: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  fallback?: string; // JPG/PNG 降级方案
}

const props = withDefaults(
  defineProps<{
    items: MasonryItem[];
    columns?: number | 'auto';
    gap?: number;
  }>(),
  {
    columns: 'auto',
    gap: 16,
  }
);

const emit = defineEmits<{
  itemClick: [item: MasonryItem, index: number];
}>();

const galleryRef = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
const columnCount = ref<number>(3);
const columns = ref<MasonryItem[][]>([]);
const previewItem = ref<MasonryItem | null>(null);
const imageHeights = new Map<string | number, number>();

// WebP 支持检测（缓存结果）
const supportsWebP = ref(false);
onMounted(() => {
  supportsWebP.value = checkWebPSupport();
});

// 获取 WebP URL 的辅助函数
const getWebPImageUrl = (src: string): string => {
  return getWebPUrl(src);
};

// 计算列数
const calculateColumns = () => {
  if (typeof props.columns === 'number') {
    columnCount.value = props.columns;
    return;
  }

  if (!galleryRef.value) {
    // 如果容器还没有渲染，使用默认值
    columnCount.value = 3;
    return;
  }

  const width = galleryRef.value.offsetWidth || window.innerWidth;
  if (width >= 1200) {
    columnCount.value = 4;
  } else if (width >= 768) {
    columnCount.value = 3;
  } else if (width >= 480) {
    columnCount.value = 2;
  } else {
    columnCount.value = 1;
  }
};

// 计算列宽度
const columnWidth = computed(() => {
  const totalGap = props.gap * (columnCount.value - 1);
  return `calc((100% - ${totalGap}px) / ${columnCount.value})`;
});

// 初始化列数组
const initColumns = () => {
  columns.value = Array.from({ length: columnCount.value }, () => []);
};

// 找到高度最低的列
const findShortestColumn = (): number => {
  if (columns.value.length === 0) return 0;

  let shortestIndex = 0;
  let shortestHeight = getColumnHeight(0);

  for (let i = 1; i < columns.value.length; i++) {
    const height = getColumnHeight(i);
    if (height < shortestHeight) {
      shortestHeight = height;
      shortestIndex = i;
    }
  }

  return shortestIndex;
};

// 获取列的高度
const getColumnHeight = (columnIndex: number): number => {
  if (!containerRef.value) return 0;

  const columnElement = containerRef.value.children[columnIndex] as HTMLElement;
  if (!columnElement) return 0;

  return columnElement.offsetHeight;
};

// 布局图片（真正的瀑布流算法）
const layoutImages = async () => {
  if (!containerRef.value || !galleryRef.value) return;

  // 确保列数已正确计算
  if (columnCount.value <= 0) {
    calculateColumns();
  }

  // 如果列数还是0或1，使用默认值
  if (columnCount.value <= 0) {
    columnCount.value = 3;
  }

  initColumns();
  imageHeights.clear();

  // 等待 DOM 更新
  await nextTick();

  // 遍历所有图片，使用轮询方式分配到各列
  // 这样可以确保图片均匀分布到所有列，形成瀑布流效果
  for (let i = 0; i < props.items.length; i++) {
    const item = props.items[i];
    // 使用轮询方式：第0张图片到第0列，第1张到第1列，以此类推
    const targetColumnIndex = i % columnCount.value;

    if (targetColumnIndex >= 0 && targetColumnIndex < columns.value.length) {
      columns.value[targetColumnIndex].push(item);
    }
  }

  // 等待图片加载完成后，重新优化布局
  await nextTick();
  await waitForImagesLoad();
};

// 注意：不再使用重新平衡布局，因为会导致布局跳动
// 初始分配已经保证了图片的均匀分布，后续图片会根据列高度自动分配到最矮的列

// 等待所有图片加载完成
const waitForImagesLoad = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!containerRef.value) {
      resolve();
      return;
    }

    const images = containerRef.value.querySelectorAll('img');
    let loadedCount = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      resolve();
      return;
    }

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        // 所有图片加载完成，但不重新分配布局
        // 因为初始分配已经保证了图片分布，重新分配会导致布局跳动
        resolve();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkComplete();
      } else {
        img.addEventListener('load', checkComplete, { once: true });
        img.addEventListener('error', checkComplete, { once: true });
      }
    });
  });
};

// 获取图片在原始数组中的索引
const getItemIndex = (item: MasonryItem): number => {
  return props.items.findIndex((i) => i.id === item.id || i.src === item.src);
};

// 处理图片点击 - 显示预览
const handleItemClick = (item: MasonryItem, index: number) => {
  previewItem.value = item;
  emit('itemClick', item, index);
};

// 关闭预览
const closePreview = () => {
  previewItem.value = null;
};

// 图片加载完成
const onImageLoad = (event: Event, item: MasonryItem) => {
  const img = event.target as HTMLImageElement;
  img.style.opacity = '1';
  imageHeights.set(item.id || item.src, img.offsetHeight);
};

// 图片加载错误处理（多级降级：WebP -> JPG/PNG -> CDN）
const onImageErrorWithFallback = (event: Event, currentSrc: string) => {
  const img = event.target as HTMLImageElement;
  if (!img) return;
  
  // 获取当前图片项
  const item = props.items.find(i => i.fallback === currentSrc || i.src === currentSrc);
  
  // 第一级降级：如果 WebP 失败，尝试 JPG/PNG
  if (item?.fallback && img.src === item.src) {
    img.src = item.fallback;
    return;
  }
  
  // 第二级降级：如果本地图片都失败，尝试 CDN
  const cdnUrl = getCdnFallbackUrl(currentSrc);
  if (img.src !== cdnUrl) {
    img.src = cdnUrl;
    // 清除错误处理，避免无限循环
    img.onerror = null;
  } else {
    // 如果已经是 CDN URL 还失败，调用原始错误处理
    onImageError(event);
  }
};

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.opacity = '0.3';
};

// 防抖函数
let resizeTimer: ReturnType<typeof setTimeout>;
const handleResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    calculateColumns();
    layoutImages();
  }, 300);
};

// 监听 items 变化
watch(
  () => props.items,
  () => {
    layoutImages();
  },
  { deep: true }
);

// 监听列数变化
watch(columnCount, () => {
  layoutImages();
});

onMounted(async () => {
  // 等待 DOM 渲染完成后再计算
  await nextTick();

  // 如果容器宽度为0，使用 window.innerWidth 作为后备
  if (galleryRef.value && galleryRef.value.offsetWidth === 0) {
    // 使用 requestAnimationFrame 确保布局完成
    requestAnimationFrame(() => {
      calculateColumns();
      nextTick(() => {
        layoutImages();
      });
    });
  } else {
    calculateColumns();
    await nextTick();
    await layoutImages();
  }

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  clearTimeout(resizeTimer);
});
</script>

<style scoped lang="scss">
.btc-masonry-gallery {
  width: 100%;
  padding: 0;
  position: relative;

  .masonry-container {
    display: flex;
    gap: v-bind('`${gap}px`');
    width: 100%;
  }

  .masonry-column {
    display: flex;
    flex-direction: column;
    gap: v-bind('`${gap}px`');
  }

  .masonry-item {
    cursor: pointer;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 0.4s ease,
                filter 0.3s ease;
    border-radius: 16px;
    overflow: visible;
    background: transparent;
    width: 100%;
    padding: 8px;
    position: relative;

    // 添加装饰性边框
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 16px;
      padding: 2px;
      background: linear-gradient(135deg, rgba(199, 0, 0, 0.1), rgba(199, 0, 0, 0.05));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    // 添加光晕效果
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(199, 0, 0, 0.15) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      transition: width 0.4s ease, height 0.4s ease, opacity 0.3s ease;
      opacity: 0;
      pointer-events: none;
      z-index: 1;
    }

    &:hover {
      transform: translateY(-12px) scale(1.03);
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.25),
                  0 8px 16px rgba(199, 0, 0, 0.15),
                  0 4px 8px rgba(199, 0, 0, 0.1);
      filter: brightness(1.08) contrast(1.05);

      &::before {
        opacity: 1;
        background: linear-gradient(135deg, rgba(199, 0, 0, 0.3), rgba(199, 0, 0, 0.15));
      }

      &::after {
        width: 120%;
        height: 120%;
        opacity: 1;
      }

      .item-wrapper {
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15),
                    0 4px 10px rgba(199, 0, 0, 0.1);

        .masonry-image {
          transform: scale(1.08);
          filter: brightness(1.1) saturate(1.1);
        }
      }
    }

    .item-wrapper {
      position: relative;
      width: 100%;
      overflow: hidden;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1),
                  0 2px 4px rgba(0, 0, 0, 0.06);
      background: #ffffff;
      transition: box-shadow 0.3s ease;

      .masonry-image {
        width: 100%;
        height: auto;
        display: block;
        opacity: 0;
        transition: opacity 0.4s ease,
                    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        object-fit: cover;
        border-radius: 12px;
      }

      .item-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(
          to top,
          rgba(0, 0, 0, 0.85) 0%,
          rgba(0, 0, 0, 0.6) 50%,
          transparent 100%
        );
        padding: 24px 20px 20px;
        color: #ffffff;
        opacity: 0;
        transition: opacity 0.4s ease,
                    transform 0.4s ease,
                    padding 0.4s ease;
        border-radius: 0 0 12px 12px;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        transform: translateY(10px);

        // 添加顶部光效
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(199, 0, 0, 0.6) 50%,
            transparent 100%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .item-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #ffffff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease;
          transform: translateY(5px);
        }

        .item-description {
          font-size: 14px;
          margin: 0;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease 0.1s;
          transform: translateY(5px);
        }
      }

      &:hover .item-overlay {
        opacity: 1;
        transform: translateY(0);
        padding: 28px 20px 24px;

        &::before {
          opacity: 1;
        }

        .item-title {
          transform: translateY(0);
        }

        .item-description {
          transform: translateY(0);
        }
      }
    }

    // 添加随机旋转效果（轻微）
    &:nth-child(3n + 1) {
      transform: rotate(-0.5deg);
    }

    &:nth-child(3n + 2) {
      transform: rotate(0.5deg);
    }

    &:nth-child(3n) {
      transform: rotate(-0.3deg);
    }

    &:hover {
      transform: translateY(-8px) scale(1.02) rotate(0deg) !important;
    }
  }

  // 图片预览模态框
  .preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    cursor: pointer;

    .preview-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: default;

      .preview-close {
        position: absolute;
        top: -40px;
        right: 0;
        background: transparent;
        border: none;
        color: #ffffff;
        font-size: 40px;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.2);
        }
      }

      .preview-image {
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
        border-radius: 8px;
      }

      .preview-info {
        margin-top: 20px;
        text-align: center;
        color: #ffffff;

        .preview-title {
          font-size: 24px;
          font-weight: bold;
          margin: 0 0 8px 0;
        }

        .preview-description {
          font-size: 16px;
          margin: 0;
          line-height: 1.6;
          opacity: 0.9;
        }
      }
    }
  }
}
</style>


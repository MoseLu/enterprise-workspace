<template>
  <div class="image-detail-page">
    <BtcImageDetail
      v-if="imageData || imageId"
      :image-id="imageId"
      :image="imageData"
      :show-related="true"
      @tag-click="handleTagClick"
      @related-click="handleRelatedClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BtcImageDetail } from '@btc/shared-components';
import type { ImageItem } from '@btc/shared-components';

defineOptions({
  name: 'ImageDetail',
});

const route = useRoute();
const router = useRouter();

// 从路由参数获取图片ID
const imageId = computed(() => {
  return route.params.id as string | number;
});

// 从 sessionStorage 或路由 state 获取图片数据
const imageData = ref<ImageItem | undefined>(undefined);

// 从 sessionStorage 或路由 state 中提取图片数据的函数
const extractImageData = () => {
  const id = imageId.value;
  if (!id) return undefined;

  // 优先从 sessionStorage 获取
  const storageKey = `image_detail_${id}`;
  const storedData = sessionStorage.getItem(storageKey);
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      // 获取后清除，避免占用存储空间
      sessionStorage.removeItem(storageKey);
      return parsed;
    } catch (e) {
      console.error('解析 sessionStorage 数据失败:', e);
    }
  }

  // 备选：尝试从路由 state 获取
  const historyState = window.history.state;
  if (historyState) {
    const stateData = historyState.state || historyState;
    if (stateData && stateData.imageData) {
      return stateData.imageData;
    }
  }

  return undefined;
};

// 监听路由变化
watch(
  () => route.params.id,
  async () => {
    await nextTick();
    const data = extractImageData();
    if (data) {
      imageData.value = data;
      console.log('获取到图片数据:', imageData.value);
    } else {
      console.warn('未找到图片数据，imageId:', imageId.value);
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await nextTick();
  const data = extractImageData();
  if (data) {
    imageData.value = data;
    console.log('从存储获取到图片数据:', imageData.value);
  } else {
    console.warn('未找到图片数据，imageId:', imageId.value);
  }
});

const handleTagClick = (tag: string) => {
  console.log('点击了标签:', tag);
  // TODO: 可以跳转到标签列表页
};

const handleRelatedClick = (image: ImageItem) => {
  // 跳转到相关图片的详情页，通过 state 传递图片数据
  router.push({
    name: 'TestImageDetail',
    params: { id: image.id },
    state: { imageData: image },
  });
};
</script>

<style lang="scss" scoped>
.image-detail-page {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden; // 防止子元素超出
}
</style>

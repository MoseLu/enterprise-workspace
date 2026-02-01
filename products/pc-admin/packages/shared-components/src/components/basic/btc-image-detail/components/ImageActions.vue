<template>
  <div class="btc-image-actions">
    <!-- 分割线 -->
    <div class="divider"></div>
    
    <!-- 底部操作按钮栏 - Flex布局 -->
    <div class="card-actions">
      <button class="action-btn" @click="handleDownload">
        <span class="btn-icon"></span>
        <span>下载</span>
      </button>
      <button 
        class="action-btn" 
        :class="{ active: isFavorited }"
        @click="handleFavorite"
      >
        <span class="btn-icon"></span>
        <span>收藏</span>
      </button>
      <button class="action-btn" @click="handleShare('douyin')">
        <span class="btn-icon"></span>
        <span>抖音</span>
      </button>
      <button class="action-btn" @click="handleShare('group')">
        <span class="btn-icon"></span>
        <span>群聊</span>
      </button>
      <button class="action-btn" @click="handleShare('wechat')">
        <span class="btn-icon"></span>
        <span>公众号</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ImageItem } from '../../btc-image-container/types';

defineOptions({
  name: 'ImageActions',
});

interface Props {
  image: ImageItem;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  download: [image: ImageItem];
  favorite: [image: ImageItem];
  share: [image: ImageItem, platform: string];
}>();

const isFavorited = ref(false);

const handleDownload = () => {
  emit('download', props.image);
};

const handleFavorite = () => {
  isFavorited.value = !isFavorited.value;
  emit('favorite', props.image);
};

const handleShare = (platform: string) => {
  emit('share', props.image, platform);
};
</script>

<style lang="scss" scoped>
.btc-image-actions {
  width: 100%;

  // 分割线
  .divider {
    height: 1px;
    background: rgba(0, 0, 0, 0.1);
    margin: 12px 0;
  }

  // 底部操作按钮栏 - Flex布局
  .card-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap; // 适配小屏换行

    .action-btn {
      flex: 1;
      min-width: 60px;
      height: 36px;
      background: rgba(245, 245, 245, 0.8);
      border-radius: 8px;
      border: none;
      outline: none;
      cursor: pointer;
      font-size: 14px;
      color: var(--el-text-color-primary);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(232, 232, 232, 0.9);
      }

      &.active {
        background: #e8f0fe; // 选中状态
        color: #1677ff;
      }

      .btn-icon {
        width: 14px;
        height: 14px;
        background: #ccc; // 按钮图标占位
        border-radius: 2px;
      }
    }
  }
}
</style>

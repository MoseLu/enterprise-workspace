<template>
  <div class="btc-image-info">
    <!-- 顶部信息区 - Grid布局实现两列排版 -->
    <div class="card-top">
      <div class="info-item" v-if="image.category">
        <span class="icon"></span>
        <span>分类：<span class="value">{{ image.category }}</span></span>
      </div>
      <div class="info-item" v-if="image.resolution">
        <span class="icon"></span>
        <span>分辨率：<span class="value">{{ image.resolution }}</span></span>
      </div>
      <div class="info-item" v-if="image.colorScheme">
        <span class="icon"></span>
        <span>色系：<span class="value">{{ image.colorScheme }}</span></span>
      </div>
      <div class="info-item" v-if="image.fileSize">
        <span class="icon"></span>
        <span>大小：<span class="value">{{ image.fileSize }}</span></span>
      </div>
      <div class="info-item" v-if="image.downloads !== undefined">
        <span class="icon"></span>
        <span>下载量：<span class="value">{{ image.downloads }}</span></span>
      </div>
      <div class="info-item" v-if="image.favorites !== undefined">
        <span class="icon"></span>
        <span>收藏量：<span class="value">{{ image.favorites }}</span></span>
      </div>
      <div class="info-item" v-if="image.publishDate">
        <span class="icon"></span>
        <span>发布时间：<span class="value">{{ image.publishDate }}</span></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImageItem } from '../../btc-image-container/types';

defineOptions({
  name: 'ImageInfo',
});

interface Props {
  image: ImageItem;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.btc-image-info {
  width: 100%;
  padding: 0;
  margin: 0;

  // 顶部信息区 - Grid布局实现两列排版，挖空设计
  .card-top {
    display: grid;
    grid-template-columns: repeat(2, 1fr); // 两列均分
    gap: 12px;
    width: 100%;
    padding: 16px;
    // 挖空设计：使用半透明深色背景和内阴影创建凹陷效果
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    // 挖空设计的内阴影效果
    box-shadow: 
      inset 0 2px 8px rgba(0, 0, 0, 0.4),
      inset 0 1px 4px rgba(0, 0, 0, 0.3),
      0 2px 12px rgba(0, 0, 0, 0.2),
      0 1px 4px rgba(0, 0, 0, 0.15);
    // 边框高光，增强立体感
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    margin-bottom: 16px;
    
    // 顶部高光，增强挖空效果
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(to right, 
        transparent 0%, 
        rgba(255, 255, 255, 0.2) 50%, 
        transparent 100%);
      border-radius: 16px 16px 0 0;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: var(--el-text-color-primary);

      .icon {
        width: 16px;
        height: 16px;
        background: #e5e5e5; // 图标占位
        border-radius: 2px;
        flex-shrink: 0;
      }

      .value {
        color: var(--el-text-color-regular);
        margin-left: 4px;
      }
    }
  }
}
</style>

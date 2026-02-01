<template>
  <div v-if="relatedImages.length > 0" class="btc-related-images">
    <span class="title-span">
      <i class="el-icon"></i>
      <span>相似推荐</span>
    </span>
    <div class="col-list">
      <div
        v-for="image in relatedImages"
        :key="image.id"
        class="card"
        @click="handleRelatedClick(image)"
      >
        <div class="resource-container img-or-video">
          <img
            :src="image.src"
            :alt="image.alt || image.title || '图片'"
            :title="image.title || '图片'"
          />
        </div>
        <div class="card-content hert-col">
          <div v-if="image.tags && image.tags.length > 0" class="labelDiv">
            <span v-for="(tag, index) in image.tags" :key="index">{{ tag }}</span>
          </div>
          <div class="card--button">
            <span>前往</span>
            <i class="el-icon ico"></i>
          </div>
          <div class="card--center">
            <div v-if="image.downloads !== undefined">
              <i class="el-icon"></i> {{ image.downloads }}
            </div>
            <div v-if="image.favorites !== undefined">
              <i class="el-icon"></i> {{ image.favorites }}
            </div>
            <div v-if="image.resolution">
              <i class="el-icon"></i> {{ image.resolution }}
            </div>
            <div v-if="image.fileSize">
              <i class="el-icon"></i> {{ image.fileSize }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BtcImageContainer from '../../btc-image-container/index.vue';
import type { ImageItem } from '../../btc-image-container/types';

defineOptions({
  name: 'RelatedImages',
});

interface Props {
  relatedImages: ImageItem[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'related-click': [image: ImageItem];
}>();

const handleRelatedClick = (image: ImageItem) => {
  emit('related-click', image);
};
</script>

<style lang="scss" scoped>
.btc-related-images {
  width: 100%;
  padding: 0;
  margin: 0;

  .title-span {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 16px 0;
    padding: 0;

    .el-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }
  }

  .col-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    width: 100%;

    .card {
      position: relative;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-radius: 12px;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);

      &:hover {
        transform: translateY(-6px) scale(1.02);
        box-shadow: 
          0 12px 32px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.15),
          0 4px 12px rgba(0, 0, 0, 0.15);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .resource-container {
        width: 100%;
        aspect-ratio: 518.391 / 362.859;
        overflow: hidden;
        border-radius: 12px 12px 0 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      }

      .card-content {
        padding: 12px;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%);
        border-radius: 0 0 12px 12px;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);

        .labelDiv {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 8px;

          span {
            font-size: 11px;
            padding: 2px 6px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            color: var(--el-text-color-regular);
          }
        }

        .card--button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 6px 12px;
          margin-bottom: 8px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          font-size: 12px;
          color: var(--el-text-color-primary);
          cursor: pointer;
          transition: background-color 0.2s ease;

          &:hover {
            background-color: rgba(255, 255, 255, 0.2);
          }

          .ico {
            width: 12px;
            height: 12px;
          }
        }

        .card--center {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 11px;
          color: var(--el-text-color-regular);

          > div {
            display: flex;
            align-items: center;
            gap: 4px;

            .el-icon {
              width: 12px;
              height: 12px;
            }
          }
        }
      }
    }
  }
}
</style>

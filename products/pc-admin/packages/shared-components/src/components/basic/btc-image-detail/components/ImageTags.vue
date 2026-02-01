<template>
  <div v-if="image.tags && image.tags.length > 0" class="btc-image-tags">
    <span class="title-span">
      <i class="el-icon"></i>
      <span>相关标签</span>
    </span>
    <div class="contentSpen">
      <a
        v-for="(tag, index) in image.tags"
        :key="index"
        href="javascript:void(0)"
        class="tag-link"
        @click="handleTagClick(tag)"
      >
        <div>
          <i class="el-icon"></i>
          <span>{{ tag }}</span>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImageItem } from '../../btc-image-container/types';

defineOptions({
  name: 'ImageTags',
});

interface Props {
  image: ImageItem;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'tag-click': [tag: string];
}>();

const handleTagClick = (tag: string) => {
  emit('tag-click', tag);
};
</script>

<style lang="scss" scoped>
.btc-image-tags {
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

  .contentSpen {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;

    .tag-link {
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      transition: transform 0.2s ease, opacity 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        opacity: 0.8;
      }

      div {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background-color: rgba(184, 184, 184, 0.1);
        border-radius: 20px;
        font-size: 14px;
        color: var(--el-text-color-primary);
        transition: background-color 0.2s ease;

        &:hover {
          background-color: rgba(184, 184, 184, 0.2);
        }

        .el-icon {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>

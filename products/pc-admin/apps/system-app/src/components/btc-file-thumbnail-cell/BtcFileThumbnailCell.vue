<template>
  <div class="btc-file-thumbnail">
    <div
      v-if="isImage"
      class="btc-file-thumbnail__image"
      role="button"
      tabindex="0"
      @click.stop="openPreview"
      @keydown.enter.stop.prevent="openPreview"
    >
      <img :src="modelValue" alt="" />
    </div>
    <div v-else class="btc-file-thumbnail__icon" :class="typeClass">
      <span class="btc-file-thumbnail__icon-text">{{ extensionLabel }}</span>
    </div>
  </div>
  <teleport to="body">
    <el-image-viewer
      v-if="visible"
      :z-index="Z_INDEX"
      :url-list="previewList"
      :initial-index="0"
      @close="visible = false"
    />
  </teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElImageViewer } from 'element-plus';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    mime?: string;
    originalName?: string;
  }>(),
  {
    modelValue: '',
    mime: '',
    originalName: '',
  }
);

const visible = ref(false);
const previewList = computed(() => (props.modelValue ? [props.modelValue] : []));
const Z_INDEX = 4000;

const extension = computed(() => {
  const nameSource = props.originalName || props.modelValue || '';
  const matched = nameSource.match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/);
  return matched ? matched[1].toLowerCase() : '';
});

const isImage = computed(() => {
  if (props.mime) {
    return props.mime.startsWith('image/');
  }
  const ext = extension.value;
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext);
});

const extensionLabel = computed(() => {
  if (!extension.value) {
    return 'FILE';
  }
  return extension.value.length > 4 ? extension.value.slice(0, 4).toUpperCase() : extension.value.toUpperCase();
});

const typeClass = computed(() => {
  const ext = extension.value;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'btc-file-thumbnail__icon--excel';
  if (['ppt', 'pptx'].includes(ext)) return 'btc-file-thumbnail__icon--ppt';
  if (['doc', 'docx'].includes(ext)) return 'btc-file-thumbnail__icon--word';
  if (['pdf'].includes(ext)) return 'btc-file-thumbnail__icon--pdf';
  if (['txt', 'md'].includes(ext)) return 'btc-file-thumbnail__icon--text';
  return 'btc-file-thumbnail__icon--default';
});

const openPreview = () => {
  if (!isImage.value || !props.modelValue) return;
  visible.value = true;
};
</script>

<style scoped lang="scss">
.btc-file-thumbnail {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background-color: var(--btc-color-fill-secondary, #f5f6f8);

  &__image {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    cursor: zoom-in;
    background-color: rgba(0, 0, 0, 0.04);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background-color: var(--btc-color-fill-secondary, #f0f2f5);
    color: var(--btc-color-text-secondary, #5c6273);
    font-weight: 600;
  }

  &__icon-text {
    font-size: 12px;
    letter-spacing: 0.5px;
  }

  &__icon--excel {
    background-color: rgba(40, 167, 69, 0.15);
    color: #28a745;
  }

  &__icon--ppt {
    background-color: rgba(255, 99, 71, 0.15);
    color: #ff6347;
  }

  &__icon--word {
    background-color: rgba(0, 123, 255, 0.15);
    color: #007bff;
  }

  &__icon--pdf {
    background-color: rgba(220, 53, 69, 0.15);
    color: #dc3545;
  }

  &__icon--text {
    background-color: rgba(108, 117, 125, 0.15);
    color: #6c757d;
  }

  &__icon--default {
    background-color: rgba(90, 98, 115, 0.12);
    color: #5a6273;
  }

  &__icon--image-fallback {
    background-color: rgba(0, 0, 0, 0.05);
    color: #8f95a1;
    font-size: 16px;
  }
}
</style>


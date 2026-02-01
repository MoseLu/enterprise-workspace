<template>
  <div class="btc-upload-item__wrap">
    <div
      class="btc-upload-item"
      :class="[
        {
          'is-play': item.isPlay
        }
      ]"
    >
      <!-- 图片 -->
      <template v-if="item.type === 'image' && !item.error">
        <el-image
          class="btc-upload-item__image-cover"
          fit="contain"
          :src="item.preload || url"
          @error="item.error = '加载失败'"
        />
      </template>

      <!-- 视频 -->
      <template v-else-if="item.type === 'video'">
        <video :key="item.url" :src="item.url" />
      </template>

      <!-- 其他 -->
      <template v-else>
        <!-- 图标 -->
        <div class="btc-upload-item__icon">
          <el-icon :size="60">
            <Document />
          </el-icon>
        </div>
        <!-- 文件名 -->
        <div class="btc-upload-item__name">
          <span>{{ item.name || url }}</span>
          <span v-show="item.error" class="error">{{ item.error }}</span>
        </div>
      </template>

      <!-- 上传中 -->
      <div
        class="btc-upload-item__progress"
        :class="{
          'is-show': item.progress! >= 0 && item.progress! < 100,
          'is-hide': item.progress == 100
        }"
      >
        <!-- 进度条 -->
        <div class="btc-upload-item__progress-bar">
          <el-progress :percentage="item.progress" :show-text="false" />
        </div>

        <!-- 进度值 -->
        <span class="btc-upload-item__progress-value">{{ item.progress }}</span>
      </div>

      <!-- 角标 -->
      <span
        v-if="showTag"
        class="btc-upload-item__tag"
      >
        {{ ext }}
      </span>

      <template v-if="url">
        <!-- 工具 -->
        <div class="btc-upload-item__actions">
          <el-icon class="action-preview" @click.stop="preview">
            <ZoomIn />
          </el-icon>

          <el-icon
            v-if="!disabled || deletable"
            class="action-delete"
            @click.stop="remove"
          >
            <Delete />
          </el-icon>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ZoomIn, Delete, Document } from '@element-plus/icons-vue';
import type { UploadItem } from '../types';

defineOptions({
  name: 'BtcUploadItem'
});

const props = defineProps({
  item: {
    type: Object as () => UploadItem,
    required: true
  },
  // 是否禁用
  disabled: Boolean,
  // 是否可以删除
  deletable: Boolean,
  // 显示角标
  showTag: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits<{
  remove: [];
}>();

// 图片地址
const url = computed(() => props.item.url || '');

// 文件扩展名
const ext = computed(() => {
  const fileName = props.item.name || url.value;
  const ext = fileName.split('.').pop()?.toUpperCase() || '';
  return ext;
});

// 移除
function remove() {
  emit('remove');
}

// 预览
function preview() {
  if (url.value) {
    window.open(url.value, '_blank');
  }
}
</script>

<style lang="scss" scoped>
.btc-upload-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--el-fill-color-light);
  box-sizing: border-box;
  position: relative;

  video {
    height: 100%;
  }

  &__wrap {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
  }

  &__icon {
    color: var(--el-text-color-secondary);
  }

  &__name {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 50px;
    width: 100%;
    font-size: 12px;
    overflow: hidden;
    padding: 0 10px;
    position: absolute;
    bottom: 0;
    left: 0;
    box-sizing: border-box;

    span {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;

      &.error {
        color: var(--el-color-danger);
        margin-top: 5px;
      }
    }
  }

  &__progress {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    pointer-events: none;
    transition: opacity 0.3s;
    opacity: 0;

    &-bar {
      position: absolute;
      bottom: 10px;
      left: 10px;
      width: calc(100% - 20px);
    }

    &-value {
      position: absolute;
      font-size: 26px;
      color: #fff;

      &::after {
        content: '%';
        margin-left: 2px;
      }
    }

    &.is-show {
      opacity: 1;
    }

    &.is-hide {
      opacity: 0;
    }
  }

  &__tag {
    position: absolute;
    top: 5px;
    left: 5px;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.6);
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 4px;
    text-transform: uppercase;
    max-width: 65px;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__actions {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 9;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 6px;
    opacity: 0;
    transition: opacity 0.3s cubic-bezier(0.55, 0, 0.1, 1);

    .el-icon {
      color: #fff;
      margin: 0 8px;
      font-size: 20px;

      &:hover {
        color: #eee;
      }
    }
  }

  &__image-cover {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &.is-play {
    animation: play 1s linear infinite;
  }

  &:hover {
    .btc-upload-item__actions {
      opacity: 1;
    }
  }
}

@keyframes play {
  0% {
    border-color: var(--el-color-primary);
  }
  100% {
    border-color: var(--el-fill-color-light);
  }
}
</style>

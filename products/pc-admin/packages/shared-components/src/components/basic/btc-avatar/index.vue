<template>
  <div class="btc-avatar" :style="containerStyle" :class="{ 'is-rock-style': rockStyle }">
    <div class="btc-avatar__box" ref="avatarBoxRef">
      <el-image
        :src="avatarSrc"
        :preview-src-list="previewable ? previewSrcList : []"
        fit="cover"
        class="btc-avatar__img"
        :preview-teleported="true"
        @click="handleAvatarClick"
      >
        <template #error>
          <div class="btc-avatar__error">
            <el-icon><User /></el-icon>
          </div>
        </template>
      </el-image>
      
      <!-- 编辑图标 -->
      <div
        v-if="editable"
        class="btc-avatar__edit-icon"
        @click="triggerUpload"
      >
        <el-icon><Edit /></el-icon>
      </div>
      
      <!-- 隐藏的文件输入 -->
      <div v-if="editable" class="btc-avatar__upload">
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileSelect"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import type { Ref } from 'vue';

import { User, Edit } from '@element-plus/icons-vue';
import { useUpload } from '@btc-components/form/btc-upload/composables/useUpload';
import { useAvatarRhythm } from './composables/useAvatarRhythm';
import './index.scss';
import { BtcMessage } from '@btc/shared-components';
import { logger } from '@btc/shared-core';
;


defineOptions({
  name: 'BtcAvatar'
});

interface Props {
  // 头像 URL
  src?: string;
  // 头像大小（默认 78px）
  size?: number | string;
  // 是否可编辑
  editable?: boolean;
  // 上传服务（可选，如果不提供则尝试从全局获取）
  uploadService?: any;
  // 上传成功回调
  onUpload?: (url: string) => void | Promise<void>;
  // 点击头像回调（可选，默认触发爆发效果）
  onClick?: () => void;
  // 是否启用摇滚风格（默认 true）- 包括律动效果、抖动动画、高对比度滤镜
  rockStyle?: boolean;
  // 是否可预览（默认 true）
  previewable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  src: '/logo.png',
  size: 78,
  editable: false,
  rockStyle: true,
  previewable: true
});

// 文件输入引用
const fileInputRef = ref<HTMLInputElement | null>(null);
// 头像容器引用
const avatarBoxRef = ref<HTMLElement | null>(null);

// 律动效果（总是初始化，但根据 rockStyle 控制启动/停止）
const rhythmResult = useAvatarRhythm(avatarBoxRef as Ref<HTMLElement | null>);
const { startRhythm, stopRhythm, triggerBurst } = rhythmResult;

// 上传 composable
const { toUpload } = useUpload(props.uploadService);

// 容器样式
const containerStyle = computed(() => {
  const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size;
  return {
    width: sizeValue,
    height: sizeValue
  };
});

// 头像源
const avatarSrc = computed(() => props.src || '/logo.png');

// 预览列表
const previewSrcList = computed(() => [avatarSrc.value]);

// 触发上传
const triggerUpload = () => {
  fileInputRef.value?.click();
};

// 启动律动的辅助函数
const doStartRhythm = () => {
  if (avatarBoxRef.value) {
    setTimeout(() => {
      startRhythm();
    }, 100);
  }
};

// 监听 rockStyle 变化，控制律动效果的启动/停止
watch(() => props.rockStyle, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    // 从关闭切换到开启
    doStartRhythm();
  } else if (!newValue && oldValue) {
    // 从开启切换到关闭
    stopRhythm();
  }
});

// 组件挂载时，如果 rockStyle 为 true，启动律动效果
onMounted(() => {
  if (props.rockStyle) {
    doStartRhythm();
  }
});

// 处理头像点击
const handleAvatarClick = () => {
  if (props.onClick) {
    props.onClick();
  } else if (props.rockStyle) {
    // 默认触发爆发效果（仅在摇滚风格启用时）
    triggerBurst();
  }
};

// 处理文件选择
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // 验证文件大小（5MB）
  if (file.size / 1024 / 1024 >= 5) {
    BtcMessage.error('上传文件大小不能超过 5MB!');
    target.value = '';
    return;
  }

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    BtcMessage.error('请选择图片文件!');
    target.value = '';
    return;
  }

  try {
    // 直接使用 useUpload 上传文件
    const res = await toUpload(file, {
      uploadType: 'avatar'
    });

    // 验证响应是否有效
    if (!res || typeof res !== 'object' || !res.url) {
      throw new Error('上传响应格式错误：未找到 url 字段');
    }

    // 触发上传成功回调
    if (props.onUpload) {
      await props.onUpload(res.url);
    }
  } catch (error: any) {
    logger.error('上传失败:', error);
    BtcMessage.error(error?.message || '上传失败');
  } finally {
    // 清空 input 值，以便下次可以选择同一个文件
    target.value = '';
  }
};
</script>

<style lang="scss" scoped>
@use './index.scss' as *;
</style>

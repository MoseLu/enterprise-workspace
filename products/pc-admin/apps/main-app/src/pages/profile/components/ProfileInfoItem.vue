<template>
  <div class="profile-info-item">
    <div class="profile-info-item__key">{{ label }}</div>
    <div class="profile-info-item__value">
      <span class="profile-info-item__content">{{ value }}</span>
      <el-icon
        v-if="editable"
        class="profile-info-item__edit-icon"
        @click="$emit('edit')"
      >
        <Edit />
      </el-icon>
      <el-button
        v-else-if="bindable && (value === '-' || !value || value.trim() === '')"
        link
        type="primary"
        size="small"
        class="profile-info-item__bind-btn"
        @click="$emit('bind')"
      >
        去绑定
      </el-button>
      <el-icon
        v-else-if="copyable"
        class="profile-info-item__copy-icon"
        @click="handleCopy"
      >
        <CopyDocument />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Edit, CopyDocument } from '@element-plus/icons-vue';
import { BtcMessage } from '@btc/shared-components';
import { logger } from '@btc/shared-core';
;


defineOptions({
  name: 'ProfileInfoItem'
});

const props = defineProps<{
  label: string;
  value: string;
  editable?: boolean;
  copyable?: boolean;
  bindable?: boolean;
}>();

defineEmits<{
  edit: [];
  bind: [];
}>();

// 复制功能 - 使用更可靠的方法（参考 btc-json-code）
const handleCopy = async () => {
  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(props.value);
      BtcMessage.success('复制成功');
      return;
    }

    // fallback: 使用 document.execCommand
    const textArea = document.createElement('textarea');
    textArea.value = props.value;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);

    // 选择文本
    textArea.select();
    textArea.setSelectionRange(0, 99999);

    // 执行复制
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      BtcMessage.success('复制成功');
    } else {
      BtcMessage.error('复制失败');
    }
  } catch (error) {
    logger.error('复制失败:', error);
    BtcMessage.error('复制失败');
  }
};
</script>

<style lang="scss" scoped>
@use '../styles/profile-card.scss' as *;
</style>


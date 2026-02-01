<template>
  <div v-if="showIndicator" class="retry-status-indicator">
    <el-tooltip :content="tooltipContent" placement="bottom">
      <div class="status-dot" :class="statusClass"></div>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElTooltip } from 'element-plus';
import { getRetryStatus } from '@/utils/requestAdapter';
import { useI18n } from '@btc/shared-core';

defineOptions({
  name: 'RetryStatusIndicator'
});

const { t } = useI18n();

const showIndicator = ref(false);
const retryStatus = ref({
  retryCount: 0,
  isRetrying: false,
  lastError: null,
  nextRetryDelay: 0
});

let statusCheckInterval: ReturnType<typeof setInterval> | null = null;

const statusClass = computed(() => {
  if (retryStatus.value.isRetrying) {
    return 'retrying';
  }
  if (retryStatus.value.retryCount > 0) {
    return 'warning';
  }
  return 'normal';
});

const tooltipContent = computed(() => {
  if (retryStatus.value.isRetrying) {
    return t('common.retry.retrying', {
      count: retryStatus.value.retryCount,
      max: 3,
      delay: retryStatus.value.nextRetryDelay
    });
  }
  if (retryStatus.value.retryCount > 0) {
    return t('common.retry.failed', {
      count: retryStatus.value.retryCount,
      max: 3
    });
  }
  return t('common.retry.normal');
});

function checkRetryStatus() {
  const status = getRetryStatus();
  retryStatus.value = status;

  // 只有在重试中或有重试历史时才显示指示器
  showIndicator.value = status.isRetrying || status.retryCount > 0;
}

onMounted(() => {
  // 每2秒检查一次重试状态
  statusCheckInterval = setInterval(checkRetryStatus, 2000);
  checkRetryStatus();
});

onUnmounted(() => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval);
  }
});
</script>

<style lang="scss" scoped>
.retry-status-indicator {
  position: fixed;
  top: 8px; /* 距离顶部栏顶部8px */
  right: 8px; /* 距离右边缘8px，在头像右上角 */
  z-index: 10001; /* 比顶部栏更高的层级 */

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transition: all 0.3s ease;
    cursor: pointer;
    border: 2px solid #fff; /* 白色边框，增强可见性 */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); /* 阴影增强可见性 */

    &.normal {
      background-color: #67c23a;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 4px rgba(103, 194, 58, 0.4);
    }

    &.warning {
      background-color: #e6a23c;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 4px rgba(230, 162, 60, 0.4);
      animation: pulse 1s infinite;
    }

    &.retrying {
      background-color: #409eff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 4px rgba(64, 158, 255, 0.4);
      animation: pulse 0.5s infinite;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

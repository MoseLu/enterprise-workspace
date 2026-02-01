<template>
  <BtcCard
    class="btc-process-card"
    :class="{
      'btc-process-card--pending': process.status === 'pending',
      'btc-process-card--running': process.status === 'running',
      'btc-process-card--paused': process.status === 'paused',
      'btc-process-card--completed': process.status === 'completed'
    }"
    shadow="hover"
    :border="true"
  >
    <!-- 卡片头部 -->
    <template #title>
      <div class="btc-process-card__header-left">
        <el-tag :type="getStatusTagType(process.status)" size="small">
          {{ getStatusLabel(process.status) }}
        </el-tag>
        <h3 class="btc-process-card__name">{{ process.name }}</h3>
      </div>
    </template>
    <template #extra>
      <el-icon
        class="btc-process-card__status-icon"
        :class="`btc-process-card__status-icon--${process.status}`"
      >
        <component :is="getStatusIcon(process.status)" />
      </el-icon>
    </template>

    <!-- 卡片内容 -->
    <el-scrollbar class="btc-process-card__scrollbar">
      <div class="btc-process-card__content">
        <!-- 倒计时 -->
        <BtcProcessCountdown
          v-if="process.scheduledStartTime && process.scheduledEndTime"
          :start-time="process.scheduledStartTime"
          :end-time="process.scheduledEndTime"
          v-bind="{
            ...(process.actualStartTime !== undefined ? { 'actual-start-time': process.actualStartTime } : {})
          }"
        />

        <!-- 描述信息 -->
        <div v-if="process.description" class="btc-process-card__description">
          <el-icon class="btc-process-card__description-icon"><Document /></el-icon>
          <span class="btc-process-card__description-text">{{ process.description }}</span>
        </div>

        <!-- 时间信息 -->
        <div class="btc-process-card__time-info">
          <div class="btc-process-card__time-item">
            <el-icon class="btc-process-card__time-icon"><Clock /></el-icon>
            <span class="btc-process-card__time-label">计划开始：</span>
            <span class="btc-process-card__time-value">
              {{ process.scheduledStartTime ? formatDateTime(process.scheduledStartTime) : '-' }}
            </span>
          </div>
          <div class="btc-process-card__time-item">
            <el-icon class="btc-process-card__time-icon"><Timer /></el-icon>
            <span class="btc-process-card__time-label">计划结束：</span>
            <span class="btc-process-card__time-value">
              {{ process.scheduledEndTime ? formatDateTime(process.scheduledEndTime) : '-' }}
            </span>
          </div>
          <div v-if="process.actualStartTime" class="btc-process-card__time-item">
            <el-icon class="btc-process-card__time-icon"><Clock /></el-icon>
            <span class="btc-process-card__time-label">实际开始：</span>
            <span class="btc-process-card__time-value">{{ formatDateTime(process.actualStartTime) }}</span>
          </div>
          <div v-if="process.actualEndTime" class="btc-process-card__time-item">
            <el-icon class="btc-process-card__time-icon"><Timer /></el-icon>
            <span class="btc-process-card__time-label">实际结束：</span>
            <span class="btc-process-card__time-value">{{ formatDateTime(process.actualEndTime) }}</span>
          </div>
        </div>

        <!-- 进度条 -->
        <div v-if="process.status === 'running'" class="btc-process-card__progress">
          <div class="btc-process-card__progress-label">
            <span>执行进度</span>
          </div>
          <el-progress
            :percentage="calculateProgress(process)"
            :color="getProgressColor(process)"
            :stroke-width="8"
          />
        </div>

      </div>
    </el-scrollbar>

    <!-- 卡片操作按钮 -->
    <template #footer>
      <div class="btc-process-card__actions">
        <!-- 开始按钮 -->
        <BtcTableButton
          v-if="process.status === 'pending' && isMinimal"
          :config="startButtonConfig"
        />
        <el-button
          v-else-if="process.status === 'pending'"
          type="primary"
          class="btc-crud-btn"
          :disabled="!canStart(process)"
          @click="handleStart"
        >
          <span class="btc-crud-btn__text">开始</span>
        </el-button>

        <!-- 暂停按钮 -->
        <BtcTableButton
          v-if="process.status === 'running' && isMinimal"
          :config="pauseButtonConfig"
        />
        <el-button
          v-else-if="process.status === 'running'"
          type="warning"
          class="btc-crud-btn"
          @click="handlePause"
        >
          <span class="btc-crud-btn__text">暂停</span>
        </el-button>

        <!-- 恢复按钮 -->
        <BtcTableButton
          v-if="process.status === 'paused' && isMinimal"
          :config="resumeButtonConfig"
        />
        <el-button
          v-else-if="process.status === 'paused'"
          type="success"
          class="btc-crud-btn"
          @click="handleResume"
        >
          <span class="btc-crud-btn__text">恢复</span>
        </el-button>

        <!-- 结束按钮 -->
        <BtcTableButton
          v-if="(process.status === 'running' || process.status === 'paused') && isMinimal"
          :config="endButtonConfig"
        />
        <el-button
          v-else-if="process.status === 'running' || process.status === 'paused'"
          type="danger"
          class="btc-crud-btn"
          :disabled="!canEnd(process)"
          @click="handleEnd"
        >
          <span class="btc-crud-btn__text">结束</span>
        </el-button>

        <!-- 详情按钮 -->
        <BtcTableButton
          v-if="isMinimal"
          :config="detailButtonConfig"
        />
        <el-button
          v-else
          type="info"
          class="btc-crud-btn"
          @click="handleViewDetail"
        >
          <span class="btc-crud-btn__text">详情</span>
        </el-button>
      </div>
    </template>
  </BtcCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Clock, Loading, Check, Warning, Timer, Document } from '@element-plus/icons-vue';
import { formatDateTime } from '@btc/shared-core/utils';
import { useThemePlugin } from '@btc/shared-core';
import BtcCard from '@btc-components/basic/btc-card/index.vue';
import BtcTableButton from '@btc-components/basic/btc-table-button/index.vue';
import type { BtcTableButtonConfig } from '@btc-components/basic/btc-table-button/types';
import BtcProcessCountdown from '../btc-process-countdown/index.vue';
import type { ProcessManagementItem } from '../types';

interface Props {
  process: ProcessManagementItem;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  start: [process: ProcessManagementItem];
  pause: [process: ProcessManagementItem];
  resume: [process: ProcessManagementItem];
  end: [process: ProcessManagementItem];
  viewDetail: [process: ProcessManagementItem];
}>();

const theme = useThemePlugin();
const isMinimal = computed(() => theme.buttonStyle?.value === 'minimal');

const getStatusTagType = (status: string) => {
  const map: Record<string, string | undefined> = {
    pending: 'info',
    running: 'success',
    paused: 'warning',
    completed: 'info', // 使用 info 类型，避免空字符串导致警告
  };
  return map[status];
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '待开始',
    running: '进行中',
    paused: '暂停中',
    completed: '已结束',
  };
  return map[status] || status;
};

const getStatusIcon = (status: string) => {
  const map: Record<string, any> = {
    pending: Clock,
    running: Loading,
    paused: Warning,
    completed: Check,
  };
  return map[status] || Clock;
};

const calculateProgress = (process: ProcessManagementItem) => {
  if (
    process.status !== 'running' ||
    !process.actualStartTime ||
    !process.scheduledStartTime ||
    !process.scheduledEndTime
  ) {
    return 0;
  }

  const now = new Date().getTime();
  const start = new Date(process.scheduledStartTime).getTime();
  const end = new Date(process.scheduledEndTime).getTime();
  const actualStart = new Date(process.actualStartTime).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  if (now >= end) return 100;
  if (now <= actualStart) return 0;

  const total = end - start;
  const elapsed = now - actualStart;
  return Math.min(100, Math.round((elapsed / total) * 100));
};

const getProgressColor = (process: ProcessManagementItem) => {
  const progress = calculateProgress(process);
  if (progress >= 90) return 'var(--el-color-danger)';
  if (progress >= 70) return 'var(--el-color-warning)';
  return 'var(--el-color-success)';
};

const canStart = (process: ProcessManagementItem) => {
  return !process.actualStartTime && process.status === 'pending';
};

const canEnd = (process: ProcessManagementItem) => {
  return !!process.actualStartTime && !process.actualEndTime;
};

const handleStart = () => {
  emit('start', props.process);
};

const handlePause = () => {
  emit('pause', props.process);
};

const handleResume = () => {
  emit('resume', props.process);
};

const handleEnd = () => {
  emit('end', props.process);
};

const handleViewDetail = () => {
  emit('viewDetail', props.process);
};

// 按钮配置（minimal 模式：只显示图标）
const startButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'play',
  tooltip: '开始',
  type: 'primary',
  onClick: () => handleStart(),
  disabled: !canStart(props.process),
}));

const pauseButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'pause',
  tooltip: '暂停',
  type: 'warning',
  onClick: () => handlePause(),
}));

const resumeButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'play',
  tooltip: '恢复',
  type: 'success',
  onClick: () => handleResume(),
}));

const endButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'stop',
  tooltip: '结束',
  type: 'danger',
  onClick: () => handleEnd(),
  disabled: !canEnd(props.process),
}));

const detailButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'eye',
  tooltip: '详情',
  type: 'info',
  onClick: () => handleViewDetail(),
}));
</script>

<style lang="scss" scoped>
.btc-process-card {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.btc-card__header) {
    padding: 12px 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  :deep(.btc-card__body) {
    padding: 0;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  &__scrollbar {
    flex: 1;
    min-height: 0;
    height: 100%;

    :deep(.el-scrollbar__wrap) {
      overflow-x: hidden;
    }
  }

  &__content {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    text-align: center;
  }

  :deep(.btc-card__footer) {
    padding: 12px 16px;
    flex-shrink: 0;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  &__status-icon {
    font-size: 24px;

    // 通过 :deep() 穿透到 SVG 元素，直接设置 fill 颜色
    :deep(svg) {
      fill: currentColor;
    }

    &--pending {
      color: var(--el-color-primary) !important;
      :deep(svg) {
        fill: var(--el-color-primary) !important;
      }
    }

    &--running {
      color: var(--el-color-success) !important;
      animation: btc-process-rotate 2s linear infinite;
      :deep(svg) {
        fill: var(--el-color-success) !important;
      }
    }

    &--paused {
      color: var(--el-color-warning) !important;
      :deep(svg) {
        fill: var(--el-color-warning) !important;
      }
    }

    &--completed {
      color: var(--el-color-danger) !important;
      :deep(svg) {
        fill: var(--el-color-danger) !important;
      }
    }
  }

  &__description {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 4px 0;
    border-bottom: 1px solid var(--el-border-color-extra-light);
    margin-bottom: 4px;
    width: 100%;
  }

  &__description-icon {
    font-size: 18px;
    color: var(--el-color-primary);
    flex-shrink: 0;
  }

  &__description-text {
    font-size: 16px;
    line-height: 1.6;
    color: var(--el-text-color-primary);
    word-break: break-word;
  }

  &__time-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    align-items: center;
  }

  &__time-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 15px;
    line-height: 1.6;
    padding: 2px 0;
    width: 100%;
  }

  &__time-icon {
    font-size: 17px;
    color: var(--el-color-primary);
    flex-shrink: 0;
  }

  &__time-label {
    color: var(--el-text-color-secondary);
    flex-shrink: 0;
  }

  &__time-value {
    color: var(--el-text-color-primary);
    font-weight: 500;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 15px;
  }

  &__progress {
    margin-top: 0;
    width: 100%;
  }

  &__progress-label {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 8px;
    font-size: 15px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }

  &__progress-percent {
    font-weight: 600;
    color: var(--el-color-primary);
    font-size: 15px;
    margin-left: 8px;
  }

  &__actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }
}

@keyframes btc-process-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>


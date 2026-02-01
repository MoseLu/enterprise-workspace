<template>
  <div class="btc-process-countdown" :class="countdownClass">
    <div class="btc-process-countdown__label">{{ label }}</div>
    <div class="btc-process-countdown__content">
      <span v-if="safeCountdown.isExpired" class="btc-process-countdown__expired">已过期</span>
      <template v-else>
        <span v-if="safeCountdown.days > 0" class="btc-process-countdown__item">
          <span class="btc-process-countdown__value">{{ safeCountdown.days }}</span>
          <span class="btc-process-countdown__unit">天</span>
        </span>
        <span v-if="safeCountdown.hours > 0 || safeCountdown.days > 0" class="btc-process-countdown__item">
          <span class="btc-process-countdown__value">{{ String(safeCountdown.hours).padStart(2, '0') }}</span>
          <span class="btc-process-countdown__unit">小时</span>
        </span>
        <span class="btc-process-countdown__item">
          <span class="btc-process-countdown__value">{{ String(safeCountdown.minutes).padStart(2, '0') }}</span>
          <span class="btc-process-countdown__unit">分钟</span>
        </span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted, onUnmounted } from 'vue';
import { useCountdown } from '@btc/shared-core';

interface Props {
  /** 计划开始时间 */
  startTime: Date | string | number;
  /** 计划结束时间 */
  endTime: Date | string | number;
  /** 实际开始时间（可选，用于判断是显示"距离开始"还是"距离结束"） */
  actualStartTime?: Date | string | number;
}

const props = defineProps<Props>();

// 响应式的当前时间，用于判断是否已开始
const currentTime = ref(new Date());
let timeCheckTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  // 每秒更新当前时间，确保 isBeforeStart 能响应式更新
  timeCheckTimer = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timeCheckTimer) {
    clearInterval(timeCheckTimer);
    timeCheckTimer = null;
  }
});

// 判断是显示"距离开始"还是"距离结束"
const isBeforeStart = computed(() => {
  if (!props.startTime || !props.endTime) return false;
  if (props.actualStartTime) return false;
  try {
    const now = currentTime.value;
    const start = new Date(props.startTime);
    if (isNaN(start.getTime())) return false;
    return now < start;
  } catch {
    return false;
  }
});

const targetTime = computed(() => {
  if (isBeforeStart.value) {
    return props.startTime;
  } else {
    return props.endTime;
  }
});

const label = computed(() => {
  return isBeforeStart.value ? '距离开始' : '距离结束';
});

// 直接使用 targetTime computed，useCountdown 支持响应式值
const { countdown, restart } = useCountdown(targetTime, { autoStart: true });

// 当 targetTime 变化时，重启倒计时以确保正确更新
watch(targetTime, () => {
  restart();
}, { deep: true });

// 确保 countdown 始终有值
const safeCountdown = computed(() => {
  if (!countdown.value) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
      isExpired: true,
    };
  }
  return countdown.value;
});

const countdownClass = computed(() => {
  if (!safeCountdown.value) return '';
  if (safeCountdown.value.isExpired) return 'btc-process-countdown--expired';
  
  // 未到开始时间：绿色
  if (isBeforeStart.value) {
    return 'btc-process-countdown--before-start';
  }
  
  // 开始以后，还剩一小时：红色
  if (safeCountdown.value.total < 60 * 60 * 1000) {
    return 'btc-process-countdown--urgent';
  }
  
  // 开始以后，大于一小时：黄色
  return 'btc-process-countdown--warning';
});
</script>

<style lang="scss" scoped>
.btc-process-countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 4px 0;
  width: 100%;
  
  &__label {
    font-size: 15px;
    color: var(--el-text-color-secondary);
    flex-shrink: 0;
  }
  
  &__content {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  
  &__item {
    display: inline-flex;
    align-items: baseline;
    gap: 2px;
  }
  
  &__value {
    font-size: 22px;
    font-weight: 600;
    color: var(--el-color-primary);
    line-height: 1;
  }
  
  &__unit {
    font-size: 14px;
    color: var(--el-text-color-regular);
    margin-left: 2px;
  }
  
  &__expired {
    color: var(--el-color-danger);
    font-weight: 500;
    font-size: 16px;
  }
  
  // 未到开始时间：绿色
  &--before-start &__value {
    color: var(--el-color-success);
  }
  
  // 开始以后，还剩一小时：红色
  &--urgent &__value {
    color: var(--el-color-danger);
    animation: btc-countdown-pulse 1s infinite;
  }
  
  // 开始以后，大于一小时：黄色
  &--warning &__value {
    color: var(--el-color-warning);
  }
}

@keyframes btc-countdown-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>


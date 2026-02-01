import { ref, computed, onMounted, onUnmounted, unref, type MaybeRef } from 'vue';

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // 总毫秒数
  isExpired: boolean; // 是否已过期
}

/**
 * 倒计时 composable
 * @param targetTime 目标时间（Date、字符串、时间戳或响应式引用）
 * @param options 配置选项
 */
export function useCountdown(
  targetTime: MaybeRef<Date | string | number>,
  options: {
    /** 是否自动开始，默认 true */
    autoStart?: boolean;
    /** 更新间隔（毫秒），默认 1000 */
    interval?: number;
  } = {}
) {
  const { autoStart = true, interval = 1000 } = options;
  
  const now = ref(new Date());
  const target = computed(() => {
    const time = unref(targetTime);
    if (!time) {
      // 如果时间为空，返回一个未来的时间作为默认值
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    const date = new Date(time);
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    return date;
  });
  
  const countdown = computed<CountdownResult>(() => {
    const targetTimeValue = target.value;
    const nowTime = now.value;
    
    if (!targetTimeValue || !nowTime) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        isExpired: true,
      };
    }
    
    const diff = targetTimeValue.getTime() - nowTime.getTime();
    
    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        isExpired: true,
      };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return {
      days,
      hours,
      minutes,
      seconds,
      total: diff,
      isExpired: false,
    };
  });
  
  const formattedText = computed(() => {
    const { days, hours, minutes, isExpired } = countdown.value;
    if (isExpired) return '已过期';
    
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}天`);
    if (hours > 0 || days > 0) parts.push(`${hours}小时`);
    parts.push(`${minutes}分钟`);
    
    return parts.join(' ');
  });
  
  let timer: ReturnType<typeof setInterval> | null = null;
  
  const start = () => {
    if (timer) return;
    timer = setInterval(() => {
      now.value = new Date();
    }, interval);
  };
  
  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
  
  const restart = () => {
    stop();
    now.value = new Date();
    start();
  };
  
  onMounted(() => {
    if (autoStart) {
      start();
    }
  });
  
  onUnmounted(() => {
    stop();
  });
  
  return {
    countdown,
    formattedText,
    start,
    stop,
    restart,
  };
}


/**
 * 短信验证码 Composable
 * 提供完整的短信验证码发送功能，包括倒计时、发送状态、频率限制等
 */

import { ref, computed, onUnmounted } from 'vue';
import type { Ref, ComputedRef } from 'vue';

/**
 * 短信验证码选项
 */
export interface UseSmsCodeOptions {
  /** 倒计时时长（秒），默认 60 */
  countdown?: number;
  /** 最小发送间隔（秒），默认 60 */
  minInterval?: number;
  /** 发送短信验证码的 API 函数 */
  sendSmsCode: (data: { phone: string; smsType?: string }) => Promise<void>;
  /** 发送成功回调 */
  onSuccess?: () => void;
  /** 发送失败回调 */
  onError?: (error: Error) => void;
}

/**
 * 短信验证码返回值
 */
export interface UseSmsCodeReturn {
  /** 倒计时秒数 */
  countdown: Ref<number>;
  /** 是否正在发送 */
  sending: Ref<boolean>;
  /** 是否已发送过 */
  hasSent: Ref<boolean>;
  /** 是否可以发送（倒计时结束且不在发送中） */
  canSend: ComputedRef<boolean>;
  /** 发送验证码 */
  send: (phone: string, smsType?: string) => Promise<void>;
  /** 重置状态 */
  reset: () => void;
}

/**
 * 短信验证码 Composable
 * 
 * @param options 配置选项
 * @returns 短信验证码相关的状态和方法
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useSmsCode } from '@btc/shared-core';
 * import { codeApi } from '@/modules/api-services';
 * import { BtcMessage } from '@btc/shared-components';
 *
 * const { countdown, sending, canSend, send, reset } = useSmsCode({
 *   sendSmsCode: codeApi.sendSmsCode,
 *   countdown: 60,
 *   minInterval: 60,
 *   onSuccess: () => {
 *     BtcMessage.success('验证码已发送');
 *   }
 * });
 * 
 * const handleSend = async () => {
 *   await send('13800138000', 'login');
 * };
 * </script>
 * ```
 */
export function useSmsCode(options: UseSmsCodeOptions): UseSmsCodeReturn {
  const {
    sendSmsCode: sendSmsCodeApi,
    countdown: countdownDuration = 60,
    minInterval = 60,
    onSuccess,
    onError
  } = options;

  // 状态管理
  const countdown = ref(0);
  const sending = ref(false);
  const hasSent = ref(false);
  const lastSendTime = ref<number | null>(null);

  // 定时器引用
  let countdownTimer: ReturnType<typeof setInterval> | null = null;

  // 计算是否可以发送
  const canSend = computed(() => {
    return countdown.value === 0 && !sending.value;
  });

  /**
   * 清理定时器
   */
  const clearTimer = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  };

  /**
   * 开始倒计时
   */
  const startCountdown = () => {
    clearTimer();
    countdown.value = countdownDuration;
    
    countdownTimer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearTimer();
      }
    }, 1000);
  };

  /**
   * 发送短信验证码
   */
  const send = async (phone: string, smsType?: string): Promise<void> => {
    // 检查是否可以发送
    if (!canSend.value) {
      return;
    }

    // 检查发送频率限制
    const now = Date.now();
    if (lastSendTime.value !== null) {
      const elapsed = Math.floor((now - lastSendTime.value) / 1000);
      if (elapsed < minInterval) {
        const remaining = minInterval - elapsed;
        throw new Error(`请等待 ${remaining} 秒后再发送`);
      }
    }

    // 验证手机号格式（简单验证）
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('请输入正确的手机号');
    }

    sending.value = true;
    lastSendTime.value = now;

    try {
      // 调用发送验证码 API
      await sendSmsCodeApi({ phone, ...(smsType !== undefined && { smsType }) });
      
      // 标记已发送
      hasSent.value = true;
      
      // 开始倒计时
      startCountdown();
      
      // 调用成功回调
      onSuccess?.();
    } catch (error: any) {
      // 重置发送时间（允许重试）
      lastSendTime.value = null;
      
      // 调用失败回调
      const err = error instanceof Error ? error : new Error(error.message || '发送验证码失败');
      onError?.(err);
      
      // 重新抛出错误
      throw err;
    } finally {
      sending.value = false;
    }
  };

  /**
   * 重置状态
   */
  const reset = () => {
    clearTimer();
    countdown.value = 0;
    sending.value = false;
    hasSent.value = false;
    lastSendTime.value = null;
  };

  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearTimer();
  });

  return {
    countdown,
    sending,
    hasSent,
    canSend,
    send,
    reset
  };
}

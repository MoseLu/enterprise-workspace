/**
 * 消息生命周期管理
 */
;

import type { QueuedMessage, MessageDisplayHandler } from './types';
import { logger } from '@btc/shared-core';

interface MessageLifecycleState {
  phase: 'increment' | 'waiting' | 'countdown' | 'cleanup';
  incrementTimer?: ReturnType<typeof setTimeout>;
  countdownTimer?: ReturnType<typeof setInterval>;
  singleMessageTimer?: ReturnType<typeof setTimeout>; // 单条消息的3秒定时器
  maxCount: number;
  currentCount: number;
  lastUpdateTime: number;
}

export class LifecycleManager {
  private messageStates = new Map<string, MessageLifecycleState>();
  private onMessageCompleted?: (messageId: string) => void;

  constructor(private displayHandler: MessageDisplayHandler) {}

  /**
   * 设置消息完成回调
   */
  setOnMessageCompleted(callback: (messageId: string) => void): void {
    this.onMessageCompleted = callback;
  }

  /**
   * 设置消息生命周期
   */
  setupMessageLifecycle(message: QueuedMessage): void {
    if (!this.displayHandler.updateBadge) {
      return;
    }

    const messageId = message.id;

    // 根据消息计数确定生命周期流程
    if (message.count === 1) {
      // 单条消息：3秒后自动消失
      const singleMessageTimer = setTimeout(() => {
        // 检查消息是否仍然存在且没有被重复触发
        const currentState = this.messageStates.get(messageId);
        if (currentState && currentState.currentCount === 1 && currentState.phase === 'increment') {
          this.closeMessageBox(message);
        }
      }, 3000);

      // 保存定时器引用
      this.messageStates.set(messageId, {
        phase: 'increment',
        singleMessageTimer,
        maxCount: 1,
        currentCount: 1,
        lastUpdateTime: Date.now()
      });
      return;
    } else if (message.count === 2) {
      // 重复1次：显示徽章2，等待2秒后开始清理
      this.startSimpleBadgeFlow(message);
    } else {
      // 重复多次：进入完整的递增-等待-递减流程
      this.startIncrementPhase(message);
    }
  }

  /**
   * 处理消息更新（重复消息到达时调用）
   */
  handleMessageUpdate(message: QueuedMessage): void {
    const messageId = message.id;
    const state = this.messageStates.get(messageId);

    if (!state) {
      // 不重新创建，仅初始化状态
      console.warn('[LifecycleManager] Message state not found, skipping update:', messageId);
      return;
    }

    // 关键修复：无论什么情况，都要取消单条消息的定时器
    if (state.singleMessageTimer) {
      clearTimeout(state.singleMessageTimer);
      delete state.singleMessageTimer;
    }

    // 特殊处理：如果当前是单条消息状态（count=1），但现在count>1，需要创建徽章
    if (state.currentCount === 1 && message.count > 1) {
      try {
        // 徽章现在由 updateExistingMessageBadge 直接调用，这里不再调用

        // 更新状态
        state.currentCount = message.count;
        state.maxCount = message.count;
        state.lastUpdateTime = Date.now();
        state.phase = 'increment';

        // 清除可能存在的其他定时器
        if (state.incrementTimer) {
          clearTimeout(state.incrementTimer);
        }
        if (state.countdownTimer) {
          clearInterval(state.countdownTimer);
        }

        // 启动等待期定时器（2秒），等待更多重复消息或进入递减
        // 注意：不再调用 startCountdownAnimation，因为徽章已经由 updateExistingMessageBadge 处理
        state.incrementTimer = setTimeout(() => {
          // 直接进入清理阶段，不再进行递减动画
          this.startCleanupPhase(message);
        }, 2000);

        return;
      } catch (error) {
        logger.error('[LifecycleManager] Failed to update badge:', error);
        // 如果更新徽章失败，说明消息实例无效，抛出错误让上层处理
        throw new Error('Message instance is invalid, cannot update badge');
      }
    }

    // 根据当前阶段处理更新
    switch (state.phase) {
      case 'increment':
        this.handleIncrementPhaseUpdate(message);
        break;
      case 'waiting':
        // 等待阶段收到新消息，需要重新进入递增阶段
        this.handleIncrementPhaseUpdate(message);
        break;
      case 'countdown':
        this.handleCountdownPhaseUpdate(message);
        break;
      case 'cleanup':
        // 清理阶段不再接受更新
        break;
    }
  }

  /**
   * 开始简单徽章流程（count=2的情况）
   */
  private startSimpleBadgeFlow(message: QueuedMessage): void {
    const messageId = message.id;

    // 初始化状态
    const state: MessageLifecycleState = {
      phase: 'waiting',
      maxCount: message.count,
      currentCount: message.count,
      lastUpdateTime: Date.now()
    };

    this.messageStates.set(messageId, state);

    // 立即显示徽章2
    this.displayHandler.updateBadge!(message.messageInstance, message.count);

    // 对于 count=2 的情况，直接等待2秒后进入清理阶段
    state.incrementTimer = setTimeout(() => {
      this.startCountdownAnimation(message);
    }, 2000);
  }

  /**
   * 开始递增阶段
   */
  private startIncrementPhase(message: QueuedMessage): void {
    const messageId = message.id;

    // 初始化状态
    const state: MessageLifecycleState = {
      phase: 'increment',
      maxCount: message.count,
      currentCount: message.count,
      lastUpdateTime: Date.now()
    };

    this.messageStates.set(messageId, state);

    // 立即显示徽章
    this.displayHandler.updateBadge!(message.messageInstance, message.count);

    // 启动等待期定时器（2秒）
    this.startWaitingPeriod(message);
  }

  /**
   * 处理递增阶段的更新
   */
  private handleIncrementPhaseUpdate(message: QueuedMessage): void {
    const messageId = message.id;
    const state = this.messageStates.get(messageId);

    if (!state) return;

    // 更新计数和最大值
    state.currentCount = message.count;
    state.maxCount = Math.max(state.maxCount, message.count);
    state.lastUpdateTime = Date.now();

    // 立即更新徽章显示
    this.displayHandler.updateBadge!(message.messageInstance, message.count);

    // 清除现有的等待定时器，重新启动
    if (state.incrementTimer) {
      clearTimeout(state.incrementTimer);
    }

    // 如果当前是等待阶段，需要切换到递增阶段
    if (state.phase === 'waiting') {
      // 直接切换到递增阶段
      state.phase = 'increment';
      // 设置等待期定时器，2秒后进入递减阶段（而不是清理阶段）
      state.incrementTimer = setTimeout(() => {
        this.startCountdownAnimation(message);
      }, 2000);
    } else {
      // 重新启动等待期
      this.startWaitingPeriod(message);
    }
  }

  /**
   * 启动等待期
   */
  private startWaitingPeriod(message: QueuedMessage): void {
    const messageId = message.id;
    const state = this.messageStates.get(messageId);

    if (!state) return;

    // 更新阶段为等待期
    state.phase = 'waiting';

    // 清除现有的定时器
    if (state.incrementTimer) {
      clearTimeout(state.incrementTimer);
    }

    // 设置等待期定时器（2秒）
    state.incrementTimer = setTimeout(() => {
      this.startCountdownAnimation(message);
    }, 2000);
  }


  /**
   * 处理递减阶段的更新（中断恢复）
   */
  private handleCountdownPhaseUpdate(message: QueuedMessage): void {
    const messageId = message.id;
    const state = this.messageStates.get(messageId);

    if (!state) return;

    // 停止当前递减动画
    if (state.countdownTimer) {
      clearInterval(state.countdownTimer);
    }

    // 更新计数和最大值
    state.currentCount = message.count;
    state.maxCount = Math.max(state.maxCount, message.count);
    state.lastUpdateTime = Date.now();

    // 更新徽章显示
    this.displayHandler.updateBadge!(message.messageInstance, message.count);

    // 重新启动等待期，从递增阶段开始
    this.startWaitingPeriod(message);
  }

  /**
   * 开始递减动画
   */
  private startCountdownAnimation(message: QueuedMessage): void {
    const messageId = message.id;
    const state = this.messageStates.get(messageId);

    if (!state || !message.messageInstance || !this.displayHandler.updateBadge) {
      return;
    }

    // 更新阶段为递减期
    state.phase = 'countdown';

    // 如果最大值就是2，直接显示2一段时间后清理
    if (state.maxCount === 2) {
      this.displayHandler.updateBadge(message.messageInstance, 2);
      setTimeout(() => {
        this.startCleanupPhase(message);
      }, 1000); // 显示2的时间，给用户足够时间看到
      return;
    }

    // 从最大值开始递减
    let currentCount = state.maxCount;
    const interval = 400; // 固定间隔400ms

    // 立即显示当前数字
    this.displayHandler.updateBadge(message.messageInstance, currentCount);

    // 开始递减动画
    state.countdownTimer = setInterval(() => {
      if (currentCount > 2) {
        currentCount--;
        this.displayHandler.updateBadge!(message.messageInstance, currentCount);
      } else if (currentCount === 2) {
        // 显示2一段时间，然后停止递减
        this.displayHandler.updateBadge!(message.messageInstance, currentCount);
        clearInterval(state.countdownTimer!);

        // 显示2一段时间后进入清理阶段
        setTimeout(() => {
          this.startCleanupPhase(message);
        }, 1000); // 显示2的时间，给用户足够时间看到
      } else {
        // 这种情况不应该发生
        clearInterval(state.countdownTimer!);
        this.startCleanupPhase(message);
      }
    }, interval);
  }

  /**
   * 开始清理阶段
   */
  private startCleanupPhase(message: QueuedMessage): void {
    const messageId = message.id;
    const state = this.messageStates.get(messageId);

    if (!state) return;

    // 更新阶段为清理期
    state.phase = 'cleanup';

    // 清理所有定时器
    if (state.incrementTimer) {
      clearTimeout(state.incrementTimer);
    }
    if (state.countdownTimer) {
      clearInterval(state.countdownTimer);
    }
    if (state.singleMessageTimer) {
      clearTimeout(state.singleMessageTimer);
    }

    // 徽章消失
    setTimeout(() => {
      if (typeof (window as any).cleanupBadge === 'function') {
        (window as any).cleanupBadge(message.messageInstance);
      }

      // 消息框消失
      setTimeout(() => {
        this.closeMessageBox(message);
        // 清理状态
        this.messageStates.delete(messageId);
        // 通知消息管理器清理消息
        this.notifyMessageCompleted(messageId);
      }, 400);
    }, 400);
  }

  /**
   * 关闭消息框
   */
  private closeMessageBox(message: QueuedMessage): void {
    if (message.messageInstance) {
      // 尝试多种关闭方法
      if (typeof message.messageInstance.close === 'function') {
        message.messageInstance.close();
      } else if (typeof message.messageInstance.closeMessage === 'function') {
        message.messageInstance.closeMessage();
      } else if (typeof message.messageInstance.clear === 'function') {
        message.messageInstance.clear();
      } else {
        // 尝试直接移除DOM元素
        const extendedInstance = message.messageInstance as any;
        if (extendedInstance.messageContainer) {
          extendedInstance.messageContainer.remove();
        } else if (extendedInstance.$el) {
          extendedInstance.$el.remove();
        }
      }
    }
  }

  /**
   * 清理指定消息的状态
   */
  cleanup(messageId: string): void {
    const state = this.messageStates.get(messageId);
    if (state) {
      // 清理定时器
      if (state.incrementTimer) {
        clearTimeout(state.incrementTimer);
      }
      if (state.countdownTimer) {
        clearInterval(state.countdownTimer);
      }
      if (state.singleMessageTimer) {
        clearTimeout(state.singleMessageTimer);
      }

      // 删除状态
      this.messageStates.delete(messageId);
    }
  }

  /**
   * 清理所有状态
   */
  cleanupAll(): void {
    for (const [messageId, _state] of this.messageStates.entries()) {
      this.cleanup(messageId);
    }
  }

  /**
   * 通知消息完成
   */
  private notifyMessageCompleted(messageId: string): void {
    if (this.onMessageCompleted) {
      this.onMessageCompleted(messageId);
    }
  }
}

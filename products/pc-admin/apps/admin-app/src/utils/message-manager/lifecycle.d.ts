/**
 * 消息生命周期管理
 */
import type { QueuedMessage, MessageDisplayHandler } from './types';
export declare class LifecycleManager {
    private displayHandler;
    private messageStates;
    private onMessageCompleted?;
    constructor(displayHandler: MessageDisplayHandler);
    /**
     * 设置消息完成回调
     */
    setOnMessageCompleted(callback: (messageId: string) => void): void;
    /**
     * 设置消息生命周期
     */
    setupMessageLifecycle(message: QueuedMessage): void;
    /**
     * 处理消息更新（重复消息到达时调用）
     */
    handleMessageUpdate(message: QueuedMessage): void;
    /**
     * 开始简单徽章流程（count=2的情况）
     */
    private startSimpleBadgeFlow;
    /**
     * 开始递增阶段
     */
    private startIncrementPhase;
    /**
     * 处理递增阶段的更新
     */
    private handleIncrementPhaseUpdate;
    /**
     * 启动等待期
     */
    private startWaitingPeriod;
    /**
     * 处理递减阶段的更新（中断恢复）
     */
    private handleCountdownPhaseUpdate;
    /**
     * 开始递减动画
     */
    private startCountdownAnimation;
    /**
     * 开始清理阶段
     */
    private startCleanupPhase;
    /**
     * 关闭消息框
     */
    private closeMessageBox;
    /**
     * 清理指定消息的状态
     */
    cleanup(messageId: string): void;
    /**
     * 清理所有状态
     */
    cleanupAll(): void;
    /**
     * 通知消息完成
     */
    private notifyMessageCompleted;
}

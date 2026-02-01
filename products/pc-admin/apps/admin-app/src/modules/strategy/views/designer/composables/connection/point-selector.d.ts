import type { StrategyConnection, StrategyNode } from '@/types/strategy';
/**
 * 连接点选择逻辑
 * 负责根据节点相对位置动态选择最优连接点
 */
export declare function useConnectionPointSelector(): {
    selectOptimalConnectionPoints: (sourceNode: StrategyNode, targetNode: StrategyNode, connection: StrategyConnection, sourceUsedHandles?: Set<string>, targetUsedHandles?: Set<string>) => {
        sourceX: number;
        sourceY: number;
        targetX: number;
        targetY: number;
        sourceHandle: string;
        targetHandle: string;
    };
    validateHandleConsistency: (handle: string | undefined, isSource: boolean, sourceNode: StrategyNode, targetNode: StrategyNode) => boolean;
    selectBestAlternative: (idealHandles: string[], availableHandles: string[], nodePosition: "source" | "target", deltaX: number, deltaY: number) => string;
};

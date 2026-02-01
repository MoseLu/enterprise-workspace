import type { Ref } from 'vue';
import type { StrategyConnection, StrategyNode } from '@/types/strategy';
/**
 * 悬空连线处理逻辑
 * 负责处理一端或两端节点缺失的连线渲染
 */
export declare function useOrphanedConnection(nodes: Ref<StrategyNode[]>): {
    handleOrphanedConnection: (connection: StrategyConnection, sourceNode: StrategyNode | undefined, targetNode: StrategyNode | undefined, connectionOffsetY: Record<string, number>) => {
        id: string;
        path: string;
        color: string;
        marker: string;
        direction: "horizontal" | "vertical";
        isOrphaned: boolean;
    };
};

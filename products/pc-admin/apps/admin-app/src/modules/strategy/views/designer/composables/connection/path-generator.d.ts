import type { Ref } from 'vue';
import type { StrategyConnection, StrategyNode } from '@/types/strategy';
/**
 * 连接路径生成逻辑
 * 负责根据连接点位置生成正交路径
 */
export declare function useConnectionPathGenerator(nodes: Ref<StrategyNode[]>, connectionOffsetY: Record<string, number>): {
    getConnectionPoint: (node: StrategyNode, handle: string | undefined, defaultHandle: string) => {
        x: any;
        y: any;
    };
    getConnectionPath: (connection: StrategyConnection) => string;
    generateOrthogonalPath: (sourceX: number, sourceY: number, targetX: number, targetY: number, sourceIsRight: boolean, sourceIsLeft: boolean, sourceIsTop: boolean, sourceIsBottom: boolean, targetIsRight: boolean, targetIsLeft: boolean, targetIsTop: boolean, targetIsBottom: boolean) => string;
};

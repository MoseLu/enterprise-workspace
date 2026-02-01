import { type Ref } from 'vue';
import type { StrategyNode, StrategyConnection } from '@/types/strategy';
/**
 * 撤销/重做管理
 *
 * 实现无限次数的撤销/重做功能，支持：
 * - 节点的增加、删除、拖拽、缩放、文本编辑
 * - 连线的增加、删除
 *
 * 注意：不包含视图操作（缩放、平移），只记录内容变更
 */
export declare function useUndoRedo(nodes: Ref<StrategyNode[]>, connections: Ref<StrategyConnection[]>, connectionOffsetY: Record<string, number>): {
    recordHistory: () => void;
    undo: () => boolean;
    redo: () => boolean;
    clearHistory: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
};

import { type Ref } from 'vue';
import type { StrategyNode, StrategyConnection } from '@/types/strategy';
/**
 * 设计器事件处理逻辑
 * 负责处理键盘、鼠标等全局事件
 */
export declare function useDesignerEvents(panX: Ref<number>, panY: Ref<number>, canvasScale: Ref<number>, isDragging: Ref<boolean>, isResizing: Ref<boolean>, editingNodeId: Ref<string | null>, isOverlayEditing: Ref<boolean>, dragState: any, canvasDimensions: Ref<{
    width: number;
    height: number;
}>, nodes: Ref<StrategyNode[]>, connections: Ref<StrategyConnection[]>, selectedNodeId: Ref<string>, selectedConnectionId: Ref<string>, multiSelectedNodeIds: Ref<Set<string>>, multiSelectedConnectionIds: Ref<Set<string>>, selection: any, handleResizeMove: (event: MouseEvent) => void, handleResizeEnd: () => void, handleNodePointerMove: (event: MouseEvent) => void, handleNodePointerUp: (event: MouseEvent) => void, handleCanvasMouseMove: (event: MouseEvent) => void, handleCanvasMouseUp: () => void, undo: () => boolean, redo: () => boolean, recordHistory: () => void, saveNow: () => void, addNode: (component: any, position: {
    x: number;
    y: number;
}) => Promise<any>, completeConnection: (nodeId: string) => boolean): {
    handleCanvasDrop: (event: DragEvent) => Promise<void>;
    deleteSelected: () => void;
    handleKeyDown: (event: KeyboardEvent) => void;
    handleGlobalMouseMove: (event: MouseEvent) => void;
    handleGlobalMouseUp: (event: MouseEvent) => void;
    handleComponentClick: (component: any) => Promise<void>;
    handleCompleteConnection: (nodeId: string) => void;
    lastGridOffset: Ref<{
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    } | {
        x: number;
        y: number;
    }>;
    lastCanvasDimensions: Ref<{
        width: number;
        height: number;
    }, {
        width: number;
        height: number;
    } | {
        width: number;
        height: number;
    }>;
};

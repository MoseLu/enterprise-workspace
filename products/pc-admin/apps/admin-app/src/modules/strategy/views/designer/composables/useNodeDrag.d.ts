import { type Ref } from 'vue';
/**
 * 节点拖拽逻辑
 */
export declare function useNodeDrag(nodes: Ref<any[]>, selectedNodeId: Ref<string>, canvasDimensions: Ref<{
    width: number;
    height: number;
}>, canvasScale: Ref<number>, isResizing: Ref<boolean>, isOverlayEditing: Ref<boolean>, nodeIsDragging: Ref<boolean>, moveNode: (nodeId: string, position: {
    x: number;
    y: number;
}) => void, getHandlePositions: (nodeType: string, width: number, height: number) => any, getArrowTransformByPos: (x: number, y: number, nodeType: string, width: number, height: number, direction: string) => string, handleNodeDoubleClick?: (node: any, event?: MouseEvent) => void): {
    dragState: {
        isDragging: boolean;
        startX: number;
        startY: number;
        startNodeX: number;
        startNodeY: number;
        maybeDrag: boolean;
    };
    isDragging: globalThis.ComputedRef<boolean>;
    draggingNodeId: globalThis.ComputedRef<string>;
    handleNodePointerDown: (e: MouseEvent, node: any) => void;
    handleNodePointerMove: (e: MouseEvent) => void;
    handleNodePointerUp: (e: MouseEvent) => void;
    syncNodeVisuals: (_nodeId: string, _x: number, _y: number) => void;
    dragStateRefs: {
        isDragging: globalThis.ComputedRef<boolean>;
        maybeDrag: globalThis.ComputedRef<boolean>;
    };
};

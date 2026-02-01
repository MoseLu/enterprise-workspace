import { type Ref } from 'vue';
/**
 * 节点缩放逻辑
 */
export declare function useNodeResize(nodes: Ref<any[]>, selectedNodeId: Ref<string>, canvasDimensions: Ref<{
    width: number;
    height: number;
}>, canvasScale: Ref<number>, isMouseOnNodeBorder: Ref<boolean>, getHandlePositions: (nodeType: string, width: number, height: number) => any, getArrowTransform: (node: any, direction: string) => string, getArrowTransformByPos: (x: number, y: number, nodeType: string, width: number, height: number, direction: string) => string): {
    isResizing: Ref<boolean, boolean>;
    resizeStart: Ref<{
        x: number;
        y: number;
        width: number;
        height: number;
        nodeX: number;
        nodeY: number;
    }, {
        x: number;
        y: number;
        width: number;
        height: number;
        nodeX: number;
        nodeY: number;
    } | {
        x: number;
        y: number;
        width: number;
        height: number;
        nodeX: number;
        nodeY: number;
    }>;
    resizeDirection: Ref<string, string>;
    resizingNodeId: Ref<string, string>;
    resizeRafId: Ref<number, number>;
    handleResizeHandleEnter: () => void;
    handleResizeHandleLeave: () => void;
    handleResizeStart: (event: MouseEvent, node: any, direction: string) => void;
    handleResizeMove: (event: MouseEvent) => void;
    handleResizeEnd: () => void;
    syncNodeResizeVisuals: (nodeId: string, x: number, y: number, width: number, height: number) => void;
};

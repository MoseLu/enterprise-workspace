import { type Ref } from 'vue';
/**
 * 节点几何计算函数
 */
export declare function useNodeGeometry(canvasDimensions: Ref<{
    width: number;
    height: number;
}>): {
    getHandlePositions: (nodeType: string, width: number, height: number) => any;
    getArrowTransform: (node: any, direction: string) => string;
    getArrowTransformByPos: (x: number, y: number, nodeType: string, width: number, height: number, direction: string) => string;
    getHandleCursor: (handleType: string) => string;
    getPositionBoxLocalTransform: (node: any) => string;
    positionBoxPlacementLocal: Map<string, "top" | "bottom">;
};

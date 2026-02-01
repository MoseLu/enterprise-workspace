import { type Ref } from 'vue';
/**
 * 连接手柄拖拽
 */
export declare function useConnectionHandles(connections: Ref<any[]>, nodes: Ref<any[]>, connectionOffsetY: Record<string, number>, canvasScale: Ref<number>): {
    getConnectionHandle: (pathId: string, pathString?: string) => {
        sx: number;
        sy: number;
        middleHandles: {
            x: number;
            y: number;
            segmentIndex: number;
        }[];
        tx: number;
        ty: number;
    };
    startDragConnectionHandle: (e: MouseEvent, connectionId: string, segmentIndex?: number) => void;
};

/**
 * 画布交互管理
 */
export declare function useCanvasInteraction(updateTempConnection?: (event: MouseEvent, canvasRef: HTMLElement) => void): {
    currentTool: globalThis.Ref<"drag" | "select", "drag" | "select">;
    zoom: globalThis.Ref<number, number>;
    panX: globalThis.Ref<number, number>;
    panY: globalThis.Ref<number, number>;
    dragState: {
        isDragging: boolean;
        startPos: {
            x: number;
            y: number;
        };
    };
    setTool: (tool: "select" | "drag") => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    fitToScreen: (canvasRef: HTMLElement | null, nodes: any[]) => void;
    handleCanvasMouseDown: (event: MouseEvent) => void;
    handleCanvasMouseMove: (event: MouseEvent) => void;
    handleCanvasMouseUp: () => void;
    handleCanvasWheel: (event: WheelEvent, canvasRef?: HTMLElement | null) => void;
};

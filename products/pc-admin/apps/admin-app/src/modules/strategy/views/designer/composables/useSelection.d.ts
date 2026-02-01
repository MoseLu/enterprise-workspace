export declare function useSelection(options: {
    nodes: any;
    connections: any;
    panX: any;
    panY: any;
    canvasScale: any;
    isOverlayEditing: any;
    connectionState: any;
    selectedNodeId: any;
    connectionOffsetY?: any;
    getConnectionHandle?: (connectionId: string, pathString?: string) => {
        sx: number;
        sy: number;
        middleHandles?: Array<{
            x: number;
            y: number;
            segmentIndex: number;
        }>;
        mx?: number;
        my?: number;
        tx: number;
        ty: number;
    };
    fallthrough: {
        handleCanvasMouseDown: (e: MouseEvent) => void;
        handleCanvasMouseMove: (e: MouseEvent) => void;
        handleCanvasMouseUp: (e?: MouseEvent) => void;
    };
}): {
    rubber: {
        active: boolean;
        startX: number;
        startY: number;
        x: number;
        y: number;
        w: number;
        h: number;
    };
    multiSelectedNodeIds: globalThis.Ref<Set<string> & Omit<Set<string>, keyof Set<any>>, Set<string> | (Set<string> & Omit<Set<string>, keyof Set<any>>)>;
    multiSelectedConnectionIds: globalThis.Ref<Set<string> & Omit<Set<string>, keyof Set<any>>, Set<string> | (Set<string> & Omit<Set<string>, keyof Set<any>>)>;
    lastSelectionMode: globalThis.Ref<"none" | "click" | "rubber", "none" | "click" | "rubber">;
    onCanvasMouseDown: (e: MouseEvent) => void;
    onCanvasMouseMove: (e: MouseEvent) => void;
    onCanvasMouseUp: (e?: MouseEvent) => void;
    clearMultiSelection: () => void;
};

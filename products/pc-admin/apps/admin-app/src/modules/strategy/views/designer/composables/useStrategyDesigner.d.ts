import type { StrategyNode, StrategyConnection } from '@/types/strategy';
/**
 * 策略设计器主要逻辑
 */
export declare function useStrategyDesigner(): {
    nodes: any;
    connections: any;
    selectedNodeId: any;
    selectedNode: globalThis.ComputedRef<any>;
    selectedConnectionId: any;
    selectedConnection: globalThis.ComputedRef<any>;
    isDragging: globalThis.Ref<boolean, boolean>;
    isConnecting: globalThis.Ref<boolean, boolean>;
    tempConnection: globalThis.Ref<any, any>;
    panX: globalThis.Ref<number, number>;
    panY: globalThis.Ref<number, number>;
    editingNodeId: globalThis.Ref<string, string>;
    editingText: globalThis.Ref<string, string>;
    textInputRef: globalThis.Ref<HTMLInputElement, HTMLInputElement>;
    activeArrowDirection: globalThis.Ref<string, string>;
    hoveredNodeId: globalThis.Ref<string, string>;
    showShapeSelector: globalThis.Ref<boolean, boolean>;
    shapeSelectorVisible: globalThis.Ref<boolean, boolean>;
    shapeSelectorPosition: globalThis.Ref<{
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    } | {
        x: number;
        y: number;
    }>;
    commonShapes: globalThis.Ref<{
        type: string;
        name: string;
        color: string;
    }[], {
        type: string;
        name: string;
        color: string;
    }[] | {
        type: string;
        name: string;
        color: string;
    }[]>;
    nodeTextConfig: globalThis.Ref<{
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
        fontStyle: string;
    }, {
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
        fontStyle: string;
    } | {
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
        fontStyle: string;
    }>;
    defaultTextConfig: {
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
        fontStyle: string;
    };
    canvasScale: any;
    minScale: any;
    maxScale: any;
    scalePercentage: any;
    strategyName: any;
    currentOrchestration: any;
    componentSearch: any;
    activeCategories: any;
    filteredComponentCategories: any;
    componentLibrary: any;
    handleZoomIn: any;
    handleZoomOut: any;
    handleFitToScreen: any;
    handleCanvasDrop: (event: DragEvent) => Promise<void>;
    handleCanvasDragLeave: (event: DragEvent) => void;
    handleCanvasMouseDown: (event: MouseEvent) => void;
    handleCanvasMouseMove: (event: MouseEvent) => void;
    handleCanvasMouseUp: (event: MouseEvent) => void;
    handleCanvasClick: (event: MouseEvent) => void;
    handleNodeMouseDown: any;
    handleNodeClick: (_node: StrategyNode, _event?: MouseEvent) => void;
    handleNodeDoubleClick: (_node: StrategyNode, _event?: MouseEvent) => void;
    handleNodeMouseEnter: (_node: StrategyNode) => void;
    handleNodeMouseLeave: () => void;
    handleConnectionMouseDown: (_event: MouseEvent, connection: StrategyConnection) => void;
    handleArrowClick: (event: MouseEvent, node: any, direction: string, position: {
        x: number;
        y: number;
    }) => void;
    handleShapeSelect: (shape: any) => void;
    handleComponentClick: (component: any) => Promise<void>;
    handleComponentDragStart: any;
    handleCanvasDragOver: any;
    parseDropData: any;
    finishTextEditing: () => void;
    cancelTextEditing: () => void;
    handleTextEditKeyDown: (event: KeyboardEvent) => void;
    deleteSelected: () => Promise<void>;
    addNode: any;
    updateNode: any;
    deleteNode: any;
    selectNode: any;
    addConnection: any;
    updateConnection: any;
    deleteConnection: any;
    selectConnection: any;
    validateOrchestration: any;
    previewExecution: any;
    handleSave: any;
    getNodeStyle: any;
    getNodeColor: any;
    getOutputConnectionClass: any;
    getConnectionStyle: (_connection: StrategyConnection) => Record<string, never>;
    getConnectionColor: any;
    getConnectionClass: (_connection: StrategyConnection) => string;
};

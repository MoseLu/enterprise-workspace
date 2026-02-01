import type { StrategyNode, NodeType } from '@/types/strategy';
/**
 * 节点管理
 */
export declare function useNodeManagement(canvasDimensions?: {
    value: {
        width: number;
        height: number;
    };
}): {
    nodes: globalThis.Ref<any, any>;
    selectedNodeId: globalThis.Ref<string, string>;
    selectedNode: globalThis.ComputedRef<any>;
    isDragging: globalThis.Ref<boolean, boolean>;
    draggingNodeId: globalThis.Ref<string, string>;
    dragOffset: globalThis.Ref<{
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    } | {
        x: number;
        y: number;
    }>;
    dragStartPosition: globalThis.Ref<{
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    } | {
        x: number;
        y: number;
    }>;
    addNode: (component: any, position: {
        x: number;
        y: number;
    }) => Promise<any>;
    selectNode: (nodeId: string) => void;
    moveNode: (nodeId: string, position: {
        x: number;
        y: number;
    }) => void;
    updateNodeProperties: (nodeId: string, properties: Partial<StrategyNode>) => void;
    updateNode: (nodeId: string, updates: Partial<StrategyNode>) => void;
    deleteNode: (nodeId: string, skipConfirm?: boolean) => Promise<boolean>;
    clearNodes: () => void;
    generateId: () => string;
    getNodeColor: (type: NodeType) => string;
    getNodeStyle: (node: StrategyNode) => Record<string, never>;
    getNodeIcon: (type: NodeType) => string;
    getOutputConnectionClass: (node: StrategyNode) => "" | "conditional";
    handleNodeMouseDown: (event: MouseEvent, node: StrategyNode, isEditingText?: boolean, canvasDimensions?: {
        width: number;
        height: number;
    }) => void;
    updatePositionBox: (nodeId: string, x: number, y: number, width: number, height: number) => void;
};

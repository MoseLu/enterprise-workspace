import { type Ref } from 'vue';
/**
 * 节点交互逻辑
 */
export declare function useNodeInteraction(nodes: Ref<any[]>, selectedNodeId: Ref<string>, isOverlayEditing: Ref<boolean>, editingNodeId: Ref<string | null>, showComponentMenuFlag: Ref<boolean>, closeComponentMenu: () => void, activeArrowDirection: Ref<string>, lastSelectionMode: Ref<'click' | 'rubber'>, findNearbyNode: (sourceNode: any, direction: string) => any, createConnection: (sourceNode: any, targetNode: any, direction: string) => void, showComponentMenu: (node: any, direction: string) => void, nodeTextConfig: Ref<any>, defaultTextConfig: any, isMouseOnNodeBorder: Ref<boolean>, clearMultiSelection?: () => void, // 添加清空多选的函数
clearConnectionSelection?: () => void): {
    hoveredNodeId: Ref<string, string>;
    currentHoveredNode: Ref<any, any>;
    hoveredArrowDirection: Ref<string, string>;
    handleNodeClick: (node: any, event?: MouseEvent) => void;
    handleNodeMouseEnter: (node: any) => void;
    handleNodeMouseLeave: () => void;
    handleArrowClick: (event: MouseEvent, node: any, direction: string) => void;
    handleArrowEnter: (direction: string) => void;
    handleArrowLeave: () => void;
    handleConnectionPointClick: (event: MouseEvent, node: any, direction: string) => void;
    handleCanvasClick: (event: MouseEvent) => void;
    handleCanvasDragLeave: (event: DragEvent) => void;
};

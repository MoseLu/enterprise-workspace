import { type Ref } from 'vue';
/**
 * 文本编辑逻辑
 */
export declare function useTextEditor(nodes: Ref<any[]>, selectedNodeId: Ref<string>, canvasScale: Ref<number>, panX: Ref<number>, panY: Ref<number>, canvasDimensions: Ref<{
    width: number;
    height: number;
}>, dragState: {
    isDragging: Ref<boolean>;
    maybeDrag: Ref<boolean>;
}, getNodeText: (type: string) => string): {
    editingNodeId: Ref<string, string>;
    editingNodeIdString: globalThis.ComputedRef<string>;
    editingText: Ref<string, string>;
    isOverlayEditing: Ref<boolean, boolean>;
    nodeTextConfig: Ref<{
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
    fontFamilyOptions: {
        label: string;
        value: string;
    }[];
    handleNodeDoubleClick: (node: any, event?: MouseEvent) => void;
    openOverlayTextEditor: (node: any) => void;
    finishTextEditing: () => void;
    handleTextEditKeyDown: (event: KeyboardEvent) => void;
    cancelTextEditing: () => void;
    updateNodeTextConfig: () => void;
    getFontFamilyLabel: (fontFamily: string) => string;
};

import { type Ref } from 'vue';
/**
 * 画布缩放管理
 */
export declare function useCanvasScale(panX: Ref<number>, panY: Ref<number>): {
    canvasScale: Ref<number, number>;
    minScale: number;
    maxScale: number;
    scaleStep: number;
    scaleInputValue: Ref<string, string>;
    isInputFocused: Ref<boolean, boolean>;
    scalePercentage: globalThis.ComputedRef<number>;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    handleFitToScreen: () => void;
    handleZoomCommand: (command: string) => void;
    updateScaleInputValue: () => void;
    handleScaleInputChange: (value: string) => void;
    handleScaleInputBlur: () => void;
    handleScaleInputEnter: () => void;
};

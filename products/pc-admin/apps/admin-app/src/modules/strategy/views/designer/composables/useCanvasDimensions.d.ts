/**
 * 画布尺寸管理
 */
export declare function useCanvasDimensions(): {
    canvasDimensions: globalThis.Ref<{
        width: number;
        height: number;
    }, {
        width: number;
        height: number;
    } | {
        width: number;
        height: number;
    }>;
    gridSize: globalThis.ComputedRef<{
        small: number;
        large: number;
    }>;
    updateCanvasDimensions: () => void;
};

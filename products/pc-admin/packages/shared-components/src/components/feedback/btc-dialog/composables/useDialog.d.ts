import type { DialogProps } from '../types';
/**
 * 瀵硅瘽妗嗙姸鎬佺鐞? */
export declare function useDialog(props: DialogProps, emit: any): {
    Dialog: globalThis.Ref<any, any>;
    visible: globalThis.Ref<boolean, boolean>;
    fullscreen: globalThis.Ref<boolean, boolean>;
    cacheKey: globalThis.Ref<number, number>;
    isFullscreen: globalThis.ComputedRef<boolean>;
    isMobile: globalThis.ComputedRef<boolean>;
    open: () => void;
    close: () => void;
    onClose: () => void;
    onClosed: () => void;
    changeFullscreen: (val?: boolean) => void;
    dblClickFullscreen: () => void;
};


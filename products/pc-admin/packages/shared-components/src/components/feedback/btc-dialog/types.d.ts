/**
 * BtcDialog Props
 */
export interface DialogProps {
    modelValue: boolean;
    title?: string;
    height?: string | number;
    width?: string | number;
    padding?: string;
    keepAlive?: boolean;
    fullscreen?: boolean;
    controls?: string[];
    hideHeader?: boolean;
    beforeClose?: (done: () => void) => void | Promise<void>;
    scrollbar?: boolean;
    transparent?: boolean;
    alignCenter?: boolean;
}
/**
 * BtcDialog Emits
 */
export interface DialogEmits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'fullscreen-change', value: boolean): void;
    (e: 'closed'): void;
}

import { type Ref } from 'vue';
/**
 * 组件库管理
 */
export declare function useComponentLibrary(nodes?: Ref<any[]>): {
    componentSearch: Ref<string, string>;
    activeCategories: Ref<string[], string[]>;
    componentCategories: globalThis.ComputedRef<{
        name: string;
        title: string;
        components: {
            type: any;
            name: string;
            disabled: boolean;
        }[];
    }[]>;
    filteredComponentCategories: globalThis.ComputedRef<{
        name: string;
        title: string;
        components: {
            type: any;
            name: string;
            disabled: boolean;
        }[];
    }[]>;
    componentLibrary: globalThis.ComputedRef<{
        type: any;
        name: string;
        disabled: boolean;
    }[]>;
    handleComponentDragStart: (event: DragEvent, component: any) => void;
    handleCanvasDragOver: (event: DragEvent) => void;
    parseDropData: (event: DragEvent) => any;
};

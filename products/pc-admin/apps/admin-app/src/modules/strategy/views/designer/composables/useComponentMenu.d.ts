import { type Ref } from 'vue';
import type { StrategyConnection } from '@/types/strategy';
/**
 * 组件菜单逻辑
 */
export declare function useComponentMenu(nodes: Ref<any[]>, connections: Ref<StrategyConnection[]>, componentLibrary: Ref<any[]>, addNode: (component: any, position: {
    x: number;
    y: number;
}) => Promise<any>, generateId: () => string, getConnectionColor: () => string, activeArrowDirection: Ref<string>): {
    showComponentMenuFlag: Ref<boolean, boolean>;
    componentMenuPosition: Ref<{
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    } | {
        x: number;
        y: number;
    }>;
    selectedNodeForConnection: Ref<any, any>;
    selectedDirection: Ref<string, string>;
    showComponentMenu: (node: any, direction: string) => void;
    selectComponent: (component: any) => Promise<void>;
    closeComponentMenu: () => void;
    calculateNewNodePosition: (sourceNode: any, direction: string) => {
        x: any;
        y: any;
    };
    getCommonComponents: () => any[];
    getDirectionText: (direction: string) => string;
    findNearbyNode: (sourceNode: any, direction: string) => any;
    createConnection: (sourceNode: any, targetNode: any, direction: string) => void;
};

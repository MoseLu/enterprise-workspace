import { type Ref } from 'vue';
import type { StrategyConnection, StrategyNode } from '@/types/strategy';
/**
 * 连接管理主入口
 * 整合所有连接相关的功能模块
 */
export declare function useConnectionManagement(nodes: Ref<StrategyNode[]>): {
    connections: Ref<any, any>;
    selectedConnectionId: Ref<string, string>;
    selectedConnection: globalThis.ComputedRef<any>;
    connectionState: {
        isConnecting: boolean;
        fromNodeId: string;
        fromCondition: "true" | "false" | undefined;
        tempConnection: {
            path: string;
        };
    };
    tempConnection: globalThis.ComputedRef<{
        path: string;
    }>;
    connectionPaths: Ref<{
        id: string;
        path: string;
        color: string;
        marker: string;
        direction?: "horizontal" | "vertical";
        isOrphaned?: boolean;
    }[], {
        id: string;
        path: string;
        color: string;
        marker: string;
        direction?: "horizontal" | "vertical";
        isOrphaned?: boolean;
    }[] | {
        id: string;
        path: string;
        color: string;
        marker: string;
        direction?: "horizontal" | "vertical";
        isOrphaned?: boolean;
    }[]>;
    startConnection: (fromNodeId: string, event: MouseEvent, condition?: "true" | "false") => void;
    updateTempConnection: (event: MouseEvent, canvasRef?: HTMLElement) => void;
    completeConnection: (toNodeId: string) => boolean;
    cancelConnection: () => void;
    selectConnection: (connection: StrategyConnection) => void;
    updateConnectionProperties: (connectionId: string, properties: Partial<StrategyConnection>) => void;
    updateConnection: (connectionId: string, updates: Partial<StrategyConnection>) => void;
    addConnection: (connection: StrategyConnection) => void;
    deleteConnection: (connectionId: string, skipConfirm?: boolean) => Promise<boolean>;
    deleteNodeConnections: (nodeId: string) => void;
    getConnectionPath: any;
    connectionOffsetY: Record<string, number>;
    getConnectionColor: any;
    getConnectionMarker: any;
    handleConnectionStart: (event: MouseEvent, node: StrategyNode, type: "input" | "output" | "output-true" | "output-false") => void;
    clearConnections: () => void;
    updateConnectionPaths: () => void;
};

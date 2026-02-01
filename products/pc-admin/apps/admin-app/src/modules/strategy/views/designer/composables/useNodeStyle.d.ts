import { type Ref } from 'vue';
/**
 * 节点样式getter函数
 */
export declare function useNodeStyle(nodes: Ref<any[]>, connectionState: {
    isConnecting: boolean;
    fromNodeId: string;
    fromCondition?: 'true' | 'false';
}): {
    getNodeText: (type: string) => string;
    getNodeFillColor: (type: string) => string;
    getNodeStrokeColor: (type: string) => string;
    getNodeTextColor: (type: string) => string;
    getConnectionColor: () => string;
    getTempConnectionColor: () => "var(--el-color-primary)" | "var(--el-color-success)" | "var(--el-color-danger)";
    getGridColor: (isSmall?: boolean) => string;
    getThemeColor: (cssVar: string) => string;
    isDarkTheme: globalThis.ComputedRef<boolean>;
};

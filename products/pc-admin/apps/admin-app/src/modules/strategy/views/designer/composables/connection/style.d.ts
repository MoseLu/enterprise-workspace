import type { Ref } from 'vue';
import type { StrategyConnection } from '@/types/strategy';
/**
 * 连接样式计算逻辑
 * 负责计算连接的样式、颜色、标记等
 */
export declare function useConnectionStyle(nodes: Ref<any[]>): {
    computeConnectionStyle: (connection: StrategyConnection) => {
        color: any;
        marker: string;
    };
    getConnectionColor: (connection: StrategyConnection) => string;
    getConnectionMarker: (connection: StrategyConnection) => string;
    getConnectionDirection: (connection: StrategyConnection, pathString?: string) => "horizontal" | "vertical";
};

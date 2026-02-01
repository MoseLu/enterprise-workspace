import { type Ref } from 'vue';
import type { StrategyNode, StrategyConnection } from '@/types/strategy';
/**
 * 策略操作管理
 */
export declare function useStrategyOperations(nodes: Ref<StrategyNode[]>, connections: Ref<StrategyConnection[]>): {
    strategyName: Ref<string, string>;
    showPreview: Ref<boolean, boolean>;
    currentOrchestration: globalThis.ComputedRef<StrategyOrchestration>;
    validateOrchestration: () => Promise<boolean>;
    previewExecution: () => void;
    saveOrchestration: (strategyId?: string) => Promise<boolean>;
    handleSave: () => Promise<void>;
    loadOrchestration: (strategyId: string) => Promise<any>;
    clearOrchestration: () => void;
    exportOrchestration: () => void;
    importOrchestration: (file: File) => Promise<boolean>;
};

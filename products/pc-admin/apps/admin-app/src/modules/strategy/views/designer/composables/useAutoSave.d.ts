/**
 * 操作驱动的实时保存管理
 * 使用 IndexedDB 保存画布内容
 * 采用 draw.io 的方式：操作完成后立即保存
 */
import { type Ref } from 'vue';
import type { StrategyNode, StrategyConnection } from '@/types/strategy';
interface AutoSaveOptions {
    nodes: Ref<StrategyNode[]>;
    connections: Ref<StrategyConnection[]>;
    connectionOffsetY: Record<string, number>;
    canvasPosition: {
        x: Ref<number>;
        y: Ref<number>;
    };
    canvasScale: Ref<number>;
    strategyName?: Ref<string>;
    autoSaveEnabled?: boolean;
}
/**
 * 操作驱动的实时保存
 */
export declare function useAutoSave(options: AutoSaveOptions): {
    fileId: Ref<string, string>;
    lastSaved: Ref<Date, Date>;
    isSaving: Ref<boolean, boolean>;
    isLoading: Ref<boolean, boolean>;
    saveNow: () => Promise<void>;
    loadFromIndexedDB: (targetFileId?: string) => Promise<boolean>;
    setFileId: (id: string) => void;
    getFileList: () => Promise<any>;
    deleteFile: (targetFileId: string) => Promise<void>;
};
export {};

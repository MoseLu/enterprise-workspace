/**
 * IndexedDB 持久化工具
 * 模仿 draw.io 的 IndexedDB 存储结构
 * 包含三个对象存储：
 * - files: 存储文件基本信息
 * - filesInfo: 存储文件的元信息
 * - objects: 存储文件的实际内容（节点、连线等）
 */
import type { StrategyNode, StrategyConnection } from '@/types/strategy';
interface FileInfo {
    id: string;
    name: string;
    size: number;
    created: number;
    modified: number;
    lastOpened: number;
}
interface FileData {
    nodes: StrategyNode[];
    connections: StrategyConnection[];
    connectionOffsetY: Record<string, number>;
    canvasPosition?: {
        x: number;
        y: number;
    };
    canvasScale?: number;
}
interface FileMeta {
    id: string;
    name: string;
    description?: string;
    tags?: string[];
    version?: number;
}
declare class IndexedDBManager {
    private db;
    private initPromise;
    /**
     * 初始化数据库
     */
    init(): Promise<void>;
    /**
     * 确保数据库已初始化
     */
    private ensureInit;
    /**
     * 保存文件
     * @param fileId 文件ID
     * @param name 文件名
     * @param data 文件内容
     */
    saveFile(fileId: string, name: string, data: FileData): Promise<void>;
    /**
     * 加载文件
     * @param fileId 文件ID
     * @returns 文件内容
     */
    loadFile(fileId: string): Promise<FileData | null>;
    /**
     * 获取文件列表
     * @returns 文件信息列表
     */
    getFileList(): Promise<FileInfo[]>;
    /**
     * 获取文件信息
     * @param fileId 文件ID
     * @returns 文件信息
     */
    getFileInfo(fileId: string): Promise<FileInfo | null>;
    /**
     * 删除文件
     * @param fileId 文件ID
     */
    deleteFile(fileId: string): Promise<void>;
    /**
     * 保存文件元信息
     * @param meta 文件元信息
     */
    saveFileMeta(meta: FileMeta): Promise<void>;
    /**
     * 获取文件元信息
     * @param fileId 文件ID
     * @returns 文件元信息
     */
    getFileMeta(fileId: string): Promise<FileMeta | null>;
    /**
     * 清空所有数据
     */
    clearAll(): Promise<void>;
    /**
     * 关闭数据库连接
     */
    close(): void;
}
export declare const indexedDBManager: IndexedDBManager;
export {};

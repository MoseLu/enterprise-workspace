/**
 * IndexedDB 持久化工具
 * 模仿 draw.io 的 IndexedDB 存储结构
 * 包含三个对象存储：
 * - files: 存储文件基本信息
 * - filesInfo: 存储文件的元信息
 * - objects: 存储文件的实际内容（节点、连线等）
 */

import type { StrategyNode, StrategyConnection } from '@/types/strategy';

const DB_NAME = 'btc-strategy-designer';
const DB_VERSION = 1;

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
  canvasPosition?: { x: number; y: number };
  canvasScale?: number;
}

interface FileMeta {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  version?: number;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    if (this.db) {
      return Promise.resolve();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建 files 对象存储（文件基本信息）
        if (!db.objectStoreNames.contains('files')) {
          const filesStore = db.createObjectStore('files', { keyPath: 'id', autoIncrement: false });
          filesStore.createIndex('modified', 'modified', { unique: false });
          filesStore.createIndex('created', 'created', { unique: false });
        }

        // 创建 filesInfo 对象存储（文件元信息）
        if (!db.objectStoreNames.contains('filesInfo')) {
          const filesInfoStore = db.createObjectStore('filesInfo', { keyPath: 'id', autoIncrement: false });
          filesInfoStore.createIndex('name', 'name', { unique: false });
        }

        // 创建 objects 对象存储（文件实际内容）
        if (!db.objectStoreNames.contains('objects')) {
          db.createObjectStore('objects', { keyPath: 'id', autoIncrement: false });
        }

      };
    });

    return this.initPromise;
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureInit(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  /**
   * 保存文件
   * @param fileId 文件ID
   * @param name 文件名
   * @param data 文件内容
   */
  async saveFile(fileId: string, name: string, data: FileData): Promise<void> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();
    const dataStr = JSON.stringify(data);
    const size = new Blob([dataStr]).size;

    // 先获取文件信息（如果存在）
    const existingFile = await this.getFileInfo(fileId);

    // 保存文件基本信息
    const fileInfo: FileInfo = {
      id: fileId,
      name,
      size,
      created: existingFile ? existingFile.created : now,
      modified: now,
      lastOpened: now
    };

    // 创建事务
    const transaction = this.db.transaction(['files', 'objects'], 'readwrite');
    
    if (existingFile) {
      // 更新现有文件
      transaction.objectStore('files').put(fileInfo);
    } else {
      // 创建新文件
      transaction.objectStore('files').add(fileInfo);
    }

    // 保存文件内容
    transaction.objectStore('objects').put({ id: fileId, data });

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }

  /**
   * 加载文件
   * @param fileId 文件ID
   * @returns 文件内容
   */
  async loadFile(fileId: string): Promise<FileData | null> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');

    const objectsStore = this.db.transaction(['objects'], 'readonly');
    const request = objectsStore.objectStore('objects').get(fileId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.data) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 获取文件列表
   * @returns 文件信息列表
   */
  async getFileList(): Promise<FileInfo[]> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');

    const filesStore = this.db.transaction(['files'], 'readonly');
    const request = filesStore.objectStore('files').getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const files = request.result as FileInfo[];
        // 按修改时间降序排序
        files.sort((a, b) => b.modified - a.modified);
        resolve(files);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 获取文件信息
   * @param fileId 文件ID
   * @returns 文件信息
   */
  async getFileInfo(fileId: string): Promise<FileInfo | null> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');

    const filesStore = this.db.transaction(['files'], 'readonly');
    const request = filesStore.objectStore('files').get(fileId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result as FileInfo || null);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 删除文件
   * @param fileId 文件ID
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['files', 'filesInfo', 'objects'], 'readwrite');
    
    transaction.objectStore('files').delete(fileId);
    transaction.objectStore('filesInfo').delete(fileId);
    transaction.objectStore('objects').delete(fileId);

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }

  /**
   * 保存文件元信息
   * @param meta 文件元信息
   */
  async saveFileMeta(meta: FileMeta): Promise<void> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');

    const filesInfoStore = this.db.transaction(['filesInfo'], 'readwrite');
    filesInfoStore.objectStore('filesInfo').put(meta);

    await new Promise<void>((resolve, reject) => {
      filesInfoStore.oncomplete = () => {
        resolve();
      };
      filesInfoStore.onerror = () => {
        reject(filesInfoStore.error);
      };
    });
  }

  /**
   * 获取文件元信息
   * @param fileId 文件ID
   * @returns 文件元信息
   */
  async getFileMeta(fileId: string): Promise<FileMeta | null> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');

    const filesInfoStore = this.db.transaction(['filesInfo'], 'readonly');
    const request = filesInfoStore.objectStore('filesInfo').get(fileId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result as FileMeta || null);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 清空所有数据
   */
  async clearAll(): Promise<void> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['files', 'filesInfo', 'objects'], 'readwrite');
    
    transaction.objectStore('files').clear();
    transaction.objectStore('filesInfo').clear();
    transaction.objectStore('objects').clear();

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

// 导出单例
export const indexedDBManager = new IndexedDBManager();


/**
 * 操作驱动的实时保存管理
 * 使用 IndexedDB 保存画布内容
 * 采用 draw.io 的方式：操作完成后立即保存
 */
;

import { ref, onMounted, nextTick, type Ref } from 'vue';
import { indexedDBManager } from '@/modules/strategy/utils/indexedDB';
import type { StrategyNode, StrategyConnection } from '@/types/strategy';
import { logger } from '@btc/shared-core';

interface AutoSaveOptions {
  nodes: Ref<StrategyNode[]>;
  connections: Ref<StrategyConnection[]>;
  connectionOffsetY: Record<string, number>;
  canvasPosition: { x: Ref<number>; y: Ref<number> };
  canvasScale: Ref<number>;
  strategyName?: Ref<string>;
  autoSaveEnabled?: boolean;
}

/**
 * 操作驱动的实时保存
 */
export function useAutoSave(options: AutoSaveOptions) {
  const {
    nodes,
    connections,
    connectionOffsetY,
    canvasPosition,
    canvasScale,
    strategyName,
    autoSaveEnabled = true
  } = options;

  const fileId = ref<string>('default');
  const lastSaved = ref<Date | null>(null);
  const isSaving = ref(false);
  const isLoading = ref(false);

  /**
   * 保存数据到 IndexedDB
   */
  const saveToIndexedDB = async () => {
    if (!autoSaveEnabled || isSaving.value || isLoading.value) {
      return;
    }

    try {
      isSaving.value = true;
      
      // 使用 JSON 序列化/反序列化来创建深拷贝，确保 IndexedDB 可以克隆
      const data = {
        nodes: JSON.parse(JSON.stringify(nodes.value)),
        connections: JSON.parse(JSON.stringify(connections.value)),
        connectionOffsetY: { ...connectionOffsetY },
        canvasPosition: { x: canvasPosition.x.value, y: canvasPosition.y.value },
        canvasScale: canvasScale.value
      };

      const name = strategyName?.value || 'Unnamed Strategy';
      await indexedDBManager.saveFile(fileId.value, name, data);
      lastSaved.value = new Date();
    } catch (error) {
      logger.error('[AutoSave] Failed to save to IndexedDB:', error);
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * 从 IndexedDB 加载数据
   */
  const loadFromIndexedDB = async (targetFileId?: string): Promise<boolean> => {
    if (isLoading.value || isSaving.value) {
      return false;
    }

    try {
      isLoading.value = true;
      
      const idToLoad = targetFileId || fileId.value;
      const data = await indexedDBManager.loadFile(idToLoad);
      
      if (data) {
        // 恢复画布内容
        nodes.value = data.nodes || [];
        connections.value = data.connections || [];
        
        // 恢复 connectionOffsetY
        Object.keys(connectionOffsetY).forEach(key => {
          delete connectionOffsetY[key];
        });
        if (data.connectionOffsetY) {
          Object.assign(connectionOffsetY, data.connectionOffsetY);
        }
        
        // 恢复画布位置和缩放
        if (data.canvasPosition) {
          canvasPosition.x.value = data.canvasPosition.x;
          canvasPosition.y.value = data.canvasPosition.y;
        }
        
        if (data.canvasScale !== undefined) {
          canvasScale.value = data.canvasScale;
        }
        
        if (targetFileId) {
          fileId.value = targetFileId;
        }
        
        lastSaved.value = new Date();
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('[AutoSave] Failed to load from IndexedDB:', error);
      return false;
    } finally {
      // 使用 nextTick 确保所有 watch 都执行完成后再重置 isLoading
      await nextTick();
      isLoading.value = false;
    }
  };

  /**
   * 设置当前文件ID
   */
  const setFileId = (id: string) => {
    fileId.value = id;
  };

  /**
   * 获取文件列表
   */
  const getFileList = async () => {
    try {
      return await indexedDBManager.getFileList();
    } catch (error) {
      return [];
    }
  };

  /**
   * 删除文件
   */
  const deleteFile = async (targetFileId: string) => {
    await indexedDBManager.deleteFile(targetFileId);
  };

  /**
   * 初始化：尝试从 IndexedDB 加载数据
   */
  const init = async (targetFileId?: string) => {
    await indexedDBManager.init();
    
    if (targetFileId) {
      fileId.value = targetFileId;
    }
    
    // 尝试加载已保存的数据
    const loaded = await loadFromIndexedDB(targetFileId);
    
    return loaded;
  };

  /**
   * 立即保存（操作完成后手动调用）
   */
  const saveNow = async () => {
    await saveToIndexedDB();
  };

  // 组件挂载时初始化
  onMounted(() => {
    init();
  });

  return {
    fileId,
    lastSaved,
    isSaving,
    isLoading,
    saveNow,
    loadFromIndexedDB,
    setFileId,
    getFileList,
    deleteFile
  };
}


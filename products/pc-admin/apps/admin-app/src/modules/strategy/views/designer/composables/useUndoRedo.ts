import { ref, type Ref } from 'vue';
import type { StrategyNode, StrategyConnection } from '@/types/strategy';

/**
 * 撤销/重做管理
 * 
 * 实现无限次数的撤销/重做功能，支持：
 * - 节点的增加、删除、拖拽、缩放、文本编辑
 * - 连线的增加、删除
 * 
 * 注意：不包含视图操作（缩放、平移），只记录内容变更
 */
export function useUndoRedo(nodes: Ref<StrategyNode[]>, connections: Ref<StrategyConnection[]>, connectionOffsetY: Record<string, number>) {
  // 历史记录栈
  const historyStack = ref<Array<{ nodes: StrategyNode[]; connections: StrategyConnection[]; connectionOffsetY: Record<string, number> }>>([]);
  // 当前历史指针（指向历史记录栈中的当前位置）
  const historyIndex = ref(-1);
  // 最大历史记录数（防止内存溢出）
  const MAX_HISTORY_SIZE = 100;

  // 深度复制节点数组
  const deepCloneNodes = (nodesToClone: StrategyNode[]): StrategyNode[] => {
    return nodesToClone.map(node => ({
      ...node,
      position: { ...node.position },
      data: { ...node.data },
      style: { ...node.style },
      textConfig: { ...node.textConfig }
    }));
  };

  // 深度复制连线数组
  const deepCloneConnections = (connsToClone: StrategyConnection[]): StrategyConnection[] => {
    return connsToClone.map(conn => ({
      ...conn,
      style: conn.style ? { ...conn.style } : undefined
      // ... 运算符会包含所有其他属性（sourceHandle, targetHandle, lastSourceX/Y, lastTargetX/Y 等）
    }));
  };

  // 深度复制 connectionOffsetY
  const deepCloneConnectionOffsetY = (offsetY: Record<string, number>): Record<string, number> => {
    return { ...offsetY };
  };

  // 记录当前状态到历史记录
  const recordHistory = () => {
    const state = {
      nodes: deepCloneNodes(nodes.value),
      connections: deepCloneConnections(connections.value),
      connectionOffsetY: deepCloneConnectionOffsetY(connectionOffsetY)
    };

    // 如果当前不在最新位置，删除当前位置之后的所有历史记录（创建新分支）
    if (historyIndex.value < historyStack.value.length - 1) {
      historyStack.value = historyStack.value.slice(0, historyIndex.value + 1);
    }

    // 添加新状态
    historyStack.value.push(state);
    historyIndex.value = historyStack.value.length - 1;

    // 限制历史记录数量，删除最早的记录
    if (historyStack.value.length > MAX_HISTORY_SIZE) {
      historyStack.value.shift();
      historyIndex.value--;
    }
  };

  // 撤销
  const undo = () => {
    if (historyIndex.value <= 0) {
      return false; // 没有可撤销的历史
    }

    historyIndex.value--;
    applyHistoryState(historyStack.value[historyIndex.value]);
    return true;
  };

  // 重做
  const redo = () => {
    if (historyIndex.value >= historyStack.value.length - 1) {
      return false; // 没有可重做的历史
    }

    historyIndex.value++;
    applyHistoryState(historyStack.value[historyIndex.value]);
    return true;
  };

  // 应用历史状态
  const applyHistoryState = (state: { nodes: StrategyNode[]; connections: StrategyConnection[]; connectionOffsetY: Record<string, number> }) => {
    // 深度复制并替换当前状态
    nodes.value = deepCloneNodes(state.nodes);
    connections.value = deepCloneConnections(state.connections);
    // 恢复 connectionOffsetY
    Object.keys(connectionOffsetY).forEach(key => {
      delete connectionOffsetY[key];
    });
    Object.assign(connectionOffsetY, state.connectionOffsetY);
  };

  // 清除所有历史记录
  const clearHistory = () => {
    historyStack.value = [];
    historyIndex.value = -1;
  };

  // 检查是否可以撤销
  const canUndo = () => {
    return historyIndex.value > 0;
  };

  // 检查是否可以重做
  const canRedo = () => {
    return historyIndex.value < historyStack.value.length - 1;
  };

  return {
    recordHistory,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo
  };
}


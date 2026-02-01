;
﻿import { ref, nextTick, type Ref } from 'vue';
import type { StrategyNode, StrategyConnection } from '@/types/strategy';
import { logger } from '@btc/shared-core';

/**
 * 设计器事件处理逻辑
 * 负责处理键盘、鼠标等全局事件
 */
export function useDesignerEvents(
  panX: Ref<number>,
  panY: Ref<number>,
  canvasScale: Ref<number>,
  isDragging: Ref<boolean>,
  isResizing: Ref<boolean>,
  editingNodeId: Ref<string | null>,
  isOverlayEditing: Ref<boolean>,
  dragState: any,
  canvasDimensions: Ref<{ width: number; height: number }>,
  nodes: Ref<StrategyNode[]>,
  connections: Ref<StrategyConnection[]>,
  selectedNodeId: Ref<string>,
  selectedConnectionId: Ref<string>,
  multiSelectedNodeIds: Ref<Set<string>>,
  multiSelectedConnectionIds: Ref<Set<string>>,
  selection: any,
  handleResizeMove: (event: MouseEvent) => void,
  handleResizeEnd: () => void,
  handleNodePointerMove: (event: MouseEvent) => void,
  handleNodePointerUp: (event: MouseEvent) => void,
  handleCanvasMouseMove: (event: MouseEvent) => void,
  handleCanvasMouseUp: () => void,
  undo: () => boolean,
  redo: () => boolean,
  recordHistory: () => void,
  saveNow: () => void,
  addNode: (component: any, position: { x: number; y: number }) => Promise<any>,
  completeConnection: (nodeId: string) => boolean
) {
  const lastGridOffset = ref<{ x: number; y: number } | null>(null);
  const lastCanvasDimensions = ref<{ width: number; height: number } | null>(null);

  // 处理画布拖放
  const handleCanvasDrop = async (event: DragEvent) => {
    event.preventDefault();

    const componentType = event.dataTransfer?.getData('component-type');
    const componentData = event.dataTransfer?.getData('application/json');

    if (componentType && componentData) {
      try {
        const component = JSON.parse(componentData);
        const rect = (event.target as HTMLElement).getBoundingClientRect();

        const x = (event.clientX - rect.left - panX.value) / canvasScale.value;
        const y = (event.clientY - rect.top - panY.value) / canvasScale.value;

        await addNode(component, { x, y });
        recordHistory();
        saveNow();
      } catch (error) {
        logger.error('Failed to parse component data:', error);
      }
    }
  };

  // 删除选中的元素
  const deleteSelected = () => {
    if (isDragging.value || isResizing.value || dragState.maybeDrag) {
      return;
    }

    if (multiSelectedNodeIds.value.size > 0 || multiSelectedConnectionIds.value.size > 0) {
      if (multiSelectedNodeIds.value.size > 0) {
        const nodesToDelete = Array.from(multiSelectedNodeIds.value);
        nodes.value = nodes.value.filter(n => !nodesToDelete.includes(n.id));
      }
      
      if (multiSelectedConnectionIds.value.size > 0) {
        const connsToDelete = Array.from(multiSelectedConnectionIds.value);
        connections.value = connections.value.filter(conn => !connsToDelete.includes(conn.id));
      }
      
      selection.clearMultiSelection();
      selectedNodeId.value = '';
      selectedConnectionId.value = '';
      
      recordHistory();
      saveNow();
      
      return;
    }

    const selectedNode = nodes.value.find(n => n.id === selectedNodeId.value);
    if (selectedNode) {
      const nodeId = selectedNode.id;
      const nodeExists = nodes.value.some(n => n.id === nodeId);
      if (nodeExists) {
        recordHistory();
        nodes.value = nodes.value.filter(n => n.id !== nodeId);

        if (selectedNodeId.value === nodeId) {
          selectedNodeId.value = '';
        }
        
        nextTick(() => {
          recordHistory();
          saveNow();
        });
      }
    } else {
      const selectedConnection = connections.value.find(c => c.id === selectedConnectionId.value);
      if (selectedConnection) {
        const connectionId = selectedConnection.id;
        const connectionExists = connections.value.some(c => c.id === connectionId);
        if (connectionExists) {
          connections.value = connections.value.filter(conn => conn.id !== connectionId);

          if (selectedConnectionId.value === connectionId) {
            selectedConnectionId.value = '';
          }
          
          recordHistory();
          saveNow();
        }
      }
    }
  };

  // 全局键盘事件处理
  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      event.preventDefault();
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
      event.preventDefault();
      redo();
      return;
    }

    if (editingNodeId.value || isOverlayEditing.value) {
      return;
    }

    if (isDragging.value || isResizing.value) {
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      const hasSelection = nodes.value.find(n => n.id === selectedNodeId.value) ||
                          connections.value.find(c => c.id === selectedConnectionId.value) ||
                          multiSelectedNodeIds.value.size > 0 ||
                          multiSelectedConnectionIds.value.size > 0;
      
      if (hasSelection) {
        event.preventDefault();
        deleteSelected();
      }
    }
  };

  // 全局鼠标事件处理
  const handleGlobalMouseMove = (event: MouseEvent) => {
    if (isResizing.value) {
      handleResizeMove(event);
    }
    handleNodePointerMove(event);
    handleCanvasMouseMove(event);
  };

  const handleGlobalMouseUp = (event: MouseEvent) => {
    if (isResizing.value) {
      handleResizeEnd();
      recordHistory();
      saveNow();
    }
    const wasDragging = dragState.isDragging || dragState.maybeDrag;
    handleNodePointerUp(event);
    if (wasDragging) {
      recordHistory();
      saveNow();
    }
    handleCanvasMouseUp();
  };

  // 处理组件点击
  const handleComponentClick = async (component: any) => {
    const svg = document.querySelector('.strategy-canvas') as SVGSVGElement | null;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const viewCenterClientX = rect.left + rect.width / 2;
    const viewCenterClientY = rect.top + rect.height / 2;

    const centerX = (viewCenterClientX - rect.left - panX.value) / canvasScale.value;
    const centerY = (viewCenterClientY - rect.top - panY.value) / canvasScale.value;

    let nodeWidth = component.style?.width || 120;
    let nodeHeight = component.style?.height || 60;
    if (component.type === 'START' || component.type === 'END') {
      nodeWidth = 60;
      nodeHeight = 60;
    }

    const nodeX = centerX - nodeWidth / 2;
    const nodeY = centerY - nodeHeight / 2;

    await addNode(component, { x: nodeX, y: nodeY });
    recordHistory();
    saveNow();
  };

  // 包装 completeConnection 以记录历史状态
  const handleCompleteConnection = (nodeId: string) => {
    const result = completeConnection(nodeId);
    if (result) {
      recordHistory();
      saveNow();
    }
  };

  return {
    handleCanvasDrop,
    deleteSelected,
    handleKeyDown,
    handleGlobalMouseMove,
    handleGlobalMouseUp,
    handleComponentClick,
    handleCompleteConnection,
    lastGridOffset,
    lastCanvasDimensions
  };
}


;
﻿import { ref, computed, watch, nextTick } from 'vue';
import type { StrategyNode, StrategyConnection } from '@/types/strategy';
import { useCanvasScale } from './useCanvasScale';
import { useNodeManagement } from './useNodeManagement';
import { useConnectionManagement } from './connection';
import { useComponentLibrary } from './useComponentLibrary';
import { useStrategyOperations } from './useStrategyOperations';
import { logger } from '@btc/shared-core';

/**
 * 策略设计器主要逻辑
 */
export function useStrategyDesigner() {
  // 画布交互状态
  const panX = ref(0);
  const panY = ref(0);

  // 画布缩放
  const {
    canvasScale,
    minScale,
    maxScale,
    scalePercentage,
    handleZoomIn,
    handleZoomOut,
    handleFitToScreen
  } = useCanvasScale(panX, panY);

  // 节点管理
  const {
    nodes,
    selectedNodeId,
    selectedNode: rawSelectedNode,
    addNode,
    updateNode,
    deleteNode,
    selectNode,
    getNodeStyle,
    getNodeColor,
    getOutputConnectionClass,
    handleNodeMouseDown
  } = useNodeManagement();

  // 节点交互方法占位（这些方法在 useNodeInteraction 中定义，但不在 useNodeManagement 中）
  const handleNodeClick = (_node: StrategyNode, _event?: MouseEvent) => {
    // 占位函数，实际实现应在使用此 composable 的组件中提供
  };
  const handleNodeDoubleClick = (_node: StrategyNode, _event?: MouseEvent) => {
    // 占位函数
  };
  const handleNodeMouseEnter = (_node: StrategyNode) => {
    // 占位函数
  };
  const handleNodeMouseLeave = () => {
    // 占位函数
  };

  // 连接管理
  const {
    connections,
    selectedConnectionId,
    selectedConnection: rawSelectedConnection,
    addConnection,
    updateConnection,
    deleteConnection,
    selectConnection,
    getConnectionColor,
    getConnectionMarker
  } = useConnectionManagement(nodes);

  // 连接样式和交互方法占位
  const getConnectionStyle = (_connection: StrategyConnection) => {
    // 占位函数，实际可以从 useConnectionStyle 中获取
    return {};
  };
  const getConnectionClass = (_connection: StrategyConnection) => {
    // 占位函数
    return '';
  };
  const handleConnectionMouseDown = (_event: MouseEvent, connection: StrategyConnection) => {
    // 占位函数，实际可以使用 selectConnection
    selectConnection(connection);
  };

  // 确保 selectedNode 和 selectedConnection 不为 undefined
  const selectedNode = computed(() => rawSelectedNode.value || null);
  const selectedConnection = computed(() => rawSelectedConnection.value || null);

  // 组件库
  const {
    componentSearch,
    activeCategories,
    filteredComponentCategories,
    componentLibrary,
    handleComponentDragStart,
    handleCanvasDragOver,
    parseDropData
  } = useComponentLibrary(nodes);

  // 策略操作
  const {
    strategyName,
    currentOrchestration,
    validateOrchestration,
    previewExecution,
    handleSave
  } = useStrategyOperations(nodes, connections);

  // 画布交互状态
  const isDragging = ref(false);
  const isConnecting = ref(false);
  const tempConnection = ref(null);

  // 文本编辑状态
  const editingNodeId = ref<string | null>(null);
  const editingText = ref('');
  const textInputRef = ref<HTMLInputElement>();

  // 箭头交互状态
  const activeArrowDirection = ref<string | null>(null);
  const showShapeSelector = ref(false);
  const shapeSelectorVisible = ref(false);
  const shapeSelectorPosition = ref({ x: 0, y: 0 });

  // 悬停节点
  const hoveredNodeId = ref<string | null>(null);

  // 文本配置
  const defaultTextConfig = {
    fontSize: 16,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: '400',
    fontStyle: 'normal'
  };

  const nodeTextConfig = ref({ ...defaultTextConfig });

  const { t } = useI18n();
  // 常用形状
  const commonShapes = ref([
    { type: 'start', name: t('common.strategy.designer.node_types.start'), color: '#67c23a' },
    { type: 'end', name: t('common.strategy.designer.node_types.end'), color: '#f56c6c' },
    { type: 'condition', name: t('common.strategy.designer.node_types.condition'), color: '#e6a23c' },
    { type: 'action', name: t('common.strategy.designer.node_types.action'), color: '#409eff' },
    { type: 'decision', name: t('common.strategy.designer.node_types.decision'), color: '#909399' },
    { type: 'gateway', name: t('common.strategy.designer.node_types.gateway'), color: '#9c27b0' }
  ]);

  // 画布事件处理
  const handleCanvasDrop = async (event: DragEvent) => {
    event.preventDefault();

    const componentType = event.dataTransfer?.getData('component-type');
    const componentData = event.dataTransfer?.getData('application/json');

    if (componentType && componentData) {
      try {
        const component = JSON.parse(componentData);
        const rect = (event.target as HTMLElement).getBoundingClientRect();

        // 计算相对于画布的位置（考虑缩放和平移）
        const x = (event.clientX - rect.left - panX.value) / canvasScale.value;
        const y = (event.clientY - rect.top - panY.value) / canvasScale.value;

        // 添加节点
        await addNode(component, { x, y });
      } catch (error) {
        logger.error('Failed to parse component data:', error);
      }
    }
  };

  const handleCanvasDragLeave = (event: DragEvent) => {
    // 处理画布拖拽离开
  };

  const handleCanvasMouseDown = (event: MouseEvent) => {
    // 处理画布鼠标按下
  };

  const handleCanvasMouseMove = (event: MouseEvent) => {
    // 处理画布鼠标移动
  };

  const handleCanvasMouseUp = (event: MouseEvent) => {
    // 处理画布鼠标释放
  };

  const handleCanvasClick = (event: MouseEvent) => {
    // 点击非节点区域时清除选择
    selectedNodeId.value = '';
    selectedConnectionId.value = '';
    activeArrowDirection.value = null;
    showShapeSelector.value = false;
  };

  // 文本编辑处理
  const finishTextEditing = () => {
    if (editingNodeId.value && selectedNode.value) {
      selectedNode.value.text = editingText.value;
      editingNodeId.value = null;
      editingText.value = '';
    }
  };

  const cancelTextEditing = () => {
    editingNodeId.value = null;
    editingText.value = '';
  };

  const handleTextEditKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      finishTextEditing();
    } else if (event.key === 'Escape') {
      cancelTextEditing();
    }
  };

  // 箭头点击处理
  const handleArrowClick = (event: MouseEvent, node: any, direction: string, position: { x: number; y: number }) => {
    // 设置激活的箭头方向
    activeArrowDirection.value = direction;

    // 设置选中的节点（确保箭头保持显示）
    selectedNodeId.value = node.id;

    // 显示组件菜单
    shapeSelectorPosition.value = position;
    showShapeSelector.value = true;
  };

  const handleShapeSelect = (shape: any) => {
    // 在指定方向创建新节点
    showShapeSelector.value = false;
    activeArrowDirection.value = null;
  };

  // 组件点击处理
  const handleComponentClick = async (component: any) => {
    // 计算画布中心位置
    const canvasCenterX = 400;
    const canvasCenterY = 300;

    // 添加节点到画布中心
    await addNode(component, { x: canvasCenterX, y: canvasCenterY });
  };

  // 删除选中元素
  const deleteSelected = async () => {
    if (selectedNode.value) {
      try {
        // 直接过滤数组，避免重复确认弹窗
        const nodeIndex = nodes.value.findIndex(n => n.id === selectedNode.value!.id);
        if (nodeIndex > -1) {
          nodes.value.splice(nodeIndex, 1);
        }

        // 删除相关连接线
        connections.value = connections.value.filter(
          c => c.sourceNodeId !== selectedNode.value!.id && c.targetNodeId !== selectedNode.value!.id
        );

        selectedNodeId.value = '';
      } catch (error) {
        logger.error('Failed to delete node:', error);
      }
    } else if (selectedConnection.value) {
      try {
        const connectionIndex = connections.value.findIndex(c => c.id === selectedConnection.value!.id);
        if (connectionIndex > -1) {
          connections.value.splice(connectionIndex, 1);
        }
        selectedConnectionId.value = '';
      } catch (error) {
        logger.error('Failed to delete connection:', error);
      }
    }
  };

  // 监听节点选择变化，更新文本配置
  watch(selectedNodeId, (newNodeId) => {
    if (newNodeId && selectedNode.value) {
      nodeTextConfig.value = {
        fontSize: selectedNode.value.textConfig?.fontSize || defaultTextConfig.fontSize,
        fontFamily: selectedNode.value.textConfig?.fontFamily || defaultTextConfig.fontFamily,
        fontWeight: selectedNode.value.textConfig?.fontWeight || defaultTextConfig.fontWeight,
        fontStyle: selectedNode.value.textConfig?.fontStyle || defaultTextConfig.fontStyle
      };
    }
  });

  // 监听文本配置变化，更新选中节点
  watch(nodeTextConfig, (newConfig) => {
    if (selectedNode.value) {
      if (!selectedNode.value.textConfig) {
        selectedNode.value.textConfig = {};
      }
      Object.assign(selectedNode.value.textConfig, newConfig);
    }
  }, { deep: true });

  return {
    // 状态
    nodes,
    connections,
    selectedNodeId,
    selectedNode,
    selectedConnectionId,
    selectedConnection,
    isDragging,
    isConnecting,
    tempConnection,
    panX,
    panY,
    editingNodeId,
    editingText,
    textInputRef,
    activeArrowDirection,
    hoveredNodeId,
    showShapeSelector,
    shapeSelectorVisible,
    shapeSelectorPosition,
    commonShapes,
    nodeTextConfig,
    defaultTextConfig,

    // 画布缩放
    canvasScale,
    minScale,
    maxScale,
    scalePercentage,

    // 策略操作
    strategyName,
    currentOrchestration,

    // 组件库
    componentSearch,
    activeCategories,
    filteredComponentCategories,
    componentLibrary,

    // 方法
    handleZoomIn,
    handleZoomOut,
    handleFitToScreen,
    handleCanvasDrop,
    handleCanvasDragLeave,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasClick,
    handleNodeMouseDown,
    handleNodeClick,
    handleNodeDoubleClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    handleConnectionMouseDown,
    handleArrowClick,
    handleShapeSelect,
    handleComponentClick,
    handleComponentDragStart,
    handleCanvasDragOver,
    parseDropData,
    finishTextEditing,
    cancelTextEditing,
    handleTextEditKeyDown,
    deleteSelected,
    addNode,
    updateNode,
    deleteNode,
    selectNode,
    addConnection,
    updateConnection,
    deleteConnection,
    selectConnection,
    validateOrchestration,
    previewExecution,
    handleSave,

    // 工具函数
    getNodeStyle,
    getNodeColor,
    getOutputConnectionClass,
    getConnectionStyle,
    getConnectionColor,
    getConnectionClass
  };
}

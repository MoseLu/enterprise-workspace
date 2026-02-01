import { ref, type Ref } from 'vue';

/**
 * 节点交互逻辑
 */
export function useNodeInteraction(
  nodes: Ref<any[]>,
  selectedNodeId: Ref<string>,
  isOverlayEditing: Ref<boolean>,
  editingNodeId: Ref<string | null>,
  showComponentMenuFlag: Ref<boolean>,
  closeComponentMenu: () => void,
  activeArrowDirection: Ref<string>,
  lastSelectionMode: Ref<'click' | 'rubber'>,
  findNearbyNode: (sourceNode: any, direction: string) => any,
  createConnection: (sourceNode: any, targetNode: any, direction: string) => void,
  showComponentMenu: (node: any, direction: string) => void,
  nodeTextConfig: Ref<any>,
  defaultTextConfig: any,
  isMouseOnNodeBorder: Ref<boolean>,
  clearMultiSelection?: () => void, // 添加清空多选的函数
  clearConnectionSelection?: () => void // 添加清空连接线选中的函数
) {
  // 节点交互状态
  const hoveredNodeId = ref<string>('');
  const currentHoveredNode = ref<any>(null);
  const hoveredArrowDirection = ref('');
  let doubleClickTimer: ReturnType<typeof setTimeout> | null = null;

  // 箭头悬浮事件处理
  const handleArrowEnter = (direction: string) => {
    hoveredArrowDirection.value = direction;
  };

  const handleArrowLeave = () => {
    hoveredArrowDirection.value = '';
  };

  // 节点点击处理
  const handleNodeClick = (node: any, event?: MouseEvent) => {
    // 阻止事件冒泡到画布，防止触发画布的点击处理和连接线选中
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    // 编辑态下不响应选中
    if (isOverlayEditing.value || editingNodeId.value) {
      return;
    }

    // 立即清空连接线选中状态，确保节点和连接线选中状态分离
    if (clearConnectionSelection) {
      clearConnectionSelection();
    }

    // 清除双击定时器
    if (doubleClickTimer) {
      clearTimeout(doubleClickTimer);
      doubleClickTimer = null;
      return; // 如果是双击，不处理单击
    }

    // 设置双击延迟
    doubleClickTimer = setTimeout(() => {
      doubleClickTimer = null;

      // 设置选中的节点
      selectedNodeId.value = node.id;
      lastSelectionMode.value = 'click';

      // 更新文本配置为选中节点的配置
      nodeTextConfig.value = {
        fontSize: node.textConfig?.fontSize || defaultTextConfig.fontSize,
        fontFamily: node.textConfig?.fontFamily || defaultTextConfig.fontFamily,
        fontWeight: node.textConfig?.fontWeight || defaultTextConfig.fontWeight,
        fontStyle: node.textConfig?.fontStyle || defaultTextConfig.fontStyle
      };

      // 关闭组件菜单（如果打开）
      if (showComponentMenuFlag.value) {
        closeComponentMenu();
      }
      
      // 清空多选状态（连接线选中状态已在上面清空）
      if (clearMultiSelection) {
        clearMultiSelection();
      }
    }, 200); // 200ms 延迟
  };

  // 节点鼠标进入处理
  const handleNodeMouseEnter = (node: any) => {
    hoveredNodeId.value = node.id;
    currentHoveredNode.value = node;
    isMouseOnNodeBorder.value = false; // 进入节点内部，不在边界上
  };

  // 节点鼠标离开处理
  const handleNodeMouseLeave = () => {
    hoveredNodeId.value = '';
    currentHoveredNode.value = null;
    isMouseOnNodeBorder.value = false;
  };

  // 箭头点击处理
  const handleArrowClick = (event: MouseEvent, node: any, direction: string) => {
    event.stopPropagation();

    // 设置激活的箭头方向
    activeArrowDirection.value = direction;

    // 设置选中的节点（确保箭头保持显示）
    selectedNodeId.value = node.id;

    // 检查对应方向是否已有节点
    const nearbyNode = findNearbyNode(node, direction);

    if (nearbyNode) {
      // 如果附近有节点，直接创建连接
      createConnection(node, nearbyNode, direction);
    } else {
      // 如果没有节点，显示组件菜单让用户选择要创建的节点类型
      showComponentMenu(node, direction);
    }
  };

  // 连接点点击处理
  const handleConnectionPointClick = (event: MouseEvent, node: any, direction: string) => {
    event.stopPropagation();
    // 连接点点击暂时不处理，只处理箭头点击
  };

  // 画布点击处理
  const handleCanvasClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    
    // 如果点击的是节点，不处理（让 handleNodeClick 处理）
    const isOnNode = target.closest('[data-node-id]') !== null || 
                     target.closest('.strategy-node') !== null;
    if (isOnNode) {
      return; // 点击节点时，不处理，让 handleNodeClick 处理
    }
    
    // 如果点击的是连接线，不清空选中状态（让 selectConnection 处理）
    const isConnectionPath = target.tagName?.toLowerCase() === 'path' && (
      target.classList?.contains('connection-path') ||
      target.getAttribute('data-connection-id') !== null
    );
    if (isConnectionPath) {
      return; // 点击连接线时，不清空选中状态，让 selectConnection 处理
    }
    
    // 如果点击的是画布本身（不是节点，也不是连接线），关闭组件菜单并隐藏箭头
    if (showComponentMenuFlag.value) {
      closeComponentMenu();
    }

    // 点击非节点区域时，清除所有选中状态
    // 如果当前是橡皮筋选择模式，也不清空（让 useSelection 处理），否则清空多选
    if (lastSelectionMode.value === 'rubber') {
      // 橡皮筋选择模式，不清空（让 useSelection 的 onCanvasMouseUp 处理）
      return;
    }
    
    // 清空单个选中和多选状态
    selectedNodeId.value = '';
    hoveredNodeId.value = '';
    activeArrowDirection.value = '';
    if (clearMultiSelection) {
      clearMultiSelection();
    }
    // 清空连接线选中状态
    if (clearConnectionSelection) {
      clearConnectionSelection();
    }
  };

  // 画布拖拽离开处理
  const handleCanvasDragLeave = (event: DragEvent) => {
    event.preventDefault();
  };

  return {
    hoveredNodeId,
    currentHoveredNode,
    hoveredArrowDirection,
    handleNodeClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    handleArrowClick,
    handleArrowEnter,
    handleArrowLeave,
    handleConnectionPointClick,
    handleCanvasClick,
    handleCanvasDragLeave
  };
}


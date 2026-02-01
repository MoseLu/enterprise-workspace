import { ref, type Ref, nextTick } from 'vue';
import type { StrategyConnection } from '@/types/strategy';
import { ConnectorType } from '@/types/strategy';

/**
 * 组件菜单逻辑
 */
export function useComponentMenu(
  nodes: Ref<any[]>,
  connections: Ref<StrategyConnection[]>,
  componentLibrary: Ref<any[]>,
  addNode: (component: any, position: { x: number; y: number }) => Promise<any>,
  generateId: () => string,
  getConnectionColor: () => string,
  activeArrowDirection: Ref<string>
) {
  // 组件菜单相关状态
  const showComponentMenuFlag = ref(false);
  const componentMenuPosition = ref({ x: 0, y: 0 });
  const selectedNodeForConnection = ref<any>(null);
  const selectedDirection = ref('');

  // 显示组件菜单
  const showComponentMenu = (node: any, direction: string) => {
    selectedNodeForConnection.value = node;
    selectedDirection.value = direction;

    // 获取画布和节点位置
    const canvas = document.querySelector('.strategy-canvas') as HTMLElement;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const nodeWidth = node.style?.width || 120;
    const nodeHeight = node.style?.height || 60;

    // 计算箭头在屏幕上的位置
    let menuX = canvasRect.left + node.position.x;
    let menuY = canvasRect.top + node.position.y;

    switch (direction) {
      case 'top':
        menuX += nodeWidth / 2;
        menuY -= 32; // 箭头尖端位置
        break;
      case 'right':
        menuX += nodeWidth + 32;
        menuY += nodeHeight / 2;
        break;
      case 'bottom':
        menuX += nodeWidth / 2;
        menuY += nodeHeight + 32;
        break;
      case 'left':
        menuX -= 32;
        menuY += nodeHeight / 2;
        break;
    }

    componentMenuPosition.value = { x: menuX, y: menuY };
    showComponentMenuFlag.value = true;
  };

  // 计算新节点位置
  const calculateNewNodePosition = (sourceNode: any, direction: string) => {
    const gap = 50; // 节点间距
    const sourceW = sourceNode.style?.width || 120;
    const sourceH = sourceNode.style?.height || 60;
    const targetW = 120; // 假设新节点宽度
    const targetH = 60; // 假设新节点高度
    const sourceX = sourceNode.position.x;
    const sourceY = sourceNode.position.y;

    switch (direction) {
      case 'top':
        return { x: sourceX + (sourceW - targetW) / 2, y: sourceY - gap - targetH };
      case 'right':
        return { x: sourceX + sourceW + gap, y: sourceY + (sourceH - targetH) / 2 };
      case 'bottom':
        return { x: sourceX + (sourceW - targetW) / 2, y: sourceY + sourceH + gap };
      case 'left':
        return { x: sourceX - gap - targetW, y: sourceY + (sourceH - targetH) / 2 };
      default:
        return { x: sourceX + sourceW + gap, y: sourceY };
    }
  };

  // 查找附近节点
  const findNearbyNode = (sourceNode: any, direction: string) => {
    const threshold = 200; // 距离阈值
    const sourceX = sourceNode.position.x;
    const sourceY = sourceNode.position.y;
    const sourceWidth = sourceNode.style?.width || 120;
    const sourceHeight = sourceNode.style?.height || 60;

    return nodes.value.find(node => {
      if (node.id === sourceNode.id) return false;

      const targetX = node.position.x;
      const targetY = node.position.y;
      const targetWidth = node.style?.width || 120;
      const targetHeight = node.style?.height || 60;

      // 计算节点中心点
      const sourceCenterX = sourceX + sourceWidth / 2;
      const sourceCenterY = sourceY + sourceHeight / 2;
      const targetCenterX = targetX + targetWidth / 2;
      const targetCenterY = targetY + targetHeight / 2;

      // 计算距离
      const deltaX = targetCenterX - sourceCenterX;
      const deltaY = targetCenterY - sourceCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 检查是否在指定方向且距离合适
      switch (direction) {
        case 'top':
          return deltaY < 0 && Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold;
        case 'right':
          return deltaX > 0 && Math.abs(deltaY) < threshold && Math.abs(deltaX) < threshold;
        case 'bottom':
          return deltaY > 0 && Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold;
        case 'left':
          return deltaX < 0 && Math.abs(deltaY) < threshold && Math.abs(deltaX) < threshold;
        default:
          return false;
      }
    });
  };

  // 创建连接
  const createConnection = (sourceNode: any, targetNode: any, direction: string) => {
    // 根据方向确定连接条件
    let condition: 'true' | 'false' | undefined = undefined;
    if (sourceNode.type === 'CONDITION' || sourceNode.type === 'DECISION') {
      if (direction === 'right') {
        condition = 'true';
      } else if (direction === 'left') {
        condition = 'false';
      }
    }

    // 创建连接
    const newConnection: StrategyConnection = {
      id: generateId(),
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      condition: condition,
      type: ConnectorType.SEQUENCE,
      style: {
        strokeColor: getConnectionColor(),
        strokeWidth: 2
      }
    };

    // 添加到连接列表
    connections.value.push(newConnection);

    // 清除激活状态
    activeArrowDirection.value = '';
  };

  // 选择组件
  const selectComponent = async (component: any) => {
    if (selectedNodeForConnection.value) {
      // 在指定方向添加新节点
      const newNodePosition = calculateNewNodePosition(selectedNodeForConnection.value, selectedDirection.value);
      const newNode = await addNode(component, newNodePosition);

      // 等待 setTimeout 确保 watch 的 isUpdatingHandles 重置
      await new Promise(resolve => setTimeout(resolve, 0));

      // 创建连接
      if (newNode) {
        // 根据方向确定连接条件
        let condition: 'true' | 'false' | undefined = undefined;
        if (selectedNodeForConnection.value.type === 'CONDITION' || selectedNodeForConnection.value.type === 'DECISION') {
          if (selectedDirection.value === 'right') {
            condition = 'true';
          } else if (selectedDirection.value === 'left') {
            condition = 'false';
          }
        }

      // 创建连接
        const newConnection: StrategyConnection = {
          id: generateId(),
          sourceNodeId: selectedNodeForConnection.value.id,
          targetNodeId: newNode.id,
          condition: condition,
          type: ConnectorType.SEQUENCE,
          style: {
            strokeColor: getConnectionColor(),
            strokeWidth: 2
          }
        };

        // 添加到连接列表
        connections.value.push(newConnection);
      }
    }

    // 关闭菜单
    closeComponentMenu();
  };

  // 关闭组件菜单
  const closeComponentMenu = () => {
    showComponentMenuFlag.value = false;
    selectedNodeForConnection.value = null;
    selectedDirection.value = '';
    activeArrowDirection.value = '';
  };

  // 获取常用组件（缩小版组件库）
  const getCommonComponents = () => {
    if (!componentLibrary.value || componentLibrary.value.length === 0) {
      return [];
    }
    return componentLibrary.value.slice(0, 6);
  };

  const { t } = useI18n();
  // 获取方向文本
  const getDirectionText = (direction: string) => {
    const directionMap: Record<string, string> = {
      'top': t('common.strategy.designer.directions.top'),
      'right': t('common.strategy.designer.directions.right'),
      'bottom': t('common.strategy.designer.directions.bottom'),
      'left': t('common.strategy.designer.directions.left')
    };
    return directionMap[direction] || '';
  };

  return {
    showComponentMenuFlag,
    componentMenuPosition,
    selectedNodeForConnection,
    selectedDirection,
    showComponentMenu,
    selectComponent,
    closeComponentMenu,
    calculateNewNodePosition,
    getCommonComponents,
    getDirectionText,
    findNearbyNode,
    createConnection
  };
}


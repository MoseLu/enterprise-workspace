import type { StrategyConnection, StrategyNode } from '@/types/strategy';

/**
 * 连接点选择逻辑
 * 负责根据节点相对位置动态选择最优连接点
 */
export function useConnectionPointSelector() {
  // 检查已保存的 handle 是否仍然符合当前节点位置关系（防止连线穿透节点）
  const validateHandleConsistency = (
    handle: string | undefined,
    isSource: boolean,
    sourceNode: StrategyNode,
    targetNode: StrategyNode
  ): boolean => {
    if (!handle) return true;

    const sourceWidth = sourceNode.style?.width || 120;
    const sourceHeight = sourceNode.style?.height || 60;
    const targetWidth = targetNode.style?.width || 120;
    const targetHeight = targetNode.style?.height || 60;

    const sourceTop = sourceNode.position.y;
    const sourceBottom = sourceNode.position.y + sourceHeight;
    const sourceLeft = sourceNode.position.x;
    const sourceRight = sourceNode.position.x + sourceWidth;

    const targetTop = targetNode.position.y;
    const targetBottom = targetNode.position.y + targetHeight;
    const targetLeft = targetNode.position.x;
    const targetRight = targetNode.position.x + targetWidth;

    const sourceCenterX = sourceNode.position.x + sourceWidth / 2;
    const sourceCenterY = sourceNode.position.y + sourceHeight / 2;
    const targetCenterX = targetNode.position.x + targetWidth / 2;
    const targetCenterY = targetNode.position.y + targetHeight / 2;

    const deltaX = targetCenterX - sourceCenterX;
    const deltaY = targetCenterY - sourceCenterY;

    if (isSource) {
      switch (handle) {
        case 'top':
          if (targetTop > sourceTop) return false;
          if (deltaY > 0 && Math.abs(deltaY) >= Math.abs(deltaX)) return false;
          if (Math.abs(deltaX) > Math.abs(deltaY)) return false;
          break;
        case 'bottom':
          if (targetTop < sourceBottom) return false;
          if (deltaY < 0 && Math.abs(deltaY) >= Math.abs(deltaX)) return false;
          if (Math.abs(deltaX) > Math.abs(deltaY)) return false;
          break;
        case 'left':
          if (targetLeft > sourceLeft) return false;
          if (deltaX > 0 && Math.abs(deltaX) >= Math.abs(deltaY)) return false;
          if (Math.abs(deltaY) > Math.abs(deltaX)) return false;
          break;
        case 'right':
          if (targetRight < sourceRight) return false;
          if (deltaX < 0 && Math.abs(deltaX) >= Math.abs(deltaY)) return false;
          if (Math.abs(deltaY) > Math.abs(deltaX)) return false;
          break;
      }
    } else {
      switch (handle) {
        case 'top':
          if (sourceTop > targetTop) return false;
          if (deltaY > 0 && Math.abs(deltaY) >= Math.abs(deltaX)) return false;
          if (Math.abs(deltaX) > Math.abs(deltaY)) return false;
          break;
        case 'bottom':
          if (sourceTop < targetBottom) return false;
          if (deltaY < 0 && Math.abs(deltaY) >= Math.abs(deltaX)) return false;
          if (Math.abs(deltaX) > Math.abs(deltaY)) return false;
          break;
        case 'left':
          if (sourceLeft > targetLeft) return false;
          if (deltaX > 0 && Math.abs(deltaX) >= Math.abs(deltaY)) return false;
          if (Math.abs(deltaY) > Math.abs(deltaX)) return false;
          break;
        case 'right':
          if (sourceRight < targetRight) return false;
          if (deltaX < 0 && Math.abs(deltaX) >= Math.abs(deltaY)) return false;
          if (Math.abs(deltaY) > Math.abs(deltaX)) return false;
          break;
      }
    }

    return true;
  };

  // 选择最佳备选连接点
  const selectBestAlternative = (
    idealHandles: string[],
    availableHandles: string[],
    nodePosition: 'source' | 'target',
    deltaX: number,
    deltaY: number
  ): string => {
    for (const ideal of idealHandles) {
      if (availableHandles.includes(ideal)) {
        return ideal;
      }
    }

    if (availableHandles.length > 0) {
      if (Math.abs(deltaX) >= Math.abs(deltaY)) {
        if (deltaX > 0) {
          const priority = nodePosition === 'source'
            ? ['right', 'top', 'bottom', 'left']
            : ['left', 'top', 'bottom', 'right'];
          for (const handle of priority) {
            if (availableHandles.includes(handle)) {
              return handle;
            }
          }
        } else {
          const priority = nodePosition === 'source'
            ? ['left', 'top', 'bottom', 'right']
            : ['right', 'top', 'bottom', 'left'];
          for (const handle of priority) {
            if (availableHandles.includes(handle)) {
              return handle;
            }
          }
        }
      } else {
        if (deltaY > 0) {
          const priority = nodePosition === 'source'
            ? ['bottom', 'right', 'left', 'top']
            : ['top', 'right', 'left', 'bottom'];
          for (const handle of priority) {
            if (availableHandles.includes(handle)) {
              return handle;
            }
          }
        } else {
          const priority = nodePosition === 'source'
            ? ['top', 'right', 'left', 'bottom']
            : ['bottom', 'right', 'left', 'top'];
          for (const handle of priority) {
            if (availableHandles.includes(handle)) {
              return handle;
            }
          }
        }
      }
    }

    return availableHandles.length > 0 ? availableHandles[0] : 'right';
  };

  // 基于垂直位置关系选择最优连接点
  const selectOptimalConnectionPoints = (
    sourceNode: StrategyNode,
    targetNode: StrategyNode,
    connection: StrategyConnection,
    sourceUsedHandles?: Set<string>,
    targetUsedHandles?: Set<string>
  ) => {
    const sourceWidth = sourceNode.style?.width || 120;
    const sourceHeight = sourceNode.style?.height || 60;
    const targetWidth = targetNode.style?.width || 120;
    const targetHeight = targetNode.style?.height || 60;

    const sourceTop = sourceNode.position.y;
    const sourceBottom = sourceNode.position.y + sourceHeight;
    const sourceLeft = sourceNode.position.x;
    const sourceRight = sourceNode.position.x + sourceWidth;

    const targetTop = targetNode.position.y;
    const targetBottom = targetNode.position.y + targetHeight;
    const targetLeft = targetNode.position.x;
    const targetRight = targetNode.position.x + targetWidth;

    const sourceCenterX = sourceNode.position.x + sourceWidth / 2;
    const sourceCenterY = sourceNode.position.y + sourceHeight / 2;
    const targetCenterX = targetNode.position.x + targetWidth / 2;
    const targetCenterY = targetNode.position.y + targetHeight / 2;

    const deltaX = targetCenterX - sourceCenterX;
    const deltaY = targetCenterY - sourceCenterY;

    let sourceX: number;
    let sourceY: number;
    let targetX: number;
    let targetY: number;
    let selectedSourceHandle: string;
    let selectedTargetHandle: string;

    const sourceNodeUsedHandles = sourceUsedHandles || new Set<string>();
    const targetNodeUsedHandles = targetUsedHandles || new Set<string>();

    const isSourceNodeHasOtherConnections = sourceNodeUsedHandles.size > 0;
    const isTargetNodeHasOtherConnections = targetNodeUsedHandles.size > 0;

    const savedSourceHandle = connection.sourceHandle;
    const savedTargetHandle = connection.targetHandle;

    if (savedSourceHandle && !validateHandleConsistency(savedSourceHandle, true, sourceNode, targetNode)) {
      connection.sourceHandle = undefined;
    }

    if (savedTargetHandle && !validateHandleConsistency(savedTargetHandle, false, sourceNode, targetNode)) {
      connection.targetHandle = undefined;
    }

    const hasHorizontalOverlap = !(targetLeft >= sourceRight || targetRight <= sourceLeft);
    const hasVerticalOverlap = !(targetTop >= sourceBottom || targetBottom <= sourceTop);

    const getAvailableHandles = (usedHandles: Set<string>) => {
      const allHandles = ['top', 'bottom', 'left', 'right'];
      return allHandles.filter(h => !usedHandles.has(h));
    };

    const sourceAvailableHandles = isSourceNodeHasOtherConnections
      ? getAvailableHandles(sourceNodeUsedHandles)
      : ['top', 'bottom', 'left', 'right'];
    const targetAvailableHandles = isTargetNodeHasOtherConnections
      ? getAvailableHandles(targetNodeUsedHandles)
      : ['top', 'bottom', 'left', 'right'];

    if ((sourceNode.type === 'CONDITION' || sourceNode.type === 'DECISION') && connection.condition) {
      selectedSourceHandle = connection.condition === 'true' ? 'right' : 'left';

      if (selectedSourceHandle === 'right') {
        sourceX = sourceRight;
        sourceY = sourceCenterY;
      } else {
        sourceX = sourceLeft;
        sourceY = sourceCenterY;
      }

      if (hasVerticalOverlap) {
        if (deltaX > 0) {
          selectedTargetHandle = selectBestAlternative(['left'], targetAvailableHandles, 'target', deltaX, deltaY);
        } else {
          selectedTargetHandle = selectBestAlternative(['right'], targetAvailableHandles, 'target', deltaX, deltaY);
        }
      } else if (hasHorizontalOverlap) {
        if (deltaY > 0) {
          selectedTargetHandle = selectBestAlternative(['top'], targetAvailableHandles, 'target', deltaX, deltaY);
        } else {
          selectedTargetHandle = selectBestAlternative(['bottom'], targetAvailableHandles, 'target', deltaX, deltaY);
        }
      } else {
        if (deltaY > 0) {
          selectedTargetHandle = selectBestAlternative(['top'], targetAvailableHandles, 'target', deltaX, deltaY);
        } else {
          selectedTargetHandle = selectBestAlternative(['bottom'], targetAvailableHandles, 'target', deltaX, deltaY);
        }
      }

      switch (selectedTargetHandle) {
        case 'top':
          targetX = targetCenterX;
          targetY = targetTop;
          break;
        case 'bottom':
          targetX = targetCenterX;
          targetY = targetBottom;
          break;
        case 'left':
          targetX = targetLeft;
          targetY = targetCenterY;
          break;
        case 'right':
          targetX = targetRight;
          targetY = targetCenterY;
          break;
        default:
          targetX = targetCenterX;
          targetY = targetCenterY;
      }

      return {
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourceHandle: selectedSourceHandle,
        targetHandle: selectedTargetHandle
      };
    }

    if (hasVerticalOverlap) {
      if (deltaX > 0) {
        selectedSourceHandle = selectBestAlternative(['right'], sourceAvailableHandles, 'source', deltaX, deltaY);
        selectedTargetHandle = selectBestAlternative(['left'], targetAvailableHandles, 'target', deltaX, deltaY);
      } else {
        selectedSourceHandle = selectBestAlternative(['left'], sourceAvailableHandles, 'source', deltaX, deltaY);
        selectedTargetHandle = selectBestAlternative(['right'], targetAvailableHandles, 'target', deltaX, deltaY);
      }
    } else if (hasHorizontalOverlap) {
      if (deltaY > 0) {
        selectedSourceHandle = selectBestAlternative(['bottom'], sourceAvailableHandles, 'source', deltaX, deltaY);
        selectedTargetHandle = selectBestAlternative(['top'], targetAvailableHandles, 'target', deltaX, deltaY);
      } else {
        selectedSourceHandle = selectBestAlternative(['top'], sourceAvailableHandles, 'source', deltaX, deltaY);
        selectedTargetHandle = selectBestAlternative(['bottom'], targetAvailableHandles, 'target', deltaX, deltaY);
      }
    } else {
      if (deltaY > 0) {
        if (deltaX > 0) {
          selectedSourceHandle = selectBestAlternative(['bottom'], sourceAvailableHandles, 'source', deltaX, deltaY);
          selectedTargetHandle = selectBestAlternative(['left'], targetAvailableHandles, 'target', deltaX, deltaY);
        } else {
          selectedSourceHandle = selectBestAlternative(['bottom'], sourceAvailableHandles, 'source', deltaX, deltaY);
          selectedTargetHandle = selectBestAlternative(['right'], targetAvailableHandles, 'target', deltaX, deltaY);
        }
      } else {
        if (deltaX > 0) {
          selectedSourceHandle = selectBestAlternative(['top'], sourceAvailableHandles, 'source', deltaX, deltaY);
          selectedTargetHandle = selectBestAlternative(['left'], targetAvailableHandles, 'target', deltaX, deltaY);
        } else {
          selectedSourceHandle = selectBestAlternative(['top'], sourceAvailableHandles, 'source', deltaX, deltaY);
          selectedTargetHandle = selectBestAlternative(['right'], targetAvailableHandles, 'target', deltaX, deltaY);
        }
      }
    }

    switch (selectedSourceHandle) {
      case 'top':
        sourceX = sourceCenterX;
        sourceY = sourceTop;
        break;
      case 'bottom':
        sourceX = sourceCenterX;
        sourceY = sourceBottom;
        break;
      case 'left':
        sourceX = sourceLeft;
        sourceY = sourceCenterY;
        break;
      case 'right':
        sourceX = sourceRight;
        sourceY = sourceCenterY;
        break;
      default:
        sourceX = sourceCenterX;
        sourceY = sourceCenterY;
    }

    switch (selectedTargetHandle) {
      case 'top':
        targetX = targetCenterX;
        targetY = targetTop;
        break;
      case 'bottom':
        targetX = targetCenterX;
        targetY = targetBottom;
        break;
      case 'left':
        targetX = targetLeft;
        targetY = targetCenterY;
        break;
      case 'right':
        targetX = targetRight;
        targetY = targetCenterY;
        break;
      default:
        targetX = targetCenterX;
        targetY = targetCenterY;
    }

    if (!connection.sourceHandle || connection.sourceHandle !== selectedSourceHandle) {
      connection.sourceHandle = selectedSourceHandle;
    }
    if (!connection.targetHandle || connection.targetHandle !== selectedTargetHandle) {
      connection.targetHandle = selectedTargetHandle;
    }

    return {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourceHandle: selectedSourceHandle,
      targetHandle: selectedTargetHandle
    };
  };

  return {
    selectOptimalConnectionPoints,
    validateHandleConsistency,
    selectBestAlternative
  };
}


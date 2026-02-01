import type { Ref } from 'vue';
import type { StrategyConnection, StrategyNode } from '@/types/strategy';
import { useConnectionStyle } from './style';

/**
 * 悬空连线处理逻辑
 * 负责处理一端或两端节点缺失的连线渲染
 */
export function useOrphanedConnection(nodes: Ref<StrategyNode[]>) {
  const { getConnectionColor, getConnectionMarker } = useConnectionStyle(nodes);

  // 处理悬空连线（一端节点缺失的情况）
  const handleOrphanedConnection = (
    connection: StrategyConnection,
    sourceNode: StrategyNode | undefined,
    targetNode: StrategyNode | undefined,
    connectionOffsetY: Record<string, number>
  ): { id: string; path: string; color: string; marker: string; direction: 'horizontal' | 'vertical'; isOrphaned: boolean } => {
    const offset = connectionOffsetY[connection.id] || 0;
    let fromX: number, fromY: number, toX: number, toY: number;

    if (sourceNode && !targetNode) {
      if (!connection.lastTargetX || !connection.lastTargetY) {
        return { id: connection.id, path: '', color: '', marker: '', direction: 'horizontal' as const, isOrphaned: true };
      }

      const sourceWidth = sourceNode.style?.width || 120;
      const sourceHeight = sourceNode.style?.height || 60;
      const handle = connection.sourceHandle || 'bottom';

      switch (handle) {
        case 'top':
          fromX = sourceNode.position.x + sourceWidth / 2;
          fromY = sourceNode.position.y;
          break;
        case 'bottom':
          fromX = sourceNode.position.x + sourceWidth / 2;
          fromY = sourceNode.position.y + sourceHeight;
          break;
        case 'left':
          fromX = sourceNode.position.x;
          fromY = sourceNode.position.y + sourceHeight / 2;
          break;
        case 'right':
          fromX = sourceNode.position.x + sourceWidth;
          fromY = sourceNode.position.y + sourceHeight / 2;
          break;
        default:
          fromX = sourceNode.position.x + sourceWidth / 2;
          fromY = sourceNode.position.y + sourceHeight;
      }

      toX = connection.lastTargetX;
      toY = connection.lastTargetY;
    } else if (!sourceNode && targetNode) {
      if (!connection.lastSourceX || !connection.lastSourceY) {
        return { id: connection.id, path: '', color: '', marker: '', direction: 'horizontal' as const, isOrphaned: true };
      }

      fromX = connection.lastSourceX;
      fromY = connection.lastSourceY;

      const targetWidth = targetNode.style?.width || 120;
      const targetHeight = targetNode.style?.height || 60;
      const handle = connection.targetHandle || 'top';

      switch (handle) {
        case 'top':
          toX = targetNode.position.x + targetWidth / 2;
          toY = targetNode.position.y;
          break;
        case 'bottom':
          toX = targetNode.position.x + targetWidth / 2;
          toY = targetNode.position.y + targetHeight;
          break;
        case 'left':
          toX = targetNode.position.x;
          toY = targetNode.position.y + targetHeight / 2;
          break;
        case 'right':
          toX = targetNode.position.x + targetWidth;
          toY = targetNode.position.y + targetHeight / 2;
          break;
        default:
          toX = targetNode.position.x + targetWidth / 2;
          toY = targetNode.position.y;
      }
    } else {
      return { id: connection.id, path: '', color: '', marker: '', direction: 'horizontal' as const, isOrphaned: true };
    }

    let path: string;
    if (connection.lastPath) {
      const pathMatch = connection.lastPath.match(/^M\s+([\d.]+)\s+([\d.]+)(.*)/);
      if (pathMatch) {
        const oldStartX = parseFloat(pathMatch[1]);
        const oldStartY = parseFloat(pathMatch[2]);
        const oldPathRest = pathMatch[3];

        const deltaX = fromX - oldStartX;
        const deltaY = fromY - oldStartY;

        const pathPoints = oldPathRest.match(/L\s+([\d.]+)\s+([\d.]+)/g);
        if (pathPoints && pathPoints.length > 0) {
          const lastPoint = pathPoints[pathPoints.length - 1];
          const lastPointMatch = lastPoint.match(/L\s+([\d.]+)\s+([\d.]+)/);
          if (lastPointMatch) {
            const oldEndX = parseFloat(lastPointMatch[1]);
            const oldEndY = parseFloat(lastPointMatch[2]);

            const oldRelEndX = oldEndX - oldStartX;
            const oldRelEndY = oldEndY - oldStartY;

            const newRelEndX = toX - fromX;
            const newRelEndY = toY - fromY;

            const scaleX = oldRelEndX !== 0 ? newRelEndX / oldRelEndX : 1;
            const scaleY = oldRelEndY !== 0 ? newRelEndY / oldRelEndY : 1;

            let newPath = `M ${fromX} ${fromY}`;
            pathPoints.forEach((point) => {
              const pointMatch = point.match(/L\s+([\d.]+)\s+([\d.]+)/);
              if (pointMatch) {
                let x = parseFloat(pointMatch[1]);
                let y = parseFloat(pointMatch[2]);

                const relX = x - oldStartX;
                const relY = y - oldStartY;

                x = fromX + relX * scaleX;
                y = fromY + relY * scaleY;

                newPath += ` L ${x} ${y}`;
              }
            });

            path = newPath;
          } else {
            path = generateSimplePath(fromX, fromY, toX, toY);
          }
        } else {
          path = generateSimplePath(fromX, fromY, toX, toY);
        }
      } else {
        path = generateSimplePath(fromX, fromY, toX, toY);
      }
    } else {
      path = generateSimplePath(fromX, fromY, toX, toY);
    }

    const color = getConnectionColor(connection);
    const marker = getConnectionMarker(connection);
    const direction: 'horizontal' | 'vertical' = Math.abs(toX - fromX) >= Math.abs(toY - fromY) ? 'horizontal' : 'vertical';

    return { id: connection.id, path, color, marker, direction, isOrphaned: true };
  };

  // 生成简化路径
  const generateSimplePath = (fromX: number, fromY: number, toX: number, toY: number): string => {
    const horizontalDistance = Math.abs(toX - fromX);
    const verticalDistance = Math.abs(toY - fromY);
    const minGap = 20;

    if (horizontalDistance < minGap || verticalDistance < minGap) {
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    } else {
      const deltaX = toX - fromX;
      const deltaY = toY - fromY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        const turnX = fromX + (toX - fromX) / 2;
        return `M ${fromX} ${fromY} L ${turnX} ${fromY} L ${turnX} ${toY} L ${toX} ${toY}`;
      } else {
        const turnY = fromY + (toY - fromY) / 2;
        return `M ${fromX} ${fromY} L ${fromX} ${turnY} L ${toX} ${turnY} L ${toX} ${toY}`;
      }
    }
  };

  return {
    handleOrphanedConnection
  };
}


;
﻿import type { Ref } from 'vue';
import type { StrategyConnection, StrategyNode } from '@/types/strategy';
import { logger } from '@btc/shared-core';

/**
 * 连接路径生成逻辑
 * 负责根据连接点位置生成正交路径
 */
export function useConnectionPathGenerator(
  nodes: Ref<StrategyNode[]>,
  connectionOffsetY: Record<string, number>
) {
  // 根据 handle 类型计算连接点坐标
  const getConnectionPoint = (node: StrategyNode, handle: string | undefined, defaultHandle: string) => {
    const w = node.style?.width || 120;
    const h = node.style?.height || 60;
    const handleType = handle || defaultHandle;

    switch (handleType) {
      case 'top':
        return { x: node.position.x + w / 2, y: node.position.y };
      case 'bottom':
        return { x: node.position.x + w / 2, y: node.position.y + h };
      case 'left':
        return { x: node.position.x, y: node.position.y + h / 2 };
      case 'right':
        return { x: node.position.x + w, y: node.position.y + h / 2 };
      default:
        return { x: node.position.x + w / 2, y: node.position.y + h / 2 };
    }
  };

  // 计算单个连接路径（用于初始渲染和偏移调整）
  const getConnectionPath = (connection: StrategyConnection): string => {
    const sourceNode = nodes.value.find(n => n.id === connection.sourceNodeId);
    const targetNode = nodes.value.find(n => n.id === connection.targetNodeId);

    if (!sourceNode || !targetNode) {
      console.warn('getConnectionPath: Node not found', connection.sourceNodeId, connection.targetNodeId);
      return '';
    }

    const sxCenter = sourceNode.position.x + (sourceNode.style?.width || 120) / 2;
    const syCenter = sourceNode.position.y + (sourceNode.style?.height || 60) / 2;
    const txCenter = targetNode.position.x + (targetNode.style?.width || 120) / 2;
    const tyCenter = targetNode.position.y + (targetNode.style?.height || 60) / 2;

    const dx = txCenter - sxCenter;
    const dy = tyCenter - syCenter;

    const defaultSourceHandle = Math.abs(dx) >= Math.abs(dy)
      ? (dx >= 0 ? 'right' : 'left')
      : (dy >= 0 ? 'bottom' : 'top');
    const defaultTargetHandle = Math.abs(dx) >= Math.abs(dy)
      ? (dx >= 0 ? 'left' : 'right')
      : (dy >= 0 ? 'top' : 'bottom');

    const sourcePoint = getConnectionPoint(sourceNode, connection.sourceHandle, defaultSourceHandle);
    const targetPoint = getConnectionPoint(targetNode, connection.targetHandle, defaultTargetHandle);

    const sourceX = sourcePoint.x;
    const sourceY = sourcePoint.y;
    const targetX = targetPoint.x;
    const targetY = targetPoint.y;

    if (isNaN(sourceX) || isNaN(sourceY) || isNaN(targetX) || isNaN(targetY)) {
      logger.error('getConnectionPath: Invalid connection point coordinates', { sourcePoint, targetPoint, connection });
      return '';
    }

    const offset = connectionOffsetY[connection.id] || 0;
    const sourceHandle = connection.sourceHandle || defaultSourceHandle;
    const targetHandle = connection.targetHandle || defaultTargetHandle;

    const isSourceVertical = sourceHandle === 'top' || sourceHandle === 'bottom';
    const isTargetVertical = targetHandle === 'top' || targetHandle === 'bottom';
    const isSourceHorizontal = sourceHandle === 'left' || sourceHandle === 'right';
    const isTargetHorizontal = targetHandle === 'left' || targetHandle === 'right';

    const actualDx = targetX - sourceX;
    const actualDy = targetY - sourceY;

    if (isSourceVertical && isTargetVertical) {
      const midY = ((sourceY + targetY) / 2) + offset;
      const midX = (sourceX + targetX) / 2;

      if (Math.abs(sourceX - targetX) < 0.1 && Math.abs(offset) < 0.1) {
        const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
        if (!path || path.includes('NaN')) {
          logger.error('getConnectionPath: Invalid path', { sourceX, sourceY, targetX, targetY, connection });
          return '';
        }
        return path;
      } else {
        const path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
        if (!path || path.includes('NaN')) {
          logger.error('getConnectionPath: Invalid path', { sourceX, sourceY, targetX, targetY, midY, connection });
          return '';
        }
        return path;
      }
    } else if (isSourceHorizontal && isTargetHorizontal) {
      if (Math.abs(sourceY - targetY) < 0.1 && Math.abs(offset) < 0.1) {
        const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
        if (!path || path.includes('NaN')) {
          logger.error('getConnectionPath: Invalid path', { sourceX, sourceY, targetX, targetY, connection });
          return '';
        }
        return path;
      } else {
        const midX = sourceX + (targetX - sourceX) / 2;
        const path = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
        if (!path || path.includes('NaN')) {
          logger.error('getConnectionPath: Invalid path', { sourceX, sourceY, targetX, targetY, midX, connection });
          return '';
        }
        return path;
      }
    } else {
      if (Math.abs(actualDx) >= Math.abs(actualDy)) {
        const midX = sourceX + (targetX - sourceX) / 2;
        const midY = ((sourceY + targetY) / 2) + offset;

        if (Math.abs(sourceY - targetY) < 0.1 && Math.abs(offset) < 0.1) {
          const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
          if (!path || path.includes('NaN')) {
            logger.error('getConnectionPath: Invalid path', { sourceX, sourceY, targetX, targetY, connection });
            return '';
          }
          return path;
        } else {
          const path = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
          if (!path || path.includes('NaN')) {
            logger.error('getConnectionPath: Invalid path', { sourceX, sourceY, targetX, targetY, midX, connection });
            return '';
          }
          return path;
        }
      } else {
        const midY = ((sourceY + targetY) / 2) + offset;
        const midX = (sourceX + targetX) / 2;

        if (Math.abs(sourceX - targetX) < 0.1 && Math.abs(offset) < 0.1) {
          const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
          if (!path || path.includes('NaN')) {
            logger.error('getConnectionPath: Invalid path', { sourceX, sourceY, targetX, targetY, connection });
            return '';
          }
          return path;
        } else {
          const path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
          if (!path || path.includes('NaN')) {
            logger.error('getConnectionPath: Invalid path', { sourceX, sourceY, targetX, targetY, midY, connection });
            return '';
          }
          return path;
        }
      }
    }
  };

  // 生成正交路径（用于拖拽更新）
  const generateOrthogonalPath = (
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    sourceIsRight: boolean,
    sourceIsLeft: boolean,
    sourceIsTop: boolean,
    sourceIsBottom: boolean,
    targetIsRight: boolean,
    targetIsLeft: boolean,
    targetIsTop: boolean,
    targetIsBottom: boolean
  ): string => {
    const isHorizontalAligned = Math.abs(sourceY - targetY) < 5;
    const isVerticalAligned = Math.abs(sourceX - targetX) < 5;

    if (isHorizontalAligned && (sourceIsRight && targetIsLeft || sourceIsLeft && targetIsRight)) {
      return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    } else if (isVerticalAligned && (sourceIsTop && targetIsBottom || sourceIsBottom && targetIsTop)) {
      return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    } else if (sourceIsRight && (targetIsBottom || targetIsTop)) {
      const turnX = targetX;
      return `M ${sourceX} ${sourceY} L ${turnX} ${sourceY} L ${turnX} ${targetY}`;
    } else if (sourceIsLeft && (targetIsBottom || targetIsTop)) {
      const turnX = targetX;
      return `M ${sourceX} ${sourceY} L ${turnX} ${sourceY} L ${turnX} ${targetY}`;
    } else if (sourceIsTop && (targetIsRight || targetIsLeft)) {
      const turnY = targetY;
      return `M ${sourceX} ${sourceY} L ${sourceX} ${turnY} L ${targetX} ${turnY}`;
    } else if (sourceIsBottom && (targetIsRight || targetIsLeft)) {
      const turnY = targetY;
      return `M ${sourceX} ${sourceY} L ${sourceX} ${turnY} L ${targetX} ${turnY}`;
    } else if (sourceIsRight && targetIsLeft) {
      const midX = sourceX + (targetX - sourceX) / 2;
      return `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
    } else if (sourceIsLeft && targetIsRight) {
      const midX = sourceX + (targetX - sourceX) / 2;
      return `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
    } else if (sourceIsTop && targetIsBottom) {
      const midY = sourceY + (targetY - sourceY) / 2;
      return `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
    } else if (sourceIsBottom && targetIsTop) {
      const midY = sourceY + (targetY - sourceY) / 2;
      return `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
    } else {
      const horizontalDistance = Math.abs(targetX - sourceX);
      const verticalDistance = Math.abs(targetY - sourceY);

      if (horizontalDistance > verticalDistance) {
        const midX = sourceX + (targetX - sourceX) / 2;
        return `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
      } else {
        const midY = sourceY + (targetY - sourceY) / 2;
        return `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
      }
    }
  };

  return {
    getConnectionPoint,
    getConnectionPath,
    generateOrthogonalPath
  };
}


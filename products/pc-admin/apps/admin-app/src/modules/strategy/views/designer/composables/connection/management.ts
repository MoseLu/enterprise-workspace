;
﻿import { ref, computed, reactive, watch, type Ref } from 'vue';
import { BtcConfirm, BtcMessage } from '@btc/shared-components';
import type { StrategyConnection, StrategyNode } from '@/types/strategy';
import { ConnectorType } from '@/types/strategy';
import { useConnectionPointSelector } from './point-selector';
import { useConnectionPathGenerator } from './path-generator';
import { useOrphanedConnection } from './orphaned';
import { useConnectionStyle } from './style';
import { logger } from '@btc/shared-core';

/**
 * 连接管理主入口
 * 整合所有连接相关的功能模块
 */
export function useConnectionManagement(nodes: Ref<StrategyNode[]>) {
  // 连接数据
  const connections = ref<StrategyConnection[]>([]);
  const selectedConnectionId = ref<string>('');
  const connectionOffsetY = reactive<Record<string, number>>({});

  // 连接状态
  const connectionState = reactive({
    isConnecting: false,
    fromNodeId: '',
    fromCondition: undefined as 'true' | 'false' | undefined,
    tempConnection: null as { path: string } | null
  });

  // 计算属性
  const selectedConnection = computed(() =>
    connections.value.find(conn => conn.id === selectedConnectionId.value)
  );

  // 工具函数
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // 导入各个模块
  const { selectOptimalConnectionPoints } = useConnectionPointSelector();
  const { getConnectionPath, generateOrthogonalPath } = useConnectionPathGenerator(nodes, connectionOffsetY);
  const { handleOrphanedConnection } = useOrphanedConnection(nodes);
  const { computeConnectionStyle, getConnectionColor, getConnectionMarker, getConnectionDirection } = useConnectionStyle(nodes);

  // 连接操作
  const startConnection = (fromNodeId: string, event: MouseEvent, condition?: 'true' | 'false') => {
    connectionState.isConnecting = true;
    connectionState.fromNodeId = fromNodeId;
    connectionState.fromCondition = condition;

    const canvasRef = document.querySelector('.strategy-canvas') as HTMLElement;
    if (canvasRef) {
      updateTempConnection(event, canvasRef);
    } else {
      logger.error('Canvas element not found');
    }
  };

  const updateTempConnection = (event: MouseEvent, canvasRef?: HTMLElement) => {
    if (!connectionState.isConnecting || !connectionState.fromNodeId || !canvasRef) {
      return;
    }

    const fromNode = nodes.value.find(n => n.id === connectionState.fromNodeId);
    if (!fromNode) {
      return;
    }

    const rect = canvasRef.getBoundingClientRect();
    const toX = event.clientX - rect.left;
    const toY = event.clientY - rect.top;

    const nodeWidth = fromNode.style?.width || 120;
    const nodeHeight = fromNode.style?.height || 60;

    let fromX: number;
    let fromY: number;

    if ((fromNode.type === 'CONDITION' || fromNode.type === 'DECISION') && connectionState.fromCondition) {
      if (connectionState.fromCondition === 'true') {
        fromX = fromNode.position.x + nodeWidth;
        fromY = fromNode.position.y + nodeHeight / 2;
      } else {
        fromX = fromNode.position.x;
        fromY = fromNode.position.y + nodeHeight / 2;
      }
    } else {
      const nodeCenterX = fromNode.position.x + nodeWidth / 2;
      const nodeCenterY = fromNode.position.y + nodeHeight / 2;

      const deltaX = toX - nodeCenterX;
      const deltaY = toY - nodeCenterY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          fromX = fromNode.position.x + nodeWidth;
          fromY = fromNode.position.y + nodeHeight / 2;
        } else {
          fromX = fromNode.position.x;
          fromY = fromNode.position.y + nodeHeight / 2;
        }
      } else {
        if (deltaY > 0) {
          fromX = fromNode.position.x + nodeWidth / 2;
          fromY = fromNode.position.y + nodeHeight;
        } else {
          fromX = fromNode.position.x + nodeWidth / 2;
          fromY = fromNode.position.y;
        }
      }
    }

    const horizontalDistance = Math.abs(toX - fromX);
    const verticalDistance = Math.abs(toY - fromY);
    const minGap = 20;
    let path: string;

    if (horizontalDistance < minGap || verticalDistance < minGap) {
      path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
    } else {
      const deltaX = toX - fromX;
      const deltaY = toY - fromY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        const turnX = fromX + (toX - fromX) / 2;
        path = `M ${fromX} ${fromY} L ${turnX} ${fromY} L ${turnX} ${toY} L ${toX} ${toY}`;
      } else {
        const turnY = fromY + (toY - fromY) / 2;
        path = `M ${fromX} ${fromY} L ${fromX} ${turnY} L ${toX} ${turnY} L ${toX} ${toY}`;
      }
    }

    connectionState.tempConnection = { path };
  };

  const completeConnection = (toNodeId: string) => {
    if (!connectionState.isConnecting ||
        !connectionState.fromNodeId ||
        connectionState.fromNodeId === toNodeId) {
      return false;
    }

    const existingConnection = connections.value.find(c =>
      c.sourceNodeId === connectionState.fromNodeId && c.targetNodeId === toNodeId
    );

    if (existingConnection) {
      BtcMessage.warning('Connection already exists between nodes');
      connectionState.isConnecting = false;
      connectionState.tempConnection = null;
      connectionState.fromNodeId = '';
      return false;
    }

    let strokeColor = '#409eff';
    if (connectionState.fromCondition === 'true') {
      strokeColor = '#67c23a';
    } else if (connectionState.fromCondition === 'false') {
      strokeColor = '#f56c6c';
    }

    const newConnection: StrategyConnection = {
      id: generateId(),
      type: ConnectorType.SEQUENCE,
      sourceNodeId: connectionState.fromNodeId,
      targetNodeId: toNodeId,
      condition: connectionState.fromCondition,
      style: {
        strokeColor,
        strokeWidth: 2
      }
    };

    connections.value.push(newConnection);

    connectionState.isConnecting = false;
    connectionState.tempConnection = null;
    connectionState.fromNodeId = '';
    connectionState.fromCondition = undefined;

      BtcMessage.success('Connection created successfully');
    return true;
  };

  const cancelConnection = () => {
    connectionState.isConnecting = false;
    connectionState.tempConnection = null;
    connectionState.fromNodeId = '';
    connectionState.fromCondition = undefined;
  };

  const selectConnection = (connection: StrategyConnection) => {
    selectedConnectionId.value = connection.id;
  };

  const updateConnectionProperties = (connectionId: string, properties: Partial<StrategyConnection>) => {
    const connection = connections.value.find(c => c.id === connectionId);
    if (connection) {
      Object.assign(connection, properties);
    }
  };

  const deleteConnection = async (connectionId: string, skipConfirm = false) => {
    try {
      if (!skipConfirm) {
        await BtcConfirm('Are you sure to delete this connection?', 'Confirm Delete', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        });
      }

      connections.value = connections.value.filter(c => c.id !== connectionId);

      if (selectedConnectionId.value === connectionId) {
        selectedConnectionId.value = '';
      }

        BtcMessage.success('Connection deleted successfully');
      return true;
    } catch {
      return false;
    }
  };

  const deleteNodeConnections = (nodeId: string) => {
    connections.value = connections.value.filter(c =>
      c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
    );
  };

  // 直接更新连线路径 - 操作SVG DOM
  const updateConnectionPaths = () => {
    isUpdatingHandles = true;
    try {
      const nodeHandleUsage = new Map<string, Set<string>>();

      connections.value.forEach(connection => {
        const sourceId = connection.sourceNodeId;
        const targetId = connection.targetNodeId;

        if (!nodeHandleUsage.has(sourceId)) {
          nodeHandleUsage.set(sourceId, new Set<string>());
        }
        if (!nodeHandleUsage.has(targetId)) {
          nodeHandleUsage.set(targetId, new Set<string>());
        }

        if (connection.sourceHandle) {
          nodeHandleUsage.get(sourceId)!.add(connection.sourceHandle);
        }
        if (connection.targetHandle) {
          nodeHandleUsage.get(targetId)!.add(connection.targetHandle);
        }
      });

      connections.value.forEach(connection => {
        const sourceElement = document.querySelector(`[data-node-id="${connection.sourceNodeId}"]`) as SVGGElement;
        const targetElement = document.querySelector(`[data-node-id="${connection.targetNodeId}"]`) as SVGGElement;

        if (!sourceElement || !targetElement) return;

        const getNodePosition = (element: SVGGElement) => {
          const transform = element.style.transform || element.getAttribute('transform') || '';
          const match = transform.match(/translate\(([^,]+)(?:px)?,\s*([^)]+)(?:px)?\)/);
          if (match) {
            return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
          }
          return { x: 0, y: 0 };
        };

        const getNodeSize = (element: SVGGElement) => {
          const rectElement = element.querySelector('.node-rect') as SVGRectElement;
          if (rectElement) {
            return {
              width: parseFloat(rectElement.getAttribute('width') || '120'),
              height: parseFloat(rectElement.getAttribute('height') || '60')
            };
          }
          const circleElement = element.querySelector('circle') as SVGCircleElement;
          if (circleElement) {
            const radius = parseFloat(circleElement.getAttribute('r') || '28');
            return {
              width: (radius + 2) * 2,
              height: (radius + 2) * 2
            };
          }
          return { width: 120, height: 60 };
        };

        const sourcePos = getNodePosition(sourceElement);
        const targetPos = getNodePosition(targetElement);

        const sourceNodeTemplate = nodes.value.find(n => n.id === connection.sourceNodeId);
        const targetNodeTemplate = nodes.value.find(n => n.id === connection.targetNodeId);

        const sourceNode = {
          id: connection.sourceNodeId,
          position: sourcePos,
          style: sourceNodeTemplate?.style || { width: 120, height: 60 },
          type: sourceNodeTemplate?.type,
          name: sourceNodeTemplate?.name || '',
          data: sourceNodeTemplate?.data || {}
        } as StrategyNode;

        const targetNode = {
          id: connection.targetNodeId,
          position: targetPos,
          style: targetNodeTemplate?.style || { width: 120, height: 60 },
          type: targetNodeTemplate?.type,
          name: targetNodeTemplate?.name || '',
          data: targetNodeTemplate?.data || {}
        } as StrategyNode;

        const sourceSize = { width: sourceNode.style?.width || 120, height: sourceNode.style?.height || 60 };
        const targetSize = { width: targetNode.style?.width || 120, height: targetNode.style?.height || 60 };

        const sourceUsedHandles = nodeHandleUsage.get(connection.sourceNodeId) || new Set<string>();
        const targetUsedHandles = nodeHandleUsage.get(connection.targetNodeId) || new Set<string>();
        const { sourceX, sourceY, targetX, targetY, sourceHandle, targetHandle } = selectOptimalConnectionPoints(
          sourceNode,
          targetNode,
          connection,
          sourceUsedHandles,
          targetUsedHandles
        );

        if (sourceHandle && !sourceUsedHandles.has(sourceHandle)) {
          sourceUsedHandles.add(sourceHandle);
          nodeHandleUsage.set(connection.sourceNodeId, sourceUsedHandles);
        }
        if (targetHandle && !targetUsedHandles.has(targetHandle)) {
          targetUsedHandles.add(targetHandle);
          nodeHandleUsage.set(connection.targetNodeId, targetUsedHandles);
        }

        const sourceIsRight = sourceX === sourcePos.x + sourceSize.width;
        const sourceIsLeft = sourceX === sourcePos.x;
        const sourceIsTop = sourceY === sourcePos.y;
        const sourceIsBottom = sourceY === sourcePos.y + sourceSize.height;

        const targetIsRight = targetX === targetPos.x + targetSize.width;
        const targetIsLeft = targetX === targetPos.x;
        const targetIsTop = targetY === targetPos.y;
        const targetIsBottom = targetY === targetPos.y + targetSize.height;

        const path = generateOrthogonalPath(
          sourceX, sourceY, targetX, targetY,
          sourceIsRight, sourceIsLeft, sourceIsTop, sourceIsBottom,
          targetIsRight, targetIsLeft, targetIsTop, targetIsBottom
        );

        const getThemeColor = (cssVar: string) => {
          if (typeof window !== 'undefined') {
            const color = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
            return color || '#ffffff';
          }
          return '#ffffff';
        };

        const isDarkTheme = getThemeColor('--el-color-white') === '#ffffff' &&
                           getComputedStyle(document.documentElement).getPropertyValue('--el-bg-color').includes('dark');

        let color = isDarkTheme ? getThemeColor('--el-color-white') : getThemeColor('--el-text-color-primary');

        if (connection.condition === 'true') {
          color = isDarkTheme ? getThemeColor('--el-color-white') : getThemeColor('--el-text-color-primary');
        } else if (connection.condition === 'false') {
          color = isDarkTheme ? getThemeColor('--el-color-white') : getThemeColor('--el-text-color-primary');
        } else {
          color = connection.style?.strokeColor || (isDarkTheme ? getThemeColor('--el-color-white') : getThemeColor('--el-text-color-primary'));
        }

        let marker = 'url(#arrowhead-default)';
        if (connection.condition === 'true') {
          marker = 'url(#arrowhead-true)';
        } else if (connection.condition === 'false') {
          marker = 'url(#arrowhead-false)';
        }

        const connectionElement = document.querySelector(`[data-connection-id="${connection.id}"]`) as SVGPathElement;
        if (connectionElement) {
          connectionElement.setAttribute('d', path);
          connectionElement.setAttribute('stroke', color);
          connectionElement.setAttribute('marker-end', marker);
        }
      });
    } finally {
      if (resetTimer) {
        clearTimeout(resetTimer);
      }
      resetTimer = setTimeout(() => {
        isUpdatingHandles = false;
        resetTimer = null;
      }, 0);
    }
  };

  // 标志位：防止在 watch 回调中修改 connections 导致递归更新
  let isUpdatingHandles = false;
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  // 计算所有连接线的路径 - 用于初始渲染（使用 watch 确保响应式）
  const connectionPaths = ref<Array<{ id: string; path: string; color: string; marker: string; direction?: 'horizontal' | 'vertical'; isOrphaned?: boolean }>>([]);

  // watch connections、nodes 和 connectionOffsetY 变化，重新计算连接路径
  watch([connections, nodes, connectionOffsetY], () => {
    if (isUpdatingHandles) {
      return;
    }
    const nodeHandleUsage = new Map<string, Set<string>>();

    connections.value.forEach(connection => {
      const sourceId = connection.sourceNodeId;
      const targetId = connection.targetNodeId;

      if (!nodeHandleUsage.has(sourceId)) {
        nodeHandleUsage.set(sourceId, new Set<string>());
      }
      if (!nodeHandleUsage.has(targetId)) {
        nodeHandleUsage.set(targetId, new Set<string>());
      }
    });

    isUpdatingHandles = true;
    try {
      connectionPaths.value = connections.value.map((connection) => {
        const sourceNode = nodes.value.find(n => n.id === connection.sourceNodeId);
        const targetNode = nodes.value.find(n => n.id === connection.targetNodeId);

        if (!sourceNode && !targetNode) {
          return { id: connection.id, path: '', color: '', marker: '', direction: 'horizontal' as const, isOrphaned: true };
        } else if (!sourceNode) {
          return handleOrphanedConnection(connection, undefined, targetNode, connectionOffsetY);
        } else if (!targetNode) {
          return handleOrphanedConnection(connection, sourceNode, undefined, connectionOffsetY);
        }

        const sourceUsedHandles = nodeHandleUsage.get(connection.sourceNodeId) || new Set<string>();
        const targetUsedHandles = nodeHandleUsage.get(connection.targetNodeId) || new Set<string>();

        const connectionPoints = selectOptimalConnectionPoints(
          sourceNode,
          targetNode,
          connection,
          sourceUsedHandles,
          targetUsedHandles
        );
        const { sourceX, sourceY, targetX, targetY, sourceHandle, targetHandle } = connectionPoints;

        if (sourceHandle) {
          const sourceUsed = nodeHandleUsage.get(connection.sourceNodeId) || new Set<string>();
          sourceUsed.add(sourceHandle);
          nodeHandleUsage.set(connection.sourceNodeId, sourceUsed);
        }
        if (targetHandle) {
          const targetUsed = nodeHandleUsage.get(connection.targetNodeId) || new Set<string>();
          targetUsed.add(targetHandle);
          nodeHandleUsage.set(connection.targetNodeId, targetUsed);
        }

        if (sourceHandle !== undefined && connection.sourceHandle !== sourceHandle) {
          connection.sourceHandle = sourceHandle;
        }
        if (targetHandle !== undefined && connection.targetHandle !== targetHandle) {
          connection.targetHandle = targetHandle;
        }

        const sourceIsRight = sourceX === sourceNode.position.x + (sourceNode.style?.width || 120);
        const sourceIsLeft = sourceX === sourceNode.position.x;
        const sourceIsTop = sourceY === sourceNode.position.y;
        const sourceIsBottom = sourceY === sourceNode.position.y + (sourceNode.style?.height || 60);

        const targetIsRight = targetX === targetNode.position.x + (targetNode.style?.width || 120);
        const targetIsLeft = targetX === targetNode.position.x;
        const targetIsTop = targetY === targetNode.position.y;
        const targetIsBottom = targetY === targetNode.position.y + (targetNode.style?.height || 60);

        const path = generateOrthogonalPath(
          sourceX, sourceY, targetX, targetY,
          sourceIsRight, sourceIsLeft, sourceIsTop, sourceIsBottom,
          targetIsRight, targetIsLeft, targetIsTop, targetIsBottom
        );

        if (!path || !path.trim()) {
          return { id: connection.id, path: '', color: '', marker: '', direction: 'horizontal' as const };
        }

        connection.lastSourceX = sourceX;
        connection.lastSourceY = sourceY;
        connection.lastTargetX = targetX;
        connection.lastTargetY = targetY;
        connection.lastPath = path;

        const { color, marker } = computeConnectionStyle(connection);
        const direction = getConnectionDirection(connection, path);
        return { id: connection.id, path: path || '', color, marker, direction };
      });
    } finally {
      if (resetTimer) {
        clearTimeout(resetTimer);
      }
      resetTimer = setTimeout(() => {
        isUpdatingHandles = false;
        resetTimer = null;
      }, 0);
    }
  }, { deep: true, immediate: true, flush: 'post' });

  const clearConnections = () => {
    connections.value = [];
    selectedConnectionId.value = '';
    cancelConnection();
  };

  const addConnection = (connection: StrategyConnection) => {
    connections.value.push(connection);
  };

  const updateConnection = (connectionId: string, updates: Partial<StrategyConnection>) => {
    const connection = connections.value.find(c => c.id === connectionId);
    if (connection) {
      Object.assign(connection, updates);
    }
  };

  const handleConnectionStart = (event: MouseEvent, node: StrategyNode, type: 'input' | 'output' | 'output-true' | 'output-false') => {
    event.stopPropagation();

    if (type === 'input') {
      completeConnection(node.id);
    } else {
      const condition = type === 'output-true' ? 'true' : type === 'output-false' ? 'false' : undefined;
      startConnection(node.id, event, condition);
    }
  };

  const tempConnection = computed(() => connectionState.tempConnection);

  return {
    connections,
    selectedConnectionId,
    selectedConnection,
    connectionState,
    tempConnection,
    connectionPaths,
    startConnection,
    updateTempConnection,
    completeConnection,
    cancelConnection,
    selectConnection,
    updateConnectionProperties,
    updateConnection,
    addConnection,
    deleteConnection,
    deleteNodeConnections,
    getConnectionPath,
    connectionOffsetY,
    getConnectionColor,
    getConnectionMarker,
    handleConnectionStart,
    clearConnections,
    updateConnectionPaths
  };
}


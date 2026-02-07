import React, { useMemo } from 'react';
import styles from './NodeItem.module.css';

interface NodePosition {
  x: number;
  y: number;
}

interface NodeStyle {
  width?: number;
  height?: number;
}

interface TextConfig {
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  fontSize?: number;
}

interface NodeData {
  id: string;
  type: string;
  position: NodePosition;
  style?: NodeStyle;
  text?: string;
  textConfig?: TextConfig;
}

interface NodeItemProps {
  node: NodeData;
  selectedNodeId: string;
  multiSelectedNodeIds: Set<string>;
  isDragging: boolean;
  isResizing: boolean;
  isEditing?: boolean;
  draggingNodeId: string;
  lastSelectionMode: 'none' | 'click' | 'rubber';
  multiSelectedConnectionCount: number;
  hoveredArrowDirection: string;
  isMouseOnNodeBorder: boolean;
  defaultTextConfig: { fontSize: number; fontFamily: string; fontWeight: string; fontStyle: string };
  getNodeFillColor: (type: string) => string;
  getNodeStrokeColor: (type: string) => string;
  getNodeTextColor: (type: string) => string;
  getHandlePositions: (nodeType: string, width: number, height: number) => any;
  getPositionBoxLocalTransform: (node: NodeData) => string;
  getArrowTransform: (node: NodeData, dir: string) => string;
  getNodeText: (type: string) => string;
  canvasDimensions?: { width: number; height: number };
  connections?: any[];
  selectedConnectionId?: string;
  multiSelectedConnectionIds?: Set<string>;
  getConnectionHandle?: (connectionId: string, pathString?: string) => { sx: number; sy: number; middleHandles: Array<{ x: number; y: number; segmentIndex: number }>; tx: number; ty: number };
  onPointerDown?: (e: React.MouseEvent, node: NodeData) => void;
  onClick?: (node: NodeData, e: React.MouseEvent) => void;
  onDoubleClick?: (node: NodeData, e: React.MouseEvent) => void;
  onMouseEnter?: (node: NodeData) => void;
  onMouseLeave?: () => void;
  onResizeStart?: (e: React.MouseEvent, node: NodeData, direction: string) => void;
  onHandleEnter?: () => void;
  onHandleLeave?: () => void;
  onArrowClick?: (e: React.MouseEvent, node: NodeData, direction: string) => void;
  onArrowEnter?: (direction: string) => void;
  onArrowLeave?: () => void;
}

export const NodeItem: React.FC<NodeItemProps> & {
  displayName: string;
} = ({
  node,
  selectedNodeId,
  multiSelectedNodeIds,
  isDragging,
  isResizing,
  isEditing,
  draggingNodeId,
  lastSelectionMode,
  multiSelectedConnectionCount,
  hoveredArrowDirection,
  isMouseOnNodeBorder,
  defaultTextConfig,
  getNodeFillColor,
  getNodeStrokeColor,
  getNodeTextColor,
  getHandlePositions,
  getPositionBoxLocalTransform,
  getArrowTransform,
  getNodeText,
  canvasDimensions,
  connections,
  selectedConnectionId,
  multiSelectedConnectionIds,
  getConnectionHandle,
  onPointerDown,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  onResizeStart,
  onHandleEnter,
  onHandleLeave,
  onArrowClick,
  onArrowEnter,
  onArrowLeave,
}) => {
  const isSelected = useMemo(
    () => selectedNodeId === node.id || multiSelectedNodeIds.has(node.id),
    [selectedNodeId, multiSelectedNodeIds, node.id]
  );

  const showPositionBox = useMemo(
    () =>
      selectedNodeId === node.id ||
      (isDragging && draggingNodeId === node.id),
    [selectedNodeId, node.id, isDragging, draggingNodeId]
  );

  const showResizeHandles = useMemo(() => {
    if (!isSelected || isDragging || isResizing || isEditing) {
      return false;
    }
    const isInMultiSelection = multiSelectedNodeIds.has(node.id);
    if (
      lastSelectionMode === 'rubber' &&
      multiSelectedConnectionCount > 0 &&
      !isInMultiSelection
    ) {
      return false;
    }
    return true;
  }, [
    isSelected,
    isDragging,
    isResizing,
    isEditing,
    multiSelectedNodeIds,
    node.id,
    lastSelectionMode,
    multiSelectedConnectionCount,
  ]);

  const showArrows = useMemo(
    () => selectedNodeId === node.id && !isDragging,
    [selectedNodeId, node.id, isDragging]
  );

  const handleVisibility = useMemo(() => {
    const result = {
      top: true,
      right: true,
      bottom: true,
      left: true,
      topLeft: true,
      topRight: true,
      bottomLeft: true,
      bottomRight: true,
    };

    if (
      !connections ||
      !getConnectionHandle ||
      !showResizeHandles.valueOf()
    ) {
      return result;
    }

    const nodeWidth = node.style?.width || 120;
    const nodeHeight = node.style?.height || 60;
    const nodeX = node.position.x;
    const nodeY = node.position.y;

    const handlePositions = {
      top: { x: nodeX + nodeWidth / 2, y: nodeY },
      right: { x: nodeX + nodeWidth, y: nodeY + nodeHeight / 2 },
      bottom: { x: nodeX + nodeWidth / 2, y: nodeY + nodeHeight },
      left: { x: nodeX, y: nodeY + nodeHeight / 2 },
    };

    const selectedConnections = connections.filter((conn: any) => {
      const isConnSelected =
        selectedConnectionId === conn.id ||
        (multiSelectedConnectionIds &&
          multiSelectedConnectionIds.has(conn.id));
      return (
        isConnSelected &&
        (conn.sourceNodeId === node.id || conn.targetNodeId === node.id)
      );
    });

    const tolerance = 3;

    selectedConnections.forEach((conn: any) => {
      const handle = getConnectionHandle!(conn.id);
      if (!handle || !handle.sx || !handle.sy || !handle.tx || !handle.ty) return;

      const checkConnectionPoint = (pointX: number, pointY: number) => {
        if (
          Math.abs(pointX - handlePositions.top.x) < tolerance &&
          Math.abs(pointY - handlePositions.top.y) < tolerance
        ) {
          result.top = false;
        }
        if (
          Math.abs(pointX - handlePositions.right.x) < tolerance &&
          Math.abs(pointY - handlePositions.right.y) < tolerance
        ) {
          result.right = false;
        }
        if (
          Math.abs(pointX - handlePositions.bottom.x) < tolerance &&
          Math.abs(pointY - handlePositions.bottom.y) < tolerance
        ) {
          result.bottom = false;
        }
        if (
          Math.abs(pointX - handlePositions.left.x) < tolerance &&
          Math.abs(pointY - handlePositions.left.y) < tolerance
        ) {
          result.left = false;
        }
      };

      if (conn.sourceNodeId === node.id) {
        checkConnectionPoint(handle.sx, handle.sy);
      }
      if (conn.targetNodeId === node.id) {
        checkConnectionPoint(handle.tx, handle.ty);
      }
    });

    return result;
  }, [
    connections,
    getConnectionHandle,
    showResizeHandles,
    node,
    selectedConnectionId,
    multiSelectedConnectionIds,
  ]);

  const nodeWidth = node.style?.width || 120;
  const nodeHeight = node.style?.height || 60;
  const nodeText = node.text || getNodeText(node.type);
  const fillColor = getNodeFillColor(node.type);
  const strokeColor = getNodeStrokeColor(node.type);
  const textColor = getNodeTextColor(node.type);

  // Render node shape based on type
  const renderNodeShape = () => {
    switch (node.type) {
      case 'START':
      case 'END':
        return (
          <circle
            cx={nodeWidth / 2}
            cy={nodeHeight / 2}
            r={Math.min(nodeWidth, nodeHeight) / 2 - 2}
            strokeWidth="2"
            fill={fillColor}
            stroke={strokeColor}
            className={styles.nodeRect}
            pointerEvents="all"
          />
        );
      case 'CONDITION':
        return (
          <path
            d={`M ${nodeWidth / 2} 0 L ${nodeWidth} ${nodeHeight / 2} L ${nodeWidth / 2} ${nodeHeight} L 0 ${nodeHeight / 2} Z`}
            strokeWidth="2"
            fill={fillColor}
            stroke={strokeColor}
            className={styles.nodeRect}
            pointerEvents="all"
          />
        );
      default:
        return (
          <rect
            width={nodeWidth}
            height={nodeHeight}
            strokeWidth="2"
            rx="4"
            ry="4"
            fill={fillColor}
            stroke={strokeColor}
            className={styles.nodeRect}
            pointerEvents="all"
          />
        );
    }
  };

  // Render resize handles
  const renderResizeHandles = () => {
    if (!showResizeHandles) return null;

    const positions = getHandlePositions(node.type, nodeWidth, nodeHeight);
    const handles = positions.boundaryBox;

    return (
      <g className={styles.resizeHandles}>
        <rect
          x={handles.x}
          y={handles.y}
          width={handles.width}
          height={handles.height}
          fill="none"
          stroke="#409eff"
          strokeWidth="1"
          strokeDasharray="4,4"
          className={styles.boundaryBox}
        />
        {handleVisibility.top && (
          <g
            className={styles.handleTop}
            transform={`translate(${nodeWidth / 2}, 0)`}
          >
            <circle
              className={`${styles.resizeHandle} ${styles.top}`}
              cx="0"
              cy="0"
              r="6"
              fill="#409eff"
              stroke="white"
              strokeWidth="2"
              cursor="n-resize"
              onPointerDown={(e) => onResizeStart?.(e, node, 'top')}
              onMouseEnter={onHandleEnter}
              onMouseLeave={onHandleLeave}
            />
          </g>
        )}
        {handleVisibility.right && (
          <g
            className={styles.handleRight}
            transform={`translate(${nodeWidth}, ${nodeHeight / 2})`}
          >
            <circle
              className={`${styles.resizeHandle} ${styles.right}`}
              cx="0"
              cy="0"
              r="6"
              fill="#409eff"
              stroke="white"
              strokeWidth="2"
              cursor="e-resize"
              onPointerDown={(e) => onResizeStart?.(e, node, 'right')}
              onMouseEnter={onHandleEnter}
              onMouseLeave={onHandleLeave}
            />
          </g>
        )}
        {handleVisibility.bottom && (
          <g
            className={styles.handleBottom}
            transform={`translate(${nodeWidth / 2}, ${nodeHeight})`}
          >
            <circle
              className={`${styles.resizeHandle} ${styles.bottom}`}
              cx="0"
              cy="0"
              r="6"
              fill="#409eff"
              stroke="white"
              strokeWidth="2"
              cursor="s-resize"
              onPointerDown={(e) => onResizeStart?.(e, node, 'bottom')}
              onMouseEnter={onHandleEnter}
              onMouseLeave={onHandleLeave}
            />
          </g>
        )}
        {handleVisibility.left && (
          <g
            className={styles.handleLeft}
            transform={`translate(0, ${nodeHeight / 2})`}
          >
            <circle
              className={`${styles.resizeHandle} ${styles.left}`}
              cx="0"
              cy="0"
              r="6"
              fill="#409eff"
              stroke="white"
              strokeWidth="2"
              cursor="w-resize"
              onPointerDown={(e) => onResizeStart?.(e, node, 'left')}
              onMouseEnter={onHandleEnter}
              onMouseLeave={onHandleLeave}
            />
          </g>
        )}
        <g
          className={styles.handleTopLeft}
          transform="translate(0, 0)"
        >
          <circle
            className={`${styles.resizeHandle} ${styles.topLeft}`}
            cx="0"
            cy="0"
            r="6"
            fill="#409eff"
            stroke="white"
            strokeWidth="2"
            cursor="nw-resize"
            onPointerDown={(e) => onResizeStart?.(e, node, 'top-left')}
            onMouseEnter={onHandleEnter}
            onMouseLeave={onHandleLeave}
          />
        </g>
        <g
          className={styles.handleTopRight}
          transform={`translate(${nodeWidth}, 0)`}
        >
          <circle
            className={`${styles.resizeHandle} ${styles.topRight}`}
            cx="0"
            cy="0"
            r="6"
            fill="#409eff"
            stroke="white"
            strokeWidth="2"
            cursor="ne-resize"
            onPointerDown={(e) => onResizeStart?.(e, node, 'top-right')}
            onMouseEnter={onHandleEnter}
            onMouseLeave={onHandleLeave}
          />
        </g>
        <g
          className={styles.handleBottomLeft}
          transform={`translate(0, ${nodeHeight})`}
        >
          <circle
            className={`${styles.resizeHandle} ${styles.bottomLeft}`}
            cx="0"
            cy="0"
            r="6"
            fill="#409eff"
            stroke="white"
            strokeWidth="2"
            cursor="sw-resize"
            onPointerDown={(e) => onResizeStart?.(e, node, 'bottom-left')}
            onMouseEnter={onHandleEnter}
            onMouseLeave={onHandleLeave}
          />
        </g>
        <g
          className={styles.handleBottomRight}
          transform={`translate(${nodeWidth}, ${nodeHeight})`}
        >
          <circle
            className={`${styles.resizeHandle} ${styles.bottomRight}`}
            cx="0"
            cy="0"
            r="6"
            fill="#409eff"
            stroke="white"
            strokeWidth="2"
            cursor="se-resize"
            onPointerDown={(e) => onResizeStart?.(e, node, 'bottom-right')}
            onMouseEnter={onHandleEnter}
            onMouseLeave={onHandleLeave}
          />
        </g>
      </g>
    );
  };

  // Render connection arrows
  const renderConnectionArrows = () => {
    if (!showArrows) return null;

    return (
      <g
        className={`${styles.connectionArrows} ${styles.visible}`}
        style={{ pointerEvents: 'none' }}
      >
        <g
          className={`${styles.connectionArrowGroup} ${
            isSelected && !isMouseOnNodeBorder && hoveredArrowDirection === 'top'
              ? styles.active
              : ''
          }`}
          transform={getArrowTransform(node, 'top')}
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => onArrowClick?.(e, node, 'top')}
          onMouseEnter={() => onArrowEnter?.('top')}
          onMouseLeave={onArrowLeave}
        >
          <path
            d="M 56 -10 L 56 -30 L 52 -30 L 60 -40 L 68 -30 L 64 -30 L 64 -10 Z"
            className={styles.arrowShape}
          />
        </g>
        <g
          className={`${styles.connectionArrowGroup} ${
            isSelected && !isMouseOnNodeBorder && hoveredArrowDirection === 'right'
              ? styles.active
              : ''
          }`}
          transform={getArrowTransform(node, 'right')}
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => onArrowClick?.(e, node, 'right')}
          onMouseEnter={() => onArrowEnter?.('right')}
          onMouseLeave={onArrowLeave}
        >
          <path
            d="M 10 26 L 30 26 L 30 22 L 40 30 L 30 38 L 30 34 L 10 34 Z"
            className={styles.arrowShape}
          />
        </g>
        <g
          className={`${styles.connectionArrowGroup} ${
            isSelected && !isMouseOnNodeBorder && hoveredArrowDirection === 'bottom'
              ? styles.active
              : ''
          }`}
          transform={getArrowTransform(node, 'bottom')}
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => onArrowClick?.(e, node, 'bottom')}
          onMouseEnter={() => onArrowEnter?.('bottom')}
          onMouseLeave={onArrowLeave}
        >
          <path
            d="M 56 10 L 56 30 L 52 30 L 60 40 L 68 30 L 64 30 L 64 10 Z"
            className={styles.arrowShape}
          />
        </g>
        <g
          className={`${styles.connectionArrowGroup} ${
            isSelected && !isMouseOnNodeBorder && hoveredArrowDirection === 'left'
              ? styles.active
              : ''
          }`}
          transform={getArrowTransform(node, 'left')}
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => onArrowClick?.(e, node, 'left')}
          onMouseEnter={() => onArrowEnter?.('left')}
          onMouseLeave={onArrowLeave}
        >
          <path
            d="M 30 26 L 10 26 L 10 22 L 0 30 L 10 38 L 10 34 L 30 34 Z"
            className={styles.arrowShape}
          />
        </g>
      </g>
    );
  };

  // Render position box
  const renderPositionBox = () => {
    if (!showPositionBox) return null;

    const container = document.querySelector('.canvas-scroll') as HTMLElement | null;
    let relativeX = Math.round(node.position.x);
    let relativeY = Math.round(node.position.y);

    if (container) {
      const containerWidth = container.getBoundingClientRect().width;
      const containerHeight = container.getBoundingClientRect().height;
      const gridWidth = canvasDimensions?.width || 2000;
      const gridHeight = canvasDimensions?.height || 1500;
      const borderWidth = 1;

      const gridOffsetX = (containerWidth - gridWidth) / 2 + borderWidth;
      const gridOffsetY = (containerHeight - gridHeight) / 2 + borderWidth;

      relativeX = Math.floor(node.position.x - gridOffsetX);
      relativeY = Math.floor(node.position.y - gridOffsetY);
    }

    return (
      <g
        className={styles.nodePositionBox}
        transform={getPositionBoxLocalTransform(node)}
      >
        <rect
          x="0"
          y="0"
          width="70"
          height="18"
          fill="rgba(0,0,0,0.8)"
          stroke="#666"
          strokeWidth="1"
          rx="2"
          ry="2"
        />
        <text
          x="35"
          y="9"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize="3"
          fontFamily="monospace"
        >
          {relativeX}, {relativeY}
        </text>
      </g>
    );
  };

  // Render node text
  const renderNodeText = () => {
    if (isEditing) return null;

    return (
      <text
        x={nodeWidth / 2}
        y={nodeHeight / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily={node.textConfig?.fontFamily || defaultTextConfig.fontFamily}
        fontWeight={node.textConfig?.fontWeight || defaultTextConfig.fontWeight}
        fontStyle={node.textConfig?.fontStyle || defaultTextConfig.fontStyle}
        fontSize={`${node.textConfig?.fontSize || defaultTextConfig.fontSize}px`}
        fill={textColor}
        className={styles.nodeText}
      >
        {nodeText}
      </text>
    );
  };

  return (
    <g
      className={`${styles.strategyNode} ${styles[node.type]} ${
        isSelected ? styles.selected : ''
      }`}
      data-node-id={node.id}
      transform={`translate(${node.position.x}, ${node.position.y})`}
      onPointerDown={(e) => onPointerDown?.(e, node)}
      onClick={(e) => onClick?.(node, e)}
      onDoubleClick={(e) => onDoubleClick?.(node, e)}
      onMouseEnter={() => onMouseEnter?.(node)}
      onMouseLeave={onMouseLeave}
    >
      {renderNodeShape()}
      {renderNodeText()}
      {renderPositionBox()}
      {renderResizeHandles()}
      {renderConnectionArrows()}
    </g>
  );
};

NodeItem.displayName = 'NodeItem';

export default NodeItem;

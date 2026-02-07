import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import styles from './CanvasSvg.module.css';

interface Point {
  x: number;
  y: number;
}

interface ConnectionPathData {
  id: string;
  path: string;
  color: string;
  marker: string;
  direction?: 'horizontal' | 'vertical';
  isOrphaned?: boolean;
}

interface CanvasSvgProps {
  canvasDimensions: { width: number; height: number };
  panX: number;
  panY: number;
  scale: number;
  isDragging: boolean;
  connectionPaths: ConnectionPathData[];
  isConnectionSelected: (id: string) => boolean;
  getGridColor: (isSmall: boolean) => string;
  getConnectionColor: () => string;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseMove: (event: React.MouseEvent) => void;
  onMouseUp: (event: React.MouseEvent) => void;
  onClick: (event: React.MouseEvent) => void;
  onSelectConnection: (id: string) => void;
  children?: React.ReactNode;
}

export interface CanvasSvgRef {
  getClientSize: () => { width: number; height: number };
}

// Calculate point to line segment distance
const pointToLineDistance = (
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx: number, yy: number;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

// Get cursor style for connection based on direction
const getCursorForConnection = (
  pathData: ConnectionPathData
): string => {
  const cursor = pathData.direction === 'horizontal'
    ? 'row-resize'
    : pathData.direction === 'vertical'
      ? 'col-resize'
      : 'default';
  return cursor;
};

// Get cursor for path segment based on mouse position
const getCursorForPathSegment = (
  pathData: ConnectionPathData,
  event?: MouseEvent | React.MouseEvent
): string => {
  // If no event, use pre-calculated direction
  if (!event || !(event.target instanceof SVGPathElement)) {
    return getCursorForConnection(pathData);
  }

  const path = event.target as SVGPathElement;
  const pathString = pathData.path;

  // Parse path to get all points
  const firstMove = pathString.match(/M\s+([\d.-]+)\s+([\d.-]+)/);
  if (!firstMove) {
    return getCursorForConnection(pathData);
  }

  const points: Point[] = [];
  points.push({ x: parseFloat(firstMove[1]), y: parseFloat(firstMove[2]) });

  const allLines = pathString.matchAll(/L\s+([\d.-]+)\s+([\d.-]+)/g);
  for (const line of allLines) {
    points.push({ x: parseFloat(line[1]), y: parseFloat(line[2]) });
  }

  if (points.length < 2) {
    return getCursorForConnection(pathData);
  }

  const svg = path.ownerSVGElement;
  if (!svg) {
    return getCursorForConnection(pathData);
  }

  const mouseEvent = event as MouseEvent;

  // Use CTM to transform coordinates
  const pathCTM = path.getScreenCTM();
  if (!pathCTM) {
    return getCursorForConnection(pathData);
  }

  const svgPoint = svg.createSVGPoint();
  svgPoint.x = mouseEvent.clientX;
  svgPoint.y = mouseEvent.clientY;

  const pathPoint = svgPoint.matrixTransform(pathCTM.inverse());

  // Find closest line segment
  let minDistance = Infinity;
  let closestSegmentDirection: 'horizontal' | 'vertical' | null = null;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    const distance = pointToLineDistance(
      pathPoint.x,
      pathPoint.y,
      p1.x,
      p1.y,
      p2.x,
      p2.y
    );

    if (distance < minDistance) {
      minDistance = distance;
      const dx = Math.abs(p2.x - p1.x);
      const dy = Math.abs(p2.y - p1.y);

      if (dx > dy) {
        closestSegmentDirection = 'horizontal';
      } else if (dy > dx) {
        closestSegmentDirection = 'vertical';
      } else {
        closestSegmentDirection = pathData.direction === 'horizontal'
          ? 'horizontal'
          : 'vertical';
      }
    }
  }

  if (closestSegmentDirection !== null) {
    return closestSegmentDirection === 'horizontal' ? 'row-resize' : 'col-resize';
  }

  return getCursorForConnection(pathData);
};

export const CanvasSvg = forwardRef<CanvasSvgRef, CanvasSvgProps>(
  (
    {
      canvasDimensions,
      panX,
      panY,
      scale,
      isDragging,
      connectionPaths,
      isConnectionSelected,
      getGridColor,
      getConnectionColor,
      onDrop,
      onDragOver,
      onDragLeave,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onClick,
      onSelectConnection,
      children,
    },
    ref
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [clientW, setClientW] = useState(0);
    const [clientH, setClientH] = useState(0);
    const [initialBodyMiddleH, setInitialBodyMiddleH] = useState(0);
    const [currentBodyMiddleH, setCurrentBodyMiddleH] = useState(0);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const rafIdRef = useRef<number | null>(null);

    // ViewBox dimensions
    const baseW = canvasDimensions.width;
    const baseH = canvasDimensions.height;

    // Screen pixel scale ratio
    const scaleX = clientW > 0 ? clientW / baseW : 1;
    const scaleY = clientH > 0 ? clientH / baseH : 1;

    // Equal proportion compensation for content layer
    const scaleCompX = (scale || 1) * (1 / (scaleX || 1));
    const scaleCompY = (scale || 1) * (1 / (scaleY || 1));

    // SVG size style
    const svgSizeStyle = {
      position: 'absolute' as const,
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
      display: 'block' as const,
      backgroundImage: 'none',
    };

    useImperativeHandle(
      ref,
      () => ({
        getClientSize: () => ({ width: clientW, height: clientH }),
      }),
      [clientW, clientH]
    );

    useEffect(() => {
      const el = svgRef.current;
      if (!el) return;

      const update = () => {
        const rect = el.getBoundingClientRect();
        const newW = rect.width;
        const newH = rect.height;

        if (newW === clientW && newH === clientH) {
          return;
        }

        setClientW(newW);
        setClientH(newH);

        const bodyMiddle = el.closest('.btc-grid-group__body-middle') as HTMLElement | null;
        const bodyH = bodyMiddle ? bodyMiddle.getBoundingClientRect().height : rect.height;
        setCurrentBodyMiddleH(bodyH);

        if (initialBodyMiddleH === 0 && bodyH > 0) {
          setInitialBodyMiddleH(bodyH);
        }
      };

      update();

      resizeObserverRef.current = new ResizeObserver(() => {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
        rafIdRef.current = requestAnimationFrame(() => {
          update();
          rafIdRef.current = null;
        });
      });

      resizeObserverRef.current.observe(el);

      return () => {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
        if (resizeObserverRef.current && svgRef.current) {
          resizeObserverRef.current.disconnect();
        }
      };
    }, [clientW, clientH, initialBodyMiddleH]);

    const handlePathClick = useCallback(
      (e: React.MouseEvent, pathData: ConnectionPathData) => {
        e.stopPropagation();
        onSelectConnection(pathData.id);
      },
      [onSelectConnection]
    );

    const handlePathMouseMove = useCallback(
      (e: React.MouseEvent, pathData: ConnectionPathData) => {
        const path = e.target as SVGPathElement;
        const cursor = getCursorForPathSegment(pathData, e);
        path.style.cursor = cursor;
      },
      []
    );

    const handlePathMouseLeave = useCallback(
      (e: React.MouseEvent) => {
        const path = e.target as SVGPathElement;
        path.style.cursor = '';
      },
      []
    );

    const handleDragOver = useCallback(
      (e: React.DragEvent) => {
        onDragOver(e);
      },
      [onDragOver]
    );

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        onDrop(e);
      },
      [onDrop]
    );

    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        onMouseDown(e);
      },
      [onMouseDown]
    );

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        onMouseMove(e);
      },
      [onMouseMove]
    );

    const handleMouseUp = useCallback(
      (e: React.MouseEvent) => {
        onMouseUp(e);
      },
      [onMouseUp]
    );

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        onClick(e);
      },
      [onClick]
    );

    const connectionColor = getConnectionColor();

    return (
      <svg
        ref={svgRef}
        className={`${styles.strategyCanvas} ${isDragging ? styles.dragging : ''}`}
        viewBox={`0 0 ${baseW} ${baseH}`}
        style={svgSizeStyle}
        preserveAspectRatio="none"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={onDragLeave}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
      >
        {/* Definitions for arrow markers */}
        <defs>
          <marker
            id="arrowhead-default"
            markerWidth="5"
            markerHeight="3.5"
            refX="4"
            refY="1.75"
            orient="auto"
            className={styles.connectionMarker}
          >
            <polygon points="0 0, 5 1.75, 0 3.5" fill={connectionColor} />
          </marker>
          <marker
            id="arrowhead-true"
            markerWidth="5"
            markerHeight="3.5"
            refX="4"
            refY="1.75"
            orient="auto"
            className={styles.connectionMarker}
          >
            <polygon points="0 0, 5 1.75, 0 3.5" fill={connectionColor} />
          </marker>
          <marker
            id="arrowhead-false"
            markerWidth="5"
            markerHeight="3.5"
            refX="4"
            refY="1.75"
            orient="auto"
            className={styles.connectionMarker}
          >
            <polygon points="0 0, 5 1.75, 0 3.5" fill={connectionColor} />
          </marker>
        </defs>

        {/* Content layer with pan and zoom transforms */}
        <g
          className={styles.contentLayer}
          transform={`translate(${panX}, ${panY}) scale(${scaleCompX}, ${scaleCompY})`}
        >
          {/* Connection paths */}
          {connectionPaths.map((pathData) => (
            <g
              key={pathData.id}
              className={`${styles.connectionGroup} ${
                isConnectionSelected(pathData.id) ? styles.selected : ''
              }`}
            >
              {/* Selected outline (dashed, below actual path) */}
              {pathData.path && pathData.path.trim() && isConnectionSelected(pathData.id) && (
                <path
                  data-connection-id={pathData.id}
                  d={pathData.path}
                  stroke="#409eff"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  fill="none"
                  strokeDasharray="6,6"
                  strokeOpacity="0.8"
                  className={styles.connectionSelectedOutline}
                  pointerEvents="none"
                />
              )}

              {/* Actual connection path */}
              {pathData.path && pathData.path.trim() && (
                <path
                  data-connection-id={pathData.id}
                  d={pathData.path}
                  stroke={pathData.color}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  fill="none"
                  className={`${styles.connectionPath} ${
                    pathData.direction === 'horizontal'
                      ? styles.connectionHorizontal
                      : pathData.direction === 'vertical'
                        ? styles.connectionVertical
                        : ''
                  }`}
                  strokeDasharray={pathData.isOrphaned ? '5,5' : undefined}
                  style={{
                    cursor: getCursorForConnection(pathData),
                  }}
                  markerEnd={pathData.marker}
                  onClick={(e) => handlePathClick(e, pathData)}
                  onMouseMove={(e) => handlePathMouseMove(e, pathData)}
                  onMouseLeave={handlePathMouseLeave}
                />
              )}
            </g>
          ))}

          {/* Slots for nodes and other mid-layer content */}
          {children}

          {/* Slot for top overlay (connection handles, rubber band, etc.) */}
        </g>
      </svg>
    );
  }
);

CanvasSvg.displayName = 'CanvasSvg';

export default CanvasSvg;

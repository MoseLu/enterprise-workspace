import { type Ref } from 'vue';

/**
 * 连接手柄拖拽
 */
export function useConnectionHandles(
  connections: Ref<any[]>,
  nodes: Ref<any[]>,
  connectionOffsetY: Record<string, number>,
  canvasScale: Ref<number>
) {
  let draggingConnId: string | null = null;
  let draggingSegmentIndex: number | null = null; // 正在拖拽的段索引（null 表示拖拽总中点，使用 offsetY）
  let dragStartY = 0;
  let startOffset = 0;

  // 根据 handle 类型计算连接点坐标
  const getConnectionPoint = (node: any, handle: string | undefined, defaultHandle: string) => {
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

  // 解析 SVG 路径，提取所有转折点（支持 M、L、H、V、C、Q、Z 等命令）
  // 过滤重复点（连续相同坐标的点只保留第一个）
  const parsePath = (pathString: string): Array<{ x: number; y: number }> => {
    const points: Array<{ x: number; y: number }> = [];
    if (!pathString) return points;

    // 先提取第一个 M 命令的起点
    const moveMatch = pathString.match(/M\s+([\d.-]+)\s+([\d.-]+)/);
    if (moveMatch) {
      const x = parseFloat(moveMatch[1]);
      const y = parseFloat(moveMatch[2]);
      if (!isNaN(x) && !isNaN(y)) {
        points.push({ x, y });
      }
    }

    // 提取所有 L 命令后的坐标（绝对坐标）
    const lineRegex = /L\s+([\d.-]+)\s+([\d.-]+)/g;
    let match;
    while ((match = lineRegex.exec(pathString)) !== null) {
      const x = parseFloat(match[1]);
      const y = parseFloat(match[2]);
      if (!isNaN(x) && !isNaN(y)) {
        // 检查是否与上一个点重复（允许 0.1 像素的误差，避免浮点数精度问题）
        const lastPoint = points[points.length - 1];
        if (lastPoint && Math.abs(lastPoint.x - x) < 0.1 && Math.abs(lastPoint.y - y) < 0.1) {
          // 跳过重复点
          continue;
        }
        points.push({ x, y });
      }
    }

    return points;
  };

  // 计算连接线所有手柄位置（起点、每段中点、终点）
  // pathString: 实际的 SVG 路径字符串
  const getConnectionHandle = (pathId: string, pathString?: string) => {
    const conn = connections.value.find(c => c.id === pathId);
    if (!conn) {
      return { sx: 0, sy: 0, middleHandles: [], tx: 0, ty: 0 };
    }

    // 如果有路径字符串，从路径中解析转折点
    if (pathString) {
      const pathPoints = parsePath(pathString);
      if (pathPoints.length < 2) {
        return { sx: 0, sy: 0, middleHandles: [], tx: 0, ty: 0 };
      }

      const sx = pathPoints[0].x;
      const sy = pathPoints[0].y;
      const tx = pathPoints[pathPoints.length - 1].x;
      const ty = pathPoints[pathPoints.length - 1].y;

      // 计算每段的中点手柄
      // 中点手柄数量 = 路径段数 = 折角数量 + 1
      // 例如：2个点（起点、终点）= 1段 = 0个折角 = 1个中点手柄
      //       3个点（起点、折角、终点）= 2段 = 1个折角 = 2个中点手柄
      //       4个点（起点、折角1、折角2、终点）= 3段 = 2个折角 = 3个中点手柄
      const middleHandles: Array<{ x: number; y: number; segmentIndex: number }> = [];
      for (let i = 0; i < pathPoints.length - 1; i++) {
        const p1 = pathPoints[i];
        const p2 = pathPoints[i + 1];

        // 检查两点是否相同（不应该出现，但作为安全检查）
        if (Math.abs(p1.x - p2.x) < 0.1 && Math.abs(p1.y - p2.y) < 0.1) {
          continue;
        }

        // 计算这段的中点手柄
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        middleHandles.push({
          x: Math.round(midX),
          y: Math.round(midY),
          segmentIndex: i
        });
      }

      const result = {
        sx: Math.round(sx),
        sy: Math.round(sy),
        middleHandles,
        tx: Math.round(tx),
        ty: Math.round(ty)
      };
      return result;
    }

    // 如果没有路径字符串，回退到基于节点几何的计算（向后兼容）
    const s = nodes.value.find(n => n.id === conn.sourceNodeId);
    const t = nodes.value.find(n => n.id === conn.targetNodeId);
    if (!s || !t) {
      return { sx: 0, sy: 0, middleHandles: [], tx: 0, ty: 0 };
    }

    const sxCenter = s.position.x + (s.style?.width || 120) / 2;
    const syCenter = s.position.y + (s.style?.height || 60) / 2;
    const txCenter = t.position.x + (t.style?.width || 120) / 2;
    const tyCenter = t.position.y + (t.style?.height || 60) / 2;
    const dx = txCenter - sxCenter;
    const dy = tyCenter - syCenter;

    // 根据 sourceHandle 和 targetHandle 确定连接点
    const defaultSourceHandle = Math.abs(dx) >= Math.abs(dy)
      ? (dx >= 0 ? 'right' : 'left')
      : (dy >= 0 ? 'bottom' : 'top');
    const defaultTargetHandle = Math.abs(dx) >= Math.abs(dy)
      ? (dx >= 0 ? 'left' : 'right')
      : (dy >= 0 ? 'top' : 'bottom');

    const sourcePoint = getConnectionPoint(s, conn.sourceHandle, defaultSourceHandle);
    const targetPoint = getConnectionPoint(t, conn.targetHandle, defaultTargetHandle);

    const sx = sourcePoint.x;
    const sy = sourcePoint.y;
    const tx = targetPoint.x;
    const ty = targetPoint.y;

    const offset = connectionOffsetY[conn.id] || 0;

    // 根据实际连接点位置判断主导方向
    const actualDx = tx - sx;
    const actualDy = ty - sy;

    // 计算路径上的所有转折点（根据实际连接路径计算，与 getConnectionPath 保持一致）
    let pathPoints: Array<{ x: number; y: number }> = [];
    if (Math.abs(actualDx) >= Math.abs(actualDy)) {
      // 水平主导：M sourceX sourceY L midX sourceY L midX midY L midX targetY L targetX targetY
      const midX = sx + (tx - sx) / 2;
      const midY = ((sy + ty) / 2) + offset;
      // 只有4个关键点（起点、第一转折点、中点、第二转折点、终点）
      // 但如果是简单的水平连接（sy === ty），可以简化为3个点
      if (Math.abs(sy - ty) < 1 && Math.abs(offset) < 1) {
        // 简单水平连接：起点 -> 中点 -> 终点（3个点，2段，1个中点手柄）
        pathPoints = [
          { x: sx, y: sy },
          { x: midX, y: sy },
          { x: tx, y: ty }
        ];
      } else {
        // 复杂水平连接：起点 -> (midX, sy) -> (midX, midY) -> (midX, ty) -> 终点（5个点，4段，4个中点手柄）
        pathPoints = [
          { x: sx, y: sy },
          { x: midX, y: sy },
          { x: midX, y: midY },
          { x: midX, y: ty },
          { x: tx, y: ty }
        ];
      }
    } else {
      // 垂直主导：M sourceX sourceY L sourceX midY L midX midY L targetX midY L targetX targetY
      const midY = ((sy + ty) / 2) + offset;
      const midX = (sx + tx) / 2;
      // 如果是简单的垂直连接（sx === tx），可以简化为3个点
      if (Math.abs(sx - tx) < 1 && Math.abs(offset) < 1) {
        // 简单垂直连接：起点 -> 中点 -> 终点（3个点，2段，1个中点手柄）
        pathPoints = [
          { x: sx, y: sy },
          { x: sx, y: midY },
          { x: tx, y: ty }
        ];
      } else {
        // 复杂垂直连接：起点 -> (sx, midY) -> (midX, midY) -> (tx, midY) -> 终点（5个点，4段，4个中点手柄）
        pathPoints = [
          { x: sx, y: sy },
          { x: sx, y: midY },
          { x: midX, y: midY },
          { x: tx, y: midY },
          { x: tx, y: ty }
        ];
      }
    }

    // 计算每段的中点手柄
    const middleHandles: Array<{ x: number; y: number; segmentIndex: number }> = [];
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const p1 = pathPoints[i];
      const p2 = pathPoints[i + 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      middleHandles.push({
        x: Math.round(midX),
        y: Math.round(midY),
        segmentIndex: i
      });
    }

    const result = {
      sx: Math.round(sx),
      sy: Math.round(sy),
      middleHandles,
      tx: Math.round(tx),
      ty: Math.round(ty)
    };
    // 移除调试日志，减少控制台输出
    return result;
  };

  const startDragConnectionHandle = (e: MouseEvent, connectionId: string, segmentIndex?: number) => {
    draggingConnId = connectionId;
    draggingSegmentIndex = segmentIndex !== undefined ? segmentIndex : null;
    dragStartY = e.clientY;
    startOffset = connectionOffsetY[connectionId] || 0;
    window.addEventListener('mousemove', onDragConnMove);
    window.addEventListener('mouseup', onDragConnUp, { once: true });
  };

  const onDragConnMove = (e: MouseEvent) => {
    if (!draggingConnId) return;
    const conn = connections.value.find(c => c.id === draggingConnId);
    if (!conn) return;

    const s = nodes.value.find(n => n.id === conn.sourceNodeId);
    const t = nodes.value.find(n => n.id === conn.targetNodeId);
    if (!s || !t) return;

    const sw = s.style?.width || 120;
    const sh = s.style?.height || 60;
    const tw = t.style?.width || 120;
    const th = t.style?.height || 60;

    const sxCenter = s.position.x + sw / 2;
    const syCenter = s.position.y + sh / 2;
    const txCenter = t.position.x + tw / 2;
    const tyCenter = t.position.y + th / 2;
    const dx = txCenter - sxCenter;
    const dy = tyCenter - syCenter;

    // 计算客户端坐标转换为画布坐标（考虑缩放和平移）
    const canvas = document.querySelector('.strategy-canvas') as SVGSVGElement | null;
    if (!canvas) return;

    const pt = canvas.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPoint = pt.matrixTransform(canvas.getScreenCTM()?.inverse());

    // 计算当前中点手柄的位置（基于 offsetY）
    const dyClient = e.clientY - dragStartY;
    const dyWorld = dyClient / canvasScale.value;
    const currentOffset = startOffset + dyWorld;

    let newSourceHandle = conn.sourceHandle;
    let newTargetHandle = conn.targetHandle;

    if (Math.abs(dx) >= Math.abs(dy)) {
      // 水平主导：检查是否需要切换到顶部或底部
      const sourceY = syCenter;
      const targetY = tyCenter;
      const midY = ((sourceY + targetY) / 2) + currentOffset;

      // 计算源节点的顶部和底部
      const sourceTop = s.position.y;
      const sourceBottom = s.position.y + sh;
      const targetTop = t.position.y;
      const targetBottom = t.position.y + th;

      // 如果中点手柄超过了源节点的底部，切换到源节点底部
      if (midY >= sourceBottom) {
        newSourceHandle = 'bottom';
      }
      // 如果中点手柄超过了源节点的顶部，切换到源节点顶部
      else if (midY <= sourceTop) {
        newSourceHandle = 'top';
      }
      // 如果中点手柄在源节点范围内，使用侧边
      else if (midY > sourceTop && midY < sourceBottom) {
        newSourceHandle = dx >= 0 ? 'right' : 'left';
      }

      // 如果中点手柄超过了目标节点的底部，切换到目标节点底部
      if (midY >= targetBottom) {
        newTargetHandle = 'bottom';
      }
      // 如果中点手柄超过了目标节点的顶部，切换到目标节点顶部
      else if (midY <= targetTop) {
        newTargetHandle = 'top';
      }
      // 如果中点手柄在目标节点范围内，使用侧边
      else if (midY > targetTop && midY < targetBottom) {
        newTargetHandle = dx >= 0 ? 'left' : 'right';
      }
    } else {
      // 垂直主导：检查是否需要切换到左侧或右侧
      const sourceX = sxCenter;
      const targetX = txCenter;
      const midX = (sourceX + targetX) / 2;

      // 计算源节点和目标节点的左右边界
      const sourceLeft = s.position.x;
      const sourceRight = s.position.x + sw;
      const targetLeft = t.position.x;
      const targetRight = t.position.x + tw;

      const currentMidY = ((s.position.y + (dy >= 0 ? (s.position.y + sh) : s.position.y) +
                           t.position.y + (dy >= 0 ? t.position.y : (t.position.y + th))) / 2) + currentOffset;

      // 如果中点手柄超过了源节点的右侧，切换到源节点右侧（垂直主导时不太可能，但保留逻辑）
      if (midX >= sourceRight) {
        newSourceHandle = 'right';
      }
      // 如果中点手柄超过了源节点的左侧，切换到源节点左侧
      else if (midX <= sourceLeft) {
        newSourceHandle = 'left';
      }
      // 如果中点手柄在源节点范围内，使用顶部或底部
      else if (midX > sourceLeft && midX < sourceRight) {
        newSourceHandle = dy >= 0 ? 'bottom' : 'top';
      }

      // 如果中点手柄超过了目标节点的右侧，切换到目标节点右侧
      if (midX >= targetRight) {
        newTargetHandle = 'right';
      }
      // 如果中点手柄超过了目标节点的左侧，切换到目标节点左侧
      else if (midX <= targetLeft) {
        newTargetHandle = 'left';
      }
      // 如果中点手柄在目标节点范围内，使用顶部或底部
      else if (midX > targetLeft && midX < targetRight) {
        newTargetHandle = dy >= 0 ? 'top' : 'bottom';
      }
    }

    // 获取实际的连接点坐标，判断是否应该是一条直线
    const getConnectionPoint = (node: any, handle: string) => {
      const w = node.style?.width || 120;
      const h = node.style?.height || 60;
      switch (handle) {
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

    const sourcePoint = getConnectionPoint(s, newSourceHandle);
    const targetPoint = getConnectionPoint(t, newTargetHandle);
    const actualDx = targetPoint.x - sourcePoint.x;
    const actualDy = targetPoint.y - sourcePoint.y;

    // 检查是否应该是一条直线（无折角）
    // 如果两个连接点都是垂直的，但 sourceX === targetX 且 offset === 0，应该是直线，切换回水平连接点
    const isSourceVertical = newSourceHandle === 'top' || newSourceHandle === 'bottom';
    const isTargetVertical = newTargetHandle === 'top' || newTargetHandle === 'bottom';

    // 检查当前的 handle 是否会导致非直线路径，但实际应该是直线
    if (isSourceVertical && isTargetVertical && Math.abs(actualDx) < 0.1 && Math.abs(currentOffset) < 0.1) {
      // 应该是一条垂直直线，但两个连接点都是垂直的会导致有折角
      // 如果节点确实是水平排列的，切换回水平连接点
      if (Math.abs(dx) >= Math.abs(dy)) {
        newSourceHandle = dx >= 0 ? 'right' : 'left';
        newTargetHandle = dx >= 0 ? 'left' : 'right';
      }
    }

    // 如果两个连接点都是水平的，但 sourceY === targetY 且 offset === 0，已经是直线，无需切换
    const isSourceHorizontal = newSourceHandle === 'left' || newSourceHandle === 'right';
    const isTargetHorizontal = newTargetHandle === 'left' || newTargetHandle === 'right';

    if (isSourceHorizontal && isTargetHorizontal && Math.abs(actualDy) < 0.1 && Math.abs(currentOffset) < 0.1) {
      // 应该是一条水平直线，已经是水平连接点，无需切换
    }

    // 更新连接的 handle 信息（如果发生变化）
    const handleChanged = newSourceHandle !== conn.sourceHandle || newTargetHandle !== conn.targetHandle;
    if (handleChanged) {
      conn.sourceHandle = newSourceHandle;
      conn.targetHandle = newTargetHandle;
      // 当连接点切换时，重置 offsetY 为 0
      connectionOffsetY[draggingConnId] = 0;
    } else {
      // 如果连接点没有变化，继续使用 offsetY 进行微调
      connectionOffsetY[draggingConnId] = Math.round(currentOffset);
    }
  };

  const onDragConnUp = () => {
    window.removeEventListener('mousemove', onDragConnMove);
    draggingConnId = null;
    draggingSegmentIndex = null;
  };

  return {
    getConnectionHandle,
    startDragConnectionHandle
  };
}


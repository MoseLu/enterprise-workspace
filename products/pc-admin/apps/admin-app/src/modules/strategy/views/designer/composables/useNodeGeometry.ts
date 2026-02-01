import { type Ref } from 'vue';

/**
 * 节点几何计算函数
 */
export function useNodeGeometry(canvasDimensions: Ref<{ width: number; height: number }>) {
  // 位置显示框放置侧记忆（节点局部渲染）
  const positionBoxPlacementLocal = new Map<string, 'top' | 'bottom'>();

  // 根据节点类型计算贴合形状的边界框和手柄位置
  const getHandlePositions = (nodeType: string, width: number, height: number) => {
    let result;

    if (nodeType === 'START' || nodeType === 'END') {
      // 圆形节点：边界框是与圆形相切的正方形
      const radius = Math.min(width, height) / 2;
      const boundarySize = radius * 2;
      const offsetX = (width - boundarySize) / 2;
      const offsetY = (height - boundarySize) / 2;

      result = {
        positions: {
          'top': { x: radius + offsetX, y: offsetY },
          'top-right': { x: boundarySize + offsetX, y: offsetY },
          'right': { x: boundarySize + offsetX, y: radius + offsetY },
          'bottom-right': { x: boundarySize + offsetX, y: boundarySize + offsetY },
          'bottom': { x: radius + offsetX, y: boundarySize + offsetY },
          'bottom-left': { x: offsetX, y: boundarySize + offsetY },
          'left': { x: offsetX, y: radius + offsetY },
          'top-left': { x: offsetX, y: offsetY }
        },
        boundaryBox: {
          x: offsetX,
          y: offsetY,
          width: boundarySize,
          height: boundarySize
        }
      };
    } else if (nodeType === 'CONDITION') {
      // 菱形节点：边界框包围整个菱形，8个手柄位置
      result = {
        positions: {
          'top': { x: width / 2, y: 0 },
          'top-right': { x: width, y: 0 },
          'right': { x: width, y: height / 2 },
          'bottom-right': { x: width, y: height },
          'bottom': { x: width / 2, y: height },
          'bottom-left': { x: 0, y: height },
          'left': { x: 0, y: height / 2 },
          'top-left': { x: 0, y: 0 }
        },
        boundaryBox: {
          x: 0,
          y: 0,
          width: width,
          height: height
        }
      };
    } else {
      // 矩形节点：边界框就是节点本身
      result = {
        positions: {
          'top': { x: width / 2, y: 0 },
          'top-right': { x: width, y: 0 },
          'right': { x: width, y: height / 2 },
          'bottom-right': { x: width, y: height },
          'bottom': { x: width / 2, y: height },
          'bottom-left': { x: 0, y: height },
          'left': { x: 0, y: height / 2 },
          'top-left': { x: 0, y: 0 }
        },
        boundaryBox: {
          x: 0,
          y: 0,
          width: width,
          height: height
        }
      };
    }

    return result;
  };

  // 计算箭头位置变换（基于节点对象）
  const getArrowTransform = (node: any, direction: string) => {
    const nodeWidth = node.style?.width || 120;
    const nodeHeight = node.style?.height || 60;

    // 注意：箭头组在节点 <g> 内部，已继承 translate(node.position)，
    // 因此此处必须返回"相对于节点局部坐标"的 transform，不能加 node.position。
    const handleData = getHandlePositions(node.type, nodeWidth, nodeHeight);
    const b = handleData.boundaryBox;
    const cxLocal = b.x + b.width / 2;
    const cyLocal = b.y + b.height / 2;
    const arrowOffset = 20;

    switch (direction) {
      case 'top': {
        const targetX = cxLocal;
        const targetY = b.y - arrowOffset;
        return `translate(${targetX - 60}, ${targetY + 10})`;
      }
      case 'right': {
        const targetX = b.x + b.width + arrowOffset;
        const targetY = cyLocal;
        return `translate(${targetX - 10}, ${targetY - 30})`;
      }
      case 'bottom': {
        const targetX = cxLocal;
        const targetY = b.y + b.height + arrowOffset;
        return `translate(${targetX - 60}, ${targetY - 10})`;
      }
      case 'left': {
        const targetX = b.x - arrowOffset;
        const targetY = cyLocal;
        return `translate(${targetX - 30}, ${targetY - 30})`;
      }
      default:
        return 'translate(0, 0)';
    }
  };

  // 计算箭头位置变换（直接传入位置参数，避免依赖node.position）
  const getArrowTransformByPos = (x: number, y: number, nodeType: string, width: number, height: number, direction: string) => {
    switch (direction) {
      case 'top': {
        const topTargetX = x + width / 2;
        const topTargetY = y - 10;
        return `translate(${topTargetX - 60}, ${topTargetY + 10})`;
      }
      case 'right': {
        const rightTargetX = x + width + 10;
        const rightTargetY = y + height / 2;
        return `translate(${rightTargetX - 10}, ${rightTargetY - 30})`;
      }
      case 'bottom': {
        const bottomTargetX = x + width / 2;
        const bottomTargetY = y + height + 10;
        return `translate(${bottomTargetX - 60}, ${bottomTargetY - 10})`;
      }
      case 'left': {
        const leftTargetX = x - 10;
        const leftTargetY = y + height / 2;
        return `translate(${leftTargetX - 30}, ${leftTargetY - 30})`;
      }
      default:
        return 'translate(0, 0)';
    }
  };

  // 根据手柄类型获取光标样式
  const getHandleCursor = (handleType: string) => {
    const cursorMap: Record<string, string> = {
      'top': 'n-resize',
      'top-right': 'ne-resize',
      'right': 'e-resize',
      'bottom-right': 'se-resize',
      'bottom': 's-resize',
      'bottom-left': 'sw-resize',
      'left': 'w-resize',
      'top-left': 'nw-resize'
    };
    return cursorMap[handleType] || 'default';
  };

  // 计算局部 transform：在拖拽全过程稳定显示，触底仅切换到上方
  const getPositionBoxLocalTransform = (node: any) => {
    const nodeWidth = node.style?.width || 120;
    const nodeHeight = node.style?.height || 60;
    const BOX_W = 70;
    const BOX_H = 18;
    const MARGIN = 20;

    // 基于 viewBox 计算底部空间（全局坐标）
    const canvasH = canvasDimensions.value.height;
    const bottomSpace = Math.round(canvasH - (node.position.y + nodeHeight));
    const needSpace = Math.round(MARGIN + BOX_H);

    const prev = positionBoxPlacementLocal.get(node.id) ?? 'bottom';
    let place: 'top' | 'bottom' = prev;
    const H = 6;
    if (prev === 'bottom' && bottomSpace < (needSpace - H)) place = 'top';
    else if (prev === 'top' && bottomSpace > (needSpace + H)) place = 'bottom';
    else if (!positionBoxPlacementLocal.has(node.id)) place = bottomSpace >= needSpace ? 'bottom' : 'top';

    positionBoxPlacementLocal.set(node.id, place);

    const localX = Math.round(nodeWidth / 2 - BOX_W / 2);
    const localY = place === 'bottom' ? Math.round(nodeHeight + MARGIN) : Math.round(-BOX_H - MARGIN);
    return `translate(${localX}, ${localY})`;
  };

  return {
    getHandlePositions,
    getArrowTransform,
    getArrowTransformByPos,
    getHandleCursor,
    getPositionBoxLocalTransform,
    positionBoxPlacementLocal
  };
}


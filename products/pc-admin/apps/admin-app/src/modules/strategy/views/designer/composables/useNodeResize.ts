import { ref, type Ref } from 'vue';
import { nextTick } from 'vue';

/**
 * 节点缩放逻辑
 */
export function useNodeResize(
  nodes: Ref<any[]>,
  selectedNodeId: Ref<string>,
  canvasDimensions: Ref<{ width: number; height: number }>,
  canvasScale: Ref<number>,
  isMouseOnNodeBorder: Ref<boolean>,
  getHandlePositions: (nodeType: string, width: number, height: number) => any,
  getArrowTransform: (node: any, direction: string) => string,
  getArrowTransformByPos: (x: number, y: number, nodeType: string, width: number, height: number, direction: string) => string
) {
  // 调整大小相关状态
  const isResizing = ref(false);
  const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0, nodeX: 0, nodeY: 0 });
  const resizeDirection = ref('');
  const resizingNodeId = ref('');
  const resizeRafId = ref<number | null>(null);

  // 手柄鼠标事件处理
  const handleResizeHandleEnter = () => {
    // 鼠标进入手柄时，阻止十字光标显示
    isMouseOnNodeBorder.value = true;
  };

  const handleResizeHandleLeave = () => {
    // 鼠标离开手柄时，恢复正常状态
    isMouseOnNodeBorder.value = false;
  };

  // 同步更新节点缩放后的视觉效果
  const syncNodeResizeVisuals = (nodeId: string, x: number, y: number, width: number, height: number) => {
    const node = nodes.value.find(n => n.id === nodeId);
    if (!node) return;

    const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement;
    if (!nodeElement) return;

    // 1. 节点位置由模板绑定的 node.position 驱动，这里不直接写 DOM transform

    // 2. 更新节点形状尺寸
    if (node.type === 'START' || node.type === 'END') {
      // 圆形节点
      const circleElement = nodeElement.querySelector('circle') as SVGCircleElement;
      if (circleElement) {
        const radius = Math.min(width, height) / 2 - 2;
        circleElement.setAttribute('r', radius.toString());
        circleElement.setAttribute('cx', (width / 2).toString());
        circleElement.setAttribute('cy', (height / 2).toString());
      }
    } else if (node.type === 'CONDITION') {
      // 菱形节点
      const pathElement = nodeElement.querySelector('path') as SVGPathElement;
      if (pathElement) {
        const diamondPath = `M ${width / 2} 0 L ${width} ${height / 2} L ${width / 2} ${height} L 0 ${height / 2} Z`;
        pathElement.setAttribute('d', diamondPath);
      }
    } else {
      // 矩形节点（ACTION, DECISION, GATEWAY等）
      const rectElement = nodeElement.querySelector('.node-rect') as SVGRectElement;
      if (rectElement) {
        rectElement.setAttribute('width', width.toString());
        rectElement.setAttribute('height', height.toString());
      }
    }

    // 3. 更新边界框
    const boundaryBox = nodeElement.querySelector('.boundary-box') as SVGElement;
    if (boundaryBox) {
      const handleData = getHandlePositions(node.type, width, height);
      boundaryBox.setAttribute('x', handleData.boundaryBox.x.toString());
      boundaryBox.setAttribute('y', handleData.boundaryBox.y.toString());
      boundaryBox.setAttribute('width', handleData.boundaryBox.width.toString());
      boundaryBox.setAttribute('height', handleData.boundaryBox.height.toString());
    }

    // 4. 更新8个手柄的位置
    const handles = nodeElement.querySelectorAll('.resize-handles > g[class^="handle-"]');
    handles.forEach((handle) => {
      const cls = (handle as Element).getAttribute('class') || '';
      const match = cls.match(/handle-(\w+)/);
      const handleType = match?.[1];
      if (!handleType) return;

      const handleData = getHandlePositions(node.type, width, height);
      const pos = handleData.positions[handleType as keyof typeof handleData.positions];

      if (pos) {
        handle.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
      }
    });

    // 5. 更新文本位置
    const textElement = nodeElement.querySelector('.node-text') as SVGTextElement;
    if (textElement) {
      textElement.setAttribute('x', (width / 2).toString());
      textElement.setAttribute('y', (height / 2).toString());
    }

    const foreignObject = nodeElement.querySelector('foreignObject') as SVGForeignObjectElement;
    if (foreignObject) {
      foreignObject.setAttribute('width', width.toString());
      foreignObject.setAttribute('height', height.toString());
    }

    // 6. 箭头位置改由模板计算（getArrowTransform）随响应式尺寸自动更新
  };

  // 开始调整大小
  const handleResizeStart = (event: MouseEvent, node: any, direction: string) => {
    event.stopPropagation();
    isResizing.value = true;
    resizingNodeId.value = node.id;
    resizeDirection.value = direction;

    // 记录开始状态
    resizeStart.value = {
      x: event.clientX,
      y: event.clientY,
      width: node.style?.width || 120,
      height: node.style?.height || 60,
      nodeX: node.position.x,
      nodeY: node.position.y
    };

    // 事件监听器通过全局事件处理，不需要单独添加
  };

  // 调整大小移动 - 使用requestAnimationFrame确保同步
  const handleResizeMove = (event: MouseEvent) => {
    if (!isResizing.value) return;

    const deltaX = (event.clientX - resizeStart.value.x) / canvasScale.value;
    const deltaY = (event.clientY - resizeStart.value.y) / canvasScale.value;

    const node = nodes.value.find(n => n.id === selectedNodeId.value);
    if (!node) return;

    let newWidth = node.style?.width || 120;
    let newHeight = node.style?.height || 60;
    let newX = node.position.x;
    let newY = node.position.y;

    // 根据调整方向计算新的尺寸和位置
    switch (resizeDirection.value) {
      case 'top-left':
        newWidth = Math.max(80, resizeStart.value.width - deltaX);
        newHeight = Math.max(60, resizeStart.value.height - deltaY);
        newX = resizeStart.value.nodeX + deltaX;
        newY = resizeStart.value.nodeY + deltaY;
        break;
      case 'top-right':
        newWidth = Math.max(80, resizeStart.value.width + deltaX);
        newHeight = Math.max(60, resizeStart.value.height - deltaY);
        newY = resizeStart.value.nodeY + deltaY;
        break;
      case 'bottom-left':
        newWidth = Math.max(80, resizeStart.value.width - deltaX);
        newHeight = Math.max(60, resizeStart.value.height + deltaY);
        newX = resizeStart.value.nodeX + deltaX;
        break;
      case 'bottom-right':
        newWidth = Math.max(80, resizeStart.value.width + deltaX);
        newHeight = Math.max(60, resizeStart.value.height + deltaY);
        break;
      case 'top':
        newHeight = Math.max(60, resizeStart.value.height - deltaY);
        newY = resizeStart.value.nodeY + deltaY;
        break;
      case 'bottom':
        newHeight = Math.max(60, resizeStart.value.height + deltaY);
        break;
      case 'left':
        newWidth = Math.max(80, resizeStart.value.width - deltaX);
        newX = resizeStart.value.nodeX + deltaX;
        break;
      case 'right':
        newWidth = Math.max(80, resizeStart.value.width + deltaX);
        break;
    }

    // 应用画布边界限制（相对于网格背景的区域）
    // 计算网格背景的实际位置（居中显示，相对于容器的偏移）
    const container = document.querySelector('.canvas-scroll') as HTMLElement | null;
    const containerWidth = container ? container.getBoundingClientRect().width : canvasDimensions.value.width;
    const containerHeight = container ? container.getBoundingClientRect().height : canvasDimensions.value.height;
    
    // 网格背景左上角的偏移量（居中后的实际位置）
    // 使用 box-sizing: border-box，边框包含在尺寸内
    // 但节点位置应该对应网格内容区域，需要加上边框宽度
    const borderWidth = 1; // 网格背景有 1px 边框
    const gridOffsetX = (containerWidth - canvasDimensions.value.width) / 2 + borderWidth;
    const gridOffsetY = (containerHeight - canvasDimensions.value.height) / 2 + borderWidth;

    // 对于所有节点类型，节点位置是边界框的左上角
    // - 矩形节点：左上角到达网格边界时，左边缘和顶边与网格边界贴合
    // - 圆形节点：左上角到达网格边界时，圆形与左侧和顶部边界相切
    const minX = gridOffsetX;
    const minY = gridOffsetY;
    // 节点的左上角最大位置：使节点的右边缘刚好到达网格右边界，下边缘刚好到达网格下边界
    const maxX = gridOffsetX + canvasDimensions.value.width - newWidth;
    const maxY = gridOffsetY + canvasDimensions.value.height - newHeight;

    // 应用边界限制：使用 Math.max 和 Math.min 确保严格限制在范围内
    // 先限制到 [minX, maxX] 和 [minY, maxY] 范围内
    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));
    
    // 四舍五入到整数
    newX = Math.round(newX);
    newY = Math.round(newY);
    
    // 最终边界检查：确保四舍五入后仍然在有效范围内
    // 这很重要，因为 Math.round 可能会将值舍入到边界外
    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));

    // 使用 requestAnimationFrame 避免重复调用，确保在同一帧内更新所有元素
    if (resizeRafId.value !== null) {
      cancelAnimationFrame(resizeRafId.value);
    }

    resizeRafId.value = requestAnimationFrame(() => {
      // 在同一帧内批量更新：节点尺寸和位置 → 手柄 → 箭头
      syncNodeResizeVisuals(node.id, newX, newY, newWidth, newHeight);

      // 同步更新响应式数据（确保缩放结束后状态一致）
      node.position.x = newX;
      node.position.y = newY;
      if (!node.style) node.style = {};
      node.style.width = newWidth;
      node.style.height = newHeight;

      resizeRafId.value = null;
      // 连线路径由 watch 驱动自动更新，无需手动调用 updateConnectionPaths
    });
  };

  // 结束调整大小
  const handleResizeEnd = () => {
    // 取消pending的RAF
    if (resizeRafId.value !== null) {
      cancelAnimationFrame(resizeRafId.value);
      resizeRafId.value = null;
    }

    // Vue数据已经在缩放过程中更新，直接清除状态
    isResizing.value = false;
    resizeDirection.value = '';
    resizingNodeId.value = '';

    // 等待Vue响应式更新完成后，重新设置箭头和手柄位置
    nextTick(() => {
      const node = nodes.value.find(n => n.id === selectedNodeId.value);
      const nodeElement = document.querySelector(`[data-node-id="${node?.id}"]`) as HTMLElement;
      if (nodeElement && node) {
        // 重新设置箭头位置，使用Vue响应式计算的位置
        const arrowGroups = nodeElement.querySelectorAll('.connection-arrow-group');
        arrowGroups.forEach((arrowGroup) => {
          const pathElement = arrowGroup.querySelector('.arrow-shape') as SVGPathElement;
          if (pathElement) {
            const direction = pathElement.getAttribute('data-arrow-direction');
            if (direction) {
              const transform = getArrowTransform(node, direction);
              pathElement.setAttribute('transform', transform);
            }
          }
        });

        // 重新设置手柄位置，使用Vue响应式计算的位置
        const handleData = getHandlePositions(node.type, node.style?.width || 120, node.style?.height || 60);
        const handles = nodeElement.querySelectorAll('.resize-handles > g');
        handles.forEach((handle) => {
          const className = handle.getAttribute('class');
          if (className) {
            const handleType = className.replace('handle-', '');
            const position = handleData.positions[handleType as keyof typeof handleData.positions];
            if (position) {
              handle.setAttribute('transform', `translate(${position.x}, ${position.y})`);
            }
          }
        });
      }
    });

    // 事件监听器通过全局事件处理，不需要单独移除
  };

  return {
    isResizing,
    resizeStart,
    resizeDirection,
    resizingNodeId,
    resizeRafId,
    handleResizeHandleEnter,
    handleResizeHandleLeave,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
    syncNodeResizeVisuals
  };
}


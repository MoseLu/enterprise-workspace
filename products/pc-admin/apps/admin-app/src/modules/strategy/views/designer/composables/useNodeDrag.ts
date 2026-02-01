import { ref, reactive, computed, type Ref } from 'vue';

const DRAG_THRESHOLD_PX = 4;

/**
 * 节点拖拽逻辑
 */
export function useNodeDrag(
  nodes: Ref<any[]>,
  selectedNodeId: Ref<string>,
  canvasDimensions: Ref<{ width: number; height: number }>,
  canvasScale: Ref<number>,
  isResizing: Ref<boolean>,
  isOverlayEditing: Ref<boolean>,
  nodeIsDragging: Ref<boolean>,
  moveNode: (nodeId: string, position: { x: number; y: number }) => void,
  getHandlePositions: (nodeType: string, width: number, height: number) => any,
  getArrowTransformByPos: (x: number, y: number, nodeType: string, width: number, height: number, direction: string) => string,
  handleNodeDoubleClick?: (node: any, event?: MouseEvent) => void
) {
  // 简化的拖拽状态
  const dragState = reactive({
    isDragging: false,
    startX: 0,
    startY: 0,
    startNodeX: 0,
    startNodeY: 0,
    maybeDrag: false
  });

  // 计算属性
  const isDragging = computed(() => dragState.isDragging || nodeIsDragging.value);
  const draggingNodeId = computed(() => dragState.isDragging ? selectedNodeId.value : '');

  // 同步更新（拖拽期间由响应式 + 模板计算驱动，此处不直接改DOM）
  const syncNodeVisuals = (_nodeId: string, _x: number, _y: number) => {
    return;
  };

  // 节点按下处理
  const handleNodePointerDown = (e: MouseEvent, node: any) => {
    // 正在覆盖编辑时，忽略拖拽
    if (isOverlayEditing.value) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    // 双击直接进入编辑，阻止拖拽
    if ((e as any).detail >= 2) {
      e.stopPropagation();
      e.preventDefault();
      if (handleNodeDoubleClick) {
        handleNodeDoubleClick(node, e);
      }
      return;
    }

    e.stopPropagation();

    dragState.isDragging = false;
    dragState.maybeDrag = true;
    selectedNodeId.value = node.id;

    // 记录拖拽开始位置
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;
    
    // 确保拖拽开始时的节点位置在边界内（防止初始位置超出边界）
    const nodeWidth = node.style?.width || 120;
    const nodeHeight = node.style?.height || 60;
    
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
    
    const minX = gridOffsetX;
    const minY = gridOffsetY;
    const maxX = gridOffsetX + canvasDimensions.value.width - nodeWidth;
    const maxY = gridOffsetY + canvasDimensions.value.height - nodeHeight;
    
    // 如果节点位置超出边界，先修正到边界内
    dragState.startNodeX = Math.max(minX, Math.min(maxX, node.position.x));
    dragState.startNodeY = Math.max(minY, Math.min(maxY, node.position.y));
    
    // 如果位置被修正，立即更新节点位置
    if (dragState.startNodeX !== node.position.x || dragState.startNodeY !== node.position.y) {
      moveNode(node.id, { x: dragState.startNodeX, y: dragState.startNodeY });
    }
  };

  // 节点移动处理
  const handleNodePointerMove = (e: MouseEvent) => {
    if (isOverlayEditing.value) return;

    // 如果鼠标未按下，立即终止拖拽并清理状态，防止节点跟随
    if ((e as MouseEvent).buttons === 0) {
      if (dragState.isDragging || dragState.maybeDrag) {
        dragState.isDragging = false;
        dragState.maybeDrag = false;
      }
      return;
    }

    if (!dragState.isDragging || isResizing.value) {
      if (isResizing.value) {
        // 缩放时不处理节点拖拽
      }
      // 检查是否需要从"可能拖拽"转为真正拖拽
      if (dragState.maybeDrag) {
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        if (Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
          dragState.isDragging = true;
          dragState.maybeDrag = false; // 已进入正式拖拽
        } else {
          return;
        }
      } else {
        return;
      }
    }

    const node = nodes.value.find(n => n.id === selectedNodeId.value);
    if (!node) return;

    // 计算移动距离
    const deltaX = (e.clientX - dragState.startX) / canvasScale.value;
    const deltaY = (e.clientY - dragState.startY) / canvasScale.value;

    // 计算节点尺寸
    const nodeWidth = node.style?.width || 120;
    const nodeHeight = node.style?.height || 60;

    // 计算网格背景的实际位置（居中显示，相对于容器的偏移）
    // 网格背景在 canvas-scroll 中居中，需要计算其左上角位置
    const container = document.querySelector('.canvas-scroll') as HTMLElement | null;
    const containerWidth = container ? container.getBoundingClientRect().width : canvasDimensions.value.width;
    const containerHeight = container ? container.getBoundingClientRect().height : canvasDimensions.value.height;
    
    // 网格背景左上角的偏移量（居中后的实际位置）
    // 使用 box-sizing: border-box，边框包含在尺寸内
    // 但节点位置应该对应网格内容区域，需要加上边框宽度
    const borderWidth = 1; // 网格背景有 1px 边框
    const gridOffsetX = (containerWidth - canvasDimensions.value.width) / 2 + borderWidth;
    const gridOffsetY = (containerHeight - canvasDimensions.value.height) / 2 + borderWidth;

    // 计算画布边界（相对于网格背景的内容区域）
    // 对于所有节点类型，节点位置是边界框的左上角
    // - 矩形节点：左上角到达网格边界时，左边缘和顶边与网格边界贴合
    // - 圆形节点：左上角到达网格边界时，圆形与左侧和顶部边界相切
    const minX = gridOffsetX;
    const minY = gridOffsetY;
    // 节点的左上角最大位置：使节点的右边缘刚好到达网格右边界，下边缘刚好到达网格下边界
    const maxX = gridOffsetX + canvasDimensions.value.width - nodeWidth;
    const maxY = gridOffsetY + canvasDimensions.value.height - nodeHeight;

    // 计算新的位置（考虑缩放）
    const rawX = dragState.startNodeX + deltaX;
    const rawY = dragState.startNodeY + deltaY;

    // 应用边界限制：使用 Math.max 和 Math.min 确保严格限制在范围内
    // 先限制到 [minX, maxX] 和 [minY, maxY] 范围内
    let newX = Math.max(minX, Math.min(maxX, rawX));
    let newY = Math.max(minY, Math.min(maxY, rawY));
    
    // 四舍五入到整数
    newX = Math.round(newX);
    newY = Math.round(newY);
    
    // 最终边界检查：确保四舍五入后仍然在有效范围内
    // 这很重要，因为 Math.round 可能会将值舍入到边界外
    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));

    // 先同步响应式数据，交由模板更新位置
    moveNode(node.id, { x: newX, y: newY });
    // 连线路径由 watch 驱动自动更新，无需手动调用 updateConnectionPaths
  };

  // 节点抬起处理
  const handleNodePointerUp = (e: MouseEvent) => {
    if (dragState.isDragging) {
      dragState.isDragging = false;
      dragState.maybeDrag = false;
    }
    // 鼠标抬起时，无论是否在拖拽，也清理一次，防止残留状态
    dragState.isDragging = false;
    dragState.maybeDrag = false;
  };

  return {
    dragState,
    isDragging,
    draggingNodeId,
    handleNodePointerDown,
    handleNodePointerMove,
    handleNodePointerUp,
    syncNodeVisuals,
    dragStateRefs: {
      isDragging: computed(() => dragState.isDragging),
      maybeDrag: computed(() => dragState.maybeDrag)
    }
  };
}


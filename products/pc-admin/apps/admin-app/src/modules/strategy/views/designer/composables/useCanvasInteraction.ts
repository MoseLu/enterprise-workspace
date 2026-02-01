import { ref, reactive } from 'vue';

/**
 * 画布交互管理
 */
export function useCanvasInteraction(updateTempConnection?: (event: MouseEvent, canvasRef: HTMLElement) => void) {
  // 工具状态
  const currentTool = ref<'select' | 'drag'>('select');

  // 缩放和平移
  const zoom = ref(1);
  const panX = ref(0);
  const panY = ref(0);

  // 拖拽状态
  const dragState = reactive({
    isDragging: false,
    startPos: { x: 0, y: 0 }
  });

  // 设置工具
  const setTool = (tool: 'select' | 'drag') => {
    currentTool.value = tool;
  };

  // 缩放操作
  const zoomIn = () => {
    zoom.value = Math.min(zoom.value * 1.2, 3);
  };

  const zoomOut = () => {
    zoom.value = Math.max(zoom.value / 1.2, 0.1);
  };

  const resetZoom = () => {
    zoom.value = 1;
    panX.value = 0;
    panY.value = 0;
  };

  // 适应屏幕
  const fitToScreen = (canvasRef: HTMLElement | null, nodes: any[]) => {
    if (!canvasRef || nodes.length === 0) return;

    // 计算所有节点的边界
    const bounds = nodes.reduce((acc, node) => {
      return {
        minX: Math.min(acc.minX, node.position.x),
        minY: Math.min(acc.minY, node.position.y),
        maxX: Math.max(acc.maxX, node.position.x + (node.style?.width || 120)),
        maxY: Math.max(acc.maxY, node.position.y + (node.style?.height || 80))
      };
    }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

    const containerRect = canvasRef.getBoundingClientRect();
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;

    const scaleX = (containerRect.width - 100) / contentWidth;
    const scaleY = (containerRect.height - 100) / contentHeight;

    zoom.value = Math.min(scaleX, scaleY, 1);
    panX.value = (containerRect.width - contentWidth * zoom.value) / 2 - bounds.minX * zoom.value;
    panY.value = (containerRect.height - contentHeight * zoom.value) / 2 - bounds.minY * zoom.value;
  };

  // 画布鼠标事件
  const handleCanvasMouseDown = (event: MouseEvent) => {
    if (currentTool.value === 'drag') {
      dragState.isDragging = true;
      dragState.startPos = {
        x: event.clientX - panX.value,
        y: event.clientY - panY.value
      };
    }
  };

  const handleCanvasMouseMove = (event: MouseEvent) => {
    if (dragState.isDragging && currentTool.value === 'drag') {
      panX.value = event.clientX - dragState.startPos.x;
      panY.value = event.clientY - dragState.startPos.y;
    }

    // 更新临时连接线
    const canvasRef = document.querySelector('.strategy-canvas') as HTMLElement;
    if (canvasRef && updateTempConnection) {
      updateTempConnection(event, canvasRef);
    }
  };

  const handleCanvasMouseUp = () => {
    dragState.isDragging = false;
  };

  // 滚轮缩放
  const handleCanvasWheel = (event: WheelEvent, canvasRef?: HTMLElement | null) => {
    event.preventDefault();

    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom.value * delta));

    if (newZoom !== zoom.value) {
      const target = canvasRef || (event.target as HTMLElement);
      const rect = target.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const scaleFactor = newZoom / zoom.value;
      panX.value = mouseX - (mouseX - panX.value) * scaleFactor;
      panY.value = mouseY - (mouseY - panY.value) * scaleFactor;

      zoom.value = newZoom;
    }
  };

  return {
    // 状态
    currentTool,
    zoom,
    panX,
    panY,
    dragState,

    // 方法
    setTool,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasWheel
  };
}

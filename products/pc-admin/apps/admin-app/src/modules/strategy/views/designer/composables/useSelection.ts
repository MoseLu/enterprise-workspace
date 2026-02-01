import { reactive, ref } from 'vue';

type Point = { x: number; y: number };

export function useSelection(options: {
  nodes: any;
  connections: any;
  panX: any;
  panY: any;
  canvasScale: any;
  isOverlayEditing: any;
  connectionState: any;
  selectedNodeId: any; // 添加 selectedNodeId 用于清空单个选中
  connectionOffsetY?: any; // 连接线的垂直偏移（用于正交路径）
  getConnectionHandle?: (connectionId: string, pathString?: string) => { sx: number; sy: number; middleHandles?: Array<{ x: number; y: number; segmentIndex: number }>; mx?: number; my?: number; tx: number; ty: number };
  fallthrough: {
    handleCanvasMouseDown: (e: MouseEvent) => void;
    handleCanvasMouseMove: (e: MouseEvent) => void;
    handleCanvasMouseUp: (e?: MouseEvent) => void;
  };
}) {
  const { nodes, connections, panX, panY, canvasScale, isOverlayEditing, connectionState, selectedNodeId, connectionOffsetY, getConnectionHandle, fallthrough } = options;

  const rubber = reactive({ active: false, startX: 0, startY: 0, x: 0, y: 0, w: 0, h: 0 });
  // 使用 ref 包装 Set，但需要在更新时创建新 Set 以触发响应式更新
  const multiSelectedNodeIds = ref<Set<string>>(new Set());
  const multiSelectedConnectionIds = ref<Set<string>>(new Set());
  const lastSelectionMode = ref<'none' | 'click' | 'rubber'>('none');
  
  // 辅助函数：更新 Set 并触发响应式更新
  const updateNodeSelection = (newSet: Set<string>) => {
    multiSelectedNodeIds.value = new Set(newSet); // 创建新 Set 以触发响应式更新
  };
  
  const updateConnectionSelection = (newSet: Set<string>) => {
    multiSelectedConnectionIds.value = new Set(newSet); // 创建新 Set 以触发响应式更新
  };

  function clientToSvg(e: MouseEvent): Point {
    // 节点坐标系统是绝对坐标（相对于容器，考虑网格居中偏移）
    // 需要计算鼠标位置在容器中的绝对坐标
    const container = document.querySelector('.canvas-scroll') as HTMLElement | null;
    if (!container) return { x: 0, y: 0 };
    
    const containerRect = container.getBoundingClientRect();
    
    // 考虑容器的滚动偏移
    const scrollLeft = container.scrollLeft || 0;
    const scrollTop = container.scrollTop || 0;
    
    // 计算相对于容器的绝对坐标（与节点坐标系统一致）
    // 这个坐标是相对于 canvas-scroll 容器的，与 node.position.x/y 使用相同的坐标系统
    // 注意：节点坐标不考虑滚动，所以这里也不考虑滚动（如果节点坐标考虑了滚动，这里也需要加上）
    const x = e.clientX - containerRect.left + scrollLeft;
    const y = e.clientY - containerRect.top + scrollTop;
    
    return { x, y };
  }

  function onCanvasMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const tag = target.tagName?.toLowerCase();
    
    // 快速检查：如果点击的是 SVG 本身，直接认为是背景
    if (tag === 'svg') {
      if (e.button === 0 && !isOverlayEditing.value && !connectionState.isConnecting) {
        const p = clientToSvg(e);
        rubber.active = true;
        rubber.startX = rubber.x = p.x;
        rubber.startY = rubber.y = p.y;
        rubber.w = 0; rubber.h = 0;
        lastSelectionMode.value = 'rubber';
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      fallthrough.handleCanvasMouseDown(e);
      return;
    }
    
    // 检查是否在节点内部
    const isOnNode = target.closest('[data-node-id]') !== null || 
                     target.closest('.strategy-node') !== null;
    
    // 检查是否在连接线上（只有直接点击到 path 元素）
    const isPathElement = tag === 'path';
    const isOnConnection = isPathElement && (
                           target.classList?.contains('connection-path') ||
                           target.getAttribute('data-connection-id') !== null);
    
    // 检查是否在连接手柄上
    const isOnConnectionHandle = target.closest('.connection-handles-overlay') !== null;
    
    // 检查是否在连接箭头上
    const isOnConnectionArrow = target.closest('.connection-arrow-group') !== null ||
                                target.closest('.connection-arrows') !== null;
    
    // 检查是否在临时连接线上
    const isOnTempConnection = target.closest('.temp-connection-group') !== null ||
                               target.closest('.temp-connection-line') !== null;
    
    // 检查是否在 content-layer 上（但不在任何子元素上）
    // content-layer 本身应该允许框选
    const isContentLayer = tag === 'g' && target.classList?.contains('content-layer');
    
    // 如果是背景：不在节点、连接线、手柄、箭头、临时连接线上
    // 或者是 content-layer 本身（容器）
    const isBackground = (!isOnNode && !isOnConnection && !isOnConnectionHandle && !isOnConnectionArrow && !isOnTempConnection) ||
                         isContentLayer;
    
    if (e.button === 0 && isBackground && !isOverlayEditing.value && !connectionState.isConnecting) {
      const p = clientToSvg(e);
      rubber.active = true;
      rubber.startX = rubber.x = p.x;
      rubber.startY = rubber.y = p.y;
      rubber.w = 0; rubber.h = 0;
      lastSelectionMode.value = 'rubber';
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    fallthrough.handleCanvasMouseDown(e);
  }

  function onCanvasMouseMove(e: MouseEvent) {
    if (rubber.active) {
      const p = clientToSvg(e);
      const x1 = Math.min(rubber.startX, p.x);
      const y1 = Math.min(rubber.startY, p.y);
      const x2 = Math.max(rubber.startX, p.x);
      const y2 = Math.max(rubber.startY, p.y);
      rubber.x = Math.round(x1);
      rubber.y = Math.round(y1);
      rubber.w = Math.round(x2 - x1);
      rubber.h = Math.round(y2 - y1);
      e.stopPropagation();
      return;
    }
    fallthrough.handleCanvasMouseMove(e);
  }

  function onCanvasMouseUp(e?: MouseEvent) {
    if (rubber.active) {
      const rx = rubber.x;
      const ry = rubber.y;
      const rw = rubber.w;
      const rh = rubber.h;
      const r2 = { x1: rx, y1: ry, x2: rx + rw, y2: ry + rh };

      // 只有当选框有足够的尺寸时才进行选择（避免误触发）
      if (Math.abs(rw) < 5 && Math.abs(rh) < 5) {
        rubber.active = false;
        lastSelectionMode.value = 'none';
        // 清空多选状态
        updateNodeSelection(new Set());
        updateConnectionSelection(new Set());
        e?.stopPropagation();
        e?.preventDefault();
        return;
      }

      const nextNodes = new Set<string>();
      nodes.value.forEach((n: any) => {
        const w = n.style?.width || 120;
        const h = n.style?.height || 60;
        const n2 = { x1: n.position.x, y1: n.position.y, x2: n.position.x + w, y2: n.position.y + h };
        const inter = !(n2.x2 < r2.x1 || n2.x1 > r2.x2 || n2.y2 < r2.y1 || n2.y1 > r2.y2);
        
        if (inter) nextNodes.add(n.id);
      });
      
      updateNodeSelection(nextNodes);

      const nextConns = new Set<string>();
      connections.value.forEach((conn: any) => {
        const s = nodes.value.find((nn: any) => nn.id === conn.sourceNodeId);
        const t = nodes.value.find((nn: any) => nn.id === conn.targetNodeId);
        if (!s || !t) return;
        
        // 优先使用 getConnectionHandle 获取实际连接点，如果没有则使用简化计算
        let sx: number, sy: number, tx: number, ty: number, mx: number, my: number;
        
        if (getConnectionHandle) {
          // 使用实际的连接点坐标（起点、中点、终点）
          const handle = getConnectionHandle(conn.id);
          sx = handle.sx;
          sy = handle.sy;
          tx = handle.tx;
          ty = handle.ty;
          // 兼容新的 middleHandles 格式和旧的 mx/my 格式
          if (handle.middleHandles && handle.middleHandles.length > 0) {
            // 使用第一个中点手柄作为中点（用于橡皮筋选择）
            mx = handle.middleHandles[0].x;
            my = handle.middleHandles[0].y;
          } else if (handle.mx !== undefined && handle.my !== undefined) {
            // 回退到旧的 mx/my 格式
            mx = handle.mx;
            my = handle.my;
          } else {
            // 如果没有中点，计算默认中点
            mx = (sx + tx) / 2;
            my = ((sy + ty) / 2) + (connectionOffsetY?.[conn.id] || 0);
          }
        } else {
          // 回退到简化计算（使用节点中心点）
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
          
          // 计算实际的连接点（节点边缘）
          if (Math.abs(dx) >= Math.abs(dy)) {
            // 水平主导：侧边中点
            sx = dx >= 0 ? (s.position.x + sw) : s.position.x;
            sy = syCenter;
            tx = dx >= 0 ? t.position.x : (t.position.x + tw);
            ty = tyCenter;
          } else {
            // 垂直主导：上下中点
            sx = sxCenter;
            sy = dy >= 0 ? (s.position.y + sh) : s.position.y;
            tx = txCenter;
            ty = dy >= 0 ? t.position.y : (t.position.y + th);
          }
          
          // 计算中点（考虑可能的偏移）
          const offset = connectionOffsetY?.[conn.id] || 0;
          mx = (sx + tx) / 2;
          my = ((sy + ty) / 2) + offset;
        }
        
        // 计算包含起点、中点、终点的边界框（考虑路径厚度，扩大边界框）
        const strokeWidth = 2; // 连接线宽度
        const padding = strokeWidth / 2 + 2; // 扩大边界框以确保包含路径
        
        const bx1 = Math.min(sx, tx, mx) - padding;
        const by1 = Math.min(sy, ty, my) - padding;
        const bx2 = Math.max(sx, tx, mx) + padding;
        const by2 = Math.max(sy, ty, my) + padding;
        
        const inter = !(bx2 < r2.x1 || bx1 > r2.x2 || by2 < r2.y1 || by1 > r2.y2);
        
        if (inter) nextConns.add(conn.id);
      });
      updateConnectionSelection(nextConns);

      // 先设置 lastSelectionMode 为 'rubber'，防止后续的 handleCanvasClick 清空选择
      lastSelectionMode.value = 'rubber';
      
      // 橡皮筋选择完成时，清空单个选中状态，避免冲突
      if (nextNodes.size > 0 || nextConns.size > 0) {
        selectedNodeId.value = '';
      }

      rubber.active = false;
      e?.stopPropagation();
      e?.preventDefault();
      return;
    }
    fallthrough.handleCanvasMouseUp(e as MouseEvent);
  }

  // 清空多选状态（用于画布点击时清空）
  const clearMultiSelection = () => {
    updateNodeSelection(new Set());
    updateConnectionSelection(new Set());
    lastSelectionMode.value = 'none';
  };

  return {
    rubber,
    multiSelectedNodeIds,
    multiSelectedConnectionIds,
    lastSelectionMode,
    onCanvasMouseDown,
    onCanvasMouseMove,
    onCanvasMouseUp,
    clearMultiSelection
  };
}


